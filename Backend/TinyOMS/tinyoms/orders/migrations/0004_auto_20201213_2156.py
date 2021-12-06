# Generated by Django 3.1.4 on 2020-12-13 18:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_auto_20201212_0024'),
        ('orders', '0003_auto_20201212_1812'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='orderitem',
            name='product',
        ),
        migrations.RemoveField(
            model_name='orderitem',
            name='unit_type',
        ),
        migrations.AddField(
            model_name='supplierorderitem',
            name='product',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='product_orders', to='products.product'),
        ),
        migrations.AddField(
            model_name='supplierorderitem',
            name='unit_type',
            field=models.CharField(default=None, max_length=20, null=True),
        ),
    ]