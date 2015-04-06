// WeiFund System
// Start, donate, payout and refund crowdfunding campaigns
// @authors:
// Nick Dodson <thenickdodson@gmail.com>
// If goal is not reached and campaign is expired, contributers can get their donation refunded individually
// If goal is reached by alloted time, contributions can still be made

// With config.
// The config will allow the CrowdFundrr contract to morph
// This allows the campaign owners to connect anything from token systems
// to shares or what ever contract they want.
contract WeiFundConfig 
{ 
    function onContribute(uint cid, address addr, uint amount){} 
    function onRefund(uint cid, address addr, uint amount){} 
    function onPayout(uint cid, uint amount){}
}

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
        address config; // ADDRESS TO CONFIG
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
    
    modifier hasValue { if(msg.value > 0) _ }
    
    function newCampaign(bytes32 name, bytes32 website
    , address beneficiary, uint goal, uint timelimit, uint category, address config)
    {
        if(goal > 0 && timelimit > block.timestamp){
            uint cid = numCampaigns++; // campaignID is return variable
            Campaign c = campaigns[cid];  // assigns reference
            c.name = name;
            c.owner = msg.sender;
            c.website = website;
            c.beneficiary = beneficiary;
            c.fundingGoal = goal;
            c.timelimit = timelimit;
            c.category = category;
            c.config = config; // config address setting
            
            User u = users[msg.sender];
            uint u_cid = u.numCampaigns++;
            u.campaigns[u_cid] = cid;
        }
    }
    
    function contribute(uint cid) hasValue
    {
        Campaign c = campaigns[cid]; // Cannot be expired.
        if(c.timelimit >= block.timestamp){
            uint fid = c.numFunders++;
            Funder f = c.funders[fid];
            f.addr = msg.sender;
            f.amount = msg.value;
            c.amount += f.amount;
            c.toFunder[msg.sender] = fid;
            
            // A certain amount could be taken as a fee if config is set for
            // sending the transaction.
            // Call custom contract set by campaign owner
            if(c.config != 0) // if config address exists
                WeiFundConfig(c.config).onContribute(cid, msg.sender, msg.value);
        }
    }
    
    function refund(uint cid)
    {
        Campaign c = campaigns[cid];
        if (block.timestamp > c.timelimit 
        && c.amount < c.fundingGoal && c.amount > 0){
            Funder f = c.funders[c.toFunder[msg.sender]];
            if(f.amount > 0){
                f.addr.send(f.amount);
                c.amount -= f.amount;
                f.amount = 0;
                if(c.config != 0) // if config address exists
                    WeiFundConfig(c.config).onRefund(cid, f.addr, f.amount);
            }
        }
    }
  
    function payout(uint cid)
    {
        Campaign c = campaigns[cid];
        if (c.amount >= c.fundingGoal){
            c.beneficiary.send(c.amount);
            c.amount = 0;
            c.status = 1;
            if(c.config != 0) // if config address exists
                WeiFundConfig(c.config).onPayout(cid, c.amount);
        }
    }
    
    function userCampaigns(address addr, uint u_cid) returns (uint _cid)
    {
        User u = users[addr];
        _cid = u.campaigns[u_cid];
    }
}

/*
// Solidity Interface
contract WeiFund{function campaigns(uint256 )constant returns(string32 name,string32 website,address owner,address beneficiary,uint256 timelimit,uint256 fundingGoal,uint256 amount,uint256 category,uint256 status,uint256 numFunders){}function userCampaigns(address addr,uint256 u_cid)returns(uint256 _cid){}function refund(uint256 cid){}function numCampaigns()constant returns(uint256 ){}function newCampaign(string32 name,string32 website,address beneficiary,uint256 goal,uint256 timelimit,uint256 category){}function users(address )constant returns(uint256 numCampaigns){}function contribute(uint256 cid){}function payout(uint256 cid){}}

// JS Hex (Compiled in AlethZero)
var WeiFundHex = "6104b98061000e6000396000f30060003560e060020a90048063141961bc1461006357806319ac74bd146100b1578063278ecde1146100c95780632c0f7b6f146100da5780639aac25c6146100ec578063a87430ba1461010c578063c1cbbca714610121578063e11523431461013257005b61006e600435610370565b896000528860205287600160a060020a031660405286600160a060020a0316606052856080528460a0528360c0528260e052816101005280610120526101406000f35b6100bf6004356024356103ba565b8060005260206000f35b6100d460043561022e565b60006000f35b6100e2610159565b8060005260206000f35b61010660043560243560443560643560843560a43561015f565b60006000f35b610117600435610144565b8060005260206000f35b61012c6004356103fb565b60006000f35b61013d600435610305565b60006000f35b5b600052600260205260406000208054905081565b5b60005481565b600060006000600060008711801561017657504286115b61017f57610222565b600080549081600101905593506001600085815260200190815260200160002092508983819055503383600201819055508883600101819055508783600301819055508683600501819055508583600401819055508483600701819055506002600033600160a060020a03168152602001908152602001600020915081805490816001019055905083826001016000838152602001908152602001600020819055505b50505050505050505050565b60006000600160008481526020019081526020016000209150816004015442118015610261575081600501548260060154105b8015610271575060008260060154115b61027a57610300565b81600a01600083600b01600033600160a060020a03168152602001908152602001600020548152602001908152602001600020905060008160010154116102c0576102ff565b8054600160a060020a0316600082600101546000600060006000848787f150505050806001015482600601908154039081905550600081600101819055505b5b505050565b60006001600083815260200190815260200160002090508060050154816006015410156103315761036b565b8060030154600160a060020a0316600082600601546000600060006000848787f15050505060008160060181905550600181600801819055505b5050565b5b60005260016020526040600020805490806001015490806002015490806003015490806004015490806005015490806006015490806007015490806008015490806009015490508a565b600060006002600085600160a060020a0316815260200190815260200160002090508060010160008481526020019081526020016000205491505092915050565b6000600060006000341161040e576104b3565b60016000858152602001908152602001600020925042836004015410158061043e57508260050154836006015410155b610447576104b2565b82600901805490816001019055915082600a01600083815260200190815260200160002090503381819055503481600101819055508060010154836006019081540190819055508183600b01600033600160a060020a03168152602001908152602001600020819055505b5b5050505056";

// JS ABI (Generated in AlethZero)
var WeiFundABI = web3.eth.contractFromAbi([{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"campaigns","outputs":[{"name":"name","type":"string32"},{"name":"website","type":"string32"},{"name":"owner","type":"address"},{"name":"beneficiary","type":"address"},{"name":"timelimit","type":"uint256"},{"name":"fundingGoal","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"category","type":"uint256"},{"name":"status","type":"uint256"},{"name":"numFunders","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"u_cid","type":"uint256"}],"name":"userCampaigns","outputs":[{"name":"_cid","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"cid","type":"uint256"}],"name":"refund","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"numCampaigns","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string32"},{"name":"website","type":"string32"},{"name":"beneficiary","type":"address"},{"name":"goal","type":"uint256"},{"name":"timelimit","type":"uint256"},{"name":"category","type":"uint256"}],"name":"newCampaign","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"users","outputs":[{"name":"numCampaigns","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"cid","type":"uint256"}],"name":"contribute","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"cid","type":"uint256"}],"name":"payout","outputs":[],"type":"function"}]);

*/
