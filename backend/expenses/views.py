from django.db.models import Q, Sum, F, Value, DecimalField
from django.db.models.functions import Coalesce
from django.utils import timezone

from rest_framework import generics
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
    JSONParser,
)
from rest_framework.permissions import IsAuthenticated

from .models import (
    Expense,
    Category,
    Budget,
    Goal,
)

from .serializers import (
    ExpenseSerializer,
    CategorySerializer,
    BudgetSerializer,
    GoalSerializer,
)


# ============================================================
# EXPENSES
# ============================================================

class ExpenseListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = ExpenseSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Expense.objects.filter(
            user=self.request.user
        ).select_related(
            "category"
        ).order_by(
            "-date",
            "-created_at"
        )

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


class ExpenseDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = ExpenseSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Expense.objects.filter(
            user=self.request.user
        )


# ============================================================
# CATEGORY
# ============================================================

class CategoryListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = CategorySerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Category.objects.all().order_by(
            "name"
        )


class CategoryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = CategorySerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Category.objects.all()


# ============================================================
# BUDGETS
# ============================================================

class BudgetListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = BudgetSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        queryset = Budget.objects.filter(
            user=self.request.user
        ).select_related(
            "category"
        ).annotate(
            spent_amount=Coalesce(
                Sum(
                    "category__expenses__amount",
                    filter=Q(
                        category__expenses__user=F("user"),
                        category__expenses__date__year=F("year"),
                        category__expenses__date__month=F("month"),
                    ),
                ),
                Value(
                    0,
                    output_field=DecimalField(
                        max_digits=12,
                        decimal_places=2,
                    ),
                ),
            )
        )

        current_date = timezone.localdate()

        view = self.request.query_params.get(
            "view",
            "active"
        )

        if view == "active":

            queryset = queryset.filter(
                month=current_date.month,
                year=current_date.year,
            )

        elif view == "history":

            pass

        return queryset.order_by(
            "-year",
            "-month",
            "category__name"
        )

    def perform_create(self, serializer):

        current_date = timezone.localdate()

        serializer.save(
            user=self.request.user,
            month=current_date.month,
            year=current_date.year,
        )


class BudgetDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = BudgetSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Budget.objects.filter(
            user=self.request.user
        ).select_related(
            "category"
        )


# ============================================================
# GOALS
# ============================================================

class GoalListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = GoalSerializer

    permission_classes = [
        IsAuthenticated
    ]

    # Allow JSON requests as well as image/file uploads.
    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def get_queryset(self):

        return Goal.objects.filter(
            user=self.request.user
        ).order_by(
            "target_date",
            "-created_at",
        )

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


class GoalDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = GoalSerializer

    permission_classes = [
        IsAuthenticated
    ]

    # Important for PATCH/PUT requests containing an image.
    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def get_queryset(self):

        return Goal.objects.filter(
            user=self.request.user
        )