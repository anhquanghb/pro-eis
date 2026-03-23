
import React, { useState } from 'react';
import { AppState } from '../../types';
import OutcomesModule from './OutcomesModule';
import StrategyModule from './StrategyModule';
import MappingModule from './MappingModule';
import { Award, Target, ShieldCheck, Table } from 'lucide-react';
import { TRANSLATIONS } from '../../constants';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const AccreditationModule: React.FC<Props> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'outcomes' | 'mapping'>('strategy');
  const t = TRANSLATIONS[state.language];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'strategy'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Target size={18} />
            {t.strategy}
          </button>
          <button
            onClick={() => setActiveTab('outcomes')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'outcomes'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Award size={18} />
            {t.outcomes}
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'mapping'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Table size={18} />
            {t.mapping}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <ShieldCheck size={16} className="text-indigo-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {state.language === 'vi' ? 'Module Kiểm định' : 'Accreditation Module'}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'strategy' ? (
          <StrategyModule state={state} updateState={updateState} />
        ) : activeTab === 'outcomes' ? (
          <OutcomesModule state={state} updateState={updateState} />
        ) : (
          <MappingModule state={state} updateState={updateState} />
        )}
      </div>
    </div>
  );
};

export default AccreditationModule;
