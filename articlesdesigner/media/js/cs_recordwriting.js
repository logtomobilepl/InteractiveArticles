////////////////////
// RECORDWRITING

var KeyboardCode = {
    shift: 16,
    ctrl: 17,
    cursorUp: 38,
    cursorDown: 40,
    cursorLeft: 37,
    cursorRight: 39,
    backspace: 8,
    enter: 13,
    pageUp: 33,
    pageDown: 34,
    home: 36,
    end: 35
};

function RecordWriting(options) {
    var that = this,
        startDateMs = 0,
        nowDateMs = 0,
        isRunning = false,
        isDebug = false,
        events = (options && options.events)?options.events:{}, // events:  keyup, stop
        data = [], // [{type:String, keyCode: INT, letter: CHAR, absoluteMs: INT, lastMs: INT, specialKeys: {}},...],
        specialKeys = {
            shift: false,
            ctrl: false,
            cursorUp: false,
            cursorDown: false,
            cursorLeft: false,
            cursorRight: false,
            backspace: false,
            enter: false,
            pageUp: false,
            pageDown: false,
            home: false,
            end: false,
        };//,
        //dataKeys
        
    
    this.addEventListener = function(type, listener) {
        if (events && typeof listener === "function") {
            events[type] = listener;
        }
    }
    
    /*var beginObserver = function(ev) {        
        if (isRunning) {
            
            var isDown = false;
            if (ev.type == "keydown" || ev.type == "keyup") {
                if (ev.type == "keydown") {
                    isDown = true;
                } else if (ev.type == "keyup") {
                    isDown = false;
                } 
                specialKeys.shift = ev.shiftKey;                 
                if (ev.keyCode == KeyboardCode.ctrl) { specialKeys.ctrl = isDown; }
                if (ev.keyCode == KeyboardCode.cursorUp) { specialKeys.cursorUp = isDown; }
                if (ev.keyCode == KeyboardCode.cursorDown) { specialKeys.cursorDown = isDown; }
                if (ev.keyCode == KeyboardCode.cursorLeft) { specialKeys.cursorLeft = isDown; }
                if (ev.keyCode == KeyboardCode.cursorRight) { specialKeys.cursorRight = isDown; }
                if (ev.keyCode == KeyboardCode.backspace) { specialKeys.backspace = isDown; }
                if (ev.keyCode == KeyboardCode.enter) { specialKeys.enter = isDown; }
                if (ev.keyCode == KeyboardCode.pageUp) { specialKeys.pageUp = isDown; }
                if (ev.keyCode == KeyboardCode.pageDown) { specialKeys.pageDown = isDown; }
                if (ev.keyCode == KeyboardCode.home) { specialKeys.home = isDown; }
                if (ev.keyCode == KeyboardCode.end) { specialKeys.end = isDown; }
            } 
            
            nowDateMs = (new Date()).getTime();
            var dataKey = {
                type: ev.type,
                keyCode: ev.keyCode,
                letter: String.fromCharCode(ev.keyCode),
                absoluteMs: that.diffTimeMs(),
                lastMs: that.diffTimeMsFromLast(),
                specialKeys: $.extend(true,{},specialKeys)
            }                         
            data.push(dataKey);
            debug(dataKey);        
        }
        if (events && events.keyup && typeof events.keyup === "function") {
            events.keyup(dataKey, data);
        }
    }*/
    
    this.addKey = function(change) { // {change} - object from codeMirror
        if (isRunning) {
            nowDateMs = (new Date()).getTime();
            var keyData = {
                type: "change",
                change: change,
                absoluteMs: that.diffTimeMs(),
                lastMs: that.diffTimeMsFromLast(),
            };
            data.push(keyData);
            debug(keyData);
        }
    }    
    
    this.addSelection = function(selection) {
        if (isRunning) {
            nowDateMs = (new Date()).getTime();
            var selectionData = {
                type: "selection",
                selection: selection,
                absoluteMs: that.diffTimeMs(),
                lastMs: that.diffTimeMsFromLast(),
            };
            data.push(selectionData);
            debug(selectionData);
        }
    }

    this.addCursorPosition = function(cursorData) { // {pos: {line, ch}, tabData: {name, typeCode writingEnd}}
        if (isRunning) {
            nowDateMs = (new Date()).getTime();
            var cursorData = {
                type: "cursor",
                pos: cursorData.pos,
                tabData: cursorData.tabData,
                absoluteMs: that.diffTimeMs(),
                lastMs: that.diffTimeMsFromLast(),
            };
            data.push(cursorData);
            debug(cursorData);
        }
    }

    this.addChangeTab = function(tabData) { 
        if (isRunning) {
            nowDateMs = (new Date()).getTime();
            var tabData = {
                type: "changetab",
                tabData: tabData,   // {name, typeCode, withoutCursor}
                absoluteMs: that.diffTimeMs(),
                lastMs: that.diffTimeMsFromLast(),
            };
            data.push(tabData);
            debug(tabData);
        }
    }

    this.diffTimeMs = function() {
        return (nowDateMs - startDateMs);  
    }

    this.diffTimeMsFromLast = function() {
        var absoluteNow = that.diffTimeMs(); 
        var lastMs = (data.length > 0)?(absoluteNow - data[data.length-1].absoluteMs):absoluteNow;
        return lastMs;  
    }
    
    this.removeTimeLastMsToFirstKey = function() {
        //data = [], // [{type:String, keyCode: INT, letter: CHAR, absoluteMs: INT, lastMs: INT, specialKeys: {}},...],
        //var //indexFind = -1,
        //    diffMs = 0;
        for(var i=0; i < data.length; i++) {
            data[i].lastMs = 1; // everyting event to first key press set to 1ms
            if (data[i].type == "change" || data[i].type == "keypress" || data[i].type == "keyup" || data[i].type == "keydown") {
                return;
            }
        }
    }
    
    this.run = function() {    
        if (!isRunning) {
            startDateMs = (new Date()).getTime();
            
            //keyup|keydown (all keys) // keypress            
            //$(document).bind("keypress.recordObserver", beginObserver);
            //$(document).bind("keyup.recordObserver", beginObserver);
            //$(document).bind("keydown.recordObserver", beginObserver);
            isRunning = true;        
        }
    }     
    
    this.stop = function() {
        //$(document).unbind("keypress.recordObserver", beginObserver);
        //$(document).unbind("keyup.recordObserver", beginObserver);
        //$(document).unbind("keydown.recordObserver", beginObserver);
        isRunning = false;
        
        if (events && events.stop && typeof events.stop === "function") {
            events.stop(data);
        }
    }
    
        /*
         * var press = jQuery.Event("keypress");
            press.ctrlKey = false;
            press.which = 40;
             ... any other event properties ...
            $("whatever").trigger(press);
         */
    
    this.reset = function() {
        that.stop();
        data = [];
    }    
    
    this.getData = function() {
        return data;
    }
    
    this.isRecording = function() {
        return isRunning;
    }
    
    var debug = function(data) {
        if (isDebug) {
            console.log(JSON.stringify(data));
        }
    }
    
    
}

/*
 *   textBox.value = String.fromCharCode(charCode);
     if (charCode == 8) textBox.value = "backspace"; //  backspace
     if (charCode == 9) textBox.value = "tab"; //  tab
     if (charCode == 13) textBox.value = "enter"; //  enter
     if (charCode == 16) textBox.value = "shift"; //  shift
     if (charCode == 17) textBox.value = "ctrl"; //  ctrl
     if (charCode == 18) textBox.value = "alt"; //  alt
     if (charCode == 19) textBox.value = "pause/break"; //  pause/break
     if (charCode == 20) textBox.value = "caps lock"; //  caps lock
     if (charCode == 27) textBox.value = "escape"; //  escape
     if (charCode == 33) textBox.value = "page up"; // page up, to avoid displaying alternate character and confusing people             
     if (charCode == 34) textBox.value = "page down"; // page down
     if (charCode == 35) textBox.value = "end"; // end
     if (charCode == 36) textBox.value = "home"; // home
     if (charCode == 37) textBox.value = "left arrow"; // left arrow
     if (charCode == 38) textBox.value = "up arrow"; // up arrow
     if (charCode == 39) textBox.value = "right arrow"; // right arrow
     if (charCode == 40) textBox.value = "down arrow"; // down arrow
     if (charCode == 45) textBox.value = "insert"; // insert
     if (charCode == 46) textBox.value = "delete"; // delete
     if (charCode == 91) textBox.value = "left window"; // left window
     if (charCode == 92) textBox.value = "right window"; // right window
     if (charCode == 93) textBox.value = "select key"; // select key
     if (charCode == 96) textBox.value = "numpad 0"; // numpad 0
     if (charCode == 97) textBox.value = "numpad 1"; // numpad 1
     if (charCode == 98) textBox.value = "numpad 2"; // numpad 2
     if (charCode == 99) textBox.value = "numpad 3"; // numpad 3
     if (charCode == 100) textBox.value = "numpad 4"; // numpad 4
     if (charCode == 101) textBox.value = "numpad 5"; // numpad 5
     if (charCode == 102) textBox.value = "numpad 6"; // numpad 6
     if (charCode == 103) textBox.value = "numpad 7"; // numpad 7
     if (charCode == 104) textBox.value = "numpad 8"; // numpad 8
     if (charCode == 105) textBox.value = "numpad 9"; // numpad 9
     if (charCode == 106) textBox.value = "multiply"; // multiply
     if (charCode == 107) textBox.value = "add"; // add
     if (charCode == 109) textBox.value = "subtract"; // subtract
     if (charCode == 110) textBox.value = "decimal point"; // decimal point
     if (charCode == 111) textBox.value = "divide"; // divide
     if (charCode == 112) textBox.value = "F1"; // F1
     if (charCode == 113) textBox.value = "F2"; // F2
     if (charCode == 114) textBox.value = "F3"; // F3
     if (charCode == 115) textBox.value = "F4"; // F4
     if (charCode == 116) textBox.value = "F5"; // F5
     if (charCode == 117) textBox.value = "F6"; // F6
     if (charCode == 118) textBox.value = "F7"; // F7
     if (charCode == 119) textBox.value = "F8"; // F8
     if (charCode == 120) textBox.value = "F9"; // F9
     if (charCode == 121) textBox.value = "F10"; // F10
     if (charCode == 122) textBox.value = "F11"; // F11
     if (charCode == 123) textBox.value = "F12"; // F12
     if (charCode == 144) textBox.value = "num lock"; // num lock
     if (charCode == 145) textBox.value = "scroll lock"; // scroll lock
     if (charCode == 186) textBox.value = ";"; // semi-colon
     if (charCode == 187) textBox.value = "="; // equal-sign
     if (charCode == 188) textBox.value = ","; // comma
     if (charCode == 189) textBox.value = "-"; // dash
     if (charCode == 190) textBox.value = "."; // period
     if (charCode == 191) textBox.value = "/"; // forward slash
     if (charCode == 192) textBox.value = "`"; // grave accent
     if (charCode == 219) textBox.value = "["; // open bracket
     if (charCode == 220) textBox.value = "\\"; // back slash
     if (charCode == 221) textBox.value = "]"; // close bracket
     if (charCode == 222) textBox.value = "'"; // single quote
 */
