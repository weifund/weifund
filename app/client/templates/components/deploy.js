/**
Template Controller

@module Templates
*/

/**
The template to allow easy WeiFund contract deployment.

@class [template] components_deploy
@constructor
*/

Template['components_deploy'].created = function(){
    TemplateVar.set('state', {isUndeployed: true});
};

Template['components_deploy'].events({
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #weifundDeploy)
    **/

    'click #weifundDeploy': function(event, template){
        var transactionObject = {
               data: WeiFund.code,
               gas: 3000000,
               from: LocalStore.get('selectedAccount')
            };
        
        WeiFund.Contract.new(transactionObject, function(err, result){
            if(err)   
                return TemplateVar.set(template, 'state', {isError: true, error: err});
            
            if(!err) {
                if(!result.address) {
                    TemplateVar.set(template, 'state', {isMining: true});
                } else {
                    TemplateVar.set(template, 'state', {isMined: true, address: result.address});
                    weifundInstance = WeiFund.Contract.at( result.address);
                    LocalStore.set('weifundAddress', result.address);
                }
            }
        });
    },
});