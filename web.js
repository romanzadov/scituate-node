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
	
	pgClient.query('SELECT * FROM day', function(err, day_result) {
		var days = day_result.rows;
		var dayCount = day_result.rowCount;
		
		pgClient.query('SELECT * FROM guest', function(err, guest_result) {
			var guests = guest_result.rows;
			var guestCount = guest_result.rowCount;
				
			pgClient.query("SELECT * FROM visit;", function(err, visit_result){
				var guestVisitRows=[];
				var visits = visit_result.list;
				var visitCount = visit_result.rowCount;
				
				console.log("Getting visits: "+visitCount + " guests: " + guestCount);
				for (var i; i<guestCount; i++) {
					console.log("In guest loop i: " +i);
					var guest = guests[i];
					console.log("getting row for guest " + guest.id);
					guestVisitRows[i]={"guest":guest, "visitRow": getVisitRowForGuest(guest, visits, visitCount, days, dayCount)};
				}
				res.render('index', {"guestVisitRows" : guestVisitRows, "days":days});
			});
		});
	});
});

function getVisitRowForGuest(guest, visits, visitCount, days, dayCount) {
	console.log("Guest: " + guest.id + " visits: " + visitCount + " days: " + dayCount);
	var visitRow = [];
	for (var i = 0; i<dayCount; i++) {
		var day = days[i];
		var visitOnDay = null;
		for (var j = 0; j<visitCount; j++) {
			var visit = visits[j];
			if (visit.day_id == i && visit.guest_id == guest.id) {
				visitOnDay = visit; 
		    }
		}
		visitRow[i] = {"visit": visitOnDay};
	}
	return visitRow;
}
