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
    template: 'views_admin',
    name: 'admin'
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
Router.route('/start', {
    template: 'views_start',
});

// The tracker page routing, when no ID is selected
Router.route('/about', {
    template: 'views_about',
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