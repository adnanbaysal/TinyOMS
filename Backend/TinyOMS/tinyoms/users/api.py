from django.contrib.auth.models import User
from rest_framework import viewsets, permissions, filters, generics, status
from rest_framework.response import Response
from rest_framework.compat import coreapi, coreschema
from rest_framework.schemas import ManualSchema
from generics.permissions import StaffOnly
from generics.helper import send_password_reset_link, CustomPagination
from products.models import Product
from .models import Employee, Client, Supplier
from .serializers import (
    UserSerializer, EmployeeSerializer, ClientSerializer, SupplierSerializer
)


# Single viewset for Employee, Client, and Supplier
class UserViewSet(viewsets.ModelViewSet):
    schema = ManualSchema(fields=[
        coreapi.Field(
            "usertype",
            required=False,
            location="query",
            schema=coreschema.String(),
            description="usertype=<str:usertype>"
        )
    ])

    permission_classes = [permissions.IsAuthenticated]  # , StaffOnly]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'email', 'first_name', 'last_name']

    @classmethod
    def check_write_authorization(cls, request):
        usertype = request.query_params.get("usertype")
        if (not usertype) or (usertype == "employee" and not request.user.is_superuser):
            return Response(
                {"error": "You are not authorized to perform this action"}, status=403
            )
        return None

    def check_update_authorization(self, request):
        if request.user.is_superuser:
            # superuser can update any user
            return None
        # for non-superusers, only the following fields can be updated
        update_fields = ["first_name", "last_name",
                         "email", "profile_image", "ui_language"]
        keys = list(request.data.keys())  # to force a copy of keys
        for key in keys:
            if key not in update_fields:
                request.data.pop(key, None)
        instance = self.get_object()
        if request.user.is_staff and (Client.objects.filter(id=instance.id).exists()
                                      or Supplier.objects.filter(id=instance.id).exists()):
            # staff can update clients and suppliers
            return None
        if request.user.id == instance.id:
            # every user can update self information (limited to the fields above)
            return None
        return Response(
            {"error": "You are not authorized to perform this action"}, status=403
        )

    @classmethod
    def remove_invalid_fields(cls, request):
        if not request.user.is_superuser or \
                request.query_params.get("usertype") in ["client", "supplier"]:
            request.data.pop("is_staff", None)
            request.data.pop("is_superuser", None)

    @staticmethod
    def is_not_employee(user_id):
        client = Client.objects.filter(id=user_id)
        if client.exists():
            return True, ClientSerializer, client
        supplier = Supplier.objects.filter(id=user_id)
        if supplier.exists():
            return True, SupplierSerializer, supplier
        return False, EmployeeSerializer, None

    def get_queryset(self):
        user_id = self.request.user.id
        not_employee, _, user = self.is_not_employee(user_id)
        if not_employee:
            return user
        usertype = self.request.query_params.get("usertype")
        if usertype == "employee":
            return Employee.objects.all()
        if usertype == "client":
            return Client.objects.all()
        if usertype == "supplier":
            return Supplier.objects.all()
        return User.objects.all()

    def get_serializer_class(self):
        user_id = self.request.user.id
        not_employee, modelSerializer, _ = self.is_not_employee(user_id)
        if not_employee:
            return modelSerializer
        usertype = self.request.query_params.get("usertype")
        if usertype == "employee":
            return EmployeeSerializer
        if usertype == "client":
            return ClientSerializer
        if usertype == "supplier":
            return SupplierSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "You are not authorized to perform this action!"}, status=400
            )

        error = self.check_write_authorization(request)
        if error:
            return error

        self.remove_invalid_fields(request)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid(raise_exception=True):
            return Response(
                {"error": "serializer validation error"}, status=400
            )

        instance = serializer.save()
        response = serializer.data
        headers = self.get_success_headers(serializer.data)
        if request.query_params.get("notify") == "true":
            send_password_reset_link(
                instance, request, template="email-set-password-register.html"
            )
        return Response(response, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        error = self.check_update_authorization(request)
        if error:
            return error
        self.remove_invalid_fields(request)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        if not serializer.is_valid():  # raise_exception=True
            return Response(
                {"error": "serializer validation error"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if "profile_image" in request.data:
            instance.profile_image.delete(save=False)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "You are not authorized to perform this action!"}, status=400
            )
        error = self.check_write_authorization(request)
        if error:
            return error

        instance = self.get_object()
        serializer = self.get_serializer_class()
        data = serializer(instance=instance).data
        try:
            instance.delete()
            return Response(data)
        except:  # one possible exception: ProtectedError
            return Response(
                {"error": "Object deletion not permitted!"},
                status=status.HTTP_403_FORBIDDEN
            )
