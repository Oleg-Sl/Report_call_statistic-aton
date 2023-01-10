from django.db import models


class User(models.Model):
    """ Список пользователей.
    Метод: user.get;
    Поля: id пользователя в BX24, имя, фамилия, отчество, url фотографии, должность """
    ALLOWED_EDIT_CHOICE = (
        ('0', 'Запрещено'),
        ('1', 'Ограниченно разрешено'),
        ('2', 'Разрешено'),
    )
    ID = models.PositiveIntegerField(primary_key=True, verbose_name='ID пользователя в BX24',
                                     unique=True, db_index=True)
    LAST_NAME = models.CharField(verbose_name='Фамилия', max_length=35, blank=True, null=True)
    NAME = models.CharField(verbose_name='Имя', max_length=35, blank=True, null=True)
    WORK_POSITION = models.CharField(verbose_name='Должность', max_length=75, blank=True, null=True)
    UF_DEPARTMENT = models.PositiveIntegerField(verbose_name='ID департамета', db_index=True)

    ACTIVE = models.BooleanField(verbose_name='Пользователь активен (не уволен)', default=True, db_index=True)
    URL = models.URLField(verbose_name='URL пользователя', max_length=150)

    STATUS_DISPLAY = models.BooleanField(verbose_name='Вывод пользователя в статистике подразделения', default=True, db_index=True)
    # ALLOWED_EDIT = models.BooleanField(verbose_name='Может редактировать план по звонкам и кол-во рабочих дней', default=False)
    ALLOWED_EDIT = models.CharField(verbose_name='Доступ к редактированию данных', max_length=1,
                                    choices=ALLOWED_EDIT_CHOICE, default="0")
    ALLOWED_SETTING = models.BooleanField(verbose_name='Доступ к настройкам приложения', default=False)
    ALLOWED_STATUS_DAY = models.BooleanField(verbose_name='Доступ к изменению статуса дня', default=False)
    ALLOWED_VERIFICATION_MSG = models.BooleanField(verbose_name='Доступ к верификации сообщений', default=False)

    def __str__(self):
        return '{} {}'.format(self.LAST_NAME or "-", self.NAME or "")

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'


class Activity(models.Model):
    COMPLETED_CHOICE = (
        ('Y', 'Завернено'),
        ('N', 'Не завершено'),
    )
    DIRECTION_CHOICE = (
        ('0', '-'),
        ('1', 'Входящее'),
        ('2', 'Исходящее'),
    )
    TYPE_CHOICE = (
        ('1', 'Встреча'),
        ('2', 'Звонок'),
        ('3', 'Задача'),
        ('4', 'Письмо'),
    )
    OWNER_TYPE_CHOICE = (
        ('1', 'Лид'),
        ('2', 'Сделка'),
        ('3', 'Контакт'),
        ('4', 'Компания'),
    )
    STATUS_CHOICE = (
        ('0', '-'),
        ('1', '-'),
        ('2', 'Ожидается'),
        ('3', 'Завершено'),
        ('4', 'Завершено автоматически'),
    )

    ID = models.PositiveIntegerField(primary_key=True, verbose_name='ID дела в BX24', unique=True, db_index=True)
    COMPANY_ID = models.PositiveIntegerField(verbose_name='ID компании в BX24')
    COMPLETED = models.CharField(verbose_name='Заершено дело или нет', max_length=1, choices=COMPLETED_CHOICE)
    DIRECTION = models.CharField(verbose_name='Направление дела (входящее/исходящее)', max_length=1,
                                 choices=DIRECTION_CHOICE, db_index=True)
    TYPE_ID = models.CharField(verbose_name='Тип дела (встреча/звонрок/...)', max_length=1,
                               choices=TYPE_CHOICE, db_index=True)
    STATUS = models.CharField(verbose_name='Статус дела', max_length=1, choices=STATUS_CHOICE)
    OWNER_TYPE_ID = models.CharField(verbose_name='Тип сущности к которой привязан звонок', max_length=1,
                                     blank=True, null=True, choices=OWNER_TYPE_CHOICE)
    OWNER_ID = models.PositiveIntegerField(verbose_name='ID сущности к которой привязан звонок',
                                           blank=True, null=True)
    OWNER_NAME = models.CharField(verbose_name='Название сущности к которой привязан звонок', max_length=350,
                                  blank=True, null=True)
    CREATED = models.DateTimeField(verbose_name='Дата создания дела', blank=True, null=True, db_index=True)
    END_TIME = models.DateTimeField(verbose_name='Дата завершения дела', blank=True, null=True)
    FILES = models.URLField(verbose_name='URL привязанного файла', max_length=250, blank=True, null=True)
    active = models.BooleanField(verbose_name='Дело не удалено из Битрикс24', default=True, db_index=True)
    # DURATION = models.PositiveIntegerField(verbose_name='Длительность звонка', db_index=True, blank=True, null=True)

    RESPONSIBLE_ID = models.ForeignKey(User, verbose_name='Пользователь', on_delete=models.SET_NULL,
                                       related_name='activity', blank=True, null=True, db_index=True)

    def __str__(self):
        return str(self.ID) or "-"

    class Meta:
        verbose_name = 'Дело'
        verbose_name_plural = 'Дела'


class Phone(models.Model):
    CALL_TYPE_CHOICE = (
        ('1', 'Исходящий'),
        ('2', 'Входящий'),
        ('3', 'Входящий с перенаправлением'),
        ('4', 'Обратный звонок'),
    )
    CALL_ID = models.CharField(verbose_name='ID звонка в BX24', max_length=75, unique=True, db_index=True)
    CALL_TYPE = models.CharField(verbose_name='Тип звонка', max_length=1, choices=CALL_TYPE_CHOICE)
    PHONE_NUMBER = models.CharField(verbose_name='Номер телефона', max_length=20, blank=True, null=True)
    # PORTAL_USER_ID = models.PositiveIntegerField(verbose_name='ID пользователя в BX24')
    CALL_DURATION = models.PositiveIntegerField(verbose_name='Длительность звонка', db_index=True)
    CALL_START_DATE = models.DateTimeField(verbose_name='Дата начала звонка', db_index=True)

    CRM_ACTIVITY_ID = models.ForeignKey(Activity, verbose_name='Дело', on_delete=models.SET_NULL,
                                        related_name='phone', blank=True, null=True, db_index=True)
    PORTAL_USER_ID = models.ForeignKey(User, verbose_name='Пользователь', on_delete=models.SET_NULL,
                                       related_name='phone', blank=True, null=True, db_index=True)

    def __str__(self):
        return self.CALL_ID or "-"
        # return self.ID or "-"

    class Meta:
        verbose_name = 'Звонок'
        verbose_name_plural = 'Звонки'


class ProductionCalendar(models.Model):
    DAY_TYPE_CHOICE = (
        ('week', 'Не рабочий день'),
        ('work', 'Рабочий день'),
    )
    date_calendar = models.DateField(verbose_name='Дата', unique=True)
    status = models.CharField(verbose_name='Статус дня (рабочий/нерабочий)', max_length=4, choices=DAY_TYPE_CHOICE,
                              default="work")

    def __str__(self):
        return f"{self.date_calendar.day}.{self.date_calendar.month}.{self.date_calendar.year}"

    class Meta:
        verbose_name = 'День из роизводственного календаря (NEW)'
        verbose_name_plural = 'Производственный календарь (NEW)'


class CallsPlan(models.Model):
    calendar = models.ForeignKey(ProductionCalendar, verbose_name='Дата из производственного календаря',
                                 on_delete=models.CASCADE, related_name='call_plan')
    employee = models.ForeignKey(User, verbose_name='Работник', on_delete=models.CASCADE, related_name='call_plan')
    count_calls = models.IntegerField(verbose_name='Количество звонков', blank=True, null=True)
    plan_completed = models.BooleanField(verbose_name='План на день выполнен', default=False)

    def __str__(self):
        return f"{self.employee.LAST_NAME} {self.employee.NAME} - " \
               f"{self.calendar.date_calendar.day}.{self.calendar.date_calendar.month}.{self.calendar.date_calendar.year}"

    class Meta:
        unique_together = ('calendar', 'employee')
        verbose_name = 'План по звонкам на день (NEW)'
        verbose_name_plural = 'План по звонкам (NEW)'


class Comment(models.Model):
    recipient = models.ForeignKey(User, verbose_name='Получатель', on_delete=models.CASCADE, related_name='recipient', db_index=True)
    commentator = models.ForeignKey(User, verbose_name='Комментатор', on_delete=models.CASCADE, related_name='commentator')
    date_comment = models.DateField(verbose_name='Дата комментария', db_index=True)
    date_comment_add = models.DateTimeField(verbose_name='Дата добавления комментария', db_index=True)
    comment = models.TextField(verbose_name='Комментарий')

    verified = models.BooleanField(verbose_name='Комментарий подтвержден', default=False)
    verified_by_user = models.ForeignKey(User, verbose_name='Пользователь который подтвердил комментарий',
                                         on_delete=models.CASCADE, related_name='verified_by_user', blank=True, null=True)
    date_verified = models.DateTimeField(verbose_name='Дата подтверждения', blank=True, null=True)

    def __str__(self):
        return f"{self.recipient.LAST_NAME} {self.recipient.NAME}: {self.date_comment}"

    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'








class CallingPlan(models.Model):
    date_plan_calls = models.DateField(verbose_name='Дата плана звонка')
    count_calls = models.IntegerField(verbose_name='Количество звонков', blank=True, null=True)
    employee = models.ForeignKey(User, verbose_name='Работник', on_delete=models.SET_NULL, related_name='calls_plan',
                                 blank=True, null=True)

    def __str__(self):
        return f"{self.employee.LAST_NAME} {self.employee.NAME}"

    class Meta:
        verbose_name = 'Планируемое кол-во звонков в месяц (OLD)'
        verbose_name_plural = 'План по звонкам в месяц (OLD)'


class CountWorkingDays(models.Model):
    date_count_working = models.DateField(verbose_name='Дата записи')
    count_working_days = models.IntegerField(verbose_name='Количество звонков')

    def __str__(self):
        return f"{self.date_count_working.year} - {self.date_count_working.month}"

    class Meta:
        verbose_name = 'Количество рабочих дней в месяце (OLD)'
        verbose_name_plural = 'Количество рабочих дней в месяце (OLD)'
