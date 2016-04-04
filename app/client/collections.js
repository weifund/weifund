// The WeiFund Categories
Categories = new Mongo.Collection('CategorieS2', {connection: null});
new PersistentMinimongo(Categories, 'WeiFund');

// The WeiFund Campaigns
Campaigns = new Mongo.Collection('campaigns', {connection: null});
new PersistentMinimongo(Campaigns, 'WeiFund');

// The WeiFund Contributions LocalStore
Contributions = new Mongo.Collection('contributions', {connection: null});
new PersistentMinimongo(Contributions, 'WeiFund');

// For Holding Account names
Personas = new Mongo.Collection('personas', {connection: null});
new PersistentMinimongo(Personas, 'WeiFund');

// For Holding Backup IPFS Data
Receipts = new Mongo.Collection('receipts', {connection: null});
new PersistentMinimongo(Receipts, 'WeiFund');

// For Holding Backup IPFS Data
IPFS_Backup = new Mongo.Collection('ipfs_backup', {connection: null});
new PersistentMinimongo(IPFS_Backup, 'WeiFund');