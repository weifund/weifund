// The WeiFund Categories
Categories = new Mongo.Collection('CategorieS', {connection: null});
new PersistentMinimongo(Categories);

// The WeiFund Campaigns
Campaigns = new Mongo.Collection('campaigns', {connection: null});
new PersistentMinimongo(Campaigns);

// The WeiFund Contributions LocalStore
Contributions = new Mongo.Collection('contributions', {connection: null});
new PersistentMinimongo(Contributions);

// For Holding Account names
Personas = new Mongo.Collection('personas', {connection: null});
new PersistentMinimongo(Personas);

// For Holding Backup IPFS Data
IPFS_Backup = new Mongo.Collection('ipfs_backup', {connection: null});
new PersistentMinimongo(IPFS_Backup);

// For Holding Backup IPFS Data
Receipts = new Mongo.Collection('receipts', {connection: null});
new PersistentMinimongo(Receipts);