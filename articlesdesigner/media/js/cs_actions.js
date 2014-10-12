////////////////////
// ACTIONS

var ACTIONS_ROOT = "root"
var ACTIONS_ONCLICK = "onclick"
var ACTIONS_ONDROP = "ondrop"
var ACTIONS_SHOW_ELEMENT = "show_element"
var ACTIONS_HIDE_ELEMENT = "hide_element"
var ACTIONS_RUN_XML = "run_xml"
var ACTIONS_GO_BACK = "go_back"
var ACTIONS_PLAY_MP3 = "playmp3"
var ACTIONS_STOP_MP3 = "stopmp3"
var ACTIONS_SHOW_IMAGE = "show_image"
var ACTIONS_SHOW_TPOPUP = "show_tpopup"
var ACTIONS_ITEM_SHOW_TPOPUP = "item_show_tpopup"
var ACTIONS_SHOW_POPOVER = "show_popover"
var ACTIONS_ITEM_SHOW_POPOVER = "item_show_popover"
var ACTIONS_SHOW_GALLERY = "show_gallery"
var ACTIONS_ITEM_SHOW_GALLERY = "item_show_gallery"
var ACTIONS_INITIATE_CONVERSATION = "initiate_conversation"
var ACTIONS_EXECUTE_FUNCTION = "execute_function"
var ACTIONS_TAKE_ITEM = "take_item"
var ACTIONS_DROP_ITEM = "drop_item"

var ActionParams = {
    SHOW_ELEMENT_NAME: "actions_show_element_name",
    HIDE_ELEMENT_NAME: "actions_hide_element_name",
    RUN_BOARD_NAME: "actions_run_board_name",
    PLAY_SOUND_NAME: "actions_play_sound_name",
    SHOW_IMAGE_NAME: "actions_show_image_name",
    SHOW_POPUP_NAME: "actions_show_popup_name",
    ITEM_SHOW_POPUP_TITLE: "actions_item_show_popup_title",
    INITIATE_CONVERSATION_NAME: "actions_initiate_conversation_name",    
}

var optionsActionsDefault = { id_actions: "temp_actions", 
					   id_actions_header: "temp_actions_header",
					   id_actions_tree: "temp_actions_tree",
					   id_actions_tree_option_prefix: "temp_actions_tree_option",
					   id_actions_tree_element_delete: "temp_actions_tree_element_delete",
					   id_actions_parameters: "temp_actions_parameters",
					   id_actions_available: "temp_actions_available",      
					   list_actions_available: new Array(ACTIONS_ONCLICK, //ACTIONS_ONDROP,
							//ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,
							ACTIONS_RUN_XML, 
							ACTIONS_SHOW_TPOPUP, 
							//ACTIONS_ITEM_SHOW_TPOPUP,
							ACTIONS_PLAY_MP3, ACTIONS_STOP_MP3
							//ACTIONS_SHOW_IMAGE,ACTIONS_INITIATE_CONVERSATION
							/*ACTIONS_TAKE_ITEM, ACTIONS_DROP_ITEM*/),         
					  }	

function Actions(options) {    
    if (!options) {
        options = optionsActionsDefault;
    }    
    this.idActions = options.id_actions;
    this.idActionsHeader = options.id_actions_header;
    this.idActionsTree = options.id_actions_tree;
    this.idActionsTreeOptionPrefix = options.id_actions_tree_option_prefix
    this.idActionsTreeElementDelete = options.id_actions_tree_element_delete;
    this.idActionsParameters = options.id_actions_parameters;
    this.idActionsAvailable = options.id_actions_available;
    var listActionsAvailable = options.list_actions_available;
    this.colorTree = "#ffffff";
    this.propertyLiClass = "menu_property";
    var timeMsAfterClickOption = 6000;
    var timeMsAfterLeaveOption = 300;
    
    var that = this;
    var uniqueId = 0;
    var nodeIdSelected;
    
    var tryAddNewAction = false;
    var lastAddedElement;
    var lastDeletedElement;
    var isAddNewAction;    
    var isDeleteAction;    
    this.isAbsoluteParameters = true;
    
    this.arrayIdParentsOfSelectedNode = new Array();    
    this.callbackChangeActions;
    
    //var dataTree = new Array();  //elements of Action for tree
    var dataRoot = ActionFactory(ACTIONS_ROOT);  //root for elements of Action
    dataRoot.uniqueId=uniqueId++;
    var onclick = undefined;
    var ondrop = undefined;
    if (isExistStringInArray(ACTIONS_ONCLICK, listActionsAvailable)) {
        onclick = ActionFactory(ACTIONS_ONCLICK, dataRoot);
        onclick.uniqueId = uniqueId++;
        dataRoot.addChild(onclick);
        if (!this.objectActionSelected) {
            this.objectActionSelected = onclick;
        }
    }
    if (isExistStringInArray(ACTIONS_ONDROP, listActionsAvailable)) {
        ondrop = ActionFactory(ACTIONS_ONDROP, dataRoot);    
        ondrop.uniqueId = uniqueId++;
        dataRoot.addChild(ondrop);
        if (!this.objectActionSelected) {
            this.objectActionSelected = ondrop;
        }
    }
    if (!this.objectActionSelected) {
        this.objectActionSelected = dataRoot;
    }  
    this.idActionSelected=0;  
    
    this.getOnclick = function() {
        return onclick;
    }
    this.getOndrop= function() {
        return ondrop;
    }
    
    this.showActions = function(visible) {
        $("#"+this.idActions).css("display",(visible)?"block":"none");
    }  
    this.showActions(false);
    
    this.showActionsAvailable = function(visible) {
        if (visible) {
            $("#"+this.idActionsAvailable).show("250");
        } else {
            $("#"+this.idActionsAvailable).hide("250");
        }        
        //$("#"+this.idActionsAvailable).css("display",(visible)?"block":"none");
        if (visible) {
            this.showActionsParameters(false);
        }
    }      
    this.showActionsAvailable(false);
	
    this.setListActionsAvailable = function(arrayList) {
        listActionsAvailable = arrayList;
        setActionAvailable();
    }
    
    this.getListActionsAvailable = function(arrayList) {
        return listActionsAvailable;
    }    
    this.isActionAvailable = function(typeAction) {
        return isExistStringInArray(typeAction, listActionsAvailable);
    }   	
    
    this.showActionsParameters = function(visible) {
        if (visible) {
            $("#"+this.idActionsParameters).show("120");
        } else {
            $("#"+this.idActionsParameters).hide("120");
        }
        //$("#"+this.idActionsParameters).css("display",(visible)?"block":"none");
        if (visible) {
            this.showActionsAvailable(false);
        }
    }  
    this.showActionsParameters(false);    
    
    this.setJSTree = function() {
        $("#"+this.idActionsTree).jstree( { "plugins" : ["themes","html_data", "crrm","ui"], // ,"ui"
            "core" : { /*"initially_open" : this.arrayIdParentsOfSelectedNode*/ }, 
            "themes" : { "theme" : "classic","icons" : false},
            "ui": { "select_limit" : 1, }
            // 1) if using the UI plugin bind to select_node
            }).bind("select_node.jstree", function (event, data) { 
                // `data.rslt.obj` is the jquery extended node that was clicked    
                
                nodeIdSelected = data.rslt.obj.attr("id");
                $.jstree._focused().select_node("#"+nodeIdSelected);                    

                /*alert("now");
                
                var nodeId = data.rslt.obj.attr("id");
                var obj = that.getActionObjectByNodeId(nodeId);
                console.log(nodeId);          
                console.log(obj);   

                that.objectActionSelected = obj;
                that.nodeIdSelected = nodeId;
                
                                              
                //that.idActionSelected = data.rslt.obj.attr("id");                     
                
                var ids = undefined;
                if (isDeleteAction) {
                    ids = data.inst.get_path('#' + that.idActionSelected,true);
                } else {
                    ids = data.inst.get_path('#' + data.rslt.obj.attr('id'),true);                 
                }  
                if (ids) {
                    that.arrayIdParentsOfSelectedNode = ids;
                }    

                tryAddNewAction = false;
                
                $("#"+that.idActionsTreeElementDelete).button().button(isDeleteEnabled);*/
            }).bind("loaded.jstree", function (event, data) {
                //$.jstree._focused().select_node("#"+that.idActionSelected);                                      
            }).delegate("a", "click", function (event, data) { event.preventDefault(); });                       
    }    
    
	this.setByObject = function(objActions,parent) { 
        for(var i=0; i < objActions.length; i++) {
            var objAct = objActions[i];
            if (!objAct.type) {
                return;
            }
            var actionElement = ActionFactory(objAct.type, parent);
            actionElement.uniqueId = uniqueId++;
            actionElement.container = this;
            actionElement.propertyLiClass = this.propertyLiClass;
            switch(objAct.type) {
                case ACTIONS_ONCLICK:
                    if (objAct.events) {       
                        this.setByObject(objAct.events,actionElement);
                    }                                          
                    break;
                case ACTIONS_ONDROP:
                    if (objAct.events) {       
                        this.setByObject(objAct.events,actionElement);
                    }
                    break;                
                case ACTIONS_SHOW_ELEMENT:
                case ACTIONS_HIDE_ELEMENT:
                    actionElement.name = objAct.name;
                    actionElement.key = objAct.key;
                    break;
                case ACTIONS_RUN_XML:
                    actionElement.name = objAct.name;
                    actionElement.key = objAct.key;
                    actionElement.animated = objAct.animated;
                    break;
                case ACTIONS_PLAY_MP3:
                    actionElement.name = objAct.name;
                    actionElement.key = objAct.key;
                    actionElement.loop = objAct.loop;
                    break;
                case ACTIONS_SHOW_IMAGE:
                    actionElement.pImage = objAct.image;
                    actionElement.key = objAct.key;
                    if (objAct.events) {    
                        this.setByObject(objAct.events,actionElement);
                    }                    
                    break;  
                case ACTIONS_SHOW_TPOPUP:
					actionElement.name = objAct.name;
                    actionElement.key = objAct.key;
                    //actionElement.title = objAct.title;
                    //actionElement.description = objAct.description;
                    //actionElement.x_pos = (objAct.x_pos)?objAct.x_pos:"";
                    //actionElement.y_pos = (objAct.y_pos)?objAct.y_pos:"";
                    //actionElement.width = (objAct.width)?objAct.width:"";
                    //actionElement.height = (objAct.height)?objAct.height:"";                    
                    if (objAct.items) {  
                        this.setByObject(objAct.items,actionElement);
                    }                    
                    break;
                case ACTIONS_ITEM_SHOW_TPOPUP:
                    actionElement.title = objAct.title;
                    actionElement.subtitle = objAct.subtitle;
                    actionElement.image = objAct.image;
                    if (objAct.events) {     
                        this.setByObject(objAct.events,actionElement);
                    }                      
                    break;                                        
                case ACTIONS_SHOW_POPOVER:
                    actionElement.x_pos = (objAct.x_pos)?objAct.x_pos:"";
                    actionElement.y_pos = (objAct.y_pos)?objAct.y_pos:"";
                    actionElement.width = (objAct.width)?objAct.width:"";
                    actionElement.height = (objAct.height)?objAct.height:"";                    
                    if (objAct.items) {  
                        this.setByObject(objAct.items,actionElement);
                    }                    
                    break;
                case ACTIONS_ITEM_SHOW_POPOVER:
                    actionElement.title = objAct.title;
                    actionElement.subtitle = objAct.subtitle;
                    actionElement.image = objAct.image;
                    if (objAct.events) {     
                        this.setByObject(objAct.events,actionElement);
                    }                      
                    break;   
                case ACTIONS_SHOW_GALLERY:
                    actionElement.startup = objAct.startup;
                    actionElement.startup_image = objAct.startup_image;
                    actionElement.thumbnails_mode = objAct.thumbnails_mode;
                    if (objAct.images) {
                        for(var j=0; j < objAct.images.length; j++) {         
                            this.setByObject(objAct.images,actionElement);
                        }
                    }                    
                    break;                    
                case ACTIONS_ITEM_SHOW_GALLERY:
                    actionElement.thumbnail = objAct.thumbnail;
                    if (objAct.events) {       
                        this.setByObject(objAct.events,actionElement);
                    }                      
                    break;     
                case ACTIONS_INITIATE_CONVERSATION:
                    actionElement.pName = objAct.name;
                    actionElement.key = objAct.key;
                    if (objAct.events) {      
                        this.setByObject(objAct.events,actionElement);
                    }     
                    break;   
                case ACTIONS_TAKE_ITEM:
                    actionElement.pItemName = objAct.item_name;
                    actionElement.pDisappearAfterTaking = objAct.disappear_after_taking;
                    if (objAct.events) {
                        this.setByObject(objAct.events,actionElement);
                    }                      
                case ACTIONS_DROP_ITEM:
                    actionElement.pItemName = objAct.item_name;
                    actionElement.pLeaveAfterDrop = objAct.leave_after_drop;
                    if (objAct.events) {
                        this.setByObject(objAct.events,actionElement);
                    }     
                    break;                                                       
            }   
            if (parent) {
                parent.addChild(actionElement);
            } 
        }        
    }

	// set actions instance Objects by json
	this.setByJSON = function(json, notRefresh) {
	    // remove all actions
	    //console.log("Set by JSON: "+json);
	    if (dataRoot.getChildren()[0] && dataRoot.getChildren()[0].children) {
            dataRoot.getChildren()[0].children = [];
        }
        if (dataRoot.getChildren()[1] && dataRoot.getChildren()[1].children) {
            dataRoot.getChildren()[1].children = [];
        }
	    if (json) {
    	    try {                  
    	       var objActions = JSON.parse(json); 
    	       if (objActions.actions) {
                   if (objActions.actions[0]) { // click
                       //console.log(objActions.actions[0].events);
                       this.setByObject(objActions.actions[0].events, dataRoot.getChildren()[0]);
                   }
                   if (objActions.actions[1]) { // drop
                       //console.log(objActions.actions[1].events);
                       this.setByObject(objActions.actions[1].events, dataRoot.getChildren()[1]);
                   }
    	       } else {
    	           throw "Bad format JSON in set Actions.";
    	       }    	           	           	      
    	    } catch(e) { console.log("Error set actions by JSON: "+e); }
	    } else {
	        //console.log("JSON is empty in set actions");
	    }  	    
		//if (!notRefresh) {
		this.reflowTree();  
		this.setJSTree();
		//}
	}
	
    this.canAddAction = function(typeAction) {
        var actionParent = that.getActionObjectByNodeId(nodeIdSelected);
        if (actionParent) {
            var enabledActions = actionParent.enabledActions;
            if (enabledActions) {
                for(var i=0; i < enabledActions.length; i++) {
                    if (typeAction == enabledActions[i]) {
                        return true;
                    }
                }            
            }
        }
        return false;
    }
    
    this.addActionForActionParent = function(typeAction, actionParent) {        
        //var isFind = false;
        //EventsNotification.exe(SequencesSystemEvents.EVENT_ADD_ACTION, {actionType: typeAction}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        
        
        var actionElement = ActionFactory(typeAction, actionParent);
        actionElement.uniqueId = uniqueId++;
        actionElement.container = this;
        actionParent.addChild(actionElement); 
        this.callbackAsJSON();
        return actionElement;       
    }        
    
    this.addActionForNodeId = function(typeAction, nodeId) {        
        if (this.canAddAction(typeAction)) {  
            
            var isFind = false;
            EventsNotification.exe(SequencesSystemEvents.EVENT_ADD_ACTION, {actionType: typeAction}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        
                      
            var actionParent = that.getActionObjectByNodeId(nodeId);
            if (actionParent) {   
                
                var actionElement = ActionFactory(typeAction, actionParent);
                actionElement.uniqueId = uniqueId++;
                actionElement.container = this;
                actionElement.propertyLiClass = this.propertyLiClass;

                console.log("add action "+typeAction+" for node id:"+nodeId);
                            
                var addNodeId = that.idActionsTreeOptionPrefix+actionElement.uniqueId;                                
                $("#"+this.idActionsTree).jstree("create","#"+nodeId, "last", {attr : {id: addNodeId}, data: "Wezel"}, false, true);
                
                var html = createLeafNode(actionElement);
                //console.log(html);
                $("#"+addNodeId).html(html);
                
                actionParent.addChild(actionElement);                
                setEventsLeafNode(addNodeId);
                $.jstree._focused().select_node("#"+addNodeId);
                
                $("#"+addNodeId+"_edit").trigger("click");
                
                this.callbackAsJSON();
            }                                              
        }
    }
    
    
    this.removeActionForNodeId = function(idNode) {
        var action = that.getActionObjectByNodeId(idNode);
        if (action) {               
            var isFind = false;
            EventsNotification.exe(SequencesSystemEvents.EVENT_REMOVE_ACTION, {actionType: action.type}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        

            console.log("remove node id:"+idNode);
            
            $("#"+this.idActionsTree).jstree("remove",$("#"+idNode));
            action.parent.removeChild(action);
            this.callbackAsJSON();
        }
    }    
    
    var addActionAvailable = function(typeAction,isParent,parent) {
        if (that.isActionAvailable(typeAction) == false || that.canActionAvailableDisplay(typeAction) == false) {
            return;
        }
        var li = document.createElement("li");
        li.id = that.idActionsAvailable+"_"+typeAction;
        var a = document.createElement("a");
        a.href = "javascript:void(0)";
        var tempAction = ActionFactory(typeAction);
        a.innerHTML = tempAction.getStringName(); 
        li.appendChild(a);
        if (isParent) {
            var ul = document.createElement("ul");
            ul.id = that.idActionsAvailable+"_parent_"+typeAction;
            li.appendChild(ul);
            console.log(parent);
        }            
        parent.appendChild(li);       
        
        $(a).click(function() {            
           that.addActionForNodeId(typeAction, nodeIdSelected);           
           that.showActionsAvailable(false);
        });
    }
    
    var setActionAvailable = function() {   
        var parentObj = $("#"+that.idActionsAvailable);
        var parent = parentObj[0];   
        parentObj.html("");
        
        addActionAvailable(ACTIONS_SHOW_ELEMENT, false, parent);
        addActionAvailable(ACTIONS_HIDE_ELEMENT, false, parent);
        addActionAvailable(ACTIONS_RUN_XML, false, parent);
        addActionAvailable(ACTIONS_GO_BACK, false, parent);
        addActionAvailable(ACTIONS_PLAY_MP3, false, parent);
        addActionAvailable(ACTIONS_STOP_MP3, false, parent);
        addActionAvailable(ACTIONS_SHOW_IMAGE, false, parent);
        addActionAvailable(ACTIONS_SHOW_TPOPUP, false, parent);
        addActionAvailable(ACTIONS_ITEM_SHOW_TPOPUP, false, parent);
        addActionAvailable(ACTIONS_SHOW_POPOVER, false, parent);
        addActionAvailable(ACTIONS_ITEM_SHOW_POPOVER, false, parent); //$("#"+that.idActionsAvailable+"_parent_"+ACTIONS_SHOW_POPOVER)[0]);
        addActionAvailable(ACTIONS_SHOW_GALLERY, false, parent);
        addActionAvailable(ACTIONS_ITEM_SHOW_GALLERY, false, $("#"+that.idActionsAvailable+"_parent_"+ACTIONS_SHOW_GALLERY)[0]);
        addActionAvailable(ACTIONS_INITIATE_CONVERSATION, false, parent);
        addActionAvailable(ACTIONS_TAKE_ITEM, false, parent);
        addActionAvailable(ACTIONS_DROP_ITEM, false, parent);
        
        $("#"+that.idActionsAvailable).menu();	
		//that.showActionsAvailable(tryAddNewAction);		
        $("#"+that.idActionsAvailable).click(function() {
            
            that.showActionsAvailable(false); 
        });       
    }
    
    this.canActionAvailableDisplay = function(typeAction) {
        var action = this.getActionObjectByNodeId(nodeIdSelected);
        if (action && action.displayActions) {
            var list = action.displayActions;
            for(var i=0; i < list.length; i++) {
                if (list[i] == typeAction) {
                    return true;
                }
            }  
        }
        return false;
    }       
     
    this.setVisibilityActionAvailable = function() {    
       var action = this.getActionObjectByNodeId(nodeIdSelected);                  
       if (action) {
            for (var i=0; i < actionList().length; i++) {
                $("#"+that.idActionsAvailable+"_"+actionList()[i]).addClass("ui-state-disabled");
            }
            var typeAction = action.getType();
            var clickableActions = action.clickableActions;
            if (clickableActions) {
                for (var i=0; i < clickableActions.length; i++) {
                    var isAvailable = false;
                    for (var j=0; j < actionList().length; j++) {
                        if(actionList()[j] == clickableActions[i]) {
                            isAvailable = true;
                            break;
                        }
                    }
                    if (isAvailable) {
                        $("#"+that.idActionsAvailable+"_"+clickableActions[i]).removeClass("ui-state-disabled");
                    }
                }
            }                        
        }
    }   
    
    this.setEvents = function() {           
       
        var allActionsList = this.getActionsList();
        if (allActionsList) {
            for(var i=0; i < allActionsList.length; i++) {      
                
                setEventsLeafNode(this.idActionsTreeOptionPrefix+allActionsList[i].uniqueId);                       
            }
            //$("#"+this.idActionsParameters).empty();
        }         
       
       $( "#"+this.idActionsTreeElementDelete ).button().unbind("click").click(function() {
           that.removeAction();
	   });            
	   //$("#"+this.idActionsTree).tooltip();	
	   //$("#"+this.idActionsParameters).mouseleave(function() { that.showActionsParameters(false); });  	
    }
   
    this.setOptionsOfTreeElement = function(typeAction, nodeId) {   
        var rightPos = 2;     
        var widthSplit = 18; 
        var html = "";      
        
        var offsetX = 0;
        
        var tempAction = ActionFactory(typeAction);   
        var canAdd = (tempAction.displayActions.length > 0);  
        if (typeAction == ACTIONS_ONCLICK || typeAction == ACTIONS_ONDROP || canAdd) { 
            offsetX += widthSplit;
        }
                      
        var remove = '<img id="'+nodeId+'_remove" data-id="'+nodeId+'" src="'+pathSystem+'/media/img/icon_remove.png" style="position:absolute; right:'+rightPos+'px;cursor:pointer;" class="actions_tree_icon">';
        var add = '<img id="'+nodeId+'_add" data-id="'+nodeId+'" src="'+pathSystem+'/media/img/icon_add.png" style="position:absolute;right:'+(rightPos-widthSplit)+'px;cursor:pointer;" class="actions_tree_icon">';
        var edit = '<img id="'+nodeId+'_edit" data-id="'+nodeId+'" src="'+pathSystem+'/media/img/pencil_small.png" style="position:absolute;right:'+(rightPos-widthSplit-offsetX)+'px;cursor:pointer; width:16px;margin-top:0px;" class="actions_tree_icon">';
  
        if (typeAction == ACTIONS_ONCLICK || typeAction == ACTIONS_ONDROP || canAdd) {            
            html += add;
        }
        if (typeAction != ACTIONS_ONCLICK && typeAction != ACTIONS_ONDROP) {            
            html += remove;
            if (tempAction.params.length > 0) {
                html += edit;            
            }
        }
        return html;
    }   
    
    var createLeafNode = function(action) {
        var html = "";
        //html += "<ul>";
        var nodeId = that.idActionsTreeOptionPrefix+action.uniqueId; 
        //html += "<li id=\""+nodeId+"\" title='"+action.getInfo()+"' style='margin-left:0px;' >";
        html += "<ins class='jstree-icon'>&nbsp;</ins>";
        html += "<a style='cursor:default;'><ins class='jstree-icon'>&nbsp;</ins>";
        html += "<div style='position:relative;display:inline;overflow:hidden;width:150px;background-color:transparent;'>";
        html += "<div style='display:inline-block;width:200px;background-color:transparent;color:"+that.colorTree+";'>";
        html += shortenString(action.getTreeName(), 25, "..");
        html += "</div>";
        html += "<div style='display:inline-block;position:absolute;right:10px;'>"; 
        html += that.setOptionsOfTreeElement(action.getType(), nodeId);
        html += "</div>";
        html += "</div>";
        html += "</a>";
        //html += "</li>";            
       // html += "</ul>";    
       return html;    
    }
    
    var timers = new Array();
    var timersEdit = new Array();
    var setEventsLeafNode = function(nodeId) {
   
        // add
        var idAdd = nodeId+'_add';
        var timer;
        timers.push(timer);        
        $("#"+idAdd).click(function() {    
            
            // clear
            for(var i=0; i < timers.length; i++) {
                window.clearInterval(timers[i]);
            } 
            $("#"+this.idActionsAvailable).hide();

            nodeIdSelected = $(this)[0].dataset.id;            
                      
            setActionAvailable();            
            that.setVisibilityActionAvailable();    
                        
            //var typeAction =   spis akcji od $(this)[0].dataset.id
            var isEnabled = true;//(that.objectActionSelected.displayActions.length > 0)?"enable":"disable";
            //var isDeleteEnabled = (typeAction != ACTIONS_ONCLICK && typeAction != ACTIONS_ONDROP)?"enable":"disable";
            $("#"+that.idActionsAvailable).menu(isEnabled);
            

            var parentOffset = $(this).parent().offset();                
            that.correctPositionOfMenuActionsAvailable((parentOffset.left+16), parentOffset.top);                    
            
            that.showActionsAvailable(true);
                         
            timer = window.setTimeout(function(){  that.showActionsAvailable(false) }, timeMsAfterClickOption);          
        });
        
        /*$("#"+idAdd).mouseenter(function() {
            window.clearInterval(timer);
            that.showActionsAvailable(false);            
        });*/
        $("#"+that.idActionsAvailable).mouseenter(function() {
            window.clearInterval(timer);
        });
        $("#"+that.idActionsAvailable).mouseleave(function() {
            timer = window.setTimeout(function(){  that.showActionsAvailable(false) }, timeMsAfterLeaveOption);
        });    

        // edit         
        var idEdit = nodeId+'_edit';       
        var timerEdit;
        timersEdit.push(timer);  
        $("#"+idEdit).click(function(e) {    
            
            // clear
            for(var i=0; i < timersEdit.length; i++) {
                window.clearInterval(timersEdit[i]);
            } 
            $("#"+this.idActionsAvailable).hide();
            
            nodeIdSelected = $(this)[0].dataset.id;            
                       
            var parentOffset = $(this).parent().offset();                
            that.correctPositionOfMenuActionsParameters((parentOffset.left+16), parentOffset.top);
            
            that.setParameters(nodeId);
            that.showActionsParameters(true);  
            
            timerEdit = window.setTimeout(function(){  that.showActionsParameters(false) }, timeMsAfterClickOption);                    
        }); 
        $("#"+that.idActionsParameters).mouseenter(function() {
            window.clearInterval(timerEdit);
        });
        $("#"+that.idActionsParameters).mouseleave(function() {
            timerEdit = window.setTimeout(function(){  that.showActionsParameters(false) }, timeMsAfterLeaveOption);
        });                 
    
        // remove
        var idRemove = nodeId+'_remove';
        $("#"+idRemove).click(function() {                
           that.removeActionForNodeId($(this)[0].dataset.id);
        });      
    }
    
    var showTreeElement = function(parentAction) {
        var html = "";
        var hasChilds = parentAction.canHasChildren() && (parentAction.getChildren().length > 0);
        if (hasChilds) {
            html += "<ul>";
            for(var i=0; i < parentAction.getChildren().length; i++) {// this.className = 'actions_tree_element_active';
                var action = parentAction.getChildren()[i];
                var nodeId = that.idActionsTreeOptionPrefix+action.uniqueId; 
                html += "<li id=\""+nodeId+"\" title='"+action.getInfo()+"'> ";
                html += "<a style='cursor:default;'> ";
                html += "<div style='position:relative;display:inline;overflow:hidden;width:150px;background-color:transparent;'>";
                html += "<div style='display:inline-block;width:200px;background-color:transparent;color:"+that.colorTree+";'> ";
                html += ""+shortenString(action.getTreeName(), 25, "..")+"";
                html += "</div>";
                html += "<div style='display:inline-block;position:absolute;right:10px;'>";
                html += ""+that.setOptionsOfTreeElement(action.getType(), nodeId)+"";
                html += "</div>";
                html += "</div>";
                html += "</a>";                 
                html += showTreeElement(action);
                html += "</li>";            
            }
            html += "</ul>";
        }
        return html;
    }       
    
    
    this.correctPositionOfMenuActionsAvailable = function(offsetLeft, offsetTop) {
        $("#"+that.idActionsAvailable).css({ 
            position: "absolute",
            marginLeft: 0, marginTop: 0,
            top: (offsetTop), left: (offsetLeft)
        }).appendTo('body');
    }
    
    this.correctPositionOfMenuActionsParameters = function(offsetLeft, offsetTop) {
        if (this.isAbsoluteParameters) {
            $("#"+that.idActionsParameters).css({ 
                position: "absolute",
                marginLeft: 0, marginTop: 0,
                top: (offsetTop), left: (offsetLeft)
            }).appendTo('body');
        }
    }   
      
    
    this.reflowTree = function() {   
        var html = "";
        html += showTreeElement(dataRoot);
        $("#"+this.idActionsTree).html(html);
        
        /*window.setTimeout(function(){
           if (isAddNewAction) {
                isAddNewAction = false;
                //alert("new acr "+that.idActionSelected);
                //that.displayActionsParameters($("#"+that.idActionSelected));
            }            
        }, 1000);*/
        
        that.setEvents();
     
        
        /*for(var i=0; i < idTree; i++) {            
            var removeAction = this.idActionsTreeOptionPrefix+i+'_remove';
            $("#"+removeAction).click(function() {                
               that.removeActionForNodeId($(this)[0].dataset.id);
            });  
            $("#"+removeAction).mouseenter(function() {                
               //console.log($(this)[0].dataset.id);
            });       
            
            var addAction = this.idActionsTreeOptionPrefix+i+'_add';        
            $("#"+addAction).click(function(e) {               
                var parentOffset = $(this).parent().offset();                
				that.correctPositionOfMenuActionsAvailable((parentOffset.left+16), parentOffset.top);
				
				tryAddNewAction = true;
                that.showActionsAvailable(true);                              
            });           
            var editAction = this.idActionsTreeOptionPrefix+i+'_edit';        
            $("#"+editAction).click(function(e) {                
                that.displayActionsParameters(this);                          
            });                                                          
        }
        $("#"+this.idActionsParameters).empty();  
        */
    }
    	
    this.setParameters = function(nodeId) {
        var action = this.getActionObjectByNodeId(nodeId);
        if (action && nodeId) {
            $("#"+this.idActionsParameters).html("");
            if (action.container) {          
                action.setParams(this.idActionsParameters);
            }            
        }
    }
    
    this.getByJSON = function() {
        var json = JSON.stringify(dataRoot.getObject());
        return json;
    }
    
    this.callbackAsJSON = function() {
        if (typeof this.callbackChangeActions === "function") {
            var json = JSON.stringify(dataRoot.getObject());
            this.callbackChangeActions(this, json);
        }  
    }       
    
    this.refreshWithCallback = function(action) {
        $("#"+nodeIdSelected)[0].title = action.getInfo();
        action.setParams(that.idActionsParameters);
        this.callbackAsJSON();
    }    

    var actionsListElement = function(parentAction, data) {
        data.push(parentAction);
        var hasChilds = parentAction.canHasChildren() && (parentAction.getChildren().length > 0);
        if (hasChilds) {
            for(var i=0; i < parentAction.getChildren().length; i++) {
                var action = parentAction.getChildren()[i];             
                actionsListElement(action,data);
            }
        }
    }   
        
    this.getActionsList = function() {   
        var actionsList = [];
        actionsListElement(dataRoot, actionsList);
        return actionsList;
    }   

    this.getUniqueIdByNodeId = function(nodeId) {        
        var uniId = parseInt(nodeId.replace(that.idActionsTreeOptionPrefix,""));        
        if (!isNaN(uniId)) {
            return uniId;
        }
        return 0;
    }
    
    this.getActionObjectByNodeId = function(nodeId) {
        var compareUniqueId = this.getUniqueIdByNodeId(nodeId); 
        var allActionsList = this.getActionsList();
        if (compareUniqueId && allActionsList) {
            for(var i=0; i < allActionsList.length; i++) {                
                if (compareUniqueId == allActionsList[i].uniqueId) {
                    return allActionsList[i];
                }
            }
        }
        return undefined;               
    }
    
    this.globalAreAnyParametersEmpty = function() {
        var actionsList = this.getActionsList();
        for(var i=0; i < actionsList.length; i++) { 
            
            if (actionsList[i].getType() == ACTIONS_SHOW_IMAGE && !actionsList[i].pImage) {
                return true;
            }
            if (actionsList[i].getType() == ACTIONS_PLAY_MP3 && !actionsList[i].name) {
                return true;
            }
            if ((actionsList[i].getType() == ACTIONS_TAKE_ITEM || actionsList[i].getType() == ACTIONS_DROP_ITEM) && !actionsList[i].pItemName) {
                return true;
            }
            if (actionsList[i].getType() == ACTIONS_INITIATE_CONVERSATION && !actionsList[i].pName) {
                return true;
            }
            if (actionsList[i].getType() == ACTIONS_SHOW_TPOPUP && !actionsList[i].name) {
                return true;
            }
            if ((actionsList[i].getType() == ACTIONS_SHOW_ELEMENT || actionsList[i].getType() == ACTIONS_HIDE_ELEMENT) && !actionsList[i].name) {
                return true;
            }            
        }
        return false;
    }

    this.globalIsExistsForName = function(name, typeAction) {
        var actionsList = this.getActionsList();
        for(var i=0; i < actionsList.length; i++) { 
            
            if (typeAction == DELETED_ELEMENT_IMAGE && actionsList[i].getType() == ACTIONS_SHOW_IMAGE && actionsList[i].pImage == name) {
                return true;
            }
            if (typeAction == DELETED_ELEMENT_SOUND && actionsList[i].getType() == ACTIONS_PLAY_MP3 && actionsList[i].name == name) {
                return true;
            }
            if (typeAction == DELETED_ELEMENT_ITEM && (actionsList[i].getType() == ACTIONS_TAKE_ITEM || actionsList[i].getType() == ACTIONS_DROP_ITEM) && actionsList[i].pItemName == name) {
                return true;
            }
            if (typeAction == DELETED_ELEMENT_CONVERSATION && actionsList[i].getType() == ACTIONS_INITIATE_CONVERSATION && actionsList[i].pName == name) {
                return true;
            }
            if (typeAction == DELETED_ELEMENT_POPUP && actionsList[i].getType() == ACTIONS_SHOW_TPOPUP && actionsList[i].name == name) {
                return true;
            }
            if (typeAction == DELETED_ELEMENT_CLICKABLE_AREA && (actionsList[i].getType() == ACTIONS_SHOW_ELEMENT || actionsList[i].getType() == ACTIONS_HIDE_ELEMENT) && actionsList[i].name == name) {
                return true;
            }            
        }
        return false;
    }
    
    
    this.globalSetCorrectForName = function(name, typeAction, newName) {
        var actionsList = this.getActionsList();

        var isChange = false;
        for(var i=0; i < actionsList.length; i++) {   
            
            // edit section
            if (typeAction == EDIT_ELEMENT_IMAGE && (actionsList[i].getType() == ACTIONS_SHOW_IMAGE)) {                                
                if (actionsList[i].pImage == name) {
                    actionsList[i].pImage = newName;
                    isChange = true;
                }
            }             
            if (typeAction == EDIT_ELEMENT_SOUND && actionsList[i].getType() == ACTIONS_PLAY_MP3) {                                
                if (actionsList[i].name == name) {
                    actionsList[i].name = newName;
                    isChange = true;
                }
            }      
            if (typeAction == EDIT_ELEMENT_ITEM && (actionsList[i].getType() == ACTIONS_TAKE_ITEM || actionsList[i].getType() == ACTIONS_DROP_ITEM)) {                                
                if (actionsList[i].pItemName) {
                    actionsList[i].pItemName = newName;
                    isChange = true;
                }
            }    
            if (typeAction == EDIT_ELEMENT_CONVERSATION && actionsList[i].getType() == ACTIONS_INITIATE_CONVERSATION) {                                
                if (actionsList[i].pName == name) {
                    actionsList[i].pName = newName;
                    isChange = true;
                }
            }   
            if (typeAction == EDIT_ELEMENT_POPUP && actionsList[i].getType() == ACTIONS_SHOW_TPOPUP) {                                
                if (actionsList[i].name == name) {
                    actionsList[i].name = newName;
                    isChange = true;
                }
            }                         
            if (typeAction == EDIT_ELEMENT_CLICKABLE_AREA && (actionsList[i].getType() == ACTIONS_SHOW_ELEMENT || actionsList[i].getType() == ACTIONS_HIDE_ELEMENT)) {                                
                if (actionsList[i].name == name) {
                    actionsList[i].name = newName;
                    isChange = true;
                }
            }             
            
            // delete section
            if (typeAction == DELETED_ELEMENT_IMAGE && actionsList[i].getType() == ACTIONS_SHOW_IMAGE) {                                
                if (actionsList[i].pImage == name || !actionsList[i].pImage) {
                    actionsList[i].parent.removeChild(actionsList[i]);
                    isChange = true;
                }
            }
            if (typeAction == DELETED_ELEMENT_SOUND && actionsList[i].getType() == ACTIONS_PLAY_MP3) {                                
                if (actionsList[i].name == name || !actionsList[i].name) {
                    actionsList[i].parent.removeChild(actionsList[i]);
                    isChange = true;
                }
            }            
            if (typeAction == DELETED_ELEMENT_ITEM && (actionsList[i].getType() == ACTIONS_TAKE_ITEM || actionsList[i].getType() == ACTIONS_DROP_ITEM)) {                                
                if (actionsList[i].pItemName == name || !actionsList[i].pItemName) {
                    actionsList[i].parent.removeChild(actionsList[i]);
                    isChange = true;
                }
            }         
            if (typeAction == DELETED_ELEMENT_CONVERSATION && actionsList[i].getType() == ACTIONS_INITIATE_CONVERSATION) {                                
                if (actionsList[i].pName == name || !actionsList[i].pName) {
                    actionsList[i].parent.removeChild(actionsList[i]);
                    isChange = true;
                }
            }   
            if (typeAction == DELETED_ELEMENT_POPUP && actionsList[i].getType() == ACTIONS_SHOW_TPOPUP) {                                
                if (actionsList[i].name == name || !actionsList[i].name) {
                    actionsList[i].parent.removeChild(actionsList[i]);
                    isChange = true;
                }
            } 
            if (typeAction == DELETED_ELEMENT_CLICKABLE_AREA && (actionsList[i].getType() == ACTIONS_SHOW_ELEMENT || actionsList[i].getType() == ACTIONS_HIDE_ELEMENT)) {                                
                if (actionsList[i].name == name || !actionsList[i].name) {
                    actionsList[i].parent.removeChild(actionsList[i]);
                    isChange = true;
                }
            }              
        }
        if (isChange) {
            var json = JSON.stringify(dataRoot.getObject());
            return json;
        } else {
            return undefined
        }
    } 
}

function arrayObjectsFromArrayAction(array) {
    var arrayObjects = new Array();
    for(var i=0; i < array.length; i++) {
		var object = array[i].getObject();
		//console.log(object.type);
		if (object.type == ACTIONS_SHOW_TPOPUP) {
			if (object.name) {
				//console.log(">> ACTIONS_SHOW_TPOPUP");
				arrayObjects.push(object);
			}			
		} else {
			arrayObjects.push(object);
		}
    }
    return arrayObjects;
}

/*function searchActionWithUniqueId(rootAction,uniqId) {
    var result = undefined;
    if (rootAction.uniqueId == uniqId) {
        result = rootAction;
        console.log(rootAction.uniqueId)
    } else {
        for(var i=0; i < rootAction.getChildren().length; i++) {
            var child = rootAction.getChildren()[i];
            console.log(child.uniqueId);
            result = searchActionWithUniqueId(child,uniqId);
            if (result && result.uniqueId == uniqId) {                    
                break;
            }
        } 
    }
    return result;
}*/

function ActionFactory(typeAction,parent) {
    switch(typeAction) {
        
        case ACTIONS_ROOT:
            return new RootAction();
        case ACTIONS_ONCLICK: 
            return new OnClickAction(parent);
        case ACTIONS_ONDROP: 
            return new OnDropAction(parent);
        case ACTIONS_SHOW_ELEMENT: 
            return new ShowElementAction(parent);
        case ACTIONS_HIDE_ELEMENT: 
            return new HideElementAction(parent);
        case ACTIONS_RUN_XML:
            return new RunXmlAction(parent);        
        case ACTIONS_GO_BACK: 
            return new GoBackAction(parent);
        case ACTIONS_PLAY_MP3: 
            return new PlayMp3Action(parent);
        case ACTIONS_STOP_MP3: 
            return new StopMp3Action(parent);
        case ACTIONS_SHOW_IMAGE: 
            return new ShowImageAction(parent);
        case ACTIONS_SHOW_TPOPUP: 
            return new ShowTPopupAction(parent);
        case ACTIONS_ITEM_SHOW_TPOPUP: 
            return new ItemShowTPopupAction(parent);
        case ACTIONS_SHOW_POPOVER: 
            return new ShowPopoverAction(parent);
        case ACTIONS_ITEM_SHOW_POPOVER: 
            return new ItemShowPopoverAction(parent);
        case ACTIONS_SHOW_GALLERY: 
            return new ShowGalleryAction(parent);
        case ACTIONS_ITEM_SHOW_GALLERY: 
            return new ImageShowGalleryAction(parent);
        case ACTIONS_INITIATE_CONVERSATION: 
            return new InitiateConversationAction(parent);
        case ACTIONS_TAKE_ITEM: 
            return new TakeItemAction(parent);
        case ACTIONS_DROP_ITEM: 
            return new DropItemAction(parent);
        default: 
            return undefined;
    }
}

function actionList() {
    var array = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,
                          ACTIONS_GO_BACK,ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3, ACTIONS_SHOW_IMAGE,
                          ACTIONS_SHOW_TPOPUP,ACTIONS_ITEM_SHOW_TPOPUP,
                          ACTIONS_SHOW_POPOVER,ACTIONS_ITEM_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,ACTIONS_ITEM_SHOW_GALLERY,
                          ACTIONS_INITIATE_CONVERSATION, ACTIONS_TAKE_ITEM, ACTIONS_DROP_ITEM);
    return array;
}



