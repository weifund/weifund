/**
Template Controllers

@module Templates
**/


/**
When the campaign tracker template is created

@class [template] views_campaign
@method (created)
**/

Template['views_campaign'].created = function(){
    // Set page title suffix
	Meta.setSuffix(TAPi18n.__("dapp.views.tracker.title"));
};


/**
When the campaign tracker template is created

@class [template] views_campaign
@method (created)
**/

Template['views_campaign'].rendered = function(){
    var cid = this.data.id;
    var template = this;
    
    // Load campaign data and set data as reactive var
    Campaigns.load(cid, 1, function(err, campaign){
        TemplateVar.set(template, 'campaign', campaign);
    });
    
    // Set campaign state to default
    TemplateVar.set('campaignState', {isOpen: true});
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
        var campaign = TemplateVar.get('campaign');
        var amount = web3.toWei($('#amount').val(), 'ether');
        
        console.log(amount);
        
        if(_.isEmpty(amount) || _.isUndefined(amount) || !campaign)
            return;
        
        TemplateVar.set(template, 'campaignState', {isContributing: true});
        WeiFund.contribute(campaign.id, web3.eth.accounts[0], {value: amount}, function(err, result, contributed){
            if(err) {
                TemplateVar.set(template, 'campaignState', {isError: true, isContributing: true, error: err});
                return;
            }
            
            if(!contributed)
                return;
            
            TemplateVar.set(template, 'campaignState', {isContributing: true, contributed: true});
            Campaigns.load(campaign.id, 1, function(err, campaign){
                TemplateVar.set(template, 'campaign', campaign);
            });
        });
	},
	
	/**
    On Payout Click

    @event (click #payout)
    **/
	
	'click #payout': function(event, template){
        var campaign = TemplateVar.get('campaign');
        if(!campaign)
            return;
        
        TemplateVar.set(template, 'campaignState', {isPaying: true});
        WeiFund.payout(campaign.id, function(err, result, payedout){
            if(err) {
                TemplateVar.set(template, 'campaignState', {isPaying: true, isError: true, error: err, payout: false});   
                return;
            }
            
            if(!payedout)
                return;
            
            TemplateVar.set(template, 'campaignState', {isPaying: true, payout: true});
            Campaigns.load(campaign.id, 1, function(err, campaign){
                TemplateVar.set(template, 'campaign', campaign);
            });
        });
	},
	
	/**
    On Refund

    @event (click #refund)
    **/
	
	'click #refund': function(event, template){
        var campaign = TemplateVar.get('campaign');
        if(!campaign)
            return;
        
        TemplateVar.set(template, 'campaignState', {isRefund: true});
        WeiFund.refund(campaign.id, function(err, result, refunded){
            if(err){
                TemplateVar.set(template, 'campaignState', {isRefund: true, isError: true, error: err});
            }
            
            if(!refunded)
                return;
            
            TemplateVar.set(template, 'campaignState', {isRefund: true, refunded: true});
            Campaigns.load(campaign.id, 1, function(err, campaign){
                TemplateVar.set(template, 'campaign', campaign);
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
    Get the most recent campaigns

    @method (recent)
    **/
	
	'recent': function(){ 
        Campaigns.load(false, 2, 0);
		return Campaigns.find({}, {limit: 2});
	},
});