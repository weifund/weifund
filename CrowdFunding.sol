// sol CrowdFundrr
// Simple crowdfunding platform
// @authors:
//   Original: Chriseth (from #ethereum-dev)
//   Modified: SilentCicero (Nick Dodson)
contract CrowdFundrr 
{
    struct Funder 
    {
        address addr;
        uint amount;
    }
    
    struct Campaign 
    {
        string32 name;
        string32 website;
        address owner;
        address beneficiary;
        uint timelimit;
        uint fundingGoal;
        uint amount;
        uint category;
        uint numFunders;
        mapping (uint => Funder) funders;
    }
    
    struct User
    {
        uint numCampaigns;
        mapping(uint => uint) campaigns;
    }
  
    uint numCampaigns;
    mapping (uint => Campaign) campaigns;
    mapping (address => User) users;
    
    function newCampaign(string32 name, string32 website
    , address beneficiary, uint goal, uint timelimit, uint category) returns (uint campaignID) 
    {
        campaignID = numCampaigns++; // campaignID is return variable
        Campaign c = campaigns[campaignID];  // assigns reference
        c.name = name;
        c.owner = msg.sender;
        c.website = website;
        c.beneficiary = beneficiary;
        c.fundingGoal = goal;
        c.timelimit = timelimit;
        c.category = category;
        
        User u = users[msg.sender];
        uint uCampaignID = u.numCampaigns++;
        u.campaigns[uCampaignID] = campaignID;
    }
    
    function contribute(uint campaignID) 
    {
        Campaign c = campaigns[campaignID];
        Funder f = c.funders[c.numFunders++];
        f.addr = msg.sender;
        f.amount = msg.value;
        c.amount += f.amount;
    }
  
    function checkGoalReached(uint campaignID) returns (bool reached) 
    {
        Campaign c = campaigns[campaignID];
        if (block.timestamp > c.timelimit && c.amount < c.fundingGoal)
        {
            for(uint i; i < c.numFunders; i ++)
            {
                Funder get_funder = c.funders[i];
                get_funder.addr.send(get_funder.amount);
            }
        }
        if (c.amount < c.fundingGoal)
            return false;
        c.beneficiary.send(c.amount);
        c.amount = 0;
        
        // Delete Everything
        // We may not want this..
        c.name = "";
        c.owner = 0;
        c.website = "";
        c.beneficiary = 0;
        c.fundingGoal = 0;
        c.timelimit = 0;
        c.category = 0;
        
        return true;
    }
    
    function getNumCampaigns() returns (uint r_numCampaigns)
    {
        return numCampaigns;
    }
    
    function getCampaign(uint campaignID) returns (string32 r_name
    , string32 r_website, address r_benificiary, uint r_fundingGoal
    , uint r_numFunders, uint r_amount, uint r_timelimit, address r_owner
    , uint r_ownerNumCampaigns, uint r_category)
    {
        Campaign c = campaigns[campaignID];
        r_name = c.name;
        r_website = c.website;
        r_benificiary = c.beneficiary;
        r_fundingGoal = c.fundingGoal;
        r_numFunders = c.numFunders;
        r_amount = c.amount;
        r_timelimit = c.timelimit;
        r_owner = c.owner;
        r_category = c.category;
        
        User u = users[c.owner];
        r_ownerNumCampaigns = u.numCampaigns;
    }
    
    function getUser(address uAddr) returns (uint uNumCampaigns)
    {
        User u = users[uAddr];
        return u.numCampaigns;
    }
    
    function getUserCampaign(address uAddr, uint uCID) returns (uint uCampaignID)
    {
        User u = users[uAddr];
        return u.campaigns[uCID];
    }
    
    function getUserLatest(address uAddr) returns (uint uCampaignID)
    {
        User u = users[uAddr];
        return u.campaigns[u.numCampaigns - 1];
    }
}

/*
var contract_hex = "6104aa8061000e6000396000f30060e060020a6000350480634a616c3d146100625780635598f8cc1461007a5780635b2329d4146100c85780636f77926b146100dd5780639aac25c6146100f2578063c1cbbca714610116578063d6ce497d14610127578063d9a9bb3e1461013c57005b610070600435602435610439565b8060005260206000f35b61008560043561014e565b896000528860205287600160a060020a031660405286606052856080528460a0528360c05282600160a060020a031660e052816101005280610120526101406000f35b6100d36004356102e2565b8060005260206000f35b6100e8600435610412565b8060005260206000f35b61010c60043560243560443560643560843560a4356101e2565b8060005260206000f35b61012160043561028a565b60006000f35b610132600435610470565b8060005260206000f35b610144610408565b8060005260206000f35b60006000600060006000600060006000600060006000600060018d6000526020526040600020915081549b5081600101549a508160030154995081600501549850816008015497508160060154965081600401549550816002015494508160070154925060028260020154600160a060020a0316600052602052604060002090508054935050509193959799509193959799565b60006000600060006000805490816001019055935060018460005260205260406000209250898381905550338360020181905550888360010181905550878360030181905550868360050181905550858360040181905550848360070181905550600233600160a060020a0316600052602052604060002091508180549081600101905590508382600101826000526020526040600020819055505050509695505050505050565b6000600060018360005260205260406000209150816009018260080180549081600101905560005260205260406000209050338181905550348160010181905550806001015482600601908154019081905550505050565b600060006000600060018560005260205260406000209250826004015442118015610314575082600501548360060154105b61031d5761036c565b5b826008015482101561036b578260090182600052602052604060002090508054600160a060020a0316600082600101546000600060006000848787f150505050818060010192505061031e565b5b826005015483600601541061038057610389565b60009350610400565b8260030154600160a060020a0316600084600601546000600060006000848787f1505050506000836006018190555060008381905550600083600201819055506000836001018190555060008360030181905550600083600501819055506000836004018190555060008360070181905550600193505b505050919050565b6000600054905090565b60006000600283600160a060020a0316600052602052604060002090508054915050919050565b60006000600284600160a060020a031660005260205260406000209050806001018360005260205260406000205491505092915050565b60006000600283600160a060020a03166000526020526040600020905080600101600182540360005260205260406000205491505091905056";

var CrowdFunding = web3.eth.contractFromAbi([{"constant":true,"inputs":[],"name":"numCampaigns","outputs":[{"name":"numCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"},{"name":"uCID","type":"uint256"}],"name":"getUserCampaign","outputs":[{"name":"uCampaignID","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"getCampaign","outputs":[{"name":"r_name","type":"string32"},{"name":"r_website","type":"string32"},{"name":"r_benificiary","type":"address"},{"name":"r_fundingGoal","type":"uint256"},{"name":"r_numFunders","type":"uint256"},{"name":"r_amount","type":"uint256"},{"name":"r_timelimit","type":"uint256"},{"name":"r_owner","type":"address"},{"name":"r_ownerNumCampaigns","type":"uint256"},{"name":"r_category","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached","type":"bool"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"}],"name":"getUser","outputs":[{"name":"uNumCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"name","type":"string32"},{"name":"website","type":"string32"},{"name":"beneficiary","type":"address"},{"name":"goal","type":"uint256"},{"name":"timelimit","type":"uint256"},{"name":"category","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"campaignID","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"contribute","outputs":[]},{"constant":true,"inputs":[],"name":"campaigns","outputs":[{"name":"campaigns","type":"mapping(uint256=>structCampaign)"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"}],"name":"getUserLatest","outputs":[{"name":"uCampaignID","type":"uint256"}]},{"constant":false,"inputs":[],"name":"getNumCampaigns","outputs":[{"name":"r_numCampaigns","type":"uint256"}]},{"constant":true,"inputs":[],"name":"users","outputs":[{"name":"users","type":"mapping(address=>structUser)"}]}]);

contract CrowdFunding{function numCampaigns()constant returns(uint256 numCampaigns){}function getUserCampaign(address uAddr,uint256 uCID)returns(uint256 uCampaignID){}function getCampaign(uint256 campaignID)returns(string32 r_name,string32 r_website,address r_benificiary,uint256 r_fundingGoal,uint256 r_numFunders,uint256 r_amount,uint256 r_timelimit,address r_owner,uint256 r_ownerNumCampaigns,uint256 r_category){}function checkGoalReached(uint256 campaignID)returns(bool reached){}function getUser(address uAddr)returns(uint256 uNumCampaigns){}function newCampaign(string32 name,string32 website,address beneficiary,uint256 goal,uint256 timelimit,uint256 category)returns(uint256 campaignID){}function contribute(uint256 campaignID){}function campaigns()constant returns(mapping(uint256 => struct Campaign) campaigns){}function getUserLatest(address uAddr)returns(uint256 uCampaignID){}function getNumCampaigns()returns(uint256 r_numCampaigns){}function users()constant returns(mapping(address => struct User) users){}}
*/
