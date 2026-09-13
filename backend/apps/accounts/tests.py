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

    def test_registration_without_username_and_no_collision(self):
        # User 1 registers without username
        r1 = self.client.post('/api/v1/auth/register/', {
            'email': 'alex@example.com',
            'password': 'Password123!',
            'first_name': 'Alex',
            'last_name': 'First'
        }, format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r1.data['username'], 'alex')

        # User 2 registers with different domain (same prefix) without username
        r2 = self.client.post('/api/v1/auth/register/', {
            'email': 'alex@anotherdomain.com',
            'password': 'Password123!',
            'first_name': 'Alex',
            'last_name': 'Second'
        }, format='json')
        self.assertEqual(r2.status_code, status.HTTP_201_CREATED)
        self.assertTrue(r2.data['username'].startswith('alex_'))

        # Login case-insensitively with leading/trailing spaces
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': '  ALEX@EXAMPLE.COM  ',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_res.data)

    def test_duplicate_email_validation(self):
        self.client.post('/api/v1/auth/register/', {
            'email': 'unique@example.com',
            'password': 'Password123!'
        }, format='json')

        res = self.client.post('/api/v1/auth/register/', {
            'email': 'unique@example.com',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data)

