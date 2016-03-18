/**
Template Controllers

@module Routes
*/

/**
The app routes

@class App routes
@constructor
*/

/*objects = {
	contracts: {
		WeiFund: WeiFund.at(''),
		WeiHash: WeiHash.at(''),
		PersonaRegistry: PersonaRegistry.at(''),
	},
};*/

// Router configuration defaults
Router.configure({
    layoutTemplate: 'layout_main',
    notFoundTemplate: 'layout_notFound',
    yieldRegions: {
        'layout_header': {to: 'header'}
        , 'layout_footer': {to: 'footer'}
    }
});

// ROUTES

// When no route is selected, go home
Router.route('/', {
    template: 'views_home',
    name: 'home'
});

// The administrator panel route
Router.route('/admin', {
    template: 'views_adminStats',
    layoutTemplate: 'layout_admin',
    name: 'admin'
});

// The administrator panel route
Router.route('/about', {
    template: 'views_about',
    layoutTemplate: 'layout_about',
    name: 'about'
});

// The administrator panel route
Router.route('/about/weifund', {
    template: 'views_aboutWeiFund',
    layoutTemplate: 'layout_about',
    name: 'aboutWeiFund'
});

// The administrator panel route
Router.route('/about/weihash', {
    template: 'views_aboutWeiHash',
    layoutTemplate: 'layout_about',
    name: 'aboutWeiHash'
});

// The administrator panel route
Router.route('/about/campaigns', {
    template: 'views_aboutCampaigns',
    layoutTemplate: 'layout_about',
    name: 'aboutCampaigns'
});

// The administrator panel route
Router.route('/about/ipfs', {
    template: 'views_aboutIPFS',
    layoutTemplate: 'layout_about',
    name: 'aboutIPFS'
});

// The administrator panel route
Router.route('/admin/stats', {
    template: 'views_adminStats',
    layoutTemplate: 'layout_admin',
    name: 'stats'
});

// The administrator panel route
Router.route('/admin/tokens', {
    template: 'views_adminTokens',
    layoutTemplate: 'layout_admin',
    name: 'tokens'
});

// The administrator panel route
Router.route('/admin/weicontroller', {
    template: 'views_adminWeiController',
    layoutTemplate: 'layout_admin',
    name: 'weicontrollers'
});

// The administrator panel route
Router.route('/admin/weihash', {
    template: 'views_adminWeiHash',
    layoutTemplate: 'layout_admin',
    name: 'weihash'
});

// The administrator panel route
Router.route('/admin/weiaccounts', {
    template: 'views_adminWeiAccounts',
    layoutTemplate: 'layout_admin',
    name: 'weiaccounts'
});

// The administrator panel route
Router.route('/admin/ipfs', {
    template: 'views_adminIPFS',
    layoutTemplate: 'layout_admin',
    name: 'ipfs'
});

// The administrator panel route
Router.route('/admin/weifund', {
    template: 'views_adminWeiFund',
    layoutTemplate: 'layout_admin',
    name: 'weifund'
});

// The administrator panel route
Router.route('/admin/persona', {
    template: 'views_adminPersona',
    layoutTemplate: 'layout_admin',
    name: 'persona'
});

// The administrator panel route
Router.route('/admin/settings', {
    template: 'views_adminSettings',
    layoutTemplate: 'layout_admin',
    name: 'settings'
});

// The discover page, when no category is selected
Router.route('/discover', {
    template: 'views_discover',
	data: function (){
        _category = false;
        
		templateData = {
			category: _category
		};
        
		return templateData;
	},
    name: 'discover'
});

// The discover page routing, when the category is selected
Router.route('/discover/:_category', {
	template: 'views_discover',
	data: function (){
		_category = decodeURIComponent(this.params._category);
        category = Categories.findOne({name: _category});
		templateData = {
			category: false,
		};
        
        if(!_.isUndefined(category))
        	templateData.category = category.id;
        
		return templateData;
	},
});

// The tracker page routing, when no ID is selected
Router.route('/campaign/', {
    template: 'views_home',
});

// The tracker page routing, when no ID is selected
Router.route('/start/receipt', {
    template: 'views_startReceipt',
	layoutTemplate: 'layout_start',
});

// The tracker page routing, when no ID is selected
Router.route('/start/checkout', {
    template: 'views_startCheckout',
	layoutTemplate: 'layout_start',
});

// The tracker page routing, when no ID is selected
Router.route('/start/tokens', {
    template: 'views_startTokens',
	layoutTemplate: 'layout_start',
});

// The tracker page routing, when no ID is selected
Router.route('/start/details', {
    template: 'views_startDetails',
	layoutTemplate: 'layout_start',
});

// The tracker page routing, when no ID is selected
Router.route('/start/basics', {
    template: 'views_startBasic',
	layoutTemplate: 'layout_start',
});

// The tracker page routing, when no ID is selected
Router.route('/start', {
    template: 'views_startBasic',
	layoutTemplate: 'layout_start',
});

// The tracker page routing, when no ID is selected
Router.route('/setup', {
    template: 'components_setup',
});

// The tracker page routing, when no ID is selected
Router.route('/disclaimer', {
    template: 'components_disclaimer',
});

// The tracker page routing, when no ID is selected
Router.route('/token', {
    template: 'views_token',
});

// The tracker page routing, when a campaign ID is selected
Router.route('/campaign/:_id', {
    template: 'views_campaign',
	data: function (){
        _id = parseInt(this.params._id);
        
		templateData = {
			id: _id,
		};
        
		return templateData;
	},
    name: 'campaign'
});