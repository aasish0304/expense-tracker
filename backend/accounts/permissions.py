from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Allows access only to users who belong to
    the Admin group or are Django superusers.
    """

    message = "Admin permission required."

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        # Django superuser is always treated as Admin
        if request.user.is_superuser:
            return True

        # Admin group
        return request.user.groups.filter(
            name="Admin"
        ).exists()