

function setSelectListByStringArray(list,idParent) {
    var html = "";
    for(var i = 0; i < list.length; i++) {
        html += "<option>"+list[i]+"</option>";
    }
    $("#"+idParent).html(html);
}

function listStringArrayWithoutEmptyEntry(list) {
    var resultList = new Array();
    for(var i = 0; i < list.length; i++) {
        if (list[i]) {
            resultList.push(list[i]);
        } 
    }
    return resultList;
}

function listStringArrayWithExtension(list,arrayExtension) {
    var resultList = new Array();

    for(var i = 0; i < list.length; i++) {        
        var array = list[i].split(".");
        if (array.length > 0) {
        var extension = array[array.length-1];
            for (var j=0; j < arrayExtension.length; j++) {
                if (extension == arrayExtension[j]) {
                    resultList.push(list[i]);
                    break;
                }
            }
        }        
    }
    return resultList;
}

function listOfKeyboardLetters() {
    var result = [];
    for(var i=32;i<127;i++) {
        if (i == 32) {
            result.push("space");
        } else {
            result.push(String.fromCharCode(i));
        }
    }
    removeObjectFromObjectsArray("\"",result);
    return result;
}

function arrayWithFirstElement(array,element) {
    var copyArray = array.slice(0);
    copyArray.splice(0,0,element);
    return copyArray;
}

function arrayWithFirstEmptyElement(array) {
    return arrayWithFirstElement(array, "");
}

function arrayWithNumeration(from, to) {
    var result = [];
    for(var i=from; i < to; i++) {
        result.push(i);
    }
    return result;
}

function firstElementOfArray(array) {
    return (array.length > 0)?array[0]:"";
}

function arrayFromArrayParam(array, param) {
    var arrayResult = new Array();
    for(var i=0; i < array.length; i++) {
        var screenObj = array[i];
        if (screenObj[param]) {
            arrayResult.push(screenObj[param]);
        }
    }
    return arrayResult;
}      

function paramFromParamAndValue(array, paramReturn, paramSearched, valueSearched) {
    for(var i=0; i < array.length; i++) {
        var screenObj = array[i];
        if (screenObj[paramSearched] == valueSearched) {
            return screenObj[paramReturn];
        }
    }
    return undefined;
}   
function objectFromParamAndValue(array, paramSearched, valueSearched) {
    if (!array || !paramSearched || !valueSearched) {
        return undefined;
    }
    for(var i=0; i < array.length; i++) {
        var obj = array[i];
        if (obj[paramSearched] == valueSearched) {
            return obj;
        }
    }
    return undefined;
}

function listObjectValues(obj) {
    var result = [];
    if (obj) {
        for( var prop in obj ) { 
            result.push(obj[prop]);
        }
    }
    return result;
}  

function isExistStringInArray(string,array) {
    for(var i = 0; i < array.length; i++) {
        if(array[i] == string) {
            return true;
        }
    }
    return false;
}

function autonumerateForArrayWithString(array,string) {
    for(var i = 1; ; i++) {
        var name = (string + i);
        if(isExistStringInArray(name,array) == false) {
            return {name:name, number:i};
        }
    }
    return string;
} 

function removeObjectFromObjectsArray(object, array) {
   if (object) {
       var index = array.indexOf(object); 
       if (index>=0) {
           array.splice(index, 1);
           return true; 
       }        
   }
   return false;
}

function pad (str, max) {
    return str.length < max ? pad("0" + str, max) : str;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = [maxWidth / srcWidth, maxHeight / srcHeight ];
    ratio = Math.min(ratio[0], ratio[1]);
    return { width:srcWidth*ratio, height:srcHeight*ratio };
}

function shortenString(string, maxLength, charsSplit) {
    var lengthCharsSplit = charsSplit.length;
    var lengthString = string.length;
    
    if (lengthString > maxLength) {
        var res = string.substring(0,maxLength-8);
        res += charsSplit;
        res += string.substring(lengthString-4,lengthString);
        return res;
    } else {
        return string;
    }
}


String.prototype.lastChar = function() {
    if (this.length > 0) {
        return this[this.length-1];   
    } else {
        return "";
    }
    
}

String.prototype.isLastChar = function (charToCheck) {
    var str = this;
    if (str && str.length > 0 && charToCheck && charToCheck.length == 1 && (str[str.length-1] == charToCheck)) {
        return true;
    }
    return false; 
};  

// find first not empty char in string and return him index, example:  "  my_text" -> return 2  
String.prototype.indexFirstNotEmptyChar = function() {
    var str = this; 
    for(var i=0; i < str.length; i++) {
        if (str[i].trim()) { // != ""
            return i;
        }
    }
    return -1;
}

String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};  

// string with correct system name without space, 
String.prototype.systemString = function() {
    var array = new Array(" ","/","\\",":","*","?","\"","<",">","|",";","[","]","{","}");
    var result = this; 
    for(var i=0; i< array.length; i++) {
        result = result.replaceAll(array[i],"_");
    }
    return result;
}

// string with correct system name without space, 
String.prototype.variableString = function() {
    var array = new Array(" ","/","\\",":","*","?","\"","<",">","|",";","[","]","{","}",")","(");
    var result = this; 
    for(var i=0; i< array.length; i++) {
        result = result.replaceAll(array[i],"_");
    }
    return result;
}


String.prototype.correctVariable = function(prefix) {
    var result = this.variableString(this);
    if (result && result.length > 0 && result.charCodeAt(0) >= 48  && result.charCodeAt(0) <= 57) {
        result = prefix + result;
    }
    return result;
}

String.prototype.isCorrectVariable = function() {
    var variable = this;
    var result = this.correctVariable("_");
    if (variable == result) {
        return true;
    } else {
        return false;
    }
}

String.prototype.searchAndSubstring = function(searchValue) {
    var result = this;
    var index = this.search(searchValue);
    if (index > -1) {
        var temp = "";
        temp += result.substring(0, index);
        temp += result.substring(index+searchValue.length, this.length);
        result = temp;
    } 
    return result;
}

String.prototype.cut= function(i0, i1) {
    return this.substring(0, i0)+this.substring(i1);
}

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};


String.prototype.beetweenChars = function( charStart, charEnd ) {
    var text = this.match(charStart+"[^"+charEnd+"]*"+charEnd);
    if (text && text.length>0) {
        text[0] = text[0].substring(1, text[0].length-1);
        return text[0];
    }
    return "";
};

String.prototype.beetweenStrings = function(leftValue, rightValue, subLeft) {
    var result = "",
        indexLeft = this.search(leftValue),
        indexRight = this.search(rightValue),
        leftWord = this.match(leftValue);
        
    if(leftWord) { // if exist its mean is one or more matched
        var lengthLeftWord = leftWord[0].length;
        indexLeft += lengthLeftWord;
    }   
   //  + stringLeft.length        
        
    if (subLeft) { indexLeft += subLeft; }
    if (indexLeft > -1 && indexRight > -1 && indexRight > indexLeft) {
        var temp = "";
        temp += this.substring(indexLeft, indexRight); //(indexLeft, indexRight);
        result = temp;
    } 
    return result;
}

// pobiera kontent z przystych wystapien znakow np dla nawiasow ((xx(yy)o)) ->  (xx(yy)o)
String.prototype.contentFromEvenChars = function(charLeft, charRight) {
    var result = "",
        countOpened = 0,
        countClosed = 0,
        isOpened = false;            
    
    for(var i=0; i < this.length; i++) {
        if (isOpened) {
            result += this[i];
        }
        
        if (this[i] == charLeft) { countOpened++; isOpened = true; }
        if (this[i] == charRight) {
            countClosed++; 
            if (!isOpened) {
               return "";
            } 
        }
        if (isOpened && countOpened == countClosed) {
            if (result.length > 0) {  // remove last char
                result = result.substring(0, result.length-1);
            }
            return result;
        }
    }    
    return "";
}

// pobiera zewnetrzny kontent z przystych wystapien znakow np dla nawiasow  aa((xx(yy)o))aa ->  aaaa
String.prototype.contentOutsideFromEvenChars = function(charLeft, charRight) {
    var resString = "";
    var range = this.rangeFromEvenChars(charLeft, charRight);
    if (range) {
        resString += this.substring(0, range.from-1);
        resString += this.substring(range.to+2, this.length);
    }
    return resString;
}

// String. pobiera zakres wewnetrzny z przystych wystapien znakow np dla nawiasow ((xx(yy)o)) ->  (xx(yy)o)
String.prototype.rangeFromEvenChars = function(charLeft, charRight) {
    var range = { },
        //result = "",
        countOpened = 0,
        countClosed = 0,
        isOpened = false;            
    
    for(var i=0; i < this.length; i++) {
        /*if (isOpened) {
            result += this[i];
        }*/        
        if (this[i] == charLeft) { 
             countOpened++; 
             isOpened = true;
             if (!range.from) {
                 range.from = i+1;
             }
        }
        if (this[i] == charRight) {
            countClosed++; 
            if (!isOpened) {
               return null;
            } 
        }
        if (isOpened && countOpened == countClosed) {
            //if (result.length > 0) {  // remove last char
            //    result = result.substring(0, result.length-1);
            //}
             if (!range.to) {
                 range.to = i-1;
             }            
            return range;
        }
    }    
    return null;
}




String.prototype.countFirstEmptyLines = function(string) {
   var array = this.split("\n");
   for(var i=0; i < array.length; i++) {
       array[i] = array[i].trim();
       if (array[i]) {
           return i;
       }
   }
   return 0;
}

// Array. Pobiera zakres wewnetrzny z parzystych wystapien znakow np dla nawiasow ((xx(yy)o)) ->  (xx(yy)o)
// options.includeChars
Array.prototype.rangeFromEvenChars = function(charLeft, charRight, options) {
    var range = { },
        //result = "",
        countOpened = 0,
        countClosed = 0,
        isOpened = false,
        iLStart = 0,
        i = 0;
        
    if (options && options.startPos) {
        iLStart = options.startPos.line;
        i = options.startPos.ch;
    }    
       
    for(var iL=iLStart; iL < this.length; iL++) {
        var line = this[iL];
        for(; i < line.length; i++) {
            //if (isOpened) {
            //    result += line[i];
            //}
            if (line[i] == charLeft) { 
                 countOpened++; 
                 isOpened = true;
                 if (!range.from) {
                     if (options && options.includeChars) {
                         range.from = {
                             line: iL,
                             ch: i
                         } 
                     } else {
                         range.from = {
                             line: iL,
                             ch: i+1
                         } 
                     }
                 }
            }
            if (line[i] == charRight) {
                countClosed++; 
                if (!isOpened) {
                   return null;
                } 
            }
            if (isOpened && countOpened == countClosed) {
                //if (result.length > 0) {  // remove last char
                //    result = result.substring(0, result.length-1);
                //}
                 if (!range.to) {
                     if (options && options.includeChars) {
                         range.to = {
                             line: iL,
                             ch: i
                         }  
                     } else {
                         var ch = i-1;                     
                         if (ch < 0) {
                             iL--;
                             ch = this[iL].length;
                         }                     
                         range.to = {
                             line: iL,
                             ch: i
                         }
                     }                
                 }            
                return range;
            }
        }
        i = 0;
    }    
    return null;
}

// mechanism similar to method search of object String 
// return posArray {line, ch}
Array.prototype.search = function(searchvalue) {
    if (typeof searchvalue === "string" || Object.prototype.toString.call( searchvalue ) === "[object RegExp]") {
        for(var i = 0; i < this.length; i++) {
            var ch = this[i].search(searchvalue);
            if (ch > -1) {
                return { line: i, ch: ch}
            }
        }
    }
}

// mechanism similar to method substring of object String 
// posArrayEnd is optional
// return array
Array.prototype.substring = function(posArrayStart, posArrayEnd) {
    var result = [];
    if (!posArrayEnd) {
        var posArrayEnd = {};
        posArrayEnd.line = this.length-1;
        posArrayEnd.ch = this[this.length-1].length;
    }
    if (posArrayStart && posArrayEnd && posArrayStart.line <= posArrayEnd.line) {
  
        if (posArrayStart.line == posArrayEnd.line && posArrayStart.ch < posArrayEnd.ch) {
            var string = this[posArrayStart.line].substring(posArrayStart.ch, posArrayEnd.ch);
            result.push(string);           
        } else if (posArrayStart.line  < posArrayEnd.line) {
            
            var startLine = this[posArrayStart.line],
                firstString = startLine.substring(posArrayStart.ch, startLine.length),
                endLine = this[posArrayEnd.line],
                endString = endLine.substring(0, posArrayEnd.ch),
                deltaLine = posArrayEnd.line - posArrayStart.line; 
                            
            result.push(firstString);
            if (deltaLine > 1) {
               var elemsToAdd = this.slice(posArrayStart.line+1, posArrayStart.line+deltaLine-1);
               for(var i=0; i < elemsToAdd.length; i++) {
                   result.push(elemsToAdd[i]);    
               }                    
            }            
            result.push(endString);          
        }
    }
    return result; 
}


Array.prototype.lastElement = function() {
    if (this.length > 0) {
        return this[this.length-1];   
    } else {
        return null;
    }
    
}



//attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
} 



if('filter' in Array == false) {
    Array.prototype.filter = 
        function(callback) {
            if(null == this || void 0 == this) {
                return;
             }
            var filtered = [];
            for(i = 0, len = this.length; i < len; i++) {
                    var tmp = this[i];
                    if(callback(tmp)) {
                        filtered.push(tmp);
                     }
             }
                return filtered;
       }
  }


var ObjectHelper = {
    copyParamOfArrayObject: function(paramName, objectArray, options) {
        var result = [],
            paramValue = "";
        if (Object.prototype.toString.call( objectArray ) === '[object Array]') {
            for(var i=0; i < objectArray.length; i++) {
                var object = objectArray[i];
                    paramValue = object[paramName];
                result.push(paramValue);
            }
        }
        return result;
    }
}

// override: set title dialog from text to html
if ($.ui) {
    $.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
        _title: function(title) {
            if (!this.options.title ) {
                title.html("&#160;");
            } else {
                title.html(this.options.title);
            }
        }
    }));
}

function popupwindow(url, title, w, h) {
  var left = (screen.width/2)-(w/2);
  var top = (screen.height/2)-(h/2);
  return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, location=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
} 

  function playSound(el,soundfile) {
      if (el.mp3) {
          if(el.mp3.paused) el.mp3.play();
          else el.mp3.pause();
      } else {
          el.mp3 = new Audio(soundfile);
          el.mp3.play();
          el.mp3.ended = function() {
              alert("end");
          }
      }
  }
  
  /*function stopSound(el) {
      
      if (el.mp3) {
          if(el.mp3.paused) el.mp3.play();
          else el.mp3.pause();
      } else {
          el.mp3 = new Audio(soundfile);
          el.mp3.play();
          el.mp3.ended = function() {
              alert("end");
          }
      }
  }  */
  
function randomTo(number) {
    var number = (Math.round(Math.random()*number)-1);
    return (number < 0)?0:number;
}

// autoCorr


// word - word who wrote
// wordPatten  =  word correct   
// pattern is : .?char.?char.?char.?char(...).?  and next each character is in turn removed and check again
function checkSimilarString(word, wordPattern) {
    var ch = "",
        regExpString = "",
        regExp = {};
        
    for(var j=0; j < wordPattern.length; j++) {
        
        regExpString = "";
        for(var i=0; i < wordPattern.length; i++) {
            ch = wordPattern[i];
            regExpString += ".?";
            if (i!=j) {
                regExpString += ch;
            }
        }
        regExpString += ".?";
        
        regExp = new RegExp("^"+regExpString+"$","i");
        if (word) {
            word = word.trim();
        }
        if (word.search(regExp) == 0) { // > -1 ) {
            var match = word.match(regExp);
            if (match) {
                return match[0];
            }
        }
    }    

    return null;
}


function jsRange(_from, _to) {
    this.from = _from;
    this.to = _to;
    this.length = function() {
        return this.to - this.from;
    }
    this.offset = function(offset) {
        this.from += offset;
        this.to += offset;
    }    
    this.copy = function() {
        var r = new Range();
        r.from = this.from;
        r.to = this.to;
        return r;
    }
}
function jsRangeMake(_from, _to) {
    return new jsRange(_from, _to);
}
//jsRange.prototype.create = function(_from, _to) {
//    return new jsRange(_from, _to);
//}

/*
 Range Array
  from: { line, ch }
  to: { line, ch }

 */



// dziedziczenie
/*Object.prototype.extend = function () {
   for (i in arguments) {
    tempObj = new arguments[i];
    for (property in tempObj) {
        this[property] = tempObj[property];
    } 
   }
};*/
