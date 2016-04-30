Template['components_setup'].rendered = function() {
  var template = this;
};

Template['components_setup'].helpers({
  'rpcProvider': function() {
    return LocalStore.get('rpcProvider');
  },
  'ipfsProvider': function() {
    return LocalStore.get('ipfsProvider').host + ':' + LocalStore.get('ipfsProvider').port;
  },
  'load': function() {
    var ethereumProvider = LocalStore.get('rpcProvider'),
      ipfsProvider = LocalStore.get('ipfsProvider'),
      ethereumProviderState = {},
      ipfsProviderState = {};

    if (ethereumProvider === 'metamask')
      ethereumProviderState.isMetamask = true;

    if (ethereumProvider === 'etherscan')
      ethereumProviderState.isEtherscan = true;

    if (ethereumProvider !== 'metamask' || ethereumProvider !== 'etherscan')
      ethereumProvider.isHTTP = true;

    console.log(ipfsProvider);

    if (ipfsProvider.host === '159.203.69.164')
      ipfsProviderState.isWeifund = true;

    if (ipfsProvider.host !== '159.203.69.164')
      ipfsProviderState.isHTTP = true;

    console.log(ipfsProviderState);

    TemplateVar.set('ethereumProviderState', ethereumProviderState);
    TemplateVar.set('ipfsProviderState', ipfsProviderState);
  }
});

var setEthereumProvider = function(ethereumProvider) {
  ethereumProvider = ethereumProvider.trim();

  // add http
  if (ethereumProvider.indexOf('http://') === -1 && ethereumProvider != 'etherscan' && ethereumProvider != 'metamask')
    ethereumProvider = 'http://' + ethereumProvider;

  // Metamask Support
  if (ethereumProvider != 'metamask')
    web3.setProvider(new web3.providers.HttpProvider(ethereumProvider));

  // Etherscan Support
  if (ethereumProvider === 'etherscan')
    web3.setProvider(new EtherscanProvider({
      network: 'testnet'
    }));

  // MetaMask Provider
  if (ethereumProvider === 'metamask' && window.MetaMaskProvider)
    web3.setProvider(window.MetaMaskProvider);

  // Store provider locally
  LocalStore.set('rpcProvider', ethereumProvider);
};

var setIPFSProvider = function(ipfsProvider) {
  if (ipfsProvider === 'weifund')
    ipfsProvider = '159.203.69.164:5001';

  var ipfsProviderData = ipfsProvider.replace("http://", "").replace("https://", "").split(":");
  var ipfsProviderHost = ipfsProviderData[0],
    ipfsProviderPort = ipfsProviderData[1];
  var ipfsProviderObject = {
    host: ipfsProviderHost,
    port: ipfsProviderPort
  };

  console.log(ipfsProviderObject);

  // set provider
  try {
    // set provider
    ipfs.setProvider(ipfsProviderObject);

    // set local store
    LocalStore.set('ipfsProvider', ipfsProviderObject);

    // connect to WeiFund node
    //try {ipfs.api.swarm.connect("/ip4/159.203.69.164/tcp/4001/ipfs/QmQaYRZbWMziMfpjZiNwK1dtnSngxrJGJ2RR62csp9g5qb", function(err, result){
    //	console.log(err, result);
    //});}catch(err, result){}
  } catch (E) {}
};

Template['components_setup'].events({
  /**
  Deploy the price feed, used for setup of contract.

  @event (click #setupClient)
  **/

  'click .blur': function(event, template) {
    TemplateVar.set(template, 'setup', true);

    // Reroute if on setup
    if (!_.isUndefined(Router.current().route) && Router.current().route._path == '/setup')
      Router.go('/');
  },

  'click #useMetamask': function(event, template) {
    TemplateVar.set(template, 'ethereumProviderState', {
      isMetamask: true,
    });

    // set etheruem provider
    setEthereumProvider('metamask');

    // get accounts and set one if available
    web3.eth.getAccounts(function(err, accounts) {
      if (!err && accounts.length > 0) {
        if (accounts[0] == web3.address(0) || accounts[0] == "0x" || accounts[0] == '')
          TemplateVar.set(template, "ethereumProviderMessage", {
            unlockMetamask: true
          });

        $('#ethereumAccount').val(accounts[0]);
      } else {
        TemplateVar.set(template, "ethereumProviderMessage", {
          unlockMetamask: true
        });
      }
    });
  },

  'click #useHTTPProvider': function(event, template) {
    TemplateVar.set(template, "ethereumProviderMessage", {});

    TemplateVar.set(template, 'ethereumProviderState', {
      isHTTP: true
    });
  },

  'click #useEtherscan': function(event, template) {
    TemplateVar.set(template, "ethereumProviderMessage", {});

    TemplateVar.set(template, 'ethereumProviderState', {
      isEtherscan: true
    });

    // set etheruem provider
    setEthereumProvider('etherscan');

    // get accounts and set one if available
    web3.eth.getAccounts(function(err, accounts) {
      if (!err && accounts.length > 0) {
        $('#ethereumAccount').val(accounts[0]);
      } else {
        TemplateVar.set(template, "ethereumProviderMessage", {
          error: String(err)
        });
      }
    });
  },

  'click #useIPFSWeifund': function(event, template) {
    TemplateVar.set(template, 'ipfsProviderState', {
      isWeifund: true
    });
  },

  'click #useIPFSHTTP': function(event, template) {
    TemplateVar.set(template, 'ipfsProviderState', {
      isHTTP: true
    });
  },

  /**
  Deploy the price feed, used for setup of contract.

  @event (click #setupClient)
  **/

  'change #ethereumProvider': function() {
    var ethereumProvider = Helpers.cleanAscii($('#ethereumProvider').val());

    // set etheruem provider
    setEthereumProvider(ethereumProvider);

    // get accounts and set one if available
    web3.eth.getAccounts(function(err, accounts) {
      if (!err && accounts.length > 0)
        $('#ethereumAccount').val(accounts[0]);
    });
  },

  /**
  Deploy the price feed, used for setup of contract.

  @event (click #setupClient)
  **/

  'click #setupClient': function(event, template) {
    try {
      var ethereumProvider = Helpers.cleanAscii($('#ethereumProvider').val()),
        ipfsProvider = Helpers.cleanAscii($('#ipfsProvider').val()),
        selectedAccount = Helpers.cleanAscii($('#ethereumAccount').val()),
        testIPFSHash = 'QmekvvCfcQg3LXXtUGeGy3kU4jGwg82txuZtVNRE8BvY9W';

      // Set state
      TemplateVar.set(template, 'state', {
        isTesting: true,
        testing: 'Ethereum Provider'
      });

      // Set Ethereum Provider
      setEthereumProvider(ethereumProvider);

      // Get Ethereum Accounts
      web3.eth.getAccounts(function(err, accounts) {
        if (err)
          return TemplateVar.set(template, 'state', {
            isError: true,
            error: 'Ethereum Provider: ' + err
          });

        // Check if there are accounts
        if (accounts.length < 0)
          return TemplateVar.set(template, 'state', {
            isError: true,
            error: 'Your Ethereum provider must have accounts'
          });

        if (selectedAccount == "" && accounts.length > 1)
          selectedAccount = accounts[0];

        // set state
        TemplateVar.set(template, 'state', {
          isTesting: true
        });

        // try IPFS cat
        try {
          // testing ipfs
          TemplateVar.set(template, 'state', {
            isTesting: true,
            testing: 'IPFS Provider'
          });

          // set IPFS provider
          setIPFSProvider(ipfsProvider);

          // Testing is Success
          TemplateVar.set(template, 'state', {
            isSuccess: true
          });
          LocalStore.set('setup', true);

          // Set Default Account
          Session.set('defaultAccount', selectedAccount);
          LocalStore.set('defaultAccount', selectedAccount);

          // Shutdown Setup WIndow
          TemplateVar.set(template, 'setup', true);

          // Reroute if on setup
          if (!_.isUndefined(Router.current().route) && Router.current().route._path == '/setup')
            Router.go('/discover');
        } catch (err) {
          return TemplateVar.set(template, 'state', {
            isError: true,
            error: err
          });
        }
      });
    } catch (err) {
      return TemplateVar.set(template, 'state', {
        isError: true,
        error: err
      });
    }
  }
});
