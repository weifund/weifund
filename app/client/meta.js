/**
Template Controllers

@module Meta
**/

/**
The app meta data

@class App meta
@constructor
**/

if(Meteor.isClient) {

	// Meta defaults
	Meta.config({
	  options: {
		suffix: ''
	  }
	});

	
	/**
	A suffix method to allow for suffix updates (Title | [Suffix])

	@method setSuffix
	**/
	
	Meta.setSuffix = function(suffix){
	  Meta.setTitle(TAPi18n.__("dapp.app.title") + ' | ' + suffix);
	};
}
