# api/management/commands/delete_all_soft_access.py
from django.core.management.base import BaseCommand
from api.models import SoftAccess

class Command(BaseCommand):
    help = "Удаление всех записей из доступов к программному обеспечению"

    def handle(self, *args, **kwargs):
        self.stdout.write("Начало удаления всех записей из доступов...")

        # Удаляем все записи из модели SoftAccess
        deleted_count, _ = SoftAccess.objects.all().delete()

        self.stdout.write(self.style.SUCCESS(f"Все записи из доступов удалены (всего {deleted_count})!"))
