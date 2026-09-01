import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, ShieldAlert, FileText } from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge.jsx';
import { Button } from '../components/common/Button.jsx';
import { IncidentTimeline } from '../components/investigation/IncidentTimeline.jsx';
import { EvidencePanel } from '../components/investigation/EvidencePanel.jsx';
import { RelatedIntelligence } from '../components/investigation/RelatedIntelligence.jsx';
import { ManagerChat } from '../components/investigation/ManagerChat.jsx';
import { MitigationModal } from '../components/investigation/MitigationModal.jsx';
import { fetchIncidentEvents } from '../services/api.js';

export function Investigation({ incident, onBack, onGenerateReport }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showMitigation, setShowMitigation] = useState(false);

  useEffect(() => {
    if (incident?.id) {
      setLoadingEvents(true);
      fetchIncidentEvents(incident.id).then(data => {
        setEvents(data);
        setLoadingEvents(false);
      });
    }
  }, [incident]);

  if (!incident) {
    return (
      <div style={{ padding: '36px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', maxWidth: '600px', margin: '40px auto' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '13px' }}>No incident selected for forensic investigation.</p>
        <Button variant="primary" icon={ArrowLeft} onClick={onBack}>Return to SOC Dashboard</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Forensic Header Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <button
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                background: 'transparent',
                fontSize: '11px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginBottom: '4px',
                fontWeight: '600'
              }}
            >
              <ArrowLeft size={13} /> Back to SOC Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RiskBadge severity={incident.severity} score={incident.riskScore} />
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: '700' }}>{incident.id}</span>
              <h1 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)' }}>{incident.title}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" icon={MessageSquare} onClick={() => setShowChat(true)}>
              Explain to Manager
            </Button>
            <Button variant="outline" size="sm" icon={ShieldAlert} onClick={() => setShowMitigation(true)}>
              Mitigation Playbook
            </Button>
            <Button variant="primary" size="sm" icon={FileText} onClick={onGenerateReport}>
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Main Forensic Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '16px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <EvidencePanel incident={incident} />
          
          {loadingEvents ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)' }}>
              Loading correlated event execution chain...
            </div>
          ) : (
            <IncidentTimeline events={events} />
          )}
        </div>

        {/* Right Sidebar Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <RelatedIntelligence />
        </div>
      </div>

      {/* Modals */}
      {showChat && (
        <ManagerChat incident={incident} onClose={() => setShowChat(false)} />
      )}
      {showMitigation && (
        <MitigationModal incident={incident} onClose={() => setShowMitigation(false)} />
      )}
    </div>
  );
}
