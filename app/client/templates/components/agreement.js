Template['components_agreement'].rendered = function(){
	var template = this;
	
	// If Agreed and Not on the Disclaimer Page
	if(LocalStore.get('agreed') && Router.current().route._path != '/disclaimer')
		TemplateVar.set(template, 'agreed', true);
	
	// If setup is not completed, promt setup menu
	if(!LocalStore.get('setup'))
		TemplateVar.set(template, 'promtSetup', true);
};

Template['components_agreement'].helpers({
	'loaded': function(){
		// Loading hack
		if(Router.current().route._path == '/disclaimer')
			TemplateVar.set('agreed', false);
	}
});

Template['components_agreement'].events({
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #weifundDeploy)
    **/

    'click #agreementIAgree': function(event, template){
		LocalStore.set('agreed', true);
		TemplateVar.set(template, 'agreed', true);
		
		// Routing Hack
		if(Router.current().route._path == '/disclaimer')
			Router.go('/');
	}
});