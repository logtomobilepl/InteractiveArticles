


function BrowserEmulator() {
    this.SOURCE_OPEN_EDITOR = "editor";
    this.SOURCE_OPEN_CODE_EDITOR = "code_editor";
    var that = this,    
        objectsStorage = [];
        consoleCM = null, // instance of CodeMirror
        mapsEmu = new MapsContainer();
        //isConsoleAuto = true;        
        
    this.dialogs = new BrowserEmulatorDialogs();    	
    this.idEmuBoard = "emulator_board";
    this.idEmuConsole = "emulator_console";
	
    //this.idEmuBackground = "emulator_background";
    //this.idEmuSurface = "emulator_canvas_surface";
    this.idBack = "emulator_back";    
    this.idBackToCode = "emulator_back_to_code";
    this.idBackToAppList = "emulator_back_to_app_list";
    this.idBackToLessonsList = "emulator_back_to_lessons_list";
    this.sounds = new Array(); 
	this.currentBoard = null;	
    var displayEmulator = false;
    this.sourceOpen = that.SOURCE_OPEN_EDITOR;  
    this.waitForUser = false;
    this.consoleReadVariable = null;
    this.consoleLastCommandUser = "";
    this.consoleCurrentCommandUser = "";   // command during writing
    this.consoleCurrentCommandUserConfirmed = ""; // command is confirm
    this.isRunning = false;
    this.isDebugger = false;
    this.isNextStep = false;
    this.isAutoNextStep = false;
    this.debugCanCreateNewLine = false;
    this.debugInterrupt = false;
    
             
    this.dialogs.createDialogs();
    
    /*qCanvasSurface = $("#"+this.idEmuSurface);
    qCanvasSurface.css({"width": canvas.IPAD_RESOLUTION_X+"px", "height": canvas.IPAD_RESOLUTION_Y+"px"});
    qCanvasSurface[0].width = canvas.IPAD_RESOLUTION_X;
    qCanvasSurface[0].height = canvas.IPAD_RESOLUTION_Y;*/
   
    this.clearAfterCompilation = function() {
       that.clear();         
       codeEditor.stopDebugger();
    }
   
    this.backToPrevScreen = function() {
       that.clearAfterCompilation();                
            
       if (that.sourceOpen == that.SOURCE_OPEN_EDITOR) {
           that.backToEditor();
       } else if (that.sourceOpen == that.SOURCE_OPEN_CODE_EDITOR) {
           that.backToCodeEditor();
       }
       $(document).scrollTop( 1 );
    }
   
    $("#"+that.idBack).click(function(){       
       var isFind = false;
       EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}
       //sequencesSystem.bubbles.refreshTip();
       that.backToPrevScreen();
       codeEditor.clearConsole();
    });    
    $("#"+that.idBackToCode).click(function(){
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        
        that.clear();
        that.backToCodeEditor();
        codeEditor.clearConsole();
    });     
    $("#"+that.idBackToAppList).click(function(){
       var isFind = false;
       EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        
       that.clear();
       window.location.assign(pathSystem+"/select/app/");
    });      
    $("#"+that.idBackToLessonsList).click(function(){
       var isFind = false;
       EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        
       that.clear();
       window.location.assign(pathSystem+"/lessons/");
    });      
    

    /*$("#emulator_next_step").click(function(){
        browserEmulator.isNextStep = true;
    });*/
    
    this.backToEditor = function() {        
        $("#editor").css({"display": "block"});
        browserEmulator.displayEmulator(false); 
        stopMp3();
        //codeEditor.closeEditor();   
        //Editor.clearTimes();  
    }
    
    
    this.backToCodeEditor = function() {
       $("#editor").css({"display": "block"});
       browserEmulator.displayEmulator(false);
       stopMp3(); 
       codeEditor.openEditor();
       //Editor.clearTimes();
    }
    
    this.displayEmulator = function(openEmu) {
        displayEmulator = openEmu;
        if (displayEmulator) {
            $("#emulator").css("display","block");
        } else {
            $("#emulator").css("display","none");
        }            
    }
    
    this.isDisplayEmulator = function() {
        return displayEmulator;
    }
    
    this.clearBoards = function() {
		$("#"+this.idEmuBoard).html("");
    }
	
    this.clearBackground = function() {
		if (this.currentBoard) {
			$(this.currentBoard.emuDOM).html("");
		}
    }
    
    this.addConsole = function() {        
        var textAreaElement = document.createElement("textarea");
        textAreaElement.id = this.idEmuConsole;
        $("#"+this.idEmuBoard).append(textAreaElement);        
       
        consoleCM = CodeMirror.fromTextArea(document.getElementById(this.idEmuConsole), {
            lineNumbers: false,
            //styleActiveLine: true,
            mode:  "", //"javascript",
            //matchBrackets: true,
            //continueComments: "Enter",
            //extraKeys: {"Ctrl-Q": "toggleComment"},
            smartIndent: false,
            indentUnit: 0,
            indentWithTabs: false,
            tabSize: 0,
            /*extraKeys: {
              "F11": function(cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
              },
              "Esc": function(cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
              }
            } */           
            //viewportMargin: 25,
            //cursorScrollMargin: 5,
        });

        consoleCM.setSize("100%", "100%");
        consoleCM.on("beforeChange", function(cm, changeObj) {       
            
            var stringLastLine = cm.getLine(cm.lastLine());                         
            if (changeObj.from.line < cm.lastLine()) {  // !isConsoleAuto || 
                changeObj.cancel();
            } else {
                // text is array . length == 2 if enter
                if (changeObj.text.length == 2 && changeObj.text.join("") == "") {
                    browserEmulator.consoleLastCommandUser = stringLastLine;
                }
            }
            var countLetters = stringLastLine.length;
            cm.setCursor({line: cm.lastLine(), ch: countLetters });
        });                   
        
        consoleCM.on("keypress", function(cm, ev) {
            
        });           
        
        that.hideConsole();
    }
    
    this.showConsole = function() {  
        //if (!consoleCM) {
            that.addConsole();
        //}      
        if (consoleCM) {
            $(consoleCM.getWrapperElement()).css("display", "block");
            $(this.currentBoard.emuDOM).css("display", "none");
            $(this.currentBoard.emuCanvasDOM).css("display", "none");
        }
    }

    this.hideConsole = function() {
        if (consoleCM) {
            $(consoleCM.getWrapperElement()).css("display", "none");
            $(this.currentBoard.emuDOM).css("display", "block");
            $(this.currentBoard.emuCanvasDOM).css("display", "block");
        }
    }
    
    this.consoleLogAddText = function(text) { // append text to console
        var cm = consoleCM;
        if (cm) {
            var lastLineIndex = cm.lastLine(),
                lastLine = { line: lastLineIndex, ch: 0 },
                newLastLine = {};
            
            //isConsoleAuto = true;
    
            cm.replaceRange(text+"\n", lastLine, lastLine);
            newLastLine = { line: cm.lastLine(), ch: 0 }; 
            cm.markText({line:0, ch:0}, newLastLine, {readOnly: true} );
            
            cm.refresh();
            cm.focus();
        }
    }
    
    
    
    
    this.refreshConsole = function() {
        if (consoleCM) {
            consoleCM.refresh();
            consoleCM.focus();
        }
    } 

    this.clear = function() {
        this.clearContextSurface();   
        this.clearBoards();
        this.waitForUser = false;
        this.consoleReadVariable = null;
        this.consoleLastCommandUser = "";   
        this.consoleCurrentCommandUser = ""; 
        $(document).unbind("keypress.emulator", observerKeyboardEmulator);
    }

    this.setCurrentBoard = function(board) {
        if (board) {
            this.currentBoard = board;
        }
    }

    this.getContextSurface = function(board) {
		if (this.currentBoard) {
			var qCanvasSurface = $(this.currentBoard.emuCanvasDOM);
			if (qCanvasSurface.length > 0) {  
				var ctx = qCanvasSurface[0].getContext("2d");                
				return ctx;
			}
		}
    }
    this.clearContextSurface = function() {   
		if (this.currentBoard) {
			var qCanvasSurface = $(this.currentBoard.emuCanvasDOM);	
			if (qCanvasSurface) {
				var elemCanvas = qCanvasSurface[0];
				if (elemCanvas) {
    				var ctx = elemCanvas.getContext("2d");                
    				ctx.clearRect(0, 0, qCanvasSurface[0].width, qCanvasSurface[0].height);
				}
			}
		}
    }    
    
    this.setBoard = function(boardObj) {
        this.currectBoard = boardObj;
    }
        
    this.displayBoard = function(boardObj) {
        if (boardObj) {  
			if(this.currentBoard) {
				$(this.currentBoard.emuDOM).css({"display":"none"});
				$(this.currentBoard.emuCanvasDOM).css({"display":"none"});
			}
			$(boardObj.emuDOM).css({"display":"block"});
			$(boardObj.emuCanvasDOM).css({"display":"block"});
			this.currentBoard = boardObj;

            var res = canvas.getResolution();
            $("#"+that.idEmuBoard).css({"width":""+res.x+"px", "height": ""+res.y+"px"});

            if (boardObj.background && boardObj.background != "") {
                $(boardObj.emuDOM).css({ "background-image":"url('"+pathSystem+"/media/upload/"+appId+"/img/"+boardObj.background+"')", "width":"100%", "height": "100%", "background-repeat": "no-repeat"  });
            } else {
                $(boardObj.emuDOM).css({ "background-image":"none", "width":""+res.x+"px", "height": ""+res.y+"px"  });
            }
            
            if (boardObj.sound && boardObj.sound != "-") {
                stopMp3();
                playMp3(boardObj.sound);
            }
            
        }
    }
    
    this.setObject = function(option, object, options) {
        if (option == "option" && object && object.emuId && options) {             
            if (options.x != undefined) {
                $("#"+object.emuId).css({"left": options.x});  
            }
            if (options.y != undefined) {
                $("#"+object.emuId).css({"top": options.y});  
            }            
            if (options.width != undefined) {
                $("#"+object.emuId).css({"width": object.width});  
            }            
            if (options.height != undefined) {
                $("#"+object.emuId).css({"height": object.height});  
            }       
            if (options.image != undefined) {
                $("#"+object.emuId).css({
                    "background": "url('"+pathSystem+"/media/upload/"+appId+"/img/"+options.image+"')",
                    "background-size": "100% 100%",
                    "background-repeat": "no-repeat",
                });  
            }  
            if (options.background != undefined) {
                if (options.background != "") {
                    $("#"+object.emuId).css({
                        "background": "url('"+pathSystem+"/media/upload/"+appId+"/img/"+options.background+"')",
                        "background-size": "100% 100%",
                        "background-repeat": "no-repeat",
                    });  
                } else {
                    $("#"+object.emuId).css({
                        "background": "url('"+pathSystem+"/media/img/btn_bg_vert.png')",
                        "background-size": "100% 100%",
                        "background-repeat": "no-repeat",
                    });                         
                }
            }  
            if (options.text != undefined) {
                var text = Convert.br2nl(options.text);
                text = specialCharsToHtml(text);                    
                $("#"+object.emuId).text(text);
                $("#"+object.emuId).val(text);
            }  
            if (options.textColor != undefined) {
                try {
                    var hex = (new Color).myRgbToHex(options.textColor);
                    $("#"+object.emuId).css({"color": hex});
                } catch(e) {}
            }                                                     
            if (options.fontSize != undefined) {
                $("#"+object.emuId).css({"fontSize": options.fontSize+"px"});
            }     
            if (options.fontType != undefined) {
                $("#"+object.emuId).css({"fontFamily": options.fontType});
            } 
            if (options.visibility != undefined) {
                $("#"+object.emuId).css({"visibility": (options.visibility)?"visible":"hidden"});  
            }            
        }
    }           
    
    this.displayObject = function(object) {
        
        function setObjectWithParent() {
            if (object.isBoardObject) {
                object.tryAddToFront();
            }                 
            that.setObjectEvents(object);
            objectsStorage.push(object);               
        }
        
        if (object.type == ELEMENT_TYPE_MAP) {
            var emu_div = "<div id='"+object.emuId+"'></div>";
            
            if (object.parent && object.parent.emuDOM) {                       
                $(object.parent.emuDOM).append(emu_div);
                
                $("#"+object.emuId).css({ 
                    "position": "absolute",
                    //"pointer-events": "none"
                });
                this.setObject("option", object, {x: object.x});
                this.setObject("option", object, {y: object.y});
                this.setObject("option", object, {width: object.width});
                this.setObject("option", object, {height: object.height});
                this.setObject("option", object, {visibility: object.visible});
                
                var mapObj = mapsEmu.addMap($("#"+object.emuId)[0], object.width, object.height, object.latitude, object.longitude, object.zoom, {
                    draggable: false,
                    disableDefaultUI: true,
                    zoomControl: false,
                    scrollwheel: false
                });               
                
                try {
                    var objActions = JSON.parse(object.onclick),
                        actionObj = null;
                    for(var i=0; i < objActions.length; i++) {
                        actionObj = objActions[i];
                        var markerObj = mapsEmu.addMarkerToMapId(mapObj.mapId, actionObj.lat, actionObj.lng);
                        
                        function setMapAction(act_obj, mark) {
                            google.maps.event.addListener(mark, 'click', function() {
                                if (act_obj.actions.go_to_board) {
                                    goToBoard(act_obj.actions.go_to_board);
                                }
                                if (act_obj.actions.play_sound) {
                                    playMp3(act_obj.actions.play_sound);
                                }                            
                                if (act_obj.actions.open_popup) {
                                    showPopup(act_obj.actions.open_popup);
                                }                            
                            });
                        }
                        setMapAction(actionObj, markerObj.marker);                         

                                              
                    }
                    
                } catch(e) {}
            
                                               
                setObjectWithParent();
            }
        }
        if (object.type == ELEMENT_TYPE_CLICKABLE_AREA || object.type == ELEMENT_TYPE_IMAGE) {
            var emu_div = "<div id='"+object.emuId+"'></div>"; 
            
            if (object.parent && object.parent.emuDOM) {                       
                $(object.parent.emuDOM).append(emu_div);
                
                $("#"+object.emuId).css({ 
                    "position": "absolute",
                    //"pointer-events": "none"
                });
                this.setObject("option", object, {x: object.x});
                this.setObject("option", object, {y: object.y});
                this.setObject("option", object, {width: object.width});
                this.setObject("option", object, {height: object.height});
                this.setObject("option", object, {image: object.image});
                this.setObject("option", object, {visibility: object.visible});
                
                setObjectWithParent();
            }
        }
        if (object.type == ELEMENT_TYPE_TEXT || object.type == ELEMENT_TYPE_TEXTEDIT ||
            object.type == ELEMENT_TYPE_BUTTON) {                                    
            
            var emu_div = "<textarea id='"+object.emuId+"' />";
    
            if (object.parent && object.parent.emuDOM) {                 
                $(object.parent.emuDOM).append(emu_div);
    
                if (object.type == ELEMENT_TYPE_TEXT) {
                    $("#"+object.emuId).attr('readonly', true);
                    $("#"+object.emuId).css({
                        "background":"transparent", 
                        "border":"0px solid #000",
                        //"pointer-events": "none"
                    });
                }
                if (object.type == ELEMENT_TYPE_TEXTEDIT) {
                    $("#"+object.emuId).css({
                        "border":"1px solid #aaa",
                        //"pointer-events": "none"
                    });
                }
                if (object.type == ELEMENT_TYPE_BUTTON) {
                    $("#"+object.emuId).attr('readonly', true);
                    $("#"+object.emuId).css({
                        "background":"transparent", 
                        "border":"1px solid #aaaaaa", 
                        "background-color":"#ffffff", 
                        "text-align": "center",
                        "cursor": "pointer"
                    });
                    $("#"+object.emuId).corner();
                }                    
                $("#"+object.emuId).css({ 
                    "position": "absolute",    
                    //"pointer-events": "none"
                });                    
                     
                this.setObject("option", object, {x: object.x});
                this.setObject("option", object, {y: object.y});
                this.setObject("option", object, {width: object.width});
                this.setObject("option", object, {height: object.height});
                this.setObject("option", object, {visibility: object.visible});
                this.setObject("option", object, {text: object.text});
                this.setObject("option", object, {textColor: object.textColor});
                this.setObject("option", object, {fontSize: object.fontSize});
                this.setObject("option", object, {fontType: object.fontType});
                
                if (object.type == ELEMENT_TYPE_BUTTON) {
                    this.setObject("option", object, {background: object.background});    
                }
                
                setObjectWithParent();
            }
        }
      
    }
   
    this.displayAllObjects = function(objects) {
        for(var i=0; i < objects.length; i++) {            
            var object = objects[i];
            that.displayObject(object);
        }
    }
    
    var executeChildAction = function(child) {
        //console.log(child.name);        
        if (child.type == ACTIONS_SHOW_ELEMENT && child.name && that.currentBoard.name) {   
            showObject(child.name, that.currentBoard.name);
        }
        if (child.type == ACTIONS_HIDE_ELEMENT && child.name && that.currentBoard.name) {   
            hideObject(child.name, that.currentBoard.name);
        }   
        if (child.type == ACTIONS_RUN_XML && child.name) {   
            goToBoard(child.name);                  
        }                       
        if (child.type == ACTIONS_PLAY_MP3 && child.name) {
            playMp3(child.name);
        }  
        if (child.type == ACTIONS_STOP_MP3) {
            stopMp3();   
        }                                                       
        if (child.type == ACTIONS_SHOW_IMAGE && child.pImage) {
            showImage(child.pImage);   
        }    
        if (child.type == ACTIONS_INITIATE_CONVERSATION && child.pName) {
            showConversation(child.pName);
        }      
        if (child.type == ACTIONS_SHOW_TPOPUP && child.name) {
            showPopup(child.name);
        }                      
    }
    
    
    this.setObjectEvents = function(object) {
        if (object.type == ELEMENT_TYPE_CLICKABLE_AREA || object.type == ELEMENT_TYPE_BUTTON) {                                                                                      
            $("#"+object.emuId).click(function(){
                //codeEditor.manager.handleCodeWithCallback(function() {
                    console.log("click "+$(this)[0].id);  
                    var obj =  Editor.objectByEmuId($(this)[0].id); 
    
                    if (typeof obj.onclick === "function") {
                       //try {
                       codeEditor.manager.handleCodeWithCallback(function() {
                           obj.onclick(obj);
                       }, ". Error in action onclick of object: "+obj.name+", board: "+obj.parent.name);                            
                        //} catch (e) { alert(JSON.stringify(e.message) ); }
                    }
              
                    var onclick = obj.actions.getOnclick();
                    for(var j=0; j < onclick.children.length; j++) {
                        var child = onclick.children[j];
                        executeChildAction(child);                                
                    }  
                //});
             }); 
         }
         if (object.type == ELEMENT_TYPE_TEXTEDIT) {
            $("#"+object.emuId).change(function(){
                var id = $(this)[0].id;
                if (id) {
                    var text = $(this).val();
                    var obj = Editor.objectByEmuId(id);
                    obj.text = text;
                }                
            });
        }
    }
    
    this.afterCompilation = function() {
        that.clearBackground();
        objectsStorage = new Array();
        $(document).bind("keypress.emulator", observerKeyboardEmulator);
    }
        
    function observerKeyboardEmulator(ev) {
        var objects = objectsStorage;
        for(var i=0; i < objects.length; i++) {
            var object = objects[i];
            if (object.type == ELEMENT_TYPE_CLICKABLE_AREA || object.type == ELEMENT_TYPE_BUTTON) {                                                 
                var elem =  $("#"+object.emuId)[0];
                if (elem && elem.id) {                    
                    var obj =  Editor.objectByEmuId(elem.id); 
                    if (obj && obj.keydown && obj.keydownParam && typeof obj.keydown === "function" && typeof obj.keydownParam  === "string" ) { 
                        var key = obj.keydownParam;
                        if (key.length == 1) {
                            if ( ev.which == key.charCodeAt(0) ) {
                                obj.keydown(obj);       
                            }
                        }                        
                    }
                                        
                    // keyboards
                    var onclick =  obj.actions.getOnclick();
                    for(var j=0; j < onclick.children.length; j++) {
                        var child = onclick.children[j];                        
                        if (child.key && child.key.length == 1 && ev.which == child.key.charCodeAt(0)) {
                            executeChildAction(child);
                        }
                    }      
                }
                 
            }
        } 
    }
        
     
}
