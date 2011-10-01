var mongoose = require("mongoose")
  , util = require("util")
  , CallMethod = require("./call-method.js").CallMethod;

SforceSvc = function(restUrl) {
  // https://login.salesforce.com/id/00DU0000000IcfVMAS/005U0000000YqsFIAS
  console.log("Sforce Service will connect to: %s", restUrl);

  return {
    getUserDetails: function (doc, callback) {
      var data_url = restUrl + '/services/data/v22.0';
      // lets get the USER ID URL
      var payload = {
          name: 'getIdUrl'
        , method: 'GET'
        , 'Content-Type': 'application/json; charset=UTF-8'
        , 'Authorization': 'OAuth '+doc.sforce_sid
      };
      console.log("%s(%s) called.",payload.name, JSON.stringify(doc));
      CallMethod(data_url, payload, function (error, results) { 
        if ( error ) { 
          callback(error);
          return;
        }
        console.log("%s()=%s",payload.name,JSON.stringify(results));
        var payload2 = {
            name: 'getSforceUserDetails'
          , method: 'GET'
          , 'Content-Type': 'application/json; charset=UTF-8'
          , 'Authorization': 'OAuth '+doc.sforce_sid
        }
        CallMethod(results.identity,payload2,function (err, res) {
          if ( err ) { 
            callback(err);
            return;
          }
          console.log("%s()=%s",payload2.name,JSON.stringify(res));
          callback(null, res); 
        });
      });
    }

  }
};

exports.SforceSvc = SforceSvc;
