////////////////////
// MESSAGE DIALOG
// 

function MessageDialog(idDialog) {
    var that = this;
    var qMessageDialog = $("#"+idDialog);    
    var userInfo = new Object();
    
    qMessageDialog.dialog({
      autoOpen: false,
      resizable: false,
	  width: 350,
      height:250,
      modal: true,
      dialogClass: "message_dialog"
    });
       
    this.setOptionsOfModal = function(options) {
        qMessageDialog.dialog(options);
    }
    
    this.hideClose = function() {
        qMessageDialog.parent().children().children('.ui-dialog-titlebar-close').hide();
    }
    
//    
	
	/*this.setDefaultSize = function() {
		this.setOptionsOfModal({height:180});
	}*/
	
    this.setPositionCenter = function() {
        qMessageDialog.dialog("widget").position({
           my: 'left',
           at: 'right',
           of: window
        });     
    }
    
    this.setPositionRight = function(pos) {
        qMessageDialog.dialog("widget").css(pos);  
    }
    
    this.showCustom = function(title, message, buttonsArray) {
        qMessageDialog.html(message);
        qMessageDialog.dialog({
            title: title,
            position: { my: 'center', at: 'center' }
        });        
        var objButtons = {};
                
        for(var i=0; i < buttonsArray.length; i++) {
            objButtons[buttonsArray[i].name] = buttonsArray[i].callback;
        }
        //console.log(objButtons);
        qMessageDialog.dialog({ buttons: objButtons });        
        qMessageDialog.dialog("open");
        qMessageDialog.css("z-index","999999");
    }
    
    this.show = function(title, message, btnName, callback, userInfo) {
        if (!btnName) {
            btnName = "OK";
        }
        var btn = { name: btnName, callback: function() { 
            if (typeof callback === "function") { callback(userInfo); } that.close(); } 
        };
        var buttonsArray = new Array(btn);
        that.showCustom(title, message, buttonsArray);      
    }    

    this.showWithTwoButtons = function(title, message, btnName1, btnName2, call1, call2, userInfo ) {
        if (!btnName1) {
            btnName1 = "OK";
        }
        if (!btnName2) {
            btnName2 = "Cancel";
        }
        var btn1 = { name: btnName1, callback: function() { 
            if (typeof call1 === "function") { call1(userInfo); }  that.close(); } 
        };
        var btn2 = { name: btnName2, callback: function() { 
            if (typeof call2 === "function") { call2(userInfo); }  that.close(); } 
        };
        var buttonsArray = new Array(btn1,btn2);        
        that.showCustom(title, message, buttonsArray);      
    }
       
    this.close = function() {
        qMessageDialog.dialog("close");
    }
}
