var express = require("express");
var router  = express.Router();
var User    = require("../models/user");
var passport = require("passport");
var middleware = require("../middleware");
var hotel = require("../models/hotel");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
require('dotenv').config();
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'passion', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get("/",function(req,res){
    res.render("landing");
});



//=================
// Auth Routes
//=================
//register route
router.get("/register",function(req,res){
   res.render("register",{page: 'register'}); 
});

//handle register logic
router.post("/register",upload.single('image'),function(req,res){
        var avatar= req.body.image;
        cloudinary.uploader.upload(req.file.path, function(result) {
            // add cloudinary url for the image to the hotel object under image property
            avatar = result.secure_url;
            // create hotel object
             var newUser = new User({username: req.body.username,firstName: req.body.firstname, lastName: req.body.lastname, email: req.body.email, avatar: avatar,info: req.body.info});
              if(req.body.admincode === "6363347"){
                  newUser.isAdmin = true;
              }
              User.register(newUser,req.body.password,function(err,user){
                  if(err){
                      
                      req.flash("error",err.message);
                      return res.redirect("/register");
                  }
                  passport.authenticate("local")(req,res,function(){
                      req.flash("success","Welcome to Yelp Camp "+user.username);
                      res.redirect("/hotels");
                  });
              }) ;
        });
});

           
        


//shows login form
router.get("/login",function(req,res){
    res.render("login",{page: 'login'});
});

//handling login logic
router.post("/login",passport.authenticate("local",
                        {
                            successRedirect : "/hotels",
                            failureRedirect : "/login",
                             failureFlash: true
                        }),function(req,res){
                            
        });
        
//logout logic
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged you out");
    res.redirect("/hotels");
});

// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'girishtech3@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'girishtech3@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
     
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          });
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'girishtech3@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'girishtech3@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/hotels');
  });
});

//logic to show user profile page
router.get("/users/:id",function(req,res){
    User.findById(req.params.id,function(err,foundUser){
        if(err){
            req.flash("error","Something went wrong");
            res.redirect("back");
        }else{
            hotel.find().where("author.id").equals(foundUser._id).exec(function(err,hotels){
               if(err){
                    req.flash("error","Something went wrong");
                    res.redirect("back");
                }else{
                    res.render("users/show",{user: foundUser, hotels: hotels});
                }  
            });
            
        }
    });
});

//profile edit route
router.get("/users/:id/edit",middleware.checkUserOwnership,function(req,res){
  User.findById(req.params.id,function(err,foundUser){
    if(err){
      console.log(err);
      req.flash("error","Something went wrong");
      res.redirect("back");
    }else{
       res.render("users/edit",{user: foundUser});
     
    }
  });
  
});

//logic to handle 
router.put("/users/:id",middleware.checkUserOwnership,function(req,res){
  User.findByIdAndUpdate(req.params.id,req.body.user,function(err,updatedUser){
    if(err){
      console.log(err);
      
      req.flash("error","Email Already exists. Please use other email");
      res.redirect("back");
    }else{
      res.redirect("/users/"+req.params.id);
    }
  });
});

module.exports = router;