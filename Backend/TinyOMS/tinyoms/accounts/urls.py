from django.urls import path, include
from rest_framework import routers
from .api import (
    LoginAPI,
    ChangePasswordAPI,
    ResetPasswordRequestAPI,
    ResetPasswordView,
    ResetPasswordAPI,
)
from knox import views as knox_views


urlpatterns = [
    path("api/auth", include("knox.urls")),
    path(
        "api/auth/logout", knox_views.LogoutView.as_view(), name="knox_logout"
    ),
    path("api/auth/login", LoginAPI.as_view()),
    path(
        "api/auth/changepassword",
        ChangePasswordAPI.as_view(),
        name="change_password",
    ),
    path(
        "api/auth/reset-password-request/<str:username_or_email>/",
        ResetPasswordRequestAPI.as_view(),
        name="reset_password_request",
    ),
    path(
        "api/auth/reset-password/<str:user_id>/<str:token>/",
        ResetPasswordView.as_view(),
        name="reset_password",
    ),
    path(
        "api/auth/reset-password",
        ResetPasswordAPI.as_view(),
        name="reset_password_post",
    ),
]
