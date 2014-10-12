from adesigner.models import Application, Screen
from django.forms import ModelForm


class ApplicationForm(ModelForm):
    class Meta:
        model = Application
        fields = ['name', 'orientation', 'character_name']


class ScreenForm(ModelForm):
    class Meta:
        model = Screen
        fields = ['title']