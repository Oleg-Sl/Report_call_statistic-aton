from django_filters import rest_framework as filters


from activityapp.models import (
    Activity,
    Phone,
    User,
    CallingPlan,
    CountWorkingDays,
    ProductionCalendar,
    CallsPlan,
    Comment,
)


class CallsFilter(filters.FilterSet):
    CREATED = filters.DateFromToRangeFilter()
    CALL_DURATION = filters.NumberFilter(field_name='phone__CALL_DURATION', lookup_expr='gte')

    class Meta:
        model = Activity
        fields = ["RESPONSIBLE_ID", "CREATED", "CALL_DURATION", ]


class CommentFilter(filters.FilterSet):
    date_comment = filters.DateFromToRangeFilter()

    class Meta:
        model = Comment
        fields = ["recipient", "commentator", "date_comment", ]

