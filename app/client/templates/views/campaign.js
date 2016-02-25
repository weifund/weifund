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
    TemplateVar.set(template, 'state', {isOpen: true});
    TemplateVar.set(template, 'showDetails', false);
    TemplateVar.set(template, 'token', {total: 0, campaignStarted: false});
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
			amountValue = $('#amount').val(),
            amount = web3.toWei(amountValue, 'ether'),
            donateEvent,
            transactionObject = {
                gas: web3.eth.defaultGas,
                from: web3.eth.defaultAccount,
                value: amount
            },
			transactionHash = '',
            transactionCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isError: true, 
                        isContributing: true, 
                        error: err
                    });
				
				transactionHash = result;
        		TemplateVar.set(template, 'state', {isContributing: true, transactionHash: result});
            },
            eventFilter = {
				_campaignID: campaign.id,
                _contributor: web3.eth.defaultAccount,
            },
            eventCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isError: true, 
                        isContributing: true, 
                        error: err,
						transactionHash: transactionHash
                    });
                
                TemplateVar.set(template, 'state', {
                    isContributing: true, 
                    contributed: true,
					transactionHash: transactionHash
                });
				
				var campaignID = _id;
		
				objects.helpers.importCampaign(campaignID, function(err, campaign){
					if(err)
						return;

					if(!campaign.isValid)
						return;

					TemplateVar.set(template, 'campaign', campaign);
					Campaigns.upsert({id: campaign.id}, campaign);
				});
            };
            
        if(_.isEmpty(amount) || _.isUndefined(amount) || amount === "0")
            return TemplateVar.set(template, 'state', {
					isError: true, 
					isContributing: true, 
					error: 'Your contribution amount cannot be zero or empty',
					transactionHash: transactionHash
				});
		
		if(!campaign.isValid)
			return TemplateVar.set(template, 'state', {
					isError: true, 
					isContributing: true, 
					error: 'This campaign has invalid data and can not be contributed too.',
					transactionHash: transactionHash
				});
		
		if(!campaign.status.type == 'failure')
			return TemplateVar.set(template, 'state', {
					isError: true, 
					isContributing: true, 
					error: 'This campaign has failed and so you cannot contribute too it.',
					transactionHash: transactionHash
				});
		
		if(!confirm("Are you sure you want to contribute " + amountValue + ' ethers to the ' + campaign.name + ' campaign?'))
			return;
        
		// Change state to processing
        TemplateVar.set(template, 'state', {isContributing: true});
		
		// setup event filter
        donateEvent = objects.contracts.WeiFund.Contributed(eventFilter, eventCallback);
		
		// contribute to the campaign
        objects.contracts.WeiFund.contribute(campaign.id, transactionObject.from, transactionObject, transactionCallback);
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
			transactionHash = '',
            transactionObject = {
                gas: web3.eth.defaultGas,
                from: web3.eth.defaultAccount,
            },
            transactionCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isPaying: true, 
                        isError: true, 
                        error: err, 
                        payout: false
                    });
				
				transactionHash = result;
        		TemplateVar.set(template, 'state', {isPaying: true, transactionHash: result});
            },
            eventFilter = {
                _campaignID: campaign.id
            },
            eventCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isPaying: true, 
                        isError: true, 
                        error: err, 
                        payout: false,
						transactionHash: transactionHash
                    });
                
                TemplateVar.set(template, 'state', {
                    isPaying: true, 
                    payout: true,
					transactionHash: transactionHash
                });
				
				var campaignID = _id;
		
				objects.helpers.importCampaign(campaignID, function(err, campaign){
					if(err)
						return;

					if(!campaign.isValid)
						return;

					TemplateVar.set(template, 'campaign', campaign);
					Campaigns.upsert({id: campaign.id}, campaign);
				});
            };
        
        if(!campaign || !campaign.isValid)
            return TemplateVar.set(template, 'state', {
                        isPaying: true, 
                        isError: true, 
                        error: 'The campaign either does not exist or is invalid.', 
                        payout: false,
						transactionHash: transactionHash
                    });
        
        if(campaign.status.type == 'paidOut')
            return TemplateVar.set(template, 'state', {
                        isPaying: true, 
                        isError: true, 
                        error: 'This campaign has already been paid out.',
						transactionHash: transactionHash
                    });
        
        TemplateVar.set(template, 'state', {isPaying: true});
        payoutEvent = objects.contracts.WeiFund.PaidOut(eventFilter, eventCallback);
        objects.contracts.WeiFund.payout(campaign.id, transactionObject, transactionCallback);
	},
	
	/**
    On Refund

    @event (click #refund)
    **/
	
	'click #refund': function(event, template){
        var campaign = TemplateVar.get('campaign'),
            refundEvent,
			transactionHash = '',
            transactionObject = {
                gas: web3.eth.defaultGas,
                from: web3.eth.defaultAccount,
            },
            transactionCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isRefund: true, 
                        isError: true, 
                        error: err
                    });
				
				transactionHash = result;
				TemplateVar.set(template, 'state', {isRefund: true, transactionHash: result});
            }, 
            eventFilter = {
                _campaignID: campaign.id, 
                _contributor: transactionObject.from
            },
            eventCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isRefund: true, 
                        isError: true, 
                        error: err,
						transactionHash: transactionHash
                    });
                
                TemplateVar.set(template, 'state', {
                    isRefund: true, 
                    refunded: true,
					transactionHash: transactionHash
                });
				
				var campaignID = _id;
		
				objects.helpers.importCampaign(campaignID, function(err, campaign){
					if(err)
						return;

					if(!campaign.isValid)
						return;

					TemplateVar.set(template, 'campaign', campaign);
					Campaigns.upsert({id: campaign.id}, campaign);
				});
            };
        
        if(!campaign || !campaign.isValid)
			return TemplateVar.set(template, 'state', {
                        isRefund: true, 
                        isError: true, 
                        error: 'This campaign either does not exist or is invalid.',
						transactionHash: transactionHash
                    });
		
        if(campaign.status.type != 'failure')
			return TemplateVar.set(template, 'state', {
                        isRefund: true, 
                        isError: true, 
                        error: 'This campaign has not failed and so you cannot be refunded at this time.',
						transactionHash: transactionHash
                    });
        
        TemplateVar.set(template, 'state', {isRefund: true});
        refundEvent = objects.contracts.WeiFund.Refunded(eventFilter, eventCallback);
        objects.contracts.WeiFund.refund(campaign.id, transactionObject,  transactionCallback);
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
        var campaignID = _id;
		
		objects.helpers.importCampaign(campaignID, function(err, campaign){
			if(err)
				return;

			if(!campaign.isValid)
				return;

			TemplateVar.set(template, 'campaign', campaign);
			Campaigns.upsert({id: campaign.id}, campaign);
		});
    },
    
	/**
    The selected campaign.

    @method (config)
    **/
	
	'configContract': function(){
            
    },
	
	'selectedAccount': function(){
		return web3.eth.defaultAccount;	
	},
    
	/**
    The selected campaign.

    @method (load)
    **/
	
	'campaign': function(){
        return Campaigns.findOne({id: String(_id)});
    },
    
	/**
    Get the most recent campaigns

    @method (recent)
    **/
	
	'recent': function(){ 
		return Campaigns.find({}, {limit: 2});
	},
});