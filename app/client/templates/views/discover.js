/**
Template Controllers

@module Templates
**/

/**
The view1 template

@class [template] views_view1
@constructor
**/

var latestLoaded = {}, // latest load index by category key
	totalCampaigns = 0,
	loadNumber = 8;

Template['views_discover'].helpers({
	/**
    Get the campaigns

    @method (campaigns)
    **/
    
	'campaigns': function(){
		var	params = this.category === false ? {} : {'data.category': String(this.category)};
        
		return Campaigns.find(params, {sort: {id: -1}});
	},
	
	/**
    Get the categories

    @method (categories)
    **/
    
	'categories': function(){
		return Categories.find({});
	},
});

Template['views_discover'].events({
	/**
    On Load More

    @event (click #loadMore)
    **/
    
	'click #loadMore': function(){
		var	categoryKey = this.category === false ? 'category_all' : 'category_' + String(this.category);
		
        for(var campaignID = latestLoaded[categoryKey]; campaignID < latestLoaded[categoryKey] + loadNumber; campaignID++){
			objects.helpers.importCampaign(campaignID, function(err, campaign){
				if(err)
					return;
				
				if(!campaign.isValid)
					return;
				
				Campaigns.upsert({id: campaign.id}, campaign);
				latestLoaded[categoryKey] = parseInt(campaign.id) + 1;
			});
		};
	},
});

Template['views_discover'].created = function(){	
	Meta.setSuffix(TAPi18n.__("dapp.views.discover.title"));
};

Template['views_discover'].rendered = function(){	
	var template = this;
	
	objects.contracts.WeiFund.totalCampaigns(function(err, result){
		if(err)
			return TemplateVar.set(template, 'state', {isError: true, error: err});
		
		var	categoryKey = this.category === false ? 'category_all' : 'category_' + String(this.category);
		var numCampaigns = result.toNumber(10);
		totalCampaigns = numCampaigns;
		
		if(numCampaigns == 0)
			return TemplateVar.set(template, 'state', {noCampaigns: true});
		
		for(var campaignID = 0; campaignID < numCampaigns; campaignID++){
			objects.helpers.importCampaign(campaignID, function(err, campaign){
				if(err)
					return;
				
				if(!campaign.isValid)
					return;
				
				Campaigns.upsert({id: campaign.id}, campaign);
				latestLoaded[categoryKey] = parseInt(campaign.id) + 1; // build for big numbers later
			});
		};
	});
};
