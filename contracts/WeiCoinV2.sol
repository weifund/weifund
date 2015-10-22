/*Most, basic default, standardised Token contract.
Allows the creation of a token with a finite issued amount to the creator.

Based on standardised APIs: https://github.com/ethereum/wiki/wiki/Standardized_Contract_APIs
.*/

contract Token {
    function transfer(uint _value, address _to) returns (bool _success) {}
    function transferFrom(address _from, uint _value, address _to) returns (bool _success) {}
    function balanceOf(address _addr) constant returns (uint _r) {}
    function approve(address _addr) returns (bool _success) {}
    function unapprove(address _addr) returns (bool _success) {}
    function isApprovedFor(address _target, address _proxy) constant returns (bool _r) {}   
    function approveOnce(address _addr, uint256 _maxValue) returns (bool _success) {}
    function isApprovedOnceFor(address _target, address _proxy) constant returns (uint _maxValue) {}
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event AddressApproval(address indexed addr, address indexed proxy, bool result);
    event AddressApprovalOnce(address indexed addr, address indexed proxy, uint256 value);
}

contract Standard_Token is Token {

    function Standard_Token(uint _initialAmount) {
        balances[msg.sender] = _initialAmount;
    }

    function transfer(uint _value, address _to) returns (bool _success) {
        if (balances[msg.sender] >= _value) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            Transfer(msg.sender, _to, _value);
            return true;
        } else { return false; }
    }

    function transferFrom(address _from, uint _value, address _to) returns (bool _success) {
        if (balances[_from] >= _value) {
            bool transfer = false;
            if(approved[_from][msg.sender]) {
                transfer = true;
            } else {
                if(_value <= approved_once[_from][msg.sender]) {
                    transfer = true;
                    approved_once[_from][msg.sender] = 0; //reset
                }
            }

            if(transfer == true) {
                balances[_from] -= _value;
                balances[_to] += _value;
                Transfer(_from, _to, _value);
                return true;
            } else { return false; }
        } else { return false; }
    }

    function balanceOf(address _addr) constant returns (uint _r) {
        return balances[_addr];
    }

    function approve(address _addr) returns (bool _success) {
        approved[msg.sender][_addr] = true;
        AddressApproval(msg.sender, _addr, true);
        return true;
    }
    
    function unapprove(address _addr) returns (bool _success) {
        approved[msg.sender][_addr] = false;
        approved_once[msg.sender][_addr] = 0;
        //debatable whether to include...
        AddressApproval(msg.sender, _addr, false);
        AddressApprovalOnce(msg.sender, _addr, 0);
    }
    
    function isApprovedFor(address _target, address _proxy) constant returns (bool _r) {
        return approved[_target][_proxy];
    }

    function approveOnce(address _addr, uint256 _maxValue) returns (bool _success) {
        approved_once[msg.sender][_addr] = _maxValue;
        AddressApprovalOnce(msg.sender, _addr, _maxValue);
        return true;
    }

    function isApprovedOnceFor(address _target, address _proxy) constant returns (uint _maxValue) {
        return approved_once[_target][_proxy];
    }


    //explicitly not publicly accessible. Should rely on methods for purpose of standardization.
    mapping (address => uint) balances;
    mapping (address => mapping (address => bool)) approved;
    mapping (address => mapping (address => uint256)) approved_once;
}

contract Standard_Token_Factory {

    mapping(address => address[]) public created;

    function createdByMe() returns (address[]) {
        return created[msg.sender];
    }

    function createStandardToken(uint256 _initialAmount) returns (address) {

        address newTokenAddr = address(new Standard_Token(_initialAmount));
        Standard_Token newToken = Standard_Token(newTokenAddr);
        newToken.transfer(_initialAmount, msg.sender); //the factory will own the created tokens. You must transfer them.
        uint count = created[msg.sender].length += 1;
        created[msg.sender][count-1] = newTokenAddr;
        created[msg.sender].length = count;
        return newTokenAddr;
    }
}

//sol Coin
// Simple minable coin.
// @authors:
//   Gav Wood <g@ethdev.com>

contract WeiFundConfig { 
    function onNewCampaign(uint cid, address addr){}
    function onContribute(uint cid, address addr, uint amount){} 
    function onRefund(uint cid, address addr, uint amount) returns (bool) {} 
    function onPayout(uint cid, uint amount){}
}

import "owned";

contract WeiCoin is owned {
    address public tokenAddress;
    address public weifundAddress;
    address public factoryAddress;
    uint public weiRatio;
    uint public cid;
    bool public campaignStarted;
    
    function WeiCoin(uint256 _initalAmount, uint _weiRatio, address _weifundAddress) {
        owner = msg.sender;
        weiRatio = _weiRatio;
        weifundAddress = _weifundAddress;
        tokenAddress = Standard_Token_Factory(factoryAddress)
                            .createStandardToken(_initalAmount);
    }
    
    function transfer(uint _value, address _to) returns (bool) {
        if(msg.sender == owner)
            Standard_Token(tokenAddress).transfer(_value, _to);
    }

	function onNewCampaign(uint _cid, address _addr, uint _goal) {
	    if(msg.sender != weifundAddress
	        || owner != _addr)
	        return;
	        
	    cid = _cid;
	    campaignStarted = true;
	}
	
	function onContribute(uint _cid, address _addr, uint _amount) {
	    if(!campaignStarted
	    || _cid != cid
	    || msg.sender != weifundAddress
	    || _amount == 0
	    || _addr == address(0))
	        return;
	        
	    Standard_Token(tokenAddress).transfer(_amount / weiRatio, _addr);
	}
	
	function onRefund(uint _cid, address _addr, uint _amount) returns (bool) {
	    if(!campaignStarted
	    || _cid != cid
	    || msg.sender != weifundAddress
	    || _amount == 0
	    || !Standard_Token(tokenAddress).isApprovedFor(_addr, this)
	    || _addr == address(0))
	        return;
	        
	    return Standard_Token(tokenAddress).transferFrom(_addr, _amount / weiRatio, this);
	}
}
