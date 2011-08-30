var mongoose = require("mongoose")
  , Schema = mongoose.Schema
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

AffiliateModel = function(host, port) {
  var db = mongoose.createConnection('mongodb://'+this.host+':'+this.port+'/marketing');
  console.info("connected to mongodb://%s:%d/marketing",host,port);
};


AffiliateModel.prototype.findAll = function(callback) {
  Affiliate.find({}, function (error, docs) {
    if ( error ) {
      console.error("error reading affiliates: %s",error);
      callback(error);
    }
    else {
      console.info("affiliates: %s",JSON.stringify(docs));
      callback(null, docs);
    }
  });
};

AffiliateModel.prototype.save = function(doc,callback) {
  var aff = new Affiliate();
  aff.name = doc.name;
  aff.description = doc.description;
  aff.website = doc.website;
  aff.created_by = doc.created_by;
  aff.updated_by = doc.updated_by;
  aff.save(function (error) { callback(error); });
};

AffiliateModel.prototype.findById = function(id, callback) {
  Affiliate.findOne({ _id: id}, function(error, doc) {
    if( error ) callback(error)
    else callback(null, doc)
  });
};

AffiliateModel.prototype.addApi = function(id,api_doc,callback) {
  Affiliate.findOne({ _id: id}, function(error, aff_model) {
    if ( error ) callback(error);
    else {
      aff_model.apis.push(api_doc);
      aff_model.save( function (err) { callback(err); });
    }
  });
};

AffiliateModel.prototype.getAffiliateApi = function(webpage,callback) {
  Affiliate.find({ "apis.webpage": webpage }, { "apis.webpage": 1, "apis.url":  1}, function (error, aff_model) {
    if ( error ) callback(error);
    else {
      var filtered = [];
      if ( typeof(aff_model.length)=="undefined" ) aff_model = [aff_model];
      for (var i=0;i<aff_model.length;i++) {
        var doc = aff_model[i].apis;
        for (var k=0;k<doc.length;k++) {
          //console.log("fetched webpage: "+doc[k].webpage+" url: "+doc[k].url);
          if ( doc[k].webpage === webpage ) {
            //console.log("added webpage: "+doc[k].webpage+" url: "+doc[k].url);
            filtered.push({webpage: doc[k].webpage, url: doc[k].url});
          }
        }
      }
      callback(null,filtered);
    }
  });
};

exports.AffiliateModel = AffiliateModel;
