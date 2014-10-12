////////////////////
// CODE EDITOR Definitions

function CodeEditorDefinitions() {    
    
   this.createDefinitionObj = function() {
        var definitionObj = {
            newObject: false,   // true|false
            objectType: undefined,  // {ELEMENT_TYPE_CLICKABLE_AREA, ELEMENT_TYPE_LABEL , undefined - nie porpawna definicja  etc}
            codeType: undefined, // {STATEMENT_CODE_TYPE_EQUAL, STATEMENT_CODE_TYPE_NEW_CLICKABLE_AREA, STATEMENT_CODE_TYPE_NEW_TEXTFIELD etc}
            variable: undefined, // variable name ->  variable.parameter = value
            parameter: undefined, // {"name", "x", "y", "width", "height", "image", "visible", etc. }
            value: undefined, // value of parameter,
            lineNumber: -1
        };
        return definitionObj;
   }       
    
    this.areCorrectOfDefinitions = function(definitions) {
        for(var i=0; i < definitions.length; i++) {
            var definition = definitions[i];
            if (definition.objectType == ELEMENT_TYPE_CLICKABLE_AREA) {
                if (definition.codeType == STATEMENT_CODE_TYPE_NEW_CLICKABLE_AREA) {
                    if (!definition.variable.isCorrectVariable()) {
                        return false;
                    }                
                }
            }
            if (definition.objectType == ELEMENT_TYPE_TEXT) {
                if (definition.codeType == STATEMENT_CODE_TYPE_NEW_TEXTFIELD) {
                    if (!definition.variable.isCorrectVariable()) {
                        return false;
                    }                
                }
            }    
            if (definition.objectType == ELEMENT_TYPE_TEXTEDIT) {
                if (definition.codeType == STATEMENT_CODE_TYPE_NEW_TEXTEDIT) {
                    if (!definition.variable.isCorrectVariable()) {
                        return false;
                    }                
                }
            } 
            if (definition.objectType == ELEMENT_TYPE_BUTTON) {
                if (definition.codeType == STATEMENT_CODE_TYPE_NEW_BUTTON) {
                    if (!definition.variable.isCorrectVariable()) {
                        return false;
                    }                
                }
            }
            if (definition.objectType == ELEMENT_TYPE_IMAGE) {
                if (definition.codeType == STATEMENT_CODE_TYPE_NEW_IMAGE) {
                    if (!definition.variable.isCorrectVariable()) {
                        return false;
                    }                
                }
            }            
        }
        return true;
    }
    
    this.deleteObjectOnCanvasWithoutDefinitions = function(definitions) {
        var elementsList = canvas.getElementsList();
        for(var i=0; i < elementsList.length; i++) {
            
            if (elementsList[i].dataset.designScreenId == currentScreenId) {            
                var nameElement = elementsList[i].dataset.designName;
                var idElement = elementsList[i].dataset.designId;
                var typeElement = elementsList[i].dataset.designType;
                var isFind = false;
                
                for(var j=0; j < definitions.length; j++) {
                    var definition = definitions[j];
                    if (definition.codeType == STATEMENT_CODE_TYPE_NEW_CLICKABLE_AREA ||
                        definition.codeType == STATEMENT_CODE_TYPE_NEW_TEXTFIELD ||
                        definition.codeType == STATEMENT_CODE_TYPE_NEW_TEXTEDIT ||
                        definition.codeType == STATEMENT_CODE_TYPE_NEW_BUTTON ||
                        definition.codeType == STATEMENT_CODE_TYPE_NEW_IMAGE) {
                            if (nameElement == definition.variable) {
                               isFind = true; 
                               break;
                            } 
                        }                
                }
                
                if (isFind == false && typeElement && idElement) {
                    removeObject(elementsList[i], typeElement);
                } 
            }
        }
    }
            
    this.setObjectOnCanvasByDefinitions = function(definitions) {        
        var result = {
            isCorrect: true,
            errorLineNumber: -1,
            //name: "",
            //typeCode: ""
        }
        
        // array to pick up all founded changed parameters, to change it in one update 
        var objectsNameToUpdateParams = []; 
        function __localAddNewObject(element) {
            if (!isExistStringInArray(element, objectsNameToUpdateParams)) {
                objectsNameToUpdateParams.push(element);
            }             
        }        
        
        var objectsActions = [];  // [{ variable,  action = [{type,action,name}] }, (...)]
        function __localAddNewAction(variable, action) {
            var isWasAdded = false;
            for(var i=0; i < objectsActions.length; i++) {
                if (objectsActions[i].variable == variable) {
                    objectsActions[i].actions.push(action);
                    isWasAdded = true;
                }
            }
            if (!isWasAdded) {
                var objRes = {
                    actions: [],
                };
                objRes.variable = variable;
                objRes.actions.push(action);
                objectsActions.push(objRes);
            }
        }
        
        this.deleteObjectOnCanvasWithoutDefinitions(definitions);

        // update objects on canvas
        for(var i=0; i < definitions.length; i++) {
            var definition = definitions[i],
                elementActive = Editor.objectByName(definition.variable);
            
            var type = definition.objectType; // first search type for new created object
            if (!type) { // if not searched, maybe this object was created a moment ago
                type = (elementActive)?elementActive.type:undefined;
            }
            
            if (type == ELEMENT_TYPE_CLICKABLE_AREA || 
                type == ELEMENT_TYPE_TEXT || 
                type == ELEMENT_TYPE_TEXTEDIT ||
                type == ELEMENT_TYPE_BUTTON ||
                type == ELEMENT_TYPE_IMAGE) {
                
                if (definition.codeType == STATEMENT_CODE_TYPE_NEW_CLICKABLE_AREA ||
                    definition.codeType == STATEMENT_CODE_TYPE_NEW_TEXTFIELD ||
                    definition.codeType == STATEMENT_CODE_TYPE_NEW_TEXTEDIT ||
                    definition.codeType == STATEMENT_CODE_TYPE_NEW_BUTTON || 
                    definition.codeType == STATEMENT_CODE_TYPE_NEW_IMAGE) {
                        
                    var elementCanvas = canvas.getElementForName(definition.variable);
                    
                    if (!elementCanvas) {    
                         AJAX_ASYNC = false; // execute post performs each            
                         createObjectOnCanvas(type, {
                             x_pos: 0, 
                             y_pos: 0, 
                             width:0, 
                             height: 0, 
                             visible: 1, 
                             name: definition.variable,
                             callbacks: {
                                 updateInBase: function() {
                                     // UPDATED
                                 }
                             }
                             });                             
                         AJAX_ASYNC = true; // execute post performs each       
                    } else {
                        var element = (elementActive)?elementActive.getElement():null;
                        if (element) {
                            setStyleOfElement(element, {
                                //area_image: "",
                                //x_pos: 0,
                                //y_pos: 0,
                                //width: 0,
                                //height: 0,
                            });                            
                            __localAddNewObject(element);
                            // set empty for json actions                            
                            var tempActions = new Actions();                            
                            element.dataset.designActions =  tempActions.getByJSON();
                            // refresh active tree
                            if (activeElement && element == activeElement.elementSelected) {
                                actions.setByJSON(tempActions.getByJSON(), false);
                            } 
                        }                            
                    }                        
                }
                if (definition.codeType == STATEMENT_CODE_TYPE_EQUAL) {
                    var elementCanvas = canvas.getElementForName(definition.variable);
                    if (elementCanvas && elementCanvas.dataset.designScreenId == currentScreenId) {
                        var object = Editor.objectByName(definition.variable);
                        if (object && definition.parameter) {                      
                            var element = object.getElement();
           
                            if (!element || !element.dataset) {
                                continue;
                            }
                            
                            if (definition.parameter == "image" && element.dataset.designAreaImage != definition.value) {
                                setStyleOfElement(element, {area_image: definition.value});
                                __localAddNewObject(element);
                            }
                            if (definition.parameter == "background" && element.dataset.designBackgroundImage != definition.value) {
                                setStyleOfElement(element, {background_image: definition.value});
                                __localAddNewObject(element);
                            }
                            if (definition.parameter == "x" && element.dataset.designXPos != definition.value) {
                                setStyleOfElement(element, {x_pos: definition.value});
                                __localAddNewObject(element);
                            }
                            if (definition.parameter == "y" && element.dataset.designYPos != definition.value) {
                                setStyleOfElement(element, {y_pos: definition.value});
                                __localAddNewObject(element);
                            }         
                            if (definition.parameter == "width" && element.dataset.designWidth != definition.value) {
                                setStyleOfElement(element, {width: definition.value});
                                __localAddNewObject(element);
                            }                              
                            if (definition.parameter == "height" && element.dataset.designHeight != definition.value) {
                                setStyleOfElement(element, {height: definition.value});
                                __localAddNewObject(element);
                            }         
                            if (definition.parameter == "text" && element.dataset.designText != definition.value) {
                                setStyleOfElement(element, {text: definition.value});
                                __localAddNewObject(element);
                            }                                           
                            if (definition.parameter == "fontType" && element.dataset.designFontType != definition.value) {
                                setStyleOfElement(element, {font_type: definition.value});
                                __localAddNewObject(element);
                            }                                           
                            if (definition.parameter == "fontSize" && element.dataset.designFontSize != definition.value) {
                                setStyleOfElement(element, {font_size: definition.value});
                                __localAddNewObject(element);
                            }                                           
                            if (definition.parameter == "textColor" && element.dataset.designTextColor != definition.value) {
                                setStyleOfElement(element, {text_color: definition.value});
                                __localAddNewObject(element);
                            }                                                                                 
                            if (definition.parameter == "visible" && element.dataset.designVisible != definition.value) {
                                setStyleOfElement(element, {visible: definition.value});
                                __localAddNewObject(element);
                            }                              
                        }              
                    }
                }  
                if (definition.codeType == STATEMENT_CODE_TYPE_ACTION) {
                    __localAddNewAction(definition.variable, definition.action);   
                }
            } else {
                result.isCorrect = false;
                if (result.errorLineNumber < 0) {
                    result.errorLineNumber = definitions[i].lineNumber;
                    //result.name
                }
            }
        } // end of definitions loop

        // update objects actions
        for(var i=0; i < objectsActions.length; i++) {
            var objAct = objectsActions[i];
            if (objAct.variable) {
                var tempActions = new Actions();                
                for(var j=0; j < objAct.actions.length; j++) {
                    var _action = objAct.actions[j],
                        tempObjBoard = new BoardObjectAction();
                    tempObjBoard.actions = tempActions;                    
                    tempObjBoard.addAction(_action.type, {action:_action.action, name:_action.name, key:_action.key});
                    //updateActionsByTypeAction(_action.type, {action:_action.action, name:_action.name}, tempActions); 
                }
               
                var elementActive = Editor.objectByName(objAct.variable);
                if (elementActive && elementActive.getElement()) {
                    var element = elementActive.getElement();
                    element.dataset.designActions = tempActions.getByJSON();
                    __localAddNewObject(element); 
                    // refresh active tree
                    if (activeElement && element == activeElement.elementSelected) {
                        actions.setByJSON(tempActions.getByJSON(), false);
                    }                           
                    console.log("upd: "+element.dataset.designActions);
                }                
                
            }
        }
        
        //var objectsActions = [];  // [{ variable,  action = [{type,action,name}] }, (...)]
        
        // update objects in base
        for(var i=0; i < objectsNameToUpdateParams.length; i++) { 
            updateObject(objectsNameToUpdateParams[i], objectsNameToUpdateParams[i].dataset.designType);
        }
      
        return result;
    }
    
    this.getDefinitionsOfNewObject = function(statementCode) {        
        var code = statementCode;                       
        var codeWithoutVar = code.searchAndSubstring("var"),          
            definition = undefined;
        //codeWithoutVar = codeWithoutVar.searchAndSubstring("EMU.");
            
        var isCA = code.match(codeEditor.templates.regExpDeclarationNewClickableArea());// || code.match(codeEditor.templates.regExpEMUNewClickableArea());    
        var isLabel = code.match(codeEditor.templates.regExpDeclarationNewTextField());// || code.match(codeEditor.templates.regExpEMUNewTextField());    
        var isTE = code.match(codeEditor.templates.regExpDeclarationNewTextEdit());// || code.match(codeEditor.templates.regExpEMUNewTextEdit())    
        var isBtn = code.match(codeEditor.templates.regExpDeclarationNewButton());// || code.match(codeEditor.templates.regExpEMUNewButton());    
        var isImg = code.match(codeEditor.templates.regExpDeclarationNewImage());// || code.match(codeEditor.templates.regExpEMUNewButton());    
                                
        if ((isCA || isLabel || isTE || isBtn || isImg) && codeWithoutVar != code) {
            code = codeWithoutVar.trim();
            stat = code.split(" ");
            if (stat.length > 0) {
                var variable = stat[0].trim();                
                definition = { newObject:true, variable: variable, parameter: undefined, value: undefined  }
               
                if (isCA) {
                    definition.codeType = STATEMENT_CODE_TYPE_NEW_CLICKABLE_AREA;
                    definition.objectType = ELEMENT_TYPE_CLICKABLE_AREA;
                }
                if (isLabel) {
                    definition.codeType = STATEMENT_CODE_TYPE_NEW_TEXTFIELD;
                    definition.objectType = ELEMENT_TYPE_TEXT;
                }
                if (isTE) {
                    definition.codeType = STATEMENT_CODE_TYPE_NEW_TEXTEDIT;
                    definition.objectType = ELEMENT_TYPE_TEXTEDIT;                    
                }
                if (isBtn) {
                    definition.codeType = STATEMENT_CODE_TYPE_NEW_BUTTON;
                    definition.objectType = ELEMENT_TYPE_BUTTON;
                }
                if (isImg) {
                    definition.codeType = STATEMENT_CODE_TYPE_NEW_IMAGE;
                    definition.objectType = ELEMENT_TYPE_IMAGE;
                }                
            } 
        }
        return definition;
    }
    
    this.definitionsFromCode = function(_code) {    
        var statements = Editor.statements.statementFromCode(_code);    
        var definitions = new Array();  
        // definition form  { type:new|equal  variable  objectType:Clickable Area  parameter  value}
        
        for(var i=0; i < statements.length; i++) {
            var statement = statements[i];
            var code = statement.code;
            var stat;               
            
            var typeStatement =  Editor.statements.getStatementCodeType(code);
            
            var definitionAnyObject = this.getDefinitionsOfNewObject(code);                   
            if (definitionAnyObject) {
                definitionAnyObject.lineNumber = statement.lineNumber;
                definitionAnyObject.code = code;
                definitions.push(definitionAnyObject);
            } else if (typeStatement == STATEMENT_CODE_TYPE_EQUAL) { 
               var variable;
                var pararameter;
                var value; 
                var isEqual = false;
                
                var stat = code.split(".");
                if (stat.length > 1) {
                    variable = stat[0].trim();
                    stat.shift();
                    code = stat.join(".");
                    
                    stat = code.split("=");
                    if (stat.length > 1) {
                       parameter = stat[0].trim(); 
                       stat.shift();
                       code = stat.join("=");
    
                       stat = code.split(";");
                       stat[0] = stat[0].replaceAll("\""," ");
                       value = stat[0].trim();
                       isEqual = true
                    }
                }
               if (isEqual && variable && parameter && value) {
                    //console.log(variable+" "+parameter+" "+value);
                    definitions.push({
                        codeType: STATEMENT_CODE_TYPE_EQUAL,
                        variable: variable,
                        objectType: (Editor.objectByName(variable))?Editor.objectByName(variable).type:undefined,
                        parameter: parameter,
                        value: value,
                        lineNumber: statement.lineNumber,
                        code: code
                    });                
                }
            } else if (typeStatement == STATEMENT_CODE_TYPE_ACTION) {
                var variable;
                var stat = code.split(".");
                if (stat.length > 1) {
                    variable = stat[0].trim();
                }
                
                definitions.push({
                    codeType: STATEMENT_CODE_TYPE_ACTION,
                    variable: variable,
                    objectType: (Editor.objectByName(variable))?Editor.objectByName(variable).type:undefined,
                    lineNumber: statement.lineNumber,
                    code: code,
                    action: statement.action
                });
            } else {
                // undefined statement, probably error
                definitions.push({lineNumber: statement.lineNumber}); 
            }
        }
        return definitions;
    }    
    
}
