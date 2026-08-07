from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

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

            return Response(
                {
                    "message": "Login successful"
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_401_UNAUTHORIZED
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

        return Response(
            {
                "message": f"Password reset link sent to {email}"
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):

    def post(self, request):

        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if password != confirm_password:

            return Response(
                {
                    "message": "Passwords do not match"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Password reset successful"
            },
            status=status.HTTP_200_OK,
        )