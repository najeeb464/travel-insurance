from rest_framework import views, generics, permissions, status
from rest_framework.response import Response
from apps.orders.models import Order
from .models import RefundRequest
from .serializers import RefundRequestSerializer, CreateRefundRequestSerializer


class RequestRefundView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CreateRefundRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            order = Order.objects.get(order_number=data['order_number'])
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in [Order.Status.PAID, Order.Status.ISSUED]:
            return Response({'error': f'Cannot request refund for order in status: {order.status}'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify email matches contact email or customer email
        buyer_email = order.contact_email.strip().lower()
        input_email = data['contact_email'].strip().lower()
        if buyer_email != input_email:
            return Response({'error': 'Provided email does not match order records'}, status=status.HTTP_400_BAD_REQUEST)

        customer = request.user if request.user.is_authenticated else order.customer

        refund = RefundRequest.objects.create(
            order=order,
            customer=customer,
            contact_email=data['contact_email'],
            reason=data['reason'],
            requested_amount=order.total,
            currency=order.currency,
            status=RefundRequest.Status.REQUESTED,
        )

        return Response(RefundRequestSerializer(refund).data, status=status.HTTP_201_CREATED)


class MyRefundsView(generics.ListAPIView):
    serializer_class = RefundRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RefundRequest.objects.filter(customer=self.request.user).order_by('-created_at')
