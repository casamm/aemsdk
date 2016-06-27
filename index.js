module.exports = require('./lib/aem');


//http://marianna.im/tech/capture-nodejs-traffic-with-charles/

/*

Collection publish

1. Can we read status of Collection publication, inProgress etc. before I issue a publish call, there's a use case since multiple end users may be updating a single collection

 423 Locked
 { code: 'PublicationLockedException',
 message: 'Publication has already been locked by another request. Please retry later.' }

2. In the similar way how can we know if a collection is in published or unpublished state.

3. Workflow type, Noticed types as publish, layout, can you please elaborate on layout and other types

 */

/*
    Session Id, philosophy etc.

    Image Thumbnail and Sealing UploadId 
 */