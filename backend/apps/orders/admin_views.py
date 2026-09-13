from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from rest_framework import views, permissions, status
from rest_framework.response import Response

from apps.accounts.models import User
from apps.orders.models import Order
from apps.policies.models import Policy
from apps.quotations.models import Quote
from apps.payments.models import Payment
from apps.refunds.models import RefundRequest
from apps.refunds.serializers import RefundRequestSerializer


class IsAdminOrStaff(permissions.BasePermission):
    """
    Allows access only to staff, superusers, or users with role ADMIN/STAFF.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return bool(
            user.is_staff or 
            user.is_superuser or 
            getattr(user, 'role', None) in [User.Role.ADMIN, User.Role.STAFF]
        )


class AdminStatisticsView(views.APIView):
    """
    Comprehensive statistical endpoint for the Tavara Admin Dashboard.
    Aggregates metrics for customers, policies, orders, quotes, payments, and refunds.
    """
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        now = timezone.now()
        today = now.date()

        # 1. Overview metrics
        total_customers = User.objects.filter(
            Q(role=User.Role.CUSTOMER) | Q(is_staff=False, is_superuser=False)
        ).distinct().count()

        total_policies = Policy.objects.count()
        active_policies = Policy.objects.filter(
            status__in=[Policy.Status.ISSUED, Policy.Status.ACTIVE],
            start_date__lte=today,
            end_date__gte=today
        ).count()

        total_orders = Order.objects.count()
        paid_or_issued_orders = Order.objects.filter(status__in=[Order.Status.PAID, Order.Status.ISSUED])
        gross_revenue_agg = paid_or_issued_orders.aggregate(total=Sum('total'))['total'] or 0.00
        gross_revenue = float(gross_revenue_agg)
        paid_count = paid_or_issued_orders.count()
        avg_order_value = round(gross_revenue / paid_count, 2) if paid_count > 0 else 0.0

        total_quotes = Quote.objects.count()
        converted_quotes = Quote.objects.filter(status=Quote.Status.CONVERTED).count()
        quote_conversion_rate = round((converted_quotes / total_quotes) * 100, 1) if total_quotes > 0 else 0.0
        order_completion_rate = round((paid_count / total_orders) * 100, 1) if total_orders > 0 else 0.0

        total_refunds_count = RefundRequest.objects.count()
        pending_refunds_count = RefundRequest.objects.filter(
            status__in=[RefundRequest.Status.REQUESTED, RefundRequest.Status.UNDER_REVIEW, RefundRequest.Status.PROCESSING]
        ).count()
        refunded_amount_agg = RefundRequest.objects.filter(
            status__in=[RefundRequest.Status.APPROVED, RefundRequest.Status.COMPLETED]
        ).aggregate(total=Sum('requested_amount'))['total'] or 0.00
        total_refunded_amount = float(refunded_amount_agg)

        overview = {
            'total_customers': total_customers,
            'total_policies': total_policies,
            'active_policies': active_policies,
            'total_orders': total_orders,
            'paid_or_issued_orders': paid_count,
            'order_completion_rate': order_completion_rate,
            'total_quotes': total_quotes,
            'converted_quotes': converted_quotes,
            'quote_conversion_rate': quote_conversion_rate,
            'gross_revenue': gross_revenue,
            'avg_order_value': avg_order_value,
            'currency': 'EUR',
            'total_refunds_count': total_refunds_count,
            'pending_refunds_count': pending_refunds_count,
            'total_refunded_amount': total_refunded_amount,
        }

        # 2. Orders breakdown by status
        order_status_counts = Order.objects.values('status').annotate(count=Count('id')).order_by('-count')
        order_breakdown = {item['status']: item['count'] for item in order_status_counts}
        for s in [Order.Status.ISSUED, Order.Status.PAID, Order.Status.PENDING_PAYMENT, Order.Status.CANCELLED, Order.Status.REFUNDED, Order.Status.FAILED]:
            order_breakdown.setdefault(s, 0)

        # 3. Quotes breakdown by status
        quote_status_counts = Quote.objects.values('status').annotate(count=Count('id')).order_by('-count')
        quote_breakdown = {item['status']: item['count'] for item in quote_status_counts}
        for s in [Quote.Status.CALCULATED, Quote.Status.CONVERTED, Quote.Status.EXPIRED, Quote.Status.CANCELLED]:
            quote_breakdown.setdefault(s, 0)

        # 4. Top Destinations breakdown
        destination_counts = Policy.objects.values('destination_name').annotate(
            policy_count=Count('id')
        ).order_by('-policy_count')[:8]
        destinations_breakdown = [
            {'destination': item['destination_name'], 'count': item['policy_count']}
            for item in destination_counts
        ]

        # 5. Plans breakdown
        plan_counts = Policy.objects.values('plan_name').annotate(
            policy_count=Count('id')
        ).order_by('-policy_count')
        plans_breakdown = [
            {'plan': item['plan_name'], 'count': item['policy_count']}
            for item in plan_counts
        ]

        # 6. Payment providers summary
        payment_stats = Payment.objects.values('provider').annotate(
            total_count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('-total_amount')
        payment_breakdown = [
            {
                'provider': item['provider'],
                'count': item['total_count'],
                'volume': float(item['total_amount'] or 0.0)
            }
            for item in payment_stats
        ]

        # 7. Recent Orders (top 20)
        recent_orders_qs = Order.objects.select_related('customer').prefetch_related('policy').order_by('-created_at')[:20]
        recent_orders = [
            {
                'id': ord.id,
                'order_number': ord.order_number,
                'contact_email': ord.contact_email,
                'contact_full_name': ord.contact_full_name,
                'contact_phone': ord.contact_phone,
                'total': float(ord.total),
                'currency': ord.currency,
                'status': ord.status,
                'policy_number': ord.policy.policy_number if hasattr(ord, 'policy') else None,
                'created_at': ord.created_at.isoformat(),
            }
            for ord in recent_orders_qs
        ]

        # 8. Recent Policies (top 20)
        recent_policies_qs = Policy.objects.select_related('order').order_by('-issued_at')[:20]
        recent_policies = [
            {
                'id': pol.id,
                'policy_number': pol.policy_number,
                'order_number': pol.order.order_number if pol.order else None,
                'contact_name': pol.order.contact_full_name if pol.order else 'N/A',
                'contact_email': pol.order.contact_email if pol.order else 'N/A',
                'destination_name': pol.destination_name,
                'plan_name': pol.plan_name,
                'medical_limit': pol.medical_limit,
                'start_date': str(pol.start_date),
                'end_date': str(pol.end_date),
                'status': pol.status,
                'issued_at': pol.issued_at.isoformat() if pol.issued_at else None,
            }
            for pol in recent_policies_qs
        ]

        # 9. Recent Quotes (top 20)
        recent_quotes_qs = Quote.objects.select_related('destination', 'plan').order_by('-created_at')[:20]
        recent_quotes = [
            {
                'id': q.id,
                'quote_number': q.quote_number,
                'destination_name': q.destination.name if q.destination else 'N/A',
                'plan_name': q.plan.name if q.plan else 'N/A',
                'total': float(q.total),
                'currency': q.currency,
                'status': q.status,
                'created_at': q.created_at.isoformat(),
            }
            for q in recent_quotes_qs
        ]

        # 10. Recent Refunds (top 20)
        recent_refunds_qs = RefundRequest.objects.select_related('order').order_by('-created_at')[:20]
        recent_refunds = [
            {
                'id': ref.id,
                'order_number': ref.order.order_number if ref.order else 'N/A',
                'contact_email': ref.contact_email,
                'reason': ref.reason,
                'requested_amount': float(ref.requested_amount),
                'currency': ref.currency,
                'status': ref.status,
                'admin_notes': ref.admin_notes,
                'created_at': ref.created_at.isoformat(),
                'processed_at': ref.processed_at.isoformat() if ref.processed_at else None,
            }
            for ref in recent_refunds_qs
        ]

        # 11. Recent Customers (top 20)
        recent_customers_qs = User.objects.filter(
            Q(role=User.Role.CUSTOMER) | Q(is_staff=False)
        ).annotate(orders_count=Count('orders')).order_by('-date_joined')[:20]
        recent_customers = [
            {
                'id': cust.id,
                'email': cust.email,
                'username': cust.username,
                'first_name': cust.first_name,
                'last_name': cust.last_name,
                'phone_number': getattr(cust, 'phone_number', ''),
                'role': cust.role,
                'orders_count': cust.orders_count,
                'date_joined': cust.date_joined.isoformat(),
            }
            for cust in recent_customers_qs
        ]

        return Response({
            'overview': overview,
            'order_breakdown': order_breakdown,
            'quote_breakdown': quote_breakdown,
            'destinations_breakdown': destinations_breakdown,
            'plans_breakdown': plans_breakdown,
            'payment_breakdown': payment_breakdown,
            'recent_orders': recent_orders,
            'recent_policies': recent_policies,
            'recent_quotes': recent_quotes,
            'recent_refunds': recent_refunds,
            'recent_customers': recent_customers,
            'generated_at': now.isoformat(),
        })


class AdminRefundActionView(views.APIView):
    """
    Allows admin/staff to approve or reject a refund request.
    If approved:
      - marks refund COMPLETED
      - marks order REFUNDED
      - marks attached policy REFUNDED
    """
    permission_classes = [IsAdminOrStaff]

    def post(self, request, pk):
        action = request.data.get('action', '').strip().lower()
        notes = request.data.get('notes', '').strip()

        if action not in ['approve', 'reject']:
            return Response(
                {'error': "Invalid action. Supported actions: 'approve', 'reject'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            refund = RefundRequest.objects.select_related('order').get(pk=pk)
        except RefundRequest.DoesNotExist:
            return Response({'error': 'Refund request not found'}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()

        if action == 'approve':
            refund.status = RefundRequest.Status.COMPLETED
            refund.admin_notes = notes or (refund.admin_notes or 'Approved by administrator')
            refund.processed_at = now
            refund.save()

            if refund.order:
                refund.order.status = Order.Status.REFUNDED
                refund.order.save(update_fields=['status'])

                if hasattr(refund.order, 'policy'):
                    refund.order.policy.status = Policy.Status.REFUNDED
                    refund.order.policy.save(update_fields=['status'])

            return Response({
                'message': f'Refund #{refund.id} approved and processed successfully.',
                'refund': RefundRequestSerializer(refund).data
            }, status=status.HTTP_200_OK)

        elif action == 'reject':
            refund.status = RefundRequest.Status.REJECTED
            refund.admin_notes = notes or (refund.admin_notes or 'Rejected by administrator')
            refund.processed_at = now
            refund.save()

            return Response({
                'message': f'Refund #{refund.id} rejected.',
                'refund': RefundRequestSerializer(refund).data
            }, status=status.HTTP_200_OK)
