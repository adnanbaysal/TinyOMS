# Generated by Django 3.1.4 on 2020-12-07 18:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('generics', '0008_auto_20201207_2117'),
    ]

    operations = [
        migrations.AlterField(
            model_name='extrafieldattributes',
            name='field_name',
            field=models.CharField(default='key', max_length=8),
        ),
    ]
