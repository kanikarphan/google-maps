/*  Google Maps v3 API plugin
    Author: Kanikar
    Info: https://github.com/kanikarphan
    Licensed under the MIT license
*/

/*  Usage: 
    // attach the plugin to an element
    $(element).googleMaps({address: 'foo'});

    // call a public method
    $(element).data('googleMaps').addMarker();

    // set the value of a property with data attributes
    data-plugin-options='{"address":"foo","mapStatic":1}'

    // get the value of a property from outside the plugin 
    $(element).data('googleMaps').settings.address;
*/

 ;(function($, window, document, undefined) {
  $.googleMaps = function(element, options) {
    // plugin variables
    var element = element, // reference to the actual DOM element
        _element = $(element), // reference to the jQuery version of DOM element
        metadata = _element.data('plugin-options') || {}, // html5 data attributes to support customization of the plugin on a per-element
        // empty variables below will be set later
        _map,
        _mapOptions,
        _geocoder,
        _marker,
        _click,
        _directionDisplay,
        _directionsRenderer,
        _directionsService,
        _request,
        _autocompOptions;
    // plugin default options. this is private property and is  accessible only from inside the plugin
    var defaults = { // default setting for plugin. (1 || 0) which is true or false
      mapStatic: metadata.mapStatic || 0, // embed a google map image. if true map height and width needs to be define (1 || 0)
      address: metadata.address || [], // pass single or multiple address. spilt multiple address with ';'
      addressElem: metadata.addressElem || [], // use to select the address element
      mapHeight: metadata.mapHeight || "100%", // set map canvas height
      mapWidth: metadata.mapWidth || "100%", // set map canvas width
      disableUI: metadata.disableUI || 1, // enables/disables all default ui (1 || 0)
      streetView: metadata.streetView || 0, // enables/disables street view control on map (1 || 0)
      draggable: metadata.draggable || 0, // enables/disables map to be draggable (1 || 0)
      mapControl: metadata.mapControl || 0, // enables/disables upper right hand corner control on map (1 || 0)
      zoom: metadata.zoom || 12, // zoom out set number lower || zoom in set number higher
      disableClickZoom: metadata.doubleClickZoom || 1, // enables/disables zoom and center on double click (1 || 0)
      scrollwheel: metadata.scrollwheel || 0, // enables/disables zoom with scrollwheel (1 || 0)
      mapType: metadata.mapType || "ROADMAP", // map type to render. 'ROADMAP','TERRAIN','SATELLITE','HYBRID'
      markerShow: metadata.markerShow || 1, // show/hide map marker (1 || 0)
      markerClickable: metadata.markerClickable || 1, // allow marker to be clickable (1 || 0)
      markerIcon: metadata.markerIcon || null, // add custom icon image for marker base on img url
      markerAnimation: metadata.markerAnimation || "NONE", // animations that can be played on a marker. 'NONE', 'BOUNCE', 'DROP'
      markers: {}, // store cache created marker for clearing with public method
      markersStatic: [], // use to store static marker geolocation
      fitBounds: metadata.fitBounds || 0, // adjust map zoom to fit all markers into map viewport (1 || 0)
      routeShow: metadata.routeShow || 0, // enables/disables map routes (1 || 0)
      routeType: metadata.routeType || "DRIVING", // route travel type. 'DRIVING','WALKING','BICYCLING','TRANSIT'
      routePanel: metadata.routePanel || ".route-panel", // select element to use as directions panel to display route info
      routeStart: metadata.routeStart || ".route-start", // route starting point
      routeEnd: metadata.routeEnd || ".route-end", // route ending point
      routeSubmit: metadata.routeSubmit || ".route-submit", // use to submit route
      routeType: metadata.routeType || "DRIVING", // route travel type. 'DRIVING','WALKING','BICYCLING','TRANSIT'
      routeUnits: metadata.routeUnits || "METRIC", // specifies route distance in units 'IMPERIAL' or 'METRIC'
      autoComplete: metadata.autoComplete || "start", // bind google map auto complete to input element 'start' || 'end' || 'both'
      geolocation: metadata.geolocation || 1, // use browser geolocation lookup if google clientlocation null (1 || 0)
      currentLoc: {}, // store cache client latitude / longitude
      errorLat: 33.68, // fallback if geolocation latitude fail
      errorLng: -117.79, // fallback if geolocation longitude fail
      mapStart: function() {}, // map start render callback function
      mapComplete: function() {}, // map complete render callback function
      mapClick: function() {}, // map click function
      markerClick: function() {}, // map marker click function
      routeComplete: function() {} // route complete render callback function
    };
    
    var plugin = this; // to avoid confusions, use "plugin" to reference the current instance of the object
    
    plugin.settings = {} // this will hold the merged default, and user-provided options plugin properties
    
    plugin.init = function() { // the "constructor" method that gets called when the object is created
      plugin.settings = $.extend({}, defaults, options, metadata); // the plugin's final properties are the merged default and user-provided options (if any)
      ($.isFunction(plugin.settings.onStart)) ? plugin.settings.onStart() : 0; // for callback before the map is rendering
      mapMngr(); // init mapMngr method
      googleLoc(); // init googleLoc method
    };

    // private methods can be called only from inside the plugin like: methodName(arg1, arg2, ... argn)

    var mapMngr = function() { // handler to determine what to use for geocoder
      (plugin.settings.mapStatic === 0) ? drawMap() : 0; // init drawMap method
      if(plugin.settings.address.length >= 1) { // use given address
        var _address = plugin.settings.address.split(';'); // split multi address by semicolon
        for(var i = 0; i < _address.length; i++) {
          _address[i] = _address[i].replace(/^\s*/, '').replace(/\s*$/, ''); // trim whitespace
          geoCoder(_address[i], i); // use geocoder to determine latitude / longitude 
        }
      } else if(plugin.settings.addressElem.length >= 1) { // use selector to get text as the address
        var _address = $(plugin.settings.addressElem);
        for(var i = 0; i < _address.length; i++) {
          _address[i] = $(_address[i]).text();
          geoCoder(_address[i], i); // use geocoder to determine latitude / longitude
        }
      } else {
        googleLoc(); // use client geolocation
      }
    };

    var drawMap = function() { // render the map
      var _height = plugin.settings.mapHeight,
          _width = plugin.settings.mapWidth;
      (plugin.settings.mapHeight.length > 0) ? _height = $(_element).css('height') : 0; // set map canvas height with css or through option
      (plugin.settings.mapWidth.length > 0) ? _width = $(_element).css('width') : 0; // set map canvas width with css or through option
      _element.css({ // set map canvas dimension
        'height': _height,
        'width': _width
      });
      _mapOptions = { // map options below should be set through defaults above. map options below base on google maps v3 api 
        disableDefaultUI: plugin.settings.disableUI,
        streetViewControl: plugin.settings.streetView,
        draggable: plugin.settings.draggable,
        mapTypeControl: plugin.settings.mapControl,
        zoom: plugin.settings.zoom,
        disableDoubleClickZoom: plugin.settings.disableClickZoom,
        scrollwheel: plugin.settings.scrollwheel,
        mapTypeId: google.maps.MapTypeId[plugin.settings.mapType]
      };
      _map = new google.maps.Map(_element[0], _mapOptions); // google map v3 api method
      google.maps.event.addListenerOnce(_map, 'tilesloaded', function () { // for on callback when map is done rendering
        ($.isFunction(plugin.settings.onComplete)) ? plugin.settings.onComplete() : 0;
      });
      google.maps.event.addDomListener(_map, 'click', function() { // add listener for when the map is click
        ($.isFunction(plugin.settings.mapClick)) ? plugin.settings.mapClick() : 0;
      });
      (plugin.settings.routeShow === 1) ? routeMngr() : 0; // init route method
    };

    var googleLoc = function() { // google loader ClientLocation to get latitude / longitude
      if (google.loader.ClientLocation != null) {
        markerMngr(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
        clientLoc(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
      } else {
        geoLoc(); // use client geolocation with browser lookup
      }
    };

    var geoLoc = function() { // browser geolocation to get latitude / longitude
      if((plugin.settings.geolocation === 1) && (!!navigator.geolocation)) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          markerMngr(pos.coords.latitude, pos.coords.longitude); // latitude / longitude from geolocation
          clientLoc(pos.coords.latitude, pos.coords.longitude);
        }, function(error) {
          switch(error.code) { // log error message
            case error.TIMEOUT:
              console.log('Timeout');
              break;
            case error.POSITION_UNAVAILABLE:
              console.log('Position unavailable');
              break;
            case error.PERMISSION_DENIED:
              console.log('Permission denied');
              break;
            case error.UNKNOWN_ERROR:
              console.log('Unknown error');
              break;
          }
          markerMngr(plugin.settings.errorLat, plugin.settings.errorLng); // fallback if geolocation fail
        });
      } else {
        markerMngr(plugin.settings.errorLat, plugin.settings.errorLng); // fallback if geolocation fail
      }
    };

    var clientLoc = function(_latitude, _longitude) { // cache client latitude / longitude
      plugin.settings.currentLoc.latitude = _latitude;
      plugin.settings.currentLoc.longitude = _longitude;
    };

    var geoCoder = function(_loc, i) { // get latitude / longitude base on address
      _geocoder = new google.maps.Geocoder();
      if(_geocoder) {
        var _address = _loc,
            _i = i || 0;
        _geocoder.geocode({'address': _address}, function(results, status) { // using google map geocode method and resize event
          if (status == google.maps.GeocoderStatus.OK) {
            var _latlng = results[0].geometry.location, 
                _latitude = _latlng.lat(), // latitude from geocode
                _longitude = _latlng.lng(); // longitude from geocode
            markerMngr(_latitude, _longitude, _i, _address); // call to handle map rendering
            google.maps.event.addDomListener(_element[0], 'resize', function() {  // add listener for when the map is resize
              _map.setCenter(_latlng);
            }); 
          } else {
            console.log('Geocode was not successful for the following reason: ' + status); // error handler for geocode
          }
        });
      }
    };

    var markerMngr = function(_latitude, _longitude, _i, _address) { // use to handle centering of map
      var _latlng = new google.maps.LatLng(_latitude, _longitude); // lat / long for the marker
      if(plugin.settings.mapStatic === 1) {
        plugin.settings.markersStatic.push('markers=color:red|label:null|' + _latitude + ',' + _longitude); // store static marker
        mapStatic(_latitude, _longitude); // init static map method
      } else {
        _map.setCenter(_latlng); // center map after marker 
      }
      (plugin.settings.markerClickable === 0) ? _click = false : _click = true; // marker clickable or not
      if(plugin.settings.markerShow === 1) { // add multi markers on the map
        _marker = new google.maps.Marker({ // markers options
          map: _map,
          position: _latlng,
          index: _i,
          title: _address,
          address: _address,
          icon: plugin.settings.markerIcon,
          clickable: _click, 
          animation: google.maps.Animation[plugin.settings.markerAnimation]
        });
        plugin.settings.markers[_i] = _marker; // store marker to markers object with id as its key
        google.maps.event.addDomListener(_marker, 'click', function() { // call to handle marker click event
          ($.isFunction(plugin.settings.markerClick)) ? plugin.settings.markerClick.apply(this, [this]) : 0;
        });
      }
      (plugin.settings.fitBounds === 1) ? _map.fitBounds(_map.getBounds()) : 0; // option to fit map zoom level to show all marker 
    };

    var mapStatic = function(_latitude, _longitude) { // static image of the map base on google maps v2 api
      var _staticType = plugin.settings.mapType.toLowerCase(), // static map type
          _mapHeight = parseInt(plugin.settings.mapHeight),
          _mapWidth = parseInt(plugin.settings.mapWidth);
      (plugin.settings.mapHeight === '100%') ? _mapHeight = 100 : 0;
      (plugin.settings.mapWidth === '100%') ? _mapWidth = 100 : 0;
      (plugin.settings.markerShow === 1) ? _markerStatic = plugin.settings.markersStatic.join('&') : _markerStatic = null; // static marker 
      var mapStaticSrc = 'http://maps.google.com/maps/api/staticmap?center=' + _latitude + ',' + _longitude + '&zoom=' + plugin.settings.zoom + '&size=' + _mapWidth + 'x' + _mapHeight + '&maptype=' + _staticType + '&markers=&' + _markerStatic + '&sensor=false'; // map image url base on google static maps api v2
      _element.html('<img class="map-static" src="' + mapStaticSrc + '" />').on('click', this, function() { // creat the static map image.
        ($.isFunction(plugin.settings.mapClick)) ? plugin.settings.mapClick() : 0; // add listener for when the static map is click
      }); 
    };

    var routeMngr = function() { // use to handel map route 
      var _origin = $(plugin.settings.routeStart), // route starting point
          _destination = $(plugin.settings.routeEnd), // route ending point
          _submit = $(plugin.settings.routeSubmit); // element use to submit route
      _directionsService = new google.maps.DirectionsService(); // google map v3 api method
      _directionsDisplay = new google.maps.DirectionsRenderer(); // google map v3 api method
      _directionsDisplay.setMap(_map); // google map v3 api method
      _directionsDisplay.setPanel($(plugin.settings.routePanel)[0]); // google map v3 api method
      _autocompOptions = { // google map v3 api method
        componentRestrictions: { country: 'us' }
      };
      switch(plugin.settings.autoComplete) { // bind google map autocomplete method to input
        case 'start':
          _autocomplete = new google.maps.places.Autocomplete(_origin[0], _autocompOptions);
          break;
        case 'end':
          _autocomplete = new google.maps.places.Autocomplete(_destination[0], _autocompOptions);
          break;
        case 'both':
          _autocomplete = new google.maps.places.Autocomplete(_origin[0], _autocompOptions);
          _autocomplete = new google.maps.places.Autocomplete(_destination[0], _autocompOptions);
          break;
        default:
      }
      _autocomplete.bindTo('bounds', _map); // google map v3 api method
      _origin.on('keypress', function(e) { // enter key to submit route
        var _keyCode = (e.keyCode ? e.keyCode : e.which);
        if (_keyCode === 13) {
          mapRoute(_origin, _destination);
        }
      });
      _destination.on('keypress', function(e) { // enter key to submit route
        var _keyCode = (e.keyCode ? e.keyCode : e.which);
        if (_keyCode === 13) {
          mapRoute(_origin, _destination);
        }
      });
      _submit.on('click', function() { // click event to submit route
        mapRoute(_origin, _destination);
      });
    };

    var mapRoute = function(_origin, _destination) { // route with direction
      var _start = _origin.val() || _origin.text(),
          _end = _destination.val() || _destination.text();
      if(!_start) { // verify that both start and end point has value before rendering the direction
        _origin.focus();
      } else if(!_end) {
        _destination.focus();
      } else {
        var _clientLati = plugin.settings.currentLoc.latitude || plugin.settings.errorLat, // use store cach client lat
            _clientLong = plugin.settings.currentLoc.longitude || plugin.settings.errorLng; // use store cach client long
        (_start.toLowerCase().match(/^current location/)) ? _start = new google.maps.LatLng(_clientLati, _clientLong) : 0; // use current location for start point
        (_end.toLowerCase().match(/^current location/)) ? _end = new google.maps.LatLng(_clientLati, _clientLong) : 0; // use current location for end point
        _request = { // route options
          origin: _start,
          destination: _end,
          travelMode: google.maps.DirectionsTravelMode[plugin.settings.routeType] // type of travel for route 
        };
        _directionsService.route(_request, function(response, status) { // google map v3 api method
          if (status == google.maps.DirectionsStatus.OK) {
            _directionsDisplay.setDirections(response);
            plugin.clearMarker(); // if marker are drawn clear all marker. only show start and end marker for route
            ($.isFunction(plugin.settings.routeComplete)) ? plugin.settings.routeComplete() : 0; // for callback when the route is done rendering
          } else {
            console.log('Getting route was not successful for the following reason: ' + status); // error handler when route fail
          }
        });
      }
    };

    // public methods can be called like: plugin.methodName(arg1, arg2, ... argn) from inside the plugin or element.data('googleMaps').publicMethod(arg1, arg2, ... argn) from outside the plugin, where "element" is the element the plugin is attached to
    
    // public methods below are for non static maps
    plugin.iconMarker = function(_i, _iconSrc) { // use to update marker icon src from outside of the plugin
      google.maps.event.addDomListener(_map, 'tilesloaded', function() {
        plugin.settings.markers[_i].setIcon(_iconSrc);
      });
    };

    plugin.deleteMarker = function(_i) { // use to delete certain marker from outside of the plugin
      plugin.settings.markers[_i].setMap(null);
    };

    plugin.clearMarker = function() { // use to delete clear all marker from outside of the plugin
      for (_i in plugin.settings.markers) { 
        if (plugin.settings.markers.hasOwnProperty(_i)) {
          plugin.settings.markers[_i].setMap(null);
        }
      }
    };

    plugin.addMarker = function(_latlng, _i, _address, _iconSrc, _click, _animation) { // use to add marker from outside of the plugin
      _marker = new google.maps.Marker({ // markers options
        map: _map,
        position: _latlng,
        index: _i,
        title: _address,
        address: _address,
        icon: _iconSrc,
        clickable: _click,
        animation: google.maps.Animation[_animation]
      });
      plugin.settings.markers[_i] = _marker;  // add to store cache created marker
      _map.setCenter(_latlng); // center map base on marker lat / long
    }

    plugin.clearRoute = function() { // use to clear all route object
      _directionsDisplay.setMap(null);
      _directionsDisplay.setPanel(null);
      _directionsDisplay = new google.maps.DirectionsRenderer();
      _directionsDisplay.setMap(_map);
      _directionsDisplay.setPanel($(plugin.settings.routePanel)[0]);
    };

    plugin.init();// init the plugin. call the "constructor" method

  }
  
  $.fn.googleMaps = function (options) {// add the plugin to the jQuery.fn object
    return this.each(function () {
      if(undefined == $(this).data('googleMaps')) { // if plugin has not already been attached to the element        
        var plugin = new $.googleMaps(this, options); // pass the DOM element and the user-provided options as arguments
        $(this).data('googleMaps', plugin);
      }
    });
  }

})(jQuery, window, document);