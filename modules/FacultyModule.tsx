import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppState, Faculty, FacultyTitles, FacultyTitle, FacultyListItem, Language, Course } from '../types';
import { TRANSLATIONS } from '../constants';
import { Search, Plus, Trash2, Edit2, User, GraduationCap, Briefcase, Award, Phone, Mail, Download, X, BookOpen, Layers, Star, Briefcase as BriefcaseIcon, Settings, List, BarChart3, Medal, Activity, Sparkles, Loader2, FileText, MapPin, FileJson, Upload, Filter, PackageCheck, Clock, Check, Fingerprint } from 'lucide-react';
import AILoader from '../components/AILoader';
import FullFormatText from '../components/FullFormatText';
import FacultyStatisticsModule from './FacultyStatisticsModule';
import FacultyAIImport from '../components/FacultyAIImport'; // <--- IMPORT COMPONENT MỚI

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

interface FacultyDynamicListProps {
    title: string;
    items: FacultyListItem[];
    field: keyof Faculty;
    icon: any;
    iconColor: string;
    facultyId: string;
    editLanguage: Language;
    updateFaculty: (id: string, field: keyof Faculty, value: any) => void;
}

const FacultyDynamicList: React.FC<FacultyDynamicListProps> = ({ 
    title, 
    items, 
    field, 
    icon: Icon, 
    iconColor,
    facultyId,
    editLanguage,
    updateFaculty
}) => {
    return (
        <div className="mb-8 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Icon size={18} className={iconColor}/> {title}
                </h4>
                <button 
                    onClick={() => updateFaculty(facultyId, field, [...items, { id: Date.now().toString(), content: { vi: '', en: '' } }])}
                    className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                >
                    <Plus size={14}/> {editLanguage === 'vi' ? 'Thêm' : 'Add'}
                </button>
            </div>
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={item.id} className="flex gap-2 items-center group">
                        <span className="text-[10px] font-bold text-slate-400 w-5 text-right flex-shrink-0">#{idx + 1}</span>
                        
                        {/* Single Input for Current Selected Language */}
                        <div className="flex-1 relative">
                            <input 
                                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:bg-white"
                                placeholder={editLanguage === 'vi' ? "Nhập nội dung..." : "Enter content..."}
                                value={item.content[editLanguage]}
                                onChange={e => {
                                    const newList = [...items];
                                    newList[idx] = {
                                        ...newList[idx],
                                        content: {
                                            ...newList[idx].content,
                                            [editLanguage]: e.target.value
                                        }
                                    };
                                    updateFaculty(facultyId, field, newList);
                                }}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {/* Status Indicator for OTHER language */}
                                {item.content[editLanguage === 'vi' ? 'en' : 'vi'] ? (
                                    <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 px-1 rounded border border-emerald-100 cursor-help" title="Translation available">
                                        {editLanguage === 'vi' ? 'EN' : 'VI'} OK
                                    </span>
                                ) : (
                                    <span className="text-[8px] font-bold text-amber-500 bg-amber-50 px-1 rounded border border-amber-100 cursor-help" title="Translation missing">
                                        {editLanguage === 'vi' ? 'EN' : 'VI'} --
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Delete Button */}
                        <button 
                            onClick={() => updateFaculty(facultyId, field, items.filter((_, i) => i !== idx))} 
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16}/>
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="text-center text-xs text-slate-400 italic py-6 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50">
                        {editLanguage === 'vi' ? 'Chưa có dữ liệu. Nhấn "Thêm" để bắt đầu.' : 'No items added. Click "Add" to start.'}
                    </div>
                )}
            </div>
        </div>
    );
};

const FacultyModule: React.FC<Props> = ({ state, updateState }) => {
  const { globalState, language } = state;
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [editLanguage, setEditLanguage] = useState<Language>(language);
  const [facultyScope, setFacultyScope] = useState<'all' | 'abet'>('all');

  // Fallback to flat state
  const faculties = globalState?.facultyDirectory || state.faculties || [];
  const facultyTitles = globalState?.organizationStructure?.facultyTitles || state.facultyTitles || { degrees: [], academicTitles: [], professionalTitles: [] };
  const courses = globalState?.courseCatalog || state.courses || [];
  const academicSchools = globalState?.organizationStructure?.academicSchools || state.academicSchools || [];
  const academicFaculties = globalState?.organizationStructure?.academicFaculties || state.academicFaculties || [];
  const departments = globalState?.organizationStructure?.departments || state.departments || [];

  const updateFaculties = (updater: (prevFaculties: Faculty[]) => Faculty[]) => {
    updateState(prev => {
      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            facultyDirectory: updater(prev.globalState.facultyDirectory)
          }
        };
      }
      return {
        ...prev,
        faculties: updater(prev.faculties)
      };
    });
  };

  const updateFacultyTitles = (updater: (prevTitles: FacultyTitles) => FacultyTitles) => {
    updateState(prev => {
      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            organizationStructure: {
              ...prev.globalState.organizationStructure,
              facultyTitles: updater(prev.globalState.organizationStructure.facultyTitles)
            }
          }
        };
      }
      return {
        ...prev,
        facultyTitles: updater(prev.facultyTitles)
      };
    });
  };

  // -- ID Inline Editing State --
  const [editingIdTarget, setEditingIdTarget] = useState<string | null>(null);
  const [tempIdValue, setTempIdValue] = useState('');

  // Refs for file inputs
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Main Module Tabs
  const [mainTab, setMainTab] = useState<'profiles' | 'stats' | 'categories'>('profiles');
  
  // Edit Form Tabs
  const [editFormTab, setEditFormTab] = useState<'info' | 'edu' | 'exp' | 'research' | 'achievements' | 'activities'>('info');

  // Categories Tab State
  const [categoryType, setCategoryType] = useState<keyof FacultyTitles>('degrees');

  const unitOptions = useMemo(() => {
    const options: { id: string; name: string; type: 'SCHOOL' | 'FACULTY' | 'DEPARTMENT' }[] = [];
    
    academicSchools.forEach(s => {
      options.push({ id: s.id, name: s.name[editLanguage] || s.name['vi'] || '', type: 'SCHOOL' });
      
      academicFaculties.filter(f => f.schoolId === s.id).forEach(f => {
        options.push({ id: f.id, name: `  - ${f.name[editLanguage] || f.name['vi'] || ''}`, type: 'FACULTY' });
        
        departments.filter(d => d.academicFacultyId === f.id).forEach(d => {
          options.push({ id: d.id, name: `    -- ${d.name[editLanguage] || d.name['vi'] || ''}`, type: 'DEPARTMENT' });
        });
      });
    });
    
    // Add orphans if any
    academicFaculties.filter(f => !f.schoolId).forEach(f => {
        options.push({ id: f.id, name: f.name[editLanguage] || f.name['vi'] || '', type: 'FACULTY' });
        departments.filter(d => d.academicFacultyId === f.id).forEach(d => {
            options.push({ id: d.id, name: `  - ${d.name[editLanguage] || d.name['vi'] || ''}`, type: 'DEPARTMENT' });
        });
    });

    departments.filter(d => !d.academicFacultyId).forEach(d => {
        options.push({ id: d.id, name: d.name[editLanguage] || d.name['vi'] || '', type: 'DEPARTMENT' });
    });

    return options;
  }, [academicSchools, academicFaculties, departments, editLanguage]);

  // Sync edit language with app language initially or when changed
  useEffect(() => {
      setEditLanguage(language);
  }, [language]);

  // --- Filtering & Sorting ---
  const abetInstructorIds = useMemo(() => {
      const ids = new Set<string>();
      courses.forEach(c => {
          // Identify ABET courses (isAbet or isEssential as fallback/synonym depending on usage)
          if (c.isAbet || c.isEssential) {
              c.instructorIds.forEach(id => ids.add(id));
          }
      });
      return ids;
  }, [courses]);

  const filteredFaculties = useMemo(() => {
    // 1. Filter by Search
    let filtered = faculties.filter(f => 
      (f.name[language] || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. Filter by Scope (ABET)
    if (facultyScope === 'abet') {
        filtered = filtered.filter(f => abetInstructorIds.has(f.id));
    }

    // 3. Sort by Vietnamese Name (Last Word)
    return filtered.sort((a, b) => {
        const getNameParts = (name: string) => name.trim().split(/\s+/);
        const nameA = a.name[language] || a.name['en'] || '';
        const nameB = b.name[language] || b.name['en'] || '';
        
        const partsA = getNameParts(nameA);
        const partsB = getNameParts(nameB);
        
        const lastNameA = partsA[partsA.length - 1].toLowerCase();
        const lastNameB = partsB[partsB.length - 1].toLowerCase();

        // Compare last name first
        const comparison = lastNameA.localeCompare(lastNameB, 'vi');
        
        // If last names are equal, compare the full string to ensure consistent order
        return comparison !== 0 ? comparison : nameA.localeCompare(nameB, 'vi');
    });
  }, [faculties, searchQuery, language, facultyScope, abetInstructorIds]);

  // --- Actions ---
  const handleAdd = () => {
    const newFaculty: Faculty = {
      id: `fac-${Date.now()}`,
      name: { vi: 'Giảng viên Mới', en: 'New Faculty' },
      rank: { vi: '', en: '' },
      degree: { vi: '', en: '' },
      academicTitle: { vi: '', en: '' },
      position: { vi: '', en: '' },
      experience: { vi: '0', en: '0' },
      careerStartYear: new Date().getFullYear(),
      workload: 0,
      educationList: [],
      academicExperienceList: [],
      nonAcademicExperienceList: [],
      publicationsList: [],
      certificationsList: [],
      membershipsList: [],
      honorsList: [],
      serviceActivitiesList: [],
      professionalDevelopmentList: [],
      researchDirections: { vi: '', en: '' },
      contactAddress: ''
    };
    updateFaculties(prev => [...prev, newFaculty]);
    setEditingId(newFaculty.id);
    setEditFormTab('info');
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'vi' ? "Xóa giảng viên này?" : "Delete this faculty member?")) {
      updateFaculties(prev => prev.filter(f => f.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  // --- ID Management Actions ---
  const handleStartEditId = (id: string) => {
      setEditingIdTarget(id);
      setTempIdValue(id);
  };

  const handleSaveId = () => {
      if (!editingIdTarget) return;
      const newId = tempIdValue.trim();
      const oldId = editingIdTarget;

      if (!newId) {
          alert("ID cannot be empty.");
          return;
      }

      if (newId !== oldId) {
          if (faculties.some(f => f.id === newId)) {
              alert("ID already exists. Please choose a unique ID.");
              return;
          }

          if (confirm(language === 'vi' 
              ? `Bạn có chắc muốn đổi ID từ "${oldId}" sang "${newId}"? Tất cả môn học liên quan sẽ được cập nhật tự động.`
              : `Are you sure you want to change ID from "${oldId}" to "${newId}"? All related courses will be updated automatically.`)) {
              
              updateState(prev => {
                  // 1. Update Faculty ID
                  const newFaculties = (prev.globalState?.facultyDirectory || prev.faculties).map(f => f.id === oldId ? { ...f, id: newId } : f);

                  // 2. Cascade Update to Courses
                  const newCourses = (prev.globalState?.courseCatalog || prev.courses).map(c => {
                      let changed = false;
                      const newInstructorIds = c.instructorIds.map(fid => {
                          if (fid === oldId) {
                              changed = true;
                              return newId;
                          }
                          return fid;
                      });

                      const newInstructorDetails = { ...c.instructorDetails };
                      if (newInstructorDetails[oldId]) {
                          newInstructorDetails[newId] = newInstructorDetails[oldId];
                          delete newInstructorDetails[oldId];
                          changed = true;
                      }

                      return changed 
                          ? { ...c, instructorIds: newInstructorIds, instructorDetails: newInstructorDetails }
                          : c;
                  });

                  if (prev.globalState) {
                      return {
                          ...prev,
                          globalState: {
                              ...prev.globalState,
                              facultyDirectory: newFaculties,
                              courseCatalog: newCourses
                          }
                      };
                  }
                  return { ...prev, faculties: newFaculties, courses: newCourses };
              });

              if (editingId === oldId) {
                  setEditingId(newId);
              }
          }
      }
      setEditingIdTarget(null);
  };

  const updateFaculty = (id: string, field: keyof Faculty, value: any) => {
    updateFaculties(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };
  
  const updateFacultyLang = (id: string, field: keyof Faculty, lang: 'vi'|'en', value: string) => {
     updateFaculties(prev => prev.map(f => {
          if (f.id !== id) return f;
          const current = f[field] as any;
          return { ...f, [field]: { ...current, [lang]: value } };
      }));
  };

  // --- Category Management Actions ---
  const addCategoryItem = () => {
      const newItem: FacultyTitle = {
          id: `${categoryType.slice(0,3)}-${Date.now()}`,
          name: { vi: 'Mục mới', en: 'New Item' },
          abbreviation: { vi: '', en: '' }
      };
      updateFacultyTitles(prev => ({
          ...prev,
          [categoryType]: [...prev[categoryType], newItem]
      }));
  };

  const updateCategoryItem = (id: string, field: 'name' | 'abbreviation', lang: 'vi' | 'en', value: string) => {
      updateFacultyTitles(prev => ({
          ...prev,
          [categoryType]: prev[categoryType].map(item => 
              item.id === id ? { 
                  ...item, 
                  [field]: { ...(item[field] || { vi: '', en: '' }), [lang]: value } 
              } : item
          )
      }));
  };

  const deleteCategoryItem = (id: string) => {
      if (confirm(language === 'vi' ? "Xóa mục này?" : "Delete this item?")) {
          updateFacultyTitles(prev => ({
              ...prev,
              [categoryType]: prev[categoryType].filter(item => item.id !== id)
          }));
      }
  };

  // --- Imports & Exports ---
  const handleExportJson = (faculty: Faculty) => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(faculty, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `CV_${(faculty.name?.vi || 'Faculty').replace(/\s+/g, '_')}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleExportRelatedCourses = (facultyId: string) => {
      const faculty = faculties.find(f => f.id === facultyId);
      if (!faculty) return;

      const exportState = JSON.parse(JSON.stringify(state));
      
      const newCourses = courses.map((c: Course) => {
          const isMain = c.instructorDetails && c.instructorDetails[facultyId]?.isMain;
          if (isMain) {
              return c; 
          } else {
              return {
                  id: c.id, code: c.code, name: c.name, credits: c.credits, semester: c.semester, type: c.type, colIndex: c.colIndex, prerequisites: c.prerequisites, coRequisites: c.coRequisites, knowledgeAreaId: c.knowledgeAreaId, isEssential: c.isEssential, isAbet: c.isAbet,
                  description: { vi: '', en: '' }, textbooks: [], clos: { vi: [], en: [] }, topics: [], assessmentPlan: [], instructorIds: [], instructorDetails: {}, cloMap: []
              };
          }
      });

      if (exportState.globalState) {
          exportState.globalState.facultyDirectory = [faculty];
          exportState.globalState.courseCatalog = newCourses;
      } else {
          exportState.faculties = [faculty];
          exportState.courses = newCourses;
      }

      exportState.users = []; 
      exportState.currentUser = null;
      exportState.geminiConfig = { ...exportState.geminiConfig, apiKey: '' }; 

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportState, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      const safeName = (faculty.name?.vi || 'Faculty').replace(/[^a-zA-Z0-9]/g, '_');
      downloadAnchorNode.setAttribute("download", `Program_for_${safeName}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const parsed = JSON.parse(event.target?.result as string);
              if (!parsed.name || !parsed.email) throw new Error("Invalid Faculty JSON");
              
              const newFaculty = {
                  ...parsed,
                  id: `fac-${Date.now()}` 
              };
              
              updateFaculties(prev => [...prev, newFaculty]);
              alert(language === 'vi' ? "Nhập CV thành công!" : "CV Imported Successfully!");
          } catch (err) {
              alert(language === 'vi' ? "Lỗi: File JSON không hợp lệ." : "Error: Invalid JSON file.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };


  // --- Sub-Components ---

  const renderEditForm = () => {
      const faculty = faculties.find(f => f.id === editingId);
      if (!faculty) return null;

      const tabs = [
          { id: 'info', label: editLanguage === 'vi' ? 'Thông tin chung' : 'General Info', icon: User },
          { id: 'edu', label: editLanguage === 'vi' ? 'Đào tạo' : 'Education', icon: GraduationCap },
          { id: 'exp', label: editLanguage === 'vi' ? 'Kinh nghiệm' : 'Experience', icon: Briefcase },
          { id: 'research', label: editLanguage === 'vi' ? 'Nghiên cứu' : 'Research', icon: BookOpen },
          { id: 'achievements', label: editLanguage === 'vi' ? 'Thành tích' : 'Achievements', icon: Award },
          { id: 'activities', label: editLanguage === 'vi' ? 'Hoạt động' : 'Activities', icon: Activity },
      ];

      return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center p-6 border-b border-slate-100">
                      <div>
                          <h3 className="text-xl font-bold text-slate-800">{editLanguage === 'vi' ? 'Hồ sơ Giảng viên' : 'Faculty Profile'}</h3>
                          <div className="flex flex-col">
                              <p className="text-sm text-slate-500">{faculty.name[language]}</p>
                              {/* Inline ID Editing within Modal Header */}
                              <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                                  {editingIdTarget === faculty.id ? (
                                      <div className="flex items-center gap-1">
                                          <input 
                                              className="w-32 bg-white border border-indigo-300 rounded px-1.5 py-0.5 text-[10px] font-mono text-indigo-700 outline-none focus:ring-1 focus:ring-indigo-500"
                                              value={tempIdValue}
                                              onChange={(e) => setTempIdValue(e.target.value)}
                                              onKeyDown={(e) => e.key === 'Enter' && handleSaveId()}
                                              autoFocus
                                          />
                                          <button onClick={handleSaveId} className="p-0.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"><Check size={10}/></button>
                                          <button onClick={() => setEditingIdTarget(null)} className="p-0.5 bg-slate-300 text-slate-600 rounded hover:bg-slate-400"><X size={10}/></button>
                                      </div>
                                  ) : (
                                      <div 
                                          className="text-[10px] text-slate-400 font-mono flex items-center gap-1 hover:text-indigo-600 transition-colors w-fit cursor-pointer border border-transparent hover:border-indigo-100 rounded px-1 -ml-1"
                                          onDoubleClick={() => handleStartEditId(faculty.id)}
                                          title={language === 'vi' ? 'Nhấp đúp để sửa ID' : 'Double click to edit ID'}
                                      >
                                          <Fingerprint size={10}/> {faculty.id}
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                      <div className="flex gap-2 items-center">
                          {/* Language Switcher */}
                          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
                              <button 
                                  onClick={() => setEditLanguage('vi')} 
                                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${editLanguage === 'vi' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                  VI
                              </button>
                              <button 
                                  onClick={() => setEditLanguage('en')} 
                                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${editLanguage === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                  EN
                              </button>
                          </div>

                          {/* AI Actions Group (NEW) */}
                          <div className="flex gap-2 mr-2">
                              <FacultyAIImport 
                                  faculty={faculty}
                                  state={state}
                                  updateState={updateState}
                                  language={language}
                              />
                          </div>

                          <div className="h-8 w-px bg-slate-200 mx-2"></div>

                          {/* Export JSON */}
                          <button 
                              onClick={() => handleExportJson(faculty)} 
                              className="px-3 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-2 transition-colors"
                              title={editLanguage === 'vi' ? 'Xuất CV dạng JSON' : 'Export CV JSON'}
                          >
                              <FileJson size={16}/> {editLanguage === 'vi' ? 'JSON' : 'JSON'}
                          </button>
                          
                          <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                              <X size={24}/>
                          </button>
                      </div>
                  </div>

                  <div className="flex flex-1 overflow-hidden">
                      {/* Tabs Sidebar */}
                      <div className="w-64 bg-slate-50 border-r border-slate-100 p-4 space-y-1">
                          {tabs.map(tab => (
                              <button
                                  key={tab.id}
                                  onClick={() => setEditFormTab(tab.id as any)}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${editFormTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                              >
                                  <tab.icon size={18}/> {tab.label}
                              </button>
                          ))}
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                          {editFormTab === 'info' && (
                              <div className="space-y-6 max-w-3xl">
                                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={18} className="text-indigo-600"/> {editLanguage === 'vi' ? 'Thông tin cá nhân' : 'Personal Info'} ({editLanguage.toUpperCase()})</h4>
                                      <div className="grid grid-cols-1 gap-4">
                                          <div>
                                              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Họ và tên' : 'Full Name'}</label>
                                              <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                                  value={faculty.name[editLanguage]} 
                                                  onChange={e => updateFacultyLang(faculty.id, 'name', editLanguage, e.target.value)} 
                                                  placeholder={editLanguage === 'vi' ? "Nhập họ tên..." : "Enter full name..."}
                                              />
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Chức danh' : 'Rank'}</label>
                                                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={faculty.rank.en} onChange={e => {
                                                      const selected = facultyTitles.ranks.find(r => r.name.en === e.target.value);
                                                      if (selected) updateFaculty(faculty.id, 'rank', selected.name);
                                                  }}>
                                                      <option value="">{editLanguage === 'vi' ? 'Chọn...' : 'Select...'}</option>
                                                      {facultyTitles.ranks.map(r => <option key={r.id} value={r.name.en}>{r.name[editLanguage]}</option>)}
                                                  </select>
                                              </div>
                                              <div>
                                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Học vị' : 'Degree'}</label>
                                                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={faculty.degree.en} onChange={e => {
                                                      const selected = facultyTitles.degrees.find(d => d.name.en === e.target.value);
                                                      if (selected) updateFaculty(faculty.id, 'degree', selected.name);
                                                  }}>
                                                      <option value="">{editLanguage === 'vi' ? 'Chọn...' : 'Select...'}</option>
                                                      {facultyTitles.degrees.map(d => <option key={d.id} value={d.name.en}>{d.name[editLanguage]}</option>)}
                                                  </select>
                                              </div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Học hàm' : 'Academic Title'}</label>
                                                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={faculty.academicTitle.en} onChange={e => {
                                                      const selected = facultyTitles.academicTitles.find(t => t.name.en === e.target.value);
                                                      if (selected) updateFaculty(faculty.id, 'academicTitle', selected.name);
                                                  }}>
                                                      <option value="">{editLanguage === 'vi' ? 'Chọn...' : 'Select...'}</option>
                                                      {facultyTitles.academicTitles.map(t => <option key={t.id} value={t.name.en}>{t.name[editLanguage]}</option>)}
                                                  </select>
                                              </div>
                                               <div>
                                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Chức vụ' : 'Position'}</label>
                                                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={faculty.position.en} onChange={e => {
                                                      const selected = facultyTitles.positions.find(t => t.name.en === e.target.value);
                                                      if (selected) updateFaculty(faculty.id, 'position', selected.name);
                                                  }}>
                                                      <option value="">{editLanguage === 'vi' ? 'Chọn...' : 'Select...'}</option>
                                                      {facultyTitles.positions.map(t => <option key={t.id} value={t.name.en}>{t.name[editLanguage]}</option>)}
                                                  </select>
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Phone size={18} className="text-emerald-600"/> {editLanguage === 'vi' ? 'Liên hệ & Công tác' : 'Contact & Work'}</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                          <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email</label><input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" value={faculty.email || ''} onChange={e => updateFaculty(faculty.id, 'email', e.target.value)} /></div>
                                          <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Điện thoại' : 'Phone'}</label><input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" value={faculty.tel || ''} onChange={e => updateFaculty(faculty.id, 'tel', e.target.value)} /></div>
                                          <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Di động' : 'Cell Phone'}</label><input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" value={faculty.cell || ''} onChange={e => updateFaculty(faculty.id, 'cell', e.target.value)} /></div>
                                          <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Địa chỉ liên hệ' : 'Contact Address'}</label><input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" value={faculty.contactAddress || ''} onChange={e => updateFaculty(faculty.id, 'contactAddress', e.target.value)} /></div>
                                          <div className="col-span-2 md:col-span-1">
                                              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Đơn vị' : 'Unit'}</label>
                                              <select 
                                                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                                  value={faculty.unitId || ''} 
                                                  onChange={e => {
                                                      const selected = unitOptions.find(o => o.id === e.target.value);
                                                      if (selected) {
                                                          updateState(prev => ({
                                                              ...prev,
                                                              faculties: prev.faculties.map(f => f.id === faculty.id ? { ...f, unitId: selected.id, unitType: selected.type } : f)
                                                          }));
                                                      } else {
                                                          updateState(prev => ({
                                                              ...prev,
                                                              faculties: prev.faculties.map(f => f.id === faculty.id ? { ...f, unitId: undefined, unitType: undefined } : f)
                                                          }));
                                                      }
                                                  }}
                                              >
                                                  <option value="">{editLanguage === 'vi' ? 'Chọn đơn vị...' : 'Select unit...'}</option>
                                                  {unitOptions.map(opt => (
                                                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                                                  ))}
                                              </select>
                                          </div>
                                          <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Văn phòng' : 'Office'}</label><input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" value={faculty.office || ''} onChange={e => updateFaculty(faculty.id, 'office', e.target.value)} /></div>
                                          <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{editLanguage === 'vi' ? 'Giờ ở văn phòng' : 'Office Hours'}</label><input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" value={faculty.officeHours || ''} onChange={e => updateFaculty(faculty.id, 'officeHours', e.target.value)} placeholder={editLanguage === 'vi' ? "VD: Thứ 2, Thứ 4 (8:00 - 10:00)" : "Ex: Mon, Wed (8:00 - 10:00)"} /></div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {editFormTab === 'edu' && (
                              <div className="space-y-4">
                                  {faculty.educationList.map((edu, idx) => (
                                      <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 relative group shadow-sm">
                                          <button onClick={() => updateFaculty(faculty.id, 'educationList', faculty.educationList.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                          <div className="grid grid-cols-6 gap-4">
                                              <div className="col-span-1">
                                                  <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{editLanguage === 'vi' ? 'Năm' : 'Year'}</label>
                                                  <input className="w-full p-2 border border-slate-200 rounded text-sm bg-slate-50" value={edu.year} onChange={e => { const n = [...faculty.educationList]; n[idx].year = e.target.value; updateFaculty(faculty.id, 'educationList', n); }} placeholder="Year" />
                                              </div>
                                              <div className="col-span-2">
                                                  <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{editLanguage === 'vi' ? 'Bằng cấp' : 'Degree'} ({editLanguage})</label>
                                                  <input className="w-full p-2 border border-slate-200 rounded text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" value={edu.degree[editLanguage]} onChange={e => { const n = [...faculty.educationList]; n[idx].degree = {...n[idx].degree, [editLanguage]: e.target.value}; updateFaculty(faculty.id, 'educationList', n); }} placeholder={editLanguage === 'vi' ? "Tên bằng cấp" : "Degree Name"} />
                                              </div>
                                              <div className="col-span-3">
                                                  <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{editLanguage === 'vi' ? 'Nơi đào tạo' : 'Institution'} ({editLanguage})</label>
                                                  <input className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={edu.institution[editLanguage]} onChange={e => { const n = [...faculty.educationList]; n[idx].institution = {...n[idx].institution, [editLanguage]: e.target.value}; updateFaculty(faculty.id, 'educationList', n); }} placeholder={editLanguage === 'vi' ? "Tên trường" : "Institution Name"} />
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                                  <button onClick={() => updateFaculty(faculty.id, 'educationList', [...faculty.educationList, { id: Date.now().toString(), degree: { vi: '', en: '' }, discipline: { vi: '', en: '' }, institution: { vi: '', en: '' }, year: '' }])} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 bg-slate-50/50"><Plus size={16}/> {editLanguage === 'vi' ? 'Thêm quá trình đào tạo' : 'Add Education'}</button>
                              </div>
                          )}

                          {editFormTab === 'exp' && (
                              <div className="space-y-8">
                                  <div>
                                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200"><Clock size={18} className="text-amber-600"/> {editLanguage === 'vi' ? 'Tổng quan Kinh nghiệm' : 'Experience Overview'}</h4>
                                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4 grid grid-cols-2 gap-6">
                                          <div>
                                              <label className="text-xs font-bold text-amber-800 uppercase mb-1 block">{editLanguage === 'vi' ? 'Năm bắt đầu công tác' : 'Career Start Year'}</label>
                                              <input 
                                                  type="number" 
                                                  className="w-full p-2.5 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-bold text-amber-900" 
                                                  value={faculty.careerStartYear || ''} 
                                                  onChange={e => {
                                                      const startYear = parseInt(e.target.value);
                                                      const currentYear = new Date().getFullYear();
                                                      const diff = !isNaN(startYear) ? Math.max(0, currentYear - startYear) : 0;
                                                      
                                                      updateState(prev => ({
                                                          ...prev,
                                                          faculties: prev.faculties.map(f => f.id === faculty.id ? {
                                                              ...f,
                                                              careerStartYear: startYear,
                                                              experience: { vi: diff.toString(), en: diff.toString() }
                                                          } : f)
                                                      }));
                                                  }}
                                                  placeholder="YYYY"
                                              />
                                          </div>
                                          <div className="flex flex-col justify-end pb-2">
                                              <span className="text-xs text-amber-700 font-medium">{editLanguage === 'vi' ? 'Số năm kinh nghiệm tính toán:' : 'Calculated Experience:'}</span>
                                              <span className="text-2xl font-black text-amber-900">{faculty.experience?.vi || 0} {editLanguage === 'vi' ? 'năm' : 'years'}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200"><Briefcase size={18} className="text-indigo-600"/> {editLanguage === 'vi' ? 'Kinh nghiệm Học thuật' : 'Academic Experience'}</h4>
                                      <div className="space-y-3">
                                          {faculty.academicExperienceList.map((exp, idx) => (
                                              <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 relative group shadow-sm">
                                                  <button onClick={() => updateFaculty(faculty.id, 'academicExperienceList', faculty.academicExperienceList.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                                  <div className="grid grid-cols-4 gap-3">
                                                      <div>
                                                          <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{editLanguage === 'vi' ? 'Thời gian' : 'Period'}</label>
                                                          <input className="w-full p-2 border border-slate-200 rounded text-sm bg-slate-50" value={exp.period} onChange={e => { const n = [...faculty.academicExperienceList]; n[idx].period = e.target.value; updateFaculty(faculty.id, 'academicExperienceList', n); }} />
                                                      </div>
                                                      <div className="col-span-3 flex gap-2">
                                                          <div className="flex-1">
                                                              <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{editLanguage === 'vi' ? 'Nơi công tác' : 'Institution'} ({editLanguage})</label>
                                                              <input className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={exp.institution[editLanguage]} onChange={e => { const n = [...faculty.academicExperienceList]; n[idx].institution[editLanguage] = e.target.value; updateFaculty(faculty.id, 'academicExperienceList', n); }} />
                                                          </div>
                                                          <div className="flex-1">
                                                              <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{editLanguage === 'vi' ? 'Chức vụ/Vị trí' : 'Title/Rank'} ({editLanguage})</label>
                                                              <input className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={exp.title[editLanguage]} onChange={e => { const n = [...faculty.academicExperienceList]; n[idx].title[editLanguage] = e.target.value; updateFaculty(faculty.id, 'academicExperienceList', n); }} />
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          ))}
                                          <button onClick={() => updateFaculty(faculty.id, 'academicExperienceList', [...faculty.academicExperienceList, { id: Date.now().toString(), institution: { vi: '', en: '' }, rank: { vi: '', en: '' }, title: { vi: '', en: '' }, period: '', isFullTime: true }])} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"><Plus size={14}/> {editLanguage === 'vi' ? 'Thêm Kinh nghiệm' : 'Add Academic Exp'}</button>
                                      </div>
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200"><BriefcaseIcon size={18} className="text-emerald-600"/> {editLanguage === 'vi' ? 'Kinh nghiệm Phi học thuật' : 'Non-Academic Experience'}</h4>
                                      <div className="space-y-3">
                                          {faculty.nonAcademicExperienceList.map((exp, idx) => (
                                              <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 relative group shadow-sm">
                                                  <button onClick={() => updateFaculty(faculty.id, 'nonAcademicExperienceList', faculty.nonAcademicExperienceList.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                                  <div className="grid grid-cols-4 gap-3">
                                                      <div>
                                                          <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{editLanguage === 'vi' ? 'Thời gian' : 'Period'}</label>
                                                          <input className="w-full p-2 border border-slate-200 rounded text-sm bg-slate-50" value={exp.period} onChange={e => { const n = [...faculty.nonAcademicExperienceList]; n[idx].period = e.target.value; updateFaculty(faculty.id, 'nonAcademicExperienceList', n); }} />
                                                      </div>
                                                      <div className="col-span-3 space-y-2">
                                                          <div className="flex gap-2">
                                                              <div className="flex-1">
                                                                  <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{editLanguage === 'vi' ? 'Công ty/Tổ chức' : 'Company'} ({editLanguage})</label>
                                                                  <input className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={exp.company[editLanguage]} onChange={e => { const n = [...faculty.nonAcademicExperienceList]; n[idx].company[editLanguage] = e.target.value; updateFaculty(faculty.id, 'nonAcademicExperienceList', n); }} />
                                                              </div>
                                                              <div className="flex-1">
                                                                  <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{editLanguage === 'vi' ? 'Chức danh' : 'Title'} ({editLanguage})</label>
                                                                  <input className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={exp.title[editLanguage]} onChange={e => { const n = [...faculty.nonAcademicExperienceList]; n[idx].title[editLanguage] = e.target.value; updateFaculty(faculty.id, 'nonAcademicExperienceList', n); }} />
                                                              </div>
                                                          </div>
                                                          <div>
                                                              <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{editLanguage === 'vi' ? 'Mô tả' : 'Description'} ({editLanguage})</label>
                                                              <input className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={exp.description[editLanguage]} onChange={e => { const n = [...faculty.nonAcademicExperienceList]; n[idx].description[editLanguage] = e.target.value; updateFaculty(faculty.id, 'nonAcademicExperienceList', n); }} />
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          ))}
                                          <button onClick={() => updateFaculty(faculty.id, 'nonAcademicExperienceList', [...faculty.nonAcademicExperienceList, { id: Date.now().toString(), company: { vi: '', en: '' }, title: { vi: '', en: '' }, description: { vi: '', en: '' }, period: '', isFullTime: true }])} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Plus size={14}/> {editLanguage === 'vi' ? 'Thêm Kinh nghiệm' : 'Add Non-Academic Exp'}</button>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {editFormTab === 'research' && (
                              <div className="space-y-4">
                                  {/* Main Research Directions */}
                                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
                                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                          <Sparkles size={18} className="text-indigo-600"/> 
                                          {editLanguage === 'vi' ? 'Các hướng nghiên cứu chính' : 'Main Research Directions'} ({editLanguage.toUpperCase()})
                                      </h4>
                                      <FullFormatText 
                                          value={faculty.researchDirections?.[editLanguage] || ''}
                                          onChange={(val) => updateFacultyLang(faculty.id, 'researchDirections', editLanguage, val)}
                                          placeholder={editLanguage === 'vi' ? "Nhập các hướng nghiên cứu chính..." : "Enter main research directions..."}
                                      />
                                  </div>

                                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                      <h4 className="font-bold text-slate-700 flex items-center gap-2"><BookOpen size={18} className="text-indigo-600"/> {editLanguage === 'vi' ? 'Công bố Khoa học' : 'Publications'} ({editLanguage})</h4>
                                      <button onClick={() => updateFaculty(faculty.id, 'publicationsList', [...(faculty.publicationsList || []), { id: Date.now().toString(), text: { vi: '', en: '' } }])} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-100"><Plus size={14}/> {editLanguage === 'vi' ? 'Thêm' : 'Add'}</button>
                                  </div>
                                  <div className="space-y-2">
                                      {(faculty.publicationsList || []).map((pub, idx) => (
                                          <div key={idx} className="flex gap-2 items-start group">
                                              <span className="text-xs font-bold text-slate-400 mt-2 w-6 text-right">{idx + 1}.</span>
                                              <div className="flex-1 relative">
                                                  <textarea 
                                                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" 
                                                      rows={2} 
                                                      value={pub.text[editLanguage]} 
                                                      onChange={e => { const n = [...(faculty.publicationsList || [])]; n[idx].text[editLanguage] = e.target.value; updateFaculty(faculty.id, 'publicationsList', n); }} 
                                                      placeholder={editLanguage === 'vi' ? "Nhập thông tin công bố..." : "Enter publication details..."}
                                                  />
                                                  <div className="absolute right-2 top-2">
                                                       {pub.text[editLanguage === 'vi' ? 'en' : 'vi'] ? <span className="w-2 h-2 rounded-full bg-emerald-400 block" title="Translation available"></span> : <span className="w-2 h-2 rounded-full bg-amber-400 block" title="Missing translation"></span>}
                                                  </div>
                                              </div>
                                              <button onClick={() => updateFaculty(faculty.id, 'publicationsList', faculty.publicationsList!.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1"><Trash2 size={16}/></button>
                                          </div>
                                      ))}
                                      {faculty.publicationsList.length === 0 && <div className="text-center text-slate-400 text-xs italic py-8 border-2 border-dashed border-slate-200 rounded-xl">{editLanguage === 'vi' ? 'Chưa có công bố nào' : 'No publications added'}</div>}
                                  </div>
                              </div>
                          )}

                          {editFormTab === 'achievements' && (
                              <div className="space-y-8">
                                  <FacultyDynamicList 
                                      title={editLanguage === 'vi' ? 'Khen thưởng & Giải thưởng' : 'Honors and Awards'}
                                      items={faculty.honorsList || []}
                                      field="honorsList"
                                      icon={Star}
                                      iconColor="text-amber-500"
                                      facultyId={faculty.id}
                                      editLanguage={editLanguage}
                                      updateFaculty={updateFaculty}
                                  />
                                  <FacultyDynamicList 
                                      title={editLanguage === 'vi' ? 'Chứng chỉ' : 'Certifications'}
                                      items={faculty.certificationsList || []}
                                      field="certificationsList"
                                      icon={Medal}
                                      iconColor="text-emerald-500"
                                      facultyId={faculty.id}
                                      editLanguage={editLanguage}
                                      updateFaculty={updateFaculty}
                                  />
                              </div>
                          )}

                          {editFormTab === 'activities' && (
                              <div className="space-y-8">
                                  <FacultyDynamicList 
                                      title={editLanguage === 'vi' ? 'Hoạt động Phục vụ cộng đồng' : 'Service Activities'}
                                      items={faculty.serviceActivitiesList || []}
                                      field="serviceActivitiesList"
                                      icon={Layers}
                                      iconColor="text-blue-500"
                                      facultyId={faculty.id}
                                      editLanguage={editLanguage}
                                      updateFaculty={updateFaculty}
                                  />
                                  <FacultyDynamicList 
                                      title={editLanguage === 'vi' ? 'Hoạt động Phát triển chuyên môn' : 'Professional Development'}
                                      items={faculty.professionalDevelopmentList || []}
                                      field="professionalDevelopmentList"
                                      icon={Briefcase}
                                      iconColor="text-purple-500"
                                      facultyId={faculty.id}
                                      editLanguage={editLanguage}
                                      updateFaculty={updateFaculty}
                                  />
                                  <FacultyDynamicList 
                                      title={editLanguage === 'vi' ? 'Thành viên tổ chức' : 'Memberships'}
                                      items={faculty.membershipsList || []}
                                      field="membershipsList"
                                      icon={User}
                                      iconColor="text-slate-500"
                                      facultyId={faculty.id}
                                      editLanguage={editLanguage}
                                      updateFaculty={updateFaculty}
                                  />
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderProfiles = () => (
      <>
        {/* Toolbar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0 mb-6">
            <div className="flex items-center gap-4">
                <div className="relative w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Search faculty..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                {/* Scope Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button 
                        onClick={() => setFacultyScope('all')} 
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${facultyScope === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {language === 'vi' ? 'Toàn bộ' : 'All'}
                    </button>
                    <button 
                        onClick={() => setFacultyScope('abet')} 
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${facultyScope === 'abet' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Filter size={10}/> KĐQT
                    </button>
                </div>
            </div>
            
            <div className="flex gap-2">
                <input type="file" ref={jsonInputRef} className="hidden" accept=".json" onChange={handleImportJson} />
                <button onClick={() => jsonInputRef.current?.click()} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition">
                    <Upload size={16} /> {language === 'vi' ? 'Nhập JSON' : 'Import JSON'}
                </button>

                <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm">
                    <Plus size={16} /> {language === 'vi' ? 'Thêm mới' : 'Add Faculty'}
                </button>
            </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFaculties.map(f => (
                <div key={f.id} className="group bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col gap-3 relative cursor-pointer" onClick={() => { setEditingId(f.id); setEditFormTab('info'); }}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold shadow-sm shrink-0">
                                {f.name[language]?.charAt(0) || <User size={20}/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-800 text-sm line-clamp-1">{f.name[language]}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">{f.rank[language]}</div>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" onClick={e => e.stopPropagation()}>
                            <button 
                                onClick={() => handleExportRelatedCourses(f.id)} 
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title={language === 'vi' ? 'Xuất môn học liên quan' : 'Export Related Courses'}
                            >
                                <PackageCheck size={14}/>
                            </button>
                            <button onClick={() => { setEditingId(f.id); setEditFormTab('info'); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={14}/></button>
                            <button onClick={() => handleDelete(f.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                    </div>
                    
                    <div className="space-y-2 mt-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <GraduationCap size={14} className="text-indigo-400"/>
                            <span className="truncate">{f.degree[language] || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Mail size={14} className="text-emerald-400"/>
                            <span className="truncate">{f.email || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-200 mt-auto flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">{f.experience[language] || 0} years exp</span>
                        {f.educationList.length > 0 && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{f.educationList.length} Degrees</span>}
                    </div>
                </div>
            ))}
            {filteredFaculties.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    {language === 'vi' ? 'Không tìm thấy giảng viên nào.' : 'No faculty found.'}
                </div>
            )}
        </div>
      </>
  );

  const renderCategories = () => (
      <div className="flex gap-6 h-full animate-in fade-in">
          {/* Sidebar */}
          <div className="w-64 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden h-fit">
              <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 text-xs uppercase tracking-wider">{language === 'vi' ? 'Loại danh mục' : 'Category Type'}</div>
              <div className="p-2 space-y-1">
                  <button onClick={() => setCategoryType('degrees')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoryType === 'degrees' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>{language === 'vi' ? 'Học vị' : 'Degrees'}</button>
                  <button onClick={() => setCategoryType('ranks')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoryType === 'ranks' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>{language === 'vi' ? 'Chức danh' : 'Ranks'}</button>
                  <button onClick={() => setCategoryType('academicTitles')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoryType === 'academicTitles' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>{language === 'vi' ? 'Học hàm' : 'Academic Titles'}</button>
                  <button onClick={() => setCategoryType('positions')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoryType === 'positions' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>{language === 'vi' ? 'Chức vụ' : 'Positions'}</button>
              </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden h-[600px]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <List size={18}/> {language === 'vi' ? 'Danh sách mục' : 'Item List'}
                  </h3>
                  <button onClick={addCategoryItem} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-sm"><Plus size={14}/> {language === 'vi' ? 'Thêm mới' : 'Add Item'}</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                  <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-[10px] font-bold text-slate-400 uppercase">
                      <div className="col-span-4">Name (VI)</div>
                      <div className="col-span-4">Name (EN)</div>
                      <div className="col-span-1">Abbr (VI)</div>
                      <div className="col-span-1">Abbr (EN)</div>
                      <div className="col-span-2 text-right">Actions</div>
                  </div>
                  {facultyTitles[categoryType].map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-indigo-300 transition-colors group">
                          <div className="col-span-4"><input className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-sm font-medium" value={item.name?.vi || ''} onChange={e => updateCategoryItem(item.id, 'name', 'vi', e.target.value)} placeholder="Tên (VI)" /></div>
                          <div className="col-span-4"><input className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-sm font-medium" value={item.name?.en || ''} onChange={e => updateCategoryItem(item.id, 'name', 'en', e.target.value)} placeholder="Name (EN)" /></div>
                          <div className="col-span-1"><input className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-xs font-bold text-slate-600" value={item.abbreviation?.vi || ''} onChange={e => updateCategoryItem(item.id, 'abbreviation', 'vi', e.target.value)} placeholder="VT (VI)" /></div>
                          <div className="col-span-1"><input className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-xs font-bold text-slate-600" value={item.abbreviation?.en || ''} onChange={e => updateCategoryItem(item.id, 'abbreviation', 'en', e.target.value)} placeholder="Abbr (EN)" /></div>
                          <div className="col-span-2 text-right">
                              <button onClick={() => deleteCategoryItem(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col">
      {renderEditForm()}

      {/* Main Tabs Navigation */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 flex gap-2 w-fit">
          <button onClick={() => setMainTab('profiles')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${mainTab === 'profiles' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
              <User size={16}/> {language === 'vi' ? 'Hồ sơ' : 'Profiles'}
          </button>
          <button onClick={() => setMainTab('stats')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${mainTab === 'stats' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
              <BarChart3 size={16}/> {language === 'vi' ? 'Thống kê đội ngũ' : 'Staff Stats'}
          </button>
          <button onClick={() => setMainTab('categories')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${mainTab === 'categories' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Settings size={16}/> {language === 'vi' ? 'Quản lý chức danh' : 'Titles Management'}
          </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
          {mainTab === 'profiles' && renderProfiles()}
          {mainTab === 'stats' && <FacultyStatisticsModule faculties={filteredFaculties} courses={courses} language={language} scope={facultyScope} setScope={setFacultyScope} />}
          {mainTab === 'categories' && renderCategories()}
      </div>
    </div>
  );
};

export default FacultyModule;