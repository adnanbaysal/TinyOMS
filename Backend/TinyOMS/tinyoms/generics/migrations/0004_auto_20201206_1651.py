# Generated by Django 3.1.4 on 2020-12-06 13:51

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('generics', '0003_extrafieldattributes_field_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='extrafieldattributes',
            name='choices',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=100), default=None, null=True, size=30),
        ),
    ]
