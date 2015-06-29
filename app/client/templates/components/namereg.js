Template['components_namereg'].events({

	/**
	Register a name to your address.
	
	@event (click #register)
	*/

	"click #register": function(event, template){ // Create Contract
        NameReg.register($('#nameregName').val(), function(regErr, regResult){
            if(regErr) {
                TemplateVar.set(template, 'nameregMsg', regErr); 
                return;
            }
            
            Session.set('nameregMsg', 'Your name is being registered...');
            
            NameReg.AddressRegistered({account: NameReg.defaultFrom()}, function(err, result, filter){
                if(err)
                    TemplateVar.set(template, 'nameregMsg', 'There was a problem registering: ' + String(err));
                else
                    TemplateVar.set(template, 'nameregMsg', 'Your registered!');
                
                filter.stopWatching();
            });
        });
	},

	/**
	Unregister your name.
	
	@event (click #unregister)
	*/

	"click #unregister": function(event, template){ // Create Contract
        NameReg.unregister(function(err, result){
            if(err) {
                TemplateVar.set(template, 'nameregMsg', 'There was an error unregistering your account: ' + String(err));
                return;
            }
            
            TemplateVar.set(template, 'nameregMsg', 'Your account is being unregistered...');
            
            NameReg.AddressDeregistered({account: NameReg.defaultFrom()}, function(eventErr, eventResult, filter){
               if(eventErr)
                   TemplateVar.set(template, 'nameregMsg', 'There was an error deregistering your account: ' + String(eventErr));
                else
                    TemplateVar.set(template, 'nameregMsg', 'Account deregistered!');
                
                filter.stopWatching();
            });
        });
    },

	/**
	Lookup an address.
	
	@event (click #toAddress)
	*/

	"click #toAddress": function(event, template){ // Create Contract
        TemplateVar.set(template, 'nameregMsg', 'Looking up address of name...');
        
        NameReg.toAddress($('#nameregName').val(), function(err, result){
            if(err)
                TemplateVar.set(template, 'nameregMsg', 'There was an error getting the address: ' + String(err));
            else
                TemplateVar.set(template, 'nameregMsg', 'The address of this name is: ' + String(result));
        });
    },
        
        

	/**
	Get the name of a specific address.
	
	@event (click #toName)
	*/

	"click #toName": function(event, template){ // Create Contract
        TemplateVar.set(template, 'nameregMsg', 'Looking up name of address...');
        
        NameReg.toName($('#nameregName').val(), function(err, result){
            if(err)
                TemplateVar.set(template, 'nameregMsg', 'There was an error getting the name: ' + String(err));
            else
                TemplateVar.set(template, 'nameregMsg', 'The name of this address is: ' + String(result));
        });
    },
        
        

	/**
	Deploy the NameReg Contract.
	
	@event (click #nameregDeploy)
	*/

	"click #nameregDeploy": function(event, template){ // Create Contract
        TemplateVar.set(template, 'nameregMsg', 'Deploying your NameReg contract... <i class="fa fa-spinner fa-pulse"></i>');
        
        NameReg.deploy(function(err, result, mined){
            if(err)
                TemplateVar.set(template, 'nameregMsg', 'There was an error deploying your NameReg contract: ' + String(err));
            
            if(!mined)
                return;
            
            TemplateVar.set(template, 'nameregMsg', 'Your NameReg contract has been deployed! Please change the "app/client/index.js" LocalStore.set("nameregAddress", "YOUR_NAMEREG_ADDRESS"); variable to the address provided above.');
            $('#nameregName').val(result.address);   
            NameReg.address = result.address;
            LocalStore.set('nameregAddress', result.address);
        });
    },
});