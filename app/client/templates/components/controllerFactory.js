/**
Template Controller

@module Templates
*/

/**
The template to allow easy WeiFund contract deployment.

@class [template] components_weihash
@constructor
*/

var template;

Template['components_controllerFactory'].created = function () {
	TemplateVar.set('createFactoryState', {
		isUndeployed: true
	});
	TemplateVar.set('createControllerState', {
		isUndeployed: true
	});
};

Template['components_controllerFactory'].rendered = function () {
	template = this;
};

Template['components_controllerFactory'].helpers({
	'estimateGas': function () {
		return 1906742;
	},
	'weifundAddress': function() {
		return objects.contracts.WeiFund.address;
	},
});

Template['components_controllerFactory'].events({
	/**
	Deploy the WeiHash contract.

	@event (click #weifundDeploy)
	**/

	'click #deployFactory': function (event, template) {
		if (!confirm("Are you sure you want to deploy a WeiFund controller factory contract?"))
			return;

		// set new WeiFund address and TX object
		var transactionObject = {
			data: WeiControllerFactory.bytecode,
			gas: web3.eth.defaultGas,
			from: web3.eth.defaultAccount
		};

		// create new CampaignAccountFactory contract
		WeiControllerFactory.new(objects.contracts.WeiFund.address, transactionObject, function (err, result) {
			if (err)
				return TemplateVar.set(template, 'createFactoryState', {
					isError: true,
					error: err
				});

			// set state as mining
			TemplateVar.set(template, 'createFactoryState', {
				isMining: true,
				transactionHash: result.transactionHash
			});

			// set state as mined
			if (result.address) {
				TemplateVar.set(template, 'createFactoryState', {
					isMined: true,
					address: result.address,
					transactionHash: result.transactionHash
				});

				// get contracts object
				var contractsObject = LocalStore.get('contracts');
		    contractsObject[LocalStore.get('network')] = {
					WeiControllerFactory: result.address,
				};

				// Update the CampaignAccountFactory address
				LocalStore.set('contracts', contractsObject);
			}
		});

		// Prevent Double Click
		$(event.currentTarget).prop('disabled', true);
	},

	/**
	Register a hash with WeiHash.

	@event (click #createController)
	**/

	'click #createController': function (event, template) {
		if (!confirm("Are you sure you want to create a WeiFund controller?"))
			return;

		// set new WeiFund address and TX object
		var transactionObject = {
				gas: web3.eth.defaultGas,
				from: web3.eth.defaultAccount
			},
			serviceAddedFilter = {
				_sender: transactionObject.from
			},
			token = $('#createControllerTokenAddress').val(),
			tokenValue = $('#createControllerTokenValue').val(),
			autoDisperse = $('#createControllerAutoDisperse').is(':checked');

		objects.contracts.WeiControllerFactory.newWeiController(transactionObject.from, token, tokenValue, autoDisperse, transactionObject, function (err, transactionHash) {
			if (err)
				return TemplateVar.set(template, 'createControllerState', {
					isError: true,
					error: err
				});

			TemplateVar.set(template, 'createControllerState', {
				isMining: true,
				transactionHash: transactionHash
			});
		});

		objects.contracts.WeiControllerFactory.ServiceAdded(serviceAddedFilter, function (err, result) {
			if (err)
				return TemplateVar.set(template, 'createControllerState', {
					isError: true,
					error: err
				});

			TemplateVar.set(template, 'createControllerState', {
				isMined: true,
				address: result.args._service,
				transactionHash: result.transactionHash
			});
		});
	},

	/**
	Lookup a hash on the WeiHash registery.

	@event (click #weihashLookup)
	**/

	'click #lookupController': function (event, template) {},
});
