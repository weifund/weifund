# WeiFund

A decentralized, fully transparent, open source crowdfunding DApp built on Ethereum.

<img src="app/public/images/screen0.jpg" />

## <a name="alpha"></a> Hosted Alpha

Please connect this with your geth or cpp Ethereum client before running. The "/admin" page is the dApp management and deployment dashboard.

<a href="http://weifund.meteor.com">http://weifund.meteor.com</a>

## <a name="installation"></a> Installation

0. Install Meteor, Go-Ethereun and IPFS 4.0+ (download <a href="https://ipfs.io/docs/install/">IPFS binary here</a>)

	```
	$ curl https://install.meteor.com/ | sh // meteor install
	$ bash <(curl https://install-geth.ethereum.org -L) // install go-ethereum
	$ cd ipfs_binary_dir && sudo sh install.sh // install ipfs
	```

1. Clone this repo and run the dApp
   
    ```
    $ git clone https://github.com/WeiFund/WeiFund && cd WeiFund/app
    $ meteor
    ```
    
2. Setup an Ethereum account and Run a local <a href="https://github.com/ethereum/go-ethereum">geth</a> node:

    ```
	$ geth account new
    $ geth --rpc --rpccorsdomain="http://localhost:3000" --unlock=primary
    ```

3. Setup and Run a local IPFS daemon:

	```
	$ ipfs init
	$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000"]'
   	$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
   	$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
	$ ipfs daemon
	```

4. Browse to `http://localhost:3000/` on Chrome or Firefox

## <a name="nometeor"></a> Run Without Meteor

You may also choose to run WeiFund without the Meteor framework/platform. You can do this by running a simple server for the WeiFund client. Here is an example using Python:

	```
	$ cd WeiFund/dist
	$ python -m SimpleHTTPServer 3000
	```

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

## <a name="client"></a> Client-Side Build

Install the meteor-build-client suite and run it in the Meteor app folder. This will build the meteor application down into three code files, and asset folders.

	```
	$ [sudo] npm install -g meteor-build-client
	$ cd WeiFund/app
	$ meteor-build-client ../dist
	```

Checkout Meteor-Build-Client here: https://github.com/frozeman/meteor-build-client

## <a name="client"></a> Build Stand-Alone Release (.exe, .dmg, bin)

Build WeiFund into a Stand-alone application for your OS by using installing and using the Electrify packager. Note, this will package WeiFund into an electron wrapper for your OS (200 mb). The app will build to `WeiFund/standalone`.

	```
	$ npm install -g electrify
	$ cd WeiFund/app && mkdir ../standalone
	$ electrify package -o ../standalone -- --version=1.0
	```
	
Checkout more about Electrify/Electron here: https://github.com/arboleya/electrify

## <a name="ipfs"></a> IPFS Integration

WeiFund uses IPFS to handle all non-blockchain/consensus campaign and contributor data. IPFS is a very new and experimental system. This means that sometimes camapign data may not appear properly.

Checkout the IPFS file system here: http://ipfs.io

## <a name="ipfs"></a> Notable Components

1. Go-Ethereum (decentralized consensus ecosystem)
2. IPFS (distributed file-storage platform)
3. MeteorJS (application framework)
4. Meteor-Build-Client (build tool)
5. Google's Caja Anti-XSS (anti-xss injection tool)
6. Bootstrap (visual framework)
7. Electron (stanalone application wrapper)
8. Electrify (electron packager for meteor apps)

## <a name="license"></a> License

Copyright (c) 2015 Nick Dodson. <http://nickdodson.com>
