var BoardsManager = new BoardsManager();
var canDisplayEmuView = true;

var Editor = {
    definitions: new CodeEditorDefinitions(),    
    statements: new CodeEditorStatements(),
    indexActiveBoard: -1,  // active board during compilation 
    timeIntervalList: [], 
    timeOutList: [], 
    filenameList: [],
	cacheImgs: [],
    alertQueue: [],
    canOpenAlert: true,
    mappingActions: new Array([ACTIONS_ONCLICK,EDITOR_ONCLICK],
                              [ACTIONS_ONDROP,EDITOR_ONDROP],
                              [ACTIONS_SHOW_ELEMENT,EDITOR_SHOW_OBJECT],
                              [ACTIONS_HIDE_ELEMENT,EDITOR_HIDE_OBJECT],
                              [ACTIONS_RUN_XML,EDITOR_GO_TO_BOARD],
                              [ACTIONS_PLAY_MP3,EDITOR_PLAY_MP3],
                              [ACTIONS_STOP_MP3,EDITOR_STOP_MP3],
                              [ACTIONS_SHOW_IMAGE,EDITOR_SHOW_IMAGE],
                              [ACTIONS_SHOW_TPOPUP,EDITOR_SHOW_POPUP],
                              [ACTIONS_INITIATE_CONVERSATION,EDITOR_INITIATE_CONVERSATION],
                              [ACTIONS_TAKE_ITEM,EDITOR_TAKE_ITEM],
                              [ACTIONS_DROP_ITEM,EDITOR_DROP_ITEM] ),
    uniqueId: 0,
    blockedAddedToObjectsEditor: false,
    editorObjects: new Array(),
    removeObjectsNotRelatedWithCanvas: function() {
        if (this.editorObjects.length > 0) {
            for(var i=this.editorObjects.length-1; i >= 0; i--) {
                if (this.editorObjects[i].type != ELEMENT_TYPE_BOARD && !this.editorObjects[i].getElement()) {
                    this.editorObjects.splice(i, 1);
                } else if (this.editorObjects[i].type == ELEMENT_TYPE_BOARD) {
                    this.editorObjects.splice(i, 1);
                }                            
            }
        }
        //this.editorObjects.splice(0,this.editorObjects.length);
    },
    removeObjectWithName: function(name) {
        if (this.editorObjects.length > 0) {
            for(var i=this.editorObjects.length-1; i >= 0; i--) {
                if (this.editorObjects[i].name == name) {
                    this.editorObjects.splice(i, 1);
                }                            
            }
        }
        //this.editorObjects.splice(0,this.editorObjects.length);
    },    
    removeObjectsActions: function() {
        if (this.editorObjects.length > 0) {
            for(var i=this.editorObjects.length-1; i >= 0; i--) {
                if (this.editorObjects[i].type == ELEMENT_TYPE_CLICKABLE_AREA ||
                    this.editorObjects[i].type == ELEMENT_TYPE_BUTTON) {
                    this.editorObjects[i].removeActions();
                }                            
            }
        }
        //this.editorObjects.splice(0,this.editorObjects.length);
    },   
    setEmptyStartForAllBoard: function() {   
        if (this.editorObjects.length > 0) {
            for(var i=this.editorObjects.length-1; i >= 0; i--) {
                if (this.editorObjects[i].type == ELEMENT_TYPE_BOARD) {
                    this.editorObjects[i].start = 0;
                }                            
            }
        }
    },      
    boardStarted: function() {  
        if (this.editorObjects.length > 0) {
            for(var i=this.editorObjects.length-1; i >= 0; i--) {
                if (this.editorObjects[i].type == ELEMENT_TYPE_BOARD && this.editorObjects[i].start) {
                    return this.editorObjects[i];
                }                            
            }
        }
        return undefined;
    },          
    bindObjectTypeToElement: function(type, element) { //area, element) {
        if (element && 
            (type == ELEMENT_TYPE_CLICKABLE_AREA || type == ELEMENT_TYPE_TEXT || type == ELEMENT_TYPE_TEXTEDIT || 
             type == ELEMENT_TYPE_BUTTON || type == ELEMENT_TYPE_IMAGE )) {           
            
            for(var i=0; i < this.editorObjects.length; i++) {
                if (element == this.editorObjects[i].getElement()) {
                    return this.editorObjects[i];
                }                 
            }      
            if (type == ELEMENT_TYPE_CLICKABLE_AREA) {    
                var area = new ClickableArea();
                area.name = element.dataset.designName;
                area.setElement(element); 
                return area;
            }
            if (type == ELEMENT_TYPE_TEXT) {    
                var textfield = new TextField();
                textfield.name = element.dataset.designName;
                textfield.setElement(element); 
                return textfield;
            }  
            if (type == ELEMENT_TYPE_TEXTEDIT) {    
                var textEdit = new TextEdit();
                textEdit.name = element.dataset.designName;
                textEdit.setElement(element); 
                return textEdit;
            } 
            if (type == ELEMENT_TYPE_BUTTON) {    
                var button = new Button();
                button.name = element.dataset.designName;
                button.setElement(element); 
                return button;
            }     
            if (type == ELEMENT_TYPE_IMAGE) {    
                var image = new Image();
                image.name = element.dataset.designName;
                image.setElement(element); 
                return image;
            }                                             
        }
        return undefined;
    },
    isObjectWithName: function(type, variableName) {
        if (type && variableName) {
            for(var i=0; i < this.editorObjects.length; i++) {
                if (type == this.editorObjects[i].type && variableName == this.editorObjects[i].name) {
                    return true;
                } 
            }
        }
        return false;
    },        
    removeObjectTypeByElement: function(type, element) {    
        if (type && element) {
            for(var i=0; i < this.editorObjects.length; i++) {
                if (type == this.editorObjects[i].type && element == this.editorObjects[i].getElement()) {                    
                    var index = this.editorObjects.indexOf(this.editorObjects[i]);
                    if (index > -1) {
                        this.editorObjects.splice(index,1);
                    }
                } 
            }
        }
    },
    objectByEmuId: function(emuId) {
        for(var i=0; i < this.editorObjects.length; i++) {
            if (emuId == this.editorObjects[i].emuId) {
                return this.editorObjects[i];
            } 
        }
        return undefined;
    },  
    objectByName: function(name) {
        for(var i=0; i < this.editorObjects.length; i++) {
            if (name == this.editorObjects[i].name) {
                return this.editorObjects[i];
            } 
        }
        return undefined;
    }, 
    objectByNameAndBoardName: function(name, boardName) {
        for(var i=0; i < this.editorObjects.length; i++) {
            if (name == this.editorObjects[i].name && this.editorObjects[i].parent && this.editorObjects[i].parent.name && this.editorObjects[i].parent.name == boardName) {
                return this.editorObjects[i];
            } 
        }
        return undefined;
    },    
    boards: function(name) {
        for(var i=0; i < this.editorObjects.length; i++) {
            if (name == this.editorObjects[i].name && this.editorObjects[i].type == ELEMENT_TYPE_BOARD) {
                return this.editorObjects[i];
            } 
        }
        return undefined;
    },       
    objectIndexByName: function(name) {
        for(var i=0; i < this.editorObjects.length; i++) {
            if (name == this.editorObjects[i].name) {
                return i;
            } 
        }
        return -1;
    },     
    objectByIndex: function(index) {
        if (index > -1 && index < this.editorObjects.length) {
            return this.editorObjects[index];
        }
        return undefined;
    },
    mappingActionEditorToEmulator: function(actionType) {
        for(var i=0; i < this.mappingActions.length; i++) {
            if (this.mappingActions[i][0] == actionType) {
               return this.mappingActions[i][1];
            }
        }
        return undefined;
    },
    mappingActionEmulatorToEditor: function(actionType) {
        for(var i=0; i < this.mappingActions.length; i++) {
            if (this.mappingActions[i][1] == actionType) {
               return this.mappingActions[i][0];
            }
        }
        return undefined;
    },        
    clearTimes: function() {
        for(var i=0; i < Editor.timeIntervalList.length; i++) {
            var instance = Editor.timeIntervalList[i];
            clearInterval(instance);
        }
        for(var i=0; i < Editor.timeOutList.length; i++) {
            var instance = Editor.timeOutList[i];
            clearTimeout(instance);
        }
    },
    clearFiles: function() {
        this.filenameList.length = 0;
    },
	clearImages: function() {
		this.cacheImgs.length = 0;
	},
    clearAlertQueue: function() {
        this.canOpenAlert = true;
        this.alertQueue.length = 0;
    }
}


function BoardObject() {
}
BoardObject.prototype.isBoardObject = true;
BoardObject.prototype.emuId = "emu_id";
BoardObject.prototype.isAddToFront = false;
BoardObject.prototype.bringToFront = function() {
    var that = this;
    setTimeout(function() {
        var elem = document.getElementById(that.emuId);
        if (elem) {            
            $(elem).parent().append(elem);
        } else {
            this.isAddToFront = true;
        }        
    }, 100);
}   
BoardObject.prototype.tryAddToFront = function() {
    if (this.isAddToFront) {
        this.bringToFront();
    }
    this.isAddToFront = false;
}


function BoardObjectAction() {}
BoardObjectAction.prototype.onclick = function() {};  
BoardObjectAction.prototype.keydown = function() {}; 
BoardObjectAction.prototype.keydownParam = "";
BoardObjectAction.prototype.actions = new Actions();
BoardObjectAction.prototype.addOnClickAction = function(options, options2) {
    this.addAction(EDITOR_ONCLICK, options, options2);
}
BoardObjectAction.prototype.addAction = function(typeAction, options, options2) { // addAction("onclick",{action:"show_object", name: "name"});    
    switch(typeAction) {
        case EDITOR_ONCLICK:
            if (options && typeof options === "function") {
                this.onclick = options;                    
            } else if (options && typeof options !== "function" && options.action) {
                var tempOnclick = this.actions.getOnclick();
                var addAction = null;                    
                if (options.action == EDITOR_SHOW_OBJECT) {
                    addAction = this.actions.addActionForActionParent(ACTIONS_SHOW_ELEMENT, tempOnclick);
                    if (addAction && options.name) {
                        addAction.name = options.name;
                    } 
                    if (addAction && options.key) {
                        addAction.key = options.key;
                    }                     
                } 
                if (options.action == EDITOR_HIDE_OBJECT) {
                    addAction = this.actions.addActionForActionParent(ACTIONS_HIDE_ELEMENT, tempOnclick);
                    if (addAction && options.name) {
                        addAction.name = options.name;
                    }
                    if (addAction && options.key) {
                        addAction.key = options.key;
                    }                     
                }                    
                if (options.action == EDITOR_GO_TO_BOARD) {
                    addAction = this.actions.addActionForActionParent(ACTIONS_RUN_XML, tempOnclick);
                    if (addAction && options.name) {
                        addAction.name = options.name;
                    }
                    if (addAction && options.key) {
                        addAction.key = options.key;
                    }                     
                }  
                if (options.action == EDITOR_PLAY_MP3) {
                    addAction = this.actions.addActionForActionParent(ACTIONS_PLAY_MP3, tempOnclick);
                    if (addAction && options.name) {
                        addAction.name = options.name;
                    }
                    if (addAction && options.key) {
                        addAction.key = options.key;
                    }                    
                    if (addAction && options.loop) {
                        addAction.loop = options.loop;
                    }                                             
                }  
                if (options.action == EDITOR_STOP_MP3) {
                    addAction = this.actions.addActionForActionParent(ACTIONS_STOP_MP3, tempOnclick);
                    if (addAction && options.key) {
                        addAction.key = options.key;
                    }                                                                
                }                      
                if (options.action == EDITOR_SHOW_IMAGE) {
                    addAction = this.actions.addActionForActionParent(ACTIONS_SHOW_IMAGE, tempOnclick);
                    if (addAction && options.name) {
                        addAction.pImage = options.name;
                    }
                    if (addAction && options.key) {
                        addAction.key = options.key;
                    }                     
                }                                                           
                if (options.action == EDITOR_INITIATE_CONVERSATION) {
                    addAction = this.actions.addActionForActionParent(ACTIONS_INITIATE_CONVERSATION, tempOnclick);
                    if (addAction && options.name) {
                        addAction.pName = options.name;
                    }                   
                    if (addAction && options.key) {
                        addAction.key = options.key;
                    }                                            
                }                                                           
            }               
            break;            
        case EDITOR_ONDROP:
            var tempOndrop = this.actions.getOndrop();
            if (options) {
                //options.action = EDITOR_DROP_ITEM;
                //var addAction = null;                                        
                //if (options.action == EDITOR_DROP_ITEM) {
                //    this.actions.addActionForActionParent(ACTIONS_DROP_ITEM, ondrop);
                //    if (options.name) {
                //        addAction.pItemName = options.name;
                //    }
                //}
            }               
            break;
        case EDITOR_KEYDOWN:
            if (options && options2 && typeof options === "string" && typeof options2 === "function") {
                this.keydownParam = options;                    
                this.keydown = options2;
            }
            break;
        default:
            throw new EditorError("addAction: Unknown parameter "+typeAction);
            break;   
    }
} //    //EditorObject.updateActionsByTypeAction(typeAction, options, that.actions);
/*this.addAction = function(typeAction, options) {  
    if (typeof options === "function") {
        that.onclick = options;
    } else {
        EditorObject.updateActionsByTypeAction(typeAction, options, that.actions);
    }
}    */

//BoardObject.prototype.updateActionsByTypeAction = function(typeAction, options, actionsTreeInstance) {

//};

BoardObjectAction.prototype.countActions = function(actionType) {
    switch(actionType) {
        case EDITOR_ONCLICK:
            var tempOnclick = this.actions.getOnclick();
            console.log(tempOnclick);
            return tempOnclick.children.length;
            break;            
        case EDITOR_ONDROP:
            var tempOndrop = this.actions.getOndrop();
            return tempOndrop.children.length;
            break;         
        default:
            throw new EditorError("addAction: Unknown parameter "+actionType);
            break;   
    }  
}   

function ClickableArea(x, y, width, height, image, visible) {
    var that = this;
	this.parent = Editor.objectByIndex(Editor.indexActiveBoard);
    this.uniqueId = Editor.uniqueId++;
    this.emuId = "emu_area"+this.uniqueId;
    this.name = "name";
    this.type = ELEMENT_TYPE_CLICKABLE_AREA;
    this.x = x?(x):0;
    this.y = y?(y):0;
    this.width = width?(width):0;
    this.height = height?(height):0;
    this.image = image?(image):"";
    this.visible = visible?(1):1;
    this.actions = new Actions();
    var element = undefined;   


    var canChangeValueOnCanvas = function() {
        return false;//(codeEditor.manager.compilationStatus == COMPILATION_STATUS_GENERATED_CODE);// ||
        //codeEditor.manager.compilationStatus == COMPILATION_STATUS_DONE;
    }

    this.watch('x', function(prop, oldValue, newValue) {        
        if (canChangeValueOnCanvas()) {
            var param = { x_pos: newValue }
            setStyleOfElement(that.getElement(), param);
        }
        browserEmulator.setObject("option", that, {x:newValue});
        return newValue;
    });
    this.watch('y', function(prop, oldValue, newValue) {
        if (canChangeValueOnCanvas()) {
            var param = { y_pos: newValue }
            setStyleOfElement(that.getElement(), param);
        }        
        browserEmulator.setObject("option", that, {y:newValue});                              
        return newValue;
    }); 
    this.watch('width', function(prop, oldValue, newValue) {   
        if (canChangeValueOnCanvas()) {     
            var param = { width: newValue }
            setStyleOfElement(that.getElement(), param);
        }
        browserEmulator.setObject("option", that, {width:newValue});
        return newValue;
    });       
    this.watch('height', function(prop, oldValue, newValue) {     
        if (canChangeValueOnCanvas()) {  
            var param = { height: newValue }
            setStyleOfElement(that.getElement(), param);
        }
        browserEmulator.setObject("option", that, {height:newValue});
        return newValue;
    });
    this.watch('visible', function(prop, oldValue, newValue) {    
        if (canChangeValueOnCanvas()) {            
            var param = { visible: newValue }
            setStyleOfElement(that.getElement(), param);
        }
        browserEmulator.setObject("option", that, {visibility:newValue});        
        return newValue;
    }); 
    this.watch('image', function(prop, oldValue, newValue) { 
        if (canChangeValueOnCanvas()) {               
            var param = { area_image: newValue }
            setStyleOfElement(that.getElement(), param);
        }
        browserEmulator.setObject("option", this, {image: newValue});
        //loadImage(newValue);
        return newValue;
    });             
    
    
    if (!Editor.blockedAddedToObjectsEditor) {
        Editor.editorObjects.push(this);
    }           
    
    this.setElement = function(elem) {
        element = elem;         
    }  
     
    this.getElement = function() {
        return element;
    }     
    
    /*this.addAction = function(typeAction, options) {  // addAction("onclick",{action:"show_object", name: "name"});
        if (typeof options === "function") {
            that.onclick = options;
        } else {
            EditorObject.updateActionsByTypeAction(typeAction, options, that.actions);
        }
    }    

    this.countActions = function(actionType) {
        EditorObject.countActions(actionType, that.actions);
    } */   

    this.removeActions = function() {//actionType) {
        this.actions.setByJSON("[]", true);
    }       
    
   // this.sendToBack = function() {
   // }       
}
ClickableArea.prototype = Object.create(BoardObject.prototype);
//mixin(ClickableArea.prototype, BoardObjectAction.prototype);
$.extend(true,ClickableArea.prototype, BoardObjectAction.prototype);

function TextField(x, y, width, height, text, textColor, fontSize, fontType, visible) {    
    var that = this;
	this.parent = Editor.objectByIndex(Editor.indexActiveBoard);
    this.uniqueId = Editor.uniqueId++;
    this.emuId = "emu_label"+this.uniqueId;
    this.name = "name";
    this.type = ELEMENT_TYPE_TEXT;
    this.x = x?(x):0;
    this.y = y?(y):0;
    this.width = width?(width):0;
    this.height = height?(height):0;
    this.text = text?(text):"";
    this.textColor = textColor?(textColor):"0,0,0";
    this.fontSize = fontSize?(fontSize):12;
    this.fontType = fontType?(fontType):"Helvetica";
    this.visible = visible?(1):1;
    var element = undefined;              
       
    this.watch('x', function(prop, oldValue, newValue) {        
        browserEmulator.setObject("option", that, {x:newValue});
        return newValue;
    });
    this.watch('y', function(prop, oldValue, newValue) {       
        browserEmulator.setObject("option", that, {y:newValue});                              
        return newValue;
    }); 
    this.watch('width', function(prop, oldValue, newValue) {   
        browserEmulator.setObject("option", that, {width:newValue});
        return newValue;
    });       
    this.watch('height', function(prop, oldValue, newValue) {     
        browserEmulator.setObject("option", that, {height:newValue});
        return newValue;
    });
    this.watch('visible', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {visibility:newValue});        
        return newValue;
    });   
    this.watch('text', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {text:newValue});        
        return newValue;
    });
    this.watch('textColor', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {textColor:newValue});        
        return newValue;
    });                   
    this.watch('fontSize', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {fontSize:newValue});        
        return newValue;
    });                   
    this.watch('fontType', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {fontType:newValue});        
        return newValue;
    });                   
          
    if (!Editor.blockedAddedToObjectsEditor) {
        Editor.editorObjects.push(this);
    }            
          
    this.setElement = function(elem) {
        element = elem;           
    }  

    this.getElement = function() {
        return element;
    }         
}
TextField.prototype = Object.create(BoardObject.prototype);

function TextEdit(x, y, width, height, text, textColor, fontSize, fontType, visible) {
    var that = this;
	this.parent = Editor.objectByIndex(Editor.indexActiveBoard);
    this.uniqueId = Editor.uniqueId++;
    this.emuId = "emu_textedit"+this.uniqueId;
    this.name = "name";
    this.type = ELEMENT_TYPE_TEXTEDIT;
    this.x = x?(x):0;
    this.y = y?(y):0;
    this.width = width?(width):0;
    this.height = height?(height):0;
    this.text = text?(text):"";
    this.textColor = textColor?(textColor):"0,0,0";
    this.fontSize = fontSize?(fontSize):12;
    this.fontType = fontType?(fontType):"Helvetica";
    this.visible = visible?(1):1;   
    var element = undefined; 
        
    this.watch('x', function(prop, oldValue, newValue) {        
        browserEmulator.setObject("option", that, {x:newValue});
        return newValue;
    });
    this.watch('y', function(prop, oldValue, newValue) {       
        browserEmulator.setObject("option", that, {y:newValue});                              
        return newValue;
    }); 
    this.watch('width', function(prop, oldValue, newValue) {   
        browserEmulator.setObject("option", that, {width:newValue});
        return newValue;
    });       
    this.watch('height', function(prop, oldValue, newValue) {     
        browserEmulator.setObject("option", that, {height:newValue});
        return newValue;
    });
    this.watch('visible', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {visibility:newValue});        
        return newValue;
    });   
    this.watch('text', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {text:newValue});        
        return newValue;
    });
    this.watch('textColor', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {textColor:newValue});        
        return newValue;
    });                   
    this.watch('fontSize', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {fontSize:newValue});        
        return newValue;
    });                   
    this.watch('fontType', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {fontType:newValue});        
        return newValue;
    });   
    
    if (!Editor.blockedAddedToObjectsEditor) {
        Editor.editorObjects.push(this);
    }                      
          
    this.setElement = function(elem) {
        element = elem;           
    }  

    this.getElement = function() {
        return element;
    }         
}
TextEdit.prototype = Object.create(BoardObject.prototype);

function Button(x, y, width, height, background, text,  textColor, fontSize, fontType, visible) {
    var that = this;
    this.parent = Editor.objectByIndex(Editor.indexActiveBoard);
    this.uniqueId = Editor.uniqueId++;
    this.emuId = "emu_button"+this.uniqueId;
    this.name = "name";
    this.type = ELEMENT_TYPE_BUTTON;
    this.x = x?(x):0;
    this.y = y?(y):0;
    this.width = width?(width):0;
    this.height = height?(height):0;
    this.background = background?(background):"";
    this.text = text?(text):"";
    this.textColor = textColor?(textColor):"0,0,0";
    this.fontSize = fontSize?(fontSize):12;
    this.fontType = fontType?(fontType):"Helvetica";
    this.visible = visible?(1):1; 
    this.actions = new Actions();  
    var element = undefined;     
              
    this.watch('x', function(prop, oldValue, newValue) {        
        browserEmulator.setObject("option", that, {x:newValue});
        return newValue;
    });
    this.watch('y', function(prop, oldValue, newValue) {       
        browserEmulator.setObject("option", that, {y:newValue});                              
        return newValue;
    }); 
    this.watch('width', function(prop, oldValue, newValue) {   
        browserEmulator.setObject("option", that, {width:newValue});
        return newValue;
    });       
    this.watch('height', function(prop, oldValue, newValue) {     
        browserEmulator.setObject("option", that, {height:newValue});
        return newValue;
    });
    this.watch('visible', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {visibility:newValue});        
        return newValue;
    });   
    this.watch('text', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {text:newValue});        
        return newValue;
    });
    this.watch('background', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {background:newValue});        
        return newValue;
    });                       
    this.watch('textColor', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {textColor:newValue});        
        return newValue;
    });                   
    this.watch('fontSize', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {fontSize:newValue});        
        return newValue;
    });                   
    this.watch('fontType', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {fontType:newValue});        
        return newValue;
    });     
    
    if (!Editor.blockedAddedToObjectsEditor) {
        Editor.editorObjects.push(this);
    }                    
          
    this.setElement = function(elem) {
        element = elem;           
    }  

    this.getElement = function() {
        return element;
    }
    
    
    //if (browserEmulator) {
    //    browserEmulator.displayObject(this);
    //
    
    /*this.addAction = function(typeAction, options) {  // addAction("onclick",{action:"show_object", name: "name"});
        if (typeof options === "function") {
            that.onclick = options;
        } else {
            EditorObject.updateActionsByTypeAction(typeAction, options, that.actions);
        }
    }
    this.countActions = function(actionType) {
        EditorObject.countActions(actionType, that.actions);
    }    */

    this.removeActions = function() {//actionType) {
        this.actions.setByJSON("[]", true);
    }
}
Button.prototype = Object.create(BoardObject.prototype);
//mixin(Button.prototype, BoardObjectAction.prototype); 
$.extend(true, Button.prototype, BoardObjectAction.prototype);


function Image(x, y, width, height, image, visible) {
    var that = this;
    this.parent = Editor.objectByIndex(Editor.indexActiveBoard);
    this.uniqueId = Editor.uniqueId++;
    this.emuId = "emu_image"+this.uniqueId;
    this.name = "name";
    this.type = ELEMENT_TYPE_IMAGE;
    this.x = x?(x):0;
    this.y = y?(y):0;
    this.width = width?(width):0;
    this.height = height?(height):0;
    this.image = image?(image):"";
    this.visible = visible?(1):1;
    var element = undefined;   


    this.watch('x', function(prop, oldValue, newValue) {        
        browserEmulator.setObject("option", that, {x:newValue});
        return newValue;
    });
    this.watch('y', function(prop, oldValue, newValue) {      
        browserEmulator.setObject("option", that, {y:newValue});                              
        return newValue;
    }); 
    this.watch('width', function(prop, oldValue, newValue) {   
        browserEmulator.setObject("option", that, {width:newValue});
        return newValue;
    });       
    this.watch('height', function(prop, oldValue, newValue) {     
        browserEmulator.setObject("option", that, {height:newValue});
        return newValue;
    });
    this.watch('visible', function(prop, oldValue, newValue) {    
        browserEmulator.setObject("option", that, {visibility:newValue});        
        return newValue;
    }); 
    this.watch('image', function(prop, oldValue, newValue) { 
        browserEmulator.setObject("option", this, {file_name: newValue});
        //loadImage(newValue);
        return newValue;
    });             
    
    
    if (!Editor.blockedAddedToObjectsEditor) {
        Editor.editorObjects.push(this);
    }           
    
    this.setElement = function(elem) {
        element = elem;         
    }  
     
    this.getElement = function() {
        return element;
    }     
    
}
Image.prototype = Object.create(BoardObject.prototype);


function EditorError(message) {
    this.name = "EditorError";
    this.message = message;
}
EditorError.prototype = Error.prototype;

function BoardsManager() { 
    this.boardByName = function(name) {
        var id = application.getScreenParamByParam("id", "name", name);
        if (name && id) {            
            var tempBoard = new Board();
            tempBoard.id = id;
            return tempBoard;   
        } else {
            throw new EditorError("Doesn't exists board for name '"+name+"'");
        }
    }
}


function Board(options) {    
    var instance = this;
    this.uniqueId = Editor.uniqueId++;
    this.type = ELEMENT_TYPE_BOARD;
      
    //var userCode;
    //var generatedCode; 
    this.screenId = 0;
    this.name;
    
    this.x = 0;
    this.y = 0;
    this.background = "";
    this.sound = "";
    this.panelItems = 0;    
    //this.start = 0;
    
	var qEmuBoard = $("#"+browserEmulator.idEmuBoard);
	
    this.emuDOM = document.createElement("div"); 
    qEmuBoard.append(this.emuDOM);
    this.emuId = "emu_board"+this.uniqueId;    
    this.emuDOM.id = this.emuId;
    //this.emuDOM.innerHTML = ""+this.emuId;
	$(this.emuDOM).addClass("emulator_background");
	$(this.emuDOM).css({"display": "none"});

    this.emuCanvasDOM = document.createElement("canvas");
	qEmuBoard.append(this.emuCanvasDOM);
    this.emuIdCanvas = this.emuId+"_canvas";       
    this.emuCanvasDOM.id = this.emuIdCanvas;
	$(this.emuCanvasDOM).addClass("emulator_canvas_surface");
    $(this.emuCanvasDOM).css({"display": "none", "width": canvas.IPAD_RESOLUTION_X+"px", "height": canvas.IPAD_RESOLUTION_Y+"px"});
    $(this.emuCanvasDOM)[0].width = canvas.IPAD_RESOLUTION_X;
    $(this.emuCanvasDOM)[0].height = canvas.IPAD_RESOLUTION_Y;
    
    if (browserEmulator) {
        browserEmulator.setCurrentBoard(this);
    }
    
    Editor.indexActiveBoard = Editor.editorObjects.length;
    Editor.editorObjects.push(this);
    
    if (options && options.code) {  
        eval(options.code);
    }        

    this.watch('x', function(prop, oldValue, newValue) {
        if (newValue) {
            $(instance.emuDOM).css({ "background-position" : ""+newValue+"px "+instance.y+"px"});            
        }
        return newValue;
    });
    this.watch('y', function(prop, oldValue, newValue) {
        if (newValue) {
            $(instance.emuDOM).css({ "background-position" : ""+instance.x+"px "+newValue+"px"});            
        }
        return newValue;
    });    
    
    this.watch('background', function(prop, oldValue, newValue) {
        if (newValue) {
            $(instance.emuDOM).css({ "background-image":"url("+pathSystem+"'/media/upload/"+appId+"/img/"+newValue+"')", "width":"100%", "height": "100%", "background-repeat": "no-repeat"  }); //"width": canvas.IPAD_RESOLUTION_X+"px", "height": canvas.IPAD_RESOLUTION_Y+"px"});            
        }
        return newValue;
    });   
    
    this.setElement = function(elem) {
    }  

    this.getElement = function() {
        return undefined;
    }  
    
    this.run = function() {
        if (canDisplayEmuView) {
            hideConsole();
            Editor.setEmptyStartForAllBoard();
            instance.start = 1;
            goToBoard(instance.name);
        }
    }
    
    this.object = function(name) {
        var boardObject =  Editor.objectByName(name);
		
        if (boardObject && boardObject.type && boardObject.type != ELEMENT_TYPE_BOARD && boardObject.parent &&
            boardObject.parent.name == instance.name) {
            return boardObject;
        } else {
            showAlert("Error: Doesn't exists object '"+name+"' for Board '"+instance.name+"'.");
            throw new EditorError("Doesn't exists object '"+name+"' for Board '"+instance.name+"'.");
        }
    }
}

function Spreadsheet() {     
    var that = this;
	this.parent = null;
    this.uniqueId = Editor.uniqueId++;
    this.emuId = "emu_spread"+this.uniqueId;
    this.type = ELEMENT_TYPE_SPREADSHEET;
    this.name;
    this.cell = new Array();   // [row][cell]
    for(var i=0; i < 100; i++) {
        this.cell.push(new Array());
    }
    
    Editor.editorObjects.push(this);
      
    this.setElement = function(elem) {           
    }  

    this.getElement = function() {
        return undefined;
    }        
      
      
      
    /*    
    name: function(name) {
        var that = this;
        that.spreadsheet = spreadsheetsContainer.spreadsheetsForName(name);
        if (!that.spreadsheet) {
            throw new EditorError("Doesn't exists spreadsheet for name '"+name+"'");
        }
        return {
            col: function(col) {
                var col = col.toString().toUpperCase();
                return {
                    row: function(row) {
                        row--;
                        col = parseInt(65 - col.charCodeAt(0));
                        if (col > -1 && row > -1) {
                            var val = that.spreadsheet.data[row][col];
                            if (!isNaN(val)) {
                                return parseInt(that.spreadsheet.data[row][col]);
                            } else {
                                return that.spreadsheet.data[row][col];
                            }
                        } else {
                            throw new EditorError("Doesn't exists row/col of spreadsheet for name '"+name+"'");
                            return undefined;
                        }
                    }
                }   
            }
        } 
    }
    */
}

function SpreadsheetExtended() {
    Spreadsheet.call(this);    
}
SpreadsheetExtended.prototype = Object.create(Spreadsheet.prototype);
SpreadsheetExtended.prototype.constructor = SpreadsheetExtended;
SpreadsheetExtended.prototype.sum = function(startRow, endRow, startCol, endCol) {
    var sum = 0;
    for(var row=startRow; row <= endRow; row++){
        for(var col=startCol; col <= endCol; col++){
            if (!isNaN(this.cell[row][col])) {
                sum += parseInt(this.cell[row][col]);
            }
        }
    }
    return sum;
}
SpreadsheetExtended.prototype.average = function(startRow, endRow, startCol, endCol) {
    var sum = 0;
    var countNumber = 0;
    for(var row=startRow; row <= endRow; row++){
        for(var col=startCol; col <= endCol; col++){
            if (!isNaN(this.cell[row][col])) {
                sum += parseInt(this.cell[row][col]);
                countNumber++;
            }
        }
    }
    if (countNumber == 0) {
        countNumber = 1;
    }
    return (sum / countNumber);
}

function EmptyObject() {
    
}

function File(filename) {
    var that = this;
    this.id = 0;
    this.filename = filename;
    this.text = "";
    
    if (!isExistStringInArray(filename, Editor.filenameList)) {
        Editor.filenameList.push(filename);
    } else {
        throw new EditorError("No access to the file "+filename+". File has already been opened.");
        return {};
    }
    
    AjaxTutorial.ajaxGetFile({
        async: false,
        data: {            
            app_id: appId,
            filename: that.filename,
        },
        success: function(text) {
           that.text = text; 
        }
    });
    
    var refreshValueAtServer = function() {
        AjaxTutorial.ajaxEditFile({
            async: false,
            data: {
                app_id: appId,
                filename: that.filename,
                text: that.text              
            },
            success: function() {
            }            
        });        
    }
    
    this.append = function(text) {
        that.text += text;
        refreshValueAtServer();
    }
    this.write = function(text) {
        that.text = text;
        refreshValueAtServer();
    }    
    this.read = function() {
        return that.text;
    }    
    this.remove = function() {
        this.text = "";
        refreshValueAtServer();
    }
    this.close = function() {
        removeObjectFromObjectsArray(filename, Editor.filenameList);
    }    
}

var Console = {
    write: function(text) {
        if (browserEmulator) {
            browserEmulator.consoleLogAddText(text);
        }
    },
    read: function(variableName) {
        if (browserEmulator) {
            browserEmulator.waitForUser = true;
            browserEmulator.consoleReadVariable = variableName;
        }
    }    
}

// requireStepByStep = false 
// isDebugger = false


function showConsole() {           
    if (browserEmulator && (!browserEmulator.isDebugger || codeEditor.manager.requireStepByStep) && canDisplayEmuView) {
        codeEditor.closeEditor();
        $("#editor").css({"display": "none"});
        browserEmulator.displayEmulator(true);    
        browserEmulator.showConsole();        
        browserEmulator.refreshConsole();
    }
}

function hideConsole() {
    if (browserEmulator) {
        browserEmulator.hideConsole();
        browserEmulator.waitForUser = false;
    }
}

function backEditorFor() {
    
}

function appFinished() {
    if (codeEditor) {
        $('#dialog_code_editor_debug').button('option', 'label', 'Close debuger view');
        $("#dialog_code_editor_next_step").hide();
    }
}

function showObject(name, boardName) {
    if (name) {
        var objToShow = Editor.objectByNameAndBoardName(name, boardName);
        if (objToShow) {
            browserEmulator.setObject("option", objToShow, {visibility: 1})
        }
    }
}
function hideObject(name, boardName) {
    if (name) {
        var objToHide = Editor.objectByNameAndBoardName(name, boardName);
        if (objToHide) {
            browserEmulator.setObject("option", objToHide, {visibility: 0})
        }
    }
}

function goToBoard(name) {
    //var boardId = application.getScreenParamByParam("id", "name", name);    
    //var background = application.getBackgroundByParam("background", "id", boardId);
    name = name.replace(" ", "_");
    
    var board = Editor.objectByName(name);
    
    //console.log(application.screenObjectList);
    //console.log(application.boardsList);
    //console.log(background);
    //console.log(boardId);
    
    if (board) {
        hideConsole();
        Editor.setEmptyStartForAllBoard();        
        browserEmulator.displayBoard(board);        
    } else {
        showAlert("Board with name '"+name+"' doesn't exist)");
    }     
}

function showImage(filename) {
    if (canDisplayEmuView && browserEmulator) {       
        browserEmulator.dialogs.openDialog(ACTIONS_SHOW_IMAGE, {image: pathSystem+"/media/upload/"+appId+"/img/"+filename});
    }
}
function showConversation(name) {
    if (canDisplayEmuView && browserEmulator) {       
        var html = conversationsContainer.getPreviewForName(name, {editor:true});
        if (html) {
            browserEmulator.dialogs.openDialog(ACTIONS_INITIATE_CONVERSATION, {html: html});
        }
    }
}
function showPopup(name) {
    if (canDisplayEmuView && browserEmulator) {    
        var objectPopup = popupsContainer.popupForName(name);
        if (objectPopup && objectPopup.description) {
            browserEmulator.dialogs.openDialog(ACTIONS_SHOW_TPOPUP, {description: objectPopup.description, title: objectPopup.title});
        }
    }
}
function playMp3(filename) {
    if (canDisplayEmuView && browserEmulator) {
        var elem_play_mp3 = document.createElement("span");
        //$("#emulator").append(elem_play_mp3);
        browserEmulator.sounds.push(elem_play_mp3);
        playSound(elem_play_mp3, pathSystem+"/media/upload/"+appId+"/sound/"+filename);  
    }  
}
function stopMp3() {
    for(var iS=0; iS < browserEmulator.sounds.length; iS++) {
        browserEmulator.sounds[iS].mp3.pause();                            
        $(browserEmulator.sounds[iS][0]).remove();                            
    } 
    browserEmulator.sounds.length = 0;
}
function showAlert(text, listener) {
    if (!canDisplayEmuView) {
        return;
    }

    if (text == undefined) {
        return;
    }
    if (!Editor.canOpenAlert) {
        Editor.alertQueue.unshift({
			text: text,
			listener: listener
		});
    }
    
    function closeDialog() {
        Editor.canOpenAlert = true;      
        var objAlert = Editor.alertQueue.pop();
        if (objAlert && objAlert.text != undefined){            
            showAlert(objAlert.text, objAlert.listener);
        }
    }
    
    if (Editor.canOpenAlert) {
        browserEmulator.dialogs.openDialog(ACTIONS_SHOW_ALERT, {
			text: text, 
			callbackClose: closeDialog, 
			listenerOKBtn: function() {
				if (listener && typeof listener === "function") {				
					listener();			
				}
				return true;
			}  
		});
        Editor.canOpenAlert = false;
    }

   //}       
}

function clearContext() {
    browserEmulator.clearContextSurface();   
}

function playMp3(filename) {
    var elem_play_mp3 = document.createElement("span");
    $("#emulator").append(elem_play_mp3);
    browserEmulator.sounds.push(elem_play_mp3);
    playSound(elem_play_mp3, pathSystem+"/media/upload/"+appId+"/sound/"+filename);    
}

function putPixel(x, y, weight, color) {
    var ctx = browserEmulator.getContextSurface();
    if (ctx) {
        if (!color) {
            color = "#000000";
        }
        if (!weight) {
            weight = 1;
        }
        ctx.fillStyle=color;
        ctx.fillRect(x,y,weight,weight);
    }     
}

function drawLine(x1, y1, x2, y2, weight, color) {
    var ctx = browserEmulator.getContextSurface();
    if (ctx) {
        if (!color) {
            color = "#000000";
        }
        if (!weight) {
            weight = 1;
        }
        ctx.strokeStyle=color;
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.lineWidth = weight;
        ctx.stroke();
    }     
}

function fillRect(x, y, width, height, color) {
    var ctx = browserEmulator.getContextSurface();
    if (ctx) {
        if (!color) {
            color = "#000000";
        }
        ctx.fillStyle=color;
        ctx.fillRect(x,y,width,height);
    } 
}

function strokeRect(x, y, width, height, weight, color) {
    var ctx = browserEmulator.getContextSurface();
    if (ctx) {
        if (!color) {
            color = "#000000";
        }
        if (!weight) {
            weight = 1;
        }        
        ctx.strokeStyle=color;
        ctx.lineWidth = weight;
        ctx.strokeRect(x,y,width,height);
    } 
}

function strokeArc(x, y, r, weight, color) {
    var ctx = browserEmulator.getContextSurface();
    if (ctx) {
        if (!color) {
            color = "#000000";
        }
        if (!weight) {
            weight = 1;
        }        
        ctx.strokeStyle=color;
        ctx.lineWidth = weight;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2*Math.PI);
        ctx.closePath();
        ctx.stroke();
    } 
}

function fillArc(x, y, r, color) {
    var ctx = browserEmulator.getContextSurface();
    if (ctx) {
        if (!color) {
            color = "#000000";
        }
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
    } 
}

function fillText(x, y, text, size, color, font) {
    var ctx = browserEmulator.getContextSurface();
    if (ctx) {
        if (!color) {
            color = "#000000";
        }
        if (!size) {
            size = 20;
        }     
        if (!font) {
            font = "Arial";
        }                
        ctx.fillStyle=color;
        ctx.textBaseline="top"; 
        ctx.font = size+"px "+font;
        ctx.fillText(text, x, y);        
    } 
}

function strokeText(x, y, text, weight, size, color, font) {
    var ctx = browserEmulator.getContextSurface();
    if (ctx) {
        if (!color) {
            color = "#000000";
        }
        if (!size) {
            size = 20;
        }     
        if (!font) {
            font = "Arial";
        } 
        if (!weight) {
            weight = 1;
        }                 
        ctx.lineWidth = weight;
        ctx.strokeStyle=color;
        ctx.textBaseline="top"; 
        ctx.font = size+"px "+font;
        ctx.strokeText(text, x, y);        
    } 
}


function interval(callback, delayMs) {
    console.log("set interval");
    if (typeof callback === "function") {        
        //var instance = window.setInterval(callback, delayMs);
        var instance = setInterval(callback, delayMs);
        Editor.timeIntervalList.push(instance);
        return instance;
    }
}

function timeout(callback, delayMs) {
    console.log("set interval");
    if (typeof callback === "function") {
        //var instance = window.setTimeout(callback, delayMs);
        var instance = setTimeout(callback, delayMs);
        Editor.timeOutList.push(instance);
        return instance;
    }
}

function loadImage(filename) {
    var imgElem = document.createElement("img");
    imgElem.src = pathSystem+"/media/upload/"+appId+"/img/"+filename;
	Editor.cacheImgs.push(imgElem);
}

function moveObject(object, endX, endY, duration, complete) {
    if (typeof object === "object") {
        var $object = $("#"+object.emuId);
        if (!duration) {
            duration = 1000;
        }
        if (!jQuery.isEmptyObject( $object )) {
            $object.animate({ left: ""+endX+"px", top: ""+endY+"px" }, duration, "linear", complete);
        }
    }
}

