from django.urls import path, include
from rest_framework import routers
from .api import (
    ExtraFieldAttributeViewSet,
    GenericImageViewSet,
    ConfigurationAPI,
)


router = routers.DefaultRouter()
router.register('api/extraattributes', ExtraFieldAttributeViewSet, 'extraattributes')
router.register('api/genericimage', GenericImageViewSet, 'genericimage')

urlpatterns = router.urls + [
    path('api/configurations', ConfigurationAPI.as_view()),
]
