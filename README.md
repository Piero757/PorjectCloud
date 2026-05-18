# NexoFin

NexoFin es una plataforma completa de gestión de finanzas personales que integra inteligencia artificial para proporcionar predicciones y consejos de ahorro basados en los patrones de gasto del usuario.

## Características Principales

*   **Autenticación**: Registro e inicio de sesión de usuarios seguro con JWT.
*   **Gestión de Movimientos**: Registro de ingresos y gastos con categorización y fecha.
*   **Presupuestos**: Definición de límites de gasto mensuales por categoría.
*   **Impuestos**: Registro de comprobantes (Boletas y Facturas) con cálculo automático del IGV (18%).
*   **Reportes y Dashboard**: Resumen financiero mensual, cálculo de balance y visualización gráfica (Chart.js) de ingresos vs gastos y desglose por categorías.
*   **Inteligencia Artificial (Predicciones y Chatbot)**: 
    *   Predicción de gastos para el próximo mes basada en el historial del usuario (Machine Learning con scikit-learn).
    *   Generación automática de consejos de ahorro.
    *   **Chatbot integrado** (Gemini) que actúa como tu asistente financiero personal ("Fini"), capaz de responder preguntas contextuales usando tus datos reales.

## Tecnologías Utilizadas

*   **Frontend**: Next.js (App Router), React, Tailwind CSS, Framer Motion, Chart.js, Lucide Icons.
*   **Backend**: Python, Django, Django REST Framework, Simple JWT, scikit-learn (para el modelo predictivo de Machine Learning).
*   **Base de Datos**: SQLite (configurada por defecto, fácilmente migrable a PostgreSQL).
*   **Despliegue**: Render (listo para la integración continua a través de GitHub).

## Requisitos Previos

*   Python 3.9 o superior
*   Node.js 18 o superior
*   Git

## Instalación y Configuración Local

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/Piero757/PorjectCloud.git
    cd FinanzasIA
    ```

2. **Levantar los servicios con Docker Compose:**
   Esto construirá la imagen del backend y levantará la base de datos PostgreSQL.
   ```bash
   docker-compose up --build -d
   ```

3. **Instalar dependencias del frontend e iniciar:**
   (Asegúrate de estar en el directorio raíz o en `frontend`)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Acceso:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000/api/`

## Checklist de Funcionalidades

- [x] Autenticación JWT y sistema de usuarios.
- [x] CRUD de Movimientos (Ingresos/Gastos).
- [x] Dashboard de Reportes con agregaciones en base de datos.
- [x] Configuración y control de presupuestos.
- [x] Modelo predictivo de gastos con Scikit-learn.
- [x] Frontend en Next.js con diseño moderno (Glassmorphism).
- [x] Gráficos interactivos con Chart.js.
- [x] Animaciones suaves con Framer Motion.
- [x] Configuración de Docker y Docker-compose.
- [x] Pipeline CI/CD básico (GitHub Actions).

## Tareas Pendientes (To-Do)

- Mejorar el modelo de IA con más variables (días de la semana, categorías, estacionalidad).
- Añadir exportación de reportes a PDF.
- Notificaciones en tiempo real o por correo cuando se exceda el 80% de un presupuesto.
- Integrar animaciones Lottie personalizadas en distintas vistas.

## Guía de Despliegue

### Backend (Render)
1. Conecta tu repositorio de GitHub a [Render](https://render.com/).
2. Crea un **Web Service**.
3. Elige Docker como Environment (Render detectará automáticamente el `Dockerfile` en `/backend`).
4. Configura las variables de entorno (`POSTGRES_DB`, `POSTGRES_USER`, etc.) apuntando a tu base de datos de producción (Render ofrece también PostgreSQL gestionado).
5. Despliega.

### Frontend (Vercel)
1. Inicia sesión en [Vercel](https://vercel.com/) y crea un nuevo proyecto.
2. Importa el repositorio de GitHub.
3. El `Root Directory` debe establecerse en `frontend`.
4. El framework preset será detectado como Next.js.
5. Haz clic en **Deploy**.
