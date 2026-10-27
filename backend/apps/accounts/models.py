"""
Custom User model with RBAC roles and optional farm affiliation.

Role matrix
-----------
SUPERADMIN — platform owner; farm is NULL; sees all tenants.
OWNER      — full control of their farm (incl. finances & verification).
MANAGER    — operations (livestock, crops, tasks); no sensitive finances.
WORKER     — assigned tasks only; mobile-friendly workflow.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Application user bound to a tenant farm (except SuperAdmin)."""

    class Role(models.TextChoices):
        SUPERADMIN = 'SUPERADMIN', 'Super Admin'
        OWNER = 'OWNER', 'Farm Owner'
        MANAGER = 'MANAGER', 'Farm Manager'
        WORKER = 'WORKER', 'Farm Worker'

    # AbstractUser already has username, email, password, first/last name
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.WORKER,
    )
    farm = models.ForeignKey(
        'farms.Farm',
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True,
        help_text='Null only for SUPERADMIN (platform-level account).',
    )

    # Prefer email for login in API payloads while keeping username unique
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        ordering = ['username']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self) -> str:
        farm_label = self.farm.name if self.farm_id else 'Platform'
        return f'{self.username} [{self.role}] @ {farm_label}'

    # ---- Role helpers (used by permission classes) ----

    @property
    def is_superadmin(self) -> bool:
        return self.role == self.Role.SUPERADMIN

    @property
    def is_owner(self) -> bool:
        return self.role == self.Role.OWNER

    @property
    def is_manager(self) -> bool:
        return self.role == self.Role.MANAGER

    @property
    def is_worker(self) -> bool:
        return self.role == self.Role.WORKER

    @property
    def is_farm_staff(self) -> bool:
        """Owner or Manager — can manage operations & verify tasks."""
        return self.role in (self.Role.OWNER, self.Role.MANAGER)

    def clean(self):
        """Enforce: SuperAdmin has no farm; other roles must have one."""
        from django.core.exceptions import ValidationError

        super().clean()
        if self.role == self.Role.SUPERADMIN and self.farm_id is not None:
            raise ValidationError({'farm': 'SuperAdmin must not belong to a farm.'})
        if self.role != self.Role.SUPERADMIN and self.farm_id is None:
            raise ValidationError({'farm': 'Non-SuperAdmin users require a farm.'})
