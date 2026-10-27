"""
Farm (tenant) model.

Each registered farm is an isolated tenant. All domain data rows
carry a farm_id FK and are filtered by the requesting user's farm.
"""

from django.db import models


class Farm(models.Model):
    """Tenant root entity for multi-tenant isolation."""

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    class Plan(models.TextChoices):
        FREE = 'FREE', 'Free'
        BASIC = 'BASIC', 'Basic'
        PRO = 'PRO', 'Pro'
        ENTERPRISE = 'ENTERPRISE', 'Enterprise'

    # Suggested default prices by plan (EUR / month) — SuperAdmin can override
    PLAN_DEFAULT_PRICES = {
        Plan.FREE: 0,
        Plan.BASIC: 29,
        Plan.PRO: 79,
        Plan.ENTERPRISE: 199,
    }

    name = models.CharField(max_length=255, unique=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        help_text='Suspended farms cannot log in or mutate data.',
    )
    plan = models.CharField(
        max_length=20,
        choices=Plan.choices,
        default=Plan.BASIC,
        help_text='Subscription plan assigned by SuperAdmin.',
    )
    monthly_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=29,
        help_text='Monthly subscription price charged to this farm.',
    )
    currency = models.CharField(max_length=3, default='EUR')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Farm'
        verbose_name_plural = 'Farms'

    def __str__(self) -> str:
        return f'{self.name} ({self.status})'

    @property
    def is_active(self) -> bool:
        return self.status == self.Status.ACTIVE

    def apply_plan_defaults(self):
        """Set monthly_price from plan catalog if SuperAdmin picks a plan."""
        default = self.PLAN_DEFAULT_PRICES.get(self.plan)
        if default is not None:
            self.monthly_price = default
