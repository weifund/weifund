# CrowdFundrr
A decentralized, fully transparent, open-source crowdfunding DApp built on Ethereum.

<img src="/assets/img/screen0.jpg" />

### Front-End
http://crowdfundrr.github.io/

** Please note that the project is under heavy development, and a MeteorJS build is in the works. Some of the JS  is outdated and must be updated for POC9.

### When Deployed
- You can start, donate to, discover, refund and track crowdfunding campaigns
- Link to campaigns via crowdfundrr/#/tracker/CAMPAIGN_ID
- Embed a link, upload an image on your website to be used on Discover interface
- Get payed out when campaign is finished and get refunded if campaign fails

### Components
- Angular v1.3.13
- jQuery v2.1.1
- Bootstrap v3.3.2 
- underscore v~1.7.0	
- bignumber.js v2.0.0
- ethereum.js
- bootstrap-datepicker.js

### Requirements
- cpp-ethereum node by Gavin Wood or
- go-ethereum browser by Jeffrey Wilcke
- nodejs, npm, bower

### Installation

Start by cloning this repository.

```
git clone https://github.com/crowdfundrr/crowdfundrr.git
```

Then bower install the components

```
cd crowdfundrr
bower install
```

Then open up "<b>easydeploy.html</b>" in Chrome for instructions and utilities on deployment.

### Contract/DApp Functionality
All core features should be exposed through the UI and access the companion contract:
- Landing Page
- Link to a campaign via the URL
- Create a campaign
- Contribute to a campaign (donate)
- If sufficient funding received, payout to campaign recipient
- If expired, refund to contributors
- Display progress report of a campaign
- Find new campaigns to donate to (Discover)

### Solidity
- Original contract based on Chriseth's Crowdfunding example
- Modifications and additions are done by Nick Dodson (SC)

### TODO
- digital shares option to turn donations into tradable assets
- share link on tracker page
- progress tracker embed widget
- connect to NameReg contract for readable user names
- more complete progress embed widget
- extend campaign capibility
- dontation widget (for ethereum browser)
- reward entitlements

Note, Crowdfundrr is presently undeployed on the Testnet but has been tested on AlethZero/Go Ethereum CLI.


... because presently, two rr's is better.
