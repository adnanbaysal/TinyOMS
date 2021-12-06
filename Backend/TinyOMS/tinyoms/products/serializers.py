from django.forms.models import model_to_dict
from rest_framework import serializers
from generics.serializers import ExtendableModelSerializer
from orders.models import InventoryOrderItem
from .models import Product, ProductImage


class ProductBasicSerializer(ExtendableModelSerializer):
    images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_images(self, obj):
        return [i.image.url for i in obj.images.all()]


class ProductSerializer(ProductBasicSerializer):
    suppliers = serializers.SerializerMethodField()
    inventory_items = serializers.SerializerMethodField()
    supplier_order_items = serializers.SerializerMethodField()
    inventory_order_items = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_suppliers(self, obj):
        return [
            {"id": s.id, "fullname": s.get_full_name()} 
            for s in obj.suppliers.all()
        ]

    def get_inventory_items(self, obj):
        return [
            model_to_dict(i, fields=[
                "id", 
                "inventory", 
                "supplier", 
                "unit_type", 
                "amount", 
                "cost_currency", 
                "cost_per_unit",
            ]) for i in obj.inventory_items.all()
        ]

    def get_supplier_order_items(self, obj):
        return [
            model_to_dict(i, fields=[
                "id", 
                "supplier", 
                "unit_type",
                "amount", 
                "supplier_price_per_unit",
                "supplier_price_currency",
                "selling_price_per_unit", 
                "selling_price_currency",
            ]) for i in obj.supplier_order_items.all()
        ]

    def get_inventory_order_items(self, obj):
        return [
            model_to_dict(i, fields=[
                "id", 
                "inventory_item",
                "amount", 
                "selling_price_per_unit", 
                "selling_price_currency",
            ]) for i in InventoryOrderItem.objects.filter(inventory_item__product=obj)
        ]


class ProductImageSerializer(serializers.Serializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image']
        read_only_fields = ['id', 'transfer']
