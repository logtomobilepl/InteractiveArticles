////////////////////
// CODE EDITOR - HELP 


function CodeEditorHelp() {    
    var that = this;
    
    this.isShow = false;    
    this.idObjectTree = "id_help_panel_tree_object_tree";
    this.idObjectTreePrefix = "help_object_tree_prefix";   
    
    this.uniqueId = 1;    
    this.jsonData = []; // = '[{ attributes: { id : "pjson_1" }, state: "open", data: "Root node 1", children : [ { attributes: { id : "pjson_2" }, data: { title : "Custom icon", icon : "../media/images/ok.png" } },{ attributes: { id : "pjson_3" }, data: "Child node 2" }, { attributes: { id : "pjson_4" }, data: "Some other child node" }]}, { attributes: { id : "pjson_5" }, data: "Root node 2" } ]';
    this.jsonString = "";
        

   /*this.showPTree = function(visible) {
        if (visible) {
            $("#"+this.idPanelTree).show();
            $("#"+this.idPanelNoTree).hide();
        } else {
            $("#"+this.idPanelTree).hide();
            $("#"+this.idPanelNoTree).show();            
        }
    }  
    this.showPInfo = function(visible) {
        $("#"+this.idPanelInfo).css("display",(visible)?"block":"none");
    }    */
    
    this.create = function() {
      //this.reflowTree();
      this.setJSTree();  
    }
    
    this.addNode = function(nodeIdParent, objectLeaf) {
        $("#"+that.idObjectTree).jstree("create", nodeIdParent, "last", {
            attr: {
                id: objectLeaf.attr.id, 
                boardName: objectLeaf.attr.boardName, 
                boardExtension: objectLeaf.attr.boardExtension, 
                lineNumber: objectLeaf.attr.lineNumber
            }, 
            data: { 
                title: objectLeaf.data.title, 
                icon: objectLeaf.data.icon 
            }
       }, false, true);
    }    
    
    /*this.addBeforeNode = function(nodeId, idNodeToAdd, nameToAdd) {
        $("#"+this.idObjectTree).jstree("create","#"+nodeId, "before", {attr : {id: idNodeToAdd}, data: {title: nameToAdd, icon}}, false, true);
    }
    
    this.addAfterNode = function(node, name) {
        $("#"+this.idObjectTree).jstree("create","#"+nodeId, "after", {attr : {id: idNodeToAdd}, data: nameToAdd}, false, true);
    }   */ 
    
    this.removeNode = function(nodeId) {
        $("#"+that.idObjectTree).jstree("remove",$("#"+nodeId));        
    }
   
    
    var getLeavesForCallback = function(leaves, callback) {
        var leaf = null;
        if (!callback || !(typeof callback === "function") || !leaves) {
            return;
        }
        for(var i=0; i < leaves.length; i++) {
            leaf = leaves[i];
            callback(leaf);
            if (leaf.leaves && leaf.leaves.length > 0) {
                getLeavesForCallback(leaf.leaves, callback);                
            }                        
        }
    }   
    
     
    this.refreshJSTree = function(jsonObj) {       
        var isUpdate = false,
            tmpJsonString =  JSON.stringify(jsonObj);
        
        //if (jsonObj.length != this.jsonData.length) {
        //    isUpdate = true;
        //}
        
        var tmpJsonStringTest = tmpJsonString.replace(new RegExp(this.idObjectTreePrefix+"\\d*","g"), "");
        var jsonStringTest = this.jsonString.replace(new RegExp(this.idObjectTreePrefix+"\\d*","g"),"");
        if (tmpJsonStringTest !=  jsonStringTest) {
           isUpdate = true;
        }
        
        /*if (!isUpdate && jsonObj.length == this.jsonData.length) {
            for(var i=0; i < this.jsonData.length; i++) {
                if (this.jsonData[i].data.title != jsonObj[i].data.title) {
                    isUpdate = true;
                    break;
                }
            }
        }*/
       
       
       if (isUpdate) {
           getLeavesForCallback(this.jsonData, function(leaf) {
               that.removeNode(leaf.attr.id);
           });
           getLeavesForCallback(jsonObj, function(leaf) {
               that.addNode(leaf.nodeIdParent, leaf);
           });
       }
       
       
       
                
        
        if (isUpdate) {
            /*
            console.log("update tree");
            for(var i=0; i < this.jsonData.length; i++) {
                this.removeNode(this.jsonData[i].attr.id);
            }          
            for(var i=0; i < jsonObj.length; i++) {
                this.addNode(jsonObj[i].nodeIdParent, jsonObj[i]);
                
            }*/   
            this.jsonData = jsonObj;
            this.jsonString = tmpJsonString;
        }
        
        
        
        // to ponizej nie bylo nawet stosowane
        
        /*var result = new Array();
        var removeAndAddFromIndex=-1;
        
        for(var i=0; i < jsonObj.length; i++) {          
            if ((this.jsonData.length > i && this.jsonData[i].data.title != jsonObj[i].data.title) ||
                i > this.jsonData.length) {
              //removeAndAddFromIndex = i;             
              console.log("refresh tree index:"+removeAndAddFromIndex);
              break;  
            }
        }
        
        if (removeAndAddFromIndex > -1) {
            for(var j=this.jsonData.length-1; j >= removeAndAddFromIndex; j--) {
                console.log("remove node index:"+j);
                this.removeNode(this.jsonData[j].attr.id);
            }       
            
            for(var j=removeAndAddFromIndex; j < jsonObj.length; j++) {
                console.log("add node index:"+j);
                this.addNode(-1, jsonObj[j]);
            }          
            this.jsonData = jsonObj;         
        }*/


        /*var scrollY = $("#"+this.idPanelTree).scrollTop();
        console.log(scrollY);
        this.setJSTree(); 
        $("#"+this.idPanelTree).scrollTop(scrollY);*/                       
    } 
    
              
    this.setJSTree = function() { //"html_data",
    
        $("#"+this.idObjectTree).jstree( { "plugins" : ["themes", "json_data", "crrm","ui"], // ,"ui"
            "core" : { animation: 0 /*"initially_open" : this.arrayIdParentsOfSelectedNode*/ }, 
            "themes" : { "theme" : "default","icons" : true},
            "ui": { "select_limit" : 1, },
            "json_data": {
                "data": that.jsonData
            }
			
            // 1) if using the UI plugin bind to select_node
            }).bind("select_node.jstree", function (event, data) { 
                // `data.rslt.obj` is the jquery extended node that was clicked    
                
                nodeIdSelected = data.rslt.obj.attr("id");
                var lineNumber = data.rslt.obj.attr("lineNumber");
				var boardName = data.rslt.obj.attr("boardName");
				var boardExtension = data.rslt.obj.attr("boardExtension");
                $.jstree._focused().select_node("#"+nodeIdSelected);  
                
                $("#"+that.idObjectTree).jstree("toggle_node", data.rslt.obj);
                $("#"+that.idObjectTree).jstree("deselect_node", data.rslt.obj);  
                
                
                //$("#"+codeEditor.idCodeEditorCode).scrollTop(lineNumber*20);
				if (boardName && boardExtension) {
					codeEditor.jumpToLine(boardName, boardExtension, lineNumber, 2);
				}
            }).bind("loaded.jstree", function (event, data) {
                //$.jstree._focused().select_node("#"+that.idActionSelected);                                      
            }).bind("dblclick.jstree", function (event) {
               //var node = $(event.target).closest("li");
               //var data = node.data("jstree");
               //alert("a");
               // Do my action
            });//.delegate("a", "click", function (event, data) { event.preventDefault(); });
                        
    }    
   
    

    /*this.reflowTree = function() {   
        var html = "";
        html += showTreeElement(this.data);
        $("#"+this.idObjectTree).html(html);
        
        //that.setEvents();
    }

    var showTreeElement = function(parent) {
        var html = "";
        if (parent && parent.children && parent.children.length > 0) {
            html += "<ul>";
            for(var i=0; i < parent.children.length; i++) {
                var object = parent.children[i];
                var nodeId = that.idObjectTreePrefix+object.uniqueId; 
                html += "<li id=\""+nodeId+"\" title='"+object.title+"'> \
                             <a style='cursor:default;'>  "+object.text+" </a>";  
                             // <span style='color:red;font-size:7pt;'><i>"+action.getInfo()+"</i></span></a>";
                html += showTreeElement(object);
                html += "</li>";            
            }
            html += "</ul>";
        }
        return html;
    } */         
          

    	
}
