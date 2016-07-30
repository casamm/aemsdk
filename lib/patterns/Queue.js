module.exports = function(strategy) {
    var list = [];
    var inProgress = false;

    return {
        enqueue: function(body) {
            return new Promise(function(resolve, reject){
                list.push({body: body, resolve: resolve, reject: reject});
                if(!inProgress) {
                    inProgress = true;
                    var job = {
                        entities: [{href: '/publication/' + body.schema.publicationId + '/' + body.schema.entityType + '/' + body.schema.entityName + ';version=' + body.schema.version}],
                        schema: body.schema, bodies: [body], resolves: [resolve], rejects: [reject]
                    };
                    execute(job);
                }
            });
        }
    };

    function execute(body) {
        strategy.call(null, body)
            .then(dequeue);
    }

    function dequeue(datum) {
        console.log('published:', datum.bodies.length, 'remaining:', list.length - datum.bodies.length);
        for(var i=0; i<datum.bodies.length; i++) {
            list.shift();
            datum.resolves[i](datum.bodies[i]);
        }

        if(list.length) {
            var job = {entities: [], bodies: [], resolves: [], rejects: []};
            list.forEach(function(item, index, array){
                job.entities.push({href: '/publication/' + item.body.schema.publicationId + '/' + item.body.schema.entityType + '/' + item.body.schema.entityName + ';version=' + item.body.schema.version});
                job.schema = {publicationId: item.body.schema.publicationId}; // workflow status check
                job.bodies.push(item.body);
                job.resolves.push(item.resolve);
                job.rejects.push(item.reject);

                if(index === array.length - 1) execute(job);
            });
        } else {
            inProgress = false;
        }
    }

};