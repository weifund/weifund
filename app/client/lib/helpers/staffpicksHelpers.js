/**
The StaffPicks object.

Authors:
 - Nick Dodson <thenickdodson@gmail.com>
**/

StaffPicks = {};

/**
Build the Picks database object.

@method (Picks)
@param {mongodb} Object     The mongodb object
**/

StaffPicks.Picks = function(mongodb){
    mongodb.import = function(from, to, callObject, callback){
        staffpicksInstance = StaffPicks.Contract.at(LocalStore.get('staffpicksAddress'));
        
        if(_.isUndefined(to))
            to = from + 1;
        
        if(_.isFunction(callObject)) {
            callback = callObject;
            callObject = {};
        }
        
        if(_.isUndefined(callObject))
            callObject = {};
        
        if(_.isUndefined(callback))
            callback = function(e, r){};
        
        var addToBatch = function(batch, id){
            batch.add(staffpicksInstance.picks.call(id, callObject, function(err, result){
                if(!err) {
                    var pick = web3.returnObject('picks', result, StaffPicks.abi);
                    pick.id = id;
                    
                    if(pick.created != 0) //is valid
                        mongodb.upsert({id: id}, pick);
                    
                    callback(err, pick);
                }
            }));
        };
        
        var batch = web3.createBatch();
        for(var id = from; id < to; id ++){
            addToBatch(batch, id);
        }
        batch.execute();
    };
};