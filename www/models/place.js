var mongoose = require('mongoose');

var PlaceSchema = new mongoose.Schema({
	id:{
	  	type: String,
	  	required: true,
	},
	name:{
	  	type: String,
	  	required: true,
	},
	description: {
		type: String,
		required: true,
  	},
	tag:{
  		type: String,
  		required: true,
  	}, 
  	price:{
  		type: String,
  		required: true,
  	}, 
  	photos:{
  		type: String,
  		required: true,
  	}
	});

var Place = mongoose.model('Place', PlaceSchema);
module.exports = Place;
