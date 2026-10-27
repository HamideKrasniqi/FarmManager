"""
HR ViewSets — salaries (Owner) and vacation requests (Worker + staff).
"""

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.mixins import TenantQuerysetMixin
from apps.accounts.permissions import (
    FarmIsActive,
    IsFarmMember,
    IsFarmOwner,
    IsOwnerOrManager,
)
from apps.hr.models import Salary, VacationRequest
from apps.hr.serializers import (
    SalarySerializer,
    VacationRequestSerializer,
    VacationReviewSerializer,
)

User = get_user_model()


class SalaryViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    """
    Owner: full CRUD for farm salaries.
    Worker: list/retrieve own salary only (via get_queryset).
    Manager: denied.
    """

    serializer_class = SalarySerializer
    queryset = Salary.objects.select_related('farm', 'employee', 'created_by')
    filterset_fields = ('employee', 'currency')
    ordering_fields = ('effective_from', 'amount', 'created_at')

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'mine'):
            return [IsAuthenticated(), IsFarmMember(), FarmIsActive()]
        return [IsAuthenticated(), IsFarmOwner(), FarmIsActive()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_owner:
            return qs
        if user.is_worker:
            return qs.filter(employee=user)
        # Manager and others: no salary visibility
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(farm=user.farm, created_by=user)

    @action(detail=False, methods=['get'])
    def mine(self, request):
        """GET /api/v1/salaries/mine/ — worker's current salary records."""
        qs = self.get_queryset().filter(employee=request.user)
        return Response(SalarySerializer(qs, many=True).data)


class VacationRequestViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    """
    Worker/Manager: create & list own requests.
    Manager leave requires Owner approval; worker leave can be reviewed by Owner or Manager.
    Owner/Manager: list farm requests + review (approve/reject) where permitted.
    """

    serializer_class = VacationRequestSerializer
    queryset = VacationRequest.objects.select_related(
        'farm', 'employee', 'reviewed_by'
    )
    filterset_fields = ('status', 'employee', 'leave_type')
    ordering_fields = ('start_date', 'created_at', 'status')

    def get_permissions(self):
        if self.action in ('update', 'partial_update', 'destroy'):
            # Workers may cancel only PENDING own requests via destroy
            return [IsAuthenticated(), IsFarmMember(), FarmIsActive()]
        if self.action == 'review':
            return [IsAuthenticated(), IsOwnerOrManager(), FarmIsActive()]
        return [IsAuthenticated(), IsFarmMember(), FarmIsActive()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_worker:
            return qs.filter(employee=user)
        if user.is_farm_staff:
            return qs
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not (user.is_worker or user.is_manager):
            raise PermissionDenied(
                'Only workers and managers can submit vacation requests.'
            )
        serializer.save(
            farm=user.farm,
            employee=user,
            status=VacationRequest.Status.PENDING,
        )

    def perform_destroy(self, instance):
        user = self.request.user
        if user.is_worker or user.is_manager:
            if instance.employee_id != user.id:
                raise PermissionDenied('You can only cancel your own requests.')
            if instance.status != VacationRequest.Status.PENDING:
                raise ValidationError('Only PENDING requests can be cancelled.')
        elif not user.is_farm_staff:
            raise PermissionDenied()
        instance.delete()

    def _assert_can_review(self, user, vacation):
        if vacation.employee_id == user.id:
            raise PermissionDenied('You cannot review your own leave request.')
        if user.is_manager and vacation.employee.role != User.Role.WORKER:
            raise PermissionDenied(
                'Manager leave requests require owner approval.'
            )

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """
        POST /api/v1/vacations/{id}/review/
        Body: { "decision": "APPROVED"|"REJECTED", "review_feedback": "..." }
        """
        vacation = self.get_object()
        if vacation.status != VacationRequest.Status.PENDING:
            raise ValidationError('Only PENDING requests can be reviewed.')

        self._assert_can_review(request.user, vacation)

        ser = VacationReviewSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        vacation.status = ser.validated_data['decision']
        vacation.review_feedback = ser.validated_data.get('review_feedback', '')
        vacation.reviewed_by = request.user
        vacation.reviewed_at = timezone.now()
        vacation.save()
        return Response(VacationRequestSerializer(vacation).data)

    @action(detail=False, methods=['get'], url_path='pending')
    def pending(self, request):
        """List PENDING vacation requests for Owner/Manager review queue."""
        if not request.user.is_farm_staff:
            raise PermissionDenied('Only Owner/Manager can view the review queue.')
        qs = self.get_queryset().filter(status=VacationRequest.Status.PENDING)
        return Response(VacationRequestSerializer(qs, many=True).data)
