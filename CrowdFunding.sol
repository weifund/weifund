contract CrowdFunding 
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
    , address beneficiary, uint goal, uint timelimit) returns (uint campaignID) 
    {
        campaignID = numCampaigns++; // campaignID is return variable
        Campaign c = campaigns[campaignID];  // assigns reference
        c.name = name;
        c.owner = msg.sender;
        c.website = website;
        c.beneficiary = beneficiary;
        c.fundingGoal = goal;
        c.timelimit = timelimit;
        
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
        return true;
    }
    
    function get_numCampaigns() returns (uint r_numCampaigns)
    {
        return numCampaigns;
    }
    
    function getUser(address uAddr) returns (uint uNumCampaigns)
    {
        User u = users[uAddr];
        return u.numCampaigns;
    }
    
    function get_userCampaign(address uAddr, uint uCID) returns (uint uCampaignID)
    {
        User u = users[uAddr];
        return u.campaigns[uCID];
    }
    
    function getCampaign(uint campaignID) returns (string32 r_name
    , string32 r_website, address r_benificiary, uint r_fundingGoal
    , uint r_numFunders, uint r_amount, uint r_timelimit, address r_owner
    , uint r_ownerNumCampaigns)
    {
        Campaign c = campaigns[campaignID];
        r_name = c.name;
        r_website = c.website;
        r_benificiary = c.beneficiary;
        r_fundingGoal = c.fundingGoal;
        r_numFunders = c.numFunders;
        r_numFunders = c.numFunders;
        r_amount = c.amount;
        r_timelimit = c.timelimit;
        r_owner = c.owner;
        
        User u = users[c.owner];
        r_ownerNumCampaigns = u.numCampaigns;
    }
}

/*
var CrowdFunding = web3.eth.contractFromAbi([{"constant":true,"inputs":[],"name":"numCampaigns","outputs":[{"name":"numCampaigns","type":"uint256"}]},{"constant":false,"inputs":[],"name":"get_numCampaigns","outputs":[{"name":"r_numCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"getCampaign","outputs":[{"name":"r_name","type":"string32"},{"name":"r_website","type":"string32"},{"name":"r_benificiary","type":"address"},{"name":"r_fundingGoal","type":"uint256"},{"name":"r_numFunders","type":"uint256"},{"name":"r_amount","type":"uint256"},{"name":"r_timelimit","type":"uint256"},{"name":"r_owner","type":"address"},{"name":"r_ownerNumCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached","type":"bool"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"}],"name":"getUser","outputs":[{"name":"uNumCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"name","type":"string32"},{"name":"website","type":"string32"},{"name":"beneficiary","type":"address"},{"name":"goal","type":"uint256"},{"name":"timelimit","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"campaignID","type":"uint256"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"},{"name":"uCID","type":"uint256"}],"name":"get_userCampaign","outputs":[{"name":"uCampaignID","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"contribute","outputs":[]},{"constant":true,"inputs":[],"name":"campaigns","outputs":[{"name":"campaigns","type":"mapping(uint256=>structCampaign)"}]},{"constant":true,"inputs":[],"name":"users","outputs":[{"name":"users","type":"mapping(address=>structUser)"}]}]);

contract CrowdFunding{function numCampaigns()constant returns(uint256 numCampaigns){}function get_numCampaigns()returns(uint256 r_numCampaigns){}function getCampaign(uint256 campaignID)returns(string32 r_name,string32 r_website,address r_benificiary,uint256 r_fundingGoal,uint256 r_numFunders,uint256 r_amount,uint256 r_timelimit,address r_owner,uint256 r_ownerNumCampaigns){}function checkGoalReached(uint256 campaignID)returns(bool reached){}function getUser(address uAddr)returns(uint256 uNumCampaigns){}function newCampaign(string32 name,string32 website,address beneficiary,uint256 goal,uint256 timelimit)returns(uint256 campaignID){}function get_userCampaign(address uAddr,uint256 uCID)returns(uint256 uCampaignID){}function contribute(uint256 campaignID){}function campaigns()constant returns(mapping(uint256 => struct Campaign) campaigns){}function users()constant returns(mapping(address => struct User) users){}}
*/
