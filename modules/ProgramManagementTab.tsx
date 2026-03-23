
import React from 'react';
import { AppState, ProgramState } from '../types';
import { Plus, Trash2, CheckCircle2, XCircle, GraduationCap, Code, Layers, BookOpen, Globe } from 'lucide-react';
import { INITIAL_STATE } from '../constants';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const ProgramManagementTab: React.FC<Props> = ({ state, updateState }) => {
  const { programs, currentProgramId, language } = state;

  const addProgram = () => {
    const newId = `PROG-${Date.now()}`;
    const newProgram: ProgramState = {
      ...INITIAL_STATE.programs![0],
      id: newId,
      programName: { vi: 'Chương trình mới', en: 'New Program' },
      moetInfo: {
        ...INITIAL_STATE.programs![0].moetInfo,
        programName: { vi: 'Chương trình mới', en: 'New Program' },
      }
    };
    updateState(prev => ({
      ...prev,
      programs: [...(prev.programs || []), newProgram],
      currentProgramId: prev.currentProgramId || newId
    }));
  };

  const deleteProgram = (id: string) => {
    if (programs?.length === 1) {
      alert(language === 'vi' ? "Không thể xoá chương trình cuối cùng." : "Cannot delete the last program.");
      return;
    }
    if (window.confirm(language === 'vi' ? "Xoá chương trình này?" : "Delete this program?")) {
      updateState(prev => {
        const newPrograms = (prev.programs || []).filter(p => p.id !== id);
        return {
          ...prev,
          programs: newPrograms,
          currentProgramId: prev.currentProgramId === id ? newPrograms[0]?.id : prev.currentProgramId
        };
      });
    }
  };

  const selectProgram = (id: string) => {
    updateState(prev => ({ ...prev, currentProgramId: id }));
  };

  const updateProgramField = (id: string, field: string, value: any) => {
    updateState(prev => ({
      ...prev,
      programs: (prev.programs || []).map(p => {
        if (p.id !== id) return p;
        
        if (field === 'hasInternationalAccreditation') {
            return { ...p, hasInternationalAccreditation: value };
        }

        // Map UI fields to moetInfo fields
        const moetFieldMap: Record<string, string> = {
            'programName': 'programName',
            'programCode': 'majorCode', // "Mã ngành đào tạo"
            'degreeLevel': 'trainingType', // "Trình độ đào tạo"
            'trainingMode': 'trainingMode', // "Hình thức đào tạo"
            'degreeName': 'degreeName' // "Văn bằng tốt nghiệp"
        };

        const targetField = moetFieldMap[field];
        if (targetField) {
            const isLangField = ['programName', 'trainingType', 'trainingMode', 'degreeName'].includes(targetField);
            return {
                ...p,
                moetInfo: {
                    ...p.moetInfo,
                    [targetField]: isLangField 
                        ? { ...(p.moetInfo as any)[targetField], [language]: value }
                        : value
                }
            };
        }
        return p;
      })
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {language === 'vi' ? 'Quản lý chương trình đào tạo' : 'Program Management'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {language === 'vi' ? 'Thêm, sửa và chọn chương trình đào tạo để làm việc.' : 'Add, edit and select training programs to work with.'}
          </p>
        </div>
        <button 
          onClick={addProgram}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          <Plus size={20} /> {language === 'vi' ? 'Thêm chương trình' : 'Add Program'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {programs?.map(prog => (
          <div 
            key={prog.id} 
            className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${currentProgramId === prog.id ? 'border-indigo-600 shadow-lg shadow-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${currentProgramId === prog.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <input 
                      className="text-lg font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-full"
                      value={prog.moetInfo.programName[language] || ''}
                      onChange={(e) => updateProgramField(prog.id, 'programName', e.target.value)}
                      placeholder={language === 'vi' ? "Tên chương trình..." : "Program Name..."}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID: {prog.id}</span>
                      {currentProgramId === prog.id && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Active</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => selectProgram(prog.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentProgramId === prog.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {currentProgramId === prog.id ? (language === 'vi' ? 'Đang chọn' : 'Selected') : (language === 'vi' ? 'Chọn làm việc' : 'Select to work')}
                  </button>
                  <button 
                    onClick={() => deleteProgram(prog.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <Code size={12} /> {language === 'vi' ? 'Mã ngành đào tạo' : 'Major Code'}
                  </label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={prog.moetInfo.majorCode || ''}
                    onChange={(e) => updateProgramField(prog.id, 'programCode', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <Layers size={12} /> {language === 'vi' ? 'Trình độ đào tạo' : 'Degree Level'}
                  </label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={prog.moetInfo.trainingType[language] || ''}
                    onChange={(e) => updateProgramField(prog.id, 'degreeLevel', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <BookOpen size={12} /> {language === 'vi' ? 'Hình thức đào tạo' : 'Training Mode'}
                  </label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={prog.moetInfo.trainingMode[language] || ''}
                    onChange={(e) => updateProgramField(prog.id, 'trainingMode', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <GraduationCap size={12} /> {language === 'vi' ? 'Văn bằng tốt nghiệp' : 'Degree Name'}
                  </label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={prog.moetInfo.degreeName?.[language] || ''}
                    onChange={(e) => updateProgramField(prog.id, 'degreeName', e.target.value)}
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 mb-2">
                    <Globe size={12} /> {language === 'vi' ? 'Kiểm định quốc tế' : 'International Accreditation'}
                  </label>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => updateProgramField(prog.id, 'hasInternationalAccreditation', true)}
                      className={`flex items-center gap-2 text-sm font-bold transition-colors ${prog.hasInternationalAccreditation ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {prog.hasInternationalAccreditation ? <CheckCircle2 size={18} /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300" />}
                      {language === 'vi' ? 'Có' : 'Yes'}
                    </button>
                    <button 
                      onClick={() => updateProgramField(prog.id, 'hasInternationalAccreditation', false)}
                      className={`flex items-center gap-2 text-sm font-bold transition-colors ${!prog.hasInternationalAccreditation ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {!prog.hasInternationalAccreditation ? <CheckCircle2 size={18} /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300" />}
                      {language === 'vi' ? 'Không' : 'No'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramManagementTab;
