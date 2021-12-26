from string import Template
from datetime import datetime, timedelta
from django.template import loader
from django.core.mail import EmailMessage
from background_task import background
from background_task.models import Task, CompletedTask
from tinyoms.settings import EMAIL_FROM_ADDRESS
from generics.helper import get_timezone, utcnow_with_tz
from generics.models import Configuration
from users.models import Employee
from .models import Installment
from .serializers import InstallmentSerializer


def prepare_client_message(installment, time_zone):
    conf = Configuration.objects.filter(key="installment_reminder_template").first()
    template_str = (
        conf.value
        if conf
        else "You have a debt of $currency$amount with a deadline of $pay_before. You can omit this message if you already paid."
    )
    installment_reminder_template = Template(template_str)
    pay_before = installment.pay_before.astimezone(time_zone)
    currency = installment.currency
    amount = installment.amount
    message_prefix = Configuration.objects.filter(
        key="installment_reminder_prefix"
    ).first()
    message_prefix = "" if not message_prefix else message_prefix.value
    message = message_prefix + installment_reminder_template.substitute(
        pay_before=pay_before.strftime("%Y-%m-%d"), currency=currency, amount=amount
    )
    return message


def create_installment_reminder(installment):
    time_zone = get_timezone()
    remind_at = installment.remind_at.astimezone(time_zone)
    email = installment.payer.email
    subject = "Ödeme hatırlatması"
    title = "Yaklaşan Ödeme:"
    message = prepare_client_message(installment, time_zone)
    verbose_name = "installment_" + str(installment.id)
    installment_reminder_task(
        email, subject, title, message, schedule=remind_at, verbose_name=verbose_name
    )


def delete_installment_reminder(installment):
    verbose_name = "installment_" + str(installment.id)
    Task.objects.filter(verbose_name=verbose_name).delete()


def update_installment_reminder(installment):
    delete_installment_reminder(installment)
    create_installment_reminder(installment)


@background(schedule=10)
def installment_reminder_task(email, subject, title, message):
    content = loader.render_to_string(
        "email-installment-reminder.html", {"title": title, "message": message}
    )
    mail = EmailMessage(subject, content, to=[email], from_email=EMAIL_FROM_ADDRESS)
    mail.content_subtype = "html"
    mail.send()


def late_payment_obj2dict(x):
    return {
        "name": x["payer__first_name"] + " " + x["payer__last_name"],
        "currency": x["currency"],
        "amount": x["amount"],
        "pay_before": x["pay_before"].strftime("%Y-%m-%d"),
    }


@background(schedule=10)
def check_late_payments(year, month, day):
    time_zone = get_timezone()
    task_date_time = time_zone.localize(datetime(year, month, day, 0, 0))
    values_fields = (
        "payer__first_name",
        "payer__last_name",
        "currency",
        "amount",
        "pay_before",
    )

    todays_late_payments = Installment.objects.filter(
        paid_at__isnull=True,
        pay_before__lt=task_date_time,
        pay_before__gte=task_date_time + timedelta(days=-1),
    ).values(*values_fields)
    todays_late_payments = [late_payment_obj2dict(x) for x in todays_late_payments]

    older_late_payments = Installment.objects.filter(
        paid_at__isnull=True, pay_before__lt=task_date_time + timedelta(days=-1)
    ).values(*values_fields)
    older_late_payments = [late_payment_obj2dict(x) for x in older_late_payments]

    admins = [x.email for x in Employee.objects.filter(is_superuser=True)]
    content = loader.render_to_string(
        "email-late-payments.html",
        {
            "title": "Günlük Geciken Ödemeler Tablosu",
            "message": "Aşağıdaki listelerde son 24 saatte ve öncesince geciken ödemeler litelenmektedir.",
            "todays_late_payments": todays_late_payments,
            "older_late_payments": older_late_payments,
        },
    )
    mail = EmailMessage(
        "TinyOMS - Geciken Ödemeler", content, to=admins, from_email=EMAIL_FROM_ADDRESS
    )
    mail.content_subtype = "html"
    mail.send()
    create_late_payments_task(task_date_time + timedelta(days=1), time_zone)


def create_late_payments_task(today, time_zone):
    year, month, day = today.year, today.month, today.day
    task_date_time = time_zone.localize(datetime(year, month, day, 0, 0))
    verbose = f"check_late_payments_{year}_{month}_{day}"
    if not (
        Task.objects.filter(verbose_name=verbose).exists()
        or CompletedTask.objects.filter(verbose_name=verbose).exists()
    ):
        check_late_payments(
            year, month, day, schedule=task_date_time, verbose_name=verbose
        )


try:
    time_zone = get_timezone()
    today = utcnow_with_tz().astimezone(time_zone)
    create_late_payments_task(today, time_zone)
except Exception as e:
    pass
