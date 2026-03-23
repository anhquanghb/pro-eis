import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { TRANSLATIONS } from '../constants';
import { Search, BookOpen, Filter, Settings2, X, Plus } from 'lucide-react';
import SyllabusEditorModule from './SyllabusEditorModule';
import SyllabusConfigModule from './SyllabusConfigModule';
import AILoader from '../components/AILoader';

// IMPORT MODULE MỚI VÀO ĐÂY
import SyllabusJSONModule from './SyllabusJSONModule';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
}

const SyllabusModule: React.FC<Props> = ({ state, updateState, selectedCourseId, setSelectedCourseId }) => {
  const { language } = state;
  const globalState = state.globalState || state;
  const courseCatalog = globalState.courseCatalog || state.courses;
  const knowledgeAreas = globalState.globalConfigs?.knowledgeAreas || state.knowledgeAreas;
  const courses = courseCatalog;
  const t = TRANSLATIONS[language];
  const [courseSearch, setCourseSearch] = useState('');
  const [statsScope, setStatsScope] = useState<'all' | 'abet'>('all');
  const [showConfig, setShowConfig] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    code: '',
    nameVi: '',
    nameEn: '',
    credits: 3,
    semester: 0,
    prerequisites: [] as string[],
    coRequisites: [] as string[]
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleAddCourse = () => {
    setNewCourseForm({
      code: '',
      nameVi: '',
      nameEn: '',
      credits: 3,
      semester: 0,
      prerequisites: [],
      coRequisites: []
    });
    setShowAddModal(true);
  };

  const confirmAddCourse = () => {
    if (!newCourseForm.code || !newCourseForm.nameVi || newCourseForm.semester <= 0) {
      alert(language === 'vi' ? 'Vui lòng điền mã, tên môn học và học kỳ' : 'Please fill in course code, name and semester');
      return;
    }

    const newId = `course-${Date.now()}`;
    const newCourse: any = {
      id: newId,
      code: newCourseForm.code,
      name: { vi: newCourseForm.nameVi, en: newCourseForm.nameEn || newCourseForm.nameVi },
      credits: newCourseForm.credits,
      isEssential: true,
      type: 'REQUIRED',
      knowledgeAreaId: knowledgeAreas[0]?.id || '',
      semester: newCourseForm.semester,
      colIndex: 0,
      prerequisites: newCourseForm.prerequisites,
      coRequisites: newCourseForm.coRequisites,
      description: { vi: '', en: '' },
      textbooks: [],
      clos: { vi: [], en: [] },
      topics: [],
      assessmentPlan: [],
      instructorIds: [],
      instructorDetails: {},
      cloMap: [],
      assessmentConfigType: 'THEORY',
      theoryAssessmentConfig: {
        processWeight: 50,
        attendanceWeight: 10,
        participationWeight: 0,
        midtermWeight: 0,
        finalProcessWeight: 0,
        selfStudyWeight: 0,
        finalExamWeight: 50,
        finalExamForm: 'ESSAY',
        finalExamDuration: 90,
        finalExamAllowMaterials: false
      }
    };

    updateState(prev => {
      if (prev.globalState) {
          return {
              ...prev,
              globalState: {
                  ...prev.globalState,
                  courseCatalog: [...(prev.globalState.courseCatalog || []), newCourse]
              }
          };
      }
      return {
        ...prev,
        courses: [...prev.courses, newCourse]
      };
    });
    setSelectedCourseId(newId);
    setShowAddModal(false);
  };

  // --- Filtering Logic ---
  const filteredCourses = useMemo(() => {
    let result = courses;
    if (statsScope === 'abet') result = result.filter(c => c.isAbet);
    if (courseSearch) {
      const lower = courseSearch.toLowerCase().trim();
      result = result.filter(c => 
        (c.code || '').toLowerCase().includes(lower) || 
        (c.name?.vi || '').toLowerCase().includes(lower) ||
        (c.name?.en || '').toLowerCase().includes(lower)
      );
    }
    return result.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  }, [courses, statsScope, courseSearch]);

  const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId), [courses, selectedCourseId]);

  // --- Searchable Course Selector Component ---
  const CourseSelector = ({ 
    label, 
    selectedCodes, 
    onChange, 
    availableCourses 
  }: { 
    label: string, 
    selectedCodes: string[], 
    onChange: (codes: string[]) => void,
    availableCourses: any[]
  }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filtered = availableCourses.filter(c => 
      !selectedCodes.includes(c.code) &&
      (c.code.toLowerCase().includes(search.toLowerCase()) || 
       c.name[language].toLowerCase().includes(search.toLowerCase()))
    );

    return (
      <div className="space-y-1 relative">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
        <div className="flex flex-wrap gap-1 mb-1">
          {selectedCodes.map(code => (
            <span key={code} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold">
              {code}
              <button onClick={() => onChange(selectedCodes.filter(c => c !== code))} className="hover:text-indigo-900"><X size={10}/></button>
            </span>
          ))}
        </div>
        <div className="relative">
          <input 
            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder={language === 'vi' ? "Tìm và chọn môn học..." : "Search and select courses..."}
            value={search}
            onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
          />
          {isOpen && search && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filtered.length > 0 ? filtered.map(c => (
                <button 
                  key={c.id}
                  className="w-full p-2 text-left text-xs hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center"
                  onClick={() => {
                    onChange([...selectedCodes, c.code]);
                    setSearch('');
                    setIsOpen(false);
                  }}
                >
                  <span className="font-bold">{c.code}</span>
                  <span className="text-slate-500 truncate ml-2">{c.name[language]}</span>
                </button>
              )) : (
                <div className="p-2 text-xs text-slate-400 italic">{language === 'vi' ? 'Không tìm thấy môn học' : 'No courses found'}</div>
              )}
            </div>
          )}
          {isOpen && search && (
            <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)}></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full gap-6 overflow-hidden animate-in fade-in duration-500">
      
      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white"><Plus size={20} /></div>
                <h3 className="font-bold text-slate-800">{language === 'vi' ? 'Thêm môn học mới' : 'Add New Course'}</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'vi' ? 'Mã môn học' : 'Course Code'}</label>
                <input 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newCourseForm.code}
                  onChange={e => setNewCourseForm({...newCourseForm, code: e.target.value})}
                  placeholder="e.g. CS101"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'vi' ? 'Tên môn học (Tiếng Việt)' : 'Course Name (Vietnamese)'}</label>
                <input 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newCourseForm.nameVi}
                  onChange={e => setNewCourseForm({...newCourseForm, nameVi: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'vi' ? 'Tên môn học (Tiếng Anh)' : 'Course Name (English)'}</label>
                <input 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newCourseForm.nameEn}
                  onChange={e => setNewCourseForm({...newCourseForm, nameEn: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'vi' ? 'Số tín chỉ' : 'Credits'}</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newCourseForm.credits}
                    onChange={e => setNewCourseForm({...newCourseForm, credits: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'vi' ? 'Học kỳ' : 'Semester'}</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newCourseForm.semester || ''}
                    onChange={e => setNewCourseForm({...newCourseForm, semester: parseInt(e.target.value) || 0})}
                    placeholder="e.g. 1"
                  />
                </div>
              </div>

              {newCourseForm.semester > 0 && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <CourseSelector 
                    label={language === 'vi' ? 'Môn tiên quyết' : 'Prerequisites'}
                    selectedCodes={newCourseForm.prerequisites}
                    onChange={codes => setNewCourseForm({...newCourseForm, prerequisites: codes})}
                    availableCourses={courses.filter(c => c.semester < newCourseForm.semester)}
                  />
                  <CourseSelector 
                    label={language === 'vi' ? 'Môn song hành' : 'Co-requisites'}
                    selectedCodes={newCourseForm.coRequisites}
                    onChange={codes => setNewCourseForm({...newCourseForm, coRequisites: codes})}
                    availableCourses={courses}
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-all"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button 
                onClick={confirmAddCourse}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md"
              >
                {language === 'vi' ? 'Thêm môn' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-8 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white"><Settings2 size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-800">{language === 'vi' ? 'Cấu hình Đề cương' : 'Syllabus Configuration'}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{language === 'vi' ? 'Phương pháp giảng dạy, đánh giá & Khối kiến thức' : 'Methods & Knowledge Blocks'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowConfig(false)}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24}/>
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <SyllabusConfigModule state={state} updateState={updateState} />
                </div>
            </div>
        </div>
      )}

      {/* Sidebar: Course List */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden transition-all duration-300 relative`}>
        {!isSidebarOpen && (
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-4 left-4 z-10 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all"
                title={language === 'vi' ? 'Mở danh sách' : 'Open List'}
            >
                <BookOpen size={20} />
            </button>
        )}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 min-w-[320px]">
            <div className="flex justify-between items-center">
                <div className="flex bg-slate-200 p-1 rounded-lg flex-1 mr-2">
                    <button onClick={() => setStatsScope('abet')} className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex justify-center items-center gap-1 ${statsScope === 'abet' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}><Filter size={12}/> KĐQT</button>
                    <button onClick={() => setStatsScope('all')} className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${statsScope === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>{language === 'vi' ? 'Toàn bộ' : 'All'}</button>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={language === 'vi' ? "Tìm môn học..." : "Search courses..."} value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 mt-2">
                <button 
                    onClick={handleAddCourse}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm"
                >
                    <Plus size={14}/>
                    {language === 'vi' ? 'Thêm môn học' : 'Add Course'}
                </button>
                <button 
                    onClick={() => setShowConfig(true)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                >
                    <Settings2 size={14}/>
                    {language === 'vi' ? 'Cấu hình chung' : 'Global Config'}
                </button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-w-[320px]">
            {filteredCourses.map(c => (
                <button key={c.id} onClick={() => setSelectedCourseId(c.id)} className={`w-full p-4 text-left transition-all hover:bg-slate-50 flex items-center gap-3 border-l-4 ${selectedCourseId === c.id ? 'bg-indigo-50 border-indigo-600' : 'border-transparent'}`}>
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-500 text-xs shrink-0">{c.code.split(' ')[0]}</div>
                    <div className="min-w-0">
                        <div className="text-xs font-black text-slate-800 truncate">{c.code}</div>
                        <div className="text-[10px] text-slate-500 font-bold truncate uppercase">{c.name[language]}</div>
                    </div>
                </button>
            ))}
            {filteredCourses.length === 0 && <div className="p-8 text-center text-slate-300 text-xs italic">{language === 'vi' ? 'Không tìm thấy môn học' : 'No courses found'}</div>}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm relative">
         {!isSidebarOpen && (
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-4 left-4 z-20 p-2 bg-white border border-slate-200 text-slate-400 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
                title={language === 'vi' ? 'Mở danh sách' : 'Open List'}
             >
                <BookOpen size={20} />
             </button>
         )}
         
         {/* TÍCH HỢP MODULE VỪA TẠO VÀO ĐÂY */}
         {selectedCourse ? (
           <SyllabusEditorModule 
              course={selectedCourse} 
              state={state} 
              updateState={updateState} 
              onDelete={() => setSelectedCourseId(null)}
           />
         ) : (
           <SyllabusJSONModule 
              state={state} 
              updateState={updateState} 
           />
         )}
      </main>
    </div>
  );
};

export default SyllabusModule;