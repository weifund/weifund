Template['views_startBasic'].created = function () {
	Meta.setSuffix(TAPi18n.__("dapp.views.start.title"));
	
	// Set campaign data
	if(_.isUndefined(LocalStore.get('startCampaignData')) || LocalStore.get('startCampaignData') == null)
		LocalStore.set('startCampaignData', {});
};

Template['views_startBasic'].rendered = function () {
	$('#startBasicForm').parsley({
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
				
	// Set default stage
	LocalStore.set('startCampaignStage', 0);
	
	Meteor.setTimeout(function(){ //timeout hack.
		$('#expiry').datetimepicker();
	}, 300);
};

Template['views_startBasic'].helpers({
	/**
    Get the campaigns

    @method (campaigns)
    **/

	'load': function () {
		LocalStore.set('startCampaignStage', 0);
	},
	
	'data': function() {
		return Receipts.findOne({campaignID: 'latest'});
	},
});

Template['views_startBasic'].events({
	/**
    On Load More

    @event (click #loadMore)
    **/

	'click #startNext': function () {
		var expiry = moment(Helpers.cleanAscii($('#expiry').val())).unix(),
			name = Helpers.cleanAscii($('#name').val()),
			beneficiary = Helpers.cleanAscii($('#beneficiary').val()),
			fundingGoal = web3.toWei(Helpers.cleanAscii($('#fundingGoal').val()), 'ether'),
			createEndpoint = $('#createEndpoint').is(':checked');
		
		var localStoreObject = {
				campaignID: 'latest',
				name: name,
				expiry: expiry,
				beneficiary: beneficiary,
				fundingGoal: fundingGoal,
				createEndpoint: createEndpoint
			};

		// set expiry default
		if (_.isNaN(expiry) || expiry == '')
			expiry = 0;

		// Setup parsley fields data
		var beneficiaryField = $('#beneficiary').parsley();

		// check beneficiary address
		if(!web3.isAddress(beneficiary))
			return ParsleyUI.addError(beneficiaryField, "InvalidAddress", 'Your beneficiary address must be a real ethereum account');
		else
			ParsleyUI.removeError(beneficiaryField, "InvalidAddress");

		// setup parsley form validation
		$('#startBasicForm').parsley().subscribe('parsley:form:validate', function (formInstance) {
			// If the form is valid
			if (formInstance.isValid('block1', true)) {
				
				// Update Receipts
				Receipts.upsert({campaignID: 'latest'}, {$set: localStoreObject});
				
				// Route to Details
				Router.go('/start/details');

				// Prevent Form Submit
				formInstance.submitEvent.preventDefault();	
			}
		});
	},
});