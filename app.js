
/**
 * Module dependencies.
 */

var express = require('express');
var AffiliateNotifier = require('./affiliate-notifier.js').AffiliateNotifier;

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
    created_by: req.param('created_by'),
    created_at: new Date()
  }, function( error, docs) {
    res.redirect('/')
  });
});

app.get('/affiliate/:id', function(req, res) {
  affiliateNotifier.findById(req.params.id, function(error, affiliate) {
    res.render('affiliate_show.jade', { locals: {
      title: "Edit Affiliate",
      affiliate: affiliate
      }
    });
  });
});

app.post('/affiliate/addToPage', function(req, res) {
  affiliateNotifier.addToPage(req.param('_id'), {
    page: req.param('page'),
    created_by: req.param('created_by'),
    created_at: new Date()
  } , function( error, docs) {
    res.redirect('/affiliate/' + req.param('_id'))
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
