contract Proxy {
	event Forwarded(address _destination, uint _value);
	event TransferOwnership(address _new_implementer);
	
	address public implementer;
	
	function transfer_ownership(address _new_implementer) public {
		if (msg.sender == address(this) || msg.sender == implementer) {
			implementer = _new_implementer;
			TransferOwnership(_new_implementer);
		}
	}
	
	function forward(address _destination, uint _value, bytes _transactionBytecode) public {
		if (msg.sender == implementer) {
			_destination.call.value(_value)(_transactionBytecode);
			Forwarded(_destination, _value);
		}
	}
}

contract CategoryAuction is Proxy {
    struct Auction {
        uint startTime;
        uint endTime;
        uint highestBid;
        uint campaignID;
    }
    
    modifier validBid(uint _categoryID, uint _campaignID) {
        if(msg.value <= 0)
            throw;
        else
            _
    }
    
    uint public auctionInterval = 7 days;
    address public weifund;
    mapping (uint => uint) public numAuctions; // categoryID => numAuctions
    mapping (uint => mapping(uint => Auction)) public auctions; // categoryID => auction id => Auction
    
    function CategoryAuctionSystem(address _weifund) {
        weifund = _weifund;
        implementer = msg.sender; // owned by weifund
    }
    
    function bid(uint _categoryID, uint _campaignID) validBid(_categoryID, _campaignID) returns (uint auctionID) {
        auctionID = numAuctions[_categoryID];
        
        if(now >= auctions[_categoryID][auctionID].endTime) { // start new auction
            auctionID = numAuctions[_categoryID]++;
        }
        
        Auction a = auctions[_categoryID][auctionID];
        
        if(msg.value > a.highestBid)
            a.campaignID = _campaignID;
    }
}