
var ACTIONS_SHOW_ALERT = "show_alert";


function BrowserEmulatorDialogs() {    
    var that = this;
    this.idDialogShowImage = "emulator_dialog_show_image";    
    this.idDialogShowImageImg = "emulator_dialog_show_image_img";    
    this.idDialogInitiateConversation = "emulator_dialog_initiate_conversation";    
    this.idDialogInitiateConversationHtml = "emulator_dialog_initiate_conversation_html";    
    this.idDialogShowPopup = "emulator_dialog_show_popup";    
    this.idDialogShowPopupDescription = "emulator_dialog_show_popup_description";    
    this.idDialogShowAlert = "emulator_dialog_show_alert";    
    this.idDialogShowAlertText = "emulator_dialog_show_alert_text";    
     
    var optAlert = {},
        actionCallback = null;
     
    this.createDialogs = function() {        
        $("#"+this.idDialogShowImage).dialog({
            autoOpen: false,
            resizable: false,
            modal: true,
           // title: '<span class="title">CODE EDITOR</span>',                
            width: 600,
            height: 650, 
            buttons: {
                OK: function() { 
                    that.closeDialog(ACTIONS_SHOW_IMAGE);  
                },
            },            
            close: function( event, ui ) {             
            },
            open: function(event, ui) {                    
                $(this).siblings('div.ui-dialog-titlebar').remove();          
            },                     
        });
        
        $("#"+this.idDialogInitiateConversation).dialog({
            autoOpen: false,
            resizable: false,
            modal: true,
           // title: '<span class="title">CODE EDITOR</span>',                
            width: 600,
            height: 650, 
            buttons: {
                OK: function() { 
                    that.closeDialog(ACTIONS_INITIATE_CONVERSATION);  
                },
            },            
            close: function( event, ui ) {             
            },
            open: function(event, ui) {                    
                $(this).siblings('div.ui-dialog-titlebar').remove();          
            },                     
        });   
        
        $("#"+this.idDialogShowPopup).dialog({
            autoOpen: false,
            resizable: false,
            modal: true,
           // title: '<span class="title">CODE EDITOR</span>',                
            width: 500,
            height: 500, 
            buttons: {
                OK: function() { 
                    that.closeDialog(ACTIONS_SHOW_TPOPUP);  
                },
                "GoToBoard" : {
                   text: "Go to board",
                   id: that.idDialogShowPopup+"_gotoboard",
                   click: function(){
                       if (actionCallback && typeof actionCallback === "function") {
                           actionCallback();
                       }
                       that.closeDialog(ACTIONS_SHOW_TPOPUP);                       
                   }   
                }                 
            },            
            close: function( event, ui ) {             
            },
            open: function(event, ui) {   
                $(this).siblings('div.ui-dialog-titlebar').remove();                 
            },                     
        }); 
           
        $("#"+this.idDialogShowAlert).dialog({
            autoOpen: false,
            resizable: false,
            modal: true,
            width: 300,
            height: 300, 
            buttons: {
                OK: function() { 
					if (optAlert.listenerOKBtn && typeof optAlert.listenerOKBtn === "function") {
						if (optAlert.listenerOKBtn()) {
							that.closeDialog(ACTIONS_SHOW_ALERT);
						}
					} else {
						that.closeDialog(ACTIONS_SHOW_ALERT);
					}                    
                },
            },            
            close: function( event, ui ) {   
                if (optAlert && typeof optAlert.callbackClose === "function") {
                    optAlert.callbackClose();
					optAlert = {};
                }                            
            },
            open: function(event, ui) {   
                $(this).siblings('div.ui-dialog-titlebar').remove();                 
            },                     
        });                   
    }
         
    this.openDialog = function(type, options) {
        if (type == ACTIONS_SHOW_IMAGE) {
            if (options && options.image) {
                $("#"+this.idDialogShowImage).dialog("open");            
                $("#"+that.idDialogShowImageImg)[0].src = "";
                $("#"+that.idDialogShowImageImg)[0].src = options.image;
                $("#"+that.idDialogShowImageImg)[0].onload = function() {
                }
            }
        }  
        if (type == ACTIONS_INITIATE_CONVERSATION) {
             if (options && options.html) {
                $("#"+that.idDialogInitiateConversation).dialog("open");           
                $("#"+that.idDialogInitiateConversationHtml).html(options.html);
            }            
        }  
        if (type == ACTIONS_SHOW_TPOPUP) {
             if (options) {
                $("#"+that.idDialogShowPopup).dialog("open");
                if (options.title) {          
                    //$("#"+that.idDialogShowPopup).dialog("option","title","<span class='title'>"+options.title+"</span>");
                }
                options.description = (options.description)?options.description:"";
                if (options.onclick) {
                    $("#"+that.idDialogShowPopup+"_gotoboard").css("display", "inline-block");
                    actionCallback = function() {
                        goToBoard(options.onclick);
                    }
                } else {
                    $("#"+that.idDialogShowPopup+"_gotoboard").css("display", "none");
                    actionCallback = undefined;
                }
                
                //options.title = (options.title)?options.title:"";
                //options.title = "<h1>"+options.title+"</h1>";
                $("#"+that.idDialogShowPopupDescription).html("<div class='big_black_text'>"+options.description+"</div>");
            }            
        }   
        if (type == ACTIONS_SHOW_ALERT) {
             if (options) {
                optAlert = options;
                $("#"+that.idDialogShowAlert).dialog("open");
                $("#"+that.idDialogShowAlertText).html("<div class='big_black_text'>"+options.text+"</div>");
				
				//options.listener
				
            }            
        }                                 
    }   
                  
    this.closeDialog = function(type) {
        if (type == ACTIONS_SHOW_IMAGE) {
            $("#"+this.idDialogShowImage).dialog("close");
        }
        if (type == ACTIONS_INITIATE_CONVERSATION) {
            $("#"+this.idDialogInitiateConversation).dialog("close");
        }
        if (type == ACTIONS_SHOW_TPOPUP) {
            $("#"+this.idDialogShowPopup).dialog("close");
        }
        if (type == ACTIONS_SHOW_ALERT) {
            $("#"+this.idDialogShowAlert).dialog("close");
        }        
    }     
}
