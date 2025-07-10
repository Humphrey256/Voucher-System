from django.urls import path
from .views import VoucherListCreateView, VoucherExportView, VoucherStatsView, VoucherActivityView, VoucherDetailView, captive_portal_login

urlpatterns = [
    path('', VoucherListCreateView.as_view(), name='voucher-list-create'),
    path('<int:id>/', VoucherDetailView.as_view(), name='voucher-detail'),
    path('export/', VoucherExportView.as_view(), name='voucher-export'),
    path('stats/', VoucherStatsView.as_view(), name='voucher-stats'),
    path('activity/', VoucherActivityView.as_view(), name='voucher-activity'),
    path('login/', captive_portal_login, name='captive-portal-login'),
] 