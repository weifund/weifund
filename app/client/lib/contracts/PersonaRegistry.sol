contract PersonaRegistry {
	uint public version;
	address public previousPublishedVersion;

	mapping(address => bytes) public ipfsAttributeLookup;

	function PersonaRegistry(address _previousPublishedVersion) {
		version = 1;
		previousPublishedVersion = _previousPublishedVersion;
	}

	function setPersonaAttributes(bytes ipfsHash) {
		ipfsAttributeLookup[msg.sender] = ipfsHash;
	}

	function getPersonaAttributes(address personaAddress) constant returns(bytes) {
		return ipfsAttributeLookup[personaAddress];
	}
}