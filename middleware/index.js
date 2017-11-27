var hotel = require("../models/hotel");
var Comment    = require("../models/comment");
var User    = require("../models/user");
var middlewareObj = {};

middlewareObj.checkhotelOwnership = function(req,res,next){
    if(req.isAuthenticated()){
         hotel.findById(req.params.id,function(err,foundhotel){
        if(err){
            req.flash("error","hotel not found");
            res.redirect("back");
        }else{
             if(foundhotel.author.id.equals(req.user._id) || req.user.isAdmin){
                 next();
             }else{
                 req.flash("error","You don't have permission to do that");
                 res.redirect("back");
             }
             
        }
    });
    }else{
        req.flash("error","You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err){
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                     req.flash("error","You don't have permission to do that");
                    res.redirect("back");
                }    
            }
        });
    }else{
       req.flash("error","You need to be logged in to do that"); 
        res.redirect("/login");
    }
};

middlewareObj.checkUserOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        User.findById(req.params.id,function(err,foundUser){
            if(err){
                res.redirect("back");
            }else{
                if(foundUser._id.equals(req.user._id)){
                    next();
                }else{
                     req.flash("error","You don't have permission to do that");
                    res.redirect("back");
                }    
            }
        });
    }else{
       req.flash("error","You need to be logged in to do that"); 
        res.redirect("/login");
    }
};

middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be log in to do that");
    res.redirect("/login");
};

module.exports = middlewareObj;