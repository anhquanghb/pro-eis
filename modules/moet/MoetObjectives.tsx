import React, { useState } from 'react';
import { AppState, MoetCategory, MoetObjective } from '../../types';
import { Target, Layout, Plus, Trash2, Link2, CheckSquare, BookOpen, GraduationCap, UserCog, Send } from 'lucide-react';
import FullFormatText from '../../components/FullFormatText';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MoetObjectives: React.FC<Props> = ({ state, updateState }) => {
  const globalState = state.globalState || state;
  const generalInfo = globalState.institutionInfo || state.generalInfo;
  const currentProgram = state.programs?.find(p => p.id === state.currentProgramId) || state;
  const peos = currentProgram.peos || state.peos || [];
  const sos = currentProgram.sos || state.sos || [];
  const { language } = state;
  const moetInfo = generalInfo.moetInfo;

  const [newObjDraft, setNewObjDraft] = useState<Partial<MoetObjective>>({ 
    code: '', 
    description: { vi: '', en: '' },
    competencyLevel: '',
    soIds: []
  });

  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);

  const handleAddNewObjective = () => {
    if (!newObjDraft.code) return;
    
    const newObj: MoetObjective = {
        id: `MO-${Date.now()}`,
        code: newObjDraft.code,
        description: (newObjDraft.description || { vi: '', en: '' }) as any,
        competencyLevel: newObjDraft.competencyLevel,
        soIds: newObjDraft.soIds || [],
        peoIds: []
    };
    
    updateMoetField('specificObjectives', [...(moetInfo.specificObjectives || []), newObj]);
    
    // Reset draft
    setNewObjDraft({ 
        code: '', 
        description: { vi: '', en: '' },
        competencyLevel: '',
        soIds: []
    });
  };

  const updateMoetField = (field: keyof typeof moetInfo, value: any) => {
    updateState(prev => {
      const prevGlobalState = prev.globalState || prev;
      const prevGeneralInfo = prevGlobalState.institutionInfo || prev.generalInfo;
      
      const updatedGeneralInfo = {
        ...prevGeneralInfo,
        moetInfo: { ...prevGeneralInfo.moetInfo, [field]: value }
      };

      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            institutionInfo: updatedGeneralInfo
          }
        };
      } else {
        return {
          ...prev,
          generalInfo: updatedGeneralInfo
        };
      }
    });
  };

  const updateMoetLangField = (field: keyof typeof moetInfo, value: string) => {
    const currentVal = (moetInfo[field] as any) || { vi: '', en: '' };
    updateMoetField(field, { ...currentVal, [language]: value });
  };

  // --- Actions ---
  const addMoetSpecificObjective = () => {
    const newObj: MoetObjective = {
        id: `MSO-${Date.now()}`, description: { vi: '', en: '' }, peoIds: []
    };
    updateMoetField('moetSpecificObjectives', [...(moetInfo.moetSpecificObjectives || []), newObj]);
  };

  const updateMoetSpecificObjectiveDesc = (id: string, val: string) => {
    const newObjs = (moetInfo.moetSpecificObjectives || []).map(o => o.id === id ? { ...o, description: { ...o.description, [language]: val } } : o);
    updateMoetField('moetSpecificObjectives', newObjs);
  };

  const updateMoetSpecificObjectiveCode = (id: string, code: string) => {
    const newObjs = (moetInfo.moetSpecificObjectives || []).map(o => o.id === id ? { ...o, code } : o);
    updateMoetField('moetSpecificObjectives', newObjs);
  };

  const updateMoetSpecificObjectiveCategory = (id: string, category: MoetCategory | '') => {
    const newObjs = (moetInfo.moetSpecificObjectives || []).map(o => o.id === id ? { ...o, category: category ? category : undefined } : o);
    updateMoetField('moetSpecificObjectives', newObjs);
  };

  const toggleMoetSpecificObjectivePeo = (objId: string, peoId: string) => {
    const newObjs = (moetInfo.moetSpecificObjectives || []).map(o => {
        if (o.id !== objId) return o;
        const currentPeos = o.peoIds || [];
        return {
            ...o,
            peoIds: currentPeos.includes(peoId) ? currentPeos.filter(id => id !== peoId) : [...currentPeos, peoId]
        };
    });
    updateMoetField('moetSpecificObjectives', newObjs);
  };

  const deleteMoetSpecificObjective = (id: string) => {
    updateMoetField('moetSpecificObjectives', (moetInfo.moetSpecificObjectives || []).filter(o => o.id !== id));
  };

  const addObjective = () => {
      const newObj: MoetObjective = {
          id: `MO-${Date.now()}`, description: { vi: '', en: '' }, peoIds: [], soIds: []
      };
      updateMoetField('specificObjectives', [...(moetInfo.specificObjectives || []), newObj]);
  };

  const updateObjectiveDesc = (id: string, val: string) => {
      const newObjs = (moetInfo.specificObjectives || []).map(o => o.id === id ? { ...o, description: { ...o.description, [language]: val } } : o);
      updateMoetField('specificObjectives', newObjs);
  };

  const updateObjectiveCode = (id: string, code: string) => {
      const newObjs = (moetInfo.specificObjectives || []).map(o => o.id === id ? { ...o, code } : o);
      updateMoetField('specificObjectives', newObjs);
  };

  const deleteObjective = (id: string) => {
      updateMoetField('specificObjectives', (moetInfo.specificObjectives || []).filter(o => o.id !== id));
  };

  const toggleObjectiveSo = (objId: string, soId: string) => {
      const newObjs = (moetInfo.specificObjectives || []).map(o => {
          if (o.id !== objId) return o;
          const currentSos = o.soIds || [];
          return {
              ...o,
              soIds: currentSos.includes(soId) ? currentSos.filter(id => id !== soId) : [...currentSos, soId]
          };
      });
      updateMoetField('specificObjectives', newObjs);
  };

  const updateObjectiveCompetency = (id: string, level: string) => {
    const newObjs = (moetInfo.specificObjectives || []).map(o => o.id === id ? { ...o, competencyLevel: level } : o);
    updateMoetField('specificObjectives', newObjs);
  };

  const getObjectiveLabel = (id: string) => {
      const obj = (moetInfo.specificObjectives || []).find(o => o.id === id);
      return obj?.code || '?';
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Target size={18} className="text-emerald-600"/>{language === 'vi' ? '2. Mục tiêu & Chuẩn đầu ra' : '2. Objectives & Outcomes'}</h3></div>
        <div className="p-6 space-y-10">
            {/* 2.1 */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        <Target size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{language === 'vi' ? '2.1 Mục tiêu chung' : '2.1 General Objectives'}</h3>
                </div>
                <FullFormatText value={moetInfo.generalObjectives[language]} onChange={v => updateMoetLangField('generalObjectives', v)} />
            </div>
            
            {/* 2.2 */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Layout size={18} className="text-indigo-600"/>{language === 'vi' ? '2.2 Mục tiêu cụ thể (MOET PLO)' : '2.2 Specific Objectives (MOET PLO)'}</label>
                    <button onClick={addMoetSpecificObjective} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-2"><Plus size={14} /> {language === 'vi' ? 'Thêm' : 'Add'}</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {(moetInfo.moetSpecificObjectives || []).map((obj, idx) => {
                      return (
                      <div key={obj.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'vi' ? 'Mục tiêu cụ thể' : 'Specific Objective'}</span>
                                  <select 
                                      className="ml-4 p-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600"
                                      value={obj.category || ''}
                                      onChange={e => updateMoetSpecificObjectiveCategory(obj.id, e.target.value as MoetCategory | '')}
                                  >
                                      <option value="">{language === 'vi' ? '-- Chọn loại --' : '-- Select category --'}</option>
                                      <option value="knowledge">{language === 'vi' ? 'Kiến thức' : 'Knowledge'}</option>
                                      <option value="skills">{language === 'vi' ? 'Kỹ năng' : 'Skills'}</option>
                                      <option value="learning">{language === 'vi' ? 'Năng lực tự chủ & Trách nhiệm' : 'Autonomy & Responsibility'}</option>
                                  </select>
                              </div>
                              <button onClick={() => deleteMoetSpecificObjective(obj.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              <div className="lg:col-span-8">
                                  <textarea className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 transition-colors min-h-[60px]" value={obj.description[language]} onChange={e => updateMoetSpecificObjectiveDesc(obj.id, e.target.value)} placeholder="..." />
                              </div>
                              <div className="lg:col-span-4 space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Link2 size={10}/> Linked PEOs</label><div className="flex flex-wrap gap-1">{peos.map(peo => (<button key={peo.id} onClick={() => toggleMoetSpecificObjectivePeo(obj.id, peo.id)} className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${obj.peoIds?.includes(peo.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'}`}>{peo.code}</button>))}</div></div>
                          </div>
                      </div>
                  )})}
                </div>
            </div>

            {/* 2.3 */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><CheckSquare size={18} className="text-blue-600"/>{language === 'vi' ? '2.3 Chuẩn đầu ra (Learning Outcomes)' : '2.3 Learning Outcomes'}</label>
                    <button onClick={addObjective} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2"><Plus size={14} /> {language === 'vi' ? 'Thêm' : 'Add'}</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {[...(moetInfo.specificObjectives || [])].sort((a,b) => (a.code || '').localeCompare(b.code || '', undefined, {numeric: true})).map(o => {
                      const level = o.code ? o.code.split('.').length : 3;
                      return (
                      <div key={o.id} className={`py-1 flex ${level < 3 ? 'items-center gap-3' : 'flex-col gap-1'} ${level === 1 ? 'ml-0' : level === 2 ? 'ml-8' : 'ml-16'}`}>
                          {level < 3 ? (
                              <div className="flex items-center gap-3 w-full" onClick={() => setEditingObjectiveId(o.id)}>
                                  {editingObjectiveId === o.id ? (
                                      <>
                                          <input 
                                              type="text" 
                                              className="w-16 p-1 text-xs font-bold border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-indigo-500 text-left shrink-0"
                                              value={o.code || ''}
                                              onChange={e => updateObjectiveCode(o.id, e.target.value)}
                                              onBlur={() => setEditingObjectiveId(null)}
                                              placeholder="1.1"
                                          />
                                          <input 
                                              type="text"
                                              className={`flex-1 p-1 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${level === 1 ? 'font-bold' : 'font-semibold'}`}
                                              value={o.description[language]} 
                                              onChange={e => updateObjectiveDesc(o.id, e.target.value)} 
                                              onBlur={() => setEditingObjectiveId(null)}
                                              placeholder="..."
                                          />
                                      </>
                                  ) : (
                                      <>
                                          <span className="w-16 p-1 text-xs font-bold text-left shrink-0">{o.code}</span>
                                          <span className={`flex-1 p-1 text-sm ${level === 1 ? 'font-bold' : 'font-semibold'}`}>{o.description[language]}</span>
                                      </>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); deleteObjective(o.id); }} className="text-slate-300 hover:text-red-500 transition-colors shrink-0"><Trash2 size={16}/></button>
                              </div>
                          ) : (
                               <div onClick={() => setEditingObjectiveId(o.id)}>
                                   <div className="flex justify-between items-start">
                                       <div className="flex items-center gap-3">
                                           {editingObjectiveId === o.id ? (
                                               <input 
                                                   type="text" 
                                                   className="w-16 p-1 text-xs font-bold border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-indigo-500 text-left"
                                                   value={o.code || ''}
                                                   onChange={e => updateObjectiveCode(o.id, e.target.value)}
                                                   onBlur={() => setEditingObjectiveId(null)}
                                                   placeholder="1.1.1"
                                               />
                                           ) : (
                                               <span className="w-16 p-1 text-xs font-bold text-left">{o.code}</span>
                                           )}
                                       </div>
                                       <button onClick={(e) => { e.stopPropagation(); deleteObjective(o.id); }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                   </div>
                                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                       <div className="lg:col-span-7">
                                           {editingObjectiveId === o.id ? (
                                               <textarea 
                                                   className="w-full p-2 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-indigo-500 transition-colors min-h-[60px]"
                                                   value={o.description[language]} 
                                                   onChange={e => updateObjectiveDesc(o.id, e.target.value)} 
                                                   onBlur={() => setEditingObjectiveId(null)}
                                                   placeholder="..."
                                               />
                                           ) : (
                                               <span className="w-full p-1 text-sm block leading-relaxed">{o.description[language]}</span>
                                           )}
                                       </div>
                                       <div className="lg:col-span-2">
                                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                                               {language === 'vi' ? 'Trình độ năng lực' : 'Competency'}
                                           </label>
                                           {editingObjectiveId === o.id ? (
                                               <select 
                                                   className="w-full p-1 text-xs border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-indigo-500"
                                                   value={o.competencyLevel || ''}
                                                   onChange={e => updateObjectiveCompetency(o.id, e.target.value)}
                                                   onBlur={() => setEditingObjectiveId(null)}
                                               >
                                                   <option value="">Level...</option>
                                                   <option value="I">I (Nhớ)</option>
                                                   <option value="II">II (Hiểu)</option>
                                                   <option value="III">III (Vận dụng)</option>
                                                   <option value="IV">IV (Phân tích)</option>
                                                   <option value="V">V (Đánh giá)</option>
                                                   <option value="VI">VI (Sáng tạo)</option>
                                               </select>
                                           ) : (
                                               <span className="text-xs p-1 block">{o.competencyLevel || ''}</span>
                                           )}
                                       </div>
                                       <div className="lg:col-span-3">
                                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                                               <Link2 size={10}/> {language === 'vi' ? 'Liên kết với SOs' : 'Linked SOs'}
                                           </label>
                                           <div className="flex flex-wrap gap-1">
                                               {sos.filter(so => editingObjectiveId === o.id || o.soIds?.includes(so.id)).map(so => (
                                                   <div key={so.id} className="relative group">
                                                       <button 
                                                           onClick={(e) => { e.stopPropagation(); toggleObjectiveSo(o.id, so.id); }} 
                                                           className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${o.soIds?.includes(so.id) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300'}`}
                                                       >
                                                           {so.code}
                                                       </button>
                                                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 translate-y-1 group-hover:translate-y-0">
                                                           <div className="font-black text-emerald-400 border-b border-slate-700 pb-1.5 mb-1.5 flex items-center gap-2">
                                                               <CheckSquare size={10}/> {so.code}
                                                           </div>
                                                           <div className="leading-relaxed opacity-90">
                                                               {so.description[language]}
                                                           </div>
                                                           <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                                                       </div>
                                                   </div>
                                               ))}
                                               {editingObjectiveId !== o.id && (!o.soIds || o.soIds.length === 0) && (
                                                   <span className="text-[10px] text-slate-300 italic">None</span>
                                               )}
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           )}
                       </div>
                   )})}

                  {/* New Objective Draft Form */}
                  <div className="mt-6 p-6 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                              <Plus size={16} />
                          </div>
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                              {language === 'vi' ? 'Thêm Chuẩn đầu ra mới' : 'Add New Learning Outcome'}
                          </span>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                          <div className="lg:col-span-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                  {language === 'vi' ? 'STT/Mã' : 'STT/Code'}
                              </label>
                              <input 
                                  type="text" 
                                  className="w-full p-2.5 text-sm font-bold border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-center shadow-sm"
                                  value={newObjDraft.code || ''}
                                  onChange={e => setNewObjDraft(prev => ({ ...prev, code: e.target.value }))}
                                  placeholder="1.1.1"
                              />
                          </div>
                          <div className="lg:col-span-10">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                  {language === 'vi' ? 'Mô tả nội dung' : 'Description'} ({language.toUpperCase()})
                              </label>
                              <textarea 
                                  className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] shadow-sm"
                                  value={newObjDraft.description?.[language] || ''}
                                  onChange={e => setNewObjDraft(prev => ({ 
                                      ...prev, 
                                      description: { ...(prev.description || { vi: '', en: '' }), [language]: e.target.value } as any 
                                  }))}
                                  placeholder={language === 'vi' ? 'Nhập nội dung chuẩn đầu ra...' : 'Enter learning outcome description...'}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                          {newObjDraft.code?.split('.').length === 3 && (
                              <div className="lg:col-span-4 animate-in zoom-in-95 duration-200">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                      {language === 'vi' ? 'Trình độ năng lực' : 'Competency'}
                                  </label>
                                  <select 
                                      className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                      value={newObjDraft.competencyLevel || ''}
                                      onChange={e => setNewObjDraft(prev => ({ ...prev, competencyLevel: e.target.value }))}
                                  >
                                      <option value="">{language === 'vi' ? 'Mức độ/Level...' : 'Level...'}</option>
                                      <option value="I">{language === 'vi' ? 'I (Nhớ)' : 'I (Remembering)'}</option>
                                      <option value="II">{language === 'vi' ? 'II (Hiểu)' : 'II (Understanding)'}</option>
                                      <option value="III">{language === 'vi' ? 'III (Vận dụng)' : 'III (Applying)'}</option>
                                      <option value="IV">{language === 'vi' ? 'IV (Phân tích)' : 'IV (Analyzing)'}</option>
                                      <option value="V">{language === 'vi' ? 'V (Đánh giá)' : 'V (Evaluating)'}</option>
                                      <option value="VI">{language === 'vi' ? 'VI (Sáng tạo)' : 'VI (Creating)'}</option>
                                  </select>
                              </div>
                          )}
                          <div className={newObjDraft.code?.split('.').length === 3 ? "lg:col-span-8" : "lg:col-span-12"}>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                  {language === 'vi' ? 'Liên kết với SOs của' : 'Linked international accreditation'}
                              </label>
                              <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-lg min-h-[42px] shadow-sm">
                                  {sos.map(so => (
                                      <div key={so.id} className="relative group">
                                          <button 
                                              onClick={() => setNewObjDraft(prev => {
                                                  const current = prev.soIds || [];
                                                  return {
                                                      ...prev,
                                                      soIds: current.includes(so.id) ? current.filter(id => id !== so.id) : [...current, so.id]
                                                  };
                                              })} 
                                              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${newObjDraft.soIds?.includes(so.id) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300'}`}
                                          >
                                              {so.code}
                                          </button>
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 translate-y-1 group-hover:translate-y-0">
                                              <div className="font-black text-emerald-400 border-b border-slate-700 pb-1.5 mb-1.5 flex items-center gap-2">
                                                  <CheckSquare size={10}/> {so.code}
                                              </div>
                                              <div className="leading-relaxed opacity-90">
                                                  {so.description[language]}
                                              </div>
                                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-end pt-2">
                          <button 
                              onClick={handleAddNewObjective}
                              disabled={!newObjDraft.code || !newObjDraft.description?.[language]}
                              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none group"
                          >
                              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                              {language === 'vi' ? 'Thêm Chuẩn đầu ra' : 'Add Learning Outcome'}
                          </button>
                      </div>
                  </div>
                </div>
            </div>

            {/* Competency Level Reference Table */}
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Các mức trình độ năng lực được đánh giá theo bảng sau:</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-200">
                                <th className="border border-slate-300 p-2 text-left">Nhóm</th>
                                <th className="border border-slate-300 p-2 text-left">Trình độ năng lực</th>
                                <th className="border border-slate-300 p-2 text-left">Mô tả</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-300 p-2">1. Nhớ</td>
                                <td className="border border-slate-300 p-2">0.0 – 2.0 (I)</td>
                                <td className="border border-slate-300 p-2">Có khả năng tìm kiếm và ghi nhớ.</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-300 p-2">2. Hiểu</td>
                                <td className="border border-slate-300 p-2">2.0 – 3.0 (II)</td>
                                <td className="border border-slate-300 p-2">Có hiểu biết/ Có thể tham gia.</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-300 p-2">3. Vận dụng</td>
                                <td className="border border-slate-300 p-2">3.0 – 3.5 (III)</td>
                                <td className="border border-slate-300 p-2">Có khả năng vận dụng.</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-300 p-2">4. Phân tích</td>
                                <td className="border border-slate-300 p-2">3.5 – 4.0 (IV)</td>
                                <td className="border border-slate-300 p-2">Có khả năng phân tích.</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-300 p-2">5. Đánh giá</td>
                                <td className="border border-slate-300 p-2">4.0 – 4.5 (V)</td>
                                <td className="border border-slate-300 p-2">Có khả năng đánh giá.</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-300 p-2">6. Sáng tạo</td>
                                <td className="border border-slate-300 p-2">4.5 – 5.0 (VI)</td>
                                <td className="border border-slate-300 p-2">Có khả năng sử dụng thông tin để sáng tạo cái mới.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
  );
};

export default MoetObjectives;
