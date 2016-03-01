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
    TemplateVar.set(template, 'isContributor', false);
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
				
				objects.helpers.importContributor(campaignID, transactionObject.from, function(err, contribution){
					if(err)
						return;
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
		
		objects.contracts.WeiFund.isContributor(campaignID, transactionObject.from, function(err, isContributor){
			if(err)
				return TemplateVar.set(template, 'state', {
                        isRefund: true, 
                        isError: true, 
                        error: 'Error while checking contributor status: ' + err,
						transactionHash: transactionHash
                    });
			
			if(!isContributor)
				return TemplateVar.set(template, 'state', {
                        isRefund: true, 
                        isError: true, 
                        error: 'The account you have selected is not a contributor to this campaign, and cannot be refunded any ether.',
						transactionHash: transactionHash
                    });
			
			objects.contracts.WeiFund.totalContributionsBy(campaignID, transactionObject.from, function(err, totalContributions){
				if(err)
					return TemplateVar.set(template, 'state', {
							isRefund: true, 
							isError: true, 
							error: 'Error while checking contribution total: ' + err,
							transactionHash: transactionHash
						});

				if(totalContributions.equals(0))
					return TemplateVar.set(template, 'state', {
							isRefund: true, 
							isError: true, 
							error: 'The account you have selected has zero total contributions.',
							transactionHash: transactionHash
						});
				
				for(var contributionIndex = 0; contributionIndex < totalContributions.toNumber(10); contributionIndex++){
					objects.contracts.WeiFund.contributionID(campaignID, transactionObject.from, function(err, contributorID){
						if(err)
							return TemplateVar.set(template, 'state', {
								isRefund: true, 
								isError: true, 
								error: 'There was an error while retrieving the contribution ID' + err,
								transactionHash: transactionHash
							});

						TemplateVar.set(template, 'state', {isRefund: true});
						refundEvent = objects.contracts.WeiFund.Refunded(eventFilter, eventCallback);
						objects.contracts.WeiFund.refund(campaign.id, contributorID, transactionObject,  transactionCallback);			
					});
				};
			});
		});
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
		
		TemplateVar.set(template, 'refundGas', 200000);
		
		objects.contracts.WeiFund.isContributor(campaignID, web3.eth.defaultAccount, function(err, isContributor){
			if(err || !isContributor)
				return;
			
			TemplateVar.set(template, 'isContributor', {isContributor: true});
			
			objects.contracts.WeiFund.totalContributionsBy(campaignID, web3.eth.defaultAccount, function(err, totalContributions){
				if(err || totalContributions.equals(0))
					return;
				
				TemplateVar.set(template, 'refundGas', (200000 * totalContributions.toNumber(10)));
				TemplateVar.set(template, 'isContributor', {isContributor: true, totalContributions: totalContributions.toString()});
				
				objects.helpers.importContributor(campaignID, web3.eth.defaultAccount, function(err, contribution){
					if(err) {
						console.log('Contribution Error: ', err);
						return;
					}
				});
			});
		});
		
		objects.helpers.importCampaign(campaignID, function(err, campaign){
			if(err) {
				console.log('Contributor Error: ', err);
				return;
			}

			if(!campaign.isValid)
				return;

			// Setup new campaign
			TemplateVar.set(template, 'campaign', campaign);
			Campaigns.upsert({id: campaign.id}, campaign);
			
			// Number of contributors
			var numContributions = new BigNumber(campaign.numContributions);
			
			// Import Latest Contributors
			for(var contributionID = numContributions.toNumber(10) - 1; contributionID > numContributions.toNumber(10) - 4; contributionID--){
				console.log('loading ' + contributionID);
				
				objects.helpers.importContribution(campaignID, contributionID, function(err, contribution){
					if(err) {
						console.log('Contributor Error: ', err);
						return;
					}
				});
			}
		});
    },
    
	/**
    The selected campaign.

    @method (userContributions)
    **/
	
	'totalContributions': function(){
        var campaignID = _id;
		var userContributions = Contributions.find({campaignID: String(campaignID), contributor: web3.eth.defaultAccount}).fetch();
		
		if(_.isUndefined(userContributions))
			return 0;
		
		return userContributions.length;
	},
    
	/**
    The selected campaign.

    @method (userContributions)
    **/
	
	'userContributions': function(){
        var campaignID = _id;
		
		return Contributions.find({campaignID: String(campaignID), contributor: web3.eth.defaultAccount});
	},
    
	/**
    The selected campaign.

    @method (latestContributors)
    **/
	
	'latestContributors': function(){
        var campaignID = _id;
		
		return Contributions.find({campaignID: String(campaignID)}, {limit: 2, sort: { created: -1 }});
	},
    
	/**
    The selected campaign.

    @method (configContract)
    **/
	
	'configContract': function(){
           
    },
    
	/**
    The selected campaign.

    @method (selectedAccount)
    **/
	
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