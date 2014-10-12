////////////////////
// MESSAGES

var Messages = {
    tutorialWrong: function() {
        if (sequencesSystem.isSequenceActive) { 
            messageDialog.show("Tutorial", "Wykonaj dzialania z tutoriala.","OK");
        } 
    }
}
