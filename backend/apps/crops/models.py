"""Crop / field domain model — tenant-scoped."""

from django.db import models


class Crop(models.Model):
    farm = models.ForeignKey(
        'farms.Farm',
        on_delete=models.CASCADE,
        related_name='crops',
    )
    field_name = models.CharField(max_length=150)
    crop_type = models.CharField(max_length=100)
    area_hectares = models.DecimalField(max_digits=10, decimal_places=2)
    planting_date = models.DateField(null=True, blank=True)
    expected_harvest = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        default='GROWING',
        help_text='e.g. PLANNED, GROWING, HARVESTED',
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['field_name']
        unique_together = ('farm', 'field_name')
        verbose_name = 'Crop'
        verbose_name_plural = 'Crops'

    def __str__(self) -> str:
        return f'{self.field_name} — {self.crop_type}'
