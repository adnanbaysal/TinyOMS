from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.views import View
from django.utils.encoding import force_text
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import generics, status, serializers, permissions
from django.db.models import Q
from knox.models import AuthToken
from datetime import timedelta
from generics.helper import send_password_reset_link
from generics.permissions import OnlyPatch
from users.serializers import UserSerializer, EmployeeSerializer, ClientSerializer, SupplierSerializer
from users.models import Employee, Client, Supplier
from .serializers import LoginSerializer, ChangePasswordSerializer


class UserTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        user_id = str(user.pk)
        ts = str(timestamp)
        is_staff = str(user.is_staff)
        return f"{user_id}{ts}{is_staff}"


user_tokenizer = UserTokenGenerator()
user_reset_password_tokenizer = PasswordResetTokenGenerator()


class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        if not username:
            return Response({"error": "missing_username_field"}, status=status.HTTP_400_BAD_REQUEST)
        existing_user = User.objects.filter(username=username).first()
        if not existing_user:
            return Response({"error": "user_does_not_exist"}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        serializer_class = ClientSerializer
        client = Client.objects.filter(id=user.id).first()
        supplier = Supplier.objects.filter(id=user.id).first()
        employee = Employee.objects.filter(id=user.id).first()
        if client:
            user = client
        elif supplier:
            user = supplier
            serializer_class = SupplierSerializer
        elif employee:
            user = employee
            serializer_class = EmployeeSerializer
        return Response(
            {
                "user": serializer_class(user, context=self.get_serializer_context()).data,
                "token": AuthToken.objects.create(user, timedelta(days=730))[1],
            }
        )


class ChangePasswordAPI(generics.UpdateAPIView):
    """
    put: not allowed
    patch: perform current password check then update the user's password with the new password
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated, OnlyPatch]
    queryset = User.objects.all()

    def get_object(self):
        obj = self.request.user
        return obj

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            new_password = request.data["new_password"]
            user.set_password(new_password)
            user.save()
        return Response(request.data)


class ResetPasswordRequestAPI(generics.GenericAPIView):
    serializer_class = serializers.Serializer

    def get(self, request, username_or_email):
        user = User.objects.filter(
            Q(username=username_or_email) | Q(email=username_or_email)
        ).first()
        if not user:
            return Response({"error": "user_does_not_exist"}, status=status.HTTP_404_NOT_FOUND)
        if not send_password_reset_link(user, request):
            return Response({"error": "sending_email_failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"success": "password_reset_link_sent"})


class ResetPasswordView(View):
    template_name = "reset_password.html"

    def get(self, request, *args, **kwargs):
        user_id = force_text(urlsafe_base64_decode(kwargs['user_id']))
        user = User.objects.filter(pk=user_id).first()
        if not user:
            return render(request, "user-does-not-exist.html")
        if user_reset_password_tokenizer.check_token(user, kwargs['token']):
            return render(request, "reset_password.html")
        return render(request, "reset_password_invalid_link.html")

    def post(self, request, *args, **kwargs):
        split_token_and_user_id = request.POST['token'].split('/')
        token = split_token_and_user_id[5]
        new_password = request.POST['psw']
        user_id = force_text(urlsafe_base64_decode(split_token_and_user_id[4]))
        user = User.objects.filter(pk=user_id).first()
        if not user:
            return render(request, "user-does-not-exist.html")
        if user_reset_password_tokenizer.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return render(request, "reset_password_successful.html")
        return render(request, "reset_password_invalid_link.html")


class ResetPasswordAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def get(self, request):
        token = request.query_params.get("token")
        user_id = request.query_params.get("user_id")
        user_id = force_text(urlsafe_base64_decode(user_id))
        user = User.objects.filter(pk=user_id).first()
        if not user:
            return Response(
                {"response": "User does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )
        if user_reset_password_tokenizer.check_token(user, token):
            return Response({"response": "Token is valid."})
        return Response(
            {"response": "Token is invalid."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def post(self, request):
        token = request.data["token"]
        new_password = request.data["new_password"]
        user_id = force_text(urlsafe_base64_decode(request.data["user_id"]))
        user = User.objects.filter(pk=user_id).first()
        if not user:
            return Response(
                {
                    "response": "User does not exist."
                }, status=status.HTTP_404_NOT_FOUND
            )
        if user_reset_password_tokenizer.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response(
                {"response": "Password is changed successfully."},
                status=status.HTTP_200_OK
            )
        return Response(
            {"response": "Token is invalid."},
            status=status.HTTP_400_BAD_REQUEST
        )
