from django.db import models
from django.contrib.auth.models import User
import json


class Application(models.Model):
    ORIENTATIONS = (
        ('portrait', 'portrait'),
        ('landscape', 'landscape'),
    )
    name = models.CharField(max_length=255)
    app_id = models.CharField(max_length=255)
    orientation = models.CharField(null=True, blank=True, max_length=255, choices=ORIENTATIONS, default="portrait")
    user = models.ForeignKey(User, null=True, blank=True)
    character_name = models.CharField(max_length=255)
    main_code = models.TextField(blank=True, null=True)
    release = models.IntegerField(default=0)
    authored_user = models.IntegerField(default=0)


class Screen(models.Model):
    title = models.CharField(max_length=255, null=True, blank=True, default='No Title')
    swipegroup = models.ForeignKey('Swipegroup', null=True, blank=True)
    configuration = models.CharField(max_length=255, null=True, blank=True, default='portrait')
    app_id = models.CharField(max_length=255, null=True, blank=True)


class Swipegroup(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True, default="noname")
    page_control_visible = models.CharField(max_length=255, null=True, blank=True, default="0")
    navigation_bar_visible = models.CharField(max_length=255, null=True, blank=True, default="0")
    pager_tab_visible = models.CharField(max_length=255, null=True, blank=True, default="0")
    pager_tab_title = models.CharField(max_length=255, null=True, blank=True, default="pager tab title here")


class Board(models.Model):
    screen_id = models.CharField(max_length=255, null=True, blank=True, default='-')
    background = models.CharField(max_length=255, null=True, blank=True, default='-')
    sound = models.CharField(max_length=255, null=True, blank=True, default='-')
    panel_items = models.CharField(max_length=1, null=True, blank=True, default='1')


class BoardCode(models.Model):
    screen_id = models.CharField(max_length=255, null=True, blank=True, default='-')
    user_code = models.TextField(null=True, blank=True, default='-')
    generated_code = models.TextField(null=True, blank=True, default='-')
    start = models.IntegerField(blank=True, null=True, default=0)


class TextObject(models.Model):
    text = models.TextField(null=True, blank=True)
    text_color = models.CharField(max_length=255, null=True, blank=True, default='240,240,240')
    font_size = models.CharField(max_length=255, null=True, blank=True, default='14')
    font_type = models.CharField(max_length=255, null=True, blank=True, default='Helvetica')
    screen_id = models.CharField(max_length=255, null=True, blank=True)
    x_pos = models.CharField(max_length=255, null=True, blank=True)
    y_pos = models.CharField(max_length=255, null=True, blank=True)
    height = models.CharField(max_length=255, null=True, blank=True)
    width = models.CharField(max_length=255, null=True, blank=True)
    visible = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    onclick = models.TextField(null=True, blank=True)

    def get_onclick(self):
        return read_json(self.onclick)


    def __unicode__(self):
        return "text object with content: " + self.text


class Publish(models.Model):
    app_id = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    date = models.CharField(max_length=255, null=True, blank=True)
    version = models.CharField(max_length=255, null=True, blank=True)


class CodesPublish(models.Model):
    publish_id = models.CharField(max_length=255, null=True, blank=True)
    type = models.CharField(max_length=255, null=True, blank=True)
    code = models.TextField(blank=True, null=True)


class PublishEmail(models.Model):
    publish = models.ForeignKey('Publish', null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    sharedCode = models.IntegerField(null=True, blank=True)


class ButtonObject(models.Model):
    title_label = models.CharField(max_length=255, null=True, blank=True)
    title_color = models.CharField(max_length=255, null=True, blank=True, default='240,240,240')
    background_image = models.CharField(max_length=255, null=True, blank=True)
    screen_id = models.CharField(max_length=255, null=True, blank=True)
    x_pos = models.CharField(max_length=255, null=True, blank=True)
    y_pos = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    visible = models.CharField(max_length=255, null=True, blank=True)
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    font_size = models.IntegerField(blank=True, null=True)
    font_type = models.CharField(max_length=255, null=True, blank=True)

    onclick = models.TextField(null=True, blank=True)

    def get_onclick(self):
        return read_json(self.onclick)

    def __unicode__(self):
        return "buton object with label: " + self.title_label


class ImageObject(models.Model):
    visible = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    x_pos = models.CharField(max_length=255, null=True, blank=True)
    y_pos = models.CharField(max_length=255, null=True, blank=True)
    file_name = models.CharField(max_length=255, null=True, blank=True)
    draggable = models.CharField(max_length=255, null=True, blank=True)
    screen_id = models.CharField(max_length=255, null=True, blank=True)
    onclick = models.TextField(null=True, blank=True)

    def get_onclick(self):
        return read_json(self.onclick)

    def __unicode__(self):
        return "image object with name: " + self.name


class HtmlObject(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    visible = models.CharField(max_length=255, null=True, blank=True)
    x_pos = models.CharField(max_length=255, null=True, blank=True)
    y_pos = models.CharField(max_length=255, null=True, blank=True)
    html_content = models.CharField(max_length=255, null=True, blank=True)
    screen_id = models.CharField(max_length=255, null=True, blank=True)
    width = models.CharField(max_length=255, null=True, blank=True)
    height = models.CharField(max_length=255, null=True, blank=True)
    onclick = models.TextField(null=True, blank=True)

    def get_onclick(self):
        return read_json(self.onclick)

    def __unicode__(self):
        return "html object with name: " + self.name


class ClickableArea(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    screen_id = models.CharField(max_length=255, null=True, blank=True)
    visible = models.CharField(max_length=255, null=True, blank=True)
    file_name = models.CharField(max_length=255, null=True, blank=True, default='-')
    x = models.CharField(max_length=255, null=True, blank=True)
    y = models.CharField(max_length=255, null=True, blank=True)
    width = models.CharField(max_length=255, null=True, blank=True)
    height = models.CharField(max_length=255, null=True, blank=True)
    onclick = models.TextField(null=True, blank=True)

    def get_onclick(self):
        return read_json(self.onclick)

    def __unicode__(self):
        return "clicable area with name: " + self.name


class ItemObject(models.Model):
    app_id = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    thumbnail = models.CharField(max_length=255, null=True, blank=True, default='-')
    bigsize_image = models.CharField(max_length=255, null=True, blank=True, default='-')
    description = models.CharField(max_length=255, null=True, blank=True)

    def __unicode__(self):
        return "item object with name: " + self.name


class ConversationObject(models.Model):
    app_id = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    title = models.CharField(max_length=255, null=True, blank=True)
    image = models.CharField(max_length=255, null=True, blank=True, default='-')
    speaker_name = models.CharField(max_length=255, null=True, blank=True)
    sound = models.CharField(max_length=255, null=True, blank=True, default='-')
    player_say_the_first = models.CharField(max_length=255, null=True, blank=True)
    conversations = models.TextField(null=True, blank=True)
    html_content = models.TextField(null=True, blank=True)
    onclick = models.TextField(null=True, blank=True)

    def get_onclick(self):
        return read_json(self.onclick)

    def __unicode__(self):
        return "conversation object with name: " + self.name


class Tpopups(models.Model):
    app_id = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    onclick = models.TextField(null=True, blank=True)

    def get_onclick(self):
        return read_json_tpopups(self.onclick)

    def __unicde__(self):
        return "tpopups object with name: " + self.name


class TextEdit(models.Model):
    text = models.TextField(null=True, blank=True)
    text_color = models.CharField(max_length=255, null=True, blank=True, default='240,240,240')
    font_size = models.CharField(max_length=255, null=True, blank=True, default='14')
    screen_id = models.CharField(max_length=255, null=True, blank=True)
    x = models.CharField(max_length=255, null=True, blank=True)
    y = models.CharField(max_length=255, null=True, blank=True)
    height = models.CharField(max_length=255, null=True, blank=True)
    width = models.CharField(max_length=255, null=True, blank=True)
    visible = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    font_type = models.CharField(max_length=255, null=True, blank=True)
    onclick = models.TextField(null=True, blank=True)

    def get_onclick(self):
        return read_json(self.onclick)

    def __unicode__(self):
        return "textedit object with name: " + self.name


class UserSettings(models.Model):
    user = models.ForeignKey(User)
    key = models.CharField(max_length=255)
    value = models.TextField(blank=True, null=True)

    def as_json(self):
        return dict(
            id=self.id, key=self.key, value=self.value
        )


class Settings(models.Model):
    key = models.CharField(max_length=255)
    value = models.TextField()

    def __unicode__(self):
        return "settings key: " + self.key + " value: " + self.value

    def get_single_json(self):
        return "{\"%s\":\"%s\"}" % (self.key, self.value)

    def get_all_json(self):
        result = "{\"settings\":["
        all_settings = Settings.objects.all()
        counter = 0
        for setting in all_settings:
            if counter > 0:
                result += ","
            counter += 1
            result += setting.get_single_json()
        result += "]}"
        return result



def read_json(json_content):
    if len(json_content) < 1:
        return ""
    json_data = json.dumps(json_content)
    elements = json.loads(json_content)
    to_return = ""
    print elements
    json_data = json.dumps(elements)
    element = json.loads(json_content)
    for element in elements:
        print 'element: ' + element
        if element == 'onclick':
            print 'handle onclick'
            to_return += handle_onclick_element(elements['onclick'])
        elif element == 'actions':
            to_return += handle_actions_element(elements['actions'])
        else:
            to_return += handle_onclick_element(element)

    print to_return
    return to_return


def read_json_tpopups(json_content):
    if len(json_content) < 1:
        return ""
    json_data = json.dumps(json_content)
    elements = json.loads(json_content)
    to_return = ""
    print elements
    json_data = json.dumps(elements)
    element = json.loads(json_content)
    for element in elements:
        print 'POPUPS:  ' + element
        if element == 'onclick':
            print 'handle onclick'
            to_return += handle_onclick_element_pop(elements['onclick'])
        elif element == 'actions':
            print "ACTIONS JAZDA"
            to_return += handle_onclick_element_pop(elements['actions'])

    print to_return
    return to_return


def handle_actions_element(actions_element):
    to_return = ""
    print actions_element
    for action in actions_element:
        element_type = action['type']
        if element_type == 'onclick':
            to_return += handle_onclick_element(action['events'])
        elif element_type == 'ondrop':
            to_return += handle_ondrop_element(action['events'])
        print element_type

    print "RETURNING: " + to_return
    return to_return


def handle_action_element(element):
    to_return = ""
    element_type = element['type']
    print element_type

    if element_type == 'show_element':
        to_return += handle_show_element(element)
    elif element_type == 'hide_element':
        to_return += handle_hide_element(element)
    elif element_type == 'run_xml':
        to_return += handle_run_xml(element)
    elif element_type == 'go_back':
        to_return += handle_go_back(element)
    elif element_type == 'playmp3':
        to_return += handle_playmp3(element)
    elif element_type == 'stopmp3':
        to_return += handle_stopmp3(element)
    elif element_type == 'show_popover':
        to_return += handle_show_popover(element)
    elif element_type == 'show_gallery':
        to_return += handle_show_gallery(element)
    elif element_type == 'item_show_tpopup':
        to_return += handle_item_show_tpopup(element)
    elif element_type == 'onclick':
        to_return += handle_onclick_element_pop(element['events'])
    elif element_type == 'show_image':
        to_return += handle_show_image(element)
    elif element_type == 'show_tpopup':
        to_return += handle_show_tpopup(element)
    elif element_type == 'initiate_conversation':
        to_return += handle_initiate_conversation(element)
    elif element_type == 'take_item':
        to_return += handle_take_item(element)
    elif element_type == 'drop_item':
        to_return += handle_drop_item(element)

    return to_return


def handle_ondrop_element(ondrop_element):
    to_return = "<ondrop>"

    print ondrop_element
    for element in ondrop_element:
        element_type = element['type']
        print element_type

        to_return += handle_action_element(element)

    to_return = to_return + "</ondrop>"

    return to_return


def handle_onclick_element(onclick_element):
    print 'handle onclick element'
    to_return = "<onclick>"
    print onclick_element
    for element in onclick_element:
        element_type = element['type']
        print element_type

        to_return += handle_action_element(element)

    to_return = to_return + "</onclick>"
    return to_return


def handle_onclick_element_pop(onclick_element):
    print 'handle onclick element pop'
    to_return = ""
    print onclick_element
    for element in onclick_element:
        element_type = element['type']
        print "EELELEL TYPE " + element_type

        to_return += handle_action_element(element)

    return to_return


def handle_item_show_tpopup(tpopup_element):
    to_return = ""
    title = "-"
    if 'title' in tpopup_element:
        title = tpopup_element['title']
    if len(title) > 1:
        to_return = "<button>"

        to_return += "<title>" + tpopup_element['title'] + "</title>"
        to_return += "<onclick>" + handle_onclick_element_pop(tpopup_element['events']) + "</onclick>"
        to_return += "</button>"

    return to_return


def handle_drop_item(drop_item):
    to_return = ""
    item_name = drop_item['item_name']
    if 'leave_after_drop' in drop_item:
        leave_after_drop = str(drop_item['leave_after_drop'])
    else:
        leave_after_drop = "0"
    onclick = False
    if 'events' in drop_item:
        onclick = drop_item['events']
    if onclick:
        to_return += '<drop_item name="' + item_name + '"  leave_after_drop="' + leave_after_drop + '">' + handle_onclick_element_pop(
            onclick) + '</drop_item>'
    else:
        to_return += '<drop_item name="' + item_name + '"></drop_item>'
    return to_return


def handle_take_item(take_item):
    return '<take_item disappear_after_taking="' + str(take_item['disappear_after_taking']) + '">' + take_item[
        'item_name'] + '</take_item>'


def handle_show_image(show_image):
    to_return = "<show_image>" + show_image['image'] + "</show_image>"
    return to_return


def handle_show_tpopup(show_popup):
    name = '-'
    if 'name' in show_popup:
        name = show_popup['name']
    if len(name) > 1:
        return "<show_tpopup>" + show_popup['name'] + "</show_tpopup>"
    else:
        return ""


def handle_show_element(show_element):
    name = show_element['name']
    print "HANDLE SHOW ELEMENT"
    if len(name) > 1:
        to_return = "<show_element>" + name + "</show_element>"
    else:
        to_return = ""
    print "TO RETURNL " + to_return
    print "NAME: " + name
    return to_return


def handle_hide_element(hide_element):
    name = hide_element['name']

    if len(name) > 1:
        to_return = "<hide_element>" + name + "</hide_element>"
    else:
        to_return = ""

    return to_return


def handle_initiate_conversation(initiate_conversation):
    return "<initiate_conversation>" + initiate_conversation['name'] + "</initiate_conversation>"


def handle_run_xml(run_xml):
    name = run_xml['name']
    animated = run_xml['animated']
    if len(name) > 1:
        to_return = '<run_xml>' + name + '.xml</run_xml>'
    else:
        to_return = ""

    return to_return


def handle_go_back(go_back):
    return "<go_back />"


def handle_playmp3(playmp3):
    print playmp3
    if 'name' in playmp3:
        name = playmp3['name']
    else:
        name = '-'
    loop = str(playmp3['loop'])
    print "PLAYMP3: " + name + " loop: " + loop
    if len(name) > 1:
        to_return = '<playmp3 name="' + name + '" loop="' + loop + '"/>'
    else:
        to_return = ""

    return to_return


def handle_stopmp3(stopmp3):
    return "<stopmp3 />"


def handle_show_popover(show_popover):
    to_return = "<show_popover>"

    width = str(show_popover['width'])
    height = str(show_popover['height'])
    x_pos = str(show_popover['x_pos'])
    y_pos = str(show_popover['y_pos'])
    items = show_popover['items']

    if len(width) > 0 and len(height) > 0:
        to_return += "<width>" + width + "</width><height>" + height + "</height>"
    if len(x_pos) > 0 and len(y_pos) > 0:
        to_return += "<x_pos>" + x_pos + "</x_pos><y_pos>" + y_pos + "</y_pos>"

    to_return += "<items>"
    for item in items:
        to_return += handle_item(item)
    to_return += "</items>"

    to_return += "</show_popover>"
    return to_return


def handle_item(item):
    title = item['title']
    subtitle = item['subtitle']
    image = item['image']

    to_return = "<item><title>" + title + "</title><subtitle>" + subtitle + "</subtitle><image>" + image + "</image>"

    if 'onclick' in item:
        onclick = item['onclick']
        to_return += "<onclick>"
        to_return += handle_onclick_element(onclick)
        to_return += "</onclick>"

    to_return += "</item>"
    return to_return


def handle_show_gallery(show_gallery):
    print show_gallery
    return ""