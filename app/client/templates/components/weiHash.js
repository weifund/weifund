/**
Template Controller

@module Templates
*/

/**
The template to allow easy WeiFund contract deployment.

@class [template] components_weihash
@constructor
*/

var template;

Template['components_weihash'].created = function(){
    TemplateVar.set('state', {isUndeployed: true});
};

Template['components_weihash'].rendered = function(){
	template = this;
	
	web3.eth.getBalance(web3.eth.defaultAccount, function(err, result){
		TemplateVar.set(template, 'accountBalance', web3.fromWei(result, 'ether'));
	});
};


Template['components_weihash'].helpers({
	'selectedAccount': function(){
		return web3.eth.defaultAccount;	
	},
	'accountBalance': function(){
		return TemplateVar.get('accountBalance');
	},
	'gasAmount': function(){
		return web3.eth.defaultGas;	
	},
	'estimateGas': function(){
		return 1906742;	
	},
	'weifundAddress': function(){
		return objects.contracts.WeiFund.address;	
	},
});

Template['components_weihash'].events({
    /**
    Deploy the WeiHash contract.

    @event (click #weifundDeploy)
    **/

    'click #weihashDeploy': function(event, template){   
		if(!confirm("Are you sure you want to deploy a WeiHash contract?"))
			return;
		
		// Prevent Double Click
		$(event.currentTarget).prop('disabled', true); 
		
        var weifundAddress = objects.contracts.WeiFund.address,
			transactionObject = {
               data: WeiHash.bytecode,
               gas: web3.eth.defaultGas,
               from: web3.eth.defaultAccount
            };
        
        WeiHash.new(weifundAddress, transactionObject, function(err, result){
            if(err)
                return TemplateVar.set(template, 'state', {isError: true, error: err});
            
			TemplateVar.set(template, 'state', {isMining: true, transactionHash: result.transactionHash});

			if(result.address)
				TemplateVar.set(template, 'state', {isMined: true, address: result.address, transactionHash: result.transactionHash});
        });
    },
	
    /**
    Register a hash with WeiHash.

    @event (click #weihashRegister)
    **/

    'click #weihashRegister': function(event, template){
		if(!confirm("Are you sure you want to register this hash with WeiHash?"))
			return;
		
		// Prevent Double Click
		$(event.currentTarget).prop('disabled', true); 
		
		var campaignID = Helpers.cleanAscii($('#registerCampaignID').val()),
			hash = '0x' + ipfs.utils.base58ToHex(Helpers.cleanAscii($('#weihashData').val())),
			transactionObject = {
				from: web3.eth.defaultAccount,
				gas: web3.eth.defaultGas
			},
			filterObject = {
				_campaignID: campaignID,
			};
		
		objects.contracts.WeiHash.register(campaignID, hash, transactionObject, function(err, result){
			if(err)
				return TemplateVar.set(template, 'registerState', {isError: true, error: err});
			
			TemplateVar.set(template, 'registerState', {isMining: true, transactionHash: result});
		});
		
		objects.contracts.WeiHash.HashRegistered(filterObject, function(err, result){
			if(err)
				return TemplateVar.set(template, 'registerState', {isError: true, error: err});
			
			if(result)
				TemplateVar.set(template, 'registerState', {isMined: true, transactionHash: result});
		});
    },
	
    /**
    Lookup a hash on the WeiHash registery.

    @event (click #weihashLookup)
    **/

    'click #weihashLookup': function(event, template){
		var campaignID = Helpers.cleanAscii($('#lookupCampaignID').val());
			
		objects.contracts.WeiHash.hashOf(campaignID, function(err, result){
			if(err)
				return TemplateVar.set(template, 'lookupState', {isError: true, error: err});
			
			var IPFS_hash = ipfs.utils.hexToBase58(result.slice(2));
			
			if(result)
				TemplateVar.set(template, 'lookupState', {isSuccess: true, campaignID: campaignID, rawData: result, decodedData: IPFS_hash});
		});
    },
});