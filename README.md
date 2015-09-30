# WeiFund

A decentralized, fully transparent, open source crowdfunding DApp built on Ethereum.

<img src="app/public/images/screen0.jpg" />

## <a name="alpha"></a> Hosted Alpha

Please connect this with your geth or cpp Ethereum client before running. The "/admin" page is the dApp management and deployment dashboard.

<a href="http://weifund.meteor.com">http://weifund.meteor.com</a>

## <a name="installation"></a> Installation

1. Clone this repo and run the dApp
   
    ```
    $ git clone https://github.com/WeiFund/WeiFund.git
    $ cd WeiFund/app
    $ meteor
    ```
    
2. Run a local <a href="https://github.com/ethereum/go-ethereum">geth</a> node:

    ```
    $ geth --rpc --rpcaddr="0.0.0.0" --verbosity=5 --maxpeers=0 --rpccorsdomain="http://localhost:3000" --genesis "test-genesis.json" --verbosity 5 --unlock=primary --mine
    ```

3. Go to `http://localhost:3000/admin`

4. Refresh and run WeiFund!


## <a name="meteoreth"></a> Run with <a href="https://github.com/SilentCicero/meteoreth">meteoreth</a>

```
$ cd WeiFund/app
$ meteoreth
```

## <a name="config"></a> Deployment & Testing

Once you have WeiFund running, you can deploy a WeiFund contract for testing by going to "/admin" and clicking the "Deploy" button. This will deploy WeiFund's core contract and save it's contract address in your browsers local storage. Then you can proceed to create a new campaign by either going to "/start" and filling out the new campaign fields or by clicking "Seed Content" in the "/admin" section.

Note, in the "/admin" section is a small accounts manager for selecting and viewing your available Ethereum accounts and balances. You can select an account to use for all transactions by clicking the account. It will be marked 'selected'.

## <a name="namereg"></a> NameReg

All name registry (NameReg) utilties are handled with a NameReg contract that links bytes32 names with address values. The NameReg system for WeiFund can be deployed in the "/admin" page by clicking "Deploy" underneath the NameReg Manager. Once deployed, the NameReg contract address will be saved in local storage. You can then proceed to register your name, by filling out a name and then clicking "Register". You may also lookup names and addresses as well as unregistering your name.

## <a name="staffpicks"></a> Staff Picks

The StaffPicks contract enables the WeiFund team to select crowdfunding campaigns as their pick for that week. You can manage the StaffPicks contract int he "/admin" section.

## <a name="token"></a> Token Builder

WeiFund, by default, comes with a basic token builder for building and deploying the WeiCoin token system with your campaign. The builder is available at "/token" and can be used to set and launch a WeiCoin. The address of that is returned after deployment is the address you should use as your "config address" for your WeiFund campaign.

## <a name="config"></a> Config Integration

WeiFund campaigns can be given a configuration ("config") address upon creation. This address allows the extension of campaigns to other contracts. The config contract will be called upon a new vote, campaign, payout or refund. Please refer to the WeiFund.sol contract for further details. Please note, if the config address is too an invalid or non-existent contract, critical contract features for your campaign can become non-assessable.

## <a name="mission"></a> Mission

WeiFund's central mission statement is: to further the development of decentralized crowdfunding technology and to make crowdfunding as free, open, secure and extendable as possible.

## <a name="milestones"></a> Milestones

###1. NameReg

NameReg contract integration for the management and use of usernames with WeiFund.

###2. Token Systems

A token templating and management system for deploying and operating a basic custom token in tandem with WeiFund campaigns.

###3. Revamp of Landing and Discovery Pages

This will include making WeiFund's landing page more interactive, with various recent, successful and up and coming campaigns listed on the landing page.

###4. Share/Embed Widgets

A share and embed widget set to integrate WeiFund campaigns into other DApps and web3 enabled websites.

###5. Whisper Integration

A review and communication system leveraging Ethereum's Whisper protocol, so that users and campaign operators can securely and reliably communicate with one another.


## <a name="license"></a> License

WeiFund is under the MIT License type.

Copyright (c) 2015 Nick Dodson. <http://nickdodson.com>
