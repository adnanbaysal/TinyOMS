from django.urls import path, include
from rest_framework import routers
from .api import (
    UserViewSet,
)


router = routers.DefaultRouter()
router.register('api/users', UserViewSet, 'users')

urlpatterns = router.urls 
# + [
#     path('api/supplierproducts', SupplierProductsAPIView.as_view()),
# ]
