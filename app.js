var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//var mongoose = require('mongoose');
//require('./models');
//var bcrypt = require('bcryptjs'); - NOT IN USE WITHOUT APP
var expressSession = require('express-session')
//var passport = require('passport');
//var localStrategy = require('passport-local').Strategy; - NOT IN USE WITHOUT APP
//var dotenv = require('dotenv');
//dotenv.config();

//const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {apiVersion: ''});

const sendMail = require('./mail');

//var User = mongoose.model('User');
//mongoose.connect('mongodb://localhost:27017/Web-App-DB', { useNewUrlParser: true, useUnifiedTopology: true})

var app = express();

// view engine setup (middleware)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//THIS SECTION JUST FOR EMAIL SENDING
//Data parsing for contact form
app.use(express.urlencoded({
  extended: false
}));

//STRIPE WEBHOOK PARSER - extra code so doesnt interfere with express json parser
// Use body-parser to retrieve the raw body as a buffer
//const bodyParser = require('body-parser');

//dependencies for contact forms - NOT IN USE WITHOUT APP
//const nodemailer = require('nodemailer')

// Match the raw body to content type application/json
/*
app.post('/pay-success', bodyParser.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.ENDPOINT_SECRET);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Fulfill the purchase...
    console.log(session);
    User.findOne({
      email: session.customer_email
    }, function(err, user) {
      if (user) {
        user.subscriptionActive = true;
        user.subscriptionId = session.subscription;
        user.customerId = session.customer;
        user.save();
      }
    });
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});
 */

app.use(logger('dev'));
///expresses data submitted by clients into json format to the server (login/contact posts)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({
  secret: process.env.EXPRESS_SESSION_SECRET,
  //name: cookie_name,
  //store: sessionStore, // connect-mongo session store
  proxy: true,
  resave: true,
  saveUninitialized: true
}));
//app.use(passport.initialize());
//app.use(passport.session());

/*
//passport method using localstrategy for signup (serialize/deserialize in session)
passport.use('signup-local', new localStrategy({
  usernameField: "email",
  passwordField: "password"
}, function(email, password, next) {
  //find user with same email just submitted
  User.findOne({
    email: email
  }, function(err, user) {
    //if error
    if (err) return next(err);
    //if same email
    if (user) return next({message: "This user already exists"})
    //then post the signup data to DB
    let newUser = new User({
      email: email,
      passwordHash: bcrypt.hashSync(password, 10)
    })
    newUser.save (function(err) {
      next(err, newUser);
    });
  });
}));

//passport method using localstrategy for login
passport.use(new localStrategy({
  usernameField: "email",
  passwordField: "password"
}, function(email, password, next) {
  User.findOne({
    email: email
  }, function(err, user) {
    if (err) return next (err);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return next ({message: 'Email or password is incorrect' })
    }
    next(null, user);
  })
}));

//only saves id of user into session (saves memory) - PART OF LOGIN SYSTEM
//get id from database
passport.serializeUser(function(user, next) {
  next(null, user._id);
});

//passport.deserializeUser(function(id, next) {
  User.findById(id, function(err, user) {
    next(err, user);
  });
});

*/

//rendering of different html pages for website//

//LANDING PAGE
app.get('/', function(req, res) {
  res.render('index', {title: "Langing Page"})
})

//MAP PAGE
app.get('/gyms-near-me', function(req, res) {
  res.render('gyms-near-me')
})

//GYM INFO PAGE
app.get('/gym-info', function (req, res) {
  res.render('gym-info');
});

//COMPARE PAGE
app.get('/compare', function (req, res) {
  res.render('compare');
});

//CONTACT US PAGE
app.get('/contact-us', (req, res) => {
  res.render('contact-us')
})

//WEBSITE CREDITS
app.get('/credits', (req, res) => {
  res.render('credits')
})

//CONTACT US BACKEND
app.post('/email', (req, res) => {
  //send email here
  const { name, email, subject, message} = req.body;
  console.log('Data: ', req.body);

  sendMail(name, email, subject, message, function(err) {
    if (err) {
      res.status(500).json({ message: 'Internal Error' });
    } else {
      res.json({ message: 'Email has been sent successfully'});
    }
  });
});

/*

//signup pages
app.get('/signup', function(req, res, next) {
  res.render('signup', {title: "Signup Page"})
})

app.post('/signup',
    passport.authenticate('signup-local', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/main');
    });

//LOGIN PAGES

app.get('/login', function(req, res, next) {
  res.render('login')
})

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/main');
});

app.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
})

app.get('/main', function(req, res, next) {
  res.render('main')
})

app.get('/billing', function(req, res, next) {
  stripe.checkout.sessions.create({
    customer_email: req.user.email,
    payment_method_types: ['card'],
    line_items: [{
      price: process.env.STRIPE_PLAN,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: 'https://localhost:3000/billing/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://localhost:3000/billing',
  }, function(err, session) {
    if (err) return next(err);
    res.render('billing', {STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY, sessionId: session.id, subscriptionActive: req.user.subscriptionActive})
  });
})

*/
//ROBOTS TXT
app.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /");
});

// CATCH THE 404 ERROR AND PASS IT TO ERROR HANDLER

app.use(function(req, res, next) {
  next(createError(404));
});

// ERROR HANDLER

app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
0
module.exports = app;
