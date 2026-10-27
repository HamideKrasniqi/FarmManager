from django.contrib import admin

from apps.farms.models import Farm


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'plan', 'monthly_price', 'currency', 'created_at')
    list_filter = ('status', 'plan')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')
