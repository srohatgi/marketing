
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , CallMethod = require('./call-method.js').CallMethod;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.logger({ format: ':method :url :response-time' }));
  console.info("setup the logger");
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  CallMethod('localhost',3100,'/affiliate/all','GET', null, function (err, results) {
    if ( err ) {
      res.send("error calling /affiliate/all: "+err);
      return;
    }
    var affiliates = JSON.parse(results);
    res.render('index.jade', {locals: {title: 'Affiliate Notifier Manager', affiliates: affiliates}});
  });
});

// accounts
app.get('/account/create', function(req, res){
  res.render('account_create.jade', { title: 'Create Account' });
});

app.post('/account/create', function(req, res) {
  var data = { 
      acct_name: req.param('acct_name')
    , acct_description: req.param('acct_description')
    , identity: req.param('identity')
    , name: req.param('name')
    , email: req.param('email')
    , passwd: req.param('passwd')
    , owa_url: req.param('owa_url')
  };

  console.info("creating account: %s",JSON.stringify(data));

  CallMethod('localhost',3100,'/account/create','POST', data, function (err, results) {
    if ( err === null ) console.info('results: %s',JSON.stringify(results));
    res.redirect("/login");
  });

});

// login
app.get('/login', function(req, res){
  res.render('login.jade', { title: 'Login' });
});

app.post('/login', function(req, res){
  var data = {
      email: req.param('email')
    , passwd: req.param('passwd')
  };
  console.info("logging into: %s",JSON.stringify(data));

  CallMethod('localhost',3100,'/login','POST', data, function (err, results) {
    var userId = null;
    if ( err === null ) {
      userId = results.userId;
      console.info('results: %s',userId);
    }
    res.send("logged in: %s",userId);
  });

});


// affiliates
app.get('/affiliate/new', function(req, res) {
  res.render('affiliate_new.jade', { locals: { title: 'Add Affiliate' } });
});

app.post('/affiliate/new', function(req, res){
  var data = {
      email: req.param('email')
    , passwd: req.param('passwd')
  };
  console.info("logging into: %s",JSON.stringify(data));

  CallMethod('localhost',3100,'/affiliate/create','POST', data, function (err, results) {
    if ( err ) {
      var msg = 'failed creating affiliate';
      res.send("%s results: %s",msg,JSON.stringify(results));
    }
    res.redirect('/')
  });

});

app.get('/affiliate/:id', function(req, res) {
  console.info("details of affiliate: %s",req.params.id);

  CallMethod('localhost',3100,'/affiliate/'+req.params.id,'GET', null, function (err, results) {
    if ( err ) console.log("error finding affiliate: %s!!",req.params.id);
    else res.render('affiliate_show.jade', { 
      locals: {
        title: "Edit Affiliate",
        affiliate: affiliate
      }
    });
  });
});

app.post('/affiliate/addApi', function(req, res) {
  var data = {
      _id: req.param('_id')
    , url: req.param('url')
    , webpage: req.param('webpage')
    , created_by: req.param('user')
    , updated_by: req.param('user')
  };

  CallMethod('localhost',3100,'/affiliate/api/create','POST', data, function (err, results) {
    if ( err ) console.log("unable to save api: "+req.param('url'));
    res.redirect('/affiliate/' + req.param('_id'))
  });
});

app.get('/webpage_affiliate/:id', function(req, res) {
  console.info("details of webpage affiliates: %s",req.params.id);

  CallMethod('localhost',3100,'/affiliate/webpage/'+req.params.id,'GET', null, function (err, results) {
    var urls = [];
    if ( err ) console.log("error finding affiliates for webpage: %s!!",req.params.id);
    else urls = results;
    res.send(results);
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
