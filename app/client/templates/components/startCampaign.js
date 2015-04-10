/**
Template Controllers

@module Templates
**/

/**
The balance template

@class [template] components_balance
@constructor
**/

Template['components_startCampaign'].helpers({
    /**
    Get Campaign

    @method (campaign)
    **/
	
	'startedCampaign': function(){
		return Session.get('startedCampaign');
	},
    
    /**
    Get the benificiary address.

    @method (beneficiaryAddress)
    **/
    
    'beneficiaryAddress': function(){
        return WeiFund.from();
    }, 
	
	/**
    Get Categories

    @method (campaign)
    **/
	
	'categories': function(){
		return Categories.find({});	
	},
});

Template['components_startCampaign'].rendered = function(){
	// Create Datepicker
	$('#timelimit').datepicker();

	// Form Validation
	$('#startCampaignForm').parsley({
		successClass: "has-success",
		errorClass: "has-error",
		classHandler: function (el) {
			return el.$element.closest(".form-group");
		},
		errorsContainer: function (el) {
			return el.$element.closest(".form-group");
		},
		errorsWrapper: "<span class='help-block'></span>",
		errorTemplate: "<span></span>"
	});
};

Template['components_startCampaign'].events({
    /**
    On start campaign button.

    @method (click #start)
    **/
    
    'click #start': function(){
        var timelimit = moment($('#timelimit').val()).unix();  
        var name = $('#name').val();
        var website = $('#website').val();
        var beneficiary = $('#beneficiary').val();
        var goal = $('#goal').val();
        var category = $('#category').val();
        
        $('#startCampaignForm').parsley().subscribe(
            'parsley:form:validate', function (formInstance) {
            
            if (formInstance.isValid('block1', true) 
                || formInstance.isValid('block2', true)) {

                var newCamp = WeiFund.newCampaign(name, website, beneficiary, goal, timelimit, category);                
                
                if(newCamp == true){
                    Session.set('started', 1);
                    Session.set('startedProcessed', 0);
                    WeiFund.onNewCampaign(WeiFund.from(), function(campaign){
                        Session.set('startedProcessed', 1);
                        console.log(campaign);
                        Session.set('startedCampaign', campaign.safeData);
                    });
                }
            }
                
            // else stop form submission
            formInstance.submitEvent.preventDefault();
        });
    },
});