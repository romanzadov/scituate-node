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

app.use("/public", express.static(__dirname + '/public'));

function getBool(formValue) {
  if(formValue) { return true; }
  return false;
}

app.post('/api/guests/remove', function(req, res) {
    var id =req.body.guest;
    pgClient.query('delete from guest where id=\''+ id +'\';');
    pgClient.query('delete from visit where guest_id=\''+ id +'\';', function(err, response) {
    		res.redirect('/');
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
		dayTotal[i] = {"name": day.name, "id": day.id, "visitors":visitors, "veg":veg, "cooking":cooking};
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

app.post('/api/guests/add', function(req, res) {
   var name =req.body.name;
   var veg = getBool(req.body.veg);
    
   pgClient.query('insert into guest (name, veg) values ($1, $2) returning id', [name, veg]).on('row', function (row) {
   	   var guest = row;
   	   
   	   checked = getBool(req.body.day1);
	   cooking = getBool(req.body.cooking1);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 1, cooking]);
	   }
	   
	   checked = getBool(req.body.day2);
	   cooking = getBool(req.body.cooking2);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 2, cooking]);
		   res.redirect('/');
	   }
	   
   	   checked = getBool(req.body.day3);
	   cooking = getBool(req.body.cooking3);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 3, cooking]);
	   }
	   
   	   checked = getBool(req.body.day4);
	   cooking = getBool(req.body.cooking4);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 4, cooking]);
	   }
	   
   	   checked = getBool(req.body.day5);
	   cooking = getBool(req.body.cooking5);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 5, cooking]);
	   }
	   
   	   checked = getBool(req.body.day6);
	   cooking = getBool(req.body.cooking6);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 6, cooking]);
	   }
	   
   	   checked = getBool(req.body.day7);
	   cooking = getBool(req.body.cooking7);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 7, cooking]);
	   }
	   
   	   checked = getBool(req.body.day8);
	   cooking = getBool(req.body.cooking8);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 8, cooking]);
	   }
	   
   	   checked = getBool(req.body.day9);
	   cooking = getBool(req.body.cooking9);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 9, cooking]);
	   }
	   
   	   checked = getBool(req.body.day10);
	   cooking = getBool(req.body.cooking10);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 10, cooking]);
	   }
	   
   	   checked = getBool(req.body.day11);
	   cooking = getBool(req.body.cooking11);
	   if (checked) {
		   pgClient.query('insert into visit (guest_id, day_id, cooking) values ($1, $2, $3)', [guest.id, 11, cooking]);
	   }

   });

   
    
});
