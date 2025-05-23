# Dockerfile backend
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && uvicorn main_settings.asgi:application --host 0.0.0.0 --port 8000 --reload"]
