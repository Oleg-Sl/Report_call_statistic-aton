from django.contrib import admin
from .models import (Activity, Phone, User, ProductionCalendar, CallsPlan, Comment, )


admin.site.register(Activity)
admin.site.register(Phone)
admin.site.register(User)
# admin.site.register(CallingPlan)
# admin.site.register(CountWorkingDays)
admin.site.register(ProductionCalendar)
admin.site.register(CallsPlan)
admin.site.register(Comment)


