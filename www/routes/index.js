var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user');
var Place = require('../models/place');

//connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/hackathon', {
  //useMongoClient: true,
});
var db = mongoose.connection;

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
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

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

router.post('/', function (req, res, next) {
  var u_name = 'Anonymous';
  var user_id = req.body.user_id;
  var current_x = req.body.x;
  var current_y = req.body.y;
  var tags = ['museum'];
  var places = null;
  if (user_id !== '') {
    // This is the first request -> need to request to get user's name and user's tags
    var u_data = get_user_by_id(user_id);
    if (u_data != null) {
      u_name = u_data['name'];
      tags = u_data['tags'];
    }
  }
  // Calculate to get the location
  // Request server to get the t_places and r_places
  get_places(tags,function (data) {
      all_tags = get_all_tags();
      res.send({ user_name: u_name, places: data, all_tags: all_tags, tags: tags });
  });
})

router.post('/search', function (req, res, next) {
  var user_id = req.body.user_id;
  var current_x = req.body.x;
  var current_y = req.body.y;
  var tags = req.body.tags; // must not be null
  console.log(req.body);
  var places = null;
  if (user_id !== '') {
    // This is the first request -> need to request to get user's name and user's tags
    update_user_tags(user_id, tags);
  }
  // Calculate to get the location
  // Request server to get the t_places and r_places
  get_places(tags,function (data) {
      res.send({ places: data, tags: tags });
  });
});


router.get('/place', function (req, res, next) {
  res.send('Return the information of a special place');
});

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/map', function(req, res, next) {
  res.render('map', { title: 'City Guide Car' });
});

function get_user_by_id(u_id) {
  //res.render('view1', { UserName: 'Anonymous'});
  db.collection("users").findOne({ u_id: 1 }, function (err, user) {
    if (err || (user === null)) {
      return null;
    }
    else {
      return user;
    }
  });
}

router.get("/places", function( req, res, next ){
   db.collection("places").find({}).toArray(function (erro, place) {
      if (erro || (place === null)) {
        res.send([]);
      }
      else {
        // console.log('place: ',place);
        res.send(place);
      }
    });
})

router.post('/nearby', function (req, res, next) {
  var user_id = req.body.user_id;
  var current_x = req.body.x; //latitude
  var current_y = req.body.y;
  var tags = req.body.tags; // must not be null
  
  // Calculate to get the location
  // Request server to get the t_places and r_places
  get_nearby_places(tags, current_x, current_y,function (data) {
      res.send({ places: data });
  });
  
  res.send({hihi:1});

})


function get_places(tags, callback) {
  if (tags) {
    // console.log(tags);
    //user.id, user.name, user.tags
    db.collection("places").find({ tags: tags }).toArray(function (erro, place) {
      if (erro || (place === null)) {
        callback(null);
      }
      else {
        // console.log('place: ',place);
        callback(place);
      }
    });
  }
}

function update_user_tags(user_id, new_tags) {
  console.log('Update user tags: ', user_id, new_tags);
}

function get_all_tags() {
  return ["monument",
    "sight",
    "museum",
    "concert",
    "shopping",
    "food",
    "nightlift",
    "casino"
  ];
}

module.exports = router;