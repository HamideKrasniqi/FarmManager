"""Serializers for Salary and VacationRequest."""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.hr.models import Salary, VacationRequest

User = get_user_model()


class SalarySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.username', read_only=True, default=None
    )

    class Meta:
        model = Salary
        fields = (
            'id',
            'farm',
            'employee',
            'employee_name',
            'amount',
            'currency',
            'effective_from',
            'notes',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'farm', 'created_by', 'created_at', 'updated_at')

    def validate_employee(self, employee):
        request = self.context['request']
        farm = request.user.farm
        if employee.farm_id != farm.id:
            raise serializers.ValidationError('Employee must belong to your farm.')
        if employee.role not in (User.Role.MANAGER, User.Role.WORKER):
            raise serializers.ValidationError(
                'Salary can only be set for MANAGER or WORKER.'
            )
        return employee


class VacationRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    employee_role = serializers.CharField(source='employee.role', read_only=True)
    reviewed_by_name = serializers.CharField(
        source='reviewed_by.username', read_only=True, default=None
    )
    days = serializers.IntegerField(read_only=True)

    class Meta:
        model = VacationRequest
        fields = (
            'id',
            'farm',
            'employee',
            'employee_name',
            'employee_role',
            'leave_type',
            'start_date',
            'end_date',
            'days',
            'reason',
            'status',
            'reviewed_by',
            'reviewed_by_name',
            'review_feedback',
            'reviewed_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'farm',
            'employee',
            'status',
            'reviewed_by',
            'review_feedback',
            'reviewed_at',
            'created_at',
            'updated_at',
        )

    def validate(self, attrs):
        start = attrs.get('start_date')
        end = attrs.get('end_date')
        if start and end and end < start:
            raise serializers.ValidationError(
                {'end_date': 'End date must be on or after start date.'}
            )
        return attrs


class VacationReviewSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    review_feedback = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs['decision'] == 'REJECTED' and not attrs.get('review_feedback'):
            raise serializers.ValidationError(
                {'review_feedback': 'Feedback is required when rejecting.'}
            )
        return attrs
