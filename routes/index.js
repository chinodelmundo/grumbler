var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test4';
var collection = 'test4';
var moment = require('moment');

var formatDocument = function(doc){
	switch (doc.level) {
	    case '2':
	        doc.level = {num: 2, text: 'Infuriated'};
	        break; 
	    case '3':
	        doc.level = {num: 3, text: 'Extremely Angry'};
	        break; 
	    default: 
	        doc.level = {num: 1, text: 'Mildly Annoyed'};
	}

	doc.datetime = moment().format('MMMM Do YYYY, h:mm:ss a');

	return doc;
}

var formatResult = function(result){
	result = result.map(function(grumble){
		grumble.datetime = moment(grumble.datetime, 'MMMM Do YYYY, h:mm:ss a').fromNow();
		return grumble;
	});

	return result;
}

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
		req.body = formatDocument(req.body)

		db.collection(collection).save(req.body, (err, result) => {
	   	 	if (err) return console.log(err);
	    	res.redirect('/');
	  	});
	});
});

module.exports = router;
