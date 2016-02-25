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
The default gas amount to be used.

@var (defaultGas)
@return (Number) the default gas amount.
**/

web3.eth.defaultGas = 3000000;


/**
Build return object from array and ABI.

@method (returnObject)
@param {String} method     The name of the method in question
@param {Array} resultArray The result array values from the call
@param {Object} abi        The abi data
**/

web3.returnObject = function(method, resultArray, abi){
    var return_object = {},
        methodIndex = null;
    
    if(_.isUndefined(method)
       || _.isUndefined(resultArray)
       || _.isUndefined(abi))
        return return_object;
    
    _.each(abi, function(property, propertyIndex){
        if(property.name == method)
            methodIndex = propertyIndex;
    });
    
    if(methodIndex == null)
        return return_object;
    
    if(!_.isArray(resultArray))
        resultArray = [resultArray];
    
    _.each(abi[methodIndex].outputs, function(item, itemIndex){
        return_object[item.name] = resultArray[itemIndex];
        
        if(resultArray[itemIndex] instanceof BigNumber) {
            return_object[item.name] = return_object[item.name].toString(10);
        }
    });
    
    return return_object;
};