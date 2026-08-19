from django.db import models
from django.contrib.auth.models import User


class UserSession(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user_sessions",
    )

    token = models.TextField()

    login_time = models.DateTimeField(
        auto_now_add=True
    )

    expiry_time = models.DateTimeField()

    last_activity = models.DateTimeField(
        auto_now=True
    )

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return f"{self.user.email} - {'Active' if self.is_active else 'Inactive'}"