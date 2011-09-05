var mongoose = require("mongoose")
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , util = require("util");

var API = new Schema({
    url: String
  , webpage: String
  , created_by: String
  , created_at: { type: Date, default: Date.now }
  , updated_by: String
  , updated_at: { type: Date, default: Date.now }
});

var AffiliateSchema = new Schema({
    name: String
  , description: String
  , website: String
  , account_id: ObjectId
  , apis: [API]
  , created_by: String
  , created_at: { type: Date, default: Date.now }
  , updated_by: String
  , updated_at: { type: Date, default: Date.now }
});

var Affiliate; 

AffiliateModel = function(url) {
  //var db = mongoose.connect(url);
  //Affiliate = mongoose.model('Affiliate',AffiliateSchema);
  var db = mongoose.createConnection(url);
  Affiliate = db.model('Affiliate',AffiliateSchema);
  console.log("connected to mongodb://%s:%s@%s:%d/%s",db.user,db.pass,db.host,db.port,db.name);
};


AffiliateModel.prototype.findAll = function(accountId, callback) {
  Affiliate.find({account_id: accountId}, function (error, docs) {
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
  aff.account_id = doc.account_id;
  aff.save(function (error) { 
    if ( error ) {
      callback(error); 
      return;
    }
    callback(null,aff._id);
  });
};

AffiliateModel.prototype.findById = function(doc, callback) {
  /*
  var id = doc.affiliate_id;
  console.log(util.inspect(Affiliate.collection));
  var Db = Affiliate.collection.collection.db;
  var id = new Db.bson_serializer.ObjectID(doc.affiliate_id);
  var account_id = new Db.bson_serializer.ObjectID(doc.account_id);
  console.log("_id:%s, account_id:%s",id,account_id);
  */
  Affiliate.findOne({ _id: doc.affiliate_id, account_id: doc.account_id }, function(error, result) {
    if( error || result == null ) callback(error?error:new Error("unable to query for affiliate id:"+doc.affiliate_id));
    else callback(null, result);
  });
};

AffiliateModel.prototype.addApi = function(affiliate_id,api_doc,callback) {
  Affiliate.findOne({ _id: affiliate_id, account_id: api_doc.account_id}, function(error, aff_model) {
    if ( error || aff_model == null ) {
      console.log("error finding affiliate id: %s account id: %s error: %s",affiliate_id,api_doc.account_id,error);
      callback(error?error:new Error("unable to fetch affiliate id "+affiliate_id+" with account: "+api_doc.account_id+" from db"));
      return;
    }
    aff_model.apis.push(api_doc);
    aff_model.save( function (err) { 
      if ( err ) {
        console.log("error affiliate id: %s account id: %s error: %s",affiliate_id,api_doc.accountId,err);
        callback(err); 
        return;
      }
      callback(null,1);
    });
  });
};

// TODO add multitenancy
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
