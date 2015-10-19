var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/authenticate-people-db');
var peopleCollection = db.get('people');
var studentCollection = db.get('students');
var bcrypt = require('bcrypt');
require('dotenv').load();

/* GET home page. */
router.get('/people', function(req, res, next) {
  if(req.session.email) {
    res.redirect('/people/loggedIn')
  }
  else {
    res.render('people/index', { title: 'HOME PAGE' });
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

router.get('/people/students', function(req, res, next) {
  if(req.session.email) {
    studentCollection.find({}, function (err, data) {
      res.render('students/index', { 
                                    title: 'STUDENTS',
                                    email_session: req.session.email,
                                    allStudents: data
      })
    })
  }
  else {
    var errors = []
    errors.push('Please sign up or sign in to view this page')
    res.render('students/index', {
                                    errors: errors
    })
  }
});

router.get('/people/students/new', function(req, res, next) {
  if(req.session.email) {
    res.render('students/new', { 
                                  title: 'NEW STUDENT',
                                  email_session: req.session.email, 
    })
  }
  else {
    var errors = []
    errors.push('Please sign up or sign in to view this page')
    res.render('students/index', {
                                    errors: errors
    })
  }
});

router.post('/people/students/new', function(req, res, next) {
  var errors = [];
  var name = req.body.name;
  var phone = req.body.phone;

  if(!name) {
    errors.push('Name can not be blank')
  }
  if(!phone) {
    errors.push('Phone number can not be blank')
  }
  if(errors.length) {
    res.render('students/new', {
                                  title: 'NEW STUDENT',
                                  email_session: req.session.email,
                                  errors: errors,
                                  name: name,
                                  phone: phone
    })
  }
  else {
    studentCollection.find({name: name}, function (err, data) {
      if(data.length > 0) {
        errors.push('Name is already registered')
        res.render('students/new', {
                                      title: 'NEW STUDENT',
                                      errors: errors
        })
      }
      else {
        studentCollection.insert({
                                  name: name, 
                                  phone: phone
        })
        res.redirect('/people/students')
      }
    })
  }
})

router.get('/people/students/:id', function(req, res, next) {
  if(req.session.email) {
    studentCollection.findOne({_id: req.params.id}, function (err, data) {
      res.render('students/show', { 
                                    title: 'STUDENT INFO',
                                    email_session: req.session.email,
                                    student: data
      })
    })
  }
  else {
    var errors = []
    errors.push('Please sign up or sign in to view this page')
    res.render('students/index', {
                                    errors: errors
    })
  }
});



module.exports = router;
