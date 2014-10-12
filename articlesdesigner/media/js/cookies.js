
function setCookie(name, value, expire, domain) {
        document.cookie = name + "=" + escape(value) + ((expire==null)?"" : ("; expires=" + expire.toGMTString())) + ((domain==null)?"" : ("; domain=" + domain) );
}

function getCookie(name) { //1
    if (document.cookie!="") { //2
    var toCookie=document.cookie.split("; ");  //3
        for (i=0; i<toCookie.length; i++) { //4
            var nazwaCookie=toCookie[i].split("=")[0]; //5
            var wartoscCookie=toCookie[i].split("=")[1]; //6
            if (nazwaCookie==nazwa) return unescape(wartoscCookie) //7
        }
    }
}


function removeCookie(name) {
    var dzis = new Date()
    if (document.cookie!="") {
        var toCookie=document.cookie.split("; ");
        for (i=0; i<toCookie.length; i++) {
            var nazwaCookie=toCookie[i].split("=")[0];
            var wartoscCookie=toCookie[i].split("=")[1];
            if (nazwaCookie==name) document.cookie=nazwaCookie+"=;expires="+dzis.getMonth()-1
        }
    }
}

function removeAllCookies() {
    if (document.cookie!="") {
        var toCookie=document.cookie.split("; ");
        var dataWygasniecia=new Date;
        dataWygasniecia.setDate(dataWygasniecia.getDate()-1)
        for (i=0; i<toCookie.length; i++) {
            var nazwaCookie=toCookie[i].split("=")[0]; 
            document.cookie = nazwaCookie + "=;expires=" + dataWygasniecia.toGMTString();
            //document.cookie = toCookie[i] + ";expires=" + dataWygasniecia.toGMTString();
        }
    }
}

function displayAllCookies() {
    if (document.cookie!="") { //jeżeli istnieją w ogóle cookie
        toCookie = document.cookie.split("; "); //tworzymy talblice toCookie z ciasteczkami
        console.log("Ilosc cookie: " + toCookie.length); //wypisujemy ilosc cookie (czyli wielkosc toCookie)
        for (i=0; i<toCookie.length; i++) { //rozpoczyanmy petle po toCookie
            console.log("Nazwa cookie " + i + ": " + toCookie[i].split("=")[0]); //wypisujemy nazwe aktualnego cookie...
            console.log("Wartość cookie " + i + ": " + toCookie[i].split("=")[1]); //i jego wartosc
        }
    } else {
        console.log('Nie ma żadnych cookie');
    }
}
