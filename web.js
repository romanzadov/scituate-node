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
			
			var guestVisitRows = [];
			pgClient.query("SELECT * FROM visit", function(err, visit_result){
				var visits = visit_result.rows;
				var visitCount = visit_result.rowCount;
				
				for (var i = 0; i<guestCount; i++){
					var guest = guests[i];
					guestVisitRows[i] = {"guest":guest, "visitRow": getVisitRows(guest, visits, visitCount, days, dayCount)}
				}
				var dayTotals = getDayTotalRows(guests, guestCount, days, dayCount, visits, visitCount);
				res.render('index', {"guestVisitRows" : guestVisitRows, "days":dayTotals});
			});
		});
	});
});

function getDayTotalRows(guests, guestCount, days, dayCount, visits, visitCount) {
	var dayTotal = [];
	
	for (var i = 0; i<dayCount; i++) {
		var visitors = 0;
		var veg = 0;
		var cooking = 0;
		var day = days[i];
		for (var j = 0; j<visitCount; j++) {
			var visit = visits[j];
			if (visit.day_id == days[i].id) { 
				visitors++;
				if (visit.cooking) { cooking++;}
				for (var k = 0; k<guestCount; k++){
					var guest = guests[k];
					if (guest.id == visit.guest_id && guest.veg) {
						veg++;
					}
				}
			}			
		}
		dayTotal[i] = {"name": day.name, "visitors":visitors, "veg":veg, "cooking":cooking};
		console.log("summary: " + dayTotal[i].visitors);
	}
	return dayTotal;
}
	
function getVisitRows(guest, visits, visitCount, days, dayCount) {
	var visitRow = [];
	
	for (var i = 0; i<dayCount; i++) {
		var visitOnDay = null;
		for (var j = 0; j<visitCount; j++) {
			var visit = visits[j];
			if (visit.day_id == days[i].id && visit.guest_id == guest.id) { 
				visitOnDay = visit; 
			}			
		}
		visitRow[i] = visitOnDay;
	}
	return visitRow;
}
