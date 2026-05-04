from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import Movimiento, Presupuesto, Comprobante
from .serializers import UserSerializer, MovimientoSerializer, PresupuestoSerializer, ComprobanteSerializer
from django.db.models import Sum
from datetime import datetime

# ML model simulation/integration
import numpy as np
from sklearn.linear_model import LinearRegression

class MovimientoViewSet(viewsets.ModelViewSet):
    serializer_class = MovimientoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Movimiento.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class PresupuestoViewSet(viewsets.ModelViewSet):
    serializer_class = PresupuestoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Presupuesto.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

from django.core.mail import send_mail
from django.conf import settings

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        print(f"DEBUG: User {user.username} created successfully")
        
        # Enviar correo de bienvenida
        try:
            subject = '¡Bienvenido a FinanzasIA! 🚀'
            message = f'Hola {user.username},\n\nGracias por unirte a FinanzasIA. Estamos emocionados de ayudarte a tomar el control de tus finanzas con el poder de la Inteligencia Artificial.\n\nYa puedes empezar a registrar tus gastos e ingresos para obtener tus primeras predicciones.\n\nSaludos,\nEl equipo de FinanzasIA'
            email_from = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user.email]
            send_mail(subject, message, email_from, recipient_list, fail_silently=True)
        except Exception as e:
            print(f"Error enviando correo: {e}")

        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
    else:
        print(f"DEBUG: Registration errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reportes(request):
    user = request.user
    mes = request.query_params.get('mes', datetime.now().month)
    anio = request.query_params.get('anio', datetime.now().year)

    movimientos = Movimiento.objects.filter(usuario=user, fecha__month=mes, fecha__year=anio)
    
    ingresos = movimientos.filter(tipo='ingreso').aggregate(total=Sum('monto'))['total'] or 0
    gastos = movimientos.filter(tipo='gasto').aggregate(total=Sum('monto'))['total'] or 0
    
    gastos_por_categoria = movimientos.filter(tipo='gasto').values('categoria').annotate(total=Sum('monto'))

    return Response({
        "mes": mes,
        "anio": anio,
        "total_ingresos": ingresos,
        "total_gastos": gastos,
        "balance": ingresos - gastos,
        "gastos_por_categoria": gastos_por_categoria
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def predicciones(request):
    user = request.user
    gastos = Movimiento.objects.filter(usuario=user, tipo='gasto').order_by('fecha')
    
    if not gastos.exists():
        return Response({"mensaje": "No hay suficientes datos para predecir.", "prediccion_proximo_mes": 0, "tendencia": "estable", "consejo": "Empieza a registrar tus gastos."})
        
    from django.db.models.functions import TruncMonth
    gastos_mensuales = gastos.annotate(mes=TruncMonth('fecha')).values('mes').annotate(total=Sum('monto')).order_by('mes')
    
    import random
    
    # Obtener categoría de mayor gasto
    gastos_por_categoria = gastos.values('categoria').annotate(total=Sum('monto')).order_by('-total')
    top_categoria = gastos_por_categoria[0]['categoria'] if gastos_por_categoria else "varios"
    top_monto = gastos_por_categoria[0]['total'] if gastos_por_categoria else 0
    
    if len(gastos_mensuales) < 2:
        consejos_ia = [
            f"¡Hola! Soy tu IA financiera. Aún estoy aprendiendo de tus hábitos, pero noto que has gastado ${top_monto} en '{top_categoria}'. ¡Sigue registrando para darte mejores consejos!",
            f"Como tu asistente virtual, veo que '{top_categoria}' es una de tus prioridades. Registra un mes más para activar mis proyecciones avanzadas."
        ]
        return Response({
            "mensaje": "Se necesitan al menos 2 meses de datos para realizar una predicción fiable con Scikit-Learn.", 
            "prediccion_proximo_mes": float(gastos_mensuales[0]['total']) if gastos_mensuales else 0,
            "tendencia": "estable",
            "consejo": random.choice(consejos_ia)
        })
        
    X = np.array(range(len(gastos_mensuales))).reshape(-1, 1)
    y = np.array([float(g['total']) for g in gastos_mensuales])
    
    model = LinearRegression()
    model.fit(X, y)
    
    prediccion_siguiente_mes = model.predict([[len(gastos_mensuales)]])[0]
    
    promedio = np.mean(y)
    if prediccion_siguiente_mes > promedio:
        consejos_ia = [
            f"🤖 Mi modelo predictivo alerta que tus gastos subirán a ${round(prediccion_siguiente_mes, 2)}. Principalmente por '{top_categoria}'. ¡Intenta recortar gastos ahí!",
            f"📈 Tendencia al alza detectada. Has estado gastando mucho en '{top_categoria}' (${top_monto}). Revisa tu presupuesto de este mes para evitar sorpresas."
        ]
        consejo = random.choice(consejos_ia)
    else:
        consejos_ia = [
            f"✨ ¡Excelente trabajo! Mi algoritmo predice una baja en tus gastos. Sigue controlando tu categoría de '{top_categoria}' y estarás genial.",
            f"📉 Vas por muy buen camino. Tus finanzas están estables. Te sugiero destinar una parte de lo que ahorres este mes a un fondo de emergencia."
        ]
        consejo = random.choice(consejos_ia)
        
    return Response({
        "prediccion_proximo_mes": round(prediccion_siguiente_mes, 2),
        "tendencia": "subiendo" if model.coef_[0] > 0 else "bajando",
        "consejo": consejo
    })

class ComprobanteViewSet(viewsets.ModelViewSet):
    serializer_class = ComprobanteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comprobante.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
