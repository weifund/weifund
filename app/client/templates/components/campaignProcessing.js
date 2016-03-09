var template;

Template['components_campaignProcessing'].rendered = function(){ 
	Meta.setSuffix(TAPi18n.__("dapp.views.tracker.title"));
	template = this;

    // Set campaign state to default
    TemplateVar.set(template, 'state', {isOpen: true});
    TemplateVar.set(template, 'showDetails', false);
    TemplateVar.set(template, 'isContributor', false);
    TemplateVar.set(template, 'token', {total: 0, campaignStarted: false});
	TemplateVar.set(template, 'campaignsStarted', 0);
	TemplateVar.set(template, 'refundGas', 200000);
};

Template['components_campaignProcessing'].helpers({  
});


/**
These are the campaign tracker event handlers, that handle payotus, refund and contributions to WeiFund crowdfunding campaigns.

@class [template] views_campaign
@var (events)
**/

Template['components_campaignProcessing'].events({    
    /**
    On Donate Click

    @event (click #donate)
    **/
	
	'click #donate': function(event, template){
        var campaign = Campaigns.findOne({id: $('#component_campaignID').val()}), //TemplateVar.get(template, 'campaign'),
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
		
				objects.helpers.importCampaign(campaign.id, function(err, campaign){
					if(err)
						return;

					if(!campaign.isValid)
						return;

					TemplateVar.set(campaignTemplate, 'campaign', campaign);
					Campaigns.upsert({id: campaign.id}, campaign);
				});
				
				objects.helpers.importContributor(campaign.id, transactionObject.from, function(err, contribution){
					if(err)
						return;
				});
            };
		
		web3.eth.getBalance(web3.eth.defaultAccount, function(err, balance){
			if(err)
				return TemplateVar.set(template, 'state', {
					isError: true, 
					isContributing: true, 
					error: 'Error retrieving account balance.',
					transactionHash: transactionHash
				});
			
			var amountBN = new BigNumber(amount);
			
			if(balance.lessThan(amountBN))
				return TemplateVar.set(template, 'state', {
					isError: true, 
					isContributing: true, 
					error: 'Your contribution amount is more than your account balance.',
					transactionHash: transactionHash
				});
            
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
			
			console.log(template, TemplateVar.get(template, 'state'));

			// setup event filter
			donateEvent = objects.contracts.WeiFund.Contributed(eventFilter, eventCallback);

			// contribute to the campaign
			objects.contracts.WeiFund.contribute(campaign.id, transactionObject.from, transactionObject, transactionCallback);
		});
		
		// Prevent Double Click
		$(event.currentTarget).prop('disabled', true); 
	},
	
	/**
    On Payout Click

    @event (click #payout)
    **/
	
	'click #payout': function(event, template){
        var campaign = Campaigns.findOne({id: $('#component_campaignID').val()}),
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
		
				objects.helpers.importCampaign(campaign.id, function(err, campaign){
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
		
		// Prevent Double Click
		$(event.currentTarget).prop('disabled', true); 
	},
	
	/**
    On Refund

    @event (click #refund)
    **/
	
	'click #refund': function(event, template){
        var campaign = Campaigns.findOne({id: $('#component_campaignID').val()}),
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
		
				objects.helpers.importCampaign(campaign.id, function(err, campaign){
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
		
		objects.contracts.WeiFund.isContributor(campaign.id, transactionObject.from, function(err, isContributor){
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
			
			objects.contracts.WeiFund.totalContributionsBy(campaign.id, transactionObject.from, function(err, totalContributions){
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
					objects.contracts.WeiFund.contributionID(campaign.id, transactionObject.from, function(err, contributorID){
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
		
		// Prevent Double Click
		$(event.currentTarget).prop('disabled', true); 
	},
});