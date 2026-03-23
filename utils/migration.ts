
import { AppState, GlobalState, ProgramState } from '../types';
import { CODE_VERSION } from '../constants';

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
  const programState: ProgramState = {
    id: programId,
    programCode: oldState.generalInfo?.moetInfo?.programCode || '',
    programName: oldState.generalInfo?.programName || { vi: 'Chương trình mới', en: 'New Program' },
    degreeLevel: oldState.generalInfo?.moetInfo?.level || { vi: '', en: '' },
    programSpecificInfo: {
      targetStudents: oldState.generalInfo?.moetInfo?.admissionTarget || { vi: '', en: '' },
      entryRequirements: oldState.generalInfo?.moetInfo?.admissionReq || { vi: '', en: '' },
      graduationConditions: oldState.generalInfo?.moetInfo?.graduationReq || { vi: '', en: '' },
      assessmentMethods: oldState.generalInfo?.moetInfo?.assessmentMethods || { vi: '', en: '' },
      admissionPlan: oldState.generalInfo?.moetInfo?.admissionPlan || { vi: '', en: '' },
      qualityAssurancePlan: oldState.generalInfo?.moetInfo?.qualityAssurancePlan || { vi: '', en: '' },
      implementationGuidelines: oldState.generalInfo?.moetInfo?.implementationGuideline || { vi: '', en: '' }
    },
    GPLO: oldState.generalInfo?.moetInfo?.generalObjectives || { vi: '', en: '' },
    PLOs: oldState.generalInfo?.moetInfo?.moetSpecificObjectives || [],
    LOs: oldState.generalInfo?.moetInfo?.specificObjectives || [],
    PEOs: oldState.peos || [],
    peoPloMap: [], 
    SOs: oldState.sos || [],
    loSoMap: [], 
    studentOutcomes: oldState.sos || [],
    curriculumStructure: oldState.generalInfo?.moetInfo?.structure || [],
    matrix: oldState.courseSoMap || [],
    courseSoMap: oldState.courseSoMap || [],
    coursePiMap: oldState.coursePiMap || [],
    coursePeoMap: oldState.coursePeoMap || [],
    peoSoMap: oldState.peoSoMap || [],
    peoConstituentMap: oldState.peoConstituentMap || [],
    mission: oldState.mission || { text: { vi: '', en: '' }, constituents: [] },
    moetInfo: oldState.generalInfo?.moetInfo || {}
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
