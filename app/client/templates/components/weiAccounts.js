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

Template['components_weiAccounts'].created = function(){
    TemplateVar.set('deployAccountsState', {isUndeployed: true});
};

Template['components_weiAccounts'].rendered = function(){
	template = this;
};

Template['components_weiAccounts'].helpers({
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

Template['components_weiAccounts'].events({
    /**
    Deploy the WeiHash contract.

    @event (click #weifundDeploy)
    **/

    'click #deployWeiAccounts': function(event, template){   
		if(!confirm("Are you sure you want to deploy a WeiHash contract?"))
			return;
		
		// set new WeiFund address and TX object
        var weifundAddress = objects.contracts.WeiFund.address,
			transactionObject = {
               data: '0x' + WeiAccounts.bytecode,
               gas: web3.eth.defaultGas,
               from: web3.eth.defaultAccount
            };
        
		// create new WeiAccounts contract
        WeiAccounts.new(weifundAddress, transactionObject, function(err, result){
            if(err)
                return TemplateVar.set(template, 'deployAccountsState', {isError: true, error: err});
            
			// set state as mining
			TemplateVar.set(template, 'deployAccountsState', {isMining: true, transactionHash: result.transactionHash});

			// set state as mined
			if(result.address)
				TemplateVar.set(template, 'deployAccountsState', {isMined: true, address: result.address, transactionHash: result.transactionHash});
        });
		
		// Prevent Double Click
		$(event.currentTarget).prop('disabled', true); 
    },
	
    /**
    Register a hash with WeiHash.

    @event (click #weihashRegister)
    **/

    'click #newAccount': function(event, template){
		if(!confirm("Are you sure you want to register this hash with WeiHash?"))
			return;
		
		// Prevent Double Click
		$(event.currentTarget).prop('disabled', true); 
		
		// set campaign ID, 
		var campaignID = Helpers.cleanAscii($('#newAccountCampaignID').val()),
			transactionObject = {
				from: web3.eth.defaultAccount,
				gas: web3.eth.defaultGas
			},
			filterObject = {
				_campaignID: campaignID,
			};
		
		objects.contracts.WeiAccounts.newCampaignAccount(campaignID, transactionObject, function(err, result){
			if(err)
				return TemplateVar.set(template, 'newAccountState', {isError: true, error: err});
			
			// set new account state
			TemplateVar.set(template, 'newAccountState', {isMining: true, transactionHash: result});
		});
		
		objects.contracts.WeiAccounts.AccountCreated(filterObject, function(err, result){
			if(err)
				return TemplateVar.set(template, 'newAccountState', {isError: true, error: err});
			
			if(result)
				TemplateVar.set(template, 'newAccountState', {isMined: true, transactionHash: result});
		});
    },
	
    /**
    Lookup a hash on the WeiHash registery.

    @event (click #weihashLookup)
    **/

    'click #lookupAccount': function(event, template){
		var campaignID = Helpers.cleanAscii($('#lookupAccountCampaignID').val());
			
		objects.contracts.WeiAccounts.accountOf(campaignID, function(err, result){
			if(err)
				return TemplateVar.set(template, 'lookupAccountState', {isError: true, error: err});
			
			TemplateVar.set(template, 'lookupAccountState', {isSuccess: true, campaignID: campaignID, account: result});
		});
    },
});