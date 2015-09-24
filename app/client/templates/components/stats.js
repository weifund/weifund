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
    TemplateVar.set(template, 'numCampaigns', 0);
    TemplateVar.set(template, 'address', LocalStore.get('weifundAddress'));
    TemplateVar.set(template, 'updated', moment().format('LTS'));
    
    Meteor.setInterval(function(){
        weifundInstance.numCampaigns.call(function(err, result){
            TemplateVar.set(template, 'numCampaigns',  result.toNumber(10));
        });
        
        TemplateVar.set(template, 'address', LocalStore.get('weifundAddress'));
        TemplateVar.set(template, 'updated', moment().format('LTS'));
    }, 5000);
};