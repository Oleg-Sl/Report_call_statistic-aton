import os
from celery import Celery	                # импорт класса Celery из пакета celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reportactivity.settings') 	    # связывание переменной среды Celery под названием DJANGO_SETTINGS_MODULE с модулем настроек проекта Django

celery_app = Celery('reportactivity')		                                        # создание экземпляра класса Celery
celery_app.config_from_object('django.conf:settings', namespace='CELERY')	    # обновление конфигурации приложения Celery настройками, добавленные в файл настроек проекта Django, идентифицируемые префиксом CELERY_
# app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
celery_app.autodiscover_tasks()		                                            # экземпляр celery_app запускается для автоматического обнаружения задач в проекте
