var mongoose = require("mongoose");
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var API = new Schema({
    url: String
  , webpage: String
  , created_by: String
  , created_at: { type: Date, default: Date.now }
  , updated_by: String
  , updated_at: { type: Date, default: Date.now }
});

var myAffiliate = new Schema({
    name: String
  , description: String
  , website: String
  , apis: [API]
  , created_by: String
  , created_at: { type: Date, default: Date.now }
  , updated_by: String
  , updated_at: { type: Date, default: Date.now }
});

var Affiliate = mongoose.model('Affiliate',myAffiliate);

AffiliateNotifier = function(host, port) {
  mongoose.connect('mongodb://'+host+':'+port+'/marketing');
};


AffiliateNotifier.prototype.findAll = function(callback) {
  Affiliate.find({}, function (error, docs) {
    if ( error ) callback(error);
    else callback(null, docs);
  });
};

AffiliateNotifier.prototype.save = function(doc,callback) {
  var aff = new Affiliate();
  aff.name = doc.name;
  aff.description = doc.description;
  aff.website = doc.website;
  aff.created_by = doc.created_by;
  aff.updated_by = doc.updated_by;
  aff.save(function (error) { callback(error); });
};

AffiliateNotifier.prototype.findById = function(id, callback) {
  Affiliate.findOne({ _id: id}, function(error, doc) {
    if( error ) callback(error)
    else callback(null, doc)
  });
};

AffiliateNotifier.prototype.addApi = function(id,api_doc,callback) {
  Affiliate.findOne({ _id: id}, function(error, aff_model) {
    if ( error ) callback(error);
    else {
      aff_model.apis.push(api_doc);
      aff_model.save( function (err) { callback(err); });
    }
  });
};

exports.AffiliateNotifier = AffiliateNotifier;
