
// disconnect any meteor server
if(location.host !== 'localhost:3000' && location.host !== '127.0.0.1:3000')
    Meteor.disconnect();

// Set the default unit to ether
if(!LocalStore.get('etherUnit'))
    LocalStore.set('etherUnit', 'ether');

// Set the default rpc provider address
//if(!LocalStore.get('rpcProvider'))
LocalStore.set('rpcProvider', 'http://104.236.65.136:8545/');

// Set the default rpc provider address
//if(!LocalStore.get('ipfsProvider'))
LocalStore.set('ipfsProvider', {host: '104.131.53.68', port: 5001});

// Agred to Terms
if(!LocalStore.get('agreed'))
	LocalStore.set('agreed', false);

// Is Setup
if(!LocalStore.get('setup'))
	LocalStore.set('setup', false);
	
// Select Default Account
if(LocalStore.get('defaultAccount'))
	web3.eth.defaultAccount = LocalStore.get('defaultAccount');
else
	LocalStore.set('defaultAccount', web3.address(0));

// OBJECTS
objects = {
	contracts: {
		WeiFund: WeiFund.at('0xd04c11c90d3c7f6b50a3c407ef4c66f1aeda51a9'),
		WeiHash: WeiHash.at('0x566a9a9fee53025871c50adbdf302717ecb248fc'),
		PersonaRegistry: PersonaRegistry.at('0xd7c6faea52c46116ea726a55f3e9179b6ad9f8e2'),
	},
	helpers: {},
};

objects.helpers.validateCampaignData = function(chainData, ipfsData, callback){
	try {
		if(!_.has(ipfsData, 'campaignSchema'))
			return callback("Invalid IPFS data schema, must contain `campaignSchema`", null);
		
		//if(Object.keys(ipfsData).length != 1)
		//	return callback("Invalid IPFS data schema, data must have one property", null);
		
		//console.log(Object.keys(ipfsData.campaignSchema).length);
		
		//if(Object.keys(ipfsData.campaignSchema).length != 14) // change after
		//	return callback("Invalid IPFS data schema, campaignSchema must have 14 properties", null);
		
		if(chainData.beneficiary != ipfsData.campaignSchema.beneficiary)
			return callback("Invalid IPFS data schema, must have matching campaign beneficiaries", null);
		
		var chainCampaignID = new BigNumber(chainData.id),
			ipfsCampaignID = new BigNumber(ipfsData.campaignSchema.id),
			ipfsAvatarExtension = ipfsData.campaignSchema.avatar.contentUrl.split('.').pop(),
			ipfsBannerExtension = ipfsData.campaignSchema.banner.contentUrl.split('.').pop();
		
		console.log(ipfsAvatarExtension, ipfsBannerExtension);
		
		if(!chainCampaignID.equals(ipfsCampaignID))
			return callback("Invalid IPFS data schema, must have matching campaign ID's", null);
		
		var ipfsFundingGoal = new BigNumber(ipfsData.campaignSchema.fundingGoal),
			chainFundingGoal = new BigNumber(chainData.fundingGoal);
		
		if(!ipfsFundingGoal.equals(chainFundingGoal))
			return callback("Invalid IPFS data schema, campaign funding goals must be matching", null);
		
		if(ipfsAvatarExtension != 'jpeg' && ipfsAvatarExtension != 'jpg' && ipfsAvatarExtension != 'png')
			return callback("Invalid campaign avatar image extension (must be jpg, jpeg or png)", null);
		
		if(ipfsBannerExtension != 'jpeg' && ipfsBannerExtension != 'jpg' && ipfsBannerExtension != 'png')
			return callback("Invalid campaign banner image extension (must be jpg, jpeg or png)", null);
		
		// Check data kinds
		/*_.each(Object.keys(ipfsData.campaignSchema), function(key, index){
			if(!_.isNumber(ipfsData.campaignSchema[key])
			   && !_.isString(ipfsData.campaignSchema[key])
			   && !_.isBoolean(ipfsData.campaignSchema[key]))
				return callback("Invalid IPFS data schema, campaign data structure must be strings, bools and numbers only", null);
		});*/
		
		if(ipfsData.campaignSchema.config == '')
			ipfsData.campaignSchema.config = web3.address(0);
		
		if(_.isUndefined(ipfsData.campaignSchema.owner)) // temp fix
			ipfsData.campaignSchema.owner = web3.address(0);
		
		if(!web3.isAddress(ipfsData.campaignSchema.beneficiary)
		   || !web3.isAddress(ipfsData.campaignSchema.config)
		   || !web3.isAddress(ipfsData.campaignSchema.owner))
			return callback("Invalid IPFS data schema, campaign owner, beneficiary and config must be valid Ethereum addresses", null);
		
		return callback(null, true);
	}catch(err){
		return callback(err, null);
	}
};

objects.helpers.importCampaign = function(campaignID, callback){
	campaignID = Helpers.cleanAscii(campaignID);
	
	objects.contracts.WeiFund.campaigns(campaignID, function(err, campaignRaw){
		if(err)
			return callback(err, null);
		
		// setup campaign object
		var campaign = web3.returnObject('campaigns', campaignRaw, objects.contracts.WeiFund.abi);
		campaign.id = String(campaignID);
		campaign.isValid = true;
		campaign.data = {};
		campaign.status = {type: 'open'};
		campaign.progress = 0;
		
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
		
		// return first callback
		callback(err, campaign);
		
		// get WeiHash campaign hash
		objects.contracts.WeiHash.hashOf(campaignID, function(err, hashRaw){
			if(err)
				return callback(err, null);
			
			// set rawHash data
			campaign.hashRaw = hashRaw;
			
			// if hash is IPFS Hash... needs better filter
			if(hashRaw != '0x' && hashRaw.length > 5) {
				campaign.hash = ipfs.utils.hexToBase58(hashRaw.slice(2));
			
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
						
						callback(null, campaign);
					});
				});
			}else{
				campaign.dataValid = false;
				campaign.dataError = 'No valid IPFS hash stored';
				
				callback(null, campaign);
			}
		});
	});
};

objects.helpers.importContributor = function(campaignID, contributorIDOrAddress, callback) {
	campaignID = Helpers.cleanAscii(campaignID),
	contributorIDOrAddress = Helpers.cleanAscii(contributorIDOrAddress);
	
	objects.contracts.WeiFund.contributorID(campaignID, contributorIDOrAddress, function(err, contributorID){
		if(err)
			return callback(err, null);
		
		if(!web3.isAddress(contributorIDOrAddress))
			contributorID = contributorIDOrAddress;	
		
		objects.contracts.WeiFund.contributorAt(campaignID, contributorID, function(err, contributorRaw){
			if(err)
				return callback(err, null);

			var contributor = web3.returnObject('contributorAt', contributorRaw, objects.contracts.WeiFund.abi),
				amountContributed = new BigNumber(contributor.amountContributed);

			contributor.isValid = true;
			contributor.campaignID = campaignID;
			contributor.id = contributorID;

			if(contributor.contributor == web3.address(0)
			   || amountContributed.equals(0))
				contributor.isValid = false;

			callback(err, contributor);
		});
	});
};


// Set Session default values for components
if (Meteor.isClient) {
	Session.setDefault('start', 0);
}

// When Meteor starts up
Meteor.startup(function() {
    // SET default language
    if(Cookie.get('TAPi18next')) {
        TAPi18n.setLanguage(Cookie.get('TAPi18next'));
    } else {
        var userLang = navigator.language || navigator.userLanguage,
        availLang = TAPi18n.getLanguages();

        // set default language
        if (_.isObject(availLang) && availLang[userLang]) {
            TAPi18n.setLanguage(userLang);
        } else if (_.isObject(availLang) && availLang[userLang.substr(0,2)]) {
            TAPi18n.setLanguage(userLang.substr(0,2));
        } else {
            TAPi18n.setLanguage('en');
        }
		
		// Set Parsley Form Validator Language
        ParsleyValidator.setLocale(TAPi18n.getLanguage().substr(0,2));
    }

    // Set moment and numeral i18n settings
    Tracker.autorun(function(){
        if(_.isString(TAPi18n.getLanguage())) {
            moment.locale(TAPi18n.getLanguage().substr(0,2));
            numeral.language(TAPi18n.getLanguage().substr(0,2));
        }
    });
	
	// Set Provider
    web3.setProvider(new web3.providers.HttpProvider(LocalStore.get('rpcProvider')));
	
	// IPFS Provider
	ipfs.setProvider({host: LocalStore.get('ipfsProvider').host, port: LocalStore.get('ipfsProvider').port});
	
	// Set Default Account
	web3.eth.getAccounts(function(err, result){
		if(err)
			return;

		LocalStore.set('defaultAccount', result[0]);
		web3.eth.defaultAccount = result[0];
	});
	
	// When new campaigns are created, import that campaign
	objects.contracts.WeiFund.CampaignCreated(function(err, result){
		if(err)
			return;
		
		var campaignID = result.args._campaignID;
		
		objects.helpers.importCampaign(campaignID, function(err, result){
			console.log('New campaign created', err, result);
		});
	});
	
    // Load In Categories
    _.each(TAPi18n.__("dapp.app.categories", {returnObjectTrees: true}), function(category, categoryIndex){
        Categories.upsert({id: categoryIndex}, {$set: {id: categoryIndex, name: category}});
    });

	// Set Meta Title
	Meta.setTitle(TAPi18n.__("dapp.app.title"));
});
