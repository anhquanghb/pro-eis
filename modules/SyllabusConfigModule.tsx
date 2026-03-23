
import React, { useState, useEffect } from 'react';
import { AppState, TeachingMethod, AssessmentMethod, Language, KnowledgeArea, TeachingOrganizationCategory } from '../types';
import { TRANSLATIONS } from '../constants';
import { Plus, Trash2, Globe, Layers } from 'lucide-react';
import MoetBlocks from './moet/MoetBlocks';
import MappingCourseBlockModule from './mapping/MappingCourseBlockModule';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SyllabusConfigModule: React.FC<Props> = ({ state, updateState }) => {
  const globalConfigs = state.globalState?.globalConfigs || state;
  const { language } = state;
  const { teachingMethods, assessmentMethods, assessmentCategories, submissionMethods, assessmentTools, finalAssessmentMethods, creditBlocks } = globalConfigs;
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'teaching' | 'assessment' | 'areas' | 'categories' | 'submission' | 'tools' | 'finalAssessment' | 'creditBlocks' | 'moetBlocks'>('teaching');
  const [editLanguage, setEditLanguage] = useState<Language>(language);

  // Sync edit language with app language initially if needed, or keep independent
  useEffect(() => {
    setEditLanguage(language);
  }, [language]);

  const updateGlobalConfigs = (updater: (prevConfigs: any) => any) => {
    updateState(prev => {
        const prevConfigs = prev.globalState?.globalConfigs || prev;
        const nextConfigs = updater(prevConfigs);
        if (prev.globalState) {
            return {
                ...prev,
                globalState: {
                    ...prev.globalState,
                    globalConfigs: {
                        ...prev.globalState.globalConfigs,
                        ...nextConfigs
                    }
                }
            };
        }
        return { ...prev, ...nextConfigs };
    });
  };

  // --- Teaching Method Actions ---
  const addTeachingMethod = () => {
    const newMethod: TeachingMethod = {
      id: `tm-${Date.now()}`,
      code: 'NEW',
      name: { vi: 'Phương pháp mới', en: 'New Method' },
      description: { vi: '', en: '' },
      hoursPerCredit: 15,
      category: 'THEORY',
      category2: 'THEORY'
    };
    updateGlobalConfigs(prev => ({ teachingMethods: [...(prev.teachingMethods || []), newMethod] }));
  };

  const updateTeachingMethod = (id: string, field: keyof TeachingMethod | 'name' | 'description', value: any) => {
    updateGlobalConfigs(prev => ({
      teachingMethods: (prev.teachingMethods || []).map((m: any) => {
        if (m.id !== id) return m;
        
        // Handle Localized Strings based on current editLanguage
        if (field === 'name') {
            return { ...m, name: { ...m.name, [editLanguage]: value } };
        }
        if (field === 'description') {
            return { ...m, description: { ...(m.description || { vi: '', en: '' }), [editLanguage]: value } };
        }

        // Handle primitive fields
        return { ...m, [field]: value };
      })
    }));
  };

  const deleteTeachingMethod = (id: string) => {
    if (confirm(language === 'vi' ? 'Xóa phương pháp giảng dạy này?' : 'Delete this teaching method?')) {
      updateGlobalConfigs(prev => ({
        teachingMethods: (prev.teachingMethods || []).filter((m: any) => m.id !== id)
      }));
    }
  };

  // --- Assessment Method Actions ---
  const addAssessmentMethod = () => {
    const newMethod: AssessmentMethod = {
      id: `am-${Date.now()}`,
      name: { vi: 'Hình thức mới', en: 'New Assessment' }
    };
    updateGlobalConfigs(prev => ({ assessmentMethods: [...(prev.assessmentMethods || []), newMethod] }));
  };

  const updateAssessmentMethod = (id: string, value: string) => {
    updateGlobalConfigs(prev => ({
      assessmentMethods: (prev.assessmentMethods || []).map((m: any) => m.id === id ? { ...m, name: { ...m.name, [editLanguage]: value } } : m)
    }));
  };

  const deleteAssessmentMethod = (id: string) => {
    if (confirm(language === 'vi' ? 'Xóa hình thức đánh giá này?' : 'Delete this assessment method?')) {
      updateGlobalConfigs(prev => ({
        assessmentMethods: (prev.assessmentMethods || []).filter((m: any) => m.id !== id)
      }));
    }
  };

  // --- Assessment Category Actions ---
  const addAssessmentCategory = () => {
    const newCat = {
      id: `cat-${Date.now()}`,
      vi: 'Loại mới',
      en: 'New Category'
    };
    updateGlobalConfigs(prev => {
      const current = prev.assessmentCategories || [];
      const other = current.find((c: any) => c.id === 'OTHER');
      const others = current.filter((c: any) => c.id !== 'OTHER');
      return {
        assessmentCategories: other ? [...others, newCat, other] : [...others, newCat]
      };
    });
  };

  const updateAssessmentCategory = (id: string, field: 'vi' | 'en', value: string) => {
    updateGlobalConfigs(prev => ({
      assessmentCategories: (prev.assessmentCategories || []).map((c: any) => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const deleteAssessmentCategory = (id: string) => {
    if (id === 'OTHER') return;
    if (confirm(language === 'vi' ? 'Xóa loại đánh giá này?' : 'Delete this assessment category?')) {
      updateGlobalConfigs(prev => ({
        assessmentCategories: (prev.assessmentCategories || []).filter((c: any) => c.id !== id)
      }));
    }
  };

  // --- Submission Method Actions ---
  const addSubmissionMethod = () => {
    const newMethod = {
      id: `sub-${Date.now()}`,
      vi: 'Hình thức mới',
      en: 'New Method'
    };
    updateGlobalConfigs(prev => {
      const current = prev.submissionMethods || [];
      const other = current.find((c: any) => c.id === 'OTHER');
      const others = current.filter((c: any) => c.id !== 'OTHER');
      return {
        submissionMethods: other ? [...others, newMethod, other] : [...others, newMethod]
      };
    });
  };

  const updateSubmissionMethod = (id: string, field: 'vi' | 'en' | 'id', value: string) => {
    if (id === 'OTHER' && field === 'id') return;
    updateGlobalConfigs(prev => ({
      submissionMethods: (prev.submissionMethods || []).map((c: any) => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const deleteSubmissionMethod = (id: string) => {
    if (id === 'OTHER') return;
    if (confirm(language === 'vi' ? 'Xóa hình thức nộp bài này?' : 'Delete this submission method?')) {
      updateGlobalConfigs(prev => ({
        submissionMethods: (prev.submissionMethods || []).filter((c: any) => c.id !== id)
      }));
    }
  };

  // --- Assessment Tool Actions ---
  const addAssessmentTool = () => {
    const newTool = {
      id: `tool-${Date.now()}`,
      vi: 'Công cụ mới',
      en: 'New Tool'
    };
    updateGlobalConfigs(prev => {
      const current = prev.assessmentTools || [];
      const other = current.find((c: any) => c.id === 'OTHER');
      const others = current.filter((c: any) => c.id !== 'OTHER');
      return {
        assessmentTools: other ? [...others, newTool, other] : [...others, newTool]
      };
    });
  };

  const updateAssessmentTool = (id: string, field: 'vi' | 'en' | 'id', value: string) => {
    if (id === 'OTHER' && field === 'id') return;
    updateGlobalConfigs(prev => ({
      assessmentTools: (prev.assessmentTools || []).map((c: any) => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const deleteAssessmentTool = (id: string) => {
    if (id === 'OTHER') return;
    if (confirm(language === 'vi' ? 'Xóa công cụ kiểm tra này?' : 'Delete this assessment tool?')) {
      updateGlobalConfigs(prev => ({
        assessmentTools: (prev.assessmentTools || []).filter((c: any) => c.id !== id)
      }));
    }
  };

  // --- Final Assessment Method Actions ---
  const addFinalAssessmentMethod = () => {
    const newMethod = {
      id: `fam-${Date.now()}`,
      vi: 'Hình thức mới',
      en: 'New Method'
    };
    updateGlobalConfigs(prev => {
      const current = prev.finalAssessmentMethods || [];
      const other = current.find((c: any) => c.id === 'OTHER');
      const others = current.filter((c: any) => c.id !== 'OTHER');
      return {
        finalAssessmentMethods: other ? [...others, newMethod, other] : [...others, newMethod]
      };
    });
  };

  const updateFinalAssessmentMethod = (id: string, field: 'vi' | 'en' | 'id', value: string) => {
    if (id === 'OTHER' && field === 'id') return;
    updateGlobalConfigs(prev => ({
      finalAssessmentMethods: (prev.finalAssessmentMethods || []).map((c: any) => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const deleteFinalAssessmentMethod = (id: string) => {
    if (id === 'OTHER') return;
    if (confirm(language === 'vi' ? 'Xóa hình thức thi này?' : 'Delete this final assessment method?')) {
      updateGlobalConfigs(prev => ({
        finalAssessmentMethods: (prev.finalAssessmentMethods || []).filter((c: any) => c.id !== id)
      }));
    }
  };

  // --- Credit Block Actions ---
  const addCreditBlock = () => {
    const newBlock = {
      id: `cb-${Date.now()}`,
      code: 'NEW',
      name: { vi: 'Khối mới', en: 'New Block' },
      acronym: { vi: 'KM', en: 'NB' }
    };
    updateGlobalConfigs(prev => ({
      creditBlocks: [...(prev.creditBlocks || []), newBlock]
    }));
  };

  const updateCreditBlock = (id: string, field: 'code' | 'name' | 'acronym', value: any) => {
    updateGlobalConfigs(prev => ({
      creditBlocks: (prev.creditBlocks || []).map((b: any) => {
        if (b.id !== id) return b;
        if (field === 'name' || field === 'acronym') {
          return { ...b, [field]: { ...b[field], [editLanguage]: value } };
        }
        return { ...b, [field]: value };
      })
    }));
  };

  const deleteCreditBlock = (id: string) => {
    if (confirm(language === 'vi' ? 'Xóa khối tín chỉ này?' : 'Delete this credit block?')) {
      updateGlobalConfigs(prev => ({
        creditBlocks: (prev.creditBlocks || []).filter((b: any) => b.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-8 h-full">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab('teaching')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'teaching' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.teachingMethodology}
            </button>
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'assessment' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.assessmentMethods}
            </button>
            <button
              onClick={() => setActiveTab('areas')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'areas' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {language === 'vi' ? 'Khối kiến thức' : 'Knowledge Blocks'}
            </button>
            <button
              onClick={() => setActiveTab('creditBlocks')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'creditBlocks' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {language === 'vi' ? 'Khối Tín chỉ' : 'Credit Blocks'}
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {language === 'vi' ? 'Loại đánh giá' : 'Assessment Categories'}
            </button>
            <button
              onClick={() => setActiveTab('submission')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'submission' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {language === 'vi' ? 'Hình thức nộp' : 'Submission Methods'}
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'tools' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {language === 'vi' ? 'Công cụ kiểm tra' : 'Assessment Tools'}
            </button>
            <button
              onClick={() => setActiveTab('finalAssessment')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'finalAssessment' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {language === 'vi' ? 'Hình thức thi' : 'Final Assessment'}
            </button>
            <button
              onClick={() => setActiveTab('moetBlocks')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'moetBlocks' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {language === 'vi' ? 'Khối KT-KN' : 'Knowledge Blocks (MOET)'}
            </button>
          </div>

          {/* Removed LanguageSwitcher as it is now in the sidebar */}
      </div>

      {activeTab === 'teaching' && (
        <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-700">{t.teachingMethodology}</h3>
            <button onClick={addTeachingMethod} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 shadow-sm"><Plus size={14} /> {language === 'vi' ? 'Thêm phương pháp' : 'Add Method'}</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 font-bold text-slate-500 w-24">Code</th>
                  <th className="p-3 font-bold text-slate-500 w-64">{language === 'vi' ? 'Tên phương pháp' : 'Method Name'} ({editLanguage.toUpperCase()})</th>
                  <th className="p-3 font-bold text-slate-500">{t.description} ({editLanguage.toUpperCase()})</th>
                  <th className="p-3 font-bold text-slate-500 w-24 text-center">Hrs/Cr</th>
                  <th className="p-3 font-bold text-slate-500 w-32 text-center">{language === 'vi' ? 'Khối tín chỉ' : 'Credit Block'}</th>
                  <th className="p-3 font-bold text-slate-500 w-48 text-center">Hình thức tổ chức</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {teachingMethods.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 align-top group">
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded font-mono font-bold text-indigo-600 outline-none focus:bg-white focus:border-indigo-300" 
                            value={m.code} 
                            onChange={e => updateTeachingMethod(m.id, 'code', e.target.value)} 
                        />
                    </td>
                    <td className="p-2">
                        <div className="relative">
                            <input 
                                className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300 font-medium" 
                                value={m.name[editLanguage]} 
                                onChange={e => updateTeachingMethod(m.id, 'name', e.target.value)}
                                placeholder={editLanguage === 'vi' ? "Nhập tên..." : "Enter name..."}
                            />
                            {/* Missing Translation Indicator */}
                            {!m.name[editLanguage === 'vi' ? 'en' : 'vi'] && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" title="Missing translation in other language"></div>
                            )}
                        </div>
                    </td>
                    <td className="p-2">
                        <div className="relative">
                            <textarea 
                                className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none resize-none focus:bg-white focus:border-indigo-300 min-h-[40px]" 
                                rows={1} 
                                value={m.description?.[editLanguage] || ''} 
                                onChange={e => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                    updateTeachingMethod(m.id, 'description', e.target.value);
                                }} 
                                placeholder={editLanguage === 'vi' ? "Mô tả..." : "Description..."}
                            />
                        </div>
                    </td>
                    <td className="p-2">
                        <input 
                            type="number" 
                            className="w-full p-2 text-center bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                            value={m.hoursPerCredit} 
                            onChange={e => updateTeachingMethod(m.id, 'hoursPerCredit', parseInt(e.target.value) || 0)} 
                        />
                    </td>
                    <td className="p-2 text-center">
                      <select
                        className={`p-1.5 rounded text-[10px] font-bold outline-none border border-transparent hover:border-slate-200 cursor-pointer w-full focus:bg-white focus:border-indigo-300 ${m.category === 'THEORY' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}
                        value={m.category || 'THEORY'}
                        onChange={e => updateTeachingMethod(m.id, 'category', e.target.value)}
                      >
                        {(creditBlocks || []).map(cb => (
                          <option key={cb.id} value={cb.code}>
                            {cb.name[language]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 text-center">
                      <select
                        className="p-1.5 rounded text-[10px] font-bold outline-none border border-transparent hover:border-slate-200 cursor-pointer w-full focus:bg-white focus:border-indigo-300 bg-slate-50 text-slate-700"
                        value={m.category2 || 'THEORY'}
                        onChange={e => updateTeachingMethod(m.id, 'category2', e.target.value)}
                      >
                        <option value="THEORY">{language === 'vi' ? 'Lý thuyết' : 'Theory'}</option>
                        <option value="EXERCISE">{language === 'vi' ? 'Bài tập' : 'Exercise'}</option>
                        <option value="GROUP_DISCUSSION">{language === 'vi' ? 'Thảo luận nhóm' : 'Group Discussion'}</option>
                        <option value="PRACTICE_LAB_INTERNSHIP">{language === 'vi' ? 'Thực hành, thí nghiệm, thực tập' : 'Practice, Lab, Internship'}</option>
                        <option value="SELF_STUDY">{language === 'vi' ? 'SV tự nghiên cứu, tự học' : 'Self-study'}</option>
                      </select>
                    </td>
                    <td className="p-2 text-center pt-3">
                        <button onClick={() => deleteTeachingMethod(m.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'assessment' && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-700">{t.assessmentMethods}</h3>
            <button onClick={addAssessmentMethod} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 shadow-sm"><Plus size={14} /> {language === 'vi' ? 'Thêm hình thức' : 'Add Assessment'}</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 font-bold text-slate-500">{language === 'vi' ? 'Tên hình thức' : 'Assessment Name'} ({editLanguage.toUpperCase()})</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assessmentMethods.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 group">
                    <td className="p-2">
                        <div className="relative">
                            <input 
                                className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                                value={m.name[editLanguage]} 
                                onChange={e => updateAssessmentMethod(m.id, e.target.value)} 
                                placeholder={editLanguage === 'vi' ? "Tên hình thức..." : "Assessment name..."}
                            />
                             {!m.name[editLanguage === 'vi' ? 'en' : 'vi'] && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" title="Missing translation"></div>
                            )}
                        </div>
                    </td>
                    <td className="p-2 text-center">
                        <button onClick={() => deleteAssessmentMethod(m.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'creditBlocks' && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-700">{language === 'vi' ? 'Quản lý Khối Tín chỉ' : 'Credit Blocks Management'}</h3>
            <button onClick={addCreditBlock} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 shadow-sm"><Plus size={14} /> {language === 'vi' ? 'Thêm khối' : 'Add Block'}</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 font-bold text-slate-500 w-24">Code</th>
                  <th className="p-3 font-bold text-slate-500">{language === 'vi' ? 'Tên hiển thị' : 'Display Name'} ({editLanguage.toUpperCase()})</th>
                  <th className="p-3 font-bold text-slate-500 w-32">{language === 'vi' ? 'Viết tắt' : 'Acronym'} ({editLanguage.toUpperCase()})</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(creditBlocks || []).map(cb => (
                  <tr key={cb.id} className="hover:bg-slate-50 group">
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded font-mono font-bold text-indigo-600 outline-none focus:bg-white focus:border-indigo-300" 
                            value={cb.code} 
                            onChange={e => updateCreditBlock(cb.id, 'code', e.target.value)} 
                        />
                    </td>
                    <td className="p-2">
                        <div className="relative">
                            <input 
                                className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                                value={cb.name[editLanguage] || ''} 
                                onChange={e => updateCreditBlock(cb.id, 'name', e.target.value)} 
                                placeholder={editLanguage === 'vi' ? "Tên khối..." : "Block name..."}
                            />
                             {!cb.name[editLanguage === 'vi' ? 'en' : 'vi'] && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" title="Missing translation"></div>
                            )}
                        </div>
                    </td>
                    <td className="p-2">
                        <div className="relative">
                            <input 
                                className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300 font-mono" 
                                value={cb.acronym?.[editLanguage] || ''} 
                                onChange={e => updateCreditBlock(cb.id, 'acronym', e.target.value)} 
                                placeholder={editLanguage === 'vi' ? "Viết tắt..." : "Acronym..."}
                            />
                             {(!cb.acronym || !cb.acronym[editLanguage === 'vi' ? 'en' : 'vi']) && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" title="Missing translation"></div>
                            )}
                        </div>
                    </td>
                    <td className="p-2 text-center">
                        <button onClick={() => deleteCreditBlock(cb.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'categories' && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-700">{language === 'vi' ? 'Quản lý Loại Đánh giá' : 'Assessment Categories Management'}</h3>
            <button onClick={addAssessmentCategory} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 shadow-sm"><Plus size={14} /> {language === 'vi' ? 'Thêm loại' : 'Add Category'}</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 font-bold text-slate-500 w-32">ID</th>
                  <th className="p-3 font-bold text-slate-500">{language === 'vi' ? 'Tên (VI)' : 'Name (VI)'}</th>
                  <th className="p-3 font-bold text-slate-500">{language === 'vi' ? 'Tên (EN)' : 'Name (EN)'}</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(assessmentCategories || []).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 group">
                    <td className="p-2">
                        <input 
                            className={`w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded font-mono text-indigo-600 outline-none focus:bg-white focus:border-indigo-300 ${c.id === 'OTHER' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                            value={c.id} 
                            disabled={c.id === 'OTHER'}
                            onChange={e => {
                                const newId = e.target.value;
                                updateState(prev => ({
                                    ...prev,
                                    assessmentCategories: prev.assessmentCategories.map(cat => cat.id === c.id ? { ...cat, id: newId } : cat)
                                }));
                            }}
                        />
                    </td>
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                            value={c.vi} 
                            onChange={e => updateAssessmentCategory(c.id, 'vi', e.target.value)} 
                        />
                    </td>
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                            value={c.en} 
                            onChange={e => updateAssessmentCategory(c.id, 'en', e.target.value)} 
                        />
                    </td>
                    <td className="p-2 text-center">
                        {c.id !== 'OTHER' && (
                            <button onClick={() => deleteAssessmentCategory(c.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'submission' && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-700">{language === 'vi' ? 'Quản lý Hình thức nộp bài' : 'Submission Methods Management'}</h3>
            <button onClick={addSubmissionMethod} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 shadow-sm"><Plus size={14} /> {language === 'vi' ? 'Thêm hình thức' : 'Add Method'}</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 font-bold text-slate-500 w-32">ID</th>
                  <th className="p-3 font-bold text-slate-500">{language === 'vi' ? 'Tên (VI)' : 'Name (VI)'}</th>
                  <th className="p-3 font-bold text-slate-500">{language === 'vi' ? 'Tên (EN)' : 'Name (EN)'}</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(submissionMethods || []).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 group">
                    <td className="p-2">
                        <input 
                            className={`w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded font-mono text-indigo-600 outline-none focus:bg-white focus:border-indigo-300 ${c.id === 'OTHER' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                            value={c.id} 
                            disabled={c.id === 'OTHER'}
                            onChange={e => updateSubmissionMethod(c.id, 'id', e.target.value)}
                        />
                    </td>
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                            value={c.vi} 
                            onChange={e => updateSubmissionMethod(c.id, 'vi', e.target.value)} 
                        />
                    </td>
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                            value={c.en} 
                            onChange={e => updateSubmissionMethod(c.id, 'en', e.target.value)} 
                        />
                    </td>
                    <td className="p-2 text-center">
                        {c.id !== 'OTHER' && (
                            <button onClick={() => deleteSubmissionMethod(c.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'tools' && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-700">{language === 'vi' ? 'Quản lý Công cụ kiểm tra' : 'Assessment Tools Management'}</h3>
            <button onClick={addAssessmentTool} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 shadow-sm"><Plus size={14} /> {language === 'vi' ? 'Thêm công cụ' : 'Add Tool'}</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 font-bold text-slate-500 w-32">ID</th>
                  <th className="p-3 font-bold text-slate-500">{language === 'vi' ? 'Tên (VI)' : 'Name (VI)'}</th>
                  <th className="p-3 font-bold text-slate-500">{language === 'vi' ? 'Tên (EN)' : 'Name (EN)'}</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(assessmentTools || []).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 group">
                    <td className="p-2">
                        <input 
                            className={`w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded font-mono text-indigo-600 outline-none focus:bg-white focus:border-indigo-300 ${c.id === 'OTHER' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                            value={c.id} 
                            disabled={c.id === 'OTHER'}
                            onChange={e => updateAssessmentTool(c.id, 'id', e.target.value)}
                        />
                    </td>
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                            value={c.vi} 
                            onChange={e => updateAssessmentTool(c.id, 'vi', e.target.value)} 
                        />
                    </td>
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                            value={c.en} 
                            onChange={e => updateAssessmentTool(c.id, 'en', e.target.value)} 
                        />
                    </td>
                    <td className="p-2 text-center">
                        {c.id !== 'OTHER' && (
                            <button onClick={() => deleteAssessmentTool(c.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'finalAssessment' && (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{language === 'vi' ? 'Hình thức thi' : 'Final Assessment Methods'}</h3>
              <p className="text-sm text-slate-500">{language === 'vi' ? 'Quản lý danh sách các hình thức thi kết thúc học phần.' : 'Manage the list of final assessment methods.'}</p>
            </div>
            <button onClick={addFinalAssessmentMethod} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold shadow-sm">
              <Plus size={16} /> {language === 'vi' ? 'Thêm hình thức' : 'Add Method'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3 w-32">ID</th>
                  <th className="p-3">{language === 'vi' ? 'Tên (Tiếng Việt)' : 'Name (Vietnamese)'}</th>
                  <th className="p-3">{language === 'vi' ? 'Tên (Tiếng Anh)' : 'Name (English)'}</th>
                  <th className="p-3 w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(finalAssessmentMethods || []).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300 font-mono text-xs text-slate-500" 
                            value={c.id} 
                            onChange={e => updateFinalAssessmentMethod(c.id, 'id', e.target.value)} 
                            disabled={c.id === 'OTHER'}
                        />
                    </td>
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                            value={c.vi} 
                            onChange={e => updateFinalAssessmentMethod(c.id, 'vi', e.target.value)} 
                        />
                    </td>
                    <td className="p-2">
                        <input 
                            className="w-full p-2 bg-transparent border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-300" 
                            value={c.en} 
                            onChange={e => updateFinalAssessmentMethod(c.id, 'en', e.target.value)} 
                        />
                    </td>
                    <td className="p-2 text-center">
                        {c.id !== 'OTHER' && (
                            <button onClick={() => deleteFinalAssessmentMethod(c.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'areas' && (
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2">
            <MappingCourseBlockModule 
                knowledgeAreas={globalConfigs.knowledgeAreas || state.knowledgeAreas || []}
                courses={state.globalState?.courseCatalog || state.courses}
                updateState={updateState}
                language={language}
            />
        </div>
      )}
      {activeTab === 'moetBlocks' && (
        <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <MoetBlocks state={state} updateState={updateState} />
        </div>
      )}
    </div>
  );
};

export default SyllabusConfigModule;
