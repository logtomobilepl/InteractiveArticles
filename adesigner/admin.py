from django.contrib import admin

from adesigner.models import Settings


class SettingsAdmin(admin.ModelAdmin):
    list_display = ('id', 'key', 'value')
    list_filter = ('key',)


admin.site.register(Settings, SettingsAdmin)