/**
Helper functions

@module web3
**/

/**
Is the object provided a Bignumber object.

@method (isBigNumber)
**/

web3.isBigNumber = function(value){
    if(_.isUndefined(value) || !_.isObject(value))
        return false;
    
    return (value instanceof BigNumber) ? true : false;
};


/**
Return a valid web3 address. If input param 'value' is zero, it will generate address '0x0000'.

@method (address)
@param {String|Number} value     The valud to transform into an address.
**/

web3.address = function(value){
    var nullAddress = '0x0000000000000000000000000000000000000000';
    
    if(value == 0 
       || parseInt(value) == 0)
        return nullAddress;
    
    if(value.substr(0, 2) == '0x')
        value = '0x' + value;
    
    if(value.length > 42 
       || value.length < 42)
        value = nullAddress;
    
    return value;
};


/**
An accounts minimongo container for mongodb.

@method (AccountsMinimongo)
@param {Object} The mongodb object to transform
**/

web3.AccountsMinimongo = function(mongodb){
    // Get The Web3 Accounts
    mongodb.load = function(callback){
        if(_.isUndefined(callback))
            callback = function(e, r){};
        
        web3.eth.getAccounts(function(err, result){
            callback(err, result);
            
            if(err)
                return;

            _.each(result, function(address, addressIndex){
                Accounts.update({id: addressIndex}, {$set: {address: address, id: addressIndex}, $setOnInsert: {address: address, id: addressIndex}}, {upsert: true});
            });
        });
    };
};