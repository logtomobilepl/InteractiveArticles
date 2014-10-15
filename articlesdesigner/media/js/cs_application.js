////////////////////
// APPLICATION

function Application() {
    var that = this;
    this.idSelectScreen = "select_screen";
    
    this.isAlwaysDebugger = false;

    this.boardsList = []; // [{id, screen_id, background, sound, panel_items}, {...}]
    this.codes = [];  //  [{screen_id, user_code, generated_code, start}, {...}]
    this.screenObjectList = []; // [{ name, id }, {...}]
    this.screensNameList = [];  // []
    this.soundsList = [];  // []
    this.imagesList = [];  // []
    this.swipegroupsObjectList = []; // data from old system
    this.mainCode = "";   
    
    // settings of global project
    // definition - example
    // id  key                           value  (separated by a semicolon)
    // 1   is_debugger_module_lesson      1;2
    // ----
    // KEYS
    // is_debugger_module_lesson         moduleOrder:INT;lessonOrder:INT
    // is_always_debugger                {0,1}:INT     
    this.settings = {settings:[]} //{debugger_lessons: [{is_debugger_module_lesson: "1,0"}]}     
    this.onlyRun = false;  // this project can only run without edit
        
    $("#create_new_board").click(function(){
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}                
        
        window.location.assign(pathSystem+'/addscreen/app/'+appId+'/?newscreen=1');
    });
    
    this.backToPrevious = function() {
        if (isEditTutorial || isContinueTutorial) {
            window.location.assign(pathSystem+'/lessons/');    
        } else {
            window.location.assign(pathSystem+'/addscreen/app/'+appId+'/');
        }   
    }
    
    this.settingsValueForKey = function(key) {
        var keyValueArr = this.settings.settings;
        for(var i=0; i < keyValueArr.length; i++) {
            if (keyValueArr[i].hasOwnProperty(key)) {
                return keyValueArr[i][key];
            }
        }
        return null;
    }
    
    this.settingsAllValuesForKey = function(key) {
        var keyValueArr = this.settings.settings,
            resultArr = [];
        for(var i=0; i < keyValueArr.length; i++) {
            if (keyValueArr[i].hasOwnProperty(key)) {
                resultArr.push(keyValueArr[i][key]);
            }
        }
        return resultArr;
    }    
      
    this.setScreenListFromServer = function(screensArray) {
        for(var i=0;i<screensArray.length; i++) {
            var objScreen = screensArray[i];
            for( var prop in objScreen ) {
                if( objScreen.hasOwnProperty( prop ) ) {
                    var value = objScreen[ prop ];
                    var obj = { name: prop , id: value };
                    this.screenObjectList.push(obj); 
                    this.screensNameList.push(prop);                  
                }
            }
        }           
    }
    
    this.getScreenParamByParam = function(paramReturn, paramSearched, valueSearched) {
        return paramFromParamAndValue(this.screenObjectList, paramReturn, paramSearched, valueSearched);
    }
    
    this.getScreenListByParam = function(param) {
        return arrayFromArrayParam(this.screenObjectList,param);
    }    
    
    this.getBackgroundByParam = function(paramReturn, paramSearched, valueSearched) {
        return paramFromParamAndValue(this.boardsList, paramReturn, paramSearched, valueSearched);
    }    
   

    var callbackSelectScreen = function(propertyObj,value) {
        if (propertyObj.id == "app_select_screen") {
            $("#"+this.idSelectScreen).val(value);
            var id = that.getScreenParamByParam("id", "name", value);
            if (value && id) {
                //window.location.assign(pathSystem+"/screen/"+id+"/");
                currentScreenId = id;
                boardId = id;
                canvas.setCanvasForScreenId(currentScreenId);
                that.refreshCanvasBackground();
                that.refreshCanvasSound();
                //codeEditor.manager.setObjectOnCanvasByDefinitions();
                that.setCorrectBoardRender();
            }
        }
    }
    
    this.showSelectScreen = function() {
        var propertyScreens = new Property("app_select_screen", "select", "");                
        var listScreensName = this.getScreenListByParam("name");
        
		propertyScreens.setClassName("app_property");
        propertyScreens.setTemplate(320,0);
        propertyScreens.setOptionOfSelect(listScreensName);        
        propertyScreens.styleRight = "width:240px;margin-top:0px;"
        propertyScreens.callbackChangeValue = callbackSelectScreen;
        $("#"+this.idSelectScreen)[0].appendChild(propertyScreens.getElement());
        
		console.log();
        var name = this.getScreenParamByParam("name","id",boardId);
        if (name) {
            propertyScreens.setValue(name);
            if (isContinueTutorial == "True" || isEditTutorial == "True") {
                $("#header_screen_name").html("<a href=\""+pathSystem+"/lessons/\">Lessons</a> -> "+name);
            } else {
                $("#header_screen_name").html("<a href=\""+pathSystem+"/select/app/\">My apps</a> -> <a href=\""+pathSystem+"/addscreen/app/"+appId+"/\">"+appName+"</a> -> "+name); 
            }
        }        
        propertyScreens.refreshActions();
    }  


    this.instancesObjectsCreated = function() {                
        that.setCorrectBoardRender();        
    }        
        
    this.setCorrectBoardRender = function() { 
        
        // setObjectOnCanvasByDefinitions
           
        var codeObj = objectFromParamAndValue(application.codes, "screen_id", boardId);
        var name = that.getScreenParamByParam("name", "id", boardId);        
        
        if (codeObj && canvas && name) {
            var result = codeEditor.checkDefinitionsCorrect(codeObj.generated_code);
            codeEditor.manager.boardNameError = name;
            codeEditor.manager.boardExtensionError = codeEditor.boardExtension.definitions;
            codeEditor.manager.numberLineError = result.errorLineNumber;
            canvas.setRenderBoardElements(result.isCorrect);
        }    
    }
    
    this.refreshCanvasBackground = function() {
        for(var i=0; i < that.boardsList.length; i++) {
            if (boardId == that.boardsList[i].screen_id) {
                var backgroundImage = that.boardsList[i].background;   
                if (backgroundImage && backgroundImage != "-") {          
                    canvas.setBackground(28,20,pathSystem+"/media/upload/"+appId+"/img/"+backgroundImage);
                } else {
                    canvas.setBackground(28,20,defaultBackgroundOfCanvas());
                }
                $("#app_screen_background").val(backgroundImage);
            }
        } 
    }
    
    this.refreshCanvasSound = function() {
        for(var i=0; i < that.boardsList.length; i++) {
            if (boardId == that.boardsList[i].screen_id) {
                var sound = that.boardsList[i].sound;   
                $("#app_screen_sounds").val(sound);
            }
        } 
    }
    
    var changeCanvasBackground = function(value, idInput) {                
        $("#"+idInput).val(value);                
        if (value || value == "") {
            boardBackground = value;
            //if (value != "") {                
                for(var i=0; i < that.boardsList.length; i++) {
                    if (boardId == that.boardsList[i].screen_id) {
                        that.boardsList[i].background = value;
                    }
                }                
                //canvas.setBackground(28,20,pathSystem+"/media/upload/"+appId+"/img/"+value);   
            //} else {
                //canvas.setBackground(28,20,defaultBackgroundOfCanvas());
            //}
            that.refreshCanvasBackground();
            
            //resourcesUpload[0].setFocusedElement(boardBackground);
            updateBoard(boardId, boardBackground, boardSound); 
        }
    }
    
    var callbackSelectScreenBackground = function(propertyObj,value) {
        if (propertyObj.id == "app_screen_background") {
            changeCanvasBackground(value, propertyObj.id);
        }
    }    
       
    var changeCanvasSound = function(value, idInput) {
        $("#"+idInput).val(value);
        if (value || value == "") {
            boardSound = value;
            for(var i=0; i < that.boardsList.length; i++) {
                if (boardId == that.boardsList[i].screen_id) {
                    that.boardsList[i].sound = value;
                }
            }                
            
            that.refreshCanvasSound();
            
            //resourcesUpload[1].setFocusedElement(boardSound);
            updateBoard(boardId, boardBackground, boardSound); 
        }
    }   
       
    var callbackSelectSound = function(propertyObj,value) {
        if (propertyObj.id == "app_screen_sounds") {
            changeCanvasSound(value, propertyObj.id );
        }
    }          
     
    this.showScreenInfo = function() {        
		
        var parentParams = $("#select_background")[0];
        if (parentParams) {
            parentParams.innerHTML = "";    
        }        
        var propertyScreenBackground = new Property("app_screen_background", "select", "","");//, '<input type="button" value="+" onclick="openResourcesDialog(RESOURCES_TYPE_IMAGES)" />');        
		propertyScreenBackground.setClassName("app_property");
        propertyScreenBackground.setTemplate(320,0);
        propertyScreenBackground.setOptionOfSelect(arrayWithFirstElement(this.imagesList,""));
        propertyScreenBackground.className = "";
        propertyScreenBackground.styleRight = "width:250px;margin-top:0px;"
        propertyScreenBackground.inputClass = "select_styled2";
        propertyScreenBackground.callbackChangeValue = callbackSelectScreenBackground;
        propertyScreenBackground.showButtonDialog = true;
        propertyScreenBackground.callbackButtonDialog = function(property) { 
            resourcesUpload[0].setFocusedElement(boardBackground); 
            openResourcesDialog(RESOURCES_TYPE_IMAGES);
            resourcesUpload[0].setButtonAndCallback("Set this background", function() { 
                callbackSelectScreenBackground(property, resourcesUpload[0].getFocusedElement().val());
                $( "#dialog_resources" ).dialog( "close" ); 
            });
        };
        
        $("#app_screen_background").attr("disabled", "disabled");
        
        if (parentParams) {
            parentParams.appendChild(propertyScreenBackground.getElement());                    
        }
        propertyScreenBackground.setValue(boardBackground);
        propertyScreenBackground.setOldValue(boardBackground);
        propertyScreenBackground.refreshActions();     
               
        /*
        var parentAudioParams = $("#select_audio")[0];
        if (parentAudioParams) {
            parentAudioParams.innerHTML = "";    
        }        
        var propertyScreenSound = new Property("app_screen_sounds", "select", "","");//, '<input type="button" value="+" onclick="openResourcesDialog(RESOURCES_TYPE_SOUNDS)" />');
		propertyScreenSound.setClassName("app_property");
        propertyScreenSound.setTemplate(280,0);
        propertyScreenSound.setOptionOfSelect(arrayWithFirstElement(this.soundsList,""));
        //propertyScreenSound.setOldValue("");
        propertyScreenSound.className = "";
        propertyScreenSound.styleRight = "width:250px;margin-top:0px;";
        propertyScreenSound.inputClass = "select_styled2";
        propertyScreenSound.callbackChangeValue = callbackSelectSound;
        propertyScreenSound.showButtonDialog = true;
        propertyScreenSound.callbackButtonDialog = function(property) { 
            resourcesUpload[1].setFocusedElement(boardSound); 
            openResourcesDialog(RESOURCES_TYPE_SOUNDS);
            resourcesUpload[1].setButtonAndCallback("Set this sound", function() { 
                callbackSelectSound(property, resourcesUpload[1].getFocusedElement().val());
                $( "#dialog_resources" ).dialog( "close" ); 
            });            
        };        

        if (parentAudioParams) 
        {
            parentAudioParams.appendChild(propertyScreenSound.getElement());
        }        
        propertyScreenSound.setValue(boardSound);
        propertyScreenSound.setOldValue(boardSound);
        propertyScreenSound.refreshActions();   
		*/

    }    
    
    this.codeSeparate2nl = function(code) {
        var newCode = specialCharsToHtml(code);
        return Convert.stringChangeSeparate(newCode, "|||", "\n");
    }
    
    this.codeNl2separate = function(codeWithNl) {        
        var newCode = Convert.stringChangeSeparate(codeWithNl, "\n", "|||");
        return newCode;
    }       
    
    this.getSwipegroupsListByParam = function(param) {
        return arrayFromArrayParam(this.swipegroupsObjectList, param);
    }    
    
    this.getSwipegroupsParamByParam = function(paramReturn, paramSearched, valueSearched) {
        return paramFromParamAndValue(this.swipegroupsObjectList, paramReturn, paramSearched, valueSearched);  
    }
    
    this.getSwipegroupObjectByName = function(name) {
        return objectFromParamAndValue(this.swipegroupsObjectList, "name", name);
    }    

    this.globalIsExistsForName = function(name, typeDeleted) {
        if (name) {
            for(var i=0; i < this.boardsList.length; i++) {
                if (typeDeleted == DELETED_ELEMENT_IMAGE && this.boardsList[i].background == name) {
                    return true;
                }
                if (typeDeleted == DELETED_ELEMENT_SOUND && this.boardsList[i].sound == name) {
                    return true;
                }
            }
        }
        return false;
    }   
    
    this.globalSetCorrectForName = function(name, typeDeleted) {
        if (name) {
            if (typeDeleted == DELETED_ELEMENT_IMAGE && name == boardBackground) {
                changeCanvasBackground("-", "app_screen_background");
            }
            if (typeDeleted == DELETED_ELEMENT_SOUND && name == boardSound) {
                changeCanvasSound("-", "app_screen_sounds");
            }            
            for(var i=0; i < this.boardsList.length; i++) {
                var isChange = false;
                if (typeDeleted == DELETED_ELEMENT_IMAGE && this.boardsList[i].background == name) {
                    this.boardsList[i].background = "-";
                    isChange = true;
                } 
                if (typeDeleted == DELETED_ELEMENT_SOUND && this.boardsList[i].sound == name) {
                    this.boardsList[i].sound = "-";
                    isChange = true;
                }                      
                if (isChange) {
                    updateBoard(this.boardsList[i].id, this.boardsList[i].background, this.boardsList[i].sound, this.boardsList[i].screen_id);
                }
            }
        }
    }   
}

