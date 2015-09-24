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

      ],
      "name":"blockReward",
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
            "name":"_blockReward",
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

WeiCoin.code = '606060405260006001600050556103e86002600050556000600360005055600060046000505560006005600050556000600660005055604051608080610c9e8339016040526060805190602001805190602001805190602001805190602001505b5b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b8260096000506000600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050819055508260016000508190555033600860006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055506001600050546003600082828250540192505081905550816002600050819055508060056000508190555083600760016101000a81548173ffffffffffffffffffffffffffffffffffffffff0219169083021790555043600b600050819055505b50505050610b138061018b6000396000f360606040523615610102576000357c01000000000000000000000000000000000000000000000000000000009004806249f068146101045780630ac168a1146101235780631fa03a2b146101445780632ab40122146101715780632ddbd13a146101a85780633a91db97146101c957806343e9c5ce146101e2578063484ec26c1461020357806354999f6d1461021c578063673448dd1461023d57806367eae672146102645780636ac5db1914610283578063896bf149146102a4578063aa3ec0a9146102c5578063b71f3cde146102e6578063bbd39ac014610305578063c86a90fe1461032c578063d26c8a8a14610345578063daea85c51461036657610102565b005b6101216004803590602001803590602001803590602001506106a3565b005b61012e600450610387565b6040518082815260200191505060405180910390f35b61015b600480359060200180359060200150610aa0565b6040518082815260200191505060405180910390f35b61017c6004506103c7565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6101b3600450610390565b6040518082815260200191505060405180910390f35b6101e06004803590602001803590602001506105c6565b005b6101ed6004506103b4565b6040518082815260200191505060405180910390f35b61021a600480359060200180359060200150610379565b005b61022760045061037e565b6040518082815260200191505060405180910390f35b61024e600480359060200150610a2e565b6040518082815260200191505060405180910390f35b6102816004803590602001803590602001803590602001506103ed565b005b61028e600450610399565b6040518082815260200191505060405180910390f35b6102af6004506103a2565b6040518082815260200191505060405180910390f35b6102d06004506103ab565b6040518082815260200191505060405180910390f35b6103036004803590602001803590602001803590602001506107f3565b005b61031660048035906020015061097f565b6040518082815260200191505060405180910390f35b610343600480359060200180359060200150610510565b005b610350600450610943565b6040518082815260200191505060405180910390f35b6103776004803590602001506109bd565b005b5b5050565b60016000505481565b60026000505481565b60036000505481565b60046000505481565b60056000505481565b60066000505481565b600760009054906101000a900460ff1681565b600760019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b81600960005060008573ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050541015801561048c5750600a60005060008473ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b1561050a5781600960005060008573ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282825054039250508190555081600960005060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828282505401925050819055505b5b505050565b81600960005060003373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050541015156105c15781600960005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282825054039250508190555081600960005060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828282505401925050819055505b5b5050565b600760019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614158061067157508073ffffffffffffffffffffffffffffffffffffffff16600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614155b1561067b5761069f565b816006600050819055506001600760006101000a81548160ff021916908302179055505b5050565b600760009054906101000a900460ff1615806106c457506006600050548314155b8061071d5750600760019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b806107285750600081145b8061075f5750600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16145b15610769576107ee565b6005600050548104600960005060008473ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082828250540192505081905550600960005060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505460036000828282505401925050819055505b505050565b600760009054906101000a900460ff16158061081457506006600050548314155b8061086d5750600760019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b806108785750600081145b806108af5750600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16145b156108b95761093e565b6005600050548104600960005060008473ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082828250540392505081905550600960005060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505460036000828282505403925050819055505b505050565b6000600960005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005054905061097c565b90565b6000600960005060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505490506109b8565b919050565b6001600a60005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908302179055505b50565b6000600a60005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050610a9b565b919050565b6000600a60005060008473ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050610b0d565b9291505056';

/**
The WeiCoin web3 contract factory object.

@var (WeiCoin)
**/

WeiCoin.Contract = web3.eth.contract(WeiCoin.abi);