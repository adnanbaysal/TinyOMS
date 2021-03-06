# Generated by Django 3.1.4 on 2020-12-14 18:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0002_auto_20201213_2356'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='orderinstallmentpayment',
            name='from_user',
        ),
        migrations.RemoveField(
            model_name='orderinstallmentpayment',
            name='order_installment',
        ),
        migrations.RemoveField(
            model_name='orderinstallmentpayment',
            name='to_user',
        ),
        migrations.AddField(
            model_name='genericpayment',
            name='generic_installment',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='installment_payment', to='payments.genericinstallment'),
        ),
        migrations.AddField(
            model_name='orderpayment',
            name='order_installment',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='installment_payment', to='payments.orderinstallment'),
        ),
        migrations.DeleteModel(
            name='GenericInstallmentPayment',
        ),
        migrations.DeleteModel(
            name='OrderInstallmentPayment',
        ),
    ]
