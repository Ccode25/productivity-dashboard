import React from 'react';
import useProductivityStats from '../hooks/useProductivityStats';
import ScoreGauge from './productivity/ScoreGauge';
import StatCard from './productivity/StatCard';
import TrendChart from './productivity/TrendChart';
import CategoryAllocations from './productivity/CategoryAllocations';

/**
 * Main Export View Component (Container View)
 * Integrates ViewModel hook (useProductivityStats) with presentation sub-components.
 */
export default function ProductivityView({ todos = [] }) {
  const {
    completed,
    streak,
    trendData,
    categoryStats,
    topCategory,
    categories,
    overdueCount,
    score,
    feedbackText,
    feedbackColor
  } = useProductivityStats(todos);

  return (
    <div className="productivity-view-container glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      
      {/* 1. Header Grid: Focus Score & Stats Cards */}
      <div className="productivity-header-grid" style={{ display: 'grid', gridTemplateColumns: '1.25fr 2fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        <ScoreGauge 
          score={score}
          feedbackText={feedbackText}
          feedbackColor={feedbackColor}
        />

        {/* Focus Stats Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          
          <StatCard 
            val={`${streak} Days`} 
            label="Current Streak" 
            color="#f97316" 
            bg="rgba(249, 115, 22, 0.15)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </StatCard>

          <StatCard 
            val={topCategory} 
            label="Category Focus" 
            color="hsl(var(--primary))" 
            bg="rgba(139, 92, 246, 0.15)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M22 12h-4M4 12H2M12 2v4M12 18v4" />
            </svg>
          </StatCard>

          <StatCard 
            val={completed} 
            label="Completed Tasks" 
            color="#10b981" 
            bg="rgba(16, 185, 129, 0.15)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </StatCard>

          <StatCard 
            val={overdueCount} 
            label="Overdue Obstacles" 
            color="hsl(var(--danger))" 
            bg="rgba(239, 68, 68, 0.15)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </StatCard>

        </div>

      </div>

      {/* 2. Charts Section: Last 7 Days Trend & Category Breakdown */}
      <div className="productivity-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        <TrendChart trendData={trendData} />

        <CategoryAllocations 
          categories={categories}
          categoryStats={categoryStats}
          completed={completed}
        />

      </div>

    </div>
  );
}
