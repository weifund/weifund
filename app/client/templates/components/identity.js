var template;

Template['components_identity'].rendered = function(){
	template = this;
};

Template['components_identity'].helpers({
	'selectedAccount': function(){
		return web3.eth.defaultAccount;	
	},
	'accountBalance': function(){
		web3.eth.getBalance(web3.eth.defaultAccount, function(err, result){
			if(!err)
				TemplateVar.set(template, 'balance', result.toString(10));
		});
		
		return TemplateVar.get('balance');
	},
});