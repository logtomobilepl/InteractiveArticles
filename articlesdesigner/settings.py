# Django settings for AppDesigner project.
import os
DEBUG = True
TEMPLATE_DEBUG = DEBUG

PROJECT_PATH = os.path.dirname(os.path.abspath(__file__))

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'articlesdesigner',                      # Or path to database file if using sqlite3.
        # The following settings are not used with sqlite3:
        'USER': 'articlesdesigner',
        'PASSWORD': 'programista123',
        'HOST': '',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '',                      # Set to empty string for default.
    }
}

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = []

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = os.path.join(PROJECT_PATH, 'media')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = '/articlesdesigner/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/articlesdesigner/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'a#5#8kb^u@gyds7qwbkgb8-9gb5n&35k7(i84i@fq5lo5v!%8y'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'articlesdesigner.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'articlesdesigner.wsgi.application'

TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'templates'),
    os.path.join(PROJECT_PATH, 'templates/xml'),
)


INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    'django.contrib.admindocs',
    'south',
    'amain',
    'adesigner',
    'atutorial',
    'paypal.standard.ipn',
    'registration',
    'registration_email',
)

LOGIN_URL = "/articlesdesigner/accounts/login"

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

ACCOUNT_ACTIVATION_DAYS = 7 # One-week activation window; you may, of course, use a different value.

AUTHENTICATION_BACKENDS = (
    'registration_email.auth.EmailBackend',
)

EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'jakub@intelmind.pl'
EMAIL_HOST_PASSWORD = 'tymczasowe'
EMAIL_USE_TLS = True
APP_ZIP_URL = "http://194.169.126.46/articlesdesigner/media/zip/"
PAYPAL_RECEIVER_EMAIL = "seller@gdesigner.pl"
SUBSCRIPTION_MONTH = "Learn To Code 30 Days Premium"
SUBSCRIPTION_YEAR = "Learn To Code Full Year Premium"

PAYPAL_PRIVATE_CERT = os.path.join(PROJECT_PATH, 'paypal.pem')
PAYPAL_PUBLIC_CERT = os.path.join(PROJECT_PATH, 'pubpaypal.pem')
PAYPAL_CERT = os.path.join(PROJECT_PATH, 'paypal_cert_pem.txt')
PAYPAL_CERT_ID = 'UXS7G8NGN466L'

SUBSCRIPTION_EMAIL_TOPIC = "Learn To Code - Subscription Activated"
SUBSCRIPTION_EMAIL_CONTENT = "Your subscription for %d days has been activated."

SUBSCRIPTION_NOTIFICATION_DAYS = 7
SUBSCRIPTION_NOTIFICATION_TOPIC = "Learn To Code - Your subscription will expire soon"
SUBSCRIPTION_NOTIFICATION_CONTENT = "Your subscription will expire in 7 days. To add more time go to http://logtomobile.com/articlesdesigner/test_subscription/"

NOTIFICATION_SUBSCRIPTION_ENDED = "Notification subscription ended"

# URL_PAYPAL_NOTIFY = "http://194.169.126.46/articlesdesigner/paypalnotify/"
# URL_PAYPAL_RETURN = "http://194.169.126.46/articlesdesigner/test_subscription/";
URL_PAYPAL_NOTIFY = "http://81.190.212.30:8000/articlesdesigner/paypalnotify/"
URL_PAYPAL_RETURN = "http://81.190.212.30:8000/articlesdesigner/test_subscription/";