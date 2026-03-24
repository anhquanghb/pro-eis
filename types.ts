
export type Language = 'vi' | 'en';
export type Role = 'ADMIN' | 'USER';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  lastLogin: string;
}

export type LocalizedString = {
  [key in Language]: string;
};

export interface MissionConstituent {
  id: string;
  description: LocalizedString;
}

export interface Mission {
  text: LocalizedString;
  constituents: MissionConstituent[];
}

export interface PEO {
  id: string;
  code: string;
  title: LocalizedString;
  description: LocalizedString;
}

export interface PI {
  id: string;
  code: string;
  description: LocalizedString;
}

export interface SO {
  id: string;
  number: number;
  code: string;
  description: LocalizedString;
  pis: PI[];
}

export interface KnowledgeArea {
  id: string;
  name: LocalizedString;
  color: string;
}

export interface AcademicSchool {
  id: string;
  code: string;
  name: LocalizedString;
  description?: LocalizedString;
}

export interface AcademicFaculty {
  id: string;
  code: string;
  name: LocalizedString;
  description?: LocalizedString;
  schoolId?: string; // Link to AcademicSchool (Trường)
}

export interface Department {
  id: string;
  code: string;
  name: LocalizedString;
  description?: LocalizedString;
  headIds?: string[]; // IDs of Faculty who are heads
  academicFacultyId?: string; // Link to AcademicFaculty (Khoa)
}

export interface Textbook {
  resourceId: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  type: 'textbook' | 'reference';
  url?: string;
}

export interface TopicActivity {
  methodId: string;
  hours: number;
}

export interface TopicReading {
  resourceId: string;
  pageRange: string;
}

export interface CourseTopic {
  id: string;
  no: string;
  topic: LocalizedString;
  activities: TopicActivity[];
  readingRefs: TopicReading[];
  subTopics?: CourseTopic[];
  cloIds?: string[];
  soIds?: string[];
  piIds?: string[];
  objectiveIds?: string[];
  requirement?: 'must_know' | 'should_know' | 'could_know';
}

export interface AssessmentItem {
  id: string;
  methodId: string;
  type: LocalizedString;
  percentile: number;
  form?: string;
  submissionMethod?: string;
  assessmentTool?: string;
}

export type AssessmentConfigType = 'THEORY' | 'PRACTICE' | 'PROJECT';

export interface RegularTestItem {
  id: string;
  form: string;
  otherForm?: string;
  contentIds: string[];
  weekNo: number;
  tool: string;
  otherTool?: string;
  submissionMethod?: string;
  otherSubmissionMethod?: string;
  weight: number;
}

export interface FinalExamFormItem {
  id: string;
  form: 'ESSAY' | 'MULTIPLE_CHOICE' | 'ORAL' | 'OTHER';
  otherForm?: string;
  weight: number; // percentage of the final exam (sum should be 100)
}

export interface TheoryAssessmentConfig {
  processWeight: number; // max 50%
  attendanceWeight: number; // max 10%
  participationWeight: number;
  midtermWeight: number;
  finalProcessWeight: number; // "Điểm cuối kỳ" within process assessment
  selfStudyWeight: number;
  regularTests?: RegularTestItem[];
  
  finalExamWeight: number; // min 50%
  finalExamForm: string; // Keep for backward compatibility
  finalExamForms?: FinalExamFormItem[]; // New: Support multiple forms
  finalExamDuration: number; // minutes
  finalExamAllowMaterials: boolean;
  finalExamMaterialsDetail?: string;
}

export interface RubricLevel {
  id: string;
  label: LocalizedString;
  score: number;
}

export interface RubricCriterion {
  id: string;
  label: LocalizedString;
  weight: number;
  descriptions: Record<string, LocalizedString>; // levelId -> LocalizedString
}

export interface RubricData {
  levels: RubricLevel[];
  criteria: RubricCriterion[];
}

export interface PracticeAssessmentConfig {
  criteria: string;
  criteriaType?: 'DESCRIPTION' | 'RUBRIC';
  rubric?: RubricData;
  items: { task: string; weight: number }[];
}

export interface ProjectAssessmentConfig {
  criteria: string;
  criteriaType?: 'DESCRIPTION' | 'RUBRIC';
  rubric?: RubricData;
}

export enum CoverageLevel {
  NONE = '',
  L = 'L',
  M = 'M',
  H = 'H'
}

export interface CloMapping {
  cloIndex: number;
  topicIds: string[];
  teachingMethodIds: string[];
  assessmentMethodIds: string[];
  coverageLevel: CoverageLevel;
}

export interface CourseObjectives {
  general: LocalizedString;
  specific: {
    knowledge: LocalizedString[];
    skills: LocalizedString[];
    responsibility: LocalizedString[];
  };
}

export interface Course {
  id: string;
  code: string;
  name: LocalizedString;
  credits: number;
  isEssential: boolean;
  isAbet?: boolean;
  type: 'REQUIRED' | 'SELECTED_ELECTIVE' | 'ELECTIVE';
  knowledgeAreaId: string;
  departmentId?: string; // Link to Department (Deprecated)
  managingUnitId?: string; // Link to Department, Faculty, or School
  managingUnitType?: 'DEPARTMENT' | 'FACULTY' | 'SCHOOL';
  semester: number;
  colIndex: number;
  prerequisites: string[];
  coRequisites: string[];
  description: LocalizedString;
  objectives?: CourseObjectives;
  textbooks: Textbook[];
  clos: { vi: string[]; en: string[] };
  topics: CourseTopic[];
  assessmentPlan: AssessmentItem[];
  instructorIds: string[];
  instructorDetails: Record<string, { classInfo: string; isMain?: boolean }>;
  cloMap: CloMapping[];
  blockId?: string; // Internal Knowledge/Skill Block ID
  schedule?: { weekNo: number; topicIds: string[] }[];
  scheduleNumWeeks?: number;
  teachingMethodsDescription?: LocalizedString;
  coursePolicies?: LocalizedString;
  classOrganizationForm?: LocalizedString;
  
  // New Assessment Configuration
  assessmentConfigType?: AssessmentConfigType;
  theoryAssessmentConfig?: TheoryAssessmentConfig;
  practiceAssessmentConfig?: PracticeAssessmentConfig;
  projectAssessmentConfig?: ProjectAssessmentConfig;
  creditBlockValues?: Record<string, number>; // blockId -> credit value
}

export interface EducationItem {
  id: string;
  degree: LocalizedString;
  discipline: LocalizedString;
  institution: LocalizedString;
  year: string;
}

export interface AcademicExperienceItem {
  id: string;
  institution: LocalizedString;
  rank: LocalizedString;
  title: LocalizedString;
  period: string;
  isFullTime: boolean;
}

export interface NonAcademicExperienceItem {
  id: string;
  company: LocalizedString;
  title: LocalizedString;
  description: LocalizedString;
  period: string;
  isFullTime: boolean;
}

export interface PublicationItem {
  id: string;
  text: LocalizedString;
}

export interface FacultyListItem {
  id: string;
  content: LocalizedString;
}

export interface Faculty {
  id: string;
  name: LocalizedString;
  rank: LocalizedString;
  degree: LocalizedString;
  academicTitle: LocalizedString;
  position: LocalizedString;
  experience: LocalizedString;
  careerStartYear?: number; // Added: Year they started working
  workload: number;
  employmentType?: 'FT' | 'PT';
  departmentId?: string; // Link to Department
  dob?: string;
  office?: string;
  officeHours?: string;
  tel?: string;
  cell?: string;
  email?: string;
  contactAddress?: string; // Added: Contact address
  researchDirections?: LocalizedString; // Added: Main research directions
  unitId?: string; // Link to School, Faculty, or Department
  unitType?: 'SCHOOL' | 'FACULTY' | 'DEPARTMENT';
  educationList: EducationItem[];
  academicExperienceList: AcademicExperienceItem[];
  nonAcademicExperienceList: NonAcademicExperienceItem[];
  publicationsList: PublicationItem[];
  // New list-based structures
  certificationsList: FacultyListItem[];
  membershipsList: FacultyListItem[];
  honorsList: FacultyListItem[];
  serviceActivitiesList: FacultyListItem[];
  professionalDevelopmentList: FacultyListItem[];
}

export interface FacultyTitle {
  id: string;
  name: LocalizedString;
  abbreviation?: LocalizedString; // Added abbreviation
}

export interface FacultyTitles {
  ranks: FacultyTitle[];
  degrees: FacultyTitle[];
  academicTitles: FacultyTitle[];
  positions: FacultyTitle[];
}

export type TeachingMethodCategory = string;
export type TeachingOrganizationCategory = 'THEORY' | 'EXERCISE' | 'GROUP_DISCUSSION' | 'PRACTICE_LAB_INTERNSHIP' | 'SELF_STUDY';

export interface CreditBlock {
  id: string;
  code: string;
  name: LocalizedString;
  acronym: LocalizedString;
}

export interface TeachingMethod {
  id: string;
  code: string;
  name: LocalizedString;
  description?: LocalizedString; // Added description field
  hoursPerCredit: number;
  category: TeachingMethodCategory;
  category2?: TeachingOrganizationCategory;
  hoursConfig?: {
    study: number;
    review: number;
    exam: string | number;
  };
}

export interface AssessmentMethod {
  id: string;
  name: LocalizedString;
}

export type MoetCategory = 'knowledge' | 'skills' | 'learning';

export type MoetStructureType = 'REQUIRED' | 'ELECTIVE' | 'SELECTED_ELECTIVE';

export interface MoetStructureNode {
  id: string;
  title: LocalizedString;
  level: 1 | 2 | 3 | 'MODULE';
  type: MoetStructureType;
  manualCredits?: number;
  manualCreditBlockValues?: Record<string, number>;
  requiredCredits?: number; // Added for elective blocks
  order: number; // Added for sorting
  parentId?: string; // ID of the parent node
  courseIds: string[]; // IDs of courses directly under this node
}

export interface MoetObjective {
  id: string;
  code?: string; // e.g., "1", "1.1", "1.1.1"
  level?: number; // 1, 2, or 3
  category?: MoetCategory;
  description: LocalizedString;
  competencyLevel?: string; // Added for MOET SO competency mapping
  peoIds?: string[];
  soIds?: string[];
}

export interface MoetProgramFaculty {
  id: string;
  fullNameYearPosition: string;
  degreeCountryYear: string;
  major: string;
  teachingExperience: string;
}

export interface MoetSubBlock {
  id: string;
  name: LocalizedString;
  parentBlockId: 'gen' | 'phys' | 'fund' | 'spec' | 'grad';
  type?: 'COMPULSORY' | 'ELECTIVE'; // Added to distinguish block types
  minCredits: number;
  courseIds: string[];
  note?: LocalizedString;
  uiPosition?: { x: number; y: number }; // Added for Flowchart DnD
  preferredSemester?: number; // Semester priority for elective blocks
}

export interface MoetBlock {
  id: string;
  name: LocalizedString;
  minCredits: number;
  note?: LocalizedString;
}

export interface MoetInfo {
  level: LocalizedString;
  majorName: LocalizedString;
  majorCode: string;
  programName: LocalizedString;
  programCode: string;
  specializations?: LocalizedString[];
  trainingMode: LocalizedString;
  trainingType: LocalizedString;
  trainingLanguage: LocalizedString;
  duration: string;
  numSemesters?: number;
  trainingOrientation?: LocalizedString;
  minCredits?: number;
  degreeName?: LocalizedString;
  legalBasis?: LocalizedString;
  admissionTarget: LocalizedString;
  admissionReq: LocalizedString;
  graduationReq: LocalizedString;
  graduationNote?: LocalizedString;
  gradingScale: LocalizedString;
  // 6. Assessment
  assessmentMethods?: LocalizedString; // 6.1
  assessmentPloMethod?: LocalizedString; // 6.2
  // 9. Admission & Quality Assurance
  admissionPlan?: LocalizedString; // 9.1
  qualityAssurancePlan?: LocalizedString; // 9.2
  implementationGuideline: LocalizedString;
  guidelineFacilities?: LocalizedString; // 13.1
  guidelineClassForms?: LocalizedString; // 13.2
  guidelineCreditConversion?: LocalizedString; // 13.3
  // 10. Implementation Guidelines (New)
  guidelineSchedulePrinciples?: LocalizedString; // 10.1
  guidelineFirstSemesterSchedule?: LocalizedString; // 10.2
  guidelineSecondSemesterSchedule?: LocalizedString; // 10.3
  guidelinePhysicalDefenseEdu?: LocalizedString; // 10.4
  guidelineForeignLanguage?: LocalizedString; // 10.5
  guidelineElectives?: LocalizedString; // 10.6
  guidelineGraduationProject?: LocalizedString; // 10.7
  // 11. Training Plan
  trainingPlanPrinciples?: LocalizedString; // 11.1
  trainingPlanFirstYear?: LocalizedString; // 11.2
  // 13 & 14
  facilitiesNote?: LocalizedString; // 13
  teachingMethodsNote?: LocalizedString; // 14
  referencedPrograms: LocalizedString;
  generalObjectives: LocalizedString;
  moetSpecificObjectives?: MoetObjective[];
  specificObjectives: MoetObjective[];
  programStructure: {
    gen: string[];
    phys: string[];
    fund: string[];
    spec: string[];
    grad: string[];
  };
  subBlocks?: MoetSubBlock[];
  blocks?: MoetBlock[]; // New: Internal Knowledge/Skill Blocks
  courseObjectiveMap?: string[];
  programFaculty?: MoetProgramFaculty[];
  structure?: MoetStructureNode[];
}

export interface GeneralInfo {
  university: LocalizedString;
  school: LocalizedString;
  programName: LocalizedString;
  contact: LocalizedString;
  history: LocalizedString;
  deliveryModes: LocalizedString;
  locations: LocalizedString;
  academicYear: string;
  defaultSubjectCode: string;
  defaultSubjectName: LocalizedString;
  defaultCredits: number;
  publicDisclosure: LocalizedString;
  signerTitle?: LocalizedString;
  signerName?: string;
  approverTitle?: LocalizedString;
  approverName?: string;
  city?: LocalizedString;
  previousEvaluations: {
    weaknesses: LocalizedString;
    actions: LocalizedString;
    status: LocalizedString;
  };
  moetInfo: MoetInfo;
}

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  type: 'textbook' | 'reference';
  isEbook: boolean;
  isPrinted: boolean;
  url?: string;
}

export interface GeminiConfig {
  model: string;
  apiKey?: string;
  prompts: Record<string, string>;
}

export enum IRM {
  I = 'I',
  R = 'R',
  M = 'M',
  NONE = ''
}

export interface Facility {
  id: string;
  code: string;
  name: LocalizedString;
  description: LocalizedString;
  courseIds: string[];
}

export interface SystemCategory {
  id: string;
  vi: string;
  en: string;
}

export interface ActivityGroup extends SystemCategory {
  methodIds: string[]; // Mảng chứa ID các phương pháp (VD: ['tm1', 'tm2'])
}

export interface GlobalConfigs {
  teachingMethods: TeachingMethod[];
  assessmentMethods: AssessmentMethod[];
  knowledgeAreas: KnowledgeArea[];
  creditBlocks: CreditBlock[];
  assessmentCategories: SystemCategory[];
  activityGroups: ActivityGroup[];
  submissionMethods: SystemCategory[];
  assessmentTools: SystemCategory[];
  finalAssessmentMethods: SystemCategory[];
}

export interface GlobalState {
  institutionInfo: Omit<GeneralInfo, 'moetInfo' | 'programName'>;
  globalConfigs: GlobalConfigs;
  facultyDirectory: Faculty[];
  organizationStructure: {
    academicSchools: AcademicSchool[];
    academicFaculties: AcademicFaculty[];
    departments: Department[];
    facultyTitles: FacultyTitles;
  };
  facilitiesCatalog: Facility[];
  courseCatalog: Course[];
  library: LibraryResource[];
  geminiConfig: GeminiConfig;
}

export interface ProgramSpecificInfo {
  targetStudents: LocalizedString;
  entryRequirements: LocalizedString;
  graduationConditions: LocalizedString;
  assessmentMethods: LocalizedString;
  admissionPlan: LocalizedString;
  qualityAssurancePlan: LocalizedString;
  implementationGuidelines: LocalizedString;
}

export interface ProgramState {
  id: string;
  programCode: string;
  programName: LocalizedString;
  degreeLevel: LocalizedString;
  programSpecificInfo: ProgramSpecificInfo;
  GPLO: LocalizedString;
  PLOs: MoetObjective[];
  LOs: MoetObjective[];
  PEOs: PEO[];
  peoPloMap: { peoId: string; ploId: string }[];
  SOs: SO[];
  loSoMap: { loId: string; soId: string }[];
  studentOutcomes: SO[];
  curriculumStructure: MoetStructureNode[];
  matrix: { courseId: string; soId: string; level: IRM }[];
  courseSoMap: { courseId: string; soId: string; level: IRM }[];
  coursePiMap: { courseId: string; piId: string }[];
  coursePeoMap: { courseId: string; peoId: string }[];
  peoSoMap: { peoId: string; soId: string }[];
  peoConstituentMap: { peoId: string; constituentId: string }[];
  cloPloMap: { courseId: string; cloIndex: number; ploId: string }[];
  mission: Mission;
  moetInfo: MoetInfo;
  hasInternationalAccreditation?: boolean;
}

export interface AppState {
  version?: string; // App Version tracking
  language: Language;
  authEnabled: boolean;
  currentUser: UserAccount | null;
  users: UserAccount[];
  
  // --- NEW RELATIONAL STATE ---
  globalState?: GlobalState;
  programs?: ProgramState[];
  currentProgramId?: string | null;

  // --- DEPRECATED FLAT STATE (Kept for backward compatibility) ---
  mission: Mission;
  peos: PEO[];
  sos: SO[];
  academicSchools: AcademicSchool[]; // New: Trường
  academicFaculties: AcademicFaculty[]; // Khoa (linked to School)
  departments: Department[]; // Bộ môn (linked to Faculty)
  courses: Course[];
  faculties: Faculty[];
  facilities: Facility[];
  knowledgeAreas: KnowledgeArea[];
  teachingMethods: TeachingMethod[];
  assessmentMethods: AssessmentMethod[];
  facultyTitles: FacultyTitles;
  geminiConfig: GeminiConfig;
  generalInfo: GeneralInfo;
  library: LibraryResource[];
  assessmentCategories: SystemCategory[];
  activityGroups: ActivityGroup[];
  submissionMethods: SystemCategory[];
  assessmentTools: SystemCategory[];
  finalAssessmentMethods: SystemCategory[];
  creditBlocks: CreditBlock[];
  courseSoMap: { courseId: string; soId: string; level: IRM }[];
  coursePiMap: { courseId: string; piId: string }[];
  coursePeoMap: { courseId: string; peoId: string }[];
  peoSoMap: { peoId: string; soId: string }[];
  peoConstituentMap: { peoId: string; constituentId: string }[];
  cloPloMap: { courseId: string; cloIndex: number; ploId: string }[];
}
