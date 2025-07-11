from django.contrib import admin
from django.urls import path, include
from vouchers.views import captive_portal_login
from django.views.generic import TemplateView
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/vouchers/', include('vouchers.urls')),
    path('login/', captive_portal_login, name='captive-portal-login'),
    # Catch-all route for SPA frontend
    re_path(r'^(?!api/|admin/|login/).*$', TemplateView.as_view(template_name="index.html")),
] 