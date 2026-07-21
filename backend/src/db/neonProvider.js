const { neon } = require('@neondatabase/serverless');

/**
 * Initializes and returns the Neon database query function.
 * @param {string} connectionString - The Neon Postgres connection string
 * @returns {Function} query function
 */
const init = (connectionString) => {
  const sql = neon(connectionString);
  
  return async (text, params = []) => {
    // Use sql.query as per the Neon notice for conventional function calls
    const result = await sql.query(text, params);
    return { rows: result };
  };
};

module.exports = {
  init
};
