from django.urls import path

from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    CategoryListCreateView,
    CategoryDetailView,
)


urlpatterns = [
    # Expense APIs

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

    # Category APIs

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
]