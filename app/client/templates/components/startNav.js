Template['components_startNav'].rendered = function() {
  TemplateVar.set('data', this.data);

};

Template['components_startNav'].helpers({
  'data': function() {
    return TemplateVar.get('data');
  },
});

Template['components_startNav'].events({
  'click #startReset': function() {
    if (!confirm('Are you sure you want to reset your new campaign data (this will remove all locally stored data from memory)?'))
      return;

    Receipts.remove({
      campaignID: 'latest'
    });
    Router.go('/start');
  },
});
