Template['components_contributorLookup'].rendered = function(){
	var template = this;
};

Template['components_contributorLookup'].helpers({
});

Template['components_contributorLookup'].events({
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #weifundDeploy)
    **/

    'click #contributorLookup': function(event, template){   
		var campaignID = Helpers.cleanAscii($("#contributorCampaignID").val()),
			contributorID = Helpers.cleanAscii($("#contributorID").val());
		
		// Import relevant campaign
		objects.helpers.importContributor(campaignID, contributorID, function(err, contributor){
			if(err)
				return TemplateVar.set(template, 'state', {isError: true, error: err});
			
			if(contributor.isValid)
				Contributors.upsert({id: contributor.id}, contributor);
			
			TemplateVar.set(template, 'state', {isContributor: true, contributor: contributor});
		});
	}
});