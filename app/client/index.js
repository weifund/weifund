
// disconnect any meteor server
if(location.host !== 'localhost:3000' && location.host !== '127.0.0.1:3000')
    Meteor.disconnect();

// Set the default unit to ether
if(!LocalStore.get('etherUnit'))
    LocalStore.set('etherUnit', 'ether');

// Set the default rpc provider address
if(!LocalStore.get('rpcProvider'))
	LocalStore.set('rpcProvider', 'http://localhost:8545');

// Set the default rpc provider address
if(!LocalStore.get('ipfsProvider'))
	LocalStore.set('ipfsProvider', {host: 'localhost', port: 5001});

// Set the default rpc provider address
if(!LocalStore.get('contracts'))
	LocalStore.set('contracts', {
		WeiFund: '0xe17510a20abf854d892db69d99d8040e262bd681',
		WeiHash: '0x854b8e3eb702cfb9c1d4aa51c666f57bbaebb5fc',
		PersonaRegistry: '0xfa7027237757dc5c779a9f50e9805522b9509f88',
		WeiAccounts: '0x85257df5f47485cc331d935120bb027405236a35',
		WeiControllerFactory: '',
		MultiServiceFactory: '',
		StaffPicks: '',
	});

// Agreed to Terms
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
	
	// Metamask Support & set provider
	//if(LocalStore.get('rpcProvider') == 'metamask')
    	//web3.setProvider(new web3.providers.HttpProvider(window.web3.currentProvider));
	//else
	
	if(LocalStore.get('rpcProvider') != 'metamask')
    	web3.setProvider(new web3.providers.HttpProvider(LocalStore.get('rpcProvider')));
	
	// IPFS Provider given local store data
	ipfs.setProvider(LocalStore.get('ipfsProvider'));
	
	// update the selected account balance
	function updateSelectedAccountBalance(){
		web3.eth.getBalance(web3.eth.defaultAccount, function(err, balance){
			if(err)
				return;
			
			Session.set('defaultAccountBalance', balance.toString(10));
		});
	}
	
	// check selected account balance
	Meteor.setInterval(updateSelectedAccountBalance, 3000);
	
	// Set Default Account
	web3.eth.getAccounts(function(err, result){
		if(err)
			return;

		LocalStore.set('defaultAccount', result[0]);
		Session.set('defaultAccount', result[0]);
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
