var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

AffiliateNotifier = function(host, port) {
  this.db= new Db('marketing', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};


AffiliateNotifier.prototype.getCollection= function(callback) {
    this.db.collection('affiliates', function(error, affiliate_collection) {
      if( error ) callback(error);
      else callback(null, affiliate_collection);
    });
};

AffiliateNotifier.prototype.findAll = function(callback) {
  this.getCollection(function(error, affiliate_collection) {
    if( error ) callback(error)
    else {
      affiliate_collection.find().toArray(function(error, results) {
      if( error ) callback(error)
      else callback(null, results)
      });
    }
  });
};

AffiliateNotifier.prototype.findById = function(id, callback) {
  this.getCollection(function(error, affiliate_collection) {
    if( error ) callback(error)
    else {
      affiliate_collection.findOne({
        _id: affiliate_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, 
      function(error, result) {
        if( error ) callback(error)
        else callback(null, result)
      });
    }
  });
};

AffiliateNotifier.prototype.save = function(affiliates, callback) {
  this.getCollection(function(error, affiliate_collection) {
    if( error ) callback(error)
    else {
      if( typeof(affiliates.length)=="undefined")
        affiliates = [affiliates];

      for( var i =0;i< affiliates.length;i++ ) {
        affiliate = affiliates[i];
        affiliate.created_at = new Date();
        if( affiliate.pages === undefined ) affiliate.pages = [];
        for(var j =0;j< affiliate.pages.length; j++) {
          affiliate.pages[j].created_at = new Date();
        }
      }

      affiliate_collection.insert(affiliates, function() {
        callback(null, affiliates);
      });
    }
  });
};

AffiliateNotifier.prototype.addToPage = function(affiliateId, page, callback) {
  this.getCollection(function(error, affiliate_collection) {
    if( error ) callback( error );
    else {
      var dbId = affiliate_collection.db.bson_serializer.ObjectID.createFromHexString(affiliateId);
      affiliate_collection.update( { _id: dbId }, {"$push": {pages: page}}, function(error, affiliate){
        if( error ) callback(error);
        else callback(null, affiliate);
      });
    }
  });
};

exports.AffiliateNotifier = AffiliateNotifier;
