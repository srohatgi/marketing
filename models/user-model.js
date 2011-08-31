var mongoose = require("mongoose")
  , crypto = require("crypto")
  , util = require("util");

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var IdentityDataSchema = new Schema({
    identity: String
  , passwd: String
  , owa_url: String
});

var AccountSchema = new Schema({
    name: String
  , description: String
  , allowed_identities: [String]
  , super_users: [ObjectId]
  , created_by: String
  , created_at: {type: Date, default: Date.now }
  , updated_by: String
  , updated_at: { type: Date, default: Date.now }
});

var UserSchema = new Schema({
    name: String
  , accountId: ObjectId
  , login: { type: String, unique: true }
  , email: [String]
  , identities: [IdentityDataSchema]
  , created_by: String
  , created_at: {type: Date, default: Date.now }
  , updated_by: String
  , updated_at: { type: Date, default: Date.now }
});

var User, Account;

UserModel = function(host, port) {
  var db = mongoose.createConnection('mongodb://'+host+':'+port+'/user');
  User = db.model('User',UserSchema);
  Account = db.model('Account',AccountSchema);
  console.info("connected to mongodb://%s:%d/user",host,port);
};

UserModel.prototype.login = function(doc, callback) {
  console.log("login buffer in: "+JSON.stringify(doc));
  User.findOne({email: doc.email}, function (error, rec) {
    console.log("user rec: %s",util.inspect(rec));
    if ( error || rec == null ) callback(error?error:new Error("NO USER FOUND"));
    else {
      if ( rec.identities[0].identity == 'plain' ) {
        var shasum = crypto.createHash('sha1');
        shasum.update(doc.passwd);
        console.log("checking password against sha1");
        if ( rec.identities[0].passwd != shasum.digest('hex') )  callback(new Error("PASSWORD DOES NOT MATCH"));
        else callback(null,rec._id);
        return;
      }
      else if ( rec.identities[0].identity == 'owa' ) {
        // TODO: do owa login here
        callback(new Error("OWA NOT SUPPORTED"));
        return;
      }
      else return;
    }
  });
}

UserModel.prototype.createAccount = function(doc, callback) {
  var account = new Account();
  account.name = doc.acct_name;
  account.description = doc.acct_description;
  account.allowed_identities = [doc.identity];

  account.save(function (error) {
    if ( error ) {
      console.log("unable to save account:"+JSON.stringify(doc));  
      callback(error);
    }
    else {
      console.log("saved account:"+JSON.stringify(account));
      doc.accountId = account._id;
      my_user_save(doc,callback);
    }
  });
};

UserModel.prototype.save = my_user_save;

var my_user_save = function(doc, callback) {
  var user = new User();
  user.name = doc.name;
  user.accountId = doc.accountId;
  user.email = [doc.email];
  console.log("trying to save user: "+JSON.stringify(doc));
  if ( doc.identity == 'plain' ) {
    var shasum = crypto.createHash('sha1');
    shasum.update(doc.passwd);
    user.identities = [{identity: doc.identity, passwd: shasum.digest('hex')}];
  }
  else if ( doc.identity == 'owa' ) {
    user.owa_url = doc.owa_url;
    user.identities = [{identity: doc.identity, owa_url: doc.owa_url}];
  }
  user.save(function (error) {
    if ( error ) {
      console.log("unable to save user:"+JSON.stringify(doc));  
      callback(error);
    }
    else {
      console.log("saved user:"+JSON.stringify(user));
      callback(null,this._id);
    }
  });
};

exports.UserModel = UserModel;