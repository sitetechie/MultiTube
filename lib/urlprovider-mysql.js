
var nbs = require('./NewBase60');

//-- Build up the MySQL Connection ----------------------------------

var config = require("./../config/mysql");
var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : config.host,
	database : config.database,
	user     : config.user,
	password : config.password,
});

connection.connect(function(err) {
	if(err) {
		console.log('MySQL Client connection error: ', err); // + err.code);
	}
});

connection.on('close', function(err) {
	if (err) {
		console.log('MySQL Client Error: ' + err.code);
		// We did not expect this connection to terminate
		connection = mysql.createConnection(connection.config);
	} else {
		// We expected this to happen, end() was called.
	}
});


//-- Provider object ------------------------------------------------

UrlProvider = function (){};

//-- urlProvider.findByShort(shorturl, function(error, url){ ... });

UrlProvider.prototype.findByShort = function(code, callback) {
	throwExceptionIfCallbackIsntOk(callback);
	var q = 'SELECT video FROM shortLinks WHERE code = ' + connection.escape(code);
	connection.query(q, function(error, result, fields) {
		if (error) { 
			//throw err; 
			console.log(error.code); 
			connection.end(function(err) {
				callback({ message: 'MySQL Client Error: ' + error.code}, null);	
			});
		}
		else {
			if(result.length > 0) {
				var row = result[0];
				callback(null, { url: row.video  });
			} else {
				callback(null, null);
			}
		}
	});
};

//-- urlProvider.save([{ url: video }], function(error, urls) { ... });

UrlProvider.prototype.save = function(urls, callback) {
    var url = null;
    if (typeof (urls.length)=="undefined") {
        urls = [urls];
    }
	for (var i = 0; i < urls.length; i++) {
        url = urls[i];
        //url.created_on = new Date();
        var s = Math.pow(2,32);
        var n = Math.floor(Math.random()*s);
        url.shorturl = nbs.numtosxg(n);
        var q = 'INSERT INTO shortLinks SET code = ?, video = ?';
        var values = [url.shorturl, url.url];
        connection.query(q, values, function(error, info){
			if (error) { 
				//throw error; 
				console.log("MySQL Client Error: " + error.code);
				connection.end(function(err) {
					callback({ message: 'MySQL Client Error: ' + error.code}, null);	
				});
        		return;				
			}
			//console.log(info.insertId);
			//console.log('Inserted: ' + info.affectedRows + ' row.');
        });
    }
    callback(null, urls);
};

exports.UrlProvider = UrlProvider;


//-- Utility functions ----------------------------------------------

function throwExceptionIfCallbackIsntOk(callback) {
	if(callback == null) {
    	throw "You didn't set a callback Function!'"
	}
  
	if(typeof callback != 'function') {
    	throw "Your Callback isn't a Function!'"
  	}
}