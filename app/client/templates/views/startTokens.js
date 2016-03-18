Template['views_startTokens'].helpers({
	/**
    Get the campaigns

    @method (campaigns)
    **/

	'load': function () {
		LocalStore.set('startCampaignStage', 2);
	},

	'data': function () {
		return LocalStore.get('startCampaignData') || {};
	},
});

Template['views_startTokens'].created = function () {
	Meta.setSuffix(TAPi18n.__("dapp.views.start.title"));
};

Template['views_startTokens'].rendered = function () {
	$('#startTokensForm').parsley({
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
	
	// Config override
	TemplateVar.set('configOverride', false);	
};

Template['views_startTokens'].events({
	/**
    Back button events

    @event (click #startBack)
    **/

	'click #startBack': function () {
		Router.go('/start/details');
	},
	
	/**
    Back button events

    @event (click #startBack)
    **/

	'click #startClear': function () {
		TemplateVar.set('createToken', false);
		TemplateVar.set('createController', false);
		TemplateVar.set('configOverride', false);
	},
									 
	/**
    On Load More

    @event (click #createToken)
    **/

	'change #createToken': function () {
		if($('#createToken').is(':checked'))
			TemplateVar.set('createToken', true);
		else
			TemplateVar.set('createToken', false);
	},
	
	/**
    On Load More

    @event (click #createController)
    **/

	'change #createController': function () {
		if($('#createController').is(':checked'))
			TemplateVar.set('createController', true);
		else
			TemplateVar.set('createController', false);
	},
	
	/**
    On Load More

    @event (click #overrideConfig)
    **/

	'change #overrideConfig': function () {
		if($('#overrideConfig').is(':checked')) {
			$('#createController').attr('checked', false);
			$('#createToken').attr('checked', false);
			TemplateVar.set('createController', false);
			TemplateVar.set('createToken', false);
			
			TemplateVar.set('configOverride', true);
		} else {
			TemplateVar.set('configOverride', false);
		}
	},
	
	/**
    On Load More

    @event (click #startNext)
    **/

	'click #startNext': function () {
		var createToken = $('#createToken').is(':checked'),
			createController = $('#createController').is(':checked'),
			useConfig = $('#useConfig').is(':checked'),
			config = Helpers.cleanAscii($('#config').val()),
			autoDispersal = $('#autoDispersal').is(':checked'),
			tokenAddress = Helpers.cleanAscii($('#tokenAddress').val()),
			initialAmount = Helpers.cleanAscii($('#initialAmount').val()),
			tokenPrice = Helpers.cleanAscii($('#tokenPrice').val());
		
		// config is undefined
		if(!web3.isAddress(config) || config == '0x' || config == 'undefined')
			config = '';
		
		// setup localstore object
		var localStoreObject = {
			createToken: createToken,
			createController: createController,
			useConfig: useConfig,
			config: config,
			autoDispersal: autoDispersal,
			tokenAddress: tokenAddress,
			initialAmount: initialAmount,
			tokenPrice: tokenPrice,
		};

		try {
			if(tokenPrice == "undefined" || tokenPrice == "")
				tokenPrice = 0;

			if(initialAmount == "undefined" || initialAmount == "")
				initialAmount = 0;

			var tokenPriceBN = new BigNumber(tokenPrice),
				initialAmountBN = new BigNumber(initialAmount);

			var initialAmountField = $('#initialAmount').parsley(),
				tokenPriceFeild = $('#tokenPrice').parsley(),
				tokenAddressField = $('#tokenAddress').parsley(),
				configField = $('#config').parsley();

			// If create token
			if(createToken && initialAmountBN.lessThanOrEqualTo(0)) {
				ParsleyUI.reset(initialAmountField);
				return ParsleyUI.addError(initialAmountField, "InvalidNumber", 'You must provide an initial token amount.');
			} else {
				ParsleyUI.removeError(initialAmountField, "InvalidNumber");
			}

			// Check config address
			if(useConfig && !web3.isAddress(config)) {
				ParsleyUI.reset(configField);
				return ParsleyUI.addError(configField, "InvalidAddress", 'You must provide a valid config address.');
			} else {
				ParsleyUI.removeError(configField, "InvalidAddress");
			}


			// If create controller
			if(createController && tokenPriceBN.lessThanOrEqualTo(0)) {
				ParsleyUI.reset(tokenPriceFeild);
				return ParsleyUI.addError(tokenPriceFeild, "InvalidNumber", 'You must provide a valid token price.');
			} else {
				ParsleyUI.removeError(tokenPriceFeild, "InvalidNumber");
			}

			// If create controller but not create token
			if(createController && !createToken && !web3.isAddress(tokenAddress)) {
				ParsleyUI.reset(tokenAddressField);
				return ParsleyUI.addError(tokenAddressField, "InvalidAddress", 'You must provide a valid token address.');
			} else {
				ParsleyUI.removeError(tokenAddressField, "InvalidAddress");
			}
		}catch(e){console.log(e);}
		
		// check form
		$('#startTokensForm').parsley().subscribe('parsley:form:validate', function (formInstance) {	
			
			// If the form is valid
			if (formInstance.isValid('block1', true)) {
				// Campaign Data
				var localStored = LocalStore.get('startCampaignData');
				
				// Set localStore object
				LocalStore.set('startCampaignData', _.extend(localStored, localStoreObject));

				// Continue to tokens page
				Router.go('/start/checkout');
				
				// Prevent Form Submit
				formInstance.submitEvent.preventDefault();	
			}	
		});
	},
});