from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('calls-statistic/admin/', admin.site.urls),
    path('calls-statistic/api/v1/', include('api_v1.urls', namespace='api_v1')),
    path('calls-statistic/api/v2/', include('api_v2.urls', namespace='api_v2')),
    path('calls-statistic/api/v3/', include('api_v3.urls', namespace='api_v3')),

    path('calls-statistic/auth/', include('djoser.urls')),
    path('calls-statistic/auth/', include('djoser.urls.jwt')),
]
