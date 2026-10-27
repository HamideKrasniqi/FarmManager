"""SuperAdmin farm management and platform metrics."""

from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsSuperAdmin
from apps.farms.models import Farm

User = get_user_model()


class FarmSerializer(serializers.ModelSerializer):
    user_count = serializers.IntegerField(read_only=True, required=False)
    animal_count = serializers.IntegerField(read_only=True, required=False)
    crop_count = serializers.IntegerField(read_only=True, required=False)
    task_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Farm
        fields = (
            'id',
            'name',
            'status',
            'plan',
            'monthly_price',
            'currency',
            'created_at',
            'updated_at',
            'user_count',
            'animal_count',
            'crop_count',
            'task_count',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class FarmPricingSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=Farm.Plan.choices)
    monthly_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    currency = serializers.CharField(max_length=3, required=False, default='EUR')
    use_plan_default = serializers.BooleanField(required=False, default=True)


class FarmViewSet(viewsets.ModelViewSet):
    """
    SuperAdmin CRUD for tenant farms.

    Custom actions: suspend / activate.
    """

    serializer_class = FarmSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    search_fields = ('name',)
    filterset_fields = ('status',)
    queryset = Farm.objects.all()

    def get_queryset(self):
        return Farm.objects.annotate(
            user_count=Count('users', distinct=True),
            animal_count=Count('animals', distinct=True),
            crop_count=Count('crops', distinct=True),
            task_count=Count('tasks', distinct=True),
        )

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        farm = self.get_object()
        farm.status = Farm.Status.SUSPENDED
        farm.save(update_fields=['status', 'updated_at'])
        return Response(FarmSerializer(farm).data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        farm = self.get_object()
        farm.status = Farm.Status.ACTIVE
        farm.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(farm).data)

    @action(detail=True, methods=['post'], url_path='set-pricing')
    def set_pricing(self, request, pk=None):
        """
        POST /api/v1/admin/farms/{id}/set-pricing/
        Body: { plan, monthly_price?, currency?, use_plan_default? }
        """
        farm = self.get_object()
        ser = FarmPricingSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        farm.plan = data['plan']
        farm.currency = data.get('currency', farm.currency or 'EUR')
        if data.get('use_plan_default', True) or 'monthly_price' not in data:
            farm.apply_plan_defaults()
        else:
            farm.monthly_price = data['monthly_price']
        farm.save(update_fields=['plan', 'monthly_price', 'currency', 'updated_at'])
        return Response(self.get_serializer(farm).data)


PLAN_MARKETING = {
    Farm.Plan.FREE: {
        'description': 'Try FarmManager with core features for small farms.',
        'features': [
            '1 farm tenant',
            'Up to 3 users',
            'Tasks & livestock',
            'Basic dashboard',
        ],
    },
    Farm.Plan.BASIC: {
        'description': 'Best for growing farms starting digital operations.',
        'features': [
            'Unlimited users',
            'Crops & vacations',
            'Task verification',
            'Email support',
        ],
        'highlighted': True,
    },
    Farm.Plan.PRO: {
        'description': 'Full operations plus finances and employee management.',
        'features': [
            'Everything in Basic',
            'Finances & salaries',
            'Employee management',
            'Priority support',
        ],
    },
    Farm.Plan.ENTERPRISE: {
        'description': 'Large farms with advanced needs and custom limits.',
        'features': [
            'Everything in Pro',
            'Dedicated onboarding',
            'Custom reporting',
            'SLA & admin tools',
        ],
    },
}


@api_view(['GET'])
@permission_classes([AllowAny])
def pricing_plans(request):
    """
    GET /api/v1/pricing/plans/

    Public subscription catalog for registration and marketing pages.
    """
    plans = []
    for plan, label in Farm.Plan.choices:
        meta = PLAN_MARKETING.get(plan, {})
        plans.append(
            {
                'id': plan,
                'name': label,
                'price': Farm.PLAN_DEFAULT_PRICES[plan],
                'currency': 'EUR',
                'period': 'month',
                'description': meta.get('description', ''),
                'features': meta.get('features', []),
                'highlighted': meta.get('highlighted', False),
            }
        )
    return Response({'plans': plans})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def platform_metrics(request):
    """
    GET /api/v1/admin/metrics/

    Global KPIs for the SuperAdmin dashboard.
    """
    from apps.livestock.models import Animal
    from apps.crops.models import Crop
    from apps.finances.models import Transaction
    from apps.tasks.models import Task

    farms = Farm.objects.aggregate(
        total=Count('id'),
        active=Count('id', filter=Q(status=Farm.Status.ACTIVE)),
        suspended=Count('id', filter=Q(status=Farm.Status.SUSPENDED)),
    )
    users = User.objects.exclude(role=User.Role.SUPERADMIN).count()
    tasks = Task.objects.aggregate(
        total=Count('id'),
        pending=Count('id', filter=Q(status=Task.Status.PENDING)),
        in_progress=Count('id', filter=Q(status=Task.Status.IN_PROGRESS)),
        completed=Count('id', filter=Q(status=Task.Status.COMPLETED)),
        approved=Count('id', filter=Q(status=Task.Status.APPROVED)),
        rejected=Count('id', filter=Q(status=Task.Status.REJECTED)),
    )
    finance = Transaction.objects.aggregate(
        income=Sum('amount', filter=Q(type=Transaction.Type.INCOME)),
        expense=Sum('amount', filter=Q(type=Transaction.Type.EXPENSE)),
    )

    # Subscription MRR from farm pricing (active tenants only)
    mrr = (
        Farm.objects.filter(status=Farm.Status.ACTIVE).aggregate(
            total=Sum('monthly_price')
        )['total']
        or 0
    )
    plans = {
        plan: Farm.objects.filter(plan=plan).count()
        for plan, _ in Farm.Plan.choices
    }
    recent_farms = list(
        Farm.objects.order_by('-created_at')[:6].values(
            'id', 'name', 'status', 'plan', 'monthly_price', 'currency', 'created_at'
        )
    )

    return Response(
        {
            'farms': farms,
            'users': users,
            'animals': Animal.objects.count(),
            'crops': Crop.objects.count(),
            'tasks': tasks,
            'finances': {
                'total_income': finance['income'] or 0,
                'total_expense': finance['expense'] or 0,
            },
            'pricing': {
                'mrr': mrr,
                'plans': plans,
                'catalog': [
                    {'plan': p, 'default_price': Farm.PLAN_DEFAULT_PRICES[p]}
                    for p, _ in Farm.Plan.choices
                ],
            },
            'recent_farms': recent_farms,
        }
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def farm_dashboard(request):
    """
    GET /api/v1/dashboard/

    Role-aware farm-level summary for Owner / Manager / Worker.
    Includes upcoming tasks, leave queue, and (Owner) monthly finance series.
    """
    from datetime import date, timedelta
    from collections import defaultdict
    from decimal import Decimal

    from apps.livestock.models import Animal
    from apps.crops.models import Crop
    from apps.finances.models import Transaction
    from apps.tasks.models import Task
    from apps.hr.models import VacationRequest

    user = request.user
    if user.is_superadmin:
        return Response(
            {'detail': 'Use /api/v1/admin/metrics/ for platform stats.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not user.farm_id:
        return Response({'detail': 'No farm assigned.'}, status=status.HTTP_400_BAD_REQUEST)

    farm = user.farm
    base = {'farm_id': farm.id}

    animals = Animal.objects.filter(**base).count()
    crops = Crop.objects.filter(**base).count()
    employees = User.objects.filter(farm=farm).exclude(id=user.id).count()

    task_qs = Task.objects.filter(**base)
    if user.is_worker:
        task_qs = task_qs.filter(assigned_to=user)

    tasks = task_qs.aggregate(
        total=Count('id'),
        pending=Count('id', filter=Q(status=Task.Status.PENDING)),
        in_progress=Count('id', filter=Q(status=Task.Status.IN_PROGRESS)),
        completed=Count('id', filter=Q(status=Task.Status.COMPLETED)),
        approved=Count('id', filter=Q(status=Task.Status.APPROVED)),
        rejected=Count('id', filter=Q(status=Task.Status.REJECTED)),
        awaiting_review=Count('id', filter=Q(status=Task.Status.COMPLETED)),
    )

    # Upcoming open tasks for dashboard widget
    open_statuses = [
        Task.Status.PENDING,
        Task.Status.IN_PROGRESS,
        Task.Status.REJECTED,
        Task.Status.COMPLETED,
    ]
    upcoming = list(
        task_qs.filter(status__in=open_statuses)
        .select_related('assigned_to')
        .order_by('due_date', '-created_at')[:8]
        .values(
            'id',
            'title',
            'status',
            'due_date',
            'assigned_to__username',
        )
    )
    for row in upcoming:
        row['assigned_to_name'] = row.pop('assigned_to__username', None)

    vac_qs = VacationRequest.objects.filter(**base)
    if user.is_worker:
        vac_qs = vac_qs.filter(employee=user)
    pending_vacations = list(
        vac_qs.filter(status=VacationRequest.Status.PENDING)
        .select_related('employee')
        .order_by('start_date')[:6]
        .values(
            'id',
            'leave_type',
            'start_date',
            'end_date',
            'employee__username',
            'reason',
        )
    )
    for row in pending_vacations:
        row['employee_name'] = row.pop('employee__username', None)

    payload = {
        'farm': {'id': farm.id, 'name': farm.name, 'status': farm.status},
        'animals': animals,
        'crops': crops,
        'employees': employees,
        'tasks': tasks,
        'upcoming_tasks': upcoming,
        'pending_vacations': pending_vacations,
        'pending_vacation_count': vac_qs.filter(
            status=VacationRequest.Status.PENDING
        ).count(),
    }

    # Sensitive financials — Owner only (+ monthly bars for chart)
    if user.is_owner:
        finance = Transaction.objects.filter(**base).aggregate(
            income=Sum('amount', filter=Q(type=Transaction.Type.INCOME)),
            expense=Sum('amount', filter=Q(type=Transaction.Type.EXPENSE)),
        )
        income = finance['income'] or 0
        expense = finance['expense'] or 0
        payload['finances'] = {
            'income': income,
            'expense': expense,
            'balance': income - expense,
        }

        # Last 8 months income vs expense
        start = (date.today().replace(day=1) - timedelta(days=210)).replace(day=1)
        txns = Transaction.objects.filter(farm=farm, date__gte=start).values(
            'date', 'type', 'amount'
        )
        buckets = defaultdict(lambda: {'income': Decimal('0'), 'expense': Decimal('0')})
        for t in txns:
            key = t['date'].strftime('%Y-%m')
            if t['type'] == Transaction.Type.INCOME:
                buckets[key]['income'] += t['amount']
            else:
                buckets[key]['expense'] += t['amount']

        # Ensure continuous months
        monthly = []
        cursor = start
        today = date.today().replace(day=1)
        while cursor <= today:
            key = cursor.strftime('%Y-%m')
            monthly.append(
                {
                    'month': key,
                    'label': cursor.strftime('%b'),
                    'income': float(buckets[key]['income']),
                    'expense': float(buckets[key]['expense']),
                }
            )
            if cursor.month == 12:
                cursor = cursor.replace(year=cursor.year + 1, month=1)
            else:
                cursor = cursor.replace(month=cursor.month + 1)
        payload['monthly_finance'] = monthly[-8:]

    return Response(payload)
