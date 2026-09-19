import uuid
import datetime
from django.utils import timezone
from apps.orders.models import Order
from .models import Policy


class PolicyService:
    @classmethod
    def issue_policy_for_order(cls, order: Order) -> Policy:
        # Check if already issued
        if hasattr(order, 'policy'):
            return order.policy

        snapshot = order.order_snapshot or {}
        breakdown = snapshot.get('breakdown', {})
        start_date = snapshot.get('start_date')
        end_date = snapshot.get('end_date')

        # Fallback to quote if snapshot is missing dates
        if not start_date and order.quote:
            start_date = order.quote.start_date
            end_date = order.quote.end_date

        if isinstance(start_date, str):
            try:
                start_date = datetime.datetime.strptime(start_date[:10], '%Y-%m-%d').date()
            except Exception:
                start_date = timezone.now().date()
        if isinstance(end_date, str):
            try:
                end_date = datetime.datetime.strptime(end_date[:10], '%Y-%m-%d').date()
            except Exception:
                end_date = timezone.now().date()

        destination_name = snapshot.get('destination', 'Worldwide')
        plan_name = snapshot.get('plan_name', 'Standard')

        travelers = list(order.travelers.all())
        insured_persons = []
        for t in travelers:
            masked_passport = t.passport_number[:2] + '****' + t.passport_number[-2:] if len(t.passport_number) > 4 else '****'
            insured_persons.append({
                'full_name': t.full_name,
                'first_name': t.first_name,
                'last_name': t.last_name,
                'date_of_birth': str(t.date_of_birth),
                'gender': t.gender,
                'nationality': t.nationality,
                'masked_passport': masked_passport,
                'is_primary': t.is_primary,
            })

        policy_number = Policy.generate_policy_number()
        provider_id = f"PRV-{uuid.uuid4().hex[:8].upper()}"

        certificate_data = {
            'policy_number': policy_number,
            'provider_reference': provider_id,
            'order_number': order.order_number,
            'issue_date': timezone.now().isoformat(),
            'valid_from': start_date.isoformat() if hasattr(start_date, 'isoformat') else str(start_date),
            'valid_until': end_date.isoformat() if hasattr(end_date, 'isoformat') else str(end_date),
            'territory': destination_name,
            'plan_name': plan_name,
            'buyer': {
                'name': order.contact_full_name,
                'email': order.contact_email,
                'phone': order.contact_phone,
            },
            'insured_travelers': insured_persons,
            'premium_paid': {
                'amount': float(order.total),
                'currency': order.currency,
            },
            'emergency_assistance': {
                'hotline': '+380 44 590 55 55 / +44 20 7946 0192',
                'email': 'support@tayaratravelinsurance.com',
                'viber_whatsapp': '+380 67 123 4567',
                'available_24_7': True,
            },
            'terms_and_conditions_url': 'https://tayaratravelinsurance.com/terms',
        }

        # Determine clean medical limit display (e.g. €30,000)
        med_limit = snapshot.get('medical_limit')
        if not med_limit and order.quote and order.quote.plan:
            med_limit = order.quote.plan.medical_limit_display
        if not med_limit:
            code = snapshot.get('plan_code', '').upper()
            if code == 'START':
                med_limit = '€30,000'
            elif code == 'COMFORT':
                med_limit = '€50,000'
            elif code == 'PREMIUM':
                med_limit = '€100,000'
            else:
                med_limit = '€30,000'

        policy = Policy.objects.create(
            policy_number=policy_number,
            order=order,
            provider_policy_id=provider_id,
            start_date=start_date,
            end_date=end_date,
            destination_name=destination_name,
            plan_name=plan_name,
            medical_limit=med_limit,
            status=Policy.Status.ISSUED,
            certificate_data=certificate_data,
            issued_at=timezone.now(),
        )

        policy.update_status_by_dates()
        policy.save(update_fields=['status'])

        order.status = Order.Status.ISSUED
        order.save(update_fields=['status'])

        return policy
