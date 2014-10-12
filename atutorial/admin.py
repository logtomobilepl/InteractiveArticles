from django.contrib import admin
from atutorial.models import Module, Lesson, Bubble, Concept, Subscription, SubscriptionPackage, PromotionCode, \
    Quiz, Question, TextAnswer, CodeAnswer, Payment


class ModuleAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'description')
    list_filter = ('title',)


admin.site.register(Module, ModuleAdmin)


class LessonAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'module', 'order', 'award')
    list_filter = (('title', 'module', 'order', 'award'))


admin.site.register(Lesson, LessonAdmin)


class BubbleAdmin(admin.ModelAdmin):
    list_display = ('id', 'lesson', 'order', 'content')
    list_filter = (('lesson', 'order', 'content'))


admin.site.register(Bubble, BubbleAdmin)


class ConceptAdmin(admin.ModelAdmin):
    list_display = ('id', 'content')


admin.site.register(Concept, ConceptAdmin)


class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'expiration_date', 'last_change')
    list_filter = (('user',))


admin.site.register(Subscription, SubscriptionAdmin)


class SubscriptionPackageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'days', 'price')
    list_filter = (('name', 'days', 'price',))


admin.site.register(SubscriptionPackage, SubscriptionPackageAdmin)


class PromotionCodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'subscription_package', 'value', 'code', 'expiration_date', 'is_valid')
    list_filter = (('subscription_package', 'value', 'expiration_date', 'valid',))


admin.site.register(PromotionCode, PromotionCodeAdmin)


class TextAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'is_correct')
    list_filter = (('question', 'is_correct',))

admin.site.register(TextAnswer, TextAnswerAdmin)


class CodeAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'question')
    list_filter = ('question',)

admin.site.register(CodeAnswer, CodeAnswerAdmin)


class TextAnswerAdminInline(admin.StackedInline):
    model = TextAnswer


class CodeAnswerAdminInline(admin.StackedInline):
    model = CodeAnswer


class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'type')
    list_filter = ('type',)
    inlines = (TextAnswerAdminInline, CodeAnswerAdminInline, )

admin.site.register(Question, QuestionAdmin)


class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

admin.site.register(Quiz, QuizAdmin)


class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'promotion_code', 'subscription_package_name', 'price', 'date', 'user')

admin.site.register(Payment, PaymentAdmin)