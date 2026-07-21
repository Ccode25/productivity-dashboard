require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;

let queryFn = null;
let isNeonDatabase = false;

const fs = require('fs');
const path = require('path');
const dbFilePath = path.join(__dirname, 'local_db.json');

const loadLocalStore = () => {
  if (fs.existsSync(dbFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    } catch (e) {
      console.error('Failed to parse local_db.json, starting fresh:', e);
    }
  }
  return { users: [], todos: [], history_logs: [] };
};

const saveLocalStore = (store) => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('Failed to save to local_db.json:', e);
  }
};

const localStore = loadLocalStore();

if (connectionString) {
  try {
    const sql = neon(connectionString);
    queryFn = async (text, params = []) => {
      const result = await sql(text, params);
      return { rows: result };
    };
    isNeonDatabase = true;
    console.log('[DATABASE] ⚡ Connected to Neon Postgres database serverlessly.');
  } catch (err) {
    console.warn('[DATABASE] Failed to initialize Neon connection, falling back to local SQL adapter:', err.message);
  }
}

if (!queryFn) {
  console.log('[DATABASE] ℹ️ DATABASE_URL not detected. Running on local resilient database adapter.');
  
  queryFn = async (text, params = []) => {
    const cleanText = text.trim();
    
    // 1. CREATE TABLE mock
    if (cleanText.startsWith('CREATE TABLE')) {
      return { rows: [] };
    }

    // 2. USERS Queries
    if (cleanText.includes('FROM users')) {
      if (cleanText.includes('WHERE id = $1')) {
        const u = localStore.users.find(x => x.id === params[0]);
        return { rows: u ? [u] : [] };
      }
      if (cleanText.includes('WHERE LOWER(email) = LOWER($1)')) {
        const u = localStore.users.find(x => x.email.toLowerCase() === String(params[0]).toLowerCase());
        return { rows: u ? [u] : [] };
      }
      if (cleanText.includes('WHERE refresh_token = $1')) {
        const u = localStore.users.find(x => x.refresh_token === params[0]);
        return { rows: u ? [u] : [] };
      }
      if (cleanText.includes('WHERE reset_token = $1')) {
        const u = localStore.users.find(x => x.reset_token === params[0]);
        return { rows: u ? [u] : [] };
      }
      if (cleanText.includes('provider = \'demo\'')) {
        return { rows: localStore.users.filter(x => x.provider === 'demo') };
      }
      return { rows: localStore.users };
    }

    if (cleanText.startsWith('INSERT INTO users')) {
      const newUser = {
        id: params[0],
        name: params[1],
        email: params[2],
        password_hash: params[3],
        role: params[4],
        avatar: params[5],
        is_email_verified: params[6] || false,
        verification_code: params[7] || null,
        refresh_token: params[8] || null,
        google_id: params[9] || null,
        provider: params[10] || 'register',
        created_at: new Date().toISOString()
      };
      localStore.users.push(newUser);
      return { rows: [newUser] };
    }

    if (cleanText.startsWith('UPDATE users SET is_email_verified = TRUE')) {
      const u = localStore.users.find(x => x.id === params[0]);
      if (u) {
        u.is_email_verified = true;
        u.verification_code = null;
        return { rows: [u] };
      }
      return { rows: [] };
    }

    if (cleanText.startsWith('UPDATE users SET refresh_token')) {
      const u = localStore.users.find(x => x.id === params[1]);
      if (u) {
        u.refresh_token = params[0];
        return { rows: [u] };
      }
      return { rows: [] };
    }

    // 3. TODOS Queries
    if (cleanText.includes('FROM todos')) {
      if (cleanText.includes('WHERE user_id = $1 AND id = $2')) {
        const t = localStore.todos.find(x => x.user_id === params[0] && x.id === params[1]);
        return { rows: t ? [t] : [] };
      }
      if (cleanText.includes('WHERE user_id = $1')) {
        const list = localStore.todos.filter(x => x.user_id === params[0]);
        return { rows: list };
      }
      return { rows: localStore.todos };
    }

    if (cleanText.startsWith('INSERT INTO todos')) {
      const newTodo = {
        id: params[0],
        user_id: params[1],
        title: params[2],
        description: params[3],
        category: params[4],
        due_date: params[5],
        repeat: params[6],
        completed: params[7],
        created_at: params[8] || new Date().toISOString()
      };
      localStore.todos.unshift(newTodo);
      return { rows: [newTodo] };
    }

    if (cleanText.startsWith('UPDATE todos')) {
      const index = localStore.todos.findIndex(x => x.user_id === params[6] && x.id === params[7]);
      if (index !== -1) {
        localStore.todos[index] = {
          ...localStore.todos[index],
          title: params[0],
          description: params[1],
          category: params[2],
          due_date: params[3],
          repeat: params[4],
          completed: params[5]
        };
        return { rows: [localStore.todos[index]] };
      }
      return { rows: [] };
    }

    if (cleanText.startsWith('DELETE FROM todos')) {
      const index = localStore.todos.findIndex(x => x.user_id === params[0] && x.id === params[1]);
      if (index !== -1) {
        localStore.todos.splice(index, 1);
        return { rows: [{ id: params[1] }] };
      }
      return { rows: [] };
    }

    // Handle password reset token update
    if (cleanText.startsWith('UPDATE users SET reset_token')) {
      // Expected query: UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3
      const u = localStore.users.find(x => x.email.toLowerCase() === String(params[2]).toLowerCase());
      if (u) {
        u.reset_token = params[0];
        u.reset_token_expires = params[1];
        return { rows: [u] };
      }
    }

    if (cleanText.startsWith('UPDATE users SET password_hash')) {
      // Expected query: UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2
      const u = localStore.users.find(x => x.reset_token === params[1]);
      if (u) {
        u.password_hash = params[0];
        u.reset_token = null;
        u.reset_token_expires = null;
        return { rows: [u] };
      }
      return { rows: [] };
    }



    // 4. HISTORY LOGS Queries
    if (cleanText.includes('FROM history_logs')) {
      if (cleanText.includes('WHERE user_id = $1')) {
        const list = localStore.history_logs.filter(x => x.user_id === params[0]);
        return { rows: list };
      }
      return { rows: localStore.history_logs };
    }

    if (cleanText.startsWith('INSERT INTO history_logs')) {
      const newLog = {
        id: params[0],
        user_id: params[1],
        todo_id: params[2],
        action: params[3],
        todo_title: params[4],
        category: params[5],
        timestamp: params[6],
        details: params[7]
      };
      localStore.history_logs.unshift(newLog);
      return { rows: [newLog] };
    }

    if (cleanText.startsWith('DELETE FROM history_logs')) {
      localStore.history_logs = localStore.history_logs.filter(x => x.user_id !== params[0]);
      return { rows: [] };
    }

    return { rows: [] };
  };
}

/**
 * Execute SQL Query against Neon Postgres or local database adapter
 */
const query = async (text, params) => {
  const result = await queryFn(text, params);
  if (!connectionString) {
    const cleanText = text.trim().toUpperCase();
    if (cleanText.startsWith('INSERT') || cleanText.startsWith('UPDATE') || cleanText.startsWith('DELETE')) {
      saveLocalStore(localStore);
    }
  }
  return result;
};

module.exports = {
  query,
  isNeonDatabase
};
