var i=0;

function timedCount()
{
    i=i+1;
    postMessage(i);
    alert(i);
    setTimeout("timedCount()",500);
}

timedCount(); 