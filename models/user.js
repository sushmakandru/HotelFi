var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
                        username : String,
                        password : String,
                        avatar   : String,
                        firstName: String,
                        lastName : String,
                        email: {type: String, unique: true, required: true},
                        resetPasswordToken: String,
                        resetPasswordExpires: Date,
                        info     : String,
                        isAdmin  :{
                                     type : Boolean,
                                     default : false
                        }
                });
                
var options = {
 errorMessages: {
  IncorrectPasswordError: 'Password is incorrect',
  IncorrectUsernameError: 'Username is incorrect'
 }
};
userSchema.plugin(passportLocalMongoose,options);

module.exports = mongoose.model("User",userSchema);