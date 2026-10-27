from django.contrib import admin

from apps.hr.models import Salary, VacationRequest


@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):
    list_display = ('employee', 'amount', 'currency', 'effective_from', 'farm')
    list_filter = ('farm', 'currency')
    search_fields = ('employee__username', 'notes')


@admin.register(VacationRequest)
class VacationRequestAdmin(admin.ModelAdmin):
    list_display = (
        'employee',
        'start_date',
        'end_date',
        'status',
        'farm',
        'reviewed_by',
    )
    list_filter = ('status', 'farm')
    search_fields = ('employee__username', 'reason')
