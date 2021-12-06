from rest_framework import permissions, filters
from generics.permissions import StaffOnly, StaffSuperUserOnly
from generics.api import ProtectedErrorModelViewSet
from generics.helper import CustomPagination
from .models import InventoryItem, Inventory
from .serializers import InventoryItemSerializer, InventorySerializer


class InventoryItemModelViewSet(ProtectedErrorModelViewSet):
    # queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated, StaffOnly]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'product__description']
    ordering_fields = [
        'inventory__name',
        'product__name',
        'product__description',
        'supplier__username',
        'unit_type',
        'amount',
        'cost_currency',
        'cost_per_unit',
    ]

    def get_queryset(self):
        inventory_id = self.request.query_params.get("inventory_id")
        if inventory_id and inventory_id.isnumeric():
            if Inventory.objects.filter(id=inventory_id).exists():
                return InventoryItem.objects.filter(inventory__id=inventory_id)
        return InventoryItem.objects.all()


class InventoryModelViewSet(ProtectedErrorModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']

    def get_permissions(self):
        staff_actions = ["list", "retrieve"]
        super_actions = ["create", "update", "partial_update", "destroy"]
        if self.action in staff_actions:
            self.permission_classes = [permissions.IsAuthenticated, StaffOnly]
        elif self.action in super_actions:
            self.permission_classes = [
                permissions.IsAuthenticated, StaffSuperUserOnly]
        return super(self.__class__, self).get_permissions()
