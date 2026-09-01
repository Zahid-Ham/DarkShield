import React from 'react';
import { Shield, Upload, LayoutDashboard, Search, Eye, Activity } from 'lucide-react';

export function Navbar({ activeTab, onNavigate }) {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Shield },
    { id: 'log-input', label: 'Log Ingestion', icon: Upload },
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard },
    { id: 'investigation', label: 'Incident Investigation', icon: Search },
    { id: 'exposure', label: 'Exposure Intelligence', icon: Eye },
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      height: '50px',
      padding: '0 24px',
      backgroundColor: 'var(--header-bg)',
      borderBottom: '1px solid var(--header-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.15)'
    }}>
      {/* Brand logo & product title */}
      <div 
        onClick={() => onNavigate('landing')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '28px',
          height: '28px',
          backgroundColor: 'var(--accent-orange)',
          borderRadius: 'var(--radius-xs)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          color: '#FFF',
          boxShadow: '0 1px 3px rgba(234, 88, 12, 0.4)'
        }}>
          <Shield size={16} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '0.04em', color: '#FFFFFF', textTransform: 'uppercase' }}>
            SENTINEL<span style={{ color: 'var(--accent-orange)' }}>AI</span>
          </span>
          <span style={{ fontSize: '10px', color: 'var(--header-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            SIH26-S01 WORKSTATION
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav style={{ display: 'flex', gap: '4px', height: '100%' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#FFFFFF' : 'var(--header-muted)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--accent-orange)' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                height: '100%',
                opacity: isActive ? 1 : 0.85
              }}
            >
              <Icon size={14} color={isActive ? 'var(--accent-orange)' : 'var(--header-muted)'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* System Status indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 9px',
          backgroundColor: '#1E293B',
          borderRadius: 'var(--radius-xs)',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: '#E2E8F0',
          border: '1px solid #334155',
          letterSpacing: '0.05em'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
          LIVE SOC AGENT
        </div>
      </div>
    </header>
  );
}
