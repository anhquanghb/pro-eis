
import { AppState, GlobalState, ProgramState } from '../types';
import { CODE_VERSION, INITIAL_STATE } from '../constants';

/**
 * Normalizes incoming data by detecting if it's in the new relational format
 * or the old flat format, and migrating if necessary.
 */
export const normalizeIncomingData = (data: any): AppState => {
  // 1. If data already has globalState and programs, it's a new relational state
  if (data.globalState && data.programs && data.programs.length > 0) {
    return {
      ...INITIAL_STATE,
      ...data,
      language: data.language || 'en',
      authEnabled: data.authEnabled !== undefined ? data.authEnabled : INITIAL_STATE.authEnabled,
      currentUser: INITIAL_STATE.currentUser, // Do not overwrite current user session
      users: Array.isArray(data.users) ? data.users : INITIAL_STATE.users,
      geminiConfig: { ...INITIAL_STATE.geminiConfig, ...(data.geminiConfig || {}) },
      version: CODE_VERSION
    };
  }

  // 2. Otherwise, it's an old flat state. Migrate it.
  return migrateState(data);
};

/**
 * Migrates old flat AppState to the new relational structure (globalState + programs)
 */
export const migrateState = (oldState: any): AppState => {
  // If it's already a new state structure, just return it with updated version
  if (oldState.globalState && oldState.programs && oldState.programs.length > 0) {
    return {
      ...oldState,
      version: CODE_VERSION
    };
  }

  console.log("Migrating old state to new relational structure...");

  // 1. Create GlobalState from flat fields
  const globalState: GlobalState = {
    institutionInfo: {
      university: oldState.generalInfo?.university || { vi: '', en: '' },
      school: oldState.generalInfo?.school || { vi: '', en: '' },
      contact: oldState.generalInfo?.contact || { vi: '', en: '' },
      history: oldState.generalInfo?.history || { vi: '', en: '' },
      deliveryModes: oldState.generalInfo?.deliveryModes || { vi: '', en: '' },
      locations: oldState.generalInfo?.locations || { vi: '', en: '' },
      academicYear: oldState.generalInfo?.academicYear || '',
      defaultSubjectCode: oldState.generalInfo?.defaultSubjectCode || '',
      defaultSubjectName: oldState.generalInfo?.defaultSubjectName || { vi: '', en: '' },
      defaultCredits: oldState.generalInfo?.defaultCredits || 3,
      publicDisclosure: oldState.generalInfo?.publicDisclosure || { vi: '', en: '' },
      signerTitle: oldState.generalInfo?.signerTitle,
      signerName: oldState.generalInfo?.signerName,
      approverTitle: oldState.generalInfo?.approverTitle,
      approverName: oldState.generalInfo?.approverName,
      city: oldState.generalInfo?.city,
      previousEvaluations: oldState.generalInfo?.previousEvaluations || {
        weaknesses: { vi: '', en: '' },
        actions: { vi: '', en: '' },
        status: { vi: '', en: '' }
      }
    },
    globalConfigs: {
      teachingMethods: oldState.teachingMethods || [],
      assessmentMethods: oldState.assessmentMethods || [],
      knowledgeAreas: oldState.knowledgeAreas || [],
      creditBlocks: oldState.creditBlocks || [],
      assessmentCategories: oldState.assessmentCategories || [],
      activityGroups: oldState.activityGroups || [],
      submissionMethods: oldState.submissionMethods || [],
      assessmentTools: oldState.assessmentTools || [],
      finalAssessmentMethods: oldState.finalAssessmentMethods || []
    },
    facultyDirectory: oldState.faculties || [],
    organizationStructure: {
      academicSchools: oldState.academicSchools || [],
      academicFaculties: oldState.academicFaculties || [],
      departments: oldState.departments || [],
      facultyTitles: oldState.facultyTitles || { ranks: [], degrees: [], academicTitles: [], positions: [] }
    },
    facilitiesCatalog: oldState.facilities || [],
    courseCatalog: oldState.courses || [],
    library: oldState.library || [],
    geminiConfig: oldState.geminiConfig || { model: 'gemini-3-flash-preview', prompts: {} }
  };

  // 2. Create default ProgramState from flat fields
  const programId = `prog-${Date.now()}`;
  const moetInfo = oldState.generalInfo?.moetInfo || {};
  
  const programState: ProgramState = {
    id: programId,
    programCode: moetInfo.programCode || '',
    programName: oldState.generalInfo?.programName || moetInfo.programName || { vi: 'Chương trình mới', en: 'New Program' },
    degreeLevel: moetInfo.level || { vi: '', en: '' },
    programSpecificInfo: {
      targetStudents: moetInfo.admissionTarget || { vi: '', en: '' },
      entryRequirements: moetInfo.admissionReq || { vi: '', en: '' },
      graduationConditions: moetInfo.graduationReq || { vi: '', en: '' },
      assessmentMethods: moetInfo.assessmentMethods || { vi: '', en: '' },
      admissionPlan: moetInfo.admissionPlan || { vi: '', en: '' },
      qualityAssurancePlan: moetInfo.qualityAssurancePlan || { vi: '', en: '' },
      implementationGuidelines: moetInfo.implementationGuideline || { vi: '', en: '' }
    },
    GPLO: moetInfo.generalObjectives || { vi: '', en: '' },
    PLOs: moetInfo.moetSpecificObjectives || [],
    LOs: moetInfo.specificObjectives || [],
    PEOs: oldState.peos || [],
    peoPloMap: oldState.peoPloMap || [], 
    SOs: oldState.sos || [],
    loSoMap: oldState.loSoMap || [], 
    studentOutcomes: oldState.sos || [],
    curriculumStructure: moetInfo.structure || [],
    matrix: oldState.courseSoMap || [],
    courseSoMap: oldState.courseSoMap || [],
    coursePiMap: oldState.coursePiMap || [],
    coursePeoMap: oldState.coursePeoMap || [],
    peoSoMap: oldState.peoSoMap || [],
    peoConstituentMap: oldState.peoConstituentMap || [],
    mission: oldState.mission || { text: { vi: '', en: '' }, constituents: [] },
    moetInfo: moetInfo
  };

  // 3. Assemble new AppState
  const newState: AppState = {
    ...oldState,
    version: CODE_VERSION,
    globalState,
    programs: [programState],
    currentProgramId: programId
  };

  return newState;
};
