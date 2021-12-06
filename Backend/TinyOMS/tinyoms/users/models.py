from django.db import models
from django.contrib.auth.models import User
from generics.models import (
	BaseExtendableModel, AutoCreatedAtOrderedModel, CommonUserFieldsModel
)
from products.models import Product


class Supplier(BaseExtendableModel, CommonUserFieldsModel, User): 
	products = models.ManyToManyField(Product, related_name="suppliers")


class Client(BaseExtendableModel, CommonUserFieldsModel, User):
	pass


class Employee(BaseExtendableModel, CommonUserFieldsModel, User):
	pass
