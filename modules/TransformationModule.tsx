
import React, { useState } from 'react';
import { AppState, MoetInfo } from '../types';
import { translateContent } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import AILoader from '../components/AILoader';
import { Layout, Sparkles, Download, FileType, BookOpen, Target, FileText, BoxSelect, Grid3X3, List, Settings, RefreshCw } from 'lucide-react';

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
  const { language, geminiConfig } = state;
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
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'objectives' | 'details' | 'structure' | 'blocks' | 'matrix' | 'config' | 'syllabi' | 'export'>('info');

  const tStrings = TRANSLATIONS[language];

  const handleAutoTranslate = async () => {
      setIsTranslating(true);
      try {
          const otherLang = language === 'vi' ? 'en' : 'vi';
          const targetLangName = language === 'vi' ? 'Vietnamese' : 'English';
          
          const structuralConfig = {
              ...geminiConfig,
              prompts: {
                  ...geminiConfig.prompts,
                  translation: `Translate the following educational content to ${targetLangName}.
CRITICAL INSTRUCTIONS:
1. **Preserve Structure**: Keep all HTML tags (<ul>, <li>, <p>, <b>, <i>), bullet points, and line breaks exactly as they are in the source. Do not flatten lists.
2. **Academic Tone**: Use formal, professional academic language suitable for University Program Specifications (MOET standards).
3. **Accuracy**: Translate the meaning accurately. Do not summarize.
4. **Output**: Return ONLY the translated string.

Content to translate: {text}`
              }
          };

          const fields: (keyof MoetInfo)[] = ['level', 'majorName', 'programName', 'trainingMode', 'trainingType','trainingLanguage', 'admissionTarget', 'admissionReq', 'graduationReq', 'gradingScale', 'implementationGuideline', 'referencedPrograms', 'generalObjectives'];
          const newMoet = { ...moetInfo };
          
          for (const f of fields) {
              const val = newMoet[f] as any;
              if (val && !val[language] && val[otherLang]) {
                  const trans = await translateContent(val[otherLang], language, structuralConfig);
                  if (trans) val[language] = trans;
              }
          }
          if (newMoet.specificObjectives) {
              for (const obj of newMoet.specificObjectives) {
                  if (obj.description && !obj.description[language] && obj.description[otherLang]) {
                      const trans = await translateContent(obj.description[otherLang], language, structuralConfig);
                      if (trans) obj.description[language] = trans;
                  }
              }
          }
          if (newMoet.moetSpecificObjectives) {
              for (const obj of newMoet.moetSpecificObjectives) {
                  if (obj.description && !obj.description[language] && obj.description[otherLang]) {
                      const trans = await translateContent(obj.description[otherLang], language, structuralConfig);
                      if (trans) obj.description[language] = trans;
                  }
              }
          }
          
          updateState(prev => {
              if (prev.currentProgramId && prev.programs) {
                  return {
                      ...prev,
                      programs: prev.programs.map(p => p.id === prev.currentProgramId ? { ...p, moetInfo: newMoet } : p)
                  };
              }
              return { ...prev, generalInfo: { ...prev.generalInfo, moetInfo: newMoet } };
          });
      } catch (e) {
          alert("Translation failed.");
      } finally { setIsTranslating(false); }
  };

  const handleAutoTransform = () => {
    if (!currentProgram) return;

    const peos = state.peos || state.globalState?.globalConfigs?.knowledgeAreas || []; // Fallback if peos not found
    const sos = state.sos || [];
    const knowledgeAreas = state.globalState?.globalConfigs?.knowledgeAreas || state.knowledgeAreas || [];

    const newMoet = { ...moetInfo };

    // 1. Map PEOs to moetSpecificObjectives (Mục tiêu cụ thể)
    if (state.peos && state.peos.length > 0) {
        newMoet.moetSpecificObjectives = state.peos.map(peo => ({
            id: peo.id,
            code: peo.code,
            level: 1,
            category: 'knowledge',
            description: peo.description
        }));
    }

    // 2. Map SOs to specificObjectives (Chuẩn đầu ra)
    if (sos.length > 0) {
        newMoet.specificObjectives = sos.map(so => ({
            id: so.id,
            code: so.code,
            level: 1,
            category: 'skills',
            description: so.description
        }));
    }

    // 3. Map KnowledgeAreas to structure (Cấu trúc chương trình)
    if (knowledgeAreas.length > 0 && (!newMoet.structure || newMoet.structure.length === 0)) {
        const courses = state.globalState?.courseCatalog || state.courses || [];
        newMoet.structure = knowledgeAreas.map((ka, idx) => ({
            id: ka.id,
            title: ka.name,
            level: 1,
            type: 'REQUIRED',
            order: idx + 1,
            courseIds: courses.filter(c => c.knowledgeAreaId === ka.id).map(c => c.id)
        }));
    }

    updateState(prev => {
        if (prev.currentProgramId && prev.programs) {
            return {
                ...prev,
                programs: prev.programs.map(p => p.id === prev.currentProgramId ? { ...p, moetInfo: newMoet } : p)
            };
        }
        return prev;
    });

    alert(language === 'vi' ? "Chuyển đổi dữ liệu thành công!" : "Data transformation successful!");
  };

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
      <AILoader isVisible={isTranslating} message={isTranslating ? (language === 'vi' ? 'Đang dịch...' : 'Translating...') : ''} />
      
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
              <button onClick={handleAutoTransform} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-100 transition shadow-sm">
                  <RefreshCw size={16} /> {language === 'vi' ? 'Đồng bộ dữ liệu' : 'Sync Data'}
              </button>
              <button onClick={handleAutoTranslate} disabled={isTranslating} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 transition shadow-sm disabled:opacity-50">
                  <Sparkles size={16} /> {tStrings.autoTranslate}
              </button>
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
