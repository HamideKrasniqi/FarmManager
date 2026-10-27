from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.accounts.mixins import TenantQuerysetMixin
from apps.accounts.permissions import FarmIsActive, IsOwnerOrManager
from apps.livestock.models import Animal


class AnimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = (
            'id',
            'farm',
            'tag_number',
            'species',
            'breed',
            'birth_date',
            'health_status',
            'notes',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'farm', 'created_at', 'updated_at')


class AnimalViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    """
    CRUD for animals — Owner & Manager.

    Tenant isolation via TenantQuerysetMixin.get_queryset().
    """

    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManager, FarmIsActive]
    queryset = Animal.objects.select_related('farm')
    search_fields = ('tag_number', 'species', 'breed')
    filterset_fields = ('species', 'health_status')
    ordering_fields = ('tag_number', 'birth_date', 'created_at')
