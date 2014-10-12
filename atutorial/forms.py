from django import forms
from atutorial.models import Lesson, Module, PromotionCode


class LessonForm(forms.ModelForm):
    put_before = forms.BooleanField(required=False)
    before_which_lesson = forms.ModelChoiceField(queryset=Lesson.objects.filter(), required=False)

    def __init__(self, *args, **kwargs):
        module_id = kwargs.pop('mid', None)
        super(LessonForm, self).__init__(*args, **kwargs)

        if module_id:
            self.fields['before_which_lesson'].queryset = Lesson.objects.filter(
                module=Module.objects.get(id=module_id)).order_by('order')

    class Meta:
        model = Lesson
        exclude = ['order', 'module', 'is_start_finished']


class ModuleForm(forms.ModelForm):
    put_before = forms.BooleanField(required=False)
    before_which_module = forms.ModelChoiceField(queryset=Module.objects.all().order_by('order'), required=False)

    class Meta:
        model = Module
        exclude = ['order']


class PromotionCodeForm(forms.ModelForm):
    how_many = forms.IntegerField()

    class Meta:
        model = PromotionCode
        exclude = ['code', 'valid']


class ActivatePromoCodeForm(forms.Form):
    code = forms.CharField(max_length=255)