
var RESOURCES_TYPE_ALL = "all"
var RESOURCES_TYPE_IMAGES = "image"
var RESOURCES_TYPE_SOUNDS = "sound"

// callback from other iFrame, upload finished
function stopUpload(name,filename,success) {
    if (resourcesUpload[0] && resourcesUpload[0].name == name) {
        resourcesUpload[0].stopUpload(filename,success);
    } 
    if (resourcesUpload[1] && resourcesUpload[1].name == name) {
        resourcesUpload[1].stopUpload(filename,success);
    }     
}

////////////////////
// RESOURCES UPLOAD

var optionsDefaultResourcesUpload = {
    accept_file : "",
    type_data : RESOURCES_TYPE_IMAGES
} 

function ResourcesUpload(name,idParent, options) {
    var idDialogResources = "dialog_resources";
    var that = this;
    this.idParent = idParent;
    this.name = name;
    var listFilename = new Array();
    var uploadSuccess = -1;       
    
    this.buttonOK = "OK";
    this.callbackOK;
    this.focusedElement;
    this.canCroppedImage = false;
    
    if (options == undefined) {
        options = optionsDefaultResourcesUpload;
    }
    this.acceptFile = options.accept_file;
    this.typeData = options.type_data;
    
    var stringTextResult = function(success) {
        switch(success) {
            case 1: return '<span>The file was uploaded successfully!<\/span>';
            case 0: return  '<span>There was an error during file upload!<\/span>';
            default: return  '';
        }
    }
    
    this.resetButton = function() {
        var objButtons = {};
        $("#"+idDialogResources).dialog({         
            buttons: objButtons, 
        });            
    }      
    
    this.setButtonAndCallback = function(buttonName, buttonCallback) {
        this.buttonOK = buttonName;
        this.callbackOK = buttonCallback;
        var objButtons = {};
        objButtons[buttonName] = buttonCallback;
        console.log(objButtons);
        $("#"+idDialogResources).dialog({         
            buttons: objButtons, 
        });            
    }         
    
    this.setFocusedElement = function(elementName) {
        this.focusedElement = elementName;
    }  
    
    var contentUploadHtml = function() {   
        var upload_process = "upload_process_"+that.name;
        var upload_result = "upload_result_"+that.name;
        var upload_target = "upload_target_"+that.name;
        var upload_file = "upload_file_"+that.name;
        var upload_response = "upload_response_"+that.name;
        var form_upload_file = "form_upload_file_"+that.name;
        
        //getUploadedFilename
        //var response = "<script language='javascript' type='text/javascript'>window.top.window.stopUpload('"+that.name+"', '"+name+"',1);</script>";
        
        var content = "";
        content += '<p id="'+upload_process+'" class="upload_process">Loading...<br/><img src="'+pathSystem+'/media/img/loader.gif" /></p>';
        content += '<form id="'+form_upload_file+'" class="upload" action="'+pathSystem+'/uploadfile/" method="post" enctype="multipart/form-data" target="'+upload_target+'"  >';
        content += '<input id="'+upload_file+'" name="data" type="file" accept="'+that.acceptFile+'" style="color:black;" value="Choose the file" />';
        content += '<input name="loader_id" type="hidden" value="'+that.name+'" />';
        content += '<input name="type" type="hidden" value="'+that.typeData+'" />';
        content += '<input name="app_id" type="hidden" value="'+appId+'" />';
        content += '<input id="'+upload_response+'" name="response_type" type="hidden" value="javascript" />';
        content += '<p id="'+upload_result+'" style="margin:0px;padding:0px;color:green;"><strong>'+stringTextResult(uploadSuccess)+'</strong></p>';
        content += '</form>';
        content += '<iframe id="'+upload_target+'" name="'+upload_target+'" src="" style="width:0;height:0;border:0px;"></iframe>';
                              
        return content;
    }    
    
    this.refreshPreviewSetSizeImage = function(size) {
        $("#"+that.idParent+"_preview_data").append("<br /><strong>Dimension:</strong> "+size.width+" x "+size.height);        
    }
    
    this.refreshPreview = function(pathToFile) {
        var html = '<p class="dialog_section_title">Preview</p><p id="'+this.idParent+'_preview_data" style="color:black;"></p></p>';
        var fileInfo;
        var deleteUl;
        if(pathToFile) {
            fileInfo = new FileInfo(pathToFile);
            switch(that.typeData) {
                case RESOURCES_TYPE_IMAGES:                    
                    html += '<img src="'+pathToFile+'" style="max-width:270px;margin-top: 12px;"> ';                    
                    fileInfo.sizeOfImage(this.refreshPreviewSetSizeImage);
                    break;
                case RESOURCES_TYPE_SOUNDS: 
                    html += '<br /><audio controls><source src="'+pathToFile+'" /></audio>';
                    break;
            }
        }                
        $("#"+this.idParent+"_preview").html(html);

        if (pathToFile) {            
			var conversationLiClass = "conversation_property"; 
            deleteUl = document.createElement("ul");
            deleteUl.className = "menu";
			//deleteUl.style.width = 
            var propertyDelete = new Property(this.idParent+"_file_delete","image","");
            propertyDelete.srcImg = pathSystem+"/media/img/ditem_delete.png";
			propertyDelete.setClassName(conversationLiClass);
            propertyDelete.setTemplate(150, 0);
            propertyDelete.addAction(PROPERTY_ACTION_CLICK, that.callbackRemoveFile);			
						            
            deleteUl.appendChild(propertyDelete.getElement());
            $("#"+this.idParent+"_preview").append("<br /><br />");
            $("#"+this.idParent+"_preview").append(deleteUl);
            propertyDelete.refreshActions();            
        } 
        $("#"+this.idParent+"_preview").corner("");
        if (pathToFile && fileInfo) { 
            $("#"+that.idParent+"_preview_data").append("<br /><strong>Filename:</strong> "+($("#"+that.idParent+"_list").val())+"<br /><strong>Extension:</strong> "+fileInfo.getExtension());
        }
    }
    
    this.callbackRemoveFile = function(propertyObj) {
		var filename = $("#"+that.idParent+"_list").val();
		var message = "";
		var message1 = ''+globalChange.stringSystemIsAlreadyUsed()+' Are you sure you want to remove?';;
		var message2 = 'Are you sure you want to remove?'
		
		switch(that.typeData) {
			case RESOURCES_TYPE_IMAGES:                    
				if (globalChange.isExistsForName(filename,DELETED_ELEMENT_IMAGE)) {
					message = message1
				} else {
					message = message2;
				}
				break;
			case RESOURCES_TYPE_SOUNDS: 
				if (globalChange.isExistsForName(filename,DELETED_ELEMENT_SOUND)) {
					message = message1
				} else {
					message = message2;
				}
				break;
		}		
		messageDialog.showWithTwoButtons('<img src="'+pathSystem+'/media/img/library_title_icon.png" style="vertical-align:top;margin-top:6px;>" /> Library',message,"Remove","Cancel",that.removeFile);
    }
        
    this.removeFile = function() {
        var filename = $("#"+that.idParent+"_list").val();
        removeFile(that.typeData, filename);
        that.refreshPreview();
    }
   
    this.setFocusForFilename = function(filename) {
        if (filename) {
            $("#"+that.idParent+"_list").val(filename);
            this.changeSelect();
        }
    }   
    
    this.setFocusForFocusedElement = function() {
        console.log(this.focusedElement);
        this.setFocusForFilename(this.focusedElement);
    }      
        
    this.getIdList = function() {
        return ""+that.idParent+"_list";
    }
    
    this.getFocusedElement = function() {
        return $("#"+this.idParent+"_list");
    }    
    
    this.setListFilename = function(list) {
        listFilename = list;
        setSelectListByStringArray(list, that.getIdList());
    }
    
    this.cropImage = function(userInfo) {
        cropImage.setImageSrc(pathSystem+"/media/upload/"+appId+"/img/"+userInfo.filename,false, true);
        cropImage.callbackSaveCrop = function() {
            that.setFocusForFilename(userInfo.filename);
        }               
    }
    
    this.messageCroppedUploadedImage = function(filename) {
        messageDialog.showWithTwoButtons('<img src="'+pathSystem+'/media/img/library_title_icon.png" style="vertical-align:top;margin-top:6px;>" /> Library',"Are you want to crop the image '"+filename+"'?","Crop","Cancel",that.cropImage, false, {filename: filename});
    }
    
    this.changeSelect = function() {
        var val = $("#"+this.getIdList()).val();
        if (val) {
            var filename = $("#"+this.getIdList()).val();
            var fullPathToFile = pathSystem+"/media/upload/"+appId+"/";
            
            switch(that.typeData) {
                case RESOURCES_TYPE_IMAGES:
                    fullPathToFile += "img/";
                    break;
                case RESOURCES_TYPE_SOUNDS:
                    fullPathToFile += "sound/";
                    break;
            }
            
            fullPathToFile+=filename;        
            that.refreshPreview(fullPathToFile);
        }
    }
    
    this.contentUpload = function() {
        var html = contentUploadHtml(this.name);        
        $("#"+this.idParent).html(html);
        $("#"+this.idParent).parent().corner("");
        this.refreshPreview();
        

        var form_upload_file = "form_upload_file_"+that.name;
        $("#"+form_upload_file).submit(function() {
            console.log("preventDefault");
            return startUpload();
        });

        $("#upload_file_"+this.name).change(function() {
            var form_upload_file = "form_upload_file_"+that.name;
            //var upload_response = "upload_response_"+that.name;
            
            //var filename = getUploadedFilename();            
            //var responseValue = "<script language='javascript' type='text/javascript'>window.top.window.stopUpload('"+that.name+"', '"+filename+"',1);</script>";
            //$("#"+upload_response).val(responseValue);          
            
            $("#"+form_upload_file).submit();
        });
        
        $("#upload_file_"+this.name).click(function() {
            resetResultText(that.name);
        });
        $("#"+this.idParent+"_list").change(function() {
            that.changeSelect();
        });       
        var upload_file = "upload_file_"+that.name;
    } 
    
    this.contentUpload(); 
    
    var getUploadedFilename = function() {
        var upload_file = "upload_file_"+that.name;
        var filename = "";
        var file = $("#"+upload_file)[0].files[0];
        if (file && file.name) {
            filename = file.name;
        } 
        return filename;
    }
    
    var startUpload = function() {  
        var upload_process = "upload_process_"+that.name;
        var upload_result = "upload_result_"+that.name;    
        var uploadProcess = document.getElementById(upload_process);
        
        var filename = getUploadedFilename();
        var isOverwrite = isExistStringInArray(filename, listFilename)        
        
        if (filename) {
            if (!isOverwrite) {
                if (uploadProcess) {
                    uploadProcess.style.visibility = 'visible';
                    return true;
                }            
            } else {
                messageDialog.show("Upload file","The file already exists.");
                return false;
            }
        }
        else {
            messageDialog.show("Upload file","The first select the file to upload.");
            return false;
        }
    }
    
    this.stopUpload = function(filename,success){
        var upload_process = "upload_process_"+this.name;
        var upload_result = "upload_result_"+this.name;
        var upload_file = "upload_file_"+that.name;
        if (success == 1) {
            callbackUploadSuccessful(this.name,filename,this.typeData);
            uploadSuccess = success;
            $("#"+upload_result).html(stringTextResult(uploadSuccess));
            $("#"+upload_file).val("");   
            
            if (this.typeData == RESOURCES_TYPE_IMAGES && this.canCroppedImage) {
                this.messageCroppedUploadedImage(filename);
            }                     
        }             
        document.getElementById(upload_process).style.visibility = 'hidden';
        return true;
    }
   
    
    var resetResultText = function() {
        var upload_result = "upload_result_"+that.name;
        $("#"+upload_result).html("");
    }
    
    /* server side -> response
        <script language="javascript" type="text/javascript">
        window.top.window.stopUpload(<?php echo $result; ?>);
        </script>
    */                  
}

