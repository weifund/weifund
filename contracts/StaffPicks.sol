contract StaffPicks {
    struct Pick {
        uint cid;
        uint category;
        uint updated;
        uint created;
    }
    
    event onPick(uint indexed _cid, uint indexed _category);
    
    address public owner;
    uint numPicks;
    mapping(uint => Pick) public picks;
    
    function StaffPicks(){
        owner = msg.sender;
    }
    
    function addPick(uint _cid, uint _category) {
        if(msg.sender == owner) {
            Pick p = picks[numPicks++];
            p.created = now;
            p.updated = now;
            p.cid = _cid;
            p.category = _category;
            onPick(_cid, _category);
        }
    }
    
    function updatePick(uint _id, uint _cid, uint _category){
        if(msg.sender == owner) {
            Pick p = picks[_id];
            p.cid = _cid;
            p.category = _category;
            p.updated = now;
        }
    }
    
    function changeOwner(address _owner) {
        if(msg.sender == owner)
            owner = _owner;
    }
}