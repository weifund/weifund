/*
WeiFund v1.0

This contract creates a crowdfunding platform. Start, donate to, payout and 
refund crowdfunding campaigns on Ethereum.

If the campaign goal is reached or surpassed by stated expiry, all raised 
funds will be paid out to the campaign's beneficiary. If the campaign goal is 
not reached by the stated expiry, all funds are refundable back to oringial 
contributors. Campaigns may also select a configuration contract which can 
be used for customized outward extensibility of campaigns to contracts like 
token or registry systems.

Multiple contributions by the same account are allowed. Each contribution will
be treated as it's own contribution instance.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
*/

/// @title The core WeiFund configuration hook interface
/// @author Nick Dodson <thenickdodson@gmail.com>
/// @dev This contract enables campaigns to interact with other contracts, such as equity dispersal mechanisms (controllers) and registries
contract WeiFundConfig {
    /// @notice Called when a new campaign has been created
    /// @dev If a campaign specifies a configuration contract, this will be called when the new campaign is created 
    /// @param _campaignID (campaign id) the campaign id
    /// @param _owner (campaign owner) the campaign owner or creator
    /// @param _fundingGoal (funding goal) the campaign funding goal
    function newCampaign(uint _campaignID, address _owner, uint _fundingGoal) {}
    
    /// @notice Called when a new contribution has been made
    /// @dev This will be called when a new contribution has been made to a campaign, this can be used for token generation
    /// @param _campaignID (campaign id) the campaign id 
    /// @param _contributor (contributor) the account that initially made the campaign contribution
    /// @param _beneficiary (contribution beneficiary) the contribution beneficiary
    /// @param _amountContributed (amount contributed) the amount contributed by the contributor
    function contribute(uint _campaignID, address _contributor, address _beneficiary, uint _amountContributed) {}
    
    /// @notice Called when a new refund has been ordered
    /// @dev This will be called when a campaign has failed and a contributor is ordering a refund of their contributed ether
    /// @param _campaignID (campaign id) the campaign id 
    /// @param _contributor (contributor) the campaign contributor address
    /// @param _amountRefunded the amount refunded to the contributor
    function refund(uint _campaignID, address _contributor, uint _amountRefunded) {}
    
    /// @notice Called when a campaign is being paid out
    /// @dev This will be called when a campaign has succeceed and the funds are being paid out to the contributor
    /// @param _campaignID (campaign id) the campaign id 
    /// @param _amountPaid The amount paid out to the campaign beneficiary
    function payout(uint _campaignID, uint _amountPaid) {}
}

/// @title The core WeiFund crowdfunding interface
/// @author Nick Dodson <thenickdodson@gmail.com>
contract WeiFundInterface {
    event CampaignCreated(uint indexed _campaignID, address indexed _owner);
    event Contributed(uint indexed _campaignID, address indexed _contributor, uint _amountContributed);
    event Refunded(uint indexed _campaignID, address indexed _contributor, uint _amountRefunded);
    event PaidOut(uint indexed _campaignID, address indexed _beneficiary, uint _amountPaid);
}

/// @title WeiFund - A Decentralized Crowdfunding Platform
/// @author Nick Dodson <thenickdodson@gmail.com>
contract WeiFund is WeiFundInterface {
    // @notice Operator; A user is an account that has started campaigns on WeiFund
    // @dev This object stores all pertinant campaign operator data, such as how many campaigns the operator has started, and the campaign ID's of all the campaigns they have or are operating
    struct Operator {
        uint numCampaigns;
        mapping(uint => uint) campaigns;
    }
    
    // @notice Contribution; This object helps store the contribution data
    // @dev This object stores the contributor data, such as the contributor address, and amount
    struct Contribution {
        address contributor;
        address beneficiary;
        uint amountContributed;
        bool refunded;
        uint created;
    }
    
    // @notice Campaign; The crowdfunding campaign object
    // @dev This object stores all the pertinant campaign data, such as: the name, beneificary, fundingGoal, and the funder data
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
        uint numContributions;
        mapping (uint => Contribution) contributions;
        mapping (address => uint[]) toContribution;
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
    
    /// @notice Operators (the user address); Get the number of campaigns a user has started
    /// @dev This will return a user object that contains the number of campaigns a user has started. Use the userCampaigns method to the ID's to the crowdfunding campaigns that they have started.
    mapping (address => Operator) public operators;
    
    function newCampaign(string _name, address _beneficiary, uint _fundingGoal, uint _expiry, address _config) public returns (uint campaignID) {
        if(_fundingGoal <= 0 || _expiry <= now)
            throw;
            
        campaignID = numCampaigns++;
        Campaign c = campaigns[campaignID];
        c.name = _name;
        c.owner = msg.sender;
        c.beneficiary = _beneficiary;
        c.fundingGoal = _fundingGoal;
        c.expiry = _expiry;
        c.created = now;
        c.config = _config;
        
        Operator u = operators[msg.sender];
        uint u_campaignID = u.numCampaigns++;
        u.campaigns[u_campaignID] = campaignID;
        
        CampaignCreated(campaignID, msg.sender);
        
        if(c.config != address(0))
            WeiFundConfig(c.config).newCampaign(campaignID, msg.sender, _fundingGoal);
    }
    
    function contribute(uint _campaignID, address _beneficiary) public returns (uint contributionID) {
        Campaign c = campaigns[_campaignID];
        
        if(now > c.expiry || msg.value == 0)
            throw;
            
        contributionID = c.numContributions++;
        Contribution donation = c.contributions[contributionID];
        donation.amountContributed += msg.value;
        donation.beneficiary = _beneficiary;
        donation.contributor = msg.sender;
        donation.created = now;
        c.amountRaised += donation.amountContributed;
        c.toContribution[msg.sender].push(contributionID);
        Contributed(_campaignID, msg.sender, c.amountRaised);
        
        if(c.config != address(0))
            WeiFundConfig(c.config).contribute(_campaignID, msg.sender, _beneficiary, msg.value);
    }
    
    function refund(uint _campaignID, uint contributionID) public {
        Campaign c = campaigns[_campaignID];
        
        if (!hasFailed(_campaignID))
            throw;
            
        Contribution donation = c.contributions[c.toContribution[msg.sender][contributionID]];
        
        if(donation.amountContributed <= 0 || donation.refunded)
            throw;
			
		address receiver = donation.contributor;
		
		if(donation.beneficiary != address(0))
			receiver = donation.beneficiary;
        
        receiver.send(donation.amountContributed);
        donation.refunded = true;
        Refunded(_campaignID, receiver, donation.amountContributed);
    
        if(c.config != address(0))
            WeiFundConfig(c.config).refund(_campaignID, donation.contributor, donation.amountContributed);
    }
  
    function payout(uint _campaignID) public {
        Campaign c = campaigns[_campaignID];
        
        if(!isSuccess(_campaignID) || c.paidOut)
            throw;
        
        c.beneficiary.call.value(c.amountRaised)();
        c.paidOut = true;
        PaidOut(_campaignID, msg.sender, c.amountRaised);
        
        if(c.config != address(0))
            WeiFundConfig(c.config).payout(_campaignID, c.amountRaised);
    }
    
    function operatorCampaignID(address _operator, uint _campaignIndex) public constant returns (uint) {
        Operator u = operators[_operator];
        
        return u.campaigns[_campaignIndex];
    }
    
    function totalCampaignsBy(address _operator) constant returns (uint) {
        Operator u = operators[_operator];
        
        return u.numCampaigns;
    }
    
    function totalCampaigns() constant returns (uint) {
        return numCampaigns;
    }
    
    function contributionAt(uint _campaignID, uint _contributionID) public constant returns (address contributor, 
                                                                                            address beneficiary, 
                                                                                            uint amountContributed, 
                                                                                            bool refunded,
                                                                                            uint created) {
        Campaign c = campaigns[_campaignID];
        
        return (c.contributions[_contributionID].contributor,
                c.contributions[_contributionID].beneficiary,
                c.contributions[_contributionID].amountContributed,
                c.contributions[_contributionID].refunded
                c.contributions[_contributionID].created);
    }
    
    function contributionID(uint _campaignID, address _contributor, uint _contributionIndex) public constant returns (uint) {
        Campaign c = campaigns[_campaignID];
        
        return c.toContribution[_contributor][_contributionIndex];
    }
    
    function totalContributionsBy(uint _campaignID, address _contributor) public constant returns (uint) {
        Campaign c = campaigns[_campaignID];
        
        return c.toContribution[_contributor].length;
    }
    
    function isContributor(uint _campaignID, address _contributor) public constant returns (bool) {
        Campaign c = campaigns[_campaignID];
        
        if(c.contributions[c.toContribution[_contributor][0]].amountContributed != 0)
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
    
    function totalContributions(uint _campaignID) public constant returns (uint){
        Campaign c = campaigns[_campaignID];
        
        return c.numContributions;
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
    
	// new method not imp. yet
    function isActive(uint _campaignID) public constant returns (bool){
        if(!isSuccess(_campaignID)
			&& !isPaidOut(_campaignID)
			&& !hasFailed(_campaignID))
			return true;
    }
    
    function totalRefunded(uint _campaignID) public constant returns (uint){
        Campaign c = campaigns[_campaignID];
        uint refunded = 0;
        
        if(!hasFailed(_campaignID))
            return 0;
        
        for(uint contributionID = 0; contributionID < c.numContributions; contributionID++) {
            if(c.contributions[contributionID].refunded == true)
                refunded += c.contributions[contributionID].amountContributed;
        }
        
        return refunded;
    }
    
    function isRefunded(uint _campaignID) public constant returns (bool){
        Campaign c = campaigns[_campaignID];
		
		if(c.numContributions == 0)
			return false;
        
        for(uint contributionID = 0; contributionID < c.numContributions; contributionID++) {
            if(c.contributions[contributionID].refunded != true)
                return false;
        }
        
        return true;
    }
}