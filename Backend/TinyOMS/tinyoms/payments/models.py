from django.db import models
from django.contrib.auth.models import User
from generics.models import BaseExtendableModel, AutoCreatedAtOrderedModel
from orders.models import Order


class Installment(BaseExtendableModel, AutoCreatedAtOrderedModel):
    pay_before = models.DateTimeField()
    currency = models.CharField(max_length=10)
    amount = models.FloatField()
    remind_at = models.DateTimeField(null=True, default=None)
    paid_at = models.DateTimeField(null=True, default=None)  # null if not paid
    order = models.ForeignKey(
        Order, 
        related_name='installments',
        on_delete=models.PROTECT,
        null=True,
        default=None
    )
    payer = models.ForeignKey(
        User, 
        related_name="installments",
        on_delete=models.PROTECT
    ) 


class Payment(BaseExtendableModel, AutoCreatedAtOrderedModel):
    from_user = models.ForeignKey(
        User, 
        related_name="sent_payments",
        on_delete=models.SET_NULL,
        null=True,
        default=None
    ) 
    to_user = models.ForeignKey(
        User,
        related_name="received_payments",
        on_delete=models.SET_NULL,
        null=True,
        default=None
    )  # may be null (e.g.: conversion cost)
    currency = models.CharField(max_length=10)
    amount = models.FloatField()
    order = models.ForeignKey(
        Order, 
        related_name='payments',
        on_delete=models.PROTECT,
        null=True,
        default=None
    )
    installment = models.ForeignKey(
        Installment, 
        related_name='payments',
        on_delete=models.PROTECT,
        null=True,
        default=None
    )  # if payment is not an installment payment, leave this null
    # put the following in extra_field_values
    # converted_currency = models.CharField(max_length=10)
    # conversion_rate = models.FloatField(default=1.0)
    # converted_amount = models.FloatField()  # make readonly in serializer
