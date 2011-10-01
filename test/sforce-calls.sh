#!/bin/bash
SID='Authorization: OAuth 00DU0000000IcfV!AQgAQMs0jtgYVeUzJWKqmZowNO23w1EdFxcL7pdOVu4BLNJD9V8RItObMGw3fHivahmmDF.asnV.7NC8ZJPdNa9TBmPmHkpv'
curl -H "$SID" https://na12.salesforce.com/services/data/v22.0
echo
curl -L -H "$SID" https://login.salesforce.com/id/00DU0000000IcfVMAS/005U0000000YqsFIAS
echo
