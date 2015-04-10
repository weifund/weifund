// WeiFund System
// Start, donate, payout and refund crowdfunding campaigns
// @authors:
// Nick Dodson <thenickdodson@gmail.com>
// If goal is not reached and campaign is expired, contributers can get their donation refunded individually
// If goal is reached by alloted time, contributions can still be made
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
