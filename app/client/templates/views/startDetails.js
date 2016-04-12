Template['views_startDetails'].created = function () {
	Meta.setSuffix(TAPi18n.__("dapp.views.start.title"));

	// Set campaign data
	if(_.isUndefined(LocalStore.get('startCampaignData')))
		LocalStore.set('startCampaignData', {});
};

Template['views_startDetails'].rendered = function () {
	$('#startDetailsForm').parsley({
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

Template['views_startDetails'].helpers({
	/**
    Get the campaigns

    @method (campaigns)
    **/

	'load': function () {
		LocalStore.set('startCampaignStage', 1);
	},

	'data': function () {
		return Receipts.findOne({campaignID: 'latest'}) || {};
	},
});

Template['views_startDetails'].events({
	/**
    On Load More

    @event (click #startBack)
    **/

	'click #startBack': function () {
		Router.go('/start');
	},

	/**
    On Load More

    @event (click #loadMore)
    **/

	'click #startNext': function () {
		var url = Helpers.cleanAscii($('#url').val()),
			category = Helpers.cleanAscii($('#category').val()),
			mainEntityOfPage = Helpers.cleanAscii($('#primaryContent').val()),
			banner = Helpers.cleanAscii($('#bannerImage').val()),
			avatar = Helpers.cleanAscii($('#avatarImage').val()),
			about = Helpers.cleanAscii($('#about').val()),
			description = Helpers.cleanAscii($('#description').val()),
			createPersona = $('#createPersona').is(':checked'),
			personaName = Helpers.cleanAscii($('#personaName').val()),
			personaImage = Helpers.cleanAscii($('#personaImage').val());

		// setup localstore object
		var localStoreObject = {
			campaignID: 'latest',
			url: url,
			category: category,
			mainEntityOfPage: mainEntityOfPage,
			banner: banner,
			avatar: avatar,
			about: about,
			description: description,
			createPersona: createPersona,
			personaName: personaName,
			personaImage: personaImage,
		};

		// check form
		$('#startDetailsForm').parsley().subscribe('parsley:form:validate', function (formInstance) {

			// If the form is valid
			if (formInstance.isValid('block1', true) && formInstance.isValid('block2', true) && (!createPersona || formInstance.isValid('block3', true))) {

				// Update Receipts
				Receipts.update({campaignID: 'latest'}, {$set: localStoreObject});

				// Continue to tokens page
				Router.go('/start/tokens');

				// Prevent Form Submit
				formInstance.submitEvent.preventDefault();
			}
		});
	},
});
