import uuid
import os
from datetime import datetime
from pytz import timezone, UTC
from django.apps import apps
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.shortcuts import reverse
from django.template import loader
from django.core.mail import EmailMessage
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from tinyoms.settings import MY_APPS, EMAIL_FROM_ADDRESS, UPLOAD_TO, TIME_ZONE


def send_password_reset_link(user, request, template="email-reset-password-request.html"):
    token = PasswordResetTokenGenerator().make_token(user)
    user_id = urlsafe_base64_encode(force_bytes(user.id))
    url = request.build_absolute_uri(
        reverse('reset_password', args=[user_id, token]))
    # url = url.replace("api/auth", "dashboard")
    content = loader.render_to_string(
        template, {"username": user.username, "reset_password_url": url})
    mail = EmailMessage('TinyOMS password reset', content, to=[
                        user.email], from_email=EMAIL_FROM_ADDRESS)
    mail.content_subtype = 'html'
    try:
        mail.send()
    except:
        file = open("register-email.html", "w")
        file.write(content)
        file.close()
        return False
    return True


TYPE_FUNCTIONS = {
    "int": int,
    "float": float,
    "str": str,
}


def check_value_type(type_name, value, choices=None):
    check_result = True
    if type_name == 'choices':
        if value not in choices:
            check_result = False
    elif type_name == "bool":
        if value not in ("true", "false", True, False):
            check_result = False
        else:
            if type(value) == str:
                value = value.lower() == "true"
    elif type_name == "datetime":
        try:
            _ = datetime.strptime(value[:10], "%Y-%m-%d")
        except:
            check_result = False
    elif type_name == "image":
        try:
            _ = int(value)
        except:
            if value != None:
                check_result = False
    elif type_name in TYPE_FUNCTIONS:
        try:
            value = TYPE_FUNCTIONS[type_name](value)
        except:
            check_result = False
    else:
        check_result = False
    return check_result, value


def get_model_class(model_name):
    """ returns Model class for model_name in MY_APPS, 
        assuming no duplicate model names"""
    for app in MY_APPS:
        try:
            model_class = apps.get_model(app, model_name)
            return model_class
        except:
            continue
    return None


def get_image_path(directory):
    filename = str(uuid.uuid4()).replace("-", "") + ".png"
    return os.path.join(UPLOAD_TO, directory, filename)


def get_profile_image_path(instance, filename):
    return get_image_path(f"profiles/{str(instance.id)}")


def get_generic_image_path(instance, filename):
    return get_image_path("generic")


def get_timezone():
    return timezone(TIME_ZONE)


def utcnow_with_tz():
    return datetime.utcnow().replace(tzinfo=UTC)


class CustomPagination(PageNumberPagination):
    page_size_query_param = "page_size"
    max_page_size = 100
    page_size = 10

    def get_paginated_response(self, data):
        return Response(
            {
                "links": {
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                },
                "count": self.page.paginator.count,
                "current_page": self.page.number,
                "page_size": self.get_page_size(self.request),
                "results": data,
            }
        )
