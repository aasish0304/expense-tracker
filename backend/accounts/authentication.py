from django.utils import timezone

from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import UserSession


class SessionJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):
        result = super().authenticate(request)

        if result is None:
            return None

        user, validated_token = result

        authorization = request.headers.get("Authorization", "")

        if not authorization.startswith("Bearer "):
            raise AuthenticationFailed(
                "Authorization header is invalid."
            )

        token_string = authorization.split(" ", 1)[1]

        try:
            session = UserSession.objects.get(
                token=token_string,
                user=user,
            )
        except UserSession.DoesNotExist:
            raise AuthenticationFailed(
                "Session not found."
            )

        if not session.is_active:
            raise AuthenticationFailed(
                "Session is inactive."
            )

        if session.expiry_time <= timezone.now():
            session.is_active = False
            session.save(update_fields=["is_active"])

            raise AuthenticationFailed(
                "Session has expired."
            )

        session.last_activity = timezone.now()
        session.save(update_fields=["last_activity"])

        return user, validated_token