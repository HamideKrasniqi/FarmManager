from django.contrib import admin

from apps.crops.models import Crop


@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ('field_name', 'crop_type', 'area_hectares', 'status', 'farm')
    list_filter = ('status', 'crop_type', 'farm')
    search_fields = ('field_name', 'crop_type')
