
var nbs  = require('./NewBase60'),
    util = require('util');

var urlCounter = 1;

UrlProvider = function (){};
UrlProvider.prototype.dummyData = [];

UrlProvider.prototype.findAll = function (callback) {
    callback(null, this.dummyData);
};

UrlProvider.prototype.findByUrl = function(url, callback) {
    var result = null;
    for(var i=0; i<this.dummyData.length;i++) {
        if (this.dummyData[i].url == url) {
            result = this.dummyData[i];
            break;
        }
    }
    callback(null, result);
};

UrlProvider.prototype.findByShort = function(shorturl, callback) {
    var result = null;
    for(var i=0; i<this.dummyData.length;i++) {
        //console.log("checking "+util.inspect(this.dummyData[i])+ " for " + shorturl);
        if (this.dummyData[i].shorturl == shorturl) {
            result = this.dummyData[i];
            break;
        }
    }
    callback(null, result);
};

UrlProvider.prototype.findRecent = function(count, callback) {
    var result = [];
    result = this.dummyData.slice(-count);
    callback(null, result);
};

UrlProvider.prototype.save = function(urls, callback) {
    var url = null;
    
    if (typeof (urls.length)=="undefined") {
        urls = [urls];
    }

    for (var i=0; i<urls.length; i++) {
        url = urls[i];
        url._id = urlCounter++;
        url.created_on = new Date();
        var s = Math.pow(2,32);
        var n = Math.floor(Math.random()*s);
        url.shorturl = nbs.numtosxg(n);
        this.dummyData[this.dummyData.length] = url;
    }
    callback(null, urls);
};

UrlProvider.prototype.update = function (shorturl, data, callback) {
    for(var i=0; i<this.dummyData.length;i++) {
        if (this.dummyData[i].shorturl == shorturl) {
            this.dummyData[i] = data;
            break;
        }
    }
    callback(null, result);
};

exports.UrlProvider = UrlProvider;
