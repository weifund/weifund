/**
Template Controllers

@module Templates
**/

/**
The view1 template

@class [template] views_view1
@constructor
**/

Template['views_tracker'].events({
    /**
    On Donate Click

    @event (click #donate)
    **/
	
	'click #donate': function(){
        if(campaign != false)
            var donate = campaign.contribute($('#amount').val());
	        Session.set('notDonated', false);
        
            if(donate == true)
                Session.set('state', 'donationProcessing');
	},
	
	/**
    On Payout Click

    @event (click #payout)
    **/
	
	'click #payout': function(){
        if(campaign != false)
            var payout = campaign.payout();
        
            if(payout == true)
                Session.set('state', 'payoutProcessing');
	},
	
	/**
    On Refund

    @event (click #refund)
    **/
	
	'click #refund': function(){
        if(campaign != false)
            var refund = campaign.refund();
        
            if(refund == true)
                Session.set('state', 'refundProcessing');
	},
});

Template['views_tracker'].helpers({
    /**
    Get the name

    @method (name)
    **/

    'name': function(){
        return this.name || TAPi18n.__('dapp.views.tracker.defaultName');
    },
	
	/**
    Get the campaign being tracked

    @method (campaign)
    **/
	
	'campaign': function(){
		return Session.get('trackCampaign');
	},
	
	/**
    Get the most recent campaigns

    @method (recent)
    **/
	
	'recent': function(){ 
        Campaigns.load(false, 2, 0);
		return Campaigns.find({}, {limit: 2});
	},
});

Template['views_tracker'].created = function(){
	Session.set('notDonated', true);
	Session.set('state', 'open');
	Meta.setSuffix(TAPi18n.__("dapp.views.tracker.title"));
};

/**
When the campaign tracker template is rendered.

@class [template] views_tracker
@rendered
**/

Template['views_tracker'].rendered = function(){    
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
