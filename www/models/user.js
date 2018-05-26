var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  name:{
	  type: String,
	  required: true,
  },
  tags:{
	  type: String, 
	  required: true
  }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;

