    
    // pathSystem
    var pathSystem = "/articlesdesigner";
    
    // const
    var DEFAULT_TEXT_OF_TEXT_NODE  = "Please fill this.";
    var DEFAULT_TEXT_OF_BUTTON_NODE = "Please fill this.";
    var DEFAULT_IMAGE = pathSystem+"/media/img/image.png";
    var ELEMENT_TYPE_TEXT = "text";
    var ELEMENT_TYPE_BUTTON = "button";
    var ELEMENT_TYPE_HTML = "html";
    var ELEMENT_TYPE_IMAGE = "image";
    var ELEMENT_TYPE_MAP = "map";
    var ELEMENT_TYPE_CLICKABLE_AREA = "clickable_area";
    var ELEMENT_TYPE_TEXTEDIT = "textedit";    
    var ELEMENT_TYPE_BOARD = "board";

    // application element
    var application;
    // Canvas element
    var canvas;    
    // The actual active element
    var activeElement;
    // Handle grid
    var grid;
    // Resources
    var resourcesUpload = new Array();
    // List of available properties for active element
    var properties;
    // Actions for elements
    var actions;
    // Code editor
    var codeEditor;
    // Publish code
    var publishCode;
	// global change
	var globalChange;
    // dialogs
    var messageDialog;    
    // Array of draggable items in menu.
    var draggableItemsMenu = new Array();
    // Array of list resources (image, music etc.)
    var resourcesImageList = new Array();
    var resourcesMusicList = new Array();
    // instance of google maps
    var popupsContainer;	
    // instance of google maps
    var mapsContainer;	
    //// text color
    var text_color_hex;
    // isTizen
    var isTizen = false;
    // tizen navigator bar
    var tizenNavigationBar = 60;
    // Emulator
    var browserEmulator;
    // sequences system
    var sequencesSystem;
    // administrator editor
    var adminEditor;
    
  
    // wait for the DOM to be loaded
    function main() {

        application = new Application();
        if (jsonSettings) {
           application.settings = JSON.parse(specialCharsToHtml(jsonSettings));

           var settValue = application.settingsValueForKey("is_always_debugger");
           if (settValue) {
               var isAlwaysDebugger = parseInt(settValue);
               if (!isNaN(isAlwaysDebugger)) {
                   application.isAlwaysDebugger = !!isAlwaysDebugger;
               }
           }
           
        }         
        
        // section: new area, properties, items list
        setSection(0);
        setEventOfSection();
        
        //removeAllCookies();displayAllCookies();         
        //$("#menu_list_container").tooltip();        
        
        // get & set set list of screens (ajax)
        getScreenList({
            async: false,
            data: {
                app_id: appId
            },            
            success: function(resultJSON) {
                console.log(resultJSON);
                var resultData = resultJSON;
                if (!resultData || !application) {
                    return;
                }
                var screenData = JSON.parse(resultData);
                if (screenData) {
                    application.setScreenListFromServer(screenData.screens);        
                    application.showSelectScreen();
                    //application.boardName = application.getScreenParamByParam("name","id",boardId);
                }
            }
        });
                
        //getSwipegroupsList();

        var isPortrait = (orientation == "portrait")?true:false;
        canvas = new Canvas('canvas', false);
        
        var pathBoardBackground;
        if (boardBackground == "None" || boardBackground == "" || boardBackground == "-") {
            boardBackground = "";
            pathBoardBackground = defaultBackgroundOfCanvas();
            updateBoard(boardId, boardBackground, boardSound);
        } else {
            pathBoardBackground = pathSystem+"/media/upload/"+appId+"/img/"+boardBackground;
        }
        if (boardSound == "None" || boardSound == ""|| boardSound == "-") {
            boardSound = "";  
            updateBoard(boardId, boardBackground, boardSound);          
        }
        canvas.setResolution({x:750,y:520});                 
        canvas.setBackground(28,20, pathBoardBackground);        
		canvas.setWorkspaceMargin(20, 8, 0, 0); //20, 20, 20, 22
        canvas.setBackground(28,20, pathBoardBackground);        
        
        activeElement = new ActiveElement(canvas.id);  
        activeElement.setCallback(activeElement.CALLBACK_ELEMENT_NOT_ACTIVE, callbackElementNotActive);
        properties = new Properties('properties');
        
		popupsContainer = new PopupsContainer();
		
        grid = new Grid(canvas,"checkbox_show_grid","checkbox_drag_to_grid","input_grid_size");
        //grid.show();grid.setDrag(true);
        		
		globalChange = new GlobalChange();
        
        // actions
		var optionsActions = { id_actions: "actions", 
							   id_actions_header: "actions_header",
							   id_actions_tree: "actions_tree",
							   id_actions_tree_option_prefix: "actions_tree_option",
							   id_actions_tree_element_delete: "actions_tree_element_delete",
							   id_actions_parameters: "actions_parameters",
							   id_actions_available: "actions_available",      
							   list_actions_available: new Array(ACTIONS_ONCLICK,/*ACTIONS_ONDROP,*/
									//ACTIONS_SHOW_ELEMENT,ACTIONS_HIDE_ELEMENT,
									ACTIONS_RUN_XML, 
									ACTIONS_SHOW_TPOPUP, 
									//ACTIONS_ITEM_SHOW_TPOPUP,
									ACTIONS_PLAY_MP3//, ACTIONS_STOP_MP3
									//ACTIONS_SHOW_IMAGE,ACTIONS_INITIATE_CONVERSATION,
									//ACTIONS_TAKE_ITEM, ACTIONS_DROP_ITEM
									),         
							  }		
        actions = new Actions(optionsActions);
        actions.propertyLiClass = "action_property";
        actions.callbackChangeActions = callbackChangeActions;
        //actions.refresh();
		$("#actions").corner();
		$("#actions_parameters").corner();
		
		//swipegroups = new Swipegroups("swipegroups");
		//selectSwipegroup(swipegroups.activeElem);
						
		messageDialog = new MessageDialog("messageDialog");
		
        $( "#dialog_resources" ).dialog({
            autoOpen: false,
            resizable: false,
			title: '<img src="'+pathSystem+'/media/img/library_title_icon.png" style="vertical-align:top;margin-top:6px;" /> <span class="title">LIBRARY</span>',
            modal: true,
            width: 720,
            height: 620,
            close: function( event, ui ) {
                selectElement(activeElement.elementSelected);
            },                 
        });
        $("#dialog_resources_open").click(function(){
            var isFind = false;
            EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}        

            openResourcesDialog();   
        });         
        resourcesUpload[0] = new ResourcesUpload("uploadImage","resources_upload_image",{accept_file: "image/*",type_data:RESOURCES_TYPE_IMAGES});        
        resourcesUpload[1] = new ResourcesUpload("uploadMusic","resources_upload_sound",{accept_file: "audio/*",type_data:RESOURCES_TYPE_SOUNDS});        
   
		mapsContainer = new MapsContainer();
   
        $( "#dialog_export" ).dialog({
            autoOpen: false,
            resizable: false,
            width: 330,
            height: 150,            
        });   
        
        // set list for properties & resource upload
        getUploadedFilesByType("image");
        getUploadedFilesByType("sound");              
               
        publishCode = new PublishCode();          
               
        // Set the tabs to be switchable
        $( "#tabs" ).tabs({
            collapsible: true
        });
        
        $( "#tabs_resources" ).tabs({
            collapsible: false            
        });        
        
        codeEditor = new CodeEditor();
        // open & close to create instance of tab
        //codeEditor.openEditor();
        //codeEditor.closeEditor();

        browserEmulator = new BrowserEmulator();
        browserEmulator.displayEmulator(false);
        browserEmulator.displayBoard({}); // default empty board 
        
        sequencesSystem = new SequencesSystem();
        
        $("#back_to_previous").click(function() {
            application.backToPrevious();
        });        

        if (isEditStart != "True") {
            //$("#startingAddingBubbles").css("display", "none");
        } else {                    
            $("#header1_buttons").append('<input id="startingAddingBubbles" style="cursor: pointer;font-size: 10px;width:120px;white-space: normal;" type="button" value="Click this button if you have finished editing starting project and would like to start adding bubbles.">');            
            $("#startingAddingBubbles").click(function() {
                function setProjectAsFinal() {
                    AjaxTutorial.ajaxCopyToEndProject({
                        data:{
                            lesson_id: lessonId,
                            project_id: appId
                        },
                        success: function() {
                            
                          AjaxTutorial.ajaxFinishedEditingStarting({
                              data:{
                                  lesson_id: lessonId,
                              },
                              success: function() {
                                  window.location.assign(pathSystem+'/editend/'+lessonId+"/");
                              },
                              error: function() {
                                  messageDialog.show("Project", "Error.", "OK");
                              }
                          }); 
                        },
                        error: function() {
                          messageDialog.show("Project", "Error.", "OK");
                        }  
                    });
                }
                messageDialog.showWithTwoButtons("Project", "Are you sure?","Tak", "Nie", setProjectAsFinal);   
            });
        }

        $(document).keyup(function(e) {
            if(e.keyCode  == 13) { // ENTER
                if (browserEmulator && browserEmulator.isDebugger && codeEditor.isOpen() && !browserEmulator.isNextStep) {
                    codeEditor.nextStepDebugger();
                }
            }            
            if(e.keyCode  == 46) { // DELETE
                callbackPropertyDeleteElement();
            }
            /*if(e.keyCode  == 113) { // F2
                if (!adminEditor.isOpen()) {
                    adminEditor.show();
                } else {
                    adminEditor.hide();
                }
            } */      
            if(e.keyCode  == 115) { // F4
                console.log("printCodesToConsole");
                codeEditor.printCodesToConsole();                
            }             
            if(e.keyCode  == 118) { // F7
                
               //if (!codeEditor.isOpen()) {
                  codeEditor.openEditor(); 
               //} else {
                  //codeEditor.closeEditor();
               //}
            }            


        });        
        
    
        //OnLoad functionality here
        draggableItemsMenu = document.getElementsByClassName('menu_item');          
        // manage menu & elements items
        setDraggableMenuItems();
        setCanvasDroppable();
        setEditables();   
        
        
        var pJSCode = new ParserJSCode();
        pJSCode.testUnit();		
    }    
    
    isLessonHelloWorld = function() {      
        var orderTip = sequencesSystem.bubbles.getCurrentTip().order,
            correctOrderLesson = 1,
            correctOrderModule = 1,
            correctOrderTip = 0;
        if (correctOrderModule && parseInt(lessonOrder) == correctOrderLesson && orderTip == correctOrderTip) {
            return true;
        } else {
            return false;
        }
    }
    isLessonHelloWorldRun = function() {      
        var orderTip = sequencesSystem.bubbles.getCurrentTip().order,
            correctOrderLesson = 1,
            correctOrderModule = 1,
            correctOrderTip = 1;
        if (correctOrderModule && parseInt(lessonOrder) == correctOrderLesson && orderTip == correctOrderTip) {
            return true;
        } else {
            return false;
        }
    }    
        
    
