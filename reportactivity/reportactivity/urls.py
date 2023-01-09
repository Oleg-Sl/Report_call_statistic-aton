from django.contrib import admin
from django.urls import path, include
from django.conf import settings


urlpatterns = [
    path('calls-statistic/admin/', admin.site.urls),
    path('calls-statistic/api/v1/', include('api_v1.urls', namespace='api_v1')),
    path('calls-statistic/api/v2/', include('api_v2.urls', namespace='api_v2')),

    # используется сейчас
    path('calls-statistic/api/v3/', include('api_v3.urls', namespace='api_v3')),



    path('calls-statistic/auth/', include('djoser.urls')),
    path('calls-statistic/auth/', include('djoser.urls.jwt')),
]

urlpatterns += [path('calls-statistic/silk/', include('silk.urls', namespace='silk'))]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [path('calls-statistic/__debug__/', include(debug_toolbar.urls))]
