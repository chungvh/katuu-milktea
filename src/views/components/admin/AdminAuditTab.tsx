import React from 'react';

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  targetId: string | number;
  timestamp: string;
  user?: string;
  role?: string;
  note?: string;
  before?: any;
  after?: any;
}

interface AdminAuditTabProps {
  audits: AuditEntry[];
  onClear: () => void;
}

const AdminAuditTab: React.FC<AdminAuditTabProps> = ({ audits, onClear }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Nhật Ký Thao Tác (Audit Log)</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={onClear}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6">
        {audits.length === 0 ? (
          <p className="text-center text-stone-500 dark:text-stone-400 py-8">Chưa có bản ghi</p>
        ) : (
          <div className="space-y-3">
            {audits.slice(0, 200).map((entry) => (
              <div key={entry.id} className="p-3 border border-stone-100 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{entry.action.toUpperCase()} • {entry.target} #{entry.targetId}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{new Date(entry.timestamp).toLocaleString('vi-VN')} — {entry.user || '—'} ({entry.role || '—'})</p>
                    {entry.note && <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">{entry.note}</p>}
                  </div>
                  <details className="text-xs text-stone-500 dark:text-stone-400 max-w-lg">
                    <summary className="cursor-pointer">Chi tiết</summary>
                    <pre className="text-xs mt-2 overflow-auto max-h-40 bg-stone-50 dark:bg-stone-900 p-2 rounded">{JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}</pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditTab;
