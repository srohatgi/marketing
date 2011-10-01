#!/bin/bash
#curl -H 'Content-Type: application/json' -d '{ "loginName": "nojs1@yopmail.com", "password": "hbrMgTCGw0uwr-27wyJhKT2cfqWXQGwo02rcGcbFCmVGemvEMLBLwJ4E7YuN4hRoRXYJ4maCS64v5daGRJsFzA~@" }' http://localhost:3000/api/userpfm/login
sessionId=$(curl -s -H 'Content-Type: application/json' -d '{ "loginName": "nojs1@yopmail.com", "password": "test123" }' http://localhost:3000/api/userpfm/login | awk -F: '{ print $0 > "/dev/stderr"; gsub("\}","",$2); gsub("\"","",$2); print $2; }')
echo
curl --get --data-urlencode "sessionId=$sessionId" http://localhost:3000/api/workspace
echo
