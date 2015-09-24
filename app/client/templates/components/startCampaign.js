/**
Template Controllers

@module Templates
**/

/**
The balance template

@class [template] components_startCampaign
@constructor
**/
    
// Current account
var accountIndex = 0;

Template['components_startCampaign'].rendered = function(){
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
    
    // Set Default Start Campaign State
    TemplateVar.set('state', {isNotStarted: true});
};

Template['components_startCampaign'].helpers({
    'load': function(){
        Meteor.setTimeout(function(){ //timeout hack.
            $('#timelimit').datetimepicker();
        }, 300);
    },
});

Template['components_startCampaign'].events({
    /**
    Fired when a user touches a key on the beneficiary address field.

    @method (keyup #beneficiary)
    **/
    
    'keyup #beneficiary': function(event, template){
        var accounts = EthAccounts.find({}).fetch();
        
        if(event.keyCode == 38) // up arrow
            accountIndex += 1;
        
        if(event.keyCode == 40) // down arrow
            accountIndex -= 1;
        
        if(accountIndex > accounts.length - 1)
            accountIndex = 0;
        
        if(accountIndex < 0)
            accountIndex = accounts.length - 1;
        
        if(event.keyCode == 38 || event.keyCode == 40)
            $('#beneficiary').val(accounts[accountIndex].address);
    },
        
    /**
    Fired when the start button is clicked. This starts the crowdfunding campaign.

    @method (click #start)
    **/
    
    'click #start': function(event, template){
        var timelimit = moment($('#timelimit').val()).unix(),
            name = $('#name').val(),
            website = $('#website').val(),
            beneficiary = $('#beneficiary').val(),
            config = $('#config').val(),
            goal = web3.toWei(parseInt($('#goal').val()), 'ether'),
            category = $('#category').val(),
            video = Helpers.parseVideoUrl($('#video').val()),
            onNewCampaignEvent,
            eventObject = {
                addr: LocalStore.get('selectedAccount')
            },
            eventCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isError: true, 
                        error: err
                    });
                
                var cid = result.args._cid.toNumber(10);
                
                Campaigns.import(cid, cid + 1, 
                                 function(err, campaign){
                    TemplateVar.set(template, 'state', {
                        isMined: true, 
                        cid: cid,
                        campaign: Campaigns.findOne({id: cid}),
                    });
                });
            },
            transactionObject = {
                from: LocalStore.get('selectedAccount'),
                gas: 3000000
            },
            transactionCallback = function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {
                        isError: true, 
                        error: err
                    });
                
                TemplateVar.set(template, 'state', {
                    isMining: true,
                });
            };
        
        // the video url parsed is an object
        if(_.isObject(video))
            video = video.type + ' ' + video.id;
        else
            video = '';
        
        // given the form is filled out correctly
        $('#startCampaignForm').parsley().subscribe(
            'parsley:form:validate', function (formInstance) {
        
            // If the form is valid
            if (formInstance.isValid('block1', true) 
                || formInstance.isValid('block2', true)) {
                
                // start new campaign
                weifundInstance.newCampaign.sendTransaction(name, website, 
                                                            video, beneficiary, 
                                                            goal, timelimit, 
                                                            category, config, 
                                                            transactionObject, 
                                                            transactionCallback);
                
                // listen for campaign creation
                weifundInstance.onNewCampaign(eventObject, eventCallback);
            }
                
            // else stop form submission
            formInstance.submitEvent.preventDefault();
        });
    },
});