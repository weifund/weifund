if (Meteor.isClient) {
    
    var accounts = web3.eth.accounts;
    console.log(accounts);
    
    // Deploy WeiFund
    //var address = WeiFund.deploy();
    //console.log('WeiFund Deployed Too:', address);
    
    // Is Value Tests
    /*var isValueTest = ["nick", 0, -1, -10, false, true, 10, 20, 98340958349083980, new BigNumber("1000")];    
    _.each(isValueTest, function(value, key){
        console.log(value, '= value', WeiFund.isValue(value));
    });*/
    
    // Is Timestamp Tests
    /*var isTimestampTest = ["nick", 0, -1, -10, false, true, 10, 20, 98340958349083980];
    _.each(isTimestampTest, function(value, key){
        console.log(value, '= timestamp', WeiFund.isTimestamp(value));
    });*/
    
    // Is Big Number Tests
    /*var isTimestampTest = ["nick", 0, -1, -10, false, true, 10, 20, 98340958349083980, new BigNumber("1000")];
    _.each(isTimestampTest, function(value, key){
        console.log(value, '= bignumber', web3.isBigNumber(value));
    });*/
    
    //console.log(web3.isBigNumber(new BigNumber("10000")));
    
    // Is Category Tests
    /*var isCatgoryTest = [-1, false, "nick", 3, 9, 0];
    _.each(isCatgoryTest, function(value, key){
        console.log(value, '= category', WeiFund.isCategory(value));
    });*/
    
    // Test Bad newCampaign Data.
    /*var time = parseInt(moment().unix());
    var newCampaignTest = [
        [55, "http://nicks.com", accounts[0], 4500, time + 3600*24, 3],
        ["Ni", "http://nicks.com", "jksdfjksdf", 4500, time + 3600*24, 3],
        ["Nick", "k.c", "jksdfjksdf", 4500, time + 3600*24, 3],
        ["Nick", 2904, accounts[0], 4500, time + 3600*24, 3],
        ["Nick", "http://nicks.com", "jksdfjksdf", 4500, time + 3600*24, 3],
        ["Nick", "http://nicks.com", "jksdfjksdf", 4500, time + 3600*24, 3],
        ["Nick", "http://nicks.com", accounts[0], false, time + 3600*24, 3],
        ["Nick", "http://nicks.com", accounts[0], 4500, -837875, 3], 
        ["Nick", "http://nicks.com", accounts[0], 4500, time + 3600*24, false],
        ["Nick", "http://nicks.com", accounts[0], 4500, time, 4],
        ["klsjdflkjsdfkljsdfkljsdflkjsdfkljsd", "http://nicks.com", accounts[0], 4500, time, 4],
        ["klsjdflkjsdfkljsdfkljsdflkjsdfkljsdklsjdflkjsdfkljsdfkljsdflkjsdfkljsd", "http://klsjdflkjsdfkljsdfkljsdflkjsdfkljsdklsjdflkjsdfkljsdfkljsdflkjsdfkljsd.com", accounts[0], 4500, time, 4], 
        ["sdfsfd", "http://klsdfkljsd.com", accounts[0], 4500, time, -1],
        ["Nicks Good Campaign", "http://nickscamp.com", accounts[0], 45000000000000, time + 3600*24, 4],
    ];
    _.each(newCampaignTest, function(value, key){
        var n = WeiFund.newCampaign(value[0], value[1], value[2], value[3], value[4], value[5]);
        console.log(value, '= campaign', n);
    });*/
    
    // Number of Campaigns
    var numCampaigns = WeiFund.numCampaigns();
    console.log('Number of Campaigns:', numCampaigns);
    
    // Is Campaign Test
    /*var numCampaigns = WeiFund.numCampaigns();
    console.log('Number of Campaigns: ', numCampaigns);
    var isCampaignTest = [-1, false, "nick", 9298, 0, 1, 5];
    _.each(isCampaignTest, function(value, key){
        var isCampaign = WeiFund.isCampaign(value);
        console.log(value, '= campaign id', isCampaign);
    });*/
    
    //var time = moment().unix();
    
    // Get Campaign Object
    //var campaign = WeiFund.campaign(1);
    //console.log('Get Campaign 1:', campaign);
    
    // Start Multiple New Campaigns with valid data
    var time = moment().unix();
    var newCampaigns = [
        ["Nicks Good Campaign", "http://nickscamp.com", accounts[0], 45000, time + 3600*24, 4],
        ["Johns Camp", "http://johnscamp.com", accounts[0], 85300094800000, time + 3600*24*30, 3],
        ["dfg Camp", "http://dfgdfg.com", accounts[0], 85300094800000, time + 3600*24*23, 3],
        ["New Crypto Camp", "http://sdf.com", accounts[0], 349889738734, time + 3600*24*30, 3],
        ["Johns Camp", "http://johnscamp.com", accounts[0], 9000000000489, time + 3600*24*80, 3],
        ["Jannies New Camp", "http://janniesnewcamp.com", accounts[0], 85300094800000, time + 3600*24*900, 3],
        ["Fannies Camp", "http://fanniesnewcamp.com", accounts[0], 85300094800000, time + 3344*24*30, 7],
        ["Buisness Campaign", "http://buisnenesscamp.com", accounts[0], 900000, time + 3344*24*11, 0],
        ["Buisness Campaign", "http://buisnenesscamp.com", accounts[0], 900000, time + 3344*24*11, 0],
        ["My Friends Campaign", "http://myfriendcamp.com", accounts[0], 248923878923, time + 3600*64*80, 1],
        ["A New Campaign", "http://anewcamp.com", accounts[0], 85300224800000, time + 3600*14*900, 5],
        ["Working Party", "http://wroking.com", accounts[0], 343333, time + 3344*74*30, 2],
        ["Frost Days Festival", "http://frostdays.com", accounts[0], 749300, time + 3344*14*11, 5],
        ["Cant wait fest.", "http://cant wait fest.com", accounts[0], 23965444, time + 3344*44*11, 2],
    ];
    _.each(newCampaigns, function(value, key){
        //var n = WeiFund.newCampaign(value[0], value[1], value[2], value[3], value[4], value[5]);
        //console.log(value, ' new camp:', n);
    });
    
    // Get Multiple Campaigns.
    //var campaigns = WeiFund.campaigns(false, 8, 0);
    //console.log(campaigns);
    
    // WeiFund Get 
    
}