// web.js
var express = require("express");
var logfmt = require("logfmt");
var pg = require('pg');
var urlencode = require('urlencode');
var bodyParser = require('body-parser');
var pgClient;
var path = require('path');

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());
app.set('view engine', 'jade');

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});


pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  pgClient = client;
});

app.use(logfmt.requestLogger());

app.get('/api/days', function(req, res) {
	  var html = '<form action="/api/guests/add" method="post">' +
               'Enter your name:' +
               '<input type="text" name="userName" placeholder="..." />' +
               '<br>' +
               '<button type="submit">Submit</button>' +
            '</form>';
               
  res.send(html);
});

app.get('/api/guests', function(req, res) {
	  pgClient.query('SELECT * FROM guest', function(err, result) {
		res.send(result.rows);
	  });
});

app.post('/api/guests/add', function(req, res) {
    var userName =req.body.userName;
    pgClient.query('insert into guest (name, veg) values (\''+ userName +'\', \'f\');');
});

app.post('/api/guests/remove', function(req, res) {
    var userName =req.body.userName;
    pgClient.query('delete from guest where name=\''+ userName +'\';');
});

app.get('/', function(req, res){
	
	pgClient.query('SELECT * FROM day', function(err, day_result) {
		var days = day_result.rows;
		pgClient.query('SELECT * FROM guest', function(err, result) {
			var guests = result.rows;
			res.render('index', {"guests" : guests, "days":days});
		});
	});
});
