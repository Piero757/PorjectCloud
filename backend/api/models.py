from django.db import models
from django.contrib.auth.models import User

class Movimiento(models.Model):
    TIPO_CHOICES = [
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
    ]
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='movimientos')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    categoria = models.CharField(max_length=100)
    fecha = models.DateField()
    descripcion = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo.capitalize()} - {self.monto} - {self.categoria}"

class Presupuesto(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='presupuestos')
    categoria = models.CharField(max_length=100)
    limite = models.DecimalField(max_digits=12, decimal_places=2)
    mes = models.IntegerField()
    anio = models.IntegerField()

    def __str__(self):
        return f"Presupuesto {self.categoria} - {self.limite}"
