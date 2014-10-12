# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'CodeAnswer'
        db.create_table('gtutorial_codeanswer', (
            ('answer_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['gtutorial.Answer'], unique=True, primary_key=True)),
            ('wrong_code', self.gf('django.db.models.fields.TextField')()),
            ('correct_code', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal('gtutorial', ['CodeAnswer'])

        # Adding model 'TextAnswer'
        db.create_table('gtutorial_textanswer', (
            ('answer_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['gtutorial.Answer'], unique=True, primary_key=True)),
            ('answer_content', self.gf('django.db.models.fields.TextField')()),
            ('is_correct', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal('gtutorial', ['TextAnswer'])

        # Adding model 'Answer'
        db.create_table('gtutorial_answer', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('quiz', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['gtutorial.Quiz'])),
            ('explanation', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal('gtutorial', ['Answer'])

        # Adding model 'Quiz'
        db.create_table('gtutorial_quiz', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('type', self.gf('django.db.models.fields.IntegerField')()),
            ('question_content', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal('gtutorial', ['Quiz'])

        # Adding model 'Payment'
        db.create_table('gtutorial_payment', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('promotion_code', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['gtutorial.PromotionCode'], null=True, blank=True)),
            ('subscription_package_name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('price', self.gf('django.db.models.fields.DecimalField')(max_digits=5, decimal_places=2)),
            ('date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
        ))
        db.send_create_signal('gtutorial', ['Payment'])

        # Adding field 'Subscription.last_change'
        db.add_column('gtutorial_subscription', 'last_change',
                      self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime(2014, 3, 28, 0, 0)),
                      keep_default=False)

        # Adding field 'Module.quiz'
        db.add_column('gtutorial_module', 'quiz',
                      self.gf('django.db.models.fields.related.ForeignKey')(to=orm['gtutorial.Quiz'], null=True, blank=True),
                      keep_default=False)

        # Adding field 'SubscriptionPackage.description'
        db.add_column('gtutorial_subscriptionpackage', 'description',
                      self.gf('django.db.models.fields.TextField')(default=' '),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting model 'CodeAnswer'
        db.delete_table('gtutorial_codeanswer')

        # Deleting model 'TextAnswer'
        db.delete_table('gtutorial_textanswer')

        # Deleting model 'Answer'
        db.delete_table('gtutorial_answer')

        # Deleting model 'Quiz'
        db.delete_table('gtutorial_quiz')

        # Deleting model 'Payment'
        db.delete_table('gtutorial_payment')

        # Deleting field 'Subscription.last_change'
        db.delete_column('gtutorial_subscription', 'last_change')

        # Deleting field 'Module.quiz'
        db.delete_column('gtutorial_module', 'quiz_id')

        # Deleting field 'SubscriptionPackage.description'
        db.delete_column('gtutorial_subscriptionpackage', 'description')


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
            'authored_user': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'character_name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'main_code': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'orientation': ('django.db.models.fields.CharField', [], {'default': "'portrait'", 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'release': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        'gtutorial.answer': {
            'Meta': {'object_name': 'Answer'},
            'explanation': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'quiz': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Quiz']"})
        },
        'gtutorial.appfiles': {
            'Meta': {'object_name': 'AppFiles'},
            'app_id': ('django.db.models.fields.IntegerField', [], {}),
            'filename': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {})
        },
        'gtutorial.bubble': {
            'Meta': {'object_name': 'Bubble'},
            'content': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lesson': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Lesson']"}),
            'order': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        'gtutorial.bubblecompleted': {
            'Meta': {'object_name': 'BubbleCompleted'},
            'bubble': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Bubble']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lesson': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Lesson']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'gtutorial.codeanswer': {
            'Meta': {'object_name': 'CodeAnswer', '_ormbases': ['gtutorial.Answer']},
            'answer_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['gtutorial.Answer']", 'unique': 'True', 'primary_key': 'True'}),
            'correct_code': ('django.db.models.fields.TextField', [], {}),
            'wrong_code': ('django.db.models.fields.TextField', [], {})
        },
        'gtutorial.concept': {
            'Meta': {'object_name': 'Concept'},
            'content': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'lesson': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Lesson']"}),
            'mp3': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'video': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gtutorial.lesson': {
            'Meta': {'object_name': 'Lesson'},
            'award': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_premium': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_start_finished': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'module': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Module']"}),
            'order': ('django.db.models.fields.IntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'prerequisities': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'gtutorial.lessoncompleted': {
            'Meta': {'object_name': 'LessonCompleted'},
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lesson': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Lesson']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'gtutorial.lessonproject': {
            'Meta': {'object_name': 'LessonProject'},
            'end_project': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'EndProject'", 'null': 'True', 'to': "orm['gdesigner.Application']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lesson': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Lesson']"}),
            'start_project': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'StartProject'", 'null': 'True', 'to': "orm['gdesigner.Application']"})
        },
        'gtutorial.module': {
            'Meta': {'object_name': 'Module'},
            'description': ('django.db.models.fields.TextField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.IntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'prerequisities': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'quiz': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Quiz']", 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'gtutorial.notification': {
            'Meta': {'object_name': 'Notification'},
            'content': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'was_sent': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'gtutorial.payment': {
            'Meta': {'object_name': 'Payment'},
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'price': ('django.db.models.fields.DecimalField', [], {'max_digits': '5', 'decimal_places': '2'}),
            'promotion_code': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.PromotionCode']", 'null': 'True', 'blank': 'True'}),
            'subscription_package_name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'gtutorial.promotioncode': {
            'Meta': {'object_name': 'PromotionCode'},
            'code': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'expiration_date': ('django.db.models.fields.DateTimeField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'subscription_package': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.SubscriptionPackage']", 'null': 'True', 'blank': 'True'}),
            'valid': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'value': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        'gtutorial.quiz': {
            'Meta': {'object_name': 'Quiz'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'question_content': ('django.db.models.fields.TextField', [], {}),
            'type': ('django.db.models.fields.IntegerField', [], {})
        },
        'gtutorial.subscription': {
            'Meta': {'object_name': 'Subscription'},
            'expiration_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_change': ('django.db.models.fields.DateTimeField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'gtutorial.subscriptionpackage': {
            'Meta': {'object_name': 'SubscriptionPackage'},
            'days': ('django.db.models.fields.IntegerField', [], {}),
            'description': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'price': ('django.db.models.fields.DecimalField', [], {'max_digits': '5', 'decimal_places': '2'})
        },
        'gtutorial.textanswer': {
            'Meta': {'object_name': 'TextAnswer', '_ormbases': ['gtutorial.Answer']},
            'answer_content': ('django.db.models.fields.TextField', [], {}),
            'answer_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['gtutorial.Answer']", 'unique': 'True', 'primary_key': 'True'}),
            'is_correct': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'gtutorial.userlessonprojects': {
            'Meta': {'object_name': 'UserLessonProjects'},
            'end_project': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'EndProjectU'", 'null': 'True', 'to': "orm['gdesigner.Application']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lesson': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Lesson']"}),
            'start_project': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'StartProjectU'", 'null': 'True', 'to': "orm['gdesigner.Application']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'gtutorial.userproject': {
            'Meta': {'object_name': 'UserProject'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lesson': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Lesson']"}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gdesigner.Application']", 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        }
    }

    complete_apps = ['gtutorial']