var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGO_URI || require('../configs').MONGO_URI;
var collection = 'grumbler';
var moment = require('moment');
const uuidV4 = require('uuid/v4');
const imgur = require('imgur');

const filePath = './public/images/';

var formatGrumble = function(grumble, imgurLink){
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
	    default: 
	        grumble.level = {num: 0, text: 'Neutral'};
	}

	grumble.datetime = {
		num: Date.now(), 
		text: moment().format('MMMM Do YYYY, h:mm:ss a')
	};

	if(imgurLink){
		grumble.imgurLink = imgurLink;
	}
	
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
		db.collection(collection).find().sort( { 'datetime': -1 } ).limit(10).toArray((err, result) => {
		    if (err) return console.log(err);
		    result = formatResult(result);
		    res.render('index', {grumbles: result});
		});
	});

	router.post('/', function(req, res, next) {
		let uploadFile = req.files.image;

		if (!uploadFile){
			req.body = formatGrumble(req.body);

			db.collection(collection).save(req.body, (err, result) => {
		   	 	if (err) return console.log(err);
		    	res.redirect('/');
		  	});
		}else{
			let filename = uuidV4() + '.jpg';

			uploadFile.mv(filePath + filename , function(err) {
			    if (err) return res.status(500).send(err);
			});

			imgur.setClientId(process.env.IMGUR_CLIENT_ID || require('../configs').IMGUR_CLIENT_ID);

			imgur.uploadFile(filePath + filename)
			    .then(function (json) {
			    	grumbleData = formatGrumble(req.body, json.data.link);

			    	db.collection(collection).save(grumbleData, (err, result) => {
				   	 	if (err) return console.log(err);
				    	res.redirect('/');
				  	});
			    })
			    .catch(function (err) {
			        console.error(err.message);
			    });
		}
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
