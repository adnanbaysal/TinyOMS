# Generated by Django 3.1.4 on 2020-12-05 18:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
        ('products', '0002_auto_20201205_2102'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('extra_field_values', models.JSONField(db_index=True)),
                ('unit_type', models.CharField(max_length=20)),
                ('amount', models.FloatField()),
                ('price_per_unit', models.FloatField()),
                ('price_currency', models.CharField(max_length=10)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='product_orders', to='products.product')),
                ('supplier', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='from_supplier_orders', to='users.supplier')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('extra_field_values', models.JSONField(db_index=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='to_client_orders', to='users.client')),
                ('order_items', models.ManyToManyField(related_name='order', to='orders.OrderItem')),
                ('seller', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='from_seller_orders', to='users.employee')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]