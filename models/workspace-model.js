var mongoose = require("mongoose")
  , util = require("util")
  , CallMethod = require("./call-method.js").CallMethod;

WorkspaceSvc = function(soapUrl) {
  console.log("Workspace Service will connect to: %s", soapUrl);

  return {
    getWorkSpace: function (doc, callback) {
      var payload = {
          name: 'getWorkSpace'
        , method: "POST"
        , 'Content-Type': 'application/soap+xml;charset=UTF-8'
        , data: '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:su2="http://su2"> <s:Header/> <s:Body> <su2:getWorkSpace> <workSpaceQueryDTO> <ownerId>'+doc.ownerId+'</ownerId> <ownerType>'+doc.ownerType+'</ownerType> </workSpaceQueryDTO> </su2:getWorkSpace> </s:Body> </s:Envelope>'
      };
      console.log("%s(%s) called.",payload.name, JSON.stringify(doc));
      CallMethod(soapUrl, payload, function (error, results) { 
        if ( error ) { 
          callback(error);
          return;
        }
        console.log("%s()=%s",payload.name,JSON.stringify(results));
        callback(null, results); 
      });
    }

  }
};

exports.WorkspaceSvc = WorkspaceSvc;
