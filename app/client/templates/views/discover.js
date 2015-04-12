/**
Template Controllers

@module Templates
**/

/**
The view1 template

@class [template] views_view1
@constructor
**/

Template['views_discover'].helpers({
    /**
    Get the name

    @method (name)
    **/

    'name': function(){
        return this.name || TAPi18n.__('dapp.views.discover.defaultName');
    },
	
	/**
    Get the campaigns

    @method (campaigns)
    **/
    
	'campaigns': function(){
		var	params = category == false ? {} : {categoryId: categoryId};
		return Campaigns.find(params);
	},
	
	/**
    Get the categories

    @method (categories)
    **/
    
	'categories': function(){
		return Categories.find({});
	},
});

Template['views_discover'].events({
	/**
    On Load More

    @event (click #loadMore)
    **/
    
	'click #loadMore': function(){
        var start = Session.get('start');
        Campaigns.load(false, 8, start);
        Session.set('start', start + 8);
	},
});

Template['views_discover'].created = function(){	
	Meta.setSuffix(TAPi18n.__("dapp.views.discover.title"));
};
