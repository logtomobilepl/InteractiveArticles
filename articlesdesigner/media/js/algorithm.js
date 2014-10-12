////////////////////
// ALGORITHM

/*
<   < 
>   >
*   *
/   /
+   +
-   -
==  =
!=  ~
<=  ,

*/

//2 + 20 == -

// rpn_info
// infix_info


//rpnInfo      extras information  (order of statements)
//rpnDetails   extras information  (brackets)


var Algorithm = {
    rpn_details_to_info : function(rpn_details) {  // rpn_details_to_info
        
        //rpn_details.token
        //rpn_details.type
        
        //input = input.trim();
        var //ar = input.split(/\s+/), 
            det = rpn_details,
            detElem = {},
            st = [], 
            token,
            re = /\+|\-|\*|\\|!|!=|&&|\|\||<=|>=|<|>|==|=/g,
            //re2 = /^\+|\-|\*|\\|!|!=|&&|\|\||<=|>=|<|>|==|=$/, //to test      // /^[\+\-\/\*\(\)&\|]$/,  // & is &&, | is ||
            info = [],
            error = "",
            resObj = {};

        while( detElem = det.shift()) {  //ar.shift()) {            
            token = detElem.token;
            var tokenVar = token.replace(re,"").trim("");
            
            if(token == +token) { // token  jako liczba
                st.push({
                    parent: null,
                    type: "number",
                    token: token
                }); 
            } else if (tokenVar) {  // if(!re2.test(token)) { // token jako zmienna 
                st.push({
                    parent: null,
                    type: "variable",
                    token: token
                }); 
            } else {                
                if (token != "!") {                
                    var n2 = st.pop(), n1 = st.pop();
                    //var re = /^[\+\-\/\*]$/;
                    //if(n1 != +n1 || n2 != +n2 || !re.test(token)) {
                    //    throw new Error('Invalid expression: ' + input);
                    //}
                    //token = token.replace("&","&&"); old 
                    //token = token.replace("|","||"); old
                    var statement = n1.token + token + n2.token,
                        value = eval(statement);
    
                    var objLocalInfo = {
                        leftParent: n1.parent,
                        leftOperand:  n1.token,
                        leftValue: eval(n1.token),
                        leftIsNumber: !isNaN(n1.token),
                        leftIsNegation: n1.isNegation,
                        rightParent: n2.parent,
                        rightOperand: n2.token,
                        rightValue: eval(n2.token),
                        rightIsNumber: !isNaN(n2.token),
                        rightIsNegation: n2.isNegation,
                        token: token,
                        statement: statement, // code
                        value: value
                    }
                    info.push(objLocalInfo);
                    
                    st.push({
                        parent: objLocalInfo,
                        type: "number",
                        token: value
                    });
                } else { // negation
                    var n2 = st.pop();
                    n2.token = "!"+n2.token;//  !eval(n2.token);
                    n2.isNegation = true;//  !eval(n2.token);
                    st.push(n2);
                }
                
            }
        }
        if(st.length !== 1) {
            error = 'Invalid expression: ' + input;
            //throw new Error('Invalid expression: ' + input);
        }
        var rn = st.pop(),
            valueResult = eval(rn.token),
            valueIsNumber = !isNaN(valueResult);
        resObj = {value: valueResult, valueIsNumber: valueIsNumber,  info: info, json: JSON.stringify(info), error: error};
        resObj.success = (error)?false:true;
        return resObj;
    },
    rpn_to_info : function(rpn) {    
        var rpn_details = [],
            ar = rpn.trim().split(/\s+/)
        for(var i=0; i < ar.length; i++) {
            var ch = ar[i];
            rpn_details.push({token: ch, type: undefined});
        }    
        return this.rpn_details_to_info(rpn_details);
    },
    infix_to_rpn_to_info : function(input) { 
        var rpn = this.infix_to_rpn(input),
            info = this.rpn_to_info(rpn);
        return info;
    },
    infix_to_rpn_details : function(input) { 
        
        input = input.trim();
                
        function priority(tn) {
            switch(tn) {

                case "!": return 8;
                case "*": case "/": return 7;
                case "+": case "-": return 6;
                
                case "<": case ">": case "<=": case ">=": return 5;
                case "==": case "!=": return 4;                
                
                case "&&": return 3;
                case "||": return 2;
                case "=": return 1;
                                
                default: return 0;
            }
        }
        
        // (  -> %1%
        // %1%   - >  (
        
        var hashSign = {
            map: ["(",")","&","|",   "+","-", "*", "/"],        // "*","/","+","-",
            sign2indexHash: function(sign) { // ( -> %1%
                for(var ind = 0; ind < this.map.length; ind++) {
                    if (this.map[ind] == sign) {
                        return "%"+ind+"%";
                    }        
                }                            
            },
            /*indexHash2sign: function(indexHash) { // %1% -> (
                indexHash = parseInt(indexHash.replace(/%/g, ""));
                if (indexHash > -1 && indexHash < this.map.length) {
                    return this.map[indexHash];    
                }
            },*/
            replaceAllStringHash2sign: function(string) { //  hash to sign for all map
                var matched =  string.match(/\%\d*\%/g);
                if (matched) {
                    for (var i=0; i < matched.length; i++) {
                        var index = matched[i].match(/\d*/g).join("").trim();
                        index = parseInt(index);
                        if (!isNaN(index)) {
                            string = string.replace(matched[i], this.map[index]);
                        }                        
                        //string = string.replace(new RegExp("%"+i+"%","g"), this.map[i]);
                    }
                }
                return string;
            }            
        }        
           
        // in string  search statement with brackets and change brackets in symbols
        //  10 * 20 * function(varr) +20   ->  10 * 20 * function%1%varr%2% +20 
        //  10 * 20 * arr[function(varr)*2] +20   ->  10 * 20 * arr[function%1%varr%2%*2] +20 
        function findVariableOfFunction(string) {
            var typeOpers = { none: "", brackets: "br", array: "ar" }
            var result = "", isFind = false, tO = typeOpers.none, isoB = false, oB = 0, cB = 0;                
            for(var i=0; i < string.length; i++) {  // find first sign with letter
                if (!isFind && /^[A-Za-z\_]+$/.test(string[i])) { // variable
                    isFind = true;
                }
                
                //   /^\+|\-|\*|\\|!=|&&|\|\||<=|>=|<|>|==$/
                //  /^[+\-*\\\)]+$/
                
                if (isFind && tO == typeOpers.none && /^\+|\-|\*|\\|!|&|\||<|>|=|\)$/.test(string[i])) {
                    isFind = false;
                }
                // zmienna1*
                
                var ch  = string[i];
                //var mod  = string.substring(i, string.length);
                if (isFind) {  
                    if (tO == typeOpers.none || tO == typeOpers.array) {
                        if (string[i] == "[") {
                            tO = typeOpers.array;                        
                        } else if (string[i] == "]") {
                            isFind = false;
                            tO = typeOpers.none;
                        } else if (string[i] == "(" && tO == typeOpers.array) {
                            ch = hashSign.sign2indexHash(string[i]);  
                            string = string.splice(i, 1, ch);  
                            i += 2; 
                        } else if (string[i] == ")" && tO == typeOpers.array) {
                            ch = hashSign.sign2indexHash(string[i]);
                            string = string.splice(i, 1, ch);  
                            i += 2; 
                        }
                    }
                    
                    if (tO == typeOpers.none || tO == typeOpers.brackets) {
                        if (string[i] == "(") {     
                            tO = typeOpers.brackets;
                            oB++; 
                            isoB=true; 
                            ch = hashSign.sign2indexHash(string[i]);  
                            string = string.splice(i, 1, ch);  
                            i += 2; 
                        } else if (isoB && string[i] == ")") { 
                            cB++; 
                            ch = hashSign.sign2indexHash(string[i]);  
                            string = string.splice(i, 1, ch); 
                            i += 2;
                        }      
                    }
                    
                    var indexHash = hashSign.sign2indexHash(string[i]);
                    if (indexHash) {
                        string = string.splice(i, 1, indexHash);
                        i += 2;
                    }

                    //result += ch;
                    if (isoB && oB == cB) {
                        isFind = false;
                        tO = typeOpers.none;
                        isoB = false;
                        oB = 0;
                        cB = 0;
                    }
                }
            }
            return string;
        }
        
        /*function changeAndOrInOperators(conditionCode) {
            var 
            var prJS = new ParserJSCode({
                events: {
                    foundChar: function(obj) {
                        if ((!obj.state.isOpenQuotation1 && !obj.state.isOpenQuotation2 )) {                                            
                            
                            var 

                            var newWord = prefixEMU+"."+obj.word,
                                leftSide = code.substring(0, obj.iC - obj.word.length),
                                rightSide = code.substring(obj.iC, code.length);
                                                                                
                            code = leftSide+newWord+rightSide;
                            prJS.setCode(code);
                            prJS.seek(0); 
                        }
                    }              
                }
            });
            prJS.parse(conditionCode);
            return conditionCode;
        }*/
        
        
        function setNegation(signs) {    // -1*-1  ->  (0-1)*(0-1)
            var //result = "",
                ch = "",
                findNeg = true;
                
            for(var i=0; i < signs.length; i++) {                
                if (findNeg) {
                    if (signs[i] == "-" && i+1 < signs.length && !isNaN(signs[i+1])  ) {                        
                        signs.splice(i+2,0,")");
                        signs.splice(i,0,"0");
                        signs.splice(i,0,"(");
                        i+=3;
                    }
                }
                
                // we set neg for  (,+,-,\,*,|,&
                if ( /[\(\+\-\/\*\|&]$/.test(signs[i]) ) {
                    findNeg = true;
                } 
                // for end of bracket ')' and digit
                if ( /[\)\d]$/.test(signs[i]) ) {
                    findNeg = false;
                }                
                // for variable
                if ( /[a-zA-Z]$/.test(signs[i]) ) {
                    findNeg = false;
                }                
                
                /*if (!isFind && /^[\-]\d$/.test(ch)) { // variable
                    findMinus = true;
                    ch += "("
                    isFind = true;
                }
                result += ch;*/
            }
           // return result;
        }
        
        
        // ar = ar.replace(/or/g," || ").replace(/and/g," && "),               
        
        input = ParserJS.replaceWordsOutsideString(input,"and"," && ");
        input = ParserJS.replaceWordsOutsideString(input,"or"," || ");
        input = findVariableOfFunction(input); // set hash in variable
       
        // OR AND
            // re - correct token operator
            // re2 - search statement 
        var re = /^\+|\-|\*|\\|!|!=|&&|\|\||<=|>=|<|>|==|=$/,   //token     //    /^[\+\-\/\*\|&]$/,  //  
            re2 = /^\+|\-|\*|\\|!|!=|&&|\|\||<=|>=|<|>|==|=|\(|\)$/,                 //    /^[\+\-\/\*\(\)\|&]$/,
            ar = "", st = [], token, out = "", outDetails = [], resObj = {}, error = "";
            
            
        ar = input.replace(/\+/g," + ").replace(/\-/g," - ").replace(/\*/g," * ").replace(/\//g," / ").replace(/\(/g," ( ").replace(/\)/g," ) ");
        ar = ar.replace(/\|\|/g," || ").replace(/&&/g," && ");
        ar = ar.replace(/<=/g," <= ").replace(/>=/g," >= ");                
        ar = ar.replace(/==/g," == ").replace(/!=/g," != ");
        
        //ar = ar.replace(/</g," < ").replace(/>/g," > ");


        // <, >, !
        for(var ind=0; ind < ar.length; ind++) {
            if ((ar[ind] == "<" || ar[ind] == ">" || ar[ind] == "!") && ind+1 < ar.length && ar[ind+1] != "=" ) {
                ar = ar.splice(ind, 1, " "+ar[ind]+" ");
                ind+=2;
            }
        }        
        
        // = 
        for(var ind=0; ind < ar.length; ind++) {
            if (ar[ind] == "=" && ind>0 && ind+1 < ar.length && 
                (ar[ind+1] != "=" && ar[ind-1] != "=" && ar[ind+1] != "!" && ar[ind-1] != "!"  && ar[ind-1] != "<" && ar[ind+1] != "<" && ar[ind-1] != ">" && ar[ind+1] != ">")    ) {
                ar = ar.splice(ind, 1, " "+ar[ind]+" ");      
                ind+=2;
            }
        }
        
        // ar - wejscie (zbicie wyrazenia do jednego ciagu - rejestr przesuwny)
        ar = ar.trim();
        ar = ar.split(/\s+/);
        setNegation(ar);

        while( token = ar.shift()) {
            if (token == +token) {  // OK    +token   token is number of variable
                out += token+" ";
                outDetails.push({token:token, type:"number"});
                //console.log("OUT:"+out);
            } else if (!re2.test(token)) {                 
                token = hashSign.replaceAllStringHash2sign(token);
                // =  hashSign.sign2indexHash(string[i]);                
                //token = token.replace(/%1%/g, "(");  
                //token = token.replace(/%2%/g, ")");
                out += token+" ";
                outDetails.push({token:token, type:"statement"});
                //console.log("OUT:"+out);
            } else if (token == ")") { //
                var n; 
                while( n = st.pop()) { 
                    //drop.push(n);
                    if (n != "(") {
                        out += n+" ";
                        outDetails.push({token:n, type:"token"});
                        //console.log("OUT:"+out);
                    } else {
                        break;  // if sign '(' then stop get from stock
                    }
                }
                outDetails.push({token:token, type:"close_bracket"});
                
            } else if (token == "(") { // OK
                outDetails.push({token:token, type:"open_bracket"});
                st.push(token);            
            } else if (re.test(token)) { // is operator   // np is +
                var n, addAtEnd = false;
                
                while( n = st.pop()) {     // nie bierze pod uwage napotkania nawiasu   //  && (n!='(' && n!=')')

                    if (priority(n) < priority(token)) { // jeżeli ostatnim elementem stosu jest wyrażenie o niższym priorytecie
                        st.push(n);   
                        //addAtEnd = true;
                        //st.push(token); // na koncu umiesc element na stosie
                        //console.log("STOCK:"+st);
                        //console.log(token+" token > stack "+n);
                        break;
                    } else {            
                        out += n+" ";
                        outDetails.push({token:n, type:"token"});
                        //console.log("OUT:"+out);
                    }
                }
                st.push(token); // na koncu umiesc element na stosie
                //console.log("STOCK:"+st);
            } else { // not undefined token
                error = 'Invalid expression (not undefined token "'+token+'"): ' + input;
                throw new Error(error);
            }
        }
        var n; 
        while( n = st.pop()) {
            out += n+" ";
            outDetails.push({token:n, type:"token"});
        }        
        
        resObj = { outDetails: outDetails, out: out, error: error};
        resObj.success = (error)?false:true;
        return resObj;
    },
    infix_to_rpn : function(input) {
        return this.infix_to_rpn_details(input).out;
    },
    
}

        // wyrazenie na funkcje typu:   sadst-_s2rd(  innd_sad,  innaf( dddsf  )  )
        // [A-Za-z0-9\.\-\_]+\([\s]*([\s]*[A-Za-z0-9\.\-\_]+(\([^\)]*\))*[\s]*[,]?[\s]*)*\)
