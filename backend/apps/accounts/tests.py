from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AccountsApiTests(APITestCase):
    def test_user_registration_and_login(self):
        # Register
        reg_data = {
            'email': 'tourist@example.com',
            'username': 'tourist1',
            'password': 'StrongPassword123!',
            'first_name': 'Tourist',
            'last_name': 'Traveler',
            'phone_number': '+49123456789'
        }
        res = self.client.post('/api/v1/auth/register/', reg_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['email'], 'tourist@example.com')

        # Login to obtain JWT tokens
        login_data = {
            'email': 'tourist@example.com',
            'password': 'StrongPassword123!'
        }
        login_res = self.client.post('/api/v1/auth/login/', login_data, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_res.data)
        self.assertIn('refresh', login_res.data)
        access_token = login_res.data['access']

        # Access /me/
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        me_res = self.client.get('/api/v1/auth/me/')
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data['email'], 'tourist@example.com')
