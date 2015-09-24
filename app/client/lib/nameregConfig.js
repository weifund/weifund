/**
The NameReg object.

Authors:
 - Nick Dodson <thenickdodson@gmail.com>

Solidity Interface:

**/

/**
Construct the NameReg object.

@class [Object] NameReg
@constructor
**/

NameReg = {};

/**
The NameReg.js ABI contract description.

@var (abi)
**/

NameReg.abi = [  
   {  
      "constant":true,
      "inputs":[  
         {  
            "name":"",
            "type":"bytes32"
         }
      ],
      "name":"toAddress",
      "outputs":[  
         {  
            "name":"",
            "type":"address"
         }
      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  

      ],
      "name":"configAddr",
      "outputs":[  
         {  
            "name":"a",
            "type":"address"
         }
      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  
         {  
            "name":"",
            "type":"address"
         }
      ],
      "name":"toName",
      "outputs":[  
         {  
            "name":"",
            "type":"bytes32"
         }
      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"name",
            "type":"bytes32"
         }
      ],
      "name":"register",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  

      ],
      "name":"unregister",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "anonymous":false,
      "inputs":[  
         {  
            "indexed":true,
            "name":"account",
            "type":"address"
         }
      ],
      "name":"AddressRegistered",
      "type":"event"
   },
   {  
      "anonymous":false,
      "inputs":[  
         {  
            "indexed":true,
            "name":"account",
            "type":"address"
         }
      ],
      "name":"AddressDeregistered",
      "type":"event"
   }
];


/**
The NameReg.js Bytecode.

@var (code)
**/

NameReg.code = '60606040525b60015b600e60cf565b73ffffffffffffffffffffffffffffffffffffffff1663dbbdf0838230604051837c0100000000000000000000000000000000000000000000000000000000028152600401808381526020018273ffffffffffffffffffffffffffffffffffffffff168152602001925050506000604051808303816000876161da5a03f1156002575050505b5033600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b6104a2806100ef6000396000f35b600073c6d9d2cd449a754c494264e1809c50e34d64562b905060ec565b905660606040526000357c010000000000000000000000000000000000000000000000000000000090048063341f6623146100655780635c820c96146100a257806381bc3f8c146100d9578063e1fa8e8414610100578063e79a198f1461011357610063565b005b610076600480359060200150610449565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6100ad600450610481565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6100ea60048035906020015061042e565b6040518082815260200191505060405180910390f35b610111600480359060200150610257565b005b61011e600450610120565b005b6000600160005060003373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050549050600081141561016257610254565b6002600050600082815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fe4519776825d8a4617d2ccb206c8ff2de7c8451c6c7b02367b882de96fb0493c60405180905060405180910390a26000600160005060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000508190555060006002600050600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b50565b600073ffffffffffffffffffffffffffffffffffffffff166002600050600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415156102c85761042b565b6000600160005060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505414151561037157600060026000506000600160005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005054815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b80600160005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005081905550336002600050600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055503373ffffffffffffffffffffffffffffffffffffffff167fb2899cb26a6f22b6b94e4cc8de24dc97bcf3cc73fc0dfaac71decef29fac7c5360405180905060405180910390a25b50565b60016000506020528060005260406000206000915090505481565b600260005060205280600052604060002060009150909054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600073c6d9d2cd449a754c494264e1809c50e34d64562b905061049f565b9056';


/**
The NameReg web3 contract factory object.

@var (Contract)
**/

NameReg.Contract = web3.eth.contract(NameReg.abi);