from django.urls import path, include
from rest_framework import routers
from .api import (
    OrderModelViewSet,
    SupplierOrderItemModelViewSet,
    InventoryOrderItemModelViewSet,
)


router = routers.DefaultRouter()
router.register('api/orders', OrderModelViewSet, 'orders')
router.register('api/supplierorderitems',
                SupplierOrderItemModelViewSet, 'supplierorderitems')
router.register('api/stockorderitems',
                InventoryOrderItemModelViewSet, 'stockorderitems')

urlpatterns = router.urls
# + [path('api/products', Xyz.as_view()),]
