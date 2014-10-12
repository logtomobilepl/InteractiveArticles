
var TipsFactory = { 
    generalTipOptions: {
        target: true,
        tipJoint: "top",      
        group: "lesson", 
        title: ""
    },    
    defaultTipOptions: {
        target: true,
        tipJoint: "top",
        background: "#ffffff",
        borderColor: "#000000", 
        borderWidth: 3, 
        hideTrigger: "closeButton",
        closeButtonLinkOverscan: 5,//0, 
        closeButtonCrossSize: 5, //0, 
        closeButtonCrossColor: "#000000", 
        closeButtonRadius: 8,//5,           
        group: "lesson", 
        showOn: null,
        stemLength: 12,
        stemBase: 14,
        containInViewport: false,
        title: ""
        //closeButtonOffset: [ 5, 5],
    },
    defaultTipData: {
        text: "",
        text2: "",
        hasPosition: false,
        position: {x: 0, y: 0},
        mp3: "",
        mp3Type: 0,   // 0 - none,  1 - microphone,  2 - file,  3 - empty sound (only writing)
        video: "",
        image: "",
        idNext: "id_tip_default_next_"+Generate.randomCharacters(16),
        nextHtml: "Next >>",
        playHtml: "",
        isShadowBackground: false,
        isNextEnabled: true,
        idMp3: "id_tip_default_play_"+Generate.randomCharacters(16), // id to click in button mp3                
        idPrefixText: "id_tip_default_prefixText_"+Generate.randomCharacters(16), // id to click in button mp3                
        autoNext: false, // this data is added: auto set next tip, after execute action
        
        codeOperationsRecordings: [],
        completionConditionParams: {
            type: "",
            id: "", 
            text:"",
            board: "",  // [board.Code, Board.Definitions, Main.Code] etc
            actionType: ""
        },
        completionConditionType: "",     
    },
    createCustomTip: function(triggerElement, settings, data) {
        // set before create instance
        if (data.hasPosition) {
            triggerElement = "#target_top_left";
            settings.stemLength = 0;
            settings.stemBase = 0;
        } else {
            settings.stemLength = TipsFactory.defaultTipOptions.stemLength;
            settings.stemBase = TipsFactory.defaultTipOptions.stemBase;
        }
        
        if (data.position) {
            if (!data.position.x || isNaN(data.position.x)) {
                data.position.x = 0;
            }
            if (!data.position.y || isNaN(data.position.y)) {
                data.position.y = 0;
            }        
            data.position.x = parseInt(data.position.x);
            data.position.y = parseInt(data.position.y);
            settings.offset = [ data.position.x, data.position.y];
        }
           
        // create instance
        var ot = new Opentip(triggerElement, settings),
            contentTip = '<div>';
            
        /*if (data.idPrefixText) {
            contentTip += '<span id="'+data.idPrefixText+'"></span> ';            
        }*/
                   
        if (data.text) {
            contentTip += data.text;
        }
        if (data.image) {
            contentTip += '<p style="margin-top:16px"><img id="" src="'+pathSystem+'/media/upload/tutorial/'+lessonId+'/'+data.image+'" style="padding: 6px;height: 100px;"></p>';
        }              
        if (data.video) {
            contentTip += '<p style="margin-top:16px;height:180px;"><video controls autoplay><source src="'+pathSystem+'/media/upload/tutorial/'+lessonId+'/'+data.video+'" type="video/mp4">Your browser does not support HTML5 video.</video></p>';
        }              
        if (data.text2) {
            contentTip += data.text2;
        }                
        if (data.playHtml && (data.mp3 || data.codeOperationsRecordings.length > 0)) {
            contentTip += '<p><div id="'+data.idMp3+'" class="ot-button">'+data.playHtml+'</div></p>';
        }
        if (data.nextHtml) {
            contentTip += '<p><div id="'+data.idNext+'" class="ot-button">'+data.nextHtml+'</div></p>';
        }
       
        contentTip += "</div>";
        ot.setContent(contentTip);
                               
        return ot;
    }
}


var SequencesTips = function(options) {

	if (!(this instanceof SequencesTips)) {
		return new this;
	}

	var that = this,
		name = "sequences_tips"+(new Date()).getTime(),
		tips = [],  // array of object  {tip: instance openTip, data: { idNext: "string" }}
		currentTip = 0,
		uniqueId = 0,
		tmpSound = null,
		isPlay = false,
		textDynamic = "",
		events = (options && options.events)?options.events:{}; // "tips_start"|"tips_next"|"tips_end"
	
	/*if (options) {
		if (options.group) {
			defaultTipOptions.group = options.group;
		}
	}*/
	
    var idLayerShadow = "layer_shadow";
    //$("#"+idLayerShadow).click(function() {
    //    that.stop();
    //});
    
    /*this.getDefaultTipOptions = function() {
        return $.extend(true,{},defaultTipOptions);
    }
    
    this.getDefaultTipData = function() {
        return $.extend(true,{},defaultTipData);
    } */   
    	    
    that.addEventListener = function(type, listener) {
        if (events && typeof listener === "function") {
            events[type] = listener;
        }
    }
    
    that.toJSON = function() {
       return JSON.strinify(tips);
    }
    
    that.fromJSON = function(JSON) {
       var objJSON = JSON.parse(JSON);
       if (objJSON) {
           that.fromObj(objJSON);
       }
    }    
    
    that.fromObj = function(obj, countBubblesOfLesson) {
       if (obj) {
          that.removeTips();
          for (var i=0; i < obj.length; i++) {
            obj[i].content = $.extend(true,{}, obj[i].content, { 
                bubble_id: obj[i].id, 
                order: obj[i].order, 
                bubbleType: obj[i].bubbleType,
                countBubble: countBubblesOfLesson,
                operation: "new"  // "new"|"refresh"
            });
            that.addTip(obj[i].content.trigger, obj[i].content );           
          }
       }
    }       
    
    // @options.tipOptions.target  -  default true (set tip with 1 parameter - triggerElement)
    // @options.tipOptions.title  - title tip 
    // @options.tipOptions.tipJoint - location joint (bottom right left top , can join: "bottom right")
    // my @options 
    // @options.tipData.text  - text (tip content)
    // @options.tipData.text2  - text (tip content2)
    // @options.tipData.nextHtml - set text of Button Next
    
    // @options.tipData.mp3 - filename mp3
    // @options.tipData.video - filename video 
    // @options.tipData.image - filename image
    // @index when put tip,  if undefined then put at the end
	that.addTip = function(triggerElement, options, index) {  
		if (options) {		
			uniqueId++;	
			
			/*
            if (options.tipData.hasPosition) {
                options.tipOptions.stemLength = 0;
                options.tipOptions.stemBase = 0;
            }
            if (options.tipData.position && options.tipData.position.x != undefined && options.tipData.position.y != undefined) {
                options.tipOptions.offset = [ options.tipData.position.x, options.tipData.position.y];
            }
            */
            if (options.operation == "new" && options.order != undefined && options.countBubble != undefined) { 
                options.countBubble = parseInt(options.countBubble);
                var titleWithStep = "("+(options.order+1)+"/"+options.countBubble+") "+options.tipOptions.title;
                options.tipOptions.title = titleWithStep;
            }
                          			
			var settings = $.extend({}, TipsFactory.defaultTipOptions, options.tipOptions),
			    tipData =  $.extend({}, TipsFactory.defaultTipData, options.tipData ),
				//ot = new Opentip(triggerElement, settings),				
				idNext = "ot_"+name+"_next_"+uniqueId,
				idMp3 = "ot_"+name+"_sound_"+uniqueId,
				idPrefixText = "ot_"+name+"_prefixText_"+uniqueId,
				contentTip = "";
			
			tipData.idNext = idNext;
            tipData.idMp3 = idMp3;
            tipData.idPrefixText = idPrefixText;
			
			var tip = {
			    trigger: triggerElement,
				//instance: ot,
				options: settings, // tipOptions extended
				data: tipData,
				bubble_id: options.bubble_id,
				order: options.order,
                bubbleType: options.bubbleType,
                countBubble: options.countBubble,
			};
			if (index != undefined && index < tips.length) {
			    tips.splice(index, 0, tip);
			} else { 
			    tips.push(tip); // put at the end
			}
		}
	}
	
	var removeTipAtIndex = function(index) {
	   if (index < tips.length) {
	       tips.splice(index, 1);
	   }
	}
	
	var refreshTip = function() {	    
	    if (currentTip < tips.length) {  
	        var tipData = tips[currentTip],
	            options = {
	                trigger: tipData.trigger,
	                bubble_id: tipData.bubble_id,
                    order: tipData.order,
                    bubbleType: tipData.bubbleType,
                    countBubble: tipData.countBubble,
                    tipOptions: tipData.options,
                    tipData: tipData.data,
                    operation: "refresh"
	            }
	        removeTipAtIndex(currentTip);
            that.addTip(options.trigger, options, currentTip );
	    }	    
	}

	var showTip = function() {
        if (currentTip < tips.length) {
            var tipData = tips[currentTip];
            if(tipData.instance) {
                tipData.instance.show();
            }            
            
            if (tipData.data.isShadowBackground) {
                that.showLayerShadow();
            } else {
                that.hideLayerShadow();
            }           
        }
	}
	
    var hideTip = function() {
        if (currentTip < tips.length) {
            var tipData = tips[currentTip];
            tipData.instance.show();
            that.setNextButtonEnabled(tipData.data.isNextEnabled);
            
            if (tipData.data.isShadowBackground) {
                that.showLayerShadow();
            } else {
                that.hideLayerShadow();
            }           
        }
    }	
    
    /*that.refreshTip = function() {
        hideTip();
        showTip();
    }*/
	
	that.setNextButtonEnabled = function(enabled) {
        if (currentTip < tips.length) {
            var tipData = tips[currentTip];  
            tipData.data.isNextEnabled = enabled;
            var $btn = $("#"+tipData.data.idNext);
            if (enabled) {
                $btn.removeClass("ot-btn_disabled");
                $btn.css("cursor","pointer");
            } else {
                $btn.addClass("ot-btn_disabled");
                $btn.css("cursor","not-allowed");
            }
        }   
	}
	
    that.setPlayButtonEnabled = function(enabled) {
        if (currentTip < tips.length) {
            var tipData = tips[currentTip];  
            var $btn = $("#"+tipData.data.idMp3);
            if (enabled) {
                $btn.removeClass("ot-btn_disabled");
                $btn.css("cursor","pointer");
            } else {
                $btn.addClass("ot-btn_disabled");
                $btn.css("cursor","not-allowed");
            }
        }   
    }	
    
    that.setPlayButtonName = function(name) {
        if (currentTip < tips.length) {
            var tipData = tips[currentTip]; 
            var $btn = $("#"+tipData.data.idMp3);
            $btn.text(name);
        }
    }    
	
	that.getCurrentTip = function() {
        if (currentTip < tips.length) {
            return  tips[currentTip];
        }  	    
	}
	
	/*that.start = function() {
		currentTip = 0;	
		showTip();
		eventTipsStart(); // exe event
	}*/
	

	
	that.nextTip = function() {
	    
	   textDynamic = "";
	   var uniqHelloWorld = "Hello world !"; 
	   if (isLessonHelloWorld()) {
    	   var lessonHello = codeEditor.manager.checkUniqueHelloWorldLesson(); 
    	   if (lessonHello && !lessonHello.success) {
    	       messageDialog.show("Info", lessonHello.message, "OK");
    	       return;
    	   } else {
    	       if (lessonHello.text != uniqHelloWorld) {
    	           textDynamic = "You did actually write \""+lessonHello.text+"\" text instead of \""+uniqHelloWorld+"\" but it's fine. Computer can display that as well.<br /><br />";
    	       }     	       
    	   }
	   }
	   
       function switchTip() {
           currentTip++;
            
           if (!adminEditor || (adminEditor && !adminEditor.startTutorial)) {
               AjaxTutorial.ajaxCompleteBubble({
                   data: {
                        user_id: userId,
                        bubble_id: tips[currentTip-1].bubble_id  // prev bubble
                   }, 
                   success: function() {
                   }
               });
           }
            
            if (currentTip < tips.length) {
               createTipsAndEvents();
               eventTipsNext(); // exe event
            } else {
                if (tips[tips.length-1].instance) {
                    tips[tips.length-1].instance.hide();
                }
                that.hideLayerShadow();
                eventTipsEnd(); // exe event                            
            }     
       }
	   
	   
        if (isLessonHelloWorldRun()) {
            that.setNextButtonEnabled(false);
            var animClick = new AnimClick();
            animClick.start("dialog_code_editor_compile", switchTip);
        } else {
            switchTip();
        }
	    
	}
	
	
    that.tryAutoNextTip = function() {
        if (currentTip < tips.length ) {
            if (tips[currentTip].data.autoNext) {
                that.nextTip();    
            }
        } 
    }	
		
	that.join = function() {
		createTipsAndEvents();
        /*if (tips.length > 0) {
            var tipData = tips[0];
            tipData.instance.hide();
        }   
        that.hideLayerShadow();*/
	}
	
	
    var showTipAfterInitialize = function() {
        
        var tipData = null,
            $nextBtn = null,
            $soundBtn = null;     
               
        if (currentTip >= tips.length) {
            return; 
        }
        
        tipData = tips[currentTip];
        console.log("showTipAfterInitialize open");  
        
        tipData.instance = TipsFactory.createCustomTip("#"+tipData.trigger, tipData.options, tipData.data);                             
        showTip();          
        that.setNextButtonEnabled(tipData.data.isNextEnabled);  
        codeEditor.clearSnapshot();
                                    
        $("#"+tipData.data.idNext).corner("");             
        $(".ot-close").click(function() {
           function callbackYes() {                           
               if (isContinueTutorial) {
                   window.location.assign(pathSystem+'/lessons/');
               }
               that.stop();
               eventTipsClose();                           
           }    
           if (adminEditor) { 
               adminEditor.stopTutorial();
           } else {
               messageDialog.showWithTwoButtons("Closing tutorial", "Do you want to quit lesson and return to the list of lessons?","Yes","No", callbackYes);    
           }
                              
        });             
        
        console.log("show "+currentTip+" (name:"+name+") ");
        
        $nextBtn = $("#"+tipData.data.idNext);
        $nextBtn.corner();
        $nextBtn.click(function(){
            if (tipData.data.isNextEnabled) {
                that.nextTip();
            }
        });
        
        $soundBtn = $("#"+tipData.data.idMp3);
        $soundBtn.corner(""); 
        
        function startAutowritingWithoutSound() {
            that.setPlayButtonEnabled(true);
            if (!isPlay) {
                that.setNextButtonEnabled(false);                        
                that.setPlayButtonName("STOP");
                isPlay = true;
    
                codeEditor.receiveFromSnapshotCode();                        
                codeEditor.writeInActiveCodeMirror(tipData.data.codeOperationsRecordings, null,  null, function(){
                    // stop
                    that.setPlayButtonName(tipData.data.playHtml);
                    that.setNextButtonEnabled(true);
                    codeEditor.setBlockedClosedForAllFile(false);
                    isPlay = false; 
                }, {isSound:false});
            } else {
                that.setPlayButtonName(tipData.data.playHtml);
                codeEditor.stopWriteInActiveCodeMirror();
                that.setNextButtonEnabled(false);
                codeEditor.receiveFromSnapshotCode();
                isPlay = false;
            }
        }
            
        function startAutowritingWithSound(){
            if (!isPlay) {
                 that.setPlayButtonEnabled(false);
                 $soundBtn.unbind("click", startAutowritingWithSound);
                 tmpSound = new Sound(pathSystem+"/media/upload/tutorial/"+lessonId+"/"+tipData.data.mp3, function() {
                    // play sound 
                    var soundInstance = this;                        
                    soundInstance.play();
                    //soundInstance.set('volume', 0.1);
                    //var duration = soundInstance.get('duration');
                        
                    that.setNextButtonEnabled(false);
                    that.setPlayButtonEnabled(true);
                    that.setPlayButtonName("STOP");
                    $soundBtn.bind("click", startAutowritingWithSound);                        
                    isPlay = true;
                    codeEditor.receiveFromSnapshotCode();
                    codeEditor.writeInActiveCodeMirror(tipData.data.codeOperationsRecordings, function(){ // run
                        soundInstance.play();    
                    }, function() { // pause from autowriting
                        soundInstance.pause();
                    });
                }, function(){ // stop sound
                    that.setPlayButtonEnabled(true);
                    that.setNextButtonEnabled(true);
                    codeEditor.setBlockedClosedForAllFile(false);
                    that.setPlayButtonName(tipData.data.playHtml);
                    isPlay = false;
                });                 
            } else {
                that.setPlayButtonName(tipData.data.playHtml);
                //$soundBtn.bind("click", startAutowritingWithSound);
                codeEditor.stopWriteInActiveCodeMirror();
                tmpSound.stop();
                
                codeEditor.receiveFromSnapshotCode();
                isPlay = false;
            }
        }           
        
        if (tipData.data.mp3Type && (tipData.data.mp3Type == 0 || tipData.data.mp3Type == 3)) {  
            $soundBtn.bind("click", startAutowritingWithoutSound);
        } else {
            $soundBtn.bind("click", startAutowritingWithSound);
        }                    
    }	

	
	var createTipsAndEvents = function() {
	    console.log("createTipsAndEvents");
	    function createTipsAndEventsTimer() {
	                	        	    
    		if (currentTip < tips.length) {
                var tipData = tips[currentTip];
    			        			        			
                codeEditor.setReadOnlyForAllFile(false); // default set allow to writing in code mirror
                
                if (tipData.bubbleType) {
                    
                    tipData.data.text = textDynamic+tipData.data.text;
                    
                    if (tipData.trigger == "dialog_code_editor_compile") {
                          codeEditor.openEditor();
                    }
                    
                    if (tipData.bubbleType == BubbleTypeList.emulator_normal ||
                        tipData.bubbleType == BubbleTypeList.emulator_fixed) {

                        codeEditor.startCompile();
                    
                    } else if (tipData.bubbleType == BubbleTypeList.code) {
                        codeEditor.openEditor();                                        
    
                        if (tipData.data.completionConditionType == SequencesSystemEvents.EVENT_WRITE_CODE &&
                            tipData.data.idPrefixText) { // after show tip, add dynamical content
    
                            codeEditor.setReadOnlyForAllFile(true);
    
                            var filename = tipData.data.completionConditionParams.board,
                                indexSearched = codeEditor.indexTabOfBoardName(filename);
                                indexNowOpened = codeEditor.getActiveTab();
                                //tabData = codeEditor.getTabDataByTabIndex(indexNowOpened);
                               
                            codeEditor.setReadOnlyForFile(filename, false);
                         
                            if (indexSearched != indexNowOpened) {                        
                                tipData.data.text = "<span class='tip_highlight'>Switch to "+tipData.data.completionConditionParams.board+".</span><br /><br />"+textDynamic+tipData.data.text;                    
                                refreshTip();
                                tipData = tips[currentTip];
                            }
                        } else if (tipData.data.completionConditionType == "") {
                            if (tipData.data.codeOperationsRecordings.length == 0) {
                                tipData.data.isNextEnabled = true;
                            }
                        }
                    }
                } 
                
                
               //---
                console.log("showTipAfterInitialize");     
                
                //showTipAfterInitialize();
                window.setTimeout(showTipAfterInitialize, 150);
    		}

		}
		window.setTimeout(createTipsAndEventsTimer, 100);
	}	
	
	that.stop = function() {
		for(var i=0; i < tips.length; i++) {
		    if (tips[i].instance) {
			    tips[i].instance.hide();
			}
		}
		that.hideLayerShadow();
	}	

	that.removeTips = function() {		
		that.stop();
		tips.length = 0;
	}
	

    that.showLayerShadow = function() {        
        $("#"+idLayerShadow).show(); //.css({"display":"block"});
    }
    
    that.hideLayerShadow = function() {
        $("#"+idLayerShadow).hide(); //("display","none");
    }
    
    that.countTips = function() {
        return tips.length;
    }
        
    var eventTipsStart = function() {
        if (events && typeof events.tips_start === "function") {
            events.tips_start();
        }
    }
    
    var eventTipsNext = function() {
        if (events && typeof events.tips_next === "function") {
            events.tips_next();
        }
    }
    
    var eventTipsClose = function() {
        if (events && typeof events.tips_close === "function") {
            events.tips_close();
        }
    }    
    
    var eventTipsEnd = function() {
        if (events && typeof events.tips_end === "function") {
            events.tips_end();
        }
    }
    
		
}	
	
 