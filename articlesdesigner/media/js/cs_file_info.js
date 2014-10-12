////////////////////
// FILE INFO


function FileInfo(path) {
    this.path = path;
    
    this.setFilepath = function(path) {
        this.path = path;
    }
      
    this.getFilename = function() {
        if (this.path) {
            var array = this.path.split("/");
            if (array.length > 1) {
                return array[array.length-1];
            }
        }
        return "";
    }      
      
    this.getExtension = function() {
        if (this.path) {
            var array = this.path.split(".");
            if (array.length > 1) {
                return array[array.length-1];
            }
        }
        return "";
    }
    
    this.sizeOfImage = function(callbackFunction) {
        var size = { width: 0, height: 0 }
        if (isExistStringInArray(this.getExtension(),new Array("jpg","jpeg","png","gif","bmp"))) {
            var image = document.createElement("img");
            image.src = this.path;
            if (image) {
                image.onload = function() {
                    size.width = image.width;
                    size.height = image.height;
                    if (typeof callbackFunction === "function") {
                        callbackFunction(size);
                    }
                }        
            }
        } 
        return size;
    }
    
    // Convert dataURL to Blob object
    this.dataURLtoBlob = function(dataURL, type) {  //'image/png
          
      var extension = this.getExtension();
      if (!type && extension) {
          switch(extension) {
              case "image/png": type = extension; break;
              case "image/jpeg": type = extension; break;
              case "image/gif": type = extension; break;
              case "image/tiff": type = extension; break;
          }
      }
    
      var binary = atob(dataURL.split(',')[1]);
      var array = [];
      for(var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: type});
    }   
    
    this.sendDataURLToServer = function(url, dataURL, options, callback) {
        var file = this.dataURLtoBlob(dataURL);
        //var size= file.size;
        
        var fd = new FormData();        
        fd.append("data", file, this.getFilename());  
        fd.append("response_type", "OK");  
        console.log(this.getFilename());      
                           
        if (options) {
            if (options.type) {
                fd.append("type", options.type);
            }
            if (options.loader_id) {
                fd.append("loader_id", options.loader_id);
            }       
            if (options.user_id) {
                fd.append("user_id", options.user_id);
            }     
            if (options.app_id) {
                fd.append("app_id", options.app_id);
            }                               
        }    

        // And send it
        $.ajax({
           url: url,
           type: "POST",
           data: fd,
           processData: false,
           contentType: false,
        }).done(function(respond){
            if (typeof callback === "function") {
                callback();
            }
        });        
        
    }  
      
}
