from django.urls import path

from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    CategoryListCreateView,
    CategoryDetailView,
    BudgetListCreateView,
    BudgetDetailView,
    GoalListCreateView,
    GoalDetailView,
)


urlpatterns = [

    # ========================================================
    # EXPENSES
    # ========================================================

    path(
        "",
        ExpenseListCreateView.as_view(),
        name="expense-list-create",
    ),

    path(
        "<int:pk>/",
        ExpenseDetailView.as_view(),
        name="expense-detail",
    ),


    # ========================================================
    # CATEGORIES
    # ========================================================

    path(
        "categories/",
        CategoryListCreateView.as_view(),
        name="category-list-create",
    ),

    path(
        "categories/<int:pk>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),


    # ========================================================
    # BUDGETS
    # ========================================================

    path(
        "budgets/",
        BudgetListCreateView.as_view(),
        name="budget-list-create",
    ),

    path(
        "budgets/<int:pk>/",
        BudgetDetailView.as_view(),
        name="budget-detail",
    ),


    # ========================================================
    # GOALS
    # ========================================================

    path(
        "goals/",
        GoalListCreateView.as_view(),
        name="goal-list-create",
    ),

    path(
        "goals/<int:pk>/",
        GoalDetailView.as_view(),
        name="goal-detail",
    ),
]