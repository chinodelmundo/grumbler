var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://grumbleruser:grumblerpassword@ds062059.mlab.com:62059/grumbler';
var collection = 'grumbler';
var moment = require('moment');

var formatGrumble = function(grumble){
	switch (grumble.level) {
	    case '1':
	        grumble.level = {num: 1, text: 'Mildly Annoyed'};
	        break; 
	    case '2':
	        grumble.level = {num: 2, text: 'Infuriated'};
	        break; 
	    case '3':
	        grumble.level = {num: 3, text: 'Extremely Angry'};
	        break; 
	    case '4':
	        grumble.level = {num: 4, text: 'Very Happy'};
	        break; 
	    default: 
	        grumble.level = {num: 0, text: 'Neutral'};
	}

	grumble.datetime = {num: Date.now(), text: moment().format('MMMM Do YYYY, h:mm:ss a')};

	return grumble;
};

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

MongoClient.connect(url, (err, db) => {
	if (err) return console.log(err);

	router.get('/', function(req, res, next) {
		db.collection(collection).find().sort( { "datetime": -1 } ).toArray((err, result) => {
		    if (err) return console.log(err);
		    result = formatResult(result);
		    res.render('index', {grumbles: result});
		});
	});

	router.post('/', function(req, res, next) {
		req.body = formatGrumble(req.body)

		db.collection(collection).save(req.body, (err, result) => {
	   	 	if (err) return console.log(err);
	    	res.redirect('/');
	  	});
	});

	router.post('/comment/:id', function(req, res, next) {
		var id = req.params.id;
		req.body.datetime = {num: Date.now(), text: moment().format('MMMM Do YYYY, h:mm:ss a')};

		db.collection(collection).replaceOne(
			{ '_id': new ObjectId(id) },
			{ $push: {'comments': req.body} },
			(err, result) => {
	   	 	if (err) return console.log(err);
	    	res.redirect('/');
	  	});
	});
});

module.exports = router;
