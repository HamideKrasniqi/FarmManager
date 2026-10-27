from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.accounts.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'farm', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'farm')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Farm Management', {'fields': ('role', 'farm')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Farm Management', {'fields': ('role', 'farm', 'email')}),
    )
