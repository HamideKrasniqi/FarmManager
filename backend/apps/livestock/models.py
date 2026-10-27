"""Livestock (Animal) domain model — tenant-scoped."""

from django.db import models


class Animal(models.Model):
    class HealthStatus(models.TextChoices):
        HEALTHY = 'HEALTHY', 'Healthy'
        SICK = 'SICK', 'Sick'
        QUARANTINE = 'QUARANTINE', 'Quarantine'
        DECEASED = 'DECEASED', 'Deceased'

    farm = models.ForeignKey(
        'farms.Farm',
        on_delete=models.CASCADE,
        related_name='animals',
    )
    tag_number = models.CharField(max_length=64)
    species = models.CharField(max_length=100)
    breed = models.CharField(max_length=100, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    health_status = models.CharField(
        max_length=20,
        choices=HealthStatus.choices,
        default=HealthStatus.HEALTHY,
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['tag_number']
        # Tag numbers unique per farm (not globally)
        unique_together = ('farm', 'tag_number')
        verbose_name = 'Animal'
        verbose_name_plural = 'Animals'

    def __str__(self) -> str:
        return f'{self.tag_number} ({self.species})'
