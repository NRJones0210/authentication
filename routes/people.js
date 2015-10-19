var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/authenticate-people-db');
var peopleCollection = db.get('people');
var bcrypt = require('bcrypt');
require('dotenv').load();

/* GET home page. */
router.get('/people', function(req, res, next) {
  if(req.session.email) {
    res.redirect('/people/loggedIn')
  }
  else {
    res.render('people/index', { title: 'HOME' });
  }
});

router.get('/people/signup', function(req, res, next) {
  res.render('people/signup', { title: 'SIGN UP' });
});

router.post('/people/signup', function(req, res, next) {
  var errors =[];
  var email = req.body.email.trim().toLowerCase();
  var password = req.body.password.trim();
  var passConfirm = req.body.passConfirm.trim();

  if(!email) {
    errors.push('Email can not be blank')
  }
  if(email.indexOf('@') === -1) {
    errors.push('Email invalid. Must contain "@"')
  }
  if(email.indexOf('.') === -1) {
    errors.push('Email invalid. Must contain "."')
  }
  if(!password) {
    errors.push('Password can not be blank')
  }
  if(!passConfirm) {
    errors.push('Password confirmation can not be blank')
  }
  if(!password || !passConfirm || password !== passConfirm)
    errors.push('Passwords do no match')
  if(errors.length) {
    res.render('people/signup', {
                                  title: 'SIGN UP',
                                  errors: errors,
                                  email: email
    })
  }
  else {
    peopleCollection.find({email: email}, function (err, data) {
      if(data.length > 0) {
        errors.push('Email is already registered')
        res.render('people/signup', {
                                      title: 'SIGN UP',
                                      errors: errors
        })
      }
      else {
        req.session.email = email
        var hash = bcrypt.hashSync(password, 8);
        peopleCollection.insert({
                                  email: email, 
                                  password: hash
        })
        res.redirect('/people/loggedIn')
      }
    })
  }
})

router.get('/people/signin', function(req, res, next) {
  res.render('people/signin', { title: 'SIGN IN' });
});

router.post('/people/signin', function(req, res, next) {
  var errors =[];
  var email = req.body.email.trim().toLowerCase();
  var password = req.body.password.trim();

  if(!email) {
    errors.push('Email can not be blank')
  }
  if(email.indexOf('@') === -1) {
    errors.push('Email invalid. Must contain "@"')
  }
  if(email.indexOf('.') === -1) {
    errors.push('Email invalid. Must contain "."')
  }
  if(!password) {
    errors.push('Password can not be blank')
  }
  if(errors.length) {
    res.render('people/signin', {
                                  title: 'SIGN IN',
                                  errors: errors,
                                  email: email
    })
  } 
  else {
    peopleCollection.findOne({email: email}).then(function (user) {
      if(user) {
        req.session.email = email
        if(bcrypt.compareSync(password, user.password)) {
          res.redirect('/people/loggedIn')  
        }
        else {
          errors.push('Invalid Email / Password')
          res.render('people/signin', {
                                        title: 'SIGN IN',
                                        errors: errors
          })
        }
      }
      else {
        errors.push('Invalid Email / Password')
        res.render('people/signin', {
                                      title: 'SIGN IN',
                                      errors: errors
        })
      }
    })
  } 
});

router.get('/people/signout', function(req, res, next) {
  req.session = null;
  res.redirect('/people');
});

router.get('/people/loggedIn', function(req, res, next) {
  if(req.session.email) {
    res.render('people/loggedIn', { 
                                  title: 'LOGGED IN',
                                  email_session: req.session.email 
    })
  }
  else {
    var errors = []
    errors.push('Please sign up or sign in to view this page')
    res.render('people/loggedIn', {
                                    errors: errors
    })
  }
});

// STUDENTS //



module.exports = router;
