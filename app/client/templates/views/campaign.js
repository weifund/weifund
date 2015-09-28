/**
Template Controllers

@module Templates
**/

// Temporary template var
var template;

/**
When the campaign tracker template is initially rendered

@class [template] views_campaign
@method (created)
**/

Template['views_campaign'].rendered = function(){
	Meta.setSuffix(TAPi18n.__("dapp.views.tracker.title"));
    template = this;

    // Set campaign state to default
    TemplateVar.set('state', {isOpen: true});
    TemplateVar.set('showDetails', false);
    TemplateVar.set('token', {total: 0, campaignStarted: false});
    
    
    
};


/**
These are the campaign tracker event handlers, that handle payotus, refund and contributions to WeiFund crowdfunding campaigns.

@class [template] views_campaign
@var (events)
**/

Template['views_campaign'].events({
    /**
    On Donate Click

    @event (click #donate)
    **/
	
	'click #donate': function(event, template){
        var campaign = TemplateVar.get('campaign'),
            amount = web3.toWei($('#amount').val(), 'ether'),
            donateEvent,
            transactionObject = {
                gas: 3000000,
                from: LocalStore.get('selectedAccount'),
                value: amount
            },
            transactionCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isError: true, 
                        isContributing: true, 
                        error: err
                    });
            },
            eventFilter = {
                addr: LocalStore.get('selectedAccount'),
            },
            eventCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isError: true, 
                        isContributing: true, 
                        error: err
                    });
                
                TemplateVar.set(template, 'state', {
                    isContributing: true, 
                    contributed: true
                });
                Campaigns.import(campaign.id, campaign.id + 1, function(err, campaign){});
            };
            
        if(_.isEmpty(amount) || _.isUndefined(amount) || !campaign)
            return;
        
        TemplateVar.set(template, 'state', {isContributing: true});
        donateEvent = weifundInstance.onContribute(eventFilter, eventCallback);
        weifundInstance.contribute.sendTransaction(campaign.id, web3.eth.accounts[0], transactionObject, transactionCallback);
	},
	
	/**
    On Payout Click

    @event (click #details)
    **/
    
    'click .btn-details': function(event, template){
        if(TemplateVar.get(template, 'showDetails'))
            TemplateVar.set(template, 'showDetails', false);
        else
            TemplateVar.set(template, 'showDetails', true);
    },
	
	/**
    On Payout Click

    @event (click #payout)
    **/
	
	'click #payout': function(event, template){
        var campaign = TemplateVar.get('campaign'),
            payoutEvent,
            transactionObject = {
                gas: 3000000,
                from: LocalStore.get('selectedAccount'),
            },
            transactionCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isPaying: true, 
                        isError: true, 
                        error: err, 
                        payout: false
                    });
            },
            eventFilter = {
                cid: campaign.id, 
                addr: transactionObject.from
            },
            eventCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isPaying: true, 
                        isError: true, 
                        error: err, 
                        payout: false
                    });
                
                TemplateVar.set(template, 'state', {
                    isPaying: true, 
                    payout: true
                });
                payoutEvent.stopWatching();
                Campaigns.import(campaign.id, campaign.id + 1, function(err, campaign){});
            };
        
        if(!campaign)
            return;
        
        TemplateVar.set(template, 'state', {isPaying: true});
        payoutEvent = weifundInstance.onPayout(eventFilter, eventCallback);
        weifundInstance.payout.sendTransaction(campaign.id, transactionObject, transactionCallback);
	},
	
	/**
    On Refund

    @event (click #refund)
    **/
	
	'click #refund': function(event, template){
        var campaign = TemplateVar.get('campaign'),
            refundEvent,
            transactionObject = {
                gas: 3000000,
                from: LocalStore.get('selectedAccount'),
            },
            transactionCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isRefund: true, 
                        isError: true, 
                        error: err
                    });
            }, 
            eventFilter = {
                cid: campaign.id, 
                addr: transactionObject.from
            },
            eventCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isRefund: true, 
                        isError: true, 
                        error: err
                    });
                
                refundEvent.stopWatching();
                TemplateVar.set(template, 'state', {
                    isRefund: true, 
                    refunded: true
                });
                Campaigns.import(campaign.id, campaign.id + 1, function(err, campaign){});
            };
        
        if(!campaign)
            return;
        
        TemplateVar.set(template, 'state', {isRefund: true});
        refundEvent = weifundInstance.onRefund(eventFilter, eventCallback);
        weifundInstance.refund.sendTransaction(campaign.id, transactionObject,  transactionCallback);
	},
});


/**
These are helper functions for the campaign tracker

@class [template] views_campaign
@var (helpers)
**/

Template['views_campaign'].helpers({	
	/**
    On the page loading.

    @method (load)
    **/
	
	'load': function(){
        // the campaign ID as global _id.
        var cid = _id;

        // Load campaign data and set data as reactive var
        Campaigns.import(cid, cid + 1, {}, function(err, campaign){
            TemplateVar.set(template, 'campaign', campaign);
        });
        
        var campaign = Campaigns.findOne({id: _id}),
        weicoinInstance;

        if(_.isUndefined(campaign)
          || !_.isObject(campaign))
            return {};

        if(campaign.config == ''
           || campaign.config == web3.address(0))
            return {};

        weicoinInstance = WeiCoin.Contract.at(campaign.config);

        var loadToken = function(){
            weicoinInstance.total.call(function(err, result){
                var getToken = TemplateVar.get(template, 'token');

                if(!err)
                    getToken.total = result.toNumber(10);

                TemplateVar.set(template, 'token', getToken);
            });
            weicoinInstance.cid.call(function(err, result){
                var getToken = TemplateVar.get(template, 'token');
                
                console.log(result);

                if(!err)
                    getToken.cid = result;

                TemplateVar.set(template, 'token', getToken);
            });
            weicoinInstance.campaignStarted.call(function(err, result){
                var getToken = TemplateVar.get(template, 'token');
                
                console.log(result);

                if(!err)
                    getToken.campaignStarted = result;

                TemplateVar.set(template, 'token', getToken);
            });
        };

        loadToken();
        Meteor.setInterval(loadToken, 10000);
    },
    
	/**
    The selected campaign.

    @method (config)
    **/
	
	'configContract': function(){
            
    },
    
	/**
    The selected campaign.

    @method (load)
    **/
	
	'campaign': function(){
        return Campaigns.findOne({id: _id});
    },
    
	/**
    Get the most recent campaigns

    @method (recent)
    **/
	
	'recent': function(){ 
        //Campaigns.import(0, 2, {}, function(err, campaign){});
		return Campaigns.find({}, {limit: 2});
	},
});