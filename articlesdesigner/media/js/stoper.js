////////////////////
// STOPER
// 


function Stoper(options) {
    var that = this
        ms = 0,
        timer = null,
        startDateMs = 0,
        nowDateMs = 0,
        isRunning = false,
        isPause = false,
        events = (options && options.events)?options.events:{}, //
        msLoopEvents = []; // {ms, listener} 
    
    this.addLoopEvents = function(id, ms, listener) {
        if (listener && typeof listener === "function") {
            msLoopEvents.push({
               id: id,
               ms: ms,
               listener: listener
            });
        }
    }
    

    this.start = function() {
        if (!isRunning) {
            if (!isPause) {
                startDateMs = (new Date()).getTime();
            }            
            isRunning = true;
            isPause = false;
            
            timer = window.setInterval(function() {
                nowDateMs = (new Date()).getTime();
                for(var i=0; i < msLoopEvents.length; i++) {
                    var loopEv = msLoopEvents[i];
                    if (nowDateMs > loopEv.ms+startDateMs) {
                        loopEv.listener(loopEv.id);
                    }
                }
            }, 20);
        }
    }

    this.reset = function() {
        if (isRunning) {
            that.stop();
            that.start();
        } 
    }
    
    this.pause = function() {
        isRunning = false;
        isPause = true;
        clearInterval(timer);
        timer = null;
    }
    
    this.stop = function() {
        isRunning = false;
        isPause = false;
        clearInterval(timer);
        timer = null;
    }
    
    this.getMs = function() {
        if (isRunning) {
            nowDateMs = (new Date()).getTime();
            return nowDateMs - startDateMs;
        } else {
            return -1; 
        }
    }
    
    this.isRunning = function() {
        return isRunning;
    }
    
}
