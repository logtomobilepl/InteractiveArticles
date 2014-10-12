////////////////////
// ANIMATIONS


function AnimClick() {
    var that = this;
    this.idCursor = "editor_cursor";
    this.idCursorClick = "editor_click";


    this.start = function(targetId, completeClb) {        
       var editorCursor = $("#"+that.idCursor),
           target = $("#"+targetId),
           posEndLeft = target.offset().left+target.width()/2,
           posEndTop = target.offset().top+target.height()/2,
           initialLeft = posEndLeft - 300,        
           initialTop = posEndTop - 400;
        
       editorCursor.css({"display": "block", "left": initialLeft+"px", "top": initialTop+"px"});
       editorCursor.animate({
           left: posEndLeft+"px",
           top: posEndTop+"px",
       }, 2600, "linear", function() {
           
          var editorClick = $("#"+that.idCursorClick);           
          editorClick.css({"display": "block", "left":(posEndLeft-20)+"px", "top": (posEndTop-20)+"px"});

          setTimeout(function() {
              editorCursor.css({"display": "none"});
              editorClick.css({"display": "none"});
              if (typeof completeClb === "function") {
                completeClb();
              }
          }, 400 );
            
       });  
        
    }

  
    
    
}
