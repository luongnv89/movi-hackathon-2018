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
var places = [];

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
   
   $.get("/places", function( data ){
      places = data;
   });
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

function addMarker(lat, long, photo, title, id) {
   var marker = new google.maps.Marker({
     position: new google.maps.LatLng(lat, long),
     animation: google.maps.Animation.BOUNCE,
     icon: {
        url: photo,
        scaledSize: new google.maps.Size(50, 50), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    },
    title: title,
    id: id
   });
   marker.setMap(map);
   
   marker.addListener('click', function( ev) {
      loadDetailPlace("/place?place_id="+ id) ;
    }, id);
   
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
}


function showTracking() {
   if( arrayOfTrackingPoints.length == 0 )
      return;
   map.panTo( arrayOfTrackingPoints[0] );
   //zoom closer
   map.setZoom( 15 );
   
   var index = 1;
   var counter = 0;
   var _detail = function () {
      updateMyPosition( arrayOfTrackingPoints[ index ] );
      if( counter == 10 ){
         map.panTo( arrayOfTrackingPoints[ index ] );
         counter = 0;
      }
      counter ++;
      showNearBy( arrayOfTrackingPoints[index].lat, arrayOfTrackingPoints[index].lng );
      index ++;
      
      if (index < arrayOfTrackingPoints.length) 
         setTimeout( _detail, 300);
      else{
         //end of internerate
         text2speech("You have arrived your destination. Have a good day!")
      }
   }
   setTimeout( _detail, 1000);
}


function loadRouteFromURL(){
   var lat = parseFloat(getUrlParameter("x"));
   var lng = parseFloat(getUrlParameter("y"));
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

function loadDetailPlace( url ){
   
   $("iframe").attr("src", url);
   setTimeout(function(){
      $("#frame").css({
         "height": $(document).height(),
         "display": "block"});
   }, 500 );
   
   
   $("#closeBtn").click(function(){
      $("iframe").attr("src", "about:blank");
      $("#frame").css({
         "height": "0px",
         "display" : "none"
      })
   })
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
//   var data = {
//         x: x,
//         y: y,
//         user_id: "hoa",
//         tags: [ "sight", "museum", "concert" ]
//      };
//   
//   $.ajax({
//      type: "POST",
//      url: "/nearby",
//      data: data,
//      error: function(jqXHR, textStatus, errorMessage) {
//          console.log(errorMessage); // Optional
//      },
//      success: function(data) {
//         console.log(data)
//      } 
//  });
   for( var i=0; i<places.length; i++ ){
      var d = distance( x, y, places[i].location.x, places[i].location.y, 'K');
      //console.log( "distance " + d );
      if( d <= .6){
         if( ! places[i].isShowing ){
            text2speech("You are passing " +  places[i].name );
            addMarker(  places[i].location.x, places[i].location.y, places[i].photos[0], places[i].name, places[i].id );
            places[i].isShowing = true;
         }
      }else{
         if( places[i].isShowing )
            removeMarker(  places[i].location.x, places[i].location.y );
      }
   }
}




//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                          :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                        :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2017            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function distance(lat1, lon1, lat2, lon2, unit) {
var radlat1 = Math.PI * lat1/180
var radlat2 = Math.PI * lat2/180
var theta = lon1-lon2
var radtheta = Math.PI * theta/180
var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
dist = Math.acos(dist)
dist = dist * 180/Math.PI
dist = dist * 60 * 1.1515
if (unit=="K") { dist = dist * 1.609344 }
if (unit=="N") { dist = dist * 0.8684 }
return dist
}