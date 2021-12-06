from collections import defaultdict
from django.db import models
from django.db.models import Q
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from generics.models import BaseExtendableModel, AutoCreatedAtOrderedModel
from users.models import Supplier, Client, Employee
from products.models import Product
from inventories.models import InventoryItem


class Order(BaseExtendableModel, AutoCreatedAtOrderedModel):
    is_active = models.BooleanField(default=True)
    client = models.ForeignKey(
        Client, 
        related_name='orders',
        on_delete=models.PROTECT,
        null=False
    )
    seller = models.ForeignKey(
        Employee,
        related_name='orders',
        on_delete=models.SET_NULL,
        null=True, # TODO: remove this before recreating DB
    )

    @property
    def all_payments_completed(self):
        if not self.is_active:
            return True
        installments = self.installments.all()
        for i in installments:
            if not i.paid_at:
                return False
        return True

    @property
    def total_amounts(self):
        """ returns total amounts and currencies as a dict:
            {"USD": 1000, "TRY": 10000, ...}"""
        items = self.items.all()
        amounts = defaultdict(lambda: 0)
        for i in items:
            amounts[i.selling_price_currency] += i.selling_price_per_unit * i.amount
        return dict(amounts)



class OrderItem(BaseExtendableModel):
    order = models.ForeignKey(
        Order,
        related_name="items",
        on_delete=models.PROTECT,
        null=True,    # TODO: remove this before recreating DB
        default=None  # TODO: remove this before recreating DB
    )
    amount = models.FloatField()
    selling_price_per_unit = models.FloatField()
    selling_price_currency = models.CharField(max_length=10)


# an order item directly bought from supplier to client
class SupplierOrderItem(OrderItem):
    supplier = models.ForeignKey(
        Supplier, 
        related_name='order_items',
        on_delete=models.SET_NULL,
        null=True
    )
    product = models.ForeignKey(
        Product, 
        related_name='supplier_order_items',
        on_delete=models.PROTECT,
        null=True,  # TODO: remove this when deoploying v1 with clean migration history
        default=None  # TODO: remove this when deoploying v1 with clean migration history
    )
    # TODO: remove null and default for unit_type when deoploying v1 with clean migration history
    unit_type = models.CharField(max_length=20, null=True, default=None)  # may be mt, kg, etc. 
    supplier_price_per_unit = models.FloatField(null=True)
    supplier_price_currency = models.CharField(max_length=10, null=True)


# an order item sold from company inventory to client
class InventoryOrderItem(OrderItem):
    inventory_item = models.ForeignKey(
        InventoryItem,
        related_name='order_items',
        on_delete=models.PROTECT,
        null=True
    )  


@receiver(post_save, sender=InventoryOrderItem, dispatch_uid="subtract_product_amount")
def subtract_product_amount(sender, instance, created, **kwargs):
    if created:
        inventory_item = instance.inventory_item
        inventory_item.amount -= instance.amount
        inventory_item.save()


@receiver(pre_delete, sender=InventoryOrderItem, dispatch_uid="return_product_amount")
def return_product_amount(sender, instance, using, **kwargs):
    inventory_item = instance.inventory_item
    inventory_item.amount += instance.amount
    inventory_item.save()
