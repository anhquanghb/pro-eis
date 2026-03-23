import React from 'react';
import { RubricData, RubricLevel, RubricCriterion } from '../types';
import { Plus, Trash2 } from 'lucide-react';

const RubricEditor = ({ 
    rubric, 
    onChange, 
    language 
}: { 
    rubric: RubricData, 
    onChange: (rubric: RubricData) => void,
    language: 'vi' | 'en'
}) => {
    const addLevel = () => {
        const newLevel: RubricLevel = { id: `lvl-${Date.now()}`, label: { vi: 'Mức mới', en: 'New Level' }, score: 0 };
        onChange({ ...rubric, levels: [...rubric.levels, newLevel] });
    };

    const addCriterion = () => {
        const newCriterion: RubricCriterion = { 
            id: `crit-${Date.now()}`, 
            label: { vi: 'Tiêu chí mới', en: 'New Criterion' }, 
            weight: 0, 
            descriptions: {} 
        };
        onChange({ ...rubric, criteria: [...rubric.criteria, newCriterion] });
    };

    const updateLevel = (id: string, field: keyof RubricLevel, value: any) => {
        const nextLevels = rubric.levels.map(l => l.id === id ? { ...l, [field]: value } : l);
        onChange({ ...rubric, levels: nextLevels });
    };

    const updateLevelLang = (id: string, value: string) => {
        const nextLevels = rubric.levels.map(l => l.id === id ? { ...l, label: { ...l.label, [language]: value } } : l);
        onChange({ ...rubric, levels: nextLevels });
    };

    const updateCriterion = (id: string, field: keyof RubricCriterion, value: any) => {
        const nextCriteria = rubric.criteria.map(c => c.id === id ? { ...c, [field]: value } : c);
        onChange({ ...rubric, criteria: nextCriteria });
    };

    const updateCriterionLang = (id: string, value: string) => {
        const nextCriteria = rubric.criteria.map(c => c.id === id ? { ...c, label: { ...c.label, [language]: value } } : c);
        onChange({ ...rubric, criteria: nextCriteria });
    };

    const updateDescription = (critId: string, levelId: string, value: string) => {
        const nextCriteria = rubric.criteria.map(c => {
            if (c.id !== critId) return c;
            const nextDesc = { ...c.descriptions };
            nextDesc[levelId] = { ...(nextDesc[levelId] || { vi: '', en: '' }), [language]: value };
            return { ...c, descriptions: nextDesc };
        });
        onChange({ ...rubric, criteria: nextCriteria });
    };

    return (
        <div className="space-y-4 overflow-x-auto pb-4">
            <div className="flex justify-between items-center">
                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rubric Matrix</h6>
                <div className="flex gap-2">
                    <button onClick={addLevel} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 flex items-center gap-1"><Plus size={12}/> {language === 'vi' ? 'Thêm mức' : 'Add Level'}</button>
                    <button onClick={addCriterion} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 flex items-center gap-1"><Plus size={12}/> {language === 'vi' ? 'Thêm tiêu chí' : 'Add Criterion'}</button>
                </div>
            </div>
            
            <table className="w-full border-collapse text-[10px]">
                <thead>
                    <tr>
                        <th className="border border-slate-200 p-2 bg-slate-50 w-32">{language === 'vi' ? 'Tiêu chí' : 'Criterion'}</th>
                        <th className="border border-slate-200 p-2 bg-slate-50 w-16 text-center">{language === 'vi' ? 'Trọng số' : 'Weight'} (%)</th>
                        {rubric.levels.map(lvl => (
                            <th key={lvl.id} className="border border-slate-200 p-2 bg-slate-50 min-w-[120px]">
                                <div className="flex flex-col gap-1">
                                    <input 
                                        className="bg-transparent font-bold text-center outline-none border-b border-transparent focus:border-indigo-300" 
                                        value={lvl.label[language]} 
                                        onChange={e => updateLevelLang(lvl.id, e.target.value)}
                                        placeholder="Level..."
                                    />
                                    <div className="flex items-center justify-center gap-1">
                                        <input 
                                            type="number" 
                                            className="w-8 text-center bg-white border rounded" 
                                            value={lvl.score} 
                                            onChange={e => updateLevel(lvl.id, 'score', Number(e.target.value))}
                                        />
                                        <span className="opacity-50">pts</span>
                                        <button onClick={() => onChange({ ...rubric, levels: rubric.levels.filter(l => l.id !== lvl.id) })} className="text-slate-300 hover:text-red-500 ml-1"><Trash2 size={10}/></button>
                                    </div>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rubric.criteria.map(crit => (
                        <tr key={crit.id}>
                            <td className="border border-slate-200 p-2">
                                <div className="flex flex-col gap-1">
                                    <textarea 
                                        className="w-full bg-transparent outline-none resize-none font-bold" 
                                        rows={2} 
                                        value={crit.label[language]} 
                                        onChange={e => updateCriterionLang(crit.id, e.target.value)}
                                        placeholder="Criterion..."
                                    />
                                    <button onClick={() => onChange({ ...rubric, criteria: rubric.criteria.filter(c => c.id !== crit.id) })} className="text-slate-300 hover:text-red-500 self-end"><Trash2 size={10}/></button>
                                </div>
                            </td>
                            <td className="border border-slate-200 p-2 text-center">
                                <input 
                                    type="number" 
                                    className="w-10 text-center bg-transparent outline-none font-bold" 
                                    value={crit.weight} 
                                    onChange={e => updateCriterion(crit.id, 'weight', Number(e.target.value))}
                                />
                            </td>
                            {rubric.levels.map(lvl => (
                                <td key={lvl.id} className="border border-slate-200 p-2">
                                    <textarea 
                                        className="w-full bg-transparent outline-none resize-none min-h-[60px]" 
                                        value={crit.descriptions[lvl.id]?.[language] || ''} 
                                        onChange={e => updateDescription(crit.id, lvl.id, e.target.value)}
                                        placeholder="..."
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RubricEditor;
