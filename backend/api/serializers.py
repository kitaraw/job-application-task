# api/serializers.py
from rest_framework import serializers
from .models import Role, User, Soft, SoftAccess
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from .utils import get_user_representation

User = get_user_model()

class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            "id",
            "rolename",
            "add_roles",
            "edit_roles",
            "delete_roles",
            "add_users",
            "edit_users",
            "delete_users",
            "permissions",
        ]

    def get_permissions(self, obj):
        # Формируем список разрешений
        return [
            {
                "permission": field.name,
                "description": field.verbose_name,
                "allowed": getattr(obj, field.name)
            }
            for field in Role._meta.get_fields()
            if hasattr(field, "verbose_name") and isinstance(getattr(obj, field.name, None), bool)
        ]


class UserSerializer(serializers.ModelSerializer):
    # read_only=True для переопределения RoleSerializer в методе PUT
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "role"]

    def create(self, validated_data):
        # Привязываем роль при создании пользователя
        rolename = self.initial_data.get('role')
        if not rolename:
            raise serializers.ValidationError({"role": "Роль обязательна для создания пользователя."})

        try:
            role = Role.objects.get(rolename=rolename)
        except Role.DoesNotExist:
            raise serializers.ValidationError({"role": "Указанная роль не найдена."})

        validated_data['role'] = role
        return super().create(validated_data)
    
    def update(self, instance, validated_data):

        # Сначала обновляем пользователя
        instance = super().update(instance, validated_data)

        # Далее - если хотим менять роль, смотрим self.initial_data
        role_data = self.initial_data.get("role")
        if role_data:
            new_rolename = role_data.get("rolename")
            if new_rolename:
                try:
                    new_role = Role.objects.get(rolename=new_rolename)
                except Role.DoesNotExist:
                    raise serializers.ValidationError(
                        {"role": f"Роль с именем '{new_rolename}' не найдена."}
                    )
                
                # Привязываем пользователя к уже существующей роли
                instance.role = new_role
                instance.save()

        return instance


class SoftSerializer(serializers.ModelSerializer):
    # Это поле будет возвращать список пользователей, у которых есть доступ к данному ПО
    users_with_access = serializers.SerializerMethodField()

    class Meta:
        model = Soft
        fields = ["id", "softname", "users_with_access"]

    def get_users_with_access(self, obj):
        """
        Возвращаем список пользователей, которые имеют доступ к этому ПО.
        """
        # obj.access -> RelatedManager (через related_name="access" в модели SoftAccess)
        # Каждый объект в obj.access.all() — это SoftAccess, у него есть .user
        return [
            {
                "id": access.user.id,
                "username": access.user.username,
                "role": access.user.role.rolename if access.user.role else None
            }
            for access in obj.access.all()
        ]


class SoftAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoftAccess
        fields = "__all__"


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, default="user")
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'first_name', 'last_name']
        extra_kwargs = {
            'username': {'validators': []},  # Отключаем стандартные валидаторы
        }

    def validate_username(self, value):
        """
        Проверяем уникальность username с кастомным сообщением. т.к. джанговский возвращает "Пользователь с таким именем уже существует"
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким логином уже существует.")
        return value
    
    def validate_role(self, value):
        """
        Проверяем, что переданная роль существует и не admin.
        """
        try:
            role = Role.objects.get(rolename=value)
        except Role.DoesNotExist:
            raise ValidationError(f"Роль '{value}' не существует.")
        if role.rolename == "admin" :
            raise ValidationError("Регистрация с ролью 'admin' доступна только суперпользователю.")
        
        return role

    def create(self, validated_data):
        # Получаем роль (по умолчанию 'user')
        role = validated_data.pop('role', None)
        first_name = validated_data.pop('firstName', '')
        last_name = validated_data.pop('lastName', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=role,
            first_name=first_name,
            last_name=last_name,
        )
        return user

    def to_representation(self, instance):
        """
        Переопределяем метод для добавления текущей роли и её прав
        """
        refresh = RefreshToken.for_user(instance)

        user_representation = get_user_representation(instance)

        return {
            "user": user_representation,
            "accessToken": str(refresh.access_token),
            "refresh": str(refresh),
        }
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            super().validate(attrs)
        except AuthenticationFailed as e:
            # Обработка стандартных ошибок авторизации
            if str(e.detail) == "No active account found with the given credentials":
                raise AuthenticationFailed("Учетная запись не найдена или данные неверны.")  # Кастомное сообщение
            else:
                raise AuthenticationFailed("Ошибка авторизации.")  # Общая ошибка

        user = self.user
        refresh = RefreshToken.for_user(user)
        user_representation = get_user_representation(user)

        return {
            "user": user_representation,
            "accessToken": str(refresh.access_token),
            "refresh": str(refresh),
        }
    
class UserDetailSerializer(serializers.ModelSerializer):
    currentRole = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'currentRole']

    def to_representation(self, instance):
        return get_user_representation(instance)

