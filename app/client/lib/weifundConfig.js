/**
WeiFund config

@module WeiFund
**/

/**
The address of the WeiFund contract.

@var (address)
**/

WeiFund.address = '0xcc6a63df7084db3034c77e9a41ddc9446008cf48';

/**
The default from account index.

e.g 1 would be used like web3.eth.accounts[1];

@var (account)
**/

WeiFund.account = 0;

/**
The ABI of the main contract.

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
      "name":"campaigns(uint256)",
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
            "name":"owner",
            "type":"address"
         },
         {
            "name":"beneficiary",
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
            "name":"addr",
            "type":"address"
         },
         {
            "name":"u_cid",
            "type":"uint256"
         }
      ],
      "name":"userCampaigns(address,uint256)",
      "outputs":[
         {
            "name":"_cid",
            "type":"uint256"
         }
      ],
      "type":"function"
    },
    {
        "type":"event",
        "inputs": [
            {
                "name":"_from"
                ,"type":"address"
                ,"indexed":true
            },
            {
                "name":"_cid"
                ,"type":"uint256"
                ,"indexed":true
            }
        ],
        "name":"onNewCampaign"
    },
    {
        "type":"event",
        "inputs": [
            {
                "name":"_from"
                ,"type":"address"
                ,"indexed":true
            },
            {
                "name":"_cid"
                ,"type":"uint256"
                ,"indexed":true
            },
            {
                "name":"_value"
                ,"type":"uint256"
                ,"indexed":false
            }
        ],
        "name":"onContribute"
    },
    {
        "type":"event",
        "inputs": [
            {
                "name":"_from"
                ,"type":"address"
                ,"indexed":true
            },
            {
                "name":"_cid"
                ,"type":"uint256"
                ,"indexed":true
            },
            {
                "name":"_value"
                ,"type":"uint256"
                ,"indexed":false
            }
        ],
        "name":"onPayout"
    },
    {
        "type":"event",
        "inputs": [
            {
                "name":"_from"
                ,"type":"address"
                ,"indexed":true
            },
            {
                "name":"_cid"
                ,"type":"uint256"
                ,"indexed":true
            },
            {
                "name":"_value"
                ,"type":"uint256"
                ,"indexed":false
            }
        ],
        "name":"onRefund"
    },
    {
      "constant":false,
      "inputs":[
         {
            "name":"cid",
            "type":"uint256"
         }
      ],
      "name":"refund(uint256)",
      "outputs":[

      ],
      "type":"function"
    },
    {
      "constant":false,
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
            "name":"name",
            "type":"bytes32"
         },
         {
            "name":"website",
            "type":"bytes32"
         },
         {
            "name":"beneficiary",
            "type":"address"
         },
         {
            "name":"goal",
            "type":"uint256"
         },
         {
            "name":"timelimit",
            "type":"uint256"
         },
         {
            "name":"category",
            "type":"uint256"
         }
      ],      "name":"newCampaign(bytes32,bytes32,address,uint256,uint256,uint256)",
      "outputs":[
      ],
      "type":"function"
    },
    {
      "constant":false,
      "inputs":[
         {
            "name":"",
            "type":"address"
         }
      ],
      "name":"users(address)",
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
            "name":"cid",
            "type":"uint256"
         }
      ],
      "name":"contribute(uint256)",
      "outputs":[

      ],
      "type":"function"
    },
    {
      "constant":false,
      "inputs":[
         {
            "name":"cid",
            "type":"uint256"
         }
      ],
      "name":"payout(uint256)",
      "outputs":[
      ],
      "type":"function"
    }
];

/**
The Hex code of the contract.

@var (hex)
**/

WeiFund.hex = "6105ea8061000e6000396000f30060003560e060020a90048063141961bc1461006e57806319ac74bd146100bc578063278ecde1146100d45780632c0f7b6f146100e55780635694894a146100f7578063a87430ba14610117578063ac273aa21461012c578063c1cbbca714610140578063e11523431461015157005b61007960043561016a565b896000528860205287600160a060020a031660405286600160a060020a0316606052856080528460a0528360c0528260e052816101005280610120526101406000f35b6100ca600435602435610572565b8060005260206000f35b6100df6004356103b0565b60006000f35b6100ed610163565b8060005260206000f35b61011160043560243560443560643560843560a4356101c9565b60006000f35b6101226004356101b5565b8060005260206000f35b61013a6004356024356105b3565b60006000f35b61014b6004356102c9565b60006000f35b61015c6004356104c8565b60006000f35b5b60005481565b5b60005260016020526040600020805490806001015490806002015490806003015490806004015490806005015490806006015490806007015490806008015490806009015490508a565b5b600052600260205260406000208054905081565b60006000600060006000871180156101e057504286115b6101e9576102bd565b600080549081600101905593506001600085815260200190815260200160002092508983819055503383600201819055508883600101819055508783600301819055508683600501819055508583600401819055508483600701819055506002600033600160a060020a03168152602001908152602001600020915081805490816001019055905083826001016000838152602001908152602001600020819055508333600160a060020a03167f882da991e52c8933ce57314c9ba3f934798d912d862790c40d0feeb7025af08a60006000a35b50505050505050505050565b600060006000600034116102dc576103aa565b6001600085815260200190815260200160002092504283600401541015610302576103a9565b82600901805490816001019055915082600a0160008381526020019081526020016000209050338181905550348160010181905550806001015483600601818154019150819055508183600b01600033600160a060020a03168152602001908152602001600020819055508333600160a060020a03167fc5e578961e5bd7481ccf1d1bdfbad97b9f1ddfad520f061ca764a57018f3febe6000866006015481526020016000a35b5b50505050565b600060006001600084815260200190815260200160002091508160040154421180156103e3575081600501548260060154105b80156103f3575060008260060154115b6103fc576104c3565b81600a01600083600b01600033600160a060020a0316815260200190815260200160002054815260200190815260200160002090506000816001015411610442576104c2565b8054600160a060020a0316600082600101546000600060006000848787f161046657005b505050806001015482600601818154039150819055508233600160a060020a03167fe139691e7435f1fb40ec50ed3729009226be49087fd00e9e5bac276c2a8f40cf6000846001015481526020016000a3600081600101819055505b5b505050565b60006001600083815260200190815260200160002090508060050154816006015410156104f45761056e565b8060030154600160a060020a0316600082600601546000600060006000848787f161051b57005b5050508133600160a060020a03167f6be92574b1386f424263a096e8b66ff6cc223ab0f9d18702563aa339a372cf986000846006015481526020016000a360008160060181905550600181600801819055505b5050565b600060006002600085600160a060020a0316815260200190815260200160002090508060010160008481526020019081526020016000205491505092915050565b6000600060016000858152602001908152602001600020905080600a0160008481526020019081526020016000209150509291505056";

/**
Website URL.

@var (url)
**/

WeiFund.url = 'http://WeiFund.github.io/';

/**
The image suffix for handling image urls in WeiFund.

i.e. http://your_website.com/weifund.jpg

@var (imageSuffix)
**/

WeiFund.imageSuffix = '/weifund.jpg';

/**
Available categories.

@var (categories)
**/

WeiFund.categories = ["Buisness", "Technology", "Music", "Arts", "Cryptocurrency", "Dance", "Fashion", "Film", "Community", "Food", "Games", "Education", "Cause", "Politics"];

/**
The transaction hash of the WeiFund contract. For display purposes.

@var (tx_hash)
**/

WeiFund.tx_hash = '0x0618faa5189babe5618f618faa5189babe586df5693db47aa5189babe586df5693db4786df5693618faa5189babe586df5693db47db47330694a27dcd';

/**
The default amount of gas to use for transactions.

@var (defaultGas)
**/

WeiFund.defaultGas = 950000;

// Setup WeiFund
WeiFund.setup();

/*
contract WeiFund 
{
    struct User
    {
        uint numCampaigns;
        mapping(uint => uint) campaigns;
    }
    
    struct Funder 
    {
        address addr;
        uint amount;
    }
    
    struct Campaign 
    {
        bytes32 name;
        bytes32 website;
        address owner;
        address beneficiary;
        uint timelimit;
        uint fundingGoal;
        uint amount;
        uint category;
        uint status;
        uint numFunders;
        mapping (uint => Funder) funders;
        mapping (address => uint) toFunder;
    }
  
    uint public numCampaigns;
    mapping (uint => Campaign) public campaigns;
    mapping (address => User) public users;
    
    event onNewCampaign(address indexed _from, uint indexed _cid);
    event onContribute(address indexed _from, uint indexed _cid, uint _value);
    event onPayout(address indexed _from, uint indexed _cid, uint _value);
    event onRefund(address indexed _from, uint indexed _cid, uint _value);
    
    modifier hasValue { if(msg.value > 0) _ }
    
    function newCampaign(bytes32 _name, bytes32 _website
    , address _beneficiary, uint _goal, uint _timelimit, uint _category)
    {
        if(_goal > 0 && _timelimit > now){
            uint cid = numCampaigns++; // campaignID is return variable
            Campaign c = campaigns[cid];  // assigns reference
            c.name = _name;
            c.owner = msg.sender;
            c.website = _website;
            c.beneficiary = _beneficiary;
            c.fundingGoal = _goal;
            c.timelimit = _timelimit;
            c.category = _category;
            
            User u = users[msg.sender];
            uint u_cid = u.numCampaigns++;
            u.campaigns[u_cid] = cid;
            
            onNewCampaign(msg.sender, cid);
        }
    }
    
    function contribute(uint _cid) hasValue
    {
        Campaign c = campaigns[_cid]; // Cannot be expired.
        if(c.timelimit >= block.timestamp){
            uint fid = c.numFunders++;
            Funder f = c.funders[fid];
            f.addr = msg.sender;
            f.amount = msg.value;
            c.amount += f.amount;
            c.toFunder[msg.sender] = fid;
            onContribute(msg.sender, _cid, c.amount);
        }
    }
    
    function refund(uint _cid)
    {
        Campaign c = campaigns[_cid];
        if (block.timestamp > c.timelimit 
        && c.amount < c.fundingGoal && c.amount > 0){
            Funder f = c.funders[c.toFunder[msg.sender]];
            if(f.amount > 0){
                f.addr.send(f.amount);
                c.amount -= f.amount;
                onRefund(msg.sender, _cid, f.amount);
                f.amount = 0;
            }
        }
    }
  
    function payout(uint _cid)
    {
        Campaign c = campaigns[_cid];
        if (c.amount >= c.fundingGoal){
            c.beneficiary.send(c.amount);
            onPayout(msg.sender, _cid, c.amount);
            c.amount = 0;
            c.status = 1;
        }
    }
    
    function userCampaigns(address _addr, uint _u_cid) returns (uint cid)
    {
        User u = users[_addr];
        cid = u.campaigns[_u_cid];
    }
    
    function campaignFunders(uint _cid, uint _f_id) returns (Funder f)
    {
        Campaign c = campaigns[_cid];
        f = c.funders[_f_id];
    }
}
*/