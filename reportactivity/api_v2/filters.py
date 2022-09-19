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


class CommentFilter(filters.FilterSet):
    date_comment = filters.DateFromToRangeFilter()

    class Meta:
        model = Comment
        fields = ["recipient", "commentator", "date_comment", ]
