/**
Template Controllers

@module Templates
**/

/**
The view1 template

@class [template] views_view1
@constructor
**/

Template['views_home'].helpers({
    /**
    Get the name

    @method (name)
    **/

    'name': function(){
        return this.name || TAPi18n.__('dapp.views.home.defaultName');
    }
});

Template['views_home'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.views.home.title"));
};
