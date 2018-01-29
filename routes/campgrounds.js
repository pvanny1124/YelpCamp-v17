var express     = require("express");
var router      = express.Router();
var Campground  = require("../models/campgrounds");
var middleware  = require("../middleware"); //don't have to do "../middleware/index.js" because index.js is automatically looked for
var geocoder    = require("geocoder"); //for google maps


//INDEX route
router.get("/", function(req, res){
        //get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
                //req.user has info such as username and id of the user. this will be used for navbar purposes such as hiding the login and sign up buttons!
            }
        });
        
});

//NEW route
//form that will send data to post route of /campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});



//CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
    
    //get data from form
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
            id: req.user._id,
            username: req.user.username
        };
    
    geocoder.geocode(req.body.location, function (err, data) {
        console.log(data);
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
     
        //create the new campground object
        var newCampground = {
            name: name, 
            price: price, 
            image: image,  
            location: location, 
            lat: lat, 
            lng: lng, 
            description: description, 
            author: author
            
        };
    
        //Create the campground object and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                //redirect back to campgrounds
                console.log(newlyCreated);
                res.redirect("/campgrounds");
            }
        });
    });
});

//SHOW
router.get("/:id", function(req, res) {
    //find the campgroun with provided id and populate it with actual comments
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground);
            //render show template with that template
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    
        Campground.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit", {campground: foundCampground});
            //no need to handle error since middleware does this for us already
    });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, cost: req.body.campground.cost, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;
