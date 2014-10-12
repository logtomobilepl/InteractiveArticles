////////////////////
// CONVERT

var Convert = {
    br2nl: function(str) {
        if(!str) {
            str = "";
        }
        return str.replace(/<br\s*\/?>/mg, "\n");
    },
    nl2br: function(str) {
        if(!str) {
            str = "";
        }
        return str.replace(/\n/g, '<br />');
    },
    nl_and_br2empty: function(str) {
        if(!str) {
            str = "";
        }
        str.replace(/\n/g, '');
        str.replace(/<br\s*\/?>/mg, "");
        return str;
    },
    array2String: function(array,character) {
        var result = "";
        for(var i = 0; i < array.length; i++) {
            result += array[i];
            if (i < array.length - 1) {
               result += character; 
            }
        }
        return result;
    },
    string2Array: function(string,character) {
        var result = string.split(character);
        for(var i = result.length-1; i >=0; i--) {
            if (result[i] == "") {
                result.splice(i,1);
            }
        }
        return result;
    }, // example    tekst|jakis  ->  tekst**jakis 
    stringChangeSeparate: function(string, separateOld, separateNew) {
        var result = string;
        if (string && separateOld && separateNew) {
            var array = string.split(separateOld);
            result = array.join(separateNew);
        }
        return result;
    },
    specialCharsToHtml: function(value) {
        var retval = value;
        if (retval) {
           return retval.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"").replace(/&#039/g, "'").replace(/&#39;/g, "'").replace(/&#39/g, "'");
        } else {
            return "";
        }
    },
    multiLineTextToHtml: function(multiLineText) {
        var textWithBr = that.nl2br(multiLineText),
            textHTML = specialCharsToHtml(textWithBr);
        return textHTML;    
    }                 
}
