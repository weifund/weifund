

Template['components_campaignProcessing'].helpers({
	/**
    The selected accounts balance.

    @method (accountBalance)
    **/
	
	'accountBalance': function(){
		web3.eth.getBalance(web3.eth.defaultAccount, function(err, balance){
			if(!err)
				Session.set('accountBalance', balance.toString(10));
		});
		
		return Session.get('accountBalance');
	},
    
	/**
    The selected campaign.

    @method (selectedAccount)
    **/
	
	'selectedAccount': function(){
		return web3.eth.defaultAccount;	
	},
});