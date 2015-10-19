var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/authenticate-people-db');
var studentCollection = db.get('students');
require('dotenv').load();

router.get('/students', function(req, res, next) {
  if(req.session.email) {
    res.render('students/index', { 
                                  title: 'STUDENTS',
                                  email_session: req.session.email 
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