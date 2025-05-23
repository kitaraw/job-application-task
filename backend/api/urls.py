# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RoleViewSet,
    UserViewSet,
    SoftViewSet,
    SoftAccessViewSet,
    RoleListView,
    UserDetailView,
    StatisticsAPIView,
    RolePermissionsView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, LoginView


router = DefaultRouter()
router.register("roles", RoleViewSet, basename="role")
router.register("users", UserViewSet)
router.register("softs", SoftViewSet)
router.register("softs-access", SoftAccessViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path(
        "auth/get-registarion-roles/",
        RoleListView.as_view(),
        name="role-list-exclude-admin",
    ),
    
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/user/", UserDetailView.as_view(), name="user-detail"),
    path("statistics/", StatisticsAPIView.as_view(), name="statistics"),
    path("avail-permissions/", RolePermissionsView.as_view(), name="role-permissions"),
]
