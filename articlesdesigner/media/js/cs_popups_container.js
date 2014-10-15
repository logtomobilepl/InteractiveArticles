////////////////////
// POPUPS
// 

function PopupsContainer() {
    var that = this;    
    var popups = new Array();
    this.idDialog = "dialog_popups";     
    this.idShowDialogOpen = "dialog_popups_open"
         
    this.idPopupsAdd = "popups_add"; 
    this.idPopupsList = "popups_list"; 
    this.idPopupsEdit = "popups_edit"; 
    this.idPopupsPreview = "popups_preview";
    
    var qParentPopupsList= $("#"+this.idPopupsList);
    var qParentPopupsEdit = $("#"+this.idPopupsEdit);
    var selectedPopup;      
	var callbackButtonOK;
	var callbackButtonOKData;
		
    $( "#"+this.idDialog ).dialog({
        autoOpen: false,
        modal: true,
        width: 750,
        height: 650,
        resizable: false,
        title: '<img src="'+pathSystem+'/media/img/popups_title_icon.png" style="vertical-align:top;margin-top:6px;" /> <span class="title">POPUPS</span>',		
        buttons: {
            Save: function() { 
				if (typeof callbackButtonOK === "function") {
					callbackButtonOK(callbackButtonOKData);
				}
                $( this ).dialog( "close" );
            },
        },
        close: function( event, ui ) {
            selectElement(activeElement.elementSelected);
        },   
        open: function(event, ui) {
            $('.ui-dialog-buttonpane')
            .find('button:contains("Save")')
            .removeClass('ui-button-text-only')
            .css('border',"0px")
            .css('background-color',"transparent")
            .html('<div class="dialog_img_save"></div>');            
        },  		
    }); 
    
    var options = { id_actions: "popups_actions", 
                           id_actions_header: "popups_actions_header",
                           id_actions_tree: "popups_actions_tree",
                           id_actions_tree_option_prefix: "popups_tree_option",
                           id_actions_tree_element_: "popups_actions_tree_element_delete",
                           id_actions_parameters: "popups_actions_parameters",
                           id_actions_available: "popups_actions_available",
                           list_actions_available: new Array(ACTIONS_ONCLICK,
                            ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML, 
                            ACTIONS_SHOW_TPOPUP, ACTIONS_ITEM_SHOW_TPOPUP,
                            ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,
                            ACTIONS_TAKE_ITEM),                        
                          }
             
    var callbackPopupsChangeActions = function(myActions, json) {   
        if (selectedPopup && !myActions.globalAreAnyParametersEmpty()) {            
            console.log(json);
            selectedPopup.onclick = json;
            that.editPopupInBase(selectedPopup); 
        }
    }                 
                          				  						
    /*var popupActions = new Actions(options);	
    var onclickRoot = popupActions.getOnclick();
    onclickRoot.stringName = "BUTTONS"
    var onclickRootActions = new Array(ACTIONS_ITEM_SHOW_TPOPUP);
    onclickRoot.displayActions = onclickRootActions;
    onclickRoot.clickableActions = onclickRootActions;
    onclickRoot.enabledActions = onclickRootActions;
    
    popupActions.isAbsoluteParameters = false;
	popupActions.colorTree = "000";
	popupActions.propertyLiClass = "conversation_action_property";
    popupActions.callbackChangeActions = callbackPopupsChangeActions;
    popupActions.showActions(true);
    popupActions.showActionsAvailable(true);
    //popupActions.refresh();
    $("#"+options.id_actions).corner();
    $("#"+options.id_actions_parameters).corner();  
    */   
   	
    var tooltipActions = ' <img src="'+pathSystem+'/media/img/icon_question.png" title="....." style="cursor: help;vertical-align:bottom;margin-left:180px;" >';
    $("#"+options.id_actions_header+" p").append(tooltipActions);
      
    this.popupsListName = function() {
        return arrayFromArrayParam(popups,"name"); 
    }      
	
    this.popupForName = function(name) {
        return objectFromParamAndValue(popups, "name", name);
    }    	
	
    this.popupNameForId = function(id) {
        return paramFromParamAndValue(popups, "name", "id", id);
    }     
    this.popupIdForName = function(name) {
        return paramFromParamAndValue(popups, "id", "name", name);
    }   	
    
    $("#"+this.idPopupsAdd).click(function() {
        var tempName = autonumerateForArrayWithString(that.popupsListName(),"popup").name;
        selectedPopup = that.addPopup(false, undefined, tempName, "", "", "");  
        that.refresh();    
    });
    
    $("#"+this.idShowDialogOpen).click(function() {
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}

        that.showDialog(); 
    });
	
	this.setCallbackButtonOK = function(callback, data) {
		if (typeof callback === "function") {
			callbackButtonOK = callback;
		}
		if (data) {
			callbackButtonOKData = data;
		}
	}	
	
	this.setFocusForName = function(name) {
		 if (name) {
			selectedPopup = objectFromParamAndValue(popups, "name", name);
			that.refresh();
		 }
	}
    
	this.getFocus = function() {
		if (selectedPopup) {
			return selectedPopup.name;
		 }
	}		
        
    this.refresh = function() {
        // general
        qParentPopupsList[0].innerHTML = '<p class="dialog_section_title">Popups list</p>';
        qParentPopupsEdit[0].innerHTML = '<p class="dialog_section_title">Edit Popup</p>';

        // list
        for (var i=0; i < popups.length; i++) {
            var name = popups[i].name;
            var className = "";
            if (selectedPopup && selectedPopup.name == name) {
                className = "selected"
            }
            var li = document.createElement("li");
            li.className = className;
            li.id = "popups_id_list_item"+i;
            var p = document.createElement("p");
            p.innerHTML = name;
            li.appendChild(p);
            qParentPopupsList.append(li);
            $("#"+li.id).click(function() {
                 var pName = $(this).first();
                 var value = pName.text();
                 if (value) {
                    selectedPopup = objectFromParamAndValue(popups, "name", value);
                    that.refresh();
                 }
            });            
        }   			      

        if(selectedPopup) {
            // edit
            var imgIconTooltip = pathSystem+"/media/img/icon_question.png";
            
            var liClass = "conversation_property"; 
            var srcAddBtn = pathSystem+"/media/img/icon_sphere_green_add.png";             
            var imgIconTooltip = pathSystem+"/media/img/icon_question.png";
            var templateData = { widthAll: 370, leftWidth: 100 }            
			            
            var propertyName = new Property("popup_name_edit","text","Name: ","");
            propertyName.setClassName(liClass);			
            propertyName.setTemplate(templateData.widthAll,templateData.leftWidth);
            propertyName.setIconTooltip(imgIconTooltip,".....");
            var propertyTitle = new Property("popup_edit_title","text","Title: ","");
            propertyTitle.setClassName(liClass);			
            propertyTitle.setTemplate(templateData.widthAll,templateData.leftWidth);
            propertyTitle.setIconTooltip(imgIconTooltip,".....");
            var propertyDescription = new Property("popup_edit_description","textarea","Description: ","");
            propertyDescription.setClassName(liClass);			
            propertyDescription.setTemplate(templateData.widthAll,templateData.leftWidth);
			propertyDescription.styleRight = "width:240px;height:100px;";
            var propertyGoToBoard = new Property("popup_edit_action","select","Go to board: ","");
            propertyGoToBoard.setOptionOfSelect( arrayWithFirstEmptyElement(application.getScreenListByParam("name")) );
            propertyGoToBoard.setClassName(liClass);            
            propertyGoToBoard.setTemplate(templateData.widthAll,templateData.leftWidth);
            propertyGoToBoard.setIconTooltip(imgIconTooltip,"Set board name");			
            var propertyDelete = new Property("popup_edit_delete","image","");
            propertyDelete.setClassName(liClass);
            propertyDelete.srcImg = pathSystem+"/media/img/popups_delete.png";
            propertyDelete.setTemplate(templateData.widthAll,50);    
			                                   
            qParentPopupsEdit[0].appendChild(propertyName.getElement());
            //qParentPopupsEdit[0].appendChild(propertyTitle.getElement());
            qParentPopupsEdit[0].appendChild(propertyDescription.getElement("auto"));
            qParentPopupsEdit[0].appendChild(propertyGoToBoard.getElement());
            qParentPopupsEdit[0].appendChild(propertyDelete.getElement());
            qParentPopupsEdit.append("<p class=\"horiz_line\"></p>"); 
            
            propertyName.setValue(selectedPopup.name);
            propertyTitle.setValue(selectedPopup.title);
            propertyDescription.setValue(Convert.br2nl(specialCharsToHtml(selectedPopup.description)));
            propertyGoToBoard.setValue(selectedPopup.onclick);

            propertyName.callbackChangeValue = this.callbackChangePopup;
            propertyTitle.callbackChangeValue = this.callbackChangePopup;
            propertyDescription.callbackChangeValue = this.callbackChangePopup;                       
            propertyGoToBoard.callbackChangeValue = this.callbackChangePopup;                       
            propertyDelete.addAction(PROPERTY_ACTION_CLICK, this.callbackDeletePopup);

            propertyName.refreshActions();        
            propertyTitle.refreshActions();        
            propertyDescription.refreshActions();                    
            propertyGoToBoard.refreshActions();                    
            propertyDelete.refreshActions();
                                          
            // actions
            //popupActions.setByJSON(selectedPopup.onclick);
            //popupActions.showActions(true);
            
            $("#"+this.idParentUl).css("display","block");
            $("#"+this.idAddDialog).css("display","block"); 
            
        } else {
            //popupActions.showActions(false);
            $("#"+this.idParentUl).css("display","none");
            $("#"+this.idAddDialog).css("display","none"); 
        }
    }    

    this.showDialog = function() {
        this.refresh();
        $( "#"+this.idDialog ).dialog("open");
    }
	
    this.addPopup = function(loaded, id, name, title, description, onclick) {
        var objPopup = {
            id: id,
            name: name,
            title: title,
            description: Convert.br2nl(specialCharsToHtml(description)),
            onclick: specialCharsToHtml(onclick),
        }     
        popups.push(objPopup);     
        if (!loaded) {
            this.addPopupToBase(objPopup);
        }      
        return objPopup;
    }    
    
    this.unselectPopup = function() {
        selectedPopup = undefined;
        this.refresh();
    }        
     
    this.callbackChangePopup = function(propertyObj,value) {
		if (selectedPopup) {
			if (propertyObj.id == "popup_name_edit") { 
				if (isExistStringInArray(value, that.popupsListName()) == false) {
				    selectedPopup.prevName = selectedPopup.name;
					selectedPopup.name = value;
					that.editPopupInBase(selectedPopup); 
				} else {
					messageDialog.show("Popups","Duplicate name!");
				}
			} else if (propertyObj.id == "popup_edit_title") {
                selectedPopup.title = value;
                that.editPopupInBase(selectedPopup);
            } else if (propertyObj.id == "popup_edit_description") {
                selectedPopup.description = value;
                that.editPopupInBase(selectedPopup);
            } else if (propertyObj.id == "popup_edit_action") {
                selectedPopup.onclick = value;
                that.editPopupInBase(selectedPopup);
            }
        }    
    }    
    
    this.removePopup = function() {
        that.removePopupFromBase(selectedPopup); 
    }   
    
    this.callbackDeletePopup = function() {
        var message1 = ''+globalChange.stringSystemIsAlreadyUsed()+' Are you sure you want to remove?';;
        var message2 = 'Are you sure you want to remove?'
                          
        if (globalChange.isExistsForName(selectedPopup.name, DELETED_ELEMENT_POPUP)) {
            message = message1
        } else {
            message = message2;
        }        
        messageDialog.showWithTwoButtons('<img src="'+pathSystem+'/media/img/popups_title_icon.png" style="vertical-align:top;margin-top:6px;" /> Popups', message,"Remove","Cancel",that.removePopup);                       
    }
    
    this.addPopupToBase = function(element) {
        this.manageBase(element,"add_tpopup");
    }
    this.editPopupInBase = function(element) {
        this.manageBase(element,"edit_tpopup");        
    }
    this.removePopupFromBase = function(element) {
        this.manageBase(element,"remove_tpopup");        
    }

    this.manageBase = function(element,action) {
        element.action =  action;
        element.app_id =  appId;
		element.description = Convert.nl2br(element.description);
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: element,
            dataType: "text",
            success: function(resultData) {
                if (resultData) {
                    if (element.action == "add_tpopup") {
                       element.id = resultData;
                    } else if (element.action == "edit_tpopup") {     
                       globalChange.setCorrectForName(selectedPopup.prevName, EDIT_ELEMENT_POPUP, selectedPopup.name);                  
                       that.refresh();
                    } else if (element.action == "remove_tpopup") {
                        if (removeObjectFromObjectsArray(element, popups)) {
                            globalChange.setCorrectForName(element.name, DELETED_ELEMENT_POPUP);
                            that.refresh();            
                            that.unselectPopup();                                      
                        }                                              
                    }
                }
            }
        });       
    } 
    
    this.globalIsExistsForName = function(name, typeAction) {
        if (name) {
            for(var i=0; i < popups.length; i++) {
                var tempActions = new Actions();
                tempActions.setByJSON(popups[i].onclick, true);                
                if (tempActions.globalIsExistsForName(name, typeAction)) {
                    return true;
                }
            }
        }
        return false;
    }   
    
    this.globalSetCorrectForName = function(name, typeAction, newName) {
        if (name) {
            for(var i=0; i < popups.length; i++) {
                var isChange = false;
                var tempActions = new Actions();
                tempActions.setByJSON(popups[i].onclick, true);
                var json = tempActions.globalSetCorrectForName(name, typeAction, newName);      
                if (json) {
                    popups[i].onclick = json;
                    isChange = true;
                }                               
                if (isChange) {
                    this.editPopupInBase(popups[i]);
                }
            }
        }
    }    
    
}