"""
Reusable mixins for multi-tenant QuerySet isolation.

SOLID — Single Responsibility: this mixin only enforces farm scoping.
ViewSets compose it instead of duplicating filter logic.
"""

from rest_framework.exceptions import PermissionDenied


class TenantQuerysetMixin:
    """
    Filter querysets by `request.user.farm`.

    - SuperAdmin: sees everything (optional `farm` query param to scope).
    - Farm users: strictly limited to their farm_id.
    - Automatically stamps `farm` on create.
    """

    farm_field = 'farm'

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if not user.is_authenticated:
            return qs.none()

        if user.is_superadmin:
            farm_id = self.request.query_params.get('farm')
            if farm_id:
                return qs.filter(**{f'{self.farm_field}_id': farm_id})
            return qs

        if user.farm_id is None:
            return qs.none()

        return qs.filter(**{f'{self.farm_field}_id': user.farm_id})

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_superadmin:
            # SuperAdmin must explicitly pass farm in the payload
            if self.farm_field not in serializer.validated_data:
                raise PermissionDenied('SuperAdmin must specify a farm.')
            serializer.save()
            return

        if user.farm_id is None:
            raise PermissionDenied('User is not assigned to a farm.')

        if user.farm.status != 'ACTIVE':
            raise PermissionDenied('Farm account is suspended.')

        serializer.save(**{self.farm_field: user.farm})
