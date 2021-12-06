import uuid
from django.apps import apps
from django.db.models.deletion import ProtectedError
from rest_framework import (
    viewsets, permissions, filters, generics, status, parsers, views
)
from rest_framework.response import Response
from rest_framework.schemas import ManualSchema
from rest_framework.compat import coreapi, coreschema
from tinyoms.settings import MY_APPS
from generics.permissions import (
    StaffOnly,
    PreventUpdate,
    StaffSuperUserOnly,
    IsStaffOrReadOnly,
    IsSuperuserOrReadOnly
)
from .models import ExtraFieldAttributes, GenericImage, Configuration
from .serializers import (
    ExtraFieldAttributesSerializer, GenericImageSerializer
)
from .helper import check_value_type, get_model_class, CustomPagination


class ExtraFieldAttributeViewSet(viewsets.ModelViewSet):
    """
    list:
    All users can call get

    create:
    update:
    delete: 
    only superuser makes modification
    """
    schema = ManualSchema(fields=[
        coreapi.Field(
            "model_name",
            required=True,
            location="query",
            schema=coreschema.String(),
            description="model_name=<str:model_name>"
        )
    ])
    serializer_class = ExtraFieldAttributesSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperuserOrReadOnly]

    def get_queryset(self):
        queryset = ExtraFieldAttributes.objects.all()
        model_name = self.request.query_params.get("model_name")
        if model_name:
            queryset = queryset.filter(model_name=model_name.lower())
        return queryset.order_by("created_at")

    def create(self, request, *args, **kwargs):
        # TODO: Fix null and empty default error (should be allowable)
        request.data["field_name"] = str(uuid.uuid4()).replace("-", "")[:8]
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid(raise_exception=True):
            return Response({"error": "serializer validation error"}, status=400)
        instance = serializer.save()
        model_class = get_model_class(instance.model_name)
        _, default = check_value_type(
            instance.type_name,
            instance.default,
            instance.choices
        )

        for obj in model_class.objects.all():
            obj.extra_field_values[instance.field_name] = default
            obj.save()

        headers = self.get_success_headers(serializer.data)
        response = serializer.data
        return Response(response, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        """ removes an extra field from the model and deletes existing values from objects"""
        extra_field_attribute = self.get_object()
        model_class = get_model_class(extra_field_attribute.model_name)
        serializer = ExtraFieldAttributesSerializer(extra_field_attribute)

        for obj in model_class.objects.all():
            obj.extra_field_values.pop(extra_field_attribute.field_name, None)
            obj.save()

        extra_field_attribute.delete()
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        model_name = request.data.get("model_name")
        type_name = request.data.get("type_name")
        default = request.data.get("default")
        max_length = request.data.get("max_length")
        field_name = request.data.get("field_name")
        choices = request.data.get("choices")

        instance = self.get_object()

        if (model_name and model_name != instance.model_name) or \
            (type_name and type_name != instance.type_name) or \
            (default and default != instance.default) or \
                (field_name and field_name != instance.field_name):
            return Response(
                {"error": "updating model_name, type_name, default, or field_name value is forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )

        if max_length and instance.max_length and max_length < instance.max_length:
            return Response(
                {"error": "decreasing max_length is forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )

        # if no choices is sent during patch, use the existing choices
        if instance.type_name == "choices" and not choices:
            request.data["choices"] = instance.choices

        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)


class GenericImageViewSet(viewsets.ModelViewSet):
    queryset = GenericImage.objects.all()
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    permission_classes = [
        permissions.IsAuthenticated, StaffOnly, PreventUpdate]
    serializer_class = GenericImageSerializer
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid(raise_exception=True):
            return Response({"error": "serializer validation error"}, status=statue)

        # if the same model_name, field_name, obj_id already has images, delete them
        GenericImage.objects.filter(
            model_name=serializer.validated_data["model_name"],
            field_name=serializer.validated_data["field_name"],
            obj_id=serializer.validated_data["obj_id"]
        ).delete()

        instance = serializer.save()
        model_class = get_model_class(instance.model_name)
        obj = model_class.objects.get(id=instance.obj_id)
        obj.extra_field_values[instance.field_name] = instance.id
        obj.save()

        headers = self.get_success_headers(serializer.data)
        response = serializer.data
        return Response(response, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = GenericImageSerializer(instance)

        model_class = get_model_class(instance.model_name)
        if model_class:
            obj = model_class.objects.filter(id=instance.obj_id).first()
            if obj:
                obj.extra_field_values[instance.field_name] = None
                obj.save()

        instance.delete()
        return Response(serializer.data)


class ProtectedErrorModelViewSet(viewsets.ModelViewSet):
    """ A generic ModelViewSet that give an error response when ProtectedError is raised"""

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"error": "Item cannot be deleted because of existing references"}, status=403
            )


class ConfigurationAPI(generics.GenericAPIView):
    schema = ManualSchema(fields=[
        coreapi.Field(
            "key",
            required=True,
            location="query",
            schema=coreschema.String(),
            description="key=<str:key>"
        )
    ])
    queryset = Configuration.objects.all()
    conf_keys = [
        "company_name",
        "installment_reminder_prefix",
        "installment_reminder_template",
    ]

    def get_permissions(self):
        staff_actions = ["list", "retrieve"]
        super_actions = ["create", "update", "partial_update", "destroy"]
        if self.action in staff_actions:
            self.permission_classes = [permissions.IsAuthenticated, StaffOnly]
        elif self.action in super_actions:
            self.permission_classes = [
                permissions.IsAuthenticated, StaffSuperUserOnly]
        return super(self.__class__, self).get_permissions()

    def get(self, request, *args, **kwargs):
        key = request.query_params.get("key")
        conf = self.get_queryset().filter(key=key).first()
        if not conf:
            return Response(
                {"error": f"Configuration {key} does not exist."}, status=404
            )
        return Response({"key": conf.key, "value": conf.value})

    def patch(self, request, *args, **kwargs):
        key = request.query_params.get("key")
        if key not in self.conf_keys:
            return Response(
                {"error": f"Configuration {key} does not exist or unwritable."}, status=403
            )
        value = str(request.data.get("value"))
        if len(value) > 250:
            return Response(
                {"error": "length of value must be less than or equal to 250 characters."},
                status=400
            )
        conf, created = Configuration.objects.update_or_create(
            defaults={"value": value}, key=key
        )
        return Response(
            {"key": key, "value": value, "action": "created" if created else "updated"}
        )
