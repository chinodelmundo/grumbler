var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGO_URI || require('../configs').MONGO_URI;
var collection = 'grumbler';
var moment = require('moment');
const imgur = require('imgur');
var User = require('../models/user');

var formatResult = function(result){
	result = result.map(function(grumble){
		grumble.datetime.relative = moment(grumble.datetime.text, 'MMMM Do YYYY, h:mm:ss a').fromNow();
		if(grumble.comments){
			grumble.comments = grumble.comments.map(function(comment){
				comment.datetime.relative = moment(comment.datetime.text, 'MMMM Do YYYY, h:mm:ss a').fromNow()
				return comment;
			});
		}
		return grumble;
	});

	return result;
};

module.exports = function(passport){
	MongoClient.connect(url, (err, db) => {
		if (err) return console.log(err);

		router.get('/:name', function(req, res, next) {
			var name = req.params.name;

			db.collection(collection).find({'username': name, 'registered': 1}).sort( { 'datetime': -1 } ).limit(10).toArray((err, result) => {
			    if (err) return console.log(err);
			    result = formatResult(result);

			    User.findOne({ 'username': name }, 'username signUpDate', function (err, profile) {
				  	if (err) return handleError(err);
				  	res.render('user', {grumbles: result, user: req.user, profile: profile});
				});
			});
		});

		router.post('/:name/comment/:id', function(req, res, next) {
			var name = req.params.name;
			var id = req.params.id;

			req.body.datetime = {num: Date.now(), text: moment().format('MMMM Do YYYY, h:mm:ss a')};

			db.collection(collection).replaceOne(
				{ '_id': new ObjectId(id) },
				{ $push: {'comments': req.body} },
				(err, result) => {
		   	 	if (err) return console.log(err);
		    	res.redirect('/user/' + name);
		  	});
		});
	});

	return router;
}