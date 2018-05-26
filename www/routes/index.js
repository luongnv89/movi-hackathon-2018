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
  if (user_id !== 0) {
    // This is the first request -> need to request to get user's name and user's tags
    get_user_by_id(user_id, function (u_data) {
      if (u_data) {
        u_name = u_data['name'];
        tags = u_data['tags'];
      }

      get_places(tags, function (data) {
        all_tags = get_all_tags();
        res.send({ user_name: u_name, places: data, all_tags: all_tags, tags: tags });
      });
    });
  }
})

router.post('/search', function (req, res, next) {
  var user_id = Number(req.body.user_id);
  var current_x = req.body.x;
  var current_y = req.body.y;
  var tags = JSON.parse(req.body.tags); // must not be null
  var places = null;
  if (user_id !== 0) {
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
  console.log('[/place]');
  var place_id = Number(req.query.place_id);
  get_place_by_id(place_id, function (data) {
    if(data){
      res.render('place', {place : data});
    }else{
      res.send('error!');
    }
  })
});

router.get('/map', function (req, res, next) {
  res.render('map', { title: 'City Guide Car' });
});

router.post('/nearby', function (req, res, next) {
  var user_id = req.body.user_id;
  var current_x = req.body.location['x'];
  var current_y = req.body.location['y'];
  var tags = req.body.tags; // must not be null
  var places = null;
  // Calculate to get the location
  // Request server to get the t_places and r_places
  get_nearby_places(tags, current_x, current_y, function (data) {
    res.send({ places: data });
  });

})

router.get('/', function (req, res, next) {
  res.render('index');
});

function get_place_by_id(p_id, callback) {
  db.collection("places").findOne({ id: p_id }, function (err, user) {
    if (err || (user === null)) {
      callback(null);
    }
    else {
      callback(user);
    }
  });
}

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

function get_nearby_places(tags, location_x, location_y, callback) {
  if (tags &&
    location_x &&
    location_y) {
    db.collection("places").find({ tags: {$elemMatch:{$in:tags}} }).toArray(function (erro, place) {
      if (erro || (place === null)) {
        callback(null);
      }
      else {
        //TODO: remove places based on location
        console.log('[get_nearby_places] place: ', place);
        //DONE: remove places based on location
        for (var i = place.length - 1; i >= 0; i--) {
          if (getDistanceFromLatLonInKm(place[i].location.x, place[i].location.y, location_x, location_y) < 1) {
            place.splice(i, 1);
          }
        }
        callback(place);
      }
    });
  }
};

function get_places(tags, callback) {
  if (tags) {
    console.log('[get_places] tags: ', tags);
    // TODO: Improve by not completely matched tags
    db.collection("places").find({ tags: {$elemMatch:{$in:tags}} }).toArray(function (erro, place) {
      if (erro || (place === null)) {
        callback(null);
      }
      else {
        console.log('[get_places] place: ', place);
        callback(place);
      }
    });
  }
}

function update_user_tags(user_id, new_tags) {
  console.log('Update user tags: ', user_id, new_tags);
  db.collection("users").updateOne({ id: user_id }, { $set: { tags: new_tags } }, function (error, res) {
    if (error) return null;
  });
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


module.exports = router;