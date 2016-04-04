/**
Template Controllers

@module Templates
**/

// Temporary template var
var template;

/**
When the campaign tracker template is initially rendered

@class [template] views_token
@method (rendered)
**/

Template['views_token'].rendered = function(){
	Meta.setSuffix(TAPi18n.__("dapp.views.tracker.title"));
    template = this;
    TemplateVar.set(template, 'state', {isUndeployed: true});
};


/**
These are the campaign tracker event handlers, that handle payotus, refund and contributions to WeiFund crowdfunding campaigns.

@class [template] views_token
@method (events)
**/

Template['views_token'].events({
    /**
    On Donate Click

    @event (click #donate)
    **/
	
	'click .btn-create-token': function(event, template){
        /*var initAmount = parseInt($('#initAmount').val()),
            weiRatio = parseInt($('#weiRatio').val()),
            transactionObject = {
               data: WeiCoin.code,
               gas: 3000000,
               from: LocalStore.get('selectedAccount')
            },
            weicoinInstance;
        
        WeiCoin.Contract.new(LocalStore.get('weifundAddress'), initAmount,
                             weiRatio, transactionObject, 
                             function(err, result){
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
                        transactionHash: result.transactionHash,
                        initAmount: initAmount,
                        weiRatio: weiRatio,
                        code: WeiCoin.code,
                        address: result.address
                    });
                    weicoinInstance = WeiCoin.Contract.at(result.address);
                }
            }
        });*/
    }
});


/**
These are the campaign tracker event handlers, that handle payotus, refund and contributions to WeiFund crowdfunding campaigns.

@class [template] views_token
@method (events)
**/

Template['views_token'].helpers({
    /**
    On Donate Click

    @event (click #donate)
    **/
	
	'owner': function(){
    }
});