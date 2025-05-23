from rest_framework.permissions import BasePermission, SAFE_METHODS


class RolePermission(BasePermission):
    """
    Разрешение для управления ролями в зависимости от прав пользователя.
    """
    def has_permission(self, request, view):
        # Разрешение на просмотр доступно всем аутентифицированным пользователям
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        # Разрешение на редактирование ролей
        if request.user.role:
            if request.user.role.rolename == "admin":
                return True
            if request.user.role.add_roles or request.user.role.edit_roles or request.user.role.delete_roles:
                return True

        return False

    def has_object_permission(self, request, view, obj):
        """
        Проверка разрешения на уровне объекта.
        """
        if request.method in SAFE_METHODS:
            return True

        # Разрешение на добавление, изменение, удаление зависит от флагов роли пользователя
        if request.user.role:
            if request.method == "POST" and request.user.role.add_roles:
                return True
            if request.method in ["PUT", "PATCH"] and request.user.role.edit_roles:
                return True
            if request.method == "DELETE" and request.user.role.delete_roles:
                return True

        return False
    
class UserPermission(BasePermission):
    """
    Разрешения для управления пользователями.
    Правила:
    1. Любой аутентифицированный пользователь может видеть список пользователей.
    2. Роль 'admin' может создавать, редактировать, удалять любого пользователя.
    3. Роль 'user' может редактировать только себя (кроме поля 'rolename').
    4. Другие роли могут управлять пользователями в зависимости от флагов add_users, edit_users, delete_users.
    5. Любой пользователь может редактировать себя, за исключением изменения поля 'rolename'.
    """

    def has_permission(self, request, view):
        # 1. Любой аутентифицированный пользователь может видеть список пользователей (GET, HEAD, OPTIONS).
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        # На все остальные методы требуется аутентификация
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """
        Проверка разрешений на уровне конкретного объекта (пользователя).
        obj – это экземпляр модели User, над которым совершается действие.
        """

        # Достаём роль текущего пользователя
        user_role = getattr(request.user, 'role', None)

        # Если нет роли вовсе, ничего, кроме SAFE_METHODS, нельзя
        if not user_role:
            return False

        # 2. Если роль 'admin', то полные права на все операции
        if user_role.rolename == 'admin':
            return True

        # 3. Если роль 'user', то пользователь может редактировать только себя (кроме поля 'role')
        if user_role.rolename == 'user':
            if obj == request.user:
                if request.method in ('PUT', 'PATCH'):
                    role_data = request.data.get('role')
                    if role_data:
                        # Берём текущее имя роли у пользователя
                        current_rolename = request.user.role.rolename if request.user.role else None
                        # Берём то, что пришло из запроса
                        incoming_rolename = role_data.get('rolename')
                        
                        # Если роли не совпадают, значит пытается изменить -> запрет
                        if incoming_rolename and incoming_rolename != current_rolename:
                            return False
                return True
            return False

        # 4. Для других ролей: разрешения зависят от флагов в модели роли
        # Разрешаем редактировать самих себя, если роль не меняется
        if obj == request.user:
            if request.method in ('PUT', 'PATCH'):
                role_data = request.data.get('role')
                if role_data:
                    # Берём текущее имя роли у пользователя
                    current_rolename = obj.role.rolename if obj.role else None
                    # Из запроса берём, что хотят установить
                    incoming_rolename = role_data.get("rolename")
                    
                    # Если roles не совпадают — значит пытаемся сменить роль => запрещаем
                    if incoming_rolename and incoming_rolename != current_rolename:
                        return False
            return True

        # Если редактируем не себя, смотрим флаги
        if request.method == 'POST':
            return user_role.add_users
        elif request.method in ('PUT', 'PATCH'):
            return user_role.edit_users
        elif request.method == 'DELETE':
            return user_role.delete_users

        return False
    
class IsAdminForSoftAccess(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:  # GET, HEAD, OPTIONS
            return request.user.is_authenticated
        # На POST, PUT, DELETE — только admin
        return (
            request.user.is_authenticated 
            and request.user.role 
            and request.user.role.rolename == "admin"
        )