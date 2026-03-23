
import React, { useState, useEffect } from 'react';
import { AppState, MoetSubBlock, TeachingMethod, AssessmentMethod } from './types';
import { INITIAL_STATE, CODE_VERSION } from './constants';
import Layout from './components/Layout';
import { saveFileHandle, getRecentHandles, removeFileHandle, FileHandleInfo } from './utils/fileStorage';
import AccreditationModule from './modules/accreditation/AccreditationModule';
import FlowchartModule from './modules/FlowchartModule';
import SyllabusModule from './modules/SyllabusModule';
import LibraryModule from './modules/LibraryModule';
import FacultyModule from './modules/FacultyModule';
import FacilityModule from './modules/FacilityModule';
import DepartmentModule from './modules/DepartmentModule';
import AnalyticsModule from './modules/AnalyticsModule';
import GeneralInfoModule from './modules/GeneralInfoModule';
import TransformationModule from './modules/TransformationModule';
import SettingsModule from './modules/SettingsModule';
import UserManagementModule from './modules/UserManagementModule';
import JSONInputModule from './modules/JSONInputModule';
import CoverModule from './modules/CoverModule'; // New import
import { AlertTriangle, RefreshCw, X, ArrowRight, Check } from 'lucide-react';
import userList from './userlist.json';

// Mock Login Component
const LoginScreen = ({ onLogin }: { onLogin: (email: string, name: string, avatar: string) => void }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Fetch the OAuth URL from server
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get auth URL');
      }
      const { url } = await response.json();

      // 2. Open the OAuth PROVIDER's URL directly in popup
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
        setIsLoading(false);
        return;
      }

      // 3. Listen for success message
      const handleMessage = (event: MessageEvent) => {
        // Validate origin if possible, but for now accept from same origin/preview
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          const user = event.data.user;
          window.removeEventListener('message', handleMessage);
          onLogin(user.email, user.name, user.picture);
        }
      };
      
      window.addEventListener('message', handleMessage);

      // Cleanup listener if popup closed manually (optional polling)
      const timer = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(timer);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
        }
      }, 1000);

    } catch (err: any) {
      console.error('OAuth error:', err);
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-indigo-700">EDU-Pro</h1>
        <p className="mb-6 text-slate-600">Please sign in to access the curriculum system.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 shadow-sm"
        >
          {isLoading ? (
            <RefreshCw className="animate-spin" size={20} />
          ) : (
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          )}
          Sign In with Google
        </button>
        
        <div className="mt-6 text-xs text-slate-400">
          Authorized access only.
        </div>
      </div>
    </div>
  );
};

interface SyncCandidate {
    id: string; // ID of the legacy item in user state
    name: string;
    type: 'teaching' | 'assessment';
    bestMatchId: string | null; // ID of the new item in INITIAL_STATE
}

const App: React.FC = () => {
  // Load state from localStorage or use INITIAL_STATE
  const [state, setState] = useState<AppState>(() => {
    try {
        const saved = localStorage.getItem('appState');
        const parsed = saved ? JSON.parse(saved) : INITIAL_STATE;
        // Ensure creditBlocks are loaded if empty
        if (!parsed.creditBlocks || parsed.creditBlocks.length === 0) {
            parsed.creditBlocks = INITIAL_STATE.creditBlocks;
        }
        return parsed;
    } catch (e) {
        console.error("Failed to load state", e);
        return INITIAL_STATE;
    }
  });

  const [currentModule, setCurrentModule] = useState('cover'); // Changed default to 'cover'
  // For SyllabusModule coordination
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  // File Handles State
  const [recentHandles, setRecentHandles] = useState<FileHandleInfo[]>([]);
  
  // Version Check State
  const [showVersionModal, setShowVersionModal] = useState(false);
  
  // Method Sync State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncCandidates, setSyncCandidates] = useState<SyncCandidate[]>([]);
  const [syncMap, setSyncMap] = useState<Record<string, string>>({}); // oldId -> newId

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  // Version Check on Mount
  useEffect(() => {
      // Load recent handles
      getRecentHandles().then(setRecentHandles);

      // Check if version is missing or outdated
      if (!state.version || state.version !== CODE_VERSION) {
          setShowVersionModal(true);
      }
  }, []);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => {
        const next = updater(prev);
        if (next !== prev) {
            setHasUnsavedChanges(true);
        }
        return next;
    });
  };

  // Auth Logic based on userlist.json
  const guestMode = userList.systemConfig?.guestmode === 'on';
  
  // Update state authEnabled based on guestMode
  useEffect(() => {
    updateState(prev => ({
        ...prev,
        authEnabled: !guestMode
    }));
  }, [guestMode]);

  const handleLogin = (email: string, name: string, avatar: string) => {
    const authorizedUser = userList.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (authorizedUser) {
        updateState(prev => ({
            ...prev,
            currentUser: {
                id: authorizedUser.email,
                email: authorizedUser.email,
                name: authorizedUser.name, // Prefer name from userlist if matches
                avatar: avatar,
                role: authorizedUser.role as any,
                lastLogin: new Date().toISOString()
            }
        }));
    } else {
        alert("Unauthorized email. Please contact the administrator.");
    }
  };

  const handleLogout = () => {
    updateState(prev => ({ ...prev, currentUser: null }));
  };

  const handleExport = async () => {
    const date = new Date().toISOString().split('T')[0];
    
    // Filter out hardcoded admin 'u1' for export to keep data clean if needed
    // AND STRIP API KEY
    const exportState = {
        ...state,
        version: CODE_VERSION, // Ensure export has current code version
        users: state.users.filter(u => u.id !== 'u1'),
        geminiConfig: {
            ...state.geminiConfig,
            apiKey: undefined // Ensure API key is NOT exported
        }
    };

    const majorCode = state.generalInfo.moetInfo.majorCode || 'UnknownCode';
    const specNameRaw = state.generalInfo.moetInfo.programName['en'] || 
                        state.generalInfo.moetInfo.programName[state.language] || 
                        'General';
    
    const sanitize = (str: string) => str.trim().replace(/[^a-zA-Z0-9-_]/g, '_');
    const specName = sanitize(specNameRaw);
    const safeMajorCode = sanitize(majorCode);

    const filename = `PROG_Data_${safeMajorCode}_${specName}_${date}_v${CODE_VERSION}.json`;
    const jsonString = JSON.stringify(exportState, null, 2);

    try {
        // Check for File System Access API support
        if ('showSaveFilePicker' in window) {
            const handle = await (window as any).showSaveFilePicker({
                id: 'edu-pro-data', // Browser remembers last directory for this ID
                suggestedName: filename,
                types: [{
                    description: 'JSON File',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(jsonString);
            await writable.close();
            
            // Save handle to recent list
            const updated = await saveFileHandle(handle);
            setRecentHandles(updated);
            setHasUnsavedChanges(false);
        } else {
            // Fallback
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.href = url;
            downloadAnchorNode.download = filename;
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            document.body.removeChild(downloadAnchorNode);
            URL.revokeObjectURL(url);
            setHasUnsavedChanges(false);
        }
    } catch (err) {
        // Ignore AbortError (user cancelled)
        if ((err as Error).name !== 'AbortError') {
             console.error('Export failed:', err);
             alert(state.language === 'vi' ? 'Xuất dữ liệu thất bại.' : 'Export failed.');
        }
    }
  };

  const handleImport = async (e?: React.ChangeEvent<HTMLInputElement>) => {
      let file: File | null = null;
      let handle: FileSystemFileHandle | null = null;

      if (!e && 'showOpenFilePicker' in window) {
          try {
              const [fileHandle] = await (window as any).showOpenFilePicker({
                  id: 'edu-pro-data',
                  types: [{
                      description: 'JSON File',
                      accept: { 'application/json': ['.json'] },
                  }],
                  multiple: false
              });
              handle = fileHandle;
              file = await fileHandle.getFile();
          } catch (err) {
              if ((err as Error).name === 'AbortError') return;
              console.error('Import failed:', err);
              return;
          }
      } else if (e) {
          file = e.target.files?.[0] || null;
      }

      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (evt) => {
          try {
              const parsed = JSON.parse(evt.target?.result as string);
              if (confirm(state.language === 'vi' ? "Khôi phục dữ liệu từ tệp? Hành động này sẽ ghi đè dữ liệu hiện tại." : "Restore state from file? This will overwrite current data.")) {
                  setState(prev => ({ 
                      ...parsed, 
                      currentUser: prev.currentUser || parsed.currentUser,
                      geminiConfig: {
                          ...parsed.geminiConfig,
                          apiKey: prev.geminiConfig?.apiKey
                      }
                  })); 
                  
                  if (handle) {
                      const updated = await saveFileHandle(handle);
                      setRecentHandles(updated);
                  }
                  setHasUnsavedChanges(false);
              }
          } catch(e) {
              alert("Import failed. Invalid JSON.");
          }
      };
      reader.readAsText(file);
      if (e) e.target.value = '';
  };

  const handleImportFromHandle = async (handle: FileSystemFileHandle) => {
      try {
          // Verify permission
          const options = { mode: 'read' };
          if (await (handle as any).queryPermission(options) !== 'granted') {
              if (await (handle as any).requestPermission(options) !== 'granted') {
                  return;
              }
          }

          const file = await handle.getFile();
          const text = await file.text();
          const parsed = JSON.parse(text);
          
          if (confirm(state.language === 'vi' ? "Khôi phục dữ liệu từ tệp này?" : "Restore data from this file?")) {
              setState(prev => ({ 
                  ...parsed, 
                  currentUser: prev.currentUser || parsed.currentUser,
                  geminiConfig: {
                      ...parsed.geminiConfig,
                      apiKey: prev.geminiConfig?.apiKey
                  }
              }));
              
              const updated = await saveFileHandle(handle);
              setRecentHandles(updated);
              setHasUnsavedChanges(false);
          }
      } catch (err) {
          console.error('Import from handle failed:', err);
          alert("Import failed.");
      }
  };

  const handleRemoveHandle = async (name: string) => {
      const updated = await removeFileHandle(name);
      setRecentHandles(updated);
  };

  // --- REPAIR DATA LOGIC ---
  const handleRepairData = () => {
    // 1. Repair Faculty Titles (Standardize)
    const newFacultyTitles = {
        ranks: state.facultyTitles?.ranks || INITIAL_STATE.facultyTitles.ranks,
        degrees: state.facultyTitles?.degrees || INITIAL_STATE.facultyTitles.degrees,
        academicTitles: state.facultyTitles?.academicTitles || INITIAL_STATE.facultyTitles.academicTitles,
        positions: state.facultyTitles?.positions || INITIAL_STATE.facultyTitles.positions,
    };

    // 2. Organization Structure Repair
    const newSchools = Array.isArray(state.academicSchools) ? state.academicSchools : (INITIAL_STATE.academicSchools || []);
    const newAcademicFaculties = Array.isArray(state.academicFaculties) ? state.academicFaculties : (INITIAL_STATE.academicFaculties || []);
    const newDepartments = Array.isArray(state.departments) ? state.departments : (INITIAL_STATE.departments || []);

    // 3. Course Field Repair
    const newCourses = (state.courses || []).map(c => ({
        ...c,
        isEssential: c.isEssential ?? false,
        isAbet: c.isAbet !== undefined ? c.isAbet : (c.isEssential ?? false),
        knowledgeAreaId: c.knowledgeAreaId || 'other',
        type: c.type || 'REQUIRED',
        departmentId: c.departmentId || undefined,
        managingUnitId: c.managingUnitId || c.departmentId || undefined,
        managingUnitType: c.managingUnitType || (c.departmentId ? 'DEPARTMENT' : undefined),
        instructorIds: c.instructorIds || [],
        instructorDetails: c.instructorDetails || {},
        textbooks: c.textbooks || [],
        topics: c.topics || [],
        assessmentPlan: c.assessmentPlan || [],
        objectives: c.objectives || {
            general: { vi: '', en: '' },
            specific: { knowledge: [], skills: [], responsibility: [] }
        },
        assessmentConfigType: c.assessmentConfigType || 'THEORY',
        theoryAssessmentConfig: {
            processWeight: 50, 
            attendanceWeight: 10, 
            participationWeight: 10, 
            midtermWeight: 10, 
            finalProcessWeight: 10, 
            selfStudyWeight: 10, 
            finalExamWeight: 50, 
            finalExamForm: 'Tự luận', 
            finalExamDuration: 90, 
            finalExamAllowMaterials: false,
            ...(c.theoryAssessmentConfig || {}),
            finalExamForms: c.theoryAssessmentConfig?.finalExamForms || [],
            regularTests: c.theoryAssessmentConfig?.regularTests || []
        },
        practiceAssessmentConfig: c.practiceAssessmentConfig || {
            criteriaType: 'DESCRIPTION',
            criteria: '',
            rubric: { levels: [], criteria: [] },
            items: []
        },
        projectAssessmentConfig: c.projectAssessmentConfig || {
            criteriaType: 'DESCRIPTION',
            criteria: '',
            rubric: { levels: [], criteria: [] }
        },
        scheduleNumWeeks: c.scheduleNumWeeks || 15,
        schedule: c.schedule || [],
        teachingMethodsDescription: c.teachingMethodsDescription || { vi: '', en: '' },
        coursePolicies: c.coursePolicies || { vi: '', en: '' },
        classOrganizationForm: c.classOrganizationForm || { vi: '', en: '' },
        clos: c.clos && Array.isArray(c.clos.vi) && Array.isArray(c.clos.en) ? c.clos : { vi: [], en: [] },
        cloMap: Array.isArray(c.cloMap) ? c.cloMap : [],
        coRequisites: c.coRequisites || []
    }));

    // 4. Faculties Repair
    const newFaculties = (state.faculties || []).map(f => ({
        ...f,
        departmentId: f.departmentId || undefined,
        unitId: f.unitId || f.departmentId || undefined,
        unitType: f.unitType || (f.departmentId ? 'DEPARTMENT' : undefined),
        contactAddress: f.contactAddress || '',
        researchDirections: f.researchDirections || { vi: '', en: '' },
        careerStartYear: f.careerStartYear || 2020,
        certificationsList: f.certificationsList || [],
        membershipsList: f.membershipsList || [],
        honorsList: f.honorsList || [],
        serviceActivitiesList: f.serviceActivitiesList || [],
        professionalDevelopmentList: f.professionalDevelopmentList || []
    }));
    const defaultMoet = INITIAL_STATE.generalInfo.moetInfo;
    const currentMoet = state.generalInfo.moetInfo || defaultMoet;

    let subBlocks: MoetSubBlock[] = (currentMoet.subBlocks || []).map(sb => ({
        ...sb,
        type: sb.type || 'ELECTIVE'
    }));

    const rawStructure = (currentMoet.programStructure || {}) as any;
    const structure = {
        gen: rawStructure.gen || [],
        phys: rawStructure.phys || [],
        fund: rawStructure.fund || [],
        spec: rawStructure.spec || [],
        grad: rawStructure.grad || []
    };

    (['gen', 'phys', 'fund', 'spec', 'grad'] as const).forEach(key => {
        const ids = structure[key] || [];
        if (ids.length > 0) {
            const hasCompulsory = subBlocks.some(sb => sb.parentBlockId === key && sb.type === 'COMPULSORY');
            if (!hasCompulsory) {
                const newBlock: MoetSubBlock = {
                    id: `sb-migrated-${key}-${Date.now()}`,
                    name: { vi: 'Các học phần bắt buộc', en: 'Compulsory Courses' },
                    parentBlockId: key,
                    type: 'COMPULSORY',
                    minCredits: 0,
                    courseIds: [...ids],
                    note: { vi: 'Tự động tạo từ dữ liệu cũ', en: 'Auto-migrated from legacy data' }
                };
                subBlocks.push(newBlock);
            }
        }
    });

    const newMoetInfo = {
        ...defaultMoet,
        ...currentMoet,
        programName: currentMoet.programName || defaultMoet.programName,
        generalObjectives: currentMoet.generalObjectives || defaultMoet.generalObjectives,
        legalBasis: currentMoet.legalBasis || defaultMoet.legalBasis,
        specializations: currentMoet.specializations || [],
        subBlocks: subBlocks,
        programStructure: structure,
        moetSpecificObjectives: currentMoet.moetSpecificObjectives || [],
        specificObjectives: currentMoet.specificObjectives || defaultMoet.specificObjectives,
        programFaculty: currentMoet.programFaculty || []
    };

    // 6. General Info Repair
    const defaultGeneral = INITIAL_STATE.generalInfo;
    const currentGeneral = state.generalInfo || defaultGeneral;
    const newGeneralInfo = {
        ...defaultGeneral,
        ...currentGeneral,
        previousEvaluations: {
            ...defaultGeneral.previousEvaluations,
            ...(currentGeneral.previousEvaluations || {})
        },
        moetInfo: newMoetInfo
    };

    const newLibrary = (state.library || []).map(l => ({ ...l, isEbook: l.isEbook ?? false, isPrinted: l.isPrinted ?? true }));
    const newFacilities = state.facilities || [];

    // 7. Assessment Config Repair (Sync with constants.ts)
    const newAssessmentCategories = INITIAL_STATE.assessmentCategories || [];
    const newSubmissionMethods = INITIAL_STATE.submissionMethods || [];
    const newAssessmentTools = INITIAL_STATE.assessmentTools || [];
    const newFinalAssessmentMethods = INITIAL_STATE.finalAssessmentMethods || [];
    const newActivityGroups = INITIAL_STATE.activityGroups || [];
    const newCreditBlocks = (state.creditBlocks && state.creditBlocks.length > 0) ? state.creditBlocks : INITIAL_STATE.creditBlocks;

    // --- NEW: Method Detection for Sync ---
    const detectedCandidates: SyncCandidate[] = [];
    
    // Check Teaching Methods
    const newTeachingMethods = INITIAL_STATE.teachingMethods;
    const currentTeachingMethods = state.teachingMethods || [];
    
    // Find methods in current state that do NOT match IDs in new standard list
    const legacyTeaching = currentTeachingMethods.filter(tm => !newTeachingMethods.some(ntm => ntm.id === tm.id));
    
    legacyTeaching.forEach(tm => {
        // Attempt auto-match by Code or Name
        const bestMatch = newTeachingMethods.find(ntm => 
            ntm.code === tm.code || 
            (tm.name && ntm.name.vi === tm.name.vi) || 
            (tm.name && ntm.name.en === tm.name.en)
        );
        detectedCandidates.push({
            id: tm.id,
            name: `${tm.code || ''} - ${tm.name ? (tm.name[state.language] || tm.name.vi || tm.name.en || '') : ''}`,
            type: 'teaching',
            bestMatchId: bestMatch ? bestMatch.id : null
        });
    });

    // Check Assessment Methods
    const newAssessmentMethods = INITIAL_STATE.assessmentMethods;
    const currentAssessmentMethods = state.assessmentMethods || [];
    const legacyAssessment = currentAssessmentMethods.filter(am => !newAssessmentMethods.some(nam => nam.id === am.id));

    legacyAssessment.forEach(am => {
        const bestMatch = newAssessmentMethods.find(nam => 
            (am.name && nam.name.vi === am.name.vi) || 
            (am.name && nam.name.en === am.name.en)
        );
        detectedCandidates.push({
            id: am.id,
            name: am.name ? (am.name[state.language] || am.name.vi || am.name.en || '') : '',
            type: 'assessment',
            bestMatchId: bestMatch ? bestMatch.id : null
        });
    });

    // --- Apply Repairs ---
    updateState(prev => ({
        ...prev,
        // version: CODE_VERSION, // DEFER VERSION UPDATE UNTIL SYNC IS DONE if candidates exist
        authEnabled: prev.authEnabled ?? false,
        geminiConfig: {
            ...prev.geminiConfig,
            prompts: prev.geminiConfig?.prompts || INITIAL_STATE.geminiConfig.prompts
        },
        academicSchools: newSchools,
        academicFaculties: newAcademicFaculties,
        departments: newDepartments, 
        facultyTitles: newFacultyTitles,
        // DO NOT OVERWRITE METHODS YET if we have candidates
        // If no candidates, we can safely assume standard or empty, so we use new ones
        teachingMethods: detectedCandidates.length === 0 ? newTeachingMethods : prev.teachingMethods,
        assessmentMethods: detectedCandidates.length === 0 ? newAssessmentMethods : prev.assessmentMethods,
        courses: newCourses,
        faculties: newFaculties,
        facilities: newFacilities,
        library: newLibrary,
        generalInfo: newGeneralInfo,
        assessmentCategories: newAssessmentCategories,
        submissionMethods: newSubmissionMethods,
        assessmentTools: newAssessmentTools,
        finalAssessmentMethods: newFinalAssessmentMethods,
        activityGroups: newActivityGroups,
        creditBlocks: newCreditBlocks
    }));

    setShowVersionModal(false);

    if (detectedCandidates.length > 0) {
        setSyncCandidates(detectedCandidates);
        // Pre-fill map with best matches
        const initialMap: Record<string, string> = {};
        detectedCandidates.forEach(c => {
            if (c.bestMatchId) initialMap[c.id] = c.bestMatchId;
        });
        setSyncMap(initialMap);
        setShowSyncModal(true);
    } else {
        // No conflicts, just update version now
        updateState(prev => ({ ...prev, version: CODE_VERSION }));
        alert(state.language === 'vi' ? "Đã sửa chữa, đồng bộ dữ liệu và cập nhật phiên bản!" : "Data repaired, synced, and version updated!");
    }
  };

  const handleFinalizeSync = () => {
      // 1. Replace Global Configs with New Standards
      const standardTeaching = INITIAL_STATE.teachingMethods;
      const standardAssessment = INITIAL_STATE.assessmentMethods;

      // 2. Iterate Courses and Replace IDs based on syncMap
      const updatedCourses = state.courses.map(course => {
          const newTopics = course.topics.map(topic => ({
              ...topic,
              activities: topic.activities.map(act => {
                  const newId = syncMap[act.methodId];
                  return newId ? { ...act, methodId: newId } : act;
              })
          }));

          const newAssessmentPlan = course.assessmentPlan.map(plan => {
              const newId = syncMap[plan.methodId];
              return newId ? { ...plan, methodId: newId } : plan;
          });

          // Also update CLO Maps which might reference methods
          const newCloMap = course.cloMap.map(cm => ({
              ...cm,
              teachingMethodIds: cm.teachingMethodIds.map(mid => syncMap[mid] || mid),
              assessmentMethodIds: cm.assessmentMethodIds.map(aid => syncMap[aid] || aid)
          }));

          return {
              ...course,
              topics: newTopics,
              assessmentPlan: newAssessmentPlan,
              cloMap: newCloMap
          };
      });

      updateState(prev => ({
          ...prev,
          version: CODE_VERSION,
          teachingMethods: standardTeaching,
          assessmentMethods: standardAssessment,
          courses: updatedCourses
      }));

      setShowSyncModal(false);
      alert(state.language === 'vi' ? "Đồng bộ phương pháp thành công cho toàn bộ hệ thống!" : "Methods synchronized successfully across the system!");
  };

  // Auth Guard
  if (state.authEnabled && !state.currentUser) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  const renderModule = () => {
    switch (currentModule) {
      case 'cover': return <CoverModule language={state.language} onNavigate={setCurrentModule} />;
      case 'flowchart': return <FlowchartModule state={state} updateState={updateState} onCourseNavigate={(id) => { setSelectedCourseId(id); setCurrentModule('syllabus'); }} />;
      case 'departments': return <DepartmentModule state={state} updateState={updateState} />; 
      case 'syllabus': return <SyllabusModule state={state} updateState={updateState} selectedCourseId={selectedCourseId} setSelectedCourseId={setSelectedCourseId} />;
      case 'library': return <LibraryModule state={state} updateState={updateState} />;
      case 'faculty': return <FacultyModule state={state} updateState={updateState} />;
      case 'facilities': return <FacilityModule state={state} updateState={updateState} />;
      case 'analytics': return <AnalyticsModule state={state} updateState={updateState} />;
      case 'general': return <GeneralInfoModule state={state} updateState={updateState} />;
      case 'transformation': return <TransformationModule state={state} updateState={updateState} />;
      case 'accreditation': return <AccreditationModule state={state} updateState={updateState} />;
      case 'settings': return <SettingsModule state={state} updateState={updateState} onRepair={handleRepairData} />;
      case 'users': return <UserManagementModule state={state} updateState={updateState} />;
      case 'json-input': return (
          <JSONInputModule 
            state={state} 
            updateState={updateState} 
            onExport={handleExport} 
            recentHandles={recentHandles}
            onImportHandle={handleImportFromHandle}
            onRemoveHandle={handleRemoveHandle}
          />
      );
      default: return <CoverModule language={state.language} onNavigate={setCurrentModule} />;
    }
  };

  return (
    <>
      <Layout 
        state={state} 
        setLanguage={(lang) => updateState(prev => ({ ...prev, language: lang }))}
        currentModule={currentModule}
        setCurrentModule={setCurrentModule}
        onExport={handleExport}
        onImport={handleImport}
        onLogout={handleLogout}
        guestMode={guestMode}
        hasUnsavedChanges={hasUnsavedChanges}
      >
        {renderModule()}
      </Layout>

      {/* Version Mismatch Modal */}
      {showVersionModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-amber-300">
                  <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-start gap-4">
                      <div className="p-3 bg-amber-100 rounded-full text-amber-600 shrink-0">
                          <AlertTriangle size={32} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-amber-900 mb-1">
                              {state.language === 'vi' ? 'Cập nhật Hệ thống' : 'System Update Available'}
                          </h3>
                          <p className="text-sm text-amber-700">
                              {state.language === 'vi' 
                                  ? `Phiên bản mã nguồn mới (${CODE_VERSION}) yêu cầu cập nhật cấu trúc dữ liệu.` 
                                  : `New source code version (${CODE_VERSION}) requires data structure updates.`}
                          </p>
                      </div>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">
                          {state.language === 'vi'
                              ? 'Hệ thống sẽ đồng bộ hóa các phương pháp giảng dạy và đánh giá cũ sang chuẩn mới. Vui lòng nhấn "Cập nhật ngay" để bắt đầu.'
                              : 'The system will synchronize legacy teaching and assessment methods to the new standard. Click "Update Now" to proceed.'}
                      </p>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">What's new in {CODE_VERSION}</h4>
                          <ul className="text-xs text-slate-600 space-y-1.5">
                              <li className="flex items-start gap-2">
                                  <Check size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                  <span>{state.language === 'vi' ? 'Nâng cấp danh mục Phương pháp giảng dạy và Đánh giá chuẩn 2026.' : 'Upgraded Teaching and Assessment methods to 2026 standard.'}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                  <Check size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                  <span>{state.language === 'vi' ? 'Bổ sung các trường dữ liệu mới cho Đề cương, Kế hoạch và Đánh giá.' : 'Added new data fields for Syllabus, Plan, and Assessment.'}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                  <Check size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                  <span>{state.language === 'vi' ? 'Tối ưu hóa logic đồng bộ dữ liệu và sửa lỗi hiển thị.' : 'Optimized data sync logic and fixed display issues.'}</span>
                              </li>
                          </ul>
                      </div>
                      <div className="flex gap-3 pt-2">
                          <button 
                              onClick={handleRepairData}
                              className="w-full px-4 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-sm flex items-center justify-center gap-2 group"
                          >
                              <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                              {state.language === 'vi' ? 'Cập nhật ngay' : 'Update Now'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Method Sync Modal */}
      {showSyncModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]">
                  <div className="p-6 border-b border-slate-100 bg-slate-50">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <RefreshCw size={20} className="text-indigo-600"/>
                          {state.language === 'vi' ? 'Đồng bộ Phương pháp' : 'Synchronize Methods'}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                          {state.language === 'vi' 
                              ? 'Chúng tôi phát hiện dữ liệu cũ không khớp với hệ thống mới. Vui lòng ánh xạ sang phương pháp chuẩn để tiếp tục.' 
                              : 'Legacy data detected. Please map old methods to the new standard to continue.'}
                      </p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
                      {syncCandidates.map(candidate => (
                          <div key={candidate.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
                              <div className="flex-1">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${candidate.type === 'teaching' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                      {candidate.type === 'teaching' ? 'Teaching' : 'Assessment'}
                                  </span>
                                  <div className="font-bold text-slate-700 mt-1">{candidate.name}</div>
                                  <div className="text-xs text-slate-400 font-mono">ID: {candidate.id}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                  <ArrowRight size={16} className="text-slate-300"/>
                              </div>
                              <div className="flex-1 w-full md:w-auto">
                                  <select 
                                      className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                      value={syncMap[candidate.id] || ''}
                                      onChange={(e) => setSyncMap(prev => ({ ...prev, [candidate.id]: e.target.value }))}
                                  >
                                      <option value="">-- {state.language === 'vi' ? 'Chọn phương pháp chuẩn' : 'Select Standard Method'} --</option>
                                      {(candidate.type === 'teaching' ? INITIAL_STATE.teachingMethods : INITIAL_STATE.assessmentMethods).map(std => (
                                          <option key={std.id} value={std.id}>
                                              {candidate.type === 'teaching' ? (std as TeachingMethod).code + ' - ' : ''}
                                              {std.name[state.language]}
                                          </option>
                                      ))}
                                  </select>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
                      <button 
                          onClick={handleFinalizeSync}
                          disabled={syncCandidates.some(c => !syncMap[c.id])}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
                      >
                          <Check size={18}/>
                          {state.language === 'vi' ? 'Đồng bộ & Cập nhật tất cả Đề cương' : 'Sync & Update All Syllabi'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default App;
