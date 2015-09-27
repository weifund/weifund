/**
The WeiCoin object.

Authors:
 - Nick Dodson <thenickdodson@gmail.com>

Solidity Interface:

**/

/**
Construct the WeiCoin object.

@class [Object] WeiCoin
@constructor
**/

WeiCoin = {};


/**
The WeiCoin ABI contract description.

@var (abi)
**/

WeiCoin.abi = [  
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"_cid",
            "type":"uint256"
         },
         {  
            "name":"_addr",
            "type":"address"
         },
         {  
            "name":"_amount",
            "type":"uint256"
         }
      ],
      "name":"onContribute",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  
         {  
            "name":"_target",
            "type":"address"
         },
         {  
            "name":"_proxy",
            "type":"address"
         }
      ],
      "name":"isApprovedFor",
      "outputs":[  
         {  
            "name":"_r",
            "type":"bool"
         }
      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  

      ],
      "name":"weifundAddress",
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
      "name":"total",
      "outputs":[  
         {  
            "name":"",
            "type":"uint256"
         }
      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"_cid",
            "type":"uint256"
         },
         {  
            "name":"_addr",
            "type":"address"
         }
      ],
      "name":"onNewCampaign",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  

      ],
      "name":"campaignStarted",
      "outputs":[  
         {  
            "name":"",
            "type":"bool"
         }
      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"cid",
            "type":"uint256"
         },
         {  
            "name":"amount",
            "type":"uint256"
         }
      ],
      "name":"onPayout",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  

      ],
      "name":"initAmount",
      "outputs":[  
         {  
            "name":"",
            "type":"uint256"
         }
      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  
         {  
            "name":"_proxy",
            "type":"address"
         }
      ],
      "name":"isApproved",
      "outputs":[  
         {  
            "name":"_r",
            "type":"bool"
         }
      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"_from",
            "type":"address"
         },
         {  
            "name":"_val",
            "type":"uint256"
         },
         {  
            "name":"_to",
            "type":"address"
         }
      ],
      "name":"sendCoinFrom",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  

      ],
      "name":"max",
      "outputs":[  
         {  
            "name":"",
            "type":"uint256"
         }
      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  

      ],
      "name":"weiRatio",
      "outputs":[  
         {  
            "name":"",
            "type":"uint256"
         }
      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  

      ],
      "name":"cid",
      "outputs":[  
         {  
            "name":"",
            "type":"uint256"
         }
      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"_cid",
            "type":"uint256"
         },
         {  
            "name":"_addr",
            "type":"address"
         },
         {  
            "name":"_amount",
            "type":"uint256"
         }
      ],
      "name":"onRefund",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  
         {  
            "name":"_a",
            "type":"address"
         }
      ],
      "name":"coinBalanceOf",
      "outputs":[  
         {  
            "name":"_r",
            "type":"uint256"
         }
      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"_val",
            "type":"uint256"
         },
         {  
            "name":"_to",
            "type":"address"
         }
      ],
      "name":"sendCoin",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  

      ],
      "name":"coinBalance",
      "outputs":[  
         {  
            "name":"_r",
            "type":"uint256"
         }
      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"_a",
            "type":"address"
         }
      ],
      "name":"approve",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "inputs":[  
         {  
            "name":"_weifundAddress",
            "type":"address"
         },
         {  
            "name":"_initAmount",
            "type":"uint256"
         },
         {  
            "name":"_weiRatio",
            "type":"uint256"
         }
      ],
      "type":"constructor"
   }
];


/**
The WeiCoin Bytecode.

@var (code)
**/

WeiCoin.code = '606060405260006001600050556000600260005055600060036000505560006004600050556000600560005055604051606080610c4f8339016040526060805190602001805190602001805190602001505b5b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b8160086000506000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050819055508160016000508190555033600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff0219169083021790555060016000505460026000828282505401925050819055508060046000508190555082600660016101000a81548173ffffffffffffffffffffffffffffffffffffffff0219169083021790555043600a600050819055505b505050610ade806101716000396000f3606060405236156100f7576000357c01000000000000000000000000000000000000000000000000000000009004806249f068146100f95780631fa03a2b146101185780632ab40122146101455780632ddbd13a1461017c5780633a91db971461019d57806343e9c5ce146101b6578063484ec26c146101d757806354999f6d146101f0578063673448dd1461021157806367eae672146102385780636ac5db1914610257578063896bf14914610278578063aa3ec0a914610299578063b71f3cde146102ba578063bbd39ac0146102d9578063c86a90fe14610300578063d26c8a8a14610319578063daea85c51461033a576100f7565b005b610116600480359060200180359060200180359060200150610603565b005b61012f600480359060200180359060200150610a00565b6040518082815260200191505060405180910390f35b610150600450610a86565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b610187600450610aba565b6040518082815260200191505060405180910390f35b6101b4600480359060200180359060200150610526565b005b6101c1600450610a73565b6040518082815260200191505060405180910390f35b6101ee600480359060200180359060200150610aac565b005b6101fb600450610ab1565b6040518082815260200191505060405180910390f35b61022260048035906020015061098e565b6040518082815260200191505060405180910390f35b61025560048035906020018035906020018035906020015061034d565b005b610262600450610ac3565b6040518082815260200191505060405180910390f35b610283600450610acc565b6040518082815260200191505060405180910390f35b6102a4600450610ad5565b6040518082815260200191505060405180910390f35b6102d7600480359060200180359060200180359060200150610753565b005b6102ea6004803590602001506108df565b6040518082815260200191505060405180910390f35b610317600480359060200180359060200150610470565b005b6103246004506108a3565b6040518082815260200191505060405180910390f35b61034b60048035906020015061091d565b005b81600860005060008573ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005054101580156103ec5750600960005060008473ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b1561046a5781600860005060008573ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282825054039250508190555081600860005060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828282505401925050819055505b5b505050565b81600860005060003373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050541015156105215781600860005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282825054039250508190555081600860005060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828282505401925050819055505b5b5050565b600660019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415806105d157508073ffffffffffffffffffffffffffffffffffffffff16600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614155b156105db576105ff565b816005600050819055506001600660006101000a81548160ff021916908302179055505b5050565b600660009054906101000a900460ff16158061062457506005600050548314155b8061067d5750600660019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b806106885750600081145b806106bf5750600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16145b156106c95761074e565b6004600050548104600860005060008473ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082828250540192505081905550600860005060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505460026000828282505401925050819055505b505050565b600660009054906101000a900460ff16158061077457506005600050548314155b806107cd5750600660019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b806107d85750600081145b8061080f5750600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16145b156108195761089e565b6004600050548104600860005060008473ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082828250540392505081905550600860005060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505460026000828282505403925050819055505b505050565b6000600860005060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505490506108dc565b90565b6000600860005060008373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050549050610918565b919050565b6001600960005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908302179055505b50565b6000600960005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1690506109fb565b919050565b6000600960005060008473ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050610a6d565b92915050565b600660009054906101000a900460ff1681565b600660019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b5b5050565b60016000505481565b60026000505481565b60036000505481565b60046000505481565b6005600050548156';

/**
The WeiCoin web3 contract factory object.

@var (WeiCoin)
**/

WeiCoin.Contract = web3.eth.contract(WeiCoin.abi);