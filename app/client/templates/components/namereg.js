Template['components_namereg'].events({

	/**
	Register a name to your address.
	
	@event (click #register)
	*/

	"click #register": function(event, template){ // Create Contract
        NameReg.register($('#nameregName').val(), function(regErr, regResult){
            if(regErr) {
                Session.set('nameregMsg', regErr); 
                return;
            }
            
            Session.set('nameregMsg', 'Your name is being registered...');
            
            NameReg.AddressRegistered({account: NameReg.defaultFrom()}, function(err, result, filter){
                if(err)
                    Session.set('nameregMsg', 'There was a problem registering: ' + String(err));
                else
                    Session.set('nameregMsg', 'Your registered!');
                
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
                Session.set('nameregMsg', 'There was an error unregistering your account: ' + String(err));
                return;
            }
            
            Session.set('nameregMsg', 'Your account is being unregistered...');
            
            NameReg.AddressDeregistered({account: NameReg.defaultFrom()}, function(eventErr, eventResult, filter){
               if(eventErr)
                   Session.set('nameregMsg', 'There was an error deregistering your account: ' + String(eventErr));
                else
                    Session.set('nameregMsg', 'Account deregistered!');
                
                filter.stopWatching();
            });
        });
    },

	/**
	Lookup an address.
	
	@event (click #toAddress)
	*/

	"click #toAddress": function(event, template){ // Create Contract
        Session.set('nameregMsg', 'Looking up address of name...');
        
        NameReg.addressOf($('#nameregName').val(), function(err, result){
            if(err)
                Session.set('nameregMsg', 'There was an error getting the address: ' + String(err));
            else
                Session.set('nameregMsg', 'The address of this name is: ' + String(result));
        });
    },
        
        

	/**
	Get the name of a specific address.
	
	@event (click #toName)
	*/

	"click #toName": function(event, template){ // Create Contract
        Session.set('nameregMsg', 'Looking up name of address...');
        
        NameReg.nameOf($('#nameregName').val(), function(err, result){
            if(err)
                Session.set('nameregMsg', 'There was an error getting the name: ' + String(err));
            else
                Session.set('nameregMsg', 'The name of this address is: ' + String(result));
        });
    },
        
        

	/**
	Deploy the NameReg Contract.
	
	@event (click #nameregDeploy)
	*/

	"click #nameregDeploy": function(event, template){ // Create Contract
        Session.set('nameregMsg', 'Deploying your NameReg contract... <i class="fa fa-spinner fa-pulse"></i>');
        
        NameReg.deploy(function(err, result, mined){
            if(err)
                Session.set('nameregMsg', 'There was an error deploying your NameReg contract: ' + String(err));
            
            if(mined) {
                Session.set('nameregMsg', 'Your NameReg contract has been deployed! Please change the "app/client/lib/nameregConfig.js" NameReg.address variable to the address provided above.');
                $('#nameregName').val(result.address);   
            }
        });
    },
});