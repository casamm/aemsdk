var AEMM = require('../aemm');

module.exports = function(strategy) { // strategy specifies publish or unpublish type of queue

    var list = [];
    var inProgress = false;

    return {
        enqueue: function(body) {
            return new Promise(function(resolve, reject){
                list.push({body: body, resolve: resolve, reject: reject}); // push to job queue with respective resolve/reject
                if(!inProgress) {
                    inProgress = true;
                    spawn(new AEMM.Iterator(execute.bind(null, getJob())));
                }
            });
        }
    };

    function spawn(iterator) {
        iterator.next() // start publishing jobs
            .then(function(){
                var job = getJob();
                if(job.entities.length) { // if new jobs came in the background while the last iteration was in progress
                    setTimeout(function(){ spawn(new AEMM.Iterator(execute.bind(null, job)))}, 100); // spawn with a new job iterator
                } else {
                    inProgress = false; // jobs finished
                }
            })
            .catch(function(error){ // PublicationLockedException, ResourceNotFoundException etc.
                switch(error.code) {
                    case "PublicationLockedException": // because of publishing activity within the dashboard, retry later
                        break;
                    case "BadRequestException": // if publication list is empty
                        var element = list.shift();
                        element.reject(error);
                        break;
                    case "ResourceNotFoundException": // 'Entity does not exist - Entity=/publication/{{publicationId}}/{{entityType}}/{{entityName}};version={{version}}'
                    case "ForbiddenException": // 'Collection entity=/publication/192a7f47-84c1-445e-a615-ff82d92e2eaa/collection/topLevelContent;version=1469211493935 could not be published. Make sure collections have a thumbnail and valid productId and a published layout.'
                        var matches = AEMM.matchUrl(error.message.split("=")[1]);
                        for(var i=0; i<list.length; i++) {
                            if(list[i].body.schema.entityName === matches[2]) {
                                var element = list.splice(i, 1)[0]; // remove the job
                                element.reject(error); // reject with error
                                break;
                            }
                        }
                        break;
                    default:
                        console.log('default', error.code);
                        break;
                }
                console.log(error.code, error.message);
                var job = getJob(); // newer jobs may have come in the background or got deleted (ResourceNotFoundException)
                if(job.entities.length) {
                    console.log('Waiting before retrying the job');
                    setTimeout(function(){spawn(new AEMM.Iterator(execute.bind(null, job)))}, 5000); // retry job
                } else {
                    inProgress = false; // jobs finished
                }
            });
    }

    function execute(job) {
        return strategy.call(null, job)
            .then(AEMM.observer.addWorkflowObserver)
            .then(dequeue);
    }

    function getJob() {
        var job = {entities: [], bodies: [], resolves: [], rejects: []};
        for(var i=0; i<list.length; i++) {
            job.entities.push({href: '/publication/' + list[i].body.schema.publicationId + '/' + list[i].body.schema.entityType + '/' + list[i].body.schema.entityName + ';version=' + list[i].body.schema.version});
            job.schema = {publicationId: list[i].body.schema.publicationId}; // for workflow status check. Entity.prototype.requestWorkflow
            job.bodies.push(list[i].body);
            job.resolves.push(list[i].resolve);
            job.rejects.push(list[i].reject);
        }
        return job;
    }

    function dequeue(result) {
        console.log('\nIteration Result: published:', result.bodies.length, 'next:', list.length - result.bodies.length);
        for(var i=0; i<result.bodies.length; i++) {
            list.shift();
            result.resolves[i](result.bodies[i]);
        }
    }

};
