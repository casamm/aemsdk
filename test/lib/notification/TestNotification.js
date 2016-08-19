var assert = require('assert');
var AEMM = require('../../../lib/aemm');
var notification = new AEMM.Notification();
var tenantId = '192a7f47-84c1-445e-a615-ff82d92e2eaa';

before(function(done){
    AEMM.authentication.requestToken()
        .then(function(){done()})
        .catch(console.error);
});

it('should be instantiated', function () {
    assert.ok(notification, 'constructor test');
});

it('should requestList', function(done){
    // historyFromDate=1471553586000&historySize=40&historyToDate=1472849586000
    var data = {schema: {tenantId: tenantId}};
    notification.requestList(data)
        .then(function(result){
            done();
        }).catch(console.error);
});

it('should delete', function(done){
    var data = {schema: {tenantId: tenantId}};
    notification.requestList(data)
        .then(function(result){
            Promise.all(result.map(function(item){
                return notification.delete({schema: item});
            })).then(function(result){
                done();
            }).catch(console.error);
        })
});

// it('should post', function(done){
//     var data = {
//         schema: {push: {message: 'hello world'}, tenantId: tenantId}
//     };
//     notification.create(data)
//         .then(function(result){
//             console.log(result);
//             done();
//         }).catch(console.error);
// });

it('should check health', function(done){
    var data = {schema: {tenantId: tenantId}};
    notification.healthCheck(data)
        .then(function(result){
            done();
        }).catch(console.error);
});

it('should count device', function(done){
    var data = {schema: {os: 'ios', appId: 'com.mirumagency.aemmsdk', query: '?iOSIsProduction=true', tenantId: tenantId}};
    notification.deviceCount(data)
        .then(function(result){
            console.log(result);
            done();
        }).catch(console.error);
});