// WeiFund v0.2
// Start, donate, payout and refund crowdfunding campaigns
contract WeiFundConfig 
{ 
    function onNewCampaign(uint cid, address addr, uint goal){} 
    function onContribute(uint cid, address addr, uint amount){} 
    function onRefund(uint cid, address addr, uint amount){} 
    function onPayout(uint cid, uint amount){}
}

/// @title WeiFund - A Decentralized Crowdfunding Platform
/// @author Nick Dodson <thenickdodson@gmail.com>
contract WeiFund 
{
    // @notice User; This object stores the campaign operator data
    // @dev This object stores all pertinant campaign operator data, such as how many campaigns the operator has started, and the campaign ID's of all the campaigns they have or are operating
    struct User
    {
        uint numCampaigns;
        mapping(uint => uint) campaigns;
    }
    
    // @notice Funder; This object helps store the pertinant contributer data.
    // @dev This object stores the contributer data, such as the contributer address, and amount.
    struct Funder 
    {
        address from;
        address addr;
        uint amount;
    }
    
    // @notice Campaign; The crowdfunding campaign object
    // @dev This object stores all the pertinant campaign data, such as: the name, beneificary, fundingGoal, and the funder data. 
    struct Campaign 
    {
        bytes32 name;
        bytes32 website;
        bytes32 video;
        address owner;
        address beneficiary;
        address config;
        uint timelimit;
        uint fundingGoal;
        uint amount;
        uint category;
        uint status;
        uint numFunders;
        mapping (uint => Funder) funders;
        mapping (address => uint) toFunder;
    }
  
    /// @notice numCampaigns; The total number of crowdfunding campaigns started on WeiFund
    /// @dev This is the uint store that contains the number of the total amount of all crowdfunding campaigns started on WeiFund. This is also used to generate campaign ID numbers.
    uint public numCampaigns;
    
    /// @notice Campaigns (the campaign ID); Get the campaign data at the specified campaign ID
    /// @dev This data store maps campaign ID's to stored Campaign objects. With this method you can access any crowdfunding campaign started on WeiFund.
    mapping (uint => Campaign) public campaigns;
    
    /// @notice Users (the user address); Get the number of campaigns a user has started
    /// @dev This will return a user object that contains the number of campaigns a user has started. Use the userCampaigns method to the ID's to the crowdfunding campaigns that they have started.
    mapping (address => User) public users;
    
    // The WeiFund Events
    event onNewCampaign(address indexed _from, uint indexed _cid);
    event onContribute(address indexed _from, uint indexed _cid, uint _value);
    event onPayout(address indexed _from, uint indexed _cid, uint _value);
    event onRefund(address indexed _from, uint indexed _cid, uint _value);
    
    modifier hasValue { if(msg.value > 0) _ }
    
    /// @notice New Campaign; create a new crowdfunding campaign
    /// @dev This method starts a new crowdfunding campaign and fires the onNewCampaign event when transacted.
    /// @param _name The campaign name
    /// @param _website The website of the crowdfunding campaign
    /// @param _video The compressed video url (e.g. yt JFdi289d)
    /// @param _beneficiary The address of the beneficiary for this campaign
    /// @param _goal The funding goal of the campaign. If this goal is not met by the timelimit, all ether will be refunded to the respective contributers
    /// @param _timelimit The timelimit for the campaign
    /// @param _category The category ID for the crowdfunding campaign (e.g. 2: Technology)
    /// @param _config  
    function newCampaign(bytes32 _name, bytes32 _website, bytes32 _video
    , address _beneficiary, uint _goal, uint _timelimit, uint _category, address _config)
    {
        if(_goal > 0 && _timelimit > now){
            uint cid = numCampaigns++; // campaignID is return variable
            Campaign c = campaigns[cid];  // assigns reference
            c.name = _name;
            c.website = _website;
            c.video = _video;
            c.owner = msg.sender;
            c.beneficiary = _beneficiary;
            c.fundingGoal = _goal;
            c.timelimit = _timelimit;
            c.category = _category;
            c.config = _config;
            
            User u = users[msg.sender];
            uint u_cid = u.numCampaigns++;
            u.campaigns[u_cid] = cid;
            
            onNewCampaign(msg.sender, cid);
            
            if(c.config != address(0))
                WeiFundConfig(c.config).onNewCampaign(cid, msg.sender, _goal);
        }
    }
    
    /// @notice Contribute (the campaign ID); contribute ether to a WeiFund campaign
    /// @dev This method will contribute an amount of ether to the campaign at ID _cid. All contribution data will be stored so that the issuance of digital assets can be made out to the contributor address
    /// @param _cid (Campaign ID) The ID number of the crowdfunding campaign
    /// @param _addr (Contribute As Address) This allows a user to contribute on behalf of another address, if left empty, the from sender address is used as the primary Funder address
    function contribute(uint _cid, address _addr) hasValue
    {
        Campaign c = campaigns[_cid]; // Cannot be expired.
        if(c.timelimit >= block.timestamp){
            uint fid = c.numFunders++;
            Funder f = c.funders[fid];
            f.from = msg.sender;
            f.addr = _addr;
            f.amount = msg.value;
            c.amount += f.amount;
            c.toFunder[msg.sender] = fid;
            onContribute(msg.sender, _cid, c.amount);
            
            if(c.config != address(0))
                WeiFundConfig(c.config).onContribute(_cid, msg.sender, msg.value);
        }
    }
    
    /// @notice Refund (the campaign ID); refund your contribution of a failed or expired crowdfunding campaign. 
    /// @dev This method will refund the amount you contributed to a WeiFund campaign, if that campaign has failed to meet it's funding goal or has expired.
    /// @param _cid (Campaign ID) The ID number of the crowdfunding campaign to be refunded
    function refund(uint _cid)
    {
        Campaign c = campaigns[_cid];
        if (block.timestamp > c.timelimit
        && c.amount < c.fundingGoal && c.amount > 0){
            Funder f = c.funders[c.toFunder[msg.sender]];
            if(f.amount > 0){
                address recv = f.from;
                
                if(f.addr != address(0))
                    recv = f.addr;
                
                recv.send(f.amount);
                c.amount -= f.amount;
                onRefund(recv, _cid, f.amount);
                f.amount = 0;
            
                if(c.config != address(0))
                    WeiFundConfig(c.config).onRefund(_cid, recv, f.amount);
            }
        }
    }
  
    /// @notice Payout (the campaign ID); this will payout a successfull crowdfunding campaign to the benificiary address
    /// @dev This method will payout a successfull WeiFund crowdfunding campaign to the benificiary address specified. Any person can trigger the payout by calling this method.
    /// @param _cid (Campaign ID) The ID number of the crowdfunding campaign
    function payout(uint _cid)
    {
        Campaign c = campaigns[_cid];
        if (c.amount >= c.fundingGoal){
            c.beneficiary.send(c.amount);
            onPayout(msg.sender, _cid, c.amount);
            c.amount = 0;
            c.status = 1;
            
            if(c.config != address(0))
                WeiFundConfig(c.config).onPayout(_cid, c.amount);
        }
    }
    
    /// @notice User Campaigns (the address of the user, the user campaign ID); get the campaign ID of one of the users crowdfunding campaigns.
    /// @dev This method will get the campaign ID of one of the users crowdfunding campaigns, by looking up the campaign with a user campaign ID. All campaign owners and their campaigns are stored with WeiFund.
    /// @param _addr The address of the campaign operator.
    /// @param _u_cid The user campaign ID
    /// @return cid The campaign ID
    function userCampaigns(address _addr, uint _u_cid) returns (uint cid)
    {
        User u = users[_addr];
        cid = u.campaigns[_u_cid];
    }
}
                        