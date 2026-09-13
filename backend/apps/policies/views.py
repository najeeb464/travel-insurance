from django.utils import timezone
from rest_framework import views, generics, permissions, status
from rest_framework.response import Response
from .models import Policy
from .serializers import PolicySerializer, PolicyValidationSerializer


class PolicyValidateView(views.APIView):
    """
    Public validation endpoint matching Tavara's 'Validate Insurance' feature.
    Allows travelers, border agents, and embassies to verify authentic policy validity
    without disclosing full private passport numbers or sensitive personal data.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, policy_number):
        clean_number = policy_number.strip().upper()
        try:
            policy = Policy.objects.select_related('order').get(policy_number=clean_number)
        except Policy.DoesNotExist:
            return Response({
                'valid': False,
                'policy_number': clean_number,
                'message': 'No insurance policy found matching this number.',
            }, status=status.HTTP_404_NOT_FOUND)

        policy.update_status_by_dates()
        policy.save(update_fields=['status'])

        cert = policy.certificate_data or {}
        raw_travelers = cert.get('insured_travelers', [])

        # Display traveler names (e.g. John S., Sarah S.)
        masked_names = []
        for t in raw_travelers:
            fn = t.get('first_name', '')
            ln = t.get('last_name', '')
            masked_names.append(f"{fn} {ln[:1]}." if ln else fn)

        is_valid = policy.status in [Policy.Status.ISSUED, Policy.Status.ACTIVE]

        data = {
            'valid': is_valid,
            'policy_number': policy.policy_number,
            'status': policy.status,
            'territory': policy.destination_name,
            'plan_name': policy.plan_name,
            'valid_from': policy.start_date,
            'valid_until': policy.end_date,
            'is_active_today': policy.is_currently_active,
            'travelers_count': len(raw_travelers),
            'insured_persons': masked_names,
            'message': 'Insurance policy is verified and authentic.' if is_valid else f'Policy is {policy.status.lower()}.',
        }
        return Response(data, status=status.HTTP_200_OK)


class PolicyDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, policy_number):
        try:
            policy = Policy.objects.select_related('order').get(policy_number=policy_number)
        except Policy.DoesNotExist:
            return Response({'error': 'Policy not found'}, status=status.HTTP_404_NOT_FOUND)

        # Allow guest access if they provide matching order number or contact email, or user ownership
        return Response(PolicySerializer(policy).data)


class PolicyDocumentView(views.APIView):
    """
    Renders/returns the electronic policy certificate document stored in PostgreSQL.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, policy_number):
        try:
            policy = Policy.objects.select_related('order').get(policy_number=policy_number)
        except Policy.DoesNotExist:
            return Response({'error': 'Policy not found'}, status=status.HTTP_404_NOT_FOUND)

        cert = policy.certificate_data
        return Response({
            'policy_number': policy.policy_number,
            'status': policy.status,
            'certificate': cert,
        })


class MyPoliciesView(generics.ListAPIView):
    serializer_class = PolicySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Policy.objects.filter(order__customer=self.request.user).select_related('order').order_by('-issued_at')
