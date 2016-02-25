Template['components_collectionManager'].rendered = function(){
};

Template['components_collectionManager'].helpers({
});

Template['components_collectionManager'].events({
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #weifundDeploy)
    **/

    'click #clearCampaigns': function(event, template){
		if(confirm("Are you sure you want to delete all locally stored campaign data?"))
			Campaigns.remove({});
	},
	
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #weifundDeploy)
    **/

    'click #clearContributors': function(event, template){   
		if(confirm("Are you sure you want to delete all locally stored contributor data?"))
			Contributors.remove({});
	},
	
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #weifundDeploy)
    **/

    'click #clearPersonas': function(event, template){  
		if(confirm("Are you sure you want to delete all locally stored Persona data?"))
			Personas.remove({});
	}
});