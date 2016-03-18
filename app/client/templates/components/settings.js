

Template['components_settings'].events({
    /**
    @event (click #restore)
    **/

    'click #setEnvVars': function(event, template){
		if(!confirm('Are you sure you want to change your environment variables?'))
			return;
		
		var contractWeiFund = $('#contractWeiFund').val(),
			contractWeiHash = $('#contractWeiHash').val(),
			contractPersonaRegistry = $('#contractPersonaRegistry').val(),
			contractWeiAccounts = $('#contractWeiAccounts').val(),
			contractWeiControllerFactory = $('#contractWeiControllerFactory').val(),
			contractMultiServiceFactory = $('#contractMultiServiceFactory').val(),
			contractStaffPicks = $('#contractStaffPicks').val(),
			contractWeiFund_Token_Factory = $('#contractWeiFund_Token_Factory').val(),
			ipfsProvider = $('#ipfsProvider').val(),
			ethProvider = $('#ethProvider').val();
			
		
		// Set the default rpc provider address
		LocalStore.set('rpcProvider', ethProvider);
		
		// Set IPFS Provider Data
		var ipfsProviderData = ipfsProvider.split(':');

		// Set the default rpc provider address
		LocalStore.set('ipfsProvider', {host: ipfsProviderData[0], port: ipfsProviderData[1]});

		// Set the default rpc provider address
		LocalStore.set('contracts', {
			WeiFund: contractWeiFund,
			WeiHash: contractWeiHash,
			PersonaRegistry: contractPersonaRegistry,
			WeiAccounts: contractWeiAccounts,
			WeiControllerFactory: contractWeiControllerFactory,
			MultiServiceFactory: contractMultiServiceFactory,
			StaffPicks: contractStaffPicks,
			WeiFund_Token_Factory: contractWeiFund_Token_Factory
		});
	},
});