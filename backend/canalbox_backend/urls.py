from django.contrib import admin
from django.urls import path, include
from vouchers.views import captive_portal_login

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/vouchers/', include('vouchers.urls')),
    path('login/', captive_portal_login, name='captive-portal-login'),
] 