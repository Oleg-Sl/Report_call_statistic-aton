from rest_framework import serializers
import calendar

from activityapp.models import (
    Activity,
    Phone,
    User,
    ProductionCalendar,
    CallsPlan,
    Comment,
)


class PhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phone
        fields = ('PHONE_NUMBER', 'CALL_DURATION', 'CALL_START_DATE', )


class ActivityFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'


class ActivitySerializer(serializers.ModelSerializer):
    phone = PhoneSerializer(many=True, read_only=True)

    class Meta:
        model = Activity
        fields = ('OWNER_TYPE_ID', 'OWNER_ID', 'CREATED', 'COMPANY_ID', 'OWNER_NAME', 'phone', )


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


class ProductionCalendarSerializer(serializers.ModelSerializer):
    month = serializers.IntegerField(read_only=True)
    day = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProductionCalendar
        fields = '__all__'


class CallsPlanSerializer(serializers.ModelSerializer):
    month = serializers.IntegerField(read_only=True)

    class Meta:
        model = CallsPlan
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    commentator_name = serializers.StringRelatedField(source='commentator.NAME', read_only=True)
    commentator_lastname = serializers.StringRelatedField(source='commentator.LAST_NAME', read_only=True)
    verified_name = serializers.StringRelatedField(source='verified_by_user.NAME', read_only=True)
    verified_lastname = serializers.StringRelatedField(source='verified_by_user.LAST_NAME', read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'



