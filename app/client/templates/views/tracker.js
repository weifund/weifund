/**
Template Controllers

@module Templates
**/

/**
The view1 template

@class [template] views_view1
@constructor
**/

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
	Session.set('state', 'open');
	Meta.setSuffix(TAPi18n.__("dapp.views.tracker.title"));
};
