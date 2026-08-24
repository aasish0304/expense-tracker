from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate

from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
        ]

    def validate_email(self, value):

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def create(self, validated_data):

        email = validated_data["email"]

        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
        )

        # -------------------------------------------------
        # Every newly registered account is a normal User
        # -------------------------------------------------

        user_group, created = Group.objects.get_or_create(
            name="User"
        )

        user.groups.add(user_group)

        return user


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, data):

        email = data["email"]
        password = data["password"]

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "email": (
                        "Email not found. "
                        "Please sign up for a Waku account."
                    )
                }
            )

        user = authenticate(
            username=user.username,
            password=password,
        )

        if not user:

            raise serializers.ValidationError(
                {
                    "password": "Incorrect password."
                }
            )

        data["user"] = user

        return data