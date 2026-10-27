from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.farms.views import (
    FarmViewSet,
    farm_dashboard,
    platform_metrics,
    pricing_plans,
)

router = DefaultRouter()
router.register(r'admin/farms', FarmViewSet, basename='admin-farm')

urlpatterns = [
    path('pricing/plans/', pricing_plans, name='pricing-plans'),
    path('admin/metrics/', platform_metrics, name='platform-metrics'),
    path('dashboard/', farm_dashboard, name='farm-dashboard'),
    path('', include(router.urls)),
]
