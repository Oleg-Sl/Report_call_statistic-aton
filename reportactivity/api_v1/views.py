from rest_framework import views, viewsets, filters, status, mixins, generics
from rest_framework.response import Response
from django.shortcuts import render
from django.views.decorators.clickjacking import xframe_options_exempt
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters_drf

import os
import logging
import json
import time
import datetime
import calendar


logging.basicConfig(filename="installapp.log", level=logging.INFO,
                    format='[%(asctime)s] %(levelname).1s %(message)s', datefmt='%Y.%m.%d %H:%M:%S')


from . import service, bitrix24

from activityapp.models import (Activity, Phone, User, CallingPlan, CountWorkingDays, ProductionCalendar, CallsPlan)
from .serializers import (ActivitySerializer,
                          CallsSerializer,
                          UsersUpdateSerializer,
                          UsersSerializer,
                          CallingPlanSerializer,
                          CountWorkingDaysSerializer,

                          ProductionCalendarSerializer,
                          CallsPlanSerializer,

                          RationActiveByMonthSerializer,
                          RationActiveByDaySerializer)


class UsersDataFilter(filters_drf.FilterSet):
    class Meta:
        model = User
        fields = ["UF_DEPARTMENT", "ALLOWED_EDIT", "ALLOWED_SETTING", ]


class UsersViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(ACTIVE=True).order_by("LAST_NAME", "NAME")
    serializer_class = UsersUpdateSerializer
    filter_backends = [filters_drf.DjangoFilterBackend]
    filterset_class = UsersDataFilter


# Обработчик установки приложения
class InstallApiView(views.APIView):
    @xframe_options_exempt
    def post(self, request):
        data = {
            "domain": request.query_params.get("DOMAIN", "bits24.bitrix24.ru"),
            "auth_token": request.data.get("AUTH_ID", ""),
            "expires_in": request.data.get("AUTH_EXPIRES", 3600),
            "refresh_token": request.data.get("REFRESH_ID", ""),
            "application_token": request.data.get("APP_SID", ""),   # используется для проверки достоверности событий Битрикс24
            'client_endpoint': f'https://{request.query_params.get("DOMAIN", "bits24.bitrix24.ru")}/rest/',
        }
        service.write_app_data_to_file(data)
        return render(request, 'install.html')


# Обработчик установленного приложения
class IndexApiView(views.APIView):
    @xframe_options_exempt
    def post(self, request):
        return render(request, 'index.html')


# Обработчик удаления приложения
class AppUnistallApiView(views.APIView):
    @xframe_options_exempt
    def post(self, request):
        return Response(status.HTTP_200_OK)


# Обработчик создания, изменения, удаления дела
class ActivityApiView(views.APIView):
    bx24 = bitrix24.Bitrix24()

    def post(self, request):

        logging.info({
            "params": request.query_params,
            "data": request.data,
        })

        event = request.data.get("event", "")
        application_token = request.data.get("auth[application_token]", None)
        id_activity = request.data.get("data[FIELDS][ID]", None)

        if not id_activity:
            return Response("Not transferred ID activity", status=status.HTTP_400_BAD_REQUEST)

        # app_sid = service.get_app_sid()
        # if application_token != app_sid:
        #     return Response("Unverified event source", status=status.HTTP_400_BAD_REQUEST)

        active = True
        if event == "ONCRMACTIVITYDELETE":
            active = False

        return get_and_save_activity(id_activity, self.bx24, active)


# Обработчик завершения звонка
class CallsApiView(views.APIView):
    bx24 = bitrix24.Bitrix24()

    def post(self, request):
        application_token = request.data.get("auth[application_token]", None)
        app_sid = service.get_app_sid()

        # if application_token != app_sid:
        #     return Response("Unverified event source", status=status.HTTP_400_BAD_REQUEST)

        data = {}
        event = request.data.get("event", "")
        data["CALL_ID"] = request.data.get("data[CALL_ID]", None)
        data["CALL_ID"] = request.data.get("data[CALL_ID]", None)
        data["CALL_TYPE"] = request.data.get("data[CALL_TYPE]", None)
        data["PHONE_NUMBER"] = request.data.get("data[PHONE_NUMBER]", None)
        data["PORTAL_USER_ID"] = request.data.get("data[PORTAL_USER_ID]", None)
        data["CALL_DURATION"] = request.data.get("data[CALL_DURATION]", None)
        data["CALL_START_DATE"] = request.data.get("data[CALL_START_DATE]", None)
        data["CRM_ACTIVITY_ID"] = request.data.get("data[CRM_ACTIVITY_ID]", None)

        res_save_activity = get_and_save_activity(data["CRM_ACTIVITY_ID"], self.bx24, active=True)

        if not data["CALL_ID"]:
            return Response("Not transferred ID call", status=status.HTTP_400_BAD_REQUEST)
        if not data["CALL_TYPE"]:
            return Response("Missing call type", status=status.HTTP_400_BAD_REQUEST)
        if not data["PORTAL_USER_ID"]:
            return Response("Missing user ID", status=status.HTTP_400_BAD_REQUEST)
        if not data["CALL_DURATION"]:
            return Response("The duration of the call is missing", status=status.HTTP_400_BAD_REQUEST)
        if not data["CALL_START_DATE"]:
            return Response("The date of the call is missing", status=status.HTTP_400_BAD_REQUEST)
        if not data["CRM_ACTIVITY_ID"]:
            return Response("The id of the related case is missing", status=status.HTTP_400_BAD_REQUEST)

        exist_activity = Phone.objects.filter(CALL_ID=data["CALL_ID"]).first()

        if exist_activity:
            serializer = CallsSerializer(exist_activity, data=data)
        else:
            serializer = CallsSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Обработчик добавления пользователя в Битрикс24
class UsersApiView(views.APIView):

    def post(self, request):
        # application_token = request.data.get("auth[application_token]", None)
        # app_sid = service.get_app_sid()
        
        # if application_token != app_sid:
        #     return Response("Unverified event source", status=status.HTTP_400_BAD_REQUEST)

        logging.info({
            "params": request.query_params,
            "data": request.data,
        })

        data = {}
        event = request.data.get("event", "")
        data["ID"] = request.data.get("data[ID]", None)
        data["LAST_NAME"] = request.data.get("data[LAST_NAME]", None)
        data["NAME"] = request.data.get("data[NAME]", None)
        data["WORK_POSITION"] = request.data.get("data[WORK_POSITION]", None)
        
        depart = request.data.get("data[UF_DEPARTMENT]", [])
        if depart:
            data["UF_DEPARTMENT"] = depart[0]
        
        active = request.data.get("ACTIVE", None)
        if active is not None:
            data["ACTIVE"] = active
        
        data["URL"] = service.get_url_user(data["ID"])

        exist_user = User.objects.filter(ID=data["ID"]).first()

        if exist_user:
            serializer = UsersSerializer(exist_user, data=data)
        else:
            serializer = UsersSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Добавление и зменение плана по звонкам - OLD
class CallingPlanViewSet(views.APIView):
    def get(self, requests):
        year = requests.data.get("year", datetime.datetime.now().year)

        queryset = CallingPlan.objects.filter(date_plan_calls__year=year)
        serializer = CallingPlanSerializer(queryset, many=True)

        return Response(serializer.data)

    def post(self, requests):
        date_str = requests.data.get("date_plan_calls", None)
        employee = requests.data.get("employee", None)
        if not date_str:
            return Response('"date_plan_calls": обязательное поле', status=status.HTTP_400_BAD_REQUEST)

        try:
            date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            year = date.year
            month = date.month
        except ValueError:
            return Response('"date_plan_calls": не правильный формат даты, требуется формат "гггг-мм-дд"',
                            status=status.HTTP_400_BAD_REQUEST)

        entry_exist = CallingPlan.objects.filter(date_plan_calls__year=year,
                                                 date_plan_calls__month=month,
                                                 employee__pk=employee).first()
        if entry_exist:
            serializer = CallingPlanSerializer(entry_exist, data=requests.data)
        else:
            serializer = CallingPlanSerializer(data=requests.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Добавление и изменение количества рабочих дней - OLD
class CountWorkingDaysViewSet(views.APIView):

    def get(self, requests):
        year = requests.query_params.get("year", datetime.datetime.now().year)
        queryset = CountWorkingDays.objects.filter(date_count_working__year=year).annotate(month=models.F("date_count_working__month"))
        serializer = CountWorkingDaysSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, requests):
        date_str = requests.data.get("date_count_working", None)
        if not date_str:
            return Response('"date_count_working": обязательное поле', status=status.HTTP_400_BAD_REQUEST)

        try:
            date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            year = date.year
            month = date.month
        except ValueError:
            return Response('"date_count_working": не правильный формат даты, требуется формат "гггг-мм-дд"',
                            status=status.HTTP_400_BAD_REQUEST)

        entry_exist = CountWorkingDays.objects.filter(date_count_working__year=year,
                                                      date_count_working__month=month).first()
        if entry_exist:
            serializer = CountWorkingDaysSerializer(entry_exist, data=requests.data)
        else:
            serializer = CountWorkingDaysSerializer(data=requests.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Добавление и изменение производственного календаря - NEW
class ProductionCalendarViewSet(views.APIView):
    def get(self, requests):
        year = requests.query_params.get("year", datetime.datetime.now().year)
        status_day = requests.query_params.get("status", "work")

        queryset = ProductionCalendar.objects.filter(date_calendar__year=year, status=status_day).values("date_calendar__month").annotate(count=models.Count("id"))
        result = {obj["date_calendar__month"]: obj["count"] for obj in queryset}

        return Response(result, status=status.HTTP_200_OK)

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
            return Response('"date_plan_calls": не правильный формат даты, требуется формат "гггг-мм-дд"',
                            status=status.HTTP_400_BAD_REQUEST)

        entry_exist = ProductionCalendar.objects.filter(
            date_calendar__year=year,
            date_calendar__month=month,
            date_calendar__day=day
        ).first()

        if entry_exist:
            # изменение статуса дня
            serializer = ProductionCalendarSerializer(entry_exist, data=requests.data)
        else:
            # добавление всех дней месяц в БД
            count_days = calendar.monthrange(int(year), int(month))[1]          # количество дней в месяце
            data_list = [{"date_calendar": datetime.date(year, month, day)} for day in range(1, count_days + 1)]
            serializer = ProductionCalendarSerializer(data=data_list, many=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Добавление и изменение плана по звонкам - NEW
class CallsPlanViewSet(views.APIView):
    # def get(self, requests):
    #     year = requests.query_params.get("year", datetime.datetime.now().year)
    #
    #     queryset = CallsPlan.objects.filter(calendar__date_calendar__year=year).values("employee").annotate(models.Value("count_calls"))
    #     print(queryset)
    #     # serializer = CallingPlanSerializer(queryset, many=True)
    #     # return Response(serializer.data)
    #     return Response("", status=status.HTTP_200_OK)

    def post(self, requests):
        calendar_date = requests.data.get("calendar", None)
        employee = requests.data.get("employee", None)
        count_calls = requests.data.get("count_calls", None)
        all_month = requests.data.get("all_month", False)

        if not calendar_date:
            return Response('"calendar": обязательное поле', status=status.HTTP_400_BAD_REQUEST)

        if not employee:
            return Response('"employee": обязательное поле', status=status.HTTP_400_BAD_REQUEST)

        # парсинг даты
        try:
            date = datetime.datetime.strptime(calendar_date, "%Y-%m-%d")
            year = date.year
            month = date.month
            day = date.day
        except ValueError:
            return Response('"calendar": не правильный формат даты, требуется формат "гггг-мм-дд"',
                            status=status.HTTP_400_BAD_REQUEST)

        # получение производственного календаря
        prod_calendar__exist = ProductionCalendar.objects.filter(
            date_calendar__year=year,
            date_calendar__month=month
        ).exists()
        # создание производственного календаря за переданный месяц, при его отсутствиии
        if not prod_calendar__exist:
            count_days = calendar.monthrange(int(year), int(month))[1]  # количество дней в месяце
            data_list = [{"date_calendar": datetime.date(year, month, day)} for day in range(1, count_days + 1)]
            serializer = ProductionCalendarSerializer(data=data_list, many=True)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # полкучение записи плана по звонкам пользователя за переданный день
        entry_exist = CallsPlan.objects.filter(
            calendar__date_calendar__year=year,
            calendar__date_calendar__month=month,
            calendar__date_calendar__day=day,
            employee__pk=employee
        ).first()
        # если запись отсутствует - создание записей по звонкам за месяц
        if not entry_exist:
            prod_calendar = ProductionCalendar.objects.filter(
                date_calendar__year=year,
                date_calendar__month=month
            )
            calls_plan_list =[{"calendar": obj_prod_calend.pk, "employee": employee} for obj_prod_calend in prod_calendar]
            serializer = CallsPlanSerializer(data=calls_plan_list, many=True)
            if serializer.is_valid():
                serializer.save()

        if all_month:
            # обновление плана по каждому дню месяца
            entries = CallsPlan.objects.filter(
                calendar__date_calendar__year=year,
                calendar__date_calendar__month=month,
                employee__pk=employee
            ).update(count_calls=count_calls)
            # serializer = CallsPlanSerializer(data=entries, many=True)
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


# получение или сохранение дела
def get_and_save_activity(id_activity, bx24, active=True):
    result_req_activity = bx24.call("crm.activity.get", {"id": id_activity})                    # получение активности

    if not result_req_activity or "result" not in result_req_activity:
        return Response("No response came from BX24", status=status.HTTP_400_BAD_REQUEST)

    data_activity = result_req_activity["result"]
    data_activity["active"] = active                                            # добавление статуса активности

    time.sleep(0.5)

    # получение пользователя
    id_responsible = data_activity.get("RESPONSIBLE_ID", None)                  # ответственный
    responsible = get_and_save_user(id_responsible, bx24)                       # получение или со-дание пользователя

    # получение ссылки на фаил
    files = data_activity.get("FILES", None)
    if files and isinstance(files, list) and len(files) > 0:
        file = data_activity["FILES"][0]
        url = file.get("url", "")
        data_activity["FILES"] = url                                            # добавление ссылки на фаил
    else:
        data_activity["FILES"] = ""

    # пробразование дат
    data_activity["CREATED"] = service.convert_date_to_obj(data_activity["CREATED"])        # конвертирование даты
    data_activity["END_TIME"] = service.convert_date_to_obj(data_activity["END_TIME"])      # конвертирование даты

    # COMPANY_NAME
    # OWNER_NAME

    # получение ID компании
    company_id = None
    if data_activity["OWNER_TYPE_ID"] == "1" and data_activity["OWNER_ID"]:
        data = bx24.call("crm.lead.get", {"id": data_activity["OWNER_ID"]})
        company_id = data.get("result").get("COMPANY_ID")
        data_activity["OWNER_NAME"] = data.get("result").get("TITLE", None)

    if data_activity["OWNER_TYPE_ID"] == "2" and data_activity["OWNER_ID"]:
        data = bx24.call("crm.deal.get", {"id": data_activity["OWNER_ID"]})
        company_id = data.get("result").get("COMPANY_ID")
        data_activity["OWNER_NAME"] = data.get("result").get("TITLE", None)

    if data_activity["OWNER_TYPE_ID"] == "3" and data_activity["OWNER_ID"]:
        data = bx24.call("crm.contact.get", {"id": data_activity["OWNER_ID"]})
        company_id = data.get("result").get("COMPANY_ID")
        lastname = data.get("result").get("LAST_NAME", "")
        name = data.get("result").get("NAME", "")
        data_activity["OWNER_NAME"] = f"{lastname} {name}"

    if data_activity["OWNER_TYPE_ID"] == "4" and data_activity["OWNER_ID"]:
        data = bx24.call("crm.company.get", {"id": data_activity["OWNER_ID"]})
        company_id = data_activity["OWNER_ID"]
        data_activity["OWNER_NAME"] = data.get("result", {}).get("TITLE", None)
        # company_id = data_activity["OWNER_ID"]
        # data_activity["OWNER_NAME"] = data_activity.get("TITLE", None)
        # # data_activity["COMPANY_NAME"] = data.get("result").get("TITLE", None)

    if not company_id:
        return Response("There are no companies tied to the case", status=status.HTTP_400_BAD_REQUEST)

    data_activity["COMPANY_ID"] = company_id

    # сохранение или обновление дела
    exist_activity = Activity.objects.filter(ID=id_activity).first()

    if exist_activity:
        serializer = ActivitySerializer(exist_activity, data=data_activity)
    else:
        serializer = ActivitySerializer(data=data_activity)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# получение и сохранение пользователя
def get_and_save_user(id_user, bx24):
    exist_user = User.objects.filter(ID=id_user).first()

    if exist_user:
        return exist_user

    data_user = bx24.call("user.get", {"id": id_user})

    if not data_user or "result" not in data_user or len(data_user["result"]) == 0:
        return Response("No response came from BX24", status=status.HTTP_400_BAD_REQUEST)

    data = data_user["result"][0]
    data["URL"] = service.get_url_user(id_user)

    department = data["UF_DEPARTMENT"]
    if isinstance(department, list) and len(department) != 0:
        data["UF_DEPARTMENT"] = department[0]
    else:
        data["UF_DEPARTMENT"] = None

    serializer = UsersSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# получение данных сгруппированных по месяцам одного года
class RationActiveByMonthApiView(views.APIView):

    def post(self, request):
        depart = request.data.get("depart", 1)
        year = request.data.get("year", 2021)
        duration = request.data.get("duration", 20)

        queryset = User.objects.filter(ACTIVE=True, STATUS_DISPLAY=True, UF_DEPARTMENT=depart) \
            .prefetch_related(models.Prefetch("activity",
                                              Activity.objects.filter(END_TIME__year=year, TYPE_ID=2, DIRECTION=2, phone__CALL_DURATION__gte=duration, active=True, COMPLETED="Y")
                                              .annotate(MONTH=models.functions.Extract("END_TIME", "month"))
                                              .annotate(DURATION=models.F("phone__CALL_DURATION"))
                                              .distinct('END_TIME__year', 'END_TIME__month', 'END_TIME__day', 'COMPANY_ID'),
                                              to_attr="calls_lst")) \
            .prefetch_related(models.Prefetch("activity",
                                              Activity.objects.filter(END_TIME__year=year, TYPE_ID=1, active=True)
                                              .annotate(MONTH=models.functions.Extract("END_TIME", "month"))
                                              .annotate(DURATION=models.F("phone__CALL_DURATION"))
                                              .distinct('END_TIME__year', 'END_TIME__month', 'END_TIME__day', 'COMPANY_ID'),
                                              to_attr="meeting_lst")) \
            .prefetch_related(models.Prefetch("calls_plan",
                                              CallingPlan.objects.filter(date_plan_calls__year=year)
                                              .annotate(MONTH=models.functions.Extract("date_plan_calls", "month")),
                                              to_attr="count_calls_plan")) \
            .order_by("LAST_NAME", "NAME")

        serializer = RationActiveByMonthSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# получение данных сгруппированных по дням одного месяца
class RationActiveByDayApiView(views.APIView):

    def post(self, request):
        depart = request.data.get("depart", 1)
        year = request.data.get("year", 2021)
        month = request.data.get("month", 11)
        duration = request.data.get("duration", 20)

        queryset = User.objects.filter(ACTIVE=True, STATUS_DISPLAY=True, UF_DEPARTMENT=depart) \
            .annotate(year=models.Value(year), month=models.Value(month)) \
            .annotate(count_calls_fact1=models.Count(models.F("activity"), filter=models.Q(
                    activity__END_TIME__year=year,
                    activity__END_TIME__month=month,
                    activity__TYPE_ID=2,
                    activity__DIRECTION=2,
                    activity__phone__CALL_DURATION__gte=duration,
                    activity__active=True
                ),
                distinct=True
            )) \
            .annotate(count_calls_plan=models.Max("calls_plan__count_calls",
                                                  filter=models.Q(calls_plan__date_plan_calls__year=year,
                                                                  calls_plan__date_plan_calls__month=month)
                                                  )
                      ) \
            .prefetch_related(models.Prefetch("activity",
                                              Activity.objects.filter(END_TIME__year=year, END_TIME__month=month, TYPE_ID=2, DIRECTION=2, phone__CALL_DURATION__gte=duration, active=True)\
                                              .annotate(DAY=models.functions.Extract("END_TIME", "day")) \
                                              .annotate(DURATION=models.F("phone__CALL_DURATION"))
                                              .distinct('END_TIME__year', 'END_TIME__month', 'END_TIME__day', 'COMPANY_ID'), 
                                              to_attr="calls_lst")) \
            .prefetch_related(models.Prefetch("activity",
                                              Activity.objects.filter(END_TIME__year=year, END_TIME__month=month, TYPE_ID=1, active=True, COMPLETED="Y")\
                                              .annotate(DAY=models.functions.Extract("END_TIME", "day")) \
                                              .annotate(DURATION=models.F("phone__CALL_DURATION"))
                                              .distinct('END_TIME__year', 'END_TIME__month', 'END_TIME__day', 'COMPANY_ID'),
                                              to_attr="meeting_lst")) \
            .order_by("LAST_NAME", "NAME")
            # .prefetch_related(models.Prefetch("calls_plan",
            #                                   CallingPlan.objects.filter(date_plan_calls__year=year, date_plan_calls__month=month)
            #                                   .annotate(DAY=models.functions.Extract("date_plan_calls", "day")),
            #                                   to_attr="count_calls_plan"))

        serializer = RationActiveByDaySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)




