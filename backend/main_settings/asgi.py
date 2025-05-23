"""
ASGI config for main_settings project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""


import os
import django
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main_settings.settings')
django.setup()


import main_settings.routing

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    # HTTP-трафик обрабатывается стандартным приложением Django
    "http": django_asgi_app,

    # WebSocket-трафик идёт через Channels
    "websocket": AuthMiddlewareStack(
        URLRouter(
            main_settings.routing.websocket_urlpatterns
        )
    ),
})

