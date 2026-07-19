/**
 * Group logs dynamically by YYYY-MM-DD local date string
 */
export const groupLogsByDay = (logs) => {
  const groups = {};
  logs.forEach((log) => {
    if (!log.timestamp) return;
    const dateStr = new Date(log.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(log);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
};

/**
 * Generate Construction Log text report for a given date from history logs
 */
export const generateJournalLog = (dateStr, history) => {
  if (!dateStr) return '';
  const dayLogs = history.filter((l) => {
    const logDate = new Date(l.timestamp).toLocaleDateString('en-CA');
    return logDate === dateStr;
  });

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dateDisplay = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  let logText = `================================================
DAILY SITE JOURNAL LOG - ${dateStr}
================================================
Generated on: ${new Date().toLocaleDateString()}
Project Date: ${dateDisplay}
Officer: Project Documentation Engineer

------------------------------------------------
1. COMPLETED ACTIONS & SIGN-OFFS
------------------------------------------------\n`;

  const completedActions = dayLogs.filter((l) => l.action === 'completed');
  if (completedActions.length === 0) {
    logText += `  [NIL] No documents signed off or tasks completed.\n`;
  } else {
    completedActions.forEach((l) => {
      const time = new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      logText += `  [${time}] Completed: "${l.todoTitle}" [Category: ${l.category}]\n  --> Details: ${l.details}\n\n`;
    });
  }

  logText += `------------------------------------------------
2. NEW CORRESPONDENCE & LOGGED ITEMS
------------------------------------------------\n`;

  const createdActions = dayLogs.filter((l) => l.action === 'created');
  if (createdActions.length === 0) {
    logText += `  [NIL] No new correspondence registered.\n`;
  } else {
    createdActions.forEach((l) => {
      const time = new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      logText += `  [${time}] Registered: "${l.todoTitle}" [Category: ${l.category}]\n  --> Details: ${l.details}\n\n`;
    });
  }

  logText += `------------------------------------------------
3. MODIFICATIONS & DELETIONS
------------------------------------------------\n`;

  const otherActions = dayLogs.filter((l) => l.action !== 'completed' && l.action !== 'created');
  if (otherActions.length === 0) {
    logText += `  [NIL] No document revisions or deletions recorded.\n`;
  } else {
    otherActions.forEach((l) => {
      const time = new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      const actionLabel = l.action.toUpperCase();
      logText += `  [${time}] ${actionLabel}: "${l.todoTitle}" [Category: ${l.category}]\n  --> Details: ${l.details}\n\n`;
    });
  }

  logText += `================================================
Report Compiled via Smart Task Manager Board.
================================================`;

  return logText;
};
