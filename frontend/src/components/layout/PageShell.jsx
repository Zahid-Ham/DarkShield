import React from 'react';
import { Navbar } from './Navbar.jsx';

export function PageShell({ activeTab, onNavigate, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      <Navbar activeTab={activeTab} onNavigate={onNavigate} />
      <main style={{ flex: 1, padding: '20px 24px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>
      <footer style={{
        padding: '10px 24px',
        borderTop: '1px solid var(--border-medium)',
        backgroundColor: 'var(--bg-surface)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>SIH26-S01 Autonomous Incident Response Engine</span>
          <span style={{ color: 'var(--text-light)' }}>|</span>
          <span>Enterprise Security Workstation Prototype</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          FastAPI Backend Engine v0.1.0 • React Vite Frontend
        </div>
      </footer>
    </div>
  );
}
