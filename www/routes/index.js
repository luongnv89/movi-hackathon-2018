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


/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('view1', { UserName: 'Anonymous'});
  db.collection("users").findOne({id: 1}, function(err, user){
  //db.collection("users").findOne({id: req.user_id}, function(err, user){
	  if (err || (user === null)){
		  res.render('error', { message: 'Error', error:{status:'Find User failed', stack: ''} });
	  }
	  else {
		  res.render('index', { title: user.name });
	  }
  });
});


router.post('/search', function(req, res, next){
	if (req.body.tags && 
		req.body.user_id && 
		req.body.location){
		db.collection("users").findOne({id: req.body.user_id}, function(err, user){
			 	  if (err || (user === null)){
					  res.render('error', { message: 'Error', error:{status:'Find User failed', stack: ''} });
				  }
				  else {
					  //user.id, user.name, user.tags
					  db.collection("places").find({tag: req.body.tags}, function(erro, place){
						  if (erro || (place === null)){
							  res.render('error', { message: 'Error', error:{status:'Find place failed', stack: ''} });
						  }
						  else {
							  //place[i].name, place[i].description, place[i].price, place[i].tag, place[i].photo 
						  }
					  });
				  }
			  });
	}
});

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	  var R = 6371; // Radius of the earth in km
	  var dLat = deg2rad(lat2-lat1);  // deg2rad below
	  var dLon = deg2rad(lon2-lon1); 
	  var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  var d = R * c; // Distance in km
	  return d;
	}

function deg2rad(deg) {
	  return deg * (Math.PI/180)
	}

router.post('/nearby', function(req, res, next){
	if (req.body.tags && 
		req.body.user_id && 
		req.body.location){
					  db.collection("places").find({tag: req.body.tags}, function(erro, place){
						  if (erro || (place === null)){
							  res.render('error', { message: 'Error', error:{status:'Find place failed', stack: ''} });
						  }
						  else {
							  //place[i].name, place[i].description, place[i].price, place[i].tag, place[i].photo 
							  //getDistanceFromLatLonInKm < 1km : Display 
						  }
					  });
	}
});

var allTags = [
    "monument",
    "sight",
    "museum",
    "concert",
    "shopping",
    "food",
    "nightlift",
    "casino"
];

module.exports = router;

