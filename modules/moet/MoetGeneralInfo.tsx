
import React from 'react';
import { AppState, GeneralInfo, MoetProgramFaculty } from '../../types';
import { BookOpen, Plus, Trash2, UserCog } from 'lucide-react';
import { InputField } from './MoetShared';
import FullFormatText from '../../components/FullFormatText';

// 1. IMPORT MODULE JSON

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MoetGeneralInfo: React.FC<Props> = ({ state, updateState }) => {
  const { language } = state;
  const currentProgram = state.programs?.find(p => p.id === state.currentProgramId);
  const moetInfo = currentProgram?.moetInfo || state.generalInfo?.moetInfo || {
    level: { vi: '', en: '' },
    majorName: { vi: '', en: '' },
    majorCode: '',
    programName: { vi: '', en: '' },
    programCode: '',
    specializations: [],
    trainingMode: { vi: '', en: '' },
    trainingLanguage: { vi: '', en: '' },
    trainingOrientation: { vi: '', en: '' },
    duration: '',
    numSemesters: 8,
    minCredits: 0,
    degreeName: { vi: '', en: '' },
    trainingType: { vi: '', en: '' },
    legalBasis: { vi: '', en: '' },
    programFaculty: []
  };

  const updateMoetField = (field: keyof typeof moetInfo, value: any) => {
    updateState(prev => {
      if (prev.currentProgramId) {
        return {
          ...prev,
          programs: prev.programs.map(p => 
            p.id === prev.currentProgramId 
              ? { ...p, moetInfo: { ...p.moetInfo, [field]: value } }
              : p
          )
        };
      }
      return {
        ...prev,
        generalInfo: {
          ...prev.generalInfo,
          moetInfo: { ...prev.generalInfo.moetInfo, [field]: value }
        }
      };
    });
  };

  const updateMoetLangField = (field: keyof typeof moetInfo, value: string) => {
    const currentVal = (moetInfo[field] as any) || { vi: '', en: '' };
    updateMoetField(field, { ...currentVal, [language]: value });
  };

  // Program Faculty Actions
  const addProgramFaculty = () => {
    const newItem: MoetProgramFaculty = {
      id: `pf-${Date.now()}`,
      fullNameYearPosition: '',
      degreeCountryYear: '',
      major: '',
      teachingExperience: ''
    };
    updateMoetField('programFaculty', [...(moetInfo.programFaculty || []), newItem]);
  };

  const updateProgramFaculty = (id: string, field: keyof MoetProgramFaculty, value: string) => {
    updateMoetField('programFaculty', (moetInfo.programFaculty || []).map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const deleteProgramFaculty = (id: string) => {
    updateMoetField('programFaculty', (moetInfo.programFaculty || []).filter(f => f.id !== id));
  };

  return (
    <div className="space-y-10">
      {/* 1. Basic Info */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen size={18} className="text-emerald-600"/>{language === 'vi' ? '1. Thông tin chung' : '1. General Information'}</h3></div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label={language === 'vi' ? 'Trình độ đào tạo' : 'Training Level'} value={moetInfo.level?.[language] || ''} onChange={v => updateMoetLangField('level', v)} placeholder="e.g. Đại học" />
              <InputField label={language === 'vi' ? 'Ngành đào tạo' : 'Major Name'} value={moetInfo.majorName?.[language] || ''} onChange={v => updateMoetLangField('majorName', v)} placeholder="e.g. Kỹ thuật Điện" />
              <InputField label={language === 'vi' ? 'Mã ngành đào tạo' : 'Major Code'} value={moetInfo.majorCode || ''} onChange={v => updateMoetField('majorCode', v)} placeholder="e.g. 7520201" />
              <InputField label={language === 'vi' ? 'Tên chương trình đào tạo' : 'Program Name'} value={moetInfo.programName?.[language] || ''} onChange={v => updateMoetLangField('programName', v)} placeholder="" />
              <InputField label={language === 'vi' ? 'Mã chương trình đào tạo' : 'Program Code'} value={moetInfo.programCode || ''} onChange={v => updateMoetField('programCode', v)} placeholder="" />
              
              <div className="col-span-full space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {language === 'vi' ? 'Các chuyên ngành' : 'Specializations'}
                  </label>
                  <button 
                    onClick={() => updateMoetField('specializations', [...(moetInfo.specializations || []), { vi: '', en: '' }])}
                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 flex items-center gap-1"
                  >
                    <Plus size={12} /> {language === 'vi' ? 'Thêm chuyên ngành' : 'Add Specialization'}
                  </button>
                </div>
                <div className="space-y-2">
                  {(moetInfo.specializations || []).map((spec, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        className="flex-1 p-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                        value={spec?.[language] || ''}
                        onChange={e => {
                          const next = [...(moetInfo.specializations || [])];
                          next[idx] = { ...next[idx], [language]: e.target.value };
                          updateMoetField('specializations', next);
                        }}
                        placeholder="..."
                      />
                      <button 
                        onClick={() => updateMoetField('specializations', (moetInfo.specializations || []).filter((_, i) => i !== idx))}
                        className="text-slate-300 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <InputField label={language === 'vi' ? 'Hình thức đào tạo' : 'Training Mode'} value={moetInfo.trainingMode?.[language] || ''} onChange={v => updateMoetLangField('trainingMode', v)} placeholder="e.g. Chính quy" />
              <InputField label={language === 'vi' ? 'Ngôn ngữ đào tạo' : 'Training Language'} value={moetInfo.trainingLanguage?.[language] || ''} onChange={v => updateMoetLangField('trainingLanguage', v)} placeholder="e.g. Tiếng Việt" />
              <InputField label={language === 'vi' ? 'Định hướng đào tạo' : 'Training Orientation'} value={moetInfo.trainingOrientation?.[language] || ''} onChange={v => updateMoetLangField('trainingOrientation', v)} placeholder="e.g. Định hướng nghề nghiệp" />
              <InputField label={language === 'vi' ? 'Thời gian đào tạo (năm)' : 'Duration (years)'} value={moetInfo.duration || ''} onChange={v => updateMoetField('duration', v)} placeholder="e.g. 4" />
              <InputField label={language === 'vi' ? 'Số học kỳ' : 'Number of Semesters'} value={moetInfo.numSemesters?.toString() || ''} onChange={v => updateMoetField('numSemesters', parseInt(v) || 0)} type="number" />
              <InputField label={language === 'vi' ? 'Số tín chỉ tích lũy tối thiểu' : 'Min Cumulative Credits'} value={moetInfo.minCredits?.toString() || ''} onChange={v => updateMoetField('minCredits', parseInt(v) || 0)} type="number" />
              <InputField label={language === 'vi' ? 'Văn bằng tốt nghiệp' : 'Graduation Diploma'} value={moetInfo.degreeName?.[language] || ''} onChange={v => updateMoetLangField('degreeName', v)} placeholder="e.g. Cử nhân" />
              <InputField label={language === 'vi' ? 'Phương thức đào tạo' : 'Training Type'} value={moetInfo.trainingType?.[language] || ''} onChange={v => updateMoetLangField('trainingType', v)} placeholder="Tập trung" />
              
              <div className="col-span-full">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                  {language === 'vi' ? 'Căn cứ xây dựng CTĐT' : 'Basis for Program Development'}
                </label>
                <FullFormatText value={moetInfo.legalBasis?.[language] || ''} onChange={v => updateMoetLangField('legalBasis', v)} />
              </div>
          </div>
      </section>

      {/* 2. Program Faculty */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><UserCog size={18} className="text-emerald-600"/>{language === 'vi' ? 'Danh sách nhân sự phụ trách ngành' : 'List of Program Faculty'}</h3>
              <button onClick={addProgramFaculty} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-2"><Plus size={14}/> Add</button>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                          <th className="p-3 text-xs font-bold text-slate-500 w-12">TT</th>
                          <th className="p-3 text-xs font-bold text-slate-500">Họ và tên, năm sinh, chức vụ hiện tại</th>
                          <th className="p-3 text-xs font-bold text-slate-500">Học vị, nước, năm tốt nghiệp</th>
                          <th className="p-3 text-xs font-bold text-slate-500">Chuyên ngành đào tạo</th>
                          <th className="p-3 text-xs font-bold text-slate-500">Năm, nơi tham gia giảng dạy</th>
                          <th className="p-3 w-10"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {(moetInfo.programFaculty || []).map((f, idx) => (
                          <tr key={f.id}>
                              <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                              <td className="p-2"><input className="w-full bg-transparent outline-none border-b border-transparent focus:border-indigo-300" value={f.fullNameYearPosition} onChange={e => updateProgramFaculty(f.id, 'fullNameYearPosition', e.target.value)} /></td>
                              <td className="p-2"><input className="w-full bg-transparent outline-none border-b border-transparent focus:border-indigo-300" value={f.degreeCountryYear} onChange={e => updateProgramFaculty(f.id, 'degreeCountryYear', e.target.value)} /></td>
                              <td className="p-2"><input className="w-full bg-transparent outline-none border-b border-transparent focus:border-indigo-300" value={f.major} onChange={e => updateProgramFaculty(f.id, 'major', e.target.value)} /></td>
                              <td className="p-2"><input className="w-full bg-transparent outline-none border-b border-transparent focus:border-indigo-300" value={f.teachingExperience} onChange={e => updateProgramFaculty(f.id, 'teachingExperience', e.target.value)} /></td>
                              <td className="p-2 text-center"><button onClick={() => deleteProgramFaculty(f.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button></td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </section>
    </div>
  );
};

export default MoetGeneralInfo;