"""
Task ViewSet — role-aware CRUD + workflow transitions.

Responsibilities
----------------
- Owner/Manager: create, assign, list farm tasks, verify (approve/reject).
- Worker: list own tasks, advance status, add notes.
- Tenant isolation via farm_id; workers further scoped to assigned_to=self.
"""

from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.mixins import TenantQuerysetMixin
from apps.accounts.permissions import FarmIsActive, IsFarmMember, IsOwnerOrManager
from apps.tasks.models import Task
from apps.tasks.serializers import (
    TaskSerializer,
    VerifyTaskSerializer,
    WorkerStatusSerializer,
)


class TaskViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsFarmMember, FarmIsActive]
    queryset = Task.objects.select_related(
        'farm', 'assigned_to', 'created_by'
    )
    search_fields = ('title', 'description')
    filterset_fields = ('status', 'assigned_to', 'due_date')
    ordering_fields = ('due_date', 'created_at', 'status', 'rating')

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Workers only see their own assignments
        if user.is_worker:
            return qs.filter(assigned_to=user)
        return qs

    def get_permissions(self):
        """Create/update/destroy restricted to Owner & Manager."""
        if self.action in ('create', 'update', 'partial_update', 'destroy', 'verify'):
            return [IsAuthenticated(), IsOwnerOrManager(), FarmIsActive()]
        return super().get_permissions()

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(farm=user.farm, created_by=user, status=Task.Status.PENDING)

    # ------------------------------------------------------------------
    # Worker workflow
    # ------------------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        POST /api/v1/tasks/{id}/update-status/

        Body: { "status": "IN_PROGRESS"|"COMPLETED", "worker_notes": "..." }
        """
        task = self.get_object()
        user = request.user

        if not user.is_worker or task.assigned_to_id != user.id:
            raise PermissionDenied('Only the assigned worker can update this task.')

        ser = WorkerStatusSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        new_status = ser.validated_data['status']

        # Allow rework after REJECTED → IN_PROGRESS
        if not task.can_transition_to(new_status):
            raise ValidationError(
                f'Cannot transition from {task.status} to {new_status}.'
            )

        task.status = new_status
        notes = ser.validated_data.get('worker_notes')
        if notes is not None:
            task.worker_notes = notes
        # Clear previous verification if reworking
        if new_status == Task.Status.IN_PROGRESS and task.verified_at:
            task.verified_at = None
            task.rating = None
            task.owner_feedback = ''
        task.save()
        return Response(TaskSerializer(task).data)

    # ------------------------------------------------------------------
    # Owner / Manager verification
    # ------------------------------------------------------------------
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        POST /api/v1/tasks/{id}/verify/

        Body: {
          "decision": "APPROVED"|"REJECTED",
          "rating": 1-5,            # required if APPROVED
          "owner_feedback": "..."   # required if REJECTED
        }
        """
        task = self.get_object()
        if task.status != Task.Status.COMPLETED:
            raise ValidationError('Only COMPLETED tasks can be verified.')

        ser = VerifyTaskSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        decision = ser.validated_data['decision']

        task.status = decision
        task.owner_feedback = ser.validated_data.get('owner_feedback', '')
        task.verified_at = timezone.now()
        if decision == Task.Status.APPROVED:
            task.rating = ser.validated_data['rating']
        else:
            task.rating = None
        task.save()
        return Response(TaskSerializer(task).data)

    @action(detail=False, methods=['get'], url_path='awaiting-review')
    def awaiting_review(self, request):
        """List COMPLETED tasks pending owner/manager verification."""
        if not request.user.is_farm_staff:
            raise PermissionDenied('Only Owner/Manager can review tasks.')
        qs = self.get_queryset().filter(status=Task.Status.COMPLETED)
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(TaskSerializer(page, many=True).data)
        return Response(TaskSerializer(qs, many=True).data)
