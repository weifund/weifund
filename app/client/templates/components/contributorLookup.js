Template['components_contributorLookup'].rendered = function() {
  var template = this;
};

Template['components_contributorLookup'].helpers({
  'userContributions': function() {
    try {
      var campaignID = Helpers.cleanAscii($("#contributorCampaignID").val()),
        contributionIDorAddress = Helpers.cleanAscii($("#contributorID").val());

      if (web3.isAddress(contributionIDorAddress)) {
        return Contributions.find({
          campaignID: campaignID,
          contributor: contributionIDorAddress
        });
      } else {
        return Contributions.find({
          campaignID: campaignID,
          id: contributionIDorAddress
        });
      }
    } catch (err) {
      return TemplateVar.set('state', {
        isError: true,
        error: err
      });
    }
  },
});

Template['components_contributorLookup'].events({
  /**
  Deploy the price feed, used for setup of contract.

  @event (click #weifundDeploy)
  **/

  'click #contributorLookup': function(event, template) {
    var contributionCampaignID = Helpers.cleanAscii($("#contributorCampaignID").val()),
      contributionIDorAddress = Helpers.cleanAscii($("#contributorID").val());
    var lookupCallback = function(err, contribution) {
      if (err)
        return TemplateVar.set(template, 'state', {
          isError: true,
          error: err
        });

      if (!contribution.isValid)
        return TemplateVar.set(template, 'state', {
          isError: true,
          error: 'Contribution invalid'
        });

      Contributions.upsert({
        campaignID: contributionCampaignID,
        id: contribution.id
      }, contribution);
      TemplateVar.set(template, 'state', {
        isContributor: true
      });
    };

    if (web3.isAddress(contributionIDorAddress)) {
      objects.helpers.importContributor(contributionCampaignID, contributionIDorAddress, callback);
    } else {
      objects.helpers.importContribution(contributionCampaignID, contributionIDorAddress, lookupCallback);
    }
  }
});
