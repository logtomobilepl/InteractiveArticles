////////////////////
// CALLBACK HANDLE

    function callbackElementNotActive() {        
        if (properties) {
            properties.removeAllChildren();
        }
        actions.showActions(false);
    }
    
    function callbackBackToNormalSize() {
        if (activeElement) {
            var myActive = activeElement.elementSelected;
            setStyleOfElement(activeElement.elementSelected, { width : myActive.dataset.designImageOriginalWidth, height : myActive.dataset.designImageOriginalHeight });
            codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "width", value: myActive.dataset.designImageOriginalWidth}]);
            codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "height", value: myActive.dataset.designImageOriginalHeight}]);
            callbackChangeValueRefresh();
        }    
    }    
    
    
    function removeActiveElement() {
        if (activeElement && activeElement.elementSelected && activeElement.elementSelected.dataset) {
            removeObject(activeElement.elementSelected, activeElement.elementSelected.dataset.designType, {isUserCreated: true})
            actions.showActions(false);
            $( "#tabs" ).tabs({ active: 0 });
        }          
    }   
    
    function callbackPropertyDeleteElement() {       
        if (activeElement) { 
            
            var message1 = ''+globalChange.stringSystemIsAlreadyUsed()+' Are you sure you want to remove?';;
            var message2 = 'Are you sure you want to remove?'
                              
            if (globalChange.isExistsForName(activeElement.elementSelected.dataset.designName, DELETED_ELEMENT_CLICKABLE_AREA)) {
                message = message1
            } else {
                message = message2;
            }        
            messageDialog.showWithTwoButtons("Remove the item from the canvas", message,"Remove","Cancel",removeActiveElement);
        }
    }        
    
    function callbackChangePanelItemsVisible(property, value) {
        /*panelItemsVisible = value;
		changePanelItemsVisible();
        updateBoard(boardId, boardBackground, boardSound);
        */
    }      
	
	/*function changePanelItemsVisible() {
		if (panelItemsVisible) {
			$("#canvas_bottombar").css("display","block");
		} else {
			$("#canvas_bottombar").css("display","none");
		}
	}*/
    
    function callbackSwipegroupsPropertyDeleteSwipegroup() {
        $( "#tabs" ).tabs({ active: 0 }); 
    }      
    
    function setElementPosXOnCanvas(element,pos_x) {
        var pos = pos_x;
        if (canvas) {            
            pos = canvas.marginLeft + parseInt(pos_x);
            
            if (pos + element.offsetWidth > canvas.workspaceWidth) {
                pos = canvas.marginLeft + canvas.workspaceWidth - element.offsetWidth;
            } 
            console.log(canvas.workspaceWidth);
        }
        return pos;
    }

    function callbackUploadSuccessful(loaderName,filename,type) {
        getUploadedFilesByType(type, filename);
    }
    
    /*function tryChangeParamsActiveObject(arrayParamsChange) {
        messageDialog.showWithTwoButtons('<img src="'+pathSystem+'/media/img/icon-warning-32.png" style="vertical-align:top;margin-top:6px;>" /> Canvas', "Zmiana obiektu na canvasie, zmieni również definicje. Kontynuować?","Yes","No", function() {
            for(var i=0; i < arrayParamsChange.length; i++) {
                var paramChange = arrayParamsChange[i];
                if (paramChange.property == "x_pos") {
                    callbackChangeValueXPos(null, paramChange.value);
                }
            }
        }); 
    }*/
    
    // lista wszystkich typow + lista wszystkich wlasciwosci i wartosci
    
    function tryChangeParamsActiveObject(type, property, value) {
        //messageDialog.showWithTwoButtons('<img src="'+pathSystem+'/media/img/icon-warning-32.png" style="vertical-align:top;margin-top:6px;>" /> Canvas', "Zmiana obiektu na canvasie, zmieni również definicje. Kontynuować?","Yes","No", function() {
            
            // petla in po wlasciwosciach
            /*            
            var json = "{}",
                obj = {};
            for(var i=0; i < properts.length; i++) {
                obj = properts[i];
                json = "{\""+type+"\": \""+value+"\"}";
             }
                
             */
            
            var json = "{\""+type+"\": \""+value+"\"}"; 
            var obj = JSON.parse(json);
            setStyleOfElement(activeElement.elementSelected, obj);
            // petla end
            
            callbackChangeValueRefresh();
        /*},function(){
            property.backToOldValue();
            //setStyleOfElement(activeElement.elementSelected, obj);
            //alert("new:"+value+" old:"+property.oldValue);
        });*/
    }

    function callbackChangeValueXPos(property, value) {   
        tryChangeParamsActiveObject("x_pos", property, value);
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "x", value: value}]);                    
        //var obj = { type: "x_pos", property: property, value: value };
        //tryChangeParamsActiveObject([{ type: "x_pos", property: property, value: value }]);
    }
    function callbackChangeValueYPos(property, value) {
        tryChangeParamsActiveObject("y_pos", property, value);
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "y", value: value}]);                    
    }
    function callbackChangeValueWidth(property, value) {
        tryChangeParamsActiveObject("width", property, value);
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "width", value: value}]);                    
    }
    function callbackChangeValueHeight(property, value) {
        tryChangeParamsActiveObject("height", property, value);
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "height", value: value}]);                    
    }
    function callbackChangeValueFontSize(property, value) {
        setStyleOfElement(activeElement.elementSelected, { font_size : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "fontSize", value: value}]);                            
        callbackChangeValueRefresh();
    }
    function callbackChangeValueFontType(property, value) {
        setStyleOfElement(activeElement.elementSelected, { font_type : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "fontType", value: value}]);                            
        callbackChangeValueRefresh();
    }
    function callbackChangeValueTextColor(property, value) {
        try {
            var myRgb = (new Color).hexToMyRgb(text_color_hex);
            setStyleOfElement(activeElement.elementSelected, { text_color : myRgb });
            codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "textColor", value: myRgb}]);                                    
            callbackChangeValueRefresh();
        } catch(e) {}
    }
    function callbackChangeValueTitleColor(property, value) {
        try {
            var myRgb = (new Color).hexToMyRgb(text_color_hex);
            setStyleOfElement(activeElement.elementSelected, { title_color : myRgb });
            codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "titleColor", value: myRgb}]);                            
            callbackChangeValueRefresh();
        } catch(e) {}
    }
    function callbackChangeValueText(property, value) {
        setStyleOfElement(activeElement.elementSelected, { text : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "text", value: value}]);                            
        // event
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CHANGE_ELEMENT_TEXT, {text: value}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}

        callbackChangeValueRefresh();
    }
    function callbackChangeValueTitleLabel(property, value) {
        setStyleOfElement(activeElement.elementSelected, { title_label : value });
        canvas.navigationBar.setTitle(activeElement.elementSelected, value);
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "titleLabel", value: "\""+value+"\""}]);                            
        callbackChangeValueRefresh();
    }
    function callbackChangeValueHtmlContent(property, value) {
        setStyleOfElement(activeElement.elementSelected, { html_content : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "html", value: value}]);                            
        callbackChangeValueRefresh();
    }
    function callbackChangeValueFileName(property, value) {
        setStyleOfElement(activeElement.elementSelected, { area_image : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "image", value: value}]);                            
        callbackChangeValueRefresh();
    }
    function callbackChangeValueBackgroundImage(property, value) {
        setStyleOfElement(activeElement.elementSelected, { background_image : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "background", value: value}]);                            
        callbackChangeValueRefresh();
    }
    function callbackChangeValueAreaImage(property, value) {
        setStyleOfElement(activeElement.elementSelected, { area_image : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "image", value: value}]);                            
        callbackChangeValueRefresh();
    }    
    function callbackChangeValueName(property, value) {
        var oldName = activeElement.elementSelected.dataset.designName;
        activeElement.prevName = activeElement.elementSelected.dataset.designName;   
        setStyleOfElement(activeElement.elementSelected, { name : value });
        var newName = activeElement.elementSelected.dataset.designName;
        codeEditor.generateByChangeParam([{name:oldName,  parameter: "name", value: newName}]);
        //console.log("prev name:"+activeElement.prevName);     
        //console.log("new name:"+activeElement.elementSelected.dataset.designName);     
        callbackChangeValueRefresh();
    }
    function callbackChangeValueVisible(property, value) {
        setStyleOfElement(activeElement.elementSelected, { visible : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "visible", value: value}]);
        callbackChangeValueRefresh();
    }
    
    function callbackChangeValueProportionalImage(property, value) {        
        setStyleOfElement(activeElement.elementSelected, { proportional_image : value });
        callbackChangeValueRefresh();
    }    
    function callbackChangeValueDraggable(property, value) {
        setStyleOfElement(activeElement.elementSelected, { draggable : value });
        callbackChangeValueRefresh();
    }
    function callbackChangeValueZoom(property, value) {
        setStyleOfElement(activeElement.elementSelected, { zoom : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "zoom", value: value}]);                            
        callbackChangeValueRefresh();
    }    
    function callbackChangeValueLatitude(property, value) {
        setStyleOfElement(activeElement.elementSelected, { latitude : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "latitude", value: value}]);                            
        callbackChangeValueRefresh();
    }        
    function callbackChangeValueLongitude(property, value) {
        setStyleOfElement(activeElement.elementSelected, { longitude : value });
        codeEditor.generateByChangeParam([{name:activeElement.elementSelected.dataset.designName,  parameter: "longitude", value: value}]);                            
        callbackChangeValueRefresh();
    }        
    function callbackChangeValueTypeScreen(property, value) {
        editorScreen.screenType = value;
        callbackChangeValueRefresh();                        
    }
    function callbackChangeValueSwipegroupName(property, value) {
        activeElement.elementSelected.dataset.designSwipegroupName = value;
        callbackChangeValueRefresh();                
    }    
    // swipegroups group callbacks 
    function callbackSwipegroupsChangeValueSwipegroupName(property, value) {
        swipegroups.activeElem = application.getSwipegroupObjectByName(value);
        swipegroups.activeElem.name = value;
        callbackSwipegroupChangeValueRefresh();        
    }
    function callbackSwipegroupsChangeValuePageControlVisible(property, value) {
        swipegroups.activeElem.page_control_visible = value;
        callbackSwipegroupChangeValueRefresh();
    }
    function callbackSwipegroupsChangeValueNavigationBarVisible(property, value) {
        swipegroups.activeElem.navigation_bar_visible = value;
        callbackSwipegroupChangeValueRefresh();
    }
    function callbackSwipegroupsChangeValuePagerTabVisible(property, value) {
        swipegroups.activeElem.pager_tab_visible = value;
        callbackSwipegroupChangeValueRefresh();
    }
    function callbackSwipegroupsChangeValuePagerTabTitle(property, value) {
        swipegroups.activeElem.pager_tab_title = value;
        callbackSwipegroupChangeValueRefresh();
    }        

    function callbackChangeValueRefresh() {
        if (activeElement && activeElement.elementSelected) {        
            activeElement.refresh();
            activeElement.elementSelected.dataset.designEditActions = 0;
            activeElement.updateElementInBase();
        }
    }        
    
    function callbackSwipegroupChangeValueRefresh() {
        if (swipegroups && swipegroups.activeElem) {                    
            selectSwipegroup(swipegroups.activeElem, true);
            //swipegroups.updateElementInBase();
        }
    }    
    
    function callbackChangeActions(myActions, json) {   
        if (activeElement && activeElement.elementSelected) { // !myActions.globalAreAnyParametersEmpty()            
            activeElement.elementSelected.dataset.designActions = json;
            codeEditor.generateByChangeActions([{name: activeElement.elementSelected.dataset.designName}]);
            console.log("Change action: "+json);  
            activeElement.updateElementInBase();
        }
    }
    
