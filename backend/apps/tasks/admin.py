from django.contrib import admin

from apps.tasks.models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'status',
        'assigned_to',
        'rating',
        'due_date',
        'farm',
    )
    list_filter = ('status', 'farm', 'rating')
    search_fields = ('title', 'description')
    readonly_fields = ('verified_at', 'created_at', 'updated_at')
