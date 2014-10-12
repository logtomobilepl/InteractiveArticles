////////////////////
// Generate Singleton


var Generate = {
    randomCharacters: function(count) {
        var text = "",
            possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";        
        for( var i=0; i < count; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));        
        return text;
    },
    // @param  options.countDots  - default is 3 
    shortStringWithDotsRightSize: function(string, maxLength, options) {
        var countDots = (options && options.countDots)?options.countDots:3,
            result = string;
        maxLength = +maxLength;
        if (!isNaN(maxLength) &&  result.length > maxLength - countDots) {
            result = string.substring(0, maxLength-countDots);
            result += new Array(countDots).join("."); 
        }      
        return result;
    }
}



