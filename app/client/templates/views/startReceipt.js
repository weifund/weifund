Template['views_startReceipt'].helpers({
	/**
    Get the campaigns

    @method (campaigns)
    **/

	'load': function () {
		LocalStore.set('startCampaignStage', 4);
	},

	'campaignReceipt': function () {
		console.log(Receipts.findOne({campaignID: 'latest'}));
		
		return Receipts.findOne({campaignID: 'latest'});
	},
	
	'TransactionHashes': function() {
		var txHashes = LocalStore.get('startCampaignReceipt').transactionHashes;
		var returnObject = [];
		
		_.each(Object.keys(txHashes), function(item, index){
			returnObject.push({name: item, transactionHash: txHashes[item]});
		});
		
		return returnObject;
	},
	
	'IPFSHashes': function() {
		var hashes = LocalStore.get('startCampaignReceipt').ipfsHashes;
		var returnObject = [];
		
		_.each(Object.keys(hashes), function(item, index){
			returnObject.push({name: item, ipfsHash: hashes[item]});
		});
		
		return returnObject;
	},
});
