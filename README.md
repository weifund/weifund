# WeiFund

A decentralized, fully transparent, open source crowdfunding DApp built on Ethereum.

<img src="/app/public/images/screen0.jpg" />

## <a name="frontend"></a> Front-End (Display-Only)
http://weifund.io/demo

## When Deployed
- You can start, donate to, discover, refund and track crowdfunding campaigns
- Link to campaigns via weifund/tracker/CAMPAIGN_ID
- Use image urls to be used on Discover interface as your campaign image
- Get payed out when campaign is finished or get refunded if campaign fails

## <a name="installation"></a> Installation

1. Clone this repo and run the DApp.
   
    ```
    $ git clone https://github.com/WeiFund/WeiFund.git
    $ cd WeiFund/app
    $ meteor
    ```
    
2. Start an eth node open `http://localhost:3000` in *mist*, *mix* or *alethzero* or run geth locally, as follows:

    ```
    $ geth --rpc --rpcaddr="localhost" --loglevel=5 --maxpeers=0 --rpccorsdomain="http://localhost:3000" --unlock=primary --mine
    ```

3. Go to `http://localhost:3000/admin`

    Click "Deploy" and copy the address provided

4. Edit `app/client/lib/weifundConfig.js`

    Change `WeiFund.address` to the new address provided

5. Refresh and run WeiFund!

## Current DApp Functionality Overview
All core features should be exposed through the UI and access the companion contract:
- Landing Page
- Link to a campaign via the URL
- Create a campaign
- Contribute to a campaign (donate)
- If sufficient funding received, payout to campaign recipient
- If expired, refund to contributors
- Display progress report of a campaign
- Find new campaigns to donate to (Discover)

## Solidity
- Original Crowdfunding contract based on Vitalik's example
- Modifications and additions are done by Nick Dodson (SC)

## TODO
- Add top-earners section on Discovery page
- Add config contract hooks to campaign (for token/share systems)
- Prebuilt one-click drag-and-drop token/share contract templates
- One-click progress embed widgets (for other dapps to integrate CF into their DApp's)
- Admin panel for campaign operators (to more closley moniter their campaign progress/communication)
- NameReg contract integration for usernames of campaign owners/donaters
- Share link on tracker page
- Token/share counter and name integration (so campaigns can display "10,000 MyCustomTokenName raised!")
- Toggle off/on campaign images feature for discovery (for browsing speed)
- Setup tokens/shares for fast deployment with EtherEx
- Whisper integration for campaign reviews/follow up (3,6,9 month timeframes feature, "How did we do?")
- Admin panel feature for Campaign operators to contact their contributers via Whisper

## Requirements
- MeteorJS (latest)
- Chrome (if using geth)
- cpp-ethereum (AlethZero or CLI) node by Gavin Wood or
- go-ethereum (Mist or geth) by Jeffrey Wilcke
