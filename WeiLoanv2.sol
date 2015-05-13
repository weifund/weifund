// WeiLoan System
// Start, lend, payout and return yield to funders
// @authors:
// Nick Dodson <thenickdodson@gmail.com>
// @forked by:
// M. Terzi <ma.terzi@tiscali.it>
// If goal is not reached and campaign is expired, contributers can get their donation refunded individually
// If goal is reached by alloted time, contributions can still be made
// After a grace period, the beneficiary returns funds to the funders in installments at a given interest rate

contract WeiLoan {
// builds a variable (struct) called User which has two sub-variables, an integer number called numLoans and a mapping of 
    // loans.
    
    struct User
    {
        uint numLoans;
        mapping(uint => uint) loans;
    }
    
    // builds a variable (struct) called Funder which is identified by an address (his public "signature"), an amount which he has lent and the quota that he has lent
    // once the checked goal is reached
    
    struct Funder 
    {
        address addr;
        uint amount;
        uint quota;
    }
    
     // builds a variable (struct) called Loan. This is the most complex variable of the set and contains the
     // following subvariables: (angel) a name; (beer) a website; (coffee) . The most important here are the sub-variables:
     // timelimit [the time for which the Loan is open to funding], fundingGoal [the amount that the guy who gets the
     // loan wants to collect], and the key contractual features of the loan which are the interest_rate, the        
     // grace_period and the tenor. 
     
     // importantly, this variable contains a map of the funders and a pointer to the funders. 
     
    struct Loan 
    {
        address beneficiary;
        uint timelimit;
        uint fundingGoal;
        uint amount;
        uint balance;
        uint category;
        uint status;
        uint numFunders;
        uint interest_rate;
        // monthly numbers        
        uint interest_rate_m;
        uint grace_period;
        // monthly numbers  
        uint grace_period_m;
        uint tenor;
        // monthly numbers   
        uint tenor_m;
        uint installment;
        mapping (uint => Funder) funders;
        mapping (address => uint) toFunder;
    }
  
    uint public numLoans;
    mapping (uint => Loan) public loans;
    mapping (address => User) public users;
    
 event onNewLoan(address indexed from, uint indexed lid);
    event onContribute(address indexed from, uint indexed lid, uint _value);
    event onPayout(address indexed from, uint indexed lid, uint _value);
    event onRefund(address indexed from, uint indexed lid, uint _value);
 
 function newLoan( address beneficiary, uint goal, uint timelimit, uint category, uint interest_rate, uint grace_period, uint _tenor)
    {
    
        // if the goal (one of the parameters of the function assigned by the person 
        // who runs the function is greater than zero [not sure this shoudl stay here though]
        // and the timelimit is greater than now (that is, the campaign has not expired] do....  
        
        if(_goal > 0 ){
            
            // initialize a new variable called lid, which is a counter for the numLoans (defined earlier as a public integer variable)
            uint lid = numLoans++; // campaignID is return variable
            // creates a loan called l which will corrispond the [position lid in the mapping of all loans]
            Loan l = loans[lid];  // assigns reference
            // again assign to the loan l the beneficiary defined by the argument of the function
            l.beneficiary = _beneficiary;
            // again assign to the loan l the fundingGoal defined by the argument of the function
            l.fundingGoal = _goal;
            // again assign to the loan l the timelimit defined by the argument of the function
            l.timelimit = block.number + _timelimit;
            // again assign to the loan l the category defined by the argument of the function
            l.category = _category;
            // again assign to the loan l the interest rate defined by the argument of the function
            l.interest_rate_m = _interest_rate / 12;
            // again assign to the loan l the grace period defined by the argument of the function
            l.grace_period = _grace_period;
            // again assign to the loan l the tenor defined by the argument of the function (note, tenor meant to be after grace period)
            l.tenor_m = _tenor * 12;
            // now creates a user called u, which is the sender of the transaction
            User u = users[msg.sender];
            // creates a variable called u_lid, which adds a one to the number of loans the user has made.
            uint u_lid = u.numLoans++;
            u.loans[u_lid] = lid;
            
            // calls the event onNewLoan
            onNewLoan(msg.sender, lid);
        }
    }
 
 function contribute(uint _lid)
    {
        Loan l = loans[_lid]; // Cannot be expired.
        
        // if the raising is not yet terminated
        if(l.timelimit >= block.number) {
            uint fid = l.numFunders++;
            Funder f = l.funders[fid];
            f.addr = msg.sender;
            f.amount = msg.value;
            l.balance += f.amount;
            l.toFunder[msg.sender] = fid;
            onContribute(msg.sender, _lid, l.balance);
        }
    }
 function refund(uint _lid)
    {
        Loan l = loans[_lid];
        if (block.timestamp > l.timelimit 
        && l.balance < l.fundingGoal && l.balance > 0){
            Funder f = l.funders[l.toFunder[msg.sender]];
            if(f.amount > 0){
                f.addr.send(f.amount);
                l.balance -= f.amount;
                onRefund(msg.sender, _lid, f.amount);
                f.amount = 0;
            }
        }
    }
 function payout(uint _lid)
    {
        Loan l = loans[_lid];
        if (l.balance >= l.fundingGoal){
            l.amount = l.balance;
            l.beneficiary.send(l.balance);
            onPayout(msg.sender, _lid, l.balance);
            
            l.status = 1;
   l.timelimit = l.timelimit + l.grace_period;
            //calculates the monthly installment amount
            l.installment = l.amount * ((l.interest_rate_m*((1+l.interest_rate_m)^(l.tenor_m)))/(((1+l.interest_rate_m)^(l.tenor_m))-1));
        }
    }

 function payInstallment(uint lid){
  
  Loan l = loans[lid];
  
      if (msg.value != l.installment) 
      {
       msg.sender.send(msg.value);
       return;
      }

    if (block.number < l.timelimit) return;
  
  uint i = 0;
  
  uint n = l.numFunders;
  
  while(i<n){
   uint entitlement = l.installment*l.funders[i].amount/l.amount;
   l.funders[i].addr.send(entitlement);
  }
  
  l.balance -= (l.installment -(l.balance*l.interest_rate_m));

 }
}