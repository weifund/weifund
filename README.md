# WeiFund

A decentralized, fully transparent, open source crowdfunding DApp built on Ethereum.

## <a name="installation"></a> Installation

1. Clone this repo and run the DApp.
   
    ```
    $ git clone -b meteor https://github.com/WeiFund/WeiFund.git
    $ cd WeiFund/app
    $ meteor
    ```
    
2. Start an eth node open `http://localhost:3000` in *mist*, *mix* or *alethzero* or run GEth locally as follows:

    ```
    $ geth --rpc --rpcaddr="YOUR_GETH_NODE_IP" --loglevel=5 --maxpeers=0 --rpccorsdomain="http://YOUR_METEOR_SERVER_IP:3000" --unlock=YOUR_MAIN_ACCOUNT_ADDR --mine
    ```

3. Go to `http://localhost:3000/admin`

    Click "Deploy" and copy the address provided

4. Edit `app/client/lib/weifundConfig.js`

    Change `WeiFund.address` to the new address provided

5. Refresh and run WeiFund!
