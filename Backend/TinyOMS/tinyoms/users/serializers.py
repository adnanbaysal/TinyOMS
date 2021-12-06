from django.forms.models import model_to_dict
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from generics.serializers import ExtendableModelSerializer
from products.models import Product
from products.serializers import ProductBasicSerializer
from .models import Employee, Client, Supplier


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "first_name", "last_name", "email", "username"
        ]


class UserSerializer(ExtendableModelSerializer):
    username = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Please choose another username.",
            )
        ]
    )
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Please choose another e-mail",
            )
        ],
    )
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    installments = serializers.SerializerMethodField()
    sent_payments = serializers.SerializerMethodField()
    received_payments = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # extra_field_values = validated_data.pop("extra_field_values")
        new_user = self.Meta.model.objects.create_user(**validated_data)
        new_user.is_active = True
        # new_user.extra_field_values = extra_field_values
        new_user.save()
        return new_user

    def get_installments(self, obj):
        return [
            model_to_dict(i, fields=[
                "id",
                "pay_before",
                "currency",
                "amount",
                "remind_at",
                "paid_at",
                "order",
            ]) for i in obj.installments.all()
        ]

    def get_sent_payments(self, obj):
        return [
            model_to_dict(p, fields=[
                "id",
                "to_user",
                "currency",
                "amount",
                "order",
                "installment",
            ]) for p in obj.sent_payments.all()
        ]

    def get_received_payments(self, obj):
        return [
            model_to_dict(p, fields=[
                "id",
                "from_user",
                "currency",
                "amount",
                "order",
                "installment",
            ]) for p in obj.received_payments.all()
        ]


class EmployeeSerializer(UserSerializer):
    orders = serializers.SerializerMethodField()
    user_type = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'
        extra_kwargs = {"password": {"write_only": True}}

    def get_orders(self, obj):
        return [
            {"id": o.id, "created_at": o.created_at,
                "total_amounts": o.total_amounts}
            for o in obj.orders.all()
        ]

    def get_user_type(self, obj):
        return "employee"


class ClientSerializer(UserSerializer):
    orders = serializers.SerializerMethodField()
    user_type = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = '__all__'
        extra_kwargs = {"password": {"write_only": True}}

    def get_orders(self, obj):
        return [
            {"id": o.id, "created_at": o.created_at,
                "total_amounts": o.total_amounts}
            for o in obj.orders.all()
        ]

    def get_user_type(self, obj):
        return "client"


class SupplierSerializer(UserSerializer):
    product_ids = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="products",
        many=True,
        write_only=True,
        required=False
    )
    products = ProductBasicSerializer(read_only=True, many=True)
    items_in_inventory = serializers.SerializerMethodField()
    order_items = serializers.SerializerMethodField()
    user_type = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = '__all__'
        extra_kwargs = {"password": {"write_only": True}}

    def get_items_in_inventory(self, obj):
        return [
            model_to_dict(i, fields=[
                "id", "inventory", "unit_type", "amount", "cost_currency", "cost_per_unit"
            ]) for i in obj.items_in_inventory.all()
        ]

    def get_order_items(self, obj):
        return [
            model_to_dict(i, fields=[
                "id",
                "order",
                "product",
                "amount",
                "unit_type",
                "supplier_price_per_unit",
                "supplier_price_currency",
                "selling_price_per_unit",
                "selling_price_currency",
            ])for i in obj.order_items.all()
        ]

    def get_user_type(self, obj):
        return "supplier"


class SupplierSimpleSerializer(UserSerializer):
    products = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True,
        required=False
    )

    class Meta:
        model = Supplier
        fields = '__all__'
        extra_kwargs = {"password": {"write_only": True}}
