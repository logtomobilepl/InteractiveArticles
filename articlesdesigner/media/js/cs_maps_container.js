////////////////////
// MAPS CONTAINER

function MapsContainer() {
    var maps = {},
        idPrefix = Generate.randomCharacters(16),
        mapUniqueId = 0,
        events = {},
        that = this;
            
    this.addEventListener = function(type, listener) {
        if (type && listener && typeof listener === "function") {
            events[type] = listener;
        }
    }
    
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
      controlUI.style.cursor = 'default';
	  controlText.style.color = 'black';
      controlText.innerHTML = '<b>'+text+'</b>';
      controlUI.appendChild(controlText);
    }  
    
    this.setDrag = function(mapId) {
        var dragMapControlDiv = document.createElement('div');      
        var addMarkerMapControlDiv = document.createElement('div');
        var div = maps[mapId].map.getDiv();      
        var parentMapDiv = $(div).parent()[0];

        dragMapControlDiv.dataset.mapId = mapId;
        addMarkerMapControlDiv.dataset.mapId = mapId;

        guiMapControl(dragMapControlDiv, maps[mapId].map, 1,"Drag","Drag&Move");            
        guiMapControl(addMarkerMapControlDiv, maps[mapId].map, 1,"Double click on map to put marker","");            

        maps[mapId].map.controls[google.maps.ControlPosition.TOP_LEFT].push(dragMapControlDiv);           
        maps[mapId].map.controls[google.maps.ControlPosition.TOP_LEFT].push(addMarkerMapControlDiv);           
                         
        $(dragMapControlDiv).mouseenter(function() {
            parentMapDiv.setAttribute('class', 'draggable_button');
            setButtonsDraggable();
        });   
        
        //$(addMarkerMapControlDiv).click(function() {
        //    alert("Set place")
        //}); 
    }
    
    this.addMap = function(element, width, height, lat, lng, zoom, options) {
        var mapDiv = document.createElement("div"),
            idMap = "",
            map = null;
        mapDiv.style.width = "100%";// initialMap.width+"px";
        mapDiv.style.height = "100%"; //initialMap.height+"px";
        element.style.padding = "10px";
        element.appendChild(mapDiv);   
        zoom = parseInt(zoom);    
        var mapOptions = { zoom: zoom,
                           mapTypeId: google.maps.MapTypeId.ROADMAP,
                           draggable: true,
                           //disableDefaultUI: true,
                            //overviewMapControl: false,
                            mapTypeControl: false,
                            panControl: false,
                            zoomControl: true,
                            scaleControl: false,
                            streetViewControl: false,
                            disableDoubleClickZoom: true
                           };
        mapOptions = $.extend(true, mapOptions, options);   
        mapOptions.center = (new google.maps.LatLng(lat, lng));
        mapUniqueId++;
        idMap = idPrefix+"_"+mapUniqueId;
        element.dataset.mapId = idMap;
        map = (new google.maps.Map(mapDiv, mapOptions));
        maps[idMap] = {
            map: map,
            mapId: idMap,
            markers: {}
        };           
        google.maps.event.addListener(map, 'dragstart', function() {
            if (events["dragstart"] && map) {
                events["dragstart"].call(that, maps[idMap], idMap);
            }            
        });          
        google.maps.event.addListener(map, 'dragend', function() {
            if (events["dragend"] && map) {
                events["dragend"].call(that, maps[idMap], idMap);
            }
        });                  
        google.maps.event.addListener(map, 'drag', function() {
            if (events["drag"] && map) {
                events["drag"].call(that, maps[idMap], idMap);
            }
        });                
        google.maps.event.addListener(map, 'zoom_changed', function() {
            if (events["zoom_changed"] && map) {
                events["zoom_changed"].call(that, maps[idMap], idMap);
            }
        });
        google.maps.event.addListener(map, 'click', function(event) {
            if (events["click"] && map) {
                events["click"].call(that, maps[idMap], idMap, event);
            }            
        });  
        google.maps.event.addListener(map, 'dblclick', function(event) {
            if (events["dblclick"] && map) {
                events["dblclick"].call(that, maps[idMap], idMap, event);
            }            
        });          
        return maps[idMap];                                                                          
    }
    
    this.removeMapByElement = function(element) {
        if (element && element.dataset.mapId) {
            maps[element.dataset.mapId] = undefined; // release of memory from google map instance
        }        
    }
    
    this.getMapById = function(mapId) {
        if (maps[mapId]) {
            return maps[mapId];
        } else {
            return null;
        }
    }
    
    this.addMarkerToMapId = function(mapId, lat, lng, options) {
        var markerId = "",
            markerObj = null,
            marker = null,
            markerOptions = {            
            draggable : false,
            animation : google.maps.Animation.DROP,
            position : new google.maps.LatLng(lat, lng)
        };
            
        markerOptions = $.extend(true, markerOptions, options);
        markerOptions.map = maps[mapId].map;
        marker = new google.maps.Marker(markerOptions);
        markerId = "marker_"+Generate.randomCharacters(16); 
        markerObj = {
            marker: marker,
            markerId: markerId,
            lat: lat,
            lng: lng,
            content: "",
            actions: {
                open_popup: "",
                go_to_board: "",
                play_sound: "",
            }
        }               
        maps[mapId].markers[markerId] = markerObj;
        
        google.maps.event.addListener(markerObj.marker, 'click', function() {
            if (events["marker_click"] && markerObj) {
                events["marker_click"].call(that, maps[mapId], mapId, markerObj, markerObj.markerId);
            }            
        });  
                
        return markerObj;       
    }
    
    /*
     function getIcon(color) {
        return MapIconMaker.createMarkerIcon({width: 20, height: 34, primaryColor: color, cornercolor:color});
     }
     
     function highlightMarker(marker, highlight) {
        var color = "#FE7569";
        if (highlight) {
            color = "#0000FF";
        }
        marker.setImage(getIcon(color).image);
    } */   
    
    this.addInfoToMarker = function(mapId, markerId, html) {
        var mapObj = maps[mapId],
            markerObj = maps[mapId].markers[markerId],
            infowindow = null;
        if (mapObj && markerObj) {
            infowindow = new google.maps.InfoWindow({
                content: html
            });
            infowindow.open(mapObj.map, markerObj.marker);
            if (events["open_info_window"]) {
                events["open_info_window"].call(that, maps[mapId], mapId, markerObj);
            }    
        }
    }
    
    this.removeMarkerFromMapId = function(markerId, mapId) {
        var mapObj = maps[mapId],
            markerObj = maps[mapId].markers[markerId],
            index = -1;
        if (mapObj && markerObj) {            
            mapObj.markers[markerObj.markerId].marker.setMap(null);
            mapObj.markers[markerObj.markerId].marker = undefined;
            mapObj.markers[markerObj.markerId] = undefined;
        }
    }
    
    this.removeAllMarkersFromMapId = function(mapId){
        var mapObj = maps[mapId];
        if (mapObj && mapObj.markers) {    
            for(var mk in mapObj.markers) {
                mapObj.markers[mk.markerId].marker.setMap(null);
                mapObj.markers[mk.markerId].marker = undefined;
                mapObj.markers[mk.markerId] = undefined;
            }                    
            map.markers = {};
        }        
    }    
    
    this.getMarkersAction = function(mapId) {
        var mapObj = maps[mapId],
            rsltData = [];
        if (mapObj && mapObj.markers) {    
            for(var param in mapObj.markers) {
                var mkObj = mapObj.markers[param];
                if (mkObj) {
                    rsltData.push({
                        lat: mkObj.lat,
                        lng: mkObj.lng,
                        actions: mkObj.actions
                    });
                }
            }                    
        }    
        return rsltData;
    }
    

}
