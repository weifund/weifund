// WeiFund v1.0
// Start, donate, payout and refund crowdfunding campaigns on Ethereum
// If campaign goal is not reached by the stated expiry, all funds are refundable back to oringial contributor accounts
// If campaign goal is reached or surpassed by stated expiry, all raised funds will be paid out to campaign beneficiary

/// @title The core WeiFund confirgutation hook interface
/// @author Nick Dodson <thenickdodson@gmail.com>
contract WeiFundConfig {
    function newCampaign(uint _campaignID, address _owner, uint _fundingGoal){}
    function contribute(uint _campaignID, address _contributor, uint _amountContributed){}
    function refund(uint _campaignID, address _contributor, uint _amountRefunded){}
    function payout(uint _campaignID, uint _amountRaised){}
}

/// @title The core WeiFund crowdfunding interface
/// @author Nick Dodson <thenickdodson@gmail.com>
contract WeiFundInterface {
    /// @notice New Campaign; create a new crowdfunding campaign
    /// @dev This method starts a new crowdfunding campaign and calles the campaigns configuration contract if stated
    /// @param _name The campaign name
    /// @param _beneficiary The address of the beneficiary for this campaign
    /// @param _fundingGoal The funding goal of the campaign. If this goal is not met by the timelimit, all ether will be refunded to the respective contributers
    /// @param _expiry When the campaign will expire and contributions can no longer be made
    /// @param _config The configuration address
    function newCampaign(string _name, address _beneficiary, uint _fundingGoal, uint _expiry, address _config) {}
    
    /// @notice Contribute (the campaign ID); contribute ether to a WeiFund campaign
    /// @dev This method will contribute an amount of ether to the campaign at ID _cid. All contribution data will be stored so that the issuance of digital assets can be made out to the contributor address
    /// @param _campaignID (Campaign ID) The ID number of the crowdfunding campaign
    /// @param _beneficiary (Contribute As Address) This allows a user to contribute on behalf of another address, if left empty, the from sender address is used as the primary Funder address
    function contribute(uint _campaignID, address _beneficiary) {}
    
    /// @notice Refund (the campaign ID); refund your contribution of a failed or expired crowdfunding campaign. 
    /// @dev This method will refund the amount you contributed to a WeiFund campaign, if that campaign has failed to meet it's funding goal or has expired.
    /// @param _campaignID (Campaign ID) The ID number of the crowdfunding campaign to be refunded
    function refund(uint _campaignID) {}
    
    /// @notice Payout (the campaign ID); this will payout a successfull crowdfunding campaign to the benificiary address
    /// @dev This method will payout a successfull WeiFund crowdfunding campaign to the benificiary address specified. Any person can trigger the payout by calling this method.
    /// @param _campaignID (Campaign ID) The ID number of the crowdfunding campaign
    function payout(uint _campaignID) {}
    
    /// @notice User Campaign ID (the address of the user, the user campaign ID); get the campaign ID of one of the users crowdfunding campaigns.
    /// @dev This method will get the campaign ID of one of the users crowdfunding campaigns, by looking up the campaign with a user campaign ID. All campaign owners and their campaigns are stored with WeiFund.
    /// @param _user The address of the campaign operator.
    /// @param _userCampaignID The user campaign ID
    /// @return _campaignID The campaign ID
    function userCampaignID(address _user, uint _userCampaignID) constant returns (uint _campaignID) {}
    
    /// @notice Total Number of Campaigns Started for a Given User
    /// @dev This method will get the campaign ID of one of the users crowdfunding campaigns, by looking up the campaign with a user campaign ID. All campaign owners and their campaigns are stored with WeiFund.
    /// @param _user The user's address
    /// @return _numCampaigns The number of campaigns
    function totalUserCampaigns(address _user) constant returns (uint _numCampaigns) {}
    
    /// @notice The total number of campaigns on WeiFund
    /// @dev This method returns the total number of campaigns on WeiFund as an unsigned integer
    /// @return _numCampaigns The number of campaigns
    function totalCampaigns() constant returns (uint _numCampaigns) {}
    
    /// @notice Contributor At ID;
    /// @dev For retrieving the contributor data at a specific contributor ID
    /// @param _campaignID The address of the campaign operator.
    /// @param _contributorID The user campaign ID
    /// @return _contributor, _beneficiary, _amountContributed, _refunded
    function contributorAt(uint _campaignID, uint _contributorID) constant returns (address _contributor, 
                                                                                            address _beneficiary, 
                                                                                            uint _amountContributed, 
                                                                                            bool _refunded){}
    function createdAt(uint _campaignID) public constant returns (uint){}
    function contributorID(uint _campaignID, address _contributor) constant returns (uint) {}
    function ownerOf(uint _campaignID) constant returns (address){}
    function beneficiaryOf(uint _campaignID) constant returns (address){}
    function configOf(uint _campaignID) constant returns (address){}
    function amountRaisedBy(uint _campaignID) constant returns (uint){}
    function fundingGoalOf(uint _campaignID) constant returns (uint){}
    function expiryOf(uint _campaignID) constant returns (uint){}
    function totalContributors(uint _campaignID) constant returns (uint){}
    
    function isContributor(uint _campaignID, address _contributor) constant returns (bool) {}
    function isOwner(uint _campaignID, address _owner) constant returns (bool){}
    function hasFailed(uint _campaignID) constant returns (bool){}
    function isSuccess(uint _campaignID) constant returns (bool){}
    function isPaidOut(uint _campaignID) constant returns (bool){}
    function totalRefunded(uint _campaignID) constant returns (uint){}
    function isRefunded(uint _campaignID) constant returns (bool){}
    
    event CampaignCreated(address indexed _owner, uint indexed _campaignID);
    event Contributed(address indexed _contributor, uint indexed _campaignID, uint _amountContributed);
    event PaidOut(address indexed _beneficiary, uint indexed _campaignID, uint _amountPaid);
    event Refunded(address indexed _contributor, uint indexed _campaignID, uint _amountRefunded);
}

/// @title WeiFund - A Decentralized Crowdfunding Platform
/// @author Nick Dodson <thenickdodson@gmail.com>
contract WeiFund is WeiFundInterface {
    // @notice User; A user is an account that has started campaigns on WeiFund
    // @dev This object stores all pertinant campaign operator data, such as how many campaigns the operator has started, and the campaign ID's of all the campaigns they have or are operating
    struct User {
        uint numCampaigns;
        mapping(uint => uint) campaigns;
    }
    
    // @notice Contributor; This object helps store the pertinant contributer data.
    // @dev This object stores the contributer data, such as the contributer address, and amount.
    struct Contributor {
        address addr;
        address beneficiary;
        uint amountContributed;
        bool refunded;
    }
    
    // @notice Campaign; The crowdfunding campaign object
    // @dev This object stores all the pertinant campaign data, such as: the name, beneificary, fundingGoal, and the funder data. 
    struct Campaign {
        string name;
        address owner;
        address beneficiary;
        address config;
        bool paidOut;
        uint expiry;
        uint fundingGoal;
        uint amountRaised;
        uint created;
        uint numContributors;
        mapping (uint => Contributor) contributors;
        mapping (address => uint) toContributor;
    }
    
    /// @notice version; The current version of the WeiFund contract
    /// @dev This is the version value of this WeiFund contract
    uint public version = 1;
  
    /// @notice numCampaigns; The total number of crowdfunding campaigns started on WeiFund
    /// @dev This is the uint store that contains the number of the total amount of all crowdfunding campaigns started on WeiFund. This is also used to generate campaign ID numbers.
    uint public numCampaigns;
    
    /// @notice Campaigns (the campaign ID); Get the campaign data at the specified campaign ID
    /// @dev This data store maps campaign ID's to stored Campaign objects. With this method you can access any crowdfunding campaign started on WeiFund.
    mapping (uint => Campaign) public campaigns;
    
    /// @notice Users (the user address); Get the number of campaigns a user has started
    /// @dev This will return a user object that contains the number of campaigns a user has started. Use the userCampaigns method to the ID's to the crowdfunding campaigns that they have started.
    mapping (address => User) public users;
    
    function newCampaign(string _name, address _beneficiary, uint _fundingGoal, uint _expiry, address _config) public {
        if(_fundingGoal <= 0 || _expiry <= now)
            throw;
            
        uint _campaignID = numCampaigns++; // campaignID is return variable
        Campaign c = campaigns[_campaignID];  // assigns reference
        c.name = _name;
        c.owner = msg.sender;
        c.beneficiary = _beneficiary;
        c.fundingGoal = _fundingGoal;
        c.expiry = _expiry;
        c.created = now;
        c.config = _config;
        
        User u = users[msg.sender];
        uint u_campaignID = u.numCampaigns++;
        u.campaigns[u_campaignID] = _campaignID;
        
        CampaignCreated(msg.sender, _campaignID);
        
        if(c.config != address(0))
            WeiFundConfig(c.config).newCampaign(_campaignID, msg.sender, _fundingGoal);
    }
    
    function contribute(uint _campaignID, address _beneficiary) public {
        Campaign c = campaigns[_campaignID];
        
        if(now > c.expiry || msg.value == 0)
            throw;
            
        uint backerID = c.numContributors++;
        Contributor backer = c.contributors[backerID];
        backer.addr = msg.sender;
        backer.beneficiary = _beneficiary;
        backer.amountContributed = msg.value;
        c.amountRaised += backer.amountContributed;
        c.toContributor[msg.sender] = backerID;
        Contributed(msg.sender, _campaignID, c.amountRaised);
        
        if(c.config != address(0))
            WeiFundConfig(c.config).contribute(_campaignID, msg.sender, msg.value);
    }
    
    function refund(uint _campaignID) public {
        Campaign c = campaigns[_campaignID];
        
        if (!hasFailed(_campaignID))
            throw;
            
        Contributor backer = c.contributors[c.toContributor[msg.sender]];
        
        if(backer.amountContributed <= 0 || backer.refunded)
            throw;
            
        address receiver = backer.addr;
        
        if(backer.addr != address(0))
            receiver = backer.addr;
        
        receiver.send(backer.amountContributed);
        Refunded(receiver, _campaignID, backer.amountContributed);
        backer.refunded = true;
    
        if(c.config != address(0))
            WeiFundConfig(c.config).refund(_campaignID, receiver, backer.amountContributed);
    }
  
    function payout(uint _campaignID) public {
        Campaign c = campaigns[_campaignID];
        
        if(!isSuccess(_campaignID))
            throw;
            
        c.beneficiary.send(c.amountRaised);
        PaidOut(msg.sender, _campaignID, c.amountRaised);
        c.amountRaised = 0;
        c.paidOut = true;
        
        if(c.config != address(0))
            WeiFundConfig(c.config).payout(_campaignID, c.amountRaised);
    }
    
    function userCampaignID(address _user, uint _userCampaignID) public constant returns (uint _campaignID) {
        User u = users[_user];
        
        return u.campaigns[_userCampaignID];
    }
    
    function totalUserCampaigns(address _user) constant returns (uint _numCampaigns) {
        User u = users[_user];
        
        return u.numCampaigns;
    }
    
    function totalCampaigns() constant returns (uint _numCampaigns) {
        return numCampaigns;
    }
    
    function contributorAt(uint _campaignID, uint _contributorID) public constant returns (address _contributor, 
                                                                                            address _beneficiary, 
                                                                                            uint _amountContributed, 
                                                                                            bool _refunded) {
        Campaign c = campaigns[_campaignID];
        
        return (c.contributors[_contributorID].addr,
                c.contributors[_contributorID].beneficiary,
                c.contributors[_contributorID].amountContributed,
                c.contributors[_contributorID].refunded);
    }
    
    function contributorID(uint _campaignID, address _contributor) public constant returns (uint) {
        Campaign c = campaigns[_campaignID];
        
        return c.toContributor[_contributor];
    }
    
    function isContributor(uint _campaignID, address _contributor) public constant returns (bool) {
        Campaign c = campaigns[_campaignID];
        
        if(c.contributors[c.toContributor[_contributor]].amountContributed != 0)
            return true;
    }
    
    function ownerOf(uint _campaignID) public constant returns (address){
        Campaign c = campaigns[_campaignID];
        
        return c.owner;
    }
    
    function beneficiaryOf(uint _campaignID) public constant returns (address){
        Campaign c = campaigns[_campaignID];
        
        return c.beneficiary;
    }
    
    function configOf(uint _campaignID) public constant returns (address){
        Campaign c = campaigns[_campaignID];
        
        return c.config;
    }
    
    function amountRaisedBy(uint _campaignID) public constant returns (uint){
        Campaign c = campaigns[_campaignID];
        
        return c.amountRaised;
    }
    
    function fundingGoalOf(uint _campaignID) public constant returns (uint){
        Campaign c = campaigns[_campaignID];
        
        return c.fundingGoal;
    }
    
    function expiryOf(uint _campaignID) public constant returns (uint){
        Campaign c = campaigns[_campaignID];
        
        return c.expiry;
    }
    
    function createdAt(uint _campaignID) public constant returns (uint){
        Campaign c = campaigns[_campaignID];
        
        return c.created;
    }
    
    function totalContributors(uint _campaignID) public constant returns (uint){
        Campaign c = campaigns[_campaignID];
        
        return c.numContributors;
    }
    
    function isOwner(uint _campaignID, address _owner) public constant returns (bool){
        Campaign c = campaigns[_campaignID];
        
        if(c.owner == _owner)
            return true;
    }
    
    function hasFailed(uint _campaignID) public constant returns (bool){
        Campaign c = campaigns[_campaignID];
        
        if (now > c.expiry
            && c.amountRaised < c.fundingGoal 
            && c.amountRaised > 0)
            return true;
    }
    
    function isSuccess(uint _campaignID) public constant returns (bool){
        Campaign c = campaigns[_campaignID];
        
        if (c.amountRaised >= c.fundingGoal)
            return true;
    }
    
    function isPaidOut(uint _campaignID) public constant returns (bool){
        Campaign c = campaigns[_campaignID];
        
        return c.paidOut;
    }
    
    function totalRefunded(uint _campaignID) public constant returns (uint){
        Campaign c = campaigns[_campaignID];
        uint refunded = 0;
        
        if(!hasFailed(_campaignID))
            return 0;
        
        for(uint contributorID = 0; contributorID < c.numContributors; contributorID++) {
            if(c.contributors[contributorID].refunded == true)
                refunded += c.contributors[contributorID].amountContributed;
        }
        
        return refunded;
    }
    
    function isRefunded(uint _campaignID) public constant returns (bool){
        Campaign c = campaigns[_campaignID];
        
        for(uint contributorID = 0; contributorID < c.numContributors; contributorID++) {
            if(c.contributors[contributorID].refunded != true)
                return false;
        }
        
        return true;
    }
}
