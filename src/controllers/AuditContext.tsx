import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AuditEntry } from '@/models/types';
import { useAuth } from './AuthContext';

interface AuditContextType {
  audits: AuditEntry[];
  addAudit: (entry: Omit<AuditEntry, 'id' | 'timestamp' | 'user' | 'role'>) => void;
  clearAudits: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const STORAGE_KEY = 'katuuAudit';

export const AuditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const auth = useAuth();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAudits(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load audit log', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
    } catch (e) {
      console.error('Failed to save audit log', e);
    }
  }, [audits]);

  const addAudit = (entry: Omit<AuditEntry, 'id' | 'timestamp' | 'user' | 'role'>) => {
    const newEntry: AuditEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      user: auth.user?.username,
      role: auth.user?.role,
      ...entry,
    };
    setAudits(prev => [newEntry, ...prev].slice(0, 1000)); // keep most recent 1000
  };

  const clearAudits = () => setAudits([]);

  return (
    <AuditContext.Provider value={{ audits, addAudit, clearAudits }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
};

