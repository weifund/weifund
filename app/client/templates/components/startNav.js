Template['components_startNav'].rendered = function(){	
	TemplateVar.set('data', this.data);
	
};

Template['components_startNav'].helpers({
	'data': function(){
		return TemplateVar.get('data');
	},
});
