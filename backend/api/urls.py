from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import MovimientoViewSet, PresupuestoViewSet, ComprobanteViewSet, register, reportes, predicciones

router = DefaultRouter()
router.register(r'movimientos', MovimientoViewSet, basename='movimiento')
router.register(r'presupuestos', PresupuestoViewSet, basename='presupuesto')
router.register(r'comprobantes', ComprobanteViewSet, basename='comprobante')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('reportes/', reportes, name='reportes'),
    path('predicciones/', predicciones, name='predicciones'),
]
