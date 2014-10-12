from django.conf.urls import patterns, include, url
import os
from django.conf import settings
PROJECT_PATH = os.path.dirname(os.path.abspath(__file__))

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'amain.views.select_app', name='home'),
    url(r'^post/$', 'adesigner.views.post'),
    url(r'^select/app/$', 'amain.views.select_app'),
    url(r'^app/new/$', 'amain.views.new_app'),
    url(r'^dummy/$', 'adesigner.views.dummy'),
    url(r'^tutorial/post/$', 'atutorial.views.post'),

    #Lessons
    url(r'^lessons/admin/$', 'atutorial.views.view_all_modules'),
    url(r'^lessons/$', 'atutorial.views.view_all_modules_user'),
    url(r'^continue/(?P<lid>\d+)/$', 'atutorial.views.continue_lesson'),
    url(r'^startover/(?P<lid>\d+)/$', 'atutorial.views.startover_lesson'),
    url(r'^editstart/(?P<lid>\d+)/$', 'atutorial.views.edit_tutorial_start'),
    url(r'^editend/(?P<lid>\d+)/$', 'atutorial.views.edit_tutorial_end'),

    url(r'^viewstart/(?P<lid>\d+)/$', 'atutorial.views.view_start_project'),
    url(r'^viewend/(?P<lid>\d+)/$', 'atutorial.views.view_end_project'),
    url(r'^viewemu/(?P<lid>\d+)/$', 'atutorial.views.view_emu_project'),

    url(r'^viewprogress/(?P<lid>\d+)/$', 'atutorial.views.viewprogress'),

    url(r'^newlesson/(?P<mid>\d+)/$', 'atutorial.views.add_lesson'),
    url(r'^newmodule/$', 'atutorial.views.add_module'),

    #show learned concepts
    url(r'^progress/(?P<lid>\d+)/$', 'atutorial.views.lesson_progress'),
    url(r'^show_past_progress/(?P<days>\d+)/$', 'atutorial.views.show_past_progress'),

    #paypal
    url(r'^test_subscription/$', 'atutorial.views.subscriptions'),
    url(r'^activate/code/$', 'atutorial.views.activate_code'),
        url(r'^cancel/code/$', 'atutorial.views.cancel_code'),
    url(r'^paypalnotify/$', include('paypal.standard.ipn.urls')),

    #check for expirations
    url(r'^expirations/$', 'atutorial.views.check_for_expirations'),

    #Codes
    url(r'^generate_codes/$', 'atutorial.views.generate_codes'),
    url(r'^promo_codes/$', 'atutorial.views.show_promo_codes'),

    #User history
    url(r'^history/$', 'atutorial.views.user_payment_history'),
    url(r'^userprogress/$', 'atutorial.views.user_concepts_learned'),

    #Quiz
    url(r'^start_quiz/(?P<quiz_id>\d+)/$', 'atutorial.views.show_quiz'),


    #create new screens with an appid
    url(r'^addscreen/app/(?P<aid>\d+)/$', 'amain.views.select_screen'),
    url(r'^screen/new/(?P<aid>\d+)/$', 'amain.views.new_screen'),
    url(r'^screen/(?P<sid>\d+)/$', 'adesigner.views.edit_screen'),
    url(r'^screenlist/$', 'amain.views.get_screen_list'),
    url(r'^dummy/$', 'amain.views.export_app_to_xml'),
    url(r'^export/(?P<aid>\d+)/$', 'amain.views.export_app_to_xml'),

    #ajax stuff
    url(r'^uploadfile/$', 'amain.views.upload_image'),
    url(r'^getfiles/$', 'amain.views.get_uploaded_images'),
    url(r'^swipegroupslist/$', 'adesigner.views.get_swipegroups'),
    url(r'^removefile/$', 'adesigner.views.remove_file'),

    url(r'^media/css(.*)$', 'django.views.static.serve', {'document_root': os.path.join(os.path.dirname(__file__), 'media/css'), 'show_indexes' : False}),
    url(r'^media/zip(.*)$', 'django.views.static.serve', {'document_root': os.path.join(os.path.dirname(__file__), 'media/zip'), 'show_indexes' : False}),
    url(r'^media/img(.*)$', 'django.views.static.serve', {'document_root': os.path.join(os.path.dirname(__file__), 'media/img'), 'show_indexes' : False}),
    url(r'^media/upload(.*)$', 'django.views.static.serve', {'document_root': os.path.join(os.path.dirname(__file__), 'media/upload'), 'show_indexes' : False}),
    url(r'^media/upload/img(.*)$', 'django.views.static.serve', {'document_root': os.path.join(os.path.dirname(__file__), 'media/upload/img'), 'show_indexes' : False}),
    url(r'^media/upload/sound(.*)$', 'django.views.static.serve', {'document_root': os.path.join(os.path.dirname(__file__), 'media/upload/sound'), 'show_indexes' : False}),
    url(r'^media/js(.*)$', 'django.views.static.serve', {'document_root': os.path.join(os.path.dirname(__file__), 'media/js'), 'show_indexes' : False}),
    url(r'^media/images(.*)$', 'django.views.static.serve', {'document_root': os.path.join(os.path.dirname(__file__), 'media/images'), 'show_indexes' : False}),
    url(r'^login/$', 'django.contrib.auth.views.login'),


    url(r'^accounts/', include('registration_email.backends.default.urls')),

    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^admin/', include(admin.site.urls)),

    url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
)
