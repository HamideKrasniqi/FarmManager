from django.contrib import admin

from apps.livestock.models import Animal


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ('tag_number', 'species', 'health_status', 'farm')
    list_filter = ('health_status', 'species', 'farm')
    search_fields = ('tag_number', 'species')
