////////////////////
// GLOBAL CHANGE

var DELETED_ELEMENT_IMAGE = 1;
var DELETED_ELEMENT_SOUND = 2;
var DELETED_ELEMENT_ITEM = 3;
var DELETED_ELEMENT_CONVERSATION = 4;
var DELETED_ELEMENT_POPUP = 5;
var DELETED_ELEMENT_CLICKABLE_AREA = 6;

var EDIT_ELEMENT_IMAGE = 101;
var EDIT_ELEMENT_SOUND = 102;
var EDIT_ELEMENT_ITEM = 103;
var EDIT_ELEMENT_CONVERSATION = 104;
var EDIT_ELEMENT_POPUP = 105;
var EDIT_ELEMENT_CLICKABLE_AREA = 106;

function GlobalChange() {
  
	this.stringSystemIsAlreadyUsed = function() {
		return "The system is already used this name.<br />";
	}
  
	this.isExistsForName = function(name, typeAction) {
		if (name) {
            var isGlobalBoards = application.globalIsExistsForName(name, typeAction);                   
            var isGlobalClickableArea = canvas.globalIsExistsForName(name, typeAction);                   
			//var isGlobalItems = itemsContainer.globalIsExistsForName(name, typeAction);
            //var isGlobalConversations = conversationsContainer.globalIsExistsForName(name, typeAction);
            //var isGlobalPopups = popupsContainer.globalIsExistsForName(name, typeAction);
					
			var exists = isGlobalBoards || isGlobalClickableArea; //|| isGlobalItems || isGlobalConversations || isGlobalPopups;					
			return exists;
		} else {
			return false;
		}
	}
	
	this.setCorrectForName = function(name, typeAction, newName) {  // name when empty then action parameters to delete
		if (name) {
		    application.globalSetCorrectForName(name, typeAction, newName);
            canvas.globalSetCorrectForName(name, typeAction, newName);
			//itemsContainer.globalSetCorrectForName(name, typeAction, newName);
            //conversationsContainer.globalSetCorrectForName(name,typeAction, newName);
            //popupsContainer.globalSetCorrectForName(name,typeAction, newName);
		} 
	}
	
	this.isExistsSoundForName = function(name) {
		if (name) {
			//var isGlobalConversationsSound = conversationsContainer.globalIsExistsSoundForName(name);
			var isGlobalConversationsSound = true;
			var exists = isGlobalConversationsSound;
					
			return exists;
		} else {
			return false;
		}
	}	
	
}