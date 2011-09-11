#!/bin/bash

server=http://localhost:3000
[[ $# -gt 0 ]] && [[ ${1:=not_set} != 'not_set' ]] && server=$1

echo ----------------CREATING ACCOUNT
curl -H 'Content-Type: application/json' -d '{ "acct_name": "acme, inc.", "acct_description": "fictional" , "identity": "plain" , "name": "Sumeet Rohatgi" , "email": "sumeet.rohatgi@acme.com" , "passwd": "test12" }' $server/api/account/create
echo
echo ----------------LOGGING IN
## wierd mumbo jumbo so as to get the session id
## 1. make sure that curl output goes to stderr
## 2. then print and capture the sessionId in a shell variable
sessionId=$(curl -s -H 'Content-Type: application/json' -d '{ "email": "sumeet.rohatgi@acme.com", "password": "test12"}' $server/api/login | awk -F: '{ print $0 > "/dev/stderr"; gsub("\}","",$4); gsub("\"","",$4); print $4; }')
echo
echo ----------------CREATING CUSTOMERS
## 2nd round of wierd mumbo jumbo so as to get the customer id
customerId1=$(curl -s -H 'Content-Type: application/json' -d '{ "customer_name": "Disney, Inc", "address_loc": [50.0, 34.0], "owner": "Sumeet Rohatgi" }' $server/api/deal/createCustomer?sessionId=$sessionId|awk -F: '{ print $0 > "/dev/stderr"; gsub("\}","",$2); gsub("\"","",$2); print $2; }')
customerId1=$(echo \"$customerId1\")
customerId2=$(curl -s -H 'Content-Type: application/json' -d '{ "customer_name": "Kohls, Inc", "address_loc": [50.1, 34.1], "owner": "Nidhee Rohatgi" }' $server/api/deal/createCustomer?sessionId=$sessionId|awk -F: '{ print $0 > "/dev/stderr"; gsub("\}","",$2); gsub("\"","",$2); print $2; }')
customerId2=$(echo \"$customerId2\")
echo
echo ----------------CREATING DEALS
curl -H 'Content-Type: application/json' -d '{ "customer_id": '$customerId1', "name": "half off", "deal_type": "autumn" , "start_date": "03/11/2012" , "end_date": "04/11/2012" , "coupon_id": "JHLRD2993" , "price": "10.99", "percent_off": ".50" }' $server/api/deal/add?sessionId=$sessionId
echo
#echo
#echo ----------------LIST COUNTERS
#curl -H 'Content-Type: application/json" $server/api/affiliate/list?sessionId=$sessionId
#echo
