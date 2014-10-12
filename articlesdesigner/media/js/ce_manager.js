////////////////////
// CODE EDITOR Manager

var EMUdefault = {
    listVars: [],  // list of founded variables
    addedInfo: [],
    infoEmu: {
        step: 0 
    }
    /*getNameOfVariableForObject: function(variable) {
        for(key in this) {
            if (variable == this[key]) {
               return key;
            }        
        }
        return undefined;
    },
    getVariableNamesList: function() {
        var result = [];
        for(key in this) {
            result.push(key);      
        }
        return result;        
    }*/
}
var prefixEMU = "EMU", // prefiks dla struktur danych uzywanych do debugowania 
    EMU = {}; // globalny obiekt do przechowywania danych kompilacji dla trybu debugowania

// stany kompilacji
var COMPILATION_STATUS_NONE = 0;
var COMPILATION_STATUS_BEGIN = 1;
var COMPILATION_STATUS_GENERATED_CODE = 2;
var COMPILATION_STATUS_USER_CODE = 3;
var COMPILATION_STATUS_DONE = 4;
var COMPILATION_STATUS_ERROR = 5;

function CodeEditorManager(parent) {
    var that = this;
    
    // arrayCodes przechowuje kody dotyczace poszczegolnych boardow (i kodu bez boardow np. 'main.Code').
    // Struktura danych to tablica. 
    // Kazdy element tablicy to jeden board, ew kod zbudowany z pliku.
    // Jesli elementem jest board, to przechowuje informacje o bordzie, jak: nazwa, ciagly kod definicji i kodu
     // Po kompilacji dochodza 2 pola do elementu. Sa to statement'sy (dla definicji i kodu) czyli tablica kolejnych operacji wykonywanych po sobie dla kompilatora
    // --------------------------------
    // Struktura pojedynczego elementu:
    // codeOfSingleBoard =  {board (object board), boardName (string with board nName), code (string with Code), definitions (string With Definition), statementsCode, statementsDef (array created after compile), }
    var arrayCodes = [];         
    
    this.compileProgress = 0;
    this.compileProgressMax = 100;
    var parent = parent;
    this.numberLineError = -1;
    this.boardNameError = "";
    this.boardExtensionError = "";
    this.requireStepByStep = false;  // is compile require step by step (by command: console.read(X))

    this.compilationStatus = COMPILATION_STATUS_NONE;
    var callbacks = {
        success: undefined,
        failed: undefined,
        log: undefined         
    }
    
    this.setCodes = function(updateArrayCodes) { // to code Editor
        arrayCodes = updateArrayCodes;
    }    
    
    /*
    this.generateCode = function() {
        var codeToAdd = "";  
        codeToAdd += generateObjectsToEditor();
        return codeToAdd;
    }
    
    var generateConstToEditor = function() {
        var codeToAdd = "";
        //codeToAdd += "// Constant program \n";
        codeToAdd += "var BOARD_SIZE_WIDTH = "+BOARD_SIZE_WIDTH+"; \n";
        codeToAdd += "var BOARD_SIZE_HEIGHT = "+BOARD_SIZE_HEIGHT+"; \n";
        codeToAdd += "\n";
        return codeToAdd;
    }
    
    var generateBoardToEditor = function() {
        var codeToAdd = "";
        codeToAdd += "board.panelItems = "+Editor.board.panelItems+"; \n";
        codeToAdd += "\n";
        return codeToAdd;
    }
    */
    
    this.generateActions = function(sysName, onclickJSON) {
        var codeToAdd = "";
        var isAddNewLine = false;
        
        var tempActions = new Actions();
        tempActions.setByJSON(onclickJSON, true); 
        var allActionsList = tempActions.getActionsList();
        if (allActionsList) {
            for(var iA=0; iA < allActionsList.length; iA++) {  
                var tAction = allActionsList[iA]; 

                if (tAction.parent && (tAction.parent.type == ACTIONS_ONCLICK || tAction.parent.type == ACTIONS_ONDROP)) {
                    var aParentType = tAction.parent.type; 
                    if (tAction.parent.type == ACTIONS_ONCLICK) { 
                        
                        if (isAddNewLine) {
                            codeToAdd += "\n";
                        }
                        isAddNewLine = true;
                         
                        var aType = Editor.mappingActionEditorToEmulator(tAction.type);
                        var aName;
                        var keyString = "";
                        if (tAction.key) {
                            keyString += ", key: \""+tAction.key+"\" ";
                        }
                        
                        if (tAction.type == ACTIONS_SHOW_IMAGE) {
                           aName = tAction.pImage; 
                        } else if (tAction.type == ACTIONS_INITIATE_CONVERSATION) {
                           aName = tAction.pName; 
                        } else {    
                           aName = tAction.name;
                        }   
                        if (tAction.type == ACTIONS_STOP_MP3) {
                            codeToAdd += sysName+".addAction(\""+aParentType+"\", {action: \""+aType+"\""+keyString+"});";
                        } else {              
                            codeToAdd += sysName+".addAction(\""+aParentType+"\", {action: \""+aType+"\", name: \""+aName+"\""+keyString+"});";
                        }
                    }
                    if (tAction.parent.type == ACTIONS_ONDROP) {
                        var aName = tAction.pItemName;
                        codeToAdd += sysName+".addAction(\""+aParentType+"\", {name: \""+aName+"\""+keyString+"});";
                    }
                }
            }
        }
             
        return codeToAdd;       
    }

    var codesForBoardName = function(boardName) {
        var _screen = objectFromParamAndValue(application.screenObjectList, "id", boardName),
            _board = objectFromParamAndValue(application.boardsList, "id", _screen.id),
            _codesObj = objectFromParamAndValue(application.screen_id, "id", _screen.id),
            codes = [];
        if(_screen && _board && _codesObj && _screen.name) {
            var correctNameVar = _screen.name.correctVariable("_");
            codes.push({instance: _codesObj.generated_code });
            codes.push({instance: _codesObj.user_code });
            codes.push({code: "var "+correctNameVar+" = new Board(boardOptions);" });
            codes.push({code: correctNameVar+".name = \""+correctNameVar+"\";" });           
            codes.push({code: correctNameVar+".screenId = "+_board.screen_id+";" });
            codes.push({code: correctNameVar+".background = \""+_board.background+"\";" });
            codes.push({code: correctNameVar+".sound = \""+_board.sound+"\";" });
            codes.push({code: correctNameVar+".panelItems = "+_board.panel_items+";" });   
        }  
        return codes;      
    }    

    var codesToGeneratedGlobalBoards = function() {
        var codes = new Array();        
        for(var i=0; i<application.boardsList.length; i++) {            
            var board = application.boardsList[i];
            var codesObj = objectFromParamAndValue(application.codes, "screen_id", board.screen_id);
            var screens = objectFromParamAndValue(application.screenObjectList, "id", board.screen_id);
            
            if (board && codesObj && screens && screens.name) {
                var correctNameVar = screens.name.correctVariable("_");
                codes.push({isNew: true });
                codes.push({instance: codesObj.generated_code });
                codes.push({instance: codesObj.user_code });                
                codes.push({code: "var "+correctNameVar+" = new Board(boardOptions);", created: true });
                codes.push({code: correctNameVar+".name = \""+correctNameVar+"\";" });           
                codes.push({code: correctNameVar+".screenId = "+board.screen_id+";" });
                codes.push({code: correctNameVar+".background = \""+board.background+"\";" });
                codes.push({code: correctNameVar+".sound = \""+board.sound+"\";" });
                codes.push({code: correctNameVar+".panelItems = "+board.panel_items+";" });          
            }
        }         
        return codes;
    } 
    /*
    var codesToGeneratedGlobalSpreadsheets = function() {
        var codes = new Array();
        var globalSpreadsheets = spreadsheetsContainer.getSpreadsheets();
        for(var i=0; i<globalSpreadsheets.length; i++) {
            var spreadsheet = globalSpreadsheets[i];
            if (spreadsheet.name) {
                codes.push("var "+spreadsheet.name+" = new Spreadsheet();");
                for(var col=0; col<spreadsheet.data.length; col++) {                
                    for(var row=0; row<spreadsheet.data[col].length; row++) {                
                        codes.push({code: spreadsheet.name+".cell["+col+"]["+row+"] = \""+spreadsheet.data[col][row]+"\";" });
                    }
                }
            }
        }
        return codes;
    }*/
    
    /*var codesToGeneratedGlobalLabels = function() {
        var codes = new Array();
        var globalTextFields = canvas.getElementsListForType(ELEMENT_TYPE_TEXT);
        for(var i=0; i<globalTextFields.length; i++) {
            var textfield = globalTextFields[i];
            if (textfield.dataset.designName) {
                codes.push("var "+textfield.dataset.designName+" = new Label();");
                codes.push(textfield.dataset.designName+".x = "+textfield.dataset.designXPos+";");
                codes.push(textfield.dataset.designName+".y = "+textfield.dataset.designYPos+";");
                codes.push(textfield.dataset.designName+".width = "+textfield.offsetWidth+";");
                codes.push(textfield.dataset.designName+".height = "+textfield.offsetHeight+";");
                codes.push(textfield.dataset.designName+".visible = "+textfield.dataset.designVisible+";");
                codes.push(textfield.dataset.designName+".text = \""+textfield.dataset.designText+"\";");
                codes.push(textfield.dataset.designName+".textColor = \""+textfield.dataset.designTextColor+"\";");
                codes.push(textfield.dataset.designName+".fontSize = "+textfield.dataset.designFontSize+";");
                codes.push(textfield.dataset.designName+".fontType = \""+textfield.dataset.designFontType+"\";");
            }
        }
        return codes;
    }    
    
    var codesToGeneratedGlobalTextEdits = function() {
        var codes = new Array();
        var globalTextEdits = canvas.getElementsListForType(ELEMENT_TYPE_TEXTEDIT);
        for(var i=0; i<globalTextEdits.length; i++) {
            var textedit = globalTextEdits[i];
            if (textedit.dataset.designName) {
                codes.push("var "+textedit.dataset.designName+" = new TextEdit();");
                codes.push(textedit.dataset.designName+".x = "+textedit.dataset.designXPos+";");
                codes.push(textedit.dataset.designName+".y = "+textedit.dataset.designYPos+";");
                codes.push(textedit.dataset.designName+".width = "+textedit.offsetWidth+";");
                codes.push(textedit.dataset.designName+".height = "+textedit.offsetHeight+";");
                codes.push(textedit.dataset.designName+".visible = "+textedit.dataset.designVisible+";");
                codes.push(textedit.dataset.designName+".text = \""+textedit.dataset.designText+"\";");
                codes.push(textedit.dataset.designName+".textColor = \""+textedit.dataset.designTextColor+"\";");
                codes.push(textedit.dataset.designName+".fontSize = "+textedit.dataset.designFontSize+";");
                codes.push(textedit.dataset.designName+".fontType = \""+textedit.dataset.designFontType+"\";");
            }
        }
        return codes;
    } */
  
    this.setObjectOnCanvasByDefinitions = function() {        
        // for current boardId change objects on canvas 
        var codeObj = objectFromParamAndValue(application.codes, "screen_id", boardId);
        var generated_code = codeObj.generated_code;
        Editor.definitions.setObjectOnCanvasByDefinitions(Editor.definitions.definitionsFromCode(generated_code));    
    }        
    
	this.getStatementsDefByBoardName = function(name) {
        for (var i=0; i < arrayCodes.length; i++) {       
            if (name == arrayCodes[i].boardName) {
				return arrayCodes[i].statementsDef;
			}
         
        }  
        return new Array();
	}
	this.getStatementsCodeByBoardName = function(name) {
        for (var i=0; i < arrayCodes.length; i++) {       
            if (name == arrayCodes[i].boardName) {
				return arrayCodes[i].statementsCode;
			}
         
        }  
        return new Array();
	}
    
    /**
	* compile every board and created statements for him
	* 
	* @return {boolean} success of compile
	*/
    this.compile = function() {
        var success = true,
            endLineNumber = 0,
            endListSts = null;

        for (var i=0; i < arrayCodes.length; i++) {            
            var statementsDef = Editor.statements.statementFromCode(arrayCodes[i].definitions),
			    statementsCode = Editor.statements.statementFromCode(arrayCodes[i].code);
                            
            arrayCodes[i].statementsDef = statementsDef;            
            arrayCodes[i].statementsCode = statementsCode;  
        }  

        // pobiera ostatnią komende w kodzie
        for(var i = arrayCodes.length-1; i>=0; i--) {
            var statementsDef = arrayCodes[i].statementsDef,
                statementsCode = arrayCodes[i].statementsCode;
            
            if (!endListSts && statementsCode.length > 0) { endListSts = statementsCode; }   
            if (!endListSts && statementsDef.length > 0) { endListSts = statementsDef; }   
            
            // add to code: line ended execute program:  appFinished();
            if (endListSts) {               
                
                var endSts = endListSts[endListSts.length-1],
                    range = endSts.rangeElseTo || endSts.rangeTo,
                    endLineNumber = 1;
                    
                if (range) { 
                    endLineNumber = range.line+1; 
                } else if (endSts.lineNumber) { 
                    endLineNumber = endSts.lineNumber; 
                }

                break;
            }
        }
        if (!endListSts) {
            endListSts = arrayCodes[0].statementsCode;
        }
        endListSts.push({
            type: "statement",
            codeType: STATEMENT_CODE_TYPE_UNDEFINED,
            code: "appFinished();",
            lineNumber: endLineNumber+1
        });
        
        return success;
    }  
    
    
    var emuRemoveVarPrefixInCode = function(code) { //old: emuRemoveVarPrefixInCode        
        code = code.replace(/var[\s]+/, "");
        return code;
    }
    
    // console.read(aaa);
    
    // get parameter name (variable) between bracket and change to parameter string ("variable")
    var emuChangeConsoleRead = function(code) { // tu moze pojawic sie tez caly blok
        var result = "",
            regExpConsoleRead = /Console.read\(\s*[^\)\s]*\s*\);/g
        var findData = code.match(regExpConsoleRead);                      
        if (findData) {
            for(var i=0; i < findData.length; i++) {
                
                var codeSubstring = code.search(),
                    variableName = findData[i].beetweenChars("\\(","\\)");
                variableName = variableName.trim();
                variableName = variableName.substring(4, variableName.length); // remove prefix "EMU."
                                
                code = code.replace(regExpConsoleRead, 'Console.read("'+variableName+'");');
                //console.log(code);                
                return code;
            }
        }
        return "";
    }
    
    this.getVariableNameFromDeclaration = function(code) {
       var result = "";       
       code = code.trim();
       if (code.search(/var\s*/) == 0) {
           code = code.replace(/var\s*/, "");           
           var matched = code.match(/[\w]*[^\s=]*/);
           if (matched && matched.length > 0) {
               result = matched[0];
           }
       }
       return result;       
    }
    
    var getVariableForCodeBlock = function(statement, _refListVars, isChangeCode) {
        var regExpVar = codeEditor.templates.regExpDeclarationGlobalVar(),
            findVars = statement.code.match(regExpVar);                         
        if (findVars) {
            for(var i=0; i < findVars.length; i++) {
                if (isChangeCode) {
                    statement.code = statement.code.replace(findVars[i], emuRemoveVarPrefixInCode(findVars[i]));
                }                                    
                var variableToAdd = that.getVariableNameFromDeclaration(findVars[i]);
                if (variableToAdd && _refListVars.indexOf(variableToAdd) == -1) {
                    _refListVars.push(variableToAdd);
                }
            }
        }
    }

    // przygotowujemy kody po kompilacji do trybu debuggera
    // wszystkie obiekty i struktury danych zostana przypisane do globalnego obiektu 'EMU'
    // obiekt EMU przechowuje tez nazwy zmiennych instancji funkcji i zmiennych (w tablicy EMU.listVars)
    // Zwraca:
    //  array cody przetworzone do trybu debuggera
    this.prepareCodesToDebug = function() {
        var EMUarrayCodes = $.extend(true, [], arrayCodes),
            statements = [];
        EMU = $.extend(true, {}, EMUdefault);
        
        for(var iC = 0; iC < EMUarrayCodes.length; iC++) {
            for(var iTypeCode=2;iTypeCode--;) {
                if (iTypeCode==1) {
                    statements = EMUarrayCodes[iC].statementsDef;
                } else {
                    statements = EMUarrayCodes[iC].statementsCode;
                }
                
                if (statements) { 
                    for(var myIt = 0; myIt < statements.length; myIt++) { 
                        var statement = statements[myIt];                        

                        // get variables
                        if (statement.type == "var") {
                            statement.code = emuRemoveVarPrefixInCode(statement.code);//  statement.code.replace(/var[\s]+/, prefixEMU+".");
                            if (statement.varObj && statement.varObj.name && EMU.listVars.indexOf(statement.varObj.name) == -1) {
                                EMU.listVars.push(statement.varObj.name);
                            }
                                                                
                        } else if (statement.type == "function" || statement.type == "for" || statement.type == "repeat" || statement.type == "if") {
                            
                            if (statement.type == "function" && statement.functionObj.name && EMU.listVars.indexOf(statement.functionObj.name) == -1) {                                
                                EMU.listVars.push(statement.functionObj.name);                               
                                EMU.addedInfo.push({
                                    name: statement.functionObj.name,
                                    statement: statement
                                });
                            }
                            
                            // get list var's for other type than function (for checks problem, before run program)
                            if (statement.type != "function") {
                                 getVariableForCodeBlock(statement, EMU.listVars, true);
                            } else {
                                // Why false? False at the end, because we dont change variable name in function, because we do it later. 
                                // First we set code by local name variable, and next global name variable. 
                                getVariableForCodeBlock(statement, EMU.listVars, false);
                            }
                        } 
                        
                        function setStatementsVariable(tmpStatement) {                            
                            
                            var regExpVar = codeEditor.templates.regExpDeclarationGlobalVar(),
                                findVars = tmpStatement.code.match(regExpVar),
                                isRemovePrefixVar = false;
                            
                            if (tmpStatement.type != "function") {
                                isRemovePrefixVar = true;
                            }
                            //if (tmpStatement.parent && tmpStatement.parent.type != "function") {
                            //    isRemovePrefixVar = true;
                            //}
                            
                            if (findVars && isRemovePrefixVar) { 
                                for(var i=0; i < findVars.length; i++) {
                                    tmpStatement.code = tmpStatement.code.replace(findVars[i], emuRemoveVarPrefixInCode(findVars[i]));
                                }
                            }
                            
                            if (tmpStatement.type == "function") {
                                var bodyFunction = tmpStatement.code.contentFromEvenChars("{","}"),
                                    funcObj = tmpStatement.functionObj,
                                    params = (funcObj.argsString)?funcObj.argsString:"",
                                    newFunction = prefixEMU+"."+funcObj.name+" = function("+params+") {"+bodyFunction+"}";
                                tmpStatement.code = newFunction;
                            } else {
                                tmpStatement.code = setCodesToEMUVars(tmpStatement.code);    
                            }
                                                                                                                
                            //||tmpStatement.code = setOperatorAndOrToJavascriptOperators(tmpStatement.code);                            
                            
                            if (tmpStatement.varObj) {
                                tmpStatement.varObj.name = setCodesToEMUVars(tmpStatement.varObj.name);
                                tmpStatement.varObj.value = setCodesToEMUVars(tmpStatement.varObj.value);
                            }                            
                            if (tmpStatement.ifObj && tmpStatement.ifObj.rpn) {
                                tmpStatement.ifObj.rpn = setCodesToEMUVars(tmpStatement.ifObj.rpn);
                            }
                            if (tmpStatement.forObj) {
                                var p0 = tmpStatement.forObj.params[0];
                                if (p0) {
                                    p0.code = setCodesToEMUVars(p0.code);
                                    p0.name = setCodesToEMUVars(p0.name);
                                    p0.value = setCodesToEMUVars(p0.value);
                                }
                                var p1 = tmpStatement.forObj.params[1];
                                if (p1) {
                                    p1.code = setCodesToEMUVars(p1.code);
                                    p1.rpn = setCodesToEMUVars(p1.rpn);
                                }    
                                var p2 = tmpStatement.forObj.params[2];
                                if (p2) {
                                    p2.code = setCodesToEMUVars(p2.code);
                                    p2.name = setCodesToEMUVars(p2.name);
                                    p2.name2 = setCodesToEMUVars(p2.name2); 
                                }                                                             
                            }
                            if (tmpStatement.functionObj) {
                                tmpStatement.functionObj.name = setCodesToEMUVars(tmpStatement.functionObj.name);
                            }                                                                                                                                          
                            
                            var consoleRead = emuChangeConsoleRead(tmpStatement.code);
                            if (consoleRead) {
                                tmpStatement.code = consoleRead;
                            }
                            
                            if (tmpStatement.deep && tmpStatement.type != "function") {
                                for(var i=0; i < tmpStatement.deep.length; i++){
                                    setStatementsVariable(tmpStatement.deep[i]);
                                }
                            }
                            if (tmpStatement.deepElse && tmpStatement.type != "function") {
                                for(var i=0; i < tmpStatement.deepElse.length; i++){
                                    setStatementsVariable(tmpStatement.deepElse[i]);
                                }
                            }
                        }                                 
                        setStatementsVariable(statement);
                       
                    }
                }
            }
        }
        console.log(EMUarrayCodes);
        return EMUarrayCodes;        
    }
    
    // zastepuje boardy typu:  board1  na odpowiednik: Editor.boards("board1")
    this.changeCodeByChangeInstanceBoardName = function(code) {
         var prJS = new ParserJSCode({
            events: {
                foundWord: function(obj) {
                    var lengthObjWord = obj.word.length,
                        template = 'Editor.boards("%%BOARD_NAME%%")',
                        word = (obj.word.split(".").length>0)?obj.word.split(".")[0]:obj.word;
                                       
                    if (!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2) {       
                        if (application.screensNameList.indexOf(word) > -1) {

                            var newWord = template.replace("%%BOARD_NAME%%", word),                                
                                leftSide = code.substring(0, obj.iC -  lengthObjWord),
                                rightSide = code.substring(obj.iC - obj.word.length + word.length, code.length);

                            code = leftSide+newWord+rightSide;                                                             
                            prJS.setCode(code);
                            prJS.seek(obj.iC - obj.word.length + newWord.length); 
                        }                                           
                    }
                }              
            }
        });
        prJS.parse(code);                
        return code;
    }
    
    // dodaje do wyrazen planszy typu:  var obiekt = new ClickableArea();  kod po nim:  obiekt.name = "obiekt";
    this.changeCodeByAddNameToBoardObjectInstances = function(code) {
        var index = 0,
            indexSearch = -1,
            indexTempSearch = -1,
            matched = [],
            allCode = "",
            leftSub = code,
            rightSub = code,
            remainingCode = code,
            codeStm = "",
            replaceStm = "",
            lengthStm = 0,
            definition = null,
            regExp = null,
            
            indexRegExp = -1,
            regExps = [codeEditor.templates.regExpDeclarationNewClickableArea(), 
                       codeEditor.templates.regExpDeclarationNewTextField(),
                       codeEditor.templates.regExpDeclarationNewTextEdit(),
                       codeEditor.templates.regExpDeclarationNewButton()];
                       

        do {// TODO
            indexRegExp = -1;
            indexSearch = -1;
            indexTempSearch = -1;
            
            for(var iR=0; iR < regExps.length; iR++) {
                indexTempSearch = remainingCode.search( regExps[iR] );
                if (indexTempSearch > -1) {
                    if (indexSearch == -1 || indexTempSearch < indexSearch) {
                        indexSearch = indexTempSearch;
                        indexRegExp = iR;                        
                    }
                    //indexSearch = Math.min(remainingCode.search(regExp), indexSearch);
                }
            }
            
            if (indexSearch > -1) {
                leftSub = remainingCode.substring(0, indexSearch);                
                rightSub = remainingCode.substring(indexSearch);
                matched = rightSub.match( regExps[indexRegExp] );
                if (matched.length > 0) {
                    codeStm = matched[0];
                    definition = Editor.definitions.getDefinitionsOfNewObject(codeStm);
                    replaceStm = codeStm+" "+definition.variable+".name = \""+definition.variable+"\";";
                    rightSub = rightSub.replace(codeStm, replaceStm);
                    //index = indexSearch + replaceStm.length;
                    
                    remainingCode = rightSub.substring(replaceStm.length);
                    allCode += leftSub+replaceStm;
                } 
            }    
        } while(indexSearch > -1);
        
        allCode += remainingCode;
        
        /*
        if ( index > -1) {
//        matched = code.match(codeEditor.templates.regExpDeclarationNewClickableArea());        
            allCode 
            //alert(code.substring(0, index)+"  find index="+index+" "+ code.substring(index, code.length));
        }           
        alert(JSON.stringify(matched)); */
        
        
        return allCode;
    }
    
    
    
    // przygotowujemy kody po kompilacji do trybu zwyklego, m.in.
    // zastepuje boardy typu:  board1  na odpowiednik: Editor.getBoardByName("board1")
    // Zwraca:
    //  array cody przetworzone
    /*this.prepareCodesToEmulator = function() {
        var tmpArrayCodes = $.extend(true, [], arrayCodes),
            statements = [];
        
        for(var iC = 0; iC < tmpArrayCodes.length; iC++) {
            for(var iTypeCode=2;iTypeCode--;) {
                if (iTypeCode==1) {
                    statements = tmpArrayCodes[iC].statementsDef;
                } else {
                    statements = tmpArrayCodes[iC].statementsCode;
                }
                
                if (statements) { 
                    for(var myIt = 0; myIt < statements.length; myIt++) { 
                        var statement = statements[myIt];                        
                        if (statement.code) {
                            //TODO
                            
                           var prJS = new ParserJSCode({
                                events: {
                                    foundWord: function(obj) {
                                        var lengthObjWord = obj.word.length,
                                            boardInstance = null,
                                            template = 'Editor.boards("%%BOARD_NAME%%")',
                                            word = (obj.word.split(".").length>0)?obj.word.split(".")[0]:obj.word;
                                            
                                        // rozdzielenie kropkami                                                                                                                          
                                                                                  
                                        if (!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2) {                                            
                                            boardInstance = Editor.boards(word);                                            
                                            if (boardInstance) {
                                                lengthObjWord = word.length;
                                                
                                                var newWord = template.replace("%%BOARD_NAME%%", word),                                
                                                    leftSide = statement.code.substring(0, obj.iC -  lengthObjWord),
                                                    rightSide = statement.code.substring(obj.iC, statement.code.length);
                                                                                                    
                                                statement.code = leftSide+newWord+rightSide;
                                                //newCode = code;                                                                
                                                prJS.setCode(code);
                                                //prJS.seek(obj.iC+prefixEMU.length+1); 
                                                //prJS.seek(obj.iC);
                                            }
                                                                                                                      

                                        }
                                    }              
                                }
                            });
                            prJS.parse(statement.code);                            
                            
    
                        }
                    }
                }
            }
        }
        return tmpArrayCodes;        
    }  */  
    
    var stringFunctionVariable = function(funcName, lvl, varName) {
        return "___"+funcName+"_"+lvl+"___"+varName;
    }
    
    // search variable name with argsParams Array, and replace name by argsParams
    var setCodesToEMUFunction = function(code, funcName, lvl, listFuncVars) { // argsParams
        var newCode = code;
        if (listFuncVars && code) {
            // set code line by founded variables
            for(var iV=0; iV < listFuncVars.length; iV++) {    
                var prJS = new ParserJSCode({
                    events: {
                        foundWord: function(obj) {
                            
                            /*var lengthObjWord = obj.word.length,
                                arrWord = obj.word.split("."),
                                modString = "";
                            obj.word = arrWord[0];
                            var arrMod = arrWord.slice(1);
                            if (arrMod && arrMod.length > 0) {
                                modString = "."+arrMod.join(".");
                            }*/
                           
                            // add EMU
                           
                            var lengthObjWord = obj.word.length;
                            
                            if (obj.word == listFuncVars[iV] && 
                                (!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2 )) {                                            
                                
                                var newWord = prefixEMU+"."+stringFunctionVariable(funcName, lvl, listFuncVars[iV]),                                
                                    leftSide = code.substring(0, obj.iC -  lengthObjWord),
                                    rightSide = code.substring(obj.iC, code.length);
                                                                                    
                                code = leftSide+newWord+rightSide;
                                newCode = code;                                                                
                                prJS.setCode(code);
                                prJS.seek(obj.iC+prefixEMU.length+1); 
                                //prJS.seek(obj.iC);
                            }
                        }              
                    }
                });
                prJS.parse(code);
            }     
        }
        return newCode;
    }

    
    var setCodesToEMUVars = function(code, listVars) {
        var newCode = code;
        listVars = listVars || EMU.listVars;
        if (listVars && code) {
            // set code line by founded variables
            for(var iV=0; iV < listVars.length; iV++) {    
                var prJS = new ParserJSCode({
                    events: {
                        foundWord: function(obj) {
                            
                            var lengthObjWord = obj.word.length,
                                arrWord = obj.word.split("."),
                                modString = "";
                            obj.word = arrWord[0];
                            var arrMod = arrWord.slice(1);
                            if (arrMod && arrMod.length > 0) {
                                modString = "."+arrMod.join(".");
                            }
                            
                            if (obj.word == listVars[iV] && 
                                (!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2 )) {                                            
    
                                var newWord = prefixEMU+"."+obj.word+modString,
                                    leftSide = code.substring(0, obj.iC -  lengthObjWord),//obj.word.length),
                                    rightSide = code.substring(obj.iC, code.length);
                                                                                    
                                code = leftSide+newWord+rightSide;
                                newCode = code;                                
                                //console.log("leftSide: "+leftSide); console.log("rightSide: "+rightSide); console.log("newWord: "+newWord); console.log("all: "+code);                                
                                prJS.setCode(code);
                                prJS.seek(obj.iC+prefixEMU.length+1); 
                            }
                        }              
                    }
                });
                prJS.parse(code);
            }     
        }
        return newCode;
    }    
    
    /*var setOperatorAndOrToJavascriptOperators = function(code) {
        var nCode = code;           
        var prJS = new ParserJSCode({
            events: {
                foundWord: function(obj) {
                    if ((obj.word == "and" || obj.word == "or") && 
                        (!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2 )) {                                            
                        var newWord = "",
                            leftSide = nCode.substring(0, obj.iC - obj.word.length),
                            rightSide = nCode.substring(obj.iC, code.length);                            
                        if (obj.word == "and") { newWord = "&&"}
                        if (obj.word == "or") { newWord = "||"}                                                                            
                        nCode = leftSide+newWord+rightSide;
                        prJS.setCode(nCode);
                        prJS.seek(0); 
                    }
                }              
            }
        });
        prJS.parse(nCode);
        return nCode;
    } */
   
    this.checkUniqueHelloWorldLesson = function() {
        var orderTip = sequencesSystem.bubbles.getCurrentTip().order,
            correctOrderLesson = 0,
            correctOrderModule = 1,
            correctOrderTip = 0;
                        
        codeEditor.updateCodes(); // update mainCode
        
        var result = {success: false},
            //indicator = 0,
            testCode = application.mainCode.replace("\n"," ").trim(),
            firstQuot = "",
            endQuot = "",
            text = "";
            //isOK = false;
        
        // check console.write
        if ( testCode.search(/console.write/) == 0 ) {
            //isOK = true;
            var word = testCode.match(/console.write/)[0];
            //indicator += word.length;
            testCode = testCode.substring(word.length);
        } else {
            //isOK = false;
            result.message = "Incorrect command.  You have to write: 'console.write'. Check you have typed correctly.";
            return result;
        } 
        // drop space
        testCode = testCode.trim();
        // now check open bracket
        if (testCode.length>0 && testCode[0] == "(") {
            testCode = testCode.substring(1);
        } else {
            result.message = "Missing opening bracket.";;
            return result; 
        }
        // drop space
        testCode = testCode.trim();
        // check open quotation
        if (testCode.length>0 && (testCode[0] == "\"" || testCode[0] == "'")) {
            firstQuot = testCode[0];
            testCode = testCode.substring(1);
        } else {
            result.message = "Missing opening quotation marks \" or '.";
            return result; 
        }
        // drop text 'Hello world !'
        if ( testCode.search(/[\w\s!]+/) == 0 ) {
            text = testCode.match(/[\w\s!]*/)[0];
            testCode = testCode.substring(text.length);
        } else {
            result.message = "Text in quotation marks is incorrect.";
            return result;
        } 
        // check close quotation
        if (testCode.length>0 && (testCode[0] == "\"" || testCode[0] == "'")) {
            endQuot = testCode[0];
            testCode = testCode.substring(1);
        } else {
            result.message = "Missing closing quotation marks \" or '.";
            return result; 
        }  
        
        if (firstQuot != endQuot) {
            if (firstQuot == "\"") {
                result.message = "You did you almost correctly there is small mistake. You started with \" and you finished with '.";
                return result;    
            }
            if (firstQuot == "'") {
                result.message = "You did you almost correctly there is small mistake. You started with ' and you finished with \".";
                return result;    
            }
       }

        // drop space
        testCode = testCode.trim();
        // now check close bracket
        if (testCode.length>0 && testCode[0] == ")") {
            testCode = testCode.substring(1);
        } else {
            result.message = "Missing closing bracket.";
            return result; 
        }
        // drop space
        testCode = testCode.trim();
        // now check semicolon
        if (testCode.length>0 && testCode[0] == ";") {
            testCode = testCode.substring(1);
        } else {
            result.message = "Missing semicolon at the end of the statement.";
            return result; 
        }
        // drop space
        testCode = testCode.trim();
        if (testCode) {
            result.message = "Delete unnecessary text after the semicolon.";
            return result; 
        }
        
        result.text = text;
        result.success = true;
        return result;
    }
    
        
    // 1,2 - missing semicolon
    // 3 - missing close bracket
    // 4,6 - missing  second parameter after '+'
    // 7 - miss open bracket    
    var check123467Condition = function(statement) { // 
        var testCode = "",
            isProblem = false,
            foundWord = "",
            isFindFirstWord = false,
            posSeekCond3 = 0,
            prevExistChar = "",
            prJS = undefined;
            
            //firstWord = "",
            //isFirstWord = false,
            //autoCorr = "";
        var type = "none",   //  "none"|"semicolon"|"bracket_open"|"bracket_close"|"second_parameter"|"undefined_var"
            cB = 0,
            uniqueWord = "";

        if (!statement.type || statement.type == "statement" || statement.type == "var") {
            testCode = statement.code.split("\n")[0];            
            testCode = testCode.trim();
            
            if (testCode) { 
                var arrayUniqueWords = ["console.write", "console.read"];
                for(var i=0; i < arrayUniqueWords.length; i++) {
                    var index = testCode.search(new RegExp(arrayUniqueWords[i], "i"));
                    if (index == 0) {
                        uniqueWord =  arrayUniqueWords[i];
                        break;
                    }
                }
                if (uniqueWord) {
                    posSeekCond3 += uniqueWord.length;
                }                

                prJS = new ParserJSCode({
                    events: {
                        foundChar: function(obj) {
                            if (!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2 ) {
                                // 1,2                                            
                                if (obj.ch == "(" || obj.ch == ")") {
                                    if (obj.ch == "(") {
                                        //isFirstWord = true;
                                        cB++;
                                    } else if (obj.ch == ")") {
                                        cB--;
                                    }    
                                    if (cB == 0) { // end statement
                                        
                                        var remainingString = testCode.substring(obj.iC+1);
                                        if (remainingString) {
                                            remainingString = remainingString.trim();
                                        }
                                        
                                        if (!remainingString && remainingString[remainingString.length - 1] != ";") {
                                            isProblem = true;
                                            type = "semicolon";
                                        }                                        
   
                                    }
                                    if (cB < 0) { // error
                                        prJS.stop();
                                    } 
                                } 
                                
                                // 4, 6
                                if (obj.ch == "+" && (obj.iC + 1 < testCode.length) && 
                                    (testCode[obj.iC+1]=="+" || testCode[obj.iC+1]=="=")) {
                                    prJS.seek(obj.iC+2);
                                    return; // drop situation:  ++, +=  
                                }
                                if (obj.ch == "+") { // optionally check:  uniqueWord
                                    var modString = testCode.substring(obj.iC, testCode.length),
                                        firstSign = true,
                                        tmpCh = "";
                                    foundWord = "";
                                    for(var i=0; i < modString.length; i++) {

                                        if (i + 1 < modString.length && modString[i+1]) {
                                            tmpCh = modString[i+1].trim();
                                        }
                                        
                                        if (tmpCh) {                                                              
                                            if (firstSign) {
                                                if (tmpCh == ")" || tmpCh == ";") {
                                                    type = "second_parameter";
                                                    isProblem = true;
                                                    prJS.stop();
                                                    break;
                                                }
                                            }                                  
                                            firstSign = false;                                            
                                        }
                                    }
                                }                                                               
                                
                                // 7
                                if (uniqueWord) {
                                    var index = uniqueWord.length;
                                    if (index < testCode.length) {
                                        for(var i=index; i < testCode.length; i++) {
                                            var tmpCh = testCode[i].trim();
                                            if (tmpCh) {
                                                if (tmpCh != "(") {
                                                    type = "bracket_open";
                                                    isProblem = true;
                                                    prJS.stop();
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                                
                                
                            }
                                                                                   
                            // we check at the end prev char
                            if (obj.ch && obj.ch.trim() != "") {
                                prevExistChar = obj.ch;
                            }                            
                            
                        },                                              
                        
                        foundWord: function(obj) {
                            if (!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2 ) {
                                var reservedWords = ["new", "Array", "var", "Console.write", "Console.read", "Console", "write", "read", "repeat", "for"]
                                
                                // check exists variable between var, =
                                var varName = "";
                                if (statement.type == "var") {
                                    varName =  testCode.beetweenStrings ("var", "=");
                                    if (varName) { varName = varName.trim(); }                                     
                                }
                                
                                var isReserved = (reservedWords.indexOf(obj.word) > -1);
                                //if (!isReserved) { 
                                if ((uniqueWord && !isReserved && obj.iC > uniqueWord.length) || 
                                   (!isReserved && varName && statement.type == "var" && obj.iC > "var".length )  ) { // && !isFindFirstWord 
                                    foundWord = obj.word;
                                    //isFindFirstWord = true;
                                    
                                    var copyVars = $.extend(true, [], EMU.listVars);
                                    if (varName) {
                                        copyVars.push(varName);
                                    }
                                    copyVars.push("true");
                                    copyVars.push("false");
                                    for(var i=copyVars.length-1; i>=0; i--) {
                                        copyVars.push(copyVars[i]+".length");
                                    }
                                    // add variable name from function parameters 
                                    var tmpStm = statement;
                                    while(tmpStm.parent) {
                                        if (tmpStm.parent.type == "function") {
                                            copyVars = copyVars.concat(copyVars, tmpStm.parent.functionObj.argsParams);
                                        }
                                        tmpStm = tmpStm.parent;
                                    };                                  
                                    
                                    if (browserEmulator.isDebugger && !isProblem && isNaN(foundWord) && copyVars.indexOf(foundWord)<0 ) {
                                        type = "undefined_var";
                                        isProblem = true;
                                        prJS.stop();
                                    }
                                }

                               /* if (uniqueWord) {
                                    var lengthWord = uniqueWord.length;
                                    //prJS.seek(lengthWord);
                                    return;
                                }*/
           
                            }
                        }
                    }
                });
                prJS.parse(testCode);
            }
        }
               
        
        if (prJS && !isProblem && uniqueWord) {
            if (prJS.state.isOpenQuotation1) {
                isProblem = true;
                type = "begin_quot1_without_closing"
            }
            if (prJS.state.isOpenQuotation2) {
                isProblem = true;
                type = "begin_quot2_without_closing"
            }
        }
                         
        if (!isProblem && testCode && testCode[testCode.length - 1] == "+") {
            isProblem = true;
            type = "second_parameter";
        }                           
                
         
        if (!isProblem && statement.type == "var" && testCode && testCode[testCode.length - 1] != ";") {
            isProblem = true;
            type = "semicolon";
        }           
        
        // 3
        if (cB > 0 && !isProblem) {
            // count open bracket is more than 0
            var wasFoundSemicolon = false;
            // we check if last char is semicolon
            for(var i=testCode.length-1; i>=0; i--) {
                var ch = testCode[i];
                ch = ch.trim();
                if (ch) {
                    if (ch == ";") {
                        wasFoundSemicolon = true;
                    }
                    break;
                }
            }
            isProblem = true;
            if (wasFoundSemicolon) {                
                type = "bracket_close";
            } else {
                type = "bracket_close_without_semicolon";
            }
        }        
        
        
        if (isProblem) {
            var result = {type: "error"},
                msg = "";
            if (type == "semicolon") {
                result.message = "Code error. Missing semicolon at the end of the statement.";
            } else if (type == "bracket_open") {
                result.message = "Code error. It seems like you forgot to put opening bracket '('.";
            } else if (type == "bracket_close_without_semicolon") {
                result.message = "Code error. It seems like you forgot to put closing bracket ')' and semicolon at the end of the line.";
            } else if (type == "bracket_close") {
                result.message = "Code error. It seems like you forgot to put closing bracket ')' at the end of the line.";
            } else if (type == "second_parameter") {
                result.message = "Code error detected. You probably forgot to put parameter after '+'.";
            } else if (type == "begin_quot1_without_closing") {
                result.message = "Code error detected. You did you almost correctly there is small mistake. You started with \" and not closing with \".";
            } else if (type == "begin_quot2_without_closing") {
                result.message = "Code error detected. You did you almost correctly there is small mistake. You started with ' and not closing with '.";
            } else if (type == "undefined_var") {
                result.message = "Code error. Undefined variable '"+foundWord+"'";
            } 
            
            return result;
        }
    }
    
    var getListOfStatements = function(tmpCodes) {
        var statementsList = [];
        for(var i=0; i < tmpCodes.length; i++ ) {        
            for(var iTypeCode=2;iTypeCode--;) {
                if (iTypeCode==1) {
                    statements = tmpCodes[i].statementsDef;
                } else {
                    statements = tmpCodes[i].statementsCode;
                }                
                if (statements) { 
                    for(var myIt = 0; myIt < statements.length; myIt++) {                        
                        var tmpSts =  statements[myIt];
                        statementsList.push(tmpSts);
                    }
                }
                
            }
        }   
        return statementsList;
    }
    
    var check8AutoCorrect = function(statement, tmpCodes) {
        var firstWord = "",
            isFirstWord = false,
            autoCorr = "",
            //testCode = statement.code.trim();
            testCode = statement.code.split("\n")[0];
        
        if (testCode) testCode = testCode.trim();      
        
        if (testCode) {     
            var prJS = new ParserJSCode({
                events: {
                    foundChar: function(obj) {
                        if (!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2 ) {                                            
                            if (obj.ch == "(" || obj.ch == " ") {
                                isFirstWord = true;
                            }
                            if (!isFirstWord) {
                                firstWord += obj.ch;
                            }
                        }
                    }              
                }
            });
            prJS.parse(testCode);                
        }
        
        var listDynamicReference = getListOfStatements(tmpCodes),
            listDynamicName = [];
            
        for(var i=0; i < listDynamicReference.length; i++) {
            var obj = listDynamicReference[i];
            if (obj.type == "var" && obj.varObj) { listDynamicName.push(obj.varObj.name); }            
            if (obj.type == "function" && obj.functionObj) { listDynamicName.push(obj.functionObj.name); }            
            if (obj.type == "class" && obj.classObj) { listDynamicName.push(obj.classObj.name); }                        
        }
                
        var listAutocorrect = ["console.write", "console.read", "if", "for", "repeat", "var"];
        firstWord = firstWord.trim().toLowerCase();
        
        for(var i=0; i < listAutocorrect.length; i++) {
            autoCorr = listAutocorrect[i];
            
            if (firstWord != autoCorr && listDynamicName.indexOf(firstWord) == -1 ) {
                if (checkSimilarString(firstWord, autoCorr)) {
                    return {
                        type: "error",
                        message: "unknown command name. Maybe you mean: "+autoCorr+" ?"
                    };
                }    
            }
        }
    }    
    
    // warning    if (zmienna=2)
    var check9Condition = function(statement) {
        var testCode = "",
            isProblem = false;
            
        var rpn = "";
        if (statement && statement.ifObj && statement.ifObj.rpn) {
            rpn = statement.ifObj.rpn;
        }
        if (statement && statement.forObj && statement.forObj.params &&
            statement.forObj.params.length > 2 && statement.forObj.params[1].rpn) {
            rpn = statement.forObj.params[1].rpn;
        }            
                   
        if (rpn){
            var arrRpn = rpn.split(" ");
            for(var i=0; i < arrRpn.length; i++) {
                var token = arrRpn[i].trim();
                if (token && token == "=") {
                    isProblem = true;
                }                    
            }
        }
        
            /*testCode = statement.code.trim();
            if (testCode) {     
                var prJS = new ParserJSCode({
                    events: {
                        foundChar: function(obj) {
                            if (!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2 ) {                                            
                                                                
                                if (testCode[obj.iC] == "=" && (
                                     (obj.iC + 1 < testCode.length && testCode[obj.iC+1] != "=") &&
                                     (obj.iC - 1 >= 0 && testCode[obj.iC-1] != "=") &&
                                     (obj.iC - 1 >= 0 && testCode[obj.iC-1] != "!")
                                    )) {
                                    isProblem = true;
                                }
                            }
                        }              
                    }
                });
                prJS.parse(testCode);                
            }*/
        if (isProblem) {
            return {
                type: "warning",
                message: "wykrywamy sytuacje gdzie po If/For jest warunek z jednym znakiem =",
            };
        }
    }    
    
    // search the errors and warning
    that.checkInitialErrorsAndWarnings = function() {
        var statements = [],
            problemsInfo = [], //  { boardName, typeCode, lineNumber, problemType, problemNumber, problemParams }
            tmpCodes = $.extend(true, [], arrayCodes);
        
        console.log("=== ERRORS/WARNINGS ======");

        function getStatement(tmpStatement) {
            var deepSts = null; 
            if (tmpStatement.deep) {
                deepSts = tmpStatement.deep;
            } else if (tmpStatement.deepElse) {
                deepSts = tmpStatement.deepElse;
            }            
            
            if (deepSts && tmpStatement.iDeep > -1 && tmpStatement.iDeep < deepSts.length) {
                var stat = deepSts[tmpStatement.iDeep];
                stat.parent = tmpStatement;
                return getStatement(stat);
            } else {                           
                if (tmpStatement.iDeep < 0) {
                    tmpStatement.iDeep++;
                } else {
                    var parent = tmpStatement.parent;
                    if (parent) {
                        if (parent.deep) {
                            
                            tmpStatement = parent.deep[parent.iDeep];
                            parent.iDeep++; 
                            
                            if (parent.iDeep > parent.deep.length) {
                                parent.deep = null;
                                tmpStatement.iDeep = -1;
                            }
                        } else if (parent.deepElse) {

                            tmpStatement = parent.deep[parent.iDeep];
                            parent.iDeep++;                            
                               
                            if (parent.iDeep > parent.deepElse.length) {
                                parent.deepElse = null;
                                tmpStatement.iDeep = -1;
                            } 
                        }
                    }
                }
                if (!tmpStatement.wasStatement) {
                    tmpStatement.wasStatement = true;
                    return tmpStatement;    
                } else {
                    return null; 
                }
            } 
        }
                
        
        for(var i=0; i < tmpCodes.length; i++ ) {        
            for(var iTypeCode=2;iTypeCode--;) {
                if (iTypeCode==1) {
                    statements = tmpCodes[i].statementsDef;
                } else {
                    statements = tmpCodes[i].statementsCode;
                }                
                if (statements) { 
                    for(var myIt = 0; myIt < statements.length; myIt++) {                        
                        var tmpSts =  statements[myIt],
                            statement = null,
                            count = 0;
                        
                        do {
                            count++;
                            statement = getStatement(tmpSts);
                            //console.log(statement);
                            if (!statement) {
                                break;
                            }

                            var problem = check8AutoCorrect(statement, tmpCodes) || check123467Condition(statement) || check9Condition(statement);
                            
                            if (problem) {
                                problemsInfo.push({
                                    boardName: tmpCodes[i].boardName,
                                    typeCode: (iTypeCode==0)?parent.boardExtension.code:parent.boardExtension.definitions,
                                    lineNumber: statement.lineNumber,
                                    type: problem.type,
                                    message: problem.message
                                });
                                break;
                            } 
                            
                        } while(statement);                        
                         
                        
                    }
                }
            }
        }
        

        console.log("=== END OF SECTION: ERRORS/WARNINGS ======");
        console.log(tmpCodes);
        return problemsInfo;
    } 
    
    
    this.handleErrorsAndWarnings = function(options) {
        var problems = that.checkInitialErrorsAndWarnings(),
            warnings = [],
            wasWarning = false;
        for(var i=0; i < problems.length; i++) {
            var problem = problems[i];
            that.numberLineError =  problem.lineNumber;
            that.boardNameError = problem.boardName;
            that.boardExtensionError = problem.typeCode;                
            
            if (problem.type == "warning") {
                warnings.push(problem);
            }
            
            if (problem.type == "error") {
                throw {
                    type: problem.type,
                    name: "",
                    message: problem.message,
                }
            }
        }
        for(var i=0; i < warnings.length; i++) {
            var warning = warnings[i];
            wasWarning = true;
            if (options && options.callbackRunAway && typeof options.callbackRunAway === "function"
                        && options.callbackStopRun && typeof options.callbackStopRun === "function") {
                messageDialog.showWithTwoButtons("Warning", "In project are warnings.  [Line:"+problem.lineNumber+"] ("+problem.message+")", "STOP", "RUN AWAY", options.callbackStopRun, options.callbackRunAway);
                throw {
                    type: problem.type,
                    name: "",
                    message: problem.message,
                }
            }
        }
        if (!wasWarning && options && options.callbackAllOK && typeof options.callbackAllOK === "function") {
            options.callbackAllOK();
        }                     
    }
    
    
    this.handleCodeWithCallback = function(callback, addedText) {
        try {
            if (callback && typeof callback === "function") {
                callback();
            }
        } catch(e) {
            if (callbacks.log && typeof callbacks.log === "function") {                    
                callbacks.log(e.name+": "+e.message+addedText);
            }                    
            that.compilationStatus = COMPILATION_STATUS_ERROR;
            if (callbacks.failed && typeof callbacks.failed === "function") {                    
                callbacks.failed();
            }                       
        }        
    }


    this.run = function(callbackSuccess, callbackFailed, callbackLog) {
        
        if (browserEmulator.isRunning) {
            return;
        }
        
        callbacks.success = callbackSuccess;
        callbacks.failed = callbackFailed;
        callbacks.log = callbackLog;               
                        
        try {
            // we used below command to get variables to object "EMU" (for example EMU.listVars)
            var EMUarrayCodes = that.prepareCodesToDebug();                         
             
            that.handleErrorsAndWarnings({
                //statements: EMUarrayCodes,
                callbackAnyWarningOrError: function(problem) {
                       
                },
                callbackRunAway: function() {
                    runEmuApp();
                },                
                callbackStopRun: function() {
                    parent.stopDebugger();   
                },
                callbackAllOK: function() {
                    runEmuApp();
                },                
            });
        } catch (e) {
            browserEmulator.clear();
            if (typeof callbackLog === "function") {                    
                callbackLog("[Line:"+that.numberLineError+"] "+e.name+": "+e.message+"");
            }        
            
            //if(e.type == "error") {
                this.compilationStatus = COMPILATION_STATUS_ERROR;
                if (typeof callbackFailed === "function") {                    
                    callbackFailed();
                }        
                return;                
            //}
            
        }
        finally {
            AJAX_ASYNC = true;
        }         
        
        
        function runEmuApp() {
            try {
                // we set type of compilation
                that.requireStepByStep = false;                
                   
                // we are at the first, create copy codes, before update him during close editor window 
                var tmpArrayCodes = null;
                
                // jesli w kodzie wystepuje polecenie console.read, 
                // to automatycznie przelacza sie na tryb debuggera, 
                // poniewaz musimy wykonywac kod krok po kroku, ale wtedy mamy ograniczony tryb
                for(var i=0; i < arrayCodes.length; i++) {
                    if (arrayCodes[i].code.search(/console\.read/) != -1) {
                        // if begin from isDebugger == true, then not set this values
                        if (!browserEmulator.isDebugger) {
                            that.requireStepByStep = true;                        
                            browserEmulator.isDebugger = true;
                        }
                    }
                }              
                
                // w zaleznosci od tego czy jetesmy w trybie debuggera czy nie
                // pobieramy inny zestaw kodow do kompilacji i uruchomienia
                // - debugger ma obiekty nalezace wsponego obiektu EMU.xxx
                // - tryb bez debuggera to zwykle instancje, tak jak w chwili tworzenia
                if (browserEmulator.isDebugger) {
                    tmpArrayCodes = $.extend(true, [], that.prepareCodesToDebug()); 
                } else {
                    tmpArrayCodes = $.extend(true, [], arrayCodes);  
                }   
                   
                that.numberLineError = -1;
                that.boardNameError = "";
                that.boardExtensionError = "";                   
                
                // clear previous environment emulator before run emulator again
                Editor.removeObjectsNotRelatedWithCanvas();  
                Editor.removeObjectsActions();  
				Editor.clearImages();
                Editor.clearFiles();
                Editor.clearTimes();
                Editor.clearAlertQueue();
                browserEmulator.clear();
                //browserEmulator.addConsole();
                                             
                showConsole();
                
                this.compilationStatus = COMPILATION_STATUS_BEGIN;
                browserEmulator.isRunning = true;

                var codes = [],
                    statements = [];
                // codes = codes.concat(codesToGeneratedGlobalLabels());
                // codes = codes.concat(codesToGeneratedGlobalTextEdits());        
                // codes = codes.concat(codesToGeneratedGlobalSpreadsheets());                
                                
                try {
                    var boardOptions = null; 
                    Editor.blockedAddedToObjectsEditor = false;
                    codes = codes.concat(codesToGeneratedGlobalBoards());                
                    for(var i=0; i < codes.length; i++) {
                        if (codes[i].isNew) {
                            boardOptions = {
                                code: ""
                            };
                        } else if (codes[i].instance && boardOptions && boardOptions.code != undefined) {                        
                            boardOptions.code += codes[i].instance + String.fromCharCode(13);     
                        } else if (codes[i].code) { // create instance of board
                            if (codes[i].created) {
                                boardOptions.code = that.changeCodeByChangeInstanceBoardName(boardOptions.code);
                                boardOptions.code = that.changeCodeByAddNameToBoardObjectInstances(boardOptions.code);                                
                            }
                            eval(codes[i].code);    
                        } 
                    } 
                } catch(e) { 
                    console.log("ERROR board = "+JSON.stringify(e)); 
                    browserEmulator.clear();
                    if (typeof callbackLog === "function") {                    
                        callbackLog("[Line:"+that.numberLineError+"] "+e.name+": "+e.message+"");
                    }                        
                    this.compilationStatus = COMPILATION_STATUS_ERROR;
                    if (typeof callbackFailed === "function") {                    
                        callbackFailed();
                    }        
                    return;                                                                                
                 }                        
                                
                // default values
                var iC=0,
                    iTypeCode=1,    // begin from definitions  (iTypeCode=1  def,   iTypeCode=0 code)
                    myIterator = 0;
                
                parent.resetEditorDebug();
                if (browserEmulator.isDebugger) {
                    for(var i=0; i < tmpArrayCodes.length; i++) {
                        var countDef = tmpArrayCodes[i].definitions.split("\n").length,
                            countCode = tmpArrayCodes[i].code.split("\n").length,
                            defDebugEmpty = (new Array(countDef)).join("\n")+"\n", // at the end we add extra line, to end of debugger
                            codeDebugEmpty = (new Array(countCode)).join("\n")+"\n";                                            
                        //tmpArrayCodes[i].defDebug = (new Array(countDef)).join("\n")+"\n"
                        //tmpArrayCodes[i].codeDebug = (new Array(countCode)).join("\n")+"\n";             
                        parent.setEditorDebugForCode(tmpArrayCodes[i].boardName, parent.boardExtension.definitions, defDebugEmpty);
                        parent.setEditorDebugForCode(tmpArrayCodes[i].boardName, parent.boardExtension.code, codeDebugEmpty);
                    }          
                }

            } catch (e) {
                this.compilationStatus = COMPILATION_STATUS_ERROR;
                AJAX_ASYNC = true;
                browserEmulator.clear();
                if (typeof callbackLog === "function") {                    
                    callbackLog("[Editor error] "+e.name+": "+e.message+"");
                }        
                if (typeof callbackFailed === "function") {                    
                    callbackFailed();
                }
                return;
            }
   
            // CORE CODE
            function executeCode() {   
               try {
                    
                    if (browserEmulator.debugInterrupt) {
                        browserEmulator.debugInterrupt = false;
                        return;
                    }
                    
                    // stop
                    AJAX_ASYNC = false;    
                    Editor.blockedAddedToObjectsEditor = true;                             
                    for(; iC < tmpArrayCodes.length; iC++) {
                         
                        Editor.indexActiveBoard = Editor.objectIndexByName(tmpArrayCodes[iC].boardName);
                        if(Editor.indexActiveBoard > -1 && Editor.indexActiveBoard < Editor.editorObjects.length && 
                           Editor.editorObjects[Editor.indexActiveBoard].type != ELEMENT_TYPE_BOARD) {
                            Editor.indexActiveBoard = -1;
                        }
                            
                        that.boardNameError = tmpArrayCodes[iC].boardName;
                        
                        // last file "main.Code", 
                        // tworzymy plansze dla wszystkich boardow
                        /*if (iC==tmpArrayCodes.length-1) {
                            var codes = [],
                                boardOptions = {
                                    code: ""
                                };
                            codes = codes.concat(codesToGeneratedGlobalBoards());                
                            for(var _i=0; _i < codes.length; _i++) {
                                if (codes[_i].instance) {                        
                                    boardOptions.code += codes[_i].instance + String.fromCharCode(13);
                                } else if (codes[_i].code) {
                                    eval(codes[_i].code);
                                }
                            }                            
                        }*/
                        

                        for(;;) {
                            if (iTypeCode==1) {
                                statements = tmpArrayCodes[iC].statementsDef;
                                this.compilationStatus = COMPILATION_STATUS_GENERATED_CODE;
                                that.boardExtensionError = parent.boardExtension.definitions;
                            } else {
                                statements = tmpArrayCodes[iC].statementsCode;
                                this.compilationStatus = COMPILATION_STATUS_USER_CODE;
                                that.boardExtensionError = parent.boardExtension.code;
                            }
        
                            if (statements) {
                                for(;;) {                          
                                    var statement = statements[myIterator];
                                            
                                    // go by parent                                
                                    if (browserEmulator.isDebugger) {
                                        // set to correct statement
                                        function getStatement(tmpStatement) {
                                                                                        
                                            // choose correct block for 'if' (true/false)
                                            var deepSts = tmpStatement.deep;
                                            if (tmpStatement.type == "if") {
                                                
                                                if (tmpStatement.ifObj.exeElse) {
                                                    deepSts = tmpStatement.deepElse;
                                                } else {
                                                    deepSts = tmpStatement.deep;
                                                }                                                
                                            }
                                            
                                            if (deepSts && tmpStatement.iDeep > -1 && tmpStatement.iDeep <= deepSts.length) {
                                                
                                                if (tmpStatement.type == "if") {
                                                    if (tmpStatement.iDeep > -1 && tmpStatement.iDeep < deepSts.length) {
                                                        var stat = deepSts[tmpStatement.iDeep];
                                                        stat.parent = tmpStatement;
                                                        return getStatement(stat);    
                                                    } else if (tmpStatement.iDeep == deepSts.length) {
                                                        return null; // skip step  
                                                        //return tmpStatement;
                                                    }
                                                }
                                                if (tmpStatement.type == "for" || tmpStatement.type == "repeat") {
                                                    if (tmpStatement.iDeep > -1 && tmpStatement.iDeep < deepSts.length) {
                                                        var stat = deepSts[tmpStatement.iDeep];
                                                        stat.parent = tmpStatement;
                                                        return getStatement(stat);    
                                                    } else if (tmpStatement.iDeep == deepSts.length) {
                                                        return tmpStatement;
                                                    }
                                                }
                                                if (tmpStatement.type == "function_exe") {
                                                    if (tmpStatement.iDeep > -1 && tmpStatement.iDeep < deepSts.length) {
                                                        var stat = deepSts[tmpStatement.iDeep];
                                                        stat.parent = tmpStatement;
                                                        return getStatement(stat);    
                                                    } else if (tmpStatement.iDeep == deepSts.length) {
                                                        return null; // skip step
                                                        //return tmpStatement;
                                                    }
                                                }
                                                  
                                            } else {
                                                return tmpStatement; 
                                            }
                                        }

                                        if (statement) {
                                            statement = getStatement(statement);
                                        }     
                                    }                                    
                                                                        
                                    //console.log("Next_stm  type: " +statement.type+", code: " +statement.code+", iDeep: " +statement.iDeep);                                
                                    
                                    
                                    if (statement) {                                        
                                        // set statement as function_exe
                                        if (browserEmulator.isDebugger) {
                                            
                                            // check if statement execute function, 
                                            // type:  var var1 = func1(xx);   type2: func1(xx);                                                                                                                                                                                                                             
                                            function getExistFunction(_tmpCode) {
                                                var //codeFunctionNameEMU = _tmpCode.searchAndSubstring(";").split(/\([^\)]*\)/).join("").trim(),
                                                    //codeFunctionNameEMU2 = _tmpCode.searchAndSubstring(";").split(/\(/)[0].trim(),
                                                    codeFunctionNameEMU = _tmpCode.searchAndSubstring(";").contentOutsideFromEvenChars("(",")").trim(),
                                                    codeFunctionName = (new CodeEditorStrings()).rmEMU(codeFunctionNameEMU),
                                                    aInfo = objectFromParamAndValue(EMU.addedInfo, "name", codeFunctionName);
                                                    
                                                if (aInfo) {
                                                    aInfo = $.extend(true, {}, aInfo);
                                                    var valuesString = _tmpCode.contentFromEvenChars("(", ")");
                                                    //aInfo.statement = $.extend(true, {}, aInfo.statement);                                             
                                                    aInfo.params = ParserJS.getParametersFromString(valuesString);
                                                    aInfo.code = _tmpCode;
                                                }                     
                                                return aInfo;
                                            }
                                            
                                            function setFunctionExeFromFuncInfo(singleFunc, parent) { 
                                                var stm = singleFunc.statement;                                                                                         
                                                stm.type = "function_exe";
                                                //if (parent) {
                                                //    stm.lineNumber = parent.lineNumber;
                                                //}                                                
                                                //if (parent.deep && parent.deep.length > 0) {
                                                    stm.parent = parent.parent;
                                                //}
                                                stm.functionObj.argsPreValues = $.extend(true,[],singleFunc.params); // values with variables name
                                                stm.functionObj.argsValues = []; // values witt change variables name to values
                                                stm.functionObj.listVars = [];                                                              
                                                //set functions params and him values
                                                for(var j=0; j < singleFunc.params.length; j++) {
                                                    stm.functionObj.argsValues.push(eval(singleFunc.params[j]));
                                                }
                                                // set level
                                                var tmpStm = stm;
                                                do {
                                                    if (tmpStm.parent && tmpStm.parent.type == "function_exe") {
                                                        var level = tmpStm.parent.functionObj.level;
                                                        stm.functionObj.level = level + 1;
                                                        break;
                                                    }
                                                    tmpStm = tmpStm.parent;
                                                } while(tmpStm);                                                
    
                                                // get vars to local function
                                                for(var i=0; i < stm.deep.length; i++) {
                                                    getVariableForCodeBlock(stm.deep[i], stm.functionObj.listVars, true);
                                                }     
                                                stm.functionObj.listVars = stm.functionObj.listVars.concat(stm.functionObj.argsParams);                                                            
                                            }
                                            

                                            function createStatementBeforeFunctionExe(stm, parent) {
                                                var resStm = {
                                                    code: "",
                                                    type: "pre_function_exe",
                                                    lineNumber: stm.lineNumber,
                                                    functionObj: $.extend(true, {}, stm.functionObj)
                                                }
                                                resStm.functionObj.expression = parent.varObj.expression;                                                
                                                if (parent) {
                                                    resStm.lineNumber = parent.lineNumber;
                                                }                                                                                                  
                                                return resStm;
                                            }
                                            
                                            var tmpCode = statement.code,
                                                cpyStmEqual = null,
                                                objFunc = null;
                                            
                                            
                                            // statement (undefined) if is function_exe,  replace him to function_exe
                                            if (statement.type == "statement") {                                                     
                                                if (objFuncSeq = getExistFunction(statement.code)) {                                                    
                                                    var cpyStm = null,
                                                        preFuncExeStm = null;
                                                    setFunctionExeFromFuncInfo(objFuncSeq, statement);
                                                    preFuncExeStm = createStatementBeforeFunctionExe(objFuncSeq.statement, statement);                                                                                                                                                                                                                    
                                                    cpyStm = objFuncSeq.statement;                                                    
                                                    if (statement.parent) {
                                                        statement.parent.deep.splice(statement.parent.iDeep, 1, preFuncExeStm, cpyStm);
                                                    } else {
                                                        statements.splice(myIterator, 1, preFuncExeStm, cpyStm);
                                                    }
                                                    //statement = cpyStm;
                                                    statement = preFuncExeStm;
                                                }
                                            }
                                                                                        
                                            
                                            
                                            // statement.code.search("Console.write") == 0  <<< HERE
                                            
                                            
                                            //if (statement.codeType == STATEMENT_CODE_TYPE_RETURN) {
                                              //  var returnCode = statement.code.replace(/return\s*/,"");
                                                    //resultReturn = eval(returnCode);
                                                    //tmpStm = statement;
                                            //}
                                            
                                            //var returnCode = statement.code.replace(/return\s*/,"");
                                            
                                            if (statement.codeType == STATEMENT_CODE_TYPE_EQUAL || 
                                                statement.codeType == STATEMENT_CODE_TYPE_RETURN ||
                                                statement.code.search("Console.write") == 0) {
                                    
                                                /*listPossibleData is object with the following structure:
                                                {
                                                    data: [{obj:obj, type:string("number"|"function"|"variable")},...],
                                                    variablesList: [{name:STRING, value: STRING}],   // list codes of variables (EMU.variable_name)
                                                    functionsList: [],   // list obj of functions from property data
                                                } */
                                                var listPossibleData = {data:[], variablesList:[], functionsList:[]},
                                                    valueCondition = "",
                                                    rpnInfo = null;
                                                    
                                                if (statement.code.search("Console.write") == 0) {
                                                    var tmpCode = ParserJS.replaceStrings(statement.code, "0");
                                                    valueCondition = tmpCode.contentFromEvenChars("(",")");                                                   
                                                } else if (statement.codeType == STATEMENT_CODE_TYPE_EQUAL) {
                                                    valueCondition = statement.varObj.value;
                                                } else if (statement.codeType == STATEMENT_CODE_TYPE_RETURN) {
                                                    valueCondition = statement.code.replace(/return\s*/, "");
                                                    valueCondition = valueCondition.replace(";",""); 
                                                }
                                                
                                                // na podstawie valueCondition, moge pobrac funkcje i zmienne
                                                
                                                function addObjToListPossibleData(_code) {
                                                    var _type = "",
                                                        _obj = null;
                                                    if (_obj = getExistFunction(_code)) {
                                                        _type = "function";                                                        
                                                    } else if(_code == +_code) {
                                                        _type = "number";
                                                        _obj = {code:+_code}
                                                    } else {
                                                        _type = "variable";
                                                        _obj = {code:_code};
                                                    }
                                                    var obj = {
                                                        obj: _obj,
                                                        type: _type
                                                    }
                                                    listPossibleData.data.push(obj);
                                                }
                                                
                                                // fill listPossibleData by data from infix
                                                if (valueCondition) {
                                                    rpnInfo = Algorithm.infix_to_rpn_to_info(valueCondition);
                                                    addObjToListPossibleData(valueCondition);
                                                }
                                                for(var i=0; i < rpnInfo.info.length; i++) {
                                                    var leftOpen = rpnInfo.info[i].leftOperand,
                                                        rightOpen = rpnInfo.info[i].rightOperand,
                                                        objFuncSeq = null;                                                    
                                                    if (leftOpen) {
                                                        addObjToListPossibleData(leftOpen.toString());
                                                    }
                                                    if (rightOpen) {
                                                        addObjToListPossibleData(rightOpen.toString());
                                                    }
                                                }
                                                
                                                if (listPossibleData.data.length > 0) {
                                                    var firstStmToSet = null;   
                                                    refStmEqual = statement;
                                                    /*cpyStmEqual = {
                                                        code: statement.varObj.name+" = "+statement.varObj.value,
                                                        type: "statement",
                                                        codeType: STATEMENT_CODE_TYPE_EQUAL,
                                                        lineNumber: statement.lineNumber,
                                                        varObj: $.extend(true, {}, statement.varObj)                                              
                                                    };*/
                                                   
                                                    for(var i=0; i < listPossibleData.data.length; i++) {
                                                        var singlePossibleData = listPossibleData.data[i],
                                                            singleObj = listPossibleData.data[i].obj;
                                                        if (singlePossibleData.type == "variable") {
                                                            var _variableName = singleObj.code.replace(/EMU./g,"");// (new CodeEditorStrings()).rmEMU(singleObj.code);
                                                            
                                                            if (EMU.hasOwnProperty(_variableName)) {                                                                
                                                                listPossibleData.variablesList.push({
                                                                    name: (new CodeEditorStrings()).rmEMU(_variableName),
                                                                    value: eval(singleObj.code) 
                                                                });    
                                                            }                                                            
                                                        }
                                                        if (singlePossibleData.type == "function") {
                                                            listPossibleData.functionsList.push(singlePossibleData.obj);
                                                        }
                                                    }
                                                   
                                                    // listPossibleData.data
                                                    
                                                    for(var i=0; i < listPossibleData.functionsList.length; i++) {
                                                        var //singlePossibleData = listPossibleData.data[i],
                                                            singleFunc = listPossibleData.functionsList[i],//listPossibleData.data[i].obj,
                                                            stm = null,
                                                            preFuncExeStm = null;
                                                            
                                                        setFunctionExeFromFuncInfo(singleFunc, statement);
                                                        preFuncExeStm = createStatementBeforeFunctionExe(singleFunc.statement, statement);                                                            
                                                        stm = singleFunc.statement;                                                                                                                                                                             
                                                        preFuncExeStm.variablesList = listPossibleData.variablesList;
                                                        preFuncExeStm.functionsList = listPossibleData.functionsList;
                                                        
                                                        if (!firstStmToSet) {
                                                            firstStmToSet = preFuncExeStm; 
                                                        }                                                            
                                                    
                                                        // po zastapieniu
                                                        if (refStmEqual) {
                                                            var generateFuncName = prefixEMU+".func_"+Generate.randomCharacters(8);
                                                            stm.functionObj.returnReference = generateFuncName;
                                                            
                                                            if (refStmEqual.codeType == STATEMENT_CODE_TYPE_EQUAL) {
                                                                refStmEqual.varObj.value = refStmEqual.varObj.value.replace(singleFunc.code, generateFuncName);
                                                                refStmEqual.code = refStmEqual.varObj.name+" = "+refStmEqual.varObj.value;
                                                                preFuncExeStm.functionObj.source = STATEMENT_CODE_TYPE_EQUAL;
                                                            } else if (refStmEqual.codeType == STATEMENT_CODE_TYPE_RETURN) {
                                                                refStmEqual.code = refStmEqual.code.replace(singleFunc.code, generateFuncName);
                                                                preFuncExeStm.functionObj.source = STATEMENT_CODE_TYPE_RETURN;
                                                            } else if (refStmEqual.code.search("Console.write") == 0) {
                                                                refStmEqual.code = refStmEqual.code.replace(singleFunc.code, generateFuncName);
                                                                preFuncExeStm.functionObj.source = "Console.write"; 
                                                            }                                                            
                                                                                                                                                                                 
                                                            if (statement.parent) {
                                                                statement.parent.deep.splice(statement.parent.iDeep, 0, preFuncExeStm, stm);
                                                            } else {
                                                                statements.splice(myIterator, 0, preFuncExeStm, stm);
                                                            }
                                                        }
                                                                                                                                                                     
                                                    }
                                                    // set current statement as first statement from list                                                    
                                                    //statement = listPossibleFunc[0].statement;
                                                    if (firstStmToSet) {
                                                        statement = firstStmToSet;
                                                    }
                                                    //setDebugInfo(statement);
                                                }
                                            }
                                            console.log("Next_stm  type: " +statement.type+", code: " +statement.code+", iDeep: " +statement.iDeep);

                                            // check if statement execute is function, and set appropriate it
                                            if (statement.type == "function") {                   
                                                var tmpListVars = EMU.listVars.filter(function(item) { 
                                                    return statement.functionObj.argsParams.indexOf(item) === -1;
                                                });                                                                              
                                                statement.code = setCodesToEMUVars(statement.code, tmpListVars);                                                
                                            }
                                            
                                            
                                        }
                                                                                    
                                        that.numberLineError = statement.lineNumber;
                                        
                                        if (typeof callbackLog === "function" && statement && that.numberLineError) {                    
                                            //callbackLog("[\""+that.boardNameError+"."+that.boardExtensionError+"\" Line:"+this.numberLineError+"] Find statement: "+statement.code+" type:"+statement.type+" codeType:"+statement.codeType);
                                        }    
                                        
                                        var isSetObjectName = true,
                                            definition = null;
                                                          
                                        // check to not created double object for this same reference
                                        // if exist set object from canvas
                                        /*
                                        if (statement.codeType == STATEMENT_CODE_TYPE_NEW_CLICKABLE_AREA ||
                                             statement.codeType == STATEMENT_CODE_TYPE_NEW_TEXTFIELD ||
                                             statement.codeType == STATEMENT_CODE_TYPE_NEW_TEXTEDIT ||
                                             statement.codeType == STATEMENT_CODE_TYPE_NEW_BUTTON) {
            
                                            definition = Editor.definitions.getDefinitionsOfNewObject(statement.code);
             
                                            var idObject = Editor.objectIndexByName(definition.variable);
                                            var object = Editor.objectByName(definition.variable);                                    
                                            if (idObject != undefined && object) {                    
                                                statement.code = "var "+definition.variable+" = Editor.editorObjects["+idObject+"];";
                                                if (object.type && 
                                                    (object.type == ELEMENT_TYPE_CLICKABLE_AREA ||
                                                     object.type == STATEMENT_CODE_TYPE_NEW_TEXTFIELD ||
                                                     object.type == ELEMENT_TYPE_TEXTEDIT ||
                                                     object.type == ELEMENT_TYPE_BUTTON)) {
                                                    var element = object.getElement();
                                                    object.setElement(element);
                                                }
                                                isSetObjectName = false; // name is already set
                                            }
                                        }*/
                
                                        var tabData = {},
                                            debuggerEditor = {},
                                            cmEditor = {},
                                            skipBeforeNewStatement = false;
                                            
                                        function openTabAndSet() {    
                                            parent.openBoardCode(that.boardNameError, that.boardExtensionError);
                                            tabData = codeEditor.findObjectOfTabsData([{search:"name", value: that.boardNameError},{search:"typeCode", value: that.boardExtensionError}]);
                                            debuggerEditor = tabData.codeMirrorDebug;
                                            cmEditor = tabData.codeMirror;
                                        }  
                                              
                                        function setDebugInfo(stm) {
                                            // show info in Debug
                                            if (stm && browserEmulator.isDebugger && debuggerEditor) {
                                                //var posEnd = {line: debuggerEditor.lastLine(), ch: 0 };
                                                EMU.infoEmu.step++;
                                                var posStart = {line: that.numberLineError-1, ch: 0},
                                                    posEnd = {line: that.numberLineError-1, ch: Number.MAX_VALUE},
                                                    detailsString = parent.strings.stringForCode(stm).trim();
                                                    shortString = parent.strings.stringForCode(stm, {shortString: true}).trim(),
                                                    shortStringWithDotsRight = shortString; 
                                                
                                                                                                
                                                if (stm.type == "for" || stm.type == "repeat") {                                                
                                                    // clear lines after current lines (only for statement.type == "for"/"repeat")
                                                    parent.clearEditorDebugForRange(that.boardNameError, that.boardExtensionError, {from: stm.lineNumber, to: stm.lineNumberEnd}  );
                                                    parent.clearDebugLineDetailsForRange(that.boardNameError, that.boardExtensionError, {from: stm.lineNumber, to: stm.lineNumberEnd} );                                                  
                                                }  
                                                
                                                parent.clearDebugLineDetailsForRange(that.boardNameError, that.boardExtensionError, {from: stm.lineNumber, to: stm.lineNumber} );
                                                //if (detailsString) {  //stm.type == "if" || stm.type == "for" || stm.type == "pre_function_exe") {                                                    
                                                    // add see details button
                                                    parent.addOrUpdateDebugLineDetails({
                                                        name: that.boardNameError,
                                                        typeCode: that.boardExtensionError,
                                                        lineNumber: stm.lineNumber,
                                                        statementType: stm.type,
                                                        generalText: shortString,
                                                        detailsText: detailsString,
                                                        //hasDetaisButton: 
                                                        statement: stm
                                                    });
                                                //}
                                                 
                                                // refresh content for debugger info
                                                parent.setEditorDebugForCodeLine(that.boardNameError, that.boardExtensionError, shortString, that.numberLineError-1);
                                                if (shortString) {
                                                    shortString = Generate.shortStringWithDotsRightSize(shortString, 60);
                                                }                                                
                                                debuggerEditor.replaceRange("[Step:"+EMU.infoEmu.step+"]"+shortString, posStart, posEnd);
                                                debuggerEditor.refresh();
                                                // auto open details if possible
                                                parent.showDebugLineDetailsLastIndex();
                                            }                         
                                        }          
                                        function getCorrectDeep(stm) {
                                            var resDeepSts = [];
                                            if (stm.ifObj && stm.ifObj.exeElse) {
                                                resDeepSts = stm.deepElse;
                                            } else {
                                                resDeepSts = stm.deep;
                                            } 
                                            return resDeepSts;
                                        }                                                                                                                                                                                                                                                      
                                        // set iDeep for last statement in block for parent (recursive)
                                        function setDeepsOfParent(stm) {
                                            var parentStm = stm.parent;
                                            if (parentStm) {                                                                   
                                                parentStm.iDeep++;
                                                skipBeforeNewStatement = false;
                                                var deepParentSts = getCorrectDeep(parentStm);
                                                if (parentStm.iDeep >= deepParentSts.length) { // deepParentSts
                                                    parentStm.iDeep = -1;                                                    
                                                    setDeepsOfParent(parentStm);
                                                } else { 
                                                    skipBeforeNewStatement = true;
                                                }                                              
                                                /*skipBeforeNewStatement = true;
                                                if (!parentStm.parent) {
                                                    skipBeforeNewStatement = false;
                                                }*/
                                            }
                                        }
                                        
                                        function setNextStatementForParent(stm) {
                                            var deepSts = getCorrectDeep(stm);
                                            if (deepSts && stm.iDeep < deepSts.length) {                                                                
                                                skipBeforeNewStatement = true;
                                            } else {
                                                stm.iDeep = -1;
                                                setDeepsOfParent(stm);
                                            }  
                                        }  
                                        // before exe statement, check type statement and exe appropriate action
                                        function exeStatement(statement) {
                                            
                                            if (statement.codeType == STATEMENT_CODE_TYPE_RETURN) {
                                               // var returnCode = statement.code.replace(/return\s*/,""),
                                               //     resultReturn = eval(returnCode),   // <<< 
                                               //     tmpStm = statement;
                                                var returnCode = statement.code.beetweenStrings("return",";").trim(),
                                                    resultReturn = returnCode,   // <<<
                                                    resultReturnExt = returnCode,   
                                                    tmpStm = statement;
                                                 
                                                // change return name variables to values
                                                for( var prop in EMU) {
                                                    var emuString = prefixEMU+"."+prop;
                                                    resultReturnExt = ParserJS.replaceWordsOutsideString(resultReturnExt, emuString, eval(emuString));
                                                }


                                                // finish current function block, because is 'return' keyword
                                                while(tmpStm.parent) {
                                                    tmpStm.parent.iDeep = tmpStm.parent.deep.length;
                                                    if (tmpStm.parent.type == "function_exe") {
                                                        //var rltValue = eval(resultReturn);
                                                        tmpStm.parent.functionObj.returnValueExt = resultReturnExt;
                                                        tmpStm.parent.functionObj.returnValue = resultReturn;
                                                        if (tmpStm.parent.functionObj.returnReference) {                                                             
                                                            eval(tmpStm.parent.functionObj.returnReference+" = "+ resultReturn);
                                                        }
                                                        break;
                                                    }
                                                    tmpStm = tmpStm.parent;
                                                };
                                                statement.varObj.returnValueExt = resultReturnExt;  
                                                statement.varObj.returnValue = resultReturn;
                                                return false;
                                            }
                                            return true;                                             
                                        }
                                        
                                            
                                        if (browserEmulator.isDebugger && !browserEmulator.waitForUser) {
                                            
                                            if (that.requireStepByStep) {
                                                browserEmulator.isNextStep = true;
                                            }                                                                                    
                                            if (browserEmulator.isNextStep) {
                                                
                                                //setTimeout(function() {
                                                    browserEmulator.isNextStep = false;
                                                    codeEditor.setDisabledButton("NEXT_STEP", false);                                                    
                                                //}, 3000);
                                                                                                                                            
                                                openTabAndSet();
                                                parent.clearLinesType("code_mirror_line_conditional");
                                                parent.removeDebugConsoleRead();
                                                
                                                //if (statement.type != "if") { // we draw horizontal debug line for all command, besides if                                              
                                                    parent.setDebugLine(that.boardNameError, that.boardExtensionError, that.numberLineError-1);
                                                //}
                                                parent.jumpToLine(that.boardNameError, that.boardExtensionError, that.numberLineError-1);
                                                parent.setReadOnlyDebugForAll(true);
                                                    
                                                // add empty line until can add info debugger
                                                /*for(;;) {                   // +1                                   
                                                    if (that.numberLineError > debuggerEditor.lineCount()) {
                                                        browserEmulator.debugCanCreateNewLine = true;
                                                        var posEnd = {line: debuggerEditor.lastLine(), ch: 0 };
                                                        debuggerEditor.replaceRange("\n", posEnd, posEnd);
                                                    } else {
                                                        browserEmulator.debugCanCreateNewLine = false;
                                                        break;
                                                    }
                                                }*/
                                                
                                                //setDebugInfo(statement); 
                                                
                                                //  if statement has parent and is 'for' then he become parent himself   
                                                if (statement.parent) {                                                
                                                    if (statement.type == "for" || statement.type == "if" || statement.type == "function_exe") {                                                    
                                                    } else {                                                
                                                        statement = statement.parent;
                                                    }
                                                }                                                   
                       
                                                if (statement.type == "function_exe" && statement.deep) {
                                                    var stmToDebugInfo = null;   
                                                    if (statement.iDeep == -1) {
                                                        // init function (parameters and values etc)
                                                        var args = statement.functionObj.argsParams,
                                                            vals = statement.functionObj.argsValues,
                                                            lvl = statement.functionObj.level,
                                                            listFuncVars = statement.functionObj.listVars;
                                                        
                                                        // set parameters of function by pass values
                                                        for(var i=0; i<args.length; i++) {
                                                            var functionName =  (new CodeEditorStrings()).rmEMU(statement.functionObj.name),
                                                                variableName = stringFunctionVariable(functionName, lvl, args[i]),
                                                                _val = '"'+vals[i]+'"';
                                                            if (_val.trim() == "true") _val = true;
                                                            else if (_val.trim() == "false") _val = false; 
                                                            else if (!isNaN(_val)) { _val = parseInt(_val); }   

                                                            emuStatement = prefixEMU+"."+variableName+' = '+vals[i]+';';
                                                            eval(emuStatement);
                                                        }
                                                                 
                                                        function setCodesForFunctions(tmpSts) {
                                                            //var nameVariable = prefixEMU+"."+stringFunctionVariable(functionName, lvl, listFuncVars[i]);                                                            
                                                            //if(tmpSts.type != "function_exe")
                                                            
                                                            // first change local modifier
                                                            tmpSts.code = setCodesToEMUFunction(tmpSts.code, functionName, lvl, listFuncVars);
                                                            // and next change by global modifier
                                                            tmpSts.code = setCodesToEMUVars(tmpSts.code);
                                                                                                                        
                                                            if (tmpSts.varObj) {                                                                
                                                                tmpSts.varObj.name = setCodesToEMUFunction(tmpSts.varObj.copy.name, functionName, lvl, listFuncVars);
                                                                tmpSts.varObj.value = setCodesToEMUFunction(tmpSts.varObj.copy.value, functionName, lvl, listFuncVars); 
                                                                tmpSts.varObj.name = setCodesToEMUVars(tmpSts.varObj.name); 
                                                                tmpSts.varObj.value = setCodesToEMUVars(tmpSts.varObj.value); 
                                                            }
                                                            if (tmpSts.ifObj && tmpSts.ifObj.rpn) {
                                                                tmpSts.ifObj.rpn = setCodesToEMUFunction(tmpSts.ifObj.copy.rpn, functionName, lvl, listFuncVars);
                                                                tmpSts.ifObj.rpn = setCodesToEMUVars(tmpSts.ifObj.rpn); 
                                                            }
                                                            if (tmpSts.forObj) {
                                                                var p0 = tmpSts.forObj.params[0];
                                                                var p0c = tmpSts.forObj.copy.params[0];
                                                                if (p0) {
                                                                    p0.code = setCodesToEMUFunction(p0c.code, functionName, lvl, listFuncVars); 
                                                                    p0.name = setCodesToEMUFunction(p0c.name, functionName, lvl, listFuncVars); 
                                                                    p0.value = setCodesToEMUFunction(p0c.value, functionName, lvl, listFuncVars); 
                                                                    p0.code = setCodesToEMUVars(p0.code); 
                                                                    p0.name = setCodesToEMUVars(p0.name); 
                                                                    p0.value = setCodesToEMUVars(p0.value); 
                                                                } 
                                                                var p1 = tmpSts.forObj.params[1];
                                                                var p1c = tmpSts.forObj.copy.params[1];
                                                                if (p1) {
                                                                    p1.code = setCodesToEMUFunction(p1c.code, functionName, lvl, listFuncVars); 
                                                                    p1.rpn = setCodesToEMUFunction(p1c.rpn, functionName, lvl, listFuncVars); 
                                                                    p1.code = setCodesToEMUVars(p1.code); 
                                                                    p1.rpn = setCodesToEMUVars(p1.rpn); 
                                                                }    
                                                                var p2 = tmpSts.forObj.params[2];
                                                                var p2c = tmpSts.forObj.copy.params[2];
                                                                if (p2) {
                                                                    p2.code = setCodesToEMUFunction(p2c.code, functionName, lvl, listFuncVars); 
                                                                    p2.name = setCodesToEMUFunction(p2c.name, functionName, lvl, listFuncVars); 
                                                                    p2.name2 = setCodesToEMUFunction(p2c.name2, functionName, lvl, listFuncVars); 
                                                                    p2.code = setCodesToEMUVars(p2.code); 
                                                                    p2.name = setCodesToEMUVars(p2.name); 
                                                                    p2.name2 = setCodesToEMUVars(p2.name2); 
                                                                }                                                             
                                                            }                                                                        
                             
                                                            
                                                            if (tmpSts.deep) {
                                                                for(var i=0; i < tmpSts.deep.length; i++){
                                                                    if (tmpSts.deep[i].type != "function_exe") {
                                                                        setCodesForFunctions(tmpSts.deep[i]);
                                                                    }
                                                                }
                                                            }                                                                            
                                                                              
                                                        }
                                                        setCodesForFunctions(statement);                                                                                                                            
                                                        statement.iDeep = 0;
                                                        statement.wasExecuted = true;
                                                        setDebugInfo(statement);
                                                        setNextStatementForParent(statement);
                                                         
                                                    } else if (statement.iDeep > -1 &&statement.iDeep < statement.deep.length) {
                                                                         
                                                        var _iDeep = statement.iDeep;                                       
                                                        if (exeStatement(statement.deep[_iDeep])) { eval(statement.deep[_iDeep].code); }                                                                                                                
                                                        //setDebugInfo(statement.deep[_iDeep]);
                                                        stmToDebugInfo = statement.deep[_iDeep];

                                                        if (!browserEmulator.waitForUser) {
                                                            statement.iDeep++;
                                                        }
                                                        setNextStatementForParent(statement);
                                                        
                                                    } else {
                                                        statement.iDeep = -1;
                                                        setDeepsOfParent(statement);
                                                    }
                                                    setDebugInfo(stmToDebugInfo);
                                                                                                                     
                                                } else if ((statement.type == "for" || statement.type == "repeat") && statement.deep) {
                                                    //console.log("DEBUG: statement: iDeep: " +statement.iDeep+"");
                                                    var stmToDebugInfo = null;   
                                                        
                                                    // loop for: init values
                                                    if (statement.iDeep < 0) {
                                                        var p0 = statement.forObj.params[0];
                                                        if (p0 && p0.code) {
                                                            var p0code = p0.code;                                           
                                                            eval(p0code);
                                                            //setDebugInfo(statement);
                                                            stmToDebugInfo = statement;
                                                        }
                                                    }
                                                    
                                                    // loop for: check conditional                                                        
                                                    if (statement.iDeep < 0 || statement.iDeep >= statement.deep.length) {    
                                                        
                                                        // third part of "for" loop 
                                                        if (statement.iDeep >= statement.deep.length) {
                                                            var p2 = statement.forObj.params[2];
                                                            if (p2 && p2.code) {
                                                                var p2code = p2.code; 
                                                                eval(p2code);
                                                                //setDebugInfo(statement);
                                                                stmToDebugInfo = statement;
                                                            }
                                                        }
                                                                                                                                                                                
                                                        var p1 = statement.forObj.params[1];
                                                        if (p1 && p1.code) {                 
                                                            var p1code = p1.code;                                             
                                                            var rpnInfo = Algorithm.infix_to_rpn_to_info(p1code);
                                                            if (rpnInfo.success) {        
                                                                
                                                                console.log("COND: " +rpnInfo.value+"");
                                                                console.log("EMU i: " +EMU.i+"");
                                                                
                                                                if (rpnInfo.value) {                                                                     
                                                                    statement.iDeep = 0;
                                                                    skipBeforeNewStatement = true;                                                                               
                                                                    if (statement.rangeFrom && statement.rangeTo) {
                                                                        parent.setCodeSelectionRange(that.boardNameError, that.boardExtensionError, statement.rangeFrom, statement.rangeTo, {lineClass:"code_mirror_line_conditional"});
                                                                    }                                                                                                                                                                                                               
                                                                } else { // 
                                                                    statement.iDeep = -1;
                                                                    setDeepsOfParent(statement);
                                                                }                                                   
                                                            }
                                                        }                                                        
                                                    } else {

                                                        var _iDeep = statement.iDeep;                                       
                                                        if (exeStatement(statement.deep[_iDeep])) { eval(statement.deep[_iDeep].code); }                                                                                                                
                                                        //setDebugInfo(statement.deep[_iDeep]);
                                                        stmToDebugInfo = statement.deep[_iDeep];                                                             
                                                     
                                                        if (!browserEmulator.waitForUser) {
                                                            statement.iDeep++;
                                                        }
                                                        skipBeforeNewStatement = true;
                                                        //console.log("DEBUG: statement2: iDeep: " +statement.iDeep+"");                                                                                                               
                                                    }
                                                    setDebugInfo(stmToDebugInfo);
                                                    
                                                } else if (statement.type == "if" && statement.deep) {
                                                    var stmToDebugInfo = null;                                                    
                                                    if (statement.ifObj && statement.ifObj.rpn) {  
                                                                                           
                                                        // first exe of statement so check conditional
                                                        if (statement.iDeep < 0) {  // deepSts && deepSts.length > 0 &&                                                                                        
                                                            var rpnInfo = Algorithm.rpn_to_info(statement.ifObj.rpn); 
                                                                                                                    
                                                            if (rpnInfo.success) {
                                                                if (rpnInfo.value) {                                                       
                                                                    statement.ifObj.exeElse = false;
                                                                    if (statement.rangeFrom && statement.rangeTo) {
                                                                        parent.setCodeSelectionRange(that.boardNameError, that.boardExtensionError, statement.rangeFrom, statement.rangeTo, {lineClass:"code_mirror_line_conditional"});
                                                                    }                                                                                                                                           
                                                                } else {
                                                                    statement.ifObj.exeElse = true;
                                                                    if (statement.rangeElseFrom && statement.rangeElseTo) {                                                                        
                                                                        parent.setCodeSelectionRange(that.boardNameError, that.boardExtensionError, statement.rangeElseFrom, statement.rangeElseTo, {lineClass:"code_mirror_line_conditional"});
                                                                    }
                                                                }                                                             
                                                            }
                                                            stmToDebugInfo = statement;                                                                 
                                                            statement.iDeep = 0;
                                                            setNextStatementForParent(statement);
                                                                                 
                                                        }  else { // after check conditional we iterate                                                             
                                                            //var deepSts = getCorrectDeep(statement);                                                            
                                                            //if (deepSts && deepSts.length > 0 && statement.iDeep < deepSts.length) {
                                                                
                                                                var _iDeep = statement.iDeep;                                       
                                                                if (exeStatement(statement.deep[_iDeep])) { eval(statement.deep[_iDeep].code); }                                                                                                                
                                                                stmToDebugInfo = statement.deep[_iDeep];                                                                 
                                                                 
                                                                if (!browserEmulator.waitForUser) {
                                                                    statement.iDeep++;
                                                                }                                                                
                                                                setNextStatementForParent(statement);
                                                                
                                                            //}
                                                        } 
                                                    }
                                                    setDebugInfo(stmToDebugInfo);
                                                    
                                                } else { // other 
                                                    eval(statement.code);
                                                    setDebugInfo(statement);                                                       
                                                }                                                
                                                          
                                                //parent.setEditorDebugForCode(that.boardNameError, that.boardExtensionError, codeToDebugger);
                                                //debuggerEditor.setOption("readOnly", true);                                            
                                                /*debuggerEditor.markText({line:0, ch:0}, posStart, {readOnly: true} );
                                                debuggerEditor.markText(posEnd, {line:debuggerEditor.lastLine(), ch:Number.MAX_VALUE}, {readOnly: true} );
                                                debuggerEditor.markText(posStart, posEnd, {readOnly: false} );
                                                */
                                                
                                            } else {
                                                skipBeforeNewStatement = true;
                                            }
                                        }                                                                                             
                                        
                                        if (!browserEmulator.isDebugger) {
                                            eval(statement.code);
                                        }
                                        
                                        // ustaw nieaktywne pole do pisania, ustal
                                        //
                                        
                                        if (browserEmulator.waitForUser) {  // console read
                                            openTabAndSet();
                                            browserEmulator.consoleCurrentCommandUser = debuggerEditor.getLine(that.numberLineError-1);
                                            //setReadOnlyDebugForLine
                                            //parent.setReadOnlyDebugForLine(that.boardNameError, that.boardExtensionError, that.numberLineError-1, false);
                                            parent.setReadOnlyDebugForAll(false);                                                                                       
                                            // when string != null, then set value
                                            //console.log("command NOT set");
                                                                                                
                                            var lengthInfoText = 'App expects you to put value and press enter:'.length,
                                                lengthReadText = browserEmulator.consoleCurrentCommandUser.length;
                                            parent.setDebugConsoleRead(that.boardNameError, that.boardExtensionError, that.numberLineError, {from: 0, to: lengthInfoText} );
                                            debuggerEditor.setCursor({line: that.numberLineError-1, ch: lengthReadText });
                                            debuggerEditor.refresh();
                                            debuggerEditor.focus();                                            
                                            //lengthReadText
                                            
                                            //if (consoleCurrentCommandUser)
                                            //browserEmulator.consoleCurrentCommandUser = browserEmulator.consoleCurrentCommandUser.substring(lengthReadText, );
                                            
                                            // consoleCurrentCommandUserConfirmed - debug console
                                            // consoleLastCommandUser - emu console
                                            if (browserEmulator.consoleLastCommandUser || browserEmulator.consoleCurrentCommandUserConfirmed) {
                                                
                                                // remove text 'App expects you to put value and press enter:'
                                                var lineRead = browserEmulator.consoleCurrentCommandUserConfirmed;
                                                if (lineRead) {
                                                    lineRead = lineRead.substring(lengthInfoText);
                                                    if (lineRead) {
                                                        lineRead = lineRead.trim();
                                                    }
                                                }                                                
                                                lineRead = lineRead || browserEmulator.consoleLastCommandUser;
                                                
                                                if (lineRead) {
                                                    var key = browserEmulator.consoleReadVariable,
                                                        commandUser = lineRead;
    
                                                    if (commandUser) {
                                                        eval(prefixEMU+'.'+key+' = "'+commandUser+'";');
                                                        //console.log(EMU);
                                                        browserEmulator.consoleLastCommandUser = null;
                                                        browserEmulator.consoleCurrentCommandUserConfirmed = null;
                                                        browserEmulator.waitForUser = false;
                                                        browserEmulator.isNextStep = true;
                                                        // HELLO MY FRIEND!!
                                                        if (statement.parent && statement.parent.deep) {
                                                            statement.parent.iDeep++;
                                                            skipBeforeNewStatement = true;
                                                        }
                                                    }                                                 
                                                } else {
                                                    skipBeforeNewStatement = true; 
                                                }
                                                
                                            } else {
                                                skipBeforeNewStatement = true; 
                                            }                                   
                                        }     
                                        
                                        //BACK
                                        if (skipBeforeNewStatement) {
                                            skipBeforeNewStatement = false;
                                            if (browserEmulator.isRunning) {
                                                window.setTimeout(executeCode, (that.requireStepByStep)?1:1); 
                                            }
                                            return; 
                                        }                                                                             
         
                                        /*if (definition && (statement.codeType == STATEMENT_CODE_TYPE_NEW_CLICKABLE_AREA ||
                                             statement.codeType == STATEMENT_CODE_TYPE_NEW_TEXTFIELD ||
                                             statement.codeType == STATEMENT_CODE_TYPE_NEW_TEXTEDIT ||
                                             statement.codeType == STATEMENT_CODE_TYPE_NEW_BUTTON )) {
                                            var command = "";
                                            
                                            // set name for created object
                                            if (isSetObjectName) {
                                                command = definition.variable+".name = "+"\""+definition.variable+"\""; // xxx.name = "xxx";
                                                eval(command);                                            
                                            }
                                            if(Editor.indexActiveBoard!=-1) {
                                                command = definition.variable+".parent = Editor.editorObjects["+Editor.indexActiveBoard+"];";
                                                eval(command);
                                            }
                                        }*/
                                       
                
                                        this.compileProgress = myIterator;    
                                        //console.log(statement.code +" line:"+statement.lineNumber+" gen:"+parent.getGeneratedCodeCountLine()+" status:"+this.compilationStatus)
                                        
                                    }
                                    
                                    // check deep
                                    var canIterate = true;
                                    
                                    // check conditional at the end, because will back to here from other function
                                    // and dont want to rewrite this variable
                                    if (canIterate) {                               
                                        myIterator++;                        
                                        if (myIterator >= statements.length) {
                                            myIterator = 0;
                                            break;
                                        } 
                                    }
        
                                }
                            }
                            
                            // check conditional at the end, because will back to here from other function
                            // and dont want to rewrite this variable
                            iTypeCode--;                        
                            if (iTypeCode < 0) {   // iTypeCode<=0
                                iTypeCode = 1; // <<<
                                break;
                            }  
                        }
                    }  
        
                    if (!browserEmulator.isDebugger) { // normal compilation (without debugger)
                        
                        // compilation success          
                        this.compilationStatus = COMPILATION_STATUS_DONE;        
                        
                        // prepare environment emulator & next run                                    
                        browserEmulator.afterCompilation();                                                          
                        browserEmulator.displayAllObjects(Editor.editorObjects);    
                                                        
                        setTimeout(function() { browserEmulator.refreshConsole(); }, 100);   
                        
                        if (typeof callbackSuccess === "function") {                    
                            callbackSuccess();
                        }
                    } else { // debug compilation 
                                      
                        function checkDebugEnd() {
                            if (browserEmulator.isRunning && !browserEmulator.isNextStep) {
                                window.setTimeout(checkDebugEnd, 200);
                            } else {
                                browserEmulator.isNextStep = true;
                                parent.stopDebugger();
                            } 
                            return; 
                        }
                        browserEmulator.isNextStep = false;
                        checkDebugEnd();
                    }
                                    
                } catch (e) {
                    this.compilationStatus = COMPILATION_STATUS_ERROR;
                    browserEmulator.clear();
                    if (typeof callbackLog === "function") {                    
                        callbackLog("[Line:"+that.numberLineError+"] "+e.name+": "+e.message+"");
                    }        
                    if (typeof callbackFailed === "function") {                    
                        callbackFailed();
                    }                             
                }
                finally {
                    AJAX_ASYNC = true;
                    Editor.blockedAddedToObjectsEditor = false;
                } 
            }
            executeCode();
        
       } // end of function runEmuApp
    }
    
 
    
    		
}
