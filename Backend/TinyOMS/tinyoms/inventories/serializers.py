from django.forms.models import model_to_dict
from rest_framework import serializers
from generics.serializers import ExtendableModelSerializer
from products.models import Product
from products.serializers import ProductBasicSerializer
from users.models import Supplier
from users.serializers import UserBasicSerializer
from .models import InventoryItem, Inventory


class InventoryNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = ["id", "name"]


class InventoryItemBasicSerializer(ExtendableModelSerializer):
    inventory_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventory.objects.all(),
        source="inventory",
        write_only=True,
        required=False
    )
    inventory = InventoryNameSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True,
        required=False
    )
    product = ProductBasicSerializer(read_only=True)
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        source="supplier",
        write_only=True,
        required=False
    )
    supplier = UserBasicSerializer(read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "inventory_id",
            "inventory",
            "product_id",
            "product",
            "supplier_id",
            "supplier",
            "unit_type",
            "amount",
            "cost_currency",
            "cost_per_unit",
            "extra_field_values",
        ]


class InventoryItemSerializer(InventoryItemBasicSerializer):
    order_items = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "inventory_id",
            "inventory",
            "product_id",
            "product",
            "supplier_id",
            "supplier",
            "unit_type",
            "amount",
            "cost_currency",
            "cost_per_unit",
            "extra_field_values",
            "order_items",
        ]

    def get_order_items(self, obj):
        return [
            model_to_dict(i, fields=[
                "id",
                "order",
                "amount",
                "selling_price_per_unit",
                "selling_price_currency",
            ]) for i in obj.order_items.all()
        ]


class InventorySerializer(ExtendableModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = '__all__'

    def get_items(self, obj):
        return [InventoryItemBasicSerializer(x).data for x in obj.items.all()]
