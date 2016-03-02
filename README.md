# WeiFund

A decentralized, fully transparent, open source crowdfunding DApp built on Ethereum.

<img src="app/public/images/screen0.jpg" />

## <a name="hosted"></a> Hosted Beta

The WeiFund dApp client is currently hosted on IPFS (note, you must provide the IPFS and Ethereum backend to run this client):

<a href="http://gateway.ipfs.io/ipfs/QmRT15QjeaFHA5BqDCuZq9oSudX1vSW4LDerrCYQdjXpYZ/">http://gateway.ipfs.io/ipfs/QmRT15QjeaFHA5BqDCuZq9oSudX1vSW4LDerrCYQdjXpYZ/</a>

## <a name="installation"></a> Installation

1. Install Curl, Git, Meteor, Go-Ethereun and IPFS 4.0+ (download and extract <a href="https://ipfs.io/docs/install/">IPFS binary here</a>)

   ```
	$ sudo apt-get install curl git geth // install curl, git and geth
	$ curl https://install.meteor.com/ | sh // meteor install
	$ cd go-ipfs && sudo sh install.sh // install ipfs
   ```
    
2. Setup an Ethereum account and Run a local <a href="https://github.com/ethereum/go-ethereum">geth</a> node:

   ```
	$ geth account new
    $ geth --rpc --rpccorsdomain="http://localhost:3000" --unlock=0
   ```

3. Setup and Run a local IPFS daemon:

   ```
	$ ipfs init
	$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000"]'
   	$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
   	$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
	$ ipfs daemon
   ```
	
4. Clone this repo and run the dApp
   
   ```
    $ git clone https://github.com/WeiFund/WeiFund && cd WeiFund/app
    $ meteor
   ```

5. Browse to `http://localhost:3000/` on Chrome or Firefox

## <a name="nometeor"></a> Run Without Meteor

You may also choose to run WeiFund without the Meteor framework/platform. You can do this by running a simple server for the WeiFund client. Here is an example using Python:

	$ cd WeiFund/dist
	$ python -m SimpleHTTPServer 3000

## <a name="lookup"></a> Lookup Utils

You can manually lookup campaign or contributor information by going to the admin page and using the lookup tools. For example, lookup a campaign by:

1. Going to the `/admin` page

2. Type the Campaign `ID` Number

3. Click `Lookup Campaign`

## <a name="deployment"></a> Deploy WeiFund & WeiHash Locally

One you have WeiFund running, you can deploy the WeiFund and WeiHash contracts to your local blockchain.

1. Goto the `/admin` page

2. Click `Deploy WeiFund`

3. Click `Deploy WeiHash`

## <a name="deployment"></a> Contracts

#### WeiFund
The WeiFund.sol contract contains all the core essential buisness logic of a crowdfunding platform.

#### WeiHash
The WeiHash.sol contract connects WeiFund campaigns securly to IPFS or other decentralized file storage systems. Hashes can only be registered for a campaign by the owner of the campaign.

#### WeiAccounts
The WeiAccounts.sol contract allows campaigns to have their own Ethereum account and identity. .This means all Ether that is sent to that account will be forwarded and contributed verifiably to the WeiFund campaign in question. The WeiAccounts system is essentially an account factory and registry, so all campaign account forwarding contracts are the same, and are securely registered.

#### WeiController
The WeiController.sol contract enables campaign operators to create a token dispersal mechanism that disperses Ethereum standard tokens to campaign contributors.

#### Standard_Token
The Standard_Token.sol contract enables campaign operatores to create their own Ethereum standard token system. This could be used for equity shares and voting rights in decentralized governance systems such as BoardRoom.

## <a name="client"></a> Client-Side Build

Install the meteor-build-client suite and run it in the Meteor app folder. This will build the meteor application down into three code files, and asset folders.

	$ [sudo] npm install -g meteor-build-client
	$ cd WeiFund/app
	$ meteor-build-client ../dist

Checkout <a href="https://github.com/frozeman/meteor-build-client">Meteor-Build-Client here</a>

## <a name="client"></a> Build Stand-Alone Release (.exe, .dmg, bin)

Build WeiFund into a Stand-alone application for your OS by using installing and using the Electrify packager. Note, this will package WeiFund into an electron wrapper for your OS (200 mb). The app will build to `WeiFund/standalone`.

	$ npm install -g electrify
	$ cd WeiFund/app && mkdir ../standalone
	$ electrify package -o ../standalone -- --version=1.0
	
Checkout <a href="https://github.com/arboleya/electrify">Electrify/Electron here</a>

## <a name="ipfs"></a> Persona Identity And Reputation Integration

The Persona Identity and reputation system is used to handle account identification for WeiFund. This includes things like account pictures and names. Persona also uses IPFS.

Checkout the <a href="https://github.com/ConsenSys/persona" target="_blank">Persona Identity and Reputation System here</a> 

## <a name="ipfs"></a> IPFS Integration

WeiFund uses IPFS to handle all non-blockchain/consensus campaign and contributor data. IPFS is a very new and experimental system. This means that sometimes camapign data may not appear properly.

Checkout the <a href="http://ipfs.io" target="_blank">IPFS file system here</a>

## <a name="ipfs"></a> Notable Components

1. Go-Ethereum (decentralized consensus ecosystem)
2. IPFS (distributed file-storage platform)
3. MeteorJS (application framework)
4. Meteor-Build-Client (build tool)
5. Google's Caja Anti-XSS (anti-xss injection tool)
6. Bootstrap (visual framework)
7. Electron (stanalone application wrapper)
8. Electrify (electron packager for meteor apps)
9. Persona (identity and reputation system)

## <a name="license"></a> License

Copyright (c) 2015 Nick Dodson. <http://nickdodson.com>
