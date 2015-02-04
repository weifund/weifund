// Original by Chriseth's Crowdfunding Example SOL
// Modifications & Additions by SilentCicero
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
        address beneficiary;
        uint timelimit;
        uint fundingGoal;
        uint amount;
        uint numFunders;
        mapping (uint => Funder) funders;
    }
  
    uint numCampaigns;
    mapping (uint => Campaign) campaigns;
    
    function newCampaign(string32 name, string32 website
    , address beneficiary, uint goal, uint timelimit) returns (uint campaignID) 
    {
        campaignID = numCampaigns++; // campaignID is return variable
        Campaign c = campaigns[campaignID];  // assigns reference
        c.name = name;
        c.website = website;
        c.beneficiary = beneficiary;
        c.fundingGoal = goal;
        c.timelimit = timelimit;
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
    
    function getCampain(uint campaignID) returns (string32 r_name
    , string32 r_website, address r_benificiary, uint r_fundingGoal
    , uint r_numFunders, uint r_amount, uint r_timelimit)
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
    }
}
