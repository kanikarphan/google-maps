Google Maps Plugin
=====================
Google Maps plugin is an easy way to implement Google Map onto any web page. Dynamically creates the javascript version that carries over many of the different features that the Google Maps API offers.

## How to use it
Attach the googleMaps to an element
```
$(element).googleMaps();
```

## Plugin options
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>mapStatic</td>
      <td>boolean</td>
      <td>0</td>
      <td>embed a static google map image. if true map height and width needs to be define</td>
    </tr>
    <tr>
      <td>address</td>
      <td>string</td>
      <td>empty</td>
      <td>pass single or multiple address. spilt multiple address with ';'</td>
    </tr>
    <tr>
      <td>addressElem</td>
      <td>string</td>
      <td>empty</td>
      <td>use to select the address element</td>
    </tr>
    <tr>
      <td>mapHeight</td>
      <td>number</td>
      <td>100%</td>
      <td>map canvas height</td>
    </tr>
    <tr>
      <td>mapWidth</td>
      <td>number</td>
      <td>100%</td>
      <td>map canvas width</td>
    </tr>
    <tr>
      <td>disableUI</td>
      <td>boolean</td>
      <td>1</td>
      <td>enables/disables default google map ui</td>
    </tr>
    <tr>
      <td>streetView</td>
      <td>boolean</td>
      <td>0</td>
      <td>enables/disables street view control on map</td>
    </tr>
    <tr>
      <td>draggable</td>
      <td>boolean</td>
      <td>0</td>
      <td>enables/disables map to be draggable</td>
    </tr>
    <tr>
      <td>mapControl</td>
      <td>boolean</td>
      <td>0</td>
      <td>enables/disables upper right hand corner control on map</td>
    </tr>
    <tr>
      <td>zoom</td>
      <td>number</td>
      <td>12</td>
      <td>number lower zoom. higher number zoom</td>
    </tr>
    <tr>
      <td>disableClickZoom</td>
      <td>boolean</td>
      <td>1</td>
      <td>enables/disables zoom and center on double click</td>
    </tr>
    <tr>
      <td>scrollwheel</td>
      <td>boolean</td>
      <td>0</td>
      <td>enables/disables zoom with scrollwheel</td>
    </tr>
    <tr>
      <td>mapType</td>
      <td>string</td>
      <td>"ROADMAP"</td>
      <td>map type to render. 'ROADMAP','TERRAIN','SATELLITE','HYBRID'</td>
    </tr>
    <tr>
      <td>markerShow</td>
      <td>boolean</td>
      <td>1</td>
      <td>show/hide map marker</td>
    </tr>
    <tr>
      <td>markerClickable</td>
      <td>boolean</td>
      <td>1</td>
      <td>allow marker to be clickable</td>
    </tr>
    <tr>
      <td>markerIcon</td>
      <td>string</td>
      <td>null</td>
      <td>add custom icon image for marker base on img url</td>
    </tr>
    <tr>
      <td>markerAnimation</td>
      <td>string</td>
      <td>"NONE"</td>
      <td>animations that can be played on a marker. 'NONE', 'BOUNCE', 'DROP'</td>
    </tr>
    <tr>
      <td>fitBounds</td>
      <td>boolean</td>
      <td>0</td>
      <td>adjust map zoom to fit all markers into map viewport</td>
    </tr>
    <tr>
      <td>routeShow</td>
      <td>boolean</td>
      <td>0</td>
      <td>enables/disables map routes</td>
    </tr>
    <tr>
      <td>routeType</td>
      <td>string</td>
      <td>"DRIVING"</td>
      <td>route travel type. 'DRIVING','WALKING','BICYCLING','TRANSIT'</td>
    </tr>
    <tr>
      <td>routePanel</td>
      <td>string</td>
      <td>".route-panel"</td>
      <td>select element to use as directions panel to display route info</td>
    </tr>
    <tr>
      <td>routeStart</td>
      <td>string</td>
      <td>".route-start"</td>
      <td>route starting point</td>
    </tr>
    <tr>
      <td>routeEnd</td>
      <td>string</td>
      <td>".route-end"</td>
      <td>route ending point</td>
    </tr>
    <tr>
      <td>routeSubmit</td>
      <td>string</td>
      <td>".route-submit"</td>
      <td>element use to submit route</td>
    </tr>
    <tr>
      <td>routeType</td>
      <td>string</td>
      <td>"DRIVING"</td>
      <td>route travel type. 'DRIVING','WALKING','BICYCLING','TRANSIT'</td>
    </tr>
    <tr>
      <td>routeUnits</td>
      <td>string</td>
      <td>"METRIC"</td>
      <td>specifies route distance in units 'IMPERIAL' or 'METRIC'</td>
    </tr>
    <tr>
      <td>autoComplete</td>
      <td>string</td>
      <td>"start"</td>
      <td>bind google map auto complete to input element 'start' || 'end' || 'both'</td>
    </tr>
    <tr>
      <td>geolocation</td>
      <td>boolean</td>
      <td>1</td>
      <td>use browser geolocation lookup if google clientlocation null</td>
    </tr>
  </tbody>
</table>
<i>For the boolean option above use 0 or 1 instead of false or true.</i>

## Plugin options taken to the next level
All options above are configurable with HTML5 data attribute. This is a significantly cleaner solution (as long as you don’t mind the inline approach).

You can use the standard approach
```
$(element1).googleMaps();
$(element2).googleMaps({mapStatic: 0, address: 'foo; bar'});
$(element3).googleMaps({mapHeight: 100, mapWidth: 100});
```
<strong>or</strong>

HTML5 data approach
```
data-plugin-options='{"mapStatic":0,"address":"foo; bar"}'
data-plugin-options='{"mapHeight":100,"mapWidth":100}'
$(element).googleMaps(); // init the plugin once
```

## Plugin callback method
This plugin has four callback.
```
$(element).googleMaps({
  mapStart: function() {
    // do stuff here
  },
  mapComplete: function() {
    // do stuff here
  },
  mapClick: function() {
    // do stuff here
  },
  markerClick: function() {
    // do stuff here
  },
  routeComplete: function() {
    // do stuff here
  }
});
```