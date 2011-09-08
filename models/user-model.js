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
  , account_id: ObjectId
  , login: { type: String } // do not use indexes for now; 
  , email: [String]
  , identities: [IdentityDataSchema]
  , created_by: String
  , created_at: {type: Date, default: Date.now }
  , updated_by: String
  , updated_at: { type: Date, default: Date.now }
});

var SessionSchema = new Schema({
    account_id: ObjectId
  , created_by: ObjectId
  , created_at: {type: Date, default: Date.now }
  , updated_by: ObjectId
  , updated_at: { type: Date, default: Date.now }
});

UserSvc = function(url) {
  var db = mongoose.createConnection(url);
  var User = db.model('User',UserSchema);
  var Account = db.model('Account',AccountSchema);
  var Session = db.model('Session',SessionSchema);
  console.log("connected to mongodb://%s:%s@%s:%d/%s",db.user,db.pass,db.host,db.port,db.name);

  // TODO add salt; prevent rainbow attacks
  function createSha(input) {
    console.log("string to be converted to sha: %s",input);
    var shasum = crypto.createHash('sha1');
    shasum.update(input);
    return ({ input: input, sha: shasum.digest('hex'), salt: null});
  }

  return {

    validateSession: function (sessionId, callback) {
      Session.findById(sessionId, function (error, session_rec) {
        if ( error || session_rec == null ) { 
          console.log("unable to validate sessionId: %s",sessionId); 
          callback(error?error:new Error("INVALID SESSION ID")); 
          return; 
        }
        callback(null, session_rec.account_id);
      });
    }
  
    , login: function(doc, callback) {
      console.log("login buffer in: "+JSON.stringify(doc));
      User.findOne({login: doc.email}, function (error, rec) {
        console.log("user rec: %s",util.inspect(rec));
        if ( error || rec == null ) callback(error?error:new Error("NO USER FOUND"));
        else {
          if ( rec.identities[0].identity == 'plain' ) {
            console.log("checking password against sha1");
            if ( rec.identities[0].passwd != createSha(doc.password).sha )  callback(new Error("PASSWORD DOES NOT MATCH"));
            else {
              var s = new Session();
              s.account_id = rec.account_id;
              s.created_by = rec._id;
              s.updated_by = rec._id;
              s.save(function (err) {
                if ( err ) { console.log("unable to generate a session id for user:%s(%s)",doc.email,rec._id); callback(err); return; }
                callback(null,{ userId: rec._id, accountId: rec.account_id, sessionId: s._id});
              });
            }
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
  
    , userSave: function(doc, callback) {
      var user = new User();
      user.name = doc.name;
      user.account_id = doc.account_id;
      user.email = [doc.email];
      user.login = doc.email;
      //console.log("trying to save user: "+JSON.stringify(doc));
      if ( doc.identity == 'plain' ) {
        user.identities = [{identity: doc.identity, passwd: createSha(doc.passwd).sha}];
      }
      else if ( doc.identity == 'owa' ) {
        user.owa_url = doc.owa_url;
        user.identities = [{identity: doc.identity, owa_url: doc.owa_url}];
      }
      user.save(function (error) {
        if ( error ) {
          console.log("unable to save user: %s error:%s",JSON.stringify(doc),error);  
          callback(error);
        }
        else {
          console.log("saved user:"+JSON.stringify(user));
          callback(null,user._id);
        }
      });
    }

    , createAccount: function(doc, callback) {
      var account = new Account();
      var that = this;
      account.name = doc.acct_name;
      account.description = doc.acct_description;
      account.allowed_identities = [doc.identity];
    
      account.save(function (error) {
        if ( error ) {
          console.log("unable to save account: %s error: %s",JSON.stringify(doc),error);  
          callback(error);
        }
        else {
          console.log("saved account:"+JSON.stringify(account));
          doc.account_id = account._id;
          that.userSave(doc,callback);
        }
      });
    }
  
  } // end of return
}; // end of UserSvc

exports.UserSvc = UserSvc;
