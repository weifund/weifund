/**
The WeiFund object.

Authors:
 - Nick Dodson <thenickdodson@gmail.com>

Solidity Interface:
contract WeiFund{function campaigns(uint256 )constant returns(bytes32 name,bytes32 website,bytes32 video,address owner,address beneficiary,address config,uint256 timelimit,uint256 fundingGoal,uint256 amount,uint256 category,uint256 status,uint256 numFunders){}function userCampaigns(address _addr,uint256 _u_cid)returns(uint256 cid){}function refund(uint256 _cid){}function numCampaigns()constant returns(uint256 ){}function contribute(uint256 _cid,address _addr){}function users(address )constant returns(uint256 numCampaigns){}function newCampaign(bytes32 _name,bytes32 _website,bytes32 _video,address _beneficiary,uint256 _goal,uint256 _timelimit,uint256 _category,address _config){}function payout(uint256 _cid){}}
**/


/**
Build return object from array and ABI.

@method (parseCampaign)
@param {cid} number     The name of the method in question
@param {Array} resultArray The result array values from the call
@return {Object} a parsed campaign object.
**/

/*WeiFund.parseRawCampaign = function(cid, result) {
    if(_.isUndefined(result))
        result = [];
    
    var return_object = {
        id: cid,
        name: web3.toAscii(result[0]),
        website: web3.toAscii(result[1]),
        video: web3.toAscii(result[2]),
        owner: result[3],
        beneficiary: result[4],
        config: result[5],
        timelimit: result[6].toNumber(10),
        fundingGoal: result[7].toNumber(10),
        amount: result[8].toNumber(10),
        category: result[9].toNumber(10),
        status: {type: 'open'}, //result[10].toNumber(10),
        statusNumber: result[10].toNumber(10),
        numFunders: result[11].toNumber(10),
        valid: true,
        progress: 0,
    };
    
    return_object.progress = Math.round((return_object.amount/return_object.fundingGoal) * 100);
    
    if(return_object.progress < 0 || return_object.progress == null)
        return_object.progress = 0;
    
    if(return_object.progress > 100)
        return_object.progress = 100;
    
    if(moment().unix() > return_object.timelimit 
       && return_object.amount < return_object.fundingGoal)
        return_object.status = {type: 'failed', reason: 'expired'};
    
    if(return_object.fundingGoal == 0) {
        return_object.status = {type: 'failed', reason: 'invalidGoal'};
        return_object.valid = false;
    }
    
    if(return_object.benificiary == '0x0000000000000000000000000000000000000000') {
        return_object.status = {type: 'failed', reason: 'invalidBenificiary'};
        return_object.valid = false;
    }
        
    if(_.isEmpty(return_object.name)) {
        return_object.status = {type: 'failed', reason: 'invalidName'};
        return_object.valid = false;
    }
        
    if(return_object.amount >= return_object.fundingGoal)
        return_object.status = {type: 'success'};
    
    if(return_object.statusNumber == 1) {
        return_object.amount = return_object.fundingGoal;
        return_object.progress = 100;
        return_object.status = {type: 'payedout'};    
    }
    
    return return_object;
};*/

