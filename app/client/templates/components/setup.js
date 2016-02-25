Template['components_setup'].rendered = function(){
	var template = this;
	
	//if(LocalStore.get('setup'))
	//	TemplateVar.set(template, 'setup', true);
};

Template['components_setup'].helpers({
	'rpcProvider': function(){
		return LocalStore.get('rpcProvider');	
	},
	'ipfsProvider': function(){
		return LocalStore.get('ipfsProvider').host + ':' + LocalStore.get('ipfsProvider').port;
	},
	'defaultAccount': function(){
		return web3.eth.defaultAccount;	
	},
});

Template['components_setup'].events({
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #setupClient)
    **/

    'click #setupClient': function(event, template){
		try {
			var ethereumProvider = Helpers.cleanAscii($('#ethereumProvider').val()),
				ipfsProvider = Helpers.cleanAscii($('#ipfsProvider').val()),
				selectedAccount = Helpers.cleanAscii($('#ethereumAccount').val());
			var ipfsProviderData = ipfsProvider.split(":");
			var ipfsProviderHost = ipfsProviderData[0].replace("http://", "").replace("https://", ""),
				ipfsProviderPort = ipfsProviderData[1],
				testIPFSHash = 'Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt';
		
			// Set state
			TemplateVar.set(template, 'state', {isTesting: true});
			
			// Set Provider
			web3.setProvider(new web3.providers.HttpProvider(ethereumProvider));

			// IPFS Provider
			ipfs.setProvider({host: ipfsProviderHost, port: ipfsProviderPort});
			
			// Get Ethereum Accounts
			web3.eth.getAccounts(function(err, accounts){
				if(err)
					return TemplateVar.set(template, 'state', {isError: true, error: 'Ethereum Provider: ' + err});
				
				// Check if there are accounts
				if(accounts.length < 0)
					return TemplateVar.set(template, 'state', {isError: true, error: 'Your Ethereum provider must have accounts'});
						
				if(selectedAccount == "")
					selectedAccount = accounts[0];
				
				// set state
				TemplateVar.set(template, 'state', {isTesting: true});
				
				// try IPFS cat
				try  {
					ipfs.cat(testIPFSHash, function(err, result){
						if(err)
							return TemplateVar.set(template, 'state', {isError: true, error: 'IPFS Provider: ' + err});

						// Testing is Success
						TemplateVar.set(template, 'state', {isSuccess: true});
						LocalStore.set('setup', true);
						
						// Set Provider LocalStorage
						LocalStore.set('ipfsProvider', {host: ipfsProviderHost, port: ipfsProviderPort});
						LocalStore.set('rpcProvider', ethereumProvider);
						
						// Set Default Account
						LocalStore.set('defaultAccount', selectedAccount);
						
						// Shutdown Setup WIndow
						TemplateVar.set(template, 'setup', true);
						
						// Reroute if on setup
						if(Router.current().route._path == '/setup')
							Router.go('/');
					});
				}catch(err){
					return TemplateVar.set(template, 'state', {isError: true, error: err});
				}
			});
		}catch(err){
			return TemplateVar.set(template, 'state', {isError: true, error: err});
		}
	}
});