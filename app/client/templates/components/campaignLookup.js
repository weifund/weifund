function importCampaign(campaignID, callback){
	var campaignID = Helpers.cleanAscii(campaignID);
	
	objects.contracts.WeiFund.campaigns(campaignID, function(err, result){
		if(err)
			return callback(err, result);
		
		
	});
};

Template['components_campaignLookup'].rendered = function(){
	var template = this;
};

Template['components_campaignLookup'].helpers({
});

Template['components_campaignLookup'].events({
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #weifundDeploy)
    **/

    'click #campaignLookup': function(event, template){   
		var campaignID = Helpers.cleanAscii($("#campaignID").val());
		
		// Import relevant campaign
		objects.helpers.importCampaign(campaignID, function(err, campaign){
			if(err)
				return TemplateVar.set(template, 'state', {isError: true, error: err});
			
			if(campaign.isValid)
				Campaigns.upsert({id: campaign.id}, campaign);

			TemplateVar.set(template, 'state', {isCampaign: true, campaign: campaign});
		});
	}
});