from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

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

class Comprobante(models.Model):
    TIPO_CHOICES = [
        ('BOLETA', 'Boleta'),
        ('FACTURA', 'Factura'),
    ]
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comprobantes')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    serie = models.CharField(max_length=10)
    numero = models.CharField(max_length=20)
    fecha = models.DateField()
    monto_total = models.DecimalField(max_digits=12, decimal_places=2)
    igv = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    monto_neto = models.DecimalField(max_digits=12, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        # Cálculo de IGV (18%)
        self.monto_neto = self.monto_total / Decimal('1.18')
        self.igv = self.monto_total - self.monto_neto
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tipo} {self.serie}-{self.numero}"
