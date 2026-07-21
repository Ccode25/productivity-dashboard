require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;

let queryFn = null;
let isNeonDatabase = false;

const fs = require('fs');
const path = require('path');
const dbFilePath = path.join(__dirname, 'local_db.json');

const loadLocalStore = () => {
  let data = { users: [], todos: [], history_logs: [], daily_journals: [], task_comments: [] };
  if (fs.existsSync(dbFilePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
      data = { ...data, ...parsed };
      
      // Ensure missing arrays are initialized
      data.daily_journals = data.daily_journals || [];
      data.task_comments = data.task_comments || [];
    } catch (e) {
      console.error('Failed to parse local_db.json, starting fresh:', e);
    }
  }
  return data;
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
      // Use sql.query as per the Neon notice for conventional function calls
      const result = await sql.query(text, params);
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
      const mapTodo = (t) => {
        if (!t) return null;
        return {
          id: t.id,
          userId: t.user_id,
          title: t.title,
          description: t.description,
          category: t.category,
          dueDate: t.due_date,
          priority: t.priority || 'medium',
          repeat: t.repeat,
          completed: t.completed,
          createdAt: t.created_at
        };
      };
      if (cleanText.includes('WHERE user_id = $1 AND id = $2')) {
        const t = localStore.todos.find(x => x.user_id === params[0] && x.id === params[1]);
        return { rows: t ? [mapTodo(t)] : [] };
      }
      if (cleanText.includes('WHERE user_id = $1')) {
        const list = localStore.todos.filter(x => x.user_id === params[0]);
        return { rows: list.map(mapTodo) };
      }
      return { rows: localStore.todos.map(mapTodo) };
    }

    if (cleanText.startsWith('INSERT INTO todos')) {
      const newTodo = {
        id: params[0],
        user_id: params[1],
        title: params[2],
        description: params[3],
        category: params[4],
        due_date: params[5],
        priority: params[6] || 'medium',
        repeat: params[7],
        completed: params[8],
        created_at: params[9] || new Date().toISOString()
      };
      localStore.todos.unshift(newTodo);
      const mapped = {
        id: newTodo.id,
        userId: newTodo.user_id,
        title: newTodo.title,
        description: newTodo.description,
        category: newTodo.category,
        dueDate: newTodo.due_date,
        priority: newTodo.priority,
        repeat: newTodo.repeat,
        completed: newTodo.completed,
        createdAt: newTodo.created_at
      };
      return { rows: [mapped] };
    }

    if (cleanText.startsWith('UPDATE todos')) {
      const index = localStore.todos.findIndex(x => x.user_id === params[7] && x.id === params[8]);
      if (index !== -1) {
        localStore.todos[index] = {
          ...localStore.todos[index],
          title: params[0],
          description: params[1],
          category: params[2],
          due_date: params[3],
          priority: params[4] || 'medium',
          repeat: params[5],
          completed: params[6]
        };
        const updated = localStore.todos[index];
        const mapped = {
          id: updated.id,
          userId: updated.user_id,
          title: updated.title,
          description: updated.description,
          category: updated.category,
          dueDate: updated.due_date,
          priority: updated.priority,
          repeat: updated.repeat,
          completed: updated.completed,
          createdAt: updated.created_at
        };
        return { rows: [mapped] };
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
      const mapLog = (l) => {
        if (!l) return null;
        return {
          id: l.id,
          userId: l.user_id,
          todoId: l.todo_id,
          action: l.action,
          todoTitle: l.todo_title,
          category: l.category,
          timestamp: l.timestamp,
          details: l.details,
          changes: l.changes,
          snapshot: l.snapshot
        };
      };
      if (cleanText.includes('WHERE user_id = $1')) {
        const list = localStore.history_logs.filter(x => x.user_id === params[0]);
        return { rows: list.map(mapLog) };
      }
      return { rows: localStore.history_logs.map(mapLog) };
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
        details: params[7],
        changes: params[8],
        snapshot: params[9]
      };
      localStore.history_logs.unshift(newLog);
      const mapped = {
        id: newLog.id,
        userId: newLog.user_id,
        todoId: newLog.todo_id,
        action: newLog.action,
        todoTitle: newLog.todo_title,
        category: newLog.category,
        timestamp: newLog.timestamp,
        details: newLog.details,
        changes: newLog.changes,
        snapshot: newLog.snapshot
      };
      return { rows: [mapped] };
    }

    if (cleanText.startsWith('DELETE FROM history_logs')) {
      localStore.history_logs = localStore.history_logs.filter(x => x.user_id !== params[0]);
      return { rows: [] };
    }

    // 5. DAILY JOURNALS Queries
    if (cleanText.includes('FROM daily_journals')) {
      if (cleanText.includes('WHERE user_id = $1')) {
        const list = localStore.daily_journals.filter(x => x.user_id === params[0]);
        // Sort descending by created_at
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return { rows: list };
      }
      return { rows: localStore.daily_journals };
    }

    if (cleanText.startsWith('INSERT INTO daily_journals')) {
      const newJournal = {
        id: params[0],
        user_id: params[1],
        project_name: params[2],
        objective: params[3],
        work_performed: params[4],
        progress_summary: params[5],
        issues_encountered: params[6],
        resolution: params[7],
        materials_used: params[8],
        time_spent: params[9],
        lessons_learned: params[10],
        next_action: params[11],
        created_at: params[12] || new Date().toISOString()
      };
      localStore.daily_journals.unshift(newJournal);
      return { rows: [newJournal] };
    }

    if (cleanText.startsWith('DELETE FROM daily_journals')) {
      const index = localStore.daily_journals.findIndex(x => x.id === params[0] && x.user_id === params[1]);
      if (index !== -1) {
        localStore.daily_journals.splice(index, 1);
        return { rows: [{ id: params[0] }] };
      }
      return { rows: [] };
    }

    // 6. TASK COMMENTS Queries
    if (cleanText.includes('FROM task_comments')) {
      if (cleanText.includes('WHERE task_id = $1')) {
        const list = localStore.task_comments.filter(x => x.task_id === params[0]);
        list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return { rows: list };
      }
      return { rows: localStore.task_comments };
    }

    if (cleanText.startsWith('INSERT INTO task_comments')) {
      const newComment = {
        id: params[0],
        task_id: params[1],
        user_id: params[2],
        comment_text: params[3],
        created_at: params[4] || new Date().toISOString()
      };
      localStore.task_comments.push(newComment);
      return { rows: [newComment] };
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
