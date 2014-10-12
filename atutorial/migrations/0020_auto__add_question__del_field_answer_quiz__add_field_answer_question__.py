# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Question'
        db.create_table('gtutorial_question', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('type', self.gf('django.db.models.fields.IntegerField')()),
            ('question_content', self.gf('django.db.models.fields.TextField')()),
            ('quiz', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['gtutorial.Quiz'])),
        ))
        db.send_create_signal('gtutorial', ['Question'])

        # Deleting field 'Answer.quiz'
        db.delete_column('gtutorial_answer', 'quiz_id')

        # Adding field 'Answer.question'
        db.add_column('gtutorial_answer', 'question',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=1, to=orm['gtutorial.Question']),
                      keep_default=False)


        # Changing field 'Answer.explanation'
        db.alter_column('gtutorial_answer', 'explanation', self.gf('django.db.models.fields.TextField')(null=True))
        # Deleting field 'Quiz.question_content'
        db.delete_column('gtutorial_quiz', 'question_content')

        # Deleting field 'Quiz.type'
        db.delete_column('gtutorial_quiz', 'type')

        # Adding field 'Quiz.name'
        db.add_column('gtutorial_quiz', 'name',
                      self.gf('django.db.models.fields.CharField')(default='asd', max_length=255),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting model 'Question'
        db.delete_table('gtutorial_question')


        # User chose to not deal with backwards NULL issues for 'Answer.quiz'
        raise RuntimeError("Cannot reverse this migration. 'Answer.quiz' and its values cannot be restored.")
        
        # The following code is provided here to aid in writing a correct migration        # Adding field 'Answer.quiz'
        db.add_column('gtutorial_answer', 'quiz',
                      self.gf('django.db.models.fields.related.ForeignKey')(to=orm['gtutorial.Quiz']),
                      keep_default=False)

        # Deleting field 'Answer.question'
        db.delete_column('gtutorial_answer', 'question_id')


        # User chose to not deal with backwards NULL issues for 'Answer.explanation'
        raise RuntimeError("Cannot reverse this migration. 'Answer.explanation' and its values cannot be restored.")
        
        # The following code is provided here to aid in writing a correct migration
        # Changing field 'Answer.explanation'
        db.alter_column('gtutorial_answer', 'explanation', self.gf('django.db.models.fields.TextField')())

        # User chose to not deal with backwards NULL issues for 'Quiz.question_content'
        raise RuntimeError("Cannot reverse this migration. 'Quiz.question_content' and its values cannot be restored.")
        
        # The following code is provided here to aid in writing a correct migration        # Adding field 'Quiz.question_content'
        db.add_column('gtutorial_quiz', 'question_content',
                      self.gf('django.db.models.fields.TextField')(),
                      keep_default=False)


        # User chose to not deal with backwards NULL issues for 'Quiz.type'
        raise RuntimeError("Cannot reverse this migration. 'Quiz.type' and its values cannot be restored.")
        
        # The following code is provided here to aid in writing a correct migration        # Adding field 'Quiz.type'
        db.add_column('gtutorial_quiz', 'type',
                      self.gf('django.db.models.fields.IntegerField')(),
                      keep_default=False)

        # Deleting field 'Quiz.name'
        db.delete_column('gtutorial_quiz', 'name')


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
            'explanation': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'question': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Question']"})
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
        'gtutorial.question': {
            'Meta': {'object_name': 'Question'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'question_content': ('django.db.models.fields.TextField', [], {}),
            'quiz': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gtutorial.Quiz']"}),
            'type': ('django.db.models.fields.IntegerField', [], {})
        },
        'gtutorial.quiz': {
            'Meta': {'object_name': 'Quiz'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
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