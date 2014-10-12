////////////////////
// CODE EDITOR - EXPLORER 


function CodeEditorExplorer() {    
    var that = this;
    this.idObjectTree = "id_explorer_panel_tree_object_tree";
    this.idObjectTreePrefix = "explorer_object_tree_prefix";
    
    this.uniqueId = 1;    
    this.jsonData = []; // = '[{ attributes: { id : "pjson_1" }, state: "open", data: "Root node 1", children : [ { attributes: { id : "pjson_2" }, data: { title : "Custom icon", icon : "../media/images/ok.png" } },{ attributes: { id : "pjson_3" }, data: "Child node 2" }, { attributes: { id : "pjson_4" }, data: "Some other child node" }]}, { attributes: { id : "pjson_5" }, data: "Root node 2" } ]';        
    
    this.create = function() {
      this.setJSTree();  
    }
    
    this.addNode = function(nodeId, objectLeaf) {
        $("#"+this.idObjectTree).jstree("create",nodeId,"last",{attr : {id: objectLeaf.attr.id, boardName:objectLeaf.attr.boardName, boardExtension:objectLeaf.attr.boardExtension, title:objectLeaf.data.title}, data: { title: objectLeaf.data.title, icon: objectLeaf.data.icon }},false,true);
               
    }    
    
    this.removeNode = function(nodeId) {
        $("#"+this.idObjectTree).jstree("remove",$("#"+nodeId));        
    }
    
    this.refreshJSTree = function(jsonObj) {    
        if (this.jsonData.length != jsonObj.length) {      
            for(var i=0; i < jsonObj.length; i++) {
                this.addNode(-1, jsonObj[i]);
                
            }   
            this.jsonData = jsonObj;
        }
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
                var boardName = data.rslt.obj.attr("boardName");
                $.jstree._focused().select_node("#"+nodeIdSelected);  
                
                $("#"+that.idObjectTree).jstree("toggle_node", data.rslt.obj);
                $("#"+that.idObjectTree).jstree("deselect_node", data.rslt.obj);  
				
                  var boardExtension = data.rslt.obj.attr("boardExtension");
                  if (boardName && boardExtension) {
                      codeEditor.openBoardCode(boardName, boardExtension);
                  }
                                              
                                              
            }).bind("loaded.jstree", function (event, data) {
                //$.jstree._focused().select_node("#"+that.idActionSelected);                                      
            }).bind("dblclick.jstree", function (event) {
               var node = $(event.target).closest("li");
               /*if (node && node[0]) {
                  var boardName = $(node[0]).attr("boardName");
                  var boardExtension = $(node[0]).attr("boardExtension");
                  if (boardName && boardExtension) {
                      codeEditor.openBoardCode(boardName, boardExtension);
                  }
               }*/
               
               
               //console.log(data);
               
               //alert("a");
               // Do my action
            });//.delegate("a", "click", function (event, data) { event.preventDefault(); });
                        
    }    

    	
}
