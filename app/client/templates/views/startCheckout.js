Template['views_startCheckout'].helpers({
	/**
    Get the campaigns

    @method (campaigns)
    **/

	'load': function () {
		LocalStore.set('startCampaignStage', 3);
	},

	'data': function () {
		return LocalStore.get('startCampaignData');
	},
});


Template['views_startCheckout'].events({
	/**
    Back button events

    @event (click #startBack)
    **/

	'click #startBack': function () {
		Router.go('/start/tokens');
	},

	/**
    Back button events

    @event (click #startBack)
    **/

	'click #createCampaign': function (event, template) {
		var campaignData = LocalStore.get('startCampaignData'),
			transactionObject = {
				from: web3.eth.defaultAccount,
				gas: web3.eth.defaultGas
			},
			serviceAddedFilter = {
				_sender: web3.eth.defaultAccount,
			},
			ipfsObject = {
				campaignSchema: {
					id: 'latest',
					version: 1,
					name: campaignData.name,
					alertnateName: '',
					url: campaignData.url,
					beneficiary: campaignData.beneficiary,
					config: campaignData.config,
					fundingGoal: campaignData.fundingGoal,
					category: campaignData.category,
					owner:  web3.eth.defaultAccount,
					about: campaignData.about,
					description: campaignData.description,
					address: web3.address(0),
					/*rewards: [
						{
							amountFloor: 0,
							name: '',
							description: '',
						}								
					],*/
					avatar: {
						'@type': 'ImageObject',
						'name': 'avatar',
						'contentUrl' : campaignData.avatar
					},
					banner: {
						'@type': 'ImageObject',
						'name': 'banner',
						'contentUrl' : campaignData.banner
					},
					mainEntityOfPage: {
						'@type': 'MediaObject',
						'name': 'mainEntity',
						'contentUrl' : campaignData.mainEntityOfPage
					}
				},
			},
			testIPFSHash = 'QmekvvCfcQg3LXXtUGeGy3kU4jGwg82txuZtVNRE8BvY9W';

		console.log('Campaign data', campaignData);

		//(string _name, address _beneficiary, uint _fundingGoal, uint _expiry, address _config) 

		// create campaign IPFS
		function createWeiHash(campaignID) {
		}
		
		// create campaign IPFS
		function createIPFSRepository(campaignID) {
			
		}

		// create campaign
		function createCampaign(config) {
			// start new campaign transaction
			objects.contracts.WeiFund.newCampaign(campaignData.name, campaignData.beneficiary, campaignData.fundingGoal, campaignData.expiry, config, transactionObject, function (err, result) {
				if (err)
					return TemplateVar.set(template, 'newCampaign', {
						error: err
					});
				
				TemplateVar.set(template, 'newCampaign', {
					transactionHash: result
				});
			});

			// listen for new campaign
			objects.contracts.WeiFund.CampaignCreated({
				_owner: transactionObject.from
			}, function (err, result) {
				if (err)
					return TemplateVar.set(template, 'newCampaign', {
						error: err
					});
				
				// set IPFS object ID
				ipfsObject.id = result.args._campaignID.toString(10);
				
				// set new token status
				TemplateVar.set(template, 'newCampaign', {
					transactionHash: result.transactionHash
				});
			
				// create IPFS repository
				createIPFSRepository(ipfsObject.id);
			});
		}

		// create controller
		function createController(tokenAddress) {
			//(address _weifund, address _token, address _owner, uint _tokenValue, bool _autoDisperse)

			// start new campaign transaction
			objects.contracts.WeiControllerFactory.newWeiController(objets.contracts.WeiFund.address, tokenAddress, transactionObject.from, campaignData.tokenPrice, campaignData.autoDisperse, transactionObject, function (err, result) {
				if (err)
					return TemplateVar.set(template, 'newContoller', {
						error: err
					});
				
				TemplateVar.set(template, 'newContoller', {
					transactionHash: result
				});
			});

			// listen for new campaign
			objects.contracts.WeiControllerFactory.ServiceAdded(serviceAddedFilter, function (err, result) {
				if (err)
					return TemplateVar.set(template, 'newContoller', {
						error: err
					});
				
				// set new token status
				TemplateVar.set(template, 'newToken', {
					transactionHash: result.transactionHash
				});
				
				// set campaign config
				ipfsObject.config = result.args._service;
			});
		}

		// cretae token
		function createToken() {
			// start new campaign transaction
			objects.contracts.WeiFund_Token_Factory.createStandardToken(transactionObject.from, campaignData.initialAmount, transactionObject, function (err, result) {
				if (err)
					return TemplateVar.set(template, 'newToken', {
						error: err
					});
				
				// set new token status
				TemplateVar.set(template, 'newToken', {
					transactionHash: result
				});
			});

			// listen for new campaign
			objects.contracts.WeiFund_Token_Factory.ServiceAdded(serviceAddedFilter, function (err, result) {
				if (err)
					return TemplateVar.set(template, 'newToken', {
						error: err
					});
				
				// set new token status
				TemplateVar.set(template, 'newToken', {
					transactionHash: result.transactionHash
				});
			});
		}
		
		function createPersona () {
			// IPFS repostiroy
			// Persona Registration
		}

		// if Create Controller
		if (campaignData.createController) {
			// if create token
			if (campaignData.createToken)
				createToken();
			else // create controller with user deployed token
				createController(campaignData.tokenAddress);
		} else {
			createCampaign(campaignData.config); // create campaign with config
		}
		
		if(campaignData.createPersona) {
			createPersona ();
		}
	},
});