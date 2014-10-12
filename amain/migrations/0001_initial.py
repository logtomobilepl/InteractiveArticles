# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'UploadedImage'
        db.create_table('gmain_uploadedimage', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('path', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
        ))
        db.send_create_signal('gmain', ['UploadedImage'])


    def backwards(self, orm):
        # Deleting model 'UploadedImage'
        db.delete_table('gmain_uploadedimage')


    models = {
        'gmain.uploadedimage': {
            'Meta': {'object_name': 'UploadedImage'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'path': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['gmain']