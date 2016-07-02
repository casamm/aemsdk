module.exports = require('./lib/aem');


//http://marianna.im/tech/capture-nodejs-traffic-with-charles/

/*

/*
    Session Id, philosophy etc.

    Image Thumbnail and Sealing UploadId

    create()
    .uploadImage() //generate uploadId
    .update()
    .seal()
 */

/*
Notes:
update changes version
seal changes version and contentVersion (contentUrl)

Get thumbnail
A)
 https://pecs.publish.adobe.io/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/collection/demo/contents;contentVersion=1467069032220/images/thumbnail?size=320
 &api_key=Pb-int-Unity-CD
 &user_token=eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LTEuY2VyIn0.eyJpZCI6IjE0NjcwNjgyMDk1MjctMjc5ZDEzN2YtNjk4OC00NWU4LWIzNmEtZjliMzdhOGZmMmRmIiwibW9pIjoiN2U2YWU2NWQiLCJzY29wZSI6IkFkb2JlSUQscGVyc29uLG9wZW5pZCx1cGRhdGVfcHJvZmlsZS5lbWFpbCx1cGRhdGVfcHJvZmlsZS5wcmVmZXJyZWRfbGFuZ3VhZ2VzLHVwZGF0ZV9wcm9maWxlLmZpcnN0X25hbWUsdXBkYXRlX3Byb2ZpbGUubGFzdF9uYW1lLHNhby5kaWdpdGFsX3B1Ymxpc2hpbmciLCJmZyI6IlFSTFNBN0w2QU1BQUFBQUFBQUFBQUFFTEFBPT09PT09IiwiYyI6IlRFRldrVW1MZG9ESkpUOTBMdFZSZUE9PSIsImFzIjoiaW1zLW5hMSIsImNyZWF0ZWRfYXQiOiIxNDY3MDY4MjA5NTI4IiwiZXhwaXJlc19pbiI6Ijg2NDAwMDAwIiwidXNlcl9pZCI6IjdGM0Q3QzNFNEZDMDAwNTUwQTQ5MEQ0REBBZG9iZUlEIiwiY2xpZW50X2lkIjoiRFBTUG9ydGFsMSIsInR5cGUiOiJhY2Nlc3NfdG9rZW4ifQ.JHdTfznG26LjKE2gwPMQRFrIeQB32M5EK4-5xOmE5DKCsB0Ne3HHgqA6EnGm8fRYMuZGA7bLLZgW-cA4jXEVHv8uW4u-NOTRXROJOIfaoP0ySq5Wi09_LBjRiILDaLerg-xEyA9TW_K2DAMQr6TWbY8HXMQbpO7d9f0levcbVy6Znmopp0HJhctLBokOjN2y5VINxMKPqmUGqlaWgrXhqCPrGDMUUta7u0K5_8jcts9JAlEnGny25cfTObX8LxYHjkVkkpd15NeSyfWFOAt_6LIL0DTveiGeSVT_mtFYUoZUdx061o2f2tTCt8wVIzsP7mqjsodK15RuQzl0ECnMMw

B)
 https://pecs.publish.adobe.io/publication/your_publication_id/collection/your_collection_name/contents;contentVersion=1444213502535/images/thumbnail

 X-DPS-Client-Id:dps-ext-xxx-xxxx
 X-DPS-Client-Request-Id:0db72409-c709-4946-82ab-a2b80619752b
 X-DPS-Client-Session-Id:9fa3c6cd-773d-4e7a-9d03-92106ce907a9
 X-DPS-Api-Key:dps-ext-xxx-xxxx
 Authorization:bearer eyJhbGciOiJSUzI1………..

nodejs
 var request = require('request');
 fs      = require('fs');

 var destination = fs.createWriteStream('/path/to/a/thumbnail.jpg');
 request({
 url:'https://pecs.publish.adobe.io/publication/use_yours/collection/use-yours/contents;contentVersion=1444213502535/images/thumbnail',
 headers: {
 'Authorization': 'bearer eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LTEuY…………….',
 'X-DPS-Api-Key' : 'dps-ext-xxx-xxxx',
 'X-DPS-Client-Request-Id':'89dc9b20-86f3-472b-b4b5-a4558c6ec6e2',
 'X-DPS-Client-Session-Id':'27975b35-73be-405a-b47f-12b32005d78b'
 }
 })
 .pipe(destination)
 .on('error', function(error){
 console.log(error);
 });

 */


