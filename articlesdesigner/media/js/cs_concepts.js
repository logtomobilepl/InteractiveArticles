////////////////////
// CONCEPTS



function Concepts(options) { 
    var that = this,
        conceptsData = [],
        showConceptLearnt = (options && options.showConceptLearnt!=undefined)?options.showConceptLearnt:true,
        events = (options && options.events)?options.events:{}; // type: "close_concept_dialog"
        
    this.addEventListener = function(type, listener) {
        if (typeof events !== "object") {
            events = {};
        }
        if (typeof listener === "function") {
            events[type] = listener;
        }
    }        
        
    this.loadFromBase = function(lesson_id, callbackLoaded, callbackNotLoaded) {
        AjaxTutorial.ajaxGetConceptions({
            data: {
                lesson_id: lesson_id
            },
            success: function(resultJSON) {
                var objJSON = JSON.parse(resultJSON);
                conceptsData = objJSON.concepts;     
                callbackLoaded();           
            }, 
            error: function() {
                callbackNotLoaded();
            }
        });
    }

    this.showConcept = function() {      
        function clickConceptDialogOK() {
            if (events && events.close_concept_dialog && typeof events.close_concept_dialog === "function" ) {
                events.close_concept_dialog();
            }                       
        }                      
        if (showConceptLearnt && conceptsData && conceptsData.length > 0) {   
            var title = "";
            if (conceptsData.length == 1) {
                title += "New concept learnt in this lesson";
            } else if (conceptsData.length > 1) {
                title += "New concepts learnt in this lesson";
            }               
            var msgConcepts = new MessageDialog("conceptsDialog");
            msgConcepts.show(title, htmlConceptsList(), "OK", clickConceptDialogOK);
            msgConcepts.hideClose();
        } else {
            clickConceptDialogOK();
        }
    }
    
    var htmlConceptsList = function() {
        var result = "",
            templates = "<strong>%%TITLE%%</strong><br /><br />%%DESCRIPTION%%<br /><hr>";
               
        for(var i = 0; i < conceptsData.length; i++) {
            var data = conceptsData[i],
                copyTemp = templates;             
            copyTemp = copyTemp.replace("%%TITLE%%", Convert.specialCharsToHtml(data.title)); // data.content.title
            copyTemp = copyTemp.replace("%%DESCRIPTION%%", Convert.specialCharsToHtml(data.description)); //data.content.description
            result += copyTemp;
        }
        return result;
    }
    

}