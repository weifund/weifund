//sol Coin
// Simple minable coin.
// @authors:
//   Gav Wood <g@ethdev.com>

import "named";
import "owned";
import "coin";

contract WeiFundConfig { 
    function onNewCampaign(uint cid, address addr){}
    function onContribute(uint cid, address addr, uint amount){} 
    function onRefund(uint cid, address addr, uint amount){} 
    function onPayout(uint cid, uint amount){}
}

contract Coin {
	function sendCoinFrom(address _from, uint _val, address _to) {}
	function sendCoin(uint _val, address _to) {}
	function coinBalance() constant returns (uint _r) {}
	function coinBalanceOf(address _a) constant returns (uint _r) {}
	function approve(address _a) {}
	function isApproved(address _proxy) constant returns (bool _r) {}
	function isApprovedFor(address _target, address _proxy) constant returns (bool _r) {}
}

contract WeiCoin is Coin, owned, WeiFundConfig {
    uint public initAmount = 0;
    uint public total = 0;
    uint public max = 0;
    uint public weiRatio = 0;
    uint public cid = 0;
    bool public campaignStarted;
    address public weifundAddress;
    address owner;
    
	function WeiCoin(address _weifundAddress, uint _initAmount, uint _weiRatio) {
		m_balances[owner] = _initAmount;
		initAmount = _initAmount;
		owner = msg.sender;
		total += initAmount;
		weiRatio = _weiRatio;
		weifundAddress = _weifundAddress;
		m_lastNumberMined = block.number;
	}
	
	function sendCoinFrom(address _from, uint _val, address _to) {
		if (m_balances[_from] >= _val && m_approved[_from][msg.sender]) {
			m_balances[_from] -= _val;
			m_balances[_to] += _val;
		}
	}
	
	function sendCoin(uint _val, address _to) {
		if (m_balances[msg.sender] >= _val) {
			m_balances[msg.sender] -= _val;
			m_balances[_to] += _val;
		}
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
	        
	    m_balances[_addr] += _amount / weiRatio;
	    total += m_balances[_addr];
	}
	
	function onRefund(uint _cid, address _addr, uint _amount) {
	    if(!campaignStarted
	    || _cid != cid
	    || msg.sender != weifundAddress
	    || _amount == 0
	    || _addr == address(0))
	        return;
	   
	    m_balances[_addr] -= _amount / weiRatio;
	    total -= m_balances[_addr];
	}
	
	function coinBalance() constant returns (uint _r) {
		return m_balances[msg.sender];
	}
	
	function coinBalanceOf(address _a) constant returns (uint _r) {
		return m_balances[_a];
	}
	
	function approve(address _a) {
		m_approved[msg.sender][_a] = true;
	}
	
	function isApproved(address _proxy) constant returns (bool _r) {
		return m_approved[msg.sender][_proxy];
	}
	
	function isApprovedFor(address _target, address _proxy) constant returns (bool _r) {
		return m_approved[_target][_proxy];
	}
	
	mapping (address => uint) m_balances;
	mapping (address => mapping (address => bool)) m_approved;
	uint m_lastNumberMined;
}
