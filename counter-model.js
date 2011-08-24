var mongoose = require("mongoose");
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var myCounter = new Schema({
    name: String
  , type: { type: String }
  , subtype: String
  , value: Number
  , created_at: { type: Date, default: Date.now }
});

var Counter = mongoose.model('Counter',myCounter);

CounterModel = function(host, port) {
  mongoose.connect('mongodb://'+host+':'+port+'/marketing');
};

CounterModel.prototype.save = function(doc) {
  var ctr = new Counter();
  ctr.name = doc.name;
  ctr.type = doc.type;
  ctr.subtype = doc.subtype;
  console.log("trying to save doc: "+JSON.stringify(doc));
  ctr.save(function (error) { 
    if ( error ) console.log("unable to save counter:"+JSON.stringify(doc));  
    else console.log("saved counter:"+JSON.stringify(ctr));
  });
};

CounterModel.prototype.aggregate = function(type) {
  var mapCounter = function() {
    // daily aggregation
    emit(this.type+"_"+this.created_at, 1);
    // monthly aggregation
    emit(this.type+"_"+this.created_at, 1);
    // quarterly aggregation
    emit(this.type+"_"+this.created_at, 1);
  };

  var reduceCounter = function (key, values) {
    var sum = 0;
    for (var i=0;i<values.length;i++) sum += values[i];
    return sum;
  };

  var command = {
      mapreduce: "counters"
    , query: {}
    , map: mapCounter.toString()
    , reduce: reduceCounter.toString()
    , out: "counters_aggregate"
  };
  mongoose.connection.db.executeDbCommand(command, function (err, db_res) {
  });
};

exports.CounterModel = CounterModel;
