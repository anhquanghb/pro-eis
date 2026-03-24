import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppState, Course, CourseTopic, AssessmentItem, LibraryResource, CloMapping, CoverageLevel, SO, Faculty, AssessmentMethod, AssessmentConfigType, RubricLevel, RubricCriterion, RubricData } from '../types';
import { TRANSLATIONS, INITIAL_STATE } from '../constants';
import { 
  Search, BookOpen, FileText, Upload, Sparkles, Plus, Trash2, 
  Download, Info, Check, Library, 
  Clock, Settings2, Star, FileJson, FileType,
  ChevronDown, Target, CheckSquare, Square, X, Percent, Bot,
  Layers, AlertCircle, Hash, CheckCircle,
  ClipboardCheck, Share2
} from 'lucide-react';
import { downloadSingleSyllabus } from '../services/MoetSyllabus';
import { syllabusPart1Service } from '../services/syllabusPart1';
import { syllabusPart1CService } from '../services/syllabusPart1C';
import { syllabusPart2Service } from '../services/syllabusPart2';
import { syllabusPart3Service } from '../services/syllabusPart3';
import { syllabusPart4Service } from '../services/syllabusPart4';
import { Document, Packer } from "docx";
import AILoader from '../components/AILoader';
import SyllabusConfigModule from './SyllabusConfigModule';
import SyllabusScheduleModule from './SyllabusScheduleModule';
import SyllabusAssessmentModule from './SyllabusAssessmentModule';
import SyllabusAIImport from '../components/SyllabusAIImport'; 
import { sortOutlineCode } from '../utils/sortOutline';
import SyllabusExportModule from './SyllabusExportModule';

interface EditorProps {
    course: Course;
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
    onDelete?: () => void;
}

// --- Từ điển định nghĩa Category2 ---
const CATEGORY2_LABELS: Record<string, { vi: string, en: string }> = {
    THEORY: { vi: 'Lý thuyết', en: 'Theory' },
    PRACTICE_LAB_INTERNSHIP: { vi: 'Thực hành/Thực tập', en: 'Practice/Internship' },
    GROUP_DISCUSSION: { vi: 'Thảo luận', en: 'Discussion' },
    EXERCISE: { vi: 'Bài tập', en: 'Exercise' },
    SELF_STUDY: { vi: 'Tự học', en: 'Self-study' },
};

// --- SyllabusEditorModule ---
const SyllabusEditorModule: React.FC<EditorProps> = ({ course, state, updateState, onDelete }) => {
    const { language } = state;
    const globalState = state.globalState || state;
    const currentProgram = state.programs?.find(p => p.id === state.currentProgramId) || state;
    const { geminiConfig, library, organizationStructure, courseCatalog, globalConfigs } = globalState as any;
    const { teachingMethods = [], assessmentMethods = [], knowledgeAreas = [] } = globalConfigs || state;
    const { faculties = [], departments = [], academicFaculties = [], academicSchools = [] } = organizationStructure || state;
    const { sos, courseSoMap, coursePiMap } = currentProgram as any;
    const generalInfo = globalState.institutionInfo || state.generalInfo;

    const t = TRANSLATIONS[language];
    const [activeTab, setActiveTab] = useState<'plan' | 'eval' | 'export'>('plan');
    // UI State
    const [tab, setTab] = useState<'syllabus' | 'library' | 'schedule' | 'assessment'>('syllabus');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Editors State
    const [editingTopicTime, setEditingTopicTime] = useState<string | null>(null);
    const [editingTopicReadings, setEditingTopicReadings] = useState<string | null>(null);
    const [instructorSearch, setInstructorSearch] = useState('');
    const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
    
    // Topic State
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
    const topicsSectionRef = useRef<HTMLElement>(null);

    // --- State cho Double Click Sửa STT ---
    const [editingTopicNoId, setEditingTopicNoId] = useState<string | null>(null);
    const [editingTopicNoValue, setEditingTopicNoValue] = useState<string>('');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (topicsSectionRef.current && !topicsSectionRef.current.contains(event.target as Node)) {
                setSelectedTopicId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // --- XỬ LÝ ĐỒNG BỘ: Kiểm tra Hình thức thi cuối kỳ ---
    // Nếu form không có trong danh mục finalAssessmentMethods của hệ thống -> chuyển thành OTHER (Khác)
    useEffect(() => {
        const finalForms = course.theoryAssessmentConfig?.finalExamForms;
        const validMethods = globalConfigs?.finalAssessmentMethods || state.finalAssessmentMethods;
        
        if (finalForms && validMethods && validMethods.length > 0) {
            let isModified = false;
            const validIds = new Set(validMethods.map((m: any) => m.id));
            validIds.add('OTHER');

            const sanitizedForms = finalForms.map(f => {
                if (!validIds.has(f.form as string)) {
                    isModified = true;
                    return { 
                        ...f, 
                        form: 'OTHER' as any, 
                        // Lưu lại giá trị cũ vào otherForm để không bị mất dữ liệu
                        otherForm: f.otherForm || f.form 
                    };
                }
                return f;
            });

            if (isModified) {
                updateState(prev => {
                    if (prev.globalState) {
                        return {
                            ...prev,
                            globalState: {
                                ...prev.globalState,
                                courseCatalog: (prev.globalState.courseCatalog || []).map(c => 
                                    c.id === course.id 
                                    ? { 
                                        ...c, 
                                        theoryAssessmentConfig: { 
                                            ...c.theoryAssessmentConfig!, 
                                            finalExamForms: sanitizedForms 
                                        } 
                                      } 
                                    : c
                                )
                            }
                        };
                    }
                    return {
                        ...prev,
                        courses: prev.courses.map(c => 
                            c.id === course.id 
                            ? { 
                                ...c, 
                                theoryAssessmentConfig: { 
                                    ...c.theoryAssessmentConfig!, 
                                    finalExamForms: sanitizedForms 
                                } 
                              } 
                            : c
                        )
                    };
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [course.theoryAssessmentConfig?.finalExamForms, globalConfigs?.finalAssessmentMethods, state.finalAssessmentMethods, course.id, updateState]);

    const [isAddingMaterial, setIsAddingMaterial] = useState(false);
    const [materialMode, setMaterialMode] = useState<'search' | 'create'>('search');
    const [materialSearch, setMaterialSearch] = useState('');
    const [newMaterial, setNewMaterial] = useState<LibraryResource>({ 
        id: '', title: '', author: '', publisher: '', year: new Date().getFullYear().toString(), 
        type: 'textbook', isEbook: false, isPrinted: true, url: '' 
    });

    // Process State
    const [isExporting, setIsExporting] = useState(false);

    // --- SMART RENUMBERING ALGORITHM ---
    const renumberTopics = (topics: CourseTopic[]) => {
        let chapterCounter = 1;

        return topics.map((topic, index) => {
            const t = topic as any; // Ép kiểu an toàn để truy xuất isCustomNo
            let newTopic = { ...t };
            let currentChapterNum = chapterCounter; 

            // Đánh số Level 1
            if (!newTopic.isCustomNo) {
                newTopic.no = language === 'vi' ? `Chương ${chapterCounter}` : `Chapter ${chapterCounter}`;
                chapterCounter++; // Chỉ tăng đếm nếu dòng này là Tự Động
            }

            // Đánh số Level 2
            if (newTopic.subTopics) {
                let subCounter = 1;
                // Nếu Chương cha là tự nhập (isCustomNo), dùng Index mảng làm mốc. Nếu auto, dùng số của Chương.
                const prefix = newTopic.isCustomNo ? (index + 1) : currentChapterNum;

                newTopic.subTopics = newTopic.subTopics.map((subTopic: any) => {
                    let newSub = { ...subTopic };
                    if (!newSub.isCustomNo) {
                        newSub.no = `${prefix}.${subCounter}`;
                        subCounter++;
                    }
                    return newSub;
                });
            }
            return newTopic as CourseTopic;
        });
    };

    // --- Helper Functions ---
    const updateCourse = (updates: Partial<Course>) => {
        let newUpdates = { ...updates };
        if (newUpdates.topics) {
            newUpdates.topics = renumberTopics(newUpdates.topics);
        }
        updateState(prev => ({
            ...prev,
            courses: prev.courses.map(c => c.id === course.id ? { ...c, ...newUpdates } : c)
        }));
    };

    // Hàm xử lý lưu khi người dùng sửa tay STT (Double Click)
    const handleSaveTopicNo = (id: string) => {
        setEditingTopicNoId(null);
        
        const updateRecursive = (topics: CourseTopic[]): CourseTopic[] => {
            return topics.map(t => {
                let current = { ...t } as any;
                if (current.id === id) {
                    const isCustom = editingTopicNoValue.trim() !== '';
                    current.no = isCustom ? editingTopicNoValue.trim() : current.no;
                    current.isCustomNo = isCustom; // Gắn cờ để thuật toán renumber bỏ qua dòng này
                    return current;
                }
                if (current.subTopics) {
                    current.subTopics = updateRecursive(current.subTopics);
                }
                return current;
            });
        };

        const updatedTopics = updateRecursive(course.topics);
        updateCourse({ topics: updatedTopics }); // Gọi hàm tổng để Trigger việc vẽ lại toàn bộ STT
    };

    const updateTopic = (id: string, field: keyof CourseTopic, value: any) => {
        const updateRecursive = (topics: CourseTopic[]): CourseTopic[] => {
            return topics.map(t => {
                if (t.id === id) {
                    return { ...t, [field]: value };
                }
                if (t.subTopics) {
                    return { ...t, subTopics: updateRecursive(t.subTopics) };
                }
                return t;
            });
        };
        updateCourse({ topics: updateRecursive(course.topics) });
    };

    const updateTopicLang = (id: string, value: string) => {
        const updateRecursive = (topics: CourseTopic[]): CourseTopic[] => {
            return topics.map(t => {
                if (t.id === id) {
                    return { ...t, topic: { ...t.topic, [language]: value } };
                }
                if (t.subTopics) {
                    return { ...t, subTopics: updateRecursive(t.subTopics) };
                }
                return t;
            });
        };
        updateCourse({ topics: updateRecursive(course.topics) });
    };

    const updateAssessment = (idx: number, field: keyof AssessmentItem, value: any) => {
        const next = [...course.assessmentPlan];
        next[idx] = { ...next[idx], [field]: value };
        if (field === 'methodId') {
            const method = assessmentMethods.find(m => m.id === value);
            if (method && (!next[idx].type || !next[idx].type.vi || next[idx].type.vi === '')) {
                next[idx].type = method.name;
            }
        }
        updateCourse({ assessmentPlan: next });
    };

    const handleAddClo = () => {
        const newClos = { vi: [...(course.clos?.vi || []), ''], en: [...(course.clos?.en || []), ''] };
        updateCourse({ clos: newClos });
    };

    const handleUpdateClo = (index: number, value: string) => {
        const newClos = { ...course.clos };
        if (!newClos[language]) newClos[language] = [];
        const newList = [...newClos[language]];
        newList[index] = value;
        newClos[language] = newList;
        updateCourse({ clos: newClos });
    };

    const handleDeleteClo = (index: number) => {
        if (!confirm(language === 'vi' ? 'Xóa CLO này?' : 'Delete this CLO?')) return;
        const newClos = {
            vi: (course.clos?.vi || []).filter((_, i) => i !== index),
            en: (course.clos?.en || []).filter((_, i) => i !== index)
        };
        const newCloMap = (course.cloMap || [])
            .filter(m => m.cloIndex !== index)
            .map(m => m.cloIndex > index ? { ...m, cloIndex: m.cloIndex - 1 } : m);
        updateCourse({ clos: newClos, cloMap: newCloMap });
    };

    const toggleInstructor = (facultyId: string) => {
        const current = course.instructorIds || [];
        let nextIds: string[];
        let nextDetails = { ...course.instructorDetails };
        if (current.includes(facultyId)) {
            nextIds = current.filter(id => id !== facultyId);
            delete nextDetails[facultyId];
        } else {
            nextIds = [...current, facultyId];
            if (!nextDetails[facultyId]) nextDetails[facultyId] = { classInfo: '', isMain: false };
        }
        updateCourse({ instructorIds: nextIds, instructorDetails: nextDetails });
        setInstructorSearch('');
        setShowInstructorDropdown(false);
    };

    const handleExport = async (type: 'ABET' | 'MOET') => {
        setIsExporting(true);
        try {
            let content: any[] = [];
            
            if (type === 'ABET') {
                const p1 = await syllabusPart1CService.generateContent({
                    course,
                    allCourses: courseCatalog || state.courses,
                    teachingMethods: teachingMethods,
                    generalInfo: generalInfo,
                    knowledgeAreas: knowledgeAreas || [],
                    sos: sos || [],
                    language
                });
                const p2 = await syllabusPart2Service.generateContent({
                    course,
                    teachingMethods: teachingMethods,
                    language
                });
                const p3 = await syllabusPart3Service.generateContent({
                    course,
                    teachingMethods: teachingMethods,
                    language
                });
                const p4 = await syllabusPart4Service.generateContent({
                    course,
                    state,
                    language
                });
                content = [...p1, ...p2, ...p3, ...p4];
            } else {
                const p1 = await syllabusPart1Service.generateContent({
                    course,
                    allCourses: courseCatalog || state.courses,
                    teachingMethods: teachingMethods,
                    generalInfo: generalInfo,
                    knowledgeAreas: knowledgeAreas || [],
                    language
                });
                const p2 = await syllabusPart2Service.generateContent({
                    course,
                    teachingMethods: teachingMethods,
                    language
                });
                const p3 = await syllabusPart3Service.generateContent({
                    course,
                    teachingMethods: teachingMethods,
                    language
                });
                const p4 = await syllabusPart4Service.generateContent({
                    course,
                    state,
                    language
                });
                content = [...p1, ...p2, ...p3, ...p4];
            }

            const doc = new Document({
                styles: {
                    default: {
                        document: {
                            run: {
                                size: 26, // 13pt
                                font: "Times New Roman"
                            }
                        }
                    }
                },
                sections: [{
                    properties: {
                        page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 } }
                    },
                    children: content,
                }],
            });

            const blob = await Packer.toBlob(doc);
            const filename = type === 'ABET' 
                ? `Syllabus_KDQT_${course.code || course.id}.docx`
                : `Syllabus_MOET_${course.code || course.id}.docx`;
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error("Export failed:", err);
            alert(language === 'vi' ? "Xuất bản thất bại" : "Export failed");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteCourse = () => {
        updateState(prev => ({
            ...prev,
            courses: prev.courses.filter(c => c.id !== course.id)
        }));
        if (onDelete) onDelete();
        setShowDeleteConfirm(false);
    };

    // --- Renderers ---
    const renderSyllabus = () => {
        // 1. TÍNH TOÁN THỐNG KÊ TÍN CHỈ/GIỜ THEO TỪNG PHƯƠNG PHÁP GIẢNG DẠY
        const methodSummaries = teachingMethods.map(tm => {
            const totalHours = course.topics.reduce((sum, t) => {
                const subTopicHours = t.subTopics?.reduce((subSum, st) => subSum + (st.activities?.find(a => a.methodId === tm.id)?.hours || 0), 0) || 0;
                return sum + subTopicHours;
            }, 0) || 0;
            if (totalHours === 0) return null;
            const factor = tm.hoursPerCredit || 15;
            return { 
                methodId: tm.id, 
                code: tm.code, 
                credits: totalHours / factor, 
                totalHours, 
                category: tm.category, 
                category2: tm.category2, 
                factor 
            };
        }).filter(Boolean) as any[];

        // 2. GOM NHÓM THEO CATEGORY2
        const category2Summaries = Object.entries(CATEGORY2_LABELS).map(([cat2, label]) => {
            const methodsInCat2 = methodSummaries.filter(m => m.category2 === cat2);
            const totalHours = methodsInCat2.reduce((sum, m) => sum + m.totalHours, 0);
            const totalCredits = methodsInCat2.reduce((sum, m) => sum + m.credits, 0);
            return { cat2, label: label[language], totalHours, totalCredits };
        }).filter(c => c.totalHours > 0);

        // 3. TỔNG TOÀN BỘ HỌC PHẦN
        const totalCourseHours = methodSummaries.reduce((sum, m) => sum + m.totalHours, 0);
        const totalCourseCredits = methodSummaries.reduce((sum, m) => sum + m.credits, 0);

        const mappedInSyllabusSoIds = new Set<string>();
        // course.cloMap?.forEach(m => m.soIds.forEach(id => mappedInSyllabusSoIds.add(id)));

        return (
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Instructor & Export Section */}
                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.instructorSelect}</h4>
                        <div className="relative mb-3">
                            <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                                <Search size={16} className="text-slate-400" />
                                <input className="flex-1 outline-none text-sm font-medium" placeholder={language === 'vi' ? "Tìm giảng viên..." : "Search instructors..."} value={instructorSearch} onChange={e => { setInstructorSearch(e.target.value); setShowInstructorDropdown(true); }} onFocus={() => setShowInstructorDropdown(true)} />
                                {showInstructorDropdown && <button onClick={() => setShowInstructorDropdown(false)}><X size={14} className="text-slate-400" /></button>}
                            </div>
                            {showInstructorDropdown && (
                                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 z-50 max-h-48 overflow-y-auto">
                                    {faculties.filter(f => f.name[language].toLowerCase().includes(instructorSearch.toLowerCase()) && !course.instructorIds.includes(f.id)).map(f => (
                                        <button key={f.id} onClick={() => toggleInstructor(f.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{f.name[language].charAt(0)}</div>{f.name[language]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            {course.instructorIds.map(fid => {
                                const f = faculties.find(fac => fac.id === fid);
                                if (!f) return null;
                                const isMain = course.instructorDetails?.[fid]?.isMain;
                                return (
                                    <div key={f.id} className={`bg-white border p-2 rounded-lg flex flex-col gap-2 shadow-sm transition-colors ${isMain ? 'border-amber-200 ring-1 ring-amber-200' : 'border-slate-200'}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => {
                                                    const newDetails: any = {};
                                                    Object.keys(course.instructorDetails || {}).forEach(key => { newDetails[key] = { ...course.instructorDetails[key], isMain: key === fid }; });
                                                    updateCourse({ instructorDetails: newDetails });
                                                }} className={`transition-colors ${isMain ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}>
                                                    <Star size={16} fill={isMain ? "currentColor" : "none"} />
                                                </button>
                                                <span className={`text-xs font-bold ${isMain ? 'text-slate-800' : 'text-slate-700'}`}>{f.name[language]}{isMain && <span className="ml-2 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Main</span>}</span>
                                            </div>
                                            <button onClick={() => toggleInstructor(f.id)} className="p-1 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X size={14} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'vi' ? 'Xuất đề cương' : 'Export Syllabus'}</h4>
                            <div className="flex gap-2">
                                <SyllabusAIImport 
                                    course={course} 
                                    state={state} 
                                    updateCourse={updateCourse} 
                                    language={language} 
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 mt-1">
                            <button 
                                onClick={() => handleExport('ABET')} 
                                disabled={isExporting} 
                                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <FileType size={16} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-700 group-hover:text-blue-700">Syllabus (KĐQT)</div>
                                        <div className="text-[10px] text-slate-400">Standard DOCX Format</div>
                                    </div>
                                </div>
                                <Download size={16} className="text-slate-300 group-hover:text-blue-500" />
                            </button>

                            <button 
                                onClick={() => handleExport('MOET')} 
                                disabled={isExporting} 
                                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                        <FileType size={16} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">Syllabus (MOET)</div>
                                        <div className="text-[10px] text-slate-400">Vietnamese BGD Format</div>
                                    </div>
                                </div>
                                <Download size={16} className="text-slate-300 group-hover:text-emerald-500" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Description */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest border-b pb-2"><Info size={16} /> {language === 'vi' ? 'Mô tả học phần' : 'Course Description'}</div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{language === 'vi' ? 'Tiếng Việt' : 'English'}</label>
                        <textarea 
                            className="w-full min-h-[120px] p-4 text-sm leading-relaxed bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={course.description[language] || ''} 
                            onChange={(e) => updateCourse({ description: { ...course.description, [language]: e.target.value } })} 
                            placeholder={language === 'vi' ? "Mô tả học phần bằng tiếng Việt..." : "Course description in English..."}
                        />
                    </div>
                </section>

                {/* Course Objectives */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest border-b pb-2">
                        <Target size={16} /> {t.courseObjectives}
                    </div>
                    
                    {/* General Objectives */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t.generalObjectives}</label>
                        <textarea 
                            className="w-full min-h-[80px] p-3 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={course.objectives?.general[language] || ''}
                            onChange={(e) => {
                                const newObjectives = { 
                                    general: { vi: '', en: '', ...course.objectives?.general, [language]: e.target.value },
                                    specific: course.objectives?.specific || { knowledge: [], skills: [], responsibility: [] }
                                };
                                updateCourse({ objectives: newObjectives });
                            }}
                            placeholder={language === 'vi' ? "Nhập mục tiêu chung..." : "Enter general objectives..."}
                        />
                    </div>

                    {/* Specific Objectives */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t.specificObjectives}</label>
                        
                        {/* Knowledge */}
                        <div className="space-y-2 pl-4 border-l-2 border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-600">{t.knowledge} (max 3)</span>
                                <button 
                                    onClick={() => {
                                        const current = course.objectives?.specific.knowledge || [];
                                        if (current.length >= 3) return;
                                        const newKnowledge = [...current, { vi: '', en: '' }];
                                        updateCourse({ 
                                            objectives: { 
                                                general: course.objectives?.general || { vi: '', en: '' },
                                                specific: { ...(course.objectives?.specific || { knowledge: [], skills: [], responsibility: [] }), knowledge: newKnowledge } 
                                            } 
                                        });
                                    }}
                                    disabled={(course.objectives?.specific.knowledge || []).length >= 3}
                                    className="text-indigo-600 hover:text-indigo-700 disabled:opacity-30"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            {(course.objectives?.specific.knowledge || []).map((obj, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                    <textarea 
                                        className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        rows={2}
                                        value={obj[language]}
                                        onChange={(e) => {
                                            const newKnowledge = [...course.objectives!.specific.knowledge];
                                            newKnowledge[idx] = { ...newKnowledge[idx], [language]: e.target.value };
                                            updateCourse({ 
                                                objectives: { 
                                                    general: course.objectives?.general || { vi: '', en: '' },
                                                    specific: { ...(course.objectives?.specific || { knowledge: [], skills: [], responsibility: [] }), knowledge: newKnowledge } 
                                                } 
                                            });
                                        }}
                                    />
                                    <button 
                                        onClick={() => {
                                            const newKnowledge = course.objectives!.specific.knowledge.filter((_, i) => i !== idx);
                                            updateCourse({ 
                                                objectives: { 
                                                    general: course.objectives?.general || { vi: '', en: '' },
                                                    specific: { ...(course.objectives?.specific || { knowledge: [], skills: [], responsibility: [] }), knowledge: newKnowledge } 
                                                } 
                                            });
                                        }}
                                        className="p-1 text-slate-300 hover:text-red-500"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Skills */}
                        <div className="space-y-2 pl-4 border-l-2 border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-600">{t.skills} (max 3)</span>
                                <button 
                                    onClick={() => {
                                        const current = course.objectives?.specific.skills || [];
                                        if (current.length >= 3) return;
                                        const newSkills = [...current, { vi: '', en: '' }];
                                        updateCourse({ 
                                            objectives: { 
                                                general: course.objectives?.general || { vi: '', en: '' },
                                                specific: { ...(course.objectives?.specific || { knowledge: [], skills: [], responsibility: [] }), skills: newSkills } 
                                            } 
                                        });
                                    }}
                                    disabled={(course.objectives?.specific.skills || []).length >= 3}
                                    className="text-indigo-600 hover:text-indigo-700 disabled:opacity-30"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            {(course.objectives?.specific.skills || []).map((obj, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                    <textarea 
                                        className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        rows={2}
                                        value={obj[language]}
                                        onChange={(e) => {
                                            const newSkills = [...course.objectives!.specific.skills];
                                            newSkills[idx] = { ...newSkills[idx], [language]: e.target.value };
                                            updateCourse({ 
                                                objectives: { 
                                                    general: course.objectives?.general || { vi: '', en: '' },
                                                    specific: { ...(course.objectives?.specific || { knowledge: [], skills: [], responsibility: [] }), skills: newSkills } 
                                                } 
                                            });
                                        }}
                                    />
                                    <button 
                                        onClick={() => {
                                            const newSkills = course.objectives!.specific.skills.filter((_, i) => i !== idx);
                                            updateCourse({ 
                                                objectives: { 
                                                    general: course.objectives?.general || { vi: '', en: '' },
                                                    specific: { ...(course.objectives?.specific || { knowledge: [], skills: [], responsibility: [] }), skills: newSkills } 
                                                } 
                                            });
                                        }}
                                        className="p-1 text-slate-300 hover:text-red-500"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Responsibility */}
                        <div className="space-y-2 pl-4 border-l-2 border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-600">{t.responsibility} (max 2)</span>
                                <button 
                                    onClick={() => {
                                        const current = course.objectives?.specific.responsibility || [];
                                        if (current.length >= 2) return;
                                        const newResp = [...current, { vi: '', en: '' }];
                                        updateCourse({ 
                                            objectives: { 
                                                general: course.objectives?.general || { vi: '', en: '' },
                                                specific: { ...(course.objectives?.specific || { knowledge: [], skills: [], responsibility: [] }), responsibility: newResp } 
                                            } 
                                        });
                                    }}
                                    disabled={(course.objectives?.specific.responsibility || []).length >= 2}
                                    className="text-indigo-600 hover:text-indigo-700 disabled:opacity-30"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            {(course.objectives?.specific.responsibility || []).map((obj, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                    <textarea 
                                        className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        rows={2}
                                        value={obj[language]}
                                        onChange={(e) => {
                                            const newResp = [...course.objectives!.specific.responsibility];
                                            newResp[idx] = { ...newResp[idx], [language]: e.target.value };
                                            updateCourse({ 
                                                objectives: { 
                                                    general: course.objectives?.general || { vi: '', en: '' },
                                                    specific: { ...(course.objectives?.specific || { knowledge: [], skills: [], responsibility: [] }), responsibility: newResp } 
                                                } 
                                            });
                                        }}
                                    />
                                    <button 
                                        onClick={() => {
                                            const newResp = course.objectives!.specific.responsibility.filter((_, i) => i !== idx);
                                            updateCourse({ 
                                                objectives: { 
                                                    general: course.objectives?.general || { vi: '', en: '' },
                                                    specific: { ...(course.objectives?.specific || { knowledge: [], skills: [], responsibility: [] }), responsibility: newResp } 
                                                } 
                                            });
                                        }}
                                        className="p-1 text-slate-300 hover:text-red-500"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* NEW: Course Learning Outcomes (CLOs) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                            <Target size={16} /> {t.clos || 'Course Learning Outcomes (CLOs)'}
                        </div>
                        <button onClick={handleAddClo} className="text-indigo-600 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors">
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {(course.clos[language] || []).map((clo, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex gap-3 items-start group">
                                    <span className="text-xs font-bold text-slate-400 mt-2.5 w-12 text-right">CLO.{idx + 1}</span>
                                    <div className="flex-1 relative">
                                        <textarea 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none transition-all"
                                            rows={2}
                                            value={clo}
                                            onChange={(e) => handleUpdateClo(idx, e.target.value)}
                                            placeholder={`Enter CLO content in ${language.toUpperCase()}...`}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteClo(idx)} 
                                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(course.clos[language] || []).length === 0 && (
                            <div className="text-center text-slate-400 italic py-4 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                {language === 'vi' ? 'Chưa có CLO nào. Nhấn + để thêm.' : 'No CLOs defined. Click + to add.'}
                            </div>
                        )}
                    </div>
                </section>

                {/* Textbooks & Materials */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest"><BookOpen size={16} /> {t.textbook} & {t.typeReference}</div>
                        <button onClick={() => setIsAddingMaterial(true)} className="text-indigo-600 hover:text-indigo-700"><Plus size={18} /></button>
                    </div>
                    <div className="space-y-2">
                        {course.textbooks.map((tb, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">{tb.title}</div>
                                    <div className="text-xs text-slate-500">{tb.author} • {tb.publisher} ({tb.year})</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => {
                                            const nextTextbooks = [...course.textbooks];
                                            nextTextbooks[idx] = { 
                                                ...nextTextbooks[idx], 
                                                type: nextTextbooks[idx].type === 'textbook' ? 'reference' : 'textbook' 
                                            };
                                            updateCourse({ textbooks: nextTextbooks });
                                        }}
                                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border cursor-pointer select-none min-w-[80px] text-center ${
                                            tb.type === 'textbook' 
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100' 
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                        title={language === 'vi' ? 'Nhấn để đổi loại' : 'Click to toggle type'}
                                    >
                                        {tb.type === 'textbook' ? t.typeTextbook : t.typeReference}
                                    </button>
                                    <button onClick={() => updateCourse({ textbooks: course.textbooks.filter((_, i) => i !== idx) })} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                        {course.textbooks.length === 0 && <div className="text-center text-slate-400 italic py-4 text-xs">No materials added.</div>}
                    </div>
                </section>

                {/* Topics & Schedule */}
                <section className="space-y-4" ref={topicsSectionRef}>
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest"><Layers size={16} /> Nội dung chi tiết học phần</div>
                        {methodSummaries && methodSummaries.length > 0 && (
                            <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end border-r border-slate-200 pr-4 mr-2">
                                        <span className={`text-xs font-black ${Math.abs((course.credits || 0) - totalCourseCredits) < 0.01 ? 'text-green-600' : 'text-red-500'}`}>Total: {parseFloat(totalCourseCredits.toFixed(2))}/{course.credits} TC ({totalCourseHours}h)</span>
                                        {Math.abs((course.credits || 0) - totalCourseCredits) >= 0.01 && <span className="text-[9px] text-amber-500 font-bold flex items-center gap-1"><AlertCircle size={8} /> Diff: {Math.abs((course.credits || 0) - totalCourseCredits).toFixed(2)} TC</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        {category2Summaries.map(c2 => (
                                            <span key={c2.cat2} className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                                                {c2.label}: {c2.totalHours}h
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end flex-wrap">
                                    {methodSummaries.map(s => (
                                        <div key={s.code} className="flex flex-col items-end">
                                            <span 
                                                className="text-[10px] font-bold px-2 py-0.5 rounded border bg-slate-100 text-slate-700 border-slate-200 whitespace-nowrap"
                                                title={`${s.category2} - ${s.totalHours}h (Factor: ${s.factor})`}
                                            >
                                                {s.code}: {s.totalHours}h ({s.credits.toFixed(2)} TC)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button onClick={() => {
                            const next: CourseTopic = { id: `t-${Date.now()}`, no: `Chương ${course.topics.length + 1}`, topic: { vi: '', en: '' }, activities: [], readingRefs: [] };
                            updateCourse({ topics: [...course.topics, next] });
                        }} className="text-indigo-600 hover:text-indigo-700 ml-4 flex items-center gap-1 text-sm font-bold"><Plus size={16} /> Thêm Chương</button>
                    </div>
                    
                    <div className="space-y-4">
                        {course.topics.map((topic: CourseTopic) => (
                            <div key={topic.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                {/* Level 1 Topic */}
                                <div 
                                    className={`p-4 flex flex-col gap-2 cursor-pointer transition-colors ${selectedTopicId === topic.id ? 'bg-indigo-50 border-b border-indigo-100' : 'hover:bg-slate-50'}`}
                                    onClick={() => setSelectedTopicId(topic.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Input Sửa Số Thứ Tự */}
                                        {editingTopicNoId === topic.id ? (
                                            <input 
                                                autoFocus
                                                className="w-24 p-1 font-bold text-indigo-700 bg-indigo-50 border-b border-indigo-500 outline-none text-sm rounded"
                                                value={editingTopicNoValue}
                                                onChange={e => setEditingTopicNoValue(e.target.value)}
                                                onBlur={() => handleSaveTopicNo(topic.id)}
                                                onKeyDown={e => e.key === 'Enter' && handleSaveTopicNo(topic.id)}
                                            />
                                        ) : (
                                            <span 
                                                className="w-24 p-1 font-bold text-slate-700 cursor-pointer hover:bg-slate-200 rounded transition-colors"
                                                onDoubleClick={(e) => { e.stopPropagation(); setEditingTopicNoId(topic.id); setEditingTopicNoValue(topic.no); }}
                                                title={language === 'vi' ? 'Click đúp để sửa số thứ tự' : 'Double click to edit numbering'}
                                            >
                                                {topic.no}
                                            </span>
                                        )}

                                        <textarea 
                                            className="flex-1 bg-transparent p-1 outline-none font-bold text-slate-800 border-b border-transparent focus:border-indigo-300 resize-none overflow-hidden" 
                                            value={topic.topic[language] || ''} 
                                            onChange={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                                updateTopicLang(topic.id, e.target.value);
                                            }}
                                            rows={1}
                                            placeholder="Tên chương..."
                                        />
                                        <div className="flex gap-2">
                                            {Object.entries(CATEGORY2_LABELS).map(([cat2, label]) => {
                                                const hours = topic.subTopics?.reduce((sum, sub) => 
                                                    sum + (sub.activities?.filter(a => {
                                                        const tm = (teachingMethods || []).find(m => m.id === a.methodId);
                                                        return tm?.category2 === cat2;
                                                    }).reduce((s, a) => s + a.hours, 0) || 0)
                                                , 0) || 0;
                                                
                                                if (hours === 0) return null;
                                                
                                                return (
                                                    <div key={cat2} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200" title={label[language]}>
                                                        {label[language]}: {hours}h
                                                    </div>
                                                );
                                            })}
                                            <div className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded ml-2">
                                                {topic.subTopics?.reduce((sum, sub) => sum + (sub.activities?.reduce((s, a) => s + a.hours, 0) || 0), 0) || 0}h
                                            </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); updateCourse({ topics: course.topics.filter(t => t.id !== topic.id) }); }} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                {/* Level 1 Details Panel */}
                                {selectedTopicId === topic.id && (
                                    <div className="p-4 bg-indigo-50/30 border-b border-indigo-100 space-y-4">
                                        <h4 className="font-bold text-indigo-800 text-sm">Thông tin chi tiết (Level 1)</h4>
                                        
                                        <div className="grid grid-cols-1 gap-6">
                                            {/* 1. Đáp ứng Mục tiêu (CLOs) */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-2">Đáp ứng Mục tiêu (CLOs)</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {(course.clos[language] || []).map((clo, idx) => {
                                                        const cloMapEntry = course.cloMap?.find(m => m.cloIndex === idx);
                                                        const isSelected = cloMapEntry?.topicIds?.includes(topic.id);
                                                        
                                                        return (
                                                            <div
                                                                key={idx}
                                                                onClick={() => {
                                                                    const currentMap = course.cloMap || [];
                                                                    const existingIdx = currentMap.findIndex(m => m.cloIndex === idx);
                                                                    let newMaps = [...currentMap];

                                                                    if (existingIdx >= 0) {
                                                                        const entry = newMaps[existingIdx];
                                                                        const topicIds = entry.topicIds || [];
                                                                        newMaps[existingIdx] = {
                                                                            ...entry,
                                                                            topicIds: isSelected
                                                                                ? topicIds.filter(id => id !== topic.id)
                                                                                : [...topicIds, topic.id]
                                                                        };
                                                                    } else {
                                                                        newMaps.push({
                                                                            cloIndex: idx,
                                                                            topicIds: [topic.id],
                                                                            teachingMethodIds: [],
                                                                            assessmentMethodIds: [],
                                                                            coverageLevel: CoverageLevel.NONE
                                                                        });
                                                                    }
                                                                    updateCourse({ cloMap: newMaps });
                                                                }}
                                                                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                                                    isSelected
                                                                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                                }`}
                                                                title={clo}
                                                            >
                                                                CLO{idx + 1}
                                                            </div>
                                                        );
                                                    })}
                                                    {(course.clos[language] || []).length === 0 && (
                                                        <span className="text-xs text-slate-400 italic">Chưa có chuẩn đầu ra nào được thiết lập.</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 2. Tài liệu học tập */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-2">Tài liệu học tập</label>
                                                <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                                                    {course.textbooks.map(tb => (
                                                        <label key={tb.resourceId} className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={topic.readingRefs?.some(r => r.resourceId === tb.resourceId) || false}
                                                                onChange={(e) => {
                                                                    const current = topic.readingRefs || [];
                                                                    const next = e.target.checked 
                                                                        ? [...current, { resourceId: tb.resourceId, pageRange: '' }]
                                                                        : current.filter(r => r.resourceId !== tb.resourceId);
                                                                    updateTopic(topic.id, 'readingRefs', next);
                                                                }}
                                                                className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <div>
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mr-2 ${tb.type === 'textbook' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                                                    {tb.type === 'textbook' ? 'Học liệu bắt buộc' : 'Học liệu không bắt buộc'}
                                                                </span>
                                                                <span className="font-medium">{tb.title}</span>
                                                                <span className="text-slate-500 ml-1">({tb.author}, {tb.year})</span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                    {course.textbooks.length === 0 && <span className="text-xs text-slate-400 italic">Chưa có tài liệu học tập nào được thêm vào đề cương.</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Level 2 Topics */}
                                <div className="bg-slate-50 divide-y divide-slate-100 border-t border-slate-200">
                                    {topic.subTopics?.map((subTopic) => (
                                        <div key={subTopic.id} className="flex flex-col">
                                            <div 
                                                className={`p-3 pl-8 flex items-center gap-3 cursor-pointer transition-colors ${selectedTopicId === subTopic.id ? 'bg-indigo-50/50' : 'hover:bg-slate-100'}`}
                                                onClick={() => setSelectedTopicId(subTopic.id)}
                                            >
                                                {/* Input Sửa Số Thứ Tự Level 2 */}
                                                {editingTopicNoId === subTopic.id ? (
                                                    <input 
                                                        autoFocus
                                                        className="w-16 p-1 font-bold text-indigo-700 bg-indigo-50 border-b border-indigo-500 outline-none text-sm rounded"
                                                        value={editingTopicNoValue}
                                                        onChange={e => setEditingTopicNoValue(e.target.value)}
                                                        onBlur={() => handleSaveTopicNo(subTopic.id)}
                                                        onKeyDown={e => e.key === 'Enter' && handleSaveTopicNo(subTopic.id)}
                                                    />
                                                ) : (
                                                    <span 
                                                        className="w-16 p-1 text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-200 rounded transition-colors"
                                                        onDoubleClick={(e) => { e.stopPropagation(); setEditingTopicNoId(subTopic.id); setEditingTopicNoValue(subTopic.no); }}
                                                        title={language === 'vi' ? 'Click đúp để sửa số thứ tự' : 'Double click to edit numbering'}
                                                    >
                                                        {subTopic.no}
                                                    </span>
                                                )}

                                                <textarea 
                                                    className="flex-1 bg-transparent p-1 outline-none text-sm text-slate-700 border-b border-transparent focus:border-indigo-300 resize-none overflow-hidden" 
                                                    value={subTopic.topic[language] || ''} 
                                                    onChange={(e) => {
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                        updateTopicLang(subTopic.id, e.target.value);
                                                    }}
                                                    rows={1}
                                                    placeholder="Nội dung chi tiết..."
                                                />
                                                <div className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                                                    {subTopic.activities?.reduce((s, a) => s + a.hours, 0) || 0}h
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); updateCourse({ topics: course.topics.map(t => t.id === topic.id ? { ...t, subTopics: t.subTopics?.filter(st => st.id !== subTopic.id) } : t) }); }} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                                            </div>

                                            {/* Level 2 Details Panel */}
                                            {selectedTopicId === subTopic.id && (
                                                <div className="p-4 pl-8 bg-white border-t border-b border-indigo-100 space-y-6 shadow-inner">
                                                    <h4 className="font-bold text-indigo-800 text-sm">Thông tin chi tiết (Level 2)</h4>
                                                    
                                                    {/* 1. Hình thức tổ chức dạy học */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-2">1. Hình thức tổ chức dạy học học phần</label>
                                                        
                                                        {/* Summary by Organization Form */}
                                                        <div className="flex gap-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto">
                                                            {Object.entries(CATEGORY2_LABELS).map(([cat2, label]) => {
                                                                const formHours = subTopic.activities?.filter(a => {
                                                                    const tm = (teachingMethods || []).find(m => m.id === a.methodId);
                                                                    return tm?.category2 === cat2;
                                                                }).reduce((s, a) => s + a.hours, 0) || 0;
                                                                
                                                                if (formHours === 0) return null;

                                                                return (
                                                                    <div key={cat2} className="flex-1 min-w-[120px] text-center bg-white p-2 rounded border border-slate-100 shadow-sm">
                                                                        <div className="text-[10px] font-bold text-slate-500 mb-1 h-8 flex items-center justify-center">{label[language]}</div>
                                                                        <div className="font-black text-indigo-700 text-lg">{formHours}h</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Input by Teaching Method */}
                                                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                            <div className="text-xs font-bold text-slate-500 mb-3">Nhập số giờ theo Phương pháp giảng dạy:</div>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                                {teachingMethods.map(tm => (
                                                                    <div key={tm.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                                                        <label className="text-xs font-medium text-slate-700 flex-1 truncate" title={tm.name[language]}>{tm.name[language]}</label>
                                                                        <input 
                                                                            type="number" 
                                                                            min="0"
                                                                            className="w-14 border border-slate-300 rounded p-1 text-xs text-center font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                                                                            placeholder="0" 
                                                                            value={subTopic.activities?.find(a => a.methodId === tm.id)?.hours || ''} 
                                                                            onChange={(e) => {
                                                                                const hours = parseInt(e.target.value) || 0;
                                                                                const current = subTopic.activities || [];
                                                                                const next = hours > 0 
                                                                                    ? [...current.filter(a => a.methodId !== tm.id), { methodId: tm.id, hours }]
                                                                                    : current.filter(a => a.methodId !== tm.id);
                                                                                updateTopic(subTopic.id, 'activities', next);
                                                                            }} 
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 2. Yêu cầu */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-2">2. Yêu cầu</label>
                                                        <div className="flex gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                            {[
                                                                { id: 'must_know', label: 'Phải biết', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
                                                                { id: 'should_know', label: 'Nên biết', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                                                                { id: 'could_know', label: 'Có thể biết', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
                                                            ].map(req => {
                                                                const isSelected = subTopic.requirement === req.id;
                                                                return (
                                                                    <div 
                                                                        key={req.id} 
                                                                        onClick={() => {
                                                                            const newValue = isSelected ? '' : req.id;
                                                                            updateTopic(subTopic.id, 'requirement', newValue);
                                                                        }} 
                                                                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? `${req.bg} ${req.border} ${req.color} font-bold shadow-sm` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-current' : 'border-slate-300'}`}>
                                                                            {isSelected && <div className="w-2 h-2 rounded-full bg-current"></div>}
                                                                        </div>
                                                                        {req.label}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Add Level 2 Button */}
                                    <div className="p-3 pl-8 bg-slate-50">
                                        <button 
                                            onClick={() => {
                                                const next: CourseTopic = { id: `t-${Date.now()}`, no: ``, topic: { vi: '', en: '' }, activities: [], readingRefs: [] };
                                                updateCourse({ topics: course.topics.map(t => t.id === topic.id ? { ...t, subTopics: [...(t.subTopics || []), next] } : t) });
                                            }} 
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-1 px-3 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                        >
                                            <Plus size={14} /> Thêm nội dung Level 2
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        );
    };

    return (
        <div className="h-full flex flex-col relative">
            <AILoader isVisible={isExporting} message={language === 'vi' ? 'Đang xuất tài liệu...' : 'Exporting...'} />
            
            {/* Popups for Editing Time/Readings */}
            {editingTopicTime && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm" onClick={() => setEditingTopicTime(null)}><div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 w-80" onClick={e => e.stopPropagation()}><h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Clock size={16} /> Edit Time</h4><div className="space-y-2 mb-4">{course.topics.find(t => t.id === editingTopicTime)?.activities.map((act, idx) => (<div key={idx} className="flex gap-2 items-center"><select className="text-xs font-bold border border-slate-200 rounded p-1 flex-1" value={act.methodId} onChange={e => { const t = course.topics.find(x => x.id === editingTopicTime)!; const next = [...t.activities]; next[idx].methodId = e.target.value; updateTopic(t.id, 'activities', next); }}>{teachingMethods.map(tm => <option key={tm.id} value={tm.id}>{tm.code} ({tm.category})</option>)}</select><input type="number" className="w-16 text-xs font-bold border border-slate-200 rounded p-1 text-center" value={act.hours} onChange={e => { const t = course.topics.find(x => x.id === editingTopicTime)!; const next = [...t.activities]; next[idx].hours = Number(e.target.value); updateTopic(t.id, 'activities', next); }} /><button onClick={() => { const t = course.topics.find(x => x.id === editingTopicTime)!; updateTopic(t.id, 'activities', t.activities.filter((_, i) => i !== idx)); }} className="text-slate-400 hover:text-red-500"><X size={14}/></button></div>))} <button onClick={() => { const t = course.topics.find(x => x.id === editingTopicTime)!; updateTopic(t.id, 'activities', [...t.activities, { methodId: teachingMethods[0].id, hours: 0 }]); }} className="w-full py-1 text-xs font-bold text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100">+ Add</button></div><div className="pt-2 border-t border-slate-100 flex justify-end"><button onClick={() => setEditingTopicTime(null)} className="px-3 py-1 bg-slate-800 text-white text-xs rounded font-bold">Done</button></div></div></div>
            )}
            {editingTopicReadings && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm" onClick={() => setEditingTopicReadings(null)}><div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 w-96" onClick={e => e.stopPropagation()}><h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Library size={16} /> Edit Readings</h4><div className="space-y-2 mb-4">{course.topics.find(t => t.id === editingTopicReadings)?.readingRefs.map((ref, idx) => (<div key={idx} className="flex gap-2 items-start bg-slate-50 p-2 rounded"><div className="flex-1 space-y-1"><select className="w-full text-xs font-bold border border-slate-200 rounded p-1" value={ref.resourceId} onChange={e => { const t = course.topics.find(x => x.id === editingTopicReadings)!; const next = [...t.readingRefs]; next[idx].resourceId = e.target.value; updateTopic(t.id, 'readingRefs', next); }}><option value="" disabled>Select...</option>{course.textbooks.map(tb => (<option key={tb.resourceId} value={tb.resourceId}>{tb.title}</option>))}</select><input className="w-full text-[10px] border border-slate-200 rounded p-1" placeholder="Pages" value={ref.pageRange} onChange={e => { const t = course.topics.find(x => x.id === editingTopicReadings)!; const next = [...t.readingRefs]; next[idx].pageRange = e.target.value; updateTopic(t.id, 'readingRefs', next); }} /></div><button onClick={() => { const t = course.topics.find(x => x.id === editingTopicReadings)!; updateTopic(t.id, 'readingRefs', t.readingRefs.filter((_, i) => i !== idx)); }} className="text-slate-400 hover:text-red-500 mt-1"><X size={14}/></button></div>))} <button onClick={() => { const t = course.topics.find(x => x.id === editingTopicReadings)!; updateTopic(t.id, 'readingRefs', [...t.readingRefs, { resourceId: '', pageRange: '' }]); }} className="w-full py-1 text-xs font-bold text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100">+ Add</button></div><div className="pt-2 border-t border-slate-100 flex justify-end"><button onClick={() => setEditingTopicReadings(null)} className="px-3 py-1 bg-slate-800 text-white text-xs rounded font-bold">Done</button></div></div></div>
            )}
            {isAddingMaterial && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddingMaterial(false)}><div className="bg-white rounded-xl shadow-2xl w-[600px] flex flex-col max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}><div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen size={18}/> Add Material</h3><button onClick={() => setIsAddingMaterial(false)}><X size={18} className="text-slate-400" /></button></div><div className="p-4 border-b border-slate-100 flex gap-4"><button onClick={() => setMaterialMode('search')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${materialMode === 'search' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{t.searchLibrary}</button><button onClick={() => setMaterialMode('create')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${materialMode === 'create' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{t.createResource}</button></div><div className="p-6 overflow-y-auto flex-1">{materialMode === 'search' ? (<div className="space-y-4"><input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" placeholder="Search..." value={materialSearch} onChange={e => setMaterialSearch(e.target.value)} /><div className="space-y-2">{library.filter(l => l.title.toLowerCase().includes(materialSearch.toLowerCase())).map(lib => (<div key={lib.id} className="p-3 border rounded flex justify-between items-center"><div><div className="font-bold text-sm">{lib.title}</div><div className="text-xs text-slate-500">{lib.author}</div></div><button onClick={() => { updateCourse({ textbooks: [...course.textbooks, { resourceId: lib.id, title: lib.title, author: lib.author, publisher: lib.publisher, year: lib.year, type: 'textbook' }] }); setIsAddingMaterial(false); }} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded">{t.addToCourse}</button></div>))}</div></div>) : (<div className="space-y-3"><input className="w-full p-2 border rounded" placeholder="Title" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} /><button onClick={() => { const id = `lib-${Date.now()}`; const res = { ...newMaterial, id, type: 'textbook' as const }; updateState(prev => ({ ...prev, library: [...prev.library, res] })); updateCourse({ textbooks: [...course.textbooks, { resourceId: id, title: res.title, author: res.author, publisher: res.publisher, year: res.year, type: 'textbook' }] }); setIsAddingMaterial(false); }} className="w-full py-2 bg-indigo-600 text-white rounded text-sm font-bold">Create & Add</button></div>)}</div></div></div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{language === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {language === 'vi' 
                                        ? `Bạn có chắc chắn muốn xóa môn học "${course.code}"? Hành động này không thể hoàn tác.` 
                                        : `Are you sure you want to delete course "${course.code}"? This action cannot be undone.`}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 flex gap-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-all"
                            >
                                {language === 'vi' ? 'Hủy' : 'Cancel'}
                            </button>
                            <button 
                                onClick={handleDeleteCourse}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-md"
                            >
                                {language === 'vi' ? 'Xóa môn' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Tabs */}
            <div className="flex items-center justify-between p-2 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-4">
                    {/* Nút Kế hoạch */}
                    <button
                        onClick={() => setActiveTab('plan')}
                        className={`flex items-center gap-2 pb-3 px-2 transition-colors ${
                        activeTab === 'plan' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <FileText size={18} />
                        <span className="font-medium">Kế hoạch</span>
                    </button>

                    {/* Nút Đánh giá */}
                    <button
                        onClick={() => setActiveTab('eval')}
                        className={`flex items-center gap-2 pb-3 px-2 transition-colors ${
                        activeTab === 'eval' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <ClipboardCheck size={18} />
                        <span className="font-medium">Đánh giá</span>
                    </button>
                </div>

                <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title={language === 'vi' ? 'Xóa môn học' : 'Delete course'}
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Sub-tabs for Plan section */}
            {activeTab === 'plan' && (
                <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50">
                    <button 
                        onClick={() => setTab('syllabus')} 
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-2 ${tab === 'syllabus' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <FileText size={14}/> {t.syllabusTab}
                    </button>
                    <button 
                        onClick={() => setTab('schedule')} 
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-2 ${tab === 'schedule' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Clock size={14}/> {language === 'vi' ? 'Kế hoạch giảng dạy' : 'Schedule'}
                    </button>
                </div>
            )}

            {/* Content Area */}
            {/* Nếu đang ở tab Plan, hiển thị các nội dung của syllabus */}
            {(activeTab === 'plan' && tab === 'syllabus') && renderSyllabus()}
            {(activeTab === 'plan' && tab === 'schedule') && <SyllabusScheduleModule course={course} state={state} updateState={updateState} />}
            
            {/* Nếu đang ở tab Eval, hiển thị module Đánh giá */}
            {activeTab === 'eval' && <SyllabusAssessmentModule course={course} state={state} updateState={updateState} />}
            
            {/* Nếu đang ở tab Export, hiển thị module Xuất bản */}
            {activeTab === 'export' && <SyllabusExportModule course={course} state={state} updateState={updateState} />}

        </div>
    );
};

export default SyllabusEditorModule;