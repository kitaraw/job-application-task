#api/management/commands/create_default_roles.py

from django.core.management.base import BaseCommand
from api.models import Role

class Command(BaseCommand):
    help = "Создание ролей admin и user"

    def handle(self, *args, **kwargs):
        Role.objects.get_or_create(
            rolename="admin",
            defaults={
                "add_roles": True, "edit_roles": True, "delete_roles": True,
                "add_users": True, "edit_users": True, "delete_users": True,
            },
        )
        Role.objects.get_or_create(rolename="user")
        self.stdout.write(self.style.SUCCESS("Роли admin и user успешно добавлены!"))
