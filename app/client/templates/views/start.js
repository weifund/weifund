/**
Template Controllers

@module Templates
**/

/**
The views_start template

@class [template] views_start
@constructor
**/

Template['views_start'].helpers({
    /**
    Get most recent campaigns.

    @method (campaigns)
    **/

    'campaigns': function(){
        return Campaigns.find({}, {limit: 4, sort: {id: -1}});
    }
});

Template['views_start'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.views.home.title"));
};
