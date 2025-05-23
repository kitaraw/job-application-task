# core/management/commands/add_role.py
from django.core.management.base import BaseCommand
from api.models import Role

class Command(BaseCommand):
    help = "Добавление новой роли с выбором разрешений"

    def handle(self, *args, **kwargs):
        rolename = input("Введите название роли: ")
        if Role.objects.filter(rolename=rolename).exists():
            self.stdout.write(self.style.ERROR("Роль с таким названием уже существует!"))
            return

        permissions = {
            "add_roles": "Разрешить добавление ролей? (y/n): ",
            "edit_roles": "Разрешить редактирование ролей? (y/n): ",
            "delete_roles": "Разрешить удаление ролей? (y/n): ",
            "add_users": "Разрешить добавление пользователей? (y/n): ",
            "edit_users": "Разрешить редактирование пользователей? (y/n): ",
            "delete_users": "Разрешить удаление пользователей? (y/n): ",
        }

        role_data = {"rolename": rolename}
        for field, question in permissions.items():
            response = input(question).lower()
            role_data[field] = response == "y"

        Role.objects.create(**role_data)
        self.stdout.write(self.style.SUCCESS(f"Роль '{rolename}' успешно создана!"))
