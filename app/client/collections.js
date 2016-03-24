import { Mongo } from 'meteor/mongo';
import { PersistentMinimongo } from 'meteor/frozeman:persistent-minimongo';

// The WeiFund Categories
const Categories = new Mongo.Collection('CategorieS', {connection: null});
new PersistentMinimongo(Categories);

// The WeiFund Campaigns
const Campaigns = new Mongo.Collection('campaigns', {connection: null});
new PersistentMinimongo(Campaigns);

// The WeiFund Contributions LocalStore
const Contributions = new Mongo.Collection('contributions', {connection: null});
new PersistentMinimongo(Contributions);

// For Holding Account names
const Personas = new Mongo.Collection('personas', {connection: null});
new PersistentMinimongo(Personas);

// For Holding Backup IPFS Data
const IPFS_Backup = new Mongo.Collection('ipfs_backup', {connection: null});
new PersistentMinimongo(IPFS_Backup);

// For Holding Backup IPFS Data
const Receipts = new Mongo.Collection('receipts', {connection: null});
new PersistentMinimongo(Receipts);

export {Categories as Categories};
export {Campaigns as Campaigns};
export {Contributions as Contributions};
export {Personas as Personas};
export {IPFS_Backup as IPFS_Backup};
export {Receipts as Receipts};