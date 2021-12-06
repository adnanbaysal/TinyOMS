from generics.models import Configuration


default_configurations = [
    ("company_name", "Andromedia Inc"),
    ("installment_reminder_prefix", "Hello,\n"),
    ("installment_reminder_template", 
        "You should pay $currency$amount until $pay_before. Please ignore this message if you already made the payment."),
]


def run():
    for key, value in default_configurations:
        print(key, value)
        Configuration.objects.update_or_create(
            defaults={"value": value}, key=key
        )
