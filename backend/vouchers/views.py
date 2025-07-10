from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.http import HttpResponse
from .models import Voucher
from .serializers import VoucherSerializer
import csv
from django.utils import timezone
from django.db.models import Count
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta
import re

class VoucherListCreateView(generics.ListCreateAPIView):
    queryset = Voucher.objects.all().order_by('-created_at')
    serializer_class = VoucherSerializer

    def create(self, request, *args, **kwargs):
        quantity = int(request.data.get('quantity', 1))
        vouchers = []
        errors = []
        for _ in range(quantity):
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                vouchers.append(serializer.data)
            else:
                errors.append(serializer.errors)
        if errors:
            return Response({'errors': errors, 'created': vouchers}, status=status.HTTP_400_BAD_REQUEST)
        headers = self.get_success_headers(serializer.data)
        return Response(vouchers, status=status.HTTP_201_CREATED, headers=headers)

class VoucherDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    lookup_field = "id"

class VoucherExportView(APIView):
    def get(self, request):
        vouchers = Voucher.objects.all()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="vouchers.csv"'
        writer = csv.writer(response)
        writer.writerow(['code', 'status', 'duration', 'data_limit', 'created_at', 'used_at', 'expires_at'])
        for v in vouchers:
            writer.writerow([
                v.code, v.status, v.duration, v.data_limit,
                v.created_at, v.used_at, v.expires_at
            ])
        return response

class VoucherStatsView(APIView):
    def get(self, request):
        total = Voucher.objects.count()
        active = Voucher.objects.filter(status='active').count()
        used_today = Voucher.objects.filter(status='used', used_at__date=timezone.now().date()).count()
        success_rate = 0
        used = Voucher.objects.filter(status='used').count()
        if total > 0:
            success_rate = round((used / total) * 100, 1)
        return Response({
            'total': total,
            'active': active,
            'used_today': used_today,
            'success_rate': f'{success_rate}%'
        })

class VoucherActivityView(APIView):
    def get(self, request):
        recent = Voucher.objects.order_by('-created_at')[:10]
        data = [
            {
                'code': v.code,
                'status': v.status,
                'time': v.created_at.strftime('%Y-%m-%d %H:%M')
            }
            for v in recent
        ]
        return Response(data)

@csrf_exempt
def captive_portal_login(request):
    message = None
    if request.method == 'POST':
        code = request.POST.get('code', '').strip()
        try:
            voucher = Voucher.objects.get(code=code, status='active')
            now = timezone.now()
            voucher.status = 'used'
            voucher.used_at = now
            # Parse duration and set expires_at
            duration = voucher.duration.lower()
            match = re.match(r"(\d+)([mhd])", duration)
            if match:
                value, unit = int(match.group(1)), match.group(2)
                if unit == 'm':
                    delta = timedelta(minutes=value)
                elif unit == 'h':
                    delta = timedelta(hours=value)
                elif unit == 'd':
                    delta = timedelta(days=value)
                else:
                    delta = timedelta(hours=1)
                voucher.expires_at = now + delta
            else:
                voucher.expires_at = now + timedelta(hours=1)
            voucher.save()
            message = f"Voucher {code} accepted! You are now connected."
        except Voucher.DoesNotExist:
            message = "Invalid or already used voucher code."
    return render(request, 'vouchers/captive_portal_login.html', {'message': message}) 