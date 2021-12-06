from django.forms.models import model_to_dict
from rest_framework import serializers
from generics.serializers import ExtendableModelSerializer
from .models import Installment, Payment


class InstallmentSerializer(ExtendableModelSerializer):
    payments = serializers.SerializerMethodField()

    class Meta:
        model = Installment
        fields = '__all__'

    def get_payments(self, obj):
        return [
            model_to_dict(p, fields=[
                "id", 
                "from_user", 
                "to_user",
                "currency", 
                "amount", 
                "order",
            ]) for p in obj.payments.all()
        ]


class PaymentSerializer(ExtendableModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
