Template['components_contribute'].rendered = function(){
	var template = this;
};

Template['components_contribute'].helpers({
	'selectedAccount': function(){
		return web3.eth.defaultAccount;	
	},
});

Template['components_contribute'].events({
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #weifundDeploy)
    **/

    'click #contribute': function(event, template){
		if(!confirm("Are you sure you want to contribute to this campaign?"))
			return;
		
		try {
			var campaignID = Helpers.cleanAscii($("#contributeCampaignID").val()),
				amount = Helpers.cleanAscii($('#contributeAmount').val()),
				beneficiary = Helpers.cleanAscii($("#contributeBeneficiary").val());
			var transactionObject = {
					from: web3.eth.defaultAccount,
					gas: web3.eth.defaultGas,
					value: web3.toWei(amount, 'ether')
				},
				eventFilter = {
					_campaignID: campaignID,
					_contributor: web3.eth.defaultAccount
				};

			objects.contracts.WeiFund.contribute(campaignID, beneficiary, transactionObject, function(err, result){
				if(err)
					return TemplateVar.set(template, 'state', {isError: true, error: err});

				TemplateVar.set(template, 'state', {isMining: true, transactionHash: result});
			});

			objects.contracts.WeiFund.Contributed(eventFilter, function(err, result){
				if(err)
					return TemplateVar.set(template, 'state', {isError: true, error: err});

				TemplateVar.set(template, 'state', {isMined: true, transactionHash: result.transactionHash});

				web3.eth.getTransactionReceipt(result.transactionHash, function(err, result){
					TemplateVar.set(template, 'state', {isMined: true, 
														transactionHash: result.transactionHash, 
														blockHash: result.blockHash,
														cumulativeGasUsed: result.cumulativeGasUsed,
														transactionIndex: result.transactionIndex,
														blockNumber: result.blockNumber});
				});
			});
		}catch(err){
			return TemplateVar.set(template, 'state', {isError: true, error: err});
		}
		
		// Prevent Double Click
		$(event.currentTarget).prop('disabled', true); 
	}
});