from rest_framework.permissions import BasePermission


class OnlyPatch(BasePermission):
    """Permission to check the request method is PATCH."""

    def has_permission(self, request, view):
        if request.method == "PATCH":
            return True
        else:
            return False


class PreventUpdate(BasePermission):
    """Permission to check the request method is NOT PUT or PATCH."""

    def has_permission(self, request, view):
        if request.method in ["PUT", "PATCH"]:
            return False
        else:
            return True


class IsStaffOrReadOnly(BasePermission):
    """
    Permission to check whether request made by a staff user or not.
    But if the request method is GET, allow anyway.
    Always use with permissions.IsAuthenticated!
    """

    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        elif request.method == "GET":
            return True
        else:
            return False


class IsSuperuserOrReadOnly(BasePermission):
    """
    Permission to check whether request made by a staff user or not.
    But if the request method is GET, allow anyway.
    Always use with permissions.IsAuthenticated!
    """

    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        elif request.method == "GET":
            return True
        else:
            return False


class StaffOnly(BasePermission):
    """
    Permission to check whether request made by a staff user or not.
    Always use with permissions.IsAuthenticated!
    """

    def has_permission(self, request, view):
        return request.user.is_staff


class StaffSuperUserOnly(BasePermission):
    """
    Permission to check whether request made by a staff superuser or not.
    Always use with permissions.IsAuthenticated!
    """

    def has_permission(self, request, view):
        return request.user.is_staff and request.user.is_superuser
