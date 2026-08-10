from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import (
    urlsafe_base64_encode,
    urlsafe_base64_decode,
)
from django.utils.encoding import force_bytes, force_str

from .serializers import RegisterSerializer, LoginSerializer


class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "User registered successfully"
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            return Response(
                {
                    "message": "Login successful"
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
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
                    "message": "No account found with this email."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        token = PasswordResetTokenGenerator().make_token(user)

        uid = urlsafe_base64_encode(force_bytes(user.pk))

        reset_link = (
            f"http://localhost:5173/reset-password?uid={uid}&token={token}"
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
                    "message": "Passwords do not match"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

        except Exception:

            return Response(
                {
                    "message": "Invalid reset link."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not PasswordResetTokenGenerator().check_token(user, token):

            return Response(
                {
                    "message": "Reset link has expired or is invalid."
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