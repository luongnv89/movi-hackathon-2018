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
					  db.collection("places").findOne({tag: req.body.tags}, function(erro, place){
						  if (erro || (place === null)){
							  res.render('error', { message: 'Error', error:{status:'Find place failed', stack: ''} });
						  }
						  else {
							  //place.name, place.description, place.price, place.tag, place.photo 
						  }
					  });
				  }
			  });
	}
});

module.exports = router;

