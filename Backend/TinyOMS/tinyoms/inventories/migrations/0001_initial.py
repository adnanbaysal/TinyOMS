# Generated by Django 3.1.4 on 2020-12-05 18:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('products', '0002_auto_20201205_2102'),
    ]

    operations = [
        migrations.CreateModel(
            name='InventoryItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('extra_field_values', models.JSONField(db_index=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('unit_type', models.CharField(max_length=20)),
                ('amount', models.FloatField()),
                ('currency', models.CharField(max_length=10)),
                ('cost_per_unit', models.FloatField()),
                ('price_per_unit', models.FloatField()),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='product_inventories', to='products.product')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Inventory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('extra_field_values', models.JSONField(db_index=True)),
                ('items', models.ManyToManyField(related_name='inventories', to='inventories.InventoryItem')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
