from django.core.management import call_command
from rest_framework.test import APITestCase
from rest_framework import status


class CmsApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_ekta_data')

    def test_faq_list(self):
        res = self.client.get('/api/v1/cms/faqs/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreater(len(res.data['results']), 0)

    def test_pages_list_and_detail(self):
        res = self.client.get('/api/v1/cms/pages/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        detail_res = self.client.get('/api/v1/cms/pages/about-us/')
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_res.data['slug'], 'about-us')
