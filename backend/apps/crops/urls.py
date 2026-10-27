from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.crops.views import CropViewSet

router = DefaultRouter()
router.register(r'crops', CropViewSet, basename='crop')

urlpatterns = [
    path('', include(router.urls)),
]
