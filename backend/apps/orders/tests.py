from datetime import date, timedelta
from django.core.management import call_command
from rest_framework.test import APITestCase
from rest_framework import status
from apps.destinations.models import Destination
from apps.products.models import Plan, TravelType
from apps.promotions.models import Promotion
from apps.orders.models import Order
from apps.policies.models import Policy


class EktaInsuranceBookingFlowTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_ekta_data')

    def setUp(self):
        self.destination = Destination.objects.filter(is_popular=True).first()
        self.plan = Plan.objects.get(code='GOLD')
        self.travel_type = TravelType.objects.get(code='CALM')
        self.promo = Promotion.objects.get(code='EKTA10')
        self.start_date = date.today() + timedelta(days=5)
        self.end_date = date.today() + timedelta(days=15)

    def test_destination_listing(self):
        response = self.client.get('/api/v1/destinations/destinations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)

    def test_products_and_plans_listing(self):
        response = self.client.get('/api/v1/products/plans/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)

    def test_promo_validation(self):
        response = self.client.post('/api/v1/promotions/validate/', {
            'code': 'EKTA10',
            'amount': '50.00'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])
        self.assertEqual(response.data['discount_amount'], 5.0)

    def test_quote_calculation_all_plans(self):
        payload = {
            'destination_id': str(self.destination.id),
            'start_date': str(self.start_date),
            'end_date': str(self.end_date),
            'travelers_ages': [28, 32],
            'promo_code': 'EKTA10'
        }
        response = self.client.post('/api/v1/quotes/calculate/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('plan_options', response.data)
        self.assertGreater(len(response.data['plan_options']), 0)

    def test_quote_calculation_single_plan(self):
        payload = {
            'destination_id': str(self.destination.id),
            'plan_id': str(self.plan.id),
            'start_date': str(self.start_date),
            'end_date': str(self.end_date),
            'travelers_ages': [25],
            'promo_code': 'EKTA10'
        }
        response = self.client.post('/api/v1/quotes/calculate/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('quote', response.data)
        self.assertIn('quote_number', response.data['quote'])
        return response.data['quote']['quote_number']

    def test_full_e2e_booking_and_policy_issuance(self):
        # 1. Calculate Quote
        quote_payload = {
            'destination_id': str(self.destination.id),
            'plan_id': str(self.plan.id),
            'start_date': str(self.start_date),
            'end_date': str(self.end_date),
            'travelers_ages': [29, 31],
            'promo_code': 'EKTA10'
        }
        quote_res = self.client.post('/api/v1/quotes/calculate/', quote_payload, format='json')
        self.assertEqual(quote_res.status_code, status.HTTP_201_CREATED)
        quote_number = quote_res.data['quote']['quote_number']

        # 2. Create Order with Travelers
        order_payload = {
            'quote_number': quote_number,
            'contact_email': 'john.doe@example.com',
            'contact_phone': '+1234567890',
            'contact_full_name': 'John Doe',
            'travelers': [
                {
                    'first_name': 'John',
                    'last_name': 'Doe',
                    'date_of_birth': '1995-04-12',
                    'gender': 'MALE',
                    'nationality': 'Pakistan',
                    'passport_number': 'AB1234567',
                    'passport_expiry': '2032-04-12',
                    'email': 'john.doe@example.com',
                    'phone': '+1234567890',
                    'is_primary': True
                },
                {
                    'first_name': 'Jane',
                    'last_name': 'Doe',
                    'date_of_birth': '1997-08-25',
                    'gender': 'FEMALE',
                    'nationality': 'Pakistan',
                    'passport_number': 'CD7654321',
                    'passport_expiry': '2033-08-25',
                    'email': 'jane.doe@example.com',
                    'phone': '+1234567890',
                    'is_primary': False
                }
            ]
        }
        order_res = self.client.post('/api/v1/orders/create/', order_payload, format='json')
        self.assertEqual(order_res.status_code, status.HTTP_201_CREATED)
        order_number = order_res.data['order_number']
        self.assertEqual(order_res.data['status'], Order.Status.PENDING_PAYMENT)
        self.assertEqual(len(order_res.data['travelers']), 2)

        # 3. Process Checkout Payment
        checkout_payload = {
            'order_number': order_number,
            'provider': 'MOCK',
            'payment_method': 'VISA'
        }
        checkout_res = self.client.post('/api/v1/payments/checkout/', checkout_payload, format='json')
        self.assertEqual(checkout_res.status_code, status.HTTP_200_OK)
        policy_number = checkout_res.data['policy_number']
        self.assertTrue(policy_number.startswith('EKTA-'))

        # 4. Verify Order transitioned to ISSUED / PAID
        order = Order.objects.get(order_number=order_number)
        self.assertEqual(order.status, Order.Status.ISSUED)

        # 5. Public Policy Validation Endpoint
        val_res = self.client.get(f'/api/v1/policies/validate/{policy_number}/')
        self.assertEqual(val_res.status_code, status.HTTP_200_OK)
        self.assertTrue(val_res.data['valid'])
        self.assertEqual(val_res.data['policy_number'], policy_number)
        self.assertEqual(val_res.data['travelers_count'], 2)
        # Passport numbers must NOT be leaked in public validation endpoint
        self.assertNotIn('AB1234567', str(val_res.data))

        # 6. Policy Document & Certificate
        doc_res = self.client.get(f'/api/v1/policies/{policy_number}/document/')
        self.assertEqual(doc_res.status_code, status.HTTP_200_OK)
        self.assertIn('certificate', doc_res.data)
        self.assertEqual(doc_res.data['certificate']['policy_number'], policy_number)

    def test_refund_request(self):
        # Create quote & order
        quote_payload = {
            'destination_id': str(self.destination.id),
            'plan_id': str(self.plan.id),
            'start_date': str(self.start_date),
            'end_date': str(self.end_date),
            'travelers_ages': [30],
        }
        quote_res = self.client.post('/api/v1/quotes/calculate/', quote_payload, format='json')
        quote_num = quote_res.data['quote']['quote_number']

        order_payload = {
            'quote_number': quote_num,
            'contact_email': 'refund.test@example.com',
            'contact_phone': '+1987654321',
            'contact_full_name': 'Alice Smith',
            'travelers': [{
                'first_name': 'Alice',
                'last_name': 'Smith',
                'date_of_birth': '1992-01-01',
                'gender': 'FEMALE',
                'nationality': 'Pakistan',
                'passport_number': 'XY998877',
                'passport_expiry': '2030-01-01',
                'is_primary': True
            }]
        }
        order_res = self.client.post('/api/v1/orders/create/', order_payload, format='json')
        order_number = order_res.data['order_number']

        # Pay order
        self.client.post('/api/v1/payments/checkout/', {'order_number': order_number}, format='json')

        # Request Refund
        refund_payload = {
            'order_number': order_number,
            'contact_email': 'refund.test@example.com',
            'reason': 'Trip was cancelled due to unexpected personal emergency'
        }
        refund_res = self.client.post('/api/v1/refunds/request/', refund_payload, format='json')
        self.assertEqual(refund_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(refund_res.data['status'], 'REQUESTED')
