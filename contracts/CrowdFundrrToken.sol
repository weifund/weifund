// An Owned, Ulimited, Buyable Token that is also generated when people donate
// To a specific campaign
// Buy, Generate, Use and lord a Token System that is 
// connected to a WeiFund Campaign
// @authors:
// Nick Dodson <thenickdodson@gmail.com>
// The cool idea here is that you could setup a token system for your project
// and when someone donates to your CrowdFunding campaign, they will get tokens
// under their address with could be used later.
// This contract is untested and is only meant to spec a token system in
// tandem with WeiFund.

// Give a name to the contract.
contract Named {
    function Named(bytes32 name){}
}

// Make a contract owner or lorded
contract Owned {
    function Owned() { owner = msg.sender; }
    modifier isOwner { if(msg.sender == owner) _ }
    address owner;
}

// Allows a contract to be priced.
contract Priced is Owned {
    function Priced(uint p) { price = p; } 
    function setPrice(uint p) isOwner { price = p; }
    modifier hasPrice() { if(msg.value >= price) _ }
    uint public price;
}

contract MyToken is Named("MyToken"), Owned, Priced(450000) 
{
    address public CrowdFundrrAddress; // Setup CrowdFundrr
    uint public CrowdFundrrCampaignId; // Setup Campaign ID
    uint numTokens;
    mapping(address => uint) public tokens; // Record Tokens to Addresses
    
    // Setup the token params.
    function MyToken(uint cid, address addr)
    {
        numTokens = 0;
        CrowdFundrrCampaignId = cid;
        CrowdFundrrAddress = addr;
    }
    
    // When someone contributes to a CrowdFundrr campaign, make 
    // tokens for them under their address
    function onContribute(uint cid, address addr, uint amount)
    {
        if(cid == CrowdFundrrCampaignId
        && msg.sender == CrowdFundrrAddress
        && amount > price){
            make(addr, msg.value/price);
        }
    }  // for CrowdFundrr
    
    // Allow users to buy tokens.
    function buy(address addr)
    {
        if(msg.value > price){
            if(addr == 0)
                addr = msg.sender;
            
            make(addr, msg.value/price);
        }
    }
    
    // Transfer tokens from one address to another
    function transfer(address fromAddr, address toAddr, uint amount)
    {
        if(tokens[fromAddr] >= amount
        && (fromAddr == msg.sender || msg.sender == owner))  {
            tokens[fromAddr] -= amount;
            tokens[toAddr] += amount;
        }
    }
    
    // Allow the token system owner to generate a specific amount 
    // of tokens for an address
    function generate(address addr, uint amount) isOwner
    {
        make(addr, amount);
    }
    
    // Make tokens
    function make(address addr, uint amount) private
    {
        numTokens += amount;
        tokens[addr] += amount;
    }
    
    // Use or burn up a specific amount of tokens for a specific address.
    function use(address addr, uint amount) isOwner
    {
        if(tokens[addr] > 0)
            tokens[addr] -= amount;
    }
}
