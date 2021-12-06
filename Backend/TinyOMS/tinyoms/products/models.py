import uuid
import os
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.db.models.signals import post_delete
from django.dispatch import receiver
from tinyoms.settings import UPLOAD_TO
from generics.models import BaseExtendableModel, AutoCreatedAtOrderedModel


def get_product_file_path(instance, filename):
    """Create bucket path for the product image"""
    name = str(uuid.uuid4()).replace("-", "")
    filename = f"{name}.png"
    return os.path.join(UPLOAD_TO, "products", filename)


class Product(BaseExtendableModel, AutoCreatedAtOrderedModel):
    name = models.CharField(max_length=50, unique=True, null=False)
    description = models.CharField(max_length=200)


class ProductImage(models.Model):
    image = models.ImageField(default="default.png",
                              upload_to=get_product_file_path)
    product = models.ForeignKey(
        Product,
        related_name="images",
        on_delete=models.CASCADE
    )


@receiver(post_delete, sender=ProductImage)
def remove_file_from_s3(sender, instance, using, **kwargs):
    instance.image.delete(save=False)
