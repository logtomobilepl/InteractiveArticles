////////////////////
// MAPS CONTAINER

function MapsContainer() {
    var maps = new Array();
    var mapUniqueId = 0;    
    
    var guiMapControl = function(controlDiv, map, index, text, title) {    
      controlDiv.index = index;
      controlDiv.style.padding = '5px';
    
      // Set CSS for the control border
      var controlUI = document.createElement('div');
      controlUI.style.backgroundColor = 'white';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '2px';
      controlUI.style.cursor = 'pointer';
      controlUI.style.textAlign = 'center';
	  controlUI.style.color = 'black';
      controlUI.title = title;
      controlDiv.appendChild(controlUI);
    
      // Set CSS for the control interior
      var controlText = document.createElement('div');
      controlText.style.fontFamily = 'Arial,sans-serif';
      controlText.style.fontSize = '12px';
      controlText.style.paddingLeft = '4px';
      controlText.style.paddingRight = '4px';
	  controlText.style.color = 'black';
      controlText.innerHTML = '<b>'+text+'</b>';
      controlUI.appendChild(controlText);
    }  
    
    this.addMap = function(element, width, height) {
        var mapDiv = document.createElement("div");
        var initialMap = { width: width, height: height }
        mapDiv.style.width = "100%";// initialMap.width+"px";
        mapDiv.style.height = "100%"; //initialMap.height+"px";
        element.style.padding = "10px";
        element.appendChild(mapDiv);       
        var mapOptions = { zoom: 13,
                           mapTypeId: google.maps.MapTypeId.ROADMAP,
                           center: new google.maps.LatLng(59.32522, 18.07002),
                           draggable: true,
                           disableDefaultUI: true,
                           };
        mapUniqueId++;
        maps[mapUniqueId] = new google.maps.Map(mapDiv, mapOptions);  
        element.dataset.mapId = mapUniqueId;  
          
        google.maps.event.addListener(maps[mapUniqueId], 'dragstart', function() {
            $(element).draggable( "destroy" );
        });                   
        google.maps.event.addListener(maps[mapUniqueId], 'drag', function() {
            var latLng = this.getCenter();                         
            //console.log(latLng);               
            setStyleOfElement(element, { latitude: latLng.lat(), longitude: latLng.lng(), drag_listener: true });
        });                
        google.maps.event.addListener(maps[mapUniqueId], 'zoom_changed', function() {
            var zoomListener = this.getZoom();
            setStyleOfElement(element, { zoom: zoomListener, zoom_listener: true });            
        });
        google.maps.event.addListener(maps[mapUniqueId], 'click', function() {
        });
        
        setStyleOfElement(element, { width: initialMap.width, height: initialMap.height }); 
                

        var dragMapControlDiv = document.createElement('div');      
        var addMarkerMapControlDiv = document.createElement('div');      

        dragMapControlDiv.dataset.mapId = mapUniqueId;
        addMarkerMapControlDiv.dataset.mapId = mapUniqueId;

        guiMapControl(dragMapControlDiv, maps[mapUniqueId], 1,"Drag","Drag&Move");            
        guiMapControl(addMarkerMapControlDiv, maps[mapUniqueId], 1,"Add marker","Click&Choose place");            

        maps[mapUniqueId].controls[google.maps.ControlPosition.TOP_LEFT].push(dragMapControlDiv);           
        maps[mapUniqueId].controls[google.maps.ControlPosition.TOP_LEFT].push(addMarkerMapControlDiv);           
                         
        $(dragMapControlDiv).mouseenter(function() {
            element.setAttribute('class', 'draggable_button');
            setButtonsDraggable();
        });   
        
        $(addMarkerMapControlDiv).click(function() {
            alert("Set place")
        });                                                                                                      
    }
    
    this.removeMapByElement = function(element) {
        if (element && element.dataset.mapId) {
            maps[element.dataset.mapId] = undefined; // release of memory from google map instance
        }        
    }
    
    this.addMarkerForMapId = function(id) {
        /*var marker = new google.maps.Marker({
            map : maps[mapUniqueId],
            draggable : true,
            animation : google.maps.Animation.DROP,
            position : new google.maps.LatLng(59.32522, 18.07002)
        });   */     
    }
    
    this.removeMarkerFromMap = function() {
        
    }
    
    this.getMapById = function(id) {
        if (maps[id]) {
            return maps[id];
        } else {
            return undefined;
        }
    }
    
    
}
