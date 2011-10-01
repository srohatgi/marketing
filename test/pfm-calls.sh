#!/bin/bash
login='nojs1@yopmail.com'
plain_passwd=test123
passwd='hbrMgTCGw0uwr-27wyJhKT2cfqWXQGwo02rcGcbFCmVGemvEMLBLwJ4E7YuN4hRoRXYJ4maCS64v5daGRJsFzA~@'
hdr='Content-Type: application/soap+xml;charset=UTF-8'

echo -------------- ENCRYPT PASSWORD
curl -H "$hdr" -d '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:su2="http://su2"> <s:Header/> <s:Body> <su2:encodeData> <value>'$plain_passwd'</value> </su2:encodeData> </s:Body> </s:Envelope>' http://172.21.4.158:8090/rbl/YsiEncryption
echo
echo -------------- LOGIN
curl -H "$hdr" -d '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:su2="http://su2"> <s:Header/> <s:Body> <su2:login> <userCredentialDTO> <emailAddress>'$login'</emailAddress> <password>'$passwd'</password> <userAgent>web</userAgent> </userCredentialDTO> </su2:login> </s:Body> </s:Envelope>' http://172.21.4.157:8080/user/User
echo
echo -------------- WORKSPACE ROOT FOLDERS
ownerId=420741697
ownerType=1
payload=$(cat<<END_PAYLOAD
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:su2="http://su2"> <s:Header/> <s:Body> <su2:getWorkSpace> <workSpaceQueryDTO> <ownerId>$ownerId</ownerId> <ownerType>$ownerType</ownerType> </workSpaceQueryDTO> </su2:getWorkSpace> </s:Body> </s:Envelope>
END_PAYLOAD)
curl -H "$hdr" -d "$payload" http://sjcsqbwrk01.eng.yousendit.com:8060/workspace/Workspace
echo
echo -------------- FOLDER 2 DETAILS
payload=$(cat<<END_PAYLOAD
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:su2="http://su2"> <s:Header/> <s:Body> <su2:getFolderDetails> <wsFolderDTO> <encryptedId>kUM1AOR_COF3ulHDKEGYcOSLaCHz9otsrMKfWMqz26Y</encryptedId> <ownerId>$ownerId</ownerId> <ownerType>1</ownerType> </wsFolderDTO> </su2:getFolderDetails> </s:Body> </s:Envelope>
END_PAYLOAD)
curl -H "$hdr" -d "$payload" http://sjcsqbwrk01.eng.yousendit.com:8060/workspace/Workspace
echo
