# CrowdFundrr
A decentralized, fully transparent, open-source crowd funding DApp build on Ethereum.

# Front-End
http://crowdfundrr.github.io/

# Components
- jQuery v2.1.1
- Bootstrap v3.3.2 
- bignumber.js v2.0.0
- ethereum.js
- bootstrap-datepicker.js

# Contract/DApp Functionality
All core features should be exposed through the UI and access the companion contract:
- Landing Page
- Link to a campaign via the URL
- Create a campaign
- Contribute to a campaign (donate)
- If sufficient funding received, payout to campaign recipient
- If expired, refund to contributors
- Display progress report of a campaign
- Find new campaings to donate to (Discover)

# Solidity
- Original contract based on Chriseth's Crowd Funding example
- Modifications and additions are done me SC

# TODO
- Deploy on POC 8 Testnet
- Flavicon
- Form Clean Up (value trimming)
- Better Comments
- Fix Date Picker Bug
- Share Link on Tracker Page

# COMPLETED
- Mist Testing
- AlethZero Testing
- Clear Campaing data when Campaign Complete or Expired
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
- Branding/Name Logo

# FUTURE TODO
- iframe portal for each campaign
- better badge for EMBED
- Clean up UI for tracker/New Campaign
- Hookup to a Central Name Registry Contract
