var CallMethod = require("./call-method.js").CallMethod
  , crypto = require("crypto")
  , util = require("util");

UserPfmSvc = function(soapUrl) {
  console.log("User Service will connect to: %s", soapUrl);

  return {

    getUserDetails: function (doc, callback) {
      var payload = { 
          name: "getUserDetails"
        , method: "POST"
        , data: '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:su2="http://su2"> <s:Header/> <s:Body> <su2:getUserDetails/> </s:Body> </s:Envelope>'
        , Ysi_session_id: doc.sessionId
        , 'Content-Type': 'application/soap+xml;charset=UTF-8'
      };
      console.log("%s(%s) called.",payload.name,JSON.stringify(doc));
      CallMethod(soapUrl, payload, function (error, results) { 
        if ( error ) { 
          callback(error);
          return;
        }
        console.log("%s()=%s",payload.name,JSON.stringify(results));
        callback(null,results);
      });
    }
  
    , login: function(doc, callback) {
      console.log("login(%s) called.",JSON.stringify(doc));
      var payload = { 
          name: "login"
        , method: "POST"
        , 'Content-Type': 'application/soap+xml;charset=UTF-8'
        , data: '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:su2="http://su2"> <s:Header/> <s:Body> <su2:login> <userCredentialDTO> <emailAddress>'+doc.loginName+'</emailAddress> <password>'+doc.password+'</password> <userAgent>web</userAgent> </userCredentialDTO> </su2:login> </s:Body> </s:Envelope>'
      };
      console.log("login(%s) called.",payload);
      CallMethod(soapUrl, payload, function (error, results) { 
        if ( error ) { 
          callback(error);
          return;
        }
        console.log("login()=%s",JSON.stringify(results));
        callback(null,results);
      });
    }
  
    , userSave: function(doc, callback) {
    }

    , createAccount: function(doc, callback) {
    }
  
  } // end of return
}; // end of UserSvc

exports.UserPfmSvc = UserPfmSvc;
