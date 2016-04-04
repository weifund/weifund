Template['components_alertProcessing'].rendered = function(){
	TemplateVar.set('data', this.data);
};

Template['components_alertProcessing'].helpers({
	'alertData': function(){
		// get template data
		var data = TemplateVar.get('data') || {};
		
		// defaults
		if(!_.has(data, 'messageExtra'))
			data.messageExtra = true;
		
		if(!_.has(data, 'showTransactionHash'))
			data.showTransactionHash = true;
		
		if(!_.has(data, 'showAddress'))
			data.showAddress = true;
		
		if(!_.has(data, 'ipfsHash'))
			data.showAddress = true;
		
		if(!_.has(data, 'hash'))
			data.showAddress = true;
		
		// return template data
		return data;
	},
});

Template['components_alertProcessing'].events({
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #weifundDeploy)
    **/

    'click .btn-check-receipt': function(event, template){
		var txHash = event.target.value;
		
		web3.eth.getTransactionReceipt(txHash, function(err, result){
			if(err)
				return TemplateVar.set(template, 'txReceipt', {error: err, result: null});
			
			TemplateVar.set(template, 'txReceipt', {result: result});
		});
	}
});