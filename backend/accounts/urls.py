from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    AdminUserListView,
    AdminAssignRoleView,
    AdminUserUpdateView,
)


urlpatterns = [

    # =====================================================
    # AUTHENTICATION
    # =====================================================

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),


    # =====================================================
    # PROFILE
    # =====================================================

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),


    # =====================================================
    # PASSWORD
    # =====================================================

    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),

    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot-password",
    ),

    path(
        "reset-password/",
        ResetPasswordView.as_view(),
        name="reset-password",
    ),


    # =====================================================
    # ADMIN / RBAC
    # =====================================================

    path(
        "admin/users/",
        AdminUserListView.as_view(),
        name="admin-users",
    ),
path(
    "admin/users/<int:user_id>/",
    AdminUserUpdateView.as_view(),
    name="admin-user-update",
),
    path(
        "admin/users/assign-role/",
        AdminAssignRoleView.as_view(),
        name="admin-assign-role",
    ),

]
