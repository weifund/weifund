/**
Template Controllers

@module Templates
*/

/**
A NameReg toName async template for loading names from NameReg on the fly.

@class [template] components_deploy
@constructor
*/

Template['components_toName'].rendered = function(){    
    /*var template = this;
    var account = Names.findOne({address: this.data}),
        address = this.data,
        nameregInstance = NameReg.at(LocalStore.get("nameregAddress"));
    
    if(_.isUndefined(account))
        account = {};
    
    if(!_.isUndefined(account.name))
        TemplateVar.set(template, 'name', account.name.replace(/[^a-zA-Z0-9 ]/g, ''));
    
    nameregInstance.toName.call(address, function(err, result){
        if(err)
            return;
        
        Names.upsert({address: address}, 
                     {address: address, 
                      name: String(web3.toAscii(result)).trim()});
    });*/
};
