# WeiFund

A decentralized, fully transparent, open source crowdfunding DApp built on Ethereum.

## <a name="installation"></a> Installation (Private-Chain)

1. Start an eth node open the `http://localhost:3000` in *mist*, *mix* or *alethzero* or run a CPP node as follows:

    ```
    $ eth -j -b // for a mining node: $ eth -j -b -f -n no -m yes
    ```

2. Clone this repo to `WeiFund` and run the DApp.
   
    ```
    $ git clone https://github.com/WeiFund/WeiFund/tree/meteor
    $ cd WeiFund/app
    $ meteor
    ```

3. Go to `http://localhost:3000/admin`

    Click "Deploy" and copy the address provided.

4. Edit `client/lib/weifundConfig.js`

    Change `WeiFund.address` to the new address provided.

5. Refresh and run WeiFund!
