/**
Template Controllers

@module Templates
**/

/**
The balance template

@class [template] components_balance
@constructor
**/

Template['components_search'].helpers({
    /**
    Get The Original Balance

    @method (watchBalance)
    **/
});

Template['components_search'].events({
    /**
    Get The Original Balance

    @event (keyup .form-control)
    **/
	
	'keyup .form-control': function(event){
		Session.set('search', event.target.value);
	},
});

_.extend(Template['components_search'], {
				  
	/**
    On Template Created

    @method (created)
    **/

	'created': function() {
		Session.setDefault('search', '0');
	},
});
