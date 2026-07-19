import React from 'react';

export default function ProductivityView({ todos }) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const completedTodos = todos.filter((t) => t.completed);

  // 1. Calculate Streak
  const getStreak = () => {
    const completedDates = new Set(
      completedTodos
        .map((t) => t.dueDate || (t.createdAt && t.createdAt.split('T')[0]))
        .filter(Boolean)
    );
    let streak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    const todayStr = checkDate.toLocaleDateString('en-CA');
    const completedToday = completedDates.has(todayStr);

    if (completedToday) {
      streak = 1;
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = checkDate.toLocaleDateString('en-CA');
        if (completedDates.has(dateStr)) {
          streak++;
        } else {
          break;
        }
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toLocaleDateString('en-CA');
      if (completedDates.has(yesterdayStr)) {
        streak = 1;
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const dateStr = checkDate.toLocaleDateString('en-CA');
          if (completedDates.has(dateStr)) {
            streak++;
          } else {
            break;
          }
        }
      }
    }
    return streak;
  };

  const streak = getStreak();

  // 2. Calculate Weekly Trend (Last 7 Days)
  const getWeeklyTrend = () => {
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = completedTodos.filter((t) => {
        const taskDate = t.dueDate || (t.createdAt && t.createdAt.split('T')[0]);
        return taskDate === dateStr;
      }).length;

      trend.push({ dayLabel, formatted, count });
    }
    return trend;
  };

  const trendData = getWeeklyTrend();
  const maxCompletions = Math.max(...trendData.map((d) => d.count), 1);

  // 3. Category distribution
  const categoryStats = {};
  const categories = ['Work', 'Personal', 'Design', 'Health', 'Other'];
  categories.forEach((cat) => {
    categoryStats[cat] = 0;
  });

  completedTodos.forEach((t) => {
    const cat = t.category || 'Other';
    const normalizedCat = categories.includes(cat) ? cat : 'Other';
    categoryStats[normalizedCat] = (categoryStats[normalizedCat] || 0) + 1;
  });

  let topCategory = 'None';
  let maxCatCount = 0;
  Object.entries(categoryStats).forEach(([cat, count]) => {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategory = cat;
    }
  });

  // 4. Overdue tasks count
  const overdueCount = todos.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  // 5. Productivity Score Formula
  const overallWeight = total > 0 ? (completed / total) * 40 : 0;

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayTodos = todos.filter((t) => t.dueDate === todayStr);
  const todayTotal = todayTodos.length;
  const todayCompleted = todayTodos.filter((t) => t.completed).length;
  const todayWeight = todayTotal > 0 ? (todayCompleted / todayTotal) * 40 : 40;

  const streakWeight = Math.min(streak * 5, 20);
  const deduction = overdueCount * 5;

  let productivityScore = Math.round(overallWeight + todayWeight + streakWeight - deduction);
  productivityScore = Math.max(0, Math.min(100, productivityScore));

  // Determine score feedback text & color
  let feedbackText = 'Keep going! Focus on completing your daily list.';
  let feedbackColor = 'hsl(var(--text-secondary))';
  if (productivityScore >= 80) {
    feedbackText = 'Exceptional focus! You are operating in flow state.';
    feedbackColor = '#10b981'; // emerald green
  } else if (productivityScore >= 50) {
    feedbackText = 'Good progress. Clear overdue items to boost your focus score.';
    feedbackColor = 'hsl(var(--warning))'; // orange / warning
  }

  return (
    <div className="productivity-view-container glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      
      {/* 1. Header Grid: Focus Score & Stats Cards */}
      <div className="productivity-header-grid" style={{ display: 'grid', gridTemplateColumns: '1.25fr 2fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Focus Score Gauge */}
        <div className="score-card glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
          <div className="score-ring-wrapper" style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* SVG Ring */}
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="60" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="transparent" />
              <circle 
                cx="75" 
                cy="75" 
                r="60" 
                stroke="url(#scoreGradient)" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * productivityScore) / 100}
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="score-value-overlay" style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{productivityScore}%</span>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Focus Level</span>
            </div>
          </div>
          <h4 style={{ margin: '1rem 0 0.25rem 0', fontSize: '1.1rem', color: 'white', fontWeight: 600 }}>Productivity Rating</h4>
          <p style={{ fontSize: '0.8rem', color: feedbackColor, textAlign: 'center', margin: 0, padding: '0 0.5rem', transition: 'color 0.5s ease' }}>
            {feedbackText}
          </p>
        </div>

        {/* Focus Stats Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          
          <div className="analytics-stat-card glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon-wrapper streak-glow" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{streak} Days</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>Current Streak</p>
            </div>
          </div>

          <div className="analytics-stat-card glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M22 12h-4M4 12H2M12 2v4M12 18v4" />
              </svg>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{topCategory}</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>Category Focus</p>
            </div>
          </div>

          <div className="analytics-stat-card glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{completed}</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>Completed Tasks</p>
            </div>
          </div>

          <div className="analytics-stat-card glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--danger))' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{overdueCount}</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>Overdue Obstacles</p>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Charts Section: Last 7 Days Trend & Category Breakdown */}
      <div className="productivity-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Weekly Completion Bar Chart */}
        <div className="chart-card glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'white', margin: '0 0 1.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>7-Day Completion Trend</h3>
          <div className="bar-chart-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', height: '160px', paddingBottom: '0.5rem', position: 'relative' }}>
            {trendData.map((d, index) => {
              const heightPercent = (d.count / maxCompletions) * 100;
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'end' }}>
                  {/* Tooltip on hover */}
                  <div className="chart-bar-wrapper" style={{ position: 'relative', width: '60%', display: 'flex', justifyContent: 'center' }}>
                    <div 
                      className="chart-bar-fill" 
                      style={{ 
                        height: `${Math.max(heightPercent, 4)}%`, // min height so empty days show a tiny line
                        width: '18px',
                        borderRadius: '6px 6px 0 0',
                        background: d.count > 0 ? 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--accent) / 0.5) 100%)' : 'rgba(255,255,255,0.03)',
                        transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        cursor: 'pointer'
                      }}
                      title={`${d.count} completed on ${d.formatted}`}
                    />
                    {d.count > 0 && (
                      <span className="bar-value-label" style={{ position: 'absolute', top: '-18px', fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>
                        {d.count}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem', fontWeight: 500 }}>
                    {d.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown list */}
        <div className="chart-card glass-panel" style={{ padding: '1.5rem 2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'white', margin: '0 0 1.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Allocations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categories.map((cat) => {
              const count = categoryStats[cat];
              const pct = completed > 0 ? Math.round((count / completed) * 100) : 0;
              const colorVar = `--color-${cat.toLowerCase()}`;

              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span style={{ color: 'white' }}>{cat}</span>
                    <span style={{ color: `hsl(var(${colorVar}))` }}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${pct}%`,
                        background: `hsl(var(${colorVar}))`,
                        boxShadow: `0 0 8px hsl(var(${colorVar}) / 0.4)`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
