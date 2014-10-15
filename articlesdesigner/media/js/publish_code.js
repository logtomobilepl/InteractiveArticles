

function PublishCode() {
    this.PUBLISH_CAN_COPY = 1;    
    this.PUBLISH_CAN_RUN = 0;    
    var optionCanCopy = "can copy";
    var optionCanRun = "can run";    
    var that = this;
    var uniqueId = 0;
    var prefixElementList = "publish_element";
    this.idDialog = "publish_code";     
    this.idOpenDialog = "publish_code_open";
    this.idPublishName = "publish_code_name";
    this.idPublishSectionDisabled = "publish_section_private_disabled";
    this.idPublishAccessPublic = "publish_access_public";
    this.idPublishAccessPrivate = "publish_access_private";
    this.idPublishList = "publish_list";
    this.idChangeEditSection = "publish_change_edit";
    this.idChangeDoneSection = "publish_change_done";
    
    
    this.idInviteInputEmail = "publish_invite_somebody_email";
    this.idInviteSelectPrivileges = "publish_invite_somebody_privileges";
    this.idInviteSelectPrivilegesSelect = "publish_invite_somebody_privileges_select";
    this.idInviteBtnSave = "publish_invite_btn_save";
    this.idChangeBtnDone = "publish_change_btn_done";
   
    this.dataListPublish = []; // store data of one person =[{id:INT, email:STRING, sharedCode:STRING },{...}]
    var typeAccessPublish = "private";  //  "public"|"private"

    $("#"+this.idDialog).dialog({
        autoOpen: false,
        resizable: false,
        modal: true,
        title: '<span class="title">PUBLISH</span>',                
        width: 500, 
        height: 500, 
        buttons: {},            
        close: function( event, ui ) {                    
        },
        open: function(event, ui) {                                                             
        },                     
    });
    

    var createSelectPrivileges = function(id_privileges) {
        var selectHTML = '<select id="'+id_privileges+'" style="display:none;"><option value="'+that.PUBLISH_CAN_COPY+'" selected>'+optionCanCopy+'</option><option value="'+that.PUBLISH_CAN_RUN+'">'+optionCanRun+'</option></select>';
        return selectHTML;
    }    
    
    var tmpSelectHtml = createSelectPrivileges(that.idInviteSelectPrivilegesSelect);
    $("#"+that.idInviteSelectPrivileges).append(tmpSelectHtml);
    
    
    $("#"+this.idOpenDialog).click(function(){
        var isFind = false;
        EventsNotification.exe(SequencesSystemEvents.EVENT_CLICK_ELEMENT, {id: $(this)[0].id}, function(r){ if (r) isFind = true;}); if (!isFind) {Messages.tutorialWrong();return;}
        
        
        that.showDialog();        
    });   
    
    $("#"+this.idChangeBtnDone).click(function(){
        if (browserEmulator) {
            browserEmulator.clearAfterCompilation();
            if (codeEditor.canCompile()) {                 
                that.publish();
            } else {
                messageDialog.show("Publish", "Code is incorrect. ", "OK"); 
            }
            browserEmulator.clearAfterCompilation();
        }
    });    
    
    $("#"+this.idInviteBtnSave).click(function(){
        var emailToAdd = $("#"+that.idInviteInputEmail).val();
        var privileges = $("#"+that.idInviteSelectPrivilegesSelect).val();
        var existEmail = existEmailInList(emailToAdd);
        
        if (validateEmail(emailToAdd) && !existEmail) {
            that.addPublish(emailToAdd, privileges);
            $("#"+that.idInviteInputEmail).val("");
            //alert(privileges);
        } else {
            alert("Email is incorrect or duplicate.");
        }
    });
    
    $("#"+that.idPublishAccessPublic).click(function(){
        that.setAccessPublic();
    });
    
    $("#"+that.idPublishAccessPrivate).click(function(){
        that.setAccessPrivate();
    });    
    
    $("#"+this.idPublishList).scroll(function() {
        var scrollTop = $( this ).scrollTop();
        if (scrollTop > 0) {
            $( this ).css("border-top", "2px solid #ddd");
        } else {
            $( this ).css("border-top", "1px solid #ddd");
        }
    }); 
    
    var validateEmail = function(email) { 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }     
    
    this.showDialog = function() {
        $( "#"+this.idDialog ).dialog("open");
    }
    
    this.closeDialog = function() {
        $( "#"+this.idDialog ).dialog("close");
    }    
    
    this.setAccessPublic = function() {
        $("#"+that.idPublishSectionDisabled).css("display", "block");
        typeAccessPublish = "public";        
    }
    
    this.setAccessPrivate = function() {
       $("#"+that.idPublishSectionDisabled).css("display", "none"); 
       typeAccessPublish = "private";
    }
    this.setAccessPrivate(); // execute after created method
        
    var getId = function(string) {
        return parseInt(string.replace( /^\D+/g, ''));
    }
    
    var getDataPublishById = function(id) {
        for(var i=0; i < that.dataListPublish.length; i++) {
            if (that.dataListPublish[i].id == id) {
                return that.dataListPublish[i];
            }
        }
        return null;
    }
    
    var existEmailInList = function(email) {
        for(var i=0; i < that.dataListPublish.length; i++) {
            if (that.dataListPublish[i].email == email) {
                return true;
            }
        }
        return false;
    }    


    this.addPublish = function(email, sharedCode) {
        uniqueId++; 
        var id = prefixElementList+uniqueId,
            id_privileges = prefixElementList+uniqueId+"_privileges",
            id_remove = prefixElementList+uniqueId+"_remove";
        var htmlSelect = createSelectPrivileges(id_privileges);
        var templates = '<li id="'+id+'"><div style="float:left;width:360px;">'+email+'</div><div style="float:left;width:100px;">'+htmlSelect+'</div><div style="float:left;width:20px;"><span id="'+id_remove+'" style="cursor: pointer;">X</span></div></li>';
        $("#"+that.idPublishList).append(templates);                
        $("#"+id_privileges).val(sharedCode);  
        
        $("#"+id_privileges).change(function(){
            var idElement = getId($(this)[0].id);
            var element = getDataPublishById(idElement);
            
            if (element) {
                var _sharedCode = $(this).val();
                element.sharedCode = _sharedCode;
            }
            console.log(JSON.stringify(that.dataListPublish));
            
            //alert(idString+" "+_sharedCode+"  "+getId(idString)+" ");
        }); 
        
        $("#"+id_remove).click(function(){
            var idElement = getId($(this)[0].id);
            var element = getDataPublishById(idElement);
            var index = that.dataListPublish.indexOf(element);
            if (index > -1) {
                that.dataListPublish.splice(index, 1);
            }
            $("#"+prefixElementList+idElement).remove();
        });
                
        that.dataListPublish.push({
            id: uniqueId,
            nameId: id,
            email: email,
            sharedCode: sharedCode
        });
        
        
    }
    
    this.clearList = function() {
        $("#"+that.idPublishList).html("");  
        this.dataListPublish.length = 0;       
    }
    
    this.publish = function() {
        var publishName = $("#"+that.idPublishName).val();
        var clearWhenError = false;
        if (publishName) {
            if (that.dataListPublish.length > 0 || typeAccessPublish == "public") {
                    
                var releasePublish = 1; // release private (backup for some user)           
                if (typeAccessPublish == "public") {
                    releasePublish = 2; // release public (backup for all user)   
                }
                                
                copyApp(appId, userId, publishName, releasePublish, userId, {
                    async:true,
                    success: function(result) {
                        
                        var __app_id = result.id;
                        
                        addPublish(__app_id, publishName, (new Date()).toUTCString(), "1.0.0", {
                            success: function(result) {
                                var idPublish = result.id,
                                    sendAllEmail = true,
                                    idEmailsList = [];
                               
                                if (typeAccessPublish == "private") {                                
                                    for(var i=0; i < that.dataListPublish.length; i++) {
                                        var singlePublish = that.dataListPublish[i];
                                        addPublishEmail(idPublish, singlePublish.email, singlePublish.sharedCode, {
                                            async: false,  
                                            success: function(result) {
                                                idEmailsList.push(result.id);  
                                            },
                                            error: function() {
                                                sendAllEmail = false;
                                            }
                                        });
                                    }
                                }
            
                                if (sendAllEmail) {
                                    that.closeDialog();
                                    that.clearList();
                                    messageDialog.show("Publish", "Publication successful.", "OK"); 
                                } else {
                                                     
                                    messageDialog.show("Publish", "Publication unsuccessful.", "OK");
                                    // clear data from server
                                    for(var i=0; i < idEmailsList.length; i++) {
                                        var idEmail = idEmailsList[i];
                                        removePublishEmail(idEmail);
                                    }                            
                                    removePublish(idPublish);
                                    removeApp(__app_id);
                                }    
                            }, 
                            error: function(result) {
                                console.log("Can't add publish (name:"+publishName+")")
                            }
                        });                    

                    },
                    error: function() {
                        clearWhenError = true;
                    }
                });    
                       
                
             
            } else {                
                messageDialog.show("Publish", "First add some email.", "OK"); 
            }
        } else {
            messageDialog.show("Publish", "Name field is empty.", "OK");
            
        }
        
    }
    
    
    
    
}
