from rest_framework import views, viewsets, filters, status, mixins, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import render
from django.views.decorators.clickjacking import xframe_options_exempt
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend

from django_filters import rest_framework as filters_drf


from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

import os
import logging
import json
import time
import datetime
import calendar
from collections import Counter

from .tasks import activity_task, calls_task, user_task

handler = logging.handlers.TimedRotatingFileHandler('./logs/error.log', when='D', interval=1, encoding="cp1251", backupCount=15)
logger_formatter = logging.Formatter(fmt='[%(asctime)s] %(levelname).1s %(message)s', datefmt='%Y.%m.%d %H:%M:%S')
handler.setFormatter(logger_formatter)
logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)
logger.addHandler(handler)

logger_error = logging.getLogger('success')
logger_error.setLevel(logging.INFO)
fh_success = logging.handlers.TimedRotatingFileHandler('./logs/success.log', when='D', interval=1, encoding="cp1251", backupCount=15)
formatter = logging.Formatter('[%(asctime)s] %(levelname).1s %(message)s')
fh_success.setFormatter(formatter)
logger_error.addHandler(fh_success)

# логгер входные данные событий от Битрикс
logger_tasks_access = logging.getLogger('tasks_access')
logger_tasks_access.setLevel(logging.INFO)
fh_tasks_access = logging.handlers.TimedRotatingFileHandler('./logs/tasks/access.log', when='D', interval=1, backupCount=15)
formatter_tasks_access = logging.Formatter('[%(asctime)s] %(levelname).1s %(message)s')
fh_tasks_access.setFormatter(formatter_tasks_access)
logger_tasks_access.addHandler(fh_tasks_access)


from . import service, bitrix24
from . import filters as my_filters

from activityapp.models import (
    Activity,
    Phone,
    User,
    ProductionCalendar,
    CallsPlan,
    Comment,
)

from .serializers import (
    ActivityFullSerializer,
    ActivitySerializer,
    CallsSerializer,
    UsersUpdateSerializer,
    UsersSerializer,
    ProductionCalendarSerializer,
    CallsPlanSerializer,
    CommentSerializer,
)


CASH_TIMMEOUT = 60 * 60 * 4


# @cache_page(60 * 60 * 4)
class UsersDataFilter(filters_drf.FilterSet):
    class Meta:
        model = User
        fields = ["UF_DEPARTMENT", "ALLOWED_EDIT", "ALLOWED_SETTING", ]


# @cache_page(60 * 60 * 4)
class UsersViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(ACTIVE=True).order_by("LAST_NAME", "NAME")
    serializer_class = UsersUpdateSerializer
    filter_backends = [filters_drf.DjangoFilterBackend]
    filterset_class = UsersDataFilter
    permission_classes = [IsAuthenticated]

    # @method_decorator(cache_page(60 * 2))
    @method_decorator(cache_page(CASH_TIMMEOUT))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


# Обработчик установки приложения
class InstallApiView(views.APIView):
    permission_classes = [AllowAny]

    @xframe_options_exempt
    def post(self, request):
        data = {
            "domain": request.query_params.get("DOMAIN", "bits24.bitrix24.ru"),
            "auth_token": request.data.get("AUTH_ID", ""),
            "expires_in": request.data.get("AUTH_EXPIRES", 3600),
            "refresh_token": request.data.get("REFRESH_ID", ""),
            "application_token": request.data.get("APP_SID", ""),
            # используется для проверки достоверности событий Битрикс24
            'client_endpoint': f'https://{request.query_params.get("DOMAIN", "bits24.bitrix24.ru")}/rest/',
        }
        service.write_app_data_to_file(data)
        return render(request, 'install.html')


# Обработчик установленного приложения
class IndexApiView1(views.APIView):
    permission_classes = [AllowAny]

    @xframe_options_exempt
    def post(self, request):
        return render(request, 'indexqwerty.html')


# Обработчик удаления приложения
class AppUnistallApiView(views.APIView):
    permission_classes = [AllowAny]

    @xframe_options_exempt
    def post(self, request):
        return Response(status.HTTP_200_OK)


# Обработчик создания, изменения, удаления дела
class ActivityApiView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger_tasks_access.info(request.data)
        event = request.data.get("event", "")

        id_activity = request.data.get("data[FIELDS][ID]", None)
        if not id_activity:
            return Response("Not transferred ID activity", status=status.HTTP_400_BAD_REQUEST)

        application_token = request.data.get("auth[application_token]", None)
        app_sid = service.get_app_sid()
        if application_token != app_sid:
            return Response("Unverified event source", status=status.HTTP_400_BAD_REQUEST)

        task = activity_task.delay(id_activity, event)
        return Response("OK", status=status.HTTP_200_OK)


# Обработчик завершения звонка
class CallsApiView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger_tasks_access.info(request.data)
        application_token = request.data.get("auth[application_token]", None)
        app_sid = service.get_app_sid()
        if application_token != app_sid:
            return Response("Unverified event source", status=status.HTTP_400_BAD_REQUEST)

        task = calls_task.delay(request.data)
        return Response("OK", status=status.HTTP_200_OK)


# Обработчик завершения звонка
class CallsDataApiView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        application_token = request.data.get("auth[application_token]", None)
        app_sid = service.get_app_sid()

        # if application_token != app_sid:
        #     return Response("Unverified event source", status=status.HTTP_400_BAD_REQUEST)

        event = request.data.get("event", "")

        if not request.data.get("CALL_ID", None):
            return Response("Not transferred ID call", status=status.HTTP_400_BAD_REQUEST)
        if not request.data.get("CALL_TYPE", None):
            return Response("Missing call type", status=status.HTTP_400_BAD_REQUEST)
        if not request.data.get("PORTAL_USER_ID", None):
            return Response("Missing user ID", status=status.HTTP_400_BAD_REQUEST)
        if not request.data.get("CALL_DURATION", None):
            return Response("The duration of the call is missing", status=status.HTTP_400_BAD_REQUEST)
        if not request.data.get("CALL_START_DATE", None):
            return Response("The date of the call is missing", status=status.HTTP_400_BAD_REQUEST)
        if not request.data.get("CRM_ACTIVITY_ID", None):
            return Response("The id of the related case is missing", status=status.HTTP_400_BAD_REQUEST)

        # res_save_activity = get_and_save_activity(request.data["CRM_ACTIVITY_ID"], self.bx24, active=True)
        task = activity_task.delay(request.data["CRM_ACTIVITY_ID"], event)

        exist_activity = Phone.objects.filter(CALL_ID=request.data["CALL_ID"]).first()

        if exist_activity:
            serializer = CallsSerializer(exist_activity, data=request.data)
        else:
            serializer = CallsSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Обработчик добавления пользователя в Битрикс24
class UsersApiView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger_tasks_access.info(request.data)
        application_token = request.data.get("auth[application_token]", None)
        app_sid = service.get_app_sid()

        if application_token != app_sid:
            return Response("Unverified event source", status=status.HTTP_400_BAD_REQUEST)

        task = user_task.delay(request.data)
        return Response("OK", status=status.HTTP_200_OK)


# Обработчик добавления пользователя в Битрикс24
class UsersDataApiView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # application_token = request.data.get("auth[application_token]", None)
        # app_sid = service.get_app_sid()

        # if application_token != app_sid:
        #     return Response("Unverified event source", status=status.HTTP_400_BAD_REQUEST)

        # logging.info({
        #     "params": request.query_params,
        #     "data": request.data,
        # })


        event = request.data.get("event", "")
        depart = request.data.get("UF_DEPARTMENT", [])
        if depart:
            request.data["UF_DEPARTMENT"] = depart[0]

        user_id = request.data.get("ID", None)
        request.data["URL"] = service.get_url_user(user_id)

        exist_user = User.objects.filter(ID=user_id).first()

        if exist_user:
            serializer = UsersSerializer(exist_user, data=request.data)
        else:
            serializer = UsersSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Добавление и изменение производственного календаря - NEW
class ProductionCalendarViewSet(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, requests):
        year = requests.query_params.get("year", datetime.datetime.now().year)
        status_day = requests.query_params.get("status", "work")

        queryset = ProductionCalendar.objects.filter(
            date_calendar__year=year, status=status_day
        ).annotate(
            month=models.functions.Extract("date_calendar", "month"),
            day=models.functions.Extract("date_calendar", "day"),
        )

        result = ProductionCalendarSerializer(queryset, many=True)

        data = {}
        for obj in result.data:
            month = obj["month"]
            if not data.get(month, None):
                data[month] = []
            data[month].append(obj["day"])

        return Response(data, status=status.HTTP_200_OK)

    def post(self, requests):
        date_str = requests.data.get("date_calendar", None)

        if not date_str:
            return Response('"date_calendar": обязательное поле', status=status.HTTP_400_BAD_REQUEST)

        try:
            date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            year = date.year
            month = date.month
            day = date.day
        except ValueError:
            return Response('"date_calendar": не правильный формат даты, требуется формат "гггг-мм-дд"',
                            status=status.HTTP_400_BAD_REQUEST)

        calendar_exist = ProductionCalendar.objects.filter(date_calendar=date).exists()

        if not calendar_exist:
            # при отсутствии календаря его создание
            status_calendar, data_calendar = create_calendar(year, month)
            if not status_calendar:
                return Response(data_calendar, status=status.HTTP_400_BAD_REQUEST)

        calendar_day = ProductionCalendar.objects.filter(date_calendar=date).first()

        if not calendar_day:
            return Response("Failed to create calendar", status=status.HTTP_400_BAD_REQUEST)

        # изменение статуса дня
        serializer = ProductionCalendarSerializer(calendar_day, data=requests.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Добавление и изменение плана по звонкам - NEW
class CallsPlanViewSet(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, requests):
        year = requests.query_params.get("year", datetime.datetime.now().year)

        queryset = CallsPlan.objects.filter(calendar__date_calendar__year=year, calendar__date_calendar__day=1). \
            annotate(month=models.functions.Extract("calendar__date_calendar", "month"))

        serializer = CallsPlanSerializer(queryset, many=True)

        data = [{} for _ in range(12)]
        for item in serializer.data:
            index = item["month"] - 1
            employee = str(item["employee"])
            data[index][employee] = item["count_calls"]

        return Response(data, status=status.HTTP_200_OK)

    def post(self, requests):
        calendar_date = requests.data.get("calendar", None)  # дата: гггг-мм-дд
        employee = requests.data.get("employee", None)  # ID работника
        count_calls = requests.data.get("count_calls", None)  # количество звонков - план
        all_month = requests.data.get("all_month", True)  # обновить план на весь месяц или один день

        if not calendar_date:
            return Response('"calendar": обязательное поле', status=status.HTTP_400_BAD_REQUEST)

        if not employee:
            return Response('"employee": обязательное поле', status=status.HTTP_400_BAD_REQUEST)

        try:
            date = datetime.datetime.strptime(calendar_date, "%Y-%m-%d")
            year = date.year
            month = date.month
            day = date.day
        except ValueError:
            return Response('"calendar": не правильный формат даты, требуется формат "гггг-мм-дд"',
                            status=status.HTTP_400_BAD_REQUEST)

        # получение производственного календаря
        calendar_exist = ProductionCalendar.objects.filter(date_calendar=date).exists()

        # создание производственного календаря за переданный месяц, при его отсутствиии
        if not calendar_exist:
            # при отсутствии календаря - его создание
            status_calendar, data_calendar = create_calendar(year, month)
            if not status_calendar:
                return Response(data_calendar, status=status.HTTP_400_BAD_REQUEST)

        # получение записи плана по звонкам пользователя за переданный день
        calls_plan_exists = CallsPlan.objects.filter(calendar__date_calendar=date, employee__pk=employee).exists()

        # если запись отсутствует - создание записей по звонкам за месяц
        if not calls_plan_exists:
            prod_calendar = ProductionCalendar.objects.filter(
                date_calendar__year=year,
                date_calendar__month=month
            )
            calls_plan_list = [{"calendar": obj_prod_calend.pk, "employee": employee} for obj_prod_calend in
                               prod_calendar]

            serializer = CallsPlanSerializer(data=calls_plan_list, many=True)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if all_month:
            # обновление плана всех дней месяца
            entries = CallsPlan.objects.filter(
                calendar__date_calendar__year=year,
                calendar__date_calendar__month=month,
                employee__pk=employee
            ).update(count_calls=count_calls)
            return Response(True, status=status.HTTP_201_CREATED)
        else:
            # обновление плана за один день
            entry = CallsPlan.objects.filter(
                calendar__date_calendar__year=year,
                calendar__date_calendar__month=month,
                calendar__date_calendar__day=day,
                employee__pk=employee
            ).update(count_calls=count_calls)
            return Response(True, status=status.HTTP_201_CREATED)


# добавление всех дней месяц в БД
def create_calendar(year, month):
    # количество дней в месяце
    count_days = calendar.monthrange(int(year), int(month))[1]
    # список объектов с датами для создания календаря в БД
    calendar_days_list = [{"date_calendar": datetime.date(year, month, day)} for day in range(1, count_days + 1)]
    serializer = ProductionCalendarSerializer(data=calendar_days_list, many=True)
    if serializer.is_valid():
        serializer.save()
        return True, serializer.data
    return False, serializer.errors


def get_users_by_depeartments(departments):
    departs_str = ','.join([str(i) for i in sorted(departments)])
    key = f"users_departs_{departs_str}"
    users = cache.get(key)
    if users is None:
        users = User.objects.filter(
            UF_DEPARTMENT__in=departments,
            ACTIVE=True,
            STATUS_DISPLAY=True,
        ).values(
            "ID", "LAST_NAME", "NAME", "UF_DEPARTMENT"
        ).order_by("LAST_NAME", "NAME")
        cache.set(key, users, CASH_TIMMEOUT)

    return users


def get_calls_by_month(departments, year, duration):
    departs_str = ','.join([str(i) for i in sorted(departments)])
    key = f"calls_departs_{departs_str}_year_{year}"
    calls = cache.get(key)
    now = datetime.datetime.now()
    if calls is None:
        queryset_calls = Activity.objects.filter(
            RESPONSIBLE_ID__UF_DEPARTMENT__in=departments,
            RESPONSIBLE_ID__ACTIVE=True,
            RESPONSIBLE_ID__STATUS_DISPLAY=True,
            # phone__CALL_START_DATE__year=year,
            CALL_START_DATE__year=year,
            TYPE_ID=2,
            DIRECTION=2,
            # phone__CALL_DURATION__gte=duration,
            CALL_DURATION__gte=duration,
            active=True
        ).distinct(
            # 'RESPONSIBLE_ID', 'phone__CALL_START_DATE__month', 'phone__CALL_START_DATE__day', 'COMPANY_ID'
            'RESPONSIBLE_ID', 'CALL_START_DATE__month', 'CALL_START_DATE__day', 'COMPANY_ID'
        ).values_list(
            # "RESPONSIBLE_ID", 'phone__CALL_START_DATE__month'
            "RESPONSIBLE_ID", 'CALL_START_DATE__month'
        )
        calls = Counter(queryset_calls)
        cache.set(key, calls, CASH_TIMMEOUT)
    elif year == now.year or str(year) == str(now.year):
        queryset_calls = Activity.objects.filter(
            RESPONSIBLE_ID__UF_DEPARTMENT__in=departments,
            RESPONSIBLE_ID__ACTIVE=True,
            RESPONSIBLE_ID__STATUS_DISPLAY=True,
            # phone__CALL_START_DATE__year=year,
            CALL_START_DATE__year=year,
            # phone__CALL_START_DATE__month=now.month,
            CALL_START_DATE__month=now.month,
            TYPE_ID=2,
            DIRECTION=2,
            # phone__CALL_DURATION__gte=duration,
            CALL_DURATION__gte=duration,
            active=True
        ).distinct(
            # 'RESPONSIBLE_ID', 'phone__CALL_START_DATE__month', 'phone__CALL_START_DATE__day', 'COMPANY_ID'
            'RESPONSIBLE_ID', 'CALL_START_DATE__month', 'CALL_START_DATE__day', 'COMPANY_ID'
        ).values_list(
            # "RESPONSIBLE_ID", 'phone__CALL_START_DATE__month'
            "RESPONSIBLE_ID", 'CALL_START_DATE__month'
        )
        calls_new = Counter(queryset_calls)
        # calls.update(calls_new)
        calls = update_dict(calls, calls_new)

    return calls


def get_meetings_by_month(departments, year):
    meetings = Activity.objects.filter(
        RESPONSIBLE_ID__UF_DEPARTMENT__in=departments,
        RESPONSIBLE_ID__ACTIVE=True,
        RESPONSIBLE_ID__STATUS_DISPLAY=True,
        END_TIME__year=year,
        TYPE_ID=1,
        active=True,
        COMPLETED="Y"
    ).values(
        "RESPONSIBLE_ID", 'END_TIME__month'
    ).annotate(
        counts=models.Count('END_TIME')
    )

    return meetings


def get_calls_by_day(departments, year, month, duration):
    departs_str = ','.join([str(i) for i in sorted(departments)])
    key = f"calls_departs_{departs_str}_year_{year}_month_{month}"
    calls = cache.get(key)
    now = datetime.datetime.now()
    if calls is None:
        queryset_calls = Activity.objects.filter(
            RESPONSIBLE_ID__UF_DEPARTMENT__in=departments,
            RESPONSIBLE_ID__ACTIVE=True,
            RESPONSIBLE_ID__STATUS_DISPLAY=True,
            # phone__CALL_START_DATE__year=year,
            CALL_START_DATE__year=year,
            # phone__CALL_START_DATE__month=month,
            CALL_START_DATE__month=month,
            TYPE_ID=2,
            DIRECTION=2,
            # phone__CALL_DURATION__gte=duration,
            DURATION__gte=duration,
            active=True
        ).distinct(
            # 'RESPONSIBLE_ID', 'phone__CALL_START_DATE__month', 'phone__CALL_START_DATE__day', 'COMPANY_ID'
            'RESPONSIBLE_ID', 'CALL_START_DATE__month', 'CALL_START_DATE__day', 'COMPANY_ID'
        ).values_list(
            # "RESPONSIBLE_ID", 'phone__CALL_START_DATE__day'
            "RESPONSIBLE_ID", 'CALL_START_DATE__day'
        )
        calls = Counter(queryset_calls)
        cache.set(key, calls, CASH_TIMMEOUT)
    elif str(year) == str(now.year) and str(month) == str(now.month):
        queryset_calls = Activity.objects.filter(
            RESPONSIBLE_ID__UF_DEPARTMENT__in=departments,
            RESPONSIBLE_ID__ACTIVE=True,
            RESPONSIBLE_ID__STATUS_DISPLAY=True,
            # phone__CALL_START_DATE__year=year,
            # phone__CALL_START_DATE__month=month,
            # phone__CALL_START_DATE__day=now.day,
            CALL_START_DATE__year=year,
            CALL_START_DATE__month=month,
            CALL_START_DATE__day=now.day,
            TYPE_ID=2,
            DIRECTION=2,
            # phone__CALL_DURATION__gte=duration,
            DURATION__gte=duration,
            active=True
        ).distinct(
            # 'RESPONSIBLE_ID', 'phone__CALL_START_DATE__month', 'phone__CALL_START_DATE__day', 'COMPANY_ID'
            'RESPONSIBLE_ID', 'CALL_START_DATE__month', 'CALL_START_DATE__day', 'COMPANY_ID'
        ).values_list(
            # "RESPONSIBLE_ID", 'phone__CALL_START_DATE__day'
            "RESPONSIBLE_ID", 'CALL_START_DATE__day'
        )
        calls_new = Counter(queryset_calls)
        # calls.update(calls_new)
        calls = update_dict(calls, calls_new)

    return calls


def get_meetings_by_day(departments, year, month):
    meetings = Activity.objects.filter(
        RESPONSIBLE_ID__UF_DEPARTMENT__in=departments,
        RESPONSIBLE_ID__ACTIVE=True,
        RESPONSIBLE_ID__STATUS_DISPLAY=True,
        END_TIME__year=year,
        END_TIME__month=month,
        TYPE_ID=1,
        active=True,
        COMPLETED="Y"
    ).values(
        "RESPONSIBLE_ID", 'END_TIME__day'
    ).annotate(
        counts=models.Count('END_TIME')
    )

    return meetings


def update_dict(dict_old, dict_new):
    for key, val in dict_new.items():
        dict_old[key] = val
    return dict_old

# получение данных сгруппированных по месяцам одного года
class RationActiveByMonthApiView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        departs = request.data.get("depart", 1)
        year = request.data.get("year", 2021)
        duration = request.data.get("duration", 20)
        departments = departs.split(",")

        # получение списка пользователей
        users = get_users_by_depeartments(departments)

        # получение фактического количества звонков по месяцам
        calls = get_calls_by_month(departments, year, duration)

        # получение фактического количества встреч по месяцам
        meetings = get_meetings_by_month(departments, year)

        # получение списка комментариев
        comments = Comment.objects.filter(
            recipient__UF_DEPARTMENT__in=departments,
            recipient__ACTIVE=True,
            recipient__STATUS_DISPLAY=True,
            date_comment__year=year,
        ).values(
            'recipient', 'date_comment__month'
        ).annotate(
            counts=models.Count('date_comment')
        )

        # получение плана по звонкам
        calls_plan = CallsPlan.objects.filter(
            calendar__date_calendar__year=year,
        ).annotate(
            count_calls_avg=models.Avg("count_calls"),
            plan_completed_avg=models.Avg("plan_completed"),
        ).values(
            'employee', 'count_calls_avg', 'calendar__date_calendar__month'
        )

        data = {}
        for department in departments:
            data[department] = []

        data_user = {}
        for user in users:
            user["calls_fact"] = {}
            user["meetings_fact"] = {}
            user["comments"] = {}
            user["calls_plan"] = {}
            key = user["ID"]
            data_user[key] = user

        for (user_id, month_num), count in calls.items():
            if user_id in data_user:
                data_user[user_id]["calls_fact"][month_num] = count

        for meeting in meetings:
            user = meeting["RESPONSIBLE_ID"]
            month = meeting["END_TIME__month"]
            count = meeting["counts"]
            if user in data_user:
                data_user[user]["meetings_fact"][month] = count

        for comment in comments:
            user = comment["recipient"]
            month = comment["date_comment__month"]
            count = comment["counts"]
            if user in data_user:
                data_user[user]["comments"][month] = count

        for plan in calls_plan:
            user = plan["employee"]
            month = plan["calendar__date_calendar__month"]
            count = plan["count_calls_avg"]
            if user in data_user:
                data_user[user]["calls_plan"][month] = count

        for user_id, user in data_user.items():
            dep = str(user["UF_DEPARTMENT"])
            data[dep].append(user)

        return Response(data, status=status.HTTP_200_OK)


# получение данных сгруппированных по дням одного месяца
class RationActiveByDayApiView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        departs = request.data.get("depart", "1")
        year = request.data.get("year", 2021)
        month = request.data.get("month", 11)
        duration = request.data.get("duration", 20)
        departments = departs.split(",")

        # получение списка пользователей
        users = get_users_by_depeartments(departments)

        # получение фактического количества звонков по дням за месяц
        calls = get_calls_by_day(departments, year, month, duration)

        # получение фактического количества встреч по дням за месяц
        meetings = get_meetings_by_day(departments, year, month)

        # получение списка комментариев
        comments = Comment.objects.filter(
            recipient__UF_DEPARTMENT__in=departments,
            recipient__ACTIVE=True,
            recipient__STATUS_DISPLAY=True,
            date_comment__year=year,
            date_comment__month=month,
        ).values(
            'recipient', 'date_comment__day'
        ).annotate(
            counts=models.Count('date_comment')
        )

        # получение плана по звонкам
        calls_plan = CallsPlan.objects.filter(
            calendar__date_calendar__year=year,
            calendar__date_calendar__month=month,
        ).values(
            'employee', 'count_calls', 'plan_completed', 'calendar__date_calendar__day'
        )

        data = {}
        for department in departments:
            data[department] = []

        data_user = {}
        for user in users:
            user["calls_fact"] = {}
            user["meetings_fact"] = {}
            user["comments"] = {}
            user["calls_plan"] = {}
            user["completed_plan"] = {}
            key = user["ID"]
            data_user[key] = user

        for (user_id, day_num), count in calls.items():
            if user_id in data_user:
               data_user[user_id]["calls_fact"][day_num] = count

        for meeting in meetings:
            user = meeting["RESPONSIBLE_ID"]
            day = meeting["END_TIME__day"]
            count = meeting["counts"]
            if user in data_user:
                data_user[user]["meetings_fact"][day] = count

        for comment in comments:
            user = comment["recipient"]
            day = comment["date_comment__day"]
            count = comment["counts"]
            if user in data_user:
                data_user[user]["comments"][day] = count

        for plan in calls_plan:
            user = plan["employee"]
            day = plan["calendar__date_calendar__day"]
            count = plan["count_calls"]
            completed = plan["plan_completed"]
            if user in data_user:
                data_user[user]["calls_plan"][day] = count
                data_user[user]["completed_plan"][day] = completed

        for user_id, user in data_user.items():
            dep = str(user["UF_DEPARTMENT"])
            data[dep].append(user)

        return Response(data, status=status.HTTP_200_OK)


# Получение звоков за выбранный период
class CallsViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.filter(
        TYPE_ID=2,
        DIRECTION=2,
        active=True
    ).distinct(
        'phone__CALL_START_DATE__month', 'phone__CALL_START_DATE__day', 'COMPANY_ID'
    ).order_by(
        'phone__CALL_START_DATE__month', 'phone__CALL_START_DATE__day', 'COMPANY_ID', 'phone__CALL_START_DATE'
    )
    serializer_class = ActivitySerializer
    filter_backends = [DjangoFilterBackend, ]
    filterset_class = my_filters.CallsFilter
    permission_classes = [IsAuthenticated]


# Получение, добавление, обновление комментариев
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    ordering = ["date_comment_add"]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = my_filters.CommentFilter
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        data = {
            "recipient": request.data.get("recipient", instance.recipient.pk),
            "commentator": request.data.get("commentator", instance.commentator.pk),
            "date_comment": request.data.get("date_comment", instance.date_comment),
            "date_comment_add": request.data.get("date_comment_add", instance.date_comment_add),
            "comment": request.data.get("comment", instance.comment),
            "verified": request.data.get("verified", instance.verified),
            "verified_by_user": request.data.get("verified_by_user", instance.verified_by_user),
            "date_verified": request.data.get("date_verified", instance.date_verified)
        }

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)


# Изменение плана по звонкам - NEW
class CallsPlanCompletedViewSet(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        calendar_date = request.data.get("calendar", None)  # дата: гггг-мм-дд
        employee = request.data.get("employee", None)  # ID работника
        plan_completed = request.data.get("plan_completed", None)  # план выполнен

        if not calendar_date:
            return Response('"calendar": обязательное поле', status=status.HTTP_400_BAD_REQUEST)

        if not employee:
            return Response('"employee": обязательное поле', status=status.HTTP_400_BAD_REQUEST)

        try:
            date = datetime.datetime.strptime(calendar_date, "%Y-%m-%d")
            year = date.year
            month = date.month
            day = date.day
        except ValueError:
            return Response('"calendar": не правильный формат даты, требуется формат "гггг-мм-дд"',
                            status=status.HTTP_400_BAD_REQUEST)

        entry = CallsPlan.objects.filter(
            calendar__date_calendar__year=year,
            calendar__date_calendar__month=month,
            calendar__date_calendar__day=day,
            employee__pk=employee
        ).update(plan_completed=plan_completed)

        if entry == 1:
            return Response(True, status=status.HTTP_201_CREATED)

        return Response(False, status=status.HTTP_201_CREATED)

