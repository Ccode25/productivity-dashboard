const fs = require('fs');
const path = require('path');

// Keep the JSON file in the same location as before (backend/src/local_db.json)
const dbFilePath = path.join(__dirname, '..', 'local_db.json');

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

module.exports = {
  loadLocalStore,
  saveLocalStore
};
