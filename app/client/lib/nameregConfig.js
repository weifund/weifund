/**
The NameReg.js API Configuration Variables

Requires:
 - Underscore.js v1.8.3+  <http://underscorejs.org/>
 - Web3.js v0.4.2+ <https://github.com/ethereum/web3.js>

Solidity Interface:
contract NameReg{function toAddress(bytes32 )constant returns(address ){}function configAddr()constant returns(address a){}function toName(address )constant returns(bytes32 ){}function register(bytes32 name){}function unregister(){}}
**/

/**
The NameReg.js deployed contract instance address.

@var (address)
**/

NameReg.address = "0x6a61375b7a9ca8de3bd2f0ce35e2f677f7052ec6";


/**
The use defaults option. If (true) NameReg.js will use the NameReg.js default values for transactions and calls, if (false) NameReg.js will use the Web3.js default values.

@var (useDefault)
**/

NameReg.useDefaults = true;


/**
The default account number for the NameReg.js API.

@var (defaultAccount)
**/

NameReg.defaultAccount = 0;


/**
The default gas value for NameReg.js transactions.

@var (defaultGas)
**/

NameReg.defaultGas = 900000;


/**
Use the default deploy or a custom deploy that will also tell you if the contract has been mined.

@var (defaultDeploy)
**/

NameReg.defaultDeploy = false;


/**
Use fake names.

@var (fakeNames)
**/

NameReg.fakeNames = false;


/**
The NameReg.js ABI contract description.

@var (abi)
**/

NameReg.abi = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "toAddress",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "configAddr",
    "outputs": [
      {
        "name": "a",
        "type": "address"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "toName",
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "name",
        "type": "bytes32"
      }
    ],
    "name": "register",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "unregister",
    "outputs": [],
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "account",
        "type": "address"
      }
    ],
    "name": "AddressRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "account",
        "type": "address"
      }
    ],
    "name": "AddressDeregistered",
    "type": "event"
  }
];


/**
The NameReg.js Bytecode.

@var (code)
**/

NameReg.code = '7fdbbdf083000000000000000000000000000000000000000000000000000000006000908152600160048190523073ffffffffffffffffffffffffffffffffffffffff166024529073c6d9d2cd449a754c494264e1809c50e34d64562b9063dbbdf083908060448283866161da5a03f1607457005b5050600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001633178155610326915081906100b190396000f3007c01000000000000000000000000000000000000000000000000000000006000350463341f6623811461005a5780635c820c961461008957806381bc3f8c146100a8578063e1fa8e84146100c1578063e79a198f1461012857005b6002602052600435600090815260409020546102029073ffffffffffffffffffffffffffffffffffffffff1681565b73c6d9d2cd449a754c494264e1809c50e34d64562b6000818152602090f35b6001602052600435600090815260409020546102229081565b60043560008181526002602052604081205461022c929173ffffffffffffffffffffffffffffffffffffffff909116141561031c575b73ffffffffffffffffffffffffffffffffffffffff3316600090815260016020526040812054141561023857610291565b73ffffffffffffffffffffffffffffffffffffffff3316600090815260016020526040812054610232918114610321575b6000818152600260205260408082205473ffffffffffffffffffffffffffffffffffffffff16917fe4519776825d8a4617d2ccb206c8ff2de7c8451c6c7b02367b882de96fb0493c91a273ffffffffffffffffffffffffffffffffffffffff331660009081526001602090815260408083208390558383526002909152902080547fffffffffffffffffffffffff00000000000000000000000000000000000000001690555b50565b8073ffffffffffffffffffffffffffffffffffffffff1660005260206000f35b8060005260206000f35b60006000f35b60006000f35b73ffffffffffffffffffffffffffffffffffffffff331660009081526001602090815260408083205483526002909152902080547fffffffffffffffffffffffff00000000000000000000000000000000000000001690555b3373ffffffffffffffffffffffffffffffffffffffff81166000818152600160209081526040808320869055858352600290915280822080547fffffffffffffffffffffffff00000000000000000000000000000000000000001690941790935590917fb2899cb26a6f22b6b94e4cc8de24dc97bcf3cc73fc0dfaac71decef29fac7c539190a25b50565b610319565b6101ff56';