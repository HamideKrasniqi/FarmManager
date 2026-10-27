"""
Root URL configuration.

API surface is versioned under /api/v1/ for future compatibility.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/', include('apps.farms.urls')),
    path('api/v1/', include('apps.livestock.urls')),
    path('api/v1/', include('apps.crops.urls')),
    path('api/v1/', include('apps.finances.urls')),
    path('api/v1/', include('apps.tasks.urls')),
    path('api/v1/', include('apps.hr.urls')),
]
