from itertools import chain
import os
import datetime
import sha
import binascii
from django.core.exceptions import ObjectDoesNotExist

from django.shortcuts import render_to_response
from django.template.context import RequestContext
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.conf import settings

from atutorial.models import Module, Lesson, Bubble, LessonCompleted, BubbleCompleted, LessonProject, UserProject, \
    UserLessonProjects, Concept, AppFiles, SubscriptionPackage, Subscription, Notification, PromotionCode, Quiz, \
    Result, UserCode, Payment
from adesigner.models import TextObject, ButtonObject, Screen, ImageObject, HtmlObject, BoardCode, ClickableArea, \
    Board, ItemObject, ConversationObject, Tpopups, TextEdit, Publish, CodesPublish
from amain.views import handle_uploaded_file, copy_tutorial_project
from adesigner.models import Application, Settings
from adesigner.views import edit_screen
from atutorial.forms import LessonForm, ModuleForm, PromotionCodeForm, ActivatePromoCodeForm
from paypal.standard.forms import PayPalSharedSecretEncryptedPaymentsForm
from helpers import send_mail

import json


@login_required
def view_all_modules(request):
    user = request.user
    modules = Module.objects.all().order_by('order')
    lessons = Lesson.objects.all()
    return render_to_response('all_modules.html', locals(), context_instance=RequestContext(request))


@login_required
def view_all_modules_user(request):
    user = request.user
    is_user_premium = user_has_premium(user)
    modules = Module.objects.all()
    lessons = Lesson.objects.all()
    return render_to_response('all_modules_user.html', locals(), context_instance=RequestContext(request))


@csrf_exempt
def post(request):
    if request.method == 'POST':
        action = request.POST["action"]
        if action == "save_bubble":
            return save_bubble(request)
        elif action == "delete_bubble":
            return delete_bubble(request)
        elif action == "get_lessons":
            return handle_get_lessons(request)
        elif action == "get_bubbles":
            return get_all_bubbles(request)
        elif action == "get_bubbles_user":
            return get_all_bubbles_user(request)
        elif action == "complete_bubble":
            return complete_bubble(request)
        elif action == "copy_end_project":
            return copy_project_as_final(request)
        elif action == "copy_start_project":
            return copy_project_as_start(request)
        elif action == "get_lesson_progress":
            return is_lesson_finished_by_user(request)
        elif action == "is_lesson_started":
            return is_lesson_finished_by_user(request)
        elif action == "count_bubbles":
            return count_bubbles(request)
        elif action == "upload_file":
            return upload_file(request)
        elif action == "remove_file":
            return remove_file(request)
        elif action == "finished_editing_starting":
            return finished_editing_starting(request)
        elif action == "get_conceptions":
            return get_conceptions(request)
        elif action == "edit_file":
            return edit_app_file(request)
        elif action == "get_file":
            return get_app_file(request)
        elif action == "get_progress":
            return get_progress(request)
        elif action == "show_sub_ended":
            return show_sub_ended(request)
        elif action == "getIdNextLesson":
            return get_next_lesson_id(request)
        elif action == "set_percent_quiz":
            return set_percent_quiz(request)
        elif action == "get_precent_quiz":
            return get_percent_quiz(request)
        elif action == "check_lesson_requirements":
            return check_lesson_requirements(request)
        elif action == "complete_lesson":
            return complete_lesson(request)
        else:
            return HttpResponse("Not Implemented: " + action)
    else:
        return render_to_response('tutorial_post.html', locals(), context_instance=RequestContext(request))


@login_required
def user_payment_history(request):
    payments = Payment.objects.filter(user=request.user)
    return render_to_response('user_history.html', locals(), context_instance=RequestContext(request))


@login_required
def user_concepts_learned(request):
    lessons_completed = LessonCompleted.objects.filter(user=request.user)
    added_concepts = []
    all_concepts = []
    for lesson_completed in lessons_completed:
        for concept in lesson_completed.lesson.concepts.all():
            if not concept in added_concepts:
                concept_lesson_pair = dict()
                concept_lesson_pair['concept'] = concept
                concept_lesson_pair['lesson_completed'] = lesson_completed
                all_concepts.append(concept_lesson_pair)
                added_concepts.append(concept)
    return render_to_response('user_progress.html', locals(), context_instance=RequestContext(request))


def set_percent_quiz(request):
    user = User.objects.get(id=request.POST["user_id"])
    quiz = Quiz.objects.get(id=request.POST["quiz_id"])
    value = request.POST["percent"]
    result, created = Result.objects.get_or_create(user=user, quiz=quiz)
    result.score = value
    result.save()
    return HttpResponse("OK")


def get_percent_quiz(request):
    user = User.objects.get(id=request.POST["user_id"])
    quiz = Quiz.objects.get(id=request.POST["quiz_id"])
    try:
        result = str(Result.objects.get(user=user, quiz=quiz).score)
    except Exception, e:
        result = "-1"
    return HttpResponse(result)


def check_lesson_requirements(request):
    response_data = dict()
    response_data['concepts_to_learn'] = "None"
    user_id = request.POST['user_id']
    lesson_id = request.POST['lesson_id']
    user = User.objects.get(id=user_id)
    lesson = Lesson.objects.get(id=lesson_id)
    concepts_required = lesson.required_concepts.all()
    concepts_learned = []
    concepts_to_learn = []

    concepts_with_lessons = []
    lessons_completed = LessonCompleted.objects.filter(user=user)

    for lesson_completed in lessons_completed:
        concepts_learned.extend(lesson_completed.lesson.concepts.all())

    for concept in concepts_required:
        if concept not in concepts_learned:
            concepts_to_learn.append(concept)

    for concept in concepts_to_learn:
        concepts_ids = [concept.id]
        lesson = Lesson.objects.filter(concepts__in=concepts_ids)[:1][0]
        concept_lesson_pair = dict()
        concept_lesson_pair['concept'] = concept.title
        concept_lesson_pair['lesson_id'] = lesson.id
        concepts_with_lessons.append(concept_lesson_pair)
    response_data['concepts_to_learn'] = concepts_with_lessons

    return HttpResponse(json.dumps(response_data), content_type="application/json")


def get_next_lesson_id(request):
    lesson = Lesson.objects.get(id=request.POST["lesson_id"])
    next_lesson_id = 0
    next_order = lesson.order + 1
    module = lesson.module
    try:
        next_lesson = Lesson.objects.get(module=module, order=next_order)
        next_lesson_id = next_lesson.id
    except Exception, e:
        print "brak lekcji"

    return HttpResponse(str(next_lesson_id))


@login_required
def lesson_progress(request, lid):
    lesson = Lesson.objects.get(id=lid)
    concepts = Concept.objects.filter(concepts=lesson)
    return render_to_response('lesson_progress.html', locals(), context_instance=RequestContext(request))


def get_lessons_completed_before(days, user, lessons_completed):
    lessons = []
    for lc in lessons_completed:
        print "Days diff: " + str(lc.get_days_diff())
        if lc.get_days_diff() <= days:
            lessons.append(lc)
    return lessons


def distinct_set(seq):
    seen = set()
    seen_add = seen.add
    return [x for x in seq if x not in seen and not seen_add(x)]


@csrf_exempt
def get_progress(request):
    user = User.objects.get(id=request.POST["user_id"])
    days = int(request.POST["days"])
    lessons_completed = LessonCompleted.objects.filter(user=user)
    lessons_completed = get_lessons_completed_before(days, user, lessons_completed)
    lessons = len(lessons_completed)
    concepts_list = []
    points = 0
    concepts = 0
    for lc in lessons_completed:
        points += lc.lesson.award
        concepts_list.extend(list(Concept.objects.filter(concepts=lc.lesson)))
    concepts_list = distinct_set(concepts_list)
    concepts = len(concepts_list)

    return render_to_response('json_progress.json', locals(), context_instance=RequestContext(request))


@login_required
def show_past_progress(request, days):
    user = request.user
    lessons_completed = LessonCompleted.objects.filter(user=user)
    lessons_completed = get_lessons_completed_before(days, user, lessons_completed)
    return render_to_response('past_progress.html', locals(), context_instance=RequestContext(request))


@csrf_exempt
def edit_app_file(request):
    app_file, created = AppFiles.objects.get_or_create(app_id=request.POST["app_id"], filename=request.POST["filename"])
    app_file.text = request.POST["text"]
    app_file.save()
    return HttpResponse("OK")


@csrf_exempt
def get_app_file(request):
    app_id = request.POST["app_id"]
    filename = request.POST["filename"]
    if AppFiles.objects.filter(app_id=app_id, filename=filename):
        app_files = AppFiles.objects.get(app_id=app_id, filename=filename)
        return HttpResponse(str(app_files.text))
    return HttpResponse("")


@csrf_exempt
def get_conceptions(request):
    lesson = Lesson.objects.get(id=request.POST["lesson_id"])
    conceptions = Concept.objects.filter(concepts=lesson)
    return render_to_response('json_concepts.json', locals(), context_instance=RequestContext(request))


@csrf_exempt
def finished_editing_starting(request):
    lesson = Lesson.objects.get(id=request.POST["lesson_id"])
    lesson.is_start_finished = True
    lesson.save()
    return HttpResponse("OK")


@csrf_exempt
def handle_get_lessons(request):
    lessons = Lesson.objects.all()
    return render_to_response('json_lessons.json', locals(), context_instance=RequestContext(request))


@csrf_exempt
def count_bubbles(request):
    lesson = Lesson.objects.get(id=request.POST["lesson_id"])
    bubbles = Bubble.objects.filter(lesson=lesson)
    return HttpResponse(str(len(bubbles)))


@csrf_exempt
def upload_file(request):
    name = request.POST["filename"]
    lesson_id = request.POST["lesson_id"]
    handle_uploaded_file(request.FILES['file'], name, '/upload/tutorial/' + lesson_id + '/')
    return HttpResponse("OK")


@csrf_exempt
def remove_file(request):
    lesson_id = request.POST["lesson_id"]
    filename = request.POST["filename"]
    file_path = settings.MEDIA_ROOT + '/upload/tutorial/' + lesson_id + "/" + filename
    os.remove(file_path)
    return HttpResponse("OK")


def add_lesson(request, mid):
    module = Module.objects.get(id=mid)
    if request.method == 'POST':
        form = LessonForm(request.POST)
        if form.is_valid():
            lesson = form.save(commit=False)
            lesson.module = module
            order = len(Lesson.objects.filter(module=module))
            put_before = form.cleaned_data['put_before']
            if put_before:
                before_which_lesson = form.cleaned_data['before_which_lesson']
                if before_which_lesson:
                    order = before_which_lesson.order
            lesson.order = order
            lesson.save()
            fix_lesson_order()
            return redirect('/articlesdesigner/lessons/admin/')
    else:
        form = LessonForm(mid=mid)
    return render_to_response('new_lesson.html', locals(), context_instance=RequestContext(request))


def add_module(request):
    if request.method == 'POST':
        form = ModuleForm(request.POST)
        if form.is_valid():
            module = form.save(commit=False)
            put_before = form.cleaned_data['put_before']
            order = len(Module.objects.all())
            if put_before:
                before_which_module = form.cleaned_data['before_which_module']
                if before_which_module:
                    order = before_which_module.order
            module.order = order
            module.save()
            fix_module_order()
            return redirect('/articlesdesigner/lessons/admin/')
    else:
        form = ModuleForm()
    return render_to_response('new_module.html', locals(), context_instance=RequestContext(request))


def generate_codes(request):
    if request.method == 'POST':
        form = PromotionCodeForm(request.POST)
        if form.is_valid():
            promo_code = form.save(commit=False)
            how_many = form.cleaned_data['how_many']
            for x in range(0, how_many):
                random_code = binascii.b2a_hex(os.urandom(15))
                promo_code.id = None
                promo_code.code = random_code
                promo_code.valid = True
                promo_code.save()
            return redirect('/articlesdesigner/admin/gtutorial/promotioncode/')
    else:
        form = PromotionCodeForm()
    return render_to_response('generate_codes.html', locals(), context_instance=RequestContext(request))


def show_promo_codes(request):
    promo_codes = PromotionCode.objects.all()
    return render_to_response('promo_codes.html', locals(), context_instance=RequestContext(request))


@csrf_exempt
def copy_project_as_final(request):
    lesson = Lesson.objects.get(id=request.POST["lesson_id"])
    project_to_copy_id = request.POST["project_id"]
    new_name = "tutorialLesson" + str(lesson.id) + "FinalProject"
    release = 3
    authored_user_id = 1
    user_id = 1
    copied_project_id = copy_tutorial_project(project_to_copy_id, new_name, release, authored_user_id, user_id).content
    end_project = Application.objects.get(id=int(copied_project_id))
    lesson_project = LessonProject.objects.get(lesson=lesson)
    lesson_project.end_project = end_project
    lesson_project.save()
    return HttpResponse(str(end_project.id))


@csrf_exempt
def copy_project_as_start(request):
    lesson = Lesson.objects.get(id=request.POST["lesson_id"])
    project_to_copy_id = request.POST["project_id"]
    new_name = "tutorialLesson" + str(lesson.id) + "StartProject"
    release = 3
    authored_user_id = 1
    user_id = 1
    copied_project_id = copy_tutorial_project(project_to_copy_id, new_name, release, authored_user_id, user_id).content
    start_project = Application.objects.get(id=int(copied_project_id))
    lesson_project = LessonProject.objects.get(lesson=lesson)
    lesson_project.start_project = start_project
    lesson_project.save()
    return HttpResponse(str(start_project.id))


def copy_project_for_user(user, project_to_copy, lesson):
    new_name = str(user.id) + project_to_copy.name
    release = 3
    authored_user_id = user.id
    user_id = user.id
    copied_project_id = copy_tutorial_project(project_to_copy.id, new_name, release, authored_user_id, user_id).content
    copied_project = Application.objects.get(id=int(copied_project_id))
    user_project, created = UserProject.objects.get_or_create(user=user, lesson=lesson, project=copied_project)
    return user_project


@login_required
def view_start_project(request, lid):
    user = request.user
    lesson = Lesson.objects.get(id=lid)
    lesson_project = LessonProject.objects.get(lesson=lesson)
    user_lesson_project, created = UserLessonProjects.objects.get_or_create(user=user, lesson=lesson)
    if not user_lesson_project.start_project:
        project_to_copy = lesson_project.start_project
        new_name = "start" + str(user.id) + project_to_copy.name
        release = 3
        authored_user_id = user.id
        user_id = user.id
        copied_project_id = copy_tutorial_project(project_to_copy.id, new_name, release, authored_user_id,
                                                  user_id).content
        copied_project = Application.objects.get(id=int(copied_project_id))
        user_lesson_project.start_project = copied_project
        user_lesson_project.save()
    if not user_lesson_project.end_project:
        project_to_copy = lesson_project.end_project
        new_name = "end" + str(user.id) + project_to_copy.name
        release = 3
        authored_user_id = user.id
        user_id = user.id
        copied_project_id = copy_tutorial_project(project_to_copy.id, new_name, release, authored_user_id,
                                                  user_id).content
        copied_project = Application.objects.get(id=int(copied_project_id))
        user_lesson_project.end_project = copied_project
        user_lesson_project.save()
    screen = Screen.objects.filter(app_id=user_lesson_project.start_project.id)[0]
    return redirect("/articlesdesigner/screen/" + str(screen.id))


@login_required
def view_end_project(request, lid, is_emulated_only=False):
    all_settings = Settings.objects.all()
    if all_settings:
        settings_obj = all_settings[0]
    user = request.user
    lesson = Lesson.objects.get(id=lid)
    lesson_project = LessonProject.objects.get(lesson=lesson)
    user_lesson_project, created = UserLessonProjects.objects.get_or_create(user=user, lesson=lesson)
    if not user_lesson_project.start_project:
        project_to_copy = lesson_project.start_project
        new_name = "start" + str(user.id) + project_to_copy.name
        release = 3
        authored_user_id = user.id
        user_id = user.id
        copied_project_id = copy_tutorial_project(project_to_copy.id, new_name, release, authored_user_id,
                                                  user_id).content
        copied_project = Application.objects.get(id=int(copied_project_id))
        user_lesson_project.start_project = copied_project
        user_lesson_project.save()
    if not user_lesson_project.end_project:
        project_to_copy = lesson_project.end_project
        new_name = "end" + str(user.id) + project_to_copy.name
        release = 3
        authored_user_id = user.id
        user_id = user.id
        copied_project_id = copy_tutorial_project(project_to_copy.id, new_name, release, authored_user_id,
                                                  user_id).content
        copied_project = Application.objects.get(id=int(copied_project_id))
        user_lesson_project.end_project = copied_project
        user_lesson_project.save()
    screen = Screen.objects.filter(app_id=user_lesson_project.end_project.id)[0]
    return edit_screen(request, str(screen.id), is_emulated_only)


@login_required
def view_emu_project(request, lid):
    return view_end_project(request, lid, True)


@login_required
def viewprogress(request, lid):
    user = request.user
    lesson = Lesson.objects.get(id=lid)
    if UserProject.objects.filter(user=user, lesson=lesson):
        user_project = UserProject.objects.get(user=user, lesson=lesson)
        project = user_project.project
        screen = Screen.objects.filter(app_id=project.id)[0]
        return redirect("/articlesdesigner/screen/" + str(screen.id))
    else:
        return redirect("/articlesdesigner/lessons/")


@csrf_exempt
def save_bubble(request):
    lesson_id = request.POST['lesson_id']
    lesson = Lesson.objects.get(id=lesson_id)
    if 'ordera' in request.POST:
        order = request.POST['ordera']
        if Bubble.objects.filter(lesson=lesson, order=order) and not 'add_before' in request.POST:
            bubble = Bubble.objects.filter(lesson=lesson, order=order)[0]
        else:
            if Bubble.objects.filter(lesson=lesson, order=order) and 'add_before' in request.POST:
                bubble = Bubble.objects.create(lesson=lesson, order=order)
            else:
                bubble = Bubble.objects.create(lesson=lesson, order=order)
    else:
        bubble = Bubble.objects.create(lesson=lesson)
        bubble.order = len(Bubble.objects.filter(lesson=lesson))
    bubble.content = request.POST["content"]
    bubble.save()
    if request.FILES:
        record = request.POST["mp3_record"]
        if record == "1":
            print 'ok'
        else:
            if 'mp3_file' in request.FILES:
                name = request.POST['mp3_file_name']
                handle_uploaded_file(request.FILES['mp3_file'], name, '/upload/tutorial/' + lesson_id + '/')
        if 'video_file' in request.FILES:
            name = request.POST['video_file_name']
            handle_uploaded_file(request.FILES['video_file'], name, '/upload/tutorial/' + lesson_id + '/')
        if 'image_file' in request.FILES:
            name = request.POST['image_file_name']
            handle_uploaded_file(request.FILES['image_file'], name, '/upload/tutorial/' + lesson_id + '/')
    fix_bubble_order(lesson)
    return HttpResponse(str(bubble.id))


@csrf_exempt
def delete_bubble(request):
    bubble = Bubble.objects.get(id=request.POST["b_id"])
    lesson = bubble.lesson
    bubble.delete()
    fix_bubble_order(lesson)
    return HttpResponse("OK")

@csrf_exempt
def complete_lesson(request):
    user = User.objects.get(id=request.POST['user_id'])
    lesson = Lesson.objects.get(id=request.POST['lesson_id'])
    LessonCompleted.objects.get_or_create(user=user, lesson=lesson)
    return HttpResponse("OK")

@csrf_exempt
def complete_bubble(request):
    user = User.objects.get(id=request.POST["user_id"])
    bubble = Bubble.objects.get(id=request.POST["bubble_id"])
    bubble_completed = BubbleCompleted.objects.create(user=user, bubble=bubble, lesson=bubble.lesson)
    all_bubbles = BubbleCompleted.objects.filter(user=user, lesson=bubble.lesson)
    all_bubbles_lesson = Bubble.objects.filter(lesson=bubble.lesson)
    if len(all_bubbles) == len(all_bubbles_lesson):
        LessonCompleted.objects.get_or_create(user=user, lesson=bubble.lesson)
    return HttpResponse(str(bubble_completed.id))


@csrf_exempt
def fix_bubble_order(lesson):
    bubbles = Bubble.objects.filter(lesson=lesson).order_by('order', '-id')
    current_order = 0
    for bubble in bubbles:
        bubble.order = current_order
        current_order += 1
        bubble.save()


@csrf_exempt
def fix_lesson_order():
    for module in Module.objects.all():
        lessons = Lesson.objects.filter(module=module).order_by('order', '-id')
        current_order = 0
        for lesson in lessons:
            lesson.order = current_order
            current_order += 1
            lesson.save()


@csrf_exempt
def fix_module_order():
    current_order = 0
    for module in Module.objects.all().order_by('order', '-id'):
        module.order = current_order
        current_order += 1
        module.save()


@csrf_exempt
def is_lesson_finished_by_user(request):
    user = User.objects.get(id=request.POST["user_id"])
    lesson = Lesson.objects.get(id=request.POST["lesson_id"])
    progress = "1"
    concepts = len(Concept.objects.filter(concepts=lesson))
    if LessonCompleted.objects.filter(user=user, lesson=lesson):
        progress = "1"
    else:
        bubbles_completed = len(BubbleCompleted.objects.filter(user=user, lesson=lesson))
        all_bubbles = len(Bubble.objects.filter(lesson=lesson))
        progress = str(bubbles_completed) + "/" + str(all_bubbles)
    return render_to_response('json_lesson_progress.json', locals(), context_instance=RequestContext(request))


@csrf_exempt
def is_lesson_started_by_user(request):
    user = User.objects.get(id=request.POST["user_id"])
    lesson = Lesson.objects.get(id=request.POST["lesson_id"])
    if BubbleCompleted.objects.filter(user=user, lesson=lesson):
        return HttpResponse("1")
    else:
        return HttpResponse("0")


@csrf_exempt
def get_all_bubbles_user(request):
    lesson = Lesson.objects.get(id=request.POST["lesson_id"])
    user = User.objects.get(id=request.POST["user_id"])
    bubbles = list(Bubble.objects.filter(lesson=lesson).order_by('order'))
    bubbles_completed = BubbleCompleted.objects.filter(user=user, lesson=lesson)
    for bubble_completed in bubbles_completed:
        bubbles.remove(bubble_completed.bubble)
    return render_to_response('json_bubbles.json', locals(), context_instance=RequestContext(request))


@csrf_exempt
def get_all_bubbles(request):
    lesson = Lesson.objects.get(id=request.POST["lesson_id"])
    from_order = 0
    if 'from_order' in request.POST:
        from_order = int(request.POST['from_order'])
    bubbles = Bubble.objects.filter(lesson=lesson, order__gte=from_order).order_by('order')
    return render_to_response('json_bubbles.json', locals(), context_instance=RequestContext(request))


@staff_member_required
def edit_tutorial_start(request, lid):
    lesson = Lesson.objects.get(id=lid)
    lesson_project = LessonProject.objects.get(lesson=lesson)
    app = lesson_project.start_project
    screen = Screen.objects.filter(app_id=app.id)[0]
    isEditTutorial = True
    isContinueTutorial = False
    isEditStart = True
    isEditEnd = False
    sid = screen.id
    buttons = ButtonObject.objects.filter(screen_id="qweasd")
    texts = TextObject.objects.filter(screen_id="qweasd")
    textedits = TextEdit.objects.filter(screen_id="qweasd")
    htmls = HtmlObject.objects.filter(screen_id=sid)
    images = ImageObject.objects.filter(screen_id=sid)
    board = Board.objects.get(screen_id=sid)
    boards = Board.objects.filter(screen_id="qweasd")
    items = ItemObject.objects.filter(app_id=screen.app_id)
    conversations = ConversationObject.objects.filter(app_id=screen.app_id)
    tpopups = Tpopups.objects.filter(app_id=screen.app_id)
    app = Application.objects.get(id=screen.app_id)
    screens = Screen.objects.filter(app_id=app.id)
    areas = ClickableArea.objects.filter(screen_id="qweasd")
    codes = BoardCode.objects.filter(screen_id="qweasd")
    board_codes = BoardCode.objects.filter(screen_id=sid)
    publishes = Publish.objects.filter(app_id=screen.app_id)
    code_publishes = CodesPublish.objects.filter(publish_id="qweasd")
    for publish in publishes:
        new_code_publishes = CodesPublish.objects.filter(publish_id=publish.id)
        code_publishes = list(chain(code_publishes, new_code_publishes))
    if board_codes:
        code = board_codes[0]
    else:
        code = BoardCode.objects.create(screen_id=sid)
    for screena in screens:
        new_areas = ClickableArea.objects.filter(screen_id=screena.id)
        new_boards = Board.objects.filter(screen_id=screena.id)
        new_codes = BoardCode.objects.filter(screen_id=screena.id)
        new_buttons = ButtonObject.objects.filter(screen_id=screena.id)
        new_texts = TextObject.objects.filter(screen_id=screena.id)
        new_textedits = TextEdit.objects.filter(screen_id=screena.id)
        textedits = list(chain(textedits, new_textedits))
        texts = list(chain(texts, new_texts))
        buttons = list(chain(buttons, new_buttons))
        boards = list(chain(boards, new_boards))
        areas = list(chain(areas, new_areas))
        codes = list(chain(codes, new_codes))
    return render_to_response('index.html', locals(), context_instance=RequestContext(request))


@staff_member_required
def edit_tutorial_end(request, lid):
    lesson = Lesson.objects.get(id=lid)
    lesson_project = LessonProject.objects.get(lesson=lesson)
    app = lesson_project.end_project
    screen = Screen.objects.filter(app_id=app.id)[0]
    isEditTutorial = True
    isContinueTutorial = False
    isEditStart = False
    isEditEnd = True
    sid = screen.id
    buttons = ButtonObject.objects.filter(screen_id="qweasd")
    texts = TextObject.objects.filter(screen_id="qweasd")
    textedits = TextEdit.objects.filter(screen_id="qweasd")
    htmls = HtmlObject.objects.filter(screen_id=sid)
    images = ImageObject.objects.filter(screen_id=sid)
    board = Board.objects.get(screen_id=sid)
    boards = Board.objects.filter(screen_id="qweasd")
    items = ItemObject.objects.filter(app_id=screen.app_id)
    conversations = ConversationObject.objects.filter(app_id=screen.app_id)
    tpopups = Tpopups.objects.filter(app_id=screen.app_id)
    app = Application.objects.get(id=screen.app_id)
    screens = Screen.objects.filter(app_id=app.id)
    areas = ClickableArea.objects.filter(screen_id="qweasd")
    codes = BoardCode.objects.filter(screen_id="qweasd")
    board_codes = BoardCode.objects.filter(screen_id=sid)
    publishes = Publish.objects.filter(app_id=screen.app_id)
    code_publishes = CodesPublish.objects.filter(publish_id="qweasd")
    for publish in publishes:
        new_code_publishes = CodesPublish.objects.filter(publish_id=publish.id)
        code_publishes = list(chain(code_publishes, new_code_publishes))
    if board_codes:
        code = board_codes[0]
    else:
        code = BoardCode.objects.create(screen_id=sid)
    for screena in screens:
        new_areas = ClickableArea.objects.filter(screen_id=screena.id)
        new_boards = Board.objects.filter(screen_id=screena.id)
        new_codes = BoardCode.objects.filter(screen_id=screena.id)
        new_buttons = ButtonObject.objects.filter(screen_id=screena.id)
        new_texts = TextObject.objects.filter(screen_id=screena.id)
        new_textedits = TextEdit.objects.filter(screen_id=screena.id)
        textedits = list(chain(textedits, new_textedits))
        texts = list(chain(texts, new_texts))
        buttons = list(chain(buttons, new_buttons))
        boards = list(chain(boards, new_boards))
        areas = list(chain(areas, new_areas))
        codes = list(chain(codes, new_codes))
    return render_to_response('index.html', locals(), context_instance=RequestContext(request))


@login_required
def continue_lesson(request, lid):
    all_settings = Settings.objects.all()
    if all_settings:
        settings_obj = all_settings[0]
    isEditTutorial = False
    isContinueTutorial = True
    lesson = Lesson.objects.get(id=lid)
    if lesson.is_premium:
        if not user_has_premium(request.user):
            return render_to_response("/articlesdesigner/test_subscription/")
    if UserProject.objects.filter(user=request.user, lesson=lesson):
        user_project = UserProject.objects.get(user=request.user, lesson=lesson)
        project = user_project.project
    else:
        lesson_project = LessonProject.objects.get(lesson=lesson)
        project = copy_project_for_user(request.user, lesson_project.start_project, lesson).project
        user_project = UserProject.objects.get(user=request.user, lesson=lesson)
        user_project.project = project
        user_project.save()
    if not project.release == 3:
        project.release = 3
        project.save()
    screen = Screen.objects.filter(app_id=project.id)[0]
    sid = screen.id
    buttons = ButtonObject.objects.filter(screen_id="qweasd")
    texts = TextObject.objects.filter(screen_id="qweasd")
    textedits = TextEdit.objects.filter(screen_id="qweasd")
    htmls = HtmlObject.objects.filter(screen_id=sid)
    images = ImageObject.objects.filter(screen_id=sid)
    board = Board.objects.get(screen_id=sid)
    boards = Board.objects.filter(screen_id="qweasd")
    items = ItemObject.objects.filter(app_id=screen.app_id)
    conversations = ConversationObject.objects.filter(app_id=screen.app_id)
    tpopups = Tpopups.objects.filter(app_id=screen.app_id)
    app = Application.objects.get(id=screen.app_id)
    screens = Screen.objects.filter(app_id=app.id)
    areas = ClickableArea.objects.filter(screen_id="qweasd")
    codes = BoardCode.objects.filter(screen_id="qweasd")
    board_codes = BoardCode.objects.filter(screen_id=sid)
    publishes = Publish.objects.filter(app_id=screen.app_id)
    code_publishes = CodesPublish.objects.filter(publish_id="qweasd")
    for publish in publishes:
        new_code_publishes = CodesPublish.objects.filter(publish_id=publish.id)
        code_publishes = list(chain(code_publishes, new_code_publishes))
    if board_codes:
        code = board_codes[0]
    else:
        code = BoardCode.objects.create(screen_id=sid)
    for screena in screens:
        new_areas = ClickableArea.objects.filter(screen_id=screena.id)
        new_boards = Board.objects.filter(screen_id=screena.id)
        new_codes = BoardCode.objects.filter(screen_id=screena.id)
        new_buttons = ButtonObject.objects.filter(screen_id=screena.id)
        new_texts = TextObject.objects.filter(screen_id=screena.id)
        new_textedits = TextEdit.objects.filter(screen_id=screena.id)
        textedits = list(chain(textedits, new_textedits))
        texts = list(chain(texts, new_texts))
        buttons = list(chain(buttons, new_buttons))
        boards = list(chain(boards, new_boards))
        areas = list(chain(areas, new_areas))
        codes = list(chain(codes, new_codes))
    return render_to_response('index.html', locals(), context_instance=RequestContext(request))


def clear_lesson_history_for_user(lesson, user):
    for lesson_completed in LessonCompleted.objects.filter(user=user, lesson=lesson):
        lesson_completed.delete()
    for bubble_completed in BubbleCompleted.objects.filter(user=user, lesson=lesson):
        bubble_completed.delete()


def user_has_premium(user):
    is_premium = False
    if Subscription.objects.filter(user=user):
        subscription = Subscription.objects.get(user=user)
        if subscription.get_days_diff() > -1:
            is_premium = True
    return is_premium


@login_required
def startover_lesson(request, lid):
    isEditTutorial = False
    isContinueTutorial = True
    lesson = Lesson.objects.get(id=lid)
    if lesson.is_premium:
        if not user_has_premium(request.user):
            return render_to_response("/articlesdesigner/test_subscription/")
    clear_lesson_history_for_user(lesson, request.user)
    for user_project in UserProject.objects.filter(user=request.user, lesson=lesson):
        user_project.delete()
    lesson_project = LessonProject.objects.get(lesson=lesson)
    project = copy_project_for_user(request.user, lesson_project.start_project, lesson).project
    project.release = 3
    project.save()
    user_project = UserProject.objects.get(user=request.user, lesson=lesson)
    user_project.project = project
    user_project.save()
    return continue_lesson(request, lid)


def generate_subscription_form(subscription_pckg, request, promo_code=None):
    price = float(subscription_pckg.price)
    custom_values_dict = dict(
        user_id=request.user.id,
    )

    if promo_code:
        price -= price * (float(promo_code.value) / 100.0)
        custom_values_dict['promo_code_id'] = promo_code.id
    else:
        custom_values_dict['promo_code_id'] = -1

    custom_values_dict['price'] = price

    custom = json.dumps(custom_values_dict)
    print "custom: " + str(custom)
    now = datetime.datetime.now()
    salt = sha.new(str(request.user.username)).hexdigest()[:5]
    rand = sha.new(salt + str(now)).hexdigest()
    paypal_dict = {
        "business": settings.PAYPAL_RECEIVER_EMAIL,
        "amount": price,
        "item_name": subscription_pckg.name,
        "invoice": rand,
        "notify_url": settings.URL_PAYPAL_NOTIFY,
        "return_url": settings.URL_PAYPAL_RETURN,
        "cancel_return": settings.URL_PAYPAL_RETURN,
        "custom": custom,
    }
    form = PayPalSharedSecretEncryptedPaymentsForm(initial=paypal_dict)
    return form


@csrf_exempt
@login_required
def subscriptions(request):
    user_codes = UserCode.objects.filter(user=request.user)
    code_form = ActivatePromoCodeForm()
    is_premium = False
    days_diff = -1
    try:
        last_payment = Payment.objects.filter(user=request.user).order_by('-id')[:1][0]
    except IndexError, e:
        last_payment = False

    try:
        subscription = Subscription.objects.get(user=request.user)
        days_diff = subscription.get_days_diff()
        if days_diff > -1:
            is_premium = True
    except Subscription.DoesNotExist, e:
        print "blad"

    forms = []
    user_code = False
    try:
        user_code = UserCode.objects.get(user=request.user)
    except UserCode.DoesNotExist, e:
        print "brak kodu"

    for sub_pckg in SubscriptionPackage.objects.all():
        form_added = False
        if user_code:
            if user_code.promotion_code.subscription_package == sub_pckg:
                print "do tej paczki ! dodajemy do formularza"
                forms.append(generate_subscription_form(sub_pckg, request, user_code.promotion_code))
                form_added = True
        if not form_added:
            forms.append(generate_subscription_form(sub_pckg, request))
    return render_to_response("payment.html", locals(), context_instance=RequestContext(request))


@login_required
def activate_code(request):
    if request.method == 'POST':
        form = ActivatePromoCodeForm(request.POST)
        if form.is_valid():
            activation_code = form.cleaned_data['code']
            user = request.user
            try:
                promotion_code = PromotionCode.objects.get(code=activation_code)
                if promotion_code.is_valid():
                    for user_code in UserCode.objects.filter(user=user):
                        user_code.delete()
                    if not UserCode.objects.filter(promotion_code=promotion_code):
                        UserCode.objects.create(promotion_code=promotion_code, user=user)
            except Exception, e:
                print "blad: " + str(e)
    return redirect("/articlesdesigner/test_subscription/")


@login_required
def cancel_code(request):
    for user_code in UserCode.objects.filter(user=request.user):
        user_code.delete()
    return redirect("/articlesdesigner/test_subscription/")


@csrf_exempt
def show_sub_ended(request):
    user = User.objects.get(id=request.POST["user_id"])
    show_sub_ended = False
    is_premium = user_has_premium(user)
    if not is_premium:
        notification, created = Notification.objects.get_or_create(user=request.user,
                                                                   content=settings.NOTIFICATION_SUBSCRIPTION_ENDED)
        if not notification.was_sent:
            show_sub_ended = True
            notification.was_sent = True
            notification.save()
    return HttpResponse(str(show_sub_ended))


@login_required
def show_quiz(request, quiz_id):
    quiz = Quiz.objects.get(id=quiz_id)
    questions = quiz.get_all_questions()
    return render_to_response("quiz.html", locals(), context_instance=RequestContext(request))


def check_for_expirations(request):
    for user in User.objects.all():
        if Subscription.objects.filter(user=user):
            subscription = Subscription.objects.get(user=user)
            days_diff = subscription.get_days_diff()
            if days_diff <= settings.SUBSCRIPTION_NOTIFICATION_DAYS:
                notification, created = \
                    Notification.objects.get_or_create(user=user, content=settings.SUBSCRIPTION_NOTIFICATION_CONTENT)
                if not notification.was_sent:
                    send_mail(settings.SUBSCRIPTION_NOTIFICATION_TOPIC, notification.content, user.email)
                    notification.was_sent = True
                    notification.save()
    return HttpResponse("OK")