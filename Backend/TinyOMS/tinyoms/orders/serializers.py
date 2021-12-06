from django.forms.models import model_to_dict
from django.contrib.auth.models import User
from rest_framework import serializers
from generics.serializers import ExtendableModelSerializer
from products.models import Product
from products.serializers import ProductBasicSerializer
from users.models import Supplier, Client, Employee
from users.serializers import UserBasicSerializer
from inventories.models import InventoryItem
from inventories.serializers import InventoryItemBasicSerializer
from .models import OrderItem, SupplierOrderItem, InventoryOrderItem, Order


class OrderItemSerializer(ExtendableModelSerializer):
    order = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), 
        required=False
    )

    class Meta:
        model = Product
        fields = '__all__'


class SupplierOrderItemSerializer(OrderItemSerializer):
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), 
        source="supplier", 
        write_only=True, 
        required=False
    )
    supplier = UserBasicSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), 
        source="product", 
        write_only=True, 
        required=False
    )
    product = ProductBasicSerializer(read_only=True)

    class Meta:
        model = SupplierOrderItem
        fields = '__all__'

    def validate(self, data):
        product_id = self.initial_data.get("product_id")
        product = Product.objects.filter(id=product_id).first()
        supplier_id = self.initial_data.get("supplier_id")
        supplier = Supplier.objects.filter(id=supplier_id).first()
        
        if product not in supplier.products.all():
            raise serializers.ValidationError(
                "This supplier doesn't supply the product!"
            )

        return data


class InventoryOrderItemSerializer(OrderItemSerializer):
    inventory_item_id = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(),
        source='inventory_item',
        required=False,
        write_only=True
    )
    inventory_item = InventoryItemBasicSerializer(read_only=True)

    class Meta:
        model = InventoryOrderItem
        fields = '__all__'

    def validate(self, data):
        inventory_item_id = self.initial_data.get("inventory_item_id")
        inventory_item = InventoryItem.objects.filter(id=inventory_item_id).first()

        if self.initial_data.get("amount") > inventory_item.amount:
            raise serializers.ValidationError(
                "Insufficient amount in iventory!"
            )

        return data


class OrderSerializer(ExtendableModelSerializer):
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(), 
        source="client", 
        write_only=True, 
        required=False
    )
    client = UserBasicSerializer(read_only=True)
    seller_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), 
        source="seller", 
        write_only=True, 
        required=False
    )
    seller = UserBasicSerializer(read_only=True)
    items = serializers.SerializerMethodField()
    installments = serializers.SerializerMethodField()
    payments = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_items(self, obj):
        items = []
        for item in obj.items.all():
            inventory_order_item = InventoryOrderItem.objects.filter(id=item.id).first()
            supplier_order_item = SupplierOrderItem.objects.filter(id=item.id).first()
            if inventory_order_item:
                items.append(InventoryOrderItemSerializer(inventory_order_item).data)
            else:
                items.append(SupplierOrderItemSerializer(supplier_order_item).data)
        return items

    def get_installments(self, obj):
        return [
            model_to_dict(i, fields=[
                "id", "pay_before", "currency", "amount", "remind_at", "paid_at"
            ]) for i in obj.installments.all()
        ]

    def get_payments(self, obj):
        return [
            model_to_dict(p, fields=[
                "id", 
                "from_user", 
                "to_user",
                "currency", 
                "amount", 
                "installment",
            ]) for p in obj.payments.all()
        ]
