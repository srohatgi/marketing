
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http');

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

// Models
var UserModel = require('./models/user-model.js').UserModel
  , AffiliateModel = require('./models/affiliate-model.js').AffiliateModel
  , CounterModel = require('./models/counter-model.js').CounterModel;

var affiliateModel = new AffiliateModel('localhost', 27017)
  , counterModel = new CounterModel('localhost', 27017)
  , userModel = new UserModel('localhost', 27017);

/*****************************************************************************
 * AFFILIATES manager app & relevant api                                     *
 *****************************************************************************/
// main 'app' page
app.get('/', function(req, res){
  affiliateModel.findAll(function(err, affiliates){
    if ( err ) {
      res.send("error calling /affiliate/all: "+err);
      return;
    }
    res.render('index.jade', {locals: {title: 'Affiliate Manager', affiliates: affiliates}});
  });
});

app.get('/app/affiliate/:id', function(req, res) {
  console.info("details of affiliate: %s",req.params.id);

  affiliateModel.findById(req.params.id, function(err, affiliate){
    if ( err ) {
      console.log("error finding affiliate: %s!!",req.params.id);
      res.send("unable to find affiliate: "+req.params.id);
    }
    else res.render('affiliate_show.jade', { 
      locals: {
        title: "Edit Affiliate",
        affiliate: affiliate
      }
    });
  });
});

// get a list of affiliates
app.get('/api/affiliate/:id', function(req, res) {
  if ( req.params.id == 'all' ) {
    console.info("trying to find affiliate: %s",req.params.id);
    affiliateModel.findAll(function(error, affiliates){
      if ( error ) {
        console.error("error getting affiliates");
        res.send({error: "error getting affiliates"});
      }
      res.send(affiliates);
    });
  } else {
    affiliateModel.findById(req.params.id, function(error, affiliates) {
      if ( error ) {
        console.error("error finding affiliate: %s!!",req.params.id);
        res.send({ error: "error finding affiliate"});
      }
      res.send(affiliates);
    });
  }
});

// add new affiliate
app.get('/app/affiliate/new', function(req, res) {
  res.render('affiliate_new.jade', { locals: { title: 'Add Affiliate' } });
});

app.post('/app/affiliate/new', function(req, res){
  var data = {
      email: req.param('email')
    , passwd: req.param('passwd')
  };
  console.info("logging into: %s",JSON.stringify(data));

  affiliateModel.save( data, function( err ) {
    if ( err ) {
      var msg = 'failed creating affiliate';
      res.send("%s results: %s",msg,JSON.stringify(results));
    }
    res.redirect('/'); // goto main app page; which shows affiliate list
  });
});

app.post('/api/affiliate/create', function(req, res){
  console.info("saving affiliate: %s",JSON.stringify(req.body));
  affiliateModel.save( req.body, function( error ) {
    if ( error ) {
      console.log("error saving affiliate");
      res.send({ error: "error saving affiliate"});
    }
    res.send({});
  });
});

// add affiliate[API]
app.post('/app/affiliate/addApi', function(req, res) {
  var data = {
      _id: req.param('_id')
    , url: req.param('url')
    , webpage: req.param('webpage')
    , created_by: req.param('user')
    , updated_by: req.param('user')
  };

  affiliateModel.addApi(data._id, data, function (err) {
    if ( err ) console.log("unable to save api: "+req.param('url'));
    res.redirect('/affiliate/' + req.param('_id'));
  });
});

app.post('/api/affiliate/api/create', function(req, res) {
  console.info(req.body);
  affiliateModel.addApi(req.body._id, {
      url: req.body.url
    , webpage: req.body.webpage
    , created_by: req.body.user
    , updated_by: req.body.user
  } , function( error ) {
    if ( error ) {
      console.error("unable to save api: %s",req.body.url);
      res.send({ error: "unable to add api" });
    }
    res.send({});
  });
});

// lookup affiliates by webpage
app.get('/api/affiliate/webpage/:id', function(req, res) {
  console.info(req.params.id);
  affiliateModel.getAffiliateApi(req.params.id, function(error, urls) {
    if ( error ) {
      console.log("unable to fetch any affiliates for webpage: "+req.params.id);
      urls = [];
    }
    else {
      if ( typeof(urls.length)=="undefined" ) urls = [urls];
      // fire and forget call for tracking
      for (var i=0;i<urls.length;i++) 
        counterModel.save({name: urls[i].url, type: urls[i].webpage, subtype: ""});
    }
    res.send(urls);
  });
});

/*****************************************************************************
 * ACCOUNTS                                                                  *
 *****************************************************************************/
// create a new account
app.get('/app/account/create', function(req, res){
  res.render('account_create.jade', { title: 'Create Account' });
});

app.post('/app/account/create', function(req, res) {
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

  userModel.createAccount( data, function (error, userId) {
    if ( err === null ) console.error('error: %s',JSON.stringify(results));
    res.redirect("/login");
  });

});

app.post('/api/account/create', function(req, res) {
  console.log(req.body);
  var data = req.body;

  userModel.createAccount( data, function (error, userId) {
    if ( error ) {
      console.log("error saving account: "+req.param('acct_name'));
      res.send({ error: "error saving account" });
    }
    else {
      console.log("succesfully saved account: %s user: %s",req.param('acct_name'),userId);
      res.send({user: userId});
    }
  });
});

// login
app.get('/app/login', function(req, res){
  res.render('login.jade', { title: 'Login' });
});

app.post('/app/login', function(req, res){
  var data = {
      email: req.param('email')
    , passwd: req.param('passwd')
  };
  console.info("logging into: %s",JSON.stringify(data));

  userModel.login(data, function (error, userId) {
    var userId = null;
    if ( err === null ) {
      console.info('results: %s',userId);
    }
    res.send("logged in: %s",userId);
  });
});

app.post('/api/login', function(req, res) {
  console.info(req.body);
  var data = req.body;

  userModel.login(data, function (error, userId) {
    if ( error ) {
      console.log("error logging in");
      res.send({error: "error logging in!"});
    }
    else {
      console.log("successfully logged in! user: "+userId);
      res.send({ userId: userId });
    }
  });
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
