
    var AJAX_ASYNC = true;
    pathSystem = "/articlesdesigner";
    

    var defaultAjax = { // default ajax to copy
        type: 'POST',
        url: pathSystem+"/post/",
        dataType: "text",
        async: true        
    };
    
    function ajaxBase(options) {
        var dataAjax = {};
        $.extend( true, dataAjax, defaultAjax );        
        $.extend( true, dataAjax, options );        
        $.ajax(dataAjax);
    }    
    
    function addObject(element, type, mKeyVals) {
        switch(type) {
            case ELEMENT_TYPE_TEXT: mKeyVals.action = "add_text_object"; break;
            case ELEMENT_TYPE_BUTTON: mKeyVals.action = "add_button_object"; break;
            case ELEMENT_TYPE_IMAGE: mKeyVals.action = "add_image_object"; break;
            case ELEMENT_TYPE_HTML: mKeyVals.action = "add_html_object"; break;
            case ELEMENT_TYPE_MAP: mKeyVals.action = "add_map_object"; break;
            case ELEMENT_TYPE_CLICKABLE_AREA: mKeyVals.action = "add_clickable_area_object"; break;
            default: break;
        }
        console.log("add "+type+": ");
        console.log(mKeyVals);
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: mKeyVals,
            dataType: "text",
            async: AJAX_ASYNC,
            success: function(resultData) {
                element.dataset.designId = resultData;
                                
                //if (canvas.canCreateElementName(element.dataset.designName) == false) {
                //    element.dataset.designName = canvas.getFirstAvailableNameForType(type);
                //} 
                              
                switch(type) {
                    case ELEMENT_TYPE_TEXT:
                        //setStyleOfElement(element, {text:specialCharsToHtml("Optional default text here")}); 
                        break;
                    case ELEMENT_TYPE_BUTTON:
                        //setStyleOfElement(element, {title_label:specialCharsToHtml(element.dataset.designName)});
                        break;
                    case ELEMENT_TYPE_IMAGE: 
                        break;
                    case ELEMENT_TYPE_HTML:
                        //setStyleOfElement(element, {html_content:specialCharsToHtml(element.dataset.designName)}); 
                        break;
                    case ELEMENT_TYPE_MAP: 
                        break;                        
                    case ELEMENT_TYPE_CLICKABLE_AREA: 
                        break;                        
                    default: break;
                }
                canvas.showElementsList();
                element.dataset.designEditActions = 1;
                selectElement(element, true, true);
                activeElement.updateElementInBase(mKeyVals);

                if (mKeyVals.callbacks && mKeyVals.callbacks.addedToBase && typeof mKeyVals.callbacks.addedToBase === "function") {
                    mKeyVals.callbacks.addedToBase(element);
                }
            },
            error: function() {
                
            },
        });                
    }
    
    function updateObject(element, type, mKeyVals) {  
        if (mKeyVals != undefined) {   
            mKeyVals = {};   
        }
        switch(type) {
            case ELEMENT_TYPE_TEXT:  
                mKeyVals = optionsTextObject(element); 
                mKeyVals.action = "update_text_object"; 
                break;
            case ELEMENT_TYPE_BUTTON: 
                mKeyVals = optionsButtonObject(element); 
                mKeyVals.action = "edit_button_object"; 
                break;
            case ELEMENT_TYPE_IMAGE: 
                mKeyVals = optionsImageObject(element); 
                mKeyVals.action = "edit_image_object"; 
                break;
            case ELEMENT_TYPE_HTML: 
                mKeyVals = optionsHtmlObject(element); 
                mKeyVals.action = "edit_html_object"; 
                break;
            case ELEMENT_TYPE_MAP: 
                mKeyVals = optionsMapObject(element); 
                mKeyVals.action = "edit_map_object"; 
                break;
            case ELEMENT_TYPE_CLICKABLE_AREA: 
                mKeyVals = optionsClickableAreaObject(element); 
                mKeyVals.action = "edit_clickable_area_object"; 
                break;
            case ELEMENT_TYPE_NAVIGATOR_BAR_BUTTON: 
                mKeyVals = optionsNavigatorBarButtonObject(element); 
                mKeyVals.action = "edit_navigator_bar_button_object"; 
                break;
            default: break;
        }
        console.log("Updating "+type+":");
        console.log(mKeyVals);
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: mKeyVals,
            dataType: "text",
            async: AJAX_ASYNC,
            success: function(resultData) {
                //var expires = new Date();
                //expires.setMonth(expires.getMonth() + 6);
                //setCookie("change","item "+activeElement.elementSelected.dataset.designId,expires);
                if (activeElement && activeElement.elementSelected) {
                    globalChange.setCorrectForName(activeElement.prevName, EDIT_ELEMENT_CLICKABLE_AREA, activeElement.elementSelected.dataset.designName);
                    selectElement(activeElement.elementSelected); // refresh
                }
				if (codeEditor) {
					codeEditor.generateMainCode();
				}
                          
                if (mKeyVals.callbacks && mKeyVals.callbacks.updateInBase && typeof mKeyVals.callbacks.updateInBase === "function") {
                    mKeyVals.callbacks.updateInBase(element);
                }
            }
        });
    }
    
    /* options:
         options.isUserCreated  - if true - user remove item on canvas,  if false - source of remove item is other (np. editor) 
     */    
    function removeObject(element, type, options) {
        var mKeyVals;
        var id = element.dataset.designId;
        switch(type) {
            case ELEMENT_TYPE_TEXT: mKeyVals = {action:"remove_text_object", t_id:id}; break;
            case ELEMENT_TYPE_BUTTON: mKeyVals = {action:"remove_button_object", b_id:id}; break;
            case ELEMENT_TYPE_IMAGE: mKeyVals = {action:"remove_image_object", image_id:id}; break;
            case ELEMENT_TYPE_HTML: mKeyVals = {action:"remove_html_object", html_id:id}; break;
            case ELEMENT_TYPE_MAP: mKeyVals = {action:"remove_map_object", map_id:id}; break;
            case ELEMENT_TYPE_CLICKABLE_AREA: mKeyVals = {action:"remove_clickable_area_object", clickable_area_id:id}; break;
            default: break;
        }
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: mKeyVals,
            dataType: "text",
            async: AJAX_ASYNC,
            success: function(resultData){                
                if (activeElement.elementSelected == element) {
                    activeElement.setNotActive();
                }
                globalChange.setCorrectForName(element.dataset.designName, DELETED_ELEMENT_CLICKABLE_AREA);
                if (options && options.isUserCreated) {
                    codeEditor.generateByRemoveObject([{name:element.dataset.designName}]);
                }
                canvas.removeElement(element); // element is now: undefined                                                    
                console.log("Remove "+type+" id="+id);     
            }
        });        
    }
    
    function removeFile(type, filename) {
        if(!filename) {
            return;
        }
        $.ajax({
            type: 'POST',
            url: pathSystem+"/removefile/",
            data: mKeyVals = { app_id: appId, type: type, filename: filename },
            dataType: "text",
            success: function(resultData){                
                if (resultData) {
					if (type == RESOURCES_TYPE_IMAGES) {
					    globalChange.setCorrectForName(filename, DELETED_ELEMENT_IMAGE)
                    } else if (type == RESOURCES_TYPE_SOUNDS) {
                        globalChange.setCorrectForName(filename, DELETED_ELEMENT_SOUND)
                    }          
                    getUploadedFilesByType(type);
                }
            }                                
        });      
    }
    
    function getUploadedFilesByType(type, filename) {
        $.ajax({
            type: 'POST',
            url: pathSystem+"/getfiles/",
            data: mKeyVals = { app_id: appId, type: type },
            dataType: "text",
            success: function(resultData){                
                if (resultData) {
                    var dataObj = JSON.parse(resultData);
                    
                    if (type == RESOURCES_TYPE_IMAGES) {
                        var listFileName = dataObj.images; 
                        listFileName = listStringArrayWithExtension(listFileName, ["jpg","jpeg","png","gif"]);
                        if (listFileName) {
                            application.imagesList = listFileName;
                            application.showScreenInfo();
                        }                     
                        if (properties) {
                            properties.listOfImages = listFileName;
                        }                    
                        // refresh list images files
                        if (resourcesUpload[0]) {
                            resourcesUpload[0].setListFilename(listFileName);
                            resourcesUpload[0].setFocusForFilename(filename);                            
                        }                                                
                        // selectElement(activeElement.elementSelected);
                    }
                    if (type == RESOURCES_TYPE_SOUNDS) {
                        var listFileName = dataObj.sounds;  
                        listFileName = listStringArrayWithExtension(listFileName, ["mp3","wma","wav","ogg"]);    
						if (listFileName) {
							application.soundsList = listFileName;                        
							application.showScreenInfo();
						}
                        // refresh list sound files
                        if (resourcesUpload[1]) {
                            resourcesUpload[1].setListFilename(listFileName);
                            resourcesUpload[1].setFocusForFilename(filename);
                        }                                                
                        //selectElement(activeElement.elementSelected);
                    }                    
                }
            }                                
        });      
    }
    
    // return JSON
    // example: {"screens": [{"mainmenuboard": 1457}, {"gameboard": 1458}]}
    // key is board name
    // value is id of board
    function getScreenList(options) {
        var data = $.extend(true, { url: pathSystem+"/screenlist/"} ,options);
        ajaxBase(data);
    } 

    function exportToZip() {
        $.ajax({
            //type: 'POST',
            url: pathSystem+"/export/"+appId+"/",
            data: {},
            dataType: "text",            
            success: function(resultData){
                $("#dialog_export p").html("Export success. <p><a href='../../media/zip/"+userId+"/"+appName+".zip'>Download zip to your computer</a></p>");
                $("#dialog_export").dialog("open");
            },
            error: function() {
                $("#dialog_export p").html("Export failed.");
                $( "#dialog_export" ).dialog("open");
            }                     
                       
        });      
    }
    
    
    function copyApp(app_id, user_id, name, release, shared_author, callbacksObject) {
        var result = {success: false, id: 0};
        var async = true;
        if (callbacksObject && callbacksObject.async != undefined) {
            async = callbacksObject.async;
        }         
        
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: {action: "copy_project", app_id: app_id, user_id: userId, name: name, release: release, shared_author: shared_author },
            dataType: "text",
            async: async,
            success: function(resultData) {
                result.success = true;
                result.id = resultData;
                if (callbacksObject && callbacksObject.success && typeof callbacksObject.success === "function") {
                    callbacksObject.success(result);
                }                
            },
            error: function() {
                if (callbacksObject && callbacksObject.error && typeof callbacksObject.error === "function") {
                    callbacksObject.error(result);
                }
            }                                  
        });
    }    
    
    function removeApp(id, callbackSuccess, callbackFailed) {
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: {action: "remove_app", id: id},
            dataType: "text",
            success: function(resultData){
                if (typeof callbackSuccess === "function") {
                    callbackSuccess(id, resultData);
                }
            },
            error: function() {
                if (typeof callbackFailed === "function") {
                    callbackFailed(id);
                }
            }                                
        });      
    }          
    
    function removeScreen(id, callbackSuccess, callbackFailed) {
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: {action: "remove_board_object", id: id},
            dataType: "text",
            async: false,
            success: function(resultData){
                if (typeof callbackSuccess === "function") {
                    callbackSuccess(id, resultData);
                }
            },
            error: function() {
                if (typeof callbackFailed === "function") {
                    callbackFailed(id);
                }
            }                                  
        });      
    }     
    
    function getListPublishEmail(options) {
        var result = {success: false, json: ""};
        var async = true;
        if (options && options.async != undefined) {
            async = options.async;
        }         
        
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: {
                action: "get_list_publish_email", 
                email: options.email, 
            },
            dataType: "text",
            async: async,
            success: function(resultData) {
                result.success = true;
                result.json = resultData;
                if (options && options.success && typeof options.success === "function") {
                    options.success(result);
                }                
            },
            error: function() {
                if (options && options.error && typeof options.error === "function") {
                    options.error(result);
                }
            }                                  
        });
    }
    
    
    // @params options.app_id  
    // @return json (single app object from base)    
    function get_app(options) {
        var data = $.extend(true, { data: { action:"get_app" }} ,options);
        ajaxBase(data);                
    }
    
    // @params options.release -  
    // @return json (array of table application)
    function getAppListByRelease(options) {
        var data = $.extend(true, {data:{action:"get_app_list_by_release"}} ,options);
        ajaxBase(data);
    }
    

    // @return json (array of table application)
    function getLessonIdList(options) {
        var data = $.extend(true, {data:{action:"get_lessons"}} ,options);
        ajaxBase(data);
    }
    
    // @return json (dictionary of settings)
    function ajaxGetSettings(options) {
        var data = $.extend(true, {data:{action:"get_settings"}} ,options);
        ajaxBase(data);
    }
        
    
    var AjaxTutorial = {
        urlPOST: pathSystem+"/tutorial/post/",
        // @params options.data.lesson_id
        // @params options.data.from_order
        // @return json (array of table application)
        ajaxGetBubbles: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"get_bubbles"}} ,options);
            ajaxBase(data);                  
        },
        // @params options.data.lesson_id
        // @params options.data.user_id
        // @return json (array of table application)
        ajaxGetBubblesUser: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"get_bubbles_user"}} ,options);
            ajaxBase(data);                  
        },
        // @params options.data.lesson_id
        // @params options.data.from_order
        // @return OK (if everyting is ok)
        ajaxCompleteBubble: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"complete_bubble"}} ,options);
            ajaxBase(data);
        },   
        // @params options.data.lesson_id
        // @params options.data.user_id
        // @return  zwraca "1" lub "x/x" (progress danej lekcji, jeśli "1" - > ukończona, w przeciwnym wypadku progress w bubble np 5/10)              
        ajaxGetLessonProgress: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"get_lesson_progress"}} ,options);
            ajaxBase(data);            
        },
        // @params options.data.lesson_id
        // @params options.data.user_id
        // @return  zwracam "1" jeśli uzytkownik w ogóle zaczął lekcję i ukonczyl chociaz 1 bubble i "0" w przeciwnym wypadku.
        ajaxIsLessonStarted: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"is_lesson_started"}} ,options);
            ajaxBase(data);            
        },
        // @params options.data.lesson_id: INT
        // @params options.data.file: BLOB       <  
        // @params options.data.filename: STRING
        // @return  OK from server
        /*ajaxUploadFile: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"upload_file"}} ,options);
            ajaxBase(data);                        
        },*/
        // @params options.data.lesson_id: INT
        // @params options.data.filename: STRING
        // @return  OK from server
        ajaxRemoveFile: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"remove_file"}} ,options);
            ajaxBase(data);                        
        },
        // @params options.data.lesson_id: INT
        // @return  Count of bubble for lesson_id
        ajaxCountBubbles: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"count_bubbles"}} ,options);
            ajaxBase(data);                        
        },
        // @params options.data.lesson_id: INT
        // @return  Count of bubble for lesson_id
        ajaxFinishedEditingStarting: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"finished_editing_starting"}} ,options);
            ajaxBase(data);                        
        },
        // @params options.data.lesson_id: INT
        // @return JSON
        ajaxGetConceptions: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"get_conceptions"}} ,options);
            ajaxBase(data);   
        },
        // @params options.data.lesson_id: INT
        // @params options.data.user_id: INT
        // @return JSON
        ajaxGetConceptionsRequirements: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"check_lesson_requirements"}} ,options);
            ajaxBase(data);   
        },        
        // @params options.data.app_id: INT
        // @params options.data.filename: STRING
        // @params options.data.text: STRING
        // @return  OK
        ajaxEditFile: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"edit_file"}} ,options);
            ajaxBase(data);   
        },
        // @params options.data.app_id: INT
        // @params options.data.filename: STRING
        // @return  text
        ajaxGetFile: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"get_file"}} ,options);
            ajaxBase(data);   
        },
        // @params options.data.days: INT
        // @params options.data.user_id: INT
        // @return  text
        ajaxGetProgress: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"get_progress"}} ,options);
            ajaxBase(data);
        },
        // @params options.data.user_id: INT
        // @return  {True|False}
        ajaxShowSubEnded: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"show_sub_ended"}} ,options);
            ajaxBase(data);
        },
        // @params options.data.lesson_id: INT
        // @return  {True|False}
        ajaxGetIdNextLesson: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"getIdNextLesson"}} ,options);
            ajaxBase(data);
        },
        // @params options.data.user_id: INT
        // @params options.data.quiz_id: INT
        // @params options.data.percent: (INT)
        // @return OK
        ajaxQuizSetPercent: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"set_percent_quiz"}} ,options);
            ajaxBase(data);
        },
        // @params options.data.user_id: INT
        // @params options.data.quiz_id: INT
        // @return percent ()
        ajaxQuizGetPercent: function(options) {
            var data = $.extend(true, { url: this.urlPOST, data:{action:"get_precent_quiz"}} ,options);
            ajaxBase(data);
        }          
    }
 
   function updateBoard(id, filenameBackground, filenameSound, screen_id) {
        if (!screen_id) {
            screen_id = currentScreenId;
        }
        console.log("Updating board");
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: { action: "edit_board_object", id: id, screen_id : screen_id, background: filenameBackground, sound: filenameSound, panel_items: panelItemsVisible  },
            dataType: "text",
            success: function(resultData) {
                
            }
        });        
    }   
    
   function updateCodes(screen_id, user_code, generated_code, start_code) {
        if (!screen_id) {
            screen_id = currentScreenId;
        }
        if (!generated_code) {
            generated_code = ";";
        }
        if (!user_code) {
            user_code = " ";
        }
        //console.log("Updating codes");
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: { action: "edit_board_code", screen_id: screen_id, user_code: user_code, generated_code: generated_code, start: start_code },
            dataType: "text",
            success: function(resultData) {
                
            }
        });        
    }    
    
    function updateMainCode(mainCode) {
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: { action: "edit_app", app_id: appId, main_code: mainCode },
            dataType: "text",
            success: function(resultData) {
                
            }
        }); 
    }      
    
    
    function addPublish(app_id, name, date, version, callbacksObject) {
        var result = {success: false, id: 0};
        var async = true;
        if (callbacksObject && callbacksObject.async != undefined) {
            async = callbacksObject.async;
        }        
        
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: { action: "add_publish", app_id: app_id, name: name, date: date, version: version  },
            dataType: "text",
            async: async,
            success: function(resultData) {
                result.success = true;
                result.id = resultData;
                if (callbacksObject && callbacksObject.success && typeof callbacksObject.success === "function") {
                    callbacksObject.success(result);
                }
            }, 
            error: function() {
                if (callbacksObject && callbacksObject.error && typeof callbacksObject.error === "function") {
                    callbacksObject.error(result);
                }
            }
        });  
    }
    
    function removePublish(id) {
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: { action: "remove_publish", id: id  },
            dataType: "text",
            success: function(resultData) {
            }
        });    
    }    
    
    function addPublishEmail(publish_id, email, sharedCode, callbacksObject) {
        var result = {success: false, id: 0};
        var async = true;
        if (callbacksObject && callbacksObject.async != undefined) {
            async = callbacksObject.async;
        }
        
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: { action: "add_publish_email", publish_id: publish_id, email: email, sharedCode: sharedCode },
            dataType: "text",
            async: async,
            success: function(resultData) {
                result.success = true;
                result.id = resultData;
                if (callbacksObject && callbacksObject.success && typeof callbacksObject.success === "function") {
                    callbacksObject.success(result);
                }                
            },
            error: function() {
                if (callbacksObject && callbacksObject.error && typeof callbacksObject.error === "function") {
                    callbacksObject.error(result);
                }
            }            
        });  
    }    
    
    function removePublishEmail(id) {
        $.ajax({
            type: 'POST',
            url: pathSystem+"/post/",
            data: { action: "remove_publish_email", id: id  },
            dataType: "text",
            success: function(resultData) {
            }
        });    
    }    
        
    
    
/*dodanie publikacji
 action: "add_publish",
 podaje: app_id, name, date, version
dostaje ID publikacji 

 edycja publikacji
 action: "edit_publish",
 podaje: id,app_id, name, date, version

 usuwanie publikacji (moga sie tez usuwac powiazane tabele z "codes_publish")
 action: "remove_publish",
 podaje: id
=====================
 dodanie kodu
 action: "add_code_publish",
 podaje: publish_id , type , code
dostaje ID kodu publikacji 

 edycja kodu publikacji
 action: "edit_code_publish",
 podaje: id,publish_id , type , code

 usuwanie kodu publikacji
 action: "remove_code_publish",
 podaje: id    
    */
       
           
    function optionsTextObject(element) { 
        var options = {
            t_id : element.dataset.designId,
            text : element.dataset.designText,
            font_size : element.dataset.designFontSize,
            font_type : element.dataset.designFontType,
            text_color : element.dataset.designTextColor,
            screen_id : currentScreenId,
            s_id : currentScreenId,
            x : element.dataset.designXPos, //canvas.convertPosXFromCanvasToIPad(element.dataset.designXPos),
            y : element.dataset.designYPos, //canvas.convertPosYFromCanvasToIPad(element.dataset.designYPos),
            width : element.offsetWidth, //canvas.convertPosXFromCanvasToIPad(*1.2), 
            height : element.offsetHeight, //canvas.convertPosYFromCanvasToIPad(element.offsetHeight),
            visible : element.dataset.designVisible,
            name : element.dataset.designName,
            onclick: element.dataset.designActions            
        }
        return options;
    }     
    
    function optionsButtonObject(element) {
        var optionsButtonObject = {
            b_id : element.dataset.designId,
            title_label : element.dataset.designText,
            font_size : element.dataset.designFontSize,
            font_type : element.dataset.designFontType,
            title_color : element.dataset.designTextColor,
            background_image : (element.dataset.designBackgroundImage)?element.dataset.designBackgroundImage:"", 
            screen_id : currentScreenId,
            x : canvas.convertPosXFromCanvasToIPad(element.dataset.designXPos), 
            y : canvas.convertPosYFromCanvasToIPad(element.dataset.designYPos), 
            width : canvas.convertPosXFromCanvasToIPad(element.dataset.designWidth), 
            height : canvas.convertPosYFromCanvasToIPad(element.dataset.designHeight), 
            visible : element.dataset.designVisible,
            name : element.dataset.designName,            
            onclick: element.dataset.designActions
        }
        return optionsButtonObject;
    }       
     
    function optionsImageObject(element) {
        var optionsImageObject = {
            image_id : element.dataset.designId,
            file_name : element.dataset.designAreaImage,
            draggable : 1,
            x : canvas.convertPosXFromCanvasToIPad(element.dataset.designXPos), 
            y : canvas.convertPosYFromCanvasToIPad(element.dataset.designYPos), 
            screen_id : currentScreenId,
            visible : element.dataset.designVisible,
            name : element.dataset.designName,
            onclick: element.dataset.designActions
        }
        return optionsImageObject;
    }            
     
    function optionsHtmlObject(element) {
        var optionsHtmlObject = {
            html_id : element.dataset.designId,
            html_content : element.dataset.designHtmlContent,
            x : canvas.convertPosXFromCanvasToIPad(element.dataset.designXPos), 
            y : canvas.convertPosYFromCanvasToIPad(element.dataset.designYPos),
            width : canvas.convertPosXFromCanvasToIPad(element.offsetWidth), 
            height : canvas.convertPosYFromCanvasToIPad(element.offsetHeight),             
            screen_id : currentScreenId,
            visible : element.dataset.designVisible,
            name : element.dataset.designName,
            onclick: element.dataset.designActions
        }
        return optionsHtmlObject;
    }     
    
    function optionsMapObject(element) {
        var optionsMapObject = {
            map_id : element.dataset.designId,
            x : element.dataset.designXPos, //canvas.convertPosXFromCanvasToIPad(element.dataset.designXPos), 
            y : element.dataset.designYPos, //canvas.convertPosYFromCanvasToIPad(element.dataset.designYPos),
            width : element.dataset.designWidth, //canvas.convertPosXFromCanvasToIPad(element.dataset.designWidth), 
            height : element.dataset.designHeight, //canvas.convertPosYFromCanvasToIPad(element.dataset.designHeight),             
            lat : element.dataset.designLatitude,
            lng : element.dataset.designLongitude,
            zoom : element.dataset.designZoom,             
            screen_id : currentScreenId,
            visible : element.dataset.designVisible,
            name : element.dataset.designName,
            markers : "NULL", //element.dataset.designMarkers,
            animation  : "NULL", //element.dataset.designAnimation,              
            onclick: element.dataset.designActions
        }
        return optionsMapObject;
    }         
                  
    function optionsClickableAreaObject(element) {
		//console.log(element.dataset);
        var optionsClickableAreaObject = {
            clickable_area_id : element.dataset.designId,
            file_name : element.dataset.designAreaImage,
            x : element.dataset.designXPos, //canvas.convertPosXFromCanvasToIPad(element.dataset.designXPos), 
            y : element.dataset.designYPos, //canvas.convertPosYFromCanvasToIPad(element.dataset.designYPos), 
            width : element.dataset.designWidth, //canvas.convertPosXFromCanvasToIPad(element.dataset.designWidth), 
            height : element.dataset.designHeight, //canvas.convertPosYFromCanvasToIPad(element.dataset.designHeight), 
            screen_id : element.dataset.designScreenId,
            visible : element.dataset.designVisible,
            name : element.dataset.designName,
            onclick: element.dataset.designActions
        }
        return optionsClickableAreaObject;
    }      
     
