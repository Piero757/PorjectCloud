from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Movimiento, Presupuesto
from datetime import date

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_user(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='testuser').exists())

class MovimientoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'testpassword123'})
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    def test_create_movimiento(self):
        response = self.client.post('/api/movimientos/', {
            'tipo': 'gasto',
            'monto': '50.00',
            'categoria': 'Comida',
            'fecha': date.today().isoformat()
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Movimiento.objects.count(), 1)
