var mongoose  = require("mongoose");
var Campround = require("./models/campgrounds");
var Comment   = require("./models/comments");

var data = [
        {
            name: "Cloud's rest",
            image: "https://farm4.staticflickr.com/3273/2602356334_20fbb23543.jpg",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            name: "Desert Mesa",
            image: "https://farm2.staticflickr.com/1281/4684194306_18ebcdb01c.jpg",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            name: "Canyon Floor",
            image: "https://farm3.staticflickr.com/2464/3694344957_14180103ed.jpg",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
    
    ];

function seedDB(){
    //remove all campgrounds
    Campround.remove({}, function(err){
    if(err){
        console.log(err);
    } else {
        console.log("removed campgrounds");
    }
    
    //add a few campgrounds
    //must place this inside of callback of seedDB for it to work
    data.forEach(function(seed){
        Campround.create(seed, function(err, campground){
            if(err){
                console.log(err);
            } else {
                console.log("added a campground");
                
                 Comment.create(
                    {
                        text: " This place is great, but there's no internet :(",
                        author: "Homer"
                    }, function(err, comment){
                            if(err){
                                
                            } else{
                                    campground.comments.push(comment._id);
                                    campground.save();
                                    console.log("Added a new comment");
                             }
                     }
                    );
                 }
            });
        });
    });
}

module.exports = seedDB;
