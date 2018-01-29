var express         = require("express"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    Campground      = require("./models/campgrounds"),
    Comment         = require("./models/comments"),
    passport        = require("passport"),
    localStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    User            = require("./models/user"),
    seedDB          = require("./seeds"),
    nodemon         = require("nodemon"),
    flash           = require("connect-flash"),
    app             = express();
    
//requiring routes
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index");

//seedDB(); //seed the database

//CONFIG
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v15";
mongoose.connect(url);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public")); //__dirname is to always make sure we are in THIS directory to serve public folder
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment'); //Moment JS is used for displaying exactly how long ago a user did something such as adding a comment for example.
app.set("view engine", "ejs");

//PASSPORT CONFIG
app.use(require("express-session")({
   secret: "Once again rusty wins cutest dog",
   resave: false,
   saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate())); //user.authenticate comes from pluging in methods from passport-local-mongoose to user schema!
//if we hadn't plugged it in, we would have to create authenticate() ourselves.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Use following to add currentUser to every single line of code that passes something to campgrounds
//this is middleware too
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//tell express to use these routes
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes); //appends /campgrounds in all campgrounds routes
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server has started");
});