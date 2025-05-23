# api/management/commands/delete_all_softs.py
from django.core.management.base import BaseCommand
from api.models import Soft

class Command(BaseCommand):
    help = "Удаление всех записей программного обеспечения"

    def handle(self, *args, **kwargs):
        deleted_count, _ = Soft.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Удалены все записи ПО (всего {deleted_count})!"))
