# CrowdFundrr
A decentralized, fully transparent, open-source crowdfunding DApp build on Ethereum.

<img src="/assets/img/screen0.jpg" />

### Front-End (For Display)
http://crowdfundrr.github.io/

### When Deployed
- You can start, donate to, discover, refund and track crowdfunding campaigns
- Link to campaigns via crowdfundrr/#/tracker/CAMPAIGN_ID
- Embed a link, upload an image on your website to be used on Discover interface
- Get payed out when campaign is finished, get refund if campaign fails

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

Then open up easydeploy.html for instructions/utilities on contract deployment & testing.

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
- Modifications and additions are done me SC

### TODO
- Deploy on POC 8 Testnet
- Share Link on Tracker Page
- Progress Tracker Embed Widget

Note, Crowdfundrr is presently undeployed on POC 8 Testnet but is tested on Mist/AlethZero.
<!--
### COMPLETED
- Mist Testing
- AlethZero Testing
- Clear campaign data when Campaign Complete or Expired
- If sufficient funding received, payout to campaign recipient
- Address Scroller (for easily selecting addresses)
- Payout/Goal Reach Front-End Complete
- Most Recent Campaigns
- Cleaned Up JS
- Display progress report of a campaign
- Date Picker Added
- Campaign/Discover Page Categorization
- URL/EMBED Code Generation (post Campaign Creation)
- JS Compaign Tracker Days, Convert to ETH denominations
- Discover Page
- New Campaign ID, url and meta tag return
- Display progress report of a campaign
- Contribute to a campaign (donate)
- Landing Page
- Link to a campaign via the URL
- Added User numCampaigns and campaigns data
- Search Campaign
- Create New Campaign JS->Solidity
- Connect HTML/JS front-end to BC
- Develop contract to fit contract functionality in Solidity
- Build bootstrap front-end
- Branding/Name Logo-->

### FUTURE TODO
- iframe portal for each campaign
- better badge for EMBED
- Perhaps rebuild into AngularJS APP
- Clean up UI for tracker/New Campaign
- Hookup to a Central Name Registry Contract
