// src/utils/migration.ts
import { AppState } from '../types';

export const migrateState = (oldData: any): AppState => {
  // 1. Nếu dữ liệu tải lên đã là chuẩn mới (có mảng programs), thì trả về luôn
  if (oldData.programs && Array.isArray(oldData.programs) && oldData.programs.length > 0) {
    return oldData as AppState;
  }

  console.log("Phát hiện dữ liệu phiên bản cũ (v1.6.0). Đang tiến hành Migrate...");

  // 2. Tạo ID duy nhất cho chương trình từ dữ liệu cũ
  const programId = `prog-${Date.now()}`;

  // 3. Đóng gói dữ liệu cấp Chương trình (Program Level)
  // Toàn bộ các môn học, chuẩn đầu ra, và ma trận của ngành Ô tô điện sẽ được gom vào đây
  const programState = {
    id: programId,
    generalInfo: oldData.generalInfo || {},
    moetInfo: oldData.generalInfo?.moetInfo || oldData.moetInfo || {},
    mission: oldData.mission || { text: { vi: '', en: '' }, constituents: [] },
    peos: oldData.peos || [],
    sos: oldData.sos || [],
    courses: oldData.courses || [],
    peoSoMap: oldData.peoSoMap || [],
    peoConstituentMap: oldData.peoConstituentMap || [],
    courseSoMap: oldData.courseSoMap || [],
    coursePiMap: oldData.coursePiMap || [],
    coursePeoMap: oldData.coursePeoMap || [],
    loSoMap: oldData.loSoMap || [],
    peoPloMap: oldData.peoPloMap || []
  };

  // 4. Đóng gói dữ liệu dùng chung toàn trường (Global State / Catalogs)
  const globalState = {
    geminiConfig: oldData.geminiConfig || {},
    teachingMethods: oldData.teachingMethods || [],
    assessmentMethods: oldData.assessmentMethods || [],
    knowledgeAreas: oldData.knowledgeAreas || [],
    facultyTitles: oldData.facultyTitles || {},
    academicSchools: oldData.academicSchools || [],
    academicFaculties: oldData.academicFaculties || [],
    departments: oldData.departments || [],
    assessmentCategories: oldData.assessmentCategories || [],
    submissionMethods: oldData.submissionMethods || [],
    assessmentTools: oldData.assessmentTools || [],
    finalAssessmentMethods: oldData.finalAssessmentMethods || [],
    activityGroups: oldData.activityGroups || [],
    creditBlocks: oldData.creditBlocks || [],
    library: oldData.library || [],
    facultyDirectory: oldData.faculties || [], // Đổi tên faculties -> facultyDirectory
    courseCatalog: oldData.courses || []       // Backup danh mục môn học
  };

  // 5. Ráp thành AppState mới hoàn chỉnh
  const newState = {
    version: "2.0.0", // Nâng cấp version
    language: oldData.language || "vi",
    authEnabled: oldData.authEnabled || false,
    currentUser: oldData.currentUser || null,
    users: oldData.users || [],
    globalState,
    programs: [programState],
    currentProgramId: programId
  };

  return newState as AppState;
};