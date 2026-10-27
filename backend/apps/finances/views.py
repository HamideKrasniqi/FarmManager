from django.db.models import Sum, Q
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.mixins import TenantQuerysetMixin
from apps.accounts.permissions import FarmIsActive, IsFarmOwner
from apps.finances.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.username', read_only=True, default=None
    )

    class Meta:
        model = Transaction
        fields = (
            'id',
            'farm',
            'type',
            'amount',
            'description',
            'category',
            'date',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'farm', 'created_by', 'created_at', 'updated_at')


class TransactionViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    """
    Financial ledger — OWNER ONLY.

    Managers and Workers are intentionally denied (RBAC).
    """

    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, IsFarmOwner, FarmIsActive]
    queryset = Transaction.objects.select_related('farm', 'created_by')
    search_fields = ('description', 'category')
    filterset_fields = ('type', 'category', 'date')
    ordering_fields = ('date', 'amount', 'created_at')

    def perform_create(self, serializer):
        # Stamp farm via mixin, then attach creator
        user = self.request.user
        serializer.save(farm=user.farm, created_by=user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Aggregated income / expense / balance for the owner's farm."""
        qs = self.get_queryset()
        agg = qs.aggregate(
            income=Sum('amount', filter=Q(type=Transaction.Type.INCOME)),
            expense=Sum('amount', filter=Q(type=Transaction.Type.EXPENSE)),
        )
        income = agg['income'] or 0
        expense = agg['expense'] or 0
        return Response(
            {
                'income': income,
                'expense': expense,
                'balance': income - expense,
                'count': qs.count(),
            }
        )
