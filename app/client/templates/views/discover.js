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
    Get the campaigns

    @method (campaigns)
    **/
    
	'campaigns': function(){
		var	params = this.category == false ? {} : {category: this.category};
        
		return Campaigns.find(params, {sort: {id: -1}});
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
        Campaigns.load(start, 8);
        Session.set('start', start + 8);
	},
});

Template['views_discover'].created = function(){	
	Meta.setSuffix(TAPi18n.__("dapp.views.discover.title"));
};

Template['views_discover'].rendered = function(){	
    
    Campaigns.load(0, 8, function(err, result){
        
    });
    
};
