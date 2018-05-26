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

router.post('/', function (req, res, next) {
  var u_name = 'User';
  var user_id = Number(req.body.user_id);
  var tags = ['museum'];
  var places = null;
  if (user_id !== '') {
    // This is the first request -> need to request to get user's name and user's tags
    get_user_by_id(user_id,function (u_data) {
      if (u_data){
        u_name = u_data['name'];
        tags = u_data['tags'];
      }

      get_places(tags,function (data) {
          all_tags = get_all_tags();
          res.send({ user_name: u_name, places: data, all_tags: all_tags, tags: tags });
      });
    });
  }
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
  get_places(tags, function (data) {
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

function get_user_by_id(u_id, callback) {
  db.collection("users").findOne({ id: u_id }, function (err, user) {
    if (err || (user === null)) {
      callback(null);
    }
    else {
      callback(user);
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
  get_nearby_places(tags, current_x, current_y,function (data) {
      res.send({ places: data });
  });

})

function get_nearby_places(tags, location_x, location_y, callback) {
  if (tags &&
    location_x &&
    location_y) {
    db.collection("places").find({ tags: tags }).toArray(function (erro, place) {
      if (erro || (place === null)) {
        callback(null);
      }
      else {
        //TODO: remove places based on location
        console.log('[get_nearby_places] place: ',place);
        callback(place);
      }
    });
  }
};

function get_places(tags, callback) {
  if (tags) {
    console.log('[get_places] tags: ',tags);
    //user.id, user.name, user.tags
    db.collection("places").find({ tags: tags }).toArray(function (erro, place) {
      if (erro || (place === null)) {
        callback(null);
      }
      else {
        console.log('[get_places] place: ',place);
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

module.exports = router;