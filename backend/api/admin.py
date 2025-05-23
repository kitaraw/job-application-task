from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Role, User, Soft, SoftAccess


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("rolename", "add_roles", "edit_roles", "delete_roles", "add_users", "edit_users", "delete_users")
    list_filter = ("add_roles", "edit_roles", "delete_roles", "add_users", "edit_users", "delete_users")
    search_fields = ("rolename",)
    ordering = ("rolename",)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "is_active", "is_staff", "is_superuser")
    list_filter = ("role", "is_active", "is_staff", "is_superuser")
    search_fields = ("username", "email")
    ordering = ("username",)
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Role", {"fields": ("role",)}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "password1", "password2", "role", "is_active", "is_staff", "is_superuser"),
        }),
    )


@admin.register(Soft)
class SoftAdmin(admin.ModelAdmin):
    list_display = ("softname",)
    search_fields = ("softname",)
    ordering = ("softname",)


@admin.register(SoftAccess)
class SoftAccessAdmin(admin.ModelAdmin):
    list_display = ("soft", "user")
    list_filter = ("soft", "user")
    search_fields = ("soft__softname", "user__username")
