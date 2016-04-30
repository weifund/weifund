Template['components_settings'].events({
  /**
  @event (click #restore)
  **/

  'click #setEnvVars': function(event, template) {
    if (!confirm('Are you sure you want to change your environment variables?'))
      return;

    var contractWeiFund = $('#contractWeiFund').val(),
      contractWeiHash = $('#contractWeiHash').val(),
      contractPersonaRegistry = $('#contractPersonaRegistry').val(),
      contractCampaignAccountFactory = $('#contractCampaignAccountFactory').val(),
      contractWeiControllerFactory = $('#contractWeiControllerFactory').val(),
      contractMultiServiceFactory = $('#contractMultiServiceFactory').val(),
      contractStaffPicks = $('#contractStaffPicks').val(),
      contractWeiFundTokenFactory = $('#contractWeiFundTokenFactory').val(),
      ipfsProvider = $('#ipfsProvider').val(),
      ethProvider = $('#ethProvider').val();


    // Set the default rpc provider address
    LocalStore.set('rpcProvider', ethProvider);

    // Set IPFS Provider Data
    var ipfsProviderData = ipfsProvider.split(':');

    // Set the default rpc provider address
    LocalStore.set('ipfsProvider', {
      host: ipfsProviderData[0],
      port: ipfsProviderData[1]
    });

    // get contracts object
    var contractsObject = LocalStore.get('contracts');
    contractsObject[LocalStore.get('network')] = {
      WeiFund: contractWeiFund,
      WeiHash: contractWeiHash,
      PersonaRegistry: contractPersonaRegistry,
      CampaignAccountFactory: contractCampaignAccountFactory,
      WeiControllerFactory: contractWeiControllerFactory,
      MultiServiceFactory: contractMultiServiceFactory,
      StaffPicks: contractStaffPicks,
      WeiFundTokenFactory: contractWeiFundTokenFactory
    };

    // Set the default rpc provider address
    LocalStore.set('contracts', contractsObject);
  },
});
