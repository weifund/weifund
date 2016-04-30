/**
Template Controller

@module Templates
*/

/**
The template to allow easy WeiFund contract deployment.

@class [template] components_weihash
@constructor
*/

var template;

Template['components_tokenFactory'].created = function() {
  TemplateVar.set('createFactoryState', {
    isUndeployed: true
  });
};

Template['components_tokenFactory'].rendered = function() {
  template = this;
};

Template['components_tokenFactory'].helpers({
  'estimateGas': function() {
    return 1906742;
  },
});

Template['components_tokenFactory'].events({
  /**
  Deploy the WeiHash contract.

  @event (click #weifundDeploy)
  **/

  'click #deployTokenFactory': function(event, template) {
    if (!confirm("Are you sure you want to deploy a WeiFund token factory contract?"))
      return;

    // set new WeiFund address and TX object
    var transactionObject = {
      data: WeiFundTokenFactory.bytecode,
      gas: web3.eth.defaultGas,
      from: web3.eth.defaultAccount
    };

    // create new CampaignAccountFactory contract
    WeiFundTokenFactory.new(transactionObject, function(err, result) {
      if (err)
        return TemplateVar.set(template, 'createFactoryState', {
          isError: true,
          error: err
        });

      // set state as mining
      TemplateVar.set(template, 'createFactoryState', {
        isMining: true,
        transactionHash: result.transactionHash
      });

      // set state as mined
      if (result.address) {
        TemplateVar.set(template, 'createFactoryState', {
          isMined: true,
          address: result.address,
          transactionHash: result.transactionHash
        });

        // get contracts object
        var contractsObject = LocalStore.get('contracts');
        contractsObject[LocalStore.get('network')] = {
          WeiFundTokenFactory: result.address,
        };

        // Update the CampaignAccountFactory address
        LocalStore.set('contracts', contractsObject);
      }
    });

    // Prevent Double Click
    $(event.currentTarget).prop('disabled', true);
  },

  /**
  Register a hash with WeiHash.

  @event (click #weihashRegister)
  **/

  'click #newAccount': function(event, template) {},

  /**
  Lookup a hash on the WeiHash registery.

  @event (click #weihashLookup)
  **/

  'click #lookupAccount': function(event, template) {},
});
