# Generated by Django 3.1.4 on 2020-12-20 19:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_auto_20201212_0024'),
        ('orders', '0004_auto_20201213_2156'),
    ]

    operations = [
        migrations.AlterField(
            model_name='supplierorderitem',
            name='product',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='supplier_orders_items', to='products.product'),
        ),
    ]