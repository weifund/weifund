
// Basic (local) collections
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

// The WeiFund Categories
Categories = new Mongo.Collection('categories', {connection: null});
WeiFund.CategoriesMinimongo(Categories);

// The WeiFund Campaigns
Campaigns = new Mongo.Collection('campaigns', {connection: null});
WeiFund.CampaignsMinimongo(Campaigns);
Campaigns.clear();