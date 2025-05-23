# api/management/commands/delete_first_100_softs.py
from django.core.management.base import BaseCommand
from api.models import Soft

class Command(BaseCommand):
    help = "Удаление первых 100 записей программного обеспечения"

    def handle(self, *args, **kwargs):
        softs_to_delete = Soft.objects.all()[:100]
        
        if not softs_to_delete:
            self.stdout.write(self.style.WARNING("Нет записей для удаления."))
            return

        ids = list(softs_to_delete.values_list('id', flat=True))
        
        # Удаляем записи и получаем подробности о затронутых моделях
        deleted_count, deleted_details = Soft.objects.filter(id__in=ids).delete()
        
        # Основное сообщение о количестве удаленного ПО
        self.stdout.write(self.style.SUCCESS(f"Удалено {deleted_count} записей из базы данных!"))
        
        # Подробное отображение удаленных объектов
        self.stdout.write("Детали удаленных записей:")
        for model, count in deleted_details.items():
            self.stdout.write(f" - {model}: {count} записей")
