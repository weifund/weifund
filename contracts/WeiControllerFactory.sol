
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

/// @title An Ethereum standard token interface
contract Token {
    /// @return total amount of tokens
    function totalSupply() constant returns (uint256 supply) {}

    /// @param _owner The address from which the balance will be retrieved
    /// @return The balance
    function balanceOf(address _owner) constant returns (uint256 balance) {}

    /// @notice send `_value` token to `_to` from `msg.sender`
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _value) returns (bool success) {}

    /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {}

    /// @notice `msg.sender` approves `_addr` to spend `_value` tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of wei to be approved for transfer
    /// @return Whether the approval was successful or not
    function approve(address _spender, uint256 _value) returns (bool success) {}

    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {}

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

/// @title A dispersal mechanism for WeiFund campaigns to disperse tokens
/// @author Nick Dodson <thenickdodson@gmail.com>
contract WeiController is WeiFundConfig {
    uint campaignID;
    address weifund;
    address owner;
    address token;
    uint fundingGoal;
    bool started;
    uint weiRatio;
    
    modifier isValid(uint _campaignID)
    {
        if(msg.sender != weifund || campaignID != _campaignID)
            throw;
        _
    }
    
    function WeiController (address _weifund, address _token, address _owner, uint _weiRatio) {
        weifund = _weifund;
        owner = _owner;
        token = _token;
        weiRatio = weiRatio;
    }
    
    function newCampaign(uint _campaignID, address _owner, uint _fundingGoal) isValid(_campaignID) {
        if(started)
            throw;
            
        campaignID = _campaignID;
        fundingGoal = _fundingGoal;
        started = true;
    }
    
    function contribute(uint _campaignID, address _contributor, address _beneficiary, uint _amountContributed) isValid(_campaignID) {
        uint tokenAmount = _amountContributed / weiRatio;
        
        Token(token).transfer(_contributor, tokenAmount);
    }
    
    function refund(uint _campaignID, address _contributor, uint _amountRefunded) isValid(_campaignID) {}
    function payout(uint _campaignID, uint _amountPaid) isValid(_campaignID)  {}
}

/// @title A simple service factory
/// @author Nick Dodson <thenickdodson@gmail.com>
contract ServiceFactory {
    mapping(address => address) public services;
    
    function addService(address _service) {
        services[_service] = msg.sender;
    }
    
    function ownerOf(address _service) constant returns (address) {
        return services[_service];
    }
    
    function isService(address _service) constant returns (bool) {
        if (services[_service] != address(0))
            return true;
    }
}

/// @title This factory allows campaign operators to create safe weifund ready WeiControllers securly
/// @author Nick Dodson <thenickdodson@gmail.com>
contract WeiControllerFactory is ServiceFactory {
    address weifund;
    
    function WeiControllerFactory (address _weifund) {
        weifund = _weifund;
    }
    
    function newWeiController(address _token, address _owner, uint _weiRatio) returns (address newController) {
        newController = new WeiController(weifund, _token, _owner, _weiRatio);
        addService(newController);
    }
}