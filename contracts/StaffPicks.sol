contract Owned {
    address public owner;
    
    modifier isOwner {
        if(msg.sender == owner)
            _
    }
    
    function changeOwner(address _owner) {
        if(msg.sender == owner)
            owner = _owner;
    }
}

contract StaffPicks is Owned {
    struct Pick {
        uint campaignID;
        uint updated;
        uint created;
    }
    
    event onPick(uint indexed _pickID, uint indexed _campaignID);
    
    uint public numPicks;
    mapping(uint => Pick) public picks;
    
    function StaffPicks(){
        owner = msg.sender;
    }
    
    function addPick(uint _campaignID) isOwner returns (uint pickID) {
        pickID = numPicks++;
        Pick p = picks[pickID];
        p.created = now;
        p.updated = now;
        p.campaignID = _campaignID;
        onPick(pickID, _campaignID);
    }
    
    function updatePick(uint _pickID, uint _campaignID) isOwner {
        Pick p = picks[_pickID];
        
        if(p.created == 0)
            throw;
        
        p.campaignID = _campaignID;
        p.updated = now;
    }
    
    function deletePick(uint _pickID) isOwner {
        Pick p = picks[_pickID];
        
        if(p.created == 0)
            throw;
            
        delete picks[_pickID];
    }
    
    function getPick(uint _pickID) constant returns (uint, uint, uint) {
        return (picks[_pickID].campaignID,  picks[_pickID].updated, picks[_pickID].created);
    }
    
    function totalPicks() constant returns (uint) {
        return numPicks;
    }
}
