from django.db import models
import random
import string

class Voucher(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('used', 'Used'),
        ('expired', 'Expired'),
        ('disabled', 'Disabled'),
    ]
    code = models.CharField(max_length=32, unique=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    duration = models.CharField(max_length=16)
    data_limit = models.CharField(max_length=16)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.code

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_code()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_code():
        prefix = "MRNI"
        suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"{prefix}-{suffix}" 