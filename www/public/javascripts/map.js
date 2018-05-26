var geocoder;
var map;
const directionsDisplay = new google.maps.DirectionsRenderer();;
const directionsService = new google.maps.DirectionsService();
const centerPosition    = new google.maps.LatLng( 48.852969, 2.349873 );
const myPositionMarker  = new google.maps.Marker( {
   position : centerPosition,
   //animation: google.maps.Animation.BOUNCE,
   //icon     : "images/bluecircle.png",
   icon     : "images/mypos.png"
});

var markerList = {};
var arrayOfTrackingPoints = [];

const locations = [
//      [
//            'Manly Beach 0', 48.852, 2.348], [
//            'Manly Beach 1', 48.856, 2.344], [
//            'Manly Beach 2', 48.850, 2.245]
      ];

function getUrlParameter( sParam ) {
   var sPageURL = decodeURIComponent(window.location.search.substring(1)),
       sURLVariables = sPageURL.split('&'),
       sParameterName,
       i;

   for (i = 0; i < sURLVariables.length; i++) {
       sParameterName = sURLVariables[i].split('=');

       if (sParameterName[0] === sParam) {
           return sParameterName[1] === undefined ? true : sParameterName[1];
       }
   }
};

function initialize () {
   map = new google.maps.Map( document.getElementById( 'map' ), {
      zoom : 13,
      center : centerPosition,
      mapTypeId : google.maps.MapTypeId.ROADMAP
   } );
   myPositionMarker.setMap( map );
   
   loadRouteFromURL();
}
google.maps.event.addDomListener( window, "load", initialize );

function showRoute( ){
   directionsDisplay.setMap( map );
   
   var marker, i;
   var request = {
      travelMode : google.maps.TravelMode.DRIVING
   };
   
   for ( i = 0; i < locations.length; i++ ) {
      marker = new google.maps.Marker( {
         position : new google.maps.LatLng( 
            locations[ i ][ 1 ],
            locations[ i ][ 2 ] ),
         map : map
      } );

      if ( i == 0 )
         request.origin = marker.getPosition();
      else if ( i == locations.length - 1 )
         request.destination = marker.getPosition();
      else {
         if ( !request.waypoints )
            request.waypoints = [];
         
         request.waypoints.push( {
            location : marker.getPosition(),
            stopover : true
         } );
      }
      marker.setMap( null );
   }
   
   directionsService.route( request, function ( response, status ) {
      if ( status == google.maps.DirectionsStatus.OK ) {
         directionsDisplay.setDirections( response );
         //save list of points on the route
         arrayOfTrackingPoints = [];
         for (var i = 0; i < response.routes[0].overview_path.length; ++i) {
            /*  marker = new google.maps.Marker({
                  map: map,
                  position: new google.maps.LatLng
                  (response.routes[0].overview_path[i].lat(), 
                  response.routes[0].overview_path[i].lng()),
                  animation: google.maps.Animation.BOUNCE
              });*/
            arrayOfTrackingPoints.push({
             lat: response.routes[0].overview_path[i].lat(), 
             lng: response.routes[0].overview_path[i].lng()});
        }
         
         showConfirmDialog();
      }
   } );
}

function hideRoute(){
   directionsDisplay.setMap( null );
}

function addMarker(lat, long) {
   var marker = new google.maps.Marker({
     position: new google.maps.LatLng(lat, long),
     animation: google.maps.Animation.BOUNCE
   });
   marker.setMap(map);
   
   markerList[ lat + "-" + long ] = marker;
}

function removeMarker( lat, long ){
   const m = markerList[ lat + "-" + long ];
   if( m ){
      m.setMap( null );
      delete markerList[ m ];
   }
}

//pos = {lat: lat, lng: long };
function updateMyPosition( pos ){
   myPositionMarker.setPosition( pos );
   setTimeout( function( p ){
      map.panTo( p );
   }, 500, pos );
}


function showTracking() {
   if( arrayOfTrackingPoints.length == 0 )
      return;
   map.panTo( arrayOfTrackingPoints[0] );
   //zoom closer
   map.setZoom( 16 );
   
   var c = 0;
   var interval = setInterval(function () {
      updateMyPosition( arrayOfTrackingPoints[c] );
      showNearBy( arrayOfTrackingPoints[c].lat, arrayOfTrackingPoints[c].lng );
      c++;
      if (c > arrayOfTrackingPoints.length) 
         clearInterval(interval);
   }, 2000);
}


function loadRouteFromURL(){
   var lat = parseInt(getUrlParameter("x"));
   var lng = parseInt(getUrlParameter("y"));
   updateMyPosition( {lat: lat, lng: lng} );
   
   //starting point
   locations.push( [0, lat, lng] );
   
   var target = getUrlParameter("target");
   target = JSON.parse( "[" + target + "]" );
   for( var i=0; i<target.length; i++ ){
      var t = target[i];
      locations.push( [i+1, t[0], t[1]] );
   }
   showRoute();
}

function showConfirmDialog(){
   showInfo();
   $("#goBtn").on("click", function(){
      hideInfo();
      showTracking();
   });
   $("#cancelBtn").on("click", function(){
      window.location="/";
   });
}

function showInfo(){
   $("#map").css("bottom", "130px");
   $("#info").css("height", "130px");
}

function hideInfo(){
   $("#map").css("bottom", "0px");
   $("#info").css("height", "0px");
}

function showNearBy(x, y){
   var data = {
         x: x,
         y: y,
         user_id: "hoa",
         tags: [ "sight", "museum", "concert" ]
      };
   
   $.ajax({
      type: "POST",
      url: "/nearby",
      data: data,
      error: function(jqXHR, textStatus, errorMessage) {
          console.log(errorMessage); // Optional
      },
      success: function(data) {
         console.log(data)
      } 
  });
}