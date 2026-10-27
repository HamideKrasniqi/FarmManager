"""
Role-Based Access Control (RBAC) permission classes.

Usage in ViewSets
-----------------
permission_classes = [IsAuthenticated, IsFarmOwner | IsManager]
or compose with rest_framework.permissions.OR / AND helpers.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSuperAdmin(BasePermission):
    """Platform owner — manage all farms and global metrics."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superadmin
        )


class IsFarmOwner(BasePermission):
    """Farm owner — full access to their own tenant data."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_owner
            and request.user.farm_id is not None
        )


class IsManager(BasePermission):
    """Farm manager — operations without sensitive financial data."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_manager
            and request.user.farm_id is not None
        )


class IsWorker(BasePermission):
    """Farm worker — assigned tasks only."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_worker
            and request.user.farm_id is not None
        )


class IsOwnerOrManager(BasePermission):
    """Combined: Owner OR Manager (operations + task verification)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_farm_staff
            and request.user.farm_id is not None
        )


class IsOwnerOrReadOnly(BasePermission):
    """Owner can mutate; Manager/Worker may only read (where applicable)."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return request.user.farm_id is not None or request.user.is_superadmin
        return request.user.is_owner


class IsFarmMember(BasePermission):
    """Any authenticated user belonging to a farm (not SuperAdmin)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.farm_id is not None
            and not request.user.is_superadmin
        )


class FarmIsActive(BasePermission):
    """
    Block suspended tenants from mutating data.

    SuperAdmins are exempt (they manage suspensions).
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superadmin:
            return True
        if user.farm_id is None:
            return False
        # Lazy-safe: farm may be prefetched; avoid N+1 by checking status attr
        return user.farm.status == 'ACTIVE'
