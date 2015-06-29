// The WeiFund Categories
Categories = new Mongo.Collection('categories', {connection: null});
new PersistentMinimongo(Categories);
new WeiFund.CategoriesMinimongo(Categories);

// The WeiFund Campaigns
Campaigns = new Mongo.Collection('campaigns', {connection: null});
new PersistentMinimongo(Campaigns);
new WeiFund.CampaignsMinimongo(Campaigns);

// Available Web3 Accounts
Accounts = new Mongo.Collection('accounts', {connection: null});
web3.AccountsMinimongo(Accounts);