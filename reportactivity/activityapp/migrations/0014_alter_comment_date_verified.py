# Generated by Django 4.0.2 on 2022-04-29 12:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activityapp', '0013_alter_activity_created_alter_activity_direction_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='date_verified',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Дата подтверждения'),
        ),
    ]
