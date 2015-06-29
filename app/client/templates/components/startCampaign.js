/**
Template Controllers

@module Templates
**/

/**
The balance template

@class [template] components_startCampaign
@constructor
**/

Template['components_startCampaign'].created = function(){
    // Set Default Start Campaign State
    TemplateVar.set('startCampaign', {isNotStarted: true});
};

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
    Fired when the start button is clicked. This starts the crowdfunding campaign.

    @method (click #start)
    **/
    
    'click #start': function(event, template){
        var timelimit = moment($('#timelimit').val()).unix();  
        var name = $('#name').val();
        var website = $('#website').val();
        var beneficiary = $('#beneficiary').val();
        var config = $('#config').val();
        var goal = web3.toWei(parseInt($('#goal').val()), 'ether');
        var category = $('#category').val();
        var video = Helpers.parseVideoUrl($('#video').val());
        
        if(_.isObject(video))
            video = video.type + ' ' + video.id;
        else
            video = '';
        
        $('#startCampaignForm').parsley().subscribe(
            'parsley:form:validate', function (formInstance) {
            
            // If the form is valid
            if (formInstance.isValid('block1', true) 
                || formInstance.isValid('block2', true)) {

                WeiFund.newCampaign(name, website, video, beneficiary, goal, timelimit, category, config, function(err, result, mined){
                    if(err) {
                        TemplateVar.set(template, 'startCampaign', {isError: true, error: err});
                        return;
                    }
                    
                    TemplateVar.set(template, 'startCampaign', {isMining: true});
                    
                    if(!mined)
                        return;
                    
                    Campaigns.load(result.toNumber(10), 1, function(err, campaign){
                        if(err) {
                            TemplateVar.set(template, 'startCampaign', {isError: true, error: err});
                            return;
                        }
                        
                        if(campaign.id == result.toNumber(10))
                            TemplateVar.set(template, 'startCampaign', {isMined: true, cid: result.toNumber(10)});
                    });
                });
            }
                
            // else stop form submission
            formInstance.submitEvent.preventDefault();
        });
    },
});