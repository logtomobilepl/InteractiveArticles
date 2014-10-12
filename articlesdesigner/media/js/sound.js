

function Sound(file, callback, callbackEnd) {
    var instance = this;
    instance.element = new Audio();
    instance.loaded = false;
    
    instance.get = function(property) {
        return instance.element[property];
    };
    
    instance.set = function(property, value) {
        instance.element[property] = value;
    };
    
    instance.play = function() {
        instance.element.play();
    };
    
    instance.pause = function() {
        instance.element.pause();
    };
    
    instance.stop = function() {
        instance.pause();
        instance.currentTime = 0;
    };
    
    instance.load = function(file, callback, callbackEnd) {
        instance.loaded = false;
        
        var loadedHandler = function() {
            instance.loaded = true;
            instance.element.removeEventListener('canplaythrough', loadedHandler);
            
            if(callback) {
                callback.apply(instance);
            }
        };
        
        var endedHandler = function() {
            instance.element.removeEventListener('ended', endedHandler);
            instance.element.currentTime = 0;
            
            if(callbackEnd) {
                callbackEnd.apply(instance);
            }
        };        
        
        /*
         myAudio.addEventListener("ended", function() 
     {
          myAudio.currentTime = 0;
          alert("ended");
     });
         */
        
        instance.element.addEventListener('canplaythrough', loadedHandler);
        instance.element.addEventListener('ended', endedHandler);
        
        instance.element.src = file;
        instance.element.load();
    };
    
    if(file) {
        instance.load(file, callback, callbackEnd);
    }
}