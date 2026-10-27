from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.hr.views import SalaryViewSet, VacationRequestViewSet

router = DefaultRouter()
router.register(r'salaries', SalaryViewSet, basename='salary')
router.register(r'vacations', VacationRequestViewSet, basename='vacation')

urlpatterns = [
    path('', include(router.urls)),
]
