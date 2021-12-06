# Generated by Django 3.1.4 on 2020-12-14 18:51

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('payments', '0003_auto_20201214_2119'),
    ]

    operations = [
        migrations.AlterField(
            model_name='genericpayment',
            name='from_user',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments_genericpayment_sent_payments', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='genericpayment',
            name='to_user',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments_genericpayment_received_payments', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='orderpayment',
            name='from_user',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments_orderpayment_sent_payments', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='orderpayment',
            name='to_user',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments_orderpayment_received_payments', to=settings.AUTH_USER_MODEL),
        ),
    ]
