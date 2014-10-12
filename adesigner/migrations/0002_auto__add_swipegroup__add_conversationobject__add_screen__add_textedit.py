# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Swipegroup'
        db.create_table('gdesigner_swipegroup', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(default='noname', max_length=255, null=True, blank=True)),
            ('page_control_visible', self.gf('django.db.models.fields.CharField')(default='0', max_length=255, null=True, blank=True)),
            ('navigation_bar_visible', self.gf('django.db.models.fields.CharField')(default='0', max_length=255, null=True, blank=True)),
            ('pager_tab_visible', self.gf('django.db.models.fields.CharField')(default='0', max_length=255, null=True, blank=True)),
            ('pager_tab_title', self.gf('django.db.models.fields.CharField')(default='pager tab title here', max_length=255, null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['Swipegroup'])

        # Adding model 'ConversationObject'
        db.create_table('gdesigner_conversationobject', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('app_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('image', self.gf('django.db.models.fields.CharField')(default='-', max_length=255, null=True, blank=True)),
            ('speaker_name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('sound', self.gf('django.db.models.fields.CharField')(default='-', max_length=255, null=True, blank=True)),
            ('player_say_the_first', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('conversations', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('html_content', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('onclick', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['ConversationObject'])

        # Adding model 'Screen'
        db.create_table('gdesigner_screen', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(default='No Title', max_length=255, null=True, blank=True)),
            ('swipegroup', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['gdesigner.Swipegroup'], null=True, blank=True)),
            ('configuration', self.gf('django.db.models.fields.CharField')(default='portrait', max_length=255, null=True, blank=True)),
            ('app_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['Screen'])

        # Adding model 'TextEdit'
        db.create_table('gdesigner_textedit', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('text', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('text_color', self.gf('django.db.models.fields.CharField')(default='240,240,240', max_length=255, null=True, blank=True)),
            ('font_size', self.gf('django.db.models.fields.CharField')(default='14', max_length=255, null=True, blank=True)),
            ('screen_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('x', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('y', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('height', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('width', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('visible', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('onclick', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['TextEdit'])

        # Adding model 'BoardCode'
        db.create_table('gdesigner_boardcode', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('screen_id', self.gf('django.db.models.fields.CharField')(default='-', max_length=255, null=True, blank=True)),
            ('user_code', self.gf('django.db.models.fields.TextField')(default='-', null=True, blank=True)),
            ('generated_code', self.gf('django.db.models.fields.TextField')(default='-', null=True, blank=True)),
            ('start', self.gf('django.db.models.fields.IntegerField')(default=0, null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['BoardCode'])

        # Adding model 'Tpopups'
        db.create_table('gdesigner_tpopups', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('app_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('onclick', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['Tpopups'])

        # Adding model 'ItemObject'
        db.create_table('gdesigner_itemobject', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('app_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('thumbnail', self.gf('django.db.models.fields.CharField')(default='-', max_length=255, null=True, blank=True)),
            ('bigsize_image', self.gf('django.db.models.fields.CharField')(default='-', max_length=255, null=True, blank=True)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['ItemObject'])

        # Adding model 'Board'
        db.create_table('gdesigner_board', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('screen_id', self.gf('django.db.models.fields.CharField')(default='-', max_length=255, null=True, blank=True)),
            ('background', self.gf('django.db.models.fields.CharField')(default='-', max_length=255, null=True, blank=True)),
            ('sound', self.gf('django.db.models.fields.CharField')(default='-', max_length=255, null=True, blank=True)),
            ('panel_items', self.gf('django.db.models.fields.CharField')(default='1', max_length=1, null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['Board'])

        # Adding model 'Application'
        db.create_table('gdesigner_application', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('app_id', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('orientation', self.gf('django.db.models.fields.CharField')(default='portrait', max_length=255, null=True, blank=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('character_name', self.gf('django.db.models.fields.CharField')(max_length=255)),
        ))
        db.send_create_signal('gdesigner', ['Application'])

        # Adding model 'TextObject'
        db.create_table('gdesigner_textobject', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('text', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('text_color', self.gf('django.db.models.fields.CharField')(default='240,240,240', max_length=255, null=True, blank=True)),
            ('font_size', self.gf('django.db.models.fields.CharField')(default='14', max_length=255, null=True, blank=True)),
            ('font_type', self.gf('django.db.models.fields.CharField')(default='Helvetica', max_length=255, null=True, blank=True)),
            ('screen_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('x_pos', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('y_pos', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('height', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('width', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('visible', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('onclick', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['TextObject'])

        # Adding model 'ButtonObject'
        db.create_table('gdesigner_buttonobject', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title_label', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('title_color', self.gf('django.db.models.fields.CharField')(default='240,240,240', max_length=255, null=True, blank=True)),
            ('background_image', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('screen_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('x_pos', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('y_pos', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('visible', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('onclick', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['ButtonObject'])

        # Adding model 'ClickableArea'
        db.create_table('gdesigner_clickablearea', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('screen_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('visible', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('file_name', self.gf('django.db.models.fields.CharField')(default='-', max_length=255, null=True, blank=True)),
            ('x', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('y', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('width', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('height', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('onclick', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['ClickableArea'])

        # Adding model 'HtmlObject'
        db.create_table('gdesigner_htmlobject', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('visible', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('x_pos', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('y_pos', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('html_content', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('screen_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('width', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('height', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('onclick', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['HtmlObject'])

        # Adding model 'ImageObject'
        db.create_table('gdesigner_imageobject', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('visible', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('x_pos', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('y_pos', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('file_name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('draggable', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('screen_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('onclick', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('gdesigner', ['ImageObject'])


    def backwards(self, orm):
        # Deleting model 'Swipegroup'
        db.delete_table('gdesigner_swipegroup')

        # Deleting model 'ConversationObject'
        db.delete_table('gdesigner_conversationobject')

        # Deleting model 'Screen'
        db.delete_table('gdesigner_screen')

        # Deleting model 'TextEdit'
        db.delete_table('gdesigner_textedit')

        # Deleting model 'BoardCode'
        db.delete_table('gdesigner_boardcode')

        # Deleting model 'Tpopups'
        db.delete_table('gdesigner_tpopups')

        # Deleting model 'ItemObject'
        db.delete_table('gdesigner_itemobject')

        # Deleting model 'Board'
        db.delete_table('gdesigner_board')

        # Deleting model 'Application'
        db.delete_table('gdesigner_application')

        # Deleting model 'TextObject'
        db.delete_table('gdesigner_textobject')

        # Deleting model 'ButtonObject'
        db.delete_table('gdesigner_buttonobject')

        # Deleting model 'ClickableArea'
        db.delete_table('gdesigner_clickablearea')

        # Deleting model 'HtmlObject'
        db.delete_table('gdesigner_htmlobject')

        # Deleting model 'ImageObject'
        db.delete_table('gdesigner_imageobject')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'gdesigner.application': {
            'Meta': {'object_name': 'Application'},
            'app_id': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'character_name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'orientation': ('django.db.models.fields.CharField', [], {'default': "'portrait'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'gdesigner.board': {
            'Meta': {'object_name': 'Board'},
            'background': ('django.db.models.fields.CharField', [], {'default': "'-'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'panel_items': ('django.db.models.fields.CharField', [], {'default': "'1'", 'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'screen_id': ('django.db.models.fields.CharField', [], {'default': "'-'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'sound': ('django.db.models.fields.CharField', [], {'default': "'-'", 'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.boardcode': {
            'Meta': {'object_name': 'BoardCode'},
            'generated_code': ('django.db.models.fields.TextField', [], {'default': "'-'", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'screen_id': ('django.db.models.fields.CharField', [], {'default': "'-'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'start': ('django.db.models.fields.IntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'user_code': ('django.db.models.fields.TextField', [], {'default': "'-'", 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.buttonobject': {
            'Meta': {'object_name': 'ButtonObject'},
            'background_image': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'onclick': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'screen_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'title_color': ('django.db.models.fields.CharField', [], {'default': "'240,240,240'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'title_label': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'visible': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'x_pos': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'y_pos': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.clickablearea': {
            'Meta': {'object_name': 'ClickableArea'},
            'file_name': ('django.db.models.fields.CharField', [], {'default': "'-'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'height': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'onclick': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'screen_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'visible': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'width': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'x': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'y': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.conversationobject': {
            'Meta': {'object_name': 'ConversationObject'},
            'app_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'conversations': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'html_content': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.CharField', [], {'default': "'-'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'onclick': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'player_say_the_first': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'sound': ('django.db.models.fields.CharField', [], {'default': "'-'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'speaker_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.htmlobject': {
            'Meta': {'object_name': 'HtmlObject'},
            'height': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'html_content': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'onclick': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'screen_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'visible': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'width': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'x_pos': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'y_pos': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.imageobject': {
            'Meta': {'object_name': 'ImageObject'},
            'draggable': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'file_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'onclick': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'screen_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'visible': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'x_pos': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'y_pos': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.itemobject': {
            'Meta': {'object_name': 'ItemObject'},
            'app_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'bigsize_image': ('django.db.models.fields.CharField', [], {'default': "'-'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'thumbnail': ('django.db.models.fields.CharField', [], {'default': "'-'", 'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.screen': {
            'Meta': {'object_name': 'Screen'},
            'app_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'configuration': ('django.db.models.fields.CharField', [], {'default': "'portrait'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'swipegroup': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gdesigner.Swipegroup']", 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'default': "'No Title'", 'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.swipegroup': {
            'Meta': {'object_name': 'Swipegroup'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'noname'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'navigation_bar_visible': ('django.db.models.fields.CharField', [], {'default': "'0'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'page_control_visible': ('django.db.models.fields.CharField', [], {'default': "'0'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'pager_tab_title': ('django.db.models.fields.CharField', [], {'default': "'pager tab title here'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'pager_tab_visible': ('django.db.models.fields.CharField', [], {'default': "'0'", 'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.textedit': {
            'Meta': {'object_name': 'TextEdit'},
            'font_size': ('django.db.models.fields.CharField', [], {'default': "'14'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'height': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'onclick': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'screen_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'text_color': ('django.db.models.fields.CharField', [], {'default': "'240,240,240'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'visible': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'width': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'x': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'y': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.textobject': {
            'Meta': {'object_name': 'TextObject'},
            'font_size': ('django.db.models.fields.CharField', [], {'default': "'14'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'font_type': ('django.db.models.fields.CharField', [], {'default': "'Helvetica'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'height': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'onclick': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'screen_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'text_color': ('django.db.models.fields.CharField', [], {'default': "'240,240,240'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'visible': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'width': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'x_pos': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'y_pos': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gdesigner.tpopups': {
            'Meta': {'object_name': 'Tpopups'},
            'app_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'onclick': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['gdesigner']