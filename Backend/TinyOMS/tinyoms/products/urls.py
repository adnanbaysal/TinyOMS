from django.urls import path, include
from rest_framework import routers
from .api import (
    ProductModelViewSet,
    ProductImageModelViewSet,
    SupplierProductsAPIView,
)


router = routers.DefaultRouter()
router.register('api/products', ProductModelViewSet, 'products')
router.register('api/productimages', ProductImageModelViewSet, 'productimages')

urlpatterns = router.urls + [
    path('api/supplierproducts', SupplierProductsAPIView.as_view()),
]
