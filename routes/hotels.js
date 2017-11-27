var express = require("express");
var router  = express.Router();
var hotel = require("../models/hotel");
var middleware = require("../middleware");
var geocoder = require("geocoder");
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

var Twitter = require('twitter');
 
var client = new Twitter({
  consumer_key: 'zn3RhDU0yYXdKb7PsmE86Wjic',
  consumer_secret: 'lmCWmIX2RmUzPmBkQ454SKiSEDpk6BGNQ674DEy6M7IkUccOeW',
  access_token_key: '933185415934238722-Mcplw9l2Nw1liJyUECIzvXHRqdQ4ODD',
  access_token_secret: 'pLxvOnXFTjWWyJob7SrPe9kVvTZP3heiLqCHHuBbPRrFj'
});

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// INDEX ROUTE - displays all hotels
router.get("/",function(req,res){
   if(req.query.search ) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
       hotel.find({name:regex},function(err,allhotels){
        if(err){
            console.log(err);
        }
        else{
            if(allhotels.length < 1){
                
                res.render("hotels/index",{hotels:allhotels, page: 'hotels',"error":"No hotels Found. Search Again!"});
            }else{
                res.render("hotels/index",{hotels:allhotels, page: 'hotels'});
            }
            
        }
    });
   }else{
        hotel.find({},function(err,allhotels){
        if(err){
            console.log(err);
        }
        else{
            res.render("hotels/index",{hotels:allhotels, page: 'hotels'});
        }
    });
   }
   
    
});

//CREATE ROUTE - adds the new hotel to hotels page
router.post("/",middleware.isLoggedIn,upload.single('image'),function(req,res){
    var name = req.body.name;
    var price = req.body.price;
    var image= req.body.image;
    var desc = req.body.description;
    var author ={
                    id: req.user._id,
                    username: req.user.username
    };
    geocoder.geocode(req.body.location, function (err, data) {
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        cloudinary.uploader.upload(req.file.path, function(result) {
            // add cloudinary url for the image to the hotel object under image property
            image = result.secure_url;
            // create hotel object
            var newhotel = {name: name, price:price,image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
            hotel.create(newhotel,function(err,newlyCreatedhotel){
                if(err){
                    console.log(err);
                    req.flash("error",err.message);
                    res.redirect("back");
                }else{
                    req.flash("success","hotel added successfully");
                    res.redirect("/hotels/"+newlyCreatedhotel._id);
                }
            });
        });
    });
});
    

// NEW ROUTE - shows the form to create new hotel
router.get("/new",middleware.isLoggedIn,function(req,res){
   res.render("hotels/new"); 
}); 

//SHOW ROUTE - shows the info about a particular hotel
router.get("/:id",function(req,res){
    var id = req.params.id;
    //var objectId = mongoose.Types.ObjectId(id);
    hotel.findById(id).populate("comments").exec(function(err,foundhotel){
        if(err){
            console.log(err);
        }else{
          res.render("hotels/show",{hotel: foundhotel}); 
        }
        
    });
   
});

router.get("/:id/info",function(req,res){
    var id = req.params.id;
    //var objectId = mongoose.Types.ObjectId(id);
    hotel.findById(id,function(err,foundhotel){
        if(err){
            console.log(err);
        }else{
             client.get('search/tweets', {q: '#'+foundhotel.name}, function(error, tweets, response) {
               if (!error) {
                  res.status(200).render("hotels/info",{tweets:tweets,hotel:foundhotel, page: 'info'});
                }
                else {
                  res.status(500).json({ error: error });
                }
               
        });
          
        }
        
    });
   
});

//EDIT ROUTE
router.get("/:id/edit",middleware.checkhotelOwnership,function(req,res){
    hotel.findById(req.params.id,function(err,foundhotel){
        if(err){
            res.redirect("back");
        }else{
             res.render("hotels/edit",{hotel: foundhotel});
        }
            
        });
    
   
});

//UPDATE ROUTE
router.put("/:id",middleware.checkhotelOwnership,function(req,res){
    geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.name,  price: req.body.price, image: req.body.image, description: req.body.description, location: location, lat: lat, lng: lng};
   hotel.findByIdAndUpdate(req.params.id,{$set: newData},function(err,updatedhotel){
       if(err){
           console.log(err);
           res.redirect("/hotels");
       }else{
           req.flash("success","Successfully updated hotel");
           res.redirect("/hotels/"+req.params.id);
       }
   }) ;
}); 
});
//DELETE ROUTE
router.delete("/:id",middleware.checkhotelOwnership,function(req,res){
    hotel.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err);
            res.redirect("/hotels");
        }else{
            req.flash("success","Successfully deleted hotel");
            res.redirect("/hotels");
        }
    });
});





module.exports = router;
