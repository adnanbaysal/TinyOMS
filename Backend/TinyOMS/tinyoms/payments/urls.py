from django.urls import path, include
from rest_framework import routers
from .api import (
    InstallmentModelViewSet,
    PaymentModelViewSet,
)


router = routers.DefaultRouter()

router.register('api/installments', InstallmentModelViewSet, 'installments')
router.register('api/payments', PaymentModelViewSet, 'payments')

urlpatterns = router.urls 
            # + [path('api/products', Xyz.as_view()),]
