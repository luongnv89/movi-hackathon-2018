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

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

/* GET home page. */
router.get('/route', function (req, res, next) {
  res.send('Return the maps with informaion');
});

router.post('/', function (req, res, next) {
  var u_name = 'Anonymous';
  var user_id = req.body.user_id;
  var current_x = req.body.x;
  var current_y = req.body.y;
  var tags = ['shopping', 'sight', 'monument'];
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
  places = get_places(tags);
  all_tags = get_all_tags();
  res.send({ user_name: u_name, places: places, all_tags: all_tags, tags: tags });
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
  places = get_places(tags);
  res.send({ places: places, tags: tags });
});


router.get('/place', function (req, res, next) {
  res.send('Return the information of a special place');
});

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/map', function(req, res, next) {
  res.render('map', { title: 'Express' });
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

router.post('/nearby', function (req, res, next) {
  var user_id = req.body.user_id;
  var current_x = req.body.x;
  var current_y = req.body.y;
  var tags = req.body.tags; // must not be null
  var places = null;
  // Calculate to get the location
  // Request server to get the t_places and r_places
  places = get_nearby_places(tags, current_x, current_y);
  res.send({ places: places });
})

function get_nearby_places(tags, location_x, location_y) {
  if (tags &&
    location_x &&
    location_y) {
    db.collection("places").find({ tag: req.body.tags }, function (erro, place) {
      if (erro || (place === null)) {
        res.render('error', { message: 'Error', error: { status: 'Find place failed', stack: '' } });
      }
      else {
        //place[i].name, place[i].description, place[i].price, place[i].tag, place[i].photo
        //getDistanceFromLatLonInKm < 1km : Display
      }
    });
  }
};

function get_places(tags) {
  if (tags) {
    //user.id, user.name, user.tags
    db.collection("places").find({ tag: tags }, function (erro, place) {
      if (erro || (place === null)) {
        return null;
      }
      else {
        return place;
      }
    });
  }
}

function update_user_tags(user_id, new_tags) {
  console.log('Update user tag: ', user_id, new_tags);
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