import React, { useState } from 'react';
import Card from '../common/Card';
import { InputField, TextAreaField } from '../common/FormField';
import Button from '../common/Button';

export default function ProfessionalJournalView({ journals, onCreateJournal }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    project_name: '',
    objective: '',
    work_performed: '',
    progress_summary: '',
    issues_encountered: '',
    resolution: '',
    materials_used: '',
    time_spent: '',
    lessons_learned: '',
    next_action: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreateJournal(formData);
    setShowForm(false);
    setFormData({
      project_name: '', objective: '', work_performed: '', progress_summary: '',
      issues_encountered: '', resolution: '', materials_used: '', time_spent: '',
      lessons_learned: '', next_action: ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>Daily Work Journal</h3>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel Entry' : '+ New Journal Entry'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <InputField label="Project / Task" name="project_name" value={formData.project_name} onChange={handleChange} required />
              <InputField label="Time Spent (e.g., 2h 30m)" name="time_spent" value={formData.time_spent} onChange={handleChange} />
            </div>
            
            <InputField label="Objective" name="objective" value={formData.objective} onChange={handleChange} />
            <TextAreaField label="Work Performed" name="work_performed" value={formData.work_performed} onChange={handleChange} required />
            <TextAreaField label="Progress Summary" name="progress_summary" value={formData.progress_summary} onChange={handleChange} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <TextAreaField label="Issues Encountered" name="issues_encountered" value={formData.issues_encountered} onChange={handleChange} />
              <TextAreaField label="Resolution" name="resolution" value={formData.resolution} onChange={handleChange} />
            </div>

            <InputField label="Materials / Tools Used" name="materials_used" value={formData.materials_used} onChange={handleChange} />
            <InputField label="Lessons Learned" name="lessons_learned" value={formData.lessons_learned} onChange={handleChange} />
            <InputField label="Next Action" name="next_action" value={formData.next_action} onChange={handleChange} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Journal Entry</Button>
            </div>
          </form>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {journals.map(j => (
          <Card key={j.id} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'hsl(var(--primary))' }}>{j.project_name}</h4>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{new Date(j.created_at).toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              {j.objective && <div><strong style={{ color: 'hsl(var(--text-secondary))' }}>Objective:</strong> <span style={{ color: 'white' }}>{j.objective}</span></div>}
              {j.time_spent && <div><strong style={{ color: 'hsl(var(--text-secondary))' }}>Time Spent:</strong> <span style={{ color: 'white' }}>{j.time_spent}</span></div>}
            </div>

            {j.work_performed && (
              <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                <strong style={{ color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>Work Performed:</strong>
                <div style={{ color: 'white', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px' }}>{j.work_performed}</div>
              </div>
            )}
            
            {j.issues_encountered && (
              <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                <strong style={{ color: 'hsl(var(--danger))', display: 'block', marginBottom: '0.25rem' }}>Issues & Resolutions:</strong>
                <div style={{ color: 'white', background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: '6px', borderLeft: '2px solid hsl(var(--danger))' }}>
                  <strong>Issue:</strong> {j.issues_encountered}<br/>
                  {j.resolution && <><strong style={{ marginTop: '0.5rem', display: 'inline-block' }}>Resolution:</strong> {j.resolution}</>}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginTop: '1rem' }}>
              {j.next_action && <div><strong style={{ color: 'hsl(var(--text-secondary))' }}>Next Action:</strong> <span style={{ color: 'white' }}>{j.next_action}</span></div>}
              {j.materials_used && <div><strong style={{ color: 'hsl(var(--text-secondary))' }}>Materials:</strong> <span style={{ color: 'white' }}>{j.materials_used}</span></div>}
            </div>
          </Card>
        ))}
        {journals.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-muted))' }}>
            No journal entries yet. Click "+ New Journal Entry" to start documenting your work.
          </div>
        )}
      </div>

    </div>
  );
}
