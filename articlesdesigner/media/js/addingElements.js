
    var CanvasElements = {
        CLICKABLE_AREA: "clickable_area",
        TEXTFIELD: "text",
        TEXTEDIT: "textedit",
        BUTTON: "button"
    },
    revert = false,
    offsetCanvas = [0,0];
    
    /*$( window ).resize(function() {
      offsetCanvas[0] = $( window ).width()-1220;
      offsetCanvas[1] = $( window ).height();
      console.log(offsetCanvas);
    });*/

   // $("#canvas_overlay").bind('mousemove',function(e){ 
   //     $("#log").text("e.pageX: " + e.pageX + ", e.pageY: " + e.pageY); 
   // }); 

    var optionalElementText = "textfield",
        optionalElementNr = 1;

	function recognizeElementType(type){
		switch(type){
                /*case "text":
                    return "d";
                break;
                case "textedit":
                    return "textarea";
                break;*/
                case "image":
                    return "img";
                break;
                case "button":
                    return "div";
                break;
				default:
					return "div";
					break;
		}
	}
	
	/*
     elementInfo.loaded  -  if true - item loaded from database, false - item not loaded from database
     elementInfo.new_element  -  if true - item is first created
     elementInfo.isUserCreated  - if true - user drop item on canvas,  if false - source of created item is other (np. editor)
     elementInfo.callbacks.addedToBase  - 
     elementInfo.callbacks.updateInBase  - 
	*/
	function addElementToCanvas(elementInfo) {

	    console.log(elementInfo);
	    
	    if (elementInfo.loaded == undefined) {
	        messageDialog.show("Canvas","Add element to canvas '"+elementInfo.type+"'. error: attribute 'loaded' not created in function addElementToCanvas. Element doesnt put on canvas. ");
	        return;
	    }	    
	    
        var elementClass = recognizeElementType(elementInfo.type);
        var elementToAdd = document.createElement(elementClass); 
        
        if (elementInfo.type == ELEMENT_TYPE_TEXTEDIT || elementInfo.type == ELEMENT_TYPE_TEXT || 
            elementInfo.type == ELEMENT_TYPE_BUTTON) {
            elementToAdd.style.padding = "8px";
            var textArea = document.createElement("textarea");
            textArea.style.width = "98%";
            textArea.style.height = "96%";          
            elementToAdd.appendChild(textArea);
        }
        
        elementToAdd.style.display = "block";
        elementToAdd.style.position = "absolute";
        
        if (elementInfo.loaded) {
            elementInfo.x_pos = canvas.convertPosXFromIPadToCanvas(elementInfo.x_pos);
            elementInfo.y_pos = canvas.convertPosYFromIPadToCanvas(elementInfo.y_pos);            
            elementInfo.width = canvas.convertPosXFromIPadToCanvas(elementInfo.width);
            elementInfo.height = canvas.convertPosYFromIPadToCanvas(elementInfo.height);            
        } 
        
        if (elementInfo.set_default == undefined) {
            elementInfo.set_default = true;
        }
        
        // common for all
        elementToAdd.dataset.designType = elementInfo.type;
        elementToAdd.dataset.designId = elementInfo.id;
        elementToAdd.dataset.designOutline = 1;
        elementToAdd.dataset.designActions = specialCharsToHtml(elementInfo.actions);        
        elementToAdd.dataset.designIsActions = 1;        
        
        if (elementInfo.loaded && elementInfo.screen_id != boardId) {
            elementToAdd.dataset.designScreenId = elementInfo.screen_id;
            elementInfo.is_element_from_other_board = true;
        } else {
            elementToAdd.dataset.designScreenId = currentScreenId;
        }
        
        // add element to canvas     
        canvas.addElement(elementToAdd);        
        
        // default settings
        setDefaultSettingsForElement(elementToAdd, elementInfo.loaded, elementInfo.set_default);        
        
        setStyleOfElement(elementToAdd, {
                            loaded : elementInfo.loaded,
                            new_element : elementInfo.new_element, 
                            is_element_from_other_board: elementInfo.is_element_from_other_board,
                            type: elementInfo.type,
                            x_pos : elementInfo.x_pos,
                            y_pos : elementInfo.y_pos,
                            width : elementInfo.width,
                            height : elementInfo.height,
                            font_size : elementInfo.font_size,
                            font_type : elementInfo.font_type,
                            text_color : elementInfo.text_color,
                            title_label : elementInfo.title_label,
                            title_color : elementInfo.title_color,
                            background_image : elementInfo.background_image,
                            file_name : elementInfo.file_name,
                            area_image : elementInfo.area_image,
                            draggable : elementInfo.draggable,
                            html_content : elementInfo.html_content,
                            text : elementInfo.text,
                            name : elementInfo.name,
                            visible : elementInfo.visible,
                            screen_id : elementInfo.screen_id, 
                         });
                         
        canvas.setCanvasForScreenId(currentScreenId);

        Editor.bindObjectTypeToElement(elementInfo.type, elementToAdd);

        // set manage of element
        setTextDraggable();
        setButtonsDraggable();
        setMapClickable();
        setEditables();                                 

        // add to database if not 
        if (elementInfo.loaded == false) {
            addElementToBase(elementToAdd, elementInfo);

            if (elementInfo.isUserCreated) {
                
                // generate code
                codeEditor.generateByNewObject([{name: elementToAdd.dataset.designName, type: elementInfo.type}]);
                if (elementInfo.type == ELEMENT_TYPE_TEXT || elementInfo.type == ELEMENT_TYPE_TEXTEDIT ||
                    elementInfo.type == ELEMENT_TYPE_BUTTON) {
                    codeEditor.generateByChangeParam([
                        {name:elementToAdd.dataset.designName,  parameter: "fontSize", value: elementToAdd.dataset.designFontSize},
                        {name:elementToAdd.dataset.designName,  parameter: "fontType", value: elementToAdd.dataset.designFontType},
                        {name:elementToAdd.dataset.designName,  parameter: "text", value: elementToAdd.dataset.designText},
                    ]);
                }
                codeEditor.generateByChangeParam([
                    {name:elementToAdd.dataset.designName,  parameter: "height", value: elementToAdd.dataset.designHeight},
                    {name:elementToAdd.dataset.designName,  parameter: "width", value: elementToAdd.dataset.designWidth},
                    {name:elementToAdd.dataset.designName,  parameter: "y", value: elementToAdd.dataset.designYPos},
                    {name:elementToAdd.dataset.designName,  parameter: "x", value: elementToAdd.dataset.designXPos}
                ]);
            }
       } else {
           //console.log("add element ("+elementInfo.type+" ID:"+elementInfo.id+") from base to canvas");
       }

       return elementToAdd;
	}
	
	function setStyleOfElement(element,styles) {
	    if (element == undefined) {
	        return;
	    }        
	    
	    text_color_hex = "#000000";
	    
        if (styles.x_pos != undefined && canvas) {
            var tmpPosX = parseInt(styles.x_pos);
            if (tmpPosX + element.offsetWidth >  canvas.workspaceWidth) {
                tmpPosX = canvas.workspaceWidth - element.offsetWidth;
            }  
            element.dataset.designXPos = tmpPosX;
            //clickableArea.x = tmpPosX;
            var styleLeft = tmpPosX + canvas.marginLeft;
            element.style.left = styleLeft+"px";  
        }
        if (styles.y_pos != undefined && canvas) {
            var tmpPosY = parseInt(styles.y_pos);
            // TIZEN
            var offsetTizen = 0;
            if (isTizen && canvas.isPortrait) {
                if (tmpPosY < tizenNavigationBar) {
                    tmpPosY = tizenNavigationBar;
                }
                offsetTizen = tizenNavigationBar;   
            }
            // END OF TIZEN 
            if (tmpPosY + element.offsetHeight >  canvas.workspaceHeight) {
                tmpPosY = canvas.workspaceHeight - element.offsetHeight;
            }  
            element.dataset.designYPos = tmpPosY;
            //clickableArea.y = tmpPosY;
            var styleTop = tmpPosY + canvas.marginTop;
            element.style.top = (styleTop-((isTizen)?(tizenNavigationBar):0)) +"px";
            element.style.top = (styleTop - offsetTizen)+"px";
        }
       // if (element.dataset.designType == ELEMENT_TYPE_CLICKABLE_AREA || element.dataset.designType == ELEMENT_TYPE_TEXTEDIT  || element.dataset.designType == ELEMENT_TYPE_TEXT) {
            if (styles.width != undefined) {
                element.dataset.designWidth = styles.width;
                element.style.width = styles.width+"px";
            } 
            if (styles.height != undefined) {
                element.dataset.designHeight = styles.height;
                element.style.height = styles.height+"px";
            } 
       // }

		//if (styles.new_element) {
        //    element.dataset.designName = "name";
        //    clickableArea.name = "name";
        //} else {
    		if (!styles.loaded) {
    			if (styles.name) {
    			    var newName = styles.name.toString();
    			    newName = newName.correctVariable("_");
    				if (canvas.canCreateElementName(newName) || newName == element.dataset.designName) {
    					element.dataset.designName = newName;
    					//clickableArea.name = newName;
    					$('#name').val(newName);
    				} else {
    				    if (canvas.canCreateElementName(styles.name) == false) {
    				        var newName = element.dataset.designType;
    				        if (newName == ELEMENT_TYPE_TEXT) {
    				            newName = "textfield";
    				        }
    				        styles.name = canvas.getFirstAvailableNameForType(newName);
    				    }
    				    element.dataset.designName = styles.name;
                        //clickableArea.name = styles.name; 
    				}
    			} 
    			canvas.showElementsList();
    			//canvas.getFirstAvailableNameForType(element.dataset.designType);
    		} else {
    		    element.dataset.designName = styles.name;
    		    //clickableArea.name = styles.name;
    		}     
		//}    
  
        if (styles.visible != undefined) {
            styles.visible = parseInt(styles.visible);
            if (!isNaN(styles.visible)) {
               if (styles.visible > 0) {
                   element.dataset.designVisible = 1;
                   //clickableArea.visible = 1;
                   if (element.dataset.designType == ELEMENT_TYPE_CLICKABLE_AREA) {
                       $(element).css('opacity', 0.7);
                   } else {
                       $(element).css('opacity', 1.0);
                   }
                   //element.style.backgroundColor = "#fff";   
               } else {
                   element.dataset.designVisible = 0;
                   //clickableArea.visible = 0;
                   $(element).css('opacity', 0.3);
                   //element.style.backgroundColor = "#ccc"; 
                   //element.style.backgroundImage = "none";
               }
            }   
            if (element.dataset.designAreaImage != "") {
                element.style.backgroundColor = "transparent";   
            }             
        }      
        if (styles.font_size) {
            element.dataset.designFontSize = styles.font_size;
             
            if (element.dataset.designType == ELEMENT_TYPE_TEXTEDIT || element.dataset.designType == ELEMENT_TYPE_TEXT || element.dataset.designType == ELEMENT_TYPE_BUTTON) {
                var child =  element.children[0];
                if (child) {
                    child.style.fontSize = styles.font_size+"px";
                }
            } else {
                element.style.fontSize = styles.font_size+"px";       
            }            
            
            //setStyleOfElement(element, {width: element.offsetWidth, height: element.offsetHeight });
        }    
        if (styles.font_type) {
            element.dataset.designFontType = styles.font_type;              
            
            if (element.dataset.designType == ELEMENT_TYPE_TEXTEDIT || element.dataset.designType == ELEMENT_TYPE_TEXT || element.dataset.designType == ELEMENT_TYPE_BUTTON) {
                var child =  element.children[0];
                if (child) {
                    child.style.fontFamily = styles.font_type;
                }
            } else {  
                element.style.fontFamily = styles.font_type;     
            }             
        }           
        if (styles.text_color) {
            try {
                element.dataset.designTextColor = styles.text_color;
                var hex = (new Color).myRgbToHex(styles.text_color);
                
                if (element.dataset.designType == ELEMENT_TYPE_TEXTEDIT || element.dataset.designType == ELEMENT_TYPE_TEXT || element.dataset.designType == ELEMENT_TYPE_BUTTON) {
                    var child =  element.children[0];
                    if (child) {
                        child.style.color = hex;
                        $(child).css("color", hex);
                    }
                } else {
                    element.style.color = hex;
                    $(element).css("color", hex);        
                }
            } catch(e) {}
        }
        if (styles.title_color) {
            try {
                element.dataset.designTitleColor = styles.title_color;
                var hex = (new Color).myRgbToHex(styles.title_color);
                
                if (element.dataset.designType == ELEMENT_TYPE_BUTTON) {
                    var child =  element.children[0];
                    if (child) {
                        child.style.color = hex;
                        $(child).css("color", hex);
                    }
                } else {
                    element.style.color = hex;
                    $(element).css("color", hex);        
                } 
            } catch(e) {}
        }        
        
        if (styles.text != undefined) {
            var text = specialCharsToHtml(styles.text);
            element.dataset.designText = Convert.nl2br(text);  // its important to designText doesnt has line break (use in editor Code)

            if (element.dataset.designType == ELEMENT_TYPE_TEXTEDIT || element.dataset.designType == ELEMENT_TYPE_TEXT || element.dataset.designType == ELEMENT_TYPE_BUTTON) {
                var child =  element.children[0];
                if (child) {
                    child.setAttribute("value", styles.text);
                    $(child).val(Convert.br2nl(text));
                }
            } else {
                element.innerHTML = styles.text;                
                $(element).val(Convert.br2nl(text));            
            }  
        }
        if (styles.title_label != undefined) {
            var text = specialCharsToHtml(styles.title_label);
            element.dataset.designTitleLabel = Convert.nl2br(text);  // its important to designText doesnt has line break (use in editor Code)
            
            if (element.dataset.designType == ELEMENT_TYPE_BUTTON) {
                var child =  element.children[0];
                if (child) {
                    child.setAttribute("value", styles.title_label);
                    $(child).val(Convert.br2nl(text));
                }
            } else {
                element.innerHTML = styles.title_label;                
                $(element).val(Convert.br2nl(text));            
            }             
        }    
        if (styles.background_image != undefined) {
            element.dataset.designBackgroundImage = styles.background_image;  
            
            var child = element.children[0];
            if (child) {                    
                //$(child).attr('readonly', true);
                
                child.style.backgroundSize = "100% 100%";
                if (styles.background_image != "") {
                    child.style.backgroundImage = "url('"+pathSystem+"/media/upload/"+appId+"/img/"+styles.background_image+"')";
                } else {
                    child.style.backgroundImage = "url('"+pathSystem+"/media/img/btn_bg_vert.png')";
                    //background = "url(" + url + ") no-repeat"
                    // "url('../../media/img/btn_bg_vert.png')";
                    //self.meterDiv.style.background = "url(" + url + ") no-repeat";  
                }
            }                          
        }
        if (styles.area_image != undefined) {            
            element.dataset.designAreaImage = styles.area_image;
            //clickableArea.image = styles.area_image;
            if (styles.area_image == "") {
                element.style.backgroundColor = "#fff";   
                element.style.backgroundImage = "none";  
               
                if (element.dataset.designVisible == 1) {
                    $(element).css('opacity', 0.7);
                    //element.style.backgroundColor = "#fff"; 
                } else {
                    //element.style.backgroundColor = "#ccc"; 
                }        
            } else {
                element.style.backgroundColor = "transparent"; 
                element.style.backgroundSize = "100% 100%"; 
                element.style.backgroundImage = "url('../../media/upload/"+appId+"/img/"+styles.area_image+"')";
                var img = document.createElement("img");            
                img.src = "../../media/upload/"+appId+"/img/"+styles.area_image;            
                img.onload = function() {
                    element.style.backgroundColor = "transparent";
                    element.dataset.designImageOriginalWidth = img.width;
                    element.dataset.designImageOriginalHeight = img.height;
                    /*if (!styles.loaded) {
                        if (!styles.width && !styles.height) {
                            setStyleOfElement(element, { width: img.width, height: img.height });                        
                            selectElement(element,true);
                        }  
                    }*/
                }                  
            }
        }     
        if (styles.proportional_image != undefined) {
            styles.proportional_image = parseInt(styles.proportional_image);
            if (!isNaN(styles.proportional_image)) {
               if (styles.proportional_image > 0) {
                   element.dataset.designProportionalImage = 1;
               } else {
                   element.dataset.designProportionalImage = 0;
               }
            }   
        }     
        if (styles.file_name != undefined) {            
            element.dataset.designFileName = styles.file_name;  
            if (styles.file_name == "") {                
                element.src = DEFAULT_IMAGE;
            } else {
                element.src = "../../media/upload/"+appId+"/img/"+styles.file_name;
            }
            element.onload = function() {
                selectElement(element,true);
            }
        }      
        
        styles.draggable = parseInt(styles.draggable);
        if (!isNaN(styles.draggable)) {
           if (styles.draggable > 0) {
               element.dataset.designDraggable = 1;
           } else {
               element.dataset.designDraggable = 0;
           }
        }                                 
        if (styles.html_content) {
            var text = Convert.nl2br(styles.html_content);
            element.dataset.designHtmlContent  = text;
            element.innerHTML = specialCharsToHtml(element.dataset.designHtmlContent);
        }
        
       if (styles.latitude) {
            styles.latitude = parseFloat(styles.latitude);
            if (!isNaN(styles.latitude)) {
                element.dataset.designLatitude = styles.latitude;
                var map = mapsContainer.getMapById(element.dataset.mapId);
                if (map) {
                    element.dataset.designLatitude = styles.latitude;
                    var latit = parseFloat(element.dataset.designLatitude);
                    var longit = parseFloat(element.dataset.designLongitude);
                    if (!styles.drag_listener) {
                        map.setCenter(new google.maps.LatLng(latit, longit));
                    }
                }                 
                //selectPropertiesFor(element);
            }                         
        }
        if (styles.longitude) {
            styles.longitude = parseFloat(styles.longitude);              
            if (!isNaN(styles.longitude)) {                  
                var map = mapsContainer.getMapById(element.dataset.mapId);
                if (map) {
                   element.dataset.designLongitude = styles.longitude;
                    var latit = parseFloat(element.dataset.designLatitude);
                    var longit = parseFloat(element.dataset.designLongitude);
                    if (!styles.drag_listener) {
                        map.setCenter(new google.maps.LatLng(latit, longit));
                    }                
                }                 
                //selectPropertiesFor(element);
            }        
        }      
        if (styles.zoom) {
            styles.zoom = parseInt(styles.zoom);
            if (!isNaN(styles.zoom)) {                
                var map = mapsContainer.getMapById(element.dataset.mapId);
                if (map) {
                    element.dataset.designZoom  = styles.zoom;
                    if (!styles.zoom_listener) {
                        map.setZoom(styles.zoom);
                    } else {
                        selectElement(element, true);
                    }   
                }  
                //selectPropertiesFor(element);          
            }                 
        }                  
        /*if (styles.zoom) {
            styles.zoom = parseInt(styles.zoom);
            if (!isNaN(styles.zoom)) {
                if (map) {
                    if (!styles.zoomListener) {
                        map.setZoom(styles.zoom);
                    } else {
                        selectElement(element, true); 
                    }                 
                }            
                element.dataset.designZoom  = styles.zoom;
            }                 
        } */ 
        if (styles.screen_id) {
            if (styles.loaded) {
                element.dataset.designScreenId = styles.screen_id;
            } else {
                element.dataset.designScreenId = currentScreenId;
            }            
        }                          
	}
	
	function setDefaultSettingsForElement(element,wasLoaded, set_default) {
	    if (!wasLoaded && set_default) { 
             element.dataset.designVisible = 1;
         }
	            
        switch(element.dataset.designType){
            case ELEMENT_TYPE_TEXT:
                /*if (!wasLoaded && set_default) {
                    setStyleOfElement(element, {text:specialCharsToHtml("text"), font_size : 26, font_type : "Helvetica", text_color : "20,20,20"});                                     
                }
                element.setAttribute('class', 'editable_text');*/
                if (!wasLoaded && set_default) {
                    setStyleOfElement(element, {text:specialCharsToHtml(optionalElementText+optionalElementNr), width: 520, height: 82, font_size : 64, font_type : "Helvetica", text_color : "20,20,20"});
                    optionalElementNr++;                                     
                }
                element.setAttribute('class', 'draggable_button');  
                element.style.cursor = "move";               
                setResizableArea(element);
                setContextMenu(element, {elementType:element.dataset.designType});
                    
                var child = element.children[0];
                if (child) {                    
                    //$(child).attr('readonly', true);   
                    $(child).css({"background":"transparent", "border":"0px solid #000"});                 
                    
                    $(child).change(function() {
                       var text = $(child).val();
                       setStyleOfElement(element, {text:specialCharsToHtml(text)});
                       codeEditor.generateByChangeParam([{name:element.dataset.designName,  parameter: "text", value: text}]);
                       activeElement.updateElementInBase();
                    });
                }                             
                break;
            case ELEMENT_TYPE_BUTTON:
                /*if (!wasLoaded && set_default) {   
                    setStyleOfElement(element, {title_label:specialCharsToHtml("button"), background_image: "", title_color : "20,20,20"});                             
                }*/               
                if (!wasLoaded && set_default) {
                    setStyleOfElement(element, {text:specialCharsToHtml("Button text"), background_image: "", width: 200, height: 30, font_size : 16, font_type : "Helvetica", text_color : "20,20,20"});                                     
                }
                element.setAttribute('class', 'draggable_button');  
                element.style.cursor = "move";               
                setResizableArea(element);
                setContextMenu(element, {elementType:element.dataset.designType});
                    
                var child = element.children[0];
                if (child) {                    
                    //$(child).attr('readonly', true);   
                    $(child).css({ "border":"1px solid #aaaaaa", "background-color":"#ffffff", "text-align": "center"});
                    //"background":"transparent",                                    
                    
                    $(child).change(function() {
                       var text = $(child).val();
                       setStyleOfElement(element, {text:specialCharsToHtml(text)});
                       codeEditor.generateByChangeParam([{name:element.dataset.designName,  parameter: "text", value: text}]);                                              
                       activeElement.updateElementInBase();
                    });
                    
                    $(child).keydown(function( event ) {
                        // event
                        var isFind = false;
                        EventsNotification.exe(SequencesSystemEvents.EVENT_CHANGE_ELEMENT_TEXT, {text: $(this).val()}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}
                    });                    
                    
                    $(child).corner();
                }                             
                break; 
                
                break;                                           
            case ELEMENT_TYPE_HTML:
                if (!wasLoaded && set_default) {
                    setStyleOfElement(element, {html_content:specialCharsToHtml("html")});                             
                } 
                element.setAttribute('class', 'editable_text');
                break;
            case ELEMENT_TYPE_IMAGE:
                if (!wasLoaded && set_default) {
                    setStyleOfElement(element, { width: 100, height: 100, file_name: "", draggable: 1 });                             
                } 
                setResizableArea(element);
                setContextMenu(element, {elementType:element.dataset.designType});
                element.setAttribute('class', 'draggable_button');
                element.style.cursor = "pointer";                
                
                break;
            case ELEMENT_TYPE_MAP:
            
               if (!wasLoaded && set_default) {
                   setStyleOfElement(element, { width: 200, height: 200, latitude:59.32522, longitude: 18.07002, zoom: 10 });
                }
                element.dataset.designIsActions = 0;
                element.style.cursor = "move";
                                
                mapsContainer.addMap(element, element.dataset.designWidth, element.dataset.designHeight)
                                  
                //google.maps.event.addDomListener( mapElement, 'resize', function(e){console.log( 'Resize', e)} );                                  
                                  
                $(element).resizable({
                     minWidth: 50,
                     minHeight: 50,
                     resize: function(event, ui) {
                        var elMap = this;
                        var map = mapsContainer.getMapById(elMap.dataset.mapId);
                        if (map) {
                            google.maps.event.trigger(map, 'resize');
                            //map
                        }
                        //$(this).css();
                        setStyleOfElement(this, { width: ui.size.width, height: ui.size.height });
                        selectElement(this); 
                     },
                     stop: function(event, ui) {   
                     }
                });            
            /*
                var zoom = 13;
                var mapOptions = { zoom: zoom,
                                   mapTypeId: google.maps.MapTypeId.ROADMAP,
                                   center: new google.maps.LatLng(59.32522, 18.07002) };
                map = new google.maps.Map(element, mapOptions);                
                var marker = new google.maps.Marker({
                    map:map,
                    draggable:true,
                    animation: google.maps.Animation.DROP,
                    position: new google.maps.LatLng(59.32522, 18.07002)
                });
                google.maps.event.addListener(map, 'zoom_changed', function() {
                    var zoomListener = map.getZoom();                    
                    setStyleOfElement(element, { zoom: zoomListener, zoomListener: true });
                });
                setStyleOfElement(element, { width: 200, height: 200, zoom:zoom }); 
                element.setAttribute('class', 'clickable_map'); */               
                break;
            case ELEMENT_TYPE_CLICKABLE_AREA:
                if (!wasLoaded && set_default) {
                    setStyleOfElement(element, { width: 100, height: 100, area_image:"" });                             
                } 
                element.style.backgroundColor = "#fff";
                setResizableArea(element);
                setContextMenu(element, {elementType:element.dataset.designType});
                element.setAttribute('class', 'draggable_button');
                element.style.cursor = "pointer";
                break;      
            case ELEMENT_TYPE_TEXTEDIT:    
                if (!wasLoaded && set_default) {
                    setStyleOfElement(element, {text:specialCharsToHtml(optionalElementText+optionalElementNr), width: 200, height: 30, font_size : 16, font_type : "Helvetica", text_color : "20,20,20"});
                    optionalElementNr++;                                     
                }
                element.setAttribute('class', 'draggable_button');
                element.style.cursor = "move";
                setResizableArea(element);
                setContextMenu(element, {elementType:element.dataset.designType});
                    
                var child = element.children[0];
                if (child) {
                    $(child).change(function() {
                       var text = $(child).val();
                       setStyleOfElement(element, {text:specialCharsToHtml(text)});
                       codeEditor.generateByChangeParam([{name:element.dataset.designName,  parameter: "text", value: text}]);
                       activeElement.updateElementInBase();
                    });
                }
                //element.setAttribute('class', 'editable_text');               
                break;                          
            default:
                break;
	   }
	}
	
	function addElementToBase(element, data) {	    
	    var options = {};
        switch(element.dataset.designType) {
            case ELEMENT_TYPE_TEXT: options = optionsTextObject(element); break;
            case ELEMENT_TYPE_BUTTON: options = optionsButtonObject(element); break;
            case ELEMENT_TYPE_HTML: options = optionsHtmlObject(element); break;        
            case ELEMENT_TYPE_IMAGE: options = optionsImageObject(element); break;
            case ELEMENT_TYPE_MAP: options = optionsMapObject(element); break;
            case ELEMENT_TYPE_CLICKABLE_AREA: options = optionsClickableAreaObject(element); break;
            case ELEMENT_TYPE_TEXTEDIT: options = optionsTextEditObject(element); break;
            default: break;
        } 
        options = $.extend(true, options, data);
        
        if (options && element && element.dataset.designType) { 
            addObject(element, element.dataset.designType, options);
        }
	}
	
	function specialCharsToHtml(value) {
	    var retval = value;
	    if (retval) {
	       return retval.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"").replace(/&#039/g, "'").replace(/&#39;/g, "'").replace(/&#39/g, "'");
	    } else {
	        return "";
	    }
	}
	
/*	
function setResizableTextEdit(element) {
        $(element).resizable({
            helper: "ui-resizable-helper",
            start: function(event, ui) {
                //element.dataset.designEditActions = 0;
                //selectElement(ui.element[0], true);
                if (element.dataset.designAreaImage == "") {
                    element.dataset.designImageOriginalWidth = element.dataset.designWidth;
                    element.dataset.designImageOriginalHeight = element.dataset.designHeight;
                }
            },
            resize: function(event, ui) {
                //console.log(ui.element[0])
                //console.log(ui.size.width+" "+ui.size.height)
                var element = ui.element[0];
                var size = ui.size;
                if (parseInt(element.dataset.designProportionalImage)) {
                    size = calculateAspectRatioFit(element.dataset.designImageOriginalWidth, element.dataset.designImageOriginalHeight, ui.size.width, ui.size.height);
                }
                setStyleOfElement(element, { width: size.width, height: size.height });
                $('#width').val(parseInt(element.dataset.designWidth).toFixed(0));
                $('#height').val(parseInt(element.dataset.designHeight).toFixed(0));    
                if (activeElement) {
                    activeElement.refresh();
                }
            },
            stop: function(event, ui) {
                var element = ui.element[0];
                var size = ui.size;                        
                if (parseInt(element.dataset.designProportionalImage)) {
                    size = calculateAspectRatioFit(element.dataset.designImageOriginalWidth, element.dataset.designImageOriginalHeight, ui.size.width, ui.size.height);
                }      
                setStyleOfElement(element, { width: size.width, height: size.height });
                //element.dataset.designEditActions = 0;
                ///selectElement(element, true);
                activeElement.updateElementInBase();
            }                    
        });    
    }*/	
	
	function setResizableArea(element) {
        $(element).resizable({
            helper: "ui-resizable-helper",            //handles: "all",
            start: function(event, ui) {
                //element.dataset.designEditActions = 0;
                //selectElement(ui.element[0], true);
                if (element.dataset.designAreaImage == "") {
                    element.dataset.designImageOriginalWidth = element.dataset.designWidth;
                    element.dataset.designImageOriginalHeight = element.dataset.designHeight;
                }
            },
            resize: function(event, ui) {
                //console.log(ui.element[0])
                //console.log(ui.size.width+" "+ui.size.height)
                var element = ui.element[0];
                var size = ui.size;
                if (parseInt(element.dataset.designProportionalImage)) {
                    size = calculateAspectRatioFit(element.dataset.designImageOriginalWidth, element.dataset.designImageOriginalHeight, ui.size.width, ui.size.height);
                }
                setStyleOfElement(element, { width: size.width, height: size.height });
                $('#width').val(parseInt(element.dataset.designWidth).toFixed(0));
                $('#height').val(parseInt(element.dataset.designHeight).toFixed(0));    
                if (activeElement) {
                    activeElement.refresh();
                }
            },
            stop: function(event, ui) {
                var element = ui.element[0];
                var size = ui.size;                        
                if (parseInt(element.dataset.designProportionalImage)) {
                    size = calculateAspectRatioFit(element.dataset.designImageOriginalWidth, element.dataset.designImageOriginalHeight, ui.size.width, ui.size.height);
                }      
                setStyleOfElement(element, { width: size.width, height: size.height });
                //element.dataset.designEditActions = 0;
                ///selectElement(element, true);
                codeEditor.generateByChangeParam([                        
                    {name:this.dataset.designName,  parameter: "height", value: size.height},
                    {name:this.dataset.designName,  parameter: "width", value: size.width}
                ]);                    
                activeElement.updateElementInBase();
            }                    
        });    
	}
	
	
    function setContextMenu(element, options) {  // options.elementType

        var contextMenuObject = [            
            //$.contextMenu.separator,
            {"Delete":{
                onclick:function(menuItem,menu) {
                    var isFind = false;
                    EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}                                                             
                    callbackPropertyDeleteElement(); 
                },
                icon: pathSystem+'/media/js/contextmenu/css/delete_icon.gif',
                disabled:false
            }}
        ];        
        $(element).contextMenu(contextMenuObject, {theme:'vista'});        
    }

	function setTextDraggable() {
		$( ".editable_text" ).mousedown(function() {
            var isFind = false;
            EventsNotification.exe(SequencesSystemEvents.EVENT_SELECT_ELEMENT_ON_CANVAS, {text: $(this)[0].dataset.designName}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}            

            this.dataset.designEditActions = 1;
            if ($(this)[0] != activeElement.elementSelected) {      
               selectElement(this,true,true);   
            }
            //Move to front
            while( $(this).next()[0] ) { 
                $($(this)).insertAfter($(this).next());
            } 		    
		}).draggable({
		      snap: "."+grid.getLineClass(),
			  revert: function(){
				  return revert;
			  }	,
			  revertTime: 0,
			  stop: function( event, ui ) {
				  var x = $(this).offset().left - canvas.workspaceX;
			      var y = $(this).offset().top - canvas.workspaceY;

                  var offsetTizen = 0;
                  if (isTizen && canvas.isPortrait) {
                    offsetTizen = tizenNavigationBar;   
                  }               
                  y += offsetTizen;

                  console.log("setTextDraggable:stop");
			      console.log("x: " + x + " y: " + y);
			      this.dataset.designEditActions = 0;
			      activeElement.refresh();
			      activeElement.show(true);
			      
			      if(!revert){	          
			      	setStyleOfElement(this, { x_pos: x, y_pos: y });
                    selectElement(this);
                    activeElement.updateElementInBase();
			      }
			  },
			  drag: function( event, ui ) {			      
		      
                  if (canvas.isContainsRect($(this).offset().left, $(this).offset().top, this.offsetWidth, this.offsetHeight)) {
                      activeElement.show(true);
                      activeElement.refresh();                       
                      revert = false;
                  } else {
                      activeElement.show(false);
                      revert = true;
                  } 
			  },
			  start: function( event, ui ){
                  //activeElement.setActiveForElement($(this)[0]);
                 // console.log($(this).parent());
                  //$( ".editable_text" ).after($(this));
			  }
			});
	}

	function setButtonsDraggable(){
		$( ".draggable_button" ).mousedown(function() {		    
            var isFind = false;
            EventsNotification.exe(SequencesSystemEvents.EVENT_SELECT_ELEMENT_ON_CANVAS, {text: $(this)[0].dataset.designName}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}            
		    		    		
		    this.dataset.designEditActions = 1;
		    if ($(this)[0] != activeElement.elementSelected) {	    
		       selectElement(this,true,true);   
		    }
		}).draggable({
              snap: "."+grid.getLineClass(),
			  revert: function(){			      
				  return revert;
			  }	,
			  revertTime: 0,
			  start: function( event, ui) {
			      this.dataset.designEditActions = 0;
			      //activeElement.setActiveForElement($(this)[0]);
			  },
			  stop: function( event, ui ) {
				  var x = $(this).offset().left - canvas.workspaceX+20;
			      var y = $(this).offset().top - canvas.workspaceY;
			      
			      console.log(JSON.stringify($(this).offset()));
			      
			      var offsetTizen = 0;
                  if (isTizen && canvas.isPortrait) {
                    offsetTizen = tizenNavigationBar;   
                  }			      
			      y += offsetTizen;
			      
                  setStyleOfElement(this, { x_pos: x, y_pos: y });
                  
                  this.dataset.designEditActions = 0;
                  activeElement.refresh();	
                  activeElement.show(true);


			      if(!revert){			      	          
                    /*var propertyX = properties.getPropertyForId("x_pos");
                      var propertyY = properties.getPropertyForId("y_pos");
                    
                    if (propertyX && propertyY) {
                        tryChangeParamsActiveObject("x_pos", propertyX, x);
                    }*/

			          
			      	this.dataset.designXPos = x;
			      	this.dataset.designYPos = y;			      	
                    selectElement(this);
                    codeEditor.generateByChangeParam([                        
                        {name:this.dataset.designName,  parameter: "y", value: y},
                        {name:this.dataset.designName,  parameter: "x", value: x}
                    ]);                    
                    activeElement.updateElementInBase();
			      } else {
			      	console.log("Reverting, come back on initial position" + this);
			      }
			  },
			  drag: function( event, ui ) {
                  if (canvas.isContainsRect($(this).offset().left+10, $(this).offset().top+10, this.offsetWidth-180, this.offsetHeight)) {
                      activeElement.show(true);
                      activeElement.refresh(); 
                      revert = false;
                  } else {
                      activeElement.show(false);
                      revert = true;
                  } 			  
                  
                  console.log($(window).width()-1220);
                                        
			  }
		});
	}
	
	function setMapClickable() {
	    $( ".clickable_map" ).click(function() {
	        selectElement(this,true);
	    });
	}
	
function setCanvasDroppable(){
    $( ".canvas" ).droppable({
        accept: ".menu_item",
        drop: function( event, ui ) {
            var type = "text";

            for(var i = 0; i<draggableItemsMenu.length; i++){

                if(ui.draggable[0] == draggableItemsMenu[i]){
                    type = draggableItemsMenu[i].id;
                    break;
                }
            }
            
            var isFind = false;
            EventsNotification.exe(SequencesSystemEvents.EVENT_DROP_ELEMENT_ON_CANVAS, {type: type}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}
                        
            var newPosX = ui.offset.left - canvas.workspaceX;//$(this).offset().left;
            var newPosY = ui.offset.top - canvas.workspaceY;//$(this).offset().top;
            
            var offsetTizen = 0;
            if (isTizen && canvas.isPortrait) {
              offsetTizen = tizenNavigationBar;   
            }               
            newPosY += offsetTizen;            
            
            var absoluteX = ui.offset.left;
            var absoluteY = ui.offset.top;
            
            console.log("setCanvasDroppable");
            var nameElement = type;
            
            if (type == ELEMENT_TYPE_TEXT) {
                nameElement = "textfield";
            }
            createObjectOnCanvas(type, { // exe m.in. from definitions
                name: nameElement+"0", 
                x_pos: newPosX, 
                y_pos: newPosY, 
                visible: true,
                isUserCreated: true
            });
        }
    });
}	

function createObjectOnCanvas(type, options) {
    options.loaded = false;
    options.new_element = true;
    options.type = type;
    return addElementToCanvas(options);
}
	
	
