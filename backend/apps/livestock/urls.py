from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.livestock.views import AnimalViewSet

router = DefaultRouter()
router.register(r'animals', AnimalViewSet, basename='animal')

urlpatterns = [
    path('', include(router.urls)),
]
