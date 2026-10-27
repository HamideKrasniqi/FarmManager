"""Task serializers and workflow action payloads."""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.tasks.models import Task

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(
        source='assigned_to.username', read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.username', read_only=True, default=None
    )

    class Meta:
        model = Task
        fields = (
            'id',
            'farm',
            'title',
            'description',
            'assigned_to',
            'assigned_to_name',
            'created_by',
            'created_by_name',
            'status',
            'due_date',
            'worker_notes',
            'rating',
            'owner_feedback',
            'verified_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'farm',
            'created_by',
            'status',
            'worker_notes',
            'rating',
            'owner_feedback',
            'verified_at',
            'created_at',
            'updated_at',
        )

    def validate_assigned_to(self, worker):
        """Assignee must be a WORKER on the same farm."""
        request = self.context['request']
        farm = request.user.farm
        if worker.farm_id != farm.id:
            raise serializers.ValidationError('Worker must belong to your farm.')
        if worker.role != User.Role.WORKER:
            raise serializers.ValidationError('Tasks can only be assigned to WORKERs.')
        return worker


class WorkerStatusSerializer(serializers.Serializer):
    """Worker advances PENDING→IN_PROGRESS or IN_PROGRESS→COMPLETED."""

    status = serializers.ChoiceField(
        choices=[Task.Status.IN_PROGRESS, Task.Status.COMPLETED]
    )
    worker_notes = serializers.CharField(required=False, allow_blank=True)


class VerifyTaskSerializer(serializers.Serializer):
    """Owner/Manager approves (with rating) or rejects a COMPLETED task."""

    decision = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    owner_feedback = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs['decision'] == 'APPROVED' and not attrs.get('rating'):
            raise serializers.ValidationError(
                {'rating': 'A 1–5 star rating is required when approving.'}
            )
        if attrs['decision'] == 'REJECTED' and not attrs.get('owner_feedback'):
            raise serializers.ValidationError(
                {'owner_feedback': 'Feedback is required when rejecting.'}
            )
        return attrs
