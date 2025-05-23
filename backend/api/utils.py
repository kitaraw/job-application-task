from .models import Role

def get_user_representation(user):
    """
    Формирует стандартное представление данных пользователя.
    """
    role = user.role
    permissions = [
        {
            "permission": field.name,
            "description": field.verbose_name,
            "allowed": getattr(role, field.name)
        }
        for field in Role._meta.get_fields()
        if hasattr(field, 'verbose_name') and isinstance(getattr(role, field.name, None), bool)
    ]

    current_role = {
        "name": role.rolename,
        "permissions": permissions
    }

    return {
        "id": user.id,
        "username": user.username,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "currentRole": current_role,
    }