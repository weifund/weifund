var account = EthAccounts.findOne({name: 'Etherbase'}),
    defaultTransactionObject = {
    gas: 3000000,
    from: LocalStore.get('selectedAccount')
};

Template['components_namereg'].events({

	/**
	Register a name to your address.
	
	@event (click #register)
	*/

	"click #register": function(event, template){ // Create Contract
        var value = $('#nameregValue').val(),
            filterObject = {
                address: defaultTransactionObject.from
            },
            transactionCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {isError: true, error: err});
                
                if(!err)
                    TemplateVar.set(template, 'state', {isMining: true});
            },
            eventCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {isError: true, error: err});

                if(result)
                    return TemplateVar.set(template, 'state', {isRegistered: true});
            };
        
        nameregInstance.register.sendTransaction(value, defaultTransactionObject, transactionCallback);
        nameregInstance.AddressRegistered(filterObject, eventCallback);
	},

	/**
	Unregister your name.
	
	@event (click #unregister)
	*/

	"click #unregister": function(event, template){ // Create Contract
        var value = $('#nameregValue').val(),
            filterObject = {
                address: defaultTransactionObject.from
            },
            transactionCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {isError: true, error: err});
                
                if(!err)
                    TemplateVar.set(template, 'state', {isMining: true});
            },
            eventCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {isError: true, error: err});

                if(result)
                    return TemplateVar.set(template, 'state', {isUnregistered: true});
            };
        
        nameregInstance.unregister.sendTransaction(value, defaultTransactionObject, transactionCallback);
        nameregInstance.AddressDeregistered(filterObject, eventCallback);
    },

	/**
	Lookup an address.
	
	@event (click #toAddress)
	*/

	"click #toAddress": function(event, template){ // Create Contract
        var value = $('#nameregValue').val();
        
        nameregInstance.toAddress.call(value, function(err, result){
            if(err)
                return TemplateVar.set(template, 'state', {isError: true, error: err});
            
            if(!err)
                $('#nameregValue').val(result);
        });
    },
        
        

	/**
	Get the name of a specific address.
	
	@event (click #toName)
	*/

	"click #toName": function(event, template){ // Create Contract
        var value = $('#nameregValue').val();
        
        if(!web3.isAddress(value))
            return TemplateVar.set(template, 'state', {isError: true, error: 'This value is not a valid Ethereum address.'});
        
        nameregInstance.toName.call(value, function(err, result){
            if(err)
                return TemplateVar.set(template, 'state', {isError: true, error: err});
            
            if(!err)
                $('#nameregValue').val(web3.toAscii(result));
        });
    },
        
        

	/**
	Deploy the NameReg Contract.
	
	@event (click #nameregDeploy)
	*/

	"click #nameregDeploy": function(event, template){ // Create Contract
        var transactionObject = _.extend(defaultTransactionObject, {
               data: NameReg.code});
        
        NameReg.Contract.new(transactionObject, function(err, result){
            if(err)   
                return TemplateVar.set(template, 'state', {isError: true, error: err});
            
            if(!err) {
                if(!result.address) {
                    TemplateVar.set(template, 'state', {isMining: true});
                } else {
                    TemplateVar.set(template, 'state', {isMined: true, address: result.address});
                    nameregInstance = NameReg.Contract.at( result.address);
                    LocalStore.set('nameregAddress', result.address);
                }
            }
        });
        
    },
});