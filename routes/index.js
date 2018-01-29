//ROUTES
var express      = require("express"),
    router       = express.Router(),
    passport     = require("passport"),
    User         = require("../models/user"),
    Campground   = require("../models/campgrounds"),
    async        = require("async"),
    crypto       = require("crypto"), //creates token
    nodemailer   = require("nodemailer"); //allows us to send mail

//root route
router.get("/", function(req, res){
    res.render("landing");
});

//=================================//



//AUTH ROUTES
//show register form
// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

//sign up logic
router.post("/register", function(req, res){
     /* eval(require("locus")); */
    //locus stops code so that you can see what variables are available to you. variables have to be declared before eval()

    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    if(req.body.adminCode === "secretcode123") newUser.isAdmin = true;
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
             //err can tell you what went wrong. err is also an object that has a name and a message. use err.message to display the actual message
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    }); 
});

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});


//HANDLE LOGIN FORM LOGIC
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome back to YelpCamp!"
    }), function(req, res){
        req.flash("success", "Welcome back " + req.user.username);
});

//HANDLE LOGOUT ROUTE
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

//FORGOT PASSWORD ROUTES
router.get("/forgot", function(req, res){
   res.render("forgot"); 
});

router.post("/forgot", function(req, res, next){
    //waterfall calls functions in an array one after the other
    //each function passes its return values through a callback (in this case: done)
    async.waterfall([
        function(done){
            //create random string of hex to create token
            crypto.randomBytes(20, function(err, buffer){
               var token = buffer.toString("hex"); 
               //token that is sent as part of url to the users email address that will expire after an hour
               done(err, token);
            });
        },
        function(token, done){
            User.findOne({ email: req.body.email }, function(err, user){
                if(!user){
                    req.flash("error", "No account with that email exists.");
                    return res.redirect; 
                }
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; //time now plus 1hr in ms
                
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done){
            //smtpTransport contains info about our mailing service (nodemailer)
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "pvanny1124@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.mail,
                from: "pvanny1124@gmail.com",
                subject: "Node.js password reset",
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                      'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };   //req.headers.host is your website address (i.e. localhost, heroku url, custom domain, etc..)
            
            //send mail
            smtpTransport.sendMail(mailOptions, function(err){
                console.log("mail sent");
                req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
                done(err, "done");
            });
            
        }
    ], function(err){
        if(err) return next(err);
        res.redirect("/forgot");
    });
});

//reset form route
router.get("/reset/:token", function(req, res){
    //the $gt mongo parameter selects those documents where the value of the field is greater than (i.e. >) the specified value.
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
        if(!user){
            req.flash("error", "Password reset token has reset or expired");
            return res.redirect("/forgot");
        }
        res.render("reset", {token: req.params.token});
    });
});

router.post("/reset/:token", function(req, res){
   async.waterfall([
       function(done){
               User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
                if(!user){
                    req.flash("error", "Password reset token has reset or expired");
                    return res.redirect("/forgot");
                }
                
                //check if passwords match
                if(req.body.password === req.body.confirm){
                    //mongoose provides setPassword method that salts/hashes a new password for the user
                    user.setPassword(req.body.password, function(err){
                        //reset the reset parameters
                        user.resetPasswordExpires = undefined;
                        user.resetPasswordToken = undefined;
                        
                        //save the changes in the database
                        user.save(function(err){
                            //log the user back in
                            req.logIn(user, function(err){
                                done(err, user);
                            });
                        });
                    });
                } else {
                    req.flash("error", "Passwords do not match");
                    return res.redirect("back");
                }
            });
       },
       function(user, done){
           //setup transport
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "pvanny1124@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            
            var mailOptions = {
                to: user.email,
                from: 'pvanny1124@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                      'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
             //send mail
            smtpTransport.sendMail(mailOptions, function(err){
                console.log("mail sent");
                req.flash("success", "Success! Your password has been changed!");
                done(err);
            });
         }
       ], function(err){
           res.redirect("/campgrounds");
        }); 
});

//USER PROFILE ROUTE
router.get("/users/:id", function(req, res){
    //find user
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", err.message);
            res.redirect("/");
        }
        console.log(foundUser);
        //find all campgrounds that is associated to this user
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
            if(err){
                req.flash("error", err.message);
                res.redirect("/");
            }
            res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        });
        
    });
});

module.exports = router;
