
/**
 * Module dependencies.
 */

var express = require('express');
var AffiliateNotifier = require('./affiliate-model.js').AffiliateNotifier;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
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

// MONGO DB SERVER, PORT
var affiliateNotifier = new AffiliateNotifier('localhost', 27017);

// Routes

app.get('/', function(req, res){
  affiliateNotifier.findAll(function(error, affiliates){
    //console.log(affiliates);
    res.render('index.jade', {locals: {title: 'Affiliate Notifier Manager', affiliates: affiliates}});
  });
});

app.get('/affiliate/new', function(req, res) {
  res.render('affiliate_new.jade', { locals: { title: 'Add Affiliate' } });
});

app.post('/affiliate/new', function(req, res){
  affiliateNotifier.save({
    name: req.param('name'),
    description: req.param('description'),
    website: req.param('website'),
    created_by: req.param('created_by'),
    updated_by: req.param('created_by'),
  }, function( error ) {
    if ( error ) console.log("error saving affiliate");
    res.redirect('/')
  });
});

app.get('/affiliate/:id', function(req, res) {
  affiliateNotifier.findById(req.params.id, function(error, affiliate) {
    if ( error ) console.log("error finding affiliate: "+req.params.id+"!!");
    else res.render('affiliate_show.jade', { 
      locals: {
        title: "Edit Affiliate",
        affiliate: affiliate
      }
    });
  });
});

app.post('/affiliate/addApi', function(req, res) {
  affiliateNotifier.addApi(req.param('_id'), {
    url: req.param('url'),
    webpage: req.param('webpage'),
    created_by: req.param('user'),
    updated_by: req.param('user')
  } , function( error ) {
    if ( error ) console.log("unable to save api: "+req.param('url'));
    res.redirect('/affiliate/' + req.param('_id'))
  });
});

app.get('/webpage_affiliate/:id', function(req, res) {
  affiliateNotifier.getAffiliateApi(req.params.id, function(error, urls) {
    if ( error ) console.log("unable to fetch any affiliates for webpage: "+req.params.id);
    res.send(urls);
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
