# Generated by Django 4.0.2 on 2022-03-08 03:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activityapp', '0003_alter_callingplan_count_calls'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='ALLOWED_EDIT',
            field=models.BooleanField(default=False, verbose_name='Может редактировать план по звонкам и кол-во рабочих дней'),
        ),
        migrations.AddField(
            model_name='user',
            name='ALLOWED_SETTING',
            field=models.BooleanField(default=False, verbose_name='Может изменять настройки приложения'),
        ),
    ]
