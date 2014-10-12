////////////////////
// CANVAS

function Canvas(id, isRetina) {
	var that = this;
    this.id = id;
    this.idCanvasOverlay = "canvas_overlay";  
    this.idCanvasCannotRender = "canvas_cannot_render";
    this.idCanvasCannotRenderOpenDefs = "canvas_cannot_render_open_defs";
    this.overlayBackground = pathSystem+"/media/img/canvas720x1280.png";
    this.overlayBackgroundCannotRender = pathSystem+"/media/img/canvas720x1280_cannot_render.png";
        
    var resolution = {x:720*((isRetina) ? 2 : 1), y:720*((isRetina) ? 2 : 1)}
    this.IPAD_RESOLUTION_X = resolution.x;
    this.IPAD_RESOLUTION_Y = resolution.y;
   
    var canvas = document.getElementById(id);
    if(canvas) {
        this.workspaceX = canvas.offsetLeft;
        this.workspaceY = canvas.offsetTop;
        this.workspaceWidth = canvas.offsetWidth;
        this.workspaceHeight = canvas.offsetHeight;
        
        $("#"+that.idCanvasOverlay).click(function(){
            var isFind = false;
            EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id }, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}                        
            
            if(activeElement) {
                activeElement.setNotActive();
            }
        });
        
        $("#"+that.idCanvasCannotRenderOpenDefs).click(function(){
            codeEditor.openEditor();
            codeEditor.openBoardCodeWithCurrentError();            
        });
        
    }
    this.marginLeft = 0;
    this.marginTop = 0;
    this.marginRight = 0;
    this.marginBottom = 0;
    this.parentElementsList = "#elements_list";
    this.elementsList = new Array();    // all elements of clikable area, textfield etc from system
    var draggableItemsAdded = new Array();


    this.setResolution = function(resObj) {
        if (!resObj || !resObj.x || !resObj.y) {
            return;
        }        
        
        resolution = resObj; 
        this.IPAD_RESOLUTION_X = resObj.x;
        this.IPAD_RESOLUTION_Y = resObj.y; 
        
        BOARD_SIZE_WIDTH =  this.IPAD_RESOLUTION_X;
        BOARD_SIZE_HEIGHT =  this.IPAD_RESOLUTION_Y;
        
        var qCanvasOverlay = $("#"+this.idCanvasOverlay);
        //if (isPortreit) {             // ""+(resObj.x+30)+"px"
            qCanvasOverlay.css({"background-image":"url('"+that.overlayBackground+"')","width":"100%","height":""+(resObj.y+24)+"px", "background-size": "100% 100%"});//""+resObj.x+"px "+resObj.y+"px"            
        //} else {
        //    qCanvasOverlay.css({"background-image":"url('"+pathSystem+"/media/img/canvas1280x720.png')","width":"1300px","height":"760px"});
        //}        

        var qContentRulerVert = $("#content_ruler_vert");
        if (qContentRulerVert) {
            var height = $("#"+this.id).height();
            qContentRulerVert.css("height", height-10);
        }        
    }
    
    this.getResolution = function() {
        return resolution;  // {x,y}
    }
    
    this.setBackground = function(offsetX, offsetY, filename) {
        var w = this.IPAD_RESOLUTION_X + offsetX;
        var h = this.IPAD_RESOLUTION_Y + offsetY;
        $("#"+this.id).css({"background-position": "20px "+(that.marginTop)+"px", "max-width":""+(w+offsetX/2)+"px", "max-height":""+(h+offsetY/2)+"px","background-image":"url('"+filename+"')", "background-color": "#fff" , "background-repeat": "no-repeat" });    
		// "width":""+w+"px", "height":""+h+"px", backgroundSize: "100% 100%"
    }    
    
    this.setWorkspaceMargin = function(offsetX, offsetY, offsetWidth, offsetHeight) {
        this.marginLeft = offsetX;
        this.marginTop = offsetY;
        this.marginRight = offsetWidth;
        this.marginBottom = offsetHeight;

        this.workspaceX = canvas.offsetLeft + offsetX;
        this.workspaceY = canvas.offsetTop + offsetY;
        this.workspaceWidth = canvas.offsetWidth - offsetX - offsetWidth;
        this.workspaceHeight = canvas.offsetHeight - offsetY - offsetHeight;
    }

    this.isContainsRect = function(rectX, rectY, rectWidth, rectHeight) {
        var posX = rectX - this.workspaceX;
        var posY = rectY - this.workspaceY;

        if(posX < 0 || posY < 0 || posX + rectWidth > this.workspaceWidth || posY + rectHeight > this.workspaceHeight) {
            return false;
        } else {
            return true;
        }
    }

    this.convertPosXFromCanvasToIPad = function(x) {
        return (x * (this.IPAD_RESOLUTION_X / this.workspaceWidth)).toFixed(0);
    }
    this.convertPosYFromCanvasToIPad = function(y) {
        return (y * (this.IPAD_RESOLUTION_Y / this.workspaceHeight)).toFixed(0);
    }

    this.convertPosXFromIPadToCanvas = function(x) {
        return (x / (this.IPAD_RESOLUTION_X / this.workspaceWidth)).toFixed(0);
    }
    this.convertPosYFromIPadToCanvas = function(y) {
        return (y / (this.IPAD_RESOLUTION_Y / this.workspaceHeight)).toFixed(0);
    }

    this.getCanvas = function() {
        return canvas;
    }

    this.setCanvasForScreenId = function(screenId) {      
        for (var i=0; i < draggableItemsAdded.length; i++) {
            if (draggableItemsAdded[i].dataset.designScreenId == screenId) {
                $(draggableItemsAdded[i]).css("display", "block");
            } else {
                $(draggableItemsAdded[i]).css("display", "none");
            }
        }
        if (activeElement) {
            activeElement.setNotActive();
        }
        this.showElementsList();
    }

    this.addElement = function(elementToAdd) { 
        // try add element to canvas     
        //if (elementToAdd.dataset.designScreenId == currentScreenId) {
            $("#"+this.id)[0].appendChild(elementToAdd);
            draggableItemsAdded.push(elementToAdd);
            
            //if (elementToAdd.dataset.designScreenId != currentScreenId) {
            //    $(elementToAdd).css("display", "none");
            //}
            
            this.showElementsList();
            $("#canvas_overlay").insertAfter(elementToAdd);
        //}
         
        // add element to memory
        this.elementsList.push(elementToAdd);        
    }

    this.getElement = function(i) {
        return draggableItemsAdded[i];
    }
    
    this.getLastElement = function() {
        if (draggableItemsAdded.length > 0) {
            return draggableItemsAdded[draggableItemsAdded.length-1];
        } else {
            return undefined;
        }
    }    

    this.removeElement = function(elementRemoved) {
        Editor.removeObjectWithName(elementRemoved.dataset.designName); 

        // remove from draggableItems
        var index = draggableItemsAdded.indexOf(elementRemoved);
        if (index != undefined && index > -1 && index < draggableItemsAdded.length) {       
            draggableItemsAdded.splice(index, 1);
        }   
        
        // remove from global list elements
        index = that.elementsList.indexOf(elementRemoved);
        if (index > -1 && index < that.elementsList.length) {
            that.elementsList.splice(index, 1);
        }
        
        //remove from canvas
        var parent = document.getElementById(this.id);
        parent.removeChild(elementRemoved);
        elementRemoved = undefined;
             
        this.showElementsList();
    }

    this.getElementsList = function() {
        return draggableItemsAdded;
    }
    
    this.getElementsListOfName = function() {
        var namesList = new Array();
        for(var i=0; i < draggableItemsAdded.length; i++) {
            namesList.push(draggableItemsAdded[i].dataset.designName);            
        }
        return namesList;
    }
    
    this.getElementsListForType = function(type) {
        var elements = new Array();
        for(var i=0; i < draggableItemsAdded.length; i++) {
            if (draggableItemsAdded[i].dataset.designType == type) {
                elements.push(draggableItemsAdded[i]);
            }            
        }
        return elements;
    }        
   
    this.showElementsList = function() {
        var html = "<ul>";
        for(var i = 0; i < draggableItemsAdded.length; i++) {
            var element = draggableItemsAdded[i];
            if (element.dataset.designScreenId == currentScreenId) {
                var name = element.dataset.designName;
                var type = element.dataset.designType;
                var x = element.dataset.designXPos;
                var y = element.dataset.designYPos;    
                if(type) {
                    html += "<li><a href='#tagProperties' style='text-decoration:none;'><span class='elements_list' onclick=\"selectElement(canvas.getElement(" + i + "),true);\" onmouseover='selectElement(canvas.getElement(" + i + "));' onmouseout=''>" + name + " </a></li>"; // <span style='color:red;font-size:7pt;'><i>pos:(" + x + "," + y + ")</i></span></span>
                }
            }
        }
        html += "</ul>";
        $(this.parentElementsList).html(html);
    }

    this.existElementName = function(name) {
        for(var i = 0; i < draggableItemsAdded.length; i++) {
            var element = draggableItemsAdded[i];
            if(element.dataset.designName == name) {
                return true;
            }
        }
        return false;
    }
    
    this.getElementForName = function(name) {
        for(var i=0; i < draggableItemsAdded.length; i++) {
            var element = draggableItemsAdded[i];
            if (element.dataset.designName == name) {
                return element;
            }
        }
        return null;
    }

    this.canCreateElementName = function(name) {
       var isExist = this.existElementName(name);
       // element name cannot begin with number
       if (name && name.length > 0 && name.charCodeAt(0) >= 48  && name.charCodeAt(0) <= 57) {
           return false;
       } else if (isExist == false) {
           return true;
       }
       return false;
    }

    this.getFirstAvailableNameForType = function(type) {
        for(var i = 0; ; i++) {
            var name = (type + i).toString();
            name = name.correctVariable("_");
            if(this.existElementName(name) == false) {
                return name;
            }
        }
        return type;
    } 
	
    this.elementForBoardIdAndName = function(id, name) {
        for(var i = 0; i < this.elementsList.length; i++) {
            var element = this.elementsList[i];
            if(element.dataset.designName == name && element.dataset.designScreenId == id) {
                return element;
            }
        }
        return undefined;
    }	
    
    this.setRenderBoardElements = function(isCorrect) {    
        var qCanvasOverlay = $("#"+that.idCanvasOverlay);    
        var qCanvasCannotRender = $("#"+that.idCanvasCannotRender);    
        if (isCorrect) {
            qCanvasCannotRender.css({"display":"none"});            
            //qCanvasOverlay.css({"background-image":"url('"+that.overlayBackground+"')"});                                   
        } else {
            qCanvasCannotRender.css({"display":"block", "width": resolution.x+"px", "height": resolution.y+"px" });
            qCanvasCannotRender.parent().append(qCanvasCannotRender);         
            //qCanvasOverlay.css({"background-image":"url('"+that.overlayBackgroundCannotRender+"')"});
        }
    }
	
	this.globalIsExistImageInActionsForName = function(name)  {
		if (name) {
					
			for(var i=0; i < draggableItemsAdded.length; i++) {
				var tempActions = new Actions();
				tempActions.setByJSON(draggableItemsAdded[i].dataset.designActions, true);				
				if (tempActions.globalIsExistsImageForName(name)) {
					return true;
				}
			}
		}
		return false;
	}
	
	this.globalIsExistsForName = function(name, typeAction) {
		if (name) {
			for(var i=0; i < this.elementsList.length; i++) {			    
				if (typeAction == DELETED_ELEMENT_IMAGE && this.elementsList[i].dataset.designAreaImage == name) {
					return true;
				}
                var tempActions = new Actions();
                tempActions.setByJSON(this.elementsList[i].dataset.designActions, true);              
                if (tempActions.globalIsExistsForName(name, typeAction)) {
                    return true;
                }				
			}
		}
		return false;
	}	
	
	this.globalSetCorrectForName = function(name, typeAction, newName) {
		if (name) {
			for(var i=0; i < this.elementsList.length; i++) {
				var isChange = false;
				
				if (typeAction == DELETED_ELEMENT_IMAGE && this.elementsList[i].dataset.designAreaImage == name) {
					this.elementsList[i].dataset.designAreaImage = "-";
					setStyleOfElement(this.elementsList[i], { area_image : "-" });
					isChange = true;
				}
				
                var tempActions = new Actions();
                tempActions.setByJSON(this.elementsList[i].dataset.designActions, true);
                var json = tempActions.globalSetCorrectForName(name, typeAction, newName);      
                if (json) {
                    this.elementsList[i].dataset.designActions = json;
                    isChange = true;
                    console.log(json);
                }      				

				if (isChange) {
					updateObject(this.elementsList[i], ELEMENT_TYPE_CLICKABLE_AREA);
				}	
			}
		}
		return false;
	}		
}

Canvas.prototype.setDefaultCanvasMargin = function() {
    this.setWorkspaceMargin(14, 15, 15, 92);  // 2par 60px
}
