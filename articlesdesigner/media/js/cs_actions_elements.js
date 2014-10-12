
// action root 
function RootAction() {  
    this.parent = undefined;
    this.type = ACTIONS_ROOT;
    this.stringName = "Root";
    this.allowHasChildren = true;
    this.children = new Array();
    
    this.getObject = function() {
        var obj={
            //type : this.type,
            actions : arrayObjectsFromArrayAction(this.getChildren())
        }
        return obj;
    }                                    
}
RootAction.prototype = Object.create(BaseAction.prototype);

function OnClickAction(_parent) {  
    this.parent = _parent;
    this.type = ACTIONS_ONCLICK;
    this.stringName = "Onclick";
    this.allowHasChildren = true;
    this.children = new Array();
    
    this.getObject = function() {
        var obj={
            type : this.type,
            events : arrayObjectsFromArrayAction(this.getChildren())
        }
        return obj;
    }    
    this.displayActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
        ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_TPOPUP,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
        ACTIONS_INITIATE_CONVERSATION, ACTIONS_TAKE_ITEM);
    this.clickableActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
        ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_TPOPUP,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
        ACTIONS_INITIATE_CONVERSATION, ACTIONS_TAKE_ITEM);   
    this.enabledActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
        ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_TPOPUP,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
        ACTIONS_INITIATE_CONVERSATION, ACTIONS_TAKE_ITEM);                                 
}
OnClickAction.prototype = Object.create(BaseAction.prototype);

function OnDropAction(_parent) {  
    this.parent = _parent;
    this.type = ACTIONS_ONDROP;
    this.stringName = "Ondrop";
    this.allowHasChildren = true;
    this.children = new Array();
    
    this.getObject = function() {
        var obj={
            type : this.type,
            events : arrayObjectsFromArrayAction(this.getChildren())
        }
        return obj;
    }
    this.displayActions = new Array(ACTIONS_DROP_ITEM);
    this.clickableActions = new Array(ACTIONS_DROP_ITEM);   
    this.enabledActions = new Array(ACTIONS_DROP_ITEM);           
}
OnDropAction.prototype = Object.create(BaseAction.prototype);

function ShowElementAction(_parent) {
    var that = this;
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_SHOW_ELEMENT;      
    this.stringName = "Show object";
    this.name = "";//firstElementOfArray(canvas.getElementsListOfName());
    this.key = "";
    this.params = new Array(this.name); 
    
    this.getObject = function() {
        var obj={
            type : this.getType(),
            name : this.name,
            key : this.key
        }
        return obj;
    }  
    this.setParams = function(parentIdParameters) {
        var parentParams = $("#"+parentIdParameters)[0];      
        var params = new Array();
        params[0] = new Property(ActionParams.SHOW_ELEMENT_NAME, "select", "Name: ", "");
        params[0].setClassName(this.propertyLiClass);
        params[0].setOptionOfSelect(arrayWithFirstEmptyElement(canvas.getElementsListOfName()));              
        params[1] = new Property(ActionParams.SHOW_ELEMENT_NAME+"_key", "select", "Key: ", "");
        params[1].setClassName(this.propertyLiClass);
        params[1].setOptionOfSelect(arrayWithFirstEmptyElement(listOfKeyboardLetters()));              
        // display
        this.displayParams(params, parentParams);      
        params[0].setValue(this.name);     
        params[1].setValue(this.key);     
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params); 
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == ActionParams.SHOW_ELEMENT_NAME) {
            that.name = value;
        } else if (propertyObj.id == ActionParams.SHOW_ELEMENT_NAME+"_key") {
            that.key = value;
        } 
        that.container.refreshWithCallback(that);
    }       
    this.getInfo = function() { 
        return "(name = \""+this.name+"\", key = \""+this.key+"\")";
    }    
}
ShowElementAction.prototype = Object.create(BaseAction.prototype);

function HideElementAction(_parent) {
    var that = this;
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_HIDE_ELEMENT;
    this.stringName = "Hide object";
    this.name = "";//firstElementOfArray(canvas.getElementsListOfName());
    this.key = "";
    this.params = new Array(this.name);
    
    this.getObject = function() {
        var obj={
            type : this.getType(),
            name : this.name,
            key  : this.key
        }
        return obj;
    }  
    this.setParams = function(parentIdParameters) {
        var parentParams = $("#"+parentIdParameters)[0];      
        var params = new Array();
        params[0] = new Property(ActionParams.HIDE_ELEMENT_NAME, "select", "Name: ", "");
        params[0].setClassName(this.propertyLiClass);
        params[0].setOptionOfSelect(arrayWithFirstEmptyElement(canvas.getElementsListOfName()));              
        params[1] = new Property(ActionParams.HIDE_ELEMENT_NAME+"_key", "select", "Key: ", "");
        params[1].setClassName(this.propertyLiClass);
        params[1].setOptionOfSelect(arrayWithFirstEmptyElement(listOfKeyboardLetters()));              
        // display
        this.displayParams(params, parentParams);      
        params[0].setValue(this.name);     
        params[1].setValue(this.key);     
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params);         
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == ActionParams.HIDE_ELEMENT_NAME) {
            that.name = value;
        } else if (propertyObj.id == ActionParams.HIDE_ELEMENT_NAME+"_key") {
            that.key = value;
        } 
        that.container.refreshWithCallback(that);
    }       
    this.getInfo = function() { 
        return "(name = \""+this.name+"\", key = \""+this.key+"\")";
    }    
}
HideElementAction.prototype = Object.create(BaseAction.prototype);
        
function RunXmlAction(_parent) {
    var that = this;
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_RUN_XML;
    this.stringName = "Go to board";
    this.animated = 0;
    var listScreens = application.getScreenListByParam("name");
    this.name = "";//firstElementOfArray(listScreens);
    this.key = "";
    this.params = new Array(this.name);
    
    this.getObject = function() {
        var obj={
            type : this.getType(),
            name : this.name,
            animated : this.animated,
            key : this.key
        }
        return obj;
    }
    this.setParams = function(parentIdParameters) {
        var parentParams = $("#"+parentIdParameters)[0];      
        var params = new Array();
        params[0] = new Property(ActionParams.RUN_BOARD_NAME, "select", "Board name: ", "");
        params[0].setClassName(this.propertyLiClass);
        params[0].setOptionOfSelect(arrayWithFirstEmptyElement(listScreens));              
        params[1] = new Property(ActionParams.RUN_BOARD_NAME+"_key", "select", "Key: ", "");
        params[1].setClassName(this.propertyLiClass);
        params[1].setOptionOfSelect(arrayWithFirstEmptyElement(listOfKeyboardLetters()));              
        // display
        this.displayParams(params, parentParams);      
        params[0].setValue(this.name);     
        params[1].setValue(this.key);     
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params);          
    }    
    this.callbackParams = function(propertyObj,value) {
        console.log(propertyObj);
        if (propertyObj.id == ActionParams.RUN_BOARD_NAME) {
            that.name = value;
        } else if (propertyObj.id == ActionParams.RUN_BOARD_NAME+"_key") {
            that.key = value;
        }
        that.container.refreshWithCallback(that);        
    }
    /*this.getTreeName = function() {
        return this.stringName+" "+this.name;
    } */       
    this.getInfo = function() { 
        return "(name = \""+this.name+"\", key = "+this.key+")";
    } 
}        
RunXmlAction.prototype = Object.create(BaseAction.prototype);
                
/*function GoBackAction(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_GO_BACK;
    this.stringName = "Go back";

    this.getObject = function() {
        var obj={
            type : this.getType()
        }
        return obj;
    }
}            
GoBackAction.prototype = Object.create(BaseAction.prototype);       
*/    
    
       
function PlayMp3Action(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_PLAY_MP3;
    this.stringName = "Play mp3";
    this.loop = 0;
    this.name = "";//firstElementOfArray(application.soundsList);
    this.key = "";
    this.params = new Array(this.name);

    this.getObject = function() {
        var obj={
            type : this.getType(),
            name : this.name,
            key  : this.key,
            loop : this.loop
        }
        return obj;
    }
    this.setParams = function(parentIdParameters) {
        var parentParams = $("#"+parentIdParameters)[0];      
        var params = new Array();
        params[0] = new Property(ActionParams.PLAY_SOUND_NAME, "select", "Sound name: ", "");
        params[0].setClassName(this.propertyLiClass);
        params[0].setOptionOfSelect(arrayWithFirstEmptyElement(application.soundsList));
        params[0].showButtonDialog = true;
        params[0].callbackButtonDialog = function(property) { 
            resourcesUpload[1].setFocusedElement(that.name);
            openResourcesDialog(RESOURCES_TYPE_SOUNDS);
            resourcesUpload[1].setButtonAndCallback("Set this sound", function() { 
                that.callbackParams(property, resourcesUpload[1].getFocusedElement().val());
                $( "#dialog_resources" ).dialog( "close" ); 
            });           
        };                         
        params[1] = new Property(ActionParams.PLAY_SOUND_NAME+"_key", "select", "Key: ", "");
        params[1].setClassName(this.propertyLiClass);
        params[1].setOptionOfSelect(arrayWithFirstEmptyElement(listOfKeyboardLetters()));              
        // display
        this.displayParams(params, parentParams);      
        params[0].setValue(this.name);     
        params[1].setValue(this.key);     
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params);         
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == ActionParams.PLAY_SOUND_NAME) {
            that.name = value;
        } else if (propertyObj.id == ActionParams.PLAY_SOUND_NAME+"_key") {
            that.key = value;
        } 
        that.container.refreshWithCallback(that);        
    }        
    this.getInfo = function() { 
        return "(name = \""+this.name+"\", key = \""+this.key+"\")";
    } 
} 
PlayMp3Action.prototype = Object.create(BaseAction.prototype);    


function StopMp3Action(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_STOP_MP3;
    this.key = "";
    this.stringName = "Stop mp3";

    this.getObject = function() {
        var obj={
            type : this.getType(),
            key  : this.key
        }
        return obj;
    }
    this.setParams = function(parentIdParameters) {
        var parentParams = $("#"+parentIdParameters)[0];      
        var params = new Array();                    
        params[0] = new Property(ActionParams.ACTIONS_STOP_MP3+"_key", "select", "Key: ", "");
        params[0].setClassName(this.propertyLiClass);
        params[0].setOptionOfSelect(arrayWithFirstEmptyElement(listOfKeyboardLetters()));              
        // display
        this.displayParams(params, parentParams);      
        params[0].setValue(this.key);     
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params);         
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == ActionParams.ACTIONS_STOP_MP3+"_key") {
            that.name = value;
        } 
        that.container.refreshWithCallback(that);        
    }        
    this.getInfo = function() { 
        return "(name = \""+this.name+"\", key = \""+this.key+"\")";
    }     
}           
StopMp3Action.prototype = Object.create(BaseAction.prototype); 
       
function ShowImageAction(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_SHOW_IMAGE;
    this.stringName = "Show image";
    this.pImage= ""; //firstElementOfArray(application.imagesList);
    this.key = "";
    this.params = new Array(this.pImage);
    
    this.getObject = function() {
        var obj={
            type  : this.getType(),
            image : this.pImage,
            key   : this.key
        }
        return obj;
    }                
    
    this.setParams = function(parentIdParameters) {
        var parentParams = $("#"+parentIdParameters)[0];    
        var params = new Array();
        params[0] = new Property(ActionParams.SHOW_IMAGE_NAME, "select", "Image: ", "");
        params[0].setClassName(this.propertyLiClass);
        params[0].setOptionOfSelect(arrayWithFirstEmptyElement(application.imagesList));              
        params[0].showButtonDialog = true;
        params[0].callbackButtonDialog = function(property) { 
            resourcesUpload[0].setFocusedElement(that.pImage);
            openResourcesDialog(RESOURCES_TYPE_IMAGES);
            resourcesUpload[0].setButtonAndCallback("Set this image", function() { 
                that.callbackParams(property, resourcesUpload[0].getFocusedElement().val());
                $( "#dialog_resources" ).dialog( "close" ); 
            });           
        };        
        params[1] = new Property(ActionParams.SHOW_IMAGE_NAME+"_key", "select", "Key: ", "");
        params[1].setClassName(this.propertyLiClass);
        params[1].setOptionOfSelect(arrayWithFirstEmptyElement(listOfKeyboardLetters()));               
        // display
        this.displayParams(params, parentParams);      
        params[0].setValue(this.pImage);     
        params[1].setValue(this.key);     
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params);
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == ActionParams.SHOW_IMAGE_NAME) {
            that.pImage = value;
        } else if (propertyObj.id == ActionParams.SHOW_IMAGE_NAME+"_key") {
            that.key = value;
        } 
        that.container.refreshWithCallback(that);        
    }                
    this.getInfo = function() { 
        this.setKeyValueInfo("image",'"'+this.pImage+'"');          
        this.setKeyValueInfo("key",'"'+this.key+'"');          
        return this.getInfoString();        
    }
}   
ShowImageAction.prototype = Object.create(BaseAction.prototype); 
    
function ShowTPopupAction(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_SHOW_TPOPUP;
    this.stringName = "Show popup";
    this.name = "";//firstElementOfArray(popupsContainer.popupsListName());
    this.key = "";
	this.idPopup = 0;
	this.params = new Array(this.name);
	
	// display
    this.getObject = function() {
        var obj={
            type : this.getType(),
            name : this.name,
            key  : this.key
            //id : popupsContainer.popupNameForId(value), 
			// id popupu.  Ustawiamy na popup.  Gdy brak jego, id zostaje, ale nie jest on skojarzony z zadna nazwa, wtedy nie wysylamy.
        }	
        return obj;
    }     
    this.setParams = function(parentIdParameters) {
        var parentParams = $("#"+parentIdParameters)[0];
        // configuration      
        var params = new Array();
        params[0] = new Property(ActionParams.SHOW_POPUP_NAME, "select", "Popup: ","");
        params[0].setClassName(this.propertyLiClass);                                                          
        params[0].setOptionOfSelect(arrayWithFirstEmptyElement(popupsContainer.popupsListName()));
        params[0].showButtonDialog = true;
        params[0].callbackButtonDialog = function(property) { 
			popupsContainer.setFocusForName(that.name);
            popupsContainer.showDialog();
			popupsContainer.setCallbackButtonOK(function(){
				that.callbackParams(params[0], popupsContainer.getFocus());				
			});       
        };  		
        params[1] = new Property(ActionParams.SHOW_POPUP_NAME+"_key", "select", "Key: ", "");
        params[1].setClassName(this.propertyLiClass);
        params[1].setOptionOfSelect(arrayWithFirstEmptyElement(listOfKeyboardLetters())); 
        // display        
        this.displayParams(params, parentParams);         
        // set value
        params[0].setValue(this.name);         
        params[1].setValue(this.key);         
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params); 
    }
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == ActionParams.SHOW_POPUP_NAME) {
            that.name = value;
			that.idPopup = popupsContainer.popupIdForName(value);	
        } else if (propertyObj.id == ActionParams.SHOW_POPUP_NAME+"_key") {
            that.key = value;
        } 
        that.container.refreshWithCallback(that);        
    }               
    this.getInfo = function() { 
        this.setKeyValueInfo("name",'"'+this.name+'"');          
        this.setKeyValueInfo("key",'"'+this.key+'"');          
        return this.getInfoString();           
    }
}
ShowTPopupAction.prototype = Object.create(BaseAction.prototype); 

function ItemShowTPopupAction(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_ITEM_SHOW_TPOPUP;
    this.stringName = "Button";
    this.title = "";
    this.allowHasChildren = true;
    this.children = new Array();
    this.params = new Array(this.title);
    
    this.getObject = function() {
        var obj={
            type : this.getType(),
            title : this.title,
            events : arrayObjectsFromArrayAction(this.getChildren())
        }
        return obj;
    }               
    this.displayActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
                         ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
                         ACTIONS_INITIATE_CONVERSATION, ACTIONS_TAKE_ITEM);
    this.clickableActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
                         ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
                         ACTIONS_INITIATE_CONVERSATION, ACTIONS_TAKE_ITEM);   
    this.enabledActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
                         ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
                         ACTIONS_INITIATE_CONVERSATION, ACTIONS_TAKE_ITEM);                 
    this.setParams = function(parentIdParameters) {
        
var parentParams = $("#"+parentIdParameters)[0];
        // configuration      
        var params = new Array();
        params[0] = new Property(ActionParams.ITEM_SHOW_POPUP_TITLE, "text", "Title: ");
        params[0].setClassName(this.propertyLiClass);      
        // display        
        this.displayParams(params, parentParams);         
        // set value
        params[0].setValue(this.title);         
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params);         
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == ActionParams.ITEM_SHOW_POPUP_TITLE) {
            that.title = value;
        } 
        that.container.refreshWithCallback(that);        
    }               
    /*this.getTreeName = function() {
        return this.stringName+" "+this.title;
    } */        
    this.getInfo = function() { 
        this.setKeyValueInfo("title",'"'+this.title+'"');          
        return this.getInfoString();          
    }
}   
ItemShowTPopupAction.prototype = Object.create(BaseAction.prototype);     
       
function ShowPopoverAction(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_SHOW_POPOVER;
    this.stringName = "Show popover";
    this.width = 200;
    this.height = 400;
    this.x_pos = "";
    this.y_pos = "";
    this.allowHasChildren = true;
    this.children = new Array();
    this.params = new Array(this.width,this.height,this.x_pos,this.y_pos);
    
    this.getObject = function() {
        var obj={
            type : this.getType(),
            width : this.width,
            height : this.height,
            x_pos : this.x_pos,
            y_pos : this.y_pos,
            items : arrayObjectsFromArrayAction(this.getChildren())
        }
        return obj;
    }     
    this.displayActions = new Array(ACTIONS_ITEM_SHOW_POPOVER);
    this.clickableActions = new Array(ACTIONS_ITEM_SHOW_POPOVER);   
    this.enabledActions = new Array(ACTIONS_ITEM_SHOW_POPOVER);    
    this.setParams = function(parentIdParameters) {
        // x_pos property        
        var propertyXPos = new Property("a_pos_x", "text", "Pos X: ");
        propertyXPos.setClassName(this.propertyLiClass);
        propertyXPos.setNumeric(true,false);                
        propertyXPos.callbackChangeValue = this.callbackParams;
        // y_pos property        
        var propertyYPos = new Property("a_pos_y", "text", "Pos Y: ");
        propertyYPos.setClassName(this.propertyLiClass);   
        propertyYPos.setNumeric(true,false);              
        propertyYPos.callbackChangeValue = this.callbackParams;
        // width property        
        var propertyWidth = new Property("a_width", "text", "Width: ");
        propertyWidth.setClassName(this.propertyLiClass);
        propertyWidth.setNumeric(true,false);                
        propertyWidth.callbackChangeValue = this.callbackParams;
        // height property        
        var propertyHeight = new Property("a_height", "text", "Height: ");
        propertyHeight.setClassName(this.propertyLiClass);   
        propertyHeight.setNumeric(true,false);              
        propertyHeight.callbackChangeValue = this.callbackParams;
        // parent
        var parentParams = $("#"+parentIdParameters)[0];
        parentParams.innerHTML = "<br />";
        parentParams.appendChild(propertyXPos.getElement());
        parentParams.appendChild(propertyYPos.getElement());
        parentParams.appendChild(propertyWidth.getElement());
        parentParams.appendChild(propertyHeight.getElement());
        // set events
        propertyXPos.setValue(this.x_pos);  
        propertyYPos.setValue(this.y_pos);  
        propertyWidth.setValue(this.width);  
        propertyHeight.setValue(this.height);  
        propertyXPos.refreshActions();
        propertyYPos.refreshActions();
        propertyWidth.refreshActions();
        propertyHeight.refreshActions();
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == "a_pos_x") {
            that.x_pos = value;
        } else if (propertyObj.id == "a_pos_y") {
            that.y_pos = value;
        } else if (propertyObj.id == "a_width") {
            that.width = value;
        } else if (propertyObj.id == "a_height") {
            that.height = value;
        }
        that.container.refreshWithCallback(that);        
    }            
    this.getInfo = function() { 
        return "(x_pos = "+this.x_pos+",y_pos = "+this.y_pos+",width = "+this.width+",height = "+this.height+")";
    }
}
ShowPopoverAction.prototype = Object.create(BaseAction.prototype); 

function ItemShowPopoverAction(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_ITEM_SHOW_POPOVER;
    this.stringName = "Item popover";
    this.title = "";
    this.subtitle = "";
    this.image = firstElementOfArray(application.imagesList);
    this.allowHasChildren = true;
    this.children = new Array();
    this.params = new Array(this.title,this.subtitle,this.image);
    
    this.getObject = function() {
        var obj={
            type : this.getType(),
            title : this.title,
            subtitle : this.subtitle,
            image : this.image,
            events : arrayObjectsFromArrayAction(this.getChildren())
        }
        return obj;
    }               
    this.displayActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
                         ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
                         ACTIONS_INITIATE_CONVERSATION, ACTIONS_TAKE_ITEM);
    this.clickableActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
                         ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
                         ACTIONS_INITIATE_CONVERSATION, ACTIONS_TAKE_ITEM);   
    this.enabledActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
                         ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
                         ACTIONS_INITIATE_CONVERSATION, ACTIONS_TAKE_ITEM);                 
    this.setParams = function(parentIdParameters) {
        // title property        
        var propertyTitle = new Property("a_title", "text", "Title: ");
        propertyTitle.setClassName(this.propertyLiClass);
        propertyTitle.callbackChangeValue = this.callbackParams;
        // subtitle property        
        var propertySubtitle = new Property("a_subtitle", "text", "Subtitle: ");
        propertySubtitle.setClassName(this.propertyLiClass);   
        propertySubtitle.callbackChangeValue = this.callbackParams;
        // width property   
        var propertyImage = new Property("a_image", "select", "Image: ",'<input type="button" value="+" onclick="openResourcesDialog(RESOURCES_TYPE_IMAGES)" />');
        propertyImage.setClassName(this.propertyLiClass);
        propertyImage.styleRight = "width:120px;";                 
        propertyImage.setOptionOfSelect(application.imagesList);
        propertyImage.callbackChangeValue = this.callbackParams;
        // parent
        var parentParams = $("#"+parentIdParameters)[0];
        parentParams.innerHTML = "<br />";
        parentParams.appendChild(propertyTitle.getElement());
        parentParams.appendChild(propertySubtitle.getElement());
        parentParams.appendChild(propertyImage.getElement());
        // set events
        propertyTitle.setValue(this.title);  
        propertySubtitle.setValue(this.subtitle);  
        propertyImage.setValue(this.image); 
        propertyTitle.refreshActions();
        propertySubtitle.refreshActions();
        propertyImage.refreshActions();
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == "a_title") {
            that.title = value;
        } else if (propertyObj.id == "a_subtitle") {
            that.subtitle = value;
        } else if (propertyObj.id == "a_image") {
            that.image = value;
        } 
        that.container.refreshWithCallback(that);        
    }                
    this.getInfo = function() { 
        return "(title = \""+this.title+"\", subtitle = \""+this.subtitle+"\", image = \""+this.image+"\")";
    }
}   
ItemShowPopoverAction.prototype = Object.create(BaseAction.prototype); 

function ShowGalleryAction(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_SHOW_GALLERY;
    this.stringName = "Show gallery";
    this.startup = 1;
    this.thumbnails_mode = 2;
    this.startup_image = 0;
    this.allowHasChildren = true;
    this.children = new Array();
    this.params = new Array(this.startup,this.thumbnails_mode,this.startup_image);
    
    this.getObject = function() {
        var obj={
            type : this.getType(),
            startup : this.startup,
            thumbnails_mode : this.thumbnails_mode,
            startup_image : this.startup_image,
            images : arrayObjectsFromArrayAction(this.getChildren())
        }
        return obj;
    }       
    this.displayActions = new Array(ACTIONS_SHOW_GALLERY, ACTIONS_ITEM_SHOW_GALLERY);
    this.clickableActions = new Array(ACTIONS_ITEM_SHOW_GALLERY);   
    this.enabledActions = new Array(ACTIONS_SHOW_GALLERY, ACTIONS_ITEM_SHOW_GALLERY);    
    this.setParams = function(parentIdParameters) {
        // startup property        
        var propertyStartup = new Property("a_startup", "select", "Startup: ");
        propertyStartup.setClassName(this.propertyLiClass);
        propertyStartup.styleRight = "width:144px;";                 
        var startupList = new Array(1,2);               
        propertyStartup.setOptionOfSelect(startupList);  
        propertyStartup.callbackChangeValue = this.callbackParams;
        // thumbnails_mode property        
        var propertyThumbnailsMode = new Property("a_thumbnails_mode", "select", "Thumbnails mode: ");
        propertyThumbnailsMode.setClassName(this.propertyLiClass);
        propertyThumbnailsMode.styleRight = "width:144px;";                 
        var thumbnailsList = new Array(1,2);               
        propertyThumbnailsMode.setOptionOfSelect(thumbnailsList);  
        propertyThumbnailsMode.callbackChangeValue = this.callbackParams;
        // startup_image property        
        var propertyStartupImage = new Property("a_startup_image", "select", "Startup image: ");
        propertyStartupImage.setClassName(this.propertyLiClass);
        propertyStartupImage.styleRight = "width:144px;";                 
        var startupImageList = new Array();
        for(var i=0; i < this.children.length; i++) {
            startupImageList.push(i+1);
        }
        propertyStartupImage.setOptionOfSelect(startupImageList);  
        propertyStartupImage.callbackChangeValue = this.callbackParams;        
        // parent
        var parentParams = $("#"+parentIdParameters)[0];
        parentParams.innerHTML = "<br />";
        parentParams.appendChild(propertyStartup.getElement());
        parentParams.appendChild(propertyThumbnailsMode.getElement());
        parentParams.appendChild(propertyStartupImage.getElement());
        // set events
        propertyStartup.setValue(this.startup);  
        propertyThumbnailsMode.setValue(this.thumbnails_mode);  
        propertyStartupImage.setValue(this.startup_image);  
        propertyStartup.refreshActions();
        propertyThumbnailsMode.refreshActions();
        propertyStartupImage.refreshActions();
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == "a_startup") {
            console.log(propertyObj.optionsChangeValue);
            that.startup = value;
        } else if (propertyObj.id == "a_thumbnails_mode") {
            that.thumbnails_mode = value;
            console.log(propertyObj.optionsChangeValue);
        } else if (propertyObj.id == "a_startup_image") {
            that.startup_image = value;
        } 
        that.container.refreshWithCallback(that);        
    }                
    this.getInfo = function() { 
        return "(startup = "+this.startup+", thumbnails_mode = "+this.thumbnails_mode+", startup_image = "+this.startup_image+")";
    }
}
ShowGalleryAction.prototype = Object.create(BaseAction.prototype); 

function ImageShowGalleryAction(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_ITEM_SHOW_GALLERY;
    this.stringName = "Item gallery";
    this.thumbnail = firstElementOfArray(application.imagesList);
    this.params = new Array(this.thumbnail);

    this.getObject = function() {
        var obj={
            type : this.getType(),
            thumbnail : this.thumbnail
        }
        return obj;
    }       
    this.setParams = function(parentIdParameters) {
        // thumbnail property        
        var propertyThumbnail = new Property("a_thumbnail", "select", "Thumbnail: ",'<input type="button" value="+" onclick="openResourcesDialog(RESOURCES_TYPE_IMAGES)" />');
        propertyThumbnail.setClassName(this.propertyLiClass);
        propertyThumbnail.styleRight = "width:120px;";                               
        propertyThumbnail.setOptionOfSelect(application.imagesList);  
        propertyThumbnail.callbackChangeValue = this.callbackParams;      
        // parent
        var parentParams = $("#"+parentIdParameters)[0];
        parentParams.innerHTML = "<br />";
        parentParams.appendChild(propertyThumbnail.getElement());
        // set events
        propertyThumbnail.setValue(this.startup);  
        propertyThumbnail.refreshActions();
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == "a_thumbnail") {
            that.thumbnail = value;
        } 
        that.container.refreshWithCallback(that);        
    }    
    /*this.getTreeName = function() {
        return this.stringName+" "+this.thumbnail;
    } */                 
    this.getInfo = function() { 
        return "("+this.thumbnail+")";
    }
}   
ImageShowGalleryAction.prototype = Object.create(BaseAction.prototype); 

function InitiateConversationAction(_parent) {
    var that = this;
    this.parent = _parent;
    this.arrayInfo = new Array();
    this.type = ACTIONS_INITIATE_CONVERSATION;      
    this.stringName = "Initiate conversation";  
    this.allowHasChildren = true;
    this.children = new Array();
    this.pName = "";//firstElementOfArray(conversationsContainer.conversationsListName());
    this.key = "";  
    this.params = new Array(this.name); 
    
    this.getObject = function() {
        var obj={
            type : this.getType(),
            name : this.pName,
            key  : this.key,
            events : arrayObjectsFromArrayAction(this.getChildren())
        }
        return obj;
    }  
   
    this.setParams = function(parentIdParameters) {
        var parentParams = $("#"+parentIdParameters)[0];
        // configuration      
        var params = new Array();
        params[0] = new Property(ActionParams.INITIATE_CONVERSATION_NAME, "select", "Conversation: ","");
        params[0].setClassName(this.propertyLiClass);       
        params[0].setOptionOfSelect(arrayWithFirstEmptyElement(conversationsContainer.conversationsListName()));
        params[0].showButtonDialog = true;
        params[0].callbackButtonDialog = function(property) { 
			conversationsContainer.setFocusForName(that.pName);
            conversationsContainer.showDialog();
			conversationsContainer.setCallbackButtonOK(function(){
				that.callbackParams(params[0], conversationsContainer.getFocus());				
			});       
        };  		
        params[1] = new Property(ActionParams.INITIATE_CONVERSATION_NAME+"_key", "select", "Key: ", "");
        params[1].setClassName(this.propertyLiClass);
        params[1].setOptionOfSelect(arrayWithFirstEmptyElement(listOfKeyboardLetters()));         
        // display
        this.displayParams(params, parentParams);   
        var preview = conversationsContainer.getPreviewForName(this.pName);
        if (preview) {
            $("#"+parentIdParameters).append('<p style="color:white;">Preview:<p/>');
            $("#"+parentIdParameters).append(specialCharsToHtml(preview));
        }   
        params[0].setValue(this.pName);                      
        params[1].setValue(this.key);                      
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params);        
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == ActionParams.INITIATE_CONVERSATION_NAME) {
            that.pName = value;           
        } else if (propertyObj.id == ActionParams.INITIATE_CONVERSATION_NAME+"_key") {
            that.pName = value;           
        }
        that.container.refreshWithCallback(that);
    }
    /*this.getTreeName = function() {
        return this.stringName+" "+this.pName;
    } */       
    this.getInfo = function() {
        this.setKeyValueInfo("name",'"'+this.pName+'"');          
        this.setKeyValueInfo("key",'"'+this.key+'"');          
        return this.getInfoString();
    }
}
InitiateConversationAction.prototype = Object.create(BaseAction.prototype);

function TakeItemAction(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_TAKE_ITEM;
    this.stringName = "Take item";
    this.pItemName = firstElementOfArray(itemsContainer.itemsListName());
    this.pDisappearAfterTaking = 0;
    this.params = new Array(this.pItemName,this.pDisappearAfterTaking);
    
    this.getObject = function() {
        var obj={
            type : this.getType(),
            item_name : this.pItemName,
            disappear_after_taking : this.pDisappearAfterTaking,
        }
        return obj;
    }                                 
    this.setParams = function(parentIdParameters) {
        var parentParams = $("#"+parentIdParameters)[0];
        // configuration      
        var params = new Array();
        params[0] = new Property("a_item_name", "select", "Item name: ", "");
        params[0].setClassName(this.propertyLiClass);
        params[0].setOptionOfSelect(itemsContainer.itemsListName());
        params[0].showButtonDialog = true;
        params[0].callbackButtonDialog = function(property) { 
			itemsContainer.setFocusForName(that.pItemName);
            itemsContainer.showDialog();
			itemsContainer.setCallbackButtonOK(function(){
				console.log(itemsContainer.getFocus());
				that.callbackParams(params[0], itemsContainer.getFocus());				
			});       
        };                       
        params[1] = new Property("a_disappear_after_taking", "checkbox", "Disappear after taking: ");
        params[1].setClassName(this.propertyLiClass);
        params[1].setTemplate(380,160);  
        params[1].callbackChangeValue = this.callbackParams;
             
        // display
        this.displayParams(params, parentParams);      
        params[0].setValue(this.pItemName);              
        params[1].setCheckbox(this.pDisappearAfterTaking);
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params);
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == "a_item_name") {
            that.pItemName = value;
        } else if (propertyObj.id == "a_disappear_after_taking") {
            that.pDisappearAfterTaking = propertyObj.getChecked("a_disappear_after_taking");        
        }
        that.container.refreshWithCallback(that);        
    }       
    /*this.getTreeName = function() {
        return this.stringName+" "+this.pItemName;
    } */   
    this.getInfo = function() { 
        this.setKeyValueInfo("name",'"'+this.pItemName+'"');          
        this.setKeyValueInfo("disappear after taking",'"'+this.pDisappearAfterTaking+'"');          
        return this.getInfoString();        
    }
}   
TakeItemAction.prototype = Object.create(BaseAction.prototype); 

function DropItemAction(_parent) {
    var that = this;    
    this.parent = _parent;
	this.arrayInfo = new Array();
    this.type = ACTIONS_DROP_ITEM;
    this.stringName = "Drop item";    
    this.allowHasChildren = true;
    this.children = new Array();
    this.pItemName = firstElementOfArray(itemsContainer.itemsListName());
    this.pLeaveAfterDrop = 0;
    this.params = new Array(this.pItemName);
    
    this.getObject = function() {
        var obj={
            type : this.getType(),
            item_name : this.pItemName,
            leave_after_drop : this.pLeaveAfterDrop,
            events : arrayObjectsFromArrayAction(this.getChildren())
        }
        return obj;
    }                  
    this.displayActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
                         ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_TPOPUP,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
                         ACTIONS_INITIATE_CONVERSATION);
    this.clickableActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
                         ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_TPOPUP,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
                         ACTIONS_INITIATE_CONVERSATION);   
    this.enabledActions = new Array(ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,ACTIONS_RUN_XML,ACTIONS_GO_BACK,
                         ACTIONS_PLAY_MP3,ACTIONS_STOP_MP3,ACTIONS_SHOW_IMAGE,ACTIONS_SHOW_TPOPUP,ACTIONS_SHOW_POPOVER,ACTIONS_SHOW_GALLERY,
                         ACTIONS_INITIATE_CONVERSATION);                  
    this.setParams = function(parentIdParameters) {
        var parentParams = $("#"+parentIdParameters)[0];
        // configuration      
        var params = new Array();
        params[0] = new Property("a_item_name", "select", "Item name ");
        params[0].setClassName(this.propertyLiClass);
        //params[0].inputClass = "select_styled3"; 
        params[0].setOptionOfSelect(itemsContainer.itemsListName());       
        params[1] = new Property("a_leave_after_drop", "checkbox", "Leave item after drop ");
        params[1].setClassName(this.propertyLiClass)   
        params[1].setTemplate(280,160);             
        params[1].callbackChangeValue = this.callbackParams;              
        // display
        this.displayParams(params, parentParams);      
        params[0].setValue(this.pItemName);    
        params[1].setCheckbox(this.pLeaveAfterDrop);  
                          
        // set events
        this.setParamsCallback(params);
        this.refreshParamsActions(params);
    }    
    this.callbackParams = function(propertyObj,value) {
        if (propertyObj.id == "a_item_name") {
            that.pItemName = value;
        } else if (propertyObj.id == "a_leave_after_drop") {
            that.pLeaveAfterDrop = propertyObj.getChecked();
        } 
        that.container.refreshWithCallback(that);        
    }                
    /*this.getTreeName = function() {
        return this.stringName+" "+this.pItemName;
    } */    
    this.getInfo = function() { 
        this.setKeyValueInfo("name",'"'+this.pItemName+'"');          
        this.setKeyValueInfo("leave after drop",'"'+this.pLeaveAfterDrop+'"');          
        return this.getInfoString();        
    }
}   
DropItemAction.prototype = Object.create(BaseAction.prototype); 

function BaseAction() {
}
BaseAction.prototype.uniqueId = 0;
BaseAction.prototype.container = undefined;
BaseAction.prototype.parent = undefined;
BaseAction.prototype.stringName = "Base Action";
BaseAction.prototype.propertyLiClass = "menu_property";
BaseAction.prototype.params = new Array();
BaseAction.prototype.children = new Array();
BaseAction.prototype.allowHasChildren = false;
BaseAction.prototype.arrayInfo = new Array();
BaseAction.prototype.getStringName = function() {
    return this.stringName;
}
BaseAction.prototype.getTreeName = function() {
    return this.stringName;
}
BaseAction.prototype.getObject = function() {
    var obj= undefined;
    return obj;
}
BaseAction.prototype.getType = function() { 
    return this.type; 
}
BaseAction.prototype.canHasChildren = function() {
    return this.allowHasChildren;
}
BaseAction.prototype.getChildren = function() {
    return this.children;
}
BaseAction.prototype.setKeyValueInfo = function(key, value) { 
    var isKey = false;
    for(var i=0; i < this.arrayInfo.length; i++) {
        if (this.arrayInfo[i].key == key) {
            isKey = true;
            this.arrayInfo[i].value = value;
        }
    }    
    if (!isKey) {
        var keyVal = new Object();
        keyVal.key = key;
        keyVal.value = value;
        this.arrayInfo.push(keyVal);
    }
}
BaseAction.prototype.getInfoString = function() { 
    if (!this.arrayInfo || this.arrayInfo.length == 0) {
        return "";
    }
    var result = "(";
    for(var i=0; i < this.arrayInfo.length; i++) {
        if (i>0) {
           result += ", "; 
        }
        var keyVal = this.arrayInfo[i];
        result += keyVal.key+" = "+keyVal.value;
    }
    result += ")";
    return result;
}
BaseAction.prototype.getInfo = function() {
    return "";
}
BaseAction.prototype.setParams = function(parentIdParameters,containr) {        
}
BaseAction.prototype.displayParams = function(paramsArray, parent) {
    if (!parent) {
        return;
    }    
    parent.innerHTML = "<br />";
    for(var i=0; i < paramsArray.length; i++) {
        var param = paramsArray[i];
        parent.appendChild(param.getElement());          
    }    
}  
BaseAction.prototype.setParamsCallback = function(paramsArray) {    
    for(var i=0; i < paramsArray.length; i++) {
        var param = paramsArray[i];
        param.callbackChangeValue = this.callbackParams;
    }    
}  
BaseAction.prototype.refreshParamsActions = function(paramsArray) {    
    for(var i=0; i < paramsArray.length; i++) {
        paramsArray[i].refreshActions();
    }    
}  
BaseAction.prototype.callbackParams = function(propertyObj,value) {    
}
BaseAction.prototype.addChild = function(childNode) {
    if (this.canHasChildren()) {
        this.children.push(childNode);
    }
}   
BaseAction.prototype.removeChild = function(childNode) {
    if (this.canHasChildren()) {
        var index = this.children.indexOf(childNode);
        this.children.splice(index,1);
    }
} 
BaseAction.prototype.displayActions = new Array();  // visible/hidden action
BaseAction.prototype.clickableActions = new Array();// set actions available to choose
BaseAction.prototype.enabledActions = new Array(); // enabled/disable action
 
