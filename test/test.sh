#!/bin/bash

echo ----------------CREATING ACCOUNT
curl -H "Content-Type: application/json" -d '{ "acct_name": "acme, inc.", "acct_description": "fictional" , "identity": "plain" , "name": "Sumeet Rohatgi" , "email": "sumeet.rohatgi@acme.com" , "passwd": "test12" }' http://localhost:3000/api/account/create
echo
echo ----------------LOGGING IN
## wierd mumbo jumbo so as to get the session id
## 1. make sure that curl output goes to stderr
## 2. then print and capture the sessionId in a shell variable
sessionId=$(curl -s -H "Content-Type: application/json" -d '{ "email": "sumeet.rohatgi@acme.com", "password": "test12"}' http://localhost:3000/api/login | awk -F: '{ print $0 > "/dev/stderr"; gsub("\}","",$4); gsub("\"","",$4); print $4; }')
echo
echo ----------------CREATING AFFILIATE
curl -H "Content-Type: application/json" -d '{ "name": "Disney, Inc", "website": "www.disney.com", "created_by": "Sumeet Rohatgi" , "description": "the number 1 dest for kids" }' http://localhost:3000/api/affiliate/create?sessionId=$sessionId
echo
echo ----------------LISTING AFFILIATES
curl -H "Content-Type: application/json" http://localhost:3000/api/affiliate/list?sessionId=$sessionId
echo
echo ----------------ADD PIXELS
curl -H "Content-Type: application/json" http://localhost:3000/api/affiliate/list?sessionId=$sessionId
echo
echo ----------------SIMULATE WEB PAGE LOADS
curl -H "Content-Type: application/json" http://localhost:3000/api/affiliate/list?sessionId=$sessionId
echo
echo ----------------LIST COUNTERS
curl -H "Content-Type: application/json" http://localhost:3000/api/affiliate/list?sessionId=$sessionId
echo
