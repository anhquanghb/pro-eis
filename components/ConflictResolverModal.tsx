import React, { useState } from 'react';
import { ConflictRecord, ConflictResolutionAction } from '../types/conflict';
import { AlertTriangle, X, Check } from 'lucide-react';

interface Props {
  conflicts: ConflictRecord<any>[];
  onResolveAll: (resolutions: Record<string, ConflictResolutionAction>) => void;
  onClose: () => void;
}

const ConflictResolverModal: React.FC<Props> = ({ conflicts, onResolveAll, onClose }) => {
  const [decisions, setDecisions] = useState<Record<string, ConflictResolutionAction>>({});

  const handleDecision = (id: string, action: ConflictResolutionAction) => {
    setDecisions(prev => ({ ...prev, [id]: action }));
  };

  const actualConflicts = conflicts.filter(c => c.status === 'conflict');

  // Set default decision for all to KEEP_EXISTING if not set
  const handleApply = () => {
    const finalDecisions = { ...decisions };
    actualConflicts.forEach(c => {
      if (!finalDecisions[c.id]) finalDecisions[c.id] = 'KEEP_EXISTING';
    });
    onResolveAll(finalDecisions);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-amber-200">
        <div className="p-5 border-b bg-amber-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 w-6 h-6" />
            <h2 className="font-bold text-amber-900 text-lg">Phát hiện xung đột dữ liệu ({actualConflicts.length} bản ghi)</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full text-amber-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 bg-slate-50 flex-1">
          {actualConflicts.map(item => (
            <div key={item.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">{item.id}</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                  Trường khác biệt: {item.differences.join(', ')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-lg">
                  <p className="font-bold text-red-700 mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Hệ thống hiện tại
                  </p>
                  <pre className="whitespace-pre-wrap text-slate-600 font-mono text-xs overflow-x-auto max-h-40">{JSON.stringify(item.existing, null, 2)}</pre>
                </div>
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                  <p className="font-bold text-emerald-700 mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Dữ liệu mới (Incoming)
                  </p>
                  <pre className="whitespace-pre-wrap text-slate-600 font-mono text-xs overflow-x-auto max-h-40">{JSON.stringify(item.incoming, null, 2)}</pre>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => handleDecision(item.id, 'KEEP_EXISTING')}
                  className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-all ${
                    (decisions[item.id] || 'KEEP_EXISTING') === 'KEEP_EXISTING' ? 'bg-red-50 text-red-700 border-red-300 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Giữ bản cũ
                </button>
                <button
                  onClick={() => handleDecision(item.id, 'MERGE')}
                  className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-all ${
                    decisions[item.id] === 'MERGE' ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Gộp dữ liệu (Merge)
                </button>
                <button
                  onClick={() => handleDecision(item.id, 'REPLACE_WITH_INCOMING')}
                  className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-all ${
                    decisions[item.id] === 'REPLACE_WITH_INCOMING' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Ghi đè bản mới
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 border-t bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
            Hủy bỏ
          </button>
          <button 
            onClick={handleApply}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Áp dụng và Đồng bộ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolverModal;