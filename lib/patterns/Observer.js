var AEMM = require('../aemm');

function Observer() {}

Observer.prototype.addWorkflowObserver = function(body) {
    return new Promise(function(resolve, reject){
        spawn(new AEMM.Iterator(AEMM.Entity.prototype.requestWorkflow.bind(null, body)));
        function spawn(asyncIterator) {
            asyncIterator.next()
                .then(function(result){
                    result.workflowStatus.status === 'NOT_FOUND' ? resolve(body) : setTimeout(spawn.bind(null, asyncIterator), 2000); // RUNNING, COMPLETED, NOT_FOUND
                })
                .catch(reject);
        }
    });
};

Observer.prototype.addPublishObserver = function(body) {
    return new Promise(function(resolve, reject){
        spawn(new AEMM.Iterator(AEMM.Entity.prototype.publish.bind(null, body)));
        function spawn(iterator) {
            iterator.next()
                .then(AEMM.observer.addWorkflowObserver)
                .then(function(){resolve(body)})
                .catch(function(){ // if publication is not ready because of publishing activity within the dashboard
                    setTimeout(spawn.bind(null, iterator), 7000);
                });
        }
    });
};

Observer.prototype.addUnpublishObserver = function(body) {
    return new Promise(function(resolve, reject){
        spawn(new AEMM.Iterator(AEMM.Entity.prototype.unpublish.bind(null, body)));
        function spawn(asyncIterator) {
            asyncIterator.next()
                .then(AEMM.observer.addWorkflowObserver)
                .then(function(){resolve(body)})
                .catch(function(){ // if publication is not ready because of publishing activity within the dashboard
                    setTimeout(spawn.bind(null, asyncIterator), 7000);
                });
        }
    });
};

Observer.prototype.addStatusObserver = function(body) {
    return new Promise(function(resolve, reject){
        spawn(new AEMM.Iterator(AEMM.Entity.prototype.requestStatus.bind(null, body)));
        function spawn(asyncIterator) {
            asyncIterator.next()
                .then(function(result){
                    if(result.aspect == 'unpublishing') { // check publish aspect is not in the status list
                        var found = false;
                        result.status.forEach(function(status){if(status.aspect == 'publishing') found = true});
                        if(!found) {resolve(result)} // it's unpublished
                    } else if(result.aspect != null) {
                        result.status.forEach(function(status){
                            if(result.aspect == status.aspect) { // observable operation check
                                if(body.notify) body.notify.call(null, status);
                                switch(status.eventType) {
                                    case 'progress': setTimeout(spawn.bind(null, asyncIterator), 2000); break;
                                    case 'success': resolve(result); break;
                                    case 'failure': reject(result); break;
                                }
                            }
                        });
                    }
                })
                .catch(reject);
        }
    });
};

AEMM.Observer = Observer;