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