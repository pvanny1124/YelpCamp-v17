var mongoose = require("mongoose");

//SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
   name: String,
   price: String,
   image: String,
   location: String,
   lat: Number,
   lng: Number,
   description: String,
   createdAt: { type: Date, default: Date.now },
   author: {
       username: String,
        id:  {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
   },
   comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
       
       ]
});

// //model that uses schema
module.exports = mongoose.model("Campground", campgroundSchema);