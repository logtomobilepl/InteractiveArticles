////////////////////
// ACTIVE ELEMENT

function ActiveElement(parentId) {
    this.CALLBACK_ELEMENT_NOT_ACTIVE = "callback_element_not_active";
    var callbackElementNotActive;

    this.parentId = parentId;
    this.elementSelected = undefined;
    this.prevName;
    this.element = document.createElement("div");
    this.element.id = "activeElementDiv";
    this.element.style.position = "absolute";
    this.element.style.border = "2px dotted #aaa";
    this.element.style.visibility = "hidden";
    this.element.style.left = 0 + "px";
    this.element.style.top = 0 + "px";
    this.element.style.width = 0 + "px";
    this.element.style.height = 0 + "px";
    document.getElementById(this.parentId).appendChild(this.element);

    this.show = function(isShow) {
        if(isShow) {
            this.element.style.visibility = "visible";
        } else {
            this.element.style.visibility = "hidden";
        }
    }

    this.refresh = function() {
        if(this.elementSelected) {
            this.element.style.left = this.elementSelected.offsetLeft - 2 + "px";
            this.element.style.top = this.elementSelected.offsetTop - 2 + "px";
            this.element.style.width = this.elementSelected.offsetWidth + "px";
            this.element.style.height = this.elementSelected.offsetHeight + "px";
        }
    }

    this.setCallback = function(nameCallback, functionCallback) {
        if(functionCallback) {
            switch(nameCallback) {
                case this.CALLBACK_ELEMENT_NOT_ACTIVE:
                    callbackElementNotActive = functionCallback;
                    break;
                default:
                    break;
            }
        }
    }

    this.setActiveForElement = function(elementSelected) {
        this.setNotActive();
        this.elementSelected = elementSelected;
        if(elementSelected && elementSelected.dataset && elementSelected.dataset.designOutline == 1) {            
            this.show(true);
            this.refresh();
        }
    }

    this.setNotActive = function() {
        this.elementSelected = undefined;
        this.show(false);
        if(callbackElementNotActive) {
            callbackElementNotActive();
        }
    }

    this.updateElementInBase = function(params) {
        if(this.elementSelected) {
            var type;
            if (this.elementSelected.dataset) {
                type = this.elementSelected.dataset.designType;
            } else {
                type =  this.elementSelected.type;
            }
            updateObject(this.elementSelected, type, params);
        }
    }

    this.removeElementFromBase = function() {
        if(this.elementSelected) {
            var id = this.elementSelected.dataset.designId;
            var type = this.elementSelected.dataset.designType;
            if(id && type) {
                removeObject(this.elementSelected, type);
            }
        }
    }

    this.isVisible = function() {
        if(this.element.style.visibility == "visible")
            return true;
        else
            return false;
    }

}
