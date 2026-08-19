from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import (
    urlsafe_base64_decode,
    urlsafe_base64_encode,
)

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import AccessToken

from .models import UserSession
from .serializers import RegisterSerializer, LoginSerializer


class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "Account created successfully."
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.validated_data["user"]

            # Generate JWT access token
            access_token = AccessToken.for_user(user)

            # Session expires after 8 hours
            expiry_time = timezone.now() + timedelta(hours=8)

            # Create active user session
            UserSession.objects.create(
                user=user,
                token=str(access_token),
                expiry_time=expiry_time,
                is_active=True,
            )

            return Response(
                {
                    "message": "Login successful",
                    "access": str(access_token),
                },
                status=status.HTTP_200_OK
            )

        errors = serializer.errors

        # Email does not exist
        if "email" in errors:

            return Response(
                errors,
                status=status.HTTP_404_NOT_FOUND
            )

        # Password is incorrect
        return Response(
            errors,
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        authorization = request.headers.get("Authorization", "")

        if not authorization.startswith("Bearer "):
            return Response(
                {
                    "message": "Authorization token required."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token = authorization.split(" ", 1)[1]

        try:

            session = UserSession.objects.get(
                user=request.user,
                token=token,
                is_active=True,
            )

            session.is_active = False

            session.save(
                update_fields=["is_active"]
            )

            return Response(
                {
                    "message": "Logout successful."
                },
                status=status.HTTP_200_OK,
            )

        except UserSession.DoesNotExist:

            return Response(
                {
                    "message": "Active session not found."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )


class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response(
            {
                "username": request.user.username,
                "email": request.user.email,
            },
            status=status.HTTP_200_OK,
        )


class ForgotPasswordView(APIView):

    def post(self, request):

        email = request.data.get("email")

        try:

            user = User.objects.get(email=email)

        except User.DoesNotExist:

            return Response(
                {
                    "message": "Email not found. Please sign up for a Waku account."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        token = PasswordResetTokenGenerator().make_token(user)

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        reset_link = (
            f"http://localhost:5173/reset-password"
            f"?uid={uid}&token={token}"
        )

        send_mail(
            subject="Reset Your Waku Password",

            message=f"""Hello,

We received a request to reset your Waku password.

Click the link below to reset your password:

{reset_link}

If you did not request this, please ignore this email.

Regards,
Waku Team
""",

            from_email=settings.DEFAULT_FROM_EMAIL,

            recipient_list=[email],

            fail_silently=False,
        )

        return Response(
            {
                "message": "Password reset email sent successfully."
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):

    def post(self, request):

        uid = request.data.get("uid")
        token = request.data.get("token")

        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if password != confirm_password:

            return Response(
                {
                    "message": "Passwords do not match."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            user_id = force_str(
                urlsafe_base64_decode(uid)
            )

            user = User.objects.get(
                pk=user_id
            )

        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
        ):

            return Response(
                {
                    "message": "Invalid password reset link."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_generator = PasswordResetTokenGenerator()

        if not token_generator.check_token(
            user,
            token
        ):

            return Response(
                {
                    "message": "Invalid or expired password reset link."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)

        user.save()

        return Response(
            {
                "message": "Password reset successful."
            },
            status=status.HTTP_200_OK,
        )