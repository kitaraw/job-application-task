# api/management/commands/initialize_test_data.py

from django.core.management.base import BaseCommand
from django.core.management import call_command
from api.models import SoftAccess, Soft, User, Role

def normalize_input(prompt):
    while True:
        user_input = input(prompt).strip().lower()
        if user_input in ['y', 'n']:
            return user_input
        print("Пожалуйста, введите 'y' для подтверждения или 'n' для отмены.")
        
class Command(BaseCommand):
    help = "Инициализация тестовых данных для приложения"

    def add_arguments(self, parser):
        """
        Добавляем аргументы, которые позволяют:
         - --yes: пропустить все интерактивные запросы (автоматический режим)
         - --num_users: количество случайных пользователей
         - --num_access: количество доступов
        """
        parser.add_argument(
            '--yes',
            action='store_true',
            help='Автоматический режим без интерактивных запросов (ответ на всё "да")'
        )
        parser.add_argument(
            '--num_users',
            type=int,
            default=50,
            help='Сколько случайных пользователей добавить (по умолчанию 50)'
        )
        parser.add_argument(
            '--num_access',
            type=int,
            default=50,
            help='Сколько доступов к ПО добавить (по умолчанию 50)'
        )

    def handle(self, *args, **options):
        yes_mode = options['yes']
        num_users = options['num_users']
        num_access = options['num_access']

        # 1) Предупреждение об удалении данных
        self.stdout.write(self.style.WARNING(
            "Все данные в таблицах Доступы, Программное обеспечение и Пользователи будут удалены!"
        ))
        
        # Если не установлен флаг --yes, спрашиваем подтверждение
        if not yes_mode:
            confirm = normalize_input("Вы хотите продолжить? (y/n): ")
            self.stdout.flush()
            if confirm != 'y':
                self.stdout.write(self.style.ERROR("Операция отменена пользователем."))
                return
        else:
            self.stdout.write(self.style.WARNING(
                "Автоматический режим (--yes): пропускаем подтверждения."
            ))

        # 2) Удаляем все записи из связанных таблиц... 
        self.stdout.write("Удаление всех записей из таблиц...")
        # Сохраняем root (если есть), чтобы не ломать Django-суперпользователя, если он уже существует
        root_user = User.objects.filter(username="root").first()

        SoftAccess.objects.all().delete()
        Soft.objects.all().delete()
        User.objects.exclude(username="root").delete()
        # Удаляем абсолютно все роли, чтобы потом заново создать дефолтные
        Role.objects.all().delete()

        self.stdout.write(self.style.SUCCESS("Все записи успешно удалены."))

        # 3) Создаём дефолтные роли
        self.stdout.write("Добавление дефолтных ролей...")
        call_command("create_default_roles")
        self.stdout.write(self.style.SUCCESS(
            "Созданы роли:\n"
            "- admin: все разрешения (add_roles, edit_roles, delete_roles, add_users, edit_users, delete_users).\n"
            "- user: без дополнительных разрешений."
        ))

        # Получаем заново admin_role (который только что создали)
        admin_role = Role.objects.filter(rolename="admin").first()
        if not admin_role:
            self.stdout.write(self.style.WARNING("Роль 'admin' не найдена после create_default_roles, создаём вручную..."))
            admin_role = Role.objects.create(
                rolename="admin",
                add_roles=True,
                edit_roles=True,
                delete_roles=True,
                add_users=True,
                edit_users=True,
                delete_users=True,
            )
            self.stdout.write(self.style.SUCCESS("Роль 'admin' успешно создана."))

        # 4) Проверяем или создаём пользователя root
        if root_user:
            self.stdout.write(self.style.SUCCESS("Пользователь root уже существует."))
            if root_user.role != admin_role:
                self.stdout.write(self.style.WARNING("У пользователя root отсутствует роль 'admin'. Назначаем роль..."))
                root_user.role = admin_role
                root_user.save()
                self.stdout.write(self.style.SUCCESS("Роль 'admin' успешно назначена пользователю root."))
        else:
            # Если root отсутствует, создаём вручную (не через createsuperuser!)
            self.stdout.write(self.style.WARNING("Пользователь root не найден, создаём суперпользователя..."))
            root_user = User.objects.create(
                username="root",
                email="root@root.ru",
                role=admin_role,  # Назначаем сразу роль, чтобы избежать IntegrityError
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            root_user.set_password("toor")
            root_user.save()
            self.stdout.write(self.style.SUCCESS("Пользователь root успешно создан с ролью 'admin'."))

        # 5) Добавление дополнительных ролей (интерактивно, если не --yes)
        if not yes_mode:
            while True:
                add_more_roles = normalize_input("Добавить ещё одну роль? (y/n): ")
                if add_more_roles != 'y':
                    break
                call_command('add_role')
            self.stdout.write(self.style.SUCCESS("Дополнительные роли успешно добавлены."))
        else:
            self.stdout.write("Режим --yes: пропускаем добавление дополнительных ролей интерактивно.")

        # 6) Создание случайных пользователей
        if not yes_mode:
            entered_num_users = input(
                "Введите количество случайных пользователей (по умолчанию 50, нажмите Enter): "
            ).strip()
            if entered_num_users.isdigit():
                num_users = int(entered_num_users)
        self.stdout.write(f"Добавление {num_users} пользователей...")
        call_command('add_random_users', num_users)
        self.stdout.write(self.style.SUCCESS(f"{num_users} пользователей успешно добавлены."))

        # 7) Добавление ПО
        self.stdout.write("Добавление 100 записей программного обеспечения...")
        call_command('add_softs')
        self.stdout.write(self.style.SUCCESS("Программное обеспечение успешно добавлено."))

        # 8) Создание доступов
        if not yes_mode:
            entered_num_access = input(
                "Введите количество доступов к ПО (по умолчанию 50, нажмите Enter): "
            ).strip()
            if entered_num_access.isdigit():
                num_access = int(entered_num_access)
        self.stdout.write(f"Добавление {num_access} доступов...")
        call_command('add_soft_access', num_access)
        self.stdout.write(self.style.SUCCESS(f"{num_access} доступов успешно добавлены."))

        self.stdout.write(self.style.SUCCESS("Инициализация данных завершена!"))
