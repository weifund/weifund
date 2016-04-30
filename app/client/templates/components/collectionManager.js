Template['components_collectionManager'].rendered = function() {};

Template['components_collectionManager'].helpers({});

Template['components_collectionManager'].events({
  /**
  Deploy the price feed, used for setup of contract.

  @event (click #clearCampaigns)
  **/

  'click #clearCampaigns': function(event, template) {
    if (confirm("Are you sure you want to delete all locally stored campaign data?"))
      Campaigns.remove({});
  },

  /**
  Clear all provider data.

  @event (click #clearProviders)
  **/

  'click #clearProviders': function(event, template) {
    if (!confirm("Are you sure you want to clear all provider data (this may cause problems with your app)?"))
      return;

    LocalStore.set('rpcProvider', '');
    LocalStore.set('ipfsProvider', '');
  },

  /**
  Deploy the price feed, used for setup of contract.

  @event (click #clearReceipts)
  **/

  'click #clearReceipts': function(event, template) {
    if (confirm("Are you sure you want to delete all locally stored receipt data?"))
      Receipts.remove({});
  },

  /**
  Deploy the price feed, used for setup of contract.

  @event (click #clearContributors)
  **/

  'click #clearContributors': function(event, template) {
    if (confirm("Are you sure you want to delete all locally stored contributor data?"))
      Contributions.remove({});
  },

  /**
  Deploy the price feed, used for setup of contract.

  @event (click #clearContributors)
  **/

  'click #clearCategories': function(event, template) {
    if (confirm("Are you sure you want to delete all locally stored category data?"))
      Categories.remove({});
  },

  /**
  Deploy the price feed, used for setup of contract.

  @event (click #clearPersonas)
  **/

  'click #clearPersonas': function(event, template) {
    if (confirm("Are you sure you want to delete all locally stored Persona data?"))
      Personas.remove({});
  }
});
