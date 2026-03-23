import React, { useState } from 'react';
import { AppState } from '../types';
import { TRANSLATIONS, INITIAL_STATE } from '../constants';
import { clearHandles } from '../utils/fileStorage';
import { useDataSync } from '../hooks/useDataSync';
import ConflictResolverModal from '../components/ConflictResolverModal';
import { 
  Save, Key, Check, AlertTriangle, RefreshCw, Trash2, MessageSquare, ChevronDown, 
  ChevronUp, Shield, ShieldOff, Info, Wrench, RotateCcw, Upload, Database
} from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onRepair: () => void;
}

const SettingsModule: React.FC<Props> = ({ state, updateState, onRepair }) => {
  const { language, authEnabled } = state;
  const geminiConfig = state.globalState?.geminiConfig || state.geminiConfig;
  const t = TRANSLATIONS[language];
  
  // Basic Config State
  const [model, setModel] = useState(geminiConfig.model);
  const [apiKey, setApiKey] = useState(geminiConfig.apiKey || '');
  const [prompts, setPrompts] = useState(geminiConfig.prompts);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- TÍCH HỢP HOOK XỬ LÝ XUNG ĐỘT DỮ LIỆU ---
  // Tạo hàm wrapper để map giữa (newState) và (prev => newState)
  const setAppState = (newState: AppState) => {
    updateState(() => newState);
  };

  const { 
    isResolving, 
    pendingConflicts, 
    initiateImport, 
    finalizeResolution, 
    cancelResolution 
  } = useDataSync(state, setAppState);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string) as AppState;
        const incomingCourses = jsonData.programs?.[0]?.courses;
        
        if (incomingCourses && incomingCourses.length > 0) {
          // Gọi hook để bắt đầu quá trình kiểm tra xung đột
          initiateImport(incomingCourses);
        } else {
          alert(language === 'vi' ? "Không tìm thấy dữ liệu khóa học trong file JSON để import." : "No course data found in the JSON file to import.");
        }
      } catch (error) {
        console.error("Parse error:", error);
        alert(language === 'vi' ? "Lỗi đọc file JSON! Định dạng không hợp lệ." : "Error parsing JSON file! Invalid format.");
      }
    };
    reader.readAsText(file);
    // Reset input để có thể upload lại cùng 1 file
    e.target.value = '';
  };
  // ----------------------------------------------

  const saveConfig = () => {
    updateState(prev => {
      const newConfig = {
        ...geminiConfig,
        model,
        apiKey: apiKey.trim() || undefined,
        prompts
      };
      
      return {
        ...prev,
        geminiConfig: newConfig, // Fallback
        globalState: prev.globalState ? {
          ...prev.globalState,
          geminiConfig: newConfig
        } : undefined
      };
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const toggleAuthRequirement = () => {
    const newValue = !authEnabled;
    const confirmMsg = language === 'vi' 
      ? (newValue ? "Bật yêu cầu đăng nhập bằng Google?" : "Tắt yêu cầu đăng nhập? Bất kỳ ai có liên kết đều có thể truy cập hệ thống.") 
      : (newValue ? "Enable Google Sign-In requirement?" : "Disable login requirement? Anyone with the link can access the system.");

    if (confirm(confirmMsg)) {
        updateState(prev => ({ ...prev, authEnabled: newValue }));
    }
  };

  const clearData = async () => {
      const msg = language === 'vi' 
        ? 'CẢNH BÁO: Thao tác này sẽ xoá sạch toàn bộ dữ liệu trong bộ nhớ đệm (Cache) và khôi phục TOÀN BỘ dữ liệu thiết kế về trạng thái mặc định của hệ thống. Trang web sẽ tự động tải lại. Bạn có chắc chắn muốn thực hiện?' 
        : 'WARNING: This will clear all cached data and restore ALL design data to the system default state. The page will reload automatically. Are you sure?';

      if (confirm(msg)) {
          localStorage.clear();
          sessionStorage.clear();
          try {
              await clearHandles();
          } catch (e) {
              console.error("Failed to clear file handles", e);
          }
          window.location.reload();
      }
  };

  const normalizeData = () => {
    const confirmMsg = language === 'vi' 
        ? "Thao tác này sẽ:\n1. Chuẩn hóa ID cho Môn học và Giảng viên.\n2. Xóa các liên kết mapping bị lỗi.\n3. Xoá bỏ môn học thừa trong Cấu trúc chương trình (Module 8) không tồn tại trong danh mục.\n\nTiếp tục?" 
        : "This will:\n1. Standardize IDs for Courses and Faculty.\n2. Remove broken mapping links.\n3. Remove orphaned courses in Program Structure (Module 8) that do not exist in the catalog.\n\nContinue?";

    if (!confirm(confirmMsg)) return;

    updateState(prev => {
        const idMap = {
            courses: new Map<string, string>(),
            faculty: new Map<string, string>(),
        };

        const genId = (prefix: string, seed: string | number) => `${prefix}-${seed}`;

        const prevFaculties = prev.globalState?.facultyDirectory || prev.faculties || [];
        const prevCourses = prev.globalState?.courseCatalog || prev.courses || [];
        const currentProgram = prev.programs?.find(p => p.id === prev.currentProgramId);
        
        const prevCourseSoMap = currentProgram?.courseSoMap || prev.courseSoMap || [];
        const prevCoursePiMap = currentProgram?.coursePiMap || prev.coursePiMap || [];
        const prevCoursePeoMap = currentProgram?.coursePeoMap || prev.coursePeoMap || [];
        
        const prevMoetInfo = currentProgram?.moetInfo || prev.generalInfo?.moetInfo || { 
            programStructure: { gen: [], phys: [], fund: [], spec: [], grad: [] }, 
            courseObjectiveMap: [] 
        };

        const newFaculties = prevFaculties.map((f, i) => {
            const safeName = f.name[prev.language].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 10);
            const newId = genId('fac', `${safeName}_${i}`);
            idMap.faculty.set(f.id, newId);
            return { ...f, id: newId };
        });

        const newCourses = prevCourses.map((c, i) => {
            let baseId = c.code.trim().toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
            if (!baseId || baseId.length < 2) baseId = genId('CID', i);
            if (Array.from(idMap.courses.values()).includes(baseId)) baseId = `${baseId}_${i}`;
            idMap.courses.set(c.id, baseId);
            
            const newInstructorIds = c.instructorIds.map(fid => idMap.faculty.get(fid) || fid).filter(id => newFaculties.some(f => f.id === id));
            const newInstructorDetails: any = {};
            Object.keys(c.instructorDetails || {}).forEach(oldFid => {
                const newFid = idMap.faculty.get(oldFid);
                if (newFid && newFaculties.some(f => f.id === newFid)) {
                    newInstructorDetails[newFid] = c.instructorDetails![oldFid];
                }
            });

            return { ...c, id: baseId, instructorIds: newInstructorIds, instructorDetails: newInstructorDetails };
        });

        const newCourseSoMap = prevCourseSoMap.map(m => ({ ...m, courseId: idMap.courses.get(m.courseId) || m.courseId })).filter(m => newCourses.some(c => c.id === m.courseId));
        const newCoursePiMap = prevCoursePiMap.map(m => ({ ...m, courseId: idMap.courses.get(m.courseId) || m.courseId })).filter(m => newCourses.some(c => c.id === m.courseId));
        const newCoursePeoMap = prevCoursePeoMap.map(m => ({ ...m, courseId: idMap.courses.get(m.courseId) || m.courseId })).filter(m => newCourses.some(c => c.id === m.courseId));

        const cleanStructureList = (list: string[] = []) => list.map(id => idMap.courses.get(id) || id).filter(id => newCourses.some(c => c.id === id));

        const newProgramStructure = {
            gen: cleanStructureList(prevMoetInfo.programStructure.gen),
            phys: cleanStructureList(prevMoetInfo.programStructure.phys || []),
            fund: cleanStructureList(prevMoetInfo.programStructure.fund),
            spec: cleanStructureList(prevMoetInfo.programStructure.spec),
            grad: cleanStructureList(prevMoetInfo.programStructure.grad),
        };

        const newCourseObjectiveMap = (prevMoetInfo.courseObjectiveMap || []).map(str => {
            const [cid, oid] = str.split('|');
            const newCid = idMap.courses.get(cid) || cid;
            return newCourses.some(c => c.id === newCid) ? `${newCid}|${oid}` : null;
        }).filter(Boolean) as string[];

        const newMoetInfo = { ...prevMoetInfo, programStructure: newProgramStructure, courseObjectiveMap: newCourseObjectiveMap };

        return {
            ...prev,
            courses: newCourses, faculties: newFaculties, courseSoMap: newCourseSoMap, coursePiMap: newCoursePiMap, coursePeoMap: newCoursePeoMap,
            generalInfo: { ...prev.generalInfo, moetInfo: newMoetInfo },
            globalState: prev.globalState ? {
                ...prev.globalState,
                facultyDirectory: newFaculties,
                courseCatalog: newCourses
            } : undefined,
            programs: prev.programs ? prev.programs.map(p => p.id === prev.currentProgramId ? {
                ...p,
                courseSoMap: newCourseSoMap,
                coursePiMap: newCoursePiMap,
                coursePeoMap: newCoursePeoMap,
                moetInfo: newMoetInfo
            } : p) : undefined
        };
    });
    alert(language === 'vi' ? "Dữ liệu đã được chuẩn hóa và làm sạch!" : "Data normalized and cleaned!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 p-8 animate-in fade-in relative">
      {/* Security & Access Settings */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-600">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield className="text-indigo-600" size={20}/> {t.security}
            </h2>
            <div 
              onClick={toggleAuthRequirement}
              className={`w-14 h-7 rounded-full flex items-center p-1 cursor-pointer transition-all duration-300 ${authEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${authEnabled ? 'translate-x-7' : 'translate-x-0'} flex items-center justify-center`}>
                {authEnabled ? <Shield size={12} className="text-indigo-600"/> : <ShieldOff size={12} className="text-slate-400"/>}
              </div>
            </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-4">
            <div className={`p-2 rounded-lg ${authEnabled ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                {authEnabled ? <Shield size={20}/> : <AlertTriangle size={20}/>}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800">
                    {authEnabled ? t.authRequirement + ": ENABLED" : t.authRequirement + ": DISABLED"}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {authEnabled ? t.authEnabledDesc : t.authDisabledDesc}
                </p>
            </div>
        </div>
      </section>

      {/* AI Configuration */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Key className="text-blue-500" size={20}/> AI Configuration (Gemini)
        </h2>
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Model</label>
                    <select 
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={model}
                        onChange={e => setModel(e.target.value)}
                    >
                        <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast)</option>
                        <option value="gemini-3-pro-preview">Gemini 3 Pro (High Quality)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">API Key (Optional)</label>
                    <input 
                        type="password"
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="System default if empty..."
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                      <Info size={14} className="inline mt-0.5 text-blue-500 shrink-0" />
                      <span>
                        {language === 'vi' 
                          ? 'Nếu bạn nhập API Key ở đây, nó sẽ được ưu tiên sử dụng thay cho biến môi trường hệ thống. Key này chỉ lưu trong trình duyệt của bạn và KHÔNG được xuất ra khi bạn "Xuất dữ liệu".' 
                          : 'If you enter an API Key here, it will be used instead of the system environment variable. This key is stored locally in your browser and is NOT exported when you use "Export Data".'}
                      </span>
                    </p>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2">
                <button 
                    onClick={() => setShowPrompts(!showPrompts)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                    <MessageSquare size={14} /> 
                    {language === 'vi' ? 'Tùy chỉnh Prompts nâng cao' : 'Advanced Prompt Customization'}
                    {showPrompts ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                </button>
                {showPrompts && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                        {Object.entries(prompts).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-wider">{key}</label>
                                <textarea 
                                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-y"
                                    value={value as string}
                                    onChange={e => setPrompts(prev => ({ ...prev, [key]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button 
                onClick={saveConfig}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
                {showSuccess ? <Check size={16}/> : <Save size={16}/>} {language === 'vi' ? 'Lưu thay đổi' : 'Save Configuration'}
            </button>
        </div>
      </section>

      {/* Data Synchronization & Import */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
         <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="text-emerald-500" size={20}/> {language === 'vi' ? 'Đồng bộ & Nhập Dữ liệu (Enterprise)' : 'Data Sync & Import'}
        </h2>
        <div className="space-y-4">
            <p className="text-sm text-slate-600 font-medium">
                {language === 'vi' ? 'Công cụ nhập file JSON tích hợp AI thông minh. Tự động phát hiện và xử lý xung đột ID, bảo toàn 100% Ma trận chuẩn đầu ra (CLO/SO).' : 'Smart AI JSON import tool. Automatically detects and resolves ID conflicts, preserving 100% of Outcome Matrices (CLO/SO).'}
            </p>
            <div className="flex flex-wrap gap-4">
                <label className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 cursor-pointer">
                    <Upload size={16}/> 
                    {language === 'vi' ? 'Nhập & Xử lý File JSON' : 'Import & Sync JSON'}
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                </label>
            </div>
        </div>
      </section>
      
      {/* Advanced Tools */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
         <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20}/> {language === 'vi' ? 'Công cụ hệ thống nâng cao' : 'Advanced System Tools'}
        </h2>
        <div className="space-y-4">
            <p className="text-sm text-slate-600 font-medium">
                {language === 'vi' ? 'Sử dụng các công cụ này để làm sạch và sửa lỗi dữ liệu. Hãy sao lưu dữ liệu trước khi thực hiện.' : 'Use these tools to fix data inconsistencies. Backup your data before proceeding.'}
            </p>
            <div className="flex flex-wrap gap-4">
                <button 
                    onClick={normalizeData}
                    className="bg-amber-100 text-amber-700 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-200 border border-amber-200 transition-all shadow-sm"
                >
                    <RefreshCw size={16}/> {language === 'vi' ? 'Chuẩn hóa ID & Làm sạch' : 'Normalize & Clean'}
                </button>
                <button 
                    onClick={onRepair}
                    className="bg-sky-100 text-sky-700 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-sky-200 border border-sky-200 transition-all shadow-sm"
                >
                    <Wrench size={16}/> {language === 'vi' ? 'Sửa chữa & Đồng bộ' : 'Repair & Sync'}
                </button>
                <button 
                    onClick={clearData}
                    className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-100 border border-red-200 transition-all shadow-sm"
                >
                    <RotateCcw size={16}/> {language === 'vi' ? 'Khôi phục mặc định' : 'Restore Default'}
                </button>
            </div>
        </div>
      </section>

      {/* Render Modal Conflict Resolver nếu có xung đột */}
      {isResolving && (
        <ConflictResolverModal 
          conflicts={pendingConflicts}
          onResolveAll={finalizeResolution}
          onClose={cancelResolution}
        />
      )}
    </div>
  );
};

export default SettingsModule;