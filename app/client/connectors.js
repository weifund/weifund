// Set the default rpc provider address
if(!LocalStore.get('contracts'))
	LocalStore.set('contracts', {
		WeiFund: '0xe17510a20abf854d892db69d99d8040e262bd681',
		WeiHash: '0x854b8e3eb702cfb9c1d4aa51c666f57bbaebb5fc',
		PersonaRegistry: '0xfa7027237757dc5c779a9f50e9805522b9509f88',
		WeiAccounts: '0x51635cc088b51f9bd3efee3f6c4cc84422c5be18',
		WeiControllerFactory: '0x5bf09a53659c53ff63b5817687e70d15de1deae2',
		MultiServiceFactory: '',
		StaffPicks: '',
		WeiFund_Token_Factory: '0xaee1e9aa90bb3d692d5963977e4ca919d9686ce4',
	});

// get local contract addresses
var contracts = LocalStore.get('contracts');

// Setup objects global for contract and helper connector objects
objects = {
	contracts: {
		WeiFund: WeiFund.at(contracts.WeiFund),
		WeiHash: WeiHash.at(contracts.WeiHash),
		PersonaRegistry: PersonaRegistry.at(contracts.PersonaRegistry),
		WeiAccounts: WeiAccounts.at(contracts.WeiAccounts),
		WeiFund_Token_Factory: WeiFund_Token_Factory.at(contracts.WeiFund_Token_Factory),
		WeiControllerFactory: WeiControllerFactory.at(contracts.WeiControllerFactory),
	},
	helpers: {}
};

// Build Campaign Validation Method
objects.helpers.validateCampaignData = function(chainData, ipfsData, callback){
	// check for undefined callback
	if(_.isUndefined(callback))
		callback = function(e,r){};
	
	try {
		// if ipfs object has the campaignSchema property
		if(!_.has(ipfsData, 'campaignSchema'))
			return callback("Invalid IPFS data schema, must contain `campaignSchema`", null);
		
		// Check beneficiary against the campaign schema
		if(chainData.beneficiary != ipfsData.campaignSchema.beneficiary)
			return callback("Invalid IPFS data schema, must have matching campaign beneficiaries", null);
		
		// setup numbers as big numbers and get url extensions
		var chainCampaignID = new BigNumber(chainData.id),
			ipfsCampaignID = new BigNumber(ipfsData.campaignSchema.id),
			ipfsAvatarExtension = ipfsData.campaignSchema.avatar.contentUrl.split('.').pop().replace(/(\?.*)|(#.*)/g, ""),
			ipfsBannerExtension = ipfsData.campaignSchema.banner.contentUrl.split('.').pop().replace(/(\?.*)|(#.*)/g, "");
		
		// does the campaign ID's equate
		if(!chainCampaignID.equals(ipfsCampaignID))
			return callback("Invalid IPFS data schema, must have matching campaign ID's", null);
		
		// setup funding goal big numbers
		var ipfsFundingGoal = new BigNumber(ipfsData.campaignSchema.fundingGoal),
			chainFundingGoal = new BigNumber(chainData.fundingGoal);
		
		// do the funding goals equate
		if(!ipfsFundingGoal.equals(chainFundingGoal))
			return callback("Invalid IPFS data schema, campaign funding goals must be matching", null);
		
		// is the avatar image of a valid extention
		if(ipfsAvatarExtension != 'jpeg' && ipfsAvatarExtension != 'jpg' && ipfsAvatarExtension != 'png')
			return callback("Invalid campaign avatar image extension (must be jpg, jpeg or png)", null);
		
		// is the banner image of a valid extention
		if(ipfsBannerExtension != 'jpeg' && ipfsBannerExtension != 'jpg' && ipfsBannerExtension != 'png')
			return callback("Invalid campaign banner image extension (must be jpg, jpeg or png)", null);
		
		// Check data kinds
		/*_.each(Object.keys(ipfsData.campaignSchema), function(key, index){
			if(!_.isNumber(ipfsData.campaignSchema[key])
			   && !_.isString(ipfsData.campaignSchema[key])
			   && !_.isBoolean(ipfsData.campaignSchema[key]))
				return callback("Invalid IPFS data schema, campaign data structure must be strings, bools and numbers only", null);
		});*/
		
		// setup config address as nothing
		if(ipfsData.campaignSchema.config == '')
			ipfsData.campaignSchema.config = web3.address(0);
		
		// setup campaign owner as nothing
		if(_.isUndefined(ipfsData.campaignSchema.owner)) // temp fix
			ipfsData.campaignSchema.owner = web3.address(0);
		
		// check addresses
		if(!web3.isAddress(ipfsData.campaignSchema.beneficiary)
		   || !web3.isAddress(ipfsData.campaignSchema.config)
		   || !web3.isAddress(ipfsData.campaignSchema.owner))
			return callback("Invalid IPFS data schema, campaign owner, beneficiary and config must be valid Ethereum addresses", null);
		
		// return true
		return callback(null, true);
	}catch(err){
		return callback(err, null);
	}
};

// Build Persona Standard Repository
objects.helpers.importPersona = function(personaAddress, callback){
	personaAddress = Helpers.cleanAscii(personaAddress);
	
	if(!web3.isAddress(personaAddress))
		return callback('Invalid address', null);
	
	if(_.isUndefined(callback))
		callback = function(e,r){};
		
	// get persona atributes
	objects.contracts.PersonaRegistry.getPersonaAttributes(personaAddress, function(err, ipfsHashHex){
		try {
			if(err)
				return callback(err, null);

			// build ipfs hash from hex
			var ipfsHash = ipfs.utils.hexToBase58(ipfsHashHex.slice(2));
			
			// get ipfs object stats
			ipfs.api.object.stat(ipfsHash, function(err, ipfsDataStats) {		
				if(err)
					return callback(err.Message, null);
				
				// Check repository size
				if(ipfsDataStats.CumulativeSize > 300)
					return callback('Cumulative IPFS repository size exceeds max size limit (the repository is just too big)', null);// get IPFS hash
			
				// Load repository
				ipfs.catJson(ipfsHash, function(err, ipfsData){			
					if(err)
						return callback(err.Message, null);

					// Clean IPFS Data w/ Google's Caja
					ipfsData = Helpers.cleanXSS(ipfsData);

					// build persona return object
					var personaObject = {
						address: personaAddress,
						dataHex: ipfsHashHex,
						ipfsHash: ipfsHash,
						isValid: true,
						dataValid: true,
						dataError: '',
						data: ipfsData
					};

					if(personaObject.isValid)
						Personas.upsert({address: personaObject.address}, personaObject);

					return callback(err, personaObject);
				});
			});
		}catch(err){
			return callback(err, null);
		}
	});
};

// Build Campaign Import Method
objects.helpers.importCampaign = function(campaignID, callback){
	// clean campaign ID
	campaignID = Helpers.cleanAscii(campaignID);
	
	// set undefined callback, if any
	if(_.isUndefined(callback))
		callback = function(e,r){};
	
	// import campaign data from the Ethereum blockchain
	objects.contracts.WeiFund.campaigns(campaignID, function(err, campaignRaw){
		try {
			if(err)
				return callback(err, null);

			// setup campaign object
			var campaign = web3.returnObject('campaigns', campaignRaw, objects.contracts.WeiFund.abi);
			campaign.id = String(campaignID);
			campaign.isValid = true;
			campaign.data = {};
			campaign.status = {type: 'open'};
			campaign.progress = 0;
			campaign.account = web3.address(0);
			campaign.validAccount = false;

			// is the campaign valid?
			if(new BigNumber(campaign.created).equals(0))
				campaign.isValid = false;

			// build amount and funding big numbers
			var amountRaised = new BigNumber(campaign.amountRaised),
				fundingGoal = new BigNumber(campaign.fundingGoal);

			// build progress property
			campaign.progress = Math.round(amountRaised.dividedBy(fundingGoal) * 100);

			// has the campaign failed? set status
			if(moment().unix() > parseInt(campaign.expiry)
			   && amountRaised.lessThan(fundingGoal))
				campaign.status = {type: 'failed', reason: 'expired'};

			// is the campaign a success, build a status
			if(amountRaised.greaterThanOrEqualTo(fundingGoal)) {
				campaign.status = {type: 'success', reason: 'reached'};
				campaign.progress = 100;	
			}

			// is the campaign paid out, set status
			if(campaign.paidOut) {
				campaign.status = {type: 'paidout'};
				campaign.progress = 100;	
			}

			// if campaign progress is too high, set to 100
			if(campaign.progess > 100)
				campaign.progress = 100;

			// set campaign num contributors to integer
			campaign.numContributions = campaign.numContributions; //maybe error here

			// set campaign created property to integer
			campaign.created = parseInt(campaign.created);

			// return first callback
			callback(err, campaign);

			// Insert into Campaign collection
			if(campaign.isValid)
				Campaigns.upsert({id: campaign.id}, campaign);
			
			// get weiaccount if any
			objects.contracts.WeiAccounts.accountOf(campaignID, function(err, account){
				if(err)
					return callback(err, null);
				
				if(account != web3.address(0) && web3.isAddress(account) && account != '0x')
					campaign.validAccount = true;
				
				// set campaign contribution account
				campaign.account = account;

				// get WeiHash campaign hash
				objects.contracts.WeiHash.hashOf(campaignID, function(err, hashRaw){
					if(err)
						return callback(err, null);

					// set rawHash data
					campaign.hashRaw = hashRaw;

					// if hash is IPFS Hash... needs better filter
					if(hashRaw != '0x' && hashRaw.length > 5) {
						campaign.hash = ipfs.utils.hexToBase58(hashRaw.slice(2));

						// return second callback
						callback(err, campaign);
						
						// Insert into Campaign collection
						if(campaign.isValid)
							Campaigns.upsert({id: campaign.id}, campaign);

						// get ipfs object stats
						ipfs.api.object.stat(campaign.hash, function(err, ipfsDataStats) {
							// no IPFS data statistics available
							if(ipfsDataStats == null)
								return callback('IPFS repository is not available. No statistics could be gathered.', null);
							
							// Check repository size
							if(ipfsDataStats.CumulativeSize > 2000)
								return callback('Cumulative IPFS campaign repository size exceeds max size limit (the repository is just too big)', null);

							// Lookup Campaign Data
							ipfs.catJson(campaign.hash, function(err, ipfsData){
								if(err)
									return callback(err.Message, null);

								// Clean IPFS Data w/ Google's Caja
								ipfsData = Helpers.cleanXSS(ipfsData);

								// validate IPFS hash against campaign data
								objects.helpers.validateCampaignData(campaign, ipfsData, function(err, result){
									if(err) {
										campaign.dataValid = false;
										campaign.dataError = err;
									}else{
										campaign.dataValid = true;
										campaign.dataError = null;
										campaign.data = ipfsData.campaignSchema;
									}

									// Insert into Campaign collection
									if(campaign.isValid)
										Campaigns.upsert({id: campaign.id}, campaign);

									callback(null, campaign);
								});
							});
						});
					}else{
						campaign.dataValid = false;
						campaign.dataError = 'No valid IPFS hash stored';

						callback(null, campaign);
					}
				});
			});
		}catch(err){
			return callback(err, null);
		}
	});
};

// Build Contribution Import Method
objects.helpers.importContribution = function(campaignID, contributionID, callback) {
	campaignID = Helpers.cleanAscii(campaignID),
	contributionID = Helpers.cleanAscii(contributionID);
	
	if(_.isUndefined(callback))
		callback = function(e,r){};
	
	// get contribution at contribution ID
	objects.contracts.WeiFund.contributionAt(campaignID, contributionID, function(err, contributionRaw){
		if(err)
			return callback(err, null);

		// setup contribution object and amount contributed big number
		var contribution = web3.returnObject('contributionAt', contributionRaw, objects.contracts.WeiFund.abi),
			amountContributed = new BigNumber(contribution.amountContributed);

		// setup contribution db entry defaults
		contribution.isValid = true;
		contribution.campaignID = campaignID;
		contribution.id = contributionID;
		contribution.created = parseInt(contribution.created);

		// check contributor address, amount validation and set valid bool
		if(contribution.contributor == web3.address(0)
		   || amountContributed.equals(0))
			contribution.isValid = false;
		
		// If the contribution data is valid, insert into local store
		if(contribution.isValid)
			Contributions.upsert({campaignID: campaignID, id: contribution.id}, contribution);

		// callback results
		callback(err, contribution);
	});
};

// Build Contributor Import Method
objects.helpers.importContributor = function(campaignID, contributorAddress, callback) {
	campaignID = Helpers.cleanAscii(campaignID),
	contributorAddress = Helpers.cleanAscii(contributorAddress);
	
	if(_.isUndefined(callback))
		callback = function(e,r){};
	
	// is the account a campaign contributor
	objects.contracts.WeiFund.isContributor(campaignID, contributorAddress, function(err, isContributor){
		if(err)
			return callback(err, null);
		
		// if not contirbutor return nothing
		if(!isContributor)
			return callback(null, null);
		
		// get total contributions count
		objects.contracts.WeiFund.totalContributionsBy(campaignID, contributorAddress, function(err, numContributions){
			if(err)
				return callback(err, null);

			// if no contributions count, return null
			if(numContributions.equals(0))
				return callback(null, null);

			// index through contributions, contributions can have multiple contributions
			for(var contributionIndex = 0; contributionIndex < numContributions.toNumber(10); contributionIndex++){
				
				// get contribution ID given the contribution index
				objects.contracts.WeiFund.contributionID(campaignID, contributorAddress, contributionIndex, function(err, contributionID){
					if(err)
						return callback(err, null);
					
					// import contribution by ID
					objects.helpers.importContribution(campaignID, contributionID, callback);
				});
			}
		});
	});
};