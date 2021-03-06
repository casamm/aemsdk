var AEMM = require('../aemm');

function Observer() {}

Observer.prototype.addWorkflowObserver = function(body) {
    return new Promise(function(resolve, reject){
        spawn(new AEMM.Iterator(AEMM.Entity.prototype.requestWorkflow.bind(null, body)));
        var delay = 1000;
        function spawn(iterator) {
            iterator.next()
                .then(function(result){
                    result.workflowStatus.status === 'NOT_FOUND' || result.workflowStatus.status === 'COMPLETED' ? // RUNNING, COMPLETED, NOT_FOUND
                        resolve(body) : setTimeout(spawn.bind(null, iterator), delay);
                })
                .catch(reject);
            delay += 50;
        }
    });
};

Observer.prototype.addStatusObserver = function(body) {
    return new Promise(function(resolve, reject){
        spawn(new AEMM.Iterator(AEMM.Entity.prototype.requestStatus.bind(null, body)));
        var delay = 1000;
        function spawn(iterator) {
            iterator.next()
                .then(function(result){
                    if(result.aspect == 'unpublishing') { // check publish aspect is not in the status list
                        var found = false;
                        result.status.forEach(function(status){if(status.aspect == 'publishing') found = true});
                        if(!found) resolve(result); // it's unpublished
                    } else if(result.aspect != null) {
                        result.status.forEach(function(status){
                            if(result.aspect == status.aspect) { // observable operation check
                                if(body.notify) body.notify.call(null, status);
                                switch(status.eventType) {
                                    case 'progress': setTimeout(spawn.bind(null, iterator), delay); break;
                                    case 'success': resolve(result); break;
                                    case 'failure': reject(status); break;
                                }
                            }
                        });
                    }
                })
                .catch(reject);
            delay += 50;
        }
    });
};

Observer.prototype.addTokenObserver = function() {
    return new Promise(function(resolve, reject){
        spawn(new AEMM.Iterator(AEMM.Authentication.prototype.requestToken.bind(null)));
        function spawn(iterator) {
            iterator.next()
                .then(function(result){
                    resolve(result);
                    setTimeout(spawn.bind(null, iterator), result.expires_in - 900000); // renew 15 minutes before expiry
                }).catch(reject);
        }
    });
};

AEMM.Observer = Observer;