# WeiFund

A decentralized, fully transparent, open source crowdfunding DApp built on Ethereum.

<img src="app/public/images/screen0.jpg" />

## <a name="hosted"></a> Portal

The WeiFund portal is intended to act as a bridge between web 2.0 and WeiFund. Currently, it is just a platform veiwer.

<a href="http://weifund-portal.meteor.com">weifund-portal.meteor.com</a>

## <a name="hosted"></a> Hosted Beta

The WeiFund client is currently hosted on IPFS (note, you must provide the IPFS and Ethereum API backend):

<a href="http://gateway.ipfs.io/ipfs/QmV6xQdwKB4woawdiVnj7EvdvBbhQQ1Ws4o9MxHaUejYT1">gateway.ipfs.io/ipfs/QmV6xQdwKB4woawdiVnj7EvdvBbhQQ1Ws4o9MxHaUejYT1</a>

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
    $ geth --rpc --rpccorsdomain="http://localhost:3000" --unlock=0 // hit `Enter` key after this
   ```

3. Setup and Run a local <a href="http://ipfs.io">IPFS</a> daemon:

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

5. Browse to `http://localhost:3000/` on Chrome or Firefox, run the setup and start crowdfunding!

## <a name="nometeor"></a> Run Without Meteor

You may also choose to run WeiFund without the Meteor framework/platform. You can do this by running a simple server for the WeiFund client. Here is an example using Python:

	$ cd WeiFund/dist
	$ python -m SimpleHTTPServer 3000

## <a name="nometeor"></a> Run Without HTTP Server

You may be able to run WeiFund without a server by simply opening the `/dist/index.html` file in a browser. However, it is not recommended as some client functionality may not work.

1. Goto `/dist/index.html`

2. Right click, and open in Chrome or Firefox

## <a name="lookup"></a> Lookup Utils

You can manually lookup campaign or contributor information by going to the admin page and using the lookup tools. For example, lookup a campaign by:

1. Going to the `/admin` page

2. Type the Campaign `ID` Number

3. Click `Lookup Campaign`

## <a name="deployment"></a> Deploy WeiFund, PersonaRegistry & WeiHash Locally

One you have WeiFund running, you can deploy the WeiFund and WeiHash contracts to your local blockchain.

1. Goto the `/admin` page

2. Click `Deploy WeiFund`

3. Click `Deploy WeiHash`

3. Click `Deploy Persona`

## <a name="deployment"></a> Contracts

#### WeiFund
The WeiFund.sol contract contains all the core essential buisiness logic of a crowdfunding platform.

#### WeiHash
The WeiHash.sol contract connects WeiFund campaigns securely to IPFS or other decentralized file storage systems. Hashes can only be registered for a campaign by the owner of the campaign.

#### WeiAccounts
The WeiAccounts.sol contract allows campaigns to have their own Ethereum account and identity. .This means all Ether that is sent to that account will be forwarded and contributed verifiably to the WeiFund campaign in question. The WeiAccounts system is essentially an account factory and registry, so all campaign account forwarding contracts are the same, and are securely registered.

#### WeiController
The WeiController.sol contract enables campaign operators to create a token dispersal mechanism that disperses Ethereum standard tokens to campaign contributors. Tokens are issued to the controller, and the controller is activated when campaign contributions are made, thus dispersing tokens to campaign contributors securely. Any remaining tokens held by the controller can be given back to the controller owner.

#### PersonaRegistry
The PersonaRegistry.sol is a prototype identity and reputation system contract that links things like IPFS hashes to Ethereum accounts to establish a very basic and unverified identity. The WeiFund platform uses this system for all account identity (i.e. names and pictures for Ethereum accounts).

<a href="https://github.com/ConsenSys/persona" target="_blank">More About Persona</a>
#### Standard_Token
The Standard_Token.sol contract enables campaign operators to create their own Ethereum standard token system. This could be used for equity shares and voting rights in decentralized governance systems such as BoardRoom.

<a href="https://github.com/ConsenSys/Tokens" target="_blank">More About Standard Tokens</a>

## <a name="client"></a> Client-Side Build

Install the meteor-build-client suite and run it in the Meteor app folder. This will build the meteor application down into three code files, and asset folders.

	$ [sudo] npm install -g meteor-build-client
	$ cd WeiFund/app
	$ meteor-build-client ../dist -p ""

Checkout <a href="https://github.com/frozeman/meteor-build-client">Meteor-Build-Client here</a>

## <a name="client"></a> Build Stand-Alone Release (.exe, .dmg, bin)

Build WeiFund into a Stand-alone application for your OS by using installing and using the Electrify packager. Note, this will package WeiFund into an electron wrapper for your OS (200 mb). The app will build to `WeiFund/standalone`.

	$ npm install -g electrify
	$ cd WeiFund/app && mkdir ../standalone
	$ electrify package -o ../standalone -- --version=1.0
	
Checkout <a href="https://github.com/arboleya/electrify">Electrify/Electron here</a>

## <a name="backup"></a> Campaign Data, IPFS Data, Data Loss and Recovery

The WeiFund core client uses IPFS for data storage. Sometimes, things go wrong and data is lost. To prevent this, all new campaigns you start have an immediate persistent local data backup made at multiple points of the campaign creation. In case of a bad transaction, or browser malfunction, this data is available in the /admin page under IPFS Data Recovery. Type "latest" and recover the latest campaign data backed up. Then follow the instructions for IPFS hash assignment to campaign data.

These mechanisms should not be relied on. 

## <a name="backup"></a> Clearing Locally Stored Data

All loaded campaign, contributor and persona data is locally stored in your browsers persistent local storage. Sometimes, data gets corrupted and you will want to clear all locally stored data. You can do this by going to "/admin" and then clearing the data by using the "Collecitons Manager". This will clear all locally stored data for WeiFund. 

## <a name="persona"></a> Persona Identity And Reputation Integration

The Persona Identity and reputation system is used to handle account identification for WeiFund. This includes things like account pictures and names. Persona also uses IPFS.

Checkout the <a href="https://github.com/ConsenSys/persona" target="_blank">Persona Identity and Reputation System here</a> 

## <a name="ipfs"></a> IPFS Integration

WeiFund uses IPFS to handle all non-blockchain/consensus campaign and contributor data. IPFS is a very new and experimental system. This means that sometimes campaign data may not appear properly.

Checkout the <a href="http://ipfs.io" target="_blank">IPFS file system here</a>

## <a name="ipfs"></a> IPFS Pitfalls/Issues

If you have successfully created a WeiFund campaign and the IPFS data has not shown up in the WeiFund portal or your own client, it may be because your IPFS hash has not been passed around enough to the various nodes on the IPFS network.

The best way to fix this, is to view your hash on your own gateway `http://your_local_node_address:8080/ipfs/your_ipfs_hash`, then view it on the main IPFS gateway, either `http://ipfs.io/ipfs/your_ipfs_hash` or `http://gateway.ipfs.io/ipfs/your_ipfs_hash`. This way your campaign's IPFS data can be retrieved, stored and spread in the swarm by others.

Note, all essential campaign information necessary for crowdfunding business logic is not stored with IPFS, so your campaign will be unaffected on the Ethereum/blockchain side of things.

## <a name="ipfs"></a> Notable Components

1. <a href="http://ethereum.org">Go-Ethereum</a> (decentralized consensus ecosystem)
2. <a href="http://ipfs.io">IPFS</a> (distributed file-storage platform)
3. <a href="http://meteor.com">MeteorJS</a> (application framework)
4. <a href="https://github.com/frozeman/meteor-build-client">Meteor-Build-Client</a> (build tool)
5. <a href="https://github.com/google/caja">Google's Caja Anti-XSS</a> (anti-xss injection tool)
6. <a href="http://getbootstrap.com/">Bootstrap</a> (visual framework)
7. <a href="http://electron.atom.io/">Electron</a> (stanalone application wrapper)
8. <a href="https://github.com/arboleya/electrify">Electrify</a> (electron packager for meteor apps)
9. <a href="https://medium.com/@ConsenSys/uport-the-wallet-is-the-new-browser-b133a83fe73#.12025ydq4">Persona</a> (identity and reputation system)

## <a name="license"></a> License

Copyright (c) 2015 Nick Dodson. <http://nickdodson.com>
