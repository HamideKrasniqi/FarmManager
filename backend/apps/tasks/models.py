"""
Task model — 4-step quality-control lifecycle.

State machine
-------------
PENDING → IN_PROGRESS → COMPLETED → APPROVED
                                 ↘ REJECTED → (worker reworks → IN_PROGRESS)

Transitions are enforced in the ViewSet / serializer layer, not only by
status choice constraints, so illegal jumps return 400 with a clear message.
"""

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Task(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    farm = models.ForeignKey(
        'farms.Farm',
        on_delete=models.CASCADE,
        related_name='tasks',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_tasks',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tasks',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    due_date = models.DateField(null=True, blank=True)
    worker_notes = models.TextField(
        blank=True,
        help_text='Notes added by the worker when completing / updating the task.',
    )
    rating = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Owner rating 1–5 stars (set on APPROVED).',
    )
    owner_feedback = models.TextField(blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self) -> str:
        return f'{self.title} [{self.status}]'

    # Legal transitions (Open/Closed principle — extend map, don't scatter ifs)
    ALLOWED_TRANSITIONS = {
        Status.PENDING: {Status.IN_PROGRESS},
        Status.IN_PROGRESS: {Status.COMPLETED},
        Status.COMPLETED: {Status.APPROVED, Status.REJECTED},
        Status.REJECTED: {Status.IN_PROGRESS},  # rework cycle
        Status.APPROVED: set(),  # terminal
    }

    def can_transition_to(self, new_status: str) -> bool:
        return new_status in self.ALLOWED_TRANSITIONS.get(self.status, set())
