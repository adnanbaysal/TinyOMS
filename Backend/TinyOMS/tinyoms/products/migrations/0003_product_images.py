# Generated by Django 3.1.4 on 2020-12-05 19:49

import django.contrib.postgres.fields
from django.db import migrations, models
import products.models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_auto_20201205_2102'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='images',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.ImageField(default='default.png', upload_to=products.models.get_product_file_path), null=True, size=10),
        ),
    ]