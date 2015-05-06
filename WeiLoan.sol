// WeiLoan System
// Start, lend, payout and return yield to funders
// @authors:
// Nick Dodson <thenickdodson@gmail.com>
// @forked by:
// M. Terzi <ma.terzi@tiscali.it>
// If goal is not reached and campaign is expired, contributers can get their donation refunded individually
// If goal is reached by alloted time, contributions can still be made
// After a grace period, the beneficiary returns funds to the funders in installments at a given interest rate
contract WeiLoan 
{
    
    // builds a variable (struct) called User which has two sub-variables, an integer number called numLoans and a mapping of 
    // loans.
    
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
     // grace_period and the tenor. 
     
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
    // condition prior to executing the function. In this case the condition/function hasValue is called only if 
    // msg.value > 0: that is, the number number of wei sent with the message is greater than zero
    
    modifier hasValue { if(msg.value > 0) _ }
    
    //creates a new function called newLoan. Once this is launched with the parameters specified between brackets
    // it runs the code between the block if
    
    function newLoan(bytes32 _name, bytes32 _website
    , address _beneficiary, uint _goal, uint _timelimit, uint _category, uint _interest_rate, uint _grace_period, uint _tenor)
    {
    
        // if the goal (one of the parameters of the function assigned by the person 
        // who runs the function is greater than zero [not sure this shoudl stay here though]
        // and the timelimit is greater than now (that is, the campaign has not expired] do....  
        
        if(_goal > 0 && _timelimit > now){
            
            // initialize a new variable called lid, which is a counter for the numLoans (defined earlier as a public integer variable)
            uint lid = numLoans++; // campaignID is return variable
            // creates a loan called l which will corrispond the [position lid in the mapping of all loans]
            Loan l = loans[lid];  // assigns reference
            // assign to the loan l the name defined by the argument of the function
            l.name = _name;
            // the owner of the loan is the digital signature [address] of the sender
            l.owner = msg.sender;
            // again assign to the loan l the name defined by the argument of the function 
            l.website = _website;
            // again assign to the loan l the beneficiary defined by the argument of the function
            l.beneficiary = _beneficiary;
            // again assign to the loan l the fundingGoal defined by the argument of the function
            l.fundingGoal = _goal;
            // again assign to the loan l the timelimit defined by the argument of the function
            l.timelimit = _timelimit;
            // again assign to the loan l the category defined by the argument of the function
            l.category = _category;
            // again assign to the loan l the interest rate defined by the argument of the function
            l.interest_rate = _interest_rate;
            // again assign to the loan l the grace period defined by the argument of the function
            l.grace_period = _grace_period;
            // again assign to the loan l the tenor defined by the argument of the function
            l.tenor = _tenor;
            
            // now creates a user called u, which is the sender of the transaction
            User u = users[msg.sender];
            // creates a variable called u_lid, which 
            uint u_lid = u.numLoans++;
            u.loans[u_lid] = lid;
            
            // calls the event onNewLoan
            onNewLoan(msg.sender, lid);
        }
    }
    
    // function to contribute to the funding of the new loan
    
    function contribute(uint _lid) hasValue
    {
        Loan l = loans[_lid]; // Cannot be expired.
        
        // if the raising is not yet terminated
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
  
  
    // payout function if the raised amount is larger than the funding goal
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
    
    function loanFunders(uint _lid, uint _f_id) returns (Funder f)
    {
        Loan l = loans[_lid];
        f = l.funders[_f_id];
    }
    
    //@terzim part
    
    //initial code is to make a couple of conversion from annual to monthly, as it is better to work with
    // monthly numbers        

    uint interest_rate_m = interest_rate / 12;
    uint tenor_m = tenor * 12;
    
    //calculates the monthly installment amount
    
    l.installment = l.amount * ((interest_rate_m*((1+interest_rate_m)^(tenor_m)))/(((1+interest_rate_m)^(tenor_m))-1))
    
    //calculates the percentage of funds put by each funder
    
    proportion of funder[fid] = sum contributed by funder[fid] / original loan amount 
    
    // now you need to define another function 
    // if time is above grace period starts the repayments of the loan
    // the loan will be assumed to be a constant installment loan so that each instalment payment is constant
    
    function payInstallment // define here parameters of the function
    {
        for (block.timestamp >= l.timelimit + l.grace_period && loan balance > 0; block.timestamp + 1 month) 
        {
        //pays out to each funder the proportion of its instalment
        
        send to funder[fid] = proportion of funder[fid] * l.installment
        
        //residual amount
        
        new loan balance = previous loan balance - (l.installment - l.interest_payment for that period)
        
        //start again in the next month until the loan balance is equal to zero
        }

        if(amount on the beneficiary account < l.installment)
        {

        declare default (??)
            
        }

    }
    
    
}
