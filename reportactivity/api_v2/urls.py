from django.urls import include, path
from rest_framework import routers


from .views import (
    UsersViewSet,
    InstallApiView,
    IndexApiView,
    AppUnistallApiView,
    ActivityApiView,
    CallsApiView,
    Calls2ApiView,
    UsersApiView,
    Users2ApiView,
    CallingPlanViewSet,
    CountWorkingDaysViewSet,
    ProductionCalendarViewSet,
    CallsPlanViewSet,
    CallsPlanCompletedViewSet,
    RationActiveByMonthApiView,
    RationActiveByDayApiView,
    CommentViewSet,
)


app_name = 'api_v2'


router = routers.DefaultRouter()
router.register(r'users', UsersViewSet)
router.register(r'comment', CommentViewSet)
# router.register(r'plan-completed', CallsPlanCompletedViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('install/', InstallApiView.as_view()),                         # вызывается при установке приложения
    path('index/', IndexApiView.as_view()),                             # вызывается при открытии приложения
    path('app-uninstall/', AppUnistallApiView.as_view()),               # вызывается при удалении приложения

    path('create-update-activity/', ActivityApiView.as_view()),         # обработчик событий сущности - дело
    path('create-update-calls/', CallsApiView.as_view()),               # обработчик событий сущности - телефония
    path('create-update-calls-2/', Calls2ApiView.as_view()),            # обработчик событий сущности - телефония
    path('create-user/', UsersApiView.as_view()),                       # обработчик событий - добавление пользователя
    path('create-user-2/', Users2ApiView.as_view()),                    # обработчик событий - добавление пользователя

    path('calling-plan/', CallingPlanViewSet.as_view()),                # УСТАРЕЛ
    path('count-working-days/', CountWorkingDaysViewSet.as_view()),     # УСТАРЕЛ

    # Добавление и изменение производственного календаря
    # Метод: GET. Параметры: year - год, status - (week/work) тип дня
    # Метод: POST. Данные: date_calendar - календарная дата, status - (week/work) тип дня
    path('production-calendar/', ProductionCalendarViewSet.as_view()),
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




