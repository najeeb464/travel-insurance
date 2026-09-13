import uuid
from django.db import models
from django.utils import timezone
from apps.common.models import TimeStampedModel
from apps.orders.models import Order


class Policy(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING_ISSUANCE = 'PENDING_ISSUANCE', 'Pending Issuance'
        ISSUED = 'ISSUED', 'Issued'
        ACTIVE = 'ACTIVE', 'Active'
        EXPIRED = 'EXPIRED', 'Expired'
        CANCELLED = 'CANCELLED', 'Cancelled'
        REFUNDED = 'REFUNDED', 'Refunded'

    policy_number = models.CharField(max_length=50, unique=True, db_index=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='policy')
    provider_policy_id = models.CharField(max_length=100, blank=True, null=True)

    start_date = models.DateField()
    end_date = models.DateField()
    destination_name = models.CharField(max_length=200)
    plan_name = models.CharField(max_length=100)
    medical_limit = models.CharField(max_length=100, default='€30,000')

    status = models.CharField(max_length=25, choices=Status.choices, default=Status.ISSUED)
    certificate_data = models.JSONField(default=dict, blank=True, help_text="Complete electronic certificate and terms payload")
    issued_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name_plural = 'Policies'
        ordering = ['-issued_at']

    def __str__(self):
        return f"{self.policy_number} - {self.destination_name} ({self.get_status_display()})"

    @classmethod
    def generate_policy_number(cls):
        now = timezone.now()
        hex_suffix = uuid.uuid4().hex[:7].upper()
        return f"TAVARA-{now.year}-{hex_suffix}"

    @property
    def is_currently_active(self):
        today = timezone.now().date()
        if self.status in [self.Status.CANCELLED, self.Status.REFUNDED]:
            return False
        start_d = self.start_date if not isinstance(self.start_date, str) else timezone.datetime.fromisoformat(self.start_date).date()
        end_d = self.end_date if not isinstance(self.end_date, str) else timezone.datetime.fromisoformat(self.end_date).date()
        return start_d <= today <= end_d

    def update_status_by_dates(self):
        today = timezone.now().date()
        if self.status in [self.Status.CANCELLED, self.Status.REFUNDED]:
            return
        start_d = self.start_date if not isinstance(self.start_date, str) else timezone.datetime.fromisoformat(self.start_date).date()
        end_d = self.end_date if not isinstance(self.end_date, str) else timezone.datetime.fromisoformat(self.end_date).date()
        if today > end_d:
            self.status = self.Status.EXPIRED
        elif start_d <= today <= end_d:
            self.status = self.Status.ACTIVE
        else:
            self.status = self.Status.ISSUED
