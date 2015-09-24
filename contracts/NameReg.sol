//sol NameReg
// Simple global name registrar.
// @authors:
//   Gav Wood <g@ethdev.com>
import "service";
import "owned";

contract NameReg is service(1), owned {
  	event AddressRegistered(address indexed account);
  	event AddressDeregistered(address indexed account);
  	
	function register(bytes32 name) {
		// Don't allow the same name to be overwritten.
		if (toAddress[name] != address(0))
			return;
		// Unregister previous name if there was one.
		if (toName[msg.sender] != "")
			toAddress[toName[msg.sender]] = 0;
			
		toName[msg.sender] = name;
		toAddress[name] = msg.sender;
		AddressRegistered(msg.sender);
	}

	function unregister() {
		bytes32 n = toName[msg.sender];
		if (n == "")
			return;
		AddressDeregistered(toAddress[n]);
		toName[msg.sender] = "";
		toAddress[n] = address(0);
	}
	
	mapping (address => bytes32) public toName;
	mapping (bytes32 => address) public toAddress;
}  