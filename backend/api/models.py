from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    rolename = models.CharField(
        max_length=80, 
        unique=True, 
        verbose_name="Название роли"
    )
    add_roles = models.BooleanField(
        default=False, 
        verbose_name="Добавление ролей"
    )
    edit_roles = models.BooleanField(
        default=False, 
        verbose_name="Редактирование ролей"
    )
    delete_roles = models.BooleanField(
        default=False, 
        verbose_name="Удаление ролей"
    )
    add_users = models.BooleanField(
        default=False, 
        verbose_name="Добавление пользователей"
    )
    edit_users = models.BooleanField(
        default=False, 
        verbose_name="Редактирование пользователей"
    )
    delete_users = models.BooleanField(
        default=False, 
        verbose_name="Удаление пользователей"
    )

    def __str__(self):
        return self.rolename

    class Meta:
        verbose_name = "Роль"
        verbose_name_plural = "Роли"
        ordering = ['rolename']


class User(AbstractUser):
    role = models.ForeignKey(
        Role, 
        on_delete=models.CASCADE,
        related_name="users", 
        verbose_name="Роль"
    )
    username = models.CharField(
        max_length=80, 
        unique=True, 
        verbose_name="Имя пользователя"
    )

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        ordering = ['-id']


class Soft(models.Model):
    softname = models.CharField(
        max_length=140, 
        verbose_name="Название программного обеспечения"
    )

    def __str__(self):
        return self.softname

    class Meta:
        verbose_name = "Программное обеспечение"
        verbose_name_plural = "Программное обеспечение"
        ordering = ['softname']


class SoftAccess(models.Model):
    soft = models.ForeignKey(
        Soft, 
        on_delete=models.CASCADE, 
        related_name="access", 
        verbose_name="Программное обеспечение"
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="access", 
        verbose_name="Пользователь"
    )

    def __str__(self):
        return f"{self.user.username} - {self.soft.softname}"

    class Meta:
        verbose_name = "Доступ к ПО"
        verbose_name_plural = "Доступы к ПО"
        unique_together = ('soft', 'user')
        ordering = ['user', 'soft']