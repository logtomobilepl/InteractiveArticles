$(function(){        
    
    function ajaxSetLessonProgress(index) {
        var idContinue = "lesson_continue_"+lessons[index].lesson_id,
            idStartover = "lesson_startover_"+lessons[index].lesson_id,
            idStart = "lesson_start_"+lessons[index].lesson_id,
            idViewProgress = "lesson_viewprogress_"+lessons[index].lesson_id,
            idIndicator = "lesson_indicator_"+lessons[index].lesson_id;
            
        $("#"+idContinue).css({"display":"none"});
        $("#"+idStartover).css({"display":"none"});
        $("#"+idStart).css({"display":"none"});
        $("#"+idViewProgress).css({"display":"none"});
        
        
        /*AjaxTutorial.ajaxGetConceptions({
            data: {
                lesson_id: lessons[index].lesson_id
            },
            success: function(resultJSON) {
                var objJSON = JSON.parse(resultJSON);
                conceptsData = objJSON.concepts;     
                console.log(objJSON);
            }, 
            error: function() {
            }
        }); */       
        
        AjaxTutorial.ajaxGetConceptionsRequirements({
            data: {
                lesson_id: lessons[index].lesson_id,
                user_id: userId
            },
            success: function(resultJSON) {
                var objJSON = JSON.parse(resultJSON),
                    conceptsArray = objJSON.concepts_to_learn,
                    html = "",
                    lessonReq = $("#lesson_requirements_id_"+lessons[index].lesson_id);
                if (conceptsArray.length > 0) {
                    html += "It is recommended that you first run lessons that will teach you concepts required for the project.<br />"
                         +  "Concepts recommended to know before:<br /><br />";
                    for(var i=0; i < conceptsArray.length; i++) {
                        var conc = conceptsArray[i];                            
                        html += (i+1)+') '+conc.concept+'  <a href="/gamedesigner/startover/'+conc.lesson_id+'">Learn it!</a> <br />';
                        $("#lesson_start_"+lessons[index].lesson_id+" a span").html("Start lesson anyway");
                    }
                    lessonReq.html(html);
                } 
                                    
            }, 
            error: function() {
            }
        });             
        
        
        AjaxTutorial.ajaxGetLessonProgress({
            data: {
                user_id: userId,
                lesson_id: lessons[index].lesson_id 
            },
            success: function(resultJSON) {
                var idProgress = "lesson_progress_"+lessons[index].lesson_id,
                    jsonObj = JSON.parse(resultJSON),
                    result = jsonObj.progress.toString(),
                    countLearntConcept = jsonObj.concepts,
                    stringCountConceptLearnt = "";
                    
                console.log(JSON.stringify(jsonObj));    
                    
                if (countLearntConcept == 1) {
                    stringCountConceptLearnt += countLearntConcept+" concept learnt in this lesson.";
                } else if (countLearntConcept == 0 || countLearntConcept > 1) {
                    stringCountConceptLearnt += countLearntConcept+" concepts learnt in this lesson.";
                }    

                if (countLearntConcept > 0){
                    stringCountConceptLearnt += " <a href='/gamedesigner/progress/" + lessons[index].lesson_id + "/'>Show details</a>";
                }                            
                    
                $("#"+idIndicator).css({"display":"none"});
                                    
                if (result == "1") {
                    $("#"+idProgress).html("Lesson finished! ("+stringCountConceptLearnt+")");
                    $("#"+idStartover).css({"display":"block"});
                    $("#"+idViewProgress).css({"display":"block"});
                } else  {                        
                    var steps = result.split("/"),
                        step = 0,
                        countSteps = 0;
                    if (steps.length == 2) {
                        step = parseInt(steps[0]);
                        countSteps = parseInt(steps[1]); 
                        if (step == 0) {
                            $("#"+idProgress).text("Progress: "+result);  
                            $("#"+idContinue).css({"display":"none"});
                            $("#"+idStart).css({"display":"block"});
                        } else {
                            $("#"+idProgress).text("Progress: "+result); 
                            $("#"+idStartover).css({"display":"block"});
                            if (step == countSteps) {                                    
                                $("#"+idViewProgress).css({"display":"block"});
                            } else {
                                $("#"+idContinue).css({"display":"block"});
                            }
                        }
                    }
                    
                    
                }
            }
        });
    }
    
    function ajaxSetLessonStarted(index) {
        var idContinueOrStartOver = "lesson_continue_"+lessons[index].lesson_id,
            idStart = "lesson_start_"+lessons[index].lesson_id,
            idIndicator = "lesson_indicator_"+lessons[index].lesson_id;
            
        $("#"+idContinueOrStartOver).css({"display":"none"});
        $("#"+idStart).css({"display":"none"});
        AjaxTutorial.ajaxIsLessonStarted({
            data: {
                user_id: userId,
                lesson_id: lessons[index].lesson_id 
            },
            success: function(result) {                                        
                $("#"+idIndicator).css({"display":"none"});
                if (result == "1") {
                    // user finished one ore more bubble
                    $("#"+idContinueOrStartOver).css({"display":"block"});
                    $("#"+idStart).css({"display":"none"});
                } else {
                    // user not started lesson
                    $("#"+idContinueOrStartOver).css({"display":"none"});
                    $("#"+idStart).css({"display":"block"});    
                }
            }
        });
    }        
    
    function ajaxSetQuizPercent(index) {
        if (modules[index].is_quiz) {
            AjaxTutorial.ajaxQuizGetPercent({
                data: {
                    user_id: userId,
                    quiz_id: modules[index].quiz_id,
                },
                success: function(result_percent) {                                        
                    $("#quiz_percent_"+modules[index].quiz_id).html("Last result: "+result_percent+"%");
                }
            });
        }
    }
    
    // get first bubble of first lesson (for introduction)
    function ajaxGetFirstBubble(index, callback) {
        var mod = modules[index];
        if (mod.lessons.length > 0) {                
            AjaxTutorial.ajaxGetBubbles({
                data: {
                    lesson_id : mod.lessons[0].lesson_id,
                    from_order : 0,
                    user_id: userId,
                },
                success: function(resultJSON) {      
                    callback(resultJSON);
                }
            });
        }
    }                
    
    
    for(var i=0; i < lessons.length; i++) {                
        ajaxSetLessonProgress(i);
        //ajaxSetLessonStarted(i);
    }
    
    // get percent for modules
    for(var i=0; i < modules.length; i++) {                           
        ajaxSetQuizPercent(i);
    }
    
    // introduction
    for(var i=0; i < modules.length; i++) {
        var html = "",
            mod = modules[i];       
                 
        if (mod.is_introduction && mod.lessons.length > 0) {                
            ajaxGetFirstBubble(i, function(resultJSON) {
                
                resultJSON = Convert.specialCharsToHtml(resultJSON);
                var objJSON = JSON.parse(resultJSON),
                    bubbles = objJSON.bubbles;
                //console.log(JSON.stringify(bubbles));
                if (bubbles && bubbles.length > 0 && mod.lessons.length > 2) {
                    html += '<h2>Introduction</h2>';
                    html += bubbles[0].content.tipData.text+"<br />";
                    html += '<a href="/gamedesigner/startover/'+mod.lessons[1].lesson_id+'">Start first lesson</a><br />';                
                    html += '<a href="/gamedesigner/viewend/'+mod.lessons[mod.lessons.length-1].lesson_id+'">Start end lesson</a><br />';                
                    html += '<a href="/gamedesigner/viewemu/'+mod.lessons[mod.lessons.length-1].lesson_id+'">Start end lesson emulator</a><br />';
                    //html += 'is_start_finished '+mod.lessons[mod.lessons.length-1].is_start_finished;
                    
                    html += '<hr width="40%" align="left" />';
                    $("#module_introduction_"+mod.id).html(html);
                    $("#lesson_id_"+mod.lessons[0].lesson_id).remove();  
                       
                }                 
            });
        }
    }        
    
});