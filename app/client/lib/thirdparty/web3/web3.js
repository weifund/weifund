window.MetaMaskProvider = null;

// External Web3 Injection Support (MetaMask)
if (typeof window.web3 === 'undefined') {
	var web3 = new Web3();
} else {
	var web3 = new Web3();
	  window.MetaMaskProvider = window.web3.currentProvider;
    web3.setProvider(window.web3.currentProvider);
}

// Set Web3
window.web3 = web3;
