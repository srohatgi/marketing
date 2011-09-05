
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
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.cookieParser());
  app.use(express.session({ secret: "keyboard cat" }));
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

var affiliateModel = new AffiliateModel(process.env.MONGOHQ_URL)
  , counterModel = new CounterModel(process.env.MONGOHQ_URL)
  , userModel = new UserModel(process.env.MONGOHQ_URL);

// Routes
// Enforce Session To Be populated with userId at all times
app.all('/app/*', function (req, res, next) {
  if ( ( !req.session.userId || !req.session.accountId ) && req.params != 'login' && req.params != 'account/create' ) res.redirect('/app/login');
  else next();
});

/*****************************************************************************
 * AFFILIATES manager app & relevant api                                     *
 *****************************************************************************/
// main 'app' page
app.get('/app/affiliate/list', function(req, res){
  console.log("trying to find all affiliates for accountId: %s",req.session.accountId);
  affiliateModel.findAll(req.session.accountId, function(err, affiliates){
    if ( err ) {
      res.send("error calling /affiliate/all: "+err);
      return;
    }
    res.render('index.jade', {locals: {title: 'Affiliate Manager', affiliates: affiliates}});
  });
});

app.get('/app/affiliate/:id', function(req, res) {
  console.info("details of affiliate: %s",req.params.id);

  if ( req.params.id == 'create' ) {
    res.render('affiliate_new.jade', { locals: { title: 'Add Affiliate' } });
    return;
  }

  affiliateModel.findById({ affiliate_id: req.params.id, account_id: req.session.accountId} , function(err, affiliate){
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
app.get('/api/affiliate/:id', function(req, res, next) {
  userModel.validateSession(req.param('sessionId'),function (err, accountId) {
    if ( err ) {
      console.log("error validating session: %s error: %s", req.param('sessionId'),err);
      res.send({error: "invalid session"});
      return;
    } 
    if ( req.params.id == 'create' ) { 
      next(); 
    }
    else if ( req.params.id == 'list' ) {
      console.info("trying to find affiliate: %s",req.params.id);
      affiliateModel.findAll(accountId,function(error, affiliates){
        if ( error ) {
          console.error("error getting affiliates");
          res.send({error: "error getting affiliates"});
        }
        res.send(affiliates);
      });
    } else {
      affiliateModel.findById({ affiliate_id: req.params.id, account_id: accountId }, function(error, affiliates) {
        if ( error ) {
          console.error("error finding affiliate: %s!!",req.params.id);
          res.send({ error: "error finding affiliate"});
        }
        res.send(affiliates);
      });
    }
  });
});

// read from form, and update the data record
app.post('/app/affiliate/create', function(req, res){
  var data = {
      name: req.param('name')
    , account_id: req.session.accountId
    , website: req.param('website')
    , created_by: req.param('created_by')
    , description: req.param('description')
  };
  console.info("creating new affiliate: %s",JSON.stringify(data));

  affiliateModel.save( data, function( err ) {
    if ( err ) {
      var msg = 'failed creating affiliate: '+err+'';
      console.log(msg);
      res.send(msg);
      return;
    }
    res.redirect('/app/affiliate/list'); // goto main app page; which shows affiliate list
  });
});

app.post('/api/affiliate/create', function(req, res){
  userModel.validateSession(req.param('sessionId'),function (err, accountId) {
    if ( err ) {
      console.log("error validating session: %s error: %s", req.param('sessionId'),err);
      res.send({error: "invalid session"});
      return;
    }
    req.body.account_id = accountId;
    console.info("saving affiliate: %s",JSON.stringify(req.body));
    affiliateModel.save( req.body, function( error ) {
      if ( error ) {
        console.log("error saving affiliate");
        res.send({ error: "error saving affiliate"});
      }
      res.send({});
    });
  });
});

// add affiliate[API]
app.post('/app/affiliate/api/create', function(req, res) {
  var data = {
      _id: req.param('_id')
    , url: req.param('url')
    , account_id: req.session.accountId
    , webpage: req.param('webpage')
    , created_by: req.param('user')
    , updated_by: req.param('user')
  };

  affiliateModel.addApi(data._id, data, function (err) {
    if ( err ) console.log("unable to save api: "+req.param('url'));
    res.redirect('/app/affiliate/' + req.param('_id'));
  });
});

app.post('/api/affiliate/api/create', function(req, res) {
  userModel.validateSession(req.param('sessionId'),function (err, accountId) {
    if ( err ) {
      console.log("error validating session: %s error: %s", req.param('sessionId'),err);
      res.send({error: "invalid session"});
      return;
    }
    console.info(req.body);
    affiliateModel.addApi(req.body._id, {
        url: req.body.url
      , webpage: req.body.webpage
      , account_id: accountId
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
});

// lookup affiliates by webpage
app.get('/api/affiliate/webpage/:id', function(req, res) {
  userModel.validateSession(req.param('sessionId'),function (err, accountId) {
    if ( err ) {
      console.log("error validating session: %s error: %s", req.param('sessionId'),err);
      res.send({error: "invalid session"});
      return;
    }
    console.info(req.params.id);
    affiliateModel.getAffiliateApi({ webpage: req.params.id, account_id: accountId}, function(error, urls) {
      if ( error ) {
        console.log("unable to fetch any affiliates for webpage: "+req.params.id);
        urls = [];
      }
      else {
        if ( typeof(urls.length)=="undefined" ) urls = [urls];
        // fire and forget call for tracking
        for (var i=0;i<urls.length;i++) 
          counterModel.save({name: urls[i].url, type: urls[i].webpage, subtype: ""},null);
      }
      res.send(urls);
    });
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
    if ( error === null ) console.log('error: %s',error);
    res.redirect("/app/login");
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
app.get('/', function(req, res){
  res.render('login.jade', { title: 'Login' });
});

app.get('/app/login', function(req, res){
  res.render('login.jade', { title: 'Login' });
});

app.post('/app/login', function(req, res){
  var data = {
      email: req.param('email')
    , password: req.param('password')
  };
  console.info("logging into: %s",JSON.stringify(data));

  userModel.login(data, function (error, doc) {
    if ( error ) {
      res.send("unable to login user: "+req.param('email')+" error: "+error);
      return;
    }
    console.info('logged in user: %s account: %s session: %s',doc.userId,doc.accountId,doc.sessionId);
    req.session.userId = doc.userId;
    req.session.accountId = doc.accountId;
    req.session.sessionId = doc.sessionId;
    console.log("redirecting to /app/affiliate/list");
    res.redirect('/app/affiliate/list');
  });
});

app.post('/api/login', function(req, res) {
  console.info(req.body);
  var data = req.body;

  userModel.login(data, function (error, doc) {
    if ( error ) {
      console.log("error logging in error: %s",error);
      res.send({error: "error logging in: "+error+"!"});
    }
    else {
      console.log("successfully logged in! user: %s account: %s",doc.userId,doc.accountId);
      res.send({ userId: doc.userId, accountId: doc.accountId, sessionId: doc.sessionId });
    }
  });
});


app.listen(process.env.PORT);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
