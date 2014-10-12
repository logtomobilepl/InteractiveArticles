////////////////////
// PARSER OF CODE - parse  char by char

/*var JSCodeConst = {
    "for": "for",
    "if": "if",
}

var JSCodeEvents = {
    foundWord: "f_word",
    foundWord: "f_word",
}*/


var ParserJS = {
    // code: string, charStart: regExp|char, charEnd: regExp(char)|char
    betweenCharsWithoutString: function( code, charStart, charEnd) {
        var result = "",
            tmpRes = "",
            beginCheck = false,
            getToEnd = (typeof charEnd === "undefined");
        
        if (!charStart) {beginCheck = true;}  
            
        var parserChars = new ParserJSCode({
            //listWords: ["zmienna1"],
            events: {
                foundChar: function(obj) {         
                    var isAnyQuotation = obj.state.isOpenQuotation1 || obj.state.isOpenQuotation2,
                        isEqualStart = false,
                        isEqualEnd = false;
                        
                    if (charEnd instanceof RegExp) { isEqualEnd = charEnd.test(obj.ch); }
                    if (typeof charEnd ===  "string") { isEqualEnd = (charEnd == obj.ch); }
                    
                    if (isEqualEnd && beginCheck && !isAnyQuotation) {
                        result = tmpRes;
                        beginCheck = false;
                        parserChars.stop();
                    }

                              
                    if (beginCheck) {
                        tmpRes += obj.ch;
                    }                              
                    
                    if (charStart instanceof RegExp) { isEqualStart = charStart.test(obj.ch); }
                    if (typeof charStart ===  "string") { isEqualStart = (charStart == obj.ch); }                                                                                          
                    if (isEqualStart && !beginCheck && !isAnyQuotation) { 
                        beginCheck = true;
                    }                   
                    
                },                
            }
        });
        parserChars.parse(code); 
        if (getToEnd) {
            result = tmpRes;
        }        
        return result;
    },
    replaceWordsOutsideString: function(code, word, replace) {  //word:tekst replace:XX/   tekst+"tekst"  -> XX+"tekst"  
        var prJS = new ParserJSCode({
            events: {
                foundWord: function(obj) {
                    if (obj.word == word && 
                        (!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2 )) {
                       // console.log(">>> "+obj.word); // obj.word
                        var leftSide = code.substring(0, obj.iC - obj.word.length),
                            rightSide = code.substring(obj.iC, code.length);
                        code = leftSide+replace+rightSide;
                        prJS.setCode(code);
                        prJS.seek(0); 
                    }
                }              
            }
        });
        prJS.parse(code);   
        return code; 
    },
    replaceStrings: function(code, replace) {  //word:tekst replace:XX/   tekst+"tekst"  -> tekst+XX
        var codeRes = ""  
        var prJS = new ParserJSCode({
            events: {
                foundChar: function(obj) {
                    var isAnyQuotation = (obj.state.isOpenQuotation1 || obj.state.isOpenQuotation2);
                    
                    var isAdd=true;
                    if (!isAnyQuotation && (code[obj.iC] == '"' || code[obj.iC] == "'")) {
                        isAdd = false; 
                    }

                    if (!isAnyQuotation && isAdd) {

                        codeRes += obj.ch;
                        
                        /* var leftSide = code.substring(0, obj.iC - obj.word.length),
                            rightSide = code.substring(obj.iC, code.length);
                        code = leftSide+replace+rightSide;
                        prJS.setCode(code);
                        prJS.seek(0);
                        */ 
                    } else {
                        codeRes += "@";
                    }
                } 
            }
        });
        prJS.parse(code); 
        codeRes = codeRes.replace(/[@]+/g, replace);  
        return codeRes; 
    },    
    // get parameters from string  "funkcja(13+'text'),323,'text2'" -> array funkcja(13+'text'),  323,  'text2'
    getParametersFromString: function(string) {
        var params = [],
            param = "";
        var parserChars = new ParserJSCode({
            //listWords: ["zmienna1"],
            events: {
                foundChar: function(obj) {         
                    var isAnyQuotation = obj.state.isOpenQuotation1 || obj.state.isOpenQuotation2;
                    
                    //if (!isAnyQuotation) {
                        if (obj.ch == "(") {                            
                            var substr = string.substring(obj.iC);
                            var range = substr.rangeFromEvenChars("(", ")");
                            if (range) {
                                parserChars.seek(obj.iC+range.to+1);
                                param += "("+substr.contentFromEvenChars("(", ")")+")";
                            }
                        } else if (!isAnyQuotation && obj.ch == ",") {
                            params.push(param.trim());
                            param = "";
                        } else {
                            param += obj.ch;
                        }
                    //}
                },                
            }
        });
        parserChars.parse(string);
        if (param) {
            params.push(param);
        }        
        return params;
    }
}

/*
    ide do po kolei
    napotkanie
    (
    to ominiecie wszytkich parzystych do )
*/


function ParserJSCode(options) {
    var that = this,
        events = (options && options.events)?options.events:{},
        code = "",
        word = "",
        iC = 0,
        forceStop = false;
        
    //this.listWords = (options && options.listWords)?options.listWords:[];
    var defaultState = {
        isAlpha: false,
        isNumeric: false,
        isDot: false,
        isFloor: false,
        isDash: false,
        isSquereBracket: false,
        isOpenQuotation1: false, // "
        isOpenQuotation2: false, // '
    }
    this.state = {};
    
    this.addEventListener = function(type, listener) {
        if (type && listener && typeof listener === "function") {
            events[type] = listener;
        }
    }

    this.parse = function(_code) {
        var ch = "",
            mod = "";
        that.setCode(_code);
        iC=0;
        forceStop = false;
        for(; iC < code.length; iC++) {            
            if (forceStop) { return; }            
            ch = code[iC];
            mod = code.substring(iC, code.length);
            
            // aaazmienna1sas

            //console.log("---");
            //console.log(ch);
            //console.log(mod);
                        
            //var kWord = findWords(mod);
            //if (kWord) {
            //    iC += (kWord.length-1);
            //} else {
                checkChar(ch, iC);
            //}
            
        }   
    }
    
    
    /*
    var findWords = function(code) {
        var words = ["for", "if", "var"];        
        for(var i=0; i < words.length; i++) {
            if (checkIfExistFirstWord(code, words[i], "key")) {
                return words[i];
            }            
        }
        words = that.listWords;        
        for(var i=0; i < words.length; i++) {
            if (checkIfExistFirstWord(code, words[i], "my")) {
                return words[i];
            }            
        }        
    }
    
    // @param typeWord = "key"|"my"
    var checkIfExistFirstWord = function(code, word, typeWord) {              
        var index = code.search(word);
        if (index == 0) {
            if (events && events.foundWord && typeof events.foundWord === "function") {
                events.foundWord({
                    word: word,
                    typeWord: typeWord
                });
                return true;
            }
        }
        return false;
    }*/    
    
    var checkChar = function(ch, iC) {
        var st = that.state,
            kWords = ["for", "if", "var"],
            canAddNewWord = false;
        if (/[a-zA-Z]/.test(ch)) { st.isAlpha = true;} else {st.isAlpha = false; }
        if (/[0-9]/.test(ch)) { st.isNumeric = true;} else {st.isNumeric = false; }
        if (/[\.]/.test(ch)) { st.isDot = true;} else {st.isDot = false; }
        if (/[\[\]]/.test(ch)) { st.isSquereBracket = true;} else {st.isSquereBracket = false; }
        if (/[_]/.test(ch)) { st.isFloor = true;} else {st.isFloor = false; }
        if (/[-]/.test(ch)) { st.isDash = true;} else {st.isDash = false; }
                       
        if (events && events.foundChar && typeof events.foundChar === "function") {
            events.foundChar({
                iC: iC,
                ch: ch,
                state: st
            });
        } 
        
        if (st.isAlpha || st.isNumeric || st.isFloor || st.isDot) {  //  || st.isSquereBracket) {
            word += ch;
            if (iC >= code.length-1) { // it was last char so maybe i will be have to exe event foundWord
                canAddNewWord = true;
                iC = code.length;
            }
        } else {
            canAddNewWord = true;
        }         
        
        if (word && canAddNewWord) {
            if (events && events.foundWord && typeof events.foundWord === "function") {
                var typeWord = "";
                if (kWords.indexOf(word) > -1) {
                    typeWord = "key";
                } else {
                    typeWord = "";
                }
                events.foundWord({
                    iC: iC,
                    word: word,
                    typeWord: typeWord,
                    state: st
                });
            }    
            word = ""; 
        }

        if (!st.isOpenQuotation2) {  // is not open 'xxx
            if (ch == '"') {
                if (st.isOpenQuotation1) { 
                    st.isOpenQuotation1 = false;
                } else {
                    st.isOpenQuotation1 = true;
                }
            }
        }     

        if (!st.isOpenQuotation1) {  
            if (ch == "'") {
                if (st.isOpenQuotation2) { // '
                    st.isOpenQuotation2 = false;
                } else {
                    st.isOpenQuotation2 = true;
                }
            }           
        }        
        
    }
        
    this.seek = function(ic) {
        iC=ic;
    }
    
    this.getSeek = function() {
        return iC;
    }
    
    this.setCode = function(nCode) {
        code = nCode;
        this.state = $.extend(true, {}, defaultState);
    }
    
    this.stop = function() {
        forceStop = true;
    }    
    
    this.testUnit = function() {
        
        var string = "";
        
        var test = new ParserJSCode({
            //listWords: ["zmienna1"],
            events: {
                foundWord: function(obj) {
                    //console.log("found:"+obj.word+", type:"+obj.typeWord);
                    console.log("Found word:"+JSON.stringify(obj));
                },
                foundChar: function(obj) {
                    console.log("Found char:"+JSON.stringify(obj));
                },                
            }
        });        
        
        var code = "";
        code += 'conforsole.log("Hello.sd world"); ';
        code += 'for(var i=0; i < 200; i++) { wrifote(i); } if(zmienna1>20) {} ';
        //test.parse(code);        
    }  
    

    // kod  a kod a
    
    
    // pobieramy wyrazy:
    /*
     
     // pobieramy zbite w jednosc  alfanumeryczne znaki, kropke, 
        dzielnikiem  jest  +, -, spacja, ), (,  >, =,  <,  {,   },  ;, przecinek, !,  ",  ',    
     
        otrzymamy kolejne wyrazy, ktore bedziemy wyrzucac na wyjscie, kiedy nadejdzie dzielnik
        to nam da slowa kluczowe, zmienne,   oraz zawartosci nawiasow
        
        otrzymamy kolejne znaki dzielnikow
     
     */
    
     
    
    
}


// checker for statement miss string:    xxx "MISS_CHARS" xx "MISS_CHARS" xxx ..  
function QuotationHelper() {
    var that,
        isOpenQuotation1 = false, // "
        isOpenQuotation2 = false; // '
     
    this.sendChar = function(ch) {
        if (!isOpenQuotation2) { 
            if (ch == '"') {
                if (isOpenQuotation1) { 
                    isOpenQuotation1 = false;
                } else {
                    isOpenQuotation1 = true;
                }
            }
        }
        if (!isOpenQuotation1) {  
            if (ch == "'") {
                if (isOpenQuotation2) { // '
                    isOpenQuotation2 = false;
                } else {
                    isOpenQuotation2 = true;
                }
            }           
        }   
    }    
        
    this.isAnyQuotations = function() {
        return isOpenQuotation1 || isOpenQuotation2;
    }
    
    this.reset = function() {
        isOpenQuotation1 = false;
        isOpenQuotation2 = false;
    }
        
}


// bede wiedzial gdzie jestem, czy string czy w forze, czy if
// jesli dojde np do srodka stringa

//if (a < 10) {  write("sdsad a "+a); }

/*
znalazlem if

otwarcie nawiasu
warunek
koniec nawiasu
otwarcie bloku
funkcja 
rozpoczecie string
string
koniec string
operator dodawania string
string lub zmienna
koniec funkcji
srednik

koniec bloku if
*/

 /*
chce zobaczyc czy zmienna 
*jest poza string 
*w warunku if 
*w petli for
 */












