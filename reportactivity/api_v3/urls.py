from django.urls import include, path
from rest_framework import routers
from django.views.decorators.cache import cache_page

from .views import (
    UsersViewSet,
    InstallApiView,
    IndexApiView1,
    AppUnistallApiView,

    # обработчики событий Битрикс
    ActivityApiView,
    CallsApiView,
    UsersApiView,

    #
    CallsDataApiView,
    UsersDataApiView,

    ProductionCalendarViewSet,
    CallsPlanViewSet,
    CallsPlanCompletedViewSet,
    RationActiveByMonthApiView,
    RationActiveByDayApiView,
    CallsViewSet,
    CommentViewSet,
)


app_name = 'api_v3'


router = routers.DefaultRouter()
router.register(r'users', UsersViewSet)
router.register(r'calls', CallsViewSet)
router.register(r'comment', CommentViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('install/', InstallApiView.as_view()),                         # вызывается при установке приложения
    path('index/', IndexApiView1.as_view()),                             # вызывается при открытии приложения
    # path('trep/', IndexApiView1.as_view()),                             # вызывается при открытии приложения
    path('app-uninstall/', AppUnistallApiView.as_view()),               # вызывается при удалении приложения

    # события
    path('create-update-activity/', ActivityApiView.as_view()),         # обработчик событий сущности - дело
    path('create-update-calls/', CallsApiView.as_view()),               # обработчик событий сущности - телефония
    path('create-user/', UsersApiView.as_view()),                       # обработчик событий - добавление пользователя

    # сохранение сущностей звонков и пользователей
    path('create-update-calls-2/', CallsDataApiView.as_view()),         # сущность - звонок
    path('create-user-2/', UsersDataApiView.as_view()),                 # сущность - пользователь

    # Добавление и изменение производственного календаря
    # Метод: GET. Параметры: year - год, status - (week/work) тип дня
    # Метод: POST. Данные: date_calendar - календарная дата, status - (week/work) тип дня
    path('production-calendar/', ProductionCalendarViewSet.as_view()),

    # Добавление и изменение плана по звонкам
    # Метод: GET. Параметры: year - год
    # Метод: POST. Данные: calendar - дата: гггг-мм-дд, employee - ID работника, count_calls - количество звонков, all_month - обновить план на весь месяц или один день
    path('calls-plan/', CallsPlanViewSet.as_view()),


    path('plan-completed/', CallsPlanCompletedViewSet.as_view()),


    # Получение данных статистики за год сгруппированные по месяцам
    # Метод: POST
    # Данные: depart - id подразделения, year - год, duration - минимальная длительность для учета в статистике
    path('active-by-month/', RationActiveByMonthApiView.as_view()),

    # Получение данных статистики за месяц сгруппированные по дням
    # Метод: POST
    # Данные: depart - id подразделения, year - год, month - нмер месяца, duration - миним. длит. для учета в статистике
    path('active-by-day/', RationActiveByDayApiView.as_view()),

]


urlpatterns += router.urls



