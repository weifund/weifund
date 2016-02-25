// The WeiFund Categories
Categories = new Mongo.Collection('CategorieS', {connection: null});
new PersistentMinimongo(Categories);

// The WeiFund Campaigns
Campaigns = new Mongo.Collection('campaigns', {connection: null});
new PersistentMinimongo(Campaigns);

// The WeiFund Campaigns
Contributors = new Mongo.Collection('contributors', {connection: null});
new PersistentMinimongo(Contributors);

// For Holding Account names
Personas = new Mongo.Collection('personas', {connection: null});
new PersistentMinimongo(Personas);

// For Holding Backup IPFS Data
IPFS_Backup = new Mongo.Collection('ipfs_backup', {connection: null});
new PersistentMinimongo(IPFS_Backup);