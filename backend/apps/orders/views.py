from django.db import transaction
from rest_framework import views, generics, permissions, status
from rest_framework.response import Response
from apps.quotations.models import Quote
from apps.travelers.models import Traveler
from apps.promotions.models import Promotion
from .models import Order
from .serializers import OrderSerializer, CreateOrderFromQuoteSerializer


class CreateOrderView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = CreateOrderFromQuoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        quote = Quote.objects.select_for_update().get(quote_number=data['quote_number'])

        customer = request.user if request.user.is_authenticated else quote.customer

        existing_order = Order.objects.filter(quote=quote, status=Order.Status.PENDING_PAYMENT).first()
        if existing_order:
            order = existing_order
            if customer and not order.customer:
                order.customer = customer
            order.contact_email = data['contact_email']
            order.contact_phone = data['contact_phone']
            order.contact_full_name = data['contact_full_name']
            order.save(update_fields=['customer', 'contact_email', 'contact_phone', 'contact_full_name'])

            order.travelers.all().delete()
            for idx, t_data in enumerate(data['travelers']):
                is_primary = t_data.get('is_primary', (idx == 0))
                Traveler.objects.create(
                    order=order,
                    first_name=t_data['first_name'],
                    last_name=t_data['last_name'],
                    date_of_birth=t_data['date_of_birth'],
                    gender=t_data.get('gender', Traveler.Gender.MALE),
                    nationality=t_data.get('nationality', 'Pakistan'),
                    passport_number=t_data['passport_number'],
                    passport_expiry=t_data['passport_expiry'],
                    email=t_data.get('email', data['contact_email']),
                    phone=t_data.get('phone', data['contact_phone']),
                    is_primary=is_primary,
                )
            return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

        order = Order.objects.create(
            customer=customer,
            quote=quote,
            contact_email=data['contact_email'],
            contact_phone=data['contact_phone'],
            contact_full_name=data['contact_full_name'],
            currency=quote.currency,
            subtotal=quote.subtotal,
            discount=quote.discount,
            tax=0.00,
            total=quote.total,
            status=Order.Status.PENDING_PAYMENT,
            order_snapshot={
                'quote_number': quote.quote_number,
                'destination': quote.destination.name,
                'destination_type': quote.destination.destination_type,
                'start_date': str(quote.start_date),
                'end_date': str(quote.end_date),
                'plan_name': quote.plan.name if quote.plan else 'Custom',
                'plan_code': quote.plan.code if quote.plan else 'CUSTOM',
                'medical_limit': quote.plan.medical_limit_display if quote.plan else '€30,000',
                'travel_type': quote.travel_type.name,
                'breakdown': quote.breakdown_data,
                'promo_code': quote.promo_code_used,
            }
        )

        for idx, t_data in enumerate(data['travelers']):
            is_primary = t_data.get('is_primary', (idx == 0))
            Traveler.objects.create(
                order=order,
                first_name=t_data['first_name'],
                last_name=t_data['last_name'],
                date_of_birth=t_data['date_of_birth'],
                gender=t_data.get('gender', Traveler.Gender.MALE),
                nationality=t_data.get('nationality', 'Pakistan'),
                passport_number=t_data['passport_number'],
                passport_expiry=t_data['passport_expiry'],
                email=t_data.get('email', data['contact_email']),
                phone=t_data.get('phone', data['contact_phone']),
                is_primary=is_primary,
            )

        # Mark quote as converted
        quote.status = Quote.Status.CONVERTED
        quote.save(update_fields=['status'])

        # If promo code used, increment counter
        if quote.promo_code_used:
            Promotion.objects.filter(code__iexact=quote.promo_code_used).update(times_used=models.F('times_used') + 1 if False else 1)
            promo = Promotion.objects.filter(code__iexact=quote.promo_code_used).first()
            if promo:
                promo.times_used += 1
                promo.save(update_fields=['times_used'])

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_number):
        try:
            order = Order.objects.prefetch_related('travelers').get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # If order belongs to an authenticated user, require ownership or staff
        if order.customer and request.user.is_authenticated and not request.user.is_staff:
            if order.customer != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        return Response(OrderSerializer(order).data)

    def delete(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prohibit deletion of PAID or ISSUED orders
        if order.status in [Order.Status.PAID, Order.Status.ISSUED, Order.Status.REFUNDED]:
            return Response({
                'error': f'Order cannot be deleted in status {order.status}. Issued policies must be preserved for audit and compliance.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check ownership
        if order.customer and request.user.is_authenticated and not request.user.is_staff:
            if order.customer != request.user:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        # If order had a converted quote, release the quote back to CALCULATED
        if order.quote and order.quote.status == Quote.Status.CONVERTED:
            order.quote.status = Quote.Status.CALCULATED
            order.quote.save(update_fields=['status'])

        order.delete()
        return Response({
            'message': 'Order successfully removed.',
            'order_number': order_number
        }, status=status.HTTP_200_OK)


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).prefetch_related('travelers').order_by('-created_at')


class CancelOrderView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.customer and request.user.is_authenticated and not request.user.is_staff:
            if order.customer != request.user:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        if order.status not in [Order.Status.PENDING_PAYMENT, Order.Status.DRAFT]:
            return Response({'error': f'Order cannot be cancelled in status {order.status}'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = Order.Status.CANCELLED
        order.save(update_fields=['status'])

        # If quote was converted, revert quote status back to CALCULATED
        if order.quote and order.quote.status == Quote.Status.CONVERTED:
            order.quote.status = Quote.Status.CALCULATED
            order.quote.save(update_fields=['status'])

        return Response({'message': 'Order successfully cancelled', 'order_number': order.order_number, 'status': order.status})
