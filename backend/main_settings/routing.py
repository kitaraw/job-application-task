# main_settings/routing.py
from django.urls import re_path
from api.consumers import CommandConsumer 

websocket_urlpatterns = [
    re_path(r'ws/commands/$', CommandConsumer.as_asgi()),
]
