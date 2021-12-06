from django.db import models
from generics.models import BaseExtendableModel, AutoCreatedAtOrderedModel
from products.models import Product
from users.models import Supplier


class Inventory(BaseExtendableModel):
	name = models.CharField(max_length=100, default="default_inventory")


class InventoryItem(BaseExtendableModel, AutoCreatedAtOrderedModel):
	inventory = models.ForeignKey(
		Inventory,
		related_name="items",
		on_delete=models.PROTECT,
		null=True,
		default=None
	)
	product = models.ForeignKey(
		Product,
		related_name="inventory_items",
		on_delete=models.PROTECT
	)
	supplier = models.ForeignKey(
		Supplier,
		related_name="items_in_inventory",
		on_delete=models.PROTECT,
		null=True,
		default=None
	)
	unit_type = models.CharField(max_length=20)  # may be mt, kg, etc. 
	amount = models.FloatField()
	cost_currency = models.CharField(max_length=10)
	cost_per_unit = models.FloatField()
