var http = require('http')
  , util = require('util');

exports.CallMethod = function (host, port, path, method, data, callback) {
  var agent = http.getAgent(host, port);

  agent.maxSockets = 10;

  var options = {
      agent: agent
    , host: host
    , port: port
    , path: path
    , method: method
    , headers: {
        'Content-Type': 'application/json'
      , 'Connection': 'keep-alive'
    }
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
      console.error("error recieving: %s:%d%s",options.host,options.port,options.path);
      callback(err);
    });
  }).on('error', function (e) {
    console.error("error [%s] calling options: %s",e,util.inspect(options));
    console.error("agent maxSockets: %d sockets: [%s]",agent.maxSockets, util.inspect(agent.sockets));
    req.abort();
    callback(e);
  });

  // write data 
  req.write(JSON.stringify(data));

  // call
  req.end();
};
