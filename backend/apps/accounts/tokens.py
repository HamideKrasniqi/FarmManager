"""
Custom JWT serializer that embeds role/farm claims and blocks suspended farms.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class FarmAwareTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extend SimpleJWT to attach useful claims and enforce farm status."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['farm_id'] = user.farm_id
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Suspended tenants cannot obtain tokens
        if user.farm_id and user.farm.status == 'SUSPENDED':
            raise serializers.ValidationError(
                'This farm account has been suspended. Contact the platform administrator.'
            )

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'farm': user.farm_id,
            'farm_name': user.farm.name if user.farm_id else None,
            'farm_status': user.farm.status if user.farm_id else None,
        }
        return data
