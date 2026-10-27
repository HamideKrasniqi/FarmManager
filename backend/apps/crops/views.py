from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.accounts.mixins import TenantQuerysetMixin
from apps.accounts.permissions import FarmIsActive, IsOwnerOrManager
from apps.crops.models import Crop


class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = (
            'id',
            'farm',
            'field_name',
            'crop_type',
            'area_hectares',
            'planting_date',
            'expected_harvest',
            'status',
            'notes',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'farm', 'created_at', 'updated_at')


class CropViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    """CRUD for crops/fields — Owner & Manager."""

    serializer_class = CropSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManager, FarmIsActive]
    queryset = Crop.objects.select_related('farm')
    search_fields = ('field_name', 'crop_type')
    filterset_fields = ('crop_type', 'status')
    ordering_fields = ('field_name', 'area_hectares', 'planting_date')
