require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL;

const { loadLocalStore, saveLocalStore } = require('./db/storage');
const neonProvider = require('./db/neonProvider');
const localProvider = require('./db/localProvider');

let queryFn = null;
let isNeonDatabase = false;

if (DATABASE_URL) {
  try {
    queryFn = neonProvider.init(DATABASE_URL);
    isNeonDatabase = true;
    console.log('[DATABASE] ⚡ Connected to Neon Postgres database serverlessly.');
  } catch (err) {
    console.warn('[DATABASE] Failed to initialize Neon connection, falling back to local SQL adapter:', err.message);
  }
}

if (!queryFn) {
  const localStore = loadLocalStore();
  queryFn = localProvider.init(localStore, saveLocalStore);
}

/**
 * Execute SQL Query against active database provider
 */
const query = async (text, params) => {
  return await queryFn(text, params);
};

module.exports = {
  query,
  isNeonDatabase
};
