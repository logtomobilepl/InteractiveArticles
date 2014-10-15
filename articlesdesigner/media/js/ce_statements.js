////////////////////
// CODE EDITOR Statements

var STATEMENT_CODE_TYPE_EQUAL = "qual";
var STATEMENT_CODE_TYPE_INCREMENT = "increment";
var STATEMENT_CODE_TYPE_DECREMENT = "decrement";
var STATEMENT_CODE_TYPE_RETURN = "return"; 
var STATEMENT_CODE_TYPE_SUM = "sum+=";
var STATEMENT_CODE_TYPE_MINUS = "sum-=";
var STATEMENT_CODE_TYPE_MULTI = "sum*=";
var STATEMENT_CODE_TYPE_DIV = "sum/=";
var STATEMENT_CODE_TYPE_ACTION = "action";
var STATEMENT_CODE_TYPE_UNDEFINED = "undefined_object";
var STATEMENT_CODE_TYPE_NEW_CLICKABLE_AREA = "new_clickable_area";
var STATEMENT_CODE_TYPE_NEW_TEXTFIELD = "new_textfield";
var STATEMENT_CODE_TYPE_NEW_TEXTEDIT = "new_textedit";
var STATEMENT_CODE_TYPE_NEW_BUTTON = "new_button";
var STATEMENT_CODE_TYPE_NEW_IMAGE = "new_image";
var STATEMENT_CODE_TYPE_NEW_MAP = "new_map";


function CodeEditorStatements() {
    var that = this;
    
   this.createStatementObj = function() {
        var statementObj = {
            code: "", // code of single statemenlineNumbert or block as statement
            lineNumber: -1, // line of statement 
            type: undefined, // {"class", "function", "function_prototype", "for", "if", "var", "statement", etc} 
            codeType: undefined, // {STATEMENT_CODE_TYPE_EQUAL, STATEMENT_CODE_TYPE_ACTION, STATEMENT_CODE_TYPE_NEW_CLICKABLE_AREA, STATEMENT_CODE_TYPE_NEW_TEXTFIELD etc}
            lineNumberEnd: -1, // end of line
            
            // optional =>  varObj:{name, value, objectType:(Array, Object, other)}
            // optional =>  ifObj:{conditional}
        };
        return statementObj;
   }           
    
    this.getStatementCodeType = function(statementCode) { 
        /*var regExpCA = new Array("(var)\\s*[^=]*=\\s*(new)\\s*(ClickableArea\\(\\);)");                
        var regExpLabel = new Array("(var)\\s*[^=]*=\\s*(new)\\s*(Label\\(\\);)");                
        var regExpTE = new Array("(var)\\s*[^=]*=\\s*(new)\\s*(TextEdit\\(\\);)");                
        var regExpBtn = new Array("(var)\\s*[^=]*=\\s*(new)\\s*(Button\\(\\);)");                
        var equal = new RegExp("[^=]=\\s*(\"[^\"]*\"|[\\d]+);");  //[^=]=\s*("[^"]*"|\d*); // RegExp("={1}[^=]*[^{]*");
        var actionRegExp = new RegExp("[\\w]*.addAction\\([^\\)]*\\);");  
        */       
        if (statementCode.match(codeEditor.templates.regExpDeclarationNewClickableArea())) {
            return STATEMENT_CODE_TYPE_NEW_CLICKABLE_AREA;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationNewTextField())) {
            return STATEMENT_CODE_TYPE_NEW_TEXTFIELD;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationNewTextEdit())) {
            return STATEMENT_CODE_TYPE_NEW_TEXTEDIT;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationNewButton())) {
            return STATEMENT_CODE_TYPE_NEW_BUTTON;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationNewImage())) {
            return STATEMENT_CODE_TYPE_NEW_IMAGE;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationNewMap())) {
            return STATEMENT_CODE_TYPE_NEW_MAP;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationSum())) {
            return STATEMENT_CODE_TYPE_SUM;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationMinus())) {
            return STATEMENT_CODE_TYPE_MINUS;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationMulti())) {
            return STATEMENT_CODE_TYPE_MULTI;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationDiv())) {
            return STATEMENT_CODE_TYPE_DIV;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationEqual())) {
            return STATEMENT_CODE_TYPE_EQUAL;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationReturn())) {
            return STATEMENT_CODE_TYPE_RETURN;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationIncrement())) {
            return STATEMENT_CODE_TYPE_INCREMENT;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationDecrement())) {
            return STATEMENT_CODE_TYPE_DECREMENT;
        } else if (statementCode.match(codeEditor.templates.regExpDeclarationAddAction())) {
            return STATEMENT_CODE_TYPE_ACTION;
        } else {
            return STATEMENT_CODE_TYPE_UNDEFINED;
        }
    }
    
    /*this.codeWithoutSingleComments =function(linesCode) {
        var result = new Array();
        for(var iLine=0; iLine < linesCode.length; iLine++) {
            var lineArray = linesCode[iLine].split("//");
            if (lineArray.length > 0) {
                result.push(lineArray[0]);
            } else {
                result.push(linesCode[iLine]);
            }
        }
        return result;        
    }*/
    
    this.removeComments = function(string) {               
        var matched = string.match(/\/\*(.|\n)*?\*\//g, ""),
            lCount = 0;
        if (matched) {
            for(var i=0; i < matched.length; i++) {
                lCount =  matched[i].split("\n").length;
                var seriesNL = new Array(lCount).join("\n");
                string = string.replace(matched[i], seriesNL);            
            }
        }
        //console.log(m1);
        string = string.replace(/\/\/.*?\n/g, "\n"); 
        return string;
    }

    this.getFunctionObjFromStatement = function(statement) {
        var functionObj = {};
        if (statement.type == "function") {
            var code = statement.code,
                functionName = code.beetweenStrings(new RegExp("function\\s*",""), "\\("),
                functionArgs = code.beetweenStrings("\\(", "\\)");
            functionName = functionName.replace(new RegExp("function\\s*",""), "");
            functionObj.name = functionName;
            functionObj.argsString = functionArgs;
            functionObj.argsParams = ParserJS.getParametersFromString(functionArgs);
            functionObj.level = 0;
            functionObj.returnValue = undefined;
        } else if (statement.type == "function_prototype") {            
            var code = statement.code,
                functionName = ParserJS.betweenCharsWithoutString(code, undefined, /^(=)$/ ),
                functionArgs = code.beetweenStrings("\\(", "\\)");
            
            functionName = functionName.replace(/\s+/g, "");
            functionObj.name = functionName;
            functionObj.nameParams = functionName.split(/\s*\.\s*/);
            functionObj.argsString = functionArgs;
            functionObj.argsParams = ParserJS.getParametersFromString(functionArgs);
        }
        functionObj.copy = $.extend(true,{},functionObj);
        return functionObj; 
    } 
    
    this.getClassNameFromStatement = function(statement) {
        if (statement.type == "class") {
            var code = statement.code;
             
            var classNameExp = new RegExp("class\\s*","");
            code = code.replace(classNameExp,"");
            var classNameArray = code.split(" ");
            if (classNameArray.length>0) {
                return classNameArray[0];
            }
        }
        return "";
    }
    
    this.getVarObjFromStatement = function(statement) {
        var varObj = {};
        if (statement.type == "var" && statement.code && statement.code.trim()) {
            var code = statement.code;
            
            var varTypeDeclar =  code.beetweenStrings(/var\s*/,";"),
                varTypeEquals =  code.beetweenStrings(/var\s*/,"=");///[=+\-*\\]/);
                
            if (varTypeDeclar) { varTypeDeclar = varTypeDeclar.trim();}
            if (varTypeEquals) { varTypeEquals = varTypeEquals.trim();}            
            varObj.name = varTypeEquals || varTypeDeclar;
            varObj.nameParams = varObj.name.split(/\s*\.\s*/);            
            
            var objectType = statement.code.beetweenStrings("new","\\(").trim();
            varObj.objectType = objectType;
            if (objectType == "Array") {
                
                var params = ParserJS.betweenCharsWithoutString(statement.code, "(",")"),
                    arrParr = params.split(","); 
                varObj.params = [];
                for(var i=0; i < arrParr.length; i++) {
                    arrParr[i] = arrParr[i].trim();
                    if (arrParr[i]) {
                        varObj.params.push(arrParr[i]);
                    }
                }                
                //var params = statement.code.beetweenStrings("\\(","\\)",-2).trim();
                //varObj.params = params.split(",");
            } else {
                var value = statement.code.beetweenChars("=",";").trim();
                varObj.value = value;                
            }
        } else if (statement.type == "statement") {
            // XX = YY; XX += YY; XX -= YY;   etc
            var sts = /[A-Za-z0-9_-]*\s*[=+\-*\\]{0,2}\s*[^;]*;/,         //  /[A-Za-z0-9_-]*\s*=\s*[^;]*;/,
                code = statement.code,
                name = ParserJS.betweenCharsWithoutString(code, undefined, /^(=)$/ ),
                value = ParserJS.betweenCharsWithoutString(code, /^(=)$/, /^;$/ );
            //var result5 = ParserJS.betweenCharsWithoutString(code, /^[A-Za-z0-9_-]$/, /^[=+\-*\\]$/ );
            
            if (name) {  
                name = name.trim();              
                if (name.isLastChar("+") || name.isLastChar("-") || name.isLastChar("*") || name.isLastChar("/")) {
                    name = name.substring(0, name.length-1).trim();    
                }
                varObj.name = name;
                varObj.nameParams = varObj.name.split(/\s*\.\s*/);  
                
            }
            if (value) {
                value = value.trim();
                varObj.value = value;
            }            
                
            /*if (code.match(sts)) {   //[=+\-*\\]
                var nameArray = code.split(/[=+\-*\/]/);  // "="                                
                if (nameArray.length >= 2) {
                    varObj.name = nameArray[0].trim();
                    varObj.value = code.beetweenChars("=",";").trim();
                }  
            }*/
            // XX++; XX--;  
            var stsInc = code.match(codeEditor.templates.regExpDeclarationIncrement()),
                stsDec = code.match(codeEditor.templates.regExpDeclarationDecrement()),
                code = statement.code;  
            if (stsInc || stsDec) {
                var nameArray = []; 
                if (stsInc) nameArray = code.split("++");   
                if (stsDec) nameArray = code.split("--");                                                
                if (nameArray.length >= 1) {
                    varObj.name = nameArray[0].trim();
                    varObj.nameParams = varObj.name.split(/\s*\.\s*/); 
                }  
            }
        }  
        var expression = null; 
        if (statement.code.search("console.write") == 0) {
            expression = ParserJS.replaceStrings(statement.code, "0");
            expression = expression.contentFromEvenChars("(",")");                                                   
        } else if (statement.codeType == STATEMENT_CODE_TYPE_EQUAL) {
            expression = varObj.value;
        } else if (statement.codeType == STATEMENT_CODE_TYPE_RETURN) {
            expression = statement.code.replace(/return\s*/, ""); 
            expression = expression.replace(";",""); 
            varObj.expression = expression;
        }
        varObj.expression = expression; 
        varObj.copy = $.extend(true,{},varObj);     
        return varObj;
    }
    
    this.getConditionFromStatement = function(statement) {
        var ifObj = {};
        if (statement.type == "if") {
            var code = statement.code,
                conditionString =  statement.code.contentFromEvenChars("(",")"); //statement.code.beetweenStrings("\\(","\\)",1).trim();
                
            if (conditionString) {
                var rpn_details = Algorithm.infix_to_rpn_details(conditionString);
                ifObj.rpn = rpn_details.out;
                ifObj.rpnDetails = rpn_details.outDetails;
            }
            // add conditional
        }
        ifObj.copy = $.extend(true,{},ifObj);
        return ifObj;
    }
    
       
    this.getLoopFromStatement = function(statement) {
        //iDeep - index command in for,  -1 = none
        // firstExe of loop
        var loopObj = {params:[], firstExe: true};  
        if (statement.type == "for" || statement.type == "repeat") {
            var code = statement.code,
                forParametersString =  statement.code.contentFromEvenChars("(",")"),
                parametersArray = forParametersString.split(";");             
             
            if (parametersArray && parametersArray.length == 3) {  // for([0];[1];[2])
                var p0 = parametersArray[0].trim(); // for([0];;)
                if (p0) {
                    var data = [];
                    p0 = p0.replace(/var\s*/, "").trim();
                    loopObj.params[0] = {};
                    loopObj.params[0].code = p0;
                    data = p0.split(/\s*=\s*/); // data[0] = variable name, data[1] = variable value                    
                    if (data.length == 2) {
                        loopObj.params[0].name = data[0];
                        loopObj.params[0].value = data[1];
                    }                    
                }
                var p1 = parametersArray[1].trim(); // for(;[1];)
                if (p1) {
                    var rpn_details =  Algorithm.infix_to_rpn_details(p1); 
                    if (rpn_details.out) {
                        loopObj.params[1] = {};
                        loopObj.params[1].code = p1;
                        loopObj.params[1].rpn = rpn_details.out;
                        loopObj.params[1].rpnDetails = rpn_details.outDetails;
                    }                                                          
                }
                var p2 = parametersArray[2].trim(); // for(;;[2])   // a+=2,  name operator name2
                if (p2) {                    
                    var varName = p2.match(/\w*/);
                    loopObj.params[2] = {};
                    loopObj.params[2].code = p2;
                    if (varName[0]) {
                        loopObj.params[2].name = varName[0];
                    }
                    if (varName[1]) {
                        loopObj.params[2].name2 = varName[1];
                    }
                    var operator = p2.match(/[^\w\s\[\]\(\)]+/);
                    if (operator[0]) {
                        loopObj.params[2].operator = operator[0].trim();
                    }                                                     
                }
            } 
        }
        loopObj.copy = $.extend(true,{},loopObj);
        return loopObj;
    }         
    
    this.parametersOfAction = function(codeLine) {
        var action = {},
            res = codeLine.match(/"[^"]*"/g);
        for(var i=0; i < res.length; i++) {
            res[i] = res[i].replace(/"/g,"");
        }
        action.type = (res.length > 0)?res[0]:"";
        action.action = (res.length > 1)?res[1]:"";
        action.name = (res.length > 2)?res[2]:"";
        action.key = (res.length > 3)?res[3]:"";
        return action;
    }
    
    
    var isStringAtTheBeginningArray = function(string, array) {
        var stringArray = array.join(" ");        
        stringArray = stringArray.trim();
        var index = stringArray.search(string);
        if (index == 0) {
            return true;
        } else {
            return false;
        }
    }
    
    /*var removeStringAtTheBeginningArray = function() {
        var stringArray = array.join(" ");        
        stringArray = stringArray.trim();
        var index = stringArray.search(string);
        if (index == 0) {
            return true;
        } else {
            return false;
        }
    }*/
   

    // algorithm for add curly bracket '}' at the end of block  
    this.detectEndOfStatementWithAddCurlyBracket = function(iChar, iL, linesObj, isAddBracket) {
        var qnHelper = new QuotationHelper();
        for(; iL < linesObj.length; iL++) {                    
            for(; iChar < linesObj[iL].code.length; iChar++) { 
                var line = linesObj[iL].code,
                    ch = line[iChar];
                qnHelper.sendChar(ch);
                                
                var isAnyQuotations  = qnHelper.isAnyQuotations();                                               
                if (ch == ";" && !isAnyQuotations) {
                    if (isAddBracket) {
                        linesObj[iL].code = linesObj[iL].code.splice(iChar+1, 0, "}");
                        iChar++;    
                    }                    
                    iChar++;
                    return {line: iL, ch: iChar};
                }
            }
            iChar = 0;
        } 
        return null;
    }
        
      
    this.checkBeginOfStatement = function(iChar, _iL, linesObj, _initStatement) {
        var uniqueStm = null,
            hasNested = false,  // from if  (thats mean, that 'else' not exist)
            areBrackets = false, //  already exists block (brackets {...})
            wasAddedBracket = false,
            interrupt = false,
            maximumCallStack = 250,
            iL = _iL;
            
        function isNextElse(_iL, _iChar) {
            var copyArray = ObjectHelper.copyParamOfArrayObject("code", linesObj),
                substrArray = copyArray.substring({line: _iL, ch: _iChar});              
            //console.log(substrArray);
            // string after bracket
            var copyString = substrArray.join(" ").trim();
            if (copyString.search(/else/) == 0 && copyString.search(/else[\w]/) != 0) {
                return true;
            } else {
                return false;
            }
        }
        
        function checkStatement() {
     
          maximumCallStack--;
          if (maximumCallStack <= 0) {
              interrupt = true;
              return;
          }  
            
          try {
            
            // get code remain after cut  (if () _REMAIN_)
            var lineRemain = linesObj[iL].code.substring(iChar, linesObj[iL].code.length),
                lineRemainTrim = lineRemain.trim();  

            // we check this line only if current line code is not empty
            if (lineRemainTrim) {    
                var foundAny = false;

                // ELSE
                if (!foundAny && _initStatement.type == "if") {     
                                                       
                    var copyArray = ObjectHelper.copyParamOfArrayObject("code", linesObj),
                        substrArray = copyArray.substring({line: iL, ch: iChar});              
                    //console.log(substrArray);
                    // string after bracket
                    var copyString = substrArray.join(" ").trim();
                    if (copyString.search(/else/) == 0 && copyString.search(/else[\w]/) != 0) {
                        //console.log("has else");                    
                        var posArr = copyArray.search(/else/);
                        //isElse = true;
                        foundAny = true;
                        //wasAddedElse = true;
                        iL = posArr.line;
                        iChar = posArr.ch+4;  // 4 = length of 'else' word
                        
                        // check what is next,  (} ?)
                        /*substrArray = copyArray.substring({line: iL, ch: iChar}).trim();
                        copyString = substrArray.join(" ").trim();
                        if (copyString) {
                            if (copyString)
                        }*/
                        
                        //checkStatement(); // recurse for 'else block'  <<
                        //interrupt = true;
                        
                        //if (!hasNested) {                             
                        //    wasMainElse = true;
                        //}                        

                    } /*else {  // not found else                        
                        if (!hasNested) {
                            linesObj[iL].code = linesObj[iL].code.splice(iChar, 0, "}");
                            wasAddedBracket = true;
                            iChar++;   
                                                     
                            interrupt = true;
                            return;
                            //foundAny = true;
                        }                                                                       
                    }*/
                }

                if (!foundAny) {
                    areBrackets = false;
                    if (lineRemainTrim[0] == "{") {
                        areBrackets = true;
                    }
                    
                    // not found brackets (blocks) and  not be add bracket 
                    if (!areBrackets && !wasAddedBracket) {
                        linesObj[iL].code = linesObj[iL].code.splice(iChar, 0, "{");
                        wasAddedBracket = true;
                        iChar++;
                    }
                }
       
                // miss lines with blocks 
                if (!foundAny && areBrackets) {     // exits block here  { ... }
                    foundAny = true;
                    // drop lines with even brackets '{ ... }'                                
                    var copyArray = ObjectHelper.copyParamOfArrayObject("code", linesObj);
                    //copyArray = copyArray.substring({line: iL, ch: iChar});
                    var rangeArr = copyArray.rangeFromEvenChars("{","}", {includeChars: true, startPos:{line: iL, ch: iChar} });                                                
                    if (rangeArr) {
                        iL = rangeArr.to.line;
                        iChar = rangeArr.to.ch;
                        
                            if (hasNested && !isNextElse(iL, iChar)) {                         
                                linesObj[iL].code = linesObj[iL].code.splice(iChar+1, 0, "}");                       
                                interrupt = true;
                                return;
                            }                        
                        
                        if (iChar < linesObj[iL].code.length) {
                            iChar ++;
                        }
                        if (iChar >= linesObj[iL].code.length) {
                            iChar = 0;
                            iL++;
                        }
                        
                            // for main if..else..
                            if (!hasNested && !isNextElse(iL, iChar)) {
                                interrupt = true;
                                return;
                            }
                        
                    }            
                }                
                
           
                // 
                if (!foundAny) {      
                    lineRemain = linesObj[iL].code.substring(iChar, linesObj[iL].code.length);
                    // IF
                    var uniqueIfStm = that.getFirstWordWithEvenChars(lineRemain, "if", "(", ")");
                    var uniqueForStm = that.getFirstWordWithEvenChars(lineRemain, "for", "(", ")");                    
                    var uniqueRepeatStm = that.getFirstWordWithEvenChars(lineRemain, "repeat", "(", ")");                    
                    uniqueStm = uniqueIfStm || uniqueForStm || uniqueRepeatStm;                    
                    if (uniqueStm) {  
                        foundAny = true;
                        hasNested = true;  
                        iChar += uniqueStm.range.to;
                        if (iChar > linesObj[iL].code.length) {
                            iChar = 0;
                            iL++; 
                        }
                    }

                }
          
                // found any statement (besides command key) and add end bracket
                if (!foundAny) {
                    if (!hasNested) {                        
                        var endPos = that.detectEndOfStatementWithAddCurlyBracket(iChar, iL, linesObj, true);
                        if (endPos) {
                            // put close bracket
                            foundAny = true;
                            wasAddedBracket = false;
                            iL = endPos.line;
                            iChar = endPos.ch;
                                
                            //!hasNested &&    
                            
                            if (!isNextElse(iL, iChar)) {
                                interrupt = true;
                                return;
                            }                            
                        }
                    } 
                    //if (wasAddedElse) {
                    //    interrupt = true;
                    //}
                }
                
                
                // found any statement (besides command key) without add bracket (skip command)
                if (!foundAny) {
                     
                    var endPos = that.detectEndOfStatementWithAddCurlyBracket(iChar, iL, linesObj, false);
                    if (endPos) {
                        // put close bracket
                        foundAny = true;
                        iL = endPos.line;
                        iChar = endPos.ch;
                        
                            if (hasNested && !isNextElse(iL, iChar)) {                         
                                linesObj[iL].code = linesObj[iL].code.splice(iChar+1, 0, "}");                       
                                interrupt = true;
                                return;
                            } 
                         
                        // wykrywam czy jest statement
                    }                    
                }
                
                // execute to end of line, if line empty then change to new line
                if (foundAny) {
                    checkStatement();
                }
                                
            }
          } catch(e) {
              interrupt = true;
              return;
          }  
        }
                

        for(;iL < linesObj.length; ) {
            checkStatement(); // first for 'basic block' 
            
            if (interrupt) {
               break;
            }
            
            iL++;
            iChar=0;
            /*if (iChar >= linesObj[iL].code.length) {
                iChar = 0;
                iL++;
            }*/   
        }
    }

   
    this.getFirstWordWithEvenChars = function(_code, word, charLeft, charRight) {
        var firstWordRegExp =  /\w*/, 
            code = _code, // not used this  trim, because, we cannot change 'code' (we calculate range later)
            result = {
                type: "",  // word
                codeToSave: "", // code between chars (left & right),
                range: null
            }            
            
        var checkFirstWord = code.trim();            
        if (checkFirstWord.search(firstWordRegExp) == 0) {                
            var wordRegex = checkFirstWord.match(firstWordRegExp)[0];
            if (wordRegex == word) {
                result.type = word;
                var range = code.rangeFromEvenChars(charLeft, charRight);                
                if (range && range.to > 0) {
                    result.range = {from: 0, to: range.to + 2}
                    result.codeToSave = code.substring(0, result.range.to);
                    return result;
                }
            }
        } 
        return null;
    }

    
    this.statementFromCode = function(_code, startLineNumber, lvl) {        
        _code = that.removeComments(_code);        
        var statements = [],
            linesCode = _code.split("\n"),
            linesObj = [],
            copyLinesCodes = [],
            codeToSave = "",
            codeOfBlock = "",
            codeOfBlockRangeFrom = {line:0, ch:0},
            codeOfBlockRangeTo = {line:0, ch:0},
            iL = 0,
            iChar = 0,
            //offsetChar = 0,
            classExp = new RegExp("class\\s*[^\\{]*",""), // RegExp("[^;]*;{1}","");
            functionExp = new RegExp("function\\s*.*\\([^\\)]*\\)\\s*",""), // RegExp("[^;]*;{1}","");
            functionPrototypeRegExp = new RegExp("[^\\.]*.[^\\.]*.\\s*=\\s*function\\s*.*\\(.*\\)",""),  
            forRegExp = new RegExp("for\\s*\\((.*;){2}.*\\)\\s*",""),  
            repeatRegExp = /repeat\s*\([^\)]*\)\s*/,        //  /repeat\s*\(.*\)\s*[^{]*/,         //     /repeat\s*\(\s*/
               
            //ifRegExp = /if\s*\(\s*[\(]*[^{]*[\)]*\s*\)\s*(\w|{|\s*)/,      //   /\w*/,  //  /if\s*\(\s*[\(]*[^{]*[\)]*\s*\)\s*/,     // new RegExp("if\\s*\\(",""),   
            varExp = new RegExp("var\\s+[^;]*[^;]",""), // RegExp("[^;]*;{1}","");
            statementExp = new RegExp("[^;]*[^;]",""), // [^;]*[^;]  // RegExp("[^;]*;{1}","");
            actionExp =  codeEditor.templates.regExpDeclarationAddActionWithoutEndSemicolon(),
            firstWordRegExp =  /\w*/,
            regExp = undefined;
                        
        if (!startLineNumber) {
            startLineNumber = 0;
        }
        if (!lvl) {
            lvl = 0;
        }
        
        //linesCode = that.codeWithoutSingleComments(linesCode);        
       
        for(iL=0; iL < linesCode.length; iL++) {
            var lineObj = { 
                code: linesCode[iL],
                numberLine: (iL+1)+startLineNumber, 
            }
            linesObj.push(lineObj);
        }
        copyLinesCodes = ObjectHelper.copyParamOfArrayObject("code", linesObj);                
        
        iL = 0;
        
        while(iL < linesObj.length) {
            
            var isFindAnyStatement = false,
                code = linesObj[iL].code,  //<<  linesObj[iL].code.trim()
                codeTrim = "",
                indexCommand = -1,
                statement = { 
                    lineNumber: (iL+1)+startLineNumber
                };
                                
            iChar=0; //<<<<
            
            //offsetChar = indexFirstChar(linesObj[iL].code); //<<
             
            // remove sign for begin string
            for(;;) {
                if (code.length > 0) {                    
                    if (code[0] == ";") {                
                        code = code.searchAndSubstring(";");
                    } else {
                        break;
                    }   
                } else {
                    break;
                }
            }
            
            function changeConsoleCode(stm) {
                stm.code = stm.code.replace(/console\.read/g, "Console.read");
                stm.code = stm.code.replace(/console\.write/g, "Console.write");                
            }
                
            var areBrackets = false,
                typeFirstBracket = "",  //  ""|"open"|"close"
                countOpenBrackets = 0,
                countCloseBrackets = 0,
                qnHelper = new QuotationHelper(),
                isUndefinedStatement = false;

            regExp = undefined;
            
            // pre configure statement (etc. add brackets for 'if' statement)
            /*->*//*var findUniqueStatement = false,
                ifConditition = "";
            if (code.search(firstWordRegExp) == 0) {                
                var word = code.match(firstWordRegExp)[0];
                if (word == "if") {
                    statement.type = "if";
                    var range = code.rangeFromEvenChars("(",")");
                    if (range && range.to > 0) {
                        ifConditition = code.substring(0, range.to+2);
                        findUniqueStatement = true;
                    }
                }
            }*/
           
            indexCommand = code.indexFirstNotEmptyChar();            
            codeTrim = code.trim();
            
            var uniqueStm = that.getFirstWordWithEvenChars(codeTrim, "if", "(", ")");
            if (uniqueStm) {
                statement.type = uniqueStm.type;
            }
            
            if (statement.type == "if") {
            } else if (codeTrim.search(classExp) == 0) {
                regExp = classExp;
                statement.type = "class";
            } else if (codeTrim.search(functionExp) == 0) {
                regExp = functionExp;
                statement.type = "function";                
            } else if (codeTrim.search(functionPrototypeRegExp) == 0) {
                regExp = functionPrototypeRegExp;
                statement.type = "function_prototype";
            } else if (codeTrim.search(forRegExp) == 0) {
                regExp = forRegExp;
                statement.type = "for";
            } else if (codeTrim.search(repeatRegExp) == 0) {
                regExp = repeatRegExp;
                statement.type = "repeat";
            } else /* if (codeTrim.search(ifRegExp) == 0) {
                regExp = ifRegExp;
                statement.type = "if";
            } else */ if (codeTrim.search(varExp) == 0) {
                regExp = varExp;
                statement.type = "var";
            } else if (codeTrim.search(actionExp) == 0) {
                regExp = actionExp;
                statement.type = undefined;
            } else if (codeTrim.search(statementExp) == 0) { // || code == "") {                           
                regExp = statementExp;
                isUndefinedStatement = true;
            } else {
             //  isUndefinedStatement = true;
            }

            if (regExp || uniqueStm) { 
               isFindAnyStatement = true;
               codeOfBlock = "";  
               codeToSave = "";               
               codeOfBlockRangeFrom = null;
               codeOfBlockRangeTo = null;
               
               if (uniqueStm) {
                   if (code) {
                      codeToSave = uniqueStm.codeToSave;
                      //code =  code.replace(uniqueStm.codeToSave, "");//.trim() <<
                      iChar += indexCommand + codeToSave.length;
                   }                   
               } else if (regExp && !isUndefinedStatement) {               
                   if (code) {
                      codeToSave = code.match(regExp)[0]; // get first fragment of statement
                      //code = code.replace(regExp,""); //<<<<
                      iChar += indexCommand + codeToSave.length;
                   }                   
               }

               //offsetChar += codeToSave.length; //<<
               //codeOfBlockRangeFrom = {line: iL, ch: iChar }

               // add bracket for single statement (for, if, repeat)
               if (statement.type == "if" || statement.type == "for" || statement.type == "repeat") {
                   // algorithm begin after cut section if(xxx) |->
                   linesObj[iL].code = code;
                   //iChar = 0; //<<<<
                   // remember! in below function we work on reference linesObj (reference will be modified)
                   that.checkBeginOfStatement(iChar, iL, linesObj, statement);
                   // we update for 'code' new value from array
                   code = linesObj[iL].code;
               }
            
               for(; ; iChar++) {  //<<<< iChar=0 
                                      
                   if (iChar < code.length) { //<<<< code.length > 0 
                                
                       if (!codeOfBlockRangeFrom && code[iChar].trim()) {
                           codeOfBlockRangeFrom = { line: iL, ch: iChar } //<< iChar + offsetChar
                       }
                       //if (codeOfBlockRangeFrom && !codeOfBlockRangeTo) {
                       //    codeOfBlockRangeTo = { line: iL, ch: iChar + offsetChar }
                       //}
                                              
                       codeToSave += code[iChar];
                       codeOfBlock += code[iChar];

                       qnHelper.sendChar(code[iChar]);
                       var isAnyQuotations = qnHelper.isAnyQuotations();
                       //isAnyQuotations = false;                        
                       
                       if (!isAnyQuotations && code[iChar] == ";" && !statement.type) {
                           statement.type = "statement";
                           //console.log("first collon");
                       }
                       if (!isAnyQuotations && code[iChar] == "{") {
                           countOpenBrackets++;
                           if (!typeFirstBracket) {
                             typeFirstBracket = "open";
                             areBrackets = true;
                           }
                       }
                       if (!isAnyQuotations && code[iChar] == "}") {
                           countCloseBrackets++;
                           if (!typeFirstBracket) {
                            typeFirstBracket = "close";
                           }
                       } 

                       if ((areBrackets && countOpenBrackets == countCloseBrackets) ||
                           (statement.type == "statement" || statement.type == "var") ) {
                            
                           var isInterrupt = false;
                           
                           // get from active char to end of line
                           linesObj[iL].code = code.substring(iChar+1,code.length);                           
                           statement.code = codeToSave;                                                   
                           
                           // sprawdzenie czy dalej nie ma else
                           if (statement.type == "if") {
                               var tempArray = [];
                               for(var i = iL; i < linesObj.length; i++) {
                                   tempArray.push(linesObj[i].code);     
                               }
                               
                               if (!statement.ifObj) {
                                   statement.ifObj = that.getConditionFromStatement(statement);
                                   statement.ifObj.exeElse = false; // if true then exe 'else' block, if false then exe 'true' block
                                   //statement.lineNumberElse = (iL+1)+startLineNumber;  
                               }
                               
                               // first enter check exist else statement 
                               var isElse = isStringAtTheBeginningArray("else", tempArray);
                               if (isElse) {
                                   
                                   //if (!codeOfBlockRangeTo) {
                                   //    codeOfBlockRangeTo
                                   //}
                                                                                                                                              
                                   statement.ifObj.isElse = true;                                                                  
                                   //statement.lineNumberElse = (iL+1+startLineNumber);   
                                  // console.log("IS ELSE!!");
                                   // wiec wychodze z zapisania statementu bede dalej liczyl
                                   typeFirstBracket = "";
                                   areBrackets = false;
                                   isInterrupt = true;
                               }

                               // must be code of block to run correctly <<

                               if (codeOfBlock) {                                                                 
                                   statement.iDeep = -1;
                                   // block else
                                   if (!isElse && statement.ifObj && statement.ifObj.isElse) {
                                       // block "else"
                                       
                                       codeOfBlockRangeFrom.ch = codeOfBlockRangeFrom.ch + 4; // 4 - length of 'else' string 
                                       for(var iLr = codeOfBlockRangeFrom.line; iLr < linesObj.length; iLr++ ) {
                                           var arrayCodes =  $.extend(true,[], copyLinesCodes);   //ObjectHelper.copyParamOfArrayObject("code", linesObj);
                                           arrayCodes[codeOfBlockRangeFrom.line] = arrayCodes[codeOfBlockRangeFrom.line].substring(codeOfBlockRangeFrom.ch);
                                           if (arrayCodes[iLr].trim()) {
                                               var ind = arrayCodes[iLr].indexFirstNotEmptyChar();
                                               if (codeOfBlockRangeFrom.line == iLr) {
                                                   codeOfBlockRangeFrom.ch += ind;
                                               } else {
                                                   codeOfBlockRangeFrom.ch = ind;
                                               }                                               
                                               codeOfBlockRangeFrom.line = iLr;
                                               break;
                                           }
                                       }                                       
                                       
                                       /*var indexElse = codeOfBlock.search(/else/,""),
                                           indexElseAfter = 0;
                                           countNLToElse = codeOfBlock.countFirstEmptyLines();                                           
                                           
                                       if (indexElse > -1) {                                       
                                           indexElseAfter += indexElse + 4; // 4 - length of 'else' string 
                                           */
                                           
                                           codeOfBlock = codeOfBlock.replace(/else/,""); //   \s*else      \s*    
                                       //}                                    
                                       //var ch = indexFirstChar(codeOfBlock)+4;
                                       
                                       var currentLine = iL+startLineNumber,
                                           countNL = codeOfBlock.countFirstEmptyLines(),
                                           countBlock = codeOfBlock.split("\n").length-1,
                                           //ch = indexFirstChar(codeOfBlock)+4,
                                           ch = codeOfBlockRangeFrom.ch; 
                                           
                                     //  if (countBlock)

                                       codeOfBlockRangeFrom = null;     
                                       codeOfBlock = codeOfBlock.trim();
                                       codeOfBlock = codeOfBlock.substring(1, codeOfBlock.length-1);
                                       //console.log("ELSE  "+codeOfBlock);                                       
                                       var recurSts = that.statementFromCode(codeOfBlock, statement.rangeTo.line+countNL, lvl+1);                                    
                                       statement.deepElse = recurSts;
                                       statement.rangeElseFrom = { line: statement.rangeTo.line+countNL, ch: ch}     // statement.range.to+countNL                                                                     
                                       statement.rangeElseTo = { line: currentLine, ch: iChar + 1 }                                                                          
                                   } else {
                                       // block "not else"
                                       //console.log("NOT ELSE  "+codeOfBlock);
                                       var countNL = codeOfBlock.countFirstEmptyLines(),
                                           countBlock = codeOfBlock.split("\n").length-1,
                                           ch = codeOfBlockRangeFrom.ch;
                                                                       
                                       codeOfBlockRangeFrom = null;                                                                                                                                                                                                             
                                       codeOfBlock = codeOfBlock.trim();                                       
                                       codeOfBlock = codeOfBlock.substring(1, codeOfBlock.length-1);                                        
                                       var recurSts = that.statementFromCode(codeOfBlock, statement.lineNumber+countNL-1, lvl+1); 
                                       statement.deep = recurSts;         
                                       statement.rangeFrom = { line: statement.lineNumber+countNL-1, ch: ch } // offsetChar
                                       statement.rangeTo = { line: statement.lineNumber+countBlock-1, ch: iChar+1 }
                                       //TODO
                                       codeOfBlock = "";
                                   }
                                   
                                   //codeOfBlock = codeOfBlock.trim();
                                   //console.log(isElse+" "+codeOfBlock);
                                   //codeOfBlock = codeOfBlock.substring(1, codeOfBlock.length-1);
                                   //console.log(isElse+" "+codeOfBlock);
                               }
                           }
                           

                           if (!isInterrupt) {                               
                               statement.lineNumberEnd = (iL+1)+startLineNumber; 
                               
                               if (statement.type == "statement" || statement.type == "var") {
                                  //statement.varObj = new Object();
                                  
                                  // first we have to set codeType, because we will be need it for correct set varObj
                                  statement.codeType = that.getStatementCodeType(statement.code);
                                  statement.varObj = that.getVarObjFromStatement(statement);                                                                     
                                  
                                  if (statement.codeType == STATEMENT_CODE_TYPE_ACTION) {
                                      statement.action = that.parametersOfAction(statement.code);
                                  }
                               }

                               // for and repeat -> for
                               if (statement.type == "for" || statement.type == "repeat") {
                                   if (statement.type == "repeat") {
                                       var countRepeat = statement.code.contentFromEvenChars("(",")");                                       
                                       var varLoop = "i_"+Generate.randomCharacters(8),
                                           contentLoop = "var "+varLoop+" = 0; "+varLoop+" < "+countRepeat+"; "+varLoop+"++",
                                           newCode = "";
                                       
                                       var range = statement.code.rangeFromEvenChars("(",")");
                                       if (range && range.from<=range.to) {                                           
                                           newCode += "for("+contentLoop+")";
                                           newCode += statement.code.substring(range.to+2, statement.code.length);                                           
                                           statement.code = newCode;
                                       }  
                                   }
                                                                   
                                   statement.forObj = that.getLoopFromStatement(statement);  
                                   statement.iDeep = -1; 
                                   
                                   var countNL = codeOfBlock.countFirstEmptyLines(), 
                                       countBlock = codeOfBlock.split("\n").length-1,
                                       ch = codeOfBlockRangeFrom.ch;
                                                                
                                   codeOfBlock = codeOfBlock.trim();
                                   codeOfBlock = codeOfBlock.substring(1, codeOfBlock.length-1);
                                   var deepStatements = that.statementFromCode(codeOfBlock, statement.lineNumber-1+countNL, lvl+1);                                   
                                   // extra statement of end of loop block 
                                   var endOfLoopStatement = {
                                       type: "statement",
                                       lineNumber: statement.lineNumber+countBlock,
                                       code: 'backEditorFor();',
                                       codeType: STATEMENT_CODE_TYPE_UNDEFINED
                                   }
                                   deepStatements.push(endOfLoopStatement);
                                   statement.deep = deepStatements;
                                                                   
                                   statement.rangeFrom = { line: statement.lineNumber+countNL-1, ch: ch } 
                                   statement.rangeTo = { line: statement.lineNumber+countBlock-1, ch: iChar+1 }
                               } 
                               
                               if (statement.type == "class") {
                                   statement.classObj = {};
                                   statement.classObj.name = that.getClassNameFromStatement(statement);
                                   statement.code = that.simpleClassToJavascriptClass(statement.code);
                               }
                               
                               if (statement.type == "function") {
                                   statement.functionObj = that.getFunctionObjFromStatement(statement);
                                   statement.iDeep = -1;

                                   var countNL = codeOfBlock.countFirstEmptyLines(), 
                                       countBlock = codeOfBlock.split("\n").length-1,
                                       ch = codeOfBlockRangeFrom.ch;
                                   
                                   codeOfBlock = codeOfBlock.trim();
                                   codeOfBlock = codeOfBlock.substring(1, codeOfBlock.length-1);
                                   var deepStatements = that.statementFromCode(codeOfBlock, statement.lineNumber-1+countNL, lvl+1);                                   
                                   // extra statement of end of loop block 
                                   /*var endOfLoopStatement = {
                                       type: "statement",
                                       lineNumber: statement.lineNumber+countBlock,
                                       code: 'backEditorFor();',
                                       codeType: STATEMENT_CODE_TYPE_UNDEFINED
                                   }
                                   deepStatements.push(endOfLoopStatement);*/
                                   statement.deep = deepStatements;
                                   statement.rangeFrom = { line: statement.lineNumber+countNL-1, ch: ch } 
                                   statement.rangeTo = { line: statement.lineNumber+countBlock-1, ch: iChar+1 }                                   
                               }
                               
                               if (statement.type == "function_prototype") {
                                   statement.functionObj = that.getFunctionObjFromStatement(statement);
                               }
                                     
                               changeConsoleCode(statement);
                               statement.code = statement.code.trim();                         
                               statements.push(statement);                                         
                               break;
                           }
                       }
                   }
                   // last char
                   if ( iChar >= code.length) { //  code.length == 0 || iChar == code.length-1
                       // drop empty line
                       codeToSave += "\n";  // i try \n  was " "  // << do space to statement code not join, example  elseConsole.write
                       codeOfBlock += "\n";
                       iL++; // jump to next line
                       iChar = -1;
                       //offsetChar = 0;
                       
                       if (iL < linesObj.length) {
                          code = linesObj[iL].code; //<<< linesObj[iL].code.trim();
                       }
                   }      
                          
                   if (iL == linesObj.length) {
                       statement.code = codeToSave;
                       statement.lineNumberEnd = (iL+1)+startLineNumber;
                       changeConsoleCode(statement);
                       statement.code = statement.code.trim();
                       statements.push(statement);                   
                       break;
                   }
               }
            } else {
                iL++;
            }          
            
            // execute when not found statement
            if (!isFindAnyStatement) {
                if (code.trim() != "") {  //<<<< bez .trim
                    codeToSave = code;
                    statement.code = codeToSave;
                    statement.lineNumberEnd = (iL+1);      
                    changeConsoleCode(statement);
                    statement.code = statement.code.trim();
                    statements.push(statement);
                    break;
                }
            }      
        } 
              
        return statements;        
    }        
    
    
    this.getHeaderClass = function(header) {
        var result = { isClass: false, isExtended: false, success: false }
        var arrayHeader = header.split(" ");
        var words = new Array();
        for(var i=0; i < arrayHeader.length; i++) {
            if (arrayHeader[i] != "") {
                words.push(arrayHeader[i]);
            }
        }
        if (words.length >= 2) {
            if (words[0] == "class" && words[1] != "") {
                result.isClass = true;
                result.name = words[1];
                result.success = true;
            }
        }
        if (result.success && words.length == 4) {
            if (words[2] == "extended" && words[3] != "") {
                result.isExtended = true;
                result.nameExtended = words[3];
                result.success = true;
            } else {
                result.success = false;
            }
        }        
        
        return result;
    }

    this.simpleClassToJavascriptClass = function(code) {
        var result = "";
        var classHeader = "";
        
        var classExp = new RegExp("class[^{]*","");
        if (code.search(classExp) == 0) { 
            classHeader = code.match(classExp)[0];
            code = code.replace(classExp,"");
            var header = this.getHeaderClass(classHeader);
            if (header.success) {
                result = "function "+header.name+"() ";                
                if (header.isExtended) {
                    code = code.substring(1,code.length);
                    code = "{"+header.nameExtended+".call(this);"+code;
                }
                result += code;
            }
        }
        return result;
    }
}


/*
var StatementsFactory = {
    createFunctionExe: function() {
        var statement = {};
        statement.type = "function_exe";
        statement.parent = statement.parent; //newCopyStatement.parent;
        statement.deep = newCopyStatement.deep;
        statement.iDeep = newCopyStatement.iDeep;
        statement.rangeFrom = newCopyStatement.rangeFrom;
        statement.rangeTo = newCopyStatement.rangeTo;
        statement.functionObj = newCopyStatement.functionObj;
        statement.functionObj.argsValues = [];
        statement.functionObj.listVars = [];
        return statement;
    }
}*/




