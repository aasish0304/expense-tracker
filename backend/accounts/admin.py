from django.contrib import admin

from .models import UserSession


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "login_time",
        "last_activity",
        "expiry_time",
        "is_active",
    )

    list_filter = (
        "is_active",
        "login_time",
    )

    search_fields = (
        "user__email",
        "user__username",
    )

    readonly_fields = (
        "login_time",
        "last_activity",
    )