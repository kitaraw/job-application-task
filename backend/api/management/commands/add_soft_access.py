# api/management/commands/add_soft_access.py
from django.core.management.base import BaseCommand
from api.models import User, Soft, SoftAccess
from tqdm import tqdm
from itertools import product
from random import shuffle
from django.db.utils import IntegrityError

class Command(BaseCommand):
    help = "Генерация случайных доступов пользователей к программному обеспечению"

    def add_arguments(self, parser):
        parser.add_argument(
            'num_access',
            type=int,
            nargs='?',
            default=50,
            help="Количество доступов для генерации (по умолчанию 50)"
        )

    def handle(self, *args, **options):
        num_access = options['num_access']

        if num_access <= 0:
            self.stdout.write(self.style.ERROR("Количество доступов должно быть положительным числом!"))
            return

        users = list(User.objects.all())
        softs = list(Soft.objects.all())

        if not users:
            self.stdout.write(self.style.ERROR("Нет пользователей в базе данных. Пожалуйста, создайте пользователей перед выполнением команды."))
            return

        if not softs:
            self.stdout.write(self.style.ERROR("Нет программного обеспечения в базе данных. Пожалуйста, создайте записи ПО перед выполнением команды."))
            return

        self.stdout.write(f"Начало генерации до {num_access} доступов...")

        # Получаем все возможные уникальные пары пользователь-ПО
        possible_access = list(product(users, softs))
        shuffle(possible_access)  # Перемешиваем пары для случайного распределения

        # Фильтруем существующие записи
        existing_access = set(
            SoftAccess.objects.values_list('user_id', 'soft_id')
        )
        unique_access = [
            (user, soft) for user, soft in possible_access
            if (user.id, soft.id) not in existing_access
        ]

        # Ограничиваем количество уникальных записейpython manage.py delete_all_softs
        num_access = min(num_access, len(unique_access))

        created_count = 0

        for user, soft in tqdm(unique_access[:num_access], desc="Генерация доступов"):
            SoftAccess.objects.create(user=user, soft=soft)
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f"{created_count} уникальных доступов успешно добавлены!"))