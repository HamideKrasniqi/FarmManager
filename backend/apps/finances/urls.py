from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.finances.views import TransactionViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
