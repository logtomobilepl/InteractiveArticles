from django.conf import settings
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.template.context import RequestContext
from django.template.loader import render_to_string
from adesigner.models import Application, Screen, ButtonObject, TextObject, TextEdit, HtmlObject, ImageObject, Board, \
    BoardCode, ClickableArea, ItemObject, ConversationObject, Tpopups
from amain.models import UploadedImage
from django.contrib.auth.models import User
from itertools import chain
from adesigner.forms import ApplicationForm, ScreenForm
from django.views.decorators.csrf import csrf_exempt
import zipfile
import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate
import distutils.core

import os, binascii

APPENDING_VALUE = "/export/"
APPENDING_VALUE_ZIP = "/zip/"


def homee(request):
    return render_to_response('index.html', locals(), context_instance=RequestContext(request))


@login_required
def select_app(request):
    show_sub_ended = False
    apps = Application.objects.filter(user=request.user)
    if not apps:
        copy_stock_app(request.user)
    apps = Application.objects.filter(user=request.user)
    return render_to_response('appmenu.html', locals(), context_instance=RequestContext(request))


def copy_stock_app(user):
    print 'implement copy here !'
    all_apps = Application.objects.all()
    if all_apps:
        stock_app = Application.objects.get(id=1)
        new_app = Application.objects.get(id=1)
        new_app.pk = None
        new_app.app_id = generate_random_string()
        new_app.user = user
        new_app.name = stock_app.name
        new_app.orientation = stock_app.orientation
        new_app.character_name = stock_app.character_name
        new_app.save()
        screens = Screen.objects.filter(app_id=stock_app.id)
        for screen in screens:
            old_screen_id = screen.id
            screen.pk = None
            screen.app_id = new_app.id
            screen.save()
            old_board = Board.objects.filter(screen_id=old_screen_id)[0]
            old_board_id = old_board.id
            old_board.pk = None
            old_board.screen_id = screen.id
            old_board.save()

            clicable_areas = ClickableArea.objects.filter(screen_id=old_screen_id)
            for clicable_area in clicable_areas:
                clicable_area.pk = None
                clicable_area.screen_id = screen.id
                clicable_area.save()
            for text_object in TextObject.objects.filter(screen_id=old_screen_id):
                text_object.pk = None
                text_object.screen_id = screen.id
                text_object.save()
            for button_object in ButtonObject.objects.filter(screen_id=old_screen_id):
                button_object.pk = None
                button_object.screen_id = screen.id
                button_object.save()
            for text_edit in TextEdit.objects.filter(screen_id=old_screen_id):
                text_edit.pk = None
                text_edit.screen_id = screen.id
                text_edit.save()
            for board_code in BoardCode.objects.filter(screen_id=old_screen_id):
                board_code.pk = None
                board_code.screen_id = screen.id
                board_code.save()
        for item in ItemObject.objects.filter(app_id=stock_app.id):
            item.pk = None
            item.app_id = new_app.id
            item.save()
        for conversation in ConversationObject.objects.filter(app_id=stock_app.id):
            conversation.pk = None
            conversation.app_id = new_app.id
            conversation.save()
        for popup in Tpopups.objects.filter(app_id=stock_app.id):
            popup.pk = None
            popup.app_id = new_app.id
            popup.save()
        dir_source = settings.MEDIA_ROOT + '/upload/' + str(stock_app.id)
        dir_dest = settings.MEDIA_ROOT + '/upload/' + str(new_app.id)
        distutils.dir_util.copy_tree(dir_source, dir_dest)


@csrf_exempt
def copy_project(request):
    app_id = request.POST["app_id"]
    new_name = request.POST["name"]
    release = request.POST["release"]
    authored_user_id = request.POST["shared_author"]
    user_id = request.POST["user_id"]
    user_to_add = User.objects.get(id=user_id)
    user = User.objects.get(id=authored_user_id)
    stock_app = Application.objects.get(id=app_id)
    new_app = Application.objects.get(id=app_id)
    new_app.pk = None
    new_app.app_id = generate_random_string()
    new_app.user = user_to_add
    new_app.name = new_name
    new_app.release = release
    new_app.authored_user = authored_user_id
    new_app.save()
    screens = Screen.objects.filter(app_id=stock_app.id)
    for screen in screens:
        old_screen_id = screen.id
        screen.pk = None
        screen.app_id = new_app.id
        screen.save()
        boards = Board.objects.filter(screen_id=old_screen_id)
        if boards:
            old_board = boards[0]
            old_board_id = old_board.id
            old_board.pk = None
            old_board.screen_id = screen.id
            old_board.save()
        for clickable_area in ClickableArea.objects.filter(screen_id=old_screen_id):
            clickable_area.pk = None
            clickable_area.screen_id = screen.id
            clickable_area.save()
        for text_object in TextObject.objects.filter(screen_id=old_screen_id):
            text_object.pk = None
            text_object.screen_id = screen.id
            text_object.save()
        for button_object in ButtonObject.objects.filter(screen_id=old_screen_id):
            button_object.pk = None
            button_object.screen_id = screen.id
            button_object.save()
        for text_edit in TextEdit.objects.filter(screen_id=old_screen_id):
            text_edit.pk = None
            text_edit.screen_id = screen.id
            text_edit.save()
        for board_code in BoardCode.objects.filter(screen_id=old_screen_id):
            board_code.pk = None
            board_code.screen_id = screen.id
            board_code.save()
    for item in ItemObject.objects.filter(app_id=stock_app.id):
        item.pk = None
        item.app_id = new_app.id
        item.save()
    for conversation in ConversationObject.objects.filter(app_id=stock_app.id):
        conversation.pk = None
        conversation.app_id = new_app.id
        conversation.save()
    for popup in Tpopups.objects.filter(app_id=stock_app.id):
        popup.pk = None
        popup.app_id = new_app.id
        popup.save()
    dir_source = settings.MEDIA_ROOT + '/upload/' + str(stock_app.id)
    dir_dest = settings.MEDIA_ROOT + '/upload/' + str(new_app.id)
    distutils.dir_util.copy_tree(dir_source, dir_dest)
    return HttpResponse(str(new_app.id))


@csrf_exempt
def copy_tutorial_project(app_id, new_name, release, authored_user_id, user_id):
    user_to_add = User.objects.get(id=user_id)
    user = User.objects.get(id=authored_user_id)
    stock_app = Application.objects.get(id=app_id)
    new_app = Application.objects.get(id=app_id)
    new_app.pk = None
    new_app.app_id = generate_random_string()
    new_app.user = user_to_add
    new_app.name = new_name
    new_app.release = release
    new_app.authored_user = authored_user_id
    new_app.save()
    screens = Screen.objects.filter(app_id=stock_app.id)
    for screen in screens:
        old_screen_id = screen.id
        screen.pk = None
        screen.app_id = new_app.id
        screen.save()
        boards = Board.objects.filter(screen_id=old_screen_id)
        if boards:
            old_board = boards[0]
            old_board_id = old_board.id
            old_board.pk = None
            old_board.screen_id = screen.id
            old_board.save()
        for clickable_area in ClickableArea.objects.filter(screen_id=old_screen_id):
            clickable_area.pk = None
            clickable_area.screen_id = screen.id
            clickable_area.save()
        for text_object in TextObject.objects.filter(screen_id=old_screen_id):
            text_object.pk = None
            text_object.screen_id = screen.id
            text_object.save()
        for button_object in ButtonObject.objects.filter(screen_id=old_screen_id):
            button_object.pk = None
            button_object.screen_id = screen.id
            button_object.save()
        for text_edit in TextEdit.objects.filter(screen_id=old_screen_id):
            text_edit.pk = None
            text_edit.screen_id = screen.id
            text_edit.save()
        for board_code in BoardCode.objects.filter(screen_id=old_screen_id):
            board_code.pk = None
            board_code.screen_id = screen.id
            board_code.save()
    for item in ItemObject.objects.filter(app_id=stock_app.id):
        item.pk = None
        item.app_id = new_app.id
        item.save()
    for conversation in ConversationObject.objects.filter(app_id=stock_app.id):
        conversation.pk = None
        conversation.app_id = new_app.id
        conversation.save()
    for popup in Tpopups.objects.filter(app_id=stock_app.id):
        popup.pk = None
        popup.app_id = new_app.id
        popup.save()
    dir_source = settings.MEDIA_ROOT + '/upload/' + str(stock_app.id)
    dir_dest = settings.MEDIA_ROOT + '/upload/' + str(new_app.id)
    if not os.path.exists(dir_source):
        os.makedirs(dir_source)
    if not os.path.exists(dir_dest):
        os.makedirs(dir_dest)
    distutils.dir_util.copy_tree(dir_source, dir_dest)
    return HttpResponse(str(new_app.id))


@login_required
def new_app(request):
    apps = Application.objects.filter(user=request.user)
    if request.method == 'POST':
        form = ApplicationForm(request.POST)
        if form.is_valid():
            new_app = form.save(commit=False)
            new_app.app_id = generate_random_string()
            new_app.user = request.user
            new_app.authored_user = request.user.id
            new_app.save()
            return HttpResponseRedirect('/articlesdesigner/addscreen/app/' + str(new_app.id))
    else:
        form = ApplicationForm()
    return render_to_response('newapp.html', locals(), context_instance=RequestContext(request))


@login_required
def select_screen(request, aid):
    app = Application.objects.get(id=aid)
    app.orientation = "portrait"
    app.save()
    screens = Screen.objects.filter(app_id=aid)
    codes = BoardCode.objects.filter(screen_id="qweasd")
    for screena in screens:
        new_codes = BoardCode.objects.filter(screen_id=screena.id)
        codes = list(chain(codes, new_codes))	
    return render_to_response('screenmenu.html', locals(), context_instance=RequestContext(request))


@login_required
def new_screen(request, aid):
    app = Application.objects.get(id=aid)
    screens = Screen.objects.filter(app_id=aid)
    if request.method == 'POST':
        form = ScreenForm(request.POST)
        if form.is_valid():
            new_screen = form.save(commit=False)
            print "Form is valid"
            new_screen.app_id = aid
            new_screen.save()
            board = Board.objects.create()
            board.screen_id = new_screen.id
            board.save()
            return HttpResponseRedirect('/articlesdesigner/screen/' + str(new_screen.id))
        print "form is INVALID"
    else:
        form = ScreenForm()
    return render_to_response('newscreen.html', locals(), context_instance=RequestContext(request))


def parse_json_onclick(json_data):
    parsed = ""

    json_obj = json.loads(json_data)

    return parsed


def clear_path(path):
    if not os.path.exists(path):
        os.makedirs(path)
    for the_file in os.listdir(path):
        file_path = os.path.join(path, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception, e:
            print e


def export_app_to_xml(request, aid):
    app = Application.objects.get(id=aid)
    user = app.user
    user_id = str(user.id)
    screens = Screen.objects.filter(app_id=aid)
    #printing runtime
    path = settings.MEDIA_ROOT + APPENDING_VALUE + user_id + "/"
    clear_path(path)

    write_runtime_file(str(screens[0].title) + ".xml", user_id)

    counter = 0
    for screen in screens:
        counter += 1
        write_screen_file(screen, counter, user_id)

    write_tab_bar_file(user_id)
    write_swipegroups_file(user_id)
    write_items_file(aid, user_id)
    write_conversation_file(aid, user_id)
    wirte_tpopups_file(aid, user_id)

    print 'finished creating xmls, now its time for the zip'

    write_zip_file(app.name, user_id)

    return HttpResponse('OK')


# def write_screen_files(aid):
# 	buttons = ButtonObject.objects.filter(screen_id = aid)
# 	texts = TextObject.objects.filter(screen_id = aid)
# 	# add code here that will print shit up !

def write_conversation_file(aid, user_id):
    conversations = ConversationObject.objects.filter(app_id=aid)
    string_to_write = render_to_string('conversations_template.xml', locals())
    path = settings.MEDIA_ROOT + APPENDING_VALUE + "" + user_id + "/"
    filename = path + 'conversations.xml'
    if not os.path.exists(path):
        os.makedirs(path)
    write_file(filename, string_to_write)
    write_conversations_html(conversations, user_id)


def wirte_tpopups_file(aid, user_id):
    popups = Tpopups.objects.filter(app_id=aid)
    string_to_write = render_to_string('tpopups_template.xml', locals())
    path = settings.MEDIA_ROOT + APPENDING_VALUE + "" + user_id + "/"
    filename = path + 'tpopups.xml'
    if not os.path.exists(path):
        os.makedirs(path)
    write_file(filename, string_to_write)


def write_conversations_html(conversations, user_id):
    path = settings.MEDIA_ROOT + APPENDING_VALUE + "" + user_id + "/"
    if not os.path.exists(path):
        os.makedirs(path)
    for conversation in conversations:
        html_content = conversation.html_content
        string_to_write = render_to_string('htmlcontent.html', locals())
        filename = path + conversation.name + ".html"
        write_file(filename, string_to_write)


def write_swipegroups_file(user_id):
    string_to_write = render_to_string('swipegroups_template.xml', locals())
    path = settings.MEDIA_ROOT + APPENDING_VALUE + "" + user_id + "/"
    filename = path + 'swipegroups.xml'
    if not os.path.exists(path):
        os.makedirs(path)
    write_file(filename, string_to_write)


def write_items_file(app_id, user_id):
    items = ItemObject.objects.filter(app_id=app_id)
    string_to_write = render_to_string('items_template.xml', locals())
    path = settings.MEDIA_ROOT + APPENDING_VALUE + "" + user_id + "/"
    filename = path + 'items.xml'
    if not os.path.exists(path):
        os.makedirs(path)
    write_file(filename, string_to_write)


def write_tab_bar_file(user_id):
    string_to_write = render_to_string('tab_bar_template.xml', locals())
    path = settings.MEDIA_ROOT + APPENDING_VALUE + "" + user_id + "/"
    filename = path + 'tab_bar.xml'
    if not os.path.exists(path):
        os.makedirs(path)
    write_file(filename, string_to_write)


def write_screen_file(screen, count, user_id):
    texts = TextObject.objects.filter(screen_id=screen.id)
    buttons = ButtonObject.objects.filter(screen_id=screen.id)
    htmls = HtmlObject.objects.filter(screen_id=screen.id)
    images = ImageObject.objects.filter(screen_id=screen.id)
    board = Board.objects.get(screen_id=screen.id)
    areas = ClickableArea.objects.filter(screen_id=screen.id)
    string_to_write = render_to_string('screen_template.xml', locals())
    path = settings.MEDIA_ROOT + APPENDING_VALUE + "" + user_id + "/"
    filename = path + screen.title + '.xml'
    if not os.path.exists(path):
        os.makedirs(path)
    write_file(filename, string_to_write)


def write_runtime_file(start_screen_file, user_id):
    string_to_write = render_to_string('runtime_template.xml', locals())
    path = settings.MEDIA_ROOT + APPENDING_VALUE + "" + user_id + "/"
    filename = path + 'runtime.xml'
    if not os.path.exists(path):
        os.makedirs(path)
    write_file(filename, string_to_write)


def write_file(filename, content):
    result = open(filename, 'w')
    result.write(content)
    result.close()


def write_zip_file(filename, user_id):
    path = settings.MEDIA_ROOT + APPENDING_VALUE + user_id + "/"
    image_upload_path = settings.MEDIA_ROOT + '/upload/' + user_id + '/img/'
    sound_upload_path = settings.MEDIA_ROOT + '/upload/' + user_id + '/sound/'
    root_path = settings.MEDIA_ROOT + APPENDING_VALUE_ZIP + user_id + "/"
    if not os.path.exists(root_path):
        os.makedirs(root_path)
    zip_file = root_path + filename + '.zip'
    zip = zipfile.ZipFile(zip_file, 'w')
    zipdir(path, zip)
    zipdir(image_upload_path, zip)
    zipdir(sound_upload_path, zip)
    zip.close()


def zipdir(path, zip):
    for root, dirs, files in os.walk(path):
        for file in files:
            os.chdir(root)
            zip.write(file)


def generate_random_string():
    return binascii.b2a_hex(os.urandom(15))


# AJAX STUFF
@csrf_exempt
def upload_image(request):
    type = request.POST['type']
    name = request.FILES['data'].name
    app_id = request.POST['app_id']
    loader_id = request.POST['loader_id']
    response_type = request.POST['response_type']
    if response_type == 'javascript':
        response_d = "<script language='javascript' type='text/javascript'>window.top.window.stopUpload('" + loader_id + "', '" + name + "',1);</script>"
    else:
        response_d = "OK"
    if type == 'image':
        handle_uploaded_file(request.FILES['data'], name, '/upload/' + app_id + '/img/')
    elif type == 'sound':
        handle_uploaded_file(request.FILES['data'], name, '/upload/' + app_id + '/sound/')
    return HttpResponse(response_d)


@csrf_exempt
def get_uploaded_images(request):
    type = request.POST['type']
    app_id = request.POST['app_id']
    items = []
    if type == 'image':
        root_path = settings.MEDIA_ROOT + '/upload/' + app_id + '/img/'
    elif type == 'sound':
        root_path = settings.MEDIA_ROOT + '/upload/' + app_id + '/sound/'
    if not os.path.exists(root_path):
        os.makedirs(root_path)
    items_list = os.listdir(root_path)
    for item in items_list:
        items.append(item)
    response_data = {}
    if type == 'image':
        response_data['images'] = items_list
    elif type == 'sound':
        response_data['sounds'] = items_list

    return HttpResponse(json.dumps(response_data), mimetype="application/json")


def handle_uploaded_file(f, e, path):
    filename = settings.MEDIA_ROOT + path + e
    with open(filename, 'wb') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
    UploadedImage.objects.create(path=filename)

    return filename


@csrf_exempt
def get_screen_list(request):
    if request.method == 'POST':
        app_id = request.POST["app_id"]
        screens = Screen.objects.filter(app_id=app_id)

        response_data = {}
        screens_list = []
        for screen in screens:
            screen_dict = {screen.title: screen.id}
            screens_list.append(screen_dict)
        response_data['screens'] = screens_list

        return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return render_to_response('screenpost.html', locals(), context_instance=RequestContext(request))
