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

const handleUsersQuery = (cleanText, params, localStore) => {
  if (!cleanText.includes('users')) return null;

  let resultRows = [];
  let isMutation = false;

  if (cleanText.includes('FROM users')) {
    if (cleanText.includes('WHERE id = $1')) {
      const u = localStore.users.find(x => x.id === params[0]);
      resultRows = u ? [u] : [];
    } else if (cleanText.includes('WHERE LOWER(email) = LOWER($1)')) {
      const u = localStore.users.find(x => x.email.toLowerCase() === String(params[0]).toLowerCase());
      resultRows = u ? [u] : [];
    } else if (cleanText.includes('WHERE refresh_token = $1')) {
      const u = localStore.users.find(x => x.refresh_token === params[0]);
      resultRows = u ? [u] : [];
    } else if (cleanText.includes('WHERE reset_token = $1')) {
      const u = localStore.users.find(x => x.reset_token === params[0]);
      resultRows = u ? [u] : [];
    } else if (cleanText.includes("provider = 'demo'")) {
      resultRows = localStore.users.filter(x => x.provider === 'demo');
    } else {
      resultRows = localStore.users;
    }
  } else if (cleanText.startsWith('INSERT INTO users')) {
    isMutation = true;
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
      reset_token: null,
      reset_token_expires: null,
      created_at: new Date().toISOString()
    };
    localStore.users.push(newUser);
    resultRows = [newUser];
  } else if (cleanText.startsWith('UPDATE users SET is_email_verified = TRUE')) {
    isMutation = true;
    const u = localStore.users.find(x => x.id === params[0]);
    if (u) {
      u.is_email_verified = true;
      u.verification_code = null;
      resultRows = [u];
    }
  } else if (cleanText.startsWith('UPDATE users SET refresh_token')) {
    isMutation = true;
    const u = localStore.users.find(x => x.id === params[1]);
    if (u) {
      u.refresh_token = params[0];
      resultRows = [u];
    }
  } else if (cleanText.startsWith('UPDATE users SET reset_token')) {
    isMutation = true;
    const u = localStore.users.find(x => x.email.toLowerCase() === String(params[2]).toLowerCase());
    if (u) {
      u.reset_token = params[0];
      u.reset_token_expires = params[1];
      resultRows = [u];
    }
  } else if (cleanText.startsWith('UPDATE users SET password_hash')) {
    isMutation = true;
    const u = localStore.users.find(x => x.reset_token === params[1]);
    if (u) {
      u.password_hash = params[0];
      u.reset_token = null;
      u.reset_token_expires = null;
      resultRows = [u];
    }
  }

  return { resultRows, isMutation };
};

const handleTodosQuery = (cleanText, params, localStore) => {
  if (!cleanText.includes('todos')) return null;

  let resultRows = [];
  let isMutation = false;

  if (cleanText.includes('FROM todos')) {
    if (cleanText.includes('WHERE user_id = $1 AND id = $2')) {
      const t = localStore.todos.find(x => x.user_id === params[0] && x.id === params[1]);
      resultRows = t ? [mapTodo(t)] : [];
    } else if (cleanText.includes('WHERE user_id = $1')) {
      const list = localStore.todos.filter(x => x.user_id === params[0]);
      resultRows = list.map(mapTodo);
    } else {
      resultRows = localStore.todos.map(mapTodo);
    }
  } else if (cleanText.startsWith('INSERT INTO todos')) {
    isMutation = true;
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
    resultRows = [mapTodo(newTodo)];
  } else if (cleanText.startsWith('UPDATE todos')) {
    isMutation = true;
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
      resultRows = [mapTodo(localStore.todos[index])];
    }
  } else if (cleanText.startsWith('DELETE FROM todos')) {
    isMutation = true;
    const index = localStore.todos.findIndex(x => x.user_id === params[0] && x.id === params[1]);
    if (index !== -1) {
      localStore.todos.splice(index, 1);
      resultRows = [{ id: params[1] }];
    }
  }

  return { resultRows, isMutation };
};

const handleHistoryQuery = (cleanText, params, localStore) => {
  if (!cleanText.includes('history_logs')) return null;

  let resultRows = [];
  let isMutation = false;

  if (cleanText.includes('FROM history_logs')) {
    if (cleanText.includes('WHERE user_id = $1')) {
      const list = localStore.history_logs.filter(x => x.user_id === params[0]);
      resultRows = list.map(mapLog);
    } else {
      resultRows = localStore.history_logs.map(mapLog);
    }
  } else if (cleanText.startsWith('INSERT INTO history_logs')) {
    isMutation = true;
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
    resultRows = [mapLog(newLog)];
  } else if (cleanText.startsWith('DELETE FROM history_logs')) {
    isMutation = true;
    localStore.history_logs = localStore.history_logs.filter(x => x.user_id !== params[0]);
  }

  return { resultRows, isMutation };
};

const handleJournalsQuery = (cleanText, params, localStore) => {
  if (!cleanText.includes('daily_journals')) return null;

  let resultRows = [];
  let isMutation = false;

  if (cleanText.includes('FROM daily_journals')) {
    if (cleanText.includes('WHERE user_id = $1')) {
      const list = localStore.daily_journals.filter(x => x.user_id === params[0]);
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      resultRows = list;
    } else {
      resultRows = localStore.daily_journals;
    }
  } else if (cleanText.startsWith('INSERT INTO daily_journals')) {
    isMutation = true;
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
    resultRows = [newJournal];
  } else if (cleanText.startsWith('DELETE FROM daily_journals')) {
    isMutation = true;
    const index = localStore.daily_journals.findIndex(x => x.id === params[0] && x.user_id === params[1]);
    if (index !== -1) {
      localStore.daily_journals.splice(index, 1);
      resultRows = [{ id: params[0] }];
    }
  }

  return { resultRows, isMutation };
};

const handleCommentsQuery = (cleanText, params, localStore) => {
  if (!cleanText.includes('task_comments')) return null;

  let resultRows = [];
  let isMutation = false;

  if (cleanText.includes('FROM task_comments')) {
    if (cleanText.includes('WHERE task_id = $1')) {
      const list = localStore.task_comments.filter(x => x.task_id === params[0]);
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      resultRows = list;
    } else {
      resultRows = localStore.task_comments;
    }
  } else if (cleanText.startsWith('INSERT INTO task_comments')) {
    isMutation = true;
    const newComment = {
      id: params[0],
      task_id: params[1],
      user_id: params[2],
      comment_text: params[3],
      created_at: params[4] || new Date().toISOString()
    };
    localStore.task_comments.push(newComment);
    resultRows = [newComment];
  }

  return { resultRows, isMutation };
};

/**
 * Initializes and returns the local database query function.
 * @param {Object} localStore - The loaded JSON database store
 * @param {Function} saveLocalStore - Function to persist the store to disk
 * @returns {Function} query function
 */
const init = (localStore, saveLocalStore) => {
  console.log('[DATABASE] ℹ️ DATABASE_URL not detected. Running on local resilient database adapter.');
  
  return async (text, params = []) => {
    const cleanText = text.trim();
    
    if (cleanText.startsWith('CREATE TABLE')) {
      return { rows: [] };
    }

    // Pass the query through the handlers. The first one that returns a non-null object handled it.
    const handlers = [
      handleUsersQuery,
      handleTodosQuery,
      handleHistoryQuery,
      handleJournalsQuery,
      handleCommentsQuery
    ];

    let resultRows = [];
    let isMutation = false;

    for (const handler of handlers) {
      const result = handler(cleanText, params, localStore);
      if (result) {
        resultRows = result.resultRows;
        isMutation = result.isMutation;
        break; // Handled
      }
    }

    if (isMutation) {
      saveLocalStore(localStore);
    }
    
    return { rows: resultRows };
  };
};

module.exports = {
  init
};
