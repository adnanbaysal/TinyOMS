from django.db.models.deletion import ProtectedError
from rest_framework import permissions, filters, viewsets
from rest_framework.response import Response
from generics.permissions import StaffOnly, PreventUpdate
from generics.api import ProtectedErrorModelViewSet
from generics.helper import CustomPagination
from users.models import Employee
from .models import Order, SupplierOrderItem, InventoryOrderItem
from .serializers import (
    OrderSerializer, SupplierOrderItemSerializer, InventoryOrderItemSerializer
)


class OrderModelViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, StaffOnly]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'client__first_name',
        'client__last_name',
        'client__username',
        'seller__first_name',
        'seller__last_name',
        'seller__username',
    ]
    ordering_fields = ['is_active', 'created_at',
                       'client__username', 'seller__username']

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.seller = Employee.objects.filter(
            id=self.request.user.id
        ).first()  # seller is the logged in request user
        instance.save()

    def perform_update(self, serializer):
        instance = serializer.save()  # only superuser can update seller
        if not self.request.user.is_superuser:
            instance.seller = Employee.objects.filter(
                id=self.request.user.id
            ).first()
            instance.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = Employee.objects.filter(id=request.user.id).first()
        if (user != instance.seller) and (not user.is_superuser):
            return Response(
                {"error": "You are not authorized to perform this action"}, status=403
            )
        try:
            instance.delete()
            return Response(status=200)
        except ProtectedError:
            return Response(
                {"error": "Item cannot be deleted because of existing references"}, status=403
            )


class SupplierOrderItemModelViewSet(ProtectedErrorModelViewSet):
    queryset = SupplierOrderItem.objects.all()
    serializer_class = SupplierOrderItemSerializer
    permission_classes = [permissions.IsAuthenticated, StaffOnly]
    pagination_class = CustomPagination


class InventoryOrderItemModelViewSet(ProtectedErrorModelViewSet):
    """
    put: Forbidden
    patch: Forbidden
    """
    queryset = InventoryOrderItem.objects.all()
    serializer_class = InventoryOrderItemSerializer
    permission_classes = [
        permissions.IsAuthenticated, StaffOnly, PreventUpdate]
    pagination_class = CustomPagination
