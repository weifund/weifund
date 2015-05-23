/**
The NameReg.js API

Requires:
 - Underscore.js v1.8.3+  <http://underscorejs.org/>
 - Web3.js v0.4.2+ <https://github.com/ethereum/web3.js>

Solidity Interface:
contract NameReg{function toAddress(bytes32 )constant returns(address ){}function configAddr()constant returns(address a){}function toName(address )constant returns(bytes32 ){}function register(bytes32 name){}function unregister(){}}
**/

/**
Construct the NameReg.js API object.

@class [Object] NameReg
@constructor
**/

window.NameReg = {};

/**
The NameReg.js contract object.

@method (contractObject)
@return {Object} the contract object
**/

NameReg.ContractObject = function(){
    return web3.eth.contract(this.abi); 
};


/**
The NameReg.js contract instance.

@method (contract)
@return {Object} the contract instance object
**/

NameReg.contract = function(){
    return this.ContractObject().at(this.address);
};


/**
The NameReg.js default from account address

@method (defaultFrom)
@return {String} the default from address
**/

NameReg.defaultFrom = function(){
    return web3.eth.accounts[this.defaultAccount];
};


/**
The NameReg.js default options wrapper.

@method (default)
@param {Object} the transaction or call option param's object
@return {Object} the treated options object
**/

NameReg.default = function(optionsObject){
    if(_.isUndefined(optionsObject)
      || _.isEmpty(optionsObject)
      || !_.isObject(optionsObject))
        optionsObject = {};

    if(!this.useDefaults)
        return optionsObject;

    if(!_.has(optionsObject, 'from'))
        optionsObject.from = this.defaultFrom();

    return optionsObject;
};


/**
The NameReg.js default options wrapper for transactions.

@method (defaultTransaction)
@param {Object} the transaction or call option object
@return {Object} the treated options object
**/

NameReg.defaultTransaction = function(optionsObject){
    optionsObject = this.default(optionsObject);

    if(!this.useDefaults)
        return optionsObject;

    if(!_.has(optionsObject, 'gas'))
        optionsObject.gas = this.defaultGas;

    return optionsObject;
};


/**
The NameReg.js default options object wrapper for calls.

@method (defaultCall)
@param {Object} the call option object
@return {Object} the treated options object
**/

NameReg.defaultCall = function(optionsObject){
    optionsObject = this.default(optionsObject);

    if(!this.useDefaults)
        return optionsObject;

    return optionsObject;
};


/**
The NameReg.js deploy function. This can be used to deploy a NameReg.js contract to the Ethereum blockchain.

@method (deploy)
@param {Function} The function(err, result, mined) that will be called when the transaction is made and when the contract is deployed. The mined bool will describe if the contract was mined or not.
**/

NameReg.deploy = function(transactionObject, callback){
    if(_.isFunction(transactionObject))
        callback = transactionObject;

    transactionObject = _.extend(this.defaultTransaction(transactionObject), {data: this.code});
    this.ContractObject().new(transactionObject, function(err, result){
        callback(err, result, false);

        if(err || this.defaultDeploy)
            return;

        var contractWatch = web3.eth.filter('latest');
        contractWatch.watch(function (err, hash) {
            if(err){
                callback(err, hash, false);
                contractWatch.stopWatching();
                return;
            }

            var block = web3.eth.getBlock(hash, true);
            var contractMined = block.transactions.reduce(function (mined, th) {
                var defaultAccount = NameReg.useDefaults ? NameReg.defaultFrom() : web3.eth.defaultAccount;

                return mined || (th.from === defaultAccount && th.input.indexOf(NameReg.code) !== -1);
            }, false);

            if (contractMined) {
                callback(err, result, true);
                contractWatch.stopWatching();
            }
        });
    });
};


/**
The NameReg.js AddressRegistered event listener.

@method (AddressRegistered)
@param {Object} the filter object; onVote inputs are: [account address]
@param {Function} the callback function(err, result, filter)
**/

NameReg.AddressRegistered = function(filterObject, callback){
    if(_.isFunction(filterObject))
        callback = filterObject;

    var filter = this.contract().AddressRegistered(filterObject);
    filter.watch(function(error, result){
        callback(error, result, filter);
    });
};


/**
The NameReg.js AddressDeregistered event listener.

@method (AddressDeregistered)
@param {Object} the filter object; onVote inputs are: [account address]
@param {Function} the callback function(err, result, filter)
**/

NameReg.AddressDeregistered = function(filterObject, callback){
    if(_.isFunction(filterObject))
        callback = filterObject;

    var filter = this.contract().AddressDeregistered(filterObject);
    filter.watch(function(error, result){
        callback(error, result, filter);
    });
};


/**
The NameReg.js toAddress call method.

@method (toAddress)
@param {String} The bytes32 (bytes32) var
@return {String} Returns a String
**/

NameReg.toAddress = function(bytes32, callObject, callback) {
    if(_.isFunction(callObject))
        callback = callObject;

    var call = this.contract().toAddress.call(bytes32, this.defaultCall(callObject), callback);

    if(_.isUndefined(callback))
        return call;
};


/**
The NameReg.js configAddr call method.

@method (configAddr)
@return {String} Returns a String
**/

NameReg.configAddr = function(callObject, callback) {
    if(_.isFunction(callObject))
        callback = callObject;

    var call = this.contract().configAddr.call(this.defaultCall(callObject), callback);

    if(_.isUndefined(callback))
        return call;
};


/**
The NameReg.js toName call method.

@method (toName)
@param {String} The address (address) var
@return {String} Returns a String
**/

NameReg.toName = function(address, callObject, callback) {
    if(_.isFunction(callObject))
        callback = callObject;
    
    if(_.isUndefined(callback))
        callback = function(e, r){};

    var call = this.contract().toName.call(address, this.defaultCall(callObject), function(err, result){
        if(_.isEmpty(result)
          || _.isUndefined(result))
            result = 'Unknown';
        
        if(NameReg.fakeNames)
            callback(err, chance.name());
        else
            callback(err, result);
    });

    if(_.isUndefined(callback))
        return call;
};


/**
The NameReg.js getName non asyn helper.

@method (getName)
@param {String} The address (address) var
@return {String} Returns a String
**/

NameReg.getName = function(address, callObject) {
    var call = this.contract().toName.call(address, this.defaultCall(callObject));

    if(_.isEmpty(call)
      || _.isUndefined(call))
        call = 'Unknown';

    if(NameReg.fakeNames)
        call = chance.name();

    return call;
};


/**
The NameReg.js register transaction method.

@method (register)
@param {String} The name (bytes32) var

**/

NameReg.register = function(name, transactionObject, callback) {
    if(_.isFunction(transactionObject))
        callback = transactionObject;

    var transact = this.contract().register.sendTransaction(name, this.defaultTransaction(transactionObject), callback);
};


/**
The NameReg.js unregister transaction method.

@method (unregister)

**/

NameReg.unregister = function(transactionObject, callback) {
    if(_.isFunction(transactionObject))
        callback = transactionObject;

    var transact = this.contract().unregister.sendTransaction(this.defaultTransaction(transactionObject), callback);
};