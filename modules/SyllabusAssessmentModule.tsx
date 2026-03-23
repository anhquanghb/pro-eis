import React, { useState } from 'react';
import { AppState, Course, AssessmentConfigType } from '../types';
import { TRANSLATIONS, INITIAL_STATE } from '../constants';
import { 
    Percent, 
    AlertCircle, 
    Check, 
    Plus, 
    Trash2, 
    BookOpen, 
    PenTool, 
    Layout 
} from 'lucide-react';
import RubricEditor from '../components/RubricEditor';
import FullFormatText from '../components/FullFormatText';

interface AssessmentProps {
    course: Course;
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
}

const SyllabusAssessmentModule: React.FC<AssessmentProps> = ({ course, state, updateState }) => {
    const { language } = state;
    const t = TRANSLATIONS[language];

    // State quản lý việc thu gọn / mở rộng bảng chọn hình thức
    const [isFormExpanded, setIsFormExpanded] = useState<boolean>(!course.assessmentConfigType);

    const updateCourse = (updates: Partial<Course>) => {
        updateState(prev => ({
            ...prev,
            courses: prev.courses.map(c => c.id === course.id ? { ...c, ...updates } : c)
        }));
    };

    // --- LOGIC TÍNH TOÁN & LABELS ---
    const theoryConfig = course.theoryAssessmentConfig;
    const finalExamForms = theoryConfig?.finalExamForms ?? [];
    const finalExamFormsSum = finalExamForms.reduce((sum, f) => sum + (Number(f.weight) || 0), 0);

    const globalConfigs = state.globalState?.globalConfigs || state;

    const getAssessmentCategoryLabel = (categoryId: string) => {
        const category = globalConfigs.assessmentCategories?.find(c => c.id === categoryId);
        return category ? category[language] : categoryId;
    };

    const assessmentOptions: { type: AssessmentConfigType, icon: any, labelVi: string, labelEn: string }[] = [
        { type: 'THEORY', icon: BookOpen, labelVi: "Lý thuyết hoặc vừa lý thuyết vừa thực hành", labelEn: "Theory or Theory & Practice" },
        { type: 'PRACTICE', icon: PenTool, labelVi: "Học phần thực hành", labelEn: "Practice Course" },
        { type: 'PROJECT', icon: Layout, labelVi: "Học phần đồ án hoặc bài tập lớn", labelEn: "Project or Major Assignment" }
    ];

    const sortedCategories = [...(globalConfigs.assessmentCategories || [])].sort((a, b) => a.id === 'OTHER' ? 1 : -1);
    const sortedSubmissionMethods = [...(globalConfigs.submissionMethods || [])].sort((a, b) => a.id === 'OTHER' ? 1 : -1);
    const sortedFinalAssessmentMethods = [...(globalConfigs.finalAssessmentMethods || [])].sort((a, b) => a.id === 'OTHER' ? 1 : -1);
    const sortedAssessmentTools = [...(globalConfigs.assessmentTools || [])].sort((a, b) => a.id === 'OTHER' ? 1 : -1);

    // Trạng thái hình thức đánh giá đang được chọn
    const activeType = course.assessmentConfigType;

    // Phân rã 4 nhóm bài kiểm tra theo trọng số để tạo bảng độc lập (Theory)
    const testGroups = [
        { id: 'participation', label: language === 'vi' ? 'Điểm thảo luận, Semina, Bài tập' : 'Participation, Seminar, Exercise', weight: theoryConfig?.participationWeight ?? 0 },
        { id: 'midterm', label: language === 'vi' ? 'Điểm giữa kỳ' : 'Midterm', weight: theoryConfig?.midtermWeight ?? 0 },
        { id: 'finalProcess', label: language === 'vi' ? 'Điểm cuối kỳ' : 'Final Process', weight: theoryConfig?.finalProcessWeight ?? 0 },
        { id: 'selfStudy', label: language === 'vi' ? 'Điểm tự học, tự nghiên cứu' : 'Self-study', weight: theoryConfig?.selfStudyWeight ?? 0 }
    ].filter(g => g.weight > 0); 

    // Tính toán Warning cho Practice
    const practiceItemsSum = (course.practiceAssessmentConfig?.items ?? []).reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
    const practiceRubricWeightSum = (course.practiceAssessmentConfig?.rubric?.criteria || []).reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
    
    // Tính toán Warning cho Project
    const projectRubricWeightSum = (course.projectAssessmentConfig?.rubric?.criteria || []).reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
            
            {/* 8. Phương pháp giảng dạy */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest border-b pb-2">
                    8. Các phương pháp giảng dạy và học tập của học phần
                </div>
                <FullFormatText
                    value={course.teachingMethodsDescription?.[language] || ''}
                    onChange={(val) => updateCourse({ teachingMethodsDescription: { ...course.teachingMethodsDescription, [language]: val } as any })}
                />
            </section>

            {/* 9. Chính sách học phần */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest border-b pb-2">
                    9. Chính sách đối với học phần và các yêu cầu của giảng viên
                </div>
                <FullFormatText
                    value={course.coursePolicies?.[language] || ''}
                    onChange={(val) => updateCourse({ coursePolicies: { ...course.coursePolicies, [language]: val } as any })}
                />
            </section>

            {/* 10. Hình thức đánh giá */}
            <section className="space-y-6">
                <div className="flex flex-col gap-1 border-b pb-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                        <Percent size={16} /> 10. Phương pháp, hình thức kiểm tra - đánh giá kết quả học tập học phần
                    </div>
                    <div className="text-[11px] text-slate-500 italic mt-1">
                        {language === 'vi' ? 'Chọn 1 trong các hình thức lớp học để thiết kế phương pháp kiểm tra.' : 'Select 1 of the course formats to design the assessment method.'}
                    </div>
                </div>

                {/* MODULE CHỌN HÌNH THỨC VỚI RADIO BUTTONS */}
                <div className={`grid gap-4 transition-all duration-500 ${activeType ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                    {assessmentOptions.map((opt) => {
                        const isActive = activeType === opt.type;
                        
                        if (activeType && !isActive) return null;

                        const Icon = opt.icon;
                        return (
                            <div
                                key={opt.type}
                                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all text-center ${
                                    isActive 
                                    ? 'bg-indigo-50/30 border-indigo-400 shadow-md ring-4 ring-indigo-50' 
                                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                                    <Icon size={24} />
                                </div>
                                <div className={`text-xs font-bold leading-tight ${isActive ? 'text-indigo-900' : 'text-slate-600'}`}>
                                    {language === 'vi' ? opt.labelVi : opt.labelEn}
                                </div>
                                
                                <div className={`mt-3 flex items-center justify-center gap-6 px-5 py-2.5 rounded-full border transition-colors ${isActive ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            name={`assessment-sel-${opt.type}`} 
                                            checked={isActive}
                                            onChange={() => updateCourse({ assessmentConfigType: opt.type })}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <span className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-indigo-700' : 'text-slate-500 group-hover:text-indigo-500'}`}>
                                            {language === 'vi' ? 'Chọn' : 'Select'}
                                        </span>
                                    </label>
                                    
                                    <div className="w-px h-4 bg-slate-300"></div>
                                    
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            name={`assessment-sel-${opt.type}`} 
                                            checked={!isActive}
                                            onChange={() => {
                                                if (isActive) {
                                                    updateCourse({ assessmentConfigType: undefined as any });
                                                }
                                            }}
                                            className="w-4 h-4 text-slate-500 focus:ring-slate-400 cursor-pointer"
                                        />
                                        <span className={`text-[11px] font-black uppercase tracking-wider ${!isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                            {language === 'vi' ? 'Không' : 'No'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
                    
                    {!activeType && (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <AlertCircle size={32} className="mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-wider">{language === 'vi' ? 'Vui lòng tích vào "Chọn" ở 1 hình thức để tiếp tục' : 'Please select an assessment form to continue'}</p>
                        </div>
                    )}

                    {/* CASE 1: LÝ THUYẾT (THEORY) - GIỮ NGUYÊN 100% */}
                    {activeType === 'THEORY' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="text-xs font-bold text-slate-700">{language === 'vi' ? 'Tổng trọng số học phần (Quá trình + Cuối kỳ):' : 'Total Course Weight:'}</div>
                                <div className={`text-lg font-black ${((theoryConfig?.processWeight ?? 50) + (theoryConfig?.finalExamWeight ?? 50)) === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {((theoryConfig?.processWeight ?? 50) + (theoryConfig?.finalExamWeight ?? 50))}/100%
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> {t.processAssessment}
                                        </h5>
                                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                            <input type="number" className="w-12 text-center font-bold text-xs outline-none" value={theoryConfig?.processWeight ?? 50} onChange={e => updateCourse({ theoryAssessmentConfig: { ...(theoryConfig || INITIAL_STATE.courses[0].theoryAssessmentConfig || { processWeight: 50, attendanceWeight: 10, participationWeight: 10, midtermWeight: 10, finalProcessWeight: 10, selfStudyWeight: 10, finalExamWeight: 50, finalExamForm: 'Tự luận', finalExamDuration: 90, finalExamAllowMaterials: false }), processWeight: Math.min(50, Number(e.target.value)) } })} />
                                            <span className="text-[10px] text-slate-400 font-bold">%</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pl-4 space-y-3 border-l-2 border-slate-200">
                                        {[
                                            { label: t.attendanceWeight, field: 'attendanceWeight', max: 10 },
                                            { label: t.participationWeight, field: 'participationWeight' },
                                            { label: t.midtermWeight, field: 'midtermWeight' },
                                            { label: t.finalProcessWeight, field: 'finalProcessWeight' },
                                            { label: t.selfStudyWeight, field: 'selfStudyWeight' }
                                        ].map(item => (
                                            <div key={item.field} className="flex items-center justify-between">
                                                <label className="text-[10px] text-slate-500 font-medium">{item.label} {item.max ? `(max ${item.max}%)` : ''}</label>
                                                <div className="flex items-center gap-1">
                                                    <input type="number" className={`w-14 p-1 text-center border rounded-md text-xs font-bold transition-colors ${((theoryConfig?.attendanceWeight ?? 0) + (theoryConfig?.participationWeight ?? 0) + (theoryConfig?.midtermWeight ?? 0) + (theoryConfig?.finalProcessWeight ?? 0) + (theoryConfig?.selfStudyWeight ?? 0)) !== (theoryConfig?.processWeight ?? 50) ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} value={(theoryConfig as any)?.[item.field] ?? 0} onChange={e => updateCourse({ theoryAssessmentConfig: { ...(theoryConfig || INITIAL_STATE.courses[0].theoryAssessmentConfig || { processWeight: 50, attendanceWeight: 10, participationWeight: 10, midtermWeight: 10, finalProcessWeight: 10, selfStudyWeight: 10, finalExamWeight: 50, finalExamForm: 'Tự luận', finalExamDuration: 90, finalExamAllowMaterials: false }), [item.field]: Number(e.target.value) } })} />
                                                    <span className="text-[10px] text-slate-400">%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {((theoryConfig?.attendanceWeight ?? 0) + (theoryConfig?.participationWeight ?? 0) + (theoryConfig?.midtermWeight ?? 0) + (theoryConfig?.finalProcessWeight ?? 0) + (theoryConfig?.selfStudyWeight ?? 0)) !== (theoryConfig?.processWeight ?? 50) && (
                                        <div className="text-[9px] text-red-500 font-bold text-right">
                                            {language === 'vi' ? 'Tổng thành phần không khớp với trọng số quá trình!' : 'Component sum mismatch!'}
                                        </div>
                                    )}

                                    {testGroups.length > 0 && (
                                        <div className="space-y-6 pt-6 border-t border-slate-200">
                                            <h6 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                                {language === 'vi' ? 'Chi tiết các bài kiểm tra quá trình' : 'Process Assessment Details'}
                                            </h6>
                                            
                                            {testGroups.map((group, gIdx) => {
                                                const groupTests = (theoryConfig?.regularTests ?? []).filter(t => (t as any).assessmentType === group.id || (gIdx === 0 && !(t as any).assessmentType));
                                                const groupWeightSum = groupTests.reduce((sum, t) => sum + (Number(t.weight) || 0), 0);

                                                return (
                                                    <div key={group.id} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-indigo-700 uppercase">
                                                                {gIdx + 1}. {group.label} (Tổng: {group.weight}%)
                                                            </span>
                                                            <button 
                                                                onClick={() => {
                                                                    const nextTests = [...(theoryConfig?.regularTests ?? [])];
                                                                    nextTests.push({
                                                                        id: Math.random().toString(36).substr(2, 9),
                                                                        form: 'EXERCISE',
                                                                        contentIds: [],
                                                                        weekNo: 1,
                                                                        tool: 'PAPER',
                                                                        submissionMethod: 'HANDWRITTEN',
                                                                        weight: 0,
                                                                        assessmentType: group.id
                                                                    } as any);
                                                                    updateCourse({ theoryAssessmentConfig: { ...theoryConfig!, regularTests: nextTests } });
                                                                }} 
                                                                className="p-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded flex items-center gap-1 text-[9px] font-bold transition-colors"
                                                            >
                                                                <Plus size={10}/> Thêm
                                                            </button>
                                                        </div>
                                                        <div className="bg-white border rounded-xl overflow-hidden text-[10px]">
                                                            <table className="w-full">
                                                                <thead className="bg-slate-50 border-b">
                                                                    <tr>
                                                                        <th className="p-2 text-left">Hình thức</th>
                                                                        <th className="p-2 text-left">Nội dung</th>
                                                                        <th className="p-2 text-center w-20">
                                                                            Tỷ lệ ({groupWeightSum}/{group.weight}%)
                                                                            {groupWeightSum !== group.weight && <span className="text-red-500 ml-1">!</span>}
                                                                        </th>
                                                                        <th className="w-8"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {groupTests.map((test, idx) => {
                                                                        const globalIdx = (theoryConfig?.regularTests ?? []).findIndex(x => x.id === test.id);
                                                                        if (globalIdx === -1) return null;

                                                                        return (
                                                                            <tr key={test.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                                                                <td className="p-2 space-y-1">
                                                                                    <select className="w-full outline-none bg-transparent p-1 border border-transparent hover:border-slate-200 rounded" value={test.form} onChange={e => {
                                                                                        const next = [...theoryConfig!.regularTests!];
                                                                                        next[globalIdx].form = e.target.value as any;
                                                                                        updateCourse({ theoryAssessmentConfig: { ...theoryConfig!, regularTests: next } });
                                                                                    }}>
                                                                                        {sortedCategories.map(c => <option key={c.id} value={c.id}>{c[language]}</option>)}
                                                                                    </select>
                                                                                    {test.form === 'OTHER' && (
                                                                                        <input 
                                                                                            type="text"
                                                                                            className="w-full p-1 border border-slate-200 rounded text-[9px]"
                                                                                            value={test.otherForm || ''}
                                                                                            onChange={e => {
                                                                                                const next = [...theoryConfig!.regularTests!];
                                                                                                next[globalIdx].otherForm = e.target.value;
                                                                                                updateCourse({ theoryAssessmentConfig: { ...theoryConfig!, regularTests: next } });
                                                                                            }}
                                                                                            placeholder="Nhập hình thức..."
                                                                                        />
                                                                                    )}
                                                                                </td>
                                                                                <td className="p-2">
                                                                                    <div className="flex flex-wrap gap-1">
                                                                                        {course.topics.filter(t => !t.no.includes('.')).map(chap => (
                                                                                            <button key={chap.id} onClick={() => {
                                                                                                const next = [...theoryConfig!.regularTests!];
                                                                                                const cIds = next[globalIdx].contentIds;
                                                                                                next[globalIdx].contentIds = cIds.includes(chap.id) ? cIds.filter(id => id !== chap.id) : [...cIds, chap.id];
                                                                                                updateCourse({ theoryAssessmentConfig: { ...theoryConfig!, regularTests: next } });
                                                                                            }} className={`px-1.5 py-0.5 rounded text-[8px] transition-colors ${test.contentIds.includes(chap.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
                                                                                                {chap.no}
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="p-2">
                                                                                    <input type="number" className="w-full text-center font-bold outline-none bg-transparent" value={test.weight} onChange={e => {
                                                                                        const next = [...theoryConfig!.regularTests!];
                                                                                        next[globalIdx].weight = Number(e.target.value);
                                                                                        updateCourse({ theoryAssessmentConfig: { ...theoryConfig!, regularTests: next } });
                                                                                    }} />
                                                                                </td>
                                                                                <td className="p-2 text-center">
                                                                                    <button onClick={() => updateCourse({ theoryAssessmentConfig: { ...theoryConfig!, regularTests: theoryConfig!.regularTests!.filter(t => t.id !== test.id) } })} className="text-slate-300 hover:text-red-500"><Trash2 size={12}/></button>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                    {groupTests.length === 0 && (
                                                                        <tr>
                                                                            <td colSpan={4} className="p-3 text-center text-slate-400 italic">Chưa có bài kiểm tra.</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {t.finalExam}
                                        </h5>
                                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                            <input type="number" className="w-12 text-center font-bold text-xs outline-none" value={theoryConfig?.finalExamWeight ?? 50} onChange={e => updateCourse({ theoryAssessmentConfig: { ...theoryConfig!, finalExamWeight: Number(e.target.value) } })} />
                                            <span className="text-[10px] text-slate-400 font-bold">%</span>
                                        </div>
                                    </div>

                                    <div className="bg-white border rounded-xl overflow-hidden">
                                        <table className="w-full text-[10px]">
                                            <thead className="bg-slate-50 border-b font-bold text-slate-600">
                                                <tr><th className="p-2 text-left">Hình thức thi</th><th className="p-2 text-center w-24">Tỷ lệ ({finalExamFormsSum}%)</th></tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {sortedFinalAssessmentMethods.map(cat => {
                                                    const f = theoryConfig?.finalExamForms?.find(i => i.form === cat.id);
                                                    const isChecked = (f?.weight ?? 0) > 0;
                                                    return (
                                                        <tr key={cat.id} className="hover:bg-slate-50/50">
                                                            <td className="p-2 flex items-center gap-2">
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                                                    {isChecked && <Check size={10} strokeWidth={4} />}
                                                                </div>
                                                                <div className="flex-1 flex items-center gap-2">
                                                                    <span className="font-medium text-slate-700">{cat[language]}</span>
                                                                    {cat.id === 'OTHER' && (
                                                                        <input type="text" className="flex-1 p-1 border-b border-slate-200 focus:border-indigo-500 outline-none bg-transparent text-[9px]" value={f?.otherForm || ''} onClick={e => e.stopPropagation()} onChange={e => {
                                                                            const nextForms = [...(theoryConfig?.finalExamForms ?? [])];
                                                                            const idx = nextForms.findIndex(i => i.form === 'OTHER');
                                                                            if (idx >= 0) nextForms[idx].otherForm = e.target.value;
                                                                            else nextForms.push({ id: Math.random().toString(36).substr(2, 9), form: 'OTHER' as any, weight: 0, otherForm: e.target.value });
                                                                            const activeForms = nextForms.filter(f => f.weight > 0);
                                                                            const formString = activeForms.map(f => {
                                                                                const c = globalConfigs.finalAssessmentMethods?.find(x => x.id === f.form);
                                                                                let name = c ? c[language] : f.form;
                                                                                if (f.form === 'OTHER') name = f.otherForm || (language === 'vi' ? 'Khác' : 'Other');
                                                                                return activeForms.length > 1 ? `${name} (${f.weight}%)` : name;
                                                                            }).join(', ');
                                                                            updateCourse({ theoryAssessmentConfig: { ...theoryConfig!, finalExamForms: nextForms, finalExamForm: formString || (theoryConfig?.finalExamForm ?? '') } });
                                                                        }} placeholder="..." />
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-2">
                                                                <div className="flex items-center gap-1 justify-center">
                                                                    <input type="number" className="w-16 p-1 text-center border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded bg-transparent focus:bg-white outline-none font-bold" value={f?.weight ?? ''} placeholder="0" onChange={e => {
                                                                        const weight = Number(e.target.value);
                                                                        let nextForms = [...(theoryConfig?.finalExamForms ?? [])];
                                                                        const idx = nextForms.findIndex(i => i.form === cat.id);
                                                                        if (idx >= 0) nextForms[idx].weight = weight;
                                                                        else nextForms.push({ id: Math.random().toString(36).substr(2, 9), form: cat.id as any, weight });
                                                                        const activeForms = nextForms.filter(x => x.weight > 0);
                                                                        const formString = activeForms.map(x => {
                                                                            const c = globalConfigs.finalAssessmentMethods?.find(y => y.id === x.form);
                                                                            let name = c ? c[language] : x.form;
                                                                            if (x.form === 'OTHER') name = x.otherForm || (language === 'vi' ? 'Khác' : 'Other');
                                                                            return activeForms.length > 1 ? `${name} (${x.weight}%)` : name;
                                                                        }).join(', ');
                                                                        updateCourse({ theoryAssessmentConfig: { ...theoryConfig!, finalExamForms: nextForms, finalExamForm: formString || (theoryConfig?.finalExamForm ?? '') } });
                                                                    }} />
                                                                    <span className="text-slate-400">%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {(theoryConfig?.finalExamForms || []).length === 0 && (
                                        <div className="text-[8px] text-slate-400 mt-1 italic px-2">
                                            {language === 'vi' ? '* Nhập tỷ lệ để kích hợp hình thức thi tương ứng.' : '* Enter weight to enable the corresponding exam form.'}
                                        </div>
                                    )}
                                    {finalExamFormsSum !== 100 && (theoryConfig?.finalExamForms || []).length > 0 && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-[9px]">
                                            <AlertCircle size={12} />
                                            <span>{language === 'vi' ? `Tổng tỷ lệ (${finalExamFormsSum}%) phải bằng 100%` : `Total weight (${finalExamFormsSum}%) must be 100%`}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] text-slate-500">{language === 'vi' ? 'Thời gian (phút)' : 'Duration (mins)'}</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" className="w-16 p-1 text-center border rounded text-xs" value={theoryConfig?.finalExamDuration ?? 90} onChange={e => updateCourse({ theoryAssessmentConfig: { ...(theoryConfig || { processWeight: 50, attendanceWeight: 10, participationWeight: 10, midtermWeight: 10, finalProcessWeight: 10, selfStudyWeight: 10, finalExamWeight: 50, finalExamForm: 'Tự luận', finalExamDuration: 90, finalExamAllowMaterials: false }), finalExamDuration: Number(e.target.value) } })} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => updateCourse({ theoryAssessmentConfig: { ...(theoryConfig || { processWeight: 50, attendanceWeight: 10, participationWeight: 10, midtermWeight: 10, finalProcessWeight: 10, selfStudyWeight: 10, finalExamWeight: 50, finalExamForm: 'Tự luận', finalExamDuration: 90, finalExamAllowMaterials: false }), finalExamAllowMaterials: !theoryConfig?.finalExamAllowMaterials } })}>
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${theoryConfig?.finalExamAllowMaterials ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300'}`}>
                                            {theoryConfig?.finalExamAllowMaterials && <Check size={12} />}
                                        </div>
                                        <label className="text-[10px] text-slate-600 cursor-pointer">{language === 'vi' ? 'Được sử dụng tài liệu' : 'Materials Allowed'}</label>
                                    </div>
                                    {theoryConfig?.finalExamAllowMaterials && (
                                        <div className="flex flex-col gap-1 mt-2 animate-in fade-in slide-in-from-top-1">
                                            <label className="text-[10px] text-slate-500">{language === 'vi' ? 'Quy định chi tiết tài liệu:' : 'Material details:'}</label>
                                            <input type="text" className="w-full p-2 border rounded text-xs" value={theoryConfig?.finalExamMaterialsDetail ?? ''} onChange={e => updateCourse({ theoryAssessmentConfig: { ...(theoryConfig || { processWeight: 50, attendanceWeight: 10, participationWeight: 10, midtermWeight: 10, finalProcessWeight: 10, selfStudyWeight: 10, finalExamWeight: 50, finalExamForm: 'Tự luận', finalExamDuration: 90, finalExamAllowMaterials: true }), finalExamMaterialsDetail: e.target.value } })} placeholder={language === 'vi' ? 'Ví dụ: Được sử dụng tài liệu in...' : 'Specify allowed materials...'} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CASE 2: THỰC HÀNH (PRACTICE) */}
                    {activeType === 'PRACTICE' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.practiceCriteria}</label>
                                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                    <button 
                                        onClick={() => updateCourse({ practiceAssessmentConfig: { ...(course.practiceAssessmentConfig || { criteria: '', items: [] }), criteriaType: 'DESCRIPTION' } })}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${(!course.practiceAssessmentConfig?.criteriaType || course.practiceAssessmentConfig.criteriaType === 'DESCRIPTION') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                                    >
                                        {t.criteriaDescription}
                                    </button>
                                    <button 
                                        onClick={() => updateCourse({ practiceAssessmentConfig: { ...(course.practiceAssessmentConfig || { criteria: '', items: [] }), criteriaType: 'RUBRIC' } })}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${course.practiceAssessmentConfig?.criteriaType === 'RUBRIC' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                                    >
                                        {t.criteriaRubric}
                                    </button>
                                </div>
                            </div>

                            {(!course.practiceAssessmentConfig?.criteriaType || course.practiceAssessmentConfig.criteriaType === 'DESCRIPTION') ? (
                                <FullFormatText 
                                    value={course.practiceAssessmentConfig?.criteria ?? ''}
                                    onChange={val => updateCourse({ practiceAssessmentConfig: { ...(course.practiceAssessmentConfig || { criteria: '', items: [] }), criteria: val } })}
                                    placeholder="Nhập tiêu chí đánh giá các bài thực hành..."
                                />
                            ) : (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <RubricEditor 
                                        rubric={course.practiceAssessmentConfig?.rubric || { levels: [], criteria: [] }} 
                                        onChange={(r) => updateCourse({ practiceAssessmentConfig: { ...(course.practiceAssessmentConfig || { criteria: '', items: [] }), rubric: r } })}
                                        language={language}
                                    />
                                    {practiceRubricWeightSum !== 100 && (course.practiceAssessmentConfig?.rubric?.criteria || []).length > 0 && (
                                        <div className="mt-4 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-[10px]">
                                            <AlertCircle size={14} />
                                            <span>{language === 'vi' ? `Cảnh báo: Tổng trọng số các tiêu chí trong Rubric hiện tại là ${practiceRubricWeightSum}%. Tổng phải bằng 100%.` : `Warning: Total rubric criteria weight is ${practiceRubricWeightSum}%. It must equal 100%.`}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.practiceItems}</label>
                                    <button onClick={() => updateCourse({ practiceAssessmentConfig: { ...(course.practiceAssessmentConfig || { criteria: '', items: [] }), items: [...(course.practiceAssessmentConfig?.items ?? []), { task: '', weight: 0 }] } })} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1">
                                        <Plus size={12} /> {language === 'vi' ? 'Thêm bài thực hành' : 'Add Practice Task'}
                                    </button>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="p-3 font-bold text-slate-600">Tên bài thực hành</th>
                                                <th className="p-3 font-bold text-slate-600 w-32 text-center">Trọng số</th>
                                                <th className="p-3 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {(course.practiceAssessmentConfig?.items ?? []).map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="p-2"><input type="text" className="w-full p-2 outline-none" value={item.task} onChange={e => {
                                                        const nextItems = [...course.practiceAssessmentConfig!.items!];
                                                        nextItems[idx].task = e.target.value;
                                                        updateCourse({ practiceAssessmentConfig: { ...course.practiceAssessmentConfig!, items: nextItems } });
                                                    }} placeholder="Tên bài..." /></td>
                                                    <td className="p-2"><input type="number" className="w-full p-2 text-center outline-none font-bold" value={item.weight} onChange={e => {
                                                        const nextItems = [...course.practiceAssessmentConfig!.items!];
                                                        nextItems[idx].weight = Number(e.target.value);
                                                        updateCourse({ practiceAssessmentConfig: { ...course.practiceAssessmentConfig!, items: nextItems } });
                                                    }} /></td>
                                                    <td className="p-2 text-center"><button onClick={() => updateCourse({ practiceAssessmentConfig: { ...course.practiceAssessmentConfig!, items: course.practiceAssessmentConfig!.items!.filter((_, i) => i !== idx) } })} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {practiceItemsSum !== 100 && (course.practiceAssessmentConfig?.items || []).length > 0 && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-[10px]">
                                        <AlertCircle size={14} />
                                        <span>{language === 'vi' ? `Cảnh báo: Tổng trọng số các bài thực hành hiện tại là ${practiceItemsSum}%. Tổng phải bằng 100%.` : `Warning: Total tasks weight is ${practiceItemsSum}%. It must equal 100%.`}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CASE 3: ĐỒ ÁN / BTL (PROJECT) */}
                    {activeType === 'PROJECT' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu chí đánh giá Đồ án / Bài tập lớn</label>
                                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                    <button 
                                        onClick={() => updateCourse({ projectAssessmentConfig: { ...(course.projectAssessmentConfig || { criteria: '' }), criteriaType: 'DESCRIPTION' } })}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${(!course.projectAssessmentConfig?.criteriaType || course.projectAssessmentConfig.criteriaType === 'DESCRIPTION') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                                    >
                                        {t.criteriaDescription}
                                    </button>
                                    <button 
                                        onClick={() => updateCourse({ projectAssessmentConfig: { ...(course.projectAssessmentConfig || { criteria: '' }), criteriaType: 'RUBRIC' } })}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${course.projectAssessmentConfig?.criteriaType === 'RUBRIC' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                                    >
                                        {t.criteriaRubric}
                                    </button>
                                </div>
                            </div>

                            {(!course.projectAssessmentConfig?.criteriaType || course.projectAssessmentConfig.criteriaType === 'DESCRIPTION') ? (
                                <FullFormatText 
                                    value={course.projectAssessmentConfig?.criteria || ''}
                                    onChange={(v) => updateCourse({ projectAssessmentConfig: { ...course.projectAssessmentConfig!, criteria: v } })}
                                />
                            ) : (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <RubricEditor 
                                        rubric={course.projectAssessmentConfig?.rubric || { levels: [], criteria: [] }} 
                                        onChange={(r) => updateCourse({ projectAssessmentConfig: { ...course.projectAssessmentConfig!, rubric: r } })}
                                        language={language}
                                    />
                                    {projectRubricWeightSum !== 100 && (course.projectAssessmentConfig?.rubric?.criteria || []).length > 0 && (
                                        <div className="mt-4 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-[10px]">
                                            <AlertCircle size={14} />
                                            <span>{language === 'vi' ? `Cảnh báo: Tổng trọng số các tiêu chí trong Rubric hiện tại là ${projectRubricWeightSum}%. Tổng phải bằng 100%.` : `Warning: Total rubric criteria weight is ${projectRubricWeightSum}%. It must equal 100%.`}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default SyllabusAssessmentModule;