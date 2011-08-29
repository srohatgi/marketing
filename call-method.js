var http = require('http');

exports.CallMethod = function (host, port, path, method, data, callback) {
  var options = { 
      host: host
    , port: port
    , path: path
    , method: method
    , headers: {'Content-Type': 'application/json'}
  };

  // setup the http post
  var req = http.request(options, function (res) {
    var res_data = '';
    console.info("got response status code: "+res.statusCode);

    res.on('data', function(chunk) { res_data += chunk; });
    res.on('end', function() { 
      if ( res.statusCode === 200 ) callback(null,JSON.parse(res_data));
      else callback('error calling service');
    });
    res.on('close', function(err) {
      console.error("error recieving: %s",options);
      callback(err);
    });
  }).on('error', function (e) {
    console.error("error %s calling: %s",e,options);
    callback(e);
  });

  // write data 
  req.write(JSON.stringify(data));

  // call
  req.end();
};
