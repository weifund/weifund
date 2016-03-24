/**
Template Controller

@module Templates
*/

/**
The template to allow easy WeiFund contract deployment.

@class [template] components_deploy
@constructor
*/

Template['components_stats'].rendered = function(){
	var template = this;
			
	TemplateVar.set(template, 'weihashValid', 'Invalid');
	
	objects.contracts.WeiFund.totalCampaigns(function(err, result){
		if(!err)
			TemplateVar.set(template, 'totalCampaigns', result.toNumber(10));
		
        TemplateVar.set(template, 'updated', moment().format('LTS'));
	});
	
	objects.contracts.WeiFund.version(function(err, result){
		if(!err)
			TemplateVar.set(template, 'version', result.toNumber(10));
		
        TemplateVar.set(template, 'updated', moment().format('LTS'));
	});
	
	objects.contracts.WeiHash.weifundAddr(function(err, result){
		if(!err)
			TemplateVar.set(template, 'weihashWeiFund', result);
		
		if(result == objects.contracts.WeiFund.address)
			TemplateVar.set(template, 'weihashValid', 'Is Valid');
		
        TemplateVar.set(template, 'updated', moment().format('LTS'));
	});
	
	objects.contracts.WeiHash.version(function(err, result){
		if(!err)
			TemplateVar.set(template, 'weihashVersion', result.toNumber(10));
		
        TemplateVar.set(template, 'updated', moment().format('LTS'));
	});
	
	objects.contracts.WeiAccounts.weifund(function(err, result){
		console.log(err, result);
		
		if(!err && result == objects.contracts.WeiFund.address)
			TemplateVar.set(template, 'weiaccountsValid', 'Is Valid');
		
        TemplateVar.set(template, 'updated', moment().format('LTS'));
	});
	
	TemplateVar.set(template, 'weifundAddress', objects.contracts.WeiFund.address);
	
	TemplateVar.set(template, 'weihashAddress', objects.contracts.WeiHash.address);
};