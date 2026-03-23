
import React, { useState } from 'react';
import { AppState, MoetInfo } from '../types';
import { TRANSLATIONS } from '../constants';
import { Layout, Download, BookOpen, Target, FileText, BoxSelect, Grid3X3, List, Settings } from 'lucide-react';

// Import sub-modules
import MoetGeneralInfo from './moet/MoetGeneralInfo';
import MoetObjectives from './moet/MoetObjectives';
import MoetDetails from './moet/MoetDetails';
import MoetStructure from './moet/MoetStructure';
import MoetMatrix from './moet/MoetMatrix';
import MoetSyllabi from './moet/MoetSyllabi';
import MoetExport from './moet/MoetExport';
import SyllabusConfigModule from './SyllabusConfigModule';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const TransformationModule: React.FC<Props> = ({ state, updateState }) => {
  const { language } = state;
  const currentProgram = state.programs?.find(p => p.id === state.currentProgramId);
  const moetInfo = currentProgram?.moetInfo || (state as any).moetInfo || (state.generalInfo as any)?.moetInfo || {
    programName: { vi: '', en: '' },
    programCode: '',
    majorName: { vi: '', en: '' },
    majorCode: '',
    level: { vi: '', en: '' },
    trainingMode: { vi: '', en: '' },
    trainingType: { vi: '', en: '' },
    trainingLanguage: { vi: '', en: '' },
    admissionTarget: { vi: '', en: '' },
    admissionReq: { vi: '', en: '' },
    graduationReq: { vi: '', en: '' },
    gradingScale: { vi: '', en: '' },
    implementationGuideline: { vi: '', en: '' },
    referencedPrograms: { vi: '', en: '' },
    generalObjectives: { vi: '', en: '' },
    moetSpecificObjectives: [],
    specificObjectives: []
  };
  
  const [activeTab, setActiveTab] = useState<'info' | 'objectives' | 'details' | 'structure' | 'blocks' | 'matrix' | 'config' | 'syllabi' | 'export'>('info');

  const tStrings = TRANSLATIONS[language];

  const tabs = [
      { id: 'info', label: language === 'vi' ? 'Thông tin chung' : 'General Info', icon: BookOpen },
      { id: 'objectives', label: language === 'vi' ? 'Mục tiêu & CĐR' : 'Objectives', icon: Target },
      { id: 'details', label: language === 'vi' ? 'Thông tin chi tiết' : 'Details', icon: FileText },
      { id: 'structure', label: language === 'vi' ? 'Cấu trúc CT' : 'Structure', icon: BoxSelect },
      { id: 'matrix', label: language === 'vi' ? 'Ma trận' : 'Matrix', icon: Grid3X3 },
      { id: 'config', label: language === 'vi' ? 'Cấu hình chung' : 'General Config', icon: Settings },
      { id: 'syllabi', label: language === 'vi' ? 'Học phần' : 'Courses', icon: List },
      { id: 'export', label: language === 'vi' ? 'Xuất bản' : 'Export', icon: Download },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg text-white"><Layout size={20} /></div>
              <div>
                  <h2 className="text-lg font-bold text-slate-800">{language === 'vi' ? 'Chương trình đào tạo (MOET)' : 'Program Specification (MOET)'}</h2>
                  <p className="text-xs text-slate-500">{language === 'vi' ? 'Chuyển đổi dữ liệu sang định dạng Bộ GD&ĐT' : 'Transform data to Ministry of Education format'}</p>
              </div>
          </div>
          <div className="flex gap-2">
          </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-1 overflow-x-auto shrink-0">
          {tabs.map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                  <tab.icon size={14}/> {tab.label}
              </button>
          ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300 h-full">
              {activeTab === 'info' && <MoetGeneralInfo state={state} updateState={updateState} />}
              {activeTab === 'objectives' && <MoetObjectives state={state} updateState={updateState} />}
              {activeTab === 'details' && <MoetDetails state={state} updateState={updateState} />}
              {activeTab === 'structure' && <MoetStructure state={state} updateState={updateState} />}
              {activeTab === 'matrix' && <MoetMatrix state={state} updateState={updateState} />}
              {activeTab === 'config' && <SyllabusConfigModule state={state} updateState={updateState} />}
              {activeTab === 'syllabi' && <MoetSyllabi state={state} updateState={updateState} />}
              {activeTab === 'export' && <MoetExport state={state} />}
          </div>
      </div>
    </div>
  );
};

export default TransformationModule;
