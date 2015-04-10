/**
Template Controller

@module Templates
*/

/**
The template to allow easy WeiFund contract deployment.

@class [template] components_deploy
@constructor
*/

Template['components_deploy'].created = function(){
    Session.setDefault('deployed', false);
};

Template['components_deploy'].events({
    /**
    Deploy the price feed, used for setup of contract.

    @event (click #deploy)
    **/

    'click #deploy': function(){
        var addr = WeiFund.deploy();
        Session.set('address', addr);
        Session.set('deployed', true);
    },
});