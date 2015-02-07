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
