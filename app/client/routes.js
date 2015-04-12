/**
Template Controllers

@module Routes
*/

/**
The app routes

@class App routes
@constructor
*/

// Change the URLS to use #! instead of real paths
// Iron.Location.configure({useHashPaths: true});

// Router defaults
Router.configure({
    layoutTemplate: 'layout_main',
    notFoundTemplate: 'layout_notFound',
    yieldRegions: {
        'layout_header': {to: 'header'}
        , 'layout_footer': {to: 'footer'}
    }
});

// ROUTES

/**
The receive route, showing the wallet overview

@method dashboard
*/

Router.route('/tracker/', {
    template: 'views_tracker',
    name: 'tracker'
});

Router.route('/admin', {
    template: 'views_admin',
    name: 'admin'
});

Router.route('/tracker/:_id', {
    template: 'views_tracker',
	data: function (){
		_id  = this.params._id;
        campaign = WeiFund.campaign(_id);
        Session.set('trackCampaign', campaign.safeData);
        Session.set('state', "open");
        
        console.log(campaign);
        
		templateData = {
			_id: _id,
			//campaign: campaign
		};
		return templateData;
	},
    name: 'campaignTracker'
});

Router.route('/discover', {
    template: 'views_discover',
	data: function (){
        category = false;
        _category = false;
        
        Session.set('start', 8);
        Campaigns.load(false, 8, 0); 
        
		templateData = {
			_category: false
			, category: false
		};
		return templateData;
	},
    name: 'discover'
});

Router.route('/discover/:_category', {
	template: 'views_discover',
	data: function (){
		_category  = this.params._category;
        category = false;
        categoryId = WeiFund.category(_category);
        
        if(WeiFund.isCategory(categoryId))     
            category = categoryId;
                
        Session.set('start', 8);
        Campaigns.load(category, 8, 0);
        
		templateData = {
			_category: _category,
			category: category,
		};
		return templateData;
	},
});

Router.route('/', {
    template: 'views_home',
    name: 'home'
});
