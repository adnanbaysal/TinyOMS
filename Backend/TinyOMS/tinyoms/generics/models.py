from datetime import datetime
from django.db import models
from django.db.models import JSONField
from django.forms.models import model_to_dict
from django.contrib.postgres.fields import ArrayField
from django.db.models.signals import post_delete
from django.dispatch import receiver
from tinyoms.settings import UI_LANGUAGES
from .helper import (
    check_value_type,
    get_profile_image_path,
    get_generic_image_path,
)


class Configuration(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.CharField(max_length=250)


class AutoCreatedAtOrderedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


# The class to hold extra field attributes
class ExtraFieldAttributes(AutoCreatedAtOrderedModel):
    TYPE_NAMES = ("bool", "int", "float", "str",
                  "datetime", "choices", "image")
    TYPES = ((t, t) for t in TYPE_NAMES)

    model_name = models.CharField(max_length=100)
    field_name = models.CharField(max_length=8, default="key")
    description = models.CharField(max_length=100)
    type_name = models.CharField(
        max_length=20, null=False, default="str", choices=TYPES)
    max_length = models.IntegerField(default=100)
    default = models.CharField(max_length=100, null=True, default=None)
    show_in_summary = models.BooleanField(default=False)
    choices = ArrayField(
        models.CharField(max_length=100),
        size=30,
        null=True,
        default=None
    )

    class Meta:
        unique_together = [['model_name', 'field_name']]


# Models such as Customer, Product, Supplier, Order, and Payment will have property
# to add dynamic fields. To accomplish this, JSONField will be used as in:
# https://stackoverflow.com/questions/7933596/django-dynamic-model-fields/7934577#7934577
# All model names extending this abstract model should be unique
class BaseExtendableModel(models.Model):
    extra_field_values = JSONField(db_index=True)

    class Meta:
        abstract = True

    def __init__(self, *args, **kwargs):
        model_name = self.__class__.__name__.lower()
        extra_fields = ExtraFieldAttributes.objects.filter(
            model_name=model_name)
        self.extra_field_values = {
            ef.field_name: check_value_type(
                ef.type_name, ef.default, ef.choices)[1]
            for ef in extra_fields
        }
        super().__init__(*args, **kwargs)

    @classmethod
    def check_extra_field_value(cls, field_name, value):
        """ Checks a value if it's valid for the extra field type if that field indeed exists 
                in the model. Returns false if either extra field does not exist or value is of 
                wrong type or if type is str and length exceeds max_length. returns true otherwise"""
        extra_field_attribute = ExtraFieldAttributes.objects.filter(
            model_name=cls.__name__.lower(), field_name=field_name
        ).first()

        if not extra_field_attribute:
            return False, value

        return check_value_type(
            extra_field_attribute.type_name,
            value,
            extra_field_attribute.choices
        )


class CommonUserFieldsModel(models.Model):
    profile_image = models.ImageField(
        default="default.png", upload_to=get_profile_image_path)
    ui_language = models.CharField(
        max_length=10, choices=UI_LANGUAGES, default="tr-tr")

    class Meta:
        abstract = True


class GenericImage(models.Model):
    """ A model to hold images added as an extra field attribute """
    image = models.ImageField(default="default.png",
                              upload_to=get_generic_image_path)
    model_name = models.CharField(max_length=100, default="model")
    field_name = models.CharField(max_length=8, default="key")
    obj_id = models.IntegerField(default=0)


@receiver(post_delete, sender=GenericImage)
def remove_file_from_s3(sender, instance, using, **kwargs):
    instance.image.delete(save=False)
