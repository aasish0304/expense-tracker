from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):

    name = models.CharField(
        max_length=50,
        unique=True,
    )

    def __str__(self):
        return self.name


class Expense(models.Model):

    EXPENSE_TYPE_CHOICES = [
        ("Need", "Need"),
        ("Want", "Want"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("UPI", "UPI"),
        ("Cash", "Cash"),
        ("Card", "Card"),
        ("Bank", "Bank"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="expenses",
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="expenses",
        null=True,
        blank=True,
    )

    expense_type = models.CharField(
        max_length=10,
        choices=EXPENSE_TYPE_CHOICES,
        default="Need",
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default="UPI",
    )

    date = models.DateField()

    story = models.CharField(
        max_length=255,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        category_name = self.category.name if self.category else "No Category"

        return f"{self.user.email} - ₹{self.amount} - {category_name}"