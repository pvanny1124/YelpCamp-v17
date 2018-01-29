var express = require("express");
var router = express.Router({mergeParams: true}); //NEED THIS SO THAT YOU CAN MERGE /COMMENTS AND /campgrounds/:id/
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var middleware  = require("../middleware");

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    //look up campground using id
    Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    //associate username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    //associate comment to a campground
                
                    campground.comments.push(comment._id);
                    campground.save();
                    console.log(comment);
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
       }
    });
    //create new comment
    //connect new comment to campground
    //redirect back to campground show page
});

//Comments New
//isLoggedIn will check if the user is logged in and send him/her either to the "add a new comment" page or to the login page
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
           res.render("comments/new", {campground: campground});
        }
    });
   
});

//COMMENTS EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           res.redirect("back");
       } else {
           res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
       }
    });
});

//COMMENTS UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
       if(err){
           res.redirect("back");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
});

//COMMENTS DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //find by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;