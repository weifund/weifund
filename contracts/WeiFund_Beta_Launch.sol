// WeiFund v1
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
    
    // @notice Contributor; This object helps store the pertinant contributer data.
    // @dev This object stores the contributer data, such as the contributer address, and amount.
    struct Contributor 
    {
        address addr;
        address beneficiary;
        uint amountContributed;
        bool refunded;
    }
    
    // @notice Campaign; The crowdfunding campaign object
    // @dev This object stores all the pertinant campaign data, such as: the name, beneificary, fundingGoal, and the funder data. 
    struct Campaign 
    {
        string name;
        address owner;
        address beneficiary;
        address config;
        uint timelimit;
        uint fundingGoal;
        uint amountRaised;
        bool payedout;
        uint numFunders;
        mapping (uint => Contributor) contributors;
        mapping (address => uint) toContributor;
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
    event onNewCampaign(address indexed _from, uint indexed _campaignID);
    event onContribute(address indexed _from, uint indexed _campaignID, uint _value);
    event onPayout(address indexed _from, uint indexed _campaignID, uint _value);
    event onRefund(address indexed _from, uint indexed _campaignID, uint _value);
    
    /// @notice New Campaign; create a new crowdfunding campaign
    /// @dev This method starts a new crowdfunding campaign and fires the onNewCampaign event when transacted.
    /// @param _name The campaign name
    /// @param _beneficiary The address of the beneficiary for this campaign
    /// @param _fundingGoal The funding goal of the campaign. If this goal is not met by the timelimit, all ether will be refunded to the respective contributers
    /// @param _timelimit The timelimit for the campaign
    /// @param _config The configuration address
    function newCampaign(string _name, address _beneficiary, uint _fundingGoal, uint _timelimit, address _config) public
    {
        if(_fundingGoal <= 0 || _timelimit <= now)
            throw;
            
        uint _campaignID = numCampaigns++; // campaignID is return variable
        Campaign c = campaigns[_campaignID];  // assigns reference
        c.name = _name;
        c.owner = msg.sender;
        c.beneficiary = _beneficiary;
        c.fundingGoal = _fundingGoal;
        c.timelimit = _timelimit;
        c.config = _config;
        
        User u = users[msg.sender];
        uint u_cid = u.numCampaigns++;
        u.campaigns[u_cid] = _campaignID;
        
        onNewCampaign(msg.sender, _campaignID);
        
        if(c.config != address(0))
            WeiFundConfig(c.config).onNewCampaign(_campaignID, msg.sender, _fundingGoal);
    }
    
    /// @notice Contribute (the campaign ID); contribute ether to a WeiFund campaign
    /// @dev This method will contribute an amount of ether to the campaign at ID _cid. All contribution data will be stored so that the issuance of digital assets can be made out to the contributor address
    /// @param _campaignID (Campaign ID) The ID number of the crowdfunding campaign
    /// @param _beneficiary (Contribute As Address) This allows a user to contribute on behalf of another address, if left empty, the from sender address is used as the primary Funder address
    function contribute(uint _campaignID, address _beneficiary) public
    {
        Campaign c = campaigns[_campaignID];
        
        if(now > c.timelimit || msg.value == 0)
            throw;
            
        uint bid = c.numFunders++;
        Contributor backer = c.contributors[bid];
        backer.addr = msg.sender;
        backer.beneficiary = _beneficiary;
        backer.amountContributed = msg.value;
        c.amountRaised += backer.amountContributed;
        c.toContributor[msg.sender] = bid;
        onContribute(msg.sender, _campaignID, c.amountRaised);
        
        if(c.config != address(0))
            WeiFundConfig(c.config).onContribute(_campaignID, msg.sender, msg.value);
    }
    
    /// @notice Refund (the campaign ID); refund your contribution of a failed or expired crowdfunding campaign. 
    /// @dev This method will refund the amount you contributed to a WeiFund campaign, if that campaign has failed to meet it's funding goal or has expired.
    /// @param _campaignID (Campaign ID) The ID number of the crowdfunding campaign to be refunded
    function refund(uint _campaignID) public
    {
        Campaign c = campaigns[_campaignID];
        
        if (!hasFailed(_campaignID))
            throw;
            
        Contributor backer = c.contributors[c.toContributor[msg.sender]];
        
        if(backer.amountContributed <= 0 || backer.refunded)
            throw;
            
        address recv = backer.addr;
        
        if(backer.addr != address(0))
            recv = backer.addr;
        
        recv.send(backer.amountContributed);
        onRefund(recv, _campaignID, backer.amountContributed);
        backer.refunded = true;
    
        if(c.config != address(0))
            WeiFundConfig(c.config).onRefund(_campaignID, recv, backer.amountContributed);
    }
  
    /// @notice Payout (the campaign ID); this will payout a successfull crowdfunding campaign to the benificiary address
    /// @dev This method will payout a successfull WeiFund crowdfunding campaign to the benificiary address specified. Any person can trigger the payout by calling this method.
    /// @param _campaignID (Campaign ID) The ID number of the crowdfunding campaign
    function payout(uint _campaignID) public
    {
        Campaign c = campaigns[_campaignID];
        
        if(!isSuccess(_campaignID))
            throw;
            
        c.beneficiary.send(c.amountRaised);
        onPayout(msg.sender, _campaignID, c.amountRaised);
        c.amountRaised = 0;
        c.payedout = true;
        
        if(c.config != address(0))
            WeiFundConfig(c.config).onPayout(_campaignID, c.amountRaised);
    }
    
    /// @notice User Campaigns (the address of the user, the user campaign ID); get the campaign ID of one of the users crowdfunding campaigns.
    /// @dev This method will get the campaign ID of one of the users crowdfunding campaigns, by looking up the campaign with a user campaign ID. All campaign owners and their campaigns are stored with WeiFund.
    /// @param _addr The address of the campaign operator.
    /// @param _u_campaignID The user campaign ID
    /// @return _campaignID The campaign ID
    function userCampaigns(address _addr, uint _u_campaignID) public constant returns (uint _campaignID)
    {
        User u = users[_addr];
        _campaignID = u.campaigns[_u_campaignID];
    }
    
    function contributorAt(uint _campaignID, uint _funderID) public constant  returns (address _funder, address _beneficiary, uint _amountContributed, bool _refunded)
    {
        Campaign c = campaigns[_campaignID];
        
        return (c.contributors[_funderID].addr, c.contributors[_funderID].beneficiary, c.contributors[_funderID].amountContributed, c.contributors[_funderID].refunded);
    }
    
    function contributorID(uint _campaignID, address _funderAddress) public constant  returns (uint) {
        Campaign c = campaigns[_campaignID];
        
        return c.toContributor[_funderAddress];
    }
    
    function isContributor(uint _campaignID, address _funderAddress) public constant  returns (bool) {
        Campaign c = campaigns[_campaignID];
        
        if(c.contributors[c.toContributor[_funderAddress]].amountContributed != 0)
            return true;
    }
    
    function ownerOf(uint _campaignID) public constant  returns (address){
        Campaign c = campaigns[_campaignID];
        
        return c.owner;
    }
    
    function beneficiaryOf(uint _campaignID) public constant  returns (address){
        Campaign c = campaigns[_campaignID];
        
        return c.beneficiary;
    }
    
    function configOf(uint _campaignID) public constant returns (address){
        Campaign c = campaigns[_campaignID];
        
        return c.config;
    }
    
    function amountOf(uint _campaignID) public constant  returns (uint){
        Campaign c = campaigns[_campaignID];
        
        return c.amountRaised;
    }
    
    function goalOf(uint _campaignID) public constant  returns (uint){
        Campaign c = campaigns[_campaignID];
        
        return c.fundingGoal;
    }
    
    function timelimitOf(uint _campaignID) public constant  returns (uint){
        Campaign c = campaigns[_campaignID];
        
        return c.timelimit;
    }
    
    function totalFunders(uint _campaignID) public constant  returns (uint){
        Campaign c = campaigns[_campaignID];
        
        return c.numFunders;
    }
    
    function isOwner(address _owner, uint _campaignID) public constant returns (bool){
        Campaign c = campaigns[_campaignID];
        
        if(c.owner == _owner)
            return true;
    }
    
    function hasFailed(uint _campaignID) public constant  returns (bool){
        Campaign c = campaigns[_campaignID];
        
        if (block.timestamp > c.timelimit
            && c.amountRaised < c.fundingGoal 
            && c.amountRaised > 0)
            return true;
    }
    
    function isSuccess(uint _campaignID) public constant  returns (bool){
        Campaign c = campaigns[_campaignID];
        
        if (c.amountRaised >= c.fundingGoal)
            return true;
    }
    
    function isPayedOut(uint _campaignID) public constant  returns (bool){
        Campaign c = campaigns[_campaignID];
        
        return c.payedout;
    }
    
    function totalRefunded(uint _campaignID) public constant  returns (uint){
        Campaign c = campaigns[_campaignID];
        uint refunded = 0;
        
        for(uint funderID = 0; funderID < c.numFunders; funderID++) {
            if(c.contributors[funderID].refunded == true)
                refunded += c.contributors[funderID].amountContributed;
        }
        
        return refunded;
    }
    
    function isRefunded(uint _campaignID) public constant  returns (bool){
        Campaign c = campaigns[_campaignID];
        
        for(uint funderID = 0; funderID < c.numFunders; funderID++) {
            if(c.contributors[funderID].refunded != true)
                return false;
        }
        
        return true;
    }
}
                        
