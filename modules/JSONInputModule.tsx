
import React, { useState, useRef } from 'react';
import { AppState, Faculty, Course, LibraryResource, GeneralInfo } from '../types';
import { FileJson, Upload, X, AlertTriangle, Check, Copy, Plus, BookOpen, Merge, RefreshCw, Search, Info, ExternalLink, Sparkles, Database, Download, CheckCircle2, ListFilter, Code, History, FileText, Save, Trash2 } from 'lucide-react';
import { INITIAL_STATE, TRANSLATIONS } from '../constants';
import { FileHandleInfo } from '../utils/fileStorage';


interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onExport: () => void;
  recentHandles: FileHandleInfo[];
  onImportHandle: (handle: FileSystemFileHandle) => void;
  onRemoveHandle?: (name: string) => void;
}

// --- Similarity Logic ---
const normalizeStr = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
};

const getLevenshteinDistance = (a: string, b: string) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const calculateSimilarity = (s1: string, s2: string) => {
  const n1 = normalizeStr(s1);
  const n2 = normalizeStr(s2);
  if (!n1 && !n2) return 1;
  if (!n1 || !n2) return 0;
  if (n1 === n2) return 1;
  
  const longer = n1.length > n2.length ? n1 : n2;
  const dist = getLevenshteinDistance(n1, n2);
  return (longer.length - dist) / longer.length;
};

// --- Validation Logic ---
const validateFaculty = (data: any): { valid: boolean, errors: string[], warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
        return { valid: false, errors: ["Invalid JSON object"], warnings: [] };
    }

    // Critical Fields
    if (!data.name) errors.push("Missing 'name' object");
    else if (!data.name?.vi && !data.name?.en) errors.push("Name must have at least 'vi' or 'en'");
    
    if (!data.email) errors.push("Missing 'email' field");
    
    // Structure Checks
    if (!data.educationList || !Array.isArray(data.educationList)) warnings.push("'educationList' is missing or not an array");
    if (!data.publicationsList || !Array.isArray(data.publicationsList)) warnings.push("'publicationsList' is missing or not an array");
    if (!data.experience) warnings.push("Missing 'experience' field");

    return { valid: errors.length === 0, errors, warnings };
};

const validateCourse = (data: any): { valid: boolean, errors: string[], warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
        return { valid: false, errors: ["Invalid JSON object"], warnings: [] };
    }

    // Critical Fields
    if (!data.code) errors.push("Missing 'code' field");
    if (!data.name) errors.push("Missing 'name' object");
    else if (!data.name?.vi && !data.name?.en) errors.push("Name must have at least 'vi' or 'en'");

    if (data.credits === undefined || data.credits === null) errors.push("Missing 'credits' field");
    else if (typeof data.credits !== 'number') errors.push("'credits' must be a number");

    // Structure Checks
    if (!data.topics || !Array.isArray(data.topics)) warnings.push("'topics' is missing or not an array");
    if (!data.assessmentPlan || !Array.isArray(data.assessmentPlan)) warnings.push("'assessmentPlan' is missing or not an array");
    if (!data.clos) warnings.push("Missing 'clos' (Course Learning Outcomes)");

    return { valid: errors.length === 0, errors, warnings };
};

// --- Import Options Type ---
type ImportSection = 'general' | 'strategy' | 'courses' | 'faculty' | 'matrices' | 'settings';

const JSONInputModule: React.FC<Props> = ({ state, updateState, onExport, recentHandles, onImportHandle, onRemoveHandle }) => {
  const { globalState, programs, currentProgramId, language } = state;
  const t = TRANSLATIONS[language];
  
  // Fallbacks to flat state
  const library = globalState?.library || state.library || [];
  const courses = globalState?.courseCatalog || state.courses || [];
  const faculties = globalState?.facultyDirectory || state.faculties || [];
  const geminiConfig = globalState?.geminiConfig || state.geminiConfig;
  
  const currentProgram = programs?.find(p => p.id === currentProgramId);
  const peos = currentProgram?.PEOs || state.peos || [];
  const sos = currentProgram?.SOs || state.sos || [];
  
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

  const updateCourses = (updater: (prevCourses: Course[]) => Course[]) => {
    updateState(prev => {
      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            courseCatalog: updater(prev.globalState.courseCatalog)
          }
        };
      }
      return {
        ...prev,
        courses: updater(prev.courses)
      };
    });
  };

  const updateLibrary = (updater: (prevLibrary: LibraryResource[]) => LibraryResource[]) => {
    updateState(prev => {
      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            library: updater(prev.globalState.library)
          }
        };
      }
      return {
        ...prev,
        library: updater(prev.library)
      };
    });
  };

  // Modal State
  const [activeModal, setActiveModal] = useState<'cv' | 'syllabus' | 'library_dedupe' | null>(null);
  const [showSchemaPreview, setShowSchemaPreview] = useState(false);
  
  // Specific Import State
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
      validItems: any[]; // Items that passed validation
      invalidItems: { item: any, errors: string[] }[]; // Items that failed
      type: 'cv' | 'syllabus';
  } | null>(null);
  
  // Conflict Data State: Updated to support "New" items (existingItem: null, isNew: true)
  // Also supports Bulk Import conflicts (list of items)
  const [conflictData, setConflictData] = useState<{ 
      item: Faculty | Course | null, 
      existingItem: Faculty | Course | null, 
      type: 'cv' | 'syllabus', 
      matchReason: 'id' | 'name' | 'email' | 'code' | 'none',
      isNew: boolean,
      bulkItems?: any[], // For bulk import
      currentIndex?: number // For bulk import progress
  } | null>(null);

  // Full System Import State
  const jsonImportRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [importOptions, setImportOptions] = useState<Record<ImportSection, boolean>>({
      general: true,
      strategy: true,
      courses: true,
      faculty: true,
      matrices: true,
      settings: true
  });

  // Library Dedupe State
  const [duplicateGroups, setDuplicateGroups] = useState<LibraryResource[][]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [targetResourceId, setTargetResourceId] = useState<string | null>(null);



  const handleOpenModal = (type: 'cv' | 'syllabus' | 'library_dedupe') => {
    setActiveModal(type);
    setJsonInput('');
    setError(null);
    setValidationResult(null);
    setConflictData(null);
    setDuplicateGroups([]);
    setSelectedGroupIndex(null);
    setTargetResourceId(null);
    setShowSchemaPreview(false);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setConflictData(null);
    setValidationResult(null);
  };

  // --- Logic: Import CV/Syllabus (Existing) ---
  const handleAnalyze = () => {
      setError(null);
      setValidationResult(null);
      try {
          if (!jsonInput.trim()) {
              setError("Please paste JSON content.");
              return;
          }

          const data = JSON.parse(jsonInput);
          const items = Array.isArray(data) ? data : [data];

          const validItems: any[] = [];
          const invalidItems: { item: any, errors: string[] }[] = [];
          const allWarnings: string[] = [];

          items.forEach((item, idx) => {
              const validation = activeModal === 'cv' ? validateFaculty(item) : validateCourse(item);
              
              if (validation.valid) {
                  validItems.push(item);
                  if (validation.warnings.length > 0) {
                      allWarnings.push(`Item ${idx + 1}: ${validation.warnings.join(', ')}`);
                  }
              } else {
                  invalidItems.push({ item, errors: validation.errors });
              }
          });

          const invalidErrors = invalidItems.map((f, i) => `Item ${items.indexOf(f.item) + 1} Invalid: ${f.errors.join(', ')}`);

          setValidationResult({ 
              isValid: validItems.length > 0, 
              errors: invalidErrors, 
              warnings: allWarnings, 
              validItems: validItems, 
              invalidItems: invalidItems,
              type: activeModal as 'cv' | 'syllabus' 
          });

      } catch (err) {
          setError(language === 'vi' ? "Lỗi cú pháp JSON: " + (err as Error).message : "JSON Syntax Error: " + (err as Error).message);
      }
  };

  const proceedToConflictCheck = () => {
    if (!validationResult || !validationResult.validItems || validationResult.validItems.length === 0) return;
    const items = validationResult.validItems;
    
    // Start processing from index 0
    processNextItem(items, 0);
    setActiveModal(null); 
  };

  const processNextItem = (items: any[], index: number) => {
      if (index >= items.length) {
          alert(language === 'vi' ? "Hoàn tất nhập dữ liệu!" : "Import completed!");
          setConflictData(null);
          return;
      }

      const item = items[index];
      
      try {
        if (activeModal === 'cv' || (conflictData && conflictData.type === 'cv')) {
          // 1. Check Email Match (Primary for CV)
          let existing = faculties.find(f => f.email === item.email);
          let matchReason: 'id' | 'name' | 'email' | 'none' = 'email';

          // 2. If no Email match, Check ID Match
          if (!existing) {
              existing = faculties.find(f => f.id === item.id);
              if (existing) matchReason = 'id';
          }

          // 3. If no ID match, Check Name Match
          if (!existing) {
              const cleanInputVi = normalizeStr(item.name?.vi || '');
              const cleanInputEn = normalizeStr(item.name?.en || '');
              
              existing = faculties.find(f => {
                  const fVi = normalizeStr(f.name?.vi || '');
                  const fEn = normalizeStr(f.name?.en || '');
                  return (cleanInputVi && fVi === cleanInputVi) || (cleanInputEn && fEn === cleanInputEn);
              });
              if (existing) matchReason = 'name';
          }

          if (existing) {
            setConflictData({ 
                item, 
                existingItem: existing, 
                type: 'cv', 
                matchReason: matchReason as 'id' | 'name' | 'email', 
                isNew: false,
                bulkItems: items,
                currentIndex: index
            });
          } else {
            // Auto-import new items if bulk, or ask confirmation? 
            // For now, let's ask confirmation for consistency, but we could add "Import All New" later.
            // Actually, for bulk, usually we want to just import new ones automatically?
            // Let's stick to the flow: Show dialog for NEW items too so user knows what's happening, 
            // OR we can auto-import NEW items and only stop for conflicts.
            // User request: "Khi nhập thì kiểm tra... để xử lý thêm mới hay ghi đè" implies manual decision or smart handling.
            // Let's stop for every item to be safe, or maybe auto-add new ones?
            // Let's stop for now.
            setConflictData({ 
                item, 
                existingItem: null, 
                type: 'cv', 
                matchReason: 'none', 
                isNew: true,
                bulkItems: items,
                currentIndex: index
            });
          }

        } else if (activeModal === 'syllabus' || (conflictData && conflictData.type === 'syllabus')) {
          let existing = courses.find(c => c.id === item.id);
          let matchReason: 'id' | 'name' | 'email' | 'code' | 'none' = 'id';

          if (!existing) {
             existing = courses.find(c => c.code === item.code);
             if (existing) matchReason = 'code';
          }
          
          if (existing) {
            setConflictData({ 
                item, 
                existingItem: existing, 
                type: 'syllabus', 
                matchReason: matchReason as any, 
                isNew: false,
                bulkItems: items,
                currentIndex: index
            });
          } else {
            setConflictData({ 
                item, 
                existingItem: null, 
                type: 'syllabus', 
                matchReason: 'none', 
                isNew: true,
                bulkItems: items,
                currentIndex: index
            });
          }
        }
  
      } catch (err) {
        setError(language === 'vi' ? "Lỗi xử lý: " + (err as Error).message : "Processing Error: " + (err as Error).message);
      }
  };

  const handleOverwrite = () => {
    if (!conflictData || !conflictData.existingItem) return;
    const { item, existingItem, type, bulkItems, currentIndex } = conflictData;

    if (type === 'cv') {
        // IMPORTANT: When overwriting, we MUST preserve the EXISTING ID to maintain relationships (courses, etc.)
        // We take the new data (item) but force the id to be existingItem.id
        const mergedItem = { ...item, id: existingItem.id };

        updateFaculties(prev => prev.map(f => f.id === existingItem.id ? (mergedItem as Faculty) : f));
    } else {
        // For courses: Preserve Catalog/Administrative Metadata AND INSTRUCTORS, only overwrite Syllabus Content
        const exC = existingItem as Course;
        const newC = item as Course;

        const mergedItem: Course = {
            ...newC, // Take new content (Description, Textbooks, Topics, Assessment, CLOs, etc.)
            id: exC.id, // Preserve ID
            // Preserve Catalog Metadata
            code: exC.code,
            name: exC.name,
            credits: exC.credits,
            semester: exC.semester,
            type: exC.type,
            prerequisites: exC.prerequisites,
            coRequisites: exC.coRequisites,
            isEssential: exC.isEssential,
            isAbet: exC.isAbet,
            knowledgeAreaId: exC.knowledgeAreaId,
            departmentId: exC.departmentId, // Preserve Dept Link
            // Preserve Instructor Assignments
            instructorIds: exC.instructorIds,
            instructorDetails: exC.instructorDetails
        };

        updateCourses(prev => prev.map(c => c.id === exC.id ? mergedItem : c));
    }
    
    // Move to next item
    if (bulkItems && typeof currentIndex === 'number') {
        processNextItem(bulkItems, currentIndex + 1);
    } else {
        alert(language === 'vi' ? "Đã ghi đè dữ liệu!" : "Data overwritten!");
        setConflictData(null);
    }
  };

  const handleCreateNew = () => {
    if (!conflictData) return;
    const { item, type, bulkItems, currentIndex } = conflictData;
    
    // Force generate new ID to avoid conflict
    const newId = `${type === 'cv' ? 'fac' : 'CID'}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newItem = { ...item, id: newId };

    if (type === 'cv') {
      updateFaculties(prev => [...prev, newItem as Faculty]);
    } else {
      updateCourses(prev => [...prev, newItem as Course]);
    }

    // Move to next item
    if (bulkItems && typeof currentIndex === 'number') {
        processNextItem(bulkItems, currentIndex + 1);
    } else {
        alert(language === 'vi' ? "Đã thêm mới dữ liệu!" : "Added as new record!");
        setConflictData(null);
    }
  };

  const handleConfirmNew = () => {
      if (!conflictData) return;
      const { item, type, bulkItems, currentIndex } = conflictData;
      
      // Use the item AS IS (preserving ID from JSON if valid and non-conflicting)
      if (type === 'cv') {
          updateFaculties(prev => [...prev, item as Faculty]);
      } else {
          updateCourses(prev => [...prev, item as Course]);
      }
      
      // Move to next item
      if (bulkItems && typeof currentIndex === 'number') {
          processNextItem(bulkItems, currentIndex + 1);
      } else {
          alert(language === 'vi' ? "Đã nhập dữ liệu mới thành công!" : "New data imported successfully!");
          setConflictData(null);
      }
  };

  const handleSaveToHandle = async (handle: FileSystemFileHandle) => {
      try {
          const date = new Date().toISOString().split('T')[0];
          const exportState = {
              ...state,
              version: state.version,
              geminiConfig: { ...state.geminiConfig, apiKey: undefined }
          };
          const jsonString = JSON.stringify(exportState, null, 2);

          // Verify permission
          const options = { mode: 'readwrite' };
          if (await (handle as any).queryPermission(options) !== 'granted') {
              if (await (handle as any).requestPermission(options) !== 'granted') {
                  return;
              }
          }

          const writable = await handle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          alert(language === 'vi' ? `Đã lưu phiên bản mới vào ${handle.name}` : `Saved new version to ${handle.name}`);
      } catch (err) {
          console.error('Save to handle failed:', err);
          alert("Save failed.");
      }
  };

  // --- Logic: Library Deduplication ---
  const scanLibrary = () => {
    setIsScanning(true);
    setTimeout(() => {
      const visited = new Set<string>();
      const groups: LibraryResource[][] = [];
      const threshold = 0.7;

      // Sort by length desc to match longer titles first (better anchor)
      const sortedLib = [...library].sort((a, b) => b.title.length - a.title.length);

      for (let i = 0; i < sortedLib.length; i++) {
        if (visited.has(sortedLib[i].id)) continue;
        
        const currentGroup = [sortedLib[i]];
        visited.add(sortedLib[i].id);

        for (let j = i + 1; j < sortedLib.length; j++) {
          if (visited.has(sortedLib[j].id)) continue;
          
          const sim = calculateSimilarity(sortedLib[i].title, sortedLib[j].title);
          
          // Also check author similarity if titles are close
          let authorMatch = true;
          if (sim > threshold && sortedLib[i].author && sortedLib[j].author) {
             const authorSim = calculateSimilarity(sortedLib[i].author, sortedLib[j].author);
             if (authorSim < 0.5) authorMatch = false; // Different authors -> Different books usually
          }

          if (sim > threshold && authorMatch) {
            currentGroup.push(sortedLib[j]);
            visited.add(sortedLib[j].id);
          }
        }

        if (currentGroup.length > 1) {
          groups.push(currentGroup);
        }
      }

      setDuplicateGroups(groups);
      setIsScanning(false);
    }, 100); // Async to let UI render loader
  };

  const mergeLibraryGroup = () => {
    if (selectedGroupIndex === null || !targetResourceId) return;
    const group = duplicateGroups[selectedGroupIndex];
    if (!group) return;

    // IDs to remove (all except target)
    const removeIds = group.filter(item => item.id !== targetResourceId).map(item => item.id);
    
    // Update State
    updateCourses(prevCourses => {
        return prevCourses.map(course => {
            let changed = false;
            const newTextbooks = course.textbooks.map(tb => {
                if (removeIds.includes(tb.resourceId)) {
                    changed = true;
                    return { ...tb, resourceId: targetResourceId };
                }
                return tb;
            });

            if (!changed) return course;

            // Deduplicate textbooks within the course
            const uniqueTextbooks: typeof newTextbooks = [];
            const seenIds = new Set<string>();
            newTextbooks.forEach(tb => {
                if (!seenIds.has(tb.resourceId)) {
                    seenIds.add(tb.resourceId);
                    uniqueTextbooks.push(tb);
                }
            });

            return { ...course, textbooks: uniqueTextbooks };
        });
    });

    updateLibrary(prevLibrary => prevLibrary.filter(lib => !removeIds.includes(lib.id)));

    // Update Local State (Remove group from UI)
    const newGroups = [...duplicateGroups];
    newGroups.splice(selectedGroupIndex, 1);
    setDuplicateGroups(newGroups);
    setSelectedGroupIndex(null);
    setTargetResourceId(null);
    
    alert(language === 'vi' ? 'Đã gộp thành công!' : 'Merged successfully!');
  };

  const calculateUsage = (resId: string) => {
      let count = 0;
      courses.forEach(c => {
          if (c.textbooks.some(t => t.resourceId === resId)) count++;
      });
      return count;
  };

  // --- Logic: Full System Import/Export (Moved from Settings) ---
  const normalizeIncomingData = (data: any): AppState => {
      // 1. Start with Initial State as baseline to ensure structure
      const base: AppState = JSON.parse(JSON.stringify(INITIAL_STATE));

      // If data already has globalState and programs, it's a new relational state
      if (data.globalState && data.programs) {
          return {
              ...base,
              ...data,
              language: data.language || 'en',
              authEnabled: data.authEnabled !== undefined ? data.authEnabled : base.authEnabled,
              currentUser: base.currentUser, // Do not overwrite current user session
              users: Array.isArray(data.users) ? data.users : base.users,
              geminiConfig: { ...base.geminiConfig, ...(data.geminiConfig || {}) },
          };
      }

      // Otherwise, it's an old flat state. We normalize it to the old structure,
      // and let the app handle it (or we can migrate it here, but for now we just return it as flat state)
      const mergedGeneralInfo: GeneralInfo = {
          ...base.generalInfo,
          ...(data.generalInfo || {}),
          previousEvaluations: { ...base.generalInfo.previousEvaluations, ...(data.generalInfo?.previousEvaluations || {}) },
          moetInfo: {
              ...base.generalInfo.moetInfo,
              ...(data.generalInfo?.moetInfo || {}),
              programStructure: { ...base.generalInfo.moetInfo.programStructure, ...(data.generalInfo?.moetInfo?.programStructure || {}) }
          }
      };

      const normalizedCourses = Array.isArray(data.courses) ? data.courses.map((c: any) => ({
          ...c,
          credits: typeof c.credits === 'number' ? c.credits : 0,
          isEssential: !!c.isEssential,
          isAbet: c.isAbet !== undefined ? c.isAbet : !!c.isEssential,
          departmentId: c.departmentId,
          instructorDetails: c.instructorDetails || {},
          cloMap: Array.isArray(c.cloMap) ? c.cloMap.map((cm: any) => ({ ...cm, piIds: Array.isArray(cm.piIds) ? cm.piIds : [] })) : [],
          textbooks: Array.isArray(c.textbooks) ? c.textbooks : [],
          topics: Array.isArray(c.topics) ? c.topics : [],
          assessmentPlan: Array.isArray(c.assessmentPlan) ? c.assessmentPlan : []
      })) : [];

      return {
          ...base,
          language: data.language || 'en',
          authEnabled: data.authEnabled !== undefined ? data.authEnabled : base.authEnabled,
          currentUser: base.currentUser,
          users: Array.isArray(data.users) ? data.users : base.users,
          mission: data.mission || base.mission,
          peos: Array.isArray(data.peos) ? data.peos : [],
          sos: Array.isArray(data.sos) ? data.sos : [],
          courses: normalizedCourses,
          faculties: Array.isArray(data.faculties) ? data.faculties : [],
          academicSchools: Array.isArray(data.academicSchools) ? data.academicSchools : base.academicSchools,
          academicFaculties: Array.isArray(data.academicFaculties) ? data.academicFaculties : base.academicFaculties,
          departments: Array.isArray(data.departments) ? data.departments : base.departments,
          facilities: Array.isArray(data.facilities) ? data.facilities : [],
          knowledgeAreas: Array.isArray(data.knowledgeAreas) ? data.knowledgeAreas : base.knowledgeAreas,
          teachingMethods: Array.isArray(data.teachingMethods) ? data.teachingMethods : base.teachingMethods,
          assessmentMethods: Array.isArray(data.assessmentMethods) ? data.assessmentMethods : base.assessmentMethods,
          facultyTitles: data.facultyTitles || base.facultyTitles,
          geminiConfig: { ...base.geminiConfig, ...(data.geminiConfig || {}) },
          generalInfo: mergedGeneralInfo,
          library: Array.isArray(data.library) ? data.library : [],
          courseSoMap: Array.isArray(data.courseSoMap) ? data.courseSoMap : [],
          coursePiMap: Array.isArray(data.coursePiMap) ? data.coursePiMap : [],
          coursePeoMap: Array.isArray(data.coursePeoMap) ? data.coursePeoMap : [],
          peoSoMap: Array.isArray(data.peoSoMap) ? data.peoSoMap : [],
          peoConstituentMap: Array.isArray(data.peoConstituentMap) ? data.peoConstituentMap : [],
      };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const rawData = JSON.parse(event.target?.result as string);
              const normalized = normalizeIncomingData(rawData);
              setPendingImport(normalized);
              e.target.value = ''; // Reset input
          } catch (err) {
              alert(language === 'vi' ? "Lỗi: File JSON không hợp lệ." : "Error: Invalid JSON file.");
          }
      };
      reader.readAsText(file);
  };

  const confirmImport = () => {
      if (!pendingImport) return;

      updateState(prev => {
          const nextState = { ...prev };

          if (pendingImport.globalState && pendingImport.programs) {
              // Relational state import
              if (importOptions.general) {
                  nextState.globalState = {
                      ...nextState.globalState!,
                      institutionInfo: pendingImport.globalState.institutionInfo,
                      library: pendingImport.globalState.library,
                      organizationStructure: pendingImport.globalState.organizationStructure,
                      facilitiesCatalog: pendingImport.globalState.facilitiesCatalog
                  };
              }
              if (importOptions.strategy) {
                  if (nextState.currentProgramId && nextState.programs) {
                      const importedProgram = pendingImport.programs.find(p => p.id === nextState.currentProgramId) || pendingImport.programs[0];
                      if (importedProgram) {
                          nextState.programs = nextState.programs.map(p => p.id === nextState.currentProgramId ? {
                              ...p,
                              PEOs: importedProgram.PEOs,
                              SOs: importedProgram.SOs
                          } : p);
                      }
                  }
              }
              if (importOptions.courses) {
                  nextState.globalState = {
                      ...nextState.globalState!,
                      courseCatalog: pendingImport.globalState.courseCatalog,
                      globalConfigs: {
                          ...nextState.globalState!.globalConfigs,
                          knowledgeAreas: pendingImport.globalState.globalConfigs.knowledgeAreas,
                          teachingMethods: pendingImport.globalState.globalConfigs.teachingMethods,
                          assessmentMethods: pendingImport.globalState.globalConfigs.assessmentMethods
                      }
                  };
              }
              if (importOptions.faculty) {
                  nextState.globalState = {
                      ...nextState.globalState!,
                      facultyDirectory: pendingImport.globalState.facultyDirectory,
                      organizationStructure: {
                          ...nextState.globalState!.organizationStructure,
                          facultyTitles: pendingImport.globalState.organizationStructure.facultyTitles
                      }
                  };
              }
              if (importOptions.matrices) {
                  if (nextState.currentProgramId && nextState.programs) {
                      const importedProgram = pendingImport.programs.find(p => p.id === nextState.currentProgramId) || pendingImport.programs[0];
                      if (importedProgram) {
                          nextState.programs = nextState.programs.map(p => p.id === nextState.currentProgramId ? {
                              ...p,
                              courseSoMap: importedProgram.courseSoMap,
                              coursePiMap: importedProgram.coursePiMap,
                              coursePeoMap: importedProgram.coursePeoMap,
                              peoSoMap: importedProgram.peoSoMap,
                              peoConstituentMap: importedProgram.peoConstituentMap
                          } : p);
                      }
                  }
              }
              if (importOptions.settings) {
                  const currentApiKey = prev.globalState?.geminiConfig?.apiKey || prev.geminiConfig?.apiKey;
                  nextState.globalState = {
                      ...nextState.globalState!,
                      geminiConfig: {
                          ...pendingImport.globalState.geminiConfig,
                          apiKey: currentApiKey
                      }
                  };
                  nextState.users = pendingImport.users;
                  nextState.authEnabled = pendingImport.authEnabled;
              }
          } else {
              // Flat state import (legacy)
              if (importOptions.general) {
                  nextState.generalInfo = pendingImport.generalInfo;
                  nextState.mission = pendingImport.mission;
                  nextState.library = pendingImport.library;
                  nextState.academicSchools = pendingImport.academicSchools;
                  nextState.academicFaculties = pendingImport.academicFaculties;
                  nextState.departments = pendingImport.departments;
                  nextState.facilities = pendingImport.facilities;
              }
              if (importOptions.strategy) {
                  nextState.peos = pendingImport.peos;
                  nextState.sos = pendingImport.sos;
              }
              if (importOptions.courses) {
                  nextState.courses = pendingImport.courses;
                  nextState.knowledgeAreas = pendingImport.knowledgeAreas;
                  nextState.teachingMethods = pendingImport.teachingMethods;
                  nextState.assessmentMethods = pendingImport.assessmentMethods;
              }
              if (importOptions.faculty) {
                  nextState.faculties = pendingImport.faculties;
                  nextState.facultyTitles = pendingImport.facultyTitles;
              }
              if (importOptions.matrices) {
                  nextState.courseSoMap = pendingImport.courseSoMap;
                  nextState.coursePiMap = pendingImport.coursePiMap;
                  nextState.coursePeoMap = pendingImport.coursePeoMap;
                  nextState.peoSoMap = pendingImport.peoSoMap;
                  nextState.peoConstituentMap = pendingImport.peoConstituentMap;
              }
              if (importOptions.settings) {
                  const currentApiKey = prev.geminiConfig?.apiKey;
                  nextState.geminiConfig = {
                      ...pendingImport.geminiConfig,
                      apiKey: currentApiKey
                  };
                  nextState.users = pendingImport.users;
                  nextState.authEnabled = pendingImport.authEnabled;
              }
          }

          return nextState;
      });

      setPendingImport(null);
      alert(language === 'vi' ? "Nhập dữ liệu thành công!" : "Data imported successfully!");
  };

  const OptionCheckbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
      <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-200'}`}>
          <div className={`w-5 h-5 rounded flex items-center justify-center border ${checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
              {checked && <Check size={14} className="text-white"/>}
          </div>
          <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
          <span className={`text-xs font-bold ${checked ? 'text-indigo-700' : 'text-slate-600'}`}>{label}</span>
      </label>
  );



  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Import Preview Modal (Full System) */}
      {pendingImport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                              <RefreshCw size={24}/>
                          </div>
                          <div>
                              <h3 className="text-lg font-black text-slate-800">{language === 'vi' ? 'Chuẩn hóa & Nhập dữ liệu' : 'Normalize & Import Data'}</h3>
                              <p className="text-xs text-slate-500 font-medium">{language === 'vi' ? 'Dữ liệu đã được chuẩn hóa lên phiên bản mới nhất.' : 'Data has been normalized to the latest schema version.'}</p>
                          </div>
                      </div>
                      <button onClick={() => setPendingImport(null)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <div className="text-2xl font-black text-slate-700">{pendingImport.courses.length}</div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">{language === 'vi' ? 'Môn học' : 'Courses'}</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <div className="text-2xl font-black text-slate-700">{pendingImport.faculties.length}</div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">{language === 'vi' ? 'Giảng viên' : 'Faculty'}</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <div className="text-2xl font-black text-slate-700">{pendingImport.peos.length + pendingImport.sos.length}</div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">PEOs + SOs</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <div className="text-2xl font-black text-slate-700">{pendingImport.courseSoMap.length}</div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">Mappings</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <div className="text-2xl font-black text-slate-700">{pendingImport.facilities.length}</div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">{language === 'vi' ? 'Phòng/CSVC' : 'Facilities'}</div>
                          </div>
                      </div>

                      {/* Import Options */}
                      <div className="space-y-3">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ListFilter size={12}/> {language === 'vi' ? 'Tùy chọn nhập liệu' : 'Import Options'}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <OptionCheckbox label={language === 'vi' ? 'Thông tin chung, Thư viện & CSVC' : 'General Info, Library & Facilities'} checked={importOptions.general} onChange={v => setImportOptions({...importOptions, general: v})} />
                              <OptionCheckbox label={language === 'vi' ? 'Mục tiêu & Chuẩn đầu ra (PEOs/SOs)' : 'Strategy & Outcomes'} checked={importOptions.strategy} onChange={v => setImportOptions({...importOptions, strategy: v})} />
                              <OptionCheckbox label={language === 'vi' ? 'Môn học & Khối kiến thức' : 'Courses & Knowledge Areas'} checked={importOptions.courses} onChange={v => setImportOptions({...importOptions, courses: v})} />
                              <OptionCheckbox label={language === 'vi' ? 'Danh sách Giảng viên' : 'Faculty List'} checked={importOptions.faculty} onChange={v => setImportOptions({...importOptions, faculty: v})} />
                              <OptionCheckbox label={language === 'vi' ? 'Các Ma trận (Mapping Matrices)' : 'Mapping Matrices'} checked={importOptions.matrices} onChange={v => setImportOptions({...importOptions, matrices: v})} />
                              <OptionCheckbox label={language === 'vi' ? 'Cấu hình & Tài khoản' : 'Config & Accounts'} checked={importOptions.settings} onChange={v => setImportOptions({...importOptions, settings: v})} />
                          </div>
                      </div>

                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-3 items-start">
                          <Info size={16} className="text-amber-500 shrink-0 mt-0.5"/>
                          <p className="text-xs text-amber-700 leading-relaxed">
                              {language === 'vi' ? 'Lưu ý: Dữ liệu hiện tại sẽ bị ghi đè dựa trên các mục bạn đã chọn. Các mục không chọn sẽ giữ nguyên dữ liệu cũ.' : 'Note: Current data will be overwritten based on your selection. Unselected sections will retain existing data.'}
                          </p>
                      </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button onClick={() => setPendingImport(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
                      <button onClick={confirmImport} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2">
                          <CheckCircle2 size={14}/> {language === 'vi' ? 'Xác nhận Nhập' : 'Confirm Import'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Input Modal for CV/Syllabus */}
      {(activeModal === 'cv' || activeModal === 'syllabus') && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          <FileJson size={20} className="text-indigo-600"/>
                          {activeModal === 'cv' ? (language === 'vi' ? 'Nhập JSON Giảng viên' : 'Import Faculty JSON') : (language === 'vi' ? 'Nhập JSON Đề cương' : 'Import Syllabus JSON')}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowSchemaPreview(!showSchemaPreview)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${showSchemaPreview ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <Code size={14}/> {language === 'vi' ? 'Xem cấu trúc mẫu' : 'View Schema'}
                        </button>
                        <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
                      </div>
                  </div>
                  
                  <div className="flex flex-1 overflow-hidden">
                      {showSchemaPreview ? (
                          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                              <div className="space-y-4">
                                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 flex items-start gap-3">
                                      <Info className="shrink-0 mt-0.5" size={18}/>
                                      <div>
                                          <p className="font-bold mb-1">{language === 'vi' ? 'Hướng dẫn cấu trúc dữ liệu' : 'Data Structure Guide'}</p>
                                          <p className="opacity-90">
                                              {language === 'vi' 
                                                ? 'Dữ liệu nhập vào phải tuân thủ cấu trúc JSON bên dưới. Các trường có dấu * là bắt buộc.' 
                                                : 'Input data must follow the JSON structure below. Fields marked with * are required.'}
                                          </p>
                                      </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                          <h4 className="text-xs font-bold text-slate-500 uppercase">{language === 'vi' ? 'Mô tả trường dữ liệu' : 'Field Description'}</h4>
                                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-sm">
                                              <table className="w-full text-left">
                                                  <thead className="bg-slate-50 border-b border-slate-200">
                                                      <tr>
                                                          <th className="p-3 font-semibold text-slate-700">Field</th>
                                                          <th className="p-3 font-semibold text-slate-700">Type</th>
                                                          <th className="p-3 font-semibold text-slate-700">Required</th>
                                                      </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-slate-100">
                                                      {activeModal === 'cv' ? (
                                                          <>
                                                              <tr><td className="p-3 font-mono text-xs text-indigo-600">name</td><td className="p-3 text-slate-600">Object</td><td className="p-3 text-red-500 font-bold">Yes</td></tr>
                                                              <tr><td className="p-3 font-mono text-xs text-indigo-600">email</td><td className="p-3 text-slate-600">String</td><td className="p-3 text-red-500 font-bold">Yes</td></tr>
                                                              <tr><td className="p-3 font-mono text-xs text-indigo-600">educationList</td><td className="p-3 text-slate-600">Array</td><td className="p-3 text-slate-400">No</td></tr>
                                                              <tr><td className="p-3 font-mono text-xs text-indigo-600">publicationsList</td><td className="p-3 text-slate-600">Array</td><td className="p-3 text-slate-400">No</td></tr>
                                                          </>
                                                      ) : (
                                                          <>
                                                              <tr><td className="p-3 font-mono text-xs text-emerald-600">code</td><td className="p-3 text-slate-600">String</td><td className="p-3 text-red-500 font-bold">Yes</td></tr>
                                                              <tr><td className="p-3 font-mono text-xs text-emerald-600">name</td><td className="p-3 text-slate-600">Object</td><td className="p-3 text-red-500 font-bold">Yes</td></tr>
                                                              <tr><td className="p-3 font-mono text-xs text-emerald-600">credits</td><td className="p-3 text-slate-600">Number</td><td className="p-3 text-red-500 font-bold">Yes</td></tr>
                                                              <tr><td className="p-3 font-mono text-xs text-emerald-600">topics</td><td className="p-3 text-slate-600">Array</td><td className="p-3 text-slate-400">No</td></tr>
                                                              <tr><td className="p-3 font-mono text-xs text-emerald-600">clos</td><td className="p-3 text-slate-600">Object</td><td className="p-3 text-slate-400">No</td></tr>
                                                          </>
                                                      )}
                                                  </tbody>
                                              </table>
                                          </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                          <h4 className="text-xs font-bold text-slate-500 uppercase">{language === 'vi' ? 'Mẫu JSON' : 'JSON Example'}</h4>
                                          <div className="relative group">
                                              <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-x-auto h-full max-h-[400px]">
{activeModal === 'cv' ? `{
  "id": "fac-123",
  "name": { "vi": "Nguyễn Văn A", "en": "Nguyen Van A" },
  "email": "a.nguyen@uni.edu.vn",
  "phone": "0909123456",
  "title": "PhD",
  "experience": { "vi": "10 năm", "en": "10 years" },
  "educationList": [
    { "degree": "PhD", "institution": "MIT", "year": "2015" }
  ],
  "publicationsList": [
    { "title": "AI in Education", "year": "2023" }
  ]
}` : `{
  "id": "CID-101",
  "code": "CS101",
  "name": { "vi": "Nhập môn Lập trình", "en": "Intro to Programming" },
  "credits": 3,
  "semester": 1,
  "type": "REQUIRED",
  "description": { "vi": "...", "en": "..." },
  "topics": [
    { "week": 1, "content": { "vi": "Biến", "en": "Variables" } }
  ],
  "clos": {
    "vi": ["Hiểu khái niệm cơ bản"],
    "en": ["Understand basic concepts"]
  },
  "assessmentPlan": [
    { "component": "Midterm", "percentage": 30 }
  ]
}`}
                                              </pre>
                                              <button 
                                                  onClick={() => {
                                                      const text = activeModal === 'cv' 
                                                          ? `{\n  "name": { "vi": "Nguyễn Văn A", "en": "Nguyen Van A" },\n  "email": "a.nguyen@uni.edu.vn",\n  "educationList": []\n}`
                                                          : `{\n  "code": "CS101",\n  "name": { "vi": "Tên môn", "en": "Course Name" },\n  "credits": 3\n}`;
                                                      navigator.clipboard.writeText(text);
                                                      alert(language === 'vi' ? "Đã sao chép mẫu!" : "Template copied!");
                                                  }}
                                                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                  title="Copy Template"
                                              >
                                                  <Copy size={14}/>
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <>
                              {/* Left: Input Area */}
                              <div className={`flex flex-col gap-4 p-4 border-r border-slate-100 transition-all ${validationResult ? 'w-1/3' : 'w-full'}`}>
                          {error && (
                              <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm flex items-center gap-2">
                                  <AlertTriangle size={16}/> {error}
                              </div>
                          )}
                          <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-slate-500 uppercase">JSON Source</label>
                              {validationResult && (
                                  <button onClick={() => setValidationResult(null)} className="text-xs text-indigo-600 hover:underline">
                                      {language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                                  </button>
                              )}
                          </div>
                          <textarea 
                              className={`flex-1 w-full p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none ${validationResult ? 'opacity-70' : ''}`}
                              placeholder={language === 'vi' ? "Dán mã JSON vào đây..." : "Paste JSON here..."}
                              value={jsonInput}
                              onChange={e => {
                                  setJsonInput(e.target.value);
                                  if (validationResult) setValidationResult(null); // Reset validation on edit
                              }}
                              readOnly={!!validationResult}
                          />
                      </div>

                      {/* Right: Validation Preview */}
                      {validationResult && (
                          <div className="flex-1 flex flex-col bg-slate-50/50 w-2/3 animate-in slide-in-from-right-4">
                              <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                      {validationResult.isValid ? (
                                          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                              <CheckCircle2 size={14}/> {language === 'vi' ? 'Hợp lệ' : 'Valid'}
                                          </div>
                                      ) : (
                                          <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                              <AlertTriangle size={14}/> {language === 'vi' ? 'Lỗi cấu trúc' : 'Invalid Structure'}
                                          </div>
                                      )}
                                      {validationResult.warnings.length > 0 && (
                                          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                              <Info size={14}/> {validationResult.warnings.length} {language === 'vi' ? 'Cảnh báo' : 'Warnings'}
                                          </div>
                                      )}
                                  </div>
                              </div>

                              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                  {/* Errors & Warnings */}
                                  {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                                      <div className="space-y-2">
                                          {validationResult.errors.map((err, i) => (
                                              <div key={`err-${i}`} className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 font-medium flex items-start gap-2">
                                                  <X size={14} className="mt-0.5 shrink-0"/> {err}
                                              </div>
                                          ))}
                                          {validationResult.warnings.map((warn, i) => (
                                              <div key={`warn-${i}`} className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 font-medium flex items-start gap-2">
                                                  <AlertTriangle size={14} className="mt-0.5 shrink-0"/> {warn}
                                              </div>
                                          ))}
                                      </div>
                                  )}

                                  {/* Data Preview Card */}
                                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                      <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                                          {language === 'vi' ? 'Xem trước dữ liệu' : 'Data Preview'}
                                      </div>
                                      <div className="p-4 space-y-4">
                                          {validationResult.type === 'cv' ? (
                                              <>
                                                  <div className="bg-slate-50 p-2 rounded border border-slate-100 mb-2 flex justify-between items-center">
                                                      <div>
                                                        <div className="text-xs font-bold text-slate-500 uppercase">Valid Items</div>
                                                        <div className="text-lg font-bold text-emerald-600">{validationResult.validItems.length}</div>
                                                      </div>
                                                      <div>
                                                        <div className="text-xs font-bold text-slate-500 uppercase">Invalid Items</div>
                                                        <div className="text-lg font-bold text-red-600">{validationResult.invalidItems.length}</div>
                                                      </div>
                                                  </div>
                                                  {validationResult.validItems.length > 0 && (
                                                    <div className="text-xs text-slate-500 italic mb-2">Previewing first valid item:</div>
                                                  )}
                                                  {validationResult.validItems.length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Name (VI)</label>
                                                            <div className="font-medium text-slate-800">{validationResult.validItems[0].name?.vi || '--'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Name (EN)</label>
                                                            <div className="font-medium text-slate-800">{validationResult.validItems[0].name?.en || '--'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Email</label>
                                                            <div className="font-medium text-slate-800">{validationResult.validItems[0].email || '--'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-slate-400 uppercase font-bold">ID</label>
                                                            <div className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit">{validationResult.validItems[0].id || 'Will be generated'}</div>
                                                        </div>
                                                    </div>
                                                  ) : (
                                                    <div className="text-sm text-slate-500 italic text-center py-4">No valid items to preview.</div>
                                                  )}
                                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                                      <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                                                          <div className="text-lg font-bold text-indigo-600">{validationResult.validItems[0]?.educationList?.length || 0}</div>
                                                          <div className="text-[10px] text-slate-400 uppercase">Degrees</div>
                                                      </div>
                                                      <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                                                          <div className="text-lg font-bold text-indigo-600">{validationResult.validItems[0]?.publicationsList?.length || 0}</div>
                                                          <div className="text-[10px] text-slate-400 uppercase">Pubs</div>
                                                      </div>
                                                      <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                                                          <div className="text-lg font-bold text-indigo-600">{validationResult.validItems[0]?.experience?.vi || 0}</div>
                                                          <div className="text-[10px] text-slate-400 uppercase">Years Exp</div>
                                                      </div>
                                                  </div>
                                              </>
                                          ) : (
                                              <>
                                                  <div className="bg-slate-50 p-2 rounded border border-slate-100 mb-2 flex justify-between items-center">
                                                      <div>
                                                        <div className="text-xs font-bold text-slate-500 uppercase">Valid Items</div>
                                                        <div className="text-lg font-bold text-emerald-600">{validationResult.validItems.length}</div>
                                                      </div>
                                                      <div>
                                                        <div className="text-xs font-bold text-slate-500 uppercase">Invalid Items</div>
                                                        <div className="text-lg font-bold text-red-600">{validationResult.invalidItems.length}</div>
                                                      </div>
                                                  </div>
                                                  {validationResult.validItems.length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Code</label>
                                                            <div className="font-bold text-indigo-700">{validationResult.validItems[0].code || '--'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Credits</label>
                                                            <div className="font-medium text-slate-800">{validationResult.validItems[0].credits}</div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Name</label>
                                                            <div className="font-medium text-slate-800">{validationResult.validItems[0].name?.vi || '--'} / {validationResult.validItems[0].name?.en || '--'}</div>
                                                        </div>
                                                    </div>
                                                  ) : (
                                                    <div className="text-sm text-slate-500 italic text-center py-4">No valid items to preview.</div>
                                                  )}
                                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                                      <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                                                          <div className="text-lg font-bold text-emerald-600">{validationResult.validItems[0]?.topics?.length || 0}</div>
                                                          <div className="text-[10px] text-slate-400 uppercase">Topics</div>
                                                      </div>
                                                      <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                                                          <div className="text-lg font-bold text-emerald-600">{validationResult.validItems[0]?.clos?.vi?.length || 0}</div>
                                                          <div className="text-[10px] text-slate-400 uppercase">CLOs</div>
                                                      </div>
                                                      <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                                                          <div className="text-lg font-bold text-emerald-600">{validationResult.validItems[0]?.assessmentPlan?.length || 0}</div>
                                                          <div className="text-[10px] text-slate-400 uppercase">Assessments</div>
                                                      </div>
                                                  </div>
                                              </>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </>
              )}
          </div>

                  {!showSchemaPreview && (
                      <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-2">
                          <button onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                              {language === 'vi' ? 'Hủy' : 'Cancel'}
                          </button>
                          
                          {!validationResult ? (
                              <button onClick={handleAnalyze} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md flex items-center gap-2">
                                  <Search size={16}/> {language === 'vi' ? 'Kiểm tra & Xem trước' : 'Check & Preview'}
                              </button>
                          ) : (
                              <button 
                                  onClick={proceedToConflictCheck} 
                                  disabled={!validationResult.isValid}
                                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <Check size={16}/> {language === 'vi' ? `Tiếp tục nhập (${validationResult.validItems.length} mục)` : `Proceed (${validationResult.validItems.length} items)`}
                              </button>
                          )}
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Conflict / Confirmation Modal */}
      {conflictData && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
                  <div className={`p-5 border-b flex justify-between items-center ${conflictData.isNew ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                      <h3 className={`font-bold text-lg flex items-center gap-2 ${conflictData.isNew ? 'text-emerald-800' : 'text-amber-800'}`}>
                          {conflictData.isNew 
                              ? (language === 'vi' ? <><Plus size={20}/> Xác nhận nhập mới</> : <><Plus size={20}/> Confirm New Import</>)
                              : (language === 'vi' ? <><Merge size={20}/> Phát hiện trùng lặp</> : <><Merge size={20}/> Conflict Detected</>)
                          }
                          {conflictData.bulkItems && (
                              <span className="text-xs bg-white/50 px-2 py-1 rounded ml-2">
                                  Item {(conflictData.currentIndex || 0) + 1} / {conflictData.bulkItems.length}
                              </span>
                          )}
                      </h3>
                      <button onClick={() => setConflictData(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      {conflictData.isNew ? (
                          <div className="text-sm text-slate-600">
                              {language === 'vi' 
                                  ? 'Dữ liệu này chưa tồn tại trong hệ thống. Bạn có muốn thêm mới không?' 
                                  : 'This item does not exist in the system. Do you want to import it as new?'}
                          </div>
                      ) : (
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm text-amber-800">
                              {language === 'vi' 
                                  ? `Đã tìm thấy mục tương tự (Trùng ${conflictData.matchReason === 'id' ? 'ID' : (conflictData.matchReason === 'email' ? 'Email' : (conflictData.matchReason === 'code' ? 'Mã môn' : 'Tên'))}). Bạn muốn ghi đè hay tạo mới?` 
                                  : `Found existing item (Matched by ${conflictData.matchReason}). Overwrite or create new?`}
                          </div>
                      )}

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Incoming Data Preview</h4>
                          <div className="text-xs font-mono text-slate-700 bg-white p-2 rounded border border-slate-100 max-h-40 overflow-y-auto">
                              {conflictData.type === 'cv' 
                                  ? (conflictData.item as Faculty).name[language] || (conflictData.item as Faculty).name['en']
                                  : (conflictData.item as Course).code + ' - ' + ((conflictData.item as Course).name[language] || '')
                              }
                              <br/>
                              <span className="text-slate-400">ID: {(conflictData.item as any).id}</span>
                              {conflictData.type === 'cv' && (
                                <>
                                    <br/>
                                    <span className="text-slate-400">Email: {(conflictData.item as any).email}</span>
                                </>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-wrap">
                      <button onClick={() => setConflictData(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                          {language === 'vi' ? 'Hủy' : 'Cancel'}
                      </button>
                      
                      {conflictData.isNew ? (
                          <button onClick={handleConfirmNew} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200 flex items-center gap-2">
                              <Plus size={14}/> {language === 'vi' ? 'Nhập dữ liệu' : 'Import Data'}
                          </button>
                      ) : (
                          <>
                              <button onClick={handleCreateNew} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center gap-2">
                                  <Copy size={14}/> {language === 'vi' ? 'Tạo mới (ID mới)' : 'Create New (New ID)'}
                              </button>
                              <button onClick={handleOverwrite} className="px-6 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shadow-md shadow-amber-200 flex items-center gap-2">
                                  <RefreshCw size={14}/> {language === 'vi' ? 'Ghi đè (Giữ ID)' : 'Overwrite (Keep ID)'}
                              </button>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Main Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-2">
                  <FileJson className="text-indigo-600" size={28} />
                  {language === 'vi' ? 'Quản lý Tệp/Dữ liệu' : 'File/Data Management'}
                </h1>
                <p className="text-slate-600 max-w-2xl">
                  {language === 'vi' 
                    ? 'Quản lý toàn bộ dữ liệu hệ thống, nhập từ JSON hoặc sử dụng công cụ AI.'
                    : 'Manage full system data, import from JSON, or use AI tools.'}
                </p>
            </div>
            <a 
                href="https://gemini.google.com/gem/1ERPKel5BS-NhyaEfdUbi1DRfJ92hDKBE?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:shadow-md transition-all group shrink-0"
            >
                <Sparkles size={16} className="text-purple-500 group-hover:animate-pulse"/>
                <span>{language === 'vi' ? 'Công cụ tạo JSON' : 'JSON Creator Bot'}</span>
                <ExternalLink size={14} className="opacity-50"/>
            </a>
        </div>

        {/* Section 1: Full System Operations */}
        <div className="mb-8 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Database size={16} /> {language === 'vi' ? 'Dữ liệu toàn hệ thống' : 'Full System Data'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={onExport} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-4 group text-left">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Download size={20}/>
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 block">{language === 'vi' ? 'Lưu tệp dữ liệu' : 'Save Data File'}</span>
                            <span className="text-[10px] text-slate-400">JSON Format (Backup)</span>
                        </div>
                    </button>
                    
                    <label className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4 group cursor-pointer text-left">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Upload size={20}/>
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 block">{language === 'vi' ? 'Mở tệp dữ liệu' : 'Open Data File'}</span>
                            <span className="text-[10px] text-slate-400">JSON Format (Restore)</span>
                        </div>
                        <input type="file" ref={jsonImportRef} className="hidden" accept=".json" onChange={handleFileSelect} />
                    </label>
                </div>
            </div>

            {/* Recent Files Section */}
            {recentHandles.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <History size={16} /> {language === 'vi' ? 'Tệp gần đây' : 'Recent Files'}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {recentHandles.slice(0, 3).map((h, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-indigo-300 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                        <FileText size={18}/>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-700">{h.name}</div>
                                        <div className="text-[10px] text-slate-400">{new Date(h.lastUsed).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleSaveToHandle(h.handle)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-1.5"
                                        title={language === 'vi' ? 'Lưu phiên bản mới' : 'Save new version'}
                                    >
                                        <Save size={16}/>
                                        <span className="text-[10px] font-bold hidden md:inline">{language === 'vi' ? 'Lưu mới' : 'Save New'}</span>
                                    </button>
                                    <button 
                                        onClick={() => onImportHandle(h.handle)}
                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1.5"
                                        title={language === 'vi' ? 'Mở tệp này' : 'Open this file'}
                                    >
                                        <Upload size={16}/>
                                        <span className="text-[10px] font-bold hidden md:inline">{language === 'vi' ? 'Mở' : 'Open'}</span>
                                    </button>
                                    {onRemoveHandle && (
                                        <button 
                                            onClick={() => onRemoveHandle(h.name)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title={language === 'vi' ? 'Xóa khỏi danh sách' : 'Remove from list'}
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Section 2: Specific Tools */}
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ListFilter size={16} /> {language === 'vi' ? 'Công cụ cụ thể' : 'Specific Tools'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: CV Import */}
          <button 
            onClick={() => handleOpenModal('cv')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all group h-full"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">
              {language === 'vi' ? 'Nhập JSON Giảng viên' : 'Import Faculty JSON'}
            </h3>
          </button>

          {/* Card 2: Syllabus Import */}
          <button 
            onClick={() => handleOpenModal('syllabus')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group h-full"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">
              {language === 'vi' ? 'Nhập JSON Đề cương' : 'Import Syllabus JSON'}
            </h3>
          </button>

          {/* Card 3: Library Tools */}
          <button 
            onClick={() => handleOpenModal('library_dedupe')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl hover:border-amber-500 hover:shadow-md transition-all group h-full"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen size={24} className="text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 group-hover:text-amber-700">
              {language === 'vi' ? 'Kiểm tra Thư viện' : 'Library Deduplication'}
            </h3>
          </button>
        </div>
      </div>


    </div>
  );
};

export default JSONInputModule;
