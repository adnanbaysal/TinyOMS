import string
from datetime import datetime
from django.apps import apps
from rest_framework import serializers
from tinyoms.settings import MY_APPS
from .models import ExtraFieldAttributes, BaseExtendableModel, GenericImage
from .helper import check_value_type, get_model_class


class ExtraFieldAttributesSerializer(serializers.ModelSerializer):
    max_length = serializers.IntegerField(required=False)
    choices = serializers.ListField(
        child=serializers.CharField(), required=False)

    class Meta:
        model = ExtraFieldAttributes
        fields = "__all__"
        read_only_fields = ["id", "created_at"]

    def validate_max_length(self, max_length):
        if max_length and (max_length < 0 or max_length > 100):
            raise serializers.ValidationError(
                "max_length should be in the range [0, 100]")
        return max_length

    def validate_model_name(self, model_name):
        # model_name should be unique in all MY_APPS
        model_name = model_name.lower()
        for app in MY_APPS:
            try:
                model_class = apps.get_model(app, model_name)
                return model_name
            except:
                continue
        raise serializers.ValidationError("model_name not found")

    def validate_type_name(self, type_name):
        if type_name not in ExtraFieldAttributes.TYPE_NAMES:
            return serializers.ValidationError(
                f"type {type_name} is not in {ExtraFieldAttributes.TYPE_NAMES}"
            )
        return type_name

    def validate_choices(self, choices):
        type_name = self.initial_data.get("type_name")
        max_length = self.initial_data.get("max_length") or 100
        if type_name and type_name == "choices" and not choices:
            raise serializers.ValidationError("Choices should be filled")
        for choice in choices:
            if len(str(choice)) > max_length:
                raise serializers.ValidationError(
                    f"choice {choice} is longer than {max_length}"
                )
        if type_name and type_name != "choices":
            choices = None
        return choices

    def validate_default(self, default):
        valid, dafault = check_value_type(
            type_name=self.initial_data.get("type_name") or "str",
            value=default,
            choices=self.initial_data.get("choices")
        )
        if not valid:
            raise serializers.ValidationError(
                f"default value {default} is invalid!"
            )
        return default


class ExtendableModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseExtendableModel
        fields = '__all__'
        abstract = True

    def validate_extra_field_values(self, extra_field_values):
        error_keys = []
        for key, value in extra_field_values.items():
            if not self.Meta.model.check_extra_field_value(key, value)[0]:
                error_keys.append(key)
        if error_keys:
            # erroneous keys will be parsed from returning string
            # so that errors will only shown in these fields
            raise serializers.ValidationError(
                f"error_in_keys:{str(error_keys)}")
        return extra_field_values


class GenericImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenericImage
        fields = '__all__'

    def validate(self, data):
        model_name = self.initial_data.get("model_name")
        field_name = self.initial_data.get("field_name")
        extra_field_attribute = ExtraFieldAttributes.objects.filter(
            model_name=model_name, field_name=field_name
        ).first()
        if not extra_field_attribute:
            raise serializers.ValidationError(
                f"Extra field attribute {model_name} - {field_name} does not exist"
            )
        obj_id = self.initial_data.get("obj_id")
        if not obj_id or not obj_id.isnumeric():
            raise serializers.ValidationError("obj_id must be an integer.")
        model_class = get_model_class(model_name)
        obj = model_class.objects.filter(id=obj_id).first()
        if not obj:
            raise serializers.ValidationError(
                f"{model_name} object with id={obj_id} cannot be found."
            )
        return data
