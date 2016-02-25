contract WeiFund {
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

contract WeiHashInterface {
    function register(uint _campaignID, bytes _hash){}
    function unregister(uint _campaignID){}
	function hashOf(uint _campaignID) constant returns (bytes) {}
	
	event HashRegistered(uint indexed _campaignID, address _owner);
	event HashDeregistered(uint indexed _campaignID, address _owner);
}

contract WeiHash is WeiHashInterface {
    mapping(uint => bytes) public hashes;
    address public weifundAddr;
	uint public version;
    
    function WeiHash(address _weifundAddr) {
        weifundAddr = _weifundAddr;
		version = 1;
    }
    
    function register(uint _campaignID, bytes _hash){
        if(!WeiFund(weifundAddr).isOwner(_campaignID, msg.sender))
			throw;
		
        hashes[_campaignID] = _hash;
		HashRegistered(_campaignID, msg.sender);
    }
    
    function unregister(uint _campaignID, bytes _hash){
        if(!WeiFund(weifundAddr).isOwner(_campaignID, msg.sender))
			throw;
			
        hashes[_campaignID] = _hash;
		HashDeregistered(_campaignID, msg.sender);
    }
	
	function hashOf(uint _campaignID) public constant returns (bytes){
		return hashes[_campaignID];
	}
}