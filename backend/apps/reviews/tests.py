from django.core.management import call_command
from rest_framework.test import APITestCase
from rest_framework import status


class ReviewsApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_ekta_data')

    def test_reviews_list_and_create(self):
        res = self.client.get('/api/v1/reviews/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreater(len(res.data['results']), 0)

        create_res = self.client.post('/api/v1/reviews/', {
            'reviewer_name': 'Alex G.',
            'rating': 5,
            'comment': 'Fast and reliable travel insurance for our Europe trip.',
            'country': 'Spain'
        }, format='json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_res.data['reviewer_name'], 'Alex G.')
