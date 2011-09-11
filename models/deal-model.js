var mongoose = require("mongoose")
  , crypto = require("crypto")
  , util = require("util");

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var DealSchema = new Schema({
    name: String
  , customer_id: ObjectId
  , deal_type: String
  , start_date: {type: Date }
  , end_date: {type: Date }
  , coupon_id: String
  , price: Number
  , percent_off: Number
});

var CustomerSchema = new Schema({
    customer_name: String
  , address_loc: [Number]
  , owner: String
  , deal: [DealSchema]
  , account_id: ObjectId
  , created_by: ObjectId
  , created_at: {type: Date, default: Date.now }
  , updated_by: ObjectId
  , updated_at: {type: Date, default: Date.now }
});

DealSvc = function(url) {
  var db = mongoose.createConnection(url);
  var Customer = db.model('Customer',CustomerSchema);
  console.log("connected to mongodb://%s:%s@%s:%d/%s",db.user,db.pass,db.host,db.port,db.name);

  return {
    createCustomer: function (doc, callback) {
      console.log("trying to create a new customer %s",JSON.stringify(doc));
      var c = new Customer();
      for (var p in doc) c[p] = doc[p];
      c.save(function (error) { 
        if ( error ) {
          error.type = 'DEAL_SVC_createCustomer';
          console.log("error trying to save customer object, error: [%s]",error);
          callback(error);
          return;
        }
        callback(null,{ _id: c._id });
      });
    }

    , addDeal: function (doc, callback) {
      console.log("doc: %s",JSON.stringify(doc));
      Customer.findOne({ account_id: doc.account_id, _id: doc.customer_id }, function (error, customer) {
        if ( error ) {
          error.type = 'DEAL_SVC_addDeal';
          console.log("error trying to addDeal for customer: %s, error: [%s]",doc.customer_id,error);
          callback(error);
          return;
        }
        customer.deal.push(doc);
        customer.save(function (err) {
          if ( err ) {
            err.type = 'DEAL_SVC_addDeal';
            console.log("error trying to addDeal for customer: %s, error: [%s]",doc.customer_id,err);
            callback(err);
            return;
          }
          callback(null,{ deal: customer.deal });
        });
      });
    }

    , findDeals: function (doc, callback) {
      Deal.find({ account_id: doc.account_id }, function (error, deals ) {
        if ( error ) {
          error.type = DEAL_SVC_findDeals;
          console.log("error fetching deals for account_id: %s, error: [%s]",doc.account_id,error);
          callback(error);
          return;
        }
        callback(null,deals);
      });
    }
  }
};

exports.DealSvc = DealSvc;
