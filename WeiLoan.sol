// WeiLoan System
// Start, lend, payout and return yield to funders
// @authors:
// Nick Dodson <thenickdodson@gmail.com>
// @forked by:
// Massimiliano Terzi <ma.terzi@tiscali.it>
// If goal is not reached and campaign is expired, contributers can get their donation refunded individually
// If goal is reached by alloted time, contributions can still be made
// After a grace period, the beneficiary returns funds to the funders in installments at a given interest rate
contract WeiLoan 
{
    
    // builds a variable (struct) called User which has two sub-variables, a uint called numLoans and a mapping of 
    // loans. This means that I created a User which has
    
    struct User
    {
        uint numLoans;
        mapping(uint => uint) loans;
    }
    
    // builds a variable (struct) called Funder which is identified by an address (his public "signature") and by an amount which he has lent.
    
    struct Funder 
    {
        address addr;
        uint amount;
    }
    
     // builds a variable (struct) called Loan. This is the most complex variable of the set and contains the
     // following subvariables: (a) a name; (b) a website; (c) . The most important here are the sub-variables:
     // timelimit [the time for which the Loan is open to funding], fundingGoal [the amount that the guy who gets the
     // loan wants to collect], and the key contractual features of the loan which are the interest_rate, the        
     // grace period and the tenor. 
     
     // importantly, this variable contains a map of the funders and a pointer to the funders. 
     
    struct Loan 
    {
        bytes32 name;
        bytes32 website;
        address owner;
        address beneficiary;
        uint timelimit;
        uint fundingGoal;
        uint amount;
        uint category;
        uint status;
        uint numFunders;
        uint interest_rate;
        uint grace_period;
        uint tenor;
        mapping (uint => Funder) funders;
        mapping (address => uint) toFunder;
    }
  
    uint public numLoans;
    mapping (uint => Loan) public loans;
    mapping (address => User) public users;
    
    //creates 4 events. Each of them contains the attribute indexed which will cause the respective arguments to be 
    // treated as log topics instead of data.
    
    event onNewLoan(address indexed _from, uint indexed _lid);
    event onContribute(address indexed _from, uint indexed _lid, uint _value);
    event onPayout(address indexed _from, uint indexed _lid, uint _value);
    event onRefund(address indexed _from, uint indexed _lid, uint _value);
    
    
    
    // Modifiers can be used to easily change the behaviour of functions, for example to automatically check a
    // condition prior to executing the function. In this case the condition hasValue is called only if 
    // msg.value (uint): number of wei sent with the message is greater than zero
    
    modifier hasValue { if(msg.value > 0) _ }
    
    function newLoan(bytes32 _name, bytes32 _website
    , address _beneficiary, uint _goal, uint _timelimit, uint _category, uint _interest_rate, uint _grace_period, uint _tenor)
    {
        if(_goal > 0 && _timelimit > now){
            uint lid = numLoans++; // campaignID is return variable
            Loan l = loans[lid];  // assigns reference
            l.name = _name;
            l.owner = msg.sender;
            l.website = _website;
            l.beneficiary = _beneficiary;
            l.fundingGoal = _goal;
            l.timelimit = _timelimit;
            l.category = _category;
            l.interest_rate = _interest_rate;
            l.grace_period = _grace_period, 
            l.tenor = _tenor;
            
            User u = users[msg.sender];
            uint u_lid = u.numLoans++;
            u.loans[u_lid] = lid;
            
            onNewLoan(msg.sender, lid);
        }
    }
    
    function contribute(uint _lid) hasValue
    {
        Loan l = loans[_lid]; // Cannot be expired.
        if(l.timelimit >= block.timestamp){
            uint fid = l.numFunders++;
            Funder f = l.funders[fid];
            f.addr = msg.sender;
            f.amount = msg.value;
            l.amount += f.amount;
            l.toFunder[msg.sender] = fid;
            onContribute(msg.sender, _lid, l.amount);
        }
    }
    
    function refund(uint _lid)
    {
        Loan l = loans[_lid];
        if (block.timestamp > l.timelimit 
        && l.amount < l.fundingGoal && l.amount > 0){
            Funder f = l.funders[l.toFunder[msg.sender]];
            if(f.amount > 0){
                f.addr.send(f.amount);
                l.amount -= f.amount;
                onRefund(msg.sender, _lid, f.amount);
                f.amount = 0;
            }
        }
    }
  
    function payout(uint _lid)
    {
        Loan l = loans[_lid];
        if (l.amount >= l.fundingGoal){
            l.beneficiary.send(l.amount);
            onPayout(msg.sender, _lid, l.amount);
            l.amount = 0;
            l.status = 1;
        }
    }
    
    function userLoans(address _addr, uint _u_lid) returns (uint lid)
    {
        User u = users[_addr];
        lid = u.loans[_u_lid];
    }
    
    function campaignFunders(uint _lid, uint _f_id) returns (Funder f)
    {
        Loan l = loans[_lid];
        f = l.funders[_f_id];
    }
    
    //masssi part
    
    //write a function that if time is above grace period starts the repayments of the loan
    //the loan will be assumed to be a constant instalment loan so that each instalment payment would be something like
    
    /first converts annual interest rate to monthly
    
    interest_rate_m = interest_rate / 12;
    
    //then converts annual tenor into monthly tenor
    
    tenor_m = tenor * 12;
    
    //calculates the instalment amount
    
    l.instalment = l.amount * ((interest_rate_m*((1+interest_rate_m)^(tenor_m)))/(((1+interest_rate_m)^(tenor_m))-1))
    
    //calculates the percentage of funds put by each funder
    
    proportion of funder[fid] = sum contributed by funder[fid] / original loan amount 
    
    //pays out to each funder the proportion of its instalment
    
    send to funder[fid] = proportion of funder[fid] * loan instalments
    
    //residual amount
    
    new loan balance = previous loan balance - (instalment - interest payment for that period)
    
}
