from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Role, User, Soft, SoftAccess
from .serializers import (
    RoleSerializer,
    UserSerializer,
    SoftSerializer,
    SoftAccessSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserDetailSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission, SAFE_METHODS
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import BooleanField
from .permissions import RolePermission, UserPermission,IsAdminForSoftAccess
from rest_framework.decorators import action
from django.db import IntegrityError
from django.db import transaction

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [RolePermission]

    def format_role(self, role):
        """
        Формирует расширенный формат данных роли.
        """
        return {
            "id": role.id,
            "rolename": role.rolename,
            "permissions": [
                {
                    "permission": field.name,
                    "description": field.verbose_name,
                    "allowed": getattr(role, field.name)
                }
                for field in Role._meta.get_fields()
                if hasattr(field, 'verbose_name') and isinstance(getattr(role, field.name, None), bool)
            ]
        }

    def list(self, request, *args, **kwargs):
        """
        Возвращает список ролей с их разрешениями в расширенном формате.
        """
        roles = self.get_queryset()
        formatted_roles = [self.format_role(role) for role in roles]
        return Response(formatted_roles, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """
        Создает новую роль с проверкой прав и возвращает данные в расширенном формате.
        """
        if not request.user.role or not request.user.role.add_roles:
            return Response({"detail": "У вас нет прав на добавление ролей."}, status=status.HTTP_403_FORBIDDEN)

        permissions = request.data.get("permissions", [])
        role_data = {
            "rolename": request.data.get("rolename"),
        }

        # Обновляем флаги разрешений
        for permission in permissions:
            role_data[permission["permission"]] = permission["allowed"]

        print(self.get_serializer(data=role_data))

        serializer = self.get_serializer(data=role_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        instance = serializer.instance

        return Response(self.format_role(instance), status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Обновляет существующую роль с проверкой прав и возвращает данные в расширенном формате.
        """
        
        if not request.user.role or not request.user.role.edit_roles:
            return Response({"detail": "У вас нет прав на редактирование ролей."}, status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        permissions = request.data.get("permissions", [])
        role_data = {
            "rolename": request.data.get("rolename"),
        }

        # Обновляем флаги разрешений
        for permission in permissions:
            role_data[permission["permission"]] = permission["allowed"]


        serializer = self.get_serializer(instance, data=role_data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        instance.refresh_from_db()  # Обновляем объект из базы данных для получения актуальных данных

        return Response(self.format_role(instance), status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        Удаляет роль по имени (rolename) с проверкой прав.
        """
        rolename = kwargs.get('pk')  # 'pk' будет содержать имя роли из URL

        # Найти роль по имени
        try:
            instance = Role.objects.get(rolename=rolename)
        except Role.DoesNotExist:
            return Response({"detail": f"Роль '{rolename}' не найдена."}, status=status.HTTP_404_NOT_FOUND)

        # Проверка прав
        if not request.user.role or not request.user.role.delete_roles:
            return Response({"detail": "У вас нет прав на удаление ролей."}, status=status.HTTP_403_FORBIDDEN)

        # Защита от удаления роли admin
        if instance.rolename == "admin":
            return Response({"detail": "Роль 'admin' нельзя удалить."}, status=status.HTTP_403_FORBIDDEN)

        # Удаление роли
        instance.delete()
        return Response({"detail": f"Роль '{rolename}' успешно удалена."}, status=status.HTTP_204_NO_CONTENT)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserPermission]

    def create(self, request, *args, **kwargs):
        """
        Создание нового пользователя. Только для ролей с разрешением add_users.
        """
        user_role = getattr(request.user, 'role', None)
        if not user_role or not user_role.add_users:
            return Response(
                {"detail": "У вас нет прав на добавление пользователей."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Удаление пользователя. Только для ролей с разрешением delete_users.
        """
        user_role = getattr(request.user, 'role', None)
        if not user_role or not user_role.delete_users:
            return Response(
                {"detail": "У вас нет прав на удаление пользователей."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['put'], url_path='permissions')
    def update_permission(self, request, pk=None):
        """
        Обновляет конкретное разрешение у роли.
        """
        user = self.get_object()
        # Проверяем права на изменение разрешений
        if not request.user.role or not request.user.role.edit_users:
            return Response({"detail": "У вас нет прав на редактирование пользователей."}, status=status.HTTP_403_FORBIDDEN)

        permission = request.data.get("permission")
        allowed = request.data.get("allowed")

        if not permission or allowed is None:
            return Response(
                {"detail": "Поле 'permission' и 'allowed' являются обязательными."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Проверяем, существует ли такое разрешение у роли
        if not hasattr(user.role, permission):
            return Response({"detail": f"Разрешение '{permission}' не существует."}, status=status.HTTP_400_BAD_REQUEST)

        # Обновляем разрешение
        setattr(user.role, permission, allowed)
        user.role.save()

        return Response({"detail": f"Разрешение '{permission}' успешно обновлено."}, status=status.HTTP_200_OK)

class SoftViewSet(viewsets.ModelViewSet):
    serializer_class = SoftSerializer
    permission_classes = [IsAdminForSoftAccess]
    queryset = Soft.objects.all()  # Базовый queryset

    def get_queryset(self):
        """
        Переопределяем базовый queryset в зависимости от роли пользователя:
        - admin -> все пакеты;
        - user -> только те, к которым есть доступ.
        """
        user = self.request.user
        # Если у пользователя есть роль и она admin, возвращаем все
        if user.role and user.role.rolename == "admin":
            return super().get_queryset()
        else:
            # Возвращаем только те Soft, к которым есть доступ у данного пользователя
            return Soft.objects.filter(access__user=user)

    @action(detail=True, methods=['post'], url_path='grant-access')
    def grant_access(self, request, pk=None):
        """
        Назначает или удаляет доступ к пакету (Soft).
        Только для admin.
        Если users_with_access пуст, удаляет доступ у всех пользователей.
        """
        # Проверяем, что текущий пользователь - admin
        if not request.user.role or request.user.role.rolename != "admin":
            return Response(
                {"detail": "У вас нет прав назначать доступ к пакетам."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Ищем пакет (Soft), к которому хотим дать/удалить доступ
        try:
            soft_instance = self.get_object()
        except Soft.DoesNotExist:
            return Response(
                {"detail": "Пакет (ПО) не найден."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Получаем список пользователей из запроса
        users_with_access = request.data.get("users_with_access", [])

        try:
            with transaction.atomic():
                if not users_with_access:
                    # Удаляем доступ у всех пользователей
                    SoftAccess.objects.filter(soft=soft_instance).delete()
                    return Response(
                        {"detail": f"Доступ ко всем пользователям для '{soft_instance.softname}' был удалён."},
                        status=status.HTTP_200_OK
                    )

                # Получаем ID пользователей, которым нужно предоставить доступ
                user_ids = [user["id"] for user in users_with_access]

                # Проверяем, что все пользователи существуют
                users = User.objects.filter(id__in=user_ids)
                if users.count() != len(user_ids):
                    missing_ids = set(user_ids) - set(users.values_list("id", flat=True))
                    return Response(
                        {"detail": f"Пользователи с ID {list(missing_ids)} не найдены."},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Удаляем текущий доступ и создаём новый для указанных пользователей
                SoftAccess.objects.filter(soft=soft_instance).delete()
                SoftAccess.objects.bulk_create([
                    SoftAccess(soft=soft_instance, user=user)
                    for user in users
                ])

                return Response(
                    {"detail": f"Доступ обновлён для пакета '{soft_instance.softname}'."},
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            return Response(
                {"detail": f"Произошла ошибка: {str(e)}."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Добавляем действие для получения списка пользователей без доступа к ПО
    @action(detail=True, methods=['get'], url_path='excluded-users')
    def excluded_users(self, request, pk=None):
        """
        Возвращает список пользователей, не имеющих доступ к текущему ПО.
        Если переданы логины в query params, исключает их из результата.
        """
        try:
            # Получаем текущий объект ПО
            soft_instance = self.get_object()
        except Soft.DoesNotExist:
            return Response({"detail": "Пакет (ПО) не найден."}, status=status.HTTP_404_NOT_FOUND)
        
        # Получаем пользователей с доступом к этому ПО
        users_with_access = soft_instance.access.values_list('user_id', flat=True)

        # Исключаем их из списка всех пользователей
        excluded_users = User.objects.exclude(id__in=users_with_access)

        # Проверяем query params для исключения логинов
        exclude_logins = request.query_params.getlist('exclude_logins')
        if exclude_logins:
            excluded_users = excluded_users.exclude(username__in=exclude_logins)

        excluded_users_data = excluded_users.values('id', 'username', 'role__rolename')
        result = [
            {
                "id": user["id"],
                "username": user["username"],
                "role": user["role__rolename"]
            }
            for user in excluded_users_data
        ]

        return Response(result, status=status.HTTP_200_OK)
    

class SoftAccessViewSet(viewsets.ModelViewSet):
    queryset = SoftAccess.objects.all()
    serializer_class = SoftAccessSerializer
    permission_classes = [IsAdminForSoftAccess]


class RoleListView(APIView):
    permission_classes = [AllowAny]
    """
    Представление для получения списка всех ролей, с возможностью исключения роли "admin".
    По умолчанию исключает "admin".
    """

    def get(self, request):
        exclude_admin = request.query_params.get('exclude_admin', 'true').lower() == 'true'
        # Исключить роль "admin", если exclude_admin = true
        if exclude_admin:
            roles = Role.objects.exclude(rolename="admin")
        else:
            roles = Role.objects.all()

        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    """
    Представление для регистрации пользователей.
    """

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserDetailSerializer(user)
        return Response({
            "user": serializer.data
        })
    
class StatisticsAPIView(APIView):
    """
    Возвращает статистику:
    - Количество ролей
    - Количество пользователей
    - Количество пакетов
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        data = {
            "rolesCount": Role.objects.count(),
            "usersCount": User.objects.count(),
            "softCount": Soft.objects.count(),
        }
        return Response(data)
    
class RolePermissionsView(APIView):
    """
    Возвращает список всех булевых полей из модели Role в формате разрешений.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Получаем все булевые поля модели Role
        permissions = [
            {
                "permission": field.name,
                "description": field.verbose_name,
            }
            for field in Role._meta.get_fields()
            if isinstance(field, BooleanField) and hasattr(field, "verbose_name")
        ]

        return Response({"permissions": permissions}, status=200)