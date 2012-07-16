
/******************************************/
/* Multitube Server                       */
/*                                        */
/* Author: Peter de Vos, Site Corporation */
/******************************************/

//-- Module dependencies --------------------------------------------

var app     = module.exports = require('express').createServer(),
    util    = require('util'),
    express = require('express'),
    routes  = require('./routes'),
    io      = require('socket.io').listen(app),
    expressValidator = require('express-validator'),
    UrlProvider   = require('./lib/urlprovider-memory').UrlProvider,
    //UrlProvider = require('./lib/urlprovider-mysql').UrlProvider,
    jqtpl   = require("jqtpl"),
    config  = require("./config/server");

//-- Configuration --------------------------------------------------

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.register('.html', require('jqtpl').express);
    app.use(express.logger("tiny"));
    app.use(express.bodyParser());
    app.use(expressValidator);
    app.use(express.methodOverride());
    app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
    app.use(app.router);  
    app.use(express.static(__dirname + '/public'));

    // Sessions
    //app.use(express.cookieParser());
    //app.use(express.session({secret: 'secret', key: 'express.sid'}));  
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.all('/robots.txt', function(req,res) {
        res.send('User-agent: *\nDisallow: /', {'Content-Type': 'text/plain'});
    });  
});

app.configure('production', function(){
    app.use(express.errorHandler());
    app.all('/robots.txt', function(req,res) {
        res.send('User-agent: *', {'Content-Type': 'text/plain'});
    });
});

// URL shortener and resolver
var urlProvider = new UrlProvider();

//-- Utility functions ----------------------------------------------

// error handling
function handleError(error, res) {
    res.contentType('text/plain');
    res.send(error.message);
    res.end();
}

// parse youtube url
var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
function parseURL(url) {
    if (url && url.length == 11) {
        return url;
    } else if(url) {
        var match = url.match(regExp);
        if (match && match[2].length == 11) {
            return match[2];
        }
    }
}

//-- Routes ---------------------------------------------------------

//app.get('/', routes.index);
app.get('/', function(req, res){
    res.render('index', { layout: false, title: 'MultiTube' })
});

app.post('/create', function(req, res) {
    req.assert('video', 'Invalid video').notEmpty();
    req.sanitize('video').xss();

    var errors = req.validationErrors();
    if (errors) {
        //res.send('There have been validation errors: ' + util.inspect(errors), 500);
        //handleError({ message: errors[0].msg },res);
        res.redirect('back');
        return;
    }

    var video = parseURL(req.body.video);
    if(!video) {
        return res.redirect('back');
    } 
    var u = { url: video };
    urlProvider.save([u], function(error, urls) {
        if (error) {
            handleError(error, res);
        } else {
            var url = urls[0];
            //delete url._id;
            res.redirect('/' + url.shorturl);
        }
    });
});

app.get('/:shorturl', function (req, res){
    req.sanitize('shorturl').xss();
    var shorturl = req.params.shorturl;
    urlProvider.findByShort(shorturl, function(error, url){
        if (error || !url) {
            handleError(error, res);
        } else {
            res.render('room', { 
              title: 'MultiTube', 
              link: req.headers.host + '/' + shorturl,
              youtubeId: url.url
              });                 
        }
    });
});

//-- Start Listener -------------------------------------------------

if (!module.parent) {
    var port = config.port || 80;
    if (process.env.NODE_ENV === "production") {
        //port = 80;
    }
    app.listen(port, function(){
        console.log("Server listening on port %d in %s mode", app.address().port, app.settings.env);
    });

    //-- Start my Socket.io app and pass in the socket ------------------

    io.configure(function() {
        io.set('log level', 1);
        io.set('close timeout', 60*60*24);
    });

    require('./lib/socketapp').start(io.sockets);
}