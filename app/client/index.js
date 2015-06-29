
// disconnect any meteor server
if(location.host !== 'localhost:3000' && location.host !== '127.0.0.1:3000')
    Meteor.disconnect();


// Set the default unit to ether
if(!LocalStore.get('etherUnit'))
    LocalStore.set('etherUnit', 'ether');


// Set the default rpc provider address
//if(!LocalStore.get('rpcProvider'))
    LocalStore.set('rpcProvider', 'http://192.168.0.11:8545/');


// Set the default weifund contract address
//if(!LocalStore.get('weifundAddress'))
    LocalStore.set('weifundAddress', '0xb187f9af7a8fc40cd06437e2f37a491916efada3');


// Set The Default NameReg Address
if(!LocalStore.get('nameregAddress'))
    LocalStore.set('nameregAddress', '0xe56109cbc37ba06ff5aa14fef1a2573b8d03ff2b');


// Set The Default NameReg Address
if(!LocalStore.get('numCampaigns'))
    LocalStore.set('numCampaigns', 0);


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
    
    //Campaigns.remove({});
    
    // Set web3 RPC Provider    
    web3.setProvider(new web3.providers.HttpProvider(LocalStore.get('rpcProvider')));
    
    // Set WeiFund Address
    WeiFund.address = LocalStore.get('weifundAddress');
    
    // Set NameReg Address
    NameReg.address = LocalStore.get('nameregAddress');
    
    // If new campaigns, load them
    Meteor.setInterval(function(){
        WeiFund.numCampaigns(function(err, numCampaigns){
            numCampaigns = numCampaigns.toNumber(10);
            var seperation = 1;
            
            if(LocalStore.get('numCampaigns') == numCampaigns)
                return;
            
            seperation = numCampaigns - Session.get('start');            
            LocalStore.set('numCampaigns', numCampaigns);
            Campaigns.load(numCampaigns - seperation, seperation);
        });
    }, 10000);
    
    // Load Web3 Accounts from the geth node
    Accounts.load();
    
    // Load Categories
    Categories.load(TAPi18n.__("dapp.app.categories", {returnObjectTrees: true}));

	// Set Meta Title
	Meta.setTitle(TAPi18n.__("dapp.app.title"));
});
