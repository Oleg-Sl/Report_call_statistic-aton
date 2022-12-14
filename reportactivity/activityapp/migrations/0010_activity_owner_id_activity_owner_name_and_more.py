# Generated by Django 4.0.2 on 2022-03-26 06:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activityapp', '0009_comment_date_comment_add_alter_comment_date_comment'),
    ]

    operations = [
        migrations.AddField(
            model_name='activity',
            name='OWNER_ID',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='ID сущности к которой привязан звонок'),
        ),
        migrations.AddField(
            model_name='activity',
            name='OWNER_NAME',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Название сущности к которой привязан звонок'),
        ),
        migrations.AddField(
            model_name='activity',
            name='OWNER_TYPE_ID',
            field=models.CharField(blank=True, choices=[('1', 'Лид'), ('2', 'Сделка'), ('3', 'Контакт'), ('4', 'Компания')], max_length=1, null=True, verbose_name='Тип сущности к которой привязан звонок'),
        ),
    ]
