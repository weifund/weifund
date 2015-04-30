/**
Template Controllers

@module Templates
**/

/**
The campaign tracker template helper functions.

@class [template] components_campaignTracker
@helpers
**/

Template['components_campaignTracker'].helpers({
    /**
    The campaign.

    @method (campaign)
    **/
});

/**
The campaign tracker template events.

@class [template] components_campaignTracker
@events
**/

Template['components_campaignTracker'].events({
    /**
    On Donate Click

    @event (click #donate)
    **/
	
	/*'click #donate': function(){
        if(campaign != false)
            var donate = campaign.contribute($('#amount').val());
        
            if(donate == true)
                Session.set('state', 'donationProcessing');
	},*/
	
	/**
    On Payout Click

    @event (click #payout)
    **/
	
	/*'click #payout': function(){
        if(campaign != false)
            var payout = campaign.payout();
        
            if(payout == true)
                Session.set('state', 'payoutProcessing');
	},*/
	
	/**
    On Refund

    @event (click #refund)
    **/
	
	/*'click #refund': function(){
        if(campaign != false)
            var refund = campaign.refund();
        
            if(refund == true)
                Session.set('state', 'refundProcessing');
	},*/
});

/**
When the campaign tracker template is rendered.

@class [template] components_campaignTracker
@rendered
**/

Template['components_campaignTracker'].rendered = function(){    
    campaign.onContribute(WeiFund.from(), function(loadCampaign){
        Session.set('trackCampaign', loadCampaign.safeData);
        Session.set('state', 'donationProcessed');
    });
    
    campaign.onPayout(WeiFund.from(), function(loadCampaign){
        Session.set('trackCampaign', loadCampaign.safeData);
        Session.set('state', 'payoutProcessed');
    });
    
    campaign.onRefund(WeiFund.from(), function(loadCampaign){
        Session.set('trackCampaign', loadCampaign.safeData);
        Session.set('state', 'refundProcessed');
    });
};