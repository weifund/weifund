Template['views_startReceipt'].helpers({
  /**
    Get the campaigns

    @method (campaigns)
    **/

  'load': function() {
    LocalStore.set('startCampaignStage', 4);
  },

  'data': function() {
    return Receipts.findOne({
      campaignID: 'latest'
    }) || {};
  },

  'campaignReceipt': function() {
    console.log(Receipts.findOne({
      campaignID: 'latest'
    }));

    return Receipts.findOne({
      campaignID: 'latest'
    });
  },

  'TransactionHashes': function() {
    var txHashes = Receipts.findOne({
      campaignID: 'latest'
    }).transactionHashes;
    var returnObject = [];

    _.each(Object.keys(txHashes), function(item, index) {
      returnObject.push({
        name: item,
        transactionHash: txHashes[item]
      });
    });

    return returnObject;
  },

  'IPFSHashes': function() {
    var hashes = Receipts.findOne({
      campaignID: 'latest'
    }).ipfsHashes;
    var returnObject = [];

    _.each(Object.keys(hashes), function(item, index) {
      returnObject.push({
        name: item,
        ipfsHash: hashes[item]
      });
    });

    return returnObject;
  },
});

Template['views_startReceipt'].events({
  'click #downloadReceipt': function() {
    var receipt = Receipts.findOne({
      campaignID: 'latest'
    });
    var d = new Date();
    var n = d.toISOString();
    var blob = new Blob([JSON.stringify(receipt, null, 2)], {
      type: 'application/json'
    });


    window.saveAs(blob, 'weifund-campaign-receipt-' + n + '.json');
  },

  'click #printReceipt': function() {
    window.print();
  },
});
