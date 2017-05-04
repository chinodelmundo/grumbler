var express = require('express');
var router = express.Router();

module.exports = function(passport){

	router.get('/login', function(req, res) {
		res.render('login', { message: req.flash('message') });
	});

	router.post('/login', passport.authenticate('login', {
		successRedirect: '/',
		failureRedirect: '/auth/login',
		failureFlash : true  
	}));

	router.get('/signup', function(req, res) {
		res.render('signup', { message: req.flash('message') });
	});

	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/',
		failureRedirect: '/auth/signup',
		failureFlash : true  
	}));

	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}





