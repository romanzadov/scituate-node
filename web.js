// web.js
var express = require("express");
var logfmt = require("logfmt");
var pg = require('pg');
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

var conString = process.env.DATABASE_URL;

pg.connect(conString, function(err, client, done) {
  pgClient = client;
});

app.use(logfmt.requestLogger());

app.get('/guests/add', function(req, res) {
	  var html = '<form action="/api/guests/add" method="post">' +
               'Enter your name:' +
               '<input type="text" name="userName" placeholder="..." />' +
               '<input type="checkbox" name="veg"/> Vegetarian' +
               '<br>' +
               '<button type="submit">Submit</button>' +
            '</form>';
               
  res.send(html);
});
app.post('/api/guests/add', function(req, res) {
    var userName =req.body.userName;
    var veg = req.body.veg;
    var vegValue;
    if (veg) { vegValue = "t";}
    else { vegValue = "f";}
    console.log("veg: " + veg);
    console.log('insert into guest (name, veg) values (\''+ userName +'\', \''+vegValue+'\');');
    pgClient.query('insert into guest (name, veg) values (\''+ userName +'\', \''+vegValue+'\');');
});

app.get('/guests/delete', function(req, res) {
	  var html = '<form action="/api/guests/remove" method="post">' +
               'Remove guest by name:' +
               '<input type="text" name="userName" placeholder="..." />' +
               '<br>' +
               '<button type="submit">Submit</button>' +
            '</form>';
               
  res.send(html);
});
app.post('/api/guests/remove', function(req, res) {
    var userName =req.body.userName;
    pgClient.query('delete from guest where name=\''+ userName +'\';');
});

app.get('/api/guests', function(req, res) {
	  pgClient.query('SELECT * FROM guest;', function(err, result) {
		res.send(result.rows);
	  });
});




app.get('/', function(req, res){
	pgClient.query('SELECT * FROM day;', function(err, result) {
		var days = result.rows;
		res.render('index', {"days":days});
	  });
	/*pgClient.query('SELECT * FROM day', function(err, day_result) {
		var days = day_result.rows;
		pgClient.query('SELECT * FROM guest', function(err, result) {
			var guests = result.rows;
			var guestVisitRows={};
			for (var i = 0; i<guests.size(); i++) {
				var guest = guests[i];
				guestVisitRows.push({"guest":guest, "visitRow": getVisitRows(guest, days.size())});
			}
			res.render('index', {"guestVisitRows" : guestVisitRows, "days":days});
		});
	});*/
});

function getVisitRows(guest, numberOfDays) {
	pgClient.query("SELECT * FROM visit where guestId="+guest.id+";", function(err, result){
		var visits = result.list;
		var visitsAndNot={};
		for (var i = 0; i<numberOfDays; i++) {
			var visitOnDay = null;
			for (var j = 0; j<visits.size(); j++) {
				var visit = visits[j];
				if (visit.day_id == i) { visitOnDay = visit; }
			}
			visitsAndNot.push({"visit": visitOnDay});
		}
		return visitsAnNot;
	});
}
