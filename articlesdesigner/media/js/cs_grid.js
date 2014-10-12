////////////////////
// GRID

function Grid(canvasObject, showGridId, dragToGridId, gridSizeId) {
    var tempGridSize = 30;
    // temp & default gridSize
    this.canvasObject = canvasObject;
    this.showGridId = showGridId;
    this.dragToGridId = dragToGridId;
    this.gridSizeId = gridSizeId;    
    this.gridSize = tempGridSize;
    this.gridColor = "#d9ded7";
    this.gridNumericPlus = "grid_numeric_plus";
    this.gridNumericMinus = "grid_numeric_minus";
    var that = this;
    var lineClass = "gridLine";
    var typeGrid = "solid";//"dashed"
    var gridId = "gridDivId";
    var gridSizeMin = 2;
    var gridSizeMax = 99;
    var isShow;
    var isDrag = false;

    // show grid on/off
    $("#"+this.showGridId+", #"+this.showGridId+"_text").click(function(){
        if(isShow) {
            that.hide();
        } else {
            that.show();
        }
    });

    // drag to grid on/off
    $("#"+this.dragToGridId+", #"+this.dragToGridId+"_text").click(function(){
        if(isDrag) {
            isDrag = false;
        } else {
            isDrag = true;
        }
        that.setDrag(isDrag);
    });
    
    $("#"+gridSizeId).numeric({
                decimal : false,
                negative : false
            }, function() {                                
                this.value = "";
                this.focus();
            });
    $("#"+gridSizeId).change(function() {
        var value = $("#"+gridSizeId).val();
        refreshSizeValue(value);
    });
    
    var refreshSizeValue = function(value) {
        var value = parseInt(value);
        if(isNaN(value)) {
            value = tempGridSize;
        } else if(value < gridSizeMin) {
            value = gridSizeMin;
        } else if(value > gridSizeMax) {
            value = gridSizeMax;
        }

        that.createGrid(value);
        tempGridSize = value;
        document.getElementById(that.gridSizeId).value = value;
    }        
    
    $("#"+this.gridNumericPlus).mousedown(function(){        
        refreshSizeValue(tempGridSize+1);
    });
    $("#"+this.gridNumericMinus).click(function(){
        refreshSizeValue(tempGridSize-1);    
    });
    
    
    // Configure grid size
    
    // spinner
    /*var gridSizeSpinner = $("#" + gridSizeId).spinner({
        min : 2,
        max : 99,
        step : 1,
        start : tempGridSize
    });
    gridSizeSpinner.spinner("value", tempGridSize);
    gridSizeSpinner.keydown(function(e) {
        if(e.keyCode == 13) {
            refreshSpinnerValue(this.value);
        }
    });
    var refreshSpinnerValue = function(valueSpinner) {
        var min = gridSizeSpinner.spinner("option", "min");
        var max = gridSizeSpinner.spinner("option", "max");
        var value = parseInt(valueSpinner);
        if(isNaN(value)) {
            value = tempGridSize;
        } else if(value < min) {
            value = min;
        } else if(value > max) {
            value = max;
        }

        that.createGrid(value);
        tempGridSize = value;
        document.getElementById(that.gridSizeId).value = value;
        //spinner.spinner( "value", value );
    }

    gridSizeSpinner.spinner({
        spin : function(event, ui) {
            refreshSpinnerValue(ui.value);
        },
        change : function(event, ui) {
            refreshSpinnerValue(gridSizeSpinner[0].value);
        }
    });
    */

    var createGridElement = function(canvasObject, gridSize, isShow, isDrag) {
        var gridElement = document.createElement("div");
        gridElement.id = gridId;
        var addStyle = (isShow) ? "visibility: visible;" : "visibility: hidden;";

        gridElement.setAttribute('style', 'left: ' + canvasObject.marginLeft + 'px; top: ' + canvasObject.marginTop + 'px;width: ' + canvasObject.workspaceWidth + 'px;height: ' + canvasObject.workspaceHeight + 'px;  position: absolute;' + addStyle);

        for(var posGridX = 0; posGridX < canvasObject.workspaceWidth; posGridX += gridSize) {
            var lineElement = document.createElement("div");
            if(isDrag) {
                lineElement.setAttribute("class", lineClass);
            }
            lineElement.setAttribute('style', 'left: ' + posGridX + 'px; top: ' + 0 + 'px;width: ' + 2 + 'px;height: ' + canvasObject.workspaceHeight + 'px; border-left: ' +that.gridColor+ ' 1px ' + typeGrid + '; position: absolute');
            gridElement.appendChild(lineElement);
        }
        for(var posGridY = 0; posGridY < canvasObject.workspaceHeight; posGridY += gridSize) {
            var lineElement = document.createElement("div");
            if(isDrag) {
                lineElement.setAttribute("class", lineClass);
            }
            lineElement.setAttribute('style', 'left: ' + 0 + 'px; top: ' + posGridY + 'px;width: ' + canvasObject.workspaceWidth + 'px;height: ' + 2 + 'px; border-top: ' +that.gridColor+ ' 1px ' + typeGrid + '; position: absolute');
            gridElement.appendChild(lineElement);
        }
        return gridElement;
    }

    this.createGrid = function(gridSize) {
        this.gridSize = gridSize;
        var gridElement = document.getElementById(gridId);

        if(gridElement) {
            // remove old grid from canvas
            this.canvasObject.getCanvas().removeChild(gridElement);
        }
        // create new grid for canvas
        gridElement = createGridElement(this.canvasObject, gridSize, isShow, isDrag);        
        this.canvasObject.getCanvas().insertBefore(gridElement, this.canvasObject.getCanvas().firstChild);
        $(gridElement).css("opacity", 0.6);
    }
    refreshSizeValue(tempGridSize);

    this.setDrag = function(canDrag) {
        isDrag = canDrag;
        var gridElement = document.getElementById(gridId);
        if(gridElement) {
            for(var i = 0; i < gridElement.children.length; i++) {
                if(isDrag) {
                    gridElement.children[i].setAttribute("class", lineClass);
                } else {
                    gridElement.children[i].removeAttribute("class");
                }
                document.getElementById(dragToGridId).checked = isDrag;
            }
        }
    }

    this.show = function() {
        var gridElement = document.getElementById(gridId);
        if(!gridElement) {
            this.createGrid(this.gridSize);
        } 
        var gridElement = document.getElementById(gridId);
        if (gridElement) {
            gridElement.style.visibility = "visible";
            document.getElementById(showGridId).checked = true;
            isShow = true;            
        }
    }

    this.hide = function() {
        var gridElement = document.getElementById(gridId);
        if(gridElement) {
            gridElement.style.visibility = "hidden";
            document.getElementById(showGridId).checked = false;
            isShow = false;
        }
    }

    this.isShow = function() {
        return isShow;
    }

    this.getLineClass = function() {
        return lineClass;
    }
}