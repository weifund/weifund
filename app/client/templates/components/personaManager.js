/**
Template Controller

@module Templates
*/

/**
The template to allow easy WeiFund contract deployment.

@class [template] components_personaManager
@constructor
*/

var template;

Template['components_personaManager'].created = function() {
  TemplateVar.set('state', {
    isUndeployed: true
  });
};

Template['components_personaManager'].rendered = function() {
  template = this;
};


Template['components_personaManager'].helpers({
  'gasAmount': function() {
    return web3.eth.defaultGas;
  },
  'estimateGas': function() {
    return 1906742;
  },
});

Template['components_personaManager'].events({
  /**
  Deploy the WeiHash contract.

  @event (click #weifundDeploy)
  **/

  'click #personaDeploy': function(event, template) {
    if (!confirm("Are you sure you want to deploy a Persona contract?"))
      return;

    // Prevent Double Click
    $(event.currentTarget).prop('disabled', true);

    var transactionObject = {
      data: '0x' + PersonaRegistry.bytecode,
      gas: web3.eth.defaultGas,
      from: web3.eth.defaultAccount
    };

    PersonaRegistry.new(transactionObject, function(err, result) {
      if (err)
        return TemplateVar.set(template, 'state', {
          isError: true,
          error: err
        });

      TemplateVar.set(template, 'state', {
        isMining: true,
        transactionHash: result.transactionHash
      });

      if (result.address) {
        TemplateVar.set(template, 'state', {
          isMined: true,
          address: result.address,
          transactionHash: result.transactionHash
        });

        // get contracts object
        var contractsObject = LocalStore.get('contracts');
        contractsObject[LocalStore.get('network')]['PersonaRegistry'] = result.address;

        // Update the Persona Registry address
        LocalStore.set('contracts', contractsObject);
      }

    });
  },

  /**
  Register a hash with WeiHash.

  @event (click #personaRegister)
  **/

  'click #personaRegister': function(event, template) {
    if (!confirm("Are you sure you want to set your persona attributes to this hash with Persona?"))
      return;

    // Prevent Double Click
    $(event.currentTarget).prop('disabled', true);

    var name = Helpers.cleanXSS(Helpers.cleanAscii($('#setPersonaName').val())),
      image = Helpers.cleanXSS(Helpers.cleanAscii($('#setPersonaImage').val())),
      transactionObject = {
        from: web3.eth.defaultAccount,
        gas: web3.eth.defaultGas
      };

    var personaObject = {
      'personSchema': {
        'name': name,
        'image': {
          '@type': 'ImageObject',
          'name': 'avatar',
          'contentUrl': image
        }
      }
    };

    ipfs.addJson(personaObject, function(err, ipfsHash) {
      if (err)
        return TemplateVar.set(template, 'registerState', {
          isError: true,
          error: err
        });

      var ipfsHashHex = '0x' + ipfs.utils.base58ToHex(ipfsHash);

      TemplateVar.set(template, 'registerState', {
        isMining: true,
        ipfsHash: ipfsHash,
        ipfsHashHex: ipfsHashHex
      });

      objects.contracts.PersonaRegistry.setPersonaAttributes(ipfsHashHex, transactionObject, function(err, result) {
        if (err)
          return TemplateVar.set(template, 'registerState', {
            isError: true,
            error: err
          });

        TemplateVar.set(template, 'registerState', {
          isMined: true,
          transactionHash: result,
          ipfsHash: ipfsHash,
          ipfsHashHex: ipfsHashHex
        });
      });
    });
  },

  /**
  Lookup a hash on the WeiHash registery.

  @event (click #personaLookup)
  **/

  'click #personaLookup': function(event, template) {
    var addr = Helpers.cleanAscii($('#lookupPersonaAddress').val());

    objects.helpers.importPersona(addr, function(err, persona) {
      if (err)
        return TemplateVar.set(template, 'lookupState', {
          isError: true,
          error: err
        });

      return TemplateVar.set(template, 'lookupState', {
        isSuccess: true,
        persona: persona
      });
    });
  },
});
