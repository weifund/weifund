Template['components_thumbnail'].rendered = function() {
  TemplateVar.set('data', this.data);

};

Template['components_thumbnail'].helpers({
  'data': function() {
    return TemplateVar.get('data');
  },
});
