from django.db import models
from django.contrib.auth.models import User


# ============================================================
# CATEGORY
# ============================================================

class Category(models.Model):

    name = models.CharField(
        max_length=50,
        unique=True,
    )

    def __str__(self):
        return self.name


# ============================================================
# EXPENSE
# ============================================================

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

        category_name = (
            self.category.name
            if self.category
            else "No Category"
        )

        return (
            f"{self.user.email} - "
            f"₹{self.amount} - "
            f"{category_name}"
        )


# ============================================================
# BUDGET
# ============================================================

class Budget(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="budgets",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="budgets",
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    month = models.PositiveSmallIntegerField()

    year = models.PositiveIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        ordering = [
            "-year",
            "-month",
            "category__name",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "category",
                    "month",
                    "year",
                ],
                name="unique_user_category_budget_month",
            )
        ]

    def __str__(self):

        return (
            f"{self.user.email} - "
            f"{self.category.name} - "
            f"{self.month}/{self.year} - "
            f"₹{self.amount}"
        )


# ============================================================
# GOAL
# ============================================================

class Goal(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="goals",
    )

    name = models.CharField(
        max_length=150,
    )

    target_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    current_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    target_date = models.DateField(
        null=True,
        blank=True,
    )

    description = models.TextField(
        blank=True,
        default="",
    )

    image = models.ImageField(
        upload_to="goal_images/",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        ordering = [
            "target_date",
            "-created_at",
        ]

    def __str__(self):

        return (
            f"{self.user.email} - "
            f"{self.name} - "
            f"₹{self.target_amount}"
        )

    @property
    def progress_percentage(self):

        if self.target_amount <= 0:
            return 0

        percentage = (
            float(self.current_amount)
            / float(self.target_amount)
        ) * 100

        return min(
            round(percentage, 2),
            100,
        )