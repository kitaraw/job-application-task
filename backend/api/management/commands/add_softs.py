# api/management/commands/add_softs.py
from django.core.management.base import BaseCommand
from api.models import Soft
from faker import Faker

class Command(BaseCommand):
    help = "Добавление 100 случайных названий программного обеспечения"

    def handle(self, *args, **kwargs):
        faker = Faker()
        soft_list = [Soft(softname=faker.company()) for _ in range(100)]
        Soft.objects.bulk_create(soft_list)

        self.stdout.write(self.style.SUCCESS("100 случайных названий ПО успешно добавлены!"))
