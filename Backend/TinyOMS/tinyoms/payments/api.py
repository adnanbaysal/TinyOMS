from django.db.models.deletion import ProtectedError
from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from generics.permissions import StaffOnly
from generics.helper import utcnow_with_tz, CustomPagination
from .models import Installment, Payment
from .serializers import InstallmentSerializer, PaymentSerializer
from .tasks import (
    create_installment_reminder,
    delete_installment_reminder,
    update_installment_reminder,
)


class InstallmentModelViewSet(viewsets.ModelViewSet):
    queryset = Installment.objects.all()
    serializer_class = InstallmentSerializer
    permission_classes = [permissions.IsAuthenticated, StaffOnly]
    pagination_class = CustomPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['pay_before', 'amount', 'paid_at']

    def perform_create(self, serializer):
        instance = serializer.save()
        # if this is an order installment, set payer to order.client to prevent wrong usage
        instance.payer = instance.order.client if instance.order else instance.payer
        instance.save()
        if instance.remind_at:
            create_installment_reminder(installment=instance)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer_class()
        response = serializer(instance).data
        if instance.remind_at:
            delete_installment_reminder(installment=instance)
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {"error": "Item cannot be deleted because of existing references"},
                status=403
            )
        return Response(response)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        if request.data.get("remind_at"):
            update_installment_reminder(installment=instance)
        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}
        return Response(serializer.data)


class PaymentModelViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, StaffOnly]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'from_user__username',
        'from_user__first_name',
        'from_user__last_name',
        'to_user__username',
        'to_user__first_name',
        'to_user__last_name',
    ]
    ordering_fields = [
        'from_user__username', 'to_user__username', 'amount'
    ]

    def perform_create(self, serializer):
        instance = serializer.save()
        order = instance.order
        if order:  # set payment from, to users as the order client and seller
            instance.from_user = order.client
            instance.to_user = order.seller
            instance.save()
            if order.all_payments_completed:
                order.is_cative = False
                order.save()
        installment = instance.installment
        if installment:
            installment.paid_at = utcnow_with_tz()
            installment.save()
            if installment.remind_at:
                delete_installment_reminder(installment=installment)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer_class()
        response = serializer(instance).data
        installment = instance.installment
        if installment:
            installment.paid_at = None
            installment.save()
            remind_at = installment.remind_at
            if remind_at and remind_at > utcnow_with_tz():
                create_installment_reminder(installment=installment)
        instance.delete()
        return Response(response)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        installment_before = instance.installment
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        if request.data.get("order"):
            if instance.order:
                instance.from_user = instance.order.client
                instance.to_user = instance.order.seller
                instance.save()
        if request.data.get("installment"):
            old_paid_at = installment_before.paid_at
            installment_before.paid_at = None
            installment_before.save()
            if installment_before.remind_at and \
                    installment_before.remind_at > utcnow_with_tz():
                create_installment_reminder(installment=installment_before)
            installment_after = instance.installment
            installment_after.paid_at = old_paid_at
            installment_after.save()
            if installment_after.remind_at and \
                    installment_after.remind_at > utcnow_with_tz():
                delete_installment_reminder(installment=installment_after)
        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}
        return Response(serializer.data)
