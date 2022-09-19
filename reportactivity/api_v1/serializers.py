from rest_framework import serializers


import calendar


from activityapp.models import (Activity, Phone, User, CallingPlan, CountWorkingDays, ProductionCalendar, CallsPlan)


class ActivitySerializer(serializers.ModelSerializer):

    class Meta:
        model = Activity
        fields = '__all__'


class CallsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Phone
        fields = '__all__'


class UsersUpdateSerializer(serializers.ModelSerializer):
    ID = serializers.IntegerField(read_only=True)
    UF_DEPARTMENT = serializers.IntegerField(read_only=True)
    URL = serializers.URLField(read_only=True)

    class Meta:
        model = User
        fields = '__all__'


class UsersSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'


class CallingPlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = CallingPlan
        fields = '__all__'


class ProductionCalendarSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductionCalendar
        fields = '__all__'


class CallsPlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = CallsPlan
        fields = '__all__'


class CountWorkingDaysSerializer(serializers.ModelSerializer):
    month = serializers.IntegerField(read_only=True)

    class Meta:
        model = CountWorkingDays
        fields = '__all__'


class RationActivitySerializer(serializers.ModelSerializer):
    DURATION = serializers.IntegerField()

    class Meta:
        model = Activity
        fields = ("ID", "COMPANY_ID", "DURATION", "FILES", "END_TIME")


class RationActiveByMonthSerializer(serializers.ModelSerializer):
    data_by_month = serializers.SerializerMethodField(source='get_data_by_month', read_only=True)

    class Meta:
        model = User
        # fields = '__all__'
        fields = ("ID", "LAST_NAME", "NAME", "URL", "data_by_month")

    # формирование поля с данными по месяцам
    def get_data_by_month(self, obj):
        data = {}

        for num in range(1, 13):
            calls_lst = self.get_list_items_for_month(obj.calls_lst, num)               # список звонков за месяц
            meeting_lst = self.get_list_items_for_month(obj.meeting_lst, num)           # список встреч за месяц
            calls_plan = self.get_list_items_for_month(obj.count_calls_plan, num)       # список встреч за месяц
            count_calls_plan = None
            if calls_plan:
                count_calls_plan = calls_plan[0].count_calls

            data[num] = {
                "calls": RationActivitySerializer(calls_lst, many=True, read_only=True).data,
                "count_calls": len(calls_lst),
                "meeting": RationActivitySerializer(meeting_lst, many=True, read_only=True).data,
                "count_meeting": len(meeting_lst),
                "count_calls_plan": count_calls_plan,
            }

        return data

    @staticmethod
    def get_list_items_for_month(items_lst, month):
        return [item for item in items_lst if item.MONTH == month]


class RationActiveByDaySerializer(serializers.ModelSerializer):
    data_by_day = serializers.SerializerMethodField(source='get_data_by_day', read_only=True)
    count_calls_plan = serializers.IntegerField(read_only=True)
    # count_calls_fact = serializers.IntegerField(read_only=True)
    count_calls_fact = serializers.SerializerMethodField(source='get_count_calls_fact', read_only=True)

    class Meta:
        model = User
        fields = ("ID", "LAST_NAME", "NAME", "URL", "count_calls_fact", "count_calls_plan", "data_by_day")
    
    def get_count_calls_fact(self, obj):
        return len(obj.calls_lst)

    # формирование поля с данными по дням
    def get_data_by_day(self, obj):
        data = {}
        count_day = calendar.monthrange(int(obj.year), int(obj.month))[1]                     # количество дней в месяце

        for num in range(1, count_day + 1):
            calls_lst = self.get_list_items_for_day(obj.calls_lst, num)             # список звонков за день
            meeting_lst = self.get_list_items_for_day(obj.meeting_lst, num)         # список встреч за день
            data[num] = {
                "calls": RationActivitySerializer(calls_lst, many=True, read_only=True).data,
                "count_calls": len(calls_lst),
                "meeting": RationActivitySerializer(meeting_lst, many=True, read_only=True).data,
                "count_meeting": len(meeting_lst),
            }

        return data

    @staticmethod
    def get_list_items_for_day(items_lst, month):
        return [item for item in items_lst if item.DAY == month]




