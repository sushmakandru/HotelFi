var express = require("express");
var router  = express.Router({mergeParams:true});
var hotel = require("../models/hotel");
var Comment  = require("../models/comment");
var middleware = require("../middleware");

//NEW COMMENT ROUTE
router.get("/new",middleware.isLoggedIn,function(req,res){
    hotel.findById(req.params.id,function(err,hotel){
        if(err){
            console.log(err);
        }else{
             res.render("comments/new",{hotel:hotel});
        }
    });
   
});

//CREATE COMMENT ROUTE
router.post("/",middleware.isLoggedIn,function(req,res){
   hotel.findById(req.params.id,function(err,hotel){
       if(err){
           console.log(err);
       }else{
            Comment.create(req.body.comment,function(err,comment){
               if(err){
                   console.log(err);
                   req.flash("error","Something went wrong!");
                   res.redirect("/hotels");
               } else{
                    comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.save();
                   hotel.comments.push(comment);
                   hotel.save();
                   req.flash("success","Successfully added comment");
                   res.redirect("/hotels/"+hotel._id);
               }
            });     
       }
   });
});

//EDIT COMMENT ROUTE
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
    Comment.findById(req.params.comment_id,function(err,foundComment){
        if(err){
            res.redirect("back");
        }else{
             res.render("comments/edit",{hotel_id : req.params.id, comment:foundComment}) ;
        }
    });
  
});

//UPDATE ROUTE
router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,function(err,updateComment){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Successfully updated comment");
            res.redirect("/hotels/"+req.params.id);
        }
    });
});

//DELETE ROUTE
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Successfully deleted Comment");
            res.redirect("/hotels/"+req.params.id);
        }
    });
});






module.exports = router;