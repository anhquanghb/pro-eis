import React from 'react';
import { AppState, GeneralInfo, MissionConstituent, Mission } from '../types';
import { School, Building2, MapPin, Contact, Globe, User, PenTool, Target, Plus, Trash2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import FullFormatText from '../components/FullFormatText';
import ProgramManagementTab from './ProgramManagementTab';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const GeneralInfoModule: React.FC<Props> = ({ state, updateState }) => {
  const { globalState, programs, currentProgramId, language } = state;
  const tStrings = TRANSLATIONS[language];

  const [activeTab, setActiveTab] = React.useState<'general' | 'programs'>('general');

  // Fallback to flat state if relational state is not yet initialized
  const institutionInfo = globalState?.institutionInfo || state.generalInfo;
  const currentProgram = programs?.find(p => p.id === currentProgramId) || programs?.[0];
  const mission = currentProgram?.mission || state.mission;

  // --- Common Helpers ---
  const updateInstitutionField = (field: keyof typeof institutionInfo, value: any) => {
    updateState(prev => {
      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            institutionInfo: { ...prev.globalState.institutionInfo, [field]: value }
          }
        };
      }
      return {
        ...prev,
        generalInfo: { ...prev.generalInfo, [field]: value }
      };
    });
  };

  const updateInstitutionLangField = (field: keyof typeof institutionInfo, value: string) => {
    updateState(prev => {
      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            institutionInfo: {
              ...prev.globalState.institutionInfo,
              [field]: { ...(prev.globalState.institutionInfo as any)[field], [language]: value }
            }
          }
        };
      }
      return {
        ...prev,
        generalInfo: {
          ...prev.generalInfo,
          [field]: { ...(prev.generalInfo as any)[field], [language]: value }
        }
      };
    });
  };

  const updateProgramMission = (updater: (prevMission: Mission) => Mission) => {
    updateState(prev => {
      if (prev.programs && prev.currentProgramId) {
        return {
          ...prev,
          programs: prev.programs.map(p => 
            p.id === prev.currentProgramId 
              ? { ...p, mission: updater(p.mission) }
              : p
          )
        };
      }
      return {
        ...prev,
        mission: updater(prev.mission)
      };
    });
  };

  const updateMissionText = (text: string) => {
    updateProgramMission(prev => ({
      ...prev,
      text: { ...prev.text, [language]: text }
    }));
  };

  const addConstituent = () => {
    const newId = `MC-${Date.now()}`;
    const newConstituent: MissionConstituent = {
      id: newId,
      description: { vi: '', en: '' }
    };
    updateProgramMission(prev => ({
      ...prev,
      constituents: [...(prev.constituents || []), newConstituent]
    }));
  };

  const deleteConstituent = (id: string) => {
    if (window.confirm(language === 'vi' ? "Xoá thành phần này?" : "Delete this constituent?")) {
      updateProgramMission(prev => ({
        ...prev,
        constituents: (prev.constituents || []).filter(c => c.id !== id)
      }));
      
      updateState(prev => {
        if (prev.programs && prev.currentProgramId) {
          return {
            ...prev,
            programs: prev.programs.map(p => 
              p.id === prev.currentProgramId 
                ? { ...p, peoConstituentMap: (p.peoConstituentMap || []).filter(m => m.constituentId !== id) }
                : p
            )
          };
        }
        return {
          ...prev,
          peoConstituentMap: (prev.peoConstituentMap || []).filter(m => m.constituentId !== id)
        };
      });
    }
  };

  const updateConstituent = (id: string, text: string) => {
    updateProgramMission(prev => ({
      ...prev,
      constituents: (prev.constituents || []).map(c => 
        c.id === id ? { ...c, description: { ...c.description, [language]: text } } : c
      )
    }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-6 shrink-0">
        <button 
          onClick={() => setActiveTab('general')}
          className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          {language === 'vi' ? 'Thông tin chung' : 'General Info'}
        </button>
        <button 
          onClick={() => setActiveTab('programs')}
          className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'programs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          {language === 'vi' ? 'Các chương trình đào tạo' : 'Training Programs'}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'programs' ? (
          <ProgramManagementTab state={state} updateState={updateState} />
        ) : (
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in">
                
                {/* General Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InfoCard 
                        icon={<School className="text-indigo-500" />} 
                        title={language === 'vi' ? 'Đại học' : 'University'} 
                        value={institutionInfo.university?.[language] || ''}
                        onChange={(v) => updateInstitutionLangField('university', v)}
                    />
                    <InfoCard 
                        icon={<Building2 className="text-emerald-500" />} 
                        title={language === 'vi' ? 'Khoa/Trường' : 'School/Faculty'} 
                        value={institutionInfo.school?.[language] || ''}
                        onChange={(v) => updateInstitutionLangField('school', v)}
                    />
                    <InfoCard 
                        icon={<User className="text-pink-500" />} 
                        title={language === 'vi' ? 'Chức danh người ký' : 'Signer Title'} 
                        value={institutionInfo.signerTitle?.[language] || ''}
                        onChange={(v) => updateInstitutionLangField('signerTitle', v)}
                    />
                    <InfoCard 
                        icon={<PenTool className="text-orange-500" />} 
                        title={language === 'vi' ? 'Họ tên người ký' : 'Signer Name'} 
                        value={institutionInfo.signerName || ''}
                        onChange={(v) => updateInstitutionField('signerName', v)}
                    />
                    <InfoCard 
                        icon={<MapPin className="text-cyan-500" />} 
                        title={language === 'vi' ? 'Tỉnh/Thành phố' : 'City/Province'} 
                        value={institutionInfo.city?.[language] || ''}
                        onChange={(v) => updateInstitutionLangField('city', v)}
                    />
                    <InfoCard 
                        icon={<User className="text-blue-500" />} 
                        title={language === 'vi' ? 'Chức danh người duyệt' : 'Approver Title'} 
                        value={institutionInfo.approverTitle?.[language] || ''}
                        onChange={(v) => updateInstitutionLangField('approverTitle', v)}
                    />
                    <InfoCard 
                        icon={<PenTool className="text-red-500" />} 
                        title={language === 'vi' ? 'Họ tên người duyệt' : 'Approver Name'} 
                        value={institutionInfo.approverName || ''}
                        onChange={(v) => updateInstitutionField('approverName', v)}
                    />
                    <InfoCard 
                        icon={<Contact className="text-amber-500" />} 
                        title={language === 'vi' ? 'Thông tin liên hệ' : 'Contact Information'} 
                        value={institutionInfo.contact?.[language] || ''}
                        onChange={(v) => updateInstitutionLangField('contact', v)}
                        isTextArea={true}
                    />
                </div>

                {/* Mission Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <Globe size={18} className="text-indigo-500" />
                            <h3 className="font-bold text-slate-800 text-sm">{language === 'vi' ? 'Sứ mạng' : 'Mission'}</h3>
                        </div>
                        <div className="p-4">
                            <textarea 
                                className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 leading-relaxed resize-none transition-shadow focus:bg-white" 
                                value={mission?.text?.[language] || ''} 
                                onChange={(e) => updateMissionText(e.target.value)} 
                                placeholder={language === 'vi' ? "Nhập tuyên bố sứ mạng của chương trình..." : "Enter program mission statement..."}
                            />
                        </div>
                    </section>
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Target size={18} className="text-indigo-500" />
                                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{language === 'vi' ? 'Thành phần sứ mệnh' : 'Mission Constituents'}</h3>
                            </div>
                            <button onClick={addConstituent} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold flex items-center gap-1 transition-colors">
                                <Plus size={14} /> {language === 'vi' ? 'Thêm' : 'Add'}
                            </button>
                        </div>
                        <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1 max-h-[300px]">
                            {mission?.constituents?.map((c, idx) => (
                                <div key={c.id} className="flex gap-2 items-center group">
                                    <span className="text-[10px] font-bold text-slate-400 w-6">#{idx+1}</span>
                                    <input 
                                        className="flex-1 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        value={c.description?.[language] || ''} 
                                        onChange={(e) => updateConstituent(c.id, e.target.value)} 
                                        placeholder="..."
                                    />
                                    <button onClick={() => deleteConstituent(c.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <MapPin size={18} className="text-cyan-500" />
                            <h3 className="font-bold text-slate-800 text-sm">{language === 'vi' ? 'Cơ sở đào tạo' : 'Program Locations'}</h3>
                        </div>
                        <div className="p-4">
                            <FullFormatText 
                                value={institutionInfo.locations?.[language] || ''} 
                                onChange={(v) => updateInstitutionLangField('locations', v)}
                                placeholder="..."
                            />
                        </div>
                    </section>
                </div>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <Globe size={18} className="text-indigo-600" />
                        <h3 className="font-bold text-slate-800 text-sm">{language === 'vi' ? 'Công khai thông tin' : 'Public Disclosure'}</h3>
                    </div>
                    <div className="p-4">
                        <FullFormatText 
                            value={institutionInfo.publicDisclosure?.[language] || ''} 
                            onChange={(v) => updateInstitutionLangField('publicDisclosure', v)}
                            placeholder={language === 'vi' ? "Nhập thông tin công khai..." : "Enter public disclosure information..."}
                        />
                    </div>
                </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, value, onChange, isTextArea }: { icon: React.ReactNode, title: string, value: string, onChange: (v: string) => void, isTextArea?: boolean }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
    </div>
    {isTextArea ? (
      <textarea 
        className="w-full min-h-[100px] flex-1 p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <input 
        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
  </div>
);

export default GeneralInfoModule;