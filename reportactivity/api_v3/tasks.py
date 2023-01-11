from reportactivity.celery import celery_app
import logging
import time


from . import bitrix24, service

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

# логгер успешного сохранения данных
logger_tasks_success = logging.getLogger('tasks_success')
logger_tasks_success.setLevel(logging.INFO)
fh_tasks_success = logging.handlers.TimedRotatingFileHandler('./logs/tasks/success.log', when='D', interval=1, backupCount=15)
formatter_tasks_success = logging.Formatter('[%(asctime)s] %(levelname).1s %(message)s')
fh_tasks_success.setFormatter(formatter_tasks_success)
logger_tasks_success.addHandler(fh_tasks_success)

# логгер ошибок сохранения данных
logger_tasks_error = logging.getLogger('tasks_error')
logger_tasks_error.setLevel(logging.INFO)
fh_tasks_error = logging.handlers.TimedRotatingFileHandler('./logs/tasks/error.log', when='D', interval=1, backupCount=15)
formatter_tasks_error = logging.Formatter('[%(asctime)s] %(levelname).1s %(message)s')
fh_tasks_error.setFormatter(formatter_tasks_error)
logger_tasks_error.addHandler(fh_tasks_error)


# объект выполнения запросов к Битрикс
bx24 = bitrix24.Bitrix24()


# задача по сохранению активности
@celery_app.task
def activity_task(id_activity, event):
    active = True
    if event == "ONCRMACTIVITYDELETE":
        active = False

    return update_or_save_activity(id_activity, active)


# задача по сохранению звонка
@celery_app.task
def calls_task(calls):
    data = {}
    event = calls.get("event", "")
    data["CALL_ID"] = calls.get("data[CALL_ID]", None)
    data["CALL_ID"] = calls.get("data[CALL_ID]", None)
    data["CALL_TYPE"] = calls.get("data[CALL_TYPE]", None)
    data["PHONE_NUMBER"] = calls.get("data[PHONE_NUMBER]", None)
    data["PORTAL_USER_ID"] = calls.get("data[PORTAL_USER_ID]", None)
    data["CALL_DURATION"] = calls.get("data[CALL_DURATION]", None)
    data["CALL_START_DATE"] = calls.get("data[CALL_START_DATE]", None)
    data["CRM_ACTIVITY_ID"] = calls.get("data[CRM_ACTIVITY_ID]", None)

    # обновление или сохранение активности
    res_save_activity = update_or_save_activity(data["CRM_ACTIVITY_ID"], True, data["CALL_DURATION"], data["CALL_START_DATE"])

    if not data["CALL_ID"]:
        logger_tasks_error.error({
            "error": "Not transferred ID call",
            "message": "Отсутствует CALL_ID",
            "data": data,
        })
    if not data["CALL_TYPE"]:
        logger_tasks_error.error({
            "error": "Missing call type",
            "message": "Отсутствует CALL_TYPE",
            "data": data,
        })
    if not data["PORTAL_USER_ID"]:
        logger_tasks_error.error({
            "error": "Missing user ID",
            "message": "Отсутствует PORTAL_USER_ID",
            "data": data,
        })
    if not data["CALL_DURATION"]:
        logger_tasks_error.error({
            "error": "The duration of the call is missing",
            "message": "Отсутствует CALL_DURATION",
            "data": data,
        })
    if not data["CALL_START_DATE"]:
        logger_tasks_error.error({
            "error": "The date of the call is missing",
            "message": "Отсутствует CALL_START_DATE",
            "data": data,
        })
    if not data["CRM_ACTIVITY_ID"]:
        logger_tasks_error.error({
            "error": "The id of the related case is missing",
            "message": "Отсутствует CRM_ACTIVITY_ID",
            "data": data,
        })

    exist_activity = Phone.objects.filter(CALL_ID=data["CALL_ID"]).first()

    if exist_activity:
        serializer = CallsSerializer(exist_activity, data=data)
    else:
        serializer = CallsSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        logger_tasks_success.info({
            "message": "Звонок успешно сохранен",
            "id_call": data["CALL_ID"],
            "event": event,
            "result": serializer.data,
        })
        return serializer.data

    logger_tasks_error.error({
        "error": serializer.errors,
        "message": "Ошибка серриализации данных в объект звонка",
        "id_call": data["CALL_ID"],
    })
    return serializer.errors


# задача по сохранению пользователя
@celery_app.task
def user_task(user):
    data = {}
    event = user.get("event", "")
    data["ID"] = user.get("data[ID]", None)
    data["LAST_NAME"] = user.get("data[LAST_NAME]", None)
    data["NAME"] = user.get("data[NAME]", None)
    data["WORK_POSITION"] = user.get("data[WORK_POSITION]", None)

    # подразделение пользователя
    depart = user.get("data[UF_DEPARTMENT]", [])
    if depart:
        data["UF_DEPARTMENT"] = depart[0]

    # сотрудник уволен/не уволен
    active = user.get("ACTIVE", None)
    if active is not None:
        data["ACTIVE"] = active

    # url сотрудника в Битрикс
    data["URL"] = service.get_url_user(data["ID"])

    exist_user = User.objects.filter(ID=data["ID"]).first()

    if exist_user:
        serializer = UsersSerializer(exist_user, data=data)
    else:
        serializer = UsersSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        logger_tasks_success.info({
            "message": "Пользователь успешно сохранен",
            "id_user": data["ID"],
            "result": serializer.data,
        })
        return serializer.data

    logger_tasks_error.error({
        "error": serializer.errors,
        "message": "Ошибка серриализации данных в объект пользователя",
        "id_user": data["ID"]
    })
    return serializer.errors


# получение или сохранение активности
def update_or_save_activity(id_activity, active=True, duration=None, calls_start_date=None):
    time_start = time.time()
    # результат выполнения запроса на получение данных активности
    result_req_activity = bx24.call("crm.activity.get", {"id": id_activity})
    time_get_activity = time.time()

    if not result_req_activity or "result" not in result_req_activity:
        logger_tasks_error.error({
            "error": "No response came from BX24",
            "message": "При получении данных активности из Битрикс возникла ошибка",
            "id_activity": id_activity,
            "active": active,
            "result": result_req_activity,
        })
        return "No response came from BX24"

    # получение данных активности
    data_activity = result_req_activity["result"]
    # добавление статуса активности: удалена или нет
    data_activity["active"] = active
    if duration:
        data_activity["DURATION"] = duration
    if calls_start_date:
        data_activity["CALL_START_DATE"] = calls_start_date

    # id ответственного
    id_responsible = data_activity.get("RESPONSIBLE_ID", None)

    # получение или создание пользователя
    responsible = get_or_save_user(id_responsible)

    # список ссылок на фаилы прикрепленные к активности
    files = data_activity.get("FILES", None)

    # получение файла с телефонным разговором
    if files and isinstance(files, list) and len(files) > 0:
        file = data_activity["FILES"][0]
        data_activity["FILES"] = file.get("url", "")
    else:
        data_activity["FILES"] = ""

    # пробразование даты в объект даты
    data_activity["CREATED"] = service.convert_date_to_obj(data_activity["CREATED"])
    data_activity["END_TIME"] = service.convert_date_to_obj(data_activity["END_TIME"])

    company_id = None

    # получение ID компании из лида
    if data_activity["OWNER_TYPE_ID"] == "1" and data_activity["OWNER_ID"]:
        data = bx24.call("crm.lead.get", {"id": data_activity["OWNER_ID"]})
        company_id = data.get("result").get("COMPANY_ID")
        data_activity["OWNER_NAME"] = data.get("result").get("TITLE", None)

    # получение ID компании из сделки
    if data_activity["OWNER_TYPE_ID"] == "2" and data_activity["OWNER_ID"]:
        data = bx24.call("crm.deal.get", {"id": data_activity["OWNER_ID"]})
        company_id = data.get("result").get("COMPANY_ID")
        data_activity["OWNER_NAME"] = data.get("result").get("TITLE", None)

    # получение ID компании из контакта
    if data_activity["OWNER_TYPE_ID"] == "3" and data_activity["OWNER_ID"]:
        data = bx24.call("crm.contact.get", {"id": data_activity["OWNER_ID"]})
        company_id = data.get("result").get("COMPANY_ID")
        lastname = data.get("result").get("LAST_NAME", "")
        name = data.get("result").get("NAME", "")
        data_activity["OWNER_NAME"] = f"{lastname} {name}"

    # получение ID компании из компании
    if data_activity["OWNER_TYPE_ID"] == "4" and data_activity["OWNER_ID"]:
        data = bx24.call("crm.company.get", {"id": data_activity["OWNER_ID"]})
        company_id = data_activity["OWNER_ID"]
        data_activity["OWNER_NAME"] = data.get("result", {}).get("TITLE", None)

    time_get_company_id = time.time()

    # если id компании владельца активности не найден
    if not company_id:
        logger_tasks_error.error({
            "error": "There are no companies tied to the case",
            "message": "Не удалось получить id компании владельца активности",
            "id_activity": id_activity,
            "active": active,
            "result": result_req_activity,
        })
        return "There are no companies tied to the case"

    data_activity["COMPANY_ID"] = company_id

    # получение активности
    exist_activity = Activity.objects.filter(ID=id_activity).first()

    if exist_activity:
        serializer = ActivityFullSerializer(exist_activity, data=data_activity)
    else:
        serializer = ActivityFullSerializer(data=data_activity)

    if serializer.is_valid():
        serializer.save()
        logger_tasks_success.info({
            "message": "Активность успешно сохранена",
            "id_activity": id_activity,
            "duration_get_activity": time_get_company_id - time_start,
            "duration_get_comany":  time_get_activity - time_get_company_id,
            "active": active,
            "result": serializer.data,
        })
        return serializer.data

    logger_tasks_error.error({
        "error": serializer.errors,
        "message": "Ошибка серриализации данных в объект активности",
        "id_activity": id_activity,
        "duration_get_activity": time_get_company_id - time_start,
        "duration_get_comany": time_get_activity - time_get_company_id
    })
    return serializer.errors


# получение или сохранение пользователя
def get_or_save_user(id_user):
    exist_user = User.objects.filter(ID=id_user).first()

    if exist_user:
        return exist_user

    # результат выполнения запроса на получение данных пользователей
    data_user = bx24.call("user.get", {"id": id_user})

    if not data_user or "result" not in data_user or len(data_user["result"]) == 0:
        logger_tasks_error.error({
            "error": "No response came from BX24",
            "message": "При получении данных пользователя из Битрикс возникла ошибка",
            "id_user": id_user,
            "result": data_user,
        })
        return "No response came from BX24"

    # данные пользователя
    data = data_user["result"][0]

    # url пользователя в Битрикс
    data["URL"] = service.get_url_user(id_user)

    # подразделение пользователя
    department = data["UF_DEPARTMENT"]

    if isinstance(department, list) and len(department) != 0:
        data["UF_DEPARTMENT"] = department[0]
    else:
        data["UF_DEPARTMENT"] = None

    serializer = UsersSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        logger_tasks_success.info({
            "message": "Пользователь успешно сохранен",
            "id_user": id_user,
            "result": serializer.data,
        })
        return serializer.data

    logger_tasks_error.error({
        "error": serializer.errors,
        "message": "Ошибка серриализации данных в объект пользователя",
        "id_user": id_user
    })
    return serializer.errors


