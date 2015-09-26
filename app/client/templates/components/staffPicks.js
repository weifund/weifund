var updateStaffPicks;

Template['components_staffPicks'].rendered = function(){
    TemplateVar.set('state', {isUndeployed: true});
    TemplateVar.set('numPicks', 0);
    
    var template = this,
        updateStaffPicks = function(){
            TemplateVar.set(template, 'address', LocalStore.get('staffpicksAddress'));
            
            var batch = web3.createBatch();
            
            batch.add(staffpicksInstance.numPicks.call(function(err, result){
                TemplateVar.set(template, 'numPicks', result.toNumber(10));

                Picks.import(0, result.toNumber(10), function(err, result){   
                });
            }));

            batch.add(staffpicksInstance.owner.call(function(err, result){
                TemplateVar.set(template, 'ownerAddress', result);
            }));
            
            batch.execute();
        };
    
    updateStaffPicks();
};

Template['components_staffPicks'].events({  
    'click .btn-deploy': function(event, template){
        var transactionObject = {
               data: StaffPicks.code,
               gas: 3000000,
               from: LocalStore.get('selectedAccount')
            };
        
        StaffPicks.Contract.new(transactionObject, function(err, result){
            if(err)   
                return TemplateVar.set(template, 'state', {
                    isError: true, 
                    error: err
                });
            
            if(!err) {
                if(!result.address) {
                    TemplateVar.set(template, 'state', {isMining: true});
                } else {
                    TemplateVar.set(template, 'state', {
                        isMined: true, 
                        address: result.address
                    });
                    staffpicksInstance = StaffPicks.Contract.at(result.address);
                    LocalStore.set('staffpicksAddress', result.address);
                    TemplateVar.set(template, 'address', result.address);
                }
            }
        });
    },
    
    'click .btn-refresh-picks': function(event, template){
        Picks.remove({});
        
        staffpicksInstance.numPicks.call(function(err, result){
            TemplateVar.set(template, 'numPicks', result.toNumber(10));

            Picks.import(0, result.toNumber(10), function(err, result){   
            });
        });
    },
    
    'click .btn-pick': function(event, template){
        var campaignId = parseInt($('#pick').val()),
            categoryId = parseInt($('#category').val()),
            transactionObject = {
               gas: 3000000,
               from: LocalStore.get('selectedAccount')
            },
            filterObject = {
                _cid: campaignId,
                _category: categoryId
            },
            transactionCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isError: true, 
                        error: err
                    });
                
                if(!err)
                    TemplateVar.set(template, 'state', {isMining: true});
            },
            eventCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isError: true, 
                        error: err
                    });

                
                TemplateVar.set(template, 'state', {
                    isPicked: true
                });
                
                var pickId = result.args._id.toNumber(10);
                
                Picks.import(pickId, pickId + 1, function(err, result){
                    if(err)
                        return TemplateVar.set(template, 'state', {
                            isError: true, 
                            error: err
                        });
                })
            };
        
        staffpicksInstance.addPick.sendTransaction(campaignId, categoryId, transactionObject, transactionCallback);
        staffpicksInstance.onPick(filterObject, eventCallback);
    },
});

Template['components_staffPicks'].helpers({    
    'picks': function(){
        return Picks.find({});  
    },
    
    'isPicks': function(){
        return Picks.find({}).fetch().length > 0;  
    },
    
    'picksCount': function(){
        return Picks.find({}).fetch().length;  
    },
});