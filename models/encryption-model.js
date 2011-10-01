var CallMethod = require("./call-method.js").CallMethod
  , crypto = require("crypto")
  , util = require("util");

EncryptionSvc = function(soapUrl) {
  console.log("Encryption Service will connect to: %s", soapUrl);

  return {

      decodeData: function (doc, callback) {
      var payload = { 
          name: 'decodeData'
        , method: 'POST'
        , 'Content-Type': 'application/soap+xml;charset=UTF-8'
        , data: '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:su2="http://su2"> <s:Header/> <s:Body> <su2:encodeData> <value>'+doc.value+'</value> </su2:encodeData> </s:Body> </s:Envelope>'
      };
      console.log("%s(%s) called.",payload.name, JSON.stringify(doc));
      CallMethod(soapUrl, payload, function (error, results) { 
        if ( error ) { 
          callback(error);
          return;
        }
        console.log("%s()=%s",payload.name,JSON.stringify(results));
        var ret = { 
            decodeData: results
        };

        callback(null,ret);
      });
    }
  
    , encodeData: function(doc, callback) {
      var payload = { 
          name: 'encodeData'
        , method: 'POST'
        , 'Content-Type': 'application/soap+xml;charset=UTF-8'
        , data: '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:su2="http://su2"> <s:Header/> <s:Body> <su2:encodeData> <value>'+doc.value+'</value> </su2:encodeData> </s:Body> </s:Envelope>'
      };
      console.log("%s(%s) called.",payload.name, JSON.stringify(doc));
      CallMethod(soapUrl, payload, function (error, results) { 
        if ( error ) { 
          callback(error);
          return;
        }
        console.log("%s()=%s",payload.name,JSON.stringify(results));
        var ret = { 
            encodeData: results
        };

        callback(null,ret);
      });
    }
  
  } // end of return
}; // end of UserSvc

exports.EncryptionSvc = EncryptionSvc;
