////////////////////
// CODE EDITOR - TEMPLATES & REGEXP

var varExp = new RegExp("var\\s+[^;]*[^;]","");
function CodeEditorTemplates() {    
    var that = this;
    
    this.stringDeclatationNew = function(variableName) {
        return "var "+variableName+" = new Object();";
    }    
    
    this.stringDeclatationNewClickableArea = function(variableName) {
        return "var "+variableName+" = new ClickableArea();";
    }

    this.stringDeclatationNewTextField = function(variableName) {
        return "var "+variableName+" = new TextField();";
    }
    
    this.stringDeclatationNewTextEdit = function(variableName) {
        return "var "+variableName+" = new TextEdit();";
    }    
    
    this.stringDeclatationNewButton = function(variableName) {
        return "var "+variableName+" = new Button();";
    }    
    
    this.stringDeclatationNewImage = function(variableName) {
        return "var "+variableName+" = new Image();";
    }    
    
    this.stringDeclatationNewObject = function(variableName, type) {
        switch(type) {
            case ELEMENT_TYPE_CLICKABLE_AREA:
                return that.stringDeclatationNewClickableArea(variableName);
                break;
            case ELEMENT_TYPE_TEXT:
                return that.stringDeclatationNewTextField(variableName);
                break;
            case ELEMENT_TYPE_TEXTEDIT:
                return that.stringDeclatationNewTextEdit(variableName);
                break;
            case ELEMENT_TYPE_BUTTON:
                return that.stringDeclatationNewButton(variableName);
                break;
            case ELEMENT_TYPE_IMAGE:
                return that.stringDeclatationNewImage(variableName);
                break;                
            default:
                return that.stringDeclatationNew(variableName);
                break;                
        }        
    }    
    
    this.stringObjectParameter = function(variableName, variableParameter, variableValue ) {
        var commas = "";
        if (variableParameter == "fontType" || variableParameter == "textColor" || 
            variableParameter == "titleColor" || variableParameter == "text" ||
            variableParameter == "html" || variableParameter == "image" || 
            variableParameter == "background") {
            commas = "\"";
        }
        if (variableParameter == "text") {
            variableValue = Convert.nl2br(variableValue);
        }
        return variableName+"."+variableParameter+" = "+commas+variableValue+commas+";";
    }    
    

    //this.regExpDeclarationNewAnyObject = function() {
     //   return new RegExp("(var)\\s*[^=]*=\\s*(new)\\s*(ClickableArea\\(\\);)","");                   
    //}    
    
    this.regExpDeclarationNewClickableArea = function() {
        return new RegExp("(var)\\s*[^=]*=\\s*(new)\\s*(ClickableArea\\(\\);)","");                   
    }
    
    this.regExpDeclarationNewTextField = function() {                
        return new RegExp("(var)\\s*[^=]*=\\s*(new)\\s*(TextField\\(\\);)","");                
    }
    
    this.regExpDeclarationNewTextEdit = function() {                
        return new RegExp("(var)\\s*[^=]*=\\s*(new)\\s*(TextEdit\\(\\);)", "");                
    }

    this.regExpDeclarationNewButton = function() {                
        return new RegExp("(var)\\s*[^=]*=\\s*(new)\\s*(Button\\(\\);)", "");                
    }

    this.regExpDeclarationNewImage = function() {                
        return new RegExp("(var)\\s*[^=]*=\\s*(new)\\s*(Image\\(\\);)", "");                
    }

    this.regExpDeclarationReturn = function() {                
        return new RegExp("(return)[^\\s]*[^;]+\\s*;", "");  
    }

    this.regExpDeclarationEqual = function() {                
        //  [^\\s]*[^=]=\\s*[\\w\\.\\+\\-\\s\"',:\\[\\]\\(\\)]+\\s*;    //  [^\\s]*[^=]=\\s*(\"[^\"]*\"|[\\d]+)\\s*;  // [^=]=\s*("[^"]*"|\d*); // RegExp("={1}[^=]*[^{]*");
        return new RegExp("[^\\s]*[^=]=\\s*[^;]+\\s*;", "");   
    }
        
    this.regExpDeclarationIncrement = function() {                
        return new RegExp("[\\w\\.]+\\s*\\+\\+\\s*;", ""); 
    }    
    
    this.regExpDeclarationDecrement = function() {                
        return new RegExp("[\\w\\.]+\\s*\\-\\-\\s*;", ""); 
    }         
    
    this.regExpDeclarationSum = function() {      
        return new RegExp("[\\w\\.]+\\s*\\+\\=\\s*[\\w\\.\\+\\s\"'\\[\\]\\(\\)]+\\s*;", ""); 
    }         
    this.regExpDeclarationMinus = function() {                
        return new RegExp("[\\w\\.]+\\s*\\-\\=\\s*[\\w\\.\\+\\s\"'\\[\\]\\(\\)]+\\s*;", ""); 
    }         
    this.regExpDeclarationMulti = function() {                
        return new RegExp("[\\w\\.]+\\s*\\*\\=\\s*[\\w\\.\\+\\s\"'\\[\\]\\(\\)]+\\s*;", ""); 
    }         
    this.regExpDeclarationDiv = function() {                
        return new RegExp("[\\w\\.]+\\s*\\/\\=\\s*[\\w\\.\\+\\s\"'\\[\\]\\(\\)]+\\s*;", ""); 
    }         
    
    this.regExpDeclarationAddAction = function() {                
        return  /[\w]*.addAction\("(onclick|ondrop)"[\s]*,[^{]*{[\s]*action:[^,]*,[\s]*name:[^}]*}[\s]*\)[\s]*;/;  //new RegExp("[\\w]*.addAction\\([^\\)]*\\);", "");                  
    }
    
    this.regExpDeclarationAddActionWithoutEndSemicolon = function() {                
        return  /[\w]*.addAction\("(onclick|ondrop)"[\s]*,[^{]*{[\s]*action:[^,]*,[\s]*name:[^}]*}[\s]*\)[\s]*/;                    
    }    
    
    this.regExpDeclarationGlobalVar = function() {
        return /var\s+[^;]*[^;]/g;
    }

    this.regExpGlobalVariable = function(variable) {
        return new RegExp("[^A-Za-z0-9_\\-\\.]"+variable+"[^A-Za-z0-9_\\-]", "g");
    }
    
    this.regExpEMUNewClickableArea = function() {
        return new RegExp("(EMU.)\\s*[^=]*=\\s*(new)\\s*(ClickableArea\\(\\);)","");                   
    }
    
    this.regExpEMUNewTextField = function() {                
        return new RegExp("(EMU.)\\s*[^=]*=\\s*(new)\\s*(TextField\\(\\);)","");                
    }
    
    this.regExpEMUNewTextEdit = function() {                
        return new RegExp("(EMU.)\\s*[^=]*=\\s*(new)\\s*(TextEdit\\(\\);)", "");                
    }

    this.regExpEMUNewButton = function() {                
        return new RegExp("(EMU.)\\s*[^=]*=\\s*(new)\\s*(Button\\(\\);)", "");                
    }
    
    this.regExpEMUNewImage = function() {                
        return new RegExp("(EMU.)\\s*[^=]*=\\s*(new)\\s*(Image\\(\\);)", "");                
    }    
    
 
}
