from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Expense, Category, Budget
from .serializers import (
    ExpenseSerializer,
    CategorySerializer,
    BudgetSerializer,
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
        )

        current_date = timezone.localdate()

        view = self.request.query_params.get(
            "view",
            "active"
        )

        # ====================================================
        # ACTIVE BUDGETS
        # ====================================================
        # Active Budgets always shows the current month.
        #
        # Example:
        # Current month = August 2026
        # Active = August 2026 budgets
        # ====================================================

        if view == "active":

            queryset = queryset.filter(
                month=current_date.month,
                year=current_date.year,
            )

        # ====================================================
        # BUDGET HISTORY
        # ====================================================
        # History returns ALL budgets.
        #
        # The frontend can then filter:
        # Year -> Month -> Category -> Sort
        #
        # IMPORTANT:
        # Do NOT exclude the current month here.
        # This allows:
        #
        # History -> 2026 -> August
        #
        # to show the same August budgets currently visible
        # under Active Budgets.
        # ====================================================

        elif view == "history":

            queryset = queryset

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
            year=current_date.year
        )


# ============================================================
# BUDGET DETAIL
# ============================================================

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