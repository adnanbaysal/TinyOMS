# Generated by Django 3.1.4 on 2020-12-05 18:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='extra_field_values',
            field=models.JSONField(db_index=True),
        ),
    ]
