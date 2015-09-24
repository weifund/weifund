/**
The WeiFund object.

Authors:
 - Nick Dodson <thenickdodson@gmail.com>

Solidity Interface:
contract WeiFund{function campaigns(uint256 )constant returns(bytes32 name,bytes32 website,bytes32 video,address owner,address beneficiary,address config,uint256 timelimit,uint256 fundingGoal,uint256 amount,uint256 category,uint256 status,uint256 numFunders){}function userCampaigns(address _addr,uint256 _u_cid)returns(uint256 cid){}function refund(uint256 _cid){}function numCampaigns()constant returns(uint256 ){}function contribute(uint256 _cid,address _addr){}function users(address )constant returns(uint256 numCampaigns){}function newCampaign(bytes32 _name,bytes32 _website,bytes32 _video,address _beneficiary,uint256 _goal,uint256 _timelimit,uint256 _category,address _config){}function payout(uint256 _cid){}}
**/


/**
The WeiFund ABI contract description.

@var (abi)
**/

WeiFund.abi = [ 
   {  
      "constant":true,
      "inputs":[  
         {  
            "name":"",
            "type":"uint256"
         }
      ],
      "name":"campaigns",
      "outputs":[  
         {  
            "name":"name",
            "type":"bytes32"
         },
         {  
            "name":"website",
            "type":"bytes32"
         },
         {  
            "name":"video",
            "type":"bytes32"
         },
         {  
            "name":"owner",
            "type":"address"
         },
         {  
            "name":"beneficiary",
            "type":"address"
         },
         {  
            "name":"config",
            "type":"address"
         },
         {  
            "name":"timelimit",
            "type":"uint256"
         },
         {  
            "name":"fundingGoal",
            "type":"uint256"
         },
         {  
            "name":"amount",
            "type":"uint256"
         },
         {  
            "name":"category",
            "type":"uint256"
         },
         {  
            "name":"status",
            "type":"uint256"
         },
         {  
            "name":"numFunders",
            "type":"uint256"
         }
      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"_addr",
            "type":"address"
         },
         {  
            "name":"_u_cid",
            "type":"uint256"
         }
      ],
      "name":"userCampaigns",
      "outputs":[  
         {  
            "name":"cid",
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
         }
      ],
      "name":"refund",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "constant":true,
      "inputs":[  

      ],
      "name":"numCampaigns",
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
      "name":"contribute",
      "outputs":[  

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
      "name":"users",
      "outputs":[  
         {  
            "name":"numCampaigns",
            "type":"uint256"
         }
      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"_name",
            "type":"bytes32"
         },
         {  
            "name":"_website",
            "type":"bytes32"
         },
         {  
            "name":"_video",
            "type":"bytes32"
         },
         {  
            "name":"_beneficiary",
            "type":"address"
         },
         {  
            "name":"_goal",
            "type":"uint256"
         },
         {  
            "name":"_timelimit",
            "type":"uint256"
         },
         {  
            "name":"_category",
            "type":"uint256"
         },
         {  
            "name":"_config",
            "type":"address"
         }
      ],
      "name":"newCampaign",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "constant":false,
      "inputs":[  
         {  
            "name":"_cid",
            "type":"uint256"
         }
      ],
      "name":"payout",
      "outputs":[  

      ],
      "type":"function"
   },
   {  
      "anonymous":false,
      "inputs":[  
         {  
            "indexed":true,
            "name":"_from",
            "type":"address"
         },
         {  
            "indexed":true,
            "name":"_cid",
            "type":"uint256"
         }
      ],
      "name":"onNewCampaign",
      "type":"event"
   },
   {  
      "anonymous":false,
      "inputs":[  
         {  
            "indexed":true,
            "name":"_from",
            "type":"address"
         },
         {  
            "indexed":true,
            "name":"_cid",
            "type":"uint256"
         },
         {  
            "indexed":false,
            "name":"_value",
            "type":"uint256"
         }
      ],
      "name":"onContribute",
      "type":"event"
   },
   {  
      "anonymous":false,
      "inputs":[  
         {  
            "indexed":true,
            "name":"_from",
            "type":"address"
         },
         {  
            "indexed":true,
            "name":"_cid",
            "type":"uint256"
         },
         {  
            "indexed":false,
            "name":"_value",
            "type":"uint256"
         }
      ],
      "name":"onPayout",
      "type":"event"
   },
   {  
      "anonymous":false,
      "inputs":[  
         {  
            "indexed":true,
            "name":"_from",
            "type":"address"
         },
         {  
            "indexed":true,
            "name":"_cid",
            "type":"uint256"
         },
         {  
            "indexed":false,
            "name":"_value",
            "type":"uint256"
         }
      ],
      "name":"onRefund",
      "type":"event"
   }
];


/**
The WeiFund Bytecode.

@var (code)
**/

WeiFund.code = '6060604052610e4f806100126000396000f36060604052361561008a576000357c010000000000000000000000000000000000000000000000000000000090048063141961bc1461008c57806319ac74bd14610142578063278ecde11461016f5780632c0f7b6f1461018257806360b0b0f0146101a3578063a87430ba146101bc578063c06f4c1d146101e3578063e1152343146102205761008a565b005b61009d60048035906020015061023c565b604051808d81526020018c81526020018b81526020018a73ffffffffffffffffffffffffffffffffffffffff1681526020018973ffffffffffffffffffffffffffffffffffffffff1681526020018873ffffffffffffffffffffffffffffffffffffffff1681526020018781526020018681526020018581526020018481526020018381526020018281526020019c5050505050505050505050505060405180910390f35b610159600480359060200180359060200150610df2565b6040518082815260200191505060405180910390f35b6101806004803590602001506108b8565b005b61018d600450610233565b6040518082815260200191505060405180910390f35b6101ba600480359060200180359060200150610626565b005b6101cd60048035906020015061031a565b6040518082815260200191505060405180910390f35b61021e60048035906020018035906020018035906020018035906020018035906020018035906020018035906020018035906020015061033e565b005b610231600480359060200150610bf3565b005b60006000505481565b60016000506020528060005260406000206000915090508060000160005054908060010160005054908060020160005054908060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060040160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060050160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169080600601600050549080600701600050549080600801600050549080600901600050549080600a01600050549080600b016000505490508c565b60026000506020528060005260406000206000915090508060000160005054905081565b600060006000600060008811801561035557504287115b15610617576000600081815054809291906001019190505593506001600050600085815260200190815260200160002060005092508b83600001600050819055508a8360010160005081905550898360020160005081905550338360030160006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550888360040160006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550878360070160005081905550868360060160005081905550858360090160005081905550848360050160006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550600260005060003373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050915081600001600081815054809291906001019190505590508382600101600050600083815260200190815260200160002060005081905550833373ffffffffffffffffffffffffffffffffffffffff167f882da991e52c8933ce57314c9ba3f934798d912d862790c40d0feeb7025af08a60405180905060405180910390a3600073ffffffffffffffffffffffffffffffffffffffff168360050160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141515610616578260050160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166343ca9d2685338b604051847c0100000000000000000000000000000000000000000000000000000000028152600401808481526020018373ffffffffffffffffffffffffffffffffffffffff16815260200182815260200193505050506000604051808303816000876161da5a03f115610002575050505b5b5b505050505050505050505050565b60006000600060003411156108b0576001600050600086815260200190815260200160002060005092504283600601600050541015156108af5782600b016000818150548092919060010191905055915082600c0160005060008381526020019081526020016000206000509050338160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550838160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055503481600201600050819055508060020160005054836008016000828282505401925050819055508183600d0160005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005081905550843373ffffffffffffffffffffffffffffffffffffffff167fc5e578961e5bd7481ccf1d1bdfbad97b9f1ddfad520f061ca764a57018f3febe85600801600050546040518082815260200191505060405180910390a3600073ffffffffffffffffffffffffffffffffffffffff168360050160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415156108ae578260050160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166249f068863334604051847c0100000000000000000000000000000000000000000000000000000000028152600401808481526020018373ffffffffffffffffffffffffffffffffffffffff16815260200182815260200193505050506000604051808303816000876161da5a03f115610002575050505b5b5b5b5050505050565b6000600060006001600050600085815260200190815260200160002060005092508260060160005054421180156108fc575082600701600050548360080160005054105b801561090f575060008360080160005054115b15610bec5782600c01600050600084600d0160005060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505481526020019081526020016000206000509150600082600201600050541115610beb578160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168260010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141515610a1d578160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905080505b8073ffffffffffffffffffffffffffffffffffffffff1660008360020160005054604051809050600060405180830381858888f1935050505050816002016000505483600801600082828250540392505081905550838173ffffffffffffffffffffffffffffffffffffffff167fe139691e7435f1fb40ec50ed3729009226be49087fd00e9e5bac276c2a8f40cf84600201600050546040518082815260200191505060405180910390a360008260020160005081905550600073ffffffffffffffffffffffffffffffffffffffff168360050160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141515610bea578260050160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663b71f3cde85838560020160005054604051847c0100000000000000000000000000000000000000000000000000000000028152600401808481526020018373ffffffffffffffffffffffffffffffffffffffff16815260200182815260200193505050506000604051808303816000876161da5a03f115610002575050505b5b5b5b50505050565b600060016000506000838152602001908152602001600020600050905080600701600050548160080160005054101515610ded578060040160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1660008260080160005054604051809050600060405180830381858888f1935050505050813373ffffffffffffffffffffffffffffffffffffffff167f6be92574b1386f424263a096e8b66ff6cc223ab0f9d18702563aa339a372cf9883600801600050546040518082815260200191505060405180910390a360008160080160005081905550600181600a0160005081905550600073ffffffffffffffffffffffffffffffffffffffff168160050160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141515610dec578060050160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663484ec26c838360080160005054604051837c010000000000000000000000000000000000000000000000000000000002815260040180838152602001828152602001925050506000604051808303816000876161da5a03f115610002575050505b5b5b5050565b60006000600260005060008573ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050905080600101600050600084815260200190815260200160002060005054915081505b509291505056';


/**
The WeiFund contract factory object.

@var (Contract)
**/

WeiFund.Contract = web3.eth.contract(WeiFund.abi);