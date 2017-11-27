var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    Hotel      = require("./models/hotel"),
    Comment    = require("./models/comment"),
    seedDB     = require("./seeds.js"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User       = require("./models/user"),
    flash      = require("connect-flash"),
    geocoder   = require("geocoder");

//requiring routes
var indexRoute      = require("./routes/index"),
    hotelRoute = require("./routes/hotels"),
    commentRoute    = require("./routes/comments");

//seedDB();
mongoose.connect("mongodb://localhost/yelp_camp_v15", {useMongoClient: true});
 mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret : "I need a job badly",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error     = req.flash("error");
   res.locals.success   = req.flash("success");
   next();
});

app.use(indexRoute);
app.use("/hotels",hotelRoute);
app.use("/hotels/:id/comments",commentRoute);


app.listen(process.env.PORT,process.env.IP,function(){
    console.log(" Server Started");
});