# WeiFund

A decentralized, fully transparent, open source crowdfunding DApp built on Ethereum.

<img src="app/public/images/screen0.jpg" />

## <a name="alpha"></a> Hosted Alpha

Please connect this with your geth or cpp Ethereum client before running. The "/admin" page is the dApp management and deployment dashboard.

<a href="http://weifund.meteor.com">http://weifund.meteor.com</a>

## <a name="installation"></a> Installation

1. Clone this repo and run the DApp.
   
    ```
    $ git clone https://github.com/WeiFund/WeiFund.git
    $ cd WeiFund/app
    $ meteor
    ```
    
2. Start an eth node open `http://localhost:3000` in *mist*, *mix* or *alethzero* or run geth locally, as follows:

    ```
    $ geth --rpc --rpcaddr="0.0.0.0" --verbosity=5 --maxpeers=0 --rpccorsdomain="http://localhost:3000" --genesis "test-genesis.json" --verbosity 5 --unlock=primary --mine
    ```
    
2. Or run with <a href="https://github.com/SilentCicero/meteoreth">meteoreth</a>:

    $ meteoreth

3. Go to `http://localhost:3000/admin`

4. Make sure your selected account has ether and click "Deploy"

5. Refresh and run WeiFund!


## <a name="config"></a> Config Integration

WeiFund campaigns can be given a configuration ("config") address upon creation. This address allows the extension of campaigns to other contracts. The config contract will be called upon a new vote, campaign, payout or refund. Please refer to the WeiFund.sol contract for further details. Please note, if the config address is too an invalid or non-existent contract, critical contract features for your campaign can become non-assessable.


## <a name="mission"></a> Mission

WeiFund's central mission statement is: to further the development of decentralized crowdfunding technology and to make crowdfunding as free, open, secure and extendable as possible.


## <a name="milestones"></a> Milestones

###1. NameReg

Complete NameReg contract integration for the management and use of usernames with WeiFund.

###2. Token Systems

A complete token system templating and management system for deploying and operating a basic custom token in tandem with WeiFund campaigns.

###3. Revamp of Landing and Discovery Pages

This will include making WeiFund's landing page more interactive, with various recent, successful and up and coming campaigns listed on the landing page.

###4. Share/Embed Widgets

A complete share and embed widget set to integrate WeiFund campaigns into other DApps and web3 enabled websites.

###5. Whisper Integration

A complete review and communication system leveraging Ethereum's Whisper protocol, so that users and campaign operators can securely and reliably communicate with one another.


## <a name="license"></a> License

WeiFund is under the MIT License type.

Copyright (c) 2015 Nick Dodson. <http://nickdodson.com>