"""Serializers for authentication and user management."""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.farms.models import Farm

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Public profile representation returned after login /me."""

    farm_name = serializers.CharField(source='farm.name', read_only=True, default=None)
    farm_status = serializers.CharField(source='farm.status', read_only=True, default=None)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'farm',
            'farm_name',
            'farm_status',
            'date_joined',
        )
        read_only_fields = ('id', 'role', 'farm', 'date_joined')


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Owner creates Managers / Workers under their farm.

    Password is write-only; farm is stamped from the requesting owner.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'password',
            'is_active',
            'date_joined',
        )
        read_only_fields = ('id', 'date_joined')

    def validate_role(self, value):
        allowed = {User.Role.MANAGER, User.Role.WORKER}
        if value not in allowed:
            raise serializers.ValidationError(
                'Employees may only be MANAGER or WORKER.'
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        farm = self.context['request'].user.farm
        user = User(**validated_data, farm=farm)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RegisterFarmSerializer(serializers.Serializer):
    """
    Public onboarding: create a Farm + its OWNER in one transaction.

    Used by thesis demos / self-service signup (SuperAdmin can also seed).
    """

    farm_name = serializers.CharField(max_length=255)
    plan = serializers.ChoiceField(
        choices=Farm.Plan.choices,
        default=Farm.Plan.BASIC,
        help_text='Subscription package selected at registration.',
    )
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_plan(self, value):
        if value not in Farm.PLAN_DEFAULT_PRICES:
            raise serializers.ValidationError('Invalid subscription plan.')
        return value

    def validate_farm_name(self, value):
        if Farm.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError('A farm with this name already exists.')
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def create(self, validated_data):
        from django.db import transaction

        plan = validated_data.pop('plan', Farm.Plan.BASIC)

        with transaction.atomic():
            farm = Farm(name=validated_data['farm_name'], plan=plan, currency='EUR')
            farm.apply_plan_defaults()
            farm.save()
            owner = User(
                username=validated_data['username'],
                email=validated_data['email'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                role=User.Role.OWNER,
                farm=farm,
            )
            owner.set_password(validated_data['password'])
            owner.save()
        return {'farm': farm, 'owner': owner}
