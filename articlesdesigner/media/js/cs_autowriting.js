////////////////////
// AUTOWRITING

function AutowritingCodeMirror(options) {  //   codeMirror, text, typeWriting, dataKeys
    var that = this,
        autowriting = new Autowriting({
            text: (options && options.text)?options.text:"",
            typeWriting: options.typeWriting,
            dataKeys:  options.dataKeys,
            events: options.events
        }),
        codeMirror = (options && options.codeMirror)?options.codeMirror:null,
        codeEditor = (options && options.codeEditor)?options.codeEditor:null,
        posCursor = {line: 0, ch: 0},
        prevPosCursor = {line: 0, ch: 0},
        isSelection = false,
        selectionCursorStart = null,
        tabDataAll = null,
        isDebug = true,
        tabDataEndWriting = [];   //  [{tabData: {name:STRING, typeCode: STRING}, lineStart: INT, countLineEditor:INT}, {...}]
        //selectionCursorEnd = null;
    
    if (!options || !options.codeEditor) {
        alert("AutowritingCodeMirror: code editor is null");
        return that;
    }
    
    // pos = {line, ch}
    this.setCursorByCodeMirror = function(pos) { 
        if (codeMirror) {
            codeMirror.setCursor(pos);
            codeMirror.focus();
        } 
    }
    
    // pos = {line, ch}
    this.setCursorByRecord = function(pos) { 
        prevPosCursor = posCursor;
        posCursor = pos;
    } 
    
    
    this.drawAtEnd = function() {
    }
    
    var tryAddNewDataEndWriting = function(posCursor, tabData) {
        for(var i=0; i < tabDataEndWriting.length; i++) {
            var singleData = tabDataEndWriting[i];
            if (singleData.tabData.name == tabData.name && singleData.tabData.typeCode == tabData.typeCode &&
                tabData.writingEnd ) {
                return false;
            }
        }
        if (codeMirror && tabData && tabData.writingEnd) {
            
            var indexLastLine = codeMirror.lastLine();
            var lengthLastLine = codeMirror.getLine(codeMirror.lastLine()).length;
            if (lengthLastLine > 0) {
                var tmpPos = {line: indexLastLine, ch: lengthLastLine};
                codeMirror.replaceRange("\n", tmpPos, tmpPos);
            }
            
            tabDataEndWriting.push({
                tabData: {
                    name: tabData.name,
                    typeCode: tabData.typeCode,
                },
                lineStart:   posCursor.line,
                countLineEditor: codeMirror.lastLine(),
                offsetLine: (codeMirror.lastLine() - posCursor.line)
            });
            return true;
        }
    }
    
    var getOffsetActiveTab = function(tabData) {
        for(var i=0; i < tabDataEndWriting.length; i++) {
            var singleData = tabDataEndWriting[i];
            if (singleData.tabData.name == tabData.name && singleData.tabData.typeCode == tabData.typeCode) {
                return singleData.offsetLine;
            }
        }
        return 0;
    }
    
    var backCursorToBack = function(newCursor) {
       newCursor.ch--;
       if (newCursor.ch < 0) {
          newCursor.line--;
          if (newCursor.line < 0) {
              newCursor.line = 0;
              newCursor.ch = 0;
          } else {
              var line = codeMirror.getLine(newCursor.line);
              newCursor.ch = line.length;
          }
       }
       return newCursor;
    }
    
    this.run = function() {
        
        var offsetLineEndWriting = 0;
        
        autowriting.addEventListener("next_char", function(dataKey){
           var newCursor = {};
           $.extend(newCursor, posCursor);
           //var isSelection = false;           
                  
           //that.setCursorCodeMirror();
                 
           if (dataKey.type == "changetab") {
               
               var tabData = dataKey.tabData;
               codeEditor.addTab(tabData.name, tabData.typeCode, true);
               codeEditor.setBlockedClosedForAllFile(false);
               codeEditor.setBlockedClosedForFile(tabData.name+"."+tabData.typeCode,true);
               
               tabDataAll = codeEditor.findObjectOfTabsData([{search:"name", value:tabData.name},{search:"typeCode", value:tabData.typeCode}]);                                                         
               if (tabDataAll && tabDataAll.codeMirror) {               
                   codeMirror = tabDataAll.codeMirror;
                    //tryAddNewDataEndWriting({line: tabDataAll.codeMirror.lastLine() }, tabDataAll);
                    //offsetLineEndWriting = getOffsetActiveTab(tabDataAll);               
                   if (tabData.withoutCursor) {
                       codeEditor.addTab(tabData.name, tabData.typeCode);
                       codeMirror = tabDataAll.codeMirror;
                   } else { // animation of cursor 
                       
                        var tabDataActiveTab = codeEditor.getTabDataByTabIndex(codeEditor.getActiveTab());
                         // the same tab was opened so doesnt switch tab 
                        if (tabDataActiveTab && tabDataActiveTab == tabDataAll && tabDataActiveTab.codeMirror) {   
                            codeEditor.addTab(tabData.name, tabData.typeCode);
                            codeMirror = tabDataAll.codeMirror;
                        } else {                            
                           
                           // pause & animation switch tab
                            
                           autowriting.pause(); // pause writing before animation                       
                           
                           var leftTab = parseInt(tabDataAll.tab.offset().left.toFixed(0))+50;
                               topTab = parseInt(tabDataAll.tab.offset().top.toFixed(0))+20,
                               editorCursor = $("#editor_cursor"),
                               initialTop = parseInt(topTab)+80,
                               initialLeft = parseInt(leftTab);
        
                           editorCursor.css({"display": "block", "left": initialLeft+"px", "top": initialTop+"px"});
                           editorCursor.animate({
                               left: leftTab+"px",
                               top: topTab+"px",
                           }, 1200, "linear", function() {
                               
                              var $editorClick = $("#editor_click"); 
                              $editorClick.css({"display": "block", "left":(leftTab-20)+"px", "top": (topTab-20)+"px"});
    
                              tabDataAll.tab.effect( "highlight", {}, 400, function () {    
                                  setTimeout(function() {
                                    $( "#effect" ).removeAttr( "style" ).hide().fadeIn();
                                  }, 400 );
                                  $editorClick.css({"display": "none"});
                                  editorCursor.css({"display": "none"});
                                  codeEditor.addTab(tabData.name, tabData.typeCode);
                                  autowriting.run();
                               });
                           });
                       }
                   }
               }
           } else if (dataKey.type == "cursor") {
               newCursor = dataKey.pos;               
                  tryAddNewDataEndWriting(dataKey.pos, dataKey.tabData); 
                  offsetLineEndWriting = getOffsetActiveTab(dataKey.tabData);
               newCursor.line += offsetLineEndWriting;
               //that.setCursor(newCursor);
               
               that.setCursorByRecord(newCursor);
               //that.setCursorByCodeMirror(newCursor);
               
               debug(newCursor);
           } else if (dataKey.type == "keydown" || dataKey.type == "keyup") {
               if (dataKey.keyCode == KeyboardCode.shift) { 
                   if (dataKey.type == "keydown") { // isSelection
                       selectionCursorStart = newCursor;
                       isSelection = true;
                   } else if (dataKey.type == "keyup") {                       
                   } // isSelection
                   //isSelection = true;
               } else if (dataKey.keyCode == KeyboardCode.shift && dataKey.type == "keyup") {
                   //isSelection = true;                    
               } else if (dataKey.keyCode == KeyboardCode.cursorUp) {
                   if (dataKey.type == "keydown") { 
                       //newCursor.line--;
                   }
                   //isSelection = true;
               } else if (dataKey.keyCode == KeyboardCode.cursorDown) {
                   if (dataKey.type == "keydown") {
                       //newCursor.line++;
                   }
                   //isSelection = true;
               } else if (dataKey.keyCode == KeyboardCode.cursorLeft) {
                   if (dataKey.type == "keydown") {
                       //newCursor = backCursorToBack(newCursor);
                   }
                   //isSelection = true;
               } else if (dataKey.keyCode == KeyboardCode.cursorRight) {
                   if (dataKey.type == "keydown") { 
                      //newCursor.ch++;
                   }
                   //isSelection = true;
               } else if (dataKey.keyCode == KeyboardCode.backspace && dataKey.type == "keydown") {                   
                   //newCursor = backCursorToBack(newCursor);
                   codeMirror.replaceRange("", posCursor, prevPosCursor); 
               } else if (dataKey.keyCode == KeyboardCode.enter && dataKey.type == "keydown") {
                  //codeMirror.setCursor(prevPosCursor);
                  codeMirror.replaceRange("\n", prevPosCursor, prevPosCursor);
                  //newCursor.line++;
                  //newCursor.ch = 0;
               } else if (dataKey.keyCode == KeyboardCode.home) {
                  if (dataKey.type == "keydown") {
                  //    newCursor.ch = 0;
                  }
                  //isSelection = true;
               } else if (dataKey.keyCode == KeyboardCode.end) {
                  if (dataKey.type == "keydown") {
                  //    newCursor.ch = codeMirror.getLine(newCursor.line).length;
                  }
                  //isSelection = true;
               } else {
                   isSelection = false;
               }
               
           } else if (dataKey.type == "keypress" && codeMirror){
               codeMirror.replaceRange(dataKey.letter, newCursor, newCursor);
               debug(dataKey.letter);
               //newCursor.ch++;
           } else if (dataKey.type == "selection" && codeMirror && 
               dataKey.selection.anchor &&  // && dataKey.selection.anchor.xRel != undefined
               dataKey.selection.head){  //  && dataKey.selection.head.xRel != undefined
               
               if (offsetLineEndWriting) {
                   dataKey.selection.anchor.line += offsetLineEndWriting;    
                   dataKey.selection.head.line += offsetLineEndWriting;
               }    
               if (dataKey.selection.anchor.line == dataKey.selection.head.line && dataKey.selection.anchor.ch == dataKey.selection.head.ch) {
                   //codeMirror.setCursor(dataKey.selection.anchor);
                   that.setCursorByCodeMirror(newCursor);
               } else {
                   codeMirror.setSelection(dataKey.selection.anchor, dataKey.selection.head);
               }
               
               codeMirror.focus();
               debug(dataKey.selection);
               //newCursor.ch++;
           } else if (dataKey.type == "change" && codeMirror){
               var string = dataKey.change.text.join("\n");
               
               if (offsetLineEndWriting) {
                   dataKey.change.from.line += offsetLineEndWriting;
                   dataKey.change.to.line += offsetLineEndWriting;
               }
                            
               codeMirror.replaceRange(string, dataKey.change.from, dataKey.change.to); 
               //that.setCursorByCodeMirror(newCursor);
               
               debug(string);
               //newCursor.ch++;
           }           
           
           /*if (isSelection) {
               if (selectionCursorStart) {
                   codeMirror.setSelection(selectionCursorStart, newCursor);
               }             
           } else {
               selectionCursorStart = null;
           }*/        
           
           /* actual if (codeMirror && isSelection && selectionCursorStart) {
               codeMirror.setSelection(selectionCursorStart, newCursor);
           }*/
           
           
        });
        autowriting.run();
    }   
    
    this.stop = function() {
        // interrupt animation
        var $editorCursor = $("#editor_cursor"),
            $editorClick = $("#editor_click"); 
        if ($editorCursor) {
            $editorCursor.stop();
            $editorCursor.css({"display": "none"});
        }
        if ($editorClick) {
            $editorClick.css({"display": "none"});
        }
        if (tabDataAll && tabDataAll.tab) {
            tabDataAll.tab.stop();
        }
        autowriting.stop();        
    }    
    
    this.setEqualInterval = function(fast) {
        autowriting.setEqualInterval(fast);
    }     
    
    var debug = function(data) {
        if (isDebug) {
            console.log(data);
        }
    }    
}

function Autowriting(options) {
    var that = this,
        typeWriting = (options && options.typeWriting)?options.typeWriting:"text", // "text"|"keys"
        textToWriting = (options && options.text)?options.text:"",
        indexText = 0,
        countText = textToWriting.length,
        speed = (options && options.speed)?options.speed:100,  //ms
        timer = undefined,
        isRunning = false,
        events = (options && options.events)?options.events:{},  // events: "next_char"&"run"&"stop"&"pause"
        indexData = 0,
        dataKeys = (options && options.dataKeys)?options.dataKeys:[];
    
    this.addEventListener = function(type, listener) {
        if (events && typeof listener === "function") {
            events[type] = listener;
        }
    }
    
    this.setText = function(text) {
        textToWriting = text;
        countText = textToWriting.length;
    }
    
    this.setSpeed = function(_speed) {
        speed = _speed;
        if (isRunning) {
            this.run();
        }
    }
    
    this.setEqualInterval = function(fast) {
        var data = dataKeys[i],
            sumAbsoluteMs = 0,
            sumLastMs = 0,
            singleAbsoluteMs = 0,
            singleLastMs = 0;
        fast = fast || 1;
        if (dataKeys.length > 0) {
            for(var i=0; i < dataKeys.length; i++) {
                data = dataKeys[i];
                if (typeof data["absoluteMs"] !== "undefined" && typeof data["lastMs"] !== "undefined") {
                    sumAbsoluteMs += data.absoluteMs;
                    sumLastMs += data.lastMs;
                }
            }
            singleAbsoluteMs = sumAbsoluteMs / (dataKeys.length*fast);
            singleLastMs = sumLastMs / (dataKeys.length*fast);
            
            for(var i=0; i < dataKeys.length; i++) {
                dataKeys[i].absoluteMs = singleAbsoluteMs;
                dataKeys[i].lastMs = singleLastMs;
            }
        }
    }
    
    this.run = function() {
        
        if (typeWriting == "text") {        
            clearInterval(timer);
            
            timer = setInterval(function() {
                isRunning = true;
                
                if (indexText < countText) {
                    if (events && events.next_char && typeof events.next_char === "function") {
                        events.next_char(textToWriting[indexText]);
                    }                
                } else {
                    that.stop();
                }
                indexText++;
            }, speed);
        } else if (typeWriting == "keys") {
            if (indexData < dataKeys.length) {
                nextKey();
            }
        }
        // events
        if (typeWriting == "text" || typeWriting == "keys") {
            if (events && events.run && typeof events.run === "function") {
                events.run();
            }                        
        }        
    }
    
    var nextKey = function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            isRunning = true;
            if (indexData < dataKeys.length) {
                if (events && events.next_char && typeof events.next_char === "function") {
                    events.next_char(dataKeys[indexData]);
                }  
                indexData++;
                if (indexData >= dataKeys.length) {
                    that.stop();
                    return;
                }
                if (!isRunning) {
                    return;
                } 
                nextKey();        
            }          
        }, dataKeys[indexData].lastMs); 
    }
    
    var clearTimers = function() {
        if (typeWriting == "text") { 
            clearInterval(timer);
        } else if (typeWriting == "keys") { 
            clearTimeout(timer);
        }        
        isRunning = false; 
    }
    
    this.pause = function() {
        clearTimers();
        if (events && events.pause && typeof events.pause === "function") {
            events.pause();
        }
    }    
    
    this.stop = function() {
        clearTimers();
        indexText = 0; 
        indexData = 0;     
        if (events && events.stop && typeof events.stop === "function") {
            events.stop();
        }                   
    }
   
}
