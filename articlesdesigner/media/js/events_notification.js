////////////////////
// EVENTS NOTIFACTION


var EventsNotification = {
    events: [],
    registry: function(type, listener) { // registry event
        if (listener && typeof listener === "function") {
            var ev = {
                type: type,
                listener: listener
            }
            this.events.push(ev);
        } else {
            console.log("Notifications: listener is not function");
        }
    },
    unregistry: function(type) { // unregistry first founded event with type        
        for(var i=this.events.length-1; i >= 0; i--) {
            var ev = this.events[i];
            if (ev.type == type) {
                this.events.splice(i, 1);
                break;
            }
        }
    },    
    exe: function(type, params, callbackResult) {
        for(var i=0; i < this.events.length; i++) {  // execute all events with type
            var ev = this.events[i];
            if (ev.type == type && ev.listener && typeof ev.listener === "function") {
                var result = ev.listener(params);                
                if (callbackResult && typeof callbackResult === "function") {
                    callbackResult(result);
                }
            }
        }
    }, 
}
