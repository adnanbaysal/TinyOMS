# Generated by Django 3.1.4 on 2020-12-06 14:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('generics', '0004_auto_20201206_1651'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='extrafieldattributes',
            unique_together={('model_name', 'field_name')},
        ),
    ]