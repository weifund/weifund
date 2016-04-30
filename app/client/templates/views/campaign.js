/**
Template Controllers

@module Templates
**/

// Temporary template var
var template;

/**
When the campaign tracker template is initially rendered

@class [template] views_campaign
@method (created)
**/

Template['views_campaign'].rendered = function() {
  Meta.setSuffix(TAPi18n.__("dapp.views.tracker.title"));
  template = this;

  // Set campaign state to default
  TemplateVar.set(template, 'state', {
    isOpen: true
  });
  TemplateVar.set(template, 'showDetails', false);
  TemplateVar.set(template, 'isContributor', false);
  TemplateVar.set(template, 'token', {
    total: 0,
    campaignStarted: false
  });
  TemplateVar.set(template, 'campaignsStarted', 0);
  TemplateVar.set(template, 'refundGas', 200000);
};


/**
These are the campaign tracker event handlers, that handle payotus, refund and contributions to WeiFund crowdfunding campaigns.

@class [template] views_campaign
@var (events)
**/

Template['views_campaign'].events({
  /**
    On Payout Click

    @event (click #details)
    **/

  'click .btn-details': function(event, template) {
    if (TemplateVar.get(template, 'showDetails'))
      TemplateVar.set(template, 'showDetails', false);
    else
      TemplateVar.set(template, 'showDetails', true);
  },

  /**
  	Contribute To Campaign

    @event (click #contributeToCampaign)
    **/

  'click #contributeToCampaign': function(event, tempalte) {
    TemplateVar.set(template, 'contributeToCampaign', true);
  },
});


/**
These are helper functions for the campaign tracker

@class [template] views_campaign
@var (helpers)
**/

Template['views_campaign'].helpers({
  /**
    On the page loading.

    @method (load)
    **/

  'load': function() {
    var campaignID = _id,
      loadCampaign = function(err, campaign) {
        if (err) {
          console.log('Contributor Error: ', err);
          return;
        }

        // Load Total Campaigns By Owner
        objects.contracts.WeiFund.totalCampaignsBy(campaign.owner, function(err, totalCampaignsByOwner) {
          if (!err)
            TemplateVar.set(template, 'campaignsStarted', totalCampaignsByOwner.toString(10));
        });

        // If the campaign is not valid dont load it
        if (!campaign.isValid)
          return;

        // Setup new campaign
        TemplateVar.set(template, 'campaign', campaign);

        // Number of contributors
        var numContributions = new BigNumber(campaign.numContributions);

        // Import Latest Contributors
        for (var contributionID = numContributions.toNumber(10) - 1; contributionID > numContributions.toNumber(10) - 4; contributionID--) {
          objects.helpers.importContribution(campaignID, contributionID, function(err, contribution) {
            if (err) {
              console.log('Contributor Error: ', err);
              return;
            }
          });
        }
      },
      eventLoad = function(err, result) {
        if (err)
          return;

        // import campaign
        objects.helpers.importCampaign(campaignID, loadCampaign);
      };

    // check if main account is contributor
    objects.contracts.WeiFund.isContributor(campaignID, web3.eth.defaultAccount, function(err, isContributor) {
      if (err || !isContributor)
        return;

      TemplateVar.set(template, 'isContributor', {
        isContributor: true
      });

      objects.contracts.WeiFund.totalContributionsBy(campaignID, web3.eth.defaultAccount, function(err, totalContributions) {
        if (err || totalContributions.equals(0))
          return;

        TemplateVar.set(template, 'refundGas', (200000 * totalContributions.toNumber(10)));
        TemplateVar.set(template, 'isContributor', {
          isContributor: true,
          totalContributions: totalContributions.toString()
        });

        objects.helpers.importContributor(campaignID, web3.eth.defaultAccount, function(err, contribution) {
          if (err) {
            console.log('Contribution Error: ', err);
            return;
          }
        });
      });
    });

    // on ctonributed
    objects.contracts.WeiFund.Contributed({
      _campaignID: campaignID
    }, eventLoad);

    // on campaign paid out
    objects.contracts.WeiFund.PaidOut({
      _campaignID: campaignID
    }, eventLoad);

    // on campaign refunded
    objects.contracts.WeiFund.Refunded({
      _campaignID: campaignID
    }, eventLoad);

    // get account balance
    web3.eth.getBalance(web3.eth.defaultAccount, function(err, result) {
      if (!err)
        TemplateVar.set(template, 'accountBalance', result.toString(10));
    });

    console.log('dsfsd');

    // import camapign data
    objects.helpers.importCampaign(campaignID, loadCampaign);
  },

  /**
    The selected campaign.

    @method (userContributions)
    **/

  'totalContributions': function() {
    var campaignID = _id;
    var userContributions = Contributions.find({
      campaignID: String(campaignID),
      contributor: web3.eth.defaultAccount
    }).fetch();

    if (_.isUndefined(userContributions))
      return 0;

    return userContributions.length;
  },

  /**
    The selected campaign.

    @method (userContributions)
    **/

  'userContributions': function() {
    var campaignID = _id;

    return Contributions.find({
      campaignID: String(campaignID),
      contributor: web3.eth.defaultAccount
    });
  },

  /**
    The selected campaign.

    @method (latestContributors)
    **/

  'latestContributors': function() {
    var campaignID = _id;

    return Contributions.find({
      campaignID: String(campaignID)
    }, {
      limit: 2,
      sort: {
        created: -1
      }
    }).fetch();
  },

  /**
    The selected campaign.

    @method (configContract)
    **/

  'configContract': function() {},

  /**
    The selected accounts balance.

    @method (accountBalance)
    **/

  'totalBacked': function() {
    var campaign = TemplateVar.get('campaign');

    if (_.isUndefined(campaign))
      return '0';

    var campaigns = Campaigns.find({
      owner: campaign.owner
    }).fetch();
    var totalBackers = 0;

    if (_.isUndefined(campaigns))
      return '0';

    _.each(campaigns, function(campaign, index) {
      if (campaign.paidOut)
        totalBackers += 1;
    });

    return totalBackers;
  },

  /**
    The selected campaign.

    @method (load)
    **/

  'campaign': function() {
    return Campaigns.findOne({
      id: String(_id)
    });
  },

  /**
    Get the most recent campaigns

    @method (recent)
    **/

  'recent': function() {
    return Campaigns.find({}, {
      limit: 2
    });
  },
});
