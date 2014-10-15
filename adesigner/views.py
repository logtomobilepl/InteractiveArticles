from django.shortcuts import render_to_response
from django.template.context import RequestContext
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from adesigner.models import TextObject, ButtonObject, Screen, ImageObject, HtmlObject, BoardCode, Application, \
    ClickableArea, Board, ItemObject, ConversationObject, Tpopups, TextEdit, Publish, CodesPublish, \
    PublishEmail, Settings, UserSettings, MapObject, NodeObject
from amain.views import export_app_to_xml, copy_stock_app, copy_project
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from itertools import chain
from django.contrib.auth.decorators import login_required
import json
import os
from django.conf import settings


def homee(request):
    return render_to_response('index.html', locals(), context_instance=RequestContext(request))


@csrf_exempt
def post(request):
    if not request.method == 'POST':
        return render_to_response('post.html', locals(), context_instance=RequestContext(request))
    for key in request.POST:
        print key + " : " + request.POST[key]
    action = request.POST['action']
    if action == 'add_text_object':
        print "adding text object"
        text = request.POST['text']
        x = request.POST['x']
        y = request.POST['y']
        screen_id = request.POST['screen_id']
        width = request.POST['width']
        height = request.POST['height']
        visible = request.POST['visible']
        name = request.POST['name']
        text_color = request.POST['text_color']
        font_size = request.POST['font_size']
        font_type = request.POST['font_type']
        if 'onclick' not in request.POST:
            onclick = ''
        else:
            onclick = request.POST['onclick']
        return add_text_object(request, text, x, y, screen_id, width, height, visible, name, text_color, font_size,
                               font_type, onclick)
    elif action == 'update_text_object':
        print "editing text object"
        text = request.POST['text']
        x = request.POST['x']
        y = request.POST['y']
        screen_id = request.POST['s_id']
        text_id = request.POST['t_id']
        width = request.POST['width']
        height = request.POST['height']
        visible = request.POST['visible']
        name = request.POST['name']
        text_color = request.POST['text_color']
        font_size = request.POST['font_size']
        font_type = request.POST['font_type']
        if 'onclick' not in request.POST:
            onclick = ''
        else:
            onclick = request.POST['onclick']
        return edit_text_object(request, text, x, y, screen_id, text_id, width, height, visible, name, text_color,
                                font_size, font_type, onclick)
    elif action == 'remove_text_object':
        print "remove text object"
        text_id = request.POST['t_id']
        return remove_text_object(request, text_id)
    elif action == 'add_button_object':
        print "Adding button object"
        title_label = request.POST['title_label']
        screen_id = request.POST['screen_id']
        x = request.POST['x']
        y = request.POST['y']
        visible = request.POST['visible']
        name = request.POST['name']
        background_image = request.POST['background_image']
        title_color = request.POST['title_color']
        width = request.POST['width']
        height = request.POST['height']
        font_size = request.POST['font_size']
        font_type = request.POST['font_type']
        if 'onclick' not in request.POST:
            onclick = ''
        else:
            onclick = request.POST['onclick']
        return add_button_object(request, title_label, screen_id, x, y, visible, name, background_image, title_color,
                                 onclick, width, height, font_size, font_type)
    elif action == 'edit_button_object':
        print "Editing button object"
        title_label = request.POST['title_label']
        screen_id = request.POST['screen_id']
        x = request.POST['x']
        y = request.POST['y']
        visible = request.POST['visible']
        name = request.POST['name']
        background_image = request.POST['background_image']
        title_color = request.POST['title_color']
        button_id = request.POST['b_id']
        width = request.POST['width']
        height = request.POST['height']
        font_size = request.POST['font_size']
        font_type = request.POST['font_type']
        if 'onclick' not in request.POST:
            onclick = ''
        else:
            onclick = request.POST['onclick']
        return edit_button_object(request, title_label, screen_id, x, y, visible, name, background_image, title_color,
                                  button_id, onclick, width, height, font_size, font_type)
    elif action == 'add_clickable_area_object':
        screen_id = request.POST['screen_id']
        visible = request.POST['visible']
        file_name = request.POST['file_name']
        x = request.POST['x']
        y = request.POST['y']
        width = request.POST['width']
        height = request.POST['height']
        name = request.POST['name']
        if 'onclick' not in request.POST:
            onclick = ''
        else:
            onclick = request.POST['onclick']
        return add_clickable_area_object(request, name, screen_id, visible, file_name, x, y, width, height, onclick)
    elif action == 'edit_clickable_area_object':
        screen_id = request.POST['screen_id']
        visible = request.POST['visible']
        file_name = request.POST['file_name']
        x = request.POST['x']
        y = request.POST['y']
        width = request.POST['width']
        height = request.POST['height']
        name = request.POST['name']
        if 'onclick' not in request.POST:
            onclick = ''
        else:
            onclick = request.POST['onclick']
        area_id = request.POST['clickable_area_id']
        return edit_clickable_area_object(request, name, screen_id, visible, file_name, x, y, width, height, onclick,
                                          area_id)
    elif action == 'remove_clickable_area_object':
        area_id = request.POST['clickable_area_id']
        return remove_clickable_area_object(request, area_id)
    elif action == 'add_image_object':
        print 'Adding image object'
        screen_id = request.POST['screen_id']
        visible = request.POST['visible']
        name = request.POST['name']
        x_pos = request.POST['x']
        y_pos = request.POST['y']
        file_name = request.POST['file_name']
        draggable = request.POST['draggable']
        if 'onclick' not in request.POST:
            onclick = ''
        else:
            onclick = request.POST['onclick']
        return add_image_object(request, screen_id, visible, name, x_pos, y_pos, file_name, draggable, onclick)
    elif action == 'edit_image_object':
        print 'Editing image object'
        image_id = request.POST['image_id']
        screen_id = request.POST['screen_id']
        visible = request.POST['visible']
        name = request.POST['name']
        x_pos = request.POST['x']
        y_pos = request.POST['y']
        file_name = request.POST['file_name']
        draggable = request.POST['draggable']
        if 'onclick' not in request.POST:
            onclick = ''
        else:
            onclick = request.POST['onclick']
        return edit_image_object(request, screen_id, image_id, visible, name, x_pos, y_pos, file_name, draggable,
                                 onclick)
    elif action == 'remove_image_object':
        print 'Removing image object'
        image_id = request.POST['image_id']
        return remove_image_object(request, image_id)
    elif action == 'add_html_object':
        screen_id = request.POST['screen_id']
        name = request.POST['name']
        visible = request.POST['visible']
        x_pos = request.POST['x']
        y_pos = request.POST['y']
        width = request.POST['width']
        height = request.POST['height']
        html_content = request.POST['html_content']
        if 'onclick' not in request.POST:
            onclick = ''
        else:
            onclick = request.POST['onclick']
        return add_html_object(request, screen_id, name, visible, x_pos, y_pos, html_content, width, height, onclick)
    elif action == 'edit_html_object':
        html_id = request.POST['html_id']
        screen_id = request.POST['screen_id']
        name = request.POST['name']
        visible = request.POST['visible']
        x_pos = request.POST['x']
        y_pos = request.POST['y']
        width = request.POST['width']
        height = request.POST['height']
        html_content = request.POST['html_content']
        if 'onclick' not in request.POST:
            onclick = ''
        else:
            onclick = request.POST['onclick']
        return edit_html_object(request, screen_id, html_id, name, visible, x_pos, y_pos, html_content, width, height,
                                onclick)
    elif action == 'remove_html_object':
        html_id = request.POST['html_id']
        return remove_html_object(request, html_id)
    elif action == 'remove_button_object':
        print "remove button object"
        button_id = request.POST['b_id']
        return remove_button_object(request, button_id)
    elif action == 'edit_board_object':
        screen_id = request.POST['screen_id']
        background = request.POST['background']
        sound = request.POST['sound']
        panel_items = request.POST['panel_items']
        board = Board.objects.get(screen_id=screen_id)
        board.background = background
        board.panel_items = panel_items
        board.sound = sound
        board.save()
        return HttpResponse("OK")
    elif action == 'add_item':
        app_id = request.POST['app_id']
        name = request.POST['name']
        thumbnail = request.POST['thumbnail']
        bigsize_image = request.POST['bigsize_image']
        description = request.POST['description']
        return add_item_object(app_id, name, thumbnail, bigsize_image, description)
    elif action == 'edit_item':
        item_id = request.POST['id']
        name = request.POST['name']
        thumbnail = request.POST['thumbnail']
        bigsize_image = request.POST['bigsize_image']
        description = request.POST['description']
        return edit_item_object(item_id, name, thumbnail, bigsize_image, description)
    elif action == 'remove_item':
        item_id = request.POST['id']
        return remove_item_object(item_id)
    elif action == 'add_conversation':
        app_id = request.POST['app_id']
        name = request.POST['name']
        title = request.POST['title']
        image = request.POST['image']
        speaker_name = request.POST['speaker_name']
        sound = request.POST['sound']
        player_say_the_first = request.POST['player_say_the_first']
        conversations = request.POST['conversations']
        html_content = request.POST['html_content']
        onclick = request.POST['onclick']
        return add_conversation_object(app_id, name, title, image, speaker_name, sound, player_say_the_first,
                                       conversations, html_content, onclick)
    elif action == 'edit_conversation':
        conversation_id = request.POST['id']
        app_id = request.POST['app_id']
        name = request.POST['name']
        title = request.POST['title']
        image = request.POST['image']
        speaker_name = request.POST['speaker_name']
        sound = request.POST['sound']
        player_say_the_first = request.POST['player_say_the_first']
        conversations = request.POST['conversations']
        html_content = request.POST['html_content']
        onclick = request.POST['onclick']
        return edit_conversation_object(conversation_id, app_id, name, title, image, speaker_name, sound,
                                        player_say_the_first, conversations, html_content, onclick)
    elif action == 'remove_conversation':
        conversation_id = request.POST['id']
        return remove_conversation_object(conversation_id)
    elif action == 'add_tpopup':
        app_id = request.POST['app_id']
        name = request.POST['name']
        title = request.POST['title']
        description = request.POST['description']
        onclick = request.POST['onclick']
        return add_tpopup_object(app_id, name, title, description, onclick)
    elif action == 'edit_tpopup':
        tid = request.POST['id']
        name = request.POST['name']
        title = request.POST['title']
        description = request.POST['description']
        onclick = request.POST['onclick']
        return edit_tpopup_object(tid, name, title, description, onclick)
    elif action == 'add_textedit_object':
        text = request.POST['text']
        font_size = request.POST['font_size']
        text_color = request.POST['text_color']
        screen_id = request.POST['screen_id']
        x = request.POST['x']
        y = request.POST['y']
        width = request.POST['width']
        height = request.POST['height']
        visible = request.POST['visible']
        name = request.POST['name']
        font_type = request.POST['font_type']
        onclick = request.POST['onclick']
        return add_textedit_object(text, font_size, text_color, screen_id, x, y, width, height, visible, name,
                                   font_type, onclick)
    elif action == 'edit_textedit':
        t_id = request.POST['t_id']
        text = request.POST['text']
        font_size = request.POST['font_size']
        text_color = request.POST['text_color']
        screen_id = request.POST['screen_id']
        x = request.POST['x']
        y = request.POST['y']
        width = request.POST['width']
        height = request.POST['height']
        visible = request.POST['visible']
        name = request.POST['name']
        font_type = request.POST['font_type']
        onclick = request.POST['onclick']
        return edit_textedit_object(t_id, text, font_size, text_color, screen_id, x, y, width, height, visible, name,
                                    font_type, onclick)
    elif action == 'remove_textedit':
        t_id = request.POST['t_id']
        return remove_textedit(t_id)
    elif action == 'remove_tpopup':
        tid = request.POST['id']
        return remove_tpopup_object(tid)
    elif action == 'login':
        return get_app_list(request)
    elif action == 'download_app':
        return get_app_link(request)
    elif action == 'edit_board_code':
        return edit_board_code(request)
    elif action == 'remove_board_object':
        return handle_remove_board_object(request)
    elif action == 'remove_app':
        return handle_remove_app(request)
    elif action == 'edit_app':
        return handle_edit_app(request)
    elif action == 'add_publish':
        return handle_add_publish(request)
    elif action == 'edit_publish':
        return handle_edit_publish(request)
    elif action == 'remove_publish':
        return handle_remove_publish(request)
    elif action == 'add_code_publish':
        return handle_add_code_publish(request)
    elif action == 'edit_code_publish':
        return handle_edit_code_publish(request)
    elif action == 'remove_code_publish':
        return handle_remove_code_publish(request)
    elif action == 'add_publish_email':
        return handle_add_publish_email(request)
    elif action == 'edit_publish_email':
        return handle_edit_publish_email(request)
    elif action == 'remove_publish_email':
        return handle_remove_publish_email(request)
    elif action == 'get_publish_email':
        return handle_get_publish_email(request)
    elif action == 'get_list_publish_email':
        return handle_get_list_publish_email(request)
    elif action == 'copy_project':
        return copy_project(request)
    elif action == 'get_app_list_by_release':
        return get_app_list_by_release(request)
    elif action == 'get_app':
        return get_app(request)
    elif action == "get_settings":
        return get_settings(request)
    elif action == "set_user_settings":
        return set_user_settings(request)
    elif action == "get_user_settings":
        return get_user_settings(request)
    elif action == "add_map_object":
        return add_map_object(request)
    elif action == "edit_map_object":
        return edit_map_object(request)
    elif action == "remove_map_object":
        return remove_map_object(request)
    elif action == "add_node":
        return add_node(request)
    elif action == "edit_node":
        return edit_node(request)
    elif action == "remove_node":
        return remove_node(request)
    else:
        print 'nothing to do here'
    return HttpResponse("Are you okay ?")


def set_user_settings(request):
    user = User.objects.get(id=request.POST["user_id"])
    key = request.POST["key"]
    value = request.POST["value"]
    user_settings, created = UserSettings.objects.get_or_create(user=user, key=key)
    user_settings.value = value
    user_settings.save()
    return HttpResponse("200")


def get_user_settings(request):
    user = User.objects.get(id=request.POST["user_id"])
    user_settings = UserSettings.objects.filter(user=user)
    results = [setting.as_json() for setting in user_settings]
    response = dict(user_settings=results)
    return HttpResponse(json.dumps(response), mimetype="application/json")


def get_settings(request):
    result = ""
    all_settings = Settings.objects.all()
    if all_settings:
        result = all_settings[0].get_all_json()
    return HttpResponse(result)


@csrf_exempt
def add_node(request):
    x = request.POST['x']
    y = request.POST['y']
    width = request.POST['width']
    height = request.POST['height']
    screen_id = request.POST['screen_id']
    visible = request.POST['visible']
    name = request.POST['name']
    data = request.POST['data']
    node_object = NodeObject.objects.create(x=x, y=y, width=width, height=height, screen_id=screen_id, visible=visible,
                                            name=name, data=data)
    return HttpResponse(str(node_object.id))


@csrf_exempt
def edit_node(request):
    node_object = NodeObject.objects.get(id=request.POST['node_id'])
    node_object.x = request.POST['x']
    node_object.y = request.POST['y']
    node_object.width = request.POST['width']
    node_object.height = request.POST['height']
    node_object.screen_id = request.POST['screen_id']
    node_object.visible = request.POST['visible']
    node_object.name = request.POST['name']
    node_object.data = request.POST['data']
    node_object.save()
    return HttpResponse("OK")


@csrf_exempt
def remove_node(request):
    node_object = NodeObject.objects.get(id=request.POST['node_id'])
    node_object.delete()
    return HttpResponse("OK")


@csrf_exempt
def add_map_object(request):
    x = request.POST['x']
    y = request.POST['y']
    width = request.POST['width']
    height = request.POST['height']
    lat = request.POST['lat']
    lng = request.POST['lng']
    zoom = request.POST['zoom']
    screen_id = request.POST['screen_id']
    visible = request.POST['visible']
    name = request.POST['name']
    markers = request.POST['markers']
    animation = request.POST['animation']
    onclick = request.POST['onclick']
    map_object = MapObject.objects.create(x=x, y=y, width=width, height=height, lat=lat, lng=lng, zoom=zoom,
                                          screen_id=screen_id, visible=visible, name=name, markers=markers,
                                          animation=animation, onclick=onclick)
    return HttpResponse(str(map_object.id))


@csrf_exempt
def edit_map_object(request):
    map_object = MapObject.objects.get(id=request.POST['map_id'])
    map_object.x = request.POST['x']
    map_object.y = request.POST['y']
    map_object.width = request.POST['width']
    map_object.height = request.POST['height']
    map_object.lat = request.POST['lat']
    map_object.lng = request.POST['lng']
    map_object.zoom = request.POST['zoom']
    map_object.screen_id = request.POST['screen_id']
    map_object.visible = request.POST['visible']
    map_object.name = request.POST['name']
    map_object.markers = request.POST['markers']
    map_object.animation = request.POST['animation']
    map_object.onclick = request.POST['onclick']
    map_object.save()
    return HttpResponse("OK")


@csrf_exempt
def remove_map_object(request):
    map_object = MapObject.objects.get(id=request.POST['map_id'])
    map_object.delete()
    return HttpResponse("OK")


@csrf_exempt
def handle_add_publish_email(request):
    publish_object = Publish.objects.get(id=request.POST['publish_id'])
    email = request.POST['email']
    shared_code = request.POST['sharedCode']
    publish_email = PublishEmail.objects.create(publish=publish_object, email=email, sharedCode=shared_code)
    return HttpResponse(str(publish_email.id))


@csrf_exempt
def handle_edit_publish_email(request):
    publish_email = PublishEmail.objects.get(id=request.POST['id'])
    publish_object = Publish.objects.get(id=request.POST['publish_id'])
    email = request.POST['email']
    shared_code = request.POST['sharedCode']
    publish_email.publish = publish_object
    publish_email.email = email
    publish_email.sharedCode = shared_code
    publish_email.save()
    return HttpResponse("OK")


@csrf_exempt
def handle_remove_publish_email(request):
    publish_email = PublishEmail.objects.get(id=request.POST['id'])
    publish_email.delete()
    return HttpResponse("OK")


@csrf_exempt
def handle_get_publish_email(request):
    publish_check = Publish.objects.get(id=request.POST['publish_id'])
    publish_emails = PublishEmail.objects.filter(publish=publish_check)
    return render_to_response('json_publish_email.json', locals(), context_instance=RequestContext(request))


@csrf_exempt
def handle_get_list_publish_email(request):
    email = request.POST['email']
    publish_emails = PublishEmail.objects.filter(email=email)
    return render_to_response('json_publish_email_list.json', locals(), context_instance=RequestContext(request))


@csrf_exempt
def get_app_list_by_release(request):
    apps = Application.objects.filter(release=request.POST['release'])
    return render_to_response('json_app_list.json', locals(), context_instance=RequestContext(request))


@csrf_exempt
def get_app(request):
    app = Application.objects.get(id=request.POST['app_id'])
    return render_to_response('json_app.json', locals(), context_instance=RequestContext(request))


@csrf_exempt
def handle_add_publish(request):
    app_id = request.POST['app_id']
    name = request.POST['name']
    date = request.POST['date']
    version = request.POST['version']
    publish_object = Publish.objects.create(app_id=app_id, name=name, date=date, version=version)
    return HttpResponse(str(publish_object.id))


@csrf_exempt
def handle_edit_publish(request):
    publish_object = Publish.objects.get(id=request.POST['id'])
    app_id = request.POST['app_id']
    name = request.POST['name']
    date = request.POST['date']
    version = request.POST['version']
    publish_object.app_id = app_id
    publish_object.name = name
    publish_object.date = date
    publish_object.version = version
    publish_object.save()
    return HttpResponse("OK")


@csrf_exempt
def handle_remove_publish(request):
    publish_object = Publish.objects.get(id=request.POST['id'])
    publish_object.delete()
    return HttpResponse("OK")


@csrf_exempt
def handle_add_code_publish(request):
    publish_id = request.POST['publish_id']
    type = request.POST['type']
    code = request.POST['code']
    code_publish_object = CodesPublish.objects.create(publish_id=publish_id, type=type, code=code)
    return HttpResponse(str(code_publish_object.id))


@csrf_exempt
def handle_edit_code_publish(request):
    code_publish_object = CodesPublish.objects.get(id=request.POST['id'])
    publish_id = request.POST['publish_id']
    type = request.POST['type']
    code = request.POST['code']
    code_publish_object.publish_id = publish_id
    code_publish_object.type = type
    code_publish_object.code = code
    code_publish_object.save()
    return HttpResponse("OK")


@csrf_exempt
def handle_remove_code_publish(request):
    code_publish_object = CodesPublish.objects.get(id=request.POST['id'])
    code_publish_object.delete()
    return HttpResponse("OK")


@csrf_exempt
def handle_edit_app(request):
    app_id = request.POST['app_id']
    main_code = request.POST['main_code']
    app = Application.objects.get(id=app_id)
    app.main_code = main_code
    app.save()
    return HttpResponse("OK")


@csrf_exempt
def handle_remove_board_object(request):
    board_id = request.POST['id']
    # TODO: dodac usuwanie board
    board = Board.objects.get(id=board_id)
    screen = Screen.objects.get(id=board.screen_id)
    board.delete()
    screen.delete()
    return HttpResponse("OK")


@csrf_exempt
def handle_remove_app(request):
    app_id = request.POST['id']
    app_object = Application.objects.get(id=app_id)
    app_object.user = None
    app_object.save()
    return HttpResponse("OK")


@csrf_exempt
def remove_file(request):
    action = request.POST['type']
    filename = request.POST['filename']
    app_id = request.POST['app_id']
    image_upload_path = settings.MEDIA_ROOT + '/upload/' + app_id + '/img/'
    sound_upload_path = settings.MEDIA_ROOT + '/upload/' + app_id + '/sound/'
    if action == 'image':
        os.remove(image_upload_path + filename)
    else:
        os.remove(sound_upload_path + filename)
    return HttpResponse("OK")


@csrf_exempt
def get_app_list(request):
    login = request.POST['login']
    password = request.POST['password']
    user = authenticate(username=login, password=password)
    if user is not None:
        if user.is_active:
            apps = Application.objects.filter(user=user)
            if not apps:
                copy_stock_app(user)
            return render_to_response('apps.html', locals(), context_instance=RequestContext(request))
            return HttpResponse("OK")
    else:
        return HttpResponse("Fail")


@csrf_exempt
def edit_board_code(request):
    screen_id = request.POST['screen_id']
    user_code = request.POST['user_code']
    generated_code = request.POST['generated_code']
    start = request.POST['start']

    board_codes = BoardCode.objects.filter(screen_id=screen_id)
    if board_codes:
        board_code = board_codes[0]
    else:
        board_code = BoardCode.objects.create(screen_id=screen_id)

    board_code.user_code = user_code
    board_code.generated_code = generated_code
    board_code.start = start
    board_code.save()

    return HttpResponse("OK")


@csrf_exempt
def get_app_link(request):
    app_id = request.POST['app_id']
    app = Application.objects.get(id=app_id)
    user_id = str(app.user.id)
    export_app_to_xml(request, app_id)
    return HttpResponse(settings.APP_ZIP_URL + user_id + "/" + app.name + ".zip")


@csrf_exempt
def dummy(request):
    for key in request.POST:
        print key + " : " + request.POST[key]
    value = request.POST['value'];
    value = value.replace("\n", "<br />")
    response = HttpResponse(value)
    response['Access-Control-Allow-Origin'] = "*"
    return response


def add_textedit_object(text, font_size, text_color, screen_id, x, y, width, height, visible, name, font_type, onclick):
    textedit_object = TextEdit.objects.create()
    textedit_object.text = text
    textedit_object.font_size = font_size
    textedit_object.text_color = text_color
    textedit_object.screen_id = screen_id
    textedit_object.x = x
    textedit_object.y = y
    textedit_object.width = width
    textedit_object.height = height
    textedit_object.visible = visible
    textedit_object.name = name
    textedit_object.font_type = font_type
    textedit_object.onclick
    textedit_object.save()
    return HttpResponse(str(textedit_object.id))


def edit_textedit_object(t_id, text, font_size, text_color, screen_id, x, y, width, height, visible, name, font_type,
                         onclick):
    textedit_object = TextEdit.objects.get(id=t_id)
    textedit_object.text = text
    textedit_object.font_size = font_size
    textedit_object.text_color = text_color
    textedit_object.screen_id = screen_id
    textedit_object.x = x
    textedit_object.y = y
    textedit_object.width = width
    textedit_object.height = height
    textedit_object.visible = visible
    textedit_object.name = name
    textedit_object.font_type = font_type
    textedit_object.onclick
    textedit_object.save()
    return HttpResponse("OK")


def remove_textedit(t_id):
    textedit_object = TextEdit.objects.get(id=t_id)
    textedit_object.delete()
    return HttpResponse("OK")


def add_conversation_object(app_id, name, title, image, speaker_name, sound, player_say_the_first, conversations,
                            html_content, onclick):
    conversation_object = ConversationObject.objects.create()
    conversation_object.app_id = app_id
    conversation_object.name = name
    conversation_object.title = title
    conversation_object.image = image
    conversation_object.speaker_name = speaker_name
    conversation_object.sound = sound
    conversation_object.player_say_the_first = player_say_the_first
    conversation_object.conversations = conversations
    conversation_object.html_content = html_content
    conversation_object.onclick = onclick
    conversation_object.save()
    return HttpResponse(str(conversation_object.id))


def edit_conversation_object(conversation_id, app_id, name, title, image, speaker_name, sound, player_say_the_first,
                             conversations, html_content, onclick):
    conversation_object = ConversationObject.objects.get(id=conversation_id)
    conversation_object.app_id = app_id
    conversation_object.name = name
    conversation_object.title = title
    conversation_object.image = image
    conversation_object.speaker_name = speaker_name
    conversation_object.sound = sound
    conversation_object.player_say_the_first = player_say_the_first
    conversation_object.conversations = conversations
    conversation_object.html_content = html_content
    conversation_object.onclick = onclick
    conversation_object.save()
    return HttpResponse("OK")


def remove_conversation_object(conversation_id):
    conversation_object = ConversationObject.objects.get(id=conversation_id)
    conversation_object.delete()
    return HttpResponse("OK")


def add_item_object(app_id, name, thumbnail, bigsize_image, description):
    item_object = ItemObject.objects.create()
    item_object.app_id = app_id
    item_object.name = name
    item_object.thumbnail = thumbnail
    item_object.bigsize_image = bigsize_image
    item_object.description = description
    item_object.save()
    return HttpResponse(str(item_object.id))


def edit_item_object(item_id, name, thumbnail, bigsize_image, description):
    item_object = ItemObject.objects.get(id=item_id)
    item_object.name = name
    item_object.thumbnail = thumbnail
    item_object.bigsize_image = bigsize_image
    item_object.description = description
    item_object.save()
    return HttpResponse("OK")


def remove_item_object(item_id):
    item_object = ItemObject.objects.get(id=item_id)
    item_object.delete()
    return HttpResponse("OK")


def add_text_object(request, text, x, y, s_id, width, height, visible, name, text_color, font_size, font_type, onclick):
    text_object = TextObject.objects.create()
    text_object.text = text
    text_object.x_pos = x
    text_object.y_pos = y
    text_object.screen_id = s_id
    text_object.width = width
    text_object.height = height
    text_object.visible = visible
    text_object.name = name
    text_object.text_color = text_color
    text_object.font_size = font_size
    text_object.font_type = font_type
    text_object.onclick = onclick
    text_object.save()
    return HttpResponse(str(text_object.id))


def edit_text_object(request, text, x, y, s_id, t_id, width, height, visible, name, text_color, font_size, font_type,
                     onclick):
    text_object = TextObject.objects.get(id=t_id)
    text_object.text = text
    text_object.x_pos = x
    text_object.y_pos = y
    text_object.screen_id = s_id
    text_object.width = width
    text_object.height = height
    text_object.visible = visible
    text_object.name = name
    text_object.text_color = text_color
    text_object.font_size = font_size
    text_object.font_type = font_type
    text_object.onclick = onclick
    text_object.save()
    return HttpResponse("OK")


def remove_text_object(request, t_id):
    text_object = TextObject.objects.get(id=t_id)
    text_object.delete()
    return HttpResponse("OK")


def add_image_object(request, screen_id, visible, name, x_pos, y_pos, file_name, draggable, onclick):
    image_object = ImageObject.objects.create()
    image_object.visible = visible
    image_object.name = name
    image_object.x_pos = x_pos
    image_object.y_pos = y_pos
    image_object.file_name = file_name
    image_object.draggable = draggable
    image_object.screen_id = screen_id
    image_object.onclick = onclick
    image_object.save()
    return HttpResponse(str(image_object.id))


def edit_image_object(request, screen_id, image_id, visible, name, x_pos, y_pos, file_name, draggable, onclick):
    image_object = ImageObject.objects.get(id=image_id)
    image_object.visible = visible
    image_object.name = name
    image_object.x_pos = x_pos
    image_object.y_pos = y_pos
    image_object.file_name = file_name
    image_object.draggable = draggable
    image_object.screen_id = screen_id
    image_object.onclick = onclick
    image_object.save()
    return HttpResponse("OK")


def remove_image_object(request, image_id):
    image_object = ImageObject.objects.get(id=image_id)
    image_object.delete()
    return HttpResponse("OK")


def add_html_object(request, screen_id, name, visible, x_pos, y_pos, html_content, width, height, onclick):
    html_object = HtmlObject.objects.create()
    html_object.screen_id = screen_id
    html_object.name = name
    html_object.visible = visible
    html_object.x_pos = x_pos
    html_object.y_pos = y_pos
    html_object.html_content = html_content
    html_object.width = width
    html_object.height = height
    html_object.onclick = onclick
    html_object.save()
    return HttpResponse(str(html_object.id))


def edit_html_object(request, screen_id, html_id, name, visible, x_pos, y_pos, html_content, width, height, onclick):
    html_object = HtmlObject.objects.get(id=html_id)
    html_object.screen_id = screen_id
    html_object.name = name
    html_object.visible = visible
    html_object.x_pos = x_pos
    html_object.y_pos = y_pos
    html_object.html_content = html_content
    html_object.width = width
    html_object.height = height
    html_content.onclick = onclick
    html_object.save()
    return HttpResponse("OK")


def remove_html_object(request, html_id):
    html_object = HtmlObject.objects.get(id=html_id)
    html_object.delete()
    return HttpResponse("OK")


def add_clickable_area_object(request, name, screen_id, visible, file_name, x, y, width, height, onclick):
    clickble_area = ClickableArea.objects.create()
    clickble_area.name = name
    clickble_area.screen_id = screen_id
    clickble_area.visible = visible
    clickble_area.file_name = file_name
    clickble_area.x = x
    clickble_area.y = y
    clickble_area.width = width
    clickble_area.height = height
    clickble_area.onclick = onclick
    clickble_area.save()
    return HttpResponse(str(clickble_area.id))


def edit_clickable_area_object(request, name, screen_id, visible, file_name, x, y, width, height, onclick, area_id):
    clickble_area = ClickableArea.objects.get(id=area_id)
    clickble_area.name = name
    clickble_area.screen_id = screen_id
    clickble_area.visible = visible
    clickble_area.file_name = file_name
    clickble_area.x = x
    clickble_area.y = y
    clickble_area.width = width
    clickble_area.height = height
    clickble_area.onclick = onclick
    clickble_area.save()
    return HttpResponse("OK")


def remove_clickable_area_object(request, area_id):
    clickble_area = ClickableArea.objects.get(id=area_id)
    clickble_area.delete()
    return HttpResponse("OK")


def add_button_object(request, title_label, screen_id, x, y, visible, name, background_image, title_color, onclick,
                      width, height, font_size, font_type):
    button_object = ButtonObject.objects.create()
    button_object.title_label = title_label
    button_object.screen_id = screen_id
    button_object.x_pos = x
    button_object.y_pos = y
    button_object.visible = visible
    button_object.name = name
    button_object.background_image = background_image
    button_object.title_color = title_color
    button_object.onclick = onclick
    button_object.width = width
    button_object.height = height
    button_object.font_size = font_size
    button_object.font_type = font_type
    button_object.save()
    return HttpResponse(str(button_object.id))


def edit_button_object(request, title_label, screen_id, x, y, visible, name, background_image, title_color, button_id,
                       onclick, width, height, font_size, font_type):
    button_object = ButtonObject.objects.get(id=button_id)
    button_object.title_label = title_label
    button_object.screen_id = screen_id
    button_object.x_pos = x
    button_object.y_pos = y
    button_object.visible = visible
    button_object.name = name
    button_object.background_image = background_image
    button_object.title_color = title_color
    button_object.onclick = onclick
    button_object.width = width
    button_object.height = height
    button_object.font_size = font_size
    button_object.font_type = font_type
    print "Onclick BUTTON: " + onclick
    button_object.save()
    return HttpResponse("OK")


def remove_button_object(request, b_id):
    button_object = ButtonObject.objects.get(id=b_id)
    button_object.delete()
    return HttpResponse("OK")


def add_tpopup_object(app_id, name, title, description, onclick):
    tpopup_object = Tpopups.objects.create()
    tpopup_object.app_id = app_id
    tpopup_object.name = name
    tpopup_object.description = description
    tpopup_object.onclick = onclick
    tpopup_object.save()
    return HttpResponse(str(tpopup_object.id))


def edit_tpopup_object(tid, name, title, description, onclick):
    tpopup_object = Tpopups.objects.get(id=tid)
    tpopup_object.name = name
    tpopup_object.description = description
    tpopup_object.onclick = onclick
    tpopup_object.save()
    return HttpResponse("OK")


def remove_tpopup_object(tid):
    tpopup_object = Tpopups.objects.get(id=tid)
    tpopup_object.delete()
    return HttpResponse("OK")


@login_required
def edit_screen(request, sid, is_emulated_only=False):
    all_settings = Settings.objects.all()
    if all_settings:
        settings_obj = all_settings[0]
    screen = Screen.objects.get(id=sid)
    buttons = ButtonObject.objects.filter(screen_id="qweasd")
    texts = TextObject.objects.filter(screen_id="qweasd")
    textedits = TextEdit.objects.filter(screen_id="qweasd")
    htmls = HtmlObject.objects.filter(screen_id=sid)
    images = ImageObject.objects.filter(screen_id=sid)
    maps = MapObject.objects.filter(screen_id="qweasd")
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
        new_maps = MapObject.objects.filter(screen_id=screena.id)
        new_texts = TextObject.objects.filter(screen_id=screena.id)
        new_textedits = TextEdit.objects.filter(screen_id=screena.id)
        textedits = list(chain(textedits, new_textedits))
        texts = list(chain(texts, new_texts))
        buttons = list(chain(buttons, new_buttons))
        maps = list(chain(maps, new_maps))		
        boards = list(chain(boards, new_boards))
        areas = list(chain(areas, new_areas))
        codes = list(chain(codes, new_codes))
    texts_size = len(texts)
    return render_to_response('index.html', locals(), context_instance=RequestContext(request))


@csrf_exempt
def get_swipegroups(request):
    if request.method == 'POST':
        app_id = request.POST['app_id']
    else:
        app_id = 1
    app = Application.objects.get(id=app_id)
    screens = Screen.objects.filter(app_id=app.app_id)
    swipegroups = []
    swipegroups_dicts = []
    for screen in screens:
        if not screen.swipegroup in swipegroups:
            swipegroups.append(screen.swipegroup)
            swipegroups_dicts.append(parse_swipegroup_info_json(screen.swipegroup))

    response_data = {'swipegroups': swipegroups_dicts}
    return HttpResponse(json.dumps(response_data), mimetype="application/json")


def parse_swipegroup_info_json(swipegroup):
    swipe_data = {}
    swipe_data['id'] = swipegroup.id
    swipe_data['name'] = swipegroup.name
    swipe_data['page_control_visible'] = swipegroup.page_control_visible
    swipe_data['navigation_bar_visible'] = swipegroup.navigation_brba_visible
    swipe_data['pager_tab_visible'] = swipegroup.pager_tab_visible
    swipe_data['pager_tab_title'] = swipegroup.pager_tab_title

    return swipe_data