////////////////////
// SEQUENCES SYSTEM

var SequencesSystemEvents = {
    EVENT_DROP_ELEMENT_ON_CANVAS: "drop_element_on_canvas",// params: {type: STRING}
    EVENT_CLICK_ELEMENT: "click_element",  // params: {id: STRING}
    EVENT_ADD_ACTION: "add_action",  // params: {actionType: STRING}
    EVENT_REMOVE_ACTION: "remove_action",  // params: {actionType: STRING}
    EVENT_CHANGE_PROPERTY: "change_property", // params: {id: STRING}
    EVENT_CHANGE_ELEMENT_TEXT: "change_element_text",  // params: {text: STRING}
    EVENT_SELECT_ELEMENT_ON_CANVAS: "select_element_on_canvas",  // params: {text: STRING}
    EVENT_WRITE_CODE: "write_code",  // params: {textarea: STRING}
    EVENT_CHANGE_BOARD: "change_board",  // params: {text: STRING}
}


function SequencesSystem(options) { 
    var that = this;
    that.bubbles = new SequencesTips();
    var sequenceActive = false, // if sequence is active
        concepts = new Concepts({
            showConceptLearnt: false,
            events: {
                close_concept_dialog: function() {
                    window.setTimeout(function() {messageLessonEnd();}, 500);                    
                }
            }
        }),
        events = (options && options.events)?options.events:{}; // 

    // REGISTER EVENTS
    EventsNotification.registry(SequencesSystemEvents.EVENT_DROP_ELEMENT_ON_CANVAS, function(params) { 
        if (!sequenceActive) {return true;}                
        var condition = that.getConditionTypeCurrentBubble();          
        if (condition && condition.type == SequencesSystemEvents.EVENT_DROP_ELEMENT_ON_CANVAS && 
            condition.params.type == params.type && !condition.params.completed) { 
            that.bubbles.setNextButtonEnabled(true);
            that.bubbles.tryAutoNextTip();               
            return true;
        } 
        return false;            
    });
    EventsNotification.registry(SequencesSystemEvents.EVENT_CHANGE_ELEMENT_TEXT, function(params) {
        if (!sequenceActive) {return true;}
        var condition = that.getConditionTypeCurrentBubble();          
        if (condition && condition.type == SequencesSystemEvents.EVENT_CHANGE_ELEMENT_TEXT && 
            (condition.params.text == params.text || condition.params.text == "") && !condition.params.completed) {                
            that.bubbles.setNextButtonEnabled(true);
            that.bubbles.tryAutoNextTip();               
            return true;
        } 
        return false;                 
    });
    EventsNotification.registry(SequencesSystemEvents.EVENT_ADD_ACTION, function(params) {
        if (!sequenceActive) {return true;}
        var condition = that.getConditionTypeCurrentBubble();          
        if (condition && condition.type == SequencesSystemEvents.EVENT_ADD_ACTION && 
            condition.params.actionType == params.actionType && !condition.params.completed) {                
            that.bubbles.setNextButtonEnabled(true);
            that.bubbles.tryAutoNextTip();               
            return true;
        } 
        return false;                 
    });
    EventsNotification.registry(SequencesSystemEvents.EVENT_REMOVE_ACTION, function(params) {
        if (!sequenceActive) {return true;}
        var condition = that.getConditionTypeCurrentBubble();          
        if (condition && condition.type == SequencesSystemEvents.EVENT_REMOVE_ACTION && 
            condition.params.actionType == params.actionType && !condition.params.completed) {                
            that.bubbles.setNextButtonEnabled(true);
            that.bubbles.tryAutoNextTip();               
            return true;
        } 
        return false;                 
    });    
    EventsNotification.registry(SequencesSystemEvents.EVENT_CHANGE_PROPERTY, function(params) {
        if (!sequenceActive) {return true;}
        var condition = that.getConditionTypeCurrentBubble();          
        if (condition && condition.type == SequencesSystemEvents.EVENT_CHANGE_PROPERTY && 
            condition.params.id == params.id && !condition.params.completed) {                
            that.bubbles.setNextButtonEnabled(true);
            that.bubbles.tryAutoNextTip();               
            return true;
        } 
        return false;                 
    });
    EventsNotification.registry(SequencesSystemEvents.EVENT_CLICK_ELEMENT, function(params) {
        if (!sequenceActive) {return true;}
        var condition = that.getConditionTypeCurrentBubble();          
        if (condition && condition.type == SequencesSystemEvents.EVENT_CLICK_ELEMENT && 
            condition.params.id == params.id && !condition.params.completed) {                
            that.bubbles.setNextButtonEnabled(true);
            that.bubbles.tryAutoNextTip();               
            return true;
        } 
        return false;                 
    });    
    EventsNotification.registry(SequencesSystemEvents.EVENT_SELECT_ELEMENT_ON_CANVAS, function(params) {
        if (!sequenceActive) {return true;}
        var condition = that.getConditionTypeCurrentBubble();          
        if (condition && condition.type == SequencesSystemEvents.EVENT_SELECT_ELEMENT_ON_CANVAS && 
            condition.params.text == params.text && !condition.params.completed) {                
            that.bubbles.setNextButtonEnabled(true);
            that.bubbles.tryAutoNextTip();               
            return true;
        } 
        return false;                 
    });  
    EventsNotification.registry(SequencesSystemEvents.EVENT_WRITE_CODE, function(params) {
        if (!sequenceActive) {return true;}
        var condition = that.getConditionTypeCurrentBubble();          
        if (condition && condition.type == SequencesSystemEvents.EVENT_WRITE_CODE && !condition.params.completed) {
            
            var createdText = params.textarea,
                modelText = condition.params.textarea;
            if (createdText && modelText) {
                createdText = createdText.replace(/[\s]*/g,"");
                createdText = createdText.replace(/[\n]*/g,"");
                modelText = modelText.replace(/[\s]*/g,"");
                modelText = modelText.replace(/[\n]*/g,"");
                
                var arraySplit = createdText.split(modelText);            
                
                if (arraySplit.length > 1 && arraySplit[1] == "") {                
                    that.bubbles.setNextButtonEnabled(true);
                    //that.bubbles.tryAutoNextTip();               
                    return true;
                }
            }
        } 
        return false;                 
    });       
    EventsNotification.registry(SequencesSystemEvents.EVENT_CHANGE_BOARD, function(params) {
        if (!sequenceActive) {return true;}
        var condition = that.getConditionTypeCurrentBubble();          
        if (condition && condition.type == SequencesSystemEvents.EVENT_CHANGE_BOARD && 
            (condition.params.text == params.text || condition.params.text == "") && !condition.params.completed) {                
            that.bubbles.setNextButtonEnabled(true);
            that.bubbles.tryAutoNextTip();               
            return true;
        } 
        return false;                 
    });
    
    
    
    this.addEventListener = function(type, listener) {
        if (typeof events !== "object") {
            events = {};
        }
        if (typeof listener === "function") {
            events[type] = listener;
        }
    }
    
    this.on = function() {
        sequenceActive = true;
    }
    this.off = function() {
        sequenceActive = false;
    }
    this.isSequenceActive = function() {
        return sequenceActive;
    }    

    var messageLessonEnd = function() {           
        var id_next_lesson = undefined;
        var btnBackToCode = { 
            name: "Back to code", 
            callback: function() {
                messageDialog.close();
            } 
        };
        var btnBackToLessonList = { 
            name: "Back to lessons list", 
            callback: function() {
                messageDialog.close();
                application.backToPrevious();                 
            } 
        };   
        var btnGoToNextLesson = { 
            name: "Go to next lesson", 
            callback: function() {
                
                messageDialog.close();
                window.location.assign(pathSystem+'/startover/'+id_next_lesson+'/');
            } 
        };    
        
        var buttonsArray = [btnBackToCode, btnBackToLessonList];
        
        if (lessonId){
            AjaxTutorial.ajaxGetIdNextLesson({
                async: false,
                data: {
                    lesson_id: lessonId
                },
                success: function(result){
                    id_next_lesson = parseInt(result);
                    if (!isNaN(id_next_lesson) && id_next_lesson > 0) {                        
                        buttonsArray.push(btnGoToNextLesson);
                    }
                }
            });
        }        
                      
        messageDialog.showCustom("Lesson", "Lesson has been completed.  What do you want to do now?", buttonsArray);                 
    }
    
    
    
    
    this.loadTutorial = function(lessonId, callbackLoaded) {    
        that.bubbles = new SequencesTips({group: "lesson"}); //"lesson"+lessonId+"_"+Generate.randomCharacters(16)});  
           
           
        function failedLoadedBubble() {
            messageDialog.show("Cannot loaded bubbles.", "Come back to lessons list.", "OK", function(){
                application.backToPrevious();
            });
        }
       
        function startLessonOrFailed(resultJSON, countBubblesOfLesson) {
            resultJSON = Convert.specialCharsToHtml(resultJSON);
            var objJSON = JSON.parse(resultJSON),
                bubbles = objJSON.bubbles;
            //console.log(JSON.stringify(bubbles));
            if (bubbles && bubbles.length > 0) {                       
                that.bubbles.fromObj(bubbles, countBubblesOfLesson);
                that.bubbles.join();
                
                if (callbackLoaded && typeof callbackLoaded === "function") {
                    callbackLoaded();
                }                        
                
                that.bubbles.addEventListener("tips_end", function() {
                    that.bubbles.removeTips();
                    sequenceActive = false;
                    //messageLessonEnd();
                    concepts.showConcept();
                });
                
                that.bubbles.addEventListener("tips_close", function() {
                    that.bubbles.removeTips();
                    sequenceActive = false;
                    //that.loadBubbles();
                });   
            } else {
                //that.off();
                //messageLessonEnd();
                concepts.showConcept();
            }            
        }       
       
        var optionsBubble = { //ajaxGetBubblesUser   ajaxGetBubbles
            async: false,
            data: {
                lesson_id : lessonId,
                from_order : 0,
                user_id: userId
            },
            success: function(resultJSON) { 
                
                AjaxTutorial.ajaxCountBubbles({
                    async: false,
                    data: {
                        lesson_id: lessonId
                    },
                    success: function(countBubblesOfLesson) {
                        startLessonOrFailed(resultJSON, countBubblesOfLesson);
                        isSuccessLoadBubbles = true;
                    },
                    error: function() {
                        failedLoadedBubble();
                    }
                });
            },
            error: function() {
                failedLoadedBubble();
            }
        };
       
       
        function conceptLoaded() {
            if (adminEditor) {
                AjaxTutorial.ajaxGetBubbles(optionsBubble);
            } else {
                AjaxTutorial.ajaxGetBubblesUser(optionsBubble);
            }
        }
       
        concepts.loadFromBase(lessonId, conceptLoaded, function() {
            failedLoadedBubble();
        });           
      
        
    }   
    
    this.startBubbles = function() {
        if (!sequenceActive && that.bubbles && that.bubbles.countTips() > 0) {           
            //that.bubbles.start();
            sequenceActive = true;
        }   
    }    
    
    /*this.stopBubbles = function() {
        if (sequenceActive) {           
            that.bubbles.removeTips();
        }   
    } */   
    
    that.getConditionTypeCurrentBubble = function() {
        var currentTip = that.bubbles.getCurrentTip();
        if (currentTip && currentTip.data.completionConditionParams && currentTip.data.completionConditionType) {
                return {
                    type: currentTip.data.completionConditionType, 
                    params: currentTip.data.completionConditionParams,
                    completed: currentTip.data.isNextEnabled
                };
            }     
    }

}


/*
if(!seqList.tryEnter("open_emulator")){return;}
}
 */


