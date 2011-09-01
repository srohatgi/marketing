Marketing
=========

Affiliate, User/ Account management application

Install
-------
*  Download and install `node.js`, `npm`, `express`
*  Download and install `mongo db`
*  Download source code to a local directory, example: `~/github/marketing`
*  install dependencies: `$ cd ~/github/marketing; npm install -d`
*  set environment variable for DB connection string: `export MONGOHQ_URL=mongodb://localhost:27017`

Running
-------
*  `$ cd ~/github/marketing; node app.js`

NOTE: the node.js server is configured to listen on localhost:3000. It also assumes a mongodb running on localhost:27017. Both these settings can be changed in `app.js`
