from decimal import Decimal

from django.db.models import Sum
from rest_framework import serializers

from .models import (
    Expense,
    Category,
    Budget,
    Goal,
)


# ============================================================
# CATEGORY
# ============================================================

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


# ============================================================
# EXPENSE
# ============================================================

class ExpenseSerializer(serializers.ModelSerializer):

    category = CategorySerializer(
        read_only=True
    )

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


# ============================================================
# BUDGET
# ============================================================

class BudgetSerializer(serializers.ModelSerializer):

    category = CategorySerializer(
        read_only=True
    )

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
    )

    spent = serializers.SerializerMethodField()

    percentage = serializers.SerializerMethodField()

    remaining = serializers.SerializerMethodField()

    status = serializers.SerializerMethodField()

    class Meta:

        model = Budget

        fields = [
            "id",
            "category",
            "category_id",
            "amount",
            "month",
            "year",
            "spent",
            "remaining",
            "percentage",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "spent",
            "remaining",
            "percentage",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate_amount(self, value):

        if value <= 0:

            raise serializers.ValidationError(
                "Budget amount must be greater than zero."
            )

        return value

    def validate_month(self, value):

        if value < 1 or value > 12:

            raise serializers.ValidationError(
                "Month must be between 1 and 12."
            )

        return value

    def validate(self, attrs):

        request = self.context.get("request")

        if (
            not request
            or not request.user.is_authenticated
        ):
            return attrs

        category = attrs.get(
            "category",
            getattr(
                self.instance,
                "category",
                None,
            ),
        )

        month = attrs.get(
            "month",
            getattr(
                self.instance,
                "month",
                None,
            ),
        )

        year = attrs.get(
            "year",
            getattr(
                self.instance,
                "year",
                None,
            ),
        )

        existing = Budget.objects.filter(
            user=request.user,
            category=category,
            month=month,
            year=year,
        )

        if self.instance:

            existing = existing.exclude(
                pk=self.instance.pk
            )

        if existing.exists():

            raise serializers.ValidationError(
                {
                    "category_id":
                    "A budget already exists for this category and month."
                }
            )

        return attrs

    def _get_spent(self, obj):

        total = Expense.objects.filter(
            user=obj.user,
            category=obj.category,
            date__year=obj.year,
            date__month=obj.month,
        ).aggregate(
            total=Sum("amount")
        )["total"]

        return total or Decimal("0.00")

    def get_spent(self, obj):

        return self._get_spent(obj)

    def get_remaining(self, obj):

        spent = self._get_spent(obj)

        remaining = obj.amount - spent

        return max(
            remaining,
            Decimal("0.00"),
        )

    def get_percentage(self, obj):

        spent = self._get_spent(obj)

        if obj.amount <= 0:
            return 0

        percentage = (
            spent / obj.amount
        ) * Decimal("100")

        return round(
            float(percentage),
            2,
        )

    def get_status(self, obj):

        spent = self._get_spent(obj)

        if spent > obj.amount:
            return "Exceeded"

        if spent >= obj.amount * Decimal("0.8"):
            return "Warning"

        return "Healthy"


# ============================================================
# GOAL
# ============================================================

class GoalSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        required=False,
        allow_null=True,
    )
    progress_percentage = serializers.ReadOnlyField()

    class Meta:

        model = Goal

        fields = [
            "id",
            "name",
            "target_amount",
            "current_amount",
            "target_date",
            "description",
            "image",
            "progress_percentage",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "progress_percentage",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Goal name cannot be empty."
            )

        return value

    def validate_target_amount(self, value):

        if value <= 0:

            raise serializers.ValidationError(
                "Target amount must be greater than zero."
            )

        return value

    def validate_current_amount(self, value):

        if value < 0:

            raise serializers.ValidationError(
                "Current amount cannot be negative."
            )

        return value

    def validate(self, attrs):

        target_amount = attrs.get(
            "target_amount",
            getattr(
                self.instance,
                "target_amount",
                None,
            ),
        )

        current_amount = attrs.get(
            "current_amount",
            getattr(
                self.instance,
                "current_amount",
                Decimal("0.00"),
            ),
        )

        if (
            target_amount is not None
            and current_amount is not None
            and current_amount > target_amount
        ):

            raise serializers.ValidationError(
                {
                    "current_amount":
                    "Current amount cannot be greater than the target amount."
                }
            )

        return attrs