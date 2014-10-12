from django.db import models


class UploadedImage(models.Model):
    path = models.CharField(max_length=255, null=True, blank=True)