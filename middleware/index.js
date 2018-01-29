//all the middleware goes here
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
     if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
             //does user own the campground?
             //if(campground.author.id === req.user._id) -> doing it this way is wrong. 1st is a mongoose object, second is a string
             //do this instead
             if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                 next(); 
             } else {
                 req.flash("error", "You don't have permission to do that");
                 res.redirect("back");
             }
        }
    });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back"); //takes user back to previous page that they were on
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
       if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("/campgrounds");
        } else {
             //does user own the campground?
             if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                 next(); 
             } else {
                 req.flash("error", "You don't have permission to do that");
                 res.redirect("back");
             }
        }
    });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back"); //takes user back to previous page that they were on
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } 
    req.flash("error", "You need to be logged in to do that"); //"error" is a key and the message is the value, must be placed before redirect!
    res.redirect("/login");
};


module.exports = middlewareObj;