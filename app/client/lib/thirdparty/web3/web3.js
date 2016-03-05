// External Web3 Injection Support (MetaMask)
if (typeof window.web3 === 'undefined') {
	var web3 = new Web3();
} else {
	var web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider(window.web3.currentProvider));
	
	console.log('provider', new web3.providers.HttpProvider(window.web3.currentProvider));
}

// Set Web3
window.web3 = web3;