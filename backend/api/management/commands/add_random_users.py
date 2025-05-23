from django.core.management.base import BaseCommand
from api.models import Role
from faker import Faker
from django.contrib.auth import get_user_model
from tqdm import tqdm
import sys

class Command(BaseCommand):
    help = "Добавление случайных пользователей с различными ролями"

    def add_arguments(self, parser):
        parser.add_argument(
            'num_users',
            type=int,
            nargs='?',
            default=50,
            help="Количество пользователей для создания (по умолчанию 50)"
        )

    def handle(self, *args, **options):
        faker = Faker()
        roles = Role.objects.all()
        User = get_user_model()

        num_users = options['num_users']

        if num_users <= 0:
            self.stdout.write(self.style.ERROR("Количество пользователей должно быть положительным числом!"))
            return

        if roles.count() == 0:
            self.stdout.write(self.style.ERROR("В базе данных отсутствуют роли. Пожалуйста, создайте роли перед добавлением пользователей."))
            return

        self.stdout.write(f"Начало генерации {num_users} пользователей...\n")
        sys.stdout.flush()  # Принудительный вывод

        users_to_create = []
        existing_usernames = set(User.objects.values_list('username', flat=True))

        with tqdm(total=num_users, file=sys.stdout, dynamic_ncols=True, leave=True) as pbar:
            while len(users_to_create) < num_users:
                username = faker.unique.user_name()

                # Проверяем уникальность имени пользователя в базе
                if username in existing_usernames:
                    continue

                email = faker.unique.email()
                first_name = faker.first_name()
                last_name = faker.last_name()
                role = roles.order_by('?').first()

                user = User(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    role=role,
                    is_staff=(role.rolename == "admin"),
                    is_superuser=(role.rolename == "admin")
                )
                user.set_password("toor")
                users_to_create.append(user)
                existing_usernames.add(username)

                # Обновляем tqdm
                pbar.update(1)

        User.objects.bulk_create(users_to_create)
        self.stdout.write(self.style.SUCCESS(f"{num_users} случайных пользователей успешно добавлены!"))
