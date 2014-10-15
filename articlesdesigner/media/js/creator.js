////////////////////
// CREATOR
// + move & drag & drop & select items on canvas
// + global function

function setDraggableMenuItems(){
	$( ".menu_item" ).draggable({
		  stop: function( event, ui ) {
		  },
		  start: function( event, ui ){
			  console.log("Drag element type: "+this.id);
			  $(ui.helper).attr('id', this.id);
		  },
		  revert:true,
		  revertDuration: 0,
		  helper:"clone",
		  snap: "."+grid.getLineClass()
		});
	
}

function setEditables() {
	/*$('.editable_text').editable(function(value, settings) { 
        return value;
     }, 
     {
		type      : 'textarea',
     	cancel    : 'Cancel',
     	submit    : 'OK',
     	indicator : '<img src="../../media/img/indicator.gif">',
     	tooltip   : 'Click to change..',
        cols      : 40,
     	rows      : 3,
     	data: function(value, settings) {
			var retval = Convert.br2nl(value);
			return retval;
		},
		callback : function(value, settings) {
		    var retval = Convert.br2nl(value);                
            setStyleOfElement(activeElement.elementSelected, {text:retval,html_content:retval});
		    activeElement.updateElementInBase();
 			selectElement(activeElement.elementSelected);
 			console.log("setEditables - NEW VALUE: " + retval);
		}
	});*/
}

function defaultBackgroundOfCanvas() {
    return "";
    /*var defaultCanvas;
    if (orientation == "portrait") {
        defaultCanvas = "canvas720x1280.png";            
    } else {
        defaultCanvas = "canvas1280x720.png"; 
    }
    return "/media/img/"+defaultCanvas;*/    
}

function selectElement(element, onProperties, isFirstTimeOpen) {
    if (element) {
                
        if (activeElement) {	            
	       activeElement.setActiveForElement(element);
	    }
	    if (properties) {
	       properties.setInputValues(element);
	    }
	    if (onProperties) {
	       $( "#tabs" ).tabs({ active: 1 });
	       setSection(1);
	    }
	    if (actions && element.dataset && element.dataset.designIsActions == 1 && element.dataset.designEditActions == 1 && isFirstTimeOpen) {
	        actions.setByJSON(element.dataset.designActions, false);	            
	        element.dataset.designEditActions = 0;	        
	    }    	    
    }
}

function selectSwipegroup(element,onProperties) {
    if (swipegroups) {
        swipegroups.setInputValues(element);
    }
    if (onProperties) {
        $( "#tabs" ).tabs({ active: 1 });
    }    
}	

function openResourcesDialog(resourcesType) {//titleConfirm, callback) {       
    
   // if(!seqList.tryEnter("open_library")){return;}
   
    switch(resourcesType) {
        case RESOURCES_TYPE_IMAGES:
            $( "#tabs_resources" ).tabs({ disabled: [ 1 ], active: 0 });
            resourcesUpload[0].setFocusForFocusedElement();
            break;
        case RESOURCES_TYPE_SOUNDS:
            $( "#tabs_resources" ).tabs({ disabled: [ 0 ], active: 1  });
            resourcesUpload[1].setFocusForFocusedElement();
            break;
        default:
            resourcesUpload[0].resetButton();
            $( "#tabs_resources" ).tabs({ disabled: [ ], active: 0  });
            break;
    }
    $('#dialog_resources').dialog('open');
}
	
function setSection(section) {
    $("#menu_new_item").removeClass("selected");
    $("#menu_properties").removeClass("selected");
    $("#menu_elements_list").removeClass("selected");
    $("#menu_slide_background").removeClass("selected");
    
    $("#menu_new_item_section").css("display","none");
    $("#menu_properties_section").css("display","none");
    $("#menu_elements_list_section").css("display","none");
    $("#menu_slide_background_section").css("display","none");

    if (section == 0) {
        $("#menu_new_item").addClass("selected");
        $("#menu_new_item_section").css("display","block");
    } else if (section == 1) {
        $("#menu_properties").addClass("selected");
        $("#menu_properties_section").css("display","block");
    } else if (section == 2) {
        $("#menu_elements_list").addClass("selected");
        $("#menu_elements_list_section").css("display","block");
    }  else if (section == 3) {
        $("#menu_slide_background").addClass("selected");
        $("#menu_slide_background_section").css("display","block");
    } 
}

function setEventOfSection() {
    $("#menu_new_item").click(function(){
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}

        setSection(0);
    });
    $("#menu_properties").click(function(){
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}

        setSection(1);
    });
    $("#menu_elements_list").click(function(){
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}

        setSection(2);
    }); 
    $("#menu_slide_background").click(function(){
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}

        setSection(3);
    });    
}
