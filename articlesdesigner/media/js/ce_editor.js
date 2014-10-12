////////////////////
// CODE EDITOR

var EDITOR_ONCLICK = "onclick";
var EDITOR_ONDROP = "ondrop";
var EDITOR_KEYDOWN = "keydown";
var EDITOR_SHOW_OBJECT = "show_object";
var EDITOR_HIDE_OBJECT = "hide_object";
var EDITOR_GO_TO_BOARD = "go_to_board";
var EDITOR_PLAY_MP3 = "play_mp3";
var EDITOR_STOP_MP3 = "stop_mp3";
var EDITOR_SHOW_IMAGE = "show_image";
var EDITOR_SHOW_POPUP = "show_popup";
var EDITOR_INITIATE_CONVERSATION = "initiate_conversation";
var EDITOR_TAKE_ITEM = "take_item";
var EDITOR_DROP_ITEM = "drop_item";

function CodeEditor() {
    var TYPE_ERROR = 1, TYPE_SELECT = 2;
    var CODE_MAIN_NAME = "main";
    var CODE_MAIN_EXT = "Code";
    var TEXT_START_DEBUG = "START DEBUG";
    var TEXT_STOP_DEBUG = "STOP DEBUG";
	var that = this;
    this.idDialog = "dialog_code_editor";     
    this.idOpenDialog = "dialog_code_editor_open";
    this.idCodeEditorRun = "dialog_code_editor_run";
    this.idCodeEditorProperty = "code_editor_property";
        
    this.idCodeEditorSplitter = "code_editor_splitter";
    this.idCodeEditorPanelEditor = "code_editor_panel_editor";
    this.idCodeEditorTabs = "code_editor_tabs";
    this.idCodeEditorCode = "code_editor_code";
    this.idCodeEditorProgramCode = "code_editor_program_code";
    
    this.idCodeEditorConsoleSection = "code_editor_console_section";
    this.idCodeEditorPanelConsole = "code_editor_panel_console";
    this.idCodeEditorPanelNoConsole = "code_editor_panel_noconsole";
    this.idCodeEditorOpenConsole = "code_editor_open_console";
    this.idCodeEditorCloseConsole = "code_editor_close_console";
    
    this.idCodeEditorPanelOutline = "code_editor_panel_outline";
    this.idCodeEditorOpenOutline = "code_editor_open_outline";
    this.idCodeEditorCloseOutline = "code_editor_close_outline";    
    
    var progressBar = $( "#compile_progress" ),
        progressLabel = $( "#compile_progress_label" ),
        firstOpenDialog = true; 
     
    this.manager = new CodeEditorManager(this);
    this.help = new CodeEditorHelp();
    this.explorer = new CodeEditorExplorer();
    this.templates = new CodeEditorTemplates();
    this.strings = new CodeEditorStrings(this);
    var aWriteCM = null,
        codeMirrorOptions = {minHeight: 310, maxHeight: 390},
        lastCMViewport = undefined,
        lastCursorPos,
        currentCursorPosition = {};
    
    // tabs
    var tabs = $("#"+this.idCodeEditorTabs),
        tabsData = [], // tab = {id, tab (instance jquery of li of tab),  name (of tab == board name), idCodeMirror (string), codeMirror (object), codeMirrorDebug (object), typeCode (boardExtension), isSaved (boolean content is update or not)), cursorPos:{line, ch}, endLineToRecord: INT  }
        snapshotLatestCode = [], 
        tabUniqueId = 1,
        tabTemplate = "<li><a href='#{href}' style='outline-color: transparent;'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation' style='cursor:pointer;' >Remove Tab</span></li>",
        readOnlyBoardsList = [],  // [boardName.Extension,..]
        blockedClosedBoardsList = [], // [boardName.Extension,..]
        debugCodes = [], // [{name: string, typeCode: string, code: string},(...)]
        textMarkerConsoleRead = null,
        debugLineDetails = [],  // [{ name: string, typeCode: string, line: int, statementType="if"|"for|...",  detailsCode: "...", }]
        isOpenDebugLineDetails = false;
        
    this.boardExtension = {code: "Code", definitions: "UIDefinitions"};
    
    var timerAutosave,
        autosaveSec = 15,
        timerAutogenerateOutline = null,
        autogenerateOutlineSec = 5,
        lineEditorEnd = -1,        
        stoper = null,
        isShowConsole = false,
        isShowOutline = false;
    
    //$("#"+this.idCodeEditorSplitter).splitter();   
    this.help.create();
    this.explorer.create();
   
    var compileDialog = function() {
        if (isContinueTutorial == "True") {
            that.canCompile({
                canDisplayEmuView: true,
                callbacks: {                                        
                    run_success: function() {
                        //var isFind = false;
                        //EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: "dialog_code_editor_compile"}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        
                        //that.startCompile();
                        callbackRunSuccess();                                                             
                    },
                    run_failed: function() {
                        callbackRunFailed();                               
                    },
                    logs: function(log) {
                        callbackLog(log);
                    }
                }
            });   
        } else {
            that.startCompile();
        } 
    }   
           
    $("#"+this.idDialog).dialog({
        autoOpen: false,
        resizable: false,
        //modal: true,
        title: '<span class="title">CODE EDITOR</span>',
        //position: [-50,0],                
        width: 1180,  //600, //
        height: 560, 
        closeOnEscape: false,
        buttons: {
            CALLAPSE: {
                text: "Fold all comments",
                id: "dialog_code_editor_fold",
                click: function(ev) {
                    var isFind = false;
                    EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: ev.currentTarget.id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}
                                                
                    that.foldToogle();
                }                
            },            
            RUN: {
                text: "RUN",
                id: "dialog_code_editor_compile",
                click: function(ev) {
                    var isFind = false;
                    EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: ev.currentTarget.id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        

                    browserEmulator.sourceOpen = browserEmulator.SOURCE_OPEN_CODE_EDITOR;
                    browserEmulator.debugInterrupt = false;
                    //browserEmulator.isDebugger = false;
                    //browserEmulator.debugInterrupt = false;
                    compileDialog();
                }                
            },
            NEXT_STEP: {
                text: "NEXT_STEP",
                id: "dialog_code_editor_next_step",
                click: function(ev) {
                    var isFind = false;
                    EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: ev.currentTarget.id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}                    

                    that.nextStepDebugger();
                }           
            },             
            DEBUG: {
                //dialog_code_editor_debug
                text: TEXT_START_DEBUG,
                id: "dialog_code_editor_debug",
                click: function(ev) {
                    var isFind = false;
                    EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: ev.currentTarget.id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}                    

                    if (!browserEmulator.isDebugger) {
                        that.startDebugger(); 
                        compileDialog();
                        
                    } else {
                        // button has 'stop' text
                        that.stopDebugger();
                        that.clearConsole();
                    }
                    
                }             
            },
            /*CLOSE_DEBUGGER_VIEW: {
                text: "Close debuger view",
                id: "dialog_code_editor_close_debugger_view",
                click: function(ev) {
                    var isFind = false;
                    EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: ev.currentTarget.id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}

                    that.stopDebugger();                    
                }   
            },*/
            
            /*"STOP_DEBUG": {
                text: "STOP_DEBUG",
                id: "dialog_code_editor_stop_debug",
                click: function(ev) {
                    var isFind = false;
                    EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: ev.currentTarget.id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}
                       
                    that.stopDebugger(); 
                }           
            },*/            
            CLOSE: {
                text: "CLOSE",
                id: "dialog_code_editor_close",
                click: function(ev) {
                    var isFind = false;
                    EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: ev.currentTarget.id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}
                       
                    $(this).dialog("close");
                }     
            } 
        },
        close: function( event, ui ) {            
            that.updateCodeOfManager();
            // set after update codes
            that.manager.setObjectOnCanvasByDefinitions();  
            window.clearInterval(timerAutosave);  
            window.clearInterval(timerAutogenerateOutline);  
            timerAutosave = undefined;         
            timerAutogenerateOutline = undefined;            
            
            // set current cursor
            var tabData = that.getTabDataByTabIndex(that.getActiveTab());       
            if (tabData && tabData.codeMirror) {           
                currentCursorPosition = tabData.codeMirror.getCursor();
            }                       
        },
        open: function(event, ui) {                                         
            
            $('.ui-dialog-buttonpane')
            .find('button:contains("COMPILE")')
            .removeClass('ui-button-text-only')
            .css('border',"0px")
            .css('background-color',"transparent")
            .html('<div id="dialog_code_editor_compile" class="dialog_img_compile"></div>');
            
            //that.setDisabledButton("DEBUG", false);
            //that.setDisabledButton("NEXT_STEP", true);
            //that.setDisabledButton("STOP_DEBUG", true);    
                        
            if (!browserEmulator.isDebugger) {            
                $("#dialog_code_editor_next_step").hide();
            }
            
            
            var isHiddenDebuggerOption = false;            
            if (!application.isAlwaysDebugger) {         
                if (!isContinueTutorial) {
                    isHiddenDebuggerOption = true;
                } else if (isContinueTutorial == "True") {
                    isHiddenDebuggerOption = true;                    
                    var valuesSett = application.settingsAllValuesForKey("is_debugger_module_lesson");
                    for(var i=0; i < valuesSett.length; i++) {
                        var valueSett = valuesSett[i],
                            values = valueSett.split(";");
                        if (values.length > 1) {
                            values[0] = parseInt(values[0]);
                            values[1] = parseInt(values[1]);  
                            
                            if (values[0] == parseInt(moduleOrder) && values[1] == parseInt(lessonOrder)) {
                                isHiddenDebuggerOption = false;
                            }                            
                        }
                        
                    }
                }           
            }
            if (isHiddenDebuggerOption) {
                $("#dialog_code_editor_next_step").hide();   
                $("#dialog_code_editor_debug").hide();   
            }
            
            // interrupt enter for "nextStep" and "Start/end debug" button
            $("#dialog_code_editor_next_step, #dialog_code_editor_debug").keypress(function (evt) {
                $(this).blur();
                var charCode = evt.charCode || evt.keyCode;
                if (charCode  == 13) { 
                    return false; 
                }
            });            
        },                     
    });   
    
    this.setDisabledButton = function(name, disabled) {
        var btn = $("#"+that.idDialog).parent().find('button:contains('+name+')');
        if (disabled) {
            btn.attr("disabled", "disabled");
        } else {
            btn.removeAttr("disabled");
        }
    } 
    
    //$("#"+this.idDialog+" .ui-dialog-titlebar").hide();
    $("#"+this.idDialog).parent().find(".ui-dialog-titlebar").hide();
    
    
    $("#"+this.idOpenDialog).click(function(){        
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        
        
        that.openEditor();
    });
 
    $("#"+this.idCodeEditorRun).click(function(){
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        

        browserEmulator.sourceOpen = browserEmulator.SOURCE_OPEN_EDITOR;
        browserEmulator.debugInterrupt = false;

        var result = that.canCompile({
            canDisplayEmuView: true,
            callbacks: {
                run_success: function() {
                    //var isFind = false;
                    //EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: "dialog_code_editor_compile"}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        
                    //that.startCompile();
                    callbackRunSuccess();                                                             
                },
                run_failed: function() {
                    callbackRunFailed();                    
                },
                logs: function(log) {
                    callbackLog(log);
                }
            }
        });
        if (!result) {
            browserEmulator.backToPrevScreen();
            messageDialog.showWithTwoButtons("Compilation", "Code is incorrect. ", "Open code editor", "Cancel", function() {
                that.openEditor();
                showErrorInLine();
            });
        }
        
    });    
    
    var findParamOfTabsData = function(paramReturn, paramSearched, valueSearched) {
        for(var i=0; i<tabsData.length; i++) {
            var tabObj = tabsData[i];
            if (tabObj.hasOwnProperty(paramSearched) && tabObj.hasOwnProperty(paramReturn) && tabObj[paramSearched] == valueSearched) {
                return tabObj[paramReturn];
            }
        }
        return undefined;
    }
    
    this.setDialogOptions = function(options) {
        $("#"+this.idDialog).dialog(options);        
    }
    
    this.setDialogPosition = function(options) {
        $("#"+this.idDialog).dialog("widget").css({ top: 30, left: 120 });
    }    
    
    // find object by object in array {search, value}
    this.findObjectOfTabsData = function(arraySearched) {
        for(var i=0; i<tabsData.length; i++) {
            var tabObj = tabsData[i];
            var isFind = true;
            
            for(var iProp=0; iProp < arraySearched.length; iProp++) {   
                var property = arraySearched[iProp];
                if (!(tabObj.hasOwnProperty(property.search) && tabObj[property.search] == property.value)) {
                    isFind = false;    
                } 
            }
            if (isFind) {
                return tabObj;
            }
        }
        return undefined;
    }        
    
    // TABS
    tabs.tabs({
        activate: function( event, ui ) {  			
			that.exeEventActiveTab();			
			that.updateOutline();
			that.foldTextButtonRefresh();						
        },
        //collapsible: true,
    });
    
    
    this.exeEventActiveTab = function(options) {
        var indexActiveTab = that.getActiveTab(),
            tabData = that.getTabDataByTabIndex(indexActiveTab);
        if (tabData && tabData.codeMirror) {
            tabData.codeMirror.refresh();
            tabData.codeMirror.focus();
            tabData.codeMirror.setCursor(tabData.cursorPos);
            var tabDataExtension =  $.extend({}, tabData, options);
            EventsNotification.exe("cmActiveTab", tabDataExtension);
        }    
    }
    
    /*tabs.find( ".ui-tabs-nav" ).sortable({
      axis: "x",
      stop: function() {
        tabs.tabs( "refresh" );
      }
    });*/            
    
    //TODO
   // actual addTab function: adds new tab 
    this.addTab = function(tabTitle, tabExtension, isNotSwitchTab) {
      if (!that.findObjectOfTabsData([{search:"name", value:tabTitle},{search:"typeCode", value:tabExtension}]))  {
          var label = tabTitle+"."+tabExtension,
            id = "tabs-editor-" + tabUniqueId,
            idEditor = "tabs-editor-editor-" + tabUniqueId,
            idDebugger = "tabs-editor-debugger-" + tabUniqueId,
            idDetails = "tabs-editor-details-" + tabUniqueId,
            idCM = "code-mirror-" + tabUniqueId,
            idCMDebug = "code-mirror-debug-" + tabUniqueId,
            li = $( tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) ),
            textAreaElement = document.createElement("textarea"),
            textAreaElement2 = document.createElement("textarea"),
            code = getCodeFromBoardName(tabTitle, tabExtension),
            debugCode = "";
     
          tabs.find( ".ui-tabs-nav" ).append( li );
          tabs.append( '<div id="' + id + '"><div id="'+idEditor+'" style="float:left;width:50%"></div><div id="'+idDebugger+'" style="float:right;width:50%;"></div><div id="'+idDetails+'" style="float:right;display:none;height:360px;overflow-y:auto;"></div></div>');
          $(li).attr("board-name",label);
          
          for(var i=0; i < debugCodes.length; i++){
             if (tabTitle == debugCodes[i].name && tabExtension == debugCodes[i].typeCode) {
                 debugCode = debugCodes[i].code;
             }
          }

          textAreaElement.id = idCM;
          textAreaElement.value = code;
          $("#"+idEditor).append(textAreaElement);

          textAreaElement2.id = idCMDebug;
          textAreaElement2.value = debugCode;
          $("#"+idDebugger).append(textAreaElement2); 

          var codeMirrorObj = createdCodeMirrorObject(idCM),
              codeMirrorDebug = createdCodeMirrorDebug(idCMDebug),
              endLineToRecord = -1,
              filename = tabTitle+"."+tabExtension,
              isReadOnly =  isExistStringInArray(filename, readOnlyBoardsList);

          codeMirrorObj.setOption("readOnly", isReadOnly);
          
          /*var wrapElement = codeMirrorObj.getWrapperElement();   
          $(wrapElement).click(function(){
              alert('You click the editor');
          });*/
        /*codeMirrorObj.on('click', function() {
           if (tabData && tabData.codeMirror) {
               $("#"+tabData.codeMirror.idEditor).click(function() {
                   alert('You click the editor');
               });
           }
           //alert('You click the editor');
        });*/           
                
          var tabData = {
              id: id, 
              idEditor: idEditor,
              idDebugger: idDebugger,
              idDetails: idDetails,
              tab: li,
              name: tabTitle, 
              idCodeMirror: idCM, 
              idCodeMirrorDebug: idCMDebug, 
              codeMirror: codeMirrorObj, 
              codeMirrorDebug: codeMirrorDebug, 
              typeCode:tabExtension,
              isSaved: true,
              cursorPos: {line: 0, ch: 0},
              endLineToRecord: endLineToRecord,
              isFold: false
          } 
          tabsData.push(tabData);

          // if is instance adminEditor so is mode: editor
          //if (adminEditor && adminEditor.isRecording()) { 
          //  that.setEndLineForRecordingForTab(tabData); 
          //}          

          tabs.tabs( "refresh" );
          codeMirrorObj.refresh();
          tabUniqueId++;
        }
        
        // 
        
        if (!isNotSwitchTab) {       
            // switch to exist or created tab
            var indexTab = that.indexTabOfBoardName(tabTitle+"."+tabExtension);
            if (indexTab > -1) {
                that.activateTab(indexTab);
            }
        }
        that.refreshDebugger();
    }    
        
    
    // close icon: removing the tab on click
    tabs.delegate( "span.ui-icon-close", "click", function(ev) {
      
      //var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
      var panelId = $( this ).closest( "li" ).attr( "aria-controls" ),
          tabObj = that.findObjectOfTabsData([{search:"id",value: panelId}]);
          
        if (tabObj) {
            var filename = tabObj.name+"."+tabObj.typeCode;
            if (filename && !isExistStringInArray(filename, blockedClosedBoardsList) && !browserEmulator.isDebugger) {
       
                $( this ).closest( "li" ).remove(); // remove tab
                                     
                var index = tabsData.indexOf(tabObj);
                if (index > -1) {
                    that.updateCodes();      
                    console.log("tabs name:"+tabsData[index].name+" deleted! Now count:"+tabsData.length-1);
                    tabsData.splice(index,1);          
                }      
                $( "#" + panelId ).remove();      
                tabs.tabs( "refresh" );
            }
        }
    });

    this.indexTabOfBoardName = function(boardName) {    
        // every li of tab has added attr 'board-name'   
        var index = -1;  
        tabs.find(".ui-tabs-nav li").each(function(indexTab, element){
            var attrBoardName = $( this ).attr("board-name");
            if (attrBoardName && attrBoardName == boardName) {
                index = indexTab;
                return false;
            }
        });        
        return index;        
    }  
    
    this.getTabDataByTabIndex = function(index) {
        var tabData = undefined;
        tabs.find(".ui-tabs-nav li").each(function(indexTab, element){
            
            if (index == indexTab) {
                for(var i=0; i < tabsData.length; i++) {
                    if (tabsData[i].tab[0] == element) {
                        tabData = tabsData[i];
                        return false
                    }
                }
            }           
        });  
        return tabData;
    }        
    
    this.getActiveTab = function() {
        return tabs.tabs( "option", "active" );
    }    
    
    this.activateTab = function(indexTab) {
        tabs.tabs( "option", "active", indexTab );
    }
    
    this.openBoardCode = function(boardName, extension) {
        //console.log("Open "+boardName);        
        that.addTab(boardName, extension);
    }  
    
    
    this.openBoardCodeWithCurrentError = function() {
        //that.addTab(that.manager.boardNameError, that.manager.boardExtensionError);
        that.jumpToLine(that.manager.boardNameError, that.manager.boardExtensionError, that.manager.numberLineError, TYPE_ERROR);
    }      
    
    // PROGRESS BAR
    
    progressBar.progressbar({
      value: false,
      change: function() {
        var progress = ((that.manager.compileProgress / that.manager.compileProgressMax)*100).toFixed(0);
        progressLabel.text( progress + "%" );
      },
      complete: function() {
        progressLabel.text( "Done!" );
      }
    });    
    
    this.setProgress = function() {
      var progress = that.manager.compileProgress;
      var progressMax = that.manager.compileProgressMax;
      
      progressBar.progressbar( "option", "max", progressMax );      
      var val = progressBar.progressbar( "value" ) || 0; 
      progressBar.progressbar( "value", progress );
      if ( progress < (progressMax - 1) ) {
        setTimeout(that.setProgress, 100 );
      }
      //console.log(progress+" "+progressMax);
    }    
    
    // CODE MIRRORS    
    var createdCodeMirrorObject = function(idTextArea) {        
        var codeMirrorObj = CodeMirror.fromTextArea(document.getElementById(idTextArea), {
            lineNumbers: true,
            styleActiveLine: false,
            mode:  "javascript",
            lineWrapping: true,
            foldGutter: true,
            //lint: true,

            //matchBrackets: true,
            //continueComments: "Enter",
            //extraKeys: {"Ctrl-Q": "toggleComment"},
            smartIndent: (isEditTutorial == "True")?false:true,
            indentUnit: (isEditTutorial == "True")?0:2,
            indentWithTabs: (isEditTutorial == "True")?false:true,
            tabSize: (isEditTutorial == "True")?0:4,
            //viewportMargin: 25,
            //cursorScrollMargin: 5,
            viewportMargin: Infinity,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]// "CodeMirror-lint-markers"]
        });

        
        codeMirrorObj.setSize("100%", (isShowConsole)?codeMirrorOptions.minHeight:codeMirrorOptions.maxHeight);          
        codeMirrorObj.on('cursorActivity', function(cm) {
            clearErrorInLine();
            codeMirrorObj.setOption("styleActiveLine", false);                       
            var tabData = that.findObjectOfTabsData([{search:"codeMirror", value:codeMirrorObj}]);
            if (tabData) {         
                tabData.isSaved = false;
                //console.log("tabData "+tabData.id+" was modified.")
                tabData.cursorPos = cm.getCursor();                
                that.generateByActiveLine();
                
                //that.removeEndLineForRecordingForTab(tabData);
                
                var params = $.extend(true, {}, {pos: cm.getCursor()});
                params = $.extend(true, params, {tabData: {name: tabData.name, typeCode: tabData.typeCode}});
                EventsNotification.exe("cursorActivity", params); 
                
                if (tabData.codeMirror) { 
                    var isFind = false;
                    var editorContent = tabData.codeMirror.getValue("");
                    EventsNotification.exe(SequencesSystemEvents.EVENT_WRITE_CODE, {textarea: editorContent}, function(r){ if (r) isFind = true;}); //if (!isFind) {Messages.tutorialWrong();return;}
                }              
            }
            
        });
        
        codeMirrorObj.on("scroll", function(cm) {
            var top = cm.getScrollInfo().top,
                left = cm.getScrollInfo().left,
                tabData = that.findObjectOfTabsData([{search:"codeMirror", value:cm}]);
            if (left != undefined && top != undefined && tabData) {
                setCodeMirrorScroll(tabData.name, tabData.typeCode, left, top);
            }
        });
        
        codeMirrorObj.on("change", function(cm, changeObj) {
            //var params = $.extend(true, {}, {change: changeObj});
            EventsNotification.exe("changeEditor", changeObj); 
        });
        
        codeMirrorObj.on("beforeSelectionChange", function(cm, selection) {
            EventsNotification.exe("selectionEditor", selection); 
        });    
        
        codeMirrorObj.on("keypress", function(cm) {
            
            if (browserEmulator.isDebugger) {
                messageDialog.show("Debug","Cannot edit code during debugging.","OK");
            }            
            
            var tabData = that.findObjectOfTabsData([{search:"codeMirror", value:cm}])
            if (tabData) {     
                var filename = tabData.name+"."+tabData.typeCode;
                if (isExistStringInArray(filename, readOnlyBoardsList)) {                
                    $(".opentip .tip_highlight").effect( "highlight", { color: "#ff0000" }, 400, function () {} );
                }
            }
            if (stoper) {
                stoper.reset();
                stoper.start();
            }            
        });               
          
        return codeMirrorObj;
    }
   
    var createdCodeMirrorDebug = function(idTextArea) {        
        var codeMirrorDebug = CodeMirror.fromTextArea(document.getElementById(idTextArea), {
            lineNumbers: false,
            styleActiveLine: false,
            mode:  "",
            smartIndent: false,
            indentUnit: 0,
            indentWithTabs: false,
            tabSize: 0
        });       
        codeMirrorDebug.setSize("100%", (isShowConsole)?codeMirrorOptions.minHeight:codeMirrorOptions.maxHeight);          
        
        codeMirrorDebug.on("scroll", function(cm) {
            if (!browserEmulator.isDebugger) {
                return;
            }
            var top = cm.getScrollInfo().top,
                left = cm.getScrollInfo().left,
                tabData = that.findObjectOfTabsData([{search:"codeMirrorDebug", value:cm}]);
            if (left != undefined && top != undefined && tabData) {
                setCodeMirrorScroll(tabData.name, tabData.typeCode, left, top);
            }
        });
                
        
        codeMirrorDebug.on("beforeChange", function(cm, changeObj) {       
            //var line = cm.getLine(that.manager.numberLineError);
            //browserEmulator.consoleCurrentCommandUser = line;
            if (changeObj.text.length == 2 && changeObj.text.join("") == "") {                 
                if (!browserEmulator.debugCanCreateNewLine) {
                    changeObj.cancel(); 
                }                
                browserEmulator.consoleCurrentCommandUserConfirmed = browserEmulator.consoleCurrentCommandUser;
            }
            /*
            var stringLastLine = cm.getLine(cm.lastLine());                         
            if (changeObj.from.line < cm.lastLine()) {
                changeObj.cancel();
            } else {
                if (changeObj.text.length == 2 && changeObj.text.join("") == "") {
                    browserEmulator.consoleLastCommandUser = stringLastLine;
                }
            }
            var countLetters = stringLastLine.length;
            cm.setCursor({line: cm.lastLine(), ch: countLetters });*/
            
        });                   
        
        codeMirrorDebug.on("keypress", function(cm, ev) {
            //if (ev.which == 13 ) { // enter             
            //    browserEmulator.isNextStep = true;
            //}
        });           
               
        
        return codeMirrorDebug;
    }    
    
    var setCodeMirrorScroll = function(boardName, boardExt, x, y) {
        var tabData = that.findObjectOfTabsData([{search:"name", value:boardName},{search:"typeCode", value:boardExt}]);
        if (tabData) {
            if (tabData.codeMirror) {
                tabData.codeMirror.scrollTo(x, y);
            }
            if (tabData.codeMirrorDebug) {
                tabData.codeMirrorDebug.scrollTo(x, y);
            }
        }
    }    
    
    // PANELS     
    $("#code_editor_console_clear").click(function(){
        that.clearConsole();
    });     
    
    this.clearConsole = function() {
        $("#code_editor_console_text").text(""); 
    }
    
    this.showConsoleSection = function(isVisible) {
        if (isVisible) {
            $("#"+that.idCodeEditorConsoleSection).show();
        } else {
            $("#"+that.idCodeEditorConsoleSection).hide();
        }
    }
    
    this.showConsole = function(show) {
       isShowConsole = show;
       if (show) {
           for(var i=0; i < tabsData.length; i++) {
             tabsData[i].codeMirror.setSize("100%", codeMirrorOptions.minHeight);
             tabsData[i].codeMirrorDebug.setSize("100%", codeMirrorOptions.minHeight);
           } 
           tabs.css("min-height", (codeMirrorOptions.minHeight+50)+"px");
           $("#"+that.idCodeEditorPanelConsole).show();
           $("#"+that.idCodeEditorPanelNoConsole).hide();
           //$("#"+that.idCodeEditorOpenConsole)[0].disabled = true;
       } else {
           $("#"+that.idCodeEditorPanelConsole).hide();
           $("#"+that.idCodeEditorPanelNoConsole).show();
           for(var i=0; i < tabsData.length; i++) {
             tabsData[i].codeMirror.setSize("100%", codeMirrorOptions.maxHeight);
             tabsData[i].codeMirrorDebug.setSize("100%", codeMirrorOptions.maxHeight);
           } 
           tabs.css("min-height", (codeMirrorOptions.maxHeight+50)+"px");
           //$("#"+that.idCodeEditorOpenConsole)[0].disabled = false;   
       }
    }
    
    this.showOutline = function(show) {
        if (show) {
            that.help.isShow = true;
            $("#"+that.idCodeEditorPanelEditor).css({"width":"910px"}); 
            $("#"+that.idCodeEditorPanelOutline).show();
            $("#"+that.idCodeEditorOpenOutline).hide();
        } else {
            that.help.isShow = false;
            $("#"+that.idCodeEditorPanelEditor).css({"width":"100%"}); 
            $("#"+that.idCodeEditorPanelOutline).hide();
            $("#"+that.idCodeEditorOpenOutline).show();
        }
        if (browserEmulator.isDebugger) {
            that.help.isShow = false;
            $("#"+that.idCodeEditorOpenOutline).hide();
        }                                   
    }
    
    $("#"+this.idCodeEditorOpenConsole).click(function(){
       that.showConsole(true);
    });  
    
    $("#"+this.idCodeEditorCloseConsole).click(function(){
       that.showConsole(false);
    });    
    
    $("#"+this.idCodeEditorOpenOutline).click(function(){
        isShowOutline = true;
        that.showOutline(true);          
    });     
    
    $("#"+this.idCodeEditorCloseOutline).click(function(){
        isShowOutline = false;
        that.showOutline(false);                        
    });    
    
    // set default panels open 
    //this.showConsole(isShowConsole);
    //this.showOutline(false);
    
    
    // ENGINE

    // options.callbacks.run_success
    // options.callbacks.run_failed
    // options.callbacks.logs
    this.canCompile = function(options) {
        var result = false;
        
        browserEmulator.debugInterrupt = false;
        canDisplayEmuView = (options && options.canDisplayEmuView);
        
        that.updateCodeOfManager(); // update code to compile
        
        var successCompile = that.manager.compile();
        if (successCompile) {
            that.manager.run(function(){
                result = true;
                if (options && options.callbacks && options.callbacks.run_success && typeof options.callbacks.run_success === "function") {
                    options.callbacks.run_success();
                }
            }, function() {
                if (options && options.callbacks && options.callbacks.run_failed && typeof options.callbacks.run_failed === "function") {
                    options.callbacks.run_failed();
                }                
            }, function(log) {
                if (options && options.callbacks && options.callbacks.logs && typeof options.callbacks.logs === "function") {
                    options.callbacks.logs(log);
                }   
            });               
        }           
        return result;
    }

    this.startCompile = function() {
        clearErrorInLine();
        that.updateCodeOfManager(); // update code to compile        
        //that.closeDialog();
        
        canDisplayEmuView = true;
        browserEmulator.debugInterrupt = false; 
               
        that.clearConsole();
        //browserEmulator.clearAfterCompilation(); //TODO 
        callbackLog("Start compile");
        
        // compile -> to ustawienie statement'sow do kompilacji
        var successCompile = that.manager.compile();
        if (successCompile) {
            
            
            setTimeout(function() {
                that.manager.run(callbackRunSuccess, callbackRunFailed, callbackLog);    
            }, 100);            
        }            
    }   
    
    var callbackRunSuccess = function() {
        //for(var i=0; i < Editor.editorObjects.length; i++) {
        //    Editor.editorObjects[i].refresh();
        //}
        
        activeElement.setNotActive();
        callbackLog("Compilation Done.");
        callbackLog("Run.");
        
        //canvas.setRenderBoardElements(true);
        //$("#"+that.idEditor).css("display","none");
        
        that.closeEditor();
        $("#editor").css({"display": "none"});
        browserEmulator.displayEmulator(true);
    }
    
    var callbackRunFailed = function() { 
        //canvas.setRenderBoardElements(false);
        
        browserEmulator.backToPrevScreen();
        showErrorInLine();
        
        /*var isOpenEditorDialog = $("#"+that.idDialog).dialog( "isOpen" );
        if (isOpenEditorDialog) {
            callbackLog("Compilation Failed.");
            showErrorInLine();
        } else {         
            $("#editor").css({"display": "b"});
            
            
            browserEmulator.displayEmulator(false);
            messageDialog.show("Compilation", "Compilation failed", "OK");
        }   */
    }
    

    /*this.getCursorPosition = function (lineNumber) {
        if (lineNumber > -1) {
            var lineCountGenerated = codeMirror[1].lineCount();
            if (lineNumber > lineCountGenerated) {
                 var lineResult = lineNumber - lineCountGenerated - 1;
                 return {line: lineResult, editorIndex: 0} ;
            } else {
                return {line: lineNumber, editorIndex: 1} ;
            }
        }
        return undefined;
    }*/
    
    var callbackLog = function(log) {
        qlog = $("#code_editor_console_text");
        qlog.text(qlog.text()+"\n"+log);
        qlog.scrollTop(qlog[0].scrollHeight);
    }            
              
    this.isOpen = function() {        
        return $("#"+that.idDialog).dialog( "isOpen" );
    }
    
    this.getCodeMirrorLineCount = function(codeMirrorObj) {
        codeMirrorObj.lineCount();         
    }        
    
    // end of init section            
    
    this.jumpToLine = function(boardName, boardExtension, lineNumber, type) {

        that.addTab(boardName, boardExtension); // before created tab or switch to this tab

        var tabData = that.findObjectOfTabsData([{search:"name", value:boardName},{search:"typeCode", value:boardExtension}]),
            editor = tabData.codeMirror,
            indexTab = that.indexTabOfBoardName(tabData.name+"."+tabData.typeCode);
                  
        if (editor && indexTab > -1) {         
            that.activateTab(indexTab);
            editor.refresh();
            //editor.focus();
            var delta = 6;            
            // center
            editor.setCursor( {line: lineNumber-1+delta, ch:0}); //i, 0);
            editor.setCursor( {line: lineNumber-1-delta, ch:0}); //i, 0);
            // go to correct position
            editor.setCursor( {line: lineNumber-1, ch:0});
            
            if (type == TYPE_SELECT) {
                editor.setOption("styleActiveLine", true);
            }
            editor.refresh();
            //editor.focus();
        }
    }
    
    
    var clearErrorInLine = function() {
        if (that.manager.boardNameError && that.manager.boardExtensionError) {
            var tabData = that.findObjectOfTabsData([{search:"name", value:that.manager.boardNameError},{search:"typeCode", value:that.manager.boardExtensionError}]);
            if (tabData) {
                var editor = tabData.codeMirror;    
                if (editor) {
                    for(var i=0; i < editor.lineCount(); i++) {    
                        editor.removeLineClass(i, "wrap", "code_mirror_line_error");
                    }
                    editor.refresh();
                }
            } 
        }
    }    
    
    /*var getLastFillLine = function(tabData) {
        var lastFillLine = 0;       
        if (tabData && tabData.codeMirror) {
            for(var i=tabData.codeMirror.lineCount()-1; i >= 0 ; i--) {
                var lengthLine = tabData.codeMirror.getLine(i).length;
                if (lengthLine > 0) {
                    lastFillLine = i;
                    break;
                }
            }           
        }    
                
        return lastFillLine;    
    }
    
    

    this.setEndLineForRecordingForTab = function(tabData) {    
        //var tabData = that.getTabDataByTabIndex(that.getActiveTab());        
        if (tabData && tabData.codeMirror) {
            var line = getLastFillLine(tabData);
            if (line + 3 < tabData.codeMirror.lineCount()) {
                tabData.endLineToRecord = line + 2;
                tabData.codeMirror.addLineClass(tabData.endLineToRecord , "wrap", "code_mirror_line_writing_end");
            }
        }
    }
    
    this.setEndLineForRecordingAllOpenedTabs = function() { 
        for(var i=0; i < tabsData.length; i++) {
            that.setEndLineForRecordingForTab(tabsData[i]);
        }
    }    
    
    this.removeEndLineForRecordingForTab = function(tabData) {      
        if (tabData && tabData.codeMirror && tabData.endLineToRecord > -1) {
            tabData.codeMirror.removeLineClass(tabData.endLineToRecord, "wrap", "code_mirror_line_writing_end");
        }                
    }
    
    this.removeEndLineForRecordingAllOpenedTabs = function() { 
        for(var i=0; i < tabsData.length; i++) {
            that.removeEndLineForRecordingForTab(tabsData[i]);
        }
    }*/
   
    this.clearLinesType = function(classCss) {       
        for(var i=0; i < tabsData.length; i++) {            
            var tabData = tabsData[i];  
            if (tabData && tabData.codeMirror && tabData.codeMirrorDebug) {            
                for(var iL=0;iL < tabData.codeMirror.lineCount(); iL++) {
                    tabData.codeMirror.removeLineClass(iL , "wrap", classCss);
                    tabData.codeMirrorDebug.removeLineClass(iL , "wrap", classCss);
                    var marks = tabData.codeMirror.getAllMarks();   
                    for(var j=0; j < marks.length; j++) { marks[j].clear(); }
                    var marks = tabData.codeMirrorDebug.getAllMarks();   
                    for(var j=0; j < marks.length; j++) { marks[j].clear(); }
                }
            }
        }
    }   
   

    this.setLineType = function(boardName, boardExt, line, classCss, options) {
        for(var i=0; i < tabsData.length; i++) {            
            var tabData = tabsData[i];  
            if (tabData && tabData.codeMirror && tabData.codeMirrorDebug) {            
                if (tabData.name == boardName && tabData.typeCode == boardExt) { 
                    var showInCM = true,
                        showInCMDebug = true;                    
                    if (options) {
                        if (options.showInCM != undefined) { showInCM = options.showInCM; }
                        if (options.showInCMDebug != undefined) { showInCMDebug = options.showInCMDebug; }
                    }
                    if (showInCM) {
                        tabData.codeMirror.addLineClass(line, "wrap", classCss);
                    }   
                    if (showInCMDebug) { 
                        tabData.codeMirrorDebug.addLineClass(line, "wrap", classCss);
                    }                  
                }
            }
        }        
    }

    // range.from (line, ch), range.to (line, ch)
    this.setMarkType = function(boardName, boardExt, rangeFrom, rangeTo, classCss, options) {
        for(var i=0; i < tabsData.length; i++) {            
            var tabData = tabsData[i];  
            if (tabData && tabData.codeMirror && tabData.codeMirrorDebug) {            
                if (tabData.name == boardName && tabData.typeCode == boardExt) {                    
                    var showInCM = true,
                        showInCMDebug = false;                     
                    if (options) {
                        if (options.showInCM != undefined) { showInCM = options.showInCM; }
                        if (options.showInCMDebug != undefined) { showInCMDebug = options.showInCMDebug; }
                    }
                    if (showInCM) {
                        if (rangeFrom && rangeTo) {
                            tabData.codeMirror.markText(rangeFrom, rangeTo, { className:classCss });
                        }
                    }   
                    if (showInCMDebug) {
                        if (rangeFrom && rangeTo) {
                            tabData.codeMirrorDebug.markText(rangeFrom, rangeTo, { className:classCss });
                        }
                    }
                    
                }
            }
        }        
    }    
   
    this.setDebugLine = function(boardName, boardExt, line, options) {
        that.clearLinesType("code_mirror_line_debug");
        that.setLineType(boardName, boardExt, line, "code_mirror_line_debug", options);
        
    }    
    
    // rangeFrom:(line, ch),  rangeTo:(line, ch),  options.lineClass - name of Class of line for code mirror 
    this.setCodeSelectionRange = function(boardName, boardExt, rangeFrom, rangeTo, options) {
        if (options && options.lineClass) {            
            that.setMarkType(boardName, boardExt, rangeFrom, rangeTo, options.lineClass);
        }
    }    
    
    var showErrorInLine = function() {  
        if (that.manager.boardNameError && that.manager.boardExtensionError) {
            
            that.addTab(that.manager.boardNameError, that.manager.boardExtensionError); // before created tab or switch to this tab              
            var tabData = that.findObjectOfTabsData([{search:"name", value:that.manager.boardNameError},{search:"typeCode", value:that.manager.boardExtensionError}]),
                editor = tabData.codeMirror;
                
            that.jumpToLine(that.manager.boardNameError, that.manager.boardExtensionError, that.manager.numberLineError, TYPE_ERROR);
            that.showConsoleSection(true);
            that.showConsole(true);
            editor.addLineClass(that.manager.numberLineError-1, "wrap", "code_mirror_line_error");
            editor.refresh();
        }      
    }        
    
    
    this.addOrUpdateDebugLineDetails = function (options) {
        var indexUpdate = -1, op = options;
        for(var i=0; i < debugLineDetails.length; i++) {
            var line = debugLineDetails[i];
            if (line.name == op.name && line.typeCode == op.typeCode && line.lineNumber == op.lineNumber) {
                indexUpdate = i;
                break;
            }
        }       
        //TODO
        
        if (indexUpdate > -1) {
            debugLineDetails.splice(indexUpdate, 1, op);
        } else {
            debugLineDetails.push(op);
        }        
        this.refreshUpdateDebugLineDetails();
        
        /*name: that.boardNameError,
        typeCode: that.boardExtensionError,
        lineNumber: statement.lineNumber,
        statementType: statement.type,
        generalText: shortString
        detailsText: detailsString,
        statement: statement
        */
    }
    
    this.showDebugLineDetailsLastIndex = function() {
        that.showDebugLineDetailsForIndex(debugLineDetails.length-1);
    }
    
    this.showDebugLineDetailsForIndex = function(index) {
        if (isOpenDebugLineDetails && index < debugLineDetails.length) {
            var debugDetails = debugLineDetails[index],
                dataURL,
                treeDraw = new TreeConditionDrawing(),
                typeStm = debugDetails.statement.type,
                html = "",
                htmlDetails = "",
                line = debugLineDetails[index],
                tabData = that.findObjectOfTabsData([{search:"name", value:line.name},{search:"typeCode", value:line.typeCode}]);                
                
            that.refreshDebugger();
            
            if (debugDetails.detailsText) {
                htmlDetails = '<p class="title">Detail code explanation:</p>'+debugDetails.detailsText+'<br/><br/>';
            }
            
            if (typeStm == "if" || typeStm == "for") {                                         
                dataURL = treeDraw.createDataURLFromStatement(debugDetails.statement);                    
                //TODO       
                html = '<div class="debug_details_section"><input id="debug_back_from_details_section" type="button" value="Back"><br /><p class="title">General:</p>'+debugDetails.generalText+htmlDetails+'<a href="'+dataURL+'" target="_blank"><img src="'+dataURL+'"></a></img></div>';
            } else  { // if (typeStm == "pre_function_exe")
                html = '<div class="debug_details_section"><input id="debug_back_from_details_section" type="button" value="Back"><br /><p class="title">General:</p>'+debugDetails.generalText+htmlDetails+'</div>';
            }
            $("#"+tabData.idDetails).html(html);
            $("#debug_back_from_details_section").click(function(){
                isOpenDebugLineDetails = false;
                that.refreshDebugger();
                that.refreshUpdateDebugLineDetails();//TODO            
            });
        }
    }

    this.clearDebugLineDetailsForRange = function(boardName, typeCode, range) {
        for(var i=debugLineDetails.length-1; i >= 0; i--) {
            var line = debugLineDetails[i],
                tabData = that.findObjectOfTabsData([{search:"name", value:line.name},{search:"typeCode", value:line.typeCode}]),
                detailsBtn = null;
            if(tabData && tabData.codeMirrorDebug && line.name == boardName && line.typeCode == typeCode && line.lineNumber >= range.from && line.lineNumber <= range.to ) {
                debugLineDetails.splice(i,1);
            }
        }
        this.refreshUpdateDebugLineDetails();
    }

    this.clearDebugLineDetails = function() {
        debugLineDetails = [];
        this.refreshUpdateDebugLineDetails();
    };
    
    this.refreshUpdateDebugLineDetails = function() {
        // remove DOM details buttons objects by className
        $(".debug_details_btn").remove();        
        // and add DOM details buttons once again
        for(var i=0; i < debugLineDetails.length; i++) {
            var line = debugLineDetails[i],
                tabData = that.findObjectOfTabsData([{search:"name", value:line.name},{search:"typeCode", value:line.typeCode}]),
                detailsBtn = null;
                
            if(line.detailsText && tabData && tabData.codeMirrorDebug) {
                //tabData.codeMirrorDebug
                detailsBtn = document.createElement("div");
                $(detailsBtn).attr({
                    id: "debug_see_details"+i,
                    index_details: i
                });                
                             
                tabData.codeMirrorDebug.addWidget({ch:0 , line: line.lineNumber-1}, detailsBtn, true);
                detailsBtn.innerHTML = "See details"
                $(detailsBtn).addClass("debug_details_btn");
                $(detailsBtn).css({"left": "440px", "top": "+=-13px", "font-size": "11px", "z-index": 5, "width": "60px;", "height": "6px;", "background-color": "#ddd", "border": "1px solid #999", "cursor": "pointer"});
                
                $(detailsBtn).click(function(){
                    isOpenDebugLineDetails = true;
                    var index = parseInt($(this).attr("index_details"));
                    that.showDebugLineDetailsForIndex(index);
                });
                tabData.codeMirrorDebug.refresh();
            }
        }
    }    

    this.getStringActiveLine = function() {
        var tabData = that.getTabDataByTabIndex(that.getActiveTab());       
        if (tabData && tabData.codeMirror) {              
            var cursor = tabData.codeMirror.getCursor(),
                line =  tabData.codeMirror.getLine(cursor.line);
            return line;
        } 
    }
    
    var getCodeFromBoardName = function(boardName, boardExt) {
        var code = "";
        if (boardName == CODE_MAIN_NAME && boardExt == CODE_MAIN_EXT) {        
            code = application.mainCode;
        } else {
            var localBoardId = application.getScreenParamByParam("id", "name", boardName),
                codeObj = objectFromParamAndValue(application.codes, "screen_id", localBoardId);
            
            if (boardExt == that.boardExtension.code) {
                code = codeObj.user_code;
            }        
            if (boardExt == that.boardExtension.definitions) {
                code = codeObj.generated_code;
            } 
        }
        return application.codeSeparate2nl(code);
    }    
    
    // update all codes from code Mirror (to memory & base)
    this.updateCodes = function() {        
        for(var i=0; i < tabsData.length; i++) {            
            var tabObj = tabsData[i];  
            
            if (!tabObj.isSaved) {
                
                if (tabObj.name == CODE_MAIN_NAME && tabObj.typeCode == CODE_MAIN_EXT) {
                    var code = tabObj.codeMirror.getValue("\n");
                    application.mainCode = code;
                    // prepare to send ajax
                    var newCode = application.codeNl2separate(code);
                    newCode = specialCharsToHtml(newCode);
                    updateMainCode(newCode); // send AJAX
                    tabObj.isSaved = true;                    
                } else {                               
                    var localBoardId = application.getScreenParamByParam("id", "name", tabObj.name);
                    var codeObj = objectFromParamAndValue(application.codes, "screen_id", localBoardId);
                    
                    var userCode = codeObj.user_code;
                    var generatedCode = codeObj.generated_code;
                    
                    if (tabObj.typeCode == that.boardExtension.code) {
                        userCode = tabObj.codeMirror.getValue("\n");
                        codeObj.user_code = userCode;                
                    }
                    if (tabObj.typeCode == that.boardExtension.definitions) {
                        var generatedCode = tabObj.codeMirror.getValue("\n");
                        codeObj.generated_code = generatedCode;
                    }
                                
                    if (localBoardId && userCode != undefined && generatedCode!= undefined) {
                        var newUserCode = application.codeNl2separate(userCode);
                        var newGenCode = application.codeNl2separate(generatedCode);
                        newUserCode = specialCharsToHtml(newUserCode);
                        newGenCode = specialCharsToHtml(newGenCode);
                        updateCodes(localBoardId, newUserCode, newGenCode, 0); // send AJAX
                        tabObj.isSaved = true;
                    }
                }
            }
        }
    }
    
    
    this.updateCodeOfManager = function() {   
        var resultCodes = that.getLatestCodes();        
        that.manager.setCodes(resultCodes);
    }
    
    this.printCodesToConsole = function() {
        var resultCodes = that.getLatestCodes();
        console.log(JSON.stringify(resultCodes).replace(/\\n/g,"\n").replace(/\\t/g,"\t").replace(/\\"/g,"\""));
    }    
    
    this.getLatestCodes = function() {
        this.updateCodes(); // update codes from code mirror (to memory & base)
        var resultCodes = [],
        codeCompileObj = null;          
        // all boards
        var listScreensId = application.getScreenListByParam("id");
        for(var i=0; i < listScreensId.length; i++) {            
            var id = listScreensId[i],                
                codeObj = objectFromParamAndValue(application.codes, "screen_id", id),
                boardObj = objectFromParamAndValue(application.boardsList, "screen_id", id),
                boardName = application.getScreenParamByParam("name","id",id);
                codeCompileObj = {board: boardObj, boardName: boardName, code: codeObj.user_code, definitions: codeObj.generated_code };  
            resultCodes.push(codeCompileObj);
        }
        // file 'main.Code' have to last file (important to compilation)
        codeCompileObj = {board: null, boardName: CODE_MAIN_NAME, code: application.mainCode, definitions: "" };
        resultCodes.push(codeCompileObj);
        return resultCodes;
    }
    
    
    this.getLeafIndexForOutline = function(name, treeObjs) {
        var leaf = null;
        for(var i=0; i < treeObjs.length; i++) {
            leaf = treeObjs[i];
            if (leaf && leaf.data && leaf.data.name == name) {
                return i;
            }
        }
        return -1;
    }    
    this.getLeafInstanceForOutline = function(name, treeObjs) {
        var index = that.getLeafIndexForOutline(name, treeObjs);
        if (index > -1) {
            return treeObjs[index];
        } else {
            return null;
        }
    }      
    
    this.addLeafToOutlineTree = function(leaf, treeObjs) {
        var nodeIdParent = -1,
           // nameInstance = "",
            leafParent = null; 
        if (!leaf || !treeObjs) {
            return;
        }         
        if (leaf.data && leaf.data.parentName) {
            leafParent = that.getLeafInstanceForOutline(leaf.data.parentName, treeObjs);
            if (leafParent) {
                leaf.nodeIdParent = "#"+leafParent.attr.id;
                leafParent.leaves.push(leaf);
                return;
            }
        } 
        treeObjs.push(leaf);    
    }
    
    this.sortLeafsInOutlineTree = function(treeObjs) {
        var leaf = null;
        for(var i=0; i < treeObjs; i++) {
            leaf = treeObjs[i];
            //if (leaf)
        }   
        
        treeObjs.push(leaf);    
    }    
    
    this.updateOutline = function() {
        // outline window is not visible so dont update him
        if (!that.help.isShow) {
            return;
        }      
        
        that.updateCodeOfManager();        
        that.manager.compile(); 
        
		var tabData = that.getTabDataByTabIndex(that.getActiveTab());		
		if (!tabData || !tabData.name) {
			return;
		}
		
        var boardName = tabData.name,
			statementsDef = that.manager.getStatementsDefByBoardName(boardName),
			statementsCode = that.manager.getStatementsCodeByBoardName(boardName),
			treeObjs = [],
			//statementsOutline = [],
			statements = [],
            statementsFunctions = [],           
            statementsClass = [],           
            statementsVars = [],           
            statementsFPrototype = [],           
			ext = "";
        	
		for(var iTypeCode=2; iTypeCode--;) {
			statements = (iTypeCode==1)?statementsDef:statementsCode;
			ext = (iTypeCode==1)?that.boardExtension.definitions:that.boardExtension.code;
						
			for(var i=0; i < statements.length; i++) {
				var statement = statements[i],
					object = {};
				
				//if (statement.type == "var" || statement.type == "function" || statement.type == "class" || 
				//    statement.type == "function_prototype") {
				    object.nodeIdParent = -1; // domyslnie ustawiamy na brak rodzica   
					object.data = {};
					object.attr = {};
					object.leaves = [];					
					
					that.help.uniqueId++;                
					object.attr.id = that.help.idObjectTreePrefix+that.help.uniqueId;
					object.attr.lineNumber = statement.lineNumber;
					
					object.attr.boardName = boardName;            
					object.attr.boardExtension = ext;
					
                    if ((statement.type == "var" || (statement.type == "statement" && statement.codeType == STATEMENT_CODE_TYPE_EQUAL ) ) 
                        && statement.varObj) {                   
                       object.data.icon = pathSystem+"/media/img/icon_statement.jpg";
                       //object.data.name = statement.varObj.name;
                        if (statement.varObj.nameParams && statement.varObj.nameParams.length > 1) {
                           var copyName = $.extend(true, [], statement.varObj.nameParams);
                           object.data.parentName = copyName[0];
                           copyName.splice(0, 1);
                           object.data.name = copyName.join(".");                           
                       } else {
                           object.data.name = statement.varObj.name;
                       }                        
                       object.data.title = object.data.name;
                       that.addLeafToOutlineTree(object, treeObjs);
                    }                     
                    if (statement.type == "function" && statement.functionObj) {
                       object.data.icon = pathSystem+"/media/img/icon_function.jpg";
                       object.data.title = statement.functionObj.name+"("+statement.functionObj.argsString+")";
                       object.data.name = statement.functionObj.name;
                       that.addLeafToOutlineTree(object, treeObjs);
                    }
                    if (statement.type == "function_prototype" && statement.functionObj) {
                       object.data.icon = pathSystem+"/media/img/icon_function.jpg";
                       
                       if (statement.functionObj.nameParams && statement.functionObj.nameParams.length > 1) {
                           var copyName = $.extend(true, [], statement.functionObj.nameParams);
                           object.data.parentName = copyName[0];
                           copyName.splice(0, 1);
                           object.data.name = copyName.join(".");                           
                       } else {
                           object.data.name = statement.functionObj.name;
                       }
                       object.data.title = object.data.name+"("+statement.functionObj.argsString+")";
                       that.addLeafToOutlineTree(object, treeObjs);
                    }          
                    
                    /*if (statement.type == "statement" && statement.codeType && statement.codeType == STATEMENT_CODE_TYPE_EQUAL) {
                        object.data.icon = pathSystem+"/media/img/icon_statement.jpg";
                       if (statement.varObj.nameParams && statement.varObj.nameParams.length > 1) {
                           var copyName = $.extend(true, [], statement.varObj.nameParams);
                           object.data.parentName = copyName[0];
                           copyName.splice(0, 1);
                           object.data.name = copyName.join(".");                           
                       } else {
                           object.data.name = statement.varObj.name;
                       }
                       object.data.title = object.data.name;
                       that.addLeafToOutlineTree(object, treeObjs);
                    }       */
                    
                    if (statement.type == "class" && statement.classObj) {
                       object.data.icon = pathSystem+"/media/img/icon_class.jpg";
                       object.data.title = statement.classObj.name;
                       object.data.name = statement.classObj.name;
                       that.addLeafToOutlineTree(object, treeObjs);
                    }      		
                    			                                
				//}
			}
		}		
		
		// treeObjs is array (list of elements)       
        
        //treeObjs = treeObjs.concat(statementsClass);
        //treeObjs = treeObjs.concat(statementsFunctions);
        //treeObjs = treeObjs.concat(statementsFPrototype);
        //treeObjs = treeObjs.concat(statementsVars);
        
        that.help.refreshJSTree(treeObjs);
    }
    
    //TODO 
    this.foldTextButtonRefresh = function() {
        var tabData = that.getTabDataByTabIndex(that.getActiveTab()),
            buttonText = "";       
        if (!tabData || !tabData.name) {
            return;
        }
        
        /*if (tabData.codeMirror.isFolded()) {
            alert("is folded");
        } else {
            alert("is not folded");
        }*/
                               
        if (tabData.isFold) {
            buttonText = "Unfold all comments";
        } else {
            buttonText = "Fold all comments";
        }
        $("#dialog_code_editor_fold").button("option", "label", buttonText);        
    }
    
    this.foldToogle = function() {
        var tabData = that.getTabDataByTabIndex(that.getActiveTab()),
            buttonText = "",
            cm = null,
            line = "";   
        if (!tabData || !tabData.name) {
            return;
        }      
        cm = tabData.codeMirror;
                         
        if (tabData.isFold) {
            tabData.isFold = false;
            $('#dialog_code_editor_fold').attr("disabled", true);
            CodeMirror.commands.unfoldAll(cm);
            setTimeout(function() {
              $('#dialog_code_editor_fold').removeAttr("disabled");  
            }, 500);
        } else {
            tabData.isFold = true;    
            $('#dialog_code_editor_fold').attr("disabled", true);                                
            for(var i = cm.firstLine(), e = cm.lastLine(); i <= e; i++) {
                line = cm.getLine(i);
                if (/.*\/\*.*/.test(line)) {
                    cm.foldCode(CodeMirror.Pos(i, 0), null, "fold");    
                }
            }    
            setTimeout(function() {
              $('#dialog_code_editor_fold').removeAttr("disabled");  
            }, 500);      
        }
        that.foldTextButtonRefresh();
    }
   
    var createExplorerElement = function(boardName, ext) {
        that.explorer.uniqueId++;
        var object = {
            data: {
                title: boardName+"."+ext,
                icon: pathSystem+"/media/img/icon_file.png"
            },
            attr: {
                id: that.explorer.idObjectTreePrefix+that.explorer.uniqueId,
                boardName: boardName,
                boardExtension: ext
            }
        };
        /*object.data = {};
        object.attr = {};                        
        object.attr.id = that.explorer.idObjectTreePrefix+that.explorer.uniqueId;
        object.attr.boardName = boardName;            
        object.attr.boardExtension = ext;            
        object.data.icon = pathSystem+"/media/img/icon_file.png";
        object.data.title = boardName+"."+ext;*/        
        return object;
    }
    
    
    this.getListOfFiles = function() {
        var result = [],
            listScreensName = application.getScreenListByParam("name");
        result.push(CODE_MAIN_NAME+"."+CODE_MAIN_EXT);
                
        for(var i=0; i < listScreensName.length; i++) {
            for(var j=0; j < 2; j++) {                
                var boardName = listScreensName[i];
                var ext = (j==0)?that.boardExtension.code:that.boardExtension.definitions;           
                result.push(boardName+"."+ext);
            }
        }        
        return result;
    }
    
    this.updateExplorer = function() {
        var treeJSON = new Array();
        var listScreensName = application.getScreenListByParam("name");
        
        treeJSON.push(createExplorerElement(CODE_MAIN_NAME, CODE_MAIN_EXT));
        
        for(var i=0; i < listScreensName.length; i++) {
            for(var j=0; j < 2; j++) {                
                var boardName = listScreensName[i],
                    ext = (j==0)?that.boardExtension.code:that.boardExtension.definitions
                    object = createExplorerElement(boardName, ext);
                treeJSON.push(object);
            }
        }
        //console.log(treeJSON);
        that.explorer.refreshJSTree(treeJSON);        
    }
    
    // [{name},{...}]
    this.generateByNewObject = function(params) {
        if (params.length > 0) {            
            var codeObj = objectFromParamAndValue(application.codes, "screen_id", boardId);
            var boardName = application.getScreenParamByParam("name","id",boardId);
            for(var iP=0; iP < params.length; iP++) {
                var param = params[iP];
                if (param.name) {   
                    
                    var codeDeclarationVariable = that.templates.stringDeclatationNewObject(param.name, param.type);
                    codeObj.generated_code += "\n\n"+codeDeclarationVariable;
                }
            }
            // update code
            var newUserCode = application.codeNl2separate(codeObj.user_code),
                newGenCode = application.codeNl2separate(codeObj.generated_code),
                tabData = that.findObjectOfTabsData([{search:"name", value:boardName},{search:"typeCode", value:that.boardExtension.definitions}]);
            newUserCode = specialCharsToHtml(newUserCode);
            newGenCode = specialCharsToHtml(newGenCode);
            updateCodes(boardId, newUserCode, newGenCode, codeObj.start); // send AJAX
            /*if (tabData) {
                var editor = tabData.codeMirror;
                if (editor) {
                    editor.setValue(codeObj.generated_code);
                }
            } */           
        } 
    }
    
    // [{name},{...}]
    this.generateByRemoveObject = function(params) {
        if (params.length > 0) {            
            var codeObj = objectFromParamAndValue(application.codes, "screen_id", boardId);
            var boardName = application.getScreenParamByParam("name","id",boardId);
            for(var iP=0; iP < params.length; iP++) {
                var param = params[iP];
                if (param.name) {
                    var codeArray = codeObj.generated_code.split("\n"),
                        wasChanged = false;
                    
                    // try change exist definitions
                    for(var i=0; i < codeArray.length; i++) {
                        var code = codeArray[i],
                            definition = Editor.definitions.definitionsFromCode(code);
               
                        if (definition.length > 0 && definition[0].variable == param.name) {
                            codeArray.splice(i,1);
                            i--;                                                 
                        }
                    }
                    codeObj.generated_code = codeArray.join("\n");  
                }
            }
            // update code
            var newUserCode = application.codeNl2separate(codeObj.user_code),
                newGenCode = application.codeNl2separate(codeObj.generated_code),
                tabData = that.findObjectOfTabsData([{search:"name", value:boardName},{search:"typeCode", value:that.boardExtension.definitions}]);
            newUserCode = specialCharsToHtml(newUserCode);
            newGenCode = specialCharsToHtml(newGenCode);
            updateCodes(boardId, newUserCode, newGenCode, codeObj.start); // send AJAX
            if (tabData) {
                var editor = tabData.codeMirror;
                if (editor) {
                    editor.setValue(codeObj.generated_code);
                }
            }
        } 
    }
    
    // [{name, parameter, value },{...}]    // change parameters and variable name instance
    this.generateByChangeParam = function(params) {  // change on canvas
                
        if (params.length > 0) {
            var codeObj = objectFromParamAndValue(application.codes, "screen_id", boardId);
            var boardName = application.getScreenParamByParam("name","id",boardId);
     
            for(var iP=0; iP < params.length; iP++) {
                var param = params[iP];
                if (param.name) {       
                    var codeArray = codeObj.generated_code.split("\n");
                    var wasChanged = false;
                    
                    // try change exist definitions
                    for(var i=0; i < codeArray.length; i++) {
                        var code = codeArray[i],
                            codeObjectParameter = code,
                            definition = Editor.definitions.definitionsFromCode(code);
               
                        if (definition.length > 0 && definition[0].variable == param.name) {
                            var def = definition[0];
                            
                            // change name of equal
                            if (def.codeType == STATEMENT_CODE_TYPE_EQUAL) {
                                if (param.parameter == "name") {
                                    codeObjectParameter = that.templates.stringObjectParameter(param.value, def.parameter, def.value);
                                    wasChanged = true;
                                } else if (def.parameter == param.parameter) {
                                    codeObjectParameter = that.templates.stringObjectParameter(param.name, param.parameter, param.value);
                                    wasChanged = true;
                                }
                            }
                            // change name of actions
                            if (def.codeType == STATEMENT_CODE_TYPE_ACTION && param.parameter == "name") {
                                codeObjectParameter = code.replace(param.name, param.value); // change first founded
                                wasChanged = true;
                            }
                            // change name of instance new object   
                            if (def.newObject && param.parameter == "name") {
                                var index = Editor.objectIndexByName(param.name);
                                if (index > -1) {
                                    Editor.editorObjects[index].name = param.value;
                                }
                                codeObjectParameter = code.replace(param.name, param.value);
                                wasChanged = true;
                            }                            
                            codeArray[i] = codeObjectParameter;                            
                        }
                    }
                     // add definition when not found
                    if (!wasChanged) {                       
                        for(var i=0; i < codeArray.length; i++) {
                            var code = codeArray[i]; 
                            var definition = Editor.definitions.definitionsFromCode(code);
                            if (definition.length > 0 && definition[0].variable == param.name && definition[0].newObject) {
                                var def = definition[0];
                                var codeObjectParameter = that.templates.stringObjectParameter(param.name, param.parameter, param.value);
                                i++;
                                codeArray.splice(i, 0, codeObjectParameter);                                                
                            }
                        }
                    }
                    codeObj.generated_code = codeArray.join("\n");  
                }                             
            }            
            // update code
            var newUserCode = application.codeNl2separate(codeObj.user_code),
                newGenCode = application.codeNl2separate(codeObj.generated_code),
                tabData = that.findObjectOfTabsData([{search:"name", value:boardName},{search:"typeCode", value:that.boardExtension.definitions}]);
            newUserCode = specialCharsToHtml(newUserCode);
            newGenCode = specialCharsToHtml(newGenCode);
            updateCodes(boardId, newUserCode, newGenCode, codeObj.start); // send AJAX
            if (tabData) {
                var editor = tabData.codeMirror;
                if (editor) {                    
                    editor.setValue(codeObj.generated_code);
                }
            }
        }
    }    
    
     // [{name: string},{...}]
    this.generateByChangeActions = function(params) {  // change on canvas in actions tree 
        if (params.length > 0) {            
            var codeObj = objectFromParamAndValue(application.codes, "screen_id", boardId);
            var boardName = application.getScreenParamByParam("name","id",boardId);
     
            for(var iP=0; iP < params.length; iP++) {
                var param = params[iP];
                if (param.name) {            
                    var codeArray = codeObj.generated_code.split("\n");
                    //var wasChanged = false;
                    
                    // remove all actions from code
                    for(var i=0; i < codeArray.length; i++) {
                        var code = codeArray[i];
                        var definition = Editor.definitions.definitionsFromCode(code);
                        if (definition.length > 0 && definition[0].variable == param.name && definition[0].codeType == STATEMENT_CODE_TYPE_ACTION) {
                            codeArray.splice(i,1);
                            i--;
                        }
                    }
                    //if (!wasChanged) {
                        // add definition when not found
                    for(var i=0; i < codeArray.length; i++) {
                        var code = codeArray[i]; 
                        var definition = Editor.definitions.definitionsFromCode(code);
                        if (definition.length > 0 && definition[0].variable == param.name && definition[0].newObject) {
                            var def = definition[0];
                            
                            // actions
                            var element = canvas.elementForBoardIdAndName(boardId, param.name);
                            if (element && element.dataset && element.dataset.designActions) {                            
                                var codeToAdd = that.manager.generateActions(param.name, element.dataset.designActions);
                          
                                if (codeToAdd != "") {
                                    i++;
                                    codeArray.splice(i, 0, codeToAdd);
                                }                                 
                            }                            
                                                                           
                        }
                    }
                    //}
                    codeObj.generated_code = codeArray.join("\n");  
                }
                
              
            }            
            var newUserCode = application.codeNl2separate(codeObj.user_code),
                newGenCode = application.codeNl2separate(codeObj.generated_code),
                tabData = that.findObjectOfTabsData([{search:"name", value:boardName},{search:"typeCode", value:that.boardExtension.definitions}]);
            newUserCode = specialCharsToHtml(newUserCode);
            newGenCode = specialCharsToHtml(newGenCode);
            updateCodes(boardId, newUserCode, newGenCode, codeObj.start); // send AJAX
            if (tabData) {
                var editor = tabData.codeMirror;
                if (editor) {                    
                    editor.setValue(codeObj.generated_code);
                }
            }
        }
    }    
         
    this.generateMainCode = function(boardName) {
        
        //var mainCode = application.mainCode.trim();
        var mainCode = "";
        //if (mainCode == "") {
            if (application.boardsList.length > 0) {
                var codeObj = objectFromParamAndValue(application.codes, "start", 1);                    
                if (codeObj && codeObj.screen_id) {
                    var tmpScreen = objectFromParamAndValue(application.screenObjectList, "id", codeObj.screen_id);
                    if (tmpScreen && tmpScreen.name) {
                        mainCode = 'goToBoard("'+tmpScreen.name+'");';
                        application.mainCode = mainCode;
                        mainCode = specialCharsToHtml(mainCode);
                        updateMainCode(mainCode);
                    }
                }
                
                /*
                var boardName = application.getScreenParamByParam("name","id",boardId);                
                var tmpCode = objectFromParamAndValue(application.screenObjectList, "id", application.boardsList[0].screen_id);
                */
                
                /*var tmpScreen = objectFromParamAndValue(application.screenObjectList, "id", application.boardsList[0].screen_id);
                if (tmpScreen && tmpScreen.name) {
                    mainCode = ""+tmpScreen.name+".run();";
                    application.mainCode = mainCode;
                    // prepare to send ajax
                    mainCode = specialCharsToHtml(mainCode);
                    updateMainCode(mainCode); // send AJAX                
                }*/
            }
       // }        	                
    }
    
    this.generateByActiveLine = function() {
        var boardName = application.getScreenParamByParam("name","id",boardId);
        var tabData = that.getTabDataByTabIndex(that.getActiveTab());       
        if (tabData && tabData.codeMirror && tabData.typeCode == that.boardExtension.definitions && tabData.name == boardName) {                
            var //lineString = that.getStringActiveLine(),
                linesDefinitions = tabData.codeMirror.getValue("\n"),
                definitions = Editor.definitions.definitionsFromCode(linesDefinitions);
                
            // set object on canvas by definitions
            var result = that.checkDefinitionsCorrect(linesDefinitions);
            
            // find any error in definitions
            if (!result.isCorrect) {                
                that.manager.boardNameError = tabData.name;
                that.manager.boardExtensionError = tabData.typeCode;
                that.manager.numberLineError = result.errorLineNumber;                
                tabData.codeMirror.addLineClass(result.errorLineNumber-1, "wrap", "code_mirror_line_error");
                tabData.codeMirror.refresh();
                
                canvas.setRenderBoardElements(false);
            } else {
                canvas.setRenderBoardElements(true);
            }
        }
    }
    
    this.checkDefinitionsCorrect = function(definitionsCode) {
        var definitions = Editor.definitions.definitionsFromCode(definitionsCode);
        // set object on canvas by definitions
        var result = Editor.definitions.setObjectOnCanvasByDefinitions(definitions);
        return result;
    }
    
    this.jumpToLineForObjectName = function(elementName) {
        var codeObj = objectFromParamAndValue(application.codes, "screen_id", boardId),
            definitions = Editor.definitions.definitionsFromCode(codeObj.generated_code),
            boardName = application.getScreenParamByParam("name","id",boardId);
        
        for(var i=0; i < definitions.length; i++) {
            var def = definitions[i];
            if (def && def.newObject && def.variable == elementName) {
                that.openEditor();
                that.jumpToLine(boardName, that.boardExtension.definitions, def.lineNumber, TYPE_SELECT);
                return;
            }
        }
        
        console.log(definitions);
    }
    
    
    this.setFocusOnEditor = function() {
        var tabData = that.getTabDataByTabIndex(that.getActiveTab());       
        if (tabData && tabData.codeMirror) {  
            tabData.codeMirror.refresh();          
            tabData.codeMirror.focus();
        }
    } 
       
    this.clearSnapshot = function() {        
        snapshotLatestCode = []
    }          
       
    this.doSnapshotCode = function() {        
        snapshotLatestCode = that.getLatestCodes();
    }        
    
    this.receiveFromSnapshotCode = function() {
       if (snapshotLatestCode && snapshotLatestCode.length > 0) {

           for(var i=0; i < snapshotLatestCode.length; i++) {
               var snapCode = snapshotLatestCode[i], // >>   boardName, code, definitions
                   code = "",
                   boardName = snapCode.boardName;
                                      
                var tabDataDef = that.findObjectOfTabsData([{search:"name", value:boardName},{search:"typeCode", value:that.boardExtension.definitions}]);
                var tabDataCode = that.findObjectOfTabsData([{search:"name", value:boardName},{search:"typeCode", value:that.boardExtension.code}]);
              
                if (boardName == CODE_MAIN_NAME) {        
                    application.mainCode = snapCode.code;
                    
                    if (tabDataCode && tabDataCode.codeMirror) {
                        tabDataCode.codeMirror.setValue(application.mainCode);
                    }                    
                    // refresh codeMirror
                } else {
                    var localBoardId = application.getScreenParamByParam("id", "name", boardName),
                        codeObj = objectFromParamAndValue(application.codes, "screen_id", localBoardId);
                    
                    codeObj.generated_code = snapCode.definitions;
                    codeObj.user_code = snapCode.code;
                    
                    if (tabDataDef && tabDataDef.codeMirror) {
                        tabDataDef.codeMirror.setValue(codeObj.generated_code);
                    }
                    if (tabDataCode && tabDataCode.codeMirror) {
                        tabDataCode.codeMirror.setValue(codeObj.user_code);
                    }
                }
           }
       }
    }    
       
    this.writeInActiveCodeMirror = function(dataKeys, callbackRun, callbackPause, callbackStop, options) {
        
        window.clearInterval(timerAutosave); // interrupt timer during autowriring
        timerAutosave = null;            
        that.doSnapshotCode();
          
        if (dataKeys.length > 0) {
            aWriteCM = new AutowritingCodeMirror({
                typeWriting: "keys",
                //codeMirror: tabData.codeMirror,
                codeEditor: that,  
                text: 'var text = "hello world";\ntext = "autowriting"; // komentarz\nshowAlert("Show text: "+text);\n\n\n',
                dataKeys: dataKeys,
                events: {
                    run: function() {
                        if (callbackRun && typeof callbackRun == "function") {
                            callbackRun();
                        }
                    },                        
                    pause: function() {
                        if (callbackPause && typeof callbackPause == "function") {
                            callbackPause();
                        }
                    },
                    stop: function() {                        
                        if (!timerAutosave) {
                            timerAutosave = window.setInterval(this.updateCodes, autosaveSec*1000);
                        }
                        function stopEvent() {
                            if (callbackStop && typeof callbackStop == "function") {
                                callbackStop();
                            }
                        }                                        
                        // const animation add to lesson X, to click button Run
                        
                        /*if (isLessonHelloWorldRun()) {
                            var animClick = new AnimClick();
                            animClick.start("dialog_code_editor_compile", stopEvent);
                        } else {
                            stopEvent();
                        }*/
                        stopEvent();
                    }
                }
            });
            if (options && typeof options["isSound"] !== "undefined") {
                if (!options.isSound) {
                    aWriteCM.setEqualInterval(5);
                }
            }
            aWriteCM.run();
        }
    }   
    
    this.stopWriteInActiveCodeMirror = function() {
        if (aWriteCM) {
            aWriteCM.stop();
        }
    }
    
    this.setReadOnlyDebugForAll = function(isReadOnly) {
        for(var i=0; i < tabsData.length; i++) {
            var tabData = tabsData[i];
            if (tabData && tabData.codeMirrorDebug) {
                if (isReadOnly) {
                  //  tabData.codeMirrorDebug.markText({line: 0, ch: 0}, {line: tabData.codeMirrorDebug.lastLine(), ch: Number.MAX_VALUE}, {readOnly: isReadOnly});
                } else {
                    tabData.codeMirrorDebug.markClean();
                }
            } 
        }
    }        
    
    this.setReadOnlyDebugForLine = function(boardName, boardExt, line, isReadOnly) {
        var tabData = that.findObjectOfTabsData([{search:"name", value: boardName},{search:"typeCode", value: boardExt}]);
        if (tabData && tabData.codeMirrorDebug) {
            tabData.codeMirrorDebug.markText({line: line-1, ch: 0}, {line: line+1, ch: Number.MAX_VALUE}, {readOnly: isReadOnly});
        }
    }
        
    /*this.clearReadOnlyDebugForRange = function(boardName, boardExt, line, range) {
        var tabData = that.findObjectOfTabsData([{search:"name", value: boardName},{search:"typeCode", value: boardExt}]);
        if (tabData && tabData.codeMirrorDebug && range) {
            var markText = tabData.codeMirrorDebug.markText({line: line-1, ch: range.from}, {line: line-1, ch: range.to}, {readOnly: true});
        }
    } */      
    
    this.setDebugConsoleRead = function(boardName, boardExt, line, range) {
        //if (!textMarkerConsoleRead) {
            var tabData = that.findObjectOfTabsData([{search:"name", value: boardName},{search:"typeCode", value: boardExt}]);
            if (tabData && tabData.codeMirrorDebug && range) {
                textMarkerConsoleRead = tabData.codeMirrorDebug.markText({line: line-1, ch: range.from}, {line: line-1, ch: range.to}, {readOnly: true});
                //tabData.codeMirrorDebug.setCursor({line: line-1, ch: range.to });
                
                            
                //var markText = tabData.codeMirrorDebug.markText({line: line-1, ch: range.from}, {line: line-1, ch: range.to}, {readOnly: true});
                //return {cmDebug: tabData.codeMirrorDebug, markText: markText}
            }
        //}
    }
    
    this.removeDebugConsoleRead = function() {
        if (textMarkerConsoleRead) {
            textMarkerConsoleRead.clear();
            textMarkerConsoleRead = null;
        }
    }   
    
    /*this.setReadOnlyDebugForRange = function(boardName, boardExt, line, range) {
        var tabData = that.findObjectOfTabsData([{search:"name", value: boardName},{search:"typeCode", value: boardExt}]);
        if (tabData && tabData.codeMirrorDebug && range) {
            var markText = tabData.codeMirrorDebug.markText({line: line-1, ch: range.from}, {line: line-1, ch: range.to}, {readOnly: true});
        }
    } */    
    
    

    this.setReadOnlyForAllFile = function(isReadOnly) {
        if (!isReadOnly) {
            readOnlyBoardsList = [];
        } else {
            readOnlyBoardsList = that.getListOfFiles();
        }
        for(var i=0; i < tabsData.length; i++) {
            var tabData = tabsData[i];
            if (tabData && tabData.codeMirror) {
                tabData.codeMirror.setOption("readOnly", isReadOnly);
            } 
        }
    }    

    this.setReadOnlyForFile = function(filename, isReadOnly) {
        if (isReadOnly) {
            if (!isExistStringInArray(filename, readOnlyBoardsList)) {
               readOnlyBoardsList.push(filename); 
            }            
        } else {
            removeObjectFromObjectsArray(filename, readOnlyBoardsList);
        }
        var nameAndExt = filename.split(".");
        if (nameAndExt.length == 2) { 
            var boardName = nameAndExt[0],
                boardExtension = nameAndExt[1],
                tabData = that.findObjectOfTabsData([{search:"name", value:boardName},{search:"typeCode", value:boardExtension}]);
            if (tabData && tabData.codeMirror) {
                tabData.codeMirror.setOption("readOnly", isReadOnly);
            }
        }
    }    
    
    this.setBlockedClosedForAllFile = function(isBlocked) {
        if (!isBlocked) {
            blockedClosedBoardsList = [];
        } else {
            blockedClosedBoardsList = that.getListOfFiles();
        }
    }    
    
    this.setBlockedClosedForFile = function(filename, isBlocked) {
        if (isBlocked) {
            if (!isExistStringInArray(filename, blockedClosedBoardsList)) {
               blockedClosedBoardsList.push(filename); 
            }            
        } else {
            removeObjectFromObjectsArray(filename, blockedClosedBoardsList);
        }
    }  
    
    
    // boardName: string, boardExt: string, range: {from, to}
    this.indexOfDebugCodeForBoard = function(boardName, boardExt) {
        for(var i=0; i < debugCodes.length; i++){
            if (boardName == debugCodes[i].name && boardExt == debugCodes[i].typeCode) {
                return i;
            }
        }
        return -1;
    }
    
    this.resetEditorDebug = function() {
        debugCodes = [];
        for (var i=0; i < tabsData.length; i++){
            var tabData = tabsData[i];
            if(tabData && tabData.codeMirrorDebug) {
                var posStart = {line: 0, ch: 0},
                    posEnd = {line: tabData.codeMirrorDebug.lastLine(), ch: Number.MAX_VALUE};                                            
                tabData.codeMirrorDebug.replaceRange("", posStart, posEnd);                        
            }
        }    
    }
    
    this.setEditorDebugForCode = function(boardName, boardExt, code) {          
        var isFind = false,
            index = this.indexOfDebugCodeForBoard(boardName, boardExt);        
        if (index > -1) {
            debugCodes[index].code = code;
            isFind = true;
        }        
        /*for(var i=0; i < debugCodes.length; i++){
            if (boardName == debugCodes[i].name && boardExt == debugCodes[i].typeCode) {
                debugCodes[i].code = code;
                isFind = true;
            }
        }*/
        if (!isFind) {
            debugCodes.push({
                name: boardName,
                typeCode: boardExt,
                code: code
            });
        }
        
        var tabData = that.findObjectOfTabsData([{search:"name", value: boardName},{search:"typeCode", value: boardExt}]);        
        if(tabData && tabData.codeMirrorDebug) {
            
            //var posStart = {line: 0, ch: 0},
             //   posEnd = {line: tabData.codeMirrorDebug.lastLine(), ch: Number.MAX_VALUE};                                            
            //tabData.codeMirrorDebug.replaceRange("", posStart, posEnd);                        
            tabData.codeMirrorDebug.setValue(code+"\n");
            tabData.codeMirrorDebug.refresh();
        }        
    }
        
    // boardName: string, boardExt: string, range: {from, to}
    this.clearEditorDebugForRange = function(boardName, boardExt, range) {
        var tabData = that.findObjectOfTabsData([{search:"name", value: boardName},{search:"typeCode", value: boardExt}]),        
            index = this.indexOfDebugCodeForBoard(boardName, boardExt);        
        if(tabData && tabData.codeMirrorDebug && range) {  
                      
            for(var i=range.from; i < range.to; i++) {
                tabData.codeMirrorDebug.replaceRange("", {line: i, ch: 0}, {line: i, ch: Number.MAX_VALUE});
                if (index > -1) {
                    var debugCodesArray = debugCodes[index].code.split("\n");
                    debugCodesArray[index] = "";
                    debugCodes[index].code = debugCodesArray.join("\n");
                }
            }                        
        }        
    }
    
    // boardName: string, boardExt: string, code: string, line: int
    this.setEditorDebugForCodeLine = function(boardName, boardExt, code, line) {        
        var index = this.indexOfDebugCodeForBoard(boardName, boardExt);
        if (index > -1) {
            var debugCodesArray = debugCodes[index].code.split("\n");
            debugCodesArray[line] = code;
            debugCodes[index].code = debugCodesArray.join("\n");
        }
        /*
        for(var i=0; i < debugCodes.length; i++){
            if (boardName == debugCodes[i].name && boardExt == debugCodes[i].typeCode) {
                var debugCodesArray = debugCodes[i].code.split("\n");
                debugCodesArray[line] = code;
                debugCodes[i].code = debugCodesArray.join("\n");
                return;
            }
        }*/
    } 
    
    
    this.startDebugger = function() {
        browserEmulator.isDebugger = true;
        browserEmulator.isNextStep = true;
        browserEmulator.debugInterrupt = false;
        isOpenDebugLineDetails = false;
        //that.setDisabledButton("DEBUG", true);
        //that.setDisabledButton("NEXT_STEP", false);
        //that.setDisabledButton("STOP_DEBUG", false);
        that.setReadOnlyForAllFile(true);
        that.showOutline(false);
        that.showConsole(false);
        that.showConsoleSection(false);
        
        $('#dialog_code_editor_debug').button('option', 'label', TEXT_STOP_DEBUG);
        $("#dialog_code_editor_next_step").show();
        $("#dialog_code_editor_compile").hide();
        
        that.refreshDebugger();
    }
    
    this.stopDebugger = function() {
        browserEmulator.isDebugger = false;
        browserEmulator.isNextStep = false;
        browserEmulator.debugInterrupt = true;
        isOpenDebugLineDetails = false;
        browserEmulator.isRunning = false;
        
        //that.setDisabledButton("DEBUG", false);
        //that.setDisabledButton("NEXT_STEP", true);
        //that.setDisabledButton("STOP_DEBUG", true);
        that.clearLinesType("code_mirror_line_debug");
        that.clearLinesType("code_mirror_line_conditional");
        that.setReadOnlyForAllFile(false);
        that.clearDebugLineDetails();
        that.showOutline(isShowOutline);
        that.showConsole(false);
        that.showConsoleSection(true);
        
        $('#dialog_code_editor_debug').button('option', 'label', TEXT_START_DEBUG);
        $("#dialog_code_editor_next_step").hide()
        $("#dialog_code_editor_compile").show();
        
        that.refreshDebugger();
    }
    
    this.nextStepDebugger = function() {
       if (browserEmulator.isDebugger && !browserEmulator.isNextStep) {
            browserEmulator.isNextStep = true;
            that.setDisabledButton("NEXT_STEP", true);
            //isOpenDebugLineDetails = false;
            that.refreshDebugger();                        
        }        
    }
    
    this.refreshDebugger = function() {        
        for(var i=0; i < tabsData.length; i++) {
            var tabData = tabsData[i];
            if (tabData) {
                if (browserEmulator.isDebugger) { 
                    $("#"+tabData.idEditor).css("width","50%");
                    if (!isOpenDebugLineDetails) {
                        $("#"+tabData.idDebugger).css("width","50%");
                        $("#"+tabData.idDebugger).css("display","block");
                        $("#"+tabData.idDetails).css("width","0%");
                        $("#"+tabData.idDetails).css("display","none");
                    } else {
                        $("#"+tabData.idDebugger).css("width","0%");
                        $("#"+tabData.idDebugger).css("display","none");
                        $("#"+tabData.idDetails).css("width","50%");                        
                        $("#"+tabData.idDetails).css("display","block");
                    }
                } else {
                    $("#"+tabData.idEditor).css("width","100%");
                    $("#"+tabData.idDebugger).css("width","0%");
                    $("#"+tabData.idDetails).css("width","0%");
                    $("#"+tabData.idDebugger).css("display","none");
                    $("#"+tabData.idDetails).css("display","none");
                }
            } 
        } 
    }    

    this.openEditor = function() {
        $("#"+this.idDialog).dialog("open");
        browserEmulator.sourceOpen = browserEmulator.SOURCE_OPEN_CODE_EDITOR;
        
        //$("#"+that.idEditor).css("display","block");        
        //$("#editor").css("display","none");
        //browserEmulator.displayEmulator(false);
        
        if (!timerAutosave) {
            timerAutosave = window.setInterval(this.updateCodes, autosaveSec*1000);
        }
        if (!timerAutogenerateOutline) {
            timerAutogenerateOutline = window.setInterval(this.updateOutline, autogenerateOutlineSec*1000);
        }
        
        if (!stoper) {
            stoper = new Stoper();
            stoper.addLoopEvents("STOPER: update outline",1500, function(name) {
                stoper.stop();
                console.log(name);                
                that.updateOutline();                
            });
        }        
        
        this.generateMainCode();
        //var boardName = application.getScreenParamByParam("name","id",boardId);
        //if (firstOpenDialog && boardName) {
        //    that.addTab(boardName, that.boardExtension.code);
        //    that.addTab(boardName, that.boardExtension.definitions);
        //}
        if (firstOpenDialog) {
            that.addTab(CODE_MAIN_NAME, CODE_MAIN_EXT);
            isShowOutline = true;
            that.showOutline(true);
            that.showConsole(isShowConsole);
        }
        
        //tabs.tabs( "option", "active", 0 );
        var tabData = that.getTabDataByTabIndex(that.getActiveTab());       
        if (tabData && tabData.codeMirror) {  
            tabData.codeMirror.refresh();
            tabData.codeMirrorDebug.refresh();          
            //tabData.codeMirror.focus();            
            if(currentCursorPosition && currentCursorPosition.line && currentCursorPosition.ch) {
                tabData.codeMirror.setCursor(currentCursorPosition);
            }           
        }
                
        that.updateOutline();     
        that.updateExplorer();
        firstOpenDialog = false;  
    }  
       		
    this.closeEditor = function() { 
        $("#"+this.idDialog).dialog("close");
    }      
    
      	
    		
}
