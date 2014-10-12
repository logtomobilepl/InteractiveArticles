# coding=utf-8
import os
from datetime import datetime, timedelta

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator

from adesigner.models import Application, Screen, Board
from amain.views import generate_random_string
from paypal.standard.ipn.signals import payment_was_successful
from helpers import send_mail
import json


class Module(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(max_length=255, blank=True, null=True)
    order = models.IntegerField(default=0, blank=True, null=True)
    quiz = models.ForeignKey('Quiz', blank=True, null=True)
    is_introduction = models.BooleanField(default=False)

    def __unicode__(self):
        return self.title

    def get_lessons(self):
        return Lesson.objects.filter(module=self).order_by('order')

    def get_order_inc(self):
        return str(self.order + 1)


class Lesson(models.Model):
    title = models.CharField(max_length=255)
    module = models.ForeignKey(Module)
    order = models.IntegerField(default=0, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    award = models.IntegerField(default=0)
    is_start_finished = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    concepts = models.ManyToManyField('Concept', related_name="concepts", blank=True)
    required_concepts = models.ManyToManyField('Concept', related_name="prerequisities", blank=True)

    def __unicode__(self):
        return self.title

    def get_start_id(self):
        lesson_project = LessonProject.objects.get(lesson=self)
        start_project = lesson_project.start_project
        first_screen = Screen.objects.filter(app_id=start_project.id)[0]
        return str(first_screen.id)

    def get_end_id(self):
        lesson_project = LessonProject.objects.get(lesson=self)
        if lesson_project.end_project:
            first_screen = Screen.objects.filter(app_id=lesson_project.end_project.id)[0]
        else:
            first_screen = Screen.objects.filter(app_id=lesson_project.start_project.id)[0]
        return str(first_screen.id)

    def get_order_inc(self):
        return str(self.order + 1)

    def get_concepts(self):
        return Concept.objects.filter(concepts=self)


def create_lesson(sender, instance, created, **kwargs):
    if created:
        print "added lesson"
        dir_dest = settings.MEDIA_ROOT + '/upload/tutorial/' + str(instance.id) + "/"
        if not os.path.exists(dir_dest):
            os.makedirs(dir_dest)
        name = "tutorialLesson" + str(instance.id) + "StartProject"
        app_id = generate_random_string()
        orientation = "portrait"
        user = User.objects.get(id=1)
        character_name = "tutorial"
        release = 0
        authored_user = 1
        start_project = Application.objects.create(name=name, app_id=app_id, orientation=orientation, user=user,
                                                   character_name=character_name, release=release,
                                                   authored_user=authored_user)
        title = "lesson" + str(instance.id) + "Board"
        configuration = "portrait"
        app_id = str(start_project.id)
        screen = Screen.objects.create(title=title, configuration=configuration, app_id=app_id)
        screen_id = str(screen.id)
        Board.objects.create(screen_id=screen_id)

        end_project = Application.objects.create(name=name, app_id=app_id, orientation=orientation, user=user,
                                                 character_name=character_name, release=release,
                                                 authored_user=authored_user)
        title = "lesson" + str(instance.id) + "Board"
        configuration = "portrait"
        app_id = str(end_project.id)
        screen = Screen.objects.create(title=title, configuration=configuration, app_id=app_id)
        screen_id = str(screen.id)
        Board.objects.create(screen_id=screen_id)
        LessonProject.objects.create(lesson=instance, start_project=start_project, end_project=end_project)
    else:
        print "edited lesson"


post_save.connect(create_lesson, sender=Lesson)


class Bubble(models.Model):
    lesson = models.ForeignKey('Lesson')
    order = models.IntegerField(default=0)
    content = models.TextField(blank=True, null=True)

    def __unicode__(self):
        return "Bubble " + str(self.lesson.id) + " " + str(self.id)


class LessonCompleted(models.Model):
    user = models.ForeignKey(User)
    lesson = models.ForeignKey('Lesson')
    date = models.DateTimeField(auto_now_add=True)

    def get_days_diff(self):
        now = datetime.now().replace(tzinfo=None)
        timediff = now - self.date
        return timediff.days

    def get_concepts(self):
        return Concept.objects.filter(concepts=self.lesson)


class BubbleCompleted(models.Model):
    user = models.ForeignKey(User)
    bubble = models.ForeignKey(Bubble)
    lesson = models.ForeignKey(Lesson)


class LessonProject(models.Model):
    lesson = models.ForeignKey(Lesson)
    start_project = models.ForeignKey(Application, related_name="StartProject", blank=True, null=True)
    end_project = models.ForeignKey(Application, related_name="EndProject", blank=True, null=True)


class UserProject(models.Model):
    user = models.ForeignKey(User)
    lesson = models.ForeignKey(Lesson)
    project = models.ForeignKey(Application, blank=True, null=True)


class UserLessonProjects(models.Model):
    lesson = models.ForeignKey(Lesson)
    user = models.ForeignKey(User)
    start_project = models.ForeignKey(Application, related_name="StartProjectU", blank=True, null=True)
    end_project = models.ForeignKey(Application, related_name="EndProjectU", blank=True, null=True)


class Concept(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    mp3 = models.CharField(max_length=255, blank=True, null=True)
    video = models.CharField(max_length=255, blank=True, null=True)
    image = models.CharField(max_length=255, blank=True, null=True)

    def __unicode__(self):
        return self.title

class Subscription(models.Model):
    user = models.ForeignKey(User)
    expiration_date = models.DateTimeField(auto_now_add=True)
    expiration_date.editable = True
    last_change = models.DateTimeField()

    def save(self, *args, **kwargs):
        self.last_change = datetime.today()
        return super(Subscription, self).save(*args, **kwargs)

    def get_days_diff(self):
        now = datetime.now()
        expiration = datetime(self.expiration_date.year, self.expiration_date.month, self.expiration_date.day,
                              self.expiration_date.hour, self.expiration_date.minute, self.expiration_date.second)
        timediff = expiration - now
        return timediff.days


class AppFiles(models.Model):
    app_id = models.IntegerField()
    filename = models.TextField()
    text = models.TextField()


class SubscriptionPackage(models.Model):
    name = models.CharField(max_length=255)
    days = models.IntegerField()
    price = models.DecimalField(decimal_places=2, max_digits=5)
    description = models.TextField()

    def __unicode__(self):
        return "Subscription " + self.name


class Notification(models.Model):
    user = models.ForeignKey(User)
    content = models.TextField()
    was_sent = models.BooleanField(default=False)


class PromotionCode(models.Model):
    subscription_package = models.ForeignKey(SubscriptionPackage, blank=True, null=True)
    value = models.IntegerField(default=1, validators=[
        MaxValueValidator(100),
        MinValueValidator(1)
    ])
    code = models.CharField(max_length=255, unique=True)
    expiration_date = models.DateTimeField()
    valid = models.BooleanField(default=True)
    used = models.BooleanField(default=False)

    def get_days_diff(self):
        now = datetime.now()
        expiration = datetime(self.expiration_date.year, self.expiration_date.month, self.expiration_date.day,
                              self.expiration_date.hour, self.expiration_date.minute, self.expiration_date.second)
        if now > expiration:
            return -1
        else:
            return (expiration - now).days

    def is_valid(self):
        if self.valid:
            print "time diff: " + str(self.get_days_diff())
            self.valid = self.get_days_diff() > 0 and not self.used
            self.save()
        return self.valid

    is_valid.boolean = True

    def __unicode__(self):
        return "PromoCode: " + str(self.value) + "% for: " + str(self.subscription_package)


class UserCode(models.Model):
    promotion_code = models.ForeignKey(PromotionCode)
    user = models.ForeignKey(User)


def show_me_the_money(sender, **kwargs):
    email_topic = settings.SUBSCRIPTION_EMAIL_TOPIC
    email_content = settings.SUBSCRIPTION_EMAIL_CONTENT
    ipn_obj = sender
    print "custom: " + str(ipn_obj.custom)
    custom_dict = json.loads(ipn_obj.custom)
    print "dict: " + str(custom_dict)
    try:
        user = User.objects.get(id=custom_dict['user_id'])
        promo_code_id = custom_dict['promo_code_id']
        price = custom_dict['price']
        promo_code = None
        if promo_code_id > -1:
            promo_code = PromotionCode.objects.get(id=promo_code_id)
        if promo_code:
            if not promo_code.is_valid():
                return
            else:
                Payment.objects.create(promotion_code=promo_code, subscription_package_name=ipn_obj.item_name,
                                       price=price, user=user)
                promo_code.used = True
                promo_code.save()
                for user_code in UserCode.objects.filter(user=user):
                    user_code.delete()
        else:
            Payment.objects.create(subscription_package_name=ipn_obj.item_name, price=price, user=user)
        sub_pckg = SubscriptionPackage.objects.get(name=ipn_obj.item_name)
        subscription, created = Subscription.objects.get_or_create(user=user)
        if subscription.get_days_diff() < 0:
            subscription.expiration_date = datetime.now()
        subscription.expiration_date += timedelta(days=sub_pckg.days)
        subscription.save()
        email_recipient = user.email
        email_content %= sub_pckg.days
        send_mail(email_topic, email_content, email_recipient)
        notification, created = Notification.objects.get_or_create(user=user,
                                                                   content=settings.SUBSCRIPTION_NOTIFICATION_CONTENT)
        notification.was_sent = False
        notification.save()
        notification, created = Notification.objects.get_or_create(user=user,
                                                                   content=settings.NOTIFICATION_SUBSCRIPTION_ENDED)
        notification.was_sent = False
        notification.save()
    except Exception, e:
        print __file__, 1, 'Blad przy przypisywaniu subskrypcji'
        print "blad: " + str(e)
    print __file__, 1, 'Poprawnie dodano subskrypcje'


payment_was_successful.connect(show_me_the_money)


class Payment(models.Model):
    promotion_code = models.ForeignKey(PromotionCode, blank=True, null=True)
    subscription_package_name = models.CharField(max_length=255)
    price = models.DecimalField(decimal_places=2, max_digits=5)
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User)


class Quiz(models.Model):
    name = models.CharField(max_length=255)

    def get_all_questions(self):
        return Question.objects.filter(quiz=self)

    def __unicode__(self):
        return "Quiz: " + self.name


class Question(models.Model):
    TYPE_CHOICES = (
        (1, "Test wyboru"),
        (2, "Uzupełnij kod")
    )
    type = models.IntegerField(choices=TYPE_CHOICES)
    question_content = models.TextField()
    quiz = models.ForeignKey(Quiz)

    def get_text_answers(self):
        return TextAnswer.objects.filter(question=self)

    def get_code_answer(self):
        return CodeAnswer.objects.get(question=self)


class Answer(models.Model):
    question = models.ForeignKey(Question)
    explanation = models.TextField(blank=True, null=True)


class TextAnswer(Answer):
    answer_content = models.TextField()
    is_correct = models.BooleanField(default=False)


class CodeAnswer(Answer):
    wrong_code = models.TextField()
    correct_code = models.TextField()


class Result(models.Model):
    user = models.ForeignKey(User)
    quiz = models.ForeignKey(Quiz)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)