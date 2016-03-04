/**
Template Controllers

@module Templates
*/

/**
A NameReg toName async template for loading names from NameReg on the fly.

@class [template] components_deploy
@constructor
*/

Template['components_toName'].rendered = function(){
	TemplateVar.set('address', '');
	
	if(_.isUndefined(this.data) || !web3.isAddress(this.data))
		return TemplateVar.set('address', '');
	
	TemplateVar.set('address', this.data);
	
};

Template['components_toName'].helpers({
	'persona': function(){
		objects.helpers.importPersona(TemplateVar.get('address'), function(err, result){
		});
		
		return Personas.findOne({address: TemplateVar.get('address')});
	},
});
