"""
HR domain: employee salaries and vacation requests.

RBAC
----
- Salary: Owner manages; Worker sees only own record; Manager has no access.
- Vacation: Worker requests; Owner/Manager approve or reject.
"""

from django.conf import settings
from django.db import models


class Salary(models.Model):
    """Monthly salary record for a farm employee (sensitive — Owner only)."""

    farm = models.ForeignKey(
        'farms.Farm',
        on_delete=models.CASCADE,
        related_name='salaries',
    )
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='salaries',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='EUR')
    effective_from = models.DateField()
    notes = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='salaries_created',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-effective_from', '-created_at']
        verbose_name_plural = 'Salaries'

    def __str__(self) -> str:
        return f'{self.employee} — {self.amount} {self.currency}'


class VacationRequest(models.Model):
    """
    Leave request workflow:
    PENDING → APPROVED | REJECTED  (Owner / Manager)
    """

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    class LeaveType(models.TextChoices):
        ANNUAL = 'ANNUAL', 'Annual leave'          # Pushim vjetor
        MEDICAL = 'MEDICAL', 'Medical / sick leave'  # Pushim mjekësor
        PERSONAL = 'PERSONAL', 'Personal leave'
        UNPAID = 'UNPAID', 'Unpaid leave'

    farm = models.ForeignKey(
        'farms.Farm',
        on_delete=models.CASCADE,
        related_name='vacation_requests',
    )
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vacation_requests',
    )
    leave_type = models.CharField(
        max_length=20,
        choices=LeaveType.choices,
        default=LeaveType.ANNUAL,
        help_text='Annual, medical, personal, or unpaid leave.',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vacations_reviewed',
    )
    review_feedback = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.employee} {self.start_date}→{self.end_date} [{self.status}]'

    @property
    def days(self) -> int:
        return (self.end_date - self.start_date).days + 1
