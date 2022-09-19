from django.urls import include, path
from rest_framework import routers


from .views import (UsersViewSet,

                    InstallApiView,
                    IndexApiView,
                    AppUnistallApiView,
                    ActivityApiView,
                    CallsApiView,
                    UsersApiView,
                    CallingPlanViewSet,
                    CountWorkingDaysViewSet,

                    ProductionCalendarViewSet,
                    CallsPlanViewSet,

                    RationActiveByMonthApiView,
                    RationActiveByDayApiView,
                    )


app_name = 'api_v1'


router = routers.DefaultRouter()
router.register(r'users', UsersViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('install/', InstallApiView.as_view()),
    path('index/', IndexApiView.as_view()),
    path('app-uninstall/', AppUnistallApiView.as_view()),
    path('create-update-activity/', ActivityApiView.as_view()),
    path('create-update-calls/', CallsApiView.as_view()),
    path('create-user/', UsersApiView.as_view()),

    path('calling-plan/', CallingPlanViewSet.as_view()),
    path('count-working-days/', CountWorkingDaysViewSet.as_view()),

    path('production-calendar/', ProductionCalendarViewSet.as_view()),
    path('calls-plan/', CallsPlanViewSet.as_view()),

    path('active-by-month/', RationActiveByMonthApiView.as_view()),
    path('active-by-day/', RationActiveByDayApiView.as_view()),

]


urlpatterns += router.urls



