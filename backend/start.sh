#!/bin/bash

# Ejecutar migraciones
echo "Applying database migrations..."
python manage.py makemigrations api
python manage.py migrate

# Iniciar el servidor gunicorn
echo "Starting Gunicorn..."
gunicorn core.wsgi:application --bind 0.0.0.0:8000
