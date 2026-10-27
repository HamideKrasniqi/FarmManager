from django.contrib import admin

from apps.finances.models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('type', 'amount', 'description', 'date', 'farm')
    list_filter = ('type', 'farm', 'date')
    search_fields = ('description', 'category')
