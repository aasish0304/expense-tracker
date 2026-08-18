from django.db import migrations, models
import django.db.models.deletion


def migrate_categories(apps, schema_editor):
    Category = apps.get_model("expenses", "Category")
    Expense = apps.get_model("expenses", "Expense")

    for expense in Expense.objects.all():
        if expense.category:
            category, created = Category.objects.get_or_create(
                name=expense.category
            )

            expense.category_new_id = category.id
            expense.save(update_fields=["category_new"])


class Migration(migrations.Migration):

    dependencies = [
        ("expenses", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Category",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        max_length=50,
                        unique=True,
                    ),
                ),
            ],
        ),

        migrations.AddField(
            model_name="expense",
            name="category_new",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="expenses",
                to="expenses.category",
            ),
        ),

        migrations.RunPython(
            migrate_categories,
            migrations.RunPython.noop,
        ),

        migrations.RemoveField(
            model_name="expense",
            name="category",
        ),

        migrations.RenameField(
            model_name="expense",
            old_name="category_new",
            new_name="category",
        ),
    ]