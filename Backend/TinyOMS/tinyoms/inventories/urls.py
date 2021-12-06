from django.urls import path, include
from rest_framework import routers
from .api import (
    InventoryItemModelViewSet,
    InventoryModelViewSet,
)


router = routers.DefaultRouter()
router.register('api/stockitems', InventoryItemModelViewSet, 'stockitems')
router.register('api/stocks', InventoryModelViewSet, 'stocks')

urlpatterns = router.urls
# + [path('api/products', Xyz.as_view()),]
