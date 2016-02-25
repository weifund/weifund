Template['components_startCampaignProcessing'].events({
    /**
    Fired when a user touches a key on the beneficiary address field.

    @method (keyup #beneficiary)
    **/
    
    'click #checkRegistryTransaction': function(event, template){
		var hash = event.target.dataset.hash;
		
		web3.eth.getTransactionReceipt(hash, function(err, result){
			if(err)
				return TemplateVar.set(template, 'registryTransactionStatus', {
					error: err
				});
			
			if(result == null)
				return TemplateVar.set(template, 'registryTransactionStatus', {
					noReceipt: true,
				});
			
			if(result)
				return TemplateVar.set(template, 'registryTransactionStatus', result);
		});
    },
    
    'click #checkCampaignTransaction': function(event, template){
		var hash = event.target.dataset.hash;
		
		web3.eth.getTransactionReceipt(hash, function(err, result){
			if(err)
				return TemplateVar.set(template, 'campaignTransactionStatus', {
					error: err
				});
			
			if(result == null)
				return TemplateVar.set(template, 'campaignTransactionStatus', {
					noReceipt: true,
				});
			
			if(result)
				return TemplateVar.set(template, 'campaignTransactionStatus', result);
		});
    },
    
    'click #checkIPFSHash': function(event, template){
		var hash = event.target.dataset.hash;
		
		ipfs.catJson(hash, function(err, result){
			if(err)
				return TemplateVar.set(template, 'ipfsHashStatus', {
					error: err
				});
			
			if(result == null)
				return TemplateVar.set(template, 'ipfsHashStatus', {
					noReceipt: true,
				});
			
			if(result)
				return TemplateVar.set(template, 'ipfsHashStatus', {
					data: JSON.stringify(result, null, 2)
				});
		});
    },
});