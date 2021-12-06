# Generated by Django 3.1.4 on 2020-12-17 20:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('orders', '0004_auto_20201213_2156'),
        ('payments', '0006_auto_20201215_2328'),
    ]

    operations = [
        migrations.CreateModel(
            name='Installment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('extra_field_values', models.JSONField(db_index=True)),
                ('pay_before', models.DateTimeField()),
                ('currency', models.CharField(max_length=10)),
                ('amount', models.FloatField()),
                ('remind_at', models.DateTimeField(default=None, null=True)),
                ('paid_at', models.DateTimeField(default=None, null=True)),
                ('order', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='installments', to='orders.order')),
                ('payer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='installments', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('extra_field_values', models.JSONField(db_index=True)),
                ('currency', models.CharField(max_length=10)),
                ('amount', models.FloatField()),
                ('from_user', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sent_payments', to=settings.AUTH_USER_MODEL)),
                ('installment', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='installment_payments', to='payments.installment')),
                ('order', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='order_payments', to='orders.order')),
                ('to_user', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='received_payments', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.RemoveField(
            model_name='genericpayment',
            name='from_user',
        ),
        migrations.RemoveField(
            model_name='genericpayment',
            name='generic_installment',
        ),
        migrations.RemoveField(
            model_name='genericpayment',
            name='to_user',
        ),
        migrations.RemoveField(
            model_name='orderinstallment',
            name='order',
        ),
        migrations.RemoveField(
            model_name='orderpayment',
            name='from_user',
        ),
        migrations.RemoveField(
            model_name='orderpayment',
            name='order',
        ),
        migrations.RemoveField(
            model_name='orderpayment',
            name='order_installment',
        ),
        migrations.RemoveField(
            model_name='orderpayment',
            name='to_user',
        ),
        migrations.DeleteModel(
            name='GenericInstallment',
        ),
        migrations.DeleteModel(
            name='GenericPayment',
        ),
        migrations.DeleteModel(
            name='OrderInstallment',
        ),
        migrations.DeleteModel(
            name='OrderPayment',
        ),
    ]