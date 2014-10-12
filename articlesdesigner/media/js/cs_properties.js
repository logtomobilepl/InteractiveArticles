////////////////////
// PROPERTIES

function Properties(parentId) {
    this.parentId = parentId;
    this.parent = document.getElementById(parentId);
    this.listOfImages = new Array();
    this.propertiesList = [];

    this.addChild = function(propertyToAdd) {
        if(this.parent) {
            this.parent.appendChild(propertyToAdd.getElement());
            propertyToAdd.refreshActions();
            this.propertiesList.push(propertyToAdd);
        } else {
            messageDialog.show("Properties. Add child.","Parent is null.");
        }
    }

    this.removeAllChildren = function() {
        this.propertiesList.length = 0;
        while(this.parent.firstChild) {
            this.parent.removeChild(this.parent.firstChild);
        }
    }
    
    this.getPropertyForId = function(id) {
        for(var i=0; i < this.propertiesList.length; i++) {
            if (id == this.propertiesList[i].id) {
                return this.propertiesList[i];
            }
        }
        return null;
    }

    this.setForType = function(type, element) {
        
        var propertyTypeText = new Property("_type_text", "", "Type", type);

        var propertyXPos = new Property("x_pos", "text", "X pos");
        propertyXPos.setNumeric(true,false);
        propertyXPos.callbackChangeValue = callbackChangeValueXPos;
        propertyXPos.setOldValue(element.dataset.designXPos);        

        var propertyYPos = new Property("y_pos", "text", "Y pos");
        propertyYPos.setNumeric(true,false);
        propertyYPos.callbackChangeValue = callbackChangeValueYPos;
        propertyYPos.setOldValue(element.dataset.designYPos);
        
        var propertyWidth = new Property("width", "text", "Width");
        propertyWidth.setNumeric(true,false);
        propertyWidth.callbackChangeValue = callbackChangeValueWidth;
        propertyWidth.setOldValue(element.dataset.designWidth);

        var propertyHeight = new Property("height", "text", "Height");
        propertyHeight.setNumeric(true,false);
        propertyHeight.callbackChangeValue = callbackChangeValueHeight;        
        propertyHeight.setOldValue(element.dataset.designHeight);
        
        var propertyVisible = new Property("visible", PROPERTY_TYPE_CHECKBOX, "Visible?");
        propertyVisible.setTemplate(280,160);
        propertyVisible.styleRight = "vertical-align:top;"
        propertyVisible.callbackChangeValue = callbackChangeValueVisible;
        
        var propertyName = new Property("name", "text", "Name");
        propertyName.callbackChangeValue = callbackChangeValueName;

        var propertyText = new Property("_text", "textarea", "Text");
        propertyText.styleRight = "height:50px;vertical-align:top";
        propertyText.callbackChangeValue = callbackChangeValueText;

        var propertySingleText = new Property("_text", "text", "Text");
        propertySingleText.callbackChangeValue = callbackChangeValueText;
        
        var propertyHtmlContent = new Property("html_content", "textarea", "HTML");
        propertyHtmlContent.styleRight = "height:50px;vertical-align:top";
        propertyHtmlContent.callbackChangeValue = callbackChangeValueHtmlContent;

        var propertyFontType = new Property("font_type", "select", "Font type");
        propertyFontType.callbackChangeValue = callbackChangeValueFontType;
        propertyFontType.inputClass = "select_styled3";
        propertyFontType.addOptionOfSelect("Helvetica");
        propertyFontType.addOptionOfSelect("Tahoma");
        propertyFontType.addOptionOfSelect("Impact");
        propertyFontType.addOptionOfSelect("Comic Sans MS");
        propertyFontType.addOptionOfSelect("Geneva");

        var propertyFontSize = new Property("font_size", "text", "Font size");
        propertyFontSize.callbackChangeValue = callbackChangeValueFontSize;        
        propertyFontSize.setNumeric(true,false);

        var propertyTextColor = new Property("text_color", "color", "Text color");
        propertyTextColor.callbackChangeValue = callbackChangeValueTextColor;        

        var propertyTitleLabel = new Property("title_label", "text", "Title label");
        propertyTitleLabel.callbackChangeValue = callbackChangeValueTitleLabel;        

        var propertyTitleColor = new Property("title_color", "color", "Title color");
        propertyTitleColor.callbackChangeValue = callbackChangeValueTitleColor;        

        var propertyDraggable = new Property("draggable", PROPERTY_TYPE_CHECKBOX, "Draggable");
        propertyDraggable.callbackChangeValue = callbackChangeValueDraggable;        

        var propertyImage = new Property("file_name", "select", "Image", " ");
        propertyImage.callbackChangeValue = callbackChangeValueFileName;        
        propertyImage.inputClass = "select_styled3";
        propertyImage.setOptionOfSelect(this.listOfImages);                
        var listImage = this.listOfImages.slice();
        listImage.push("");    
        propertyImage.setOptionOfSelect(listImage);        
        propertyImage.showButtonDialog = true;
        propertyImage.callbackButtonDialog = function(property) { 
            if (activeElement.elementSelected) {
                resourcesUpload[0].setFocusedElement(activeElement.elementSelected.dataset.designFileName);
            } 
            openResourcesDialog(RESOURCES_TYPE_IMAGES);
            resourcesUpload[0].setButtonAndCallback("Set this image", function() { 
                callbackChangeValueAreaImage(property, resourcesUpload[0].getFocusedElement().val());
                $( "#dialog_resources" ).dialog( "close" ); 
            });           
        };          
        

        var propertyBackgroundImage = new Property("background_image", "select", "Background image", "");
        propertyBackgroundImage.callbackChangeValue = callbackChangeValueBackgroundImage;        
        propertyBackgroundImage.inputClass = "select_styled3";    
        var list = this.listOfImages.slice();
        list.push("");    
        propertyBackgroundImage.setOptionOfSelect(list);
        
        propertyBackgroundImage.showButtonDialog = true;
        propertyBackgroundImage.callbackButtonDialog = function(property) { 
            if (activeElement.elementSelected) {
                resourcesUpload[0].setFocusedElement(activeElement.elementSelected.dataset.designBackgroundImage);
            } 
            openResourcesDialog(RESOURCES_TYPE_IMAGES);
            resourcesUpload[0].setButtonAndCallback("Set this image", function() { 
                callbackChangeValueAreaImage(property, resourcesUpload[0].getFocusedElement().val());
                $( "#dialog_resources" ).dialog( "close" ); 
            });           
        };          

        var propertyAreaImage = new Property("area_image", "select", "Area image"," ");
        propertyAreaImage.callbackChangeValue = callbackChangeValueAreaImage;        
        propertyAreaImage.inputClass = "select_styled3";    
        var listArea = this.listOfImages.slice();
        listArea.push("");    
        propertyAreaImage.setOptionOfSelect(listArea);
        
        propertyAreaImage.showButtonDialog = true;
        propertyAreaImage.callbackButtonDialog = function(property) { 
            if (activeElement.elementSelected) {
                resourcesUpload[0].setFocusedElement(activeElement.elementSelected.dataset.designAreaImage);
            } 
            openResourcesDialog(RESOURCES_TYPE_IMAGES);
            resourcesUpload[0].setButtonAndCallback("Set this image", function() { 
                callbackChangeValueAreaImage(property, resourcesUpload[0].getFocusedElement().val());
                $( "#dialog_resources" ).dialog( "close" ); 
            });           
        };  
        
        var propertyProportionalImage = new Property("propertional_image", PROPERTY_TYPE_CHECKBOX, "Proportional",' <input type="image" src="'+pathSystem+'/media/img/prop_back_to_normal_size_btn.png" onclick="callbackBackToNormalSize()" />');
        propertyProportionalImage.callbackChangeValue = callbackChangeValueProportionalImage;        

        var propertyZoom = new Property("zoom", "select", "Zoom");
        propertyZoom.setNumeric(true,false);
        var zoomOptions = new Array();
        for(var i=0; i < 20; i++) {
            zoomOptions.push(i);
        }
        propertyZoom.setOptionOfSelect(zoomOptions,true);
        propertyZoom.callbackChangeValue = callbackChangeValueZoom;        

        var propertyDeleteElement = new Property("delete_element", "image", "");
        propertyDeleteElement.srcImg = pathSystem+"/media/img/prop_delete_element.png";
        propertyDeleteElement.setTemplate(270,0);
        propertyDeleteElement.styleRight = ""        
        propertyDeleteElement.addAction(PROPERTY_ACTION_CLICK, callbackPropertyDeleteElement);

        this.removeAllChildren();
        //this.addChild(propertyTypeText);
        actions.showActions(false);
        
        //$("#swipegroups").css("display","none");
        //$("#properties").css("display","block");

        switch(type) {
            case ELEMENT_TYPE_BUTTON:
                this.addChild(propertyDeleteElement);
                this.addChild(propertyName);
                this.addChild(propertyText);                
                //this.addChild(propertyTitleLabel);
                this.addChild(propertyBackgroundImage);
                this.addChild(propertyXPos);
                this.addChild(propertyYPos);
                this.addChild(propertyWidth);
                this.addChild(propertyHeight);                                                
                this.addChild(propertyFontType);
                this.addChild(propertyFontSize);
                this.addChild(propertyTextColor);
                //this.addChild(propertyTitleColor);                
                this.addChild(propertyVisible);
                actions.showActions(true);
                break;
            case ELEMENT_TYPE_TEXT:          
                this.addChild(propertyDeleteElement);
                this.addChild(propertyName);
                this.addChild(propertyText);
                this.addChild(propertyXPos);
                this.addChild(propertyYPos);
                this.addChild(propertyWidth);
                this.addChild(propertyHeight);                                                
                this.addChild(propertyFontType);
                this.addChild(propertyFontSize);
                this.addChild(propertyTextColor);
                this.addChild(propertyVisible);
                actions.showActions(false);
                break;
            case ELEMENT_TYPE_TEXTEDIT:          
                this.addChild(propertyDeleteElement);
                this.addChild(propertyName);
                this.addChild(propertyText);                
                //this.addChild(propertySingleText);
                this.addChild(propertyXPos);
                this.addChild(propertyYPos);
                this.addChild(propertyWidth);
                this.addChild(propertyHeight);                                
                this.addChild(propertyFontType);
                this.addChild(propertyFontSize);
                this.addChild(propertyTextColor);
                this.addChild(propertyVisible);
                actions.showActions(false);
                break;

            case ELEMENT_TYPE_IMAGE:
                this.addChild(propertyDeleteElement);  
                this.addChild(propertyName);                            
                this.addChild(propertyImage);
                this.addChild(propertyXPos);
                this.addChild(propertyYPos);
                this.addChild(propertyWidth);
                this.addChild(propertyHeight);                  
                this.addChild(propertyVisible);
                actions.showActions(false);
                break;
            case ELEMENT_TYPE_HTML:
                this.addChild(propertyDeleteElement);               
                this.addChild(propertyHtmlContent);
                this.addChild(propertyXPos);
                this.addChild(propertyYPos);
                this.addChild(propertyName);
                this.addChild(propertyVisible);
                actions.showActions(false);
                break;
            case ELEMENT_TYPE_MAP:
                this.addChild(propertyDeleteElement);            
                this.addChild(propertyZoom);
                this.addChild(propertyXPos);
                this.addChild(propertyYPos);
                this.addChild(propertyWidth);
                this.addChild(propertyHeight);
                this.addChild(propertyName);
                this.addChild(propertyVisible);
                actions.showActions(false);
                break;                
            case ELEMENT_TYPE_CLICKABLE_AREA:
                this.addChild(propertyDeleteElement);            
                this.addChild(propertyName);        
                this.addChild(propertyAreaImage);
                this.addChild(propertyProportionalImage);
                this.addChild(propertyXPos);
                this.addChild(propertyYPos);
                this.addChild(propertyWidth);
                this.addChild(propertyHeight);                
                this.addChild(propertyVisible);
                actions.showActions(true);
                break;                
            default:
                break;
        }        
    }

    var returnCheckbox = function(value, inputCheckboxId) {
        var val = parseInt(value);
        var objProperty = document.getElementById(inputCheckboxId);
        if(!isNaN(val) && objProperty) {
            objProperty.checked = (val) ? true : false;
        }
    }

    this.setInputValues = function(element) {
        if(!element) {
            return;
        }
        // elements on canvas
        if (element.dataset) {
            this.setForType(element.dataset.designType, element);
    
            $('#x_pos').val(parseInt(element.dataset.designXPos).toFixed(0));
            
            
            $('#y_pos').val(parseInt(element.dataset.designYPos).toFixed(0));
            $('#width').val(parseInt(element.dataset.designWidth).toFixed(0));
            $('#height').val(parseInt(element.dataset.designHeight).toFixed(0));
            $('#name').val(element.dataset.designName);
            
            returnCheckbox(element.dataset.designVisible, "visible");        
    
            $('#font_size').val(element.dataset.designFontSize);
            $('#font_type').val(element.dataset.designFontType);
    
            $('#title_label').val(element.dataset.designTitleLabel);
            $('#file_name').val(element.dataset.designFileName);
            $('#background_image').val(element.dataset.designBackgroundImage);
            $('#area_image').val(element.dataset.designAreaImage);
    
            returnCheckbox(element.dataset.designProportionalImage, "propertional_image");                
            returnCheckbox(element.dataset.designDraggable, "draggable");
    
            var _text = Convert.br2nl(specialCharsToHtml(element.dataset.designText));
            $('#_text').val(_text);
    
            var html_content = Convert.br2nl(specialCharsToHtml(element.dataset.designHtmlContent));
            $('#html_content').val(html_content);
            
            $('#zoom').val(element.dataset.designZoom);
                                    
            if(element.dataset.designTextColor || element.dataset.designTitleColor) {
                var colorHex = "#000000";
                text_color_hex = colorHex;
                
                try {
                    if(element.dataset.designTextColor) {
                        colorHex = (new Color).myRgbToHex(element.dataset.designTextColor);
                    } else if(element.dataset.designTitleColor) {
                        colorHex = (new Color).myRgbToHex(element.dataset.designTitleColor);
                    }
                    text_color_hex = colorHex;
                } catch(e) {}
                
                $.fn.jPicker.defaults.images.clientPath = pathSystem+'/media/js/jpicker/images/';
                var pickers = new Array("#text_color", "#title_color");
                var titlePickers = new Array("Text color:", "Title color:");
                for(var i = 0; i < pickers.length; i++) {
                    $(pickers[i]).jPicker({
                        window : {
                            expandable : true,
                            title : titlePickers[i]
                        },
                        color : {
                            active : new $.jPicker.Color({
                                ahex : colorHex + 'ff'
                            })
                        }
                    }, function(color, context) {
                        var all = color.val('all');
                        text_color_hex = all.hex;     
                        if(element.dataset.designTextColor) {               
                            callbackChangeValueTextColor();
                        }
                        if(element.dataset.designTitleColor) {               
                            callbackChangeValueTitleColor();
                        }
                    });
                }
            }            
        }       
    }
}

////////////////////
// PROPERTY

var PROPERTY_ACTION_CLICK = "click";
var PROPERTY_TYPE_TITLE = "title";
var PROPERTY_TYPE_TEXT = "text";
var PROPERTY_TYPE_BUTTON = "button";
var PROPERTY_TYPE_IMAGE = "image";
var PROPERTY_TYPE_SELECT = "select";
var PROPERTY_TYPE_CHECKBOX = "checkbox";
var PROPERTY_TYPE_RADIO = "radio";
var PROPERTY_TYPE_TEXTAREA = "textarea";
var PROPERTY_TYPE_FILE = "file";
var PROPERTY_TYPE_SUBMIT = "submit";
var PROPERTY_TYPE_HIDDEN = "hidden";
var PROPERTY_TYPE_RESET = "reset";

function Property(id, _type, prefix, suffix) {
    var that = this;
    this.id = id;
    this.type = _type;
    this.name = id;
    this.actions = new Array();
    this.optionsOfSelect = new Array();
    var className = "menu_property";
    this.callbackChangeValue;
    this.optionsChangeValue = { value:0, selectIndex:0 }
    this.callbackButtonDialog;
    this.styleRight = "";
    this.selectSize = 1;
    this.showButtonDialog = false;
    this.srcImg = "";
    this.srcAddBtn = pathSystem+"/media/img/property_add.png";
    this.inputClass = "";
    this.acceptFile = "*/*";
    var tempOldValue = null;
    this.oldValue = null;
    var template; 
    var imgTooltipPath;
    var imgTooltipTitle;
    
    this.setClassName = function(_className) {
        className = _className;
        if (className == "menu_property") {    
            if (this.type == PROPERTY_TYPE_SELECT) {
                this.inputClass = "select_styled";
            } else if (this.type == PROPERTY_TYPE_TEXT) {
                this.inputClass = "input_text_styled";
                //this.inputClass = "select_styled3";
            } else if (this.type == PROPERTY_TYPE_TEXTAREA) {
                this.inputClass = "textarea_styled";
            }
        } else if (className == "action_property") {   
            if (this.type == PROPERTY_TYPE_SELECT) {
                //this.inputClass = "select_styled";
                this.inputClass = "select_styled3";
            } else if (this.type == PROPERTY_TYPE_TEXT) {
                this.inputClass = "input_text_styled";            
            } 
        } else if (className == "app_property") {    
            if (this.type == PROPERTY_TYPE_SELECT) {
                this.inputClass = "select_styled";
            } else if (this.type == PROPERTY_TYPE_TEXT) {
                this.inputClass = "input_text_styled";
                //this.inputClass = "select_styled3";
            } 
        } else  if (className == "conversation_property") {    
            if (this.type == PROPERTY_TYPE_SELECT) {
                this.inputClass = "select_styled_gray";
            } else if (this.type == PROPERTY_TYPE_TEXT) {
                this.inputClass = "input_text_gray";
            } else if (this.type == PROPERTY_TYPE_CHECKBOX) {
                this.inputClass = "gray";
            }  else if (this.type == PROPERTY_TYPE_TEXTAREA) {
                this.inputClass = "textarea_styled2";
            }
        } else if (className == "conversation_action_property") {    
            if (this.type == PROPERTY_TYPE_SELECT) {
                this.inputClass = "select_styled_gray";
            } else if (this.type == PROPERTY_TYPE_TEXT) {
                this.inputClass = "input_text_gray";
            } else if (this.type == PROPERTY_TYPE_CHECKBOX) {
                this.inputClass = "textarea_styled2";
            }
        }  else if (className == "cropped_property") {    
            if (this.type == PROPERTY_TYPE_SELECT) {
                this.inputClass = "select_styled_gray";
            } else if (this.type == PROPERTY_TYPE_TEXT) {
                this.inputClass = "input_text_gray";
            } else if (this.type == PROPERTY_TYPE_CHECKBOX) {
                this.inputClass = "gray";
            } else if (this.type == PROPERTY_TYPE_RADIO) {
                this.inputClass = "gray";
            }
        }  else if (className == "editor_code_property") {    
            if (this.type == PROPERTY_TYPE_SELECT) {
                this.inputClass = "select_styled_gray";
            } else if (this.type == PROPERTY_TYPE_TEXT) {
                this.inputClass = "input_text_gray";
            } else if (this.type == PROPERTY_TYPE_CHECKBOX) {
                this.inputClass = "gray";
            } else if (this.type == PROPERTY_TYPE_RADIO) {
                this.inputClass = "gray";
            }
        }            
    }
    this.setClassName(className);
    
  
    if(prefix || prefix == "") {
        this.prefixHTML = prefix;
    } else {
        this.prefixHTML = id + ": ";
    }
    if(suffix || suffix == "") {
        this.suffixHTML = suffix;
    } else {
        this.suffixHTML = "<br/>";
    }
    this.value = "";
    this.isNumeric = false;
    this.numericNegative = true;
    this.floatTemplate = "";
    
    this.setTemplate =function(widthAll,widthLeft, parentStyle) {
        if (!parentStyle) {
            parentStyle = "";
        }
        template = "<div style='width:"+widthAll+"px;"+parentStyle+"'><div id='"+that.id+"_prefix' style='float:left;width:"+widthLeft+"px;margin-top:7px;'>$PREFIX$</div><div style='float:right;width:"+(widthAll-widthLeft)+"px;'>$HTML$$SUFFIX$$OPEN_DIALOG$ <div style='float: right;margin-top:11px;'>$ICON_TOOLTIP$</div></div><div style='clear:both;'></div></div>";
    }
    this.setTemplate(390,105);

    this.setCheckbox = function(isChecked) {
        if (isChecked && this.type == PROPERTY_TYPE_CHECKBOX) {
            $("#"+this.id)[0].checked = (isChecked) ? true : false;
        }
        if (this.type == PROPERTY_TYPE_RADIO) {
            $("#"+this.id).prop("checked", isChecked)
        }
        
    }
    // return 1(true) or 0(false)
    this.getChecked = function() {
       if (this.type == PROPERTY_TYPE_CHECKBOX || this.type == PROPERTY_TYPE_RADIO) {
            return ($("#"+this.id).is(':checked'))?1:0;
        }   
        return undefined;             
    }
    
    this.getElement = function() {
        var property = document.createElement('li');
        property.setAttribute("class", className);
        property.id = this.id+"_parent";               
        
        var html = "";
        var styleTagLi = "";
        if(this.type == PROPERTY_TYPE_SELECT) {
            html += '<div class="'+this.inputClass+'"><select id="' + this.id + '" name="'+this.name+'" size="'+this.selectSize+'" style="'+this.styleRight+'" >';
            for(var i = 0; i < this.optionsOfSelect.length; i++) {
                html += '<option value="' + this.optionsOfSelect[i] + '">' + this.optionsOfSelect[i] + '</option>';
            }
            html += '</select></div>';
        } else if(this.type == PROPERTY_TYPE_CHECKBOX) {
            html += '<input id="' + this.id + '" name="'+this.name+'" class="'+this.inputClass+'" type="' + this.type + '" value="' + this.value + '"  style="'+this.styleRight+'"><label for="' + this.id + '"></label>';
        } else if(this.type == PROPERTY_TYPE_RADIO) {
            html += '<input id="' + this.id + '" name="'+this.name+'" class="'+this.inputClass+'" type="' + this.type + '" value="' + this.value + '"  style="'+this.styleRight+'"><label for="' + this.id + '"></label>';
        } else if(this.type == PROPERTY_TYPE_TEXTAREA) {
            property.style.height = "80px";
            property.style.backgroundPosition = "0px 70px";
            //styleTagLi = "margin-";
            
            html += '<textarea id="' + this.id + '" name="'+this.name+'" class="'+this.inputClass+'" style="'+this.styleRight+'"></textarea><br />';
        } else if(this.type == "color") {
            html += '<span id="' + this.id + '"></span>';
        } else /*if(this.type == "file") {
            property.style.height = "90px";
            property.style.backgroundPosition = "0px 88px";
            html += contentUpload(this.id);
        } else*/if(this.type == PROPERTY_TYPE_TITLE) {
            html += '<span id="'+ this.id +'">'+this.value+'</span>';
        } else if(this.type == PROPERTY_TYPE_TEXT) {
            html += '<input id="' + this.id + '" type="' + this.type + '" name="'+this.name+'" class="'+this.inputClass+'" style="'+this.styleRight+'" value="' + this.value + '">';
        } else if(this.type == PROPERTY_TYPE_BUTTON) {
            html += '<input id="' + this.id + '" type="' + this.type + '" name="'+this.name+'" class="'+this.inputClass+'" style="'+this.styleRight+'" value="' + this.value + '">';
        } else if(this.type == PROPERTY_TYPE_IMAGE) {
            html += '<input id="' + this.id + '" type="' + this.type + '" name="'+this.name+'" src="'+this.srcImg+'" class="'+this.inputClass+'" style="'+this.styleRight+'" >';
        } else if(this.type == PROPERTY_TYPE_FILE) {
            html += '<input id="' + this.id + '" type="' + this.type + '" name="'+this.name+'" accept="'+this.acceptFile+'" class="'+this.inputClass+'" style="'+this.styleRight+'" >';
        } else if(this.type == PROPERTY_TYPE_SUBMIT) {
            html += '<input id="' + this.id + '" type="' + this.type + '" name="'+this.name+'" class="'+this.inputClass+'" style="'+this.styleRight+'" value="' + this.value + '">';
        } else if(this.type == PROPERTY_TYPE_HIDDEN) {
            html += '<input id="' + this.id + '" type="' + this.type + '" name="'+this.name+'" class="'+this.inputClass+'" style="'+this.styleRight+'" value="' + this.value + '">';
        } else if(this.type == PROPERTY_TYPE_RESET) {
            html += '<input id="' + this.id + '" type="' + this.type + '" name="'+this.name+'" class="'+this.inputClass+'" style="'+this.styleRight+'" value="' + this.value + '">';
        }
        
        var imgHtml = "";
        if (imgTooltipPath && imgTooltipTitle) {
            imgHtml = '<img id="'+this.id+'_img_tooltip" src="'+imgTooltipPath+'" title="'+imgTooltipTitle+'" style="cursor: help;" >';
        }
        var buttonDlgHtml = "";
        if (this.showButtonDialog) {
            buttonDlgHtml = '<input id="'+this.id+'_button_dlg" type="image" src="'+this.srcAddBtn+'" style="margin-left: 8px; margin-bottom: 2px;">';
        }

        var templateSet =  template;
        templateSet = templateSet.replace("$PREFIX$",this.prefixHTML);
        templateSet = templateSet.replace("$HTML$",html);
        templateSet = templateSet.replace("$SUFFIX$",this.suffixHTML);
        templateSet = templateSet.replace("$OPEN_DIALOG$",buttonDlgHtml);
        templateSet = templateSet.replace("$ICON_TOOLTIP$",imgHtml);
        
        property.innerHTML = templateSet;//this.prefixHTML + html + this.suffixHTML;
        
        this.setIconTooltip();
        
        return property;
    }

    this.addAction = function(action, callback) {
        var actionObj = new Object();
        actionObj.action = action;
        actionObj.callback = callback;
        this.actions.push(actionObj);
    }

    this.setValue = function(value) {
        $("#"+this.id).val(value);
    }
    
    this.backToOldValue = function() {        
        $("#"+this.id).val(that.oldValue);
    }    
    
    this.setOldValue = function(value) {
        tempOldValue = value;
        that.oldValue = value;
        $("#"+this.id).val(value);
    }        

    this.setNumeric = function(numeric,numericNegative) {
        this.isNumeric = numeric;
        this.numericNegative = numericNegative;
    }

    this.addOptionOfSelect = function(optionValue,notSort) {
        this.optionsOfSelect.push(optionValue);
        if (!notSort) {
            this.optionsOfSelect.sort();
        }
    }
    
    this.setOptionOfSelect = function(arrayList,notSort) {
        this.optionsOfSelect = arrayList;
        if (!notSort) {
            this.optionsOfSelect.sort();
        }
        
        var $parentSelect = $("#"+that.id);
        if ($parentSelect) {
            var html = "";
            for(var i = 0; i < that.optionsOfSelect.length; i++) {
                html += '<option value="' + this.optionsOfSelect[i] + '">' + this.optionsOfSelect[i] + '</option>';
            }     
            $parentSelect.html(html);       
        }
    }
            
    this.setIconTooltip = function(pathToImg, title) {
       imgTooltipPath = pathToImg;
       imgTooltipTitle = title;
    }
    
    /* this.setTooltip = function() {
        $( "#"+this.id ).tooltip({
            items: "li",
        content: function() {
           var element = $( this );
            if ( element.is( "[data-geo]" ) ) {
                var text = element.text();
                return "<img class='map' alt='" + text +
                       "' src='http://maps.google.com/maps/api/staticmap?" +
                       "zoom=11&size=350x350&maptype=terrain&sensor=false&center=" +text + "'>";
            }
           return '<img src="'+pathSystem+'/media/img/ipad_landscape.png" />';
        if ( element.is( "[title]" ) ) {
        return element.attr( "title" );
        }
        if ( element.is( "img" ) ) {
        return element.attr( "alt" );
        }
        }
        });
    }*/

    this.refreshActions = function() {        
        for(var i = 0; i < this.actions.length; i++) {
            var actionObj = this.actions[i];
            if(actionObj && actionObj.action && actionObj.callback) {
                switch(actionObj.action) {
                    case PROPERTY_ACTION_CLICK:
                        $("#" + this.id).click(function() {
                            var isFind = false;
                            EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}

                            actionObj.callback(that);
                        });
                        break;
                    default:
                        break;
                }
            }
        }

        if(this.isNumeric) {
            $("#" + this.id).numeric({
                decimal : false,
                negative : that.numericNegative
            }, function() {                
                //console.log("Positive integers only");
                //this.value = "";
                //this.focus();
            });
        } else {
            $("#" + this.id).removeNumeric();
        }

   
        /*$("#" + this.id).click(function() {
            var isFind = false;
            EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) return;
        });*/
                                    
               
        $("#" + this.id).change(function() {
            
            var isFind = false;
            EventsNotification.exe(SequencesSystemEvents.EVENT_CHANGE_PROPERTY, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); 
            EventsNotification.exe(SequencesSystemEvents.EVENT_CHANGE_BOARD, {text: $(this).val()}, function(r){ if (r) isFind = true;}); 
            if (!isFind) {that.backToOldValue();Messages.tutorialWrong(); Messages.tutorialWrong();return;}


            that.oldValue = tempOldValue;            
            var newValue = $("#"+this.id).val();
            tempOldValue = newValue;    
            
            if (that.oldValue == null) {
                that.oldValue = newValue;
            }

            if(that.callbackChangeValue) {                
                if (that.type != "checkbox") {                                 
                    var index = that.optionsOfSelect.indexOf(newValue);
                    if (index > -1) {
                        that.optionsChangeValue.selectIndex = index;    
                    }                
                    that.optionsChangeValue.value = newValue;
                } else {
                    newValue = that.getChecked();
                }
                // callback    
                that.callbackChangeValue(that,newValue);
            }
        });
        $("#upload_result_" + this.id).fadeOut(5000, function() {
            uploadSuccess = -1;
        });
        $("#"+this.id+"_img_tooltip").tooltip({
              position: {
                my: "center bottom-20",
                at: "center top",
                using: function( position, feedback ) {
                  $( this ).css( position );
                  $( "<div>" )
                    .addClass( "arrow" )
                    .addClass( feedback.vertical )
                    .addClass( feedback.horizontal )
                    .appendTo( this );
                }
             }
         });
        $("#"+this.id+"_button_dlg").click(function() {
            var isFind = false;
            EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}                
                        
            if (typeof that.callbackButtonDialog === "function") {
                that.callbackButtonDialog(that);
            }
        });          
    }
}
