from django.urls import path

from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    CategoryListCreateView,
    CategoryDetailView,
    BudgetListCreateView,
    BudgetDetailView,
)


urlpatterns = [

    # =====================================================
    # EXPENSE APIs
    # =====================================================

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


    # =====================================================
    # CATEGORY APIs
    # =====================================================

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


    # =====================================================
    # BUDGET APIs
    # =====================================================

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
]