Template['components_ipfsRestore'].rendered = function(){
	var template = this;
};

Template['components_ipfsRestore'].helpers({
});

Template['components_ipfsRestore'].events({
    /**
    @event (click #restore)
    **/

    'click #restore': function(event, template){   
		var campaignID = Helpers.cleanAscii($("#ipfsCampaignID").val());
		var campaign = IPFS_Backup.findOne({'campaignSchema.id': campaignID});
		
		if(_.isUndefined(campaign))
			return TemplateVar.set(template, 'state', {'isError': true, error: 'There is no backup IPFS data stored for that campaign'});
		
		TemplateVar.set(template, 'state', {'isData': true, ipfsData: JSON.stringify(campaign)});
	},
	
    /**
    @event (click #restore)
    **/

    'click #addIPFS': function(event, template){   
		var campaignID = Helpers.cleanAscii($("#ipfsCampaignID").val());
		var campaign = IPFS_Backup.findOne({'campaignSchema.id': parseInt(campaignID)});
		
		if(_.isUndefined(campaign))
			return TemplateVar.set(template, 'state', {'isError': true, error: 'There is no backup IPFS data stored for that campaign'});
		
		ipfs.addJson(campaign, function(err, result){
			if(err)
				return TemplateVar.set(template, 'state', {'isError': true, error: err.Message});
			
			TemplateVar.set(template, 'state', {'isSuccess': true, ipfsHash: result});
		});
	}
});