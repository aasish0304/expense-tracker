from rest_framework import serializers
from .models import Expense, Category


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
        ]

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Category name cannot be empty."
            )

        return value


class ExpenseSerializer(serializers.ModelSerializer):

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
    )

    class Meta:
        model = Expense

        fields = [
            "id",
            "amount",
            "category",
            "category_id",
            "expense_type",
            "payment_method",
            "date",
            "story",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )

        return value

    def validate_story(self, value):

        return value.strip()