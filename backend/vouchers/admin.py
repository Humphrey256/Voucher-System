from django.contrib import admin
from .models import Voucher

@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ('code', 'status', 'duration', 'data_limit', 'created_at', 'expires_at') 