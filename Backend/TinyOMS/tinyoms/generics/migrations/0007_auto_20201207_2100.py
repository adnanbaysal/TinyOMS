# Generated by Django 3.1.4 on 2020-12-07 18:00

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('generics', '0006_auto_20201206_1904'),
    ]

    operations = [
        migrations.AddField(
            model_name='extrafieldattributes',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='extrafieldattributes',
            name='field_name',
            field=models.CharField(default='key', max_length=40),
        ),
    ]
