////////////////////
// CODE EDITOR - String

function CodeEditorStrings() {

    // @param contitional - value from  Algorithm.rpnInfo
    /*this.stringsForRpnInfo = function(info) {
        var result = "";
        if (info) {
           for(var j=0; j < info.length; j++) {
               if (!info[j].leftIsNumber) {
                   result += "value of "+info[j].leftOperand+" variable="+info[j].leftValue+". ";
               }
           }
           // value of old variable=3. We check if 3<=18. Yes it is TRUE so we will execute this part of code (wskazujemy jakos ktory kod)   
        }
        return result;
    }*/
    this.rmEMU = function(code) {
        var res = code.toString();
        //res = res.replace(/.*___/,"");
        //res = res.replace("EMU.","");
        res = res.replace(/.*___/g,"");
        res = res.replace(/EMU./g,"");
        return res;
    },
    // @param options.shortString
    this.stringsForRpnConditional = function(rpn, statement, options) {
        var result = "",
            rpnInfo = Algorithm.rpn_to_info(rpn); 
            //leftValue = "", 
            //rightValue = "", 
            error = "", 
            that = this,
            shortString = (options && options.shortString)?true:false;
            
        if (rpnInfo && rpnInfo.success) {            
            if (rpnInfo.error) {
                return rpn.error;
            }            
            
            if (!shortString) {
                for(var i=0; i < rpnInfo.info.length; i++) {
                   var info = rpnInfo.info[i];                
                       
                   if (info.leftIsNegation) {
                       result += "Negation of "+that.rmEMU(info.leftOperand)+"  is equals "+info.leftValue+". ";
                   } else if (info.rightIsNegation) {
                       result += "Negation of "+that.rmEMU(info.rightOperand)+" is equals "+info.rightValue+". ";
                   }  else if (!info.leftIsNumber) {
                       result += "Value of "+that.rmEMU(info.leftOperand)+" variable is equals "+info.leftValue+". ";
                   } else if (!info.rightIsNumber) {
                       result += "Value of "+that.rmEMU(info.rightOperand)+" variable is equals "+info.rightValue+". ";
                   }
                    
                   if (info.token == "&&") { 
                        //info.value = eval("!!("+info.value+")");                                              
                        result += "We check AND for "+that.rmEMU(info.leftOperand)+" and "+that.rmEMU(info.rightOperand)+". ";
                   } else if (info.token == "||") {
                        //info[i].value = eval("!!("+info[i].value+")");                                             
                        result += "We check OR for "+that.rmEMU(info.leftOperand)+" and "+that.rmEMU(info.rightOperand)+". ";
                   } else  {
                        result += "We calculate statement: "+that.rmEMU(info.leftOperand)+" "+info.token+" "+that.rmEMU(info.rightOperand)+", result is "+info.value+". ";
                   }          
               }  
           }
           
           var isCorrect = new Boolean(rpnInfo.value);   // eval(rpnInfo.value);
           isCorrect = isCorrect.valueOf();
           //result += "We check if "+eval(leftValue)+" "+this.stringOperator(conditional.token)+" "+eval(rightValue)+". ";
             
           if (statement && statement.ifObj) { 
               
               //isCorrect
               
               if (isCorrect || (!isCorrect && statement && statement.deepElse)) {  
                   if (!shortString) {                   
                       result += "Condition is "+isCorrect+". We will execute this part of code highlighted in green. ";
                   } else {
                       result += "Condition is "+isCorrect+". We'll execute green part.";
                   }
               } else {
                   if (!shortString) {
                       result += "Condition is false so we go next.";
                   } else {
                       result += "Condition is false so we go next.";
                   }
               }
           } else if (statement && statement.forObj) { 
                if (isCorrect) {
                    if (!shortString) {
                        result += "Condition is true so we still continue whole code below. ";
                    } else {
                        result += "Condition is true so we still continue whole code below. ";
                    }
                } else {
                    if (!shortString) {
                        result += "Condition is false so now we will not continue loop code and go next. ";
                    } else {
                        result += "Condition is false so now we will not continue loop code and go next. ";
                    }
                }
           }  

            // Yes it is TRUE so we will execute this part of code                            
            //result += "Yes it is TRUE so we will execute this part of code. ";       
        }
        return result;
    };
    
    // @param options.shortString
    // @param options.maxLength
    this.stringForCode = function(statement, options) {
        if (!statement) {
            return "";
        }        
        var result = "",//"[Step:"+EMU.infoEmu.step+"]",
            shortString = (options && options.shortString)?true:false;
        if (statement.type == "var") {
            if (statement.varObj.objectType == "Array") {
                if (shortString) {
                    result += 'Variable '+this.rmEMU(statement.varObj.name)+' representing Array';
                    if (statement.varObj.params.length == 0) {
                        result += ' was created.'
                    } else if (statement.varObj.params.length == 1) {
                        result += ' was created with first element set to '+statement.varObj.params[0]+'. ';
                    } else if (statement.varObj.params.length > 1) {
                        result += ' with array values set to ';
                        result += statement.varObj.params.join(",");
                        //for(var i=0; i < statement.varObj.params.length; i++) {
                        //    result += statement.varObj.params+",";
                        //}
                    } else {
                        
                    }
                }
                                
            }  else if (statement.varObj.objectType) {
                if (shortString) {
                    result += 'Instance '+this.rmEMU(statement.varObj.name)+' of Object '+statement.varObj.objectType+' was created.';
                }
            } else {
                if (shortString) {
                    result += 'Variable '+this.rmEMU(statement.varObj.name)+' was created. ';                
                    if (statement.varObj.value) {
                        result += 'Value was set to '+eval(statement.varObj.value)+'.';     
                    }
                }
            } 
        } else if (statement.type == "statement" && statement.codeType == STATEMENT_CODE_TYPE_EQUAL && statement.varObj.name && statement.varObj.value) {
            if (shortString) {
                result += 'Variable '+this.rmEMU(statement.varObj.name)+' was set to '+eval(statement.varObj.value)+'.';
            }
        } else if (statement.type == "statement" && statement.codeType == STATEMENT_CODE_TYPE_RETURN && statement.varObj) {
            if (shortString) {
                var rpnInfo = Algorithm.infix_to_rpn_to_info(statement.varObj.returnValueExt);
                if (rpnInfo) {
                    if (rpnInfo.info.length > 0) {
                        result += 'Calculated expression: '+statement.varObj.returnValueExt+'. ';
                    }
                }
                result += 'Return '+eval(statement.varObj.returnValue)+'. ';
            }
        } else if (statement.type == "statement" && statement.codeType == STATEMENT_CODE_TYPE_INCREMENT && statement.varObj.name) {
            if (shortString) {
                var value = eval(statement.varObj.name);
                result += 'Variable '+this.rmEMU(statement.varObj.name)+' was increased. It\'s now set to '+value+'.';
            }
        } else if (statement.type == "statement" && statement.codeType == STATEMENT_CODE_TYPE_DECREMENT && statement.varObj.name) {
            if (shortString) {
                var value = eval(statement.varObj.name);
                result += 'Variable '+this.rmEMU(statement.varObj.name)+' was decreased. It\'s now set to '+value+'.';
            }
        } else if (statement.type == "statement" && statement.varObj && statement.varObj.name && 
                   (statement.codeType == STATEMENT_CODE_TYPE_SUM || statement.codeType == STATEMENT_CODE_TYPE_MINUS ||
                    statement.codeType == STATEMENT_CODE_TYPE_MULTI || statement.codeType == STATEMENT_CODE_TYPE_DIV) ) {
            if (shortString) {
                var oldValue = eval(statement.varObj.name),
                    addedValue = eval(statement.varObj.value),
                    newValue = null;
                if (!isNaN(oldValue)) { oldValue = parseInt(oldValue); }
                if (!isNaN(addedValue)) { addedValue = parseInt(addedValue); }
                //if (!isNaN(oldValue) && !isNaN(addedValue)) {
                //    newValue = eval(oldValue+addedValue); // 
                //} else {
                var operationString = "";
                if (statement.codeType == STATEMENT_CODE_TYPE_SUM) { newValue = oldValue+addedValue; operationString = "addition";  }
                if (statement.codeType == STATEMENT_CODE_TYPE_MINUS) { newValue = oldValue-addedValue; operationString = "subtraction"; }
                if (statement.codeType == STATEMENT_CODE_TYPE_MULTI) { newValue = oldValue*addedValue; operationString = "multiplication";}
                if (statement.codeType == STATEMENT_CODE_TYPE_DIV) { newValue = oldValue/addedValue; operationString = "division"; }
                    //
                //}
                result += 'Variable '+this.rmEMU(statement.varObj.name)+' is updated ('+operationString+'). ';
                if (oldValue != undefined && newValue != undefined) {
                    result += 'Old value:'+oldValue+' New Value:'+newValue+'.';
                }
            }
        }  else if (statement.type == "if") { 
            if (statement.ifObj && statement.ifObj.rpn) {
                result += this.stringsForRpnConditional(statement.ifObj.rpn, statement, options);
            }
        } else if (statement.type == "for"){
            //alert(JSON.stringify(statement.forObj));
            if (statement.forObj && statement.forObj.params) {
                var p0 = statement.forObj.params[0];
                if (p0 && statement.iDeep < 0) {                    
                    result += 'We set '+this.rmEMU(p0.name)+' to '+this.rmEMU(p0.value)+'. ';
                    // after repeat
                    // We incread i by one. It is now = 1.  
                }
                var p2 = statement.forObj.params[2];
                if (p2 && statement.iDeep >= 0) {                    
                    
                    //We incread i by one. It is now =1. <<<
                    
                    result += 'Variable '+this.rmEMU(p2.name)+' is '+this.stringLoopParam3(p2.operator, p2.name2)+'. ';
                    result += 'It is now '+eval(p2.name)+'. ';
                    
                    //stringLoopParam3
                    
                    // after repeat
                    // We incread i by one. It is now = 1.  
                }                
                var p1 = statement.forObj.params[1];
                if (p1 && p1.rpn) {
                    
                    result += 'Next we check condition in the loop. '; 
                    result += this.stringsForRpnConditional(p1.rpn, statement, options);                                                      
                }
            }                 
        } else if (statement.type == "repeat"){
            if (shortString) {
                if (statement.forObj && statement.forObj.params) {
                    
                   var p0 = statement.forObj.params[0],
                       p1 = statement.forObj.params[1],
                       rpnInfo = null;                                   
                    if (p0 && p1 && p1.rpn) {                    
                        rpnInfo = Algorithm.rpn_to_info(p1.rpn);                    
                                               
                        if (rpnInfo && rpnInfo.success && rpnInfo.value) {
                            result += 'Repeat, step '+eval(p0.name)+'.';                                   
                        } else {
                            result += 'Repeat is finished.';
                        }
                    }
                } 
            }
        } else if (statement.type == "function") {
            if (shortString) {            
                result += 'Function '+this.rmEMU(statement.functionObj.name)+" was defined.";
            }
        } else if (statement.type == "function_exe") {
            if (shortString) {
                result += "We start function execution. ";    
            } else {
                result = "This is where the function is defined. In the next lines computer will go down and execute commands in this function. ";    
            }
        } else if (statement.type == "pre_function_exe") {
            var funcName = this.rmEMU(statement.functionObj.name),
                varsList = statement.variablesList,
                functionsList = statement.functionsList,
                countExecutedStm = 0;
            
            if (functionsList && functionsList.length > 0) {
                for(var i=0; i < functionsList.length; i++) {
                    if (functionsList[i].statement.wasExecuted) {
                        countExecutedStm++;    
                    }
                } 
            }
                                 
            if (shortString && statement.functionObj.source == STATEMENT_CODE_TYPE_RETURN) {
                result += "Go to function "+funcName+" to calculate value that should be returned.";
            } else if (shortString) {
                var argsFuncObj = statement.functionObj.argsValues,   // only values
                    preArgsFuncObj = statement.functionObj.argsPreValues; // variable and values                    
                preArgsFuncObj = $.extend(true, [], preArgsFuncObj);
                for(var i=0; i < preArgsFuncObj.length; i++) {
                    preArgsFuncObj[i] = this.rmEMU(preArgsFuncObj[i]);     
                }
                
                if (argsFuncObj && argsFuncObj.length > 0 && argsFuncObj.length == preArgsFuncObj.length) {                
                    if (argsFuncObj.length == 1 ) {
                        //Run function3 passing parameter: 3
                        result += 'Run '+funcName+" passing parameter: "+preArgsFuncObj[0]+". ";
                    } else if (argsFuncObj.length >= 2 ) {
                        var valuesByComma = preArgsFuncObj.slice(0, argsFuncObj.length - 1),
                            lastValue = preArgsFuncObj[argsFuncObj.length-1];
                        result += 'Run '+funcName+" passing parameters: "+valuesByComma.join(",")+" and "+lastValue+". ";
                    }
                    //result += 'So the function execution looks like this: '+funcName+'('+argsFuncObj.join(",")+')';
                } else {
                    result += 'Run '+funcName+". ";
                }
            } else {
                
                var typeCommandString = "";
                if (statement.functionObj.source == STATEMENT_CODE_TYPE_RETURN) {
                    typeCommandString = "return"
                } else if (statement.functionObj.source == STATEMENT_CODE_TYPE_EQUAL) {
                    typeCommandString = "assignment"
                } else if (statement.functionObj.source == "Console.write") {
                    typeCommandString = "console.write"
                } 
                
                result = ""                
                result += "In this line we have "+typeCommandString+" command. ";
                if (statement.functionObj.source == STATEMENT_CODE_TYPE_RETURN) {
                    result += "It means that computer should exit from function returning some value. ";
                }                
                result += "Value that should be ";
                if (statement.functionObj.source == STATEMENT_CODE_TYPE_RETURN) {
                    result +=  "returned ";
                } else if (statement.functionObj.source == STATEMENT_CODE_TYPE_EQUAL) {
                    result += "assigned ";
                } else if (statement.functionObj.source == "Console.write") {
                    result += "passed ";
                }                 
                result += "is give be the expression: ";
                result += "<br /><br />";
                result += statement.functionObj.expression;                
                
                if (countExecutedStm == 0) {
                    result += "<br /><br />";
                    result += "We need to calculate it. ";                   
                      
                    if (varsList && varsList.length > 0) {
                        result += "<br /><br />";  
                        result += "We know what are the values of variables: <br />";                    
                        for(var i=0; i < varsList.length; i++) {
                            result += varsList[i].name+" equals to "+varsList[i].value+"";
                            if (i < varsList.length-1) { result+="<br />"; }
                        }
                        
                    }
                    if (functionsList && functionsList.length > 0) {
                        result += "<br /><br />";  
                        result += "But we don't know what is the value of the ";
                        if (functionsList.length == 1) {
                            result += "function ";
                        } else {
                            result += "functions: <br/>";
                        }
                        for(var i=0; i < functionsList.length; i++) {
                            result += this.rmEMU(functionsList[i].code)+" ";
                            if (i<functionsList.length-1) { result += "<br />"; }
                        }
                        if (functionsList.length > 1) {
                            result += "<br />";
                        } 
                        result += "until we see what they are going to return when executed.<br />";
                        result += "So in order to calculate the value of the whole expression that should be returned we are going to run each function that is part of that and see what it has returned.";
                        
                    }                
                    
                    result += "<br /><br />";
                } else {
                    if (functionsList && functionsList.length > 0) {
                        result += "<br /><br />";
                        result += "We have already calculated values returned by functions: ";
                        
                        for(var i=0; i < functionsList.length; i++) {
                            if (functionsList[i].statement.wasExecuted) {
                                var _val = functionsList[i].statement.functionObj.returnValue;
                                result += this.rmEMU(functionsList[i].code)+"  returns "+eval(_val);
                                if (i<functionsList.length-1) { result += "<br />"; }
                            }
                             
                            //result += this.rmEMU(functionsList[i].code)+" ";
                            //if (i<functionsList.length-1) { result += "<br />"; }
                        }
                        result += "<br /><br />";
                    }   
                }

             
                if (countExecutedStm == 0) {
                    if (functionsList && functionsList.length > 1) { result += "First we "; } 
                    else { result += "We "; }
                    result += "are executing function "+funcName+". ";
                } else if (countExecutedStm == 1) {
                    result += "Now we are executing function "+funcName+". ";
                } else if (countExecutedStm > 1) {
                    result += "Now we are again executing function as it is present more than once in a expression "+funcName+". ";
                }  
                
                
            }
        }  else  { // if(statement.codeType == STATEMENT_CODE_TYPE_UNDEFINED) {
            if (statement.code.search("Console.write") == 0) { // > -1
                if (shortString) {
                    var code = statement.code.replace("Console.write", ""),
                        string = eval(code);
                    result += 'Write to the console: "'+string+'".';
                } 
            } else if (statement.code.search("Console.read") > -1) {
                if (shortString) {
                    result += 'App expects you to put value and press enter: ';
                } 
            } else if (statement.code.search("appFinished") == 0) {
                if (shortString) {
                    result += 'Application finished';
                } 
            } else if (statement.code.search("backEditorFor") == 0) {
                if (shortString) {
                    result += 'Application will go back to the top of the loop';
                } 
            } 
        }    
        //}
        
        //if (shortString && options && options.maxLength != undefined && result.length > options.maxLength) {
        //    result = Generate.shortStringWithDotsRightSize(result, options.maxLength);
        //}
        
        return result; 
    }
    
    this.stringOperator = function(operator) {
        switch(operator) {
            case "<": return "smaller than"; break;
            case ">": return "larger than"; break;
            case "<=": return "smaller or equals than"; break;
            case ">=": return "larger or equals than"; break;
            case "==": return "equals"; break;
            case "!=": return "not equals"; break;
        }
    }
    
    
    this.stringLoopParam3 = function(operator, value) {
        switch(operator) {
            case "++": return "increased by one"; break;
            case "++": return "increased by one"; break;
            case "--": return "descreased by one"; break;
            case "+=": return "increased by "+value; break;
            case "-=": return "descreased by "+value; break;
            case "*=": return "multiplied by "+value; break;
            case "/=": return "devided by "+value; break;
        }
    }    
    
}

