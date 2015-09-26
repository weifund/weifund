/**
The StaffPicks contract ABI description.

@var (abi)
**/

StaffPicks.abi = [{"constant":false,"inputs":[{"name":"_cid","type":"uint256"},{"name":"_category","type":"uint256"}],"name":"addPick","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"picks","outputs":[{"name":"cid","type":"uint256"},{"name":"category","type":"uint256"},{"name":"updated","type":"uint256"},{"name":"created","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"changeOwner","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"numPicks","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_cid","type":"uint256"},{"name":"_category","type":"uint256"}],"name":"updatePick","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_id","type":"uint256"},{"indexed":true,"name":"_cid","type":"uint256"},{"indexed":true,"name":"_category","type":"uint256"}],"name":"onPick","type":"event"}];

/**
The StaffPicks contract byte code

@var (Code)
**/

StaffPicks.code = '60606040525b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b6103dc8061003f6000396000f360606040523615610074576000357c01000000000000000000000000000000000000000000000000000000009004806311826dfa146100765780631a04f0051461008f5780638da5cb5b146100cb578063a6f9dae114610102578063b130425114610115578063becc6e561461013657610074565b005b61008d6004803590602001803590602001506101c3565b005b6100a0600480359060200150610184565b6040518085815260200184815260200183815260200182815260200194505050505060405180910390f35b6100d6600450610155565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b610113600480359060200150610356565b005b61012060045061017b565b6040518082815260200191505060405180910390f35b6101536004803590602001803590602001803590602001506102b7565b005b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60016000505481565b60026000506020528060005260406000206000915090508060000160005054908060010160005054908060020160005054908060030160005054905084565b60006000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102b0576001600081815054809291906001019190505591506002600050600083815260200190815260200160002060005090504281600301600050819055504281600201600050819055508381600001600050819055508281600101600050819055508284837ff854c8ce67b049b75ddad898be0c693ab30378327d41b01a2824b140e4d96c9360405180905060405180910390a45b5b50505050565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561034f576002600050600085815260200190815260200160002060005090508281600001600050819055508181600101600050819055504281600201600050819055505b5b50505050565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156103d85780600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b5b5056';


/**
The StaffPicks contract factory object.

@var (Contract)
**/

StaffPicks.Contract = web3.eth.contract(StaffPicks.abi);