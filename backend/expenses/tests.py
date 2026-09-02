from django.test import TestCase
from django.urls import reverse


class BackendSmokeTests(TestCase):

    def test_api_token_url_exists(self):
        response = self.client.get("/api/token/")
        self.assertNotEqual(response.status_code, 404)

    def test_expenses_api_url_exists(self):
        response = self.client.get("/api/expenses/")
        self.assertNotEqual(response.status_code, 404)