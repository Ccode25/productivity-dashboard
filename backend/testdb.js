require('dotenv').config({ path: 'c:/Users/ajdae/.gemini/antigravity-ide/scratch/express-react-todo/backend/.env' });
const db = require('c:/Users/ajdae/.gemini/antigravity-ide/scratch/express-react-todo/backend/src/db');

async function test() {
  try {
    const res = await db.query('SELECT id, user_id FROM daily_journals');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
test();
