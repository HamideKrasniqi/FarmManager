"""Authentication and employee management endpoints."""

from django.contrib.auth import get_user_model
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.accounts.permissions import FarmIsActive, IsFarmOwner, IsOwnerOrManager
from apps.accounts.serializers import (
    EmployeeSerializer,
    RegisterFarmSerializer,
    UserSerializer,
)
from apps.accounts.tokens import FarmAwareTokenObtainPairSerializer

User = get_user_model()


class LoginView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/

    Returns access + refresh JWT plus embedded user profile.
    Rejects users whose farm is SUSPENDED.
    """

    serializer_class = FarmAwareTokenObtainPairSerializer


class MeView(APIView):
    """GET /api/v1/auth/me/ — current user profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class RegisterFarmView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/

    Self-service farm onboarding (creates Farm + Owner).
    """

    permission_classes = [AllowAny]
    serializer_class = RegisterFarmSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(
            {
                'message': 'Farm registered successfully.',
                'farm': {
                    'id': result['farm'].id,
                    'name': result['farm'].name,
                    'status': result['farm'].status,
                    'plan': result['farm'].plan,
                    'monthly_price': str(result['farm'].monthly_price),
                    'currency': result['farm'].currency,
                },
                'owner': UserSerializer(result['owner']).data,
            },
            status=status.HTTP_201_CREATED,
        )


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    Employee management with split permissions:
    - Owner: full CRUD for Managers/Workers
    - Manager: read-only list (+ /workers) for task assignment dropdowns
    """

    serializer_class = EmployeeSerializer
    search_fields = ('username', 'email', 'first_name', 'last_name')
    filterset_fields = ('role', 'is_active')

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'workers'):
            return [IsAuthenticated(), IsOwnerOrManager(), FarmIsActive()]
        return [IsAuthenticated(), IsFarmOwner(), FarmIsActive()]

    def get_queryset(self):
        return User.objects.filter(
            farm=self.request.user.farm,
            role__in=[User.Role.MANAGER, User.Role.WORKER],
        )

    @action(detail=False, methods=['get'])
    def workers(self, request):
        """Shortcut: list active workers (for task assignment dropdowns)."""
        qs = self.get_queryset().filter(role=User.Role.WORKER, is_active=True)
        return Response(EmployeeSerializer(qs, many=True).data)
