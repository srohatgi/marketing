var http = require('http')
  , https = require('https')
  , url = require('url')
  , xml2js = require('xml2js')
  , util = require('util');

var CallMethod = function (soapUrl, svc, callback) {
  var params = url.parse(soapUrl);
  //var agent = http.getAgent(params.hostname, params.port);
  //agent.maxSockets = 10;

  var options = {
      host: params.hostname
    , port: params.port
    , path: params.pathname
    , method: svc.method
    , headers: {
        'Connection': 'keep-alive'
    }
        //'Content-Type': 'application/soap+xml;charset=UTF-8'
  };

  // stitch in session id
  for (var p in svc) {
    if ( p !== 'method' && p !== 'name' && p !== 'data' ) 
      options.headers[p] = svc[p];
  }

  console.log("calling service:%s/%s with payload:%s content-type:%s",soapUrl,svc.name,svc.data,JSON.stringify(options.headers));

  // set the json parser
  var parser = new xml2js.Parser();
  parser.addListener('end', function(result) {
    console.dir(result);
    // remove soap cruft
    result = result["S:Body"]["ns2:"+svc.name+"Response"]["return"];
    callback(null,result);
  });

  var do_process = function (res) {
    var res_data = '';
    console.info("got response status code: "+res.statusCode);

    res.on('data', function(chunk) { res_data += chunk; });
    res.on('end', function() { 
      if ( res.statusCode != 200 ) {
        console.log("returned data:%s headers:%s",JSON.stringify(res_data),JSON.stringify(res.headers));
        // handle redirect
        if ( res.statusCode < 400 && res.statusCode >= 300 && res.headers['content-type'] !== 'text/html') {
          console.log("redirecting...");
          CallMethod(res.headers["location"],svc,callback);
          return;
        }
        console.log("erroring out");
        callback('error calling service:'+res.statusCode+' response data:'+res_data);
        return;
      }
      if ( options.headers['Content-Type'] === 'application/soap+xml;charset=UTF-8' )
        parser.parseString(res_data);
      else 
        callback(null,JSON.parse(res_data));
    });
    res.on('close', function(err) {
      console.error("error recieving: %s:%d%s",options.host,options.port,options.path);
      callback(err);
    });
  };

  if ( params.protocol === 'http:' ) {
    var req = http.request(options, do_process);
    req.on('error', function (e) { console.error("error [%s]",e);
      req.abort();
      callback(e);
    });
    // write data 
    if ( svc.data ) req.write(svc.data);

    // call
    req.end();
  } else {
    var req = https.request(options, do_process);
    req.on('error', function (e) { console.error("error [%s]",e);
      req.abort();
      callback(e);
    });
    // write data 
    if ( svc.data ) req.write(svc.data);

    // call
    req.end();
  }
};

exports.CallMethod = CallMethod;
