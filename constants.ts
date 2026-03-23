
import { AppState } from './types';

export const CODE_VERSION = "1.6.0";

export const TRANSLATIONS = {
  vi: {
    guide: 'Hướng dẫn / Trang chủ',
    strategy: 'Sứ mạng và Mục tiêu',
    outcomes: 'Chuẩn đầu ra (SOs)',
    mapping: 'Môn học - SO - PIs',
    flowchart: 'Sơ đồ',
    syllabus: 'Đề cương',
    faculty: 'Giảng viên',
    facilities: 'Cơ sở vật chất',
    analytics: 'Phân tích chương trình',
    general: 'Thông tin chung',
    transformation: 'Chương trình đào tạo',
    accreditation: 'Kiểm định quốc tế',
    departments: 'Tổ chức (Trường/Khoa)',
    settings: 'Cài đặt',
    users: 'Người dùng',
    logout: 'Đăng xuất',
    welcomeBack: 'Chào mừng trở lại',
    authDescription: 'Vui lòng đăng nhập bằng tài khoản Google của tổ chức để tiếp tục.',
    autoTranslate: 'Dịch tự động',
    mission: 'Sứ mạng',
    alignmentPeoMission: 'Thích ứng PEO - Sứ mạng',
    mappingPeoCourse: 'Ma trận PEO - Môn học',
    addCourse: 'Thêm môn học',
    credits: 'Số TC',
    semester: 'Học kỳ',
    prerequisites: 'Tiên quyết',
    coRequisites: 'Song hành',
    essential: 'Cốt lõi',
    knowledgeArea: 'Khối kiến thức',
    knowledgeAreaTable: 'Bảng Khối kiến thức',
    addArea: 'Thêm Khối',
    filterEssential: 'Lọc môn cốt lõi',
    allCategories: 'Tất cả danh mục',
    clickToCycle: 'Nhấp để xoay vòng mức độ (L -> M -> H)',
    export: 'Xuất',
    soMatrix: 'Ma trận SO',
    piMatrix: 'Ma trận PI',
    catalog: 'Danh mục',
    exportImage: 'Xuất ảnh',
    legendR: 'Bắt buộc',
    legendSE: 'Tự chọn định hướng',
    legendE: 'Tự chọn tự do',
    prereqLegend: 'Tiên quyết',
    postreqLegend: 'Học sau',
    employmentType: 'Loại hình',
    classesTaught: 'Các lớp giảng dạy',
    fullTime: 'Cơ hữu',
    partTime: 'Thỉnh giảng',
    instructorSelect: 'Chọn giảng viên',
    textbook: 'Học liệu bắt buộc',
    typeTextbook: 'Học liệu bắt buộc',
    typeReference: 'Học liệu không bắt buộc',
    assessment: 'Đánh giá',
    assessmentMethods: 'Phương pháp đánh giá',
    totalWeight: 'Tổng trọng số',
    clos: 'Chuẩn đầu ra học phần (CLOs)',
    cloRelationship: 'Quan hệ CLO',
    teachingMethodology: 'Phương pháp giảng dạy',
    assessmentType: 'Hình thức',
    levelOfCoverage: 'Mức độ',
    assessmentConfig: 'Kiểm tra - Đánh giá',
    materialsSpecific: 'Cụ thể',
    criteriaDescription: 'Mô tả',
    criteriaRubric: 'Rubric',
    assessmentTypeTheory: 'Lý thuyết / Lý thuyết + Thực hành',
    assessmentTypePractice: 'Thực hành',
    assessmentTypeProject: 'Đồ án / Bài tập lớn',
    processAssessment: 'Kiểm tra – đánh giá quá trình',
    courseObjectives: 'Mục tiêu của học phần',
    generalObjectives: 'Mục tiêu chung',
    specificObjectives: 'Mục tiêu cụ thể',
    knowledge: 'Kiến thức',
    skills: 'Kỹ năng',
    responsibility: 'Năng lực tự chủ và trách nhiệm',
    finalExam: 'Điểm thi kết thúc học phần',
    attendanceWeight: 'Điểm chuyên cần',
    participationWeight: 'Điểm thảo luận/Semina/Bài tập',
    midtermWeight: 'Điểm giữa kỳ',
    finalProcessWeight: 'Điểm cuối kỳ (quá trình)',
    selfStudyWeight: 'Điểm tự học/nghiên cứu',
    finalExamForm: 'Hình thức thi',
    finalExamDuration: 'Thời lượng thi (phút)',
    finalExamAllowMaterials: 'Được tham khảo tài liệu',
    practiceCriteria: 'Tiêu chí đánh giá thực hành',
    projectCriteria: 'Tiêu chí đánh giá đồ án/BTL',
    addPracticeItem: 'Thêm bài thực hành',
    practiceTask: 'Bài thực hành',
    weight: 'Trọng số',
    syllabusTab: 'Đề cương',
    library: 'Thư viện',
    libraryTab: 'Thư viện',
    configSyllabus: 'Cấu hình',
    searchLibrary: 'Tìm kiếm thư viện',
    createResource: 'Tạo tài liệu',
    addToCourse: 'Thêm vào môn',
    amountOfTime: 'Thời lượng',
    contentNo: 'STT',
    hours: 'giờ',
    courseTopicsSchedule: 'Nội dung & Thời khóa',
    missingHours: 'Thiếu',
    conversionFactor: 'Hệ số quy đổi',
    teachingMethods: 'Phương pháp giảng dạy',
    security: 'Bảo mật',
    authRequirement: 'Yêu cầu xác thực',
    authEnabledDesc: 'Người dùng phải đăng nhập bằng tài khoản Google (Email trong Whitelist) để truy cập.',
    authDisabledDesc: 'Bất kỳ ai có liên kết đều có thể truy cập và chỉnh sửa dữ liệu.',
    userManagement: 'Quản lý người dùng',
    userName: 'Tên người dùng',
    userRole: 'Vai trò',
    lastActive: 'Hoạt động cuối',
    demoteToUser: 'Hạ xuống User',
    promoteToAdmin: 'Thăng lên Admin',
    deleteUser: 'Xóa người dùng',
    peoSoMatrix: 'Ma trận PEO - SO',
    percentile: 'Tỷ lệ',
    description: 'Mô tả',
    aiPdfImport: 'Nhập AI PDF',
    roomCode: 'Mã phòng',
    roomName: 'Tên phòng',
    usage: 'Chức năng giảng dạy',
    addFacility: 'Thêm phòng',
    addDepartment: 'Thêm Bộ môn',
    addFaculty: 'Thêm Khoa',
    addSchool: 'Thêm Trường',
    departmentCode: 'Mã bộ môn',
    departmentName: 'Tên bộ môn',
    assignCourses: 'Gán môn học',
    manageDepartments: 'Cơ cấu Tổ chức',
    schoolEntity: 'Trường (School)',
    facultyEntity: 'Khoa (Faculty)',
    departmentEntity: 'Bộ môn (Dept)'
  },
  en: {
    guide: 'Guide / Home',
    strategy: 'Strategy',
    outcomes: 'Outcomes (SOs)',
    mapping: 'Mapping',
    flowchart: 'Flowchart',
    syllabus: 'Syllabus',
    faculty: 'Faculty',
    facilities: 'Facilities',
    analytics: 'Analytics',
    general: 'General Info',
    transformation: 'Curriculum Program',
    accreditation: 'Accreditation',
    departments: 'Organization',
    settings: 'Settings',
    users: 'Users',
    logout: 'Logout',
    welcomeBack: 'Welcome Back',
    authDescription: 'Please sign in with your organizational Google account to continue.',
    autoTranslate: 'Auto Translate',
    mission: 'Mission',
    alignmentPeoMission: 'PEO - Mission Alignment',
    mappingPeoCourse: 'PEO - Course Mapping',
    addCourse: 'Add Course',
    credits: 'Credits',
    semester: 'Semester',
    prerequisites: 'Prerequisites',
    coRequisites: 'Co-requisites',
    essential: 'Essential',
    knowledgeArea: 'Knowledge Area',
    knowledgeAreaTable: 'Knowledge Areas',
    addArea: 'Add Area',
    filterEssential: 'Filter Essential',
    allCategories: 'All Categories',
    clickToCycle: 'Click to cycle (L -> M -> H)',
    export: 'Export',
    soMatrix: 'SO Matrix',
    piMatrix: 'PI Matrix',
    catalog: 'Catalog',
    exportImage: 'Export Image',
    legendR: 'Required',
    legendSE: 'Selected Elective',
    legendE: 'Elective',
    prereqLegend: 'Prerequisite',
    postreqLegend: 'Post-requisite',
    employmentType: 'Employment Type',
    classesTaught: 'Classes Taught',
    fullTime: 'Full Time',
    partTime: 'Part Time',
    instructorSelect: 'Select Instructor',
    textbook: 'Required Material',
    typeTextbook: 'Required Material',
    typeReference: 'Optional Material',
    assessment: 'Assessment',
    assessmentMethods: 'Assessment Methods',
    totalWeight: 'Total Weight',
    clos: 'Course Learning Outcomes (CLOs)',
    cloRelationship: 'CLO Relationship',
    teachingMethodology: 'Teaching Methodology',
    assessmentType: 'Type',
    levelOfCoverage: 'Level',
    assessmentConfig: 'Assessment',
    materialsSpecific: 'Specific',
    criteriaDescription: 'Description',
    criteriaRubric: 'Rubric',
    assessmentTypeTheory: 'Theory / Theory + Practice',
    assessmentTypePractice: 'Practice',
    assessmentTypeProject: 'Project / Assignment',
    processAssessment: 'Process Assessment',
    courseObjectives: 'Course Objectives',
    generalObjectives: 'General Objectives',
    specificObjectives: 'Specific Objectives',
    knowledge: 'Knowledge',
    skills: 'Skills',
    responsibility: 'Autonomy and Responsibility',
    finalExam: 'Final Exam',
    attendanceWeight: 'Attendance',
    participationWeight: 'Participation/Seminar/Exercises',
    midtermWeight: 'Midterm Exam',
    finalProcessWeight: 'Final Process Score',
    selfStudyWeight: 'Self-study/Research',
    finalExamForm: 'Exam Form',
    finalExamDuration: 'Duration (mins)',
    finalExamAllowMaterials: 'Materials Allowed',
    practiceCriteria: 'Practice Evaluation Criteria',
    projectCriteria: 'Project Evaluation Criteria',
    addPracticeItem: 'Add Practice Item',
    practiceTask: 'Practice Task',
    weight: 'Weight',
    syllabusTab: 'Syllabus',
    library: 'Library',
    libraryTab: 'Library',
    configSyllabus: 'Configuration',
    searchLibrary: 'Search Library',
    createResource: 'Create Resource',
    addToCourse: 'Add to Course',
    amountOfTime: 'Amount of Time',
    contentNo: 'No.',
    hours: 'hours',
    courseTopicsSchedule: 'Course Topics & Schedule',
    missingHours: 'Missing',
    conversionFactor: 'Conversion Factor',
    teachingMethods: 'Teaching Methods',
    security: 'Security',
    authRequirement: 'Authentication Requirement',
    authEnabledDesc: 'Users must sign in with a Google account (Whitelisted Email) to access.',
    authDisabledDesc: 'Anyone with the link can access and edit the data.',
    userManagement: 'User Management',
    userName: 'User Name',
    userRole: 'Role',
    lastActive: 'Last Active',
    demoteToUser: 'Demote to User',
    promoteToAdmin: 'Promote to Admin',
    deleteUser: 'Delete User',
    peoSoMatrix: 'PEO - SO Matrix',
    percentile: 'Percentile',
    description: 'Description',
    aiPdfImport: 'AI PDF Import',
    roomCode: 'Room Code',
    roomName: 'Room Name',
    usage: 'Usage / Teaching Function',
    addFacility: 'Add Facility',
    addDepartment: 'Add Department',
    addFaculty: 'Add Faculty',
    addSchool: 'Add School',
    departmentCode: 'Dept. Code',
    departmentName: 'Department Name',
    assignCourses: 'Assign Courses',
    manageDepartments: 'Organization Structure',
    schoolEntity: 'School',
    facultyEntity: 'Faculty',
    departmentEntity: 'Department'
  }
};

export const INITIAL_STATE: AppState = {
  version: CODE_VERSION,
  language: 'vi',
  authEnabled: false,
  currentUser: null,
  users: [
    {
      id: "u1",
      email: "anhquanghb@gmail.com",
      name: "Anh Quang (Admin)",
      role: "ADMIN",
      lastLogin: "2026-01-09T06:37:49.724Z",
      avatar: "https://lh3.googleusercontent.com/a/ACg8ocIPzY3X5gyCVtmlXNYtIRGyzwAWZgQX1lOq2IyZF_LXXYMTYNH2nw=s96-c"
    },
    {
      id: "u2",
      email: "lecturer@university.edu.vn",
      name: "Giảng viên Mẫu",
      role: "USER",
      lastLogin: "2026-01-06T06:05:04.093Z",
      avatar: "https://ui-avatars.com/api/?name=Lecturer&background=10b981&color=fff"
    }
  ],
  geminiConfig: {
    model: 'gemini-3-flash-preview',
    prompts: {
      translation: 'Translate this text to {targetLanguage}: {text}',
      courseTranslation: 'Translate these course names to {targetLanguage}: {items}',
      audit: 'Audit the curriculum matrix for gaps: {data}',
      consistency: 'Check consistency between CLOs and SOs: {data}',
      syllabusAnalysis: 'Analyze this syllabus PDF and extract structured data: {structure}',
      courseCatalogAnalysis: 'Analyze this course catalog PDF and extract courses: {structure}',
      programAnalysis: 'Analyze this program specification PDF and extract general info, mission, PEOs, SOs, etc.'
    }
  },
  teachingMethods: [
    { "id": "tm1", "code": "LEC", "name": { "vi": "Nghe giảng lý thuyết", "en": "Lecture" }, "description": { "vi": "Giảng viên trình bày các khái niệm lý thuyết.", "en": "Instructor presents theoretical concepts." }, "hoursPerCredit": 15, "category": "THEORY", "hoursConfig": { "study": 15, "review": 1, "exam": "1~2" }, "category2": "THEORY" },
    { "id": "tm2", "code": "SLF", "name": { "vi": "Tự học, tự nghiên cứu", "en": "Self-study and Research" }, "description": { "vi": "Tự học theo những yêu cầu cụ thể.", "en": "Self-study based on specific requirements." }, "hoursPerCredit": 30, "category": "PRACTICE", "hoursConfig": { "study": 32, "review": 0, "exam": 0 }, "category2": "SELF_STUDY" },
    { "id": "tm3", "code": "EXE", "name": { "vi": "Bài tập", "en": "Exercises" }, "description": { "vi": "Giải quyết các bài tập kỹ thuật để củng cố kiến thức.", "en": "Solving technical exercises to consolidate knowledge." }, "hoursPerCredit": 30, "category": "PRACTICE", "hoursConfig": { "study": 15, "review": 1, "exam": "1~2" }, "category2": "EXERCISE" },
    { "id": "tm4", "code": "DIS", "name": { "vi": "Thảo luận", "en": "Discussion" }, "description": { "vi": "Trao đổi, thảo luận nhóm về chủ đề.", "en": "Group exchange and discussion on topics." }, "hoursPerCredit": 30, "category": "PRACTICE", "hoursConfig": { "study": 15, "review": 1, "exam": "1~2" }, "category2": "GROUP_DISCUSSION" },
    { "id": "tm5", "code": "LAB", "name": { "vi": "Thực hành", "en": "Laboratory / Practice" }, "description": { "vi": "Sinh viên thực hiện thí nghiệm hoặc thực hành tại xưởng.", "en": "Students perform experiments or practical tasks in the workshop." }, "hoursPerCredit": 30, "category": "PRACTICE", "hoursConfig": { "study": 30, "review": 2, "exam": "1~2" }, "category2": "PRACTICE_LAB_INTERNSHIP" },
    { "id": "tm6", "code": "INT", "name": { "vi": "Thực tập tại cơ sở", "en": "Internship" }, "description": { "vi": "Sinh viên trực tiếp làm việc tại các cơ quan, doanh nghiệp để vận dụng kiến thức vào môi trường thực tế.", "en": "Students work at organizations or companies to apply theoretical knowledge to professional practice." }, "hoursPerCredit": 50, "category": "PRACTICE", "category2": "PRACTICE_LAB_INTERNSHIP" },
    { "id": "tm7", "code": "ESS", "name": { "vi": "Tiểu luận", "en": "Essay / Term Paper" }, "description": { "vi": "Người học nghiên cứu và viết báo cáo ngắn về một vấn đề cụ thể thuộc phạm vi một môn học.", "en": "A short research paper focused on a specific topic within the scope of a single course." }, "hoursPerCredit": 50, "category": "PRACTICE", "category2": "SELF_STUDY" },
    { "id": "tm8", "code": "ASG", "name": { "vi": "Bài tập lớn", "en": "Major Assignment" }, "description": { "vi": "Giải quyết một yêu cầu phức tạp hoặc tổng hợp kiến thức của toàn môn học thông qua một nhiệm vụ cụ thể.", "en": "A comprehensive task that requires students to synthesize knowledge from an entire course to solve a problem." }, "hoursPerCredit": 50, "category": "PRACTICE", "category2": "SELF_STUDY" },
    { "id": "tm9", "code": "PRJ", "name": { "vi": "Đồ án", "en": "Project" }, "description": { "vi": "Thiết kế, tính toán hoặc xây dựng một sản phẩm, giải pháp kỹ thuật dựa trên các cơ sở lý thuyết đã học.", "en": "A practical assignment involving the design, calculation, or creation of a technical solution or product." }, "hoursPerCredit": 50, "category": "PRACTICE", "category2": "SELF_STUDY" },
    { "id": "tm10", "code": "THE", "name": { "vi": "Khóa luận", "en": "Thesis" }, "description": { "vi": "Thực hiện công trình nghiên cứu độc lập và chuyên sâu về một đề tài cụ thể để kết thúc chương trình đại học.", "en": "An independent, in-depth research study conducted by students as a final requirement for their degree." }, "hoursPerCredit": 50, "category": "PRACTICE", "category2": "SELF_STUDY" },
    { "id": "tm11", "code": "SEM", "name": { "vi": "Semina", "en": "Seminar" }, "description": { "vi": "Sinh viên chuẩn bị và trình bày về một chủ đề chuyên sâu.", "en": "Students prepare and present on an in-depth topic." }, "hoursPerCredit": 30, "category": "PRACTICE", "category2": "GROUP_DISCUSSION" },
    { "id": "tm12", "code": "CAS", "name": { "vi": "Nghiên cứu tình huống", "en": "Case Study" }, "description": { "vi": "Phân tích các tình huống thực tế để rút ra bài học.", "en": "Analyze real-world situations to draw lessons." }, "hoursPerCredit": 30, "category": "PRACTICE", "category2": "GROUP_DISCUSSION" },
    { "id": "tm13", "code": "PBL", "name": { "vi": "Học tập dựa trên vấn đề", "en": "Problem-Based Learning" }, "description": { "vi": "Học thông qua việc giải quyết các vấn đề mở.", "en": "Learning through solving open-ended problems." }, "hoursPerCredit": 30, "category": "PRACTICE", "category2": "GROUP_DISCUSSION" },
    { "id": "tm14", "code": "PJB", "name": { "vi": "Học tập dựa trên dự án", "en": "Project-Based Learning" }, "description": { "vi": "Học thông qua việc thực hiện các dự án dài hạn.", "en": "Learning through long-term projects." }, "hoursPerCredit": 30, "category": "PRACTICE", "category2": "SELF_STUDY" }
  ],
  assessmentMethods: [
    { id: 'am1', name: { vi: 'Chuyên cần', en: 'Attendance' } },
    { id: 'am2', name: { vi: 'Thái độ tham gia thảo luận, Semina, Bài tập', en: 'Participation in discussions, seminars, and exercises.' } },
    { id: 'am3', name: { vi: 'Kiểm tra thường xuyên / Quiz', en: 'Regular Quiz / Test' } },
    { id: 'am4', name: { vi: 'Kiểm tra giữa kỳ', en: 'Midterm Exam' } },
    { id: 'am5', name: { vi: 'Thi kết thúc học phần', en: 'Final Exam' } },
    { id: 'am6', name: { vi: 'Tiểu luận / Báo cáo', en: 'Essay / Report' } },
    { id: 'am7', name: { vi: 'Đồ án / Bài tập lớn', en: 'Project / Major Assignment' } },
    { id: 'am8', name: { vi: 'Đánh giá tự học, tự nghiên cứu', en: 'Self-study and research assessment' } },
    { id: 'am9', name: { vi: 'Vấn đáp', en: 'Oral Exam' } },
    { id: 'am10', name: { vi: 'Thực hành / Thí nghiệm', en: 'Practical / Lab work' } }
  ],
  mission: {
    text: {
      vi: "Sứ mạng của Trường Kỹ thuật và Công nghệ tại Đại học ABC là cam kết cung cấp cho người học những kiến thức, kỹ năng và khả năng thích ứng cần thiết cho công việc chuyên môn và nghiên cứu trong lĩnh vực kỹ thuật và công nghệ, qua đó đáp ứng nhu cầu nhân lực của địa phương và toàn cầu.",
      en: "The mission of the School of Engineering and Technology at ABC University is to commit to providing graduates with the necessary knowledge, skills, and adaptability for professional and research works in the field of engineering and technology, thereby fulfilling both global and local workforce demands."
    },
    constituents: [
      { id: 'mc1', description: { vi: "Kiến thức chuyên môn", en: "Professional knowledge" } },
      { id: 'mc2', description: { vi: "Kỹ năng thực hành", en: "Practical skills" } },
      { id: 'mc3', description: { vi: "Khả năng thích ứng", en: "Adaptability" } },
      { id: 'mc4', description: { vi: "Nghiên cứu kỹ thuật", en: "Engineering research" } }
    ]
  },
  knowledgeAreas: [
    { id: 'math_sci', name: { vi: 'Toán & KHTN', en: 'Math & Basic Sciences' }, color: 'blue' },
    { id: 'fund_eng', name: { vi: 'Cơ sở ngành Kỹ thuật', en: 'Fundamental Engineering' }, color: 'indigo' },
    { id: 'adv_eng', name: { vi: 'Chuyên ngành Kỹ thuật', en: 'Advanced Engineering' }, color: 'purple' },
    { id: 'gen_ed', name: { vi: 'Giáo dục Đại cương', en: 'General Education' }, color: 'green' },
    { id: 'other', name: { vi: 'Khác', en: 'Other' }, color: 'slate' }
  ],
  facultyTitles: {
    ranks: [
      { id: 'r1', name: { vi: 'Giảng viên', en: 'Lecturer' } },
      { id: 'r2', name: { vi: 'Giảng viên cao cấp', en: 'Senior Lecturer' } },
      { id: 'r3', name: { vi: 'Trợ giảng', en: 'Teaching Assistant' } }
    ],
    degrees: [
      { id: 'd1', name: { vi: 'Tiến sĩ', en: 'Ph.D' } },
      { id: 'd2', name: { vi: 'Thạc sĩ', en: 'Master' } },
      { id: 'd3', name: { vi: 'Kỹ sư', en: 'Engineer' } },
      { id: 'd4', name: { vi: 'Cử nhân', en: 'Bachelor' } }
    ],
    academicTitles: [
      { id: 'at1', name: { vi: 'Không', en: 'None' } },
      { id: 'at2', name: { vi: 'Giáo sư', en: 'Professor' } },
      { id: 'at3', name: { vi: 'Phó giáo sư', en: 'Associate Professor' } }
    ],
    positions: [
      { id: 'p1', name: { vi: 'Giảng viên', en: 'Faculty Member' } },
      { id: 'p2', name: { vi: 'Trưởng khoa', en: 'Dean' } },
      { id: 'p3', name: { vi: 'Phó trưởng khoa', en: 'Vice Dean' } },
      { id: 'p4', name: { vi: 'Trưởng bộ môn', en: 'Head of Department' } }
    ]
  },
  academicSchools: [
    { id: 'sch_set', code: 'SET', name: { vi: 'Trường Kỹ thuật & Công nghệ', en: 'School of Engineering & Technology' } }
  ],
  academicFaculties: [
    { id: 'fac_eee', code: 'FEEE', name: { vi: 'Khoa Điện - Điện tử', en: 'Faculty of Electrical - Electronic Engineering' }, schoolId: 'sch_set' },
    { id: 'fac_it', code: 'FIT', name: { vi: 'Khoa Công nghệ Thông tin', en: 'Faculty of Information Technology' }, schoolId: 'sch_set' }
  ],
  departments: [
    { id: 'dept_ee', code: 'EE', name: { vi: 'Bộ môn Điện - Điện tử', en: 'Department of Electrical & Electronics' }, academicFacultyId: 'fac_eee' },
    { id: 'dept_it', code: 'IT', name: { vi: 'Bộ môn Công nghệ Thông tin', en: 'Department of Information Technology' }, academicFacultyId: 'fac_it' },
    { id: 'dept_bs', code: 'BS', name: { vi: 'Bộ môn Khoa học Cơ bản', en: 'Department of Basic Sciences' }, academicFacultyId: 'fac_eee' }
  ],
  peos: [
    { id: 'peo1', code: 'PEO-1', title: { en: 'Dynamic & Creative Solutions', vi: 'Giải pháp Năng động & Sáng tạo' }, description: { en: 'Apply dynamic and creative approaches to solve engineering problems.', vi: 'Áp dụng các cách tiếp cận năng động và sáng tạo để giải quyết vấn đề kỹ thuật.' } },
    { id: 'peo2', code: 'PEO-2', title: { en: 'Effective & Ethical Contribution', vi: 'Đóng góp Hiệu quả & Đạo đức' }, description: { en: 'Contribute effectively and ethically to society.', vi: 'Đóng góp hiệu quả và có đạo đức cho xã hội.' } },
    { id: 'peo3', code: 'PEO-3', title: { en: 'Lifelong Learning & Innovation', vi: 'Học tập suốt đời & Đổi mới' }, description: { en: 'Lead innovation through lifelong learning.', vi: 'Dẫn đầu sự đổi mới thông qua học tập suốt đời.' } },
    { id: 'peo4', code: 'PEO-4', title: { en: 'Global Citizenship', vi: 'Công dân Toàn cầu' }, description: { en: 'Act as a responsible global citizen.', vi: 'Đóng góp tích cực và có trách nhiệm như một công dân toàn cầu.' } },
  ],
  sos: [
    { id: 'so1', number: 1, code: 'SO-1', description: { en: 'An ability to identify, formulate, and solve complex engineering problems by applying principles of engineering, science, and mathematics.', vi: 'Khả năng xác định, diễn đạt và giải quyết các vấn đề kỹ thuật phức tạp bằng cách áp dụng các nguyên lý kỹ thuật, khoa học và toán học.' }, pis: [
      { id: 'pi1.1', code: '1.1', description: { en: 'Ability to identify a complex engineering problem by using scientific principles.', vi: 'Khả năng xác định vấn đề kỹ thuật phức tạp bằng cách sử dụng các nguyên lý khoa học.' } },
      { id: 'pi1.2', code: '1.2', description: { en: 'Ability to develop a hardware/software/math model for a complex engineering problem.', vi: 'Khả năng phát triển mô hình phần cứng/phần mềm/toán học cho một vấn đề kỹ thuật phức tạp.' } }
    ] },
    { id: 'so2', number: 2, code: 'SO-2', description: { en: 'An ability to apply engineering design to produce solutions that meet specified needs with consideration of public health, safety, and welfare, as well as global, cultural, social, environmental, and economic factors.', vi: 'Khả năng áp dụng thiết kế kỹ thuật để tạo ra các giải pháp đáp ứng nhu cầu cụ thể với sự cân nhắc đến sức khỏe cộng đồng, an toàn, và phúc lợi, cũng như các yếu tố toàn cầu, văn hóa, xã hội, môi trường và kinh tế.' }, pis: [
      { id: 'pi2.1', code: '2.1', description: { en: 'Ability to recognize and distinguish important real-world constraints for a particular design or design component.', vi: 'Khả năng nhận biết và phân biệt các ràng buộc thực tế quan trọng cho một thiết kế hoặc thành phần thiết kế cụ thể.' } },
      { id: 'pi2.2', code: '2.2', description: { en: 'Ability to translate practical quantitative constraints to appropriate design parameters.', vi: 'Khả năng chuyển đổi các ràng buộc định lượng thực tế thành các thông số thiết kế phù hợp.' } }
    ] },
    { id: 'so3', number: 3, code: 'SO-3', description: { vi: 'Khả năng giao tiếp hiệu quả.', en: 'Effective communication ability.' }, pis: [] },
    { id: 'so4', number: 4, code: 'SO-4', description: { vi: 'Khả năng nhận biết trách nhiệm đạo đức.', en: 'Ethical responsibility awareness.' }, pis: [] },
    { id: 'so5', number: 5, code: 'SO-5', description: { vi: 'Khả năng làm việc nhóm.', en: 'Teamwork ability.' }, pis: [] },
    { id: 'so6', number: 6, code: 'SO-6', description: { vi: 'Khả năng thực nghiệm.', en: 'Experimental ability.' }, pis: [] },
    { id: 'so7', number: 7, code: 'SO-7', description: { vi: 'Khả năng học tập suốt đời.', en: 'Lifelong learning ability.' }, pis: [] }
  ],
  courses: [
    { 
      id: '346', 
      code: 'EE 346', 
      name: { vi: 'Thực tập nhận thức', en: 'Awareness Internship' }, 
      credits: 2, 
      isEssential: true, 
      type: 'REQUIRED', 
      knowledgeAreaId: 'adv_eng', 
      departmentId: 'dept_ee', // Assigned to EE
      semester: 1, 
      colIndex: 0, 
      prerequisites: [], 
      coRequisites: [],
      description: { 
        vi: 'Khóa học là một hoạt động quan trọng đối với sinh viên Kỹ thuật Điện và Điện tử. Nó được thiết kế để mang lại cho họ cái nhìn toàn diện và thực tế về môi trường làm việc và các lĩnh vực ứng dụng khác nhau trong lĩnh vực của họ.', 
        en: 'The course is a crucial activity for Electrical and Electronic Engineering students. It\'s designed to give them a comprehensive and practical insight into the working environment and the various application areas of their field.' 
      }, 
      textbooks: [
        { resourceId: 'lib1', title: 'Internship Guidelines', author: 'Faculty of EEE', publisher: 'DTU', year: '2024', type: 'reference', url: '' }
      ], 
      clos: { 
        vi: [
          'Mô tả các trách nhiệm đạo đức và chuyên môn cần thiết trong môi trường làm việc Kỹ thuật Điện và Điện tử.',
          'Xác định và mô tả các công nghệ, thiết bị, sản phẩm và giải pháp tiêu biểu hiện đang được áp dụng trong lĩnh vực thực tế.',
          'Áp dụng kiến thức và kinh nghiệm thực tế để đánh giá yêu cầu công việc, từ đó định hình các mục tiêu nghề nghiệp và lộ trình phát triển trong tương lai.',
          'So sánh các kỹ thuật, công nghệ hoặc quy trình sản xuất khác nhau được quan sát trong kỳ thực tập.',
          'Trình bày rõ ràng và mạch lạc những kiến thức và kinh nghiệm thu được từ kỳ thực tập, sử dụng các công cụ hỗ trợ phù hợp.'
        ], 
        en: [
          'Describe the ethical and professional responsibilities required in the Electrical and Electronic Engineering work environment.',
          'Identify and describe typical technologies, equipment, products, and solutions currently applied in the practical field of Electrical and Electronic Engineering.',
          'Apply practical knowledge and experience to assess job requirements, thereby shaping personal career goals and development paths for the future.',
          'Compare different techniques, technologies, or production processes observed during the internship, and evaluate the advantages and disadvantages of each method.',
          'Clearly and coherently present the knowledge and experience gained from the internship, utilizing appropriate supporting tools.'
        ] 
      }, 
      topics: [
        { 
          id: 't1', 
          no: 'CONT.1', 
          topic: { vi: 'Tham quan và tìm hiểu về cơ cấu tổ chức...', en: 'Visit and learn about the organizational structure...' },
          activities: [
            { methodId: 'tm4', hours: 10 }
          ],
          readingRefs: []
        },
        { 
          id: 't2', 
          no: 'CONT.2', 
          topic: { vi: 'Tương tác với các kỹ sư...', en: 'Interact with engineers...' },
          activities: [
            { methodId: 'tm4', hours: 10 }
          ],
          readingRefs: []
        }
      ],
      assessmentPlan: [
        { id: 'a1', methodId: 'am1', type: { vi: 'Chuyên cần', en: 'Attendance' }, percentile: 30 },
        { id: 'a2', methodId: 'am7', type: { vi: 'Đồ án cá nhân', en: 'Individual Project' }, percentile: 70 }
      ],
      assessmentConfigType: 'THEORY',
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
          finalExamForms: [],
          regularTests: []
      },
      practiceAssessmentConfig: {
          criteriaType: 'DESCRIPTION',
          criteria: '',
          rubric: { levels: [], criteria: [] },
          items: []
      },
      projectAssessmentConfig: {
          criteriaType: 'DESCRIPTION',
          criteria: '',
          rubric: { levels: [], criteria: [] }
      },
      scheduleNumWeeks: 15,
      schedule: [],
      teachingMethodsDescription: { vi: '', en: '' },
      coursePolicies: { vi: '', en: '' },
      classOrganizationForm: { vi: '', en: '' },
      instructorIds: ['f1'],
      instructorDetails: {
        'f1': { classInfo: '', isMain: true }
      },
      cloMap: []
    },
    { 
      id: '200', 
      code: 'EE 200', 
      name: { vi: 'Mạch điện I', en: 'Electric Circuits I' }, 
      credits: 3, 
      isEssential: true, 
      type: 'REQUIRED', 
      knowledgeAreaId: 'fund_eng', 
      departmentId: 'dept_ee', // Assigned to EE
      semester: 3, 
      colIndex: 0, 
      prerequisites: [], 
      coRequisites: [],
      description: { 
        vi: 'Khóa học giới thiệu các khái niệm cơ bản về mạch điện, định luật Kirchhoff, các phương pháp phân tích mạch DC và AC cơ bản.', 
        en: 'This course introduces basic concepts of electric circuits, Kirchhoff\'s laws, and fundamental methods of DC and AC circuit analysis.' 
      }, 
      textbooks: [], 
      clos: { vi: [], en: [] }, 
      topics: [],
      assessmentPlan: [],
      assessmentConfigType: 'THEORY',
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
          finalExamForms: [],
          regularTests: []
      },
      practiceAssessmentConfig: {
          criteriaType: 'DESCRIPTION',
          criteria: '',
          rubric: { levels: [], criteria: [] },
          items: []
      },
      projectAssessmentConfig: {
          criteriaType: 'DESCRIPTION',
          criteria: '',
          rubric: { levels: [], criteria: [] }
      },
      scheduleNumWeeks: 15,
      schedule: [],
      teachingMethodsDescription: { vi: '', en: '' },
      coursePolicies: { vi: '', en: '' },
      classOrganizationForm: { vi: '', en: '' },
      instructorIds: [],
      instructorDetails: {},
      cloMap: []
    },
    { 
      id: '252', 
      code: 'EE 252', 
      name: { vi: 'Mạch điện II', en: 'Electric Circuits II' }, 
      credits: 3, 
      isEssential: true, 
      type: 'REQUIRED', 
      knowledgeAreaId: 'fund_eng', 
      departmentId: 'dept_ee', // Assigned to EE
      semester: 4, 
      colIndex: 0, 
      prerequisites: ['EE 200'], 
      coRequisites: [],
      description: { 
        vi: 'Khóa học nâng cao về phân tích mạch điện, bao gồm mạch ba pha, mạng hai cổng, và đáp ứng tần số.', 
        en: 'Advanced course on electric circuit analysis, including three-phase circuits, two-port networks, and frequency response.' 
      }, 
      textbooks: [], 
      clos: { vi: [], en: [] }, 
      topics: [],
      assessmentPlan: [],
      assessmentConfigType: 'THEORY',
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
          finalExamForms: [],
          regularTests: []
      },
      practiceAssessmentConfig: {
          criteriaType: 'DESCRIPTION',
          criteria: '',
          rubric: { levels: [], criteria: [] },
          items: []
      },
      projectAssessmentConfig: {
          criteriaType: 'DESCRIPTION',
          criteria: '',
          rubric: { levels: [], criteria: [] }
      },
      scheduleNumWeeks: 15,
      schedule: [],
      teachingMethodsDescription: { vi: '', en: '' },
      coursePolicies: { vi: '', en: '' },
      classOrganizationForm: { vi: '', en: '' },
      instructorIds: [],
      instructorDetails: {},
      cloMap: []
    }
  ],
  library: [
    { id: 'lib1', title: 'Internship Guidelines', author: 'Faculty of EEE', publisher: 'DTU', year: '2024', type: 'reference', isEbook: true, isPrinted: true, url: '' }
  ],
  assessmentCategories: [
    { id: 'EXERCISE', vi: 'Bài tập', en: 'Exercise' },
    { id: 'DISCUSSION', vi: 'Thảo luận', en: 'Discussion' },
    { id: 'SEMINAR', vi: 'Semina', en: 'Seminar' },
    { id: 'ORAL_EXAM', vi: 'Vấn đáp', en: 'Oral Exam' },
    { id: 'PRESENTATION', vi: 'Bài trình chiếu', en: 'Presentation' },
    { id: 'ESSAY', vi: 'Tiểu luận', en: 'Essay' },
    { id: 'EXAM', vi: 'Bài kiểm tra', en: 'Exam' },
    { id: 'MEXAM', vi: 'Kiểm tra giữa kỳ', en: 'Mid-Exam' },
    { id: 'QUIZ', vi: 'Trắc nghiệm', en: 'Quiz/Multiple Choice' },
    { id: 'PROJECT', vi: 'Đồ án/BTL', en: 'Project/Assignment' },
    { id: 'REPORT', vi: 'Báo cáo', en: 'Report' },
    { id: 'OTHER', vi: 'Khác:', en: 'Other:' }
  ],
  submissionMethods: [
    { id: 'HANDWRITTEN', vi: 'Nộp bài viết', en: 'Handwritten submission' },
    { id: 'PRINTED', vi: 'Nộp bài in', en: 'Printed submission' },
    { id: 'EMAIL', vi: 'Nộp qua email', en: 'Email submission' },
    { id: 'LMS', vi: 'Nộp qua LMS', en: 'LMS submission' },
    { id: 'DIRECT', vi: 'Nộp trực tiếp', en: 'Direct submission' },
    { id: 'NO', vi: 'Không nộp bài', en: 'No submission' },
    { id: 'OTHER', vi: 'Khác:', en: 'Other:' }
  ],
  assessmentTools: [
    { id: 'HANDWRITTEN', vi: 'Viết tay', en: 'Handwritten' },
    { id: 'COMPUTER', vi: 'Trên máy tính', en: 'On computer' },
    { id: 'PAPER', vi: 'Giấy thi', en: 'Exam paper' },
    { id: 'SOFTWARE', vi: 'Phần mềm chuyên dụng', en: 'Specialized software' },
    { id: 'ONSITE', vi: 'Tổ chức tại lớp', en: 'On site' },
    { id: 'GOOGLE_FORM', vi: 'Google Form', en: 'Google Form' },
    { id: 'OTHER', vi: 'Khác:', en: 'Other:' }
  ],
  finalAssessmentMethods: [
    { id: 'ESSAY', vi: 'Tự luận', en: 'Essay' },
    { id: 'MULTIPLE_CHOICE', vi: 'Trắc nghiệm', en: 'Multiple choice' },
    { id: 'ORAL_EXAM', vi: 'Vấn đáp', en: 'Oral exam' },
    { id: 'PRACTICE', vi: 'Thực hành', en: 'Practical exam' },
    { id: 'PROJECT', vi: 'Đồ án/Báo cáo', en: 'Project/Report' },
    { id: 'OTHER', vi: 'Khác:', en: 'Other:' }
  ],
  creditBlocks: [
    { id: 'cb1', code: 'THEORY', name: { vi: 'Tín chỉ lý thuyết', en: 'Theory Credit' }, acronym: { vi: 'LT', en: 'THE' } },
    { id: 'cb2', code: 'PRACTICE', name: { vi: 'Tín chỉ thực hành', en: 'Practice Credit' }, acronym: { vi: 'TH', en: 'PRA' } },
    { id: 'cb3', code: 'INTERNSHIP', name: { vi: 'Tín chỉ thực tập', en: 'Internship Credit' }, acronym: { vi: 'TT', en: 'INT'} },
    { id: 'cb4', code: 'PROJECT', name: { vi: 'Tín chỉ đồ án', en: 'Project Credit' }, acronym: { vi: 'ĐA', en: 'PRO' } }
  ],
  activityGroups: [
    { id: 'theory', vi: 'Lý thuyết', en: 'Theory', methodIds: ['tm1'] },
    { id: 'exercise', vi: 'Bài tập', en: 'Exercises', methodIds: ['tm3'] },
    { id: 'discussion', vi: 'Thảo luận nhóm', en: 'Group Discussion', methodIds: ['tm4', 'tm11', 'tm12', 'tm13'] },
    { id: 'practice', vi: 'Thực hành/Thực tập', en: 'Practice', methodIds: ['tm5', 'tm6'] },
    { id: 'self_study', vi: 'Tự học/Đồ án', en: 'Self-study', methodIds: ['tm2', 'tm7', 'tm8', 'tm9', 'tm10', 'tm14'] }
  ],
  faculties: [
    {
      id: 'f1',
      name: { vi: 'Lê Nguyễn Bảo', en: 'Le Nguyen Bao' },
      rank: { vi: 'Giảng viên', en: 'Lecturer' },
      degree: { vi: 'Tiến sĩ', en: 'Ph.D' },
      academicTitle: { vi: 'Phó Giáo sư', en: 'Associate Professor' },
      position: { vi: 'Hiệu trưởng', en: 'Rector' },
      experience: { vi: '20 năm', en: '20 years' },
      careerStartYear: 2004,
      workload: 0,
      employmentType: 'FT',
      email: 'baoln@university.edu.vn',
      tel: '0236.123456',
      cell: '0905.123456',
      office: 'P.702, Tòa nhà trung tâm',
      contactAddress: '123 Nguyễn Văn Linh, Đà Nẵng',
      officeHours: 'Thứ 2, Thứ 4 (8:00 - 10:00)',
      unitId: 'sch_set',
      unitType: 'SCHOOL',
      researchDirections: {
        vi: 'Trí tuệ nhân tạo, Học máy, Xử lý ngôn ngữ tự nhiên.',
        en: 'Artificial Intelligence, Machine Learning, Natural Language Processing.'
      },
      educationList: [
        { id: 'e1', degree: { vi: 'Tiến sĩ', en: 'Ph.D' }, discipline: { vi: 'Khoa học Máy tính', en: 'Computer Science' }, institution: { vi: 'Đại học Tokyo', en: 'University of Tokyo' }, year: '2015' }
      ],
      academicExperienceList: [],
      nonAcademicExperienceList: [],
      publicationsList: [],
      certificationsList: [],
      membershipsList: [],
      honorsList: [],
      serviceActivitiesList: [],
      professionalDevelopmentList: []
    }
  ],
  facilities: [],
  generalInfo: {
    university: { vi: 'Đại học ABC', en: 'ABC University' },
    school: { vi: 'Trường Kỹ thuật & Công nghệ', en: 'School of Engineering & Technology' },
    programName: { vi: 'Kỹ thuật Điện - Điện tử', en: 'Electrical & Electronic Engineering' },
    contact: { vi: '', en: '' },
    history: { vi: '', en: '' },
    deliveryModes: { vi: '', en: '' },
    locations: { vi: '', en: '' },
    academicYear: '2024',
    defaultSubjectCode: 'EE',
    defaultSubjectName: { vi: 'Môn học mới', en: 'New Subject' },
    defaultCredits: 3,
    publicDisclosure: { vi: '', en: '' },
    signerTitle: { vi: 'GIÁM ĐỐC', en: 'DIRECTOR' },
    signerName: 'TS. Lê Nguyễn Bảo',
    city: { vi: 'Đà Nẵng', en: 'Da Nang' },
    previousEvaluations: {
        weaknesses: { vi: '', en: '' },
        actions: { vi: '', en: '' },
        status: { vi: '', en: '' }
    },
    moetInfo: {
        level: { vi: 'Đại học', en: 'Undergraduate' },
        majorName: { vi: 'Kỹ thuật Điện - Điện tử', en: 'Electrical & Electronic Engineering' },
        majorCode: '7520201',
        programName: { vi: 'Chương trình Kỹ thuật Điện - Điện tử Tiên tiến', en: 'Advanced Electrical & Electronic Engineering Program' },
        programCode: 'AEEE-2024',
        specializations: [
            { vi: 'Hệ thống điện', en: 'Electrical Power Systems' },
            { vi: 'Điện tử công nghiệp', en: 'Industrial Electronics' },
            { vi: 'Năng lượng tái tạo', en: 'Renewable Energy' }
        ],
        trainingMode: { vi: 'Chính quy', en: 'Full-time' },
        trainingType: { vi: 'Tập trung', en: 'On-campus' },
        trainingLanguage: { vi: 'Tiếng Việt', en: 'Vietnamese' },
        duration: '4',
        numSemesters: 8,
        trainingOrientation: { vi: 'Định hướng nghề nghiệp', en: 'Professional Orientation' },
        minCredits: 150,
        degreeName: { vi: 'Kỹ sư', en: 'Engineer' },
        legalBasis: { 
          vi: '<p>Căn cứ Thông tư 17/2021/TT-BGDĐT về chuẩn chương trình đào tạo.</p><p>Quyết định số 123/QĐ-ĐHABC về việc ban hành quy định đào tạo.</p>', 
          en: '<p>Based on Circular 17/2021/TT-BGDĐT on training program standards.</p><p>Decision No. 123/QD-DHABC on issuing training regulations.</p>' 
        },
        admissionTarget: { vi: 'Học sinh tốt nghiệp THPT khối A00, A01.', en: 'High school graduates with Group A00, A01.' },
        admissionReq: { vi: 'Xét tuyển theo kết quả thi THPT Quốc gia hoặc học bạ.', en: 'Admission based on National High School Exam results or transcripts.' },
        graduationReq: { vi: 'Tích lũy đủ số tín chỉ, chứng chỉ tiếng Anh B1, chứng chỉ GDQP-AN.', en: 'Accumulate enough credits, English B1 certificate, Defense-Security Education certificate.' },
        gradingScale: { vi: 'Thang điểm 10 và thang điểm 4.', en: '10-point scale and 4-point scale.' },
        implementationGuideline: { vi: 'Thực hiện theo quy chế đào tạo tín chỉ hiện hành.', en: 'Follow current credit-based training regulations.' },
        guidelineFacilities: { vi: 'Sử dụng hệ thống phòng thí nghiệm trọng điểm của Trường.', en: 'Use the University\'s key laboratory system.' },
        guidelineClassForms: { vi: 'Kết hợp học lý thuyết trên lớp và thực hành tại xưởng.', en: 'Combine classroom theory and workshop practice.' },
        guidelineCreditConversion: { vi: '1 tín chỉ tương đương 15 giờ lý thuyết hoặc 30 giờ thực hành.', en: '1 credit equals 15 theory hours or 30 practice hours.' },
        referencedPrograms: { vi: 'Chương trình Kỹ thuật Điện của Đại học Purdue (Hoa Kỳ).', en: 'Electrical Engineering program of Purdue University (USA).' },
        generalObjectives: { 
          vi: 'Đào tạo kỹ sư có kiến thức chuyên môn vững vàng, kỹ năng thực hành tốt và đạo đức nghề nghiệp.', 
          en: 'Train engineers with solid professional knowledge, good practical skills, and professional ethics.' 
        },
        moetSpecificObjectives: [
          { id: 'MSO-1', category: 'knowledge', description: { vi: 'Có kiến thức cơ bản về toán học, khoa học tự nhiên.', en: 'Have basic knowledge of mathematics and natural sciences.' }, peoIds: ['peo1'] },
          { id: 'MSO-2', category: 'skills', description: { vi: 'Có kỹ năng thiết kế và vận hành hệ thống điện.', en: 'Have skills in designing and operating electrical systems.' }, peoIds: ['peo2'] }
        ],
        specificObjectives: [
          { id: 'MO-1', code: '1', description: { vi: 'Kiến thức chuyên môn', en: 'Professional Knowledge' }, soIds: [] },
          { id: 'MO-2', code: '1.1', description: { vi: 'Toán và Khoa học cơ bản', en: 'Math and Basic Sciences' }, soIds: ['so1'] },
          { id: 'MO-3', code: '1.1.1', description: { vi: 'Áp dụng kiến thức toán học để giải quyết vấn đề.', en: 'Apply mathematical knowledge to solve problems.' }, competencyLevel: 'III', soIds: ['so1'] }
        ],
        programStructure: { 
          gen: ['200'], 
          phys: [], 
          fund: ['252'], 
          spec: ['346'], 
          grad: [] 
        },
        subBlocks: [
          {
            id: 'sb-gen-1',
            name: { vi: 'Khối kiến thức chung', en: 'General Knowledge Block' },
            parentBlockId: 'gen',
            type: 'COMPULSORY',
            minCredits: 10,
            courseIds: ['200']
          }
        ],
        courseObjectiveMap: ['200|MO-3', '252|MO-3', '346|MO-3'],
        programFaculty: [
          { id: 'pf-1', fullNameYearPosition: 'Nguyễn Văn A, 1980, Trưởng bộ môn', degreeCountryYear: 'Tiến sĩ, Nhật Bản, 2015', major: 'Kỹ thuật Điện', teachingExperience: '15 năm, Đại học ABC' }
        ]
    }
  },
  courseSoMap: [],
  coursePiMap: [],
  coursePeoMap: [],
  peoSoMap: [],
  peoConstituentMap: [],
  
  // --- NEW RELATIONAL STATE ---
  currentProgramId: 'prog-1',
  globalState: {
    institutionInfo: {
      university: { vi: 'Đại học ABC', en: 'ABC University' },
      school: { vi: 'Trường Kỹ thuật & Công nghệ', en: 'School of Engineering & Technology' },
      contact: { vi: '', en: '' },
      history: { vi: '', en: '' },
      deliveryModes: { vi: '', en: '' },
      locations: { vi: '', en: '' },
      academicYear: '2024',
      defaultSubjectCode: 'EE',
      defaultSubjectName: { vi: 'Môn học mới', en: 'New Subject' },
      defaultCredits: 3,
      publicDisclosure: { vi: '', en: '' },
      signerTitle: { vi: 'GIÁM ĐỐC', en: 'DIRECTOR' },
      signerName: 'TS. Lê Nguyễn Bảo',
      city: { vi: 'Đà Nẵng', en: 'Da Nang' },
      previousEvaluations: {
          weaknesses: { vi: '', en: '' },
          actions: { vi: '', en: '' },
          status: { vi: '', en: '' }
      }
    },
    globalConfigs: {
      teachingMethods: [
        { "id": "tm1", "code": "LEC", "name": { "vi": "Nghe giảng lý thuyết", "en": "Lecture" }, "description": { "vi": "Giảng viên trình bày các khái niệm lý thuyết.", "en": "Instructor presents theoretical concepts." }, "hoursPerCredit": 15, "category": "THEORY", "hoursConfig": { "study": 15, "review": 1, "exam": "1~2" }, "category2": "THEORY" },
        { "id": "tm2", "code": "SLF", "name": { "vi": "Tự học, tự nghiên cứu", "en": "Self-study and Research" }, "description": { "vi": "Tự học theo những yêu cầu cụ thể.", "en": "Self-study based on specific requirements." }, "hoursPerCredit": 30, "category": "PRACTICE", "hoursConfig": { "study": 32, "review": 0, "exam": 0 }, "category2": "SELF_STUDY" },
        { "id": "tm3", "code": "EXE", "name": { "vi": "Bài tập", "en": "Exercises" }, "description": { "vi": "Giải quyết các bài tập kỹ thuật để củng cố kiến thức.", "en": "Solving technical exercises to consolidate knowledge." }, "hoursPerCredit": 30, "category": "PRACTICE", "hoursConfig": { "study": 15, "review": 1, "exam": "1~2" }, "category2": "EXERCISE" },
        { "id": "tm4", "code": "DIS", "name": { "vi": "Thảo luận", "en": "Discussion" }, "description": { "vi": "Trao đổi, thảo luận nhóm về chủ đề.", "en": "Group exchange and discussion on topics." }, "hoursPerCredit": 30, "category": "PRACTICE", "hoursConfig": { "study": 15, "review": 1, "exam": "1~2" }, "category2": "GROUP_DISCUSSION" },
        { "id": "tm5", "code": "LAB", "name": { "vi": "Thực hành", "en": "Laboratory / Practice" }, "description": { "vi": "Sinh viên thực hiện thí nghiệm hoặc thực hành tại xưởng.", "en": "Students perform experiments or practical tasks in the workshop." }, "hoursPerCredit": 30, "category": "PRACTICE", "hoursConfig": { "study": 30, "review": 2, "exam": "1~2" }, "category2": "PRACTICE_LAB_INTERNSHIP" },
        { "id": "tm6", "code": "INT", "name": { "vi": "Thực tập tại cơ sở", "en": "Internship" }, "description": { "vi": "Sinh viên trực tiếp làm việc tại các cơ quan, doanh nghiệp để vận dụng kiến thức vào môi trường thực tế.", "en": "Students work at organizations or companies to apply theoretical knowledge to professional practice." }, "hoursPerCredit": 50, "category": "PRACTICE", "category2": "PRACTICE_LAB_INTERNSHIP" },
        { "id": "tm7", "code": "ESS", "name": { "vi": "Tiểu luận", "en": "Essay / Term Paper" }, "description": { "vi": "Người học nghiên cứu và viết báo cáo ngắn về một vấn đề cụ thể thuộc phạm vi một môn học.", "en": "A short research paper focused on a specific topic within the scope of a single course." }, "hoursPerCredit": 50, "category": "PRACTICE", "category2": "SELF_STUDY" },
        { "id": "tm8", "code": "ASG", "name": { "vi": "Bài tập lớn", "en": "Major Assignment" }, "description": { "vi": "Giải quyết một yêu cầu phức tạp hoặc tổng hợp kiến thức của toàn môn học thông qua một nhiệm vụ cụ thể.", "en": "A comprehensive task that requires students to synthesize knowledge from an entire course to solve a problem." }, "hoursPerCredit": 50, "category": "PRACTICE", "category2": "SELF_STUDY" },
        { "id": "tm9", "code": "PRJ", "name": { "vi": "Đồ án", "en": "Project" }, "description": { "vi": "Thiết kế, tính toán hoặc xây dựng một sản phẩm, giải pháp kỹ thuật dựa trên các cơ sở lý thuyết đã học.", "en": "A practical assignment involving the design, calculation, or creation of a technical solution or product." }, "hoursPerCredit": 50, "category": "PRACTICE", "category2": "SELF_STUDY" },
        { "id": "tm10", "code": "THE", "name": { "vi": "Khóa luận", "en": "Thesis" }, "description": { "vi": "Thực hiện công trình nghiên cứu độc lập và chuyên sâu về một đề tài cụ thể để kết thúc chương trình đại học.", "en": "An independent, in-depth research study conducted by students as a final requirement for their degree." }, "hoursPerCredit": 50, "category": "PRACTICE", "category2": "SELF_STUDY" },
        { "id": "tm11", "code": "SEM", "name": { "vi": "Semina", "en": "Seminar" }, "description": { "vi": "Sinh viên chuẩn bị và trình bày về một chủ đề chuyên sâu.", "en": "Students prepare and present on an in-depth topic." }, "hoursPerCredit": 30, "category": "PRACTICE", "category2": "GROUP_DISCUSSION" },
        { "id": "tm12", "code": "CAS", "name": { "vi": "Nghiên cứu tình huống", "en": "Case Study" }, "description": { "vi": "Phân tích các tình huống thực tế để rút ra bài học.", "en": "Analyze real-world situations to draw lessons." }, "hoursPerCredit": 30, "category": "PRACTICE", "category2": "GROUP_DISCUSSION" },
        { "id": "tm13", "code": "PBL", "name": { "vi": "Học tập dựa trên vấn đề", "en": "Problem-Based Learning" }, "description": { "vi": "Học thông qua việc giải quyết các vấn đề mở.", "en": "Learning through solving open-ended problems." }, "hoursPerCredit": 30, "category": "PRACTICE", "category2": "GROUP_DISCUSSION" },
        { "id": "tm14", "code": "PJB", "name": { "vi": "Học tập dựa trên dự án", "en": "Project-Based Learning" }, "description": { "vi": "Học thông qua việc thực hiện các dự án dài hạn.", "en": "Learning through long-term projects." }, "hoursPerCredit": 30, "category": "PRACTICE", "category2": "SELF_STUDY" }
      ],
      assessmentMethods: [
        { id: 'am1', name: { vi: 'Chuyên cần', en: 'Attendance' } },
        { id: 'am2', name: { vi: 'Thái độ tham gia thảo luận, Semina, Bài tập', en: 'Participation in discussions, seminars, and exercises.' } },
        { id: 'am3', name: { vi: 'Kiểm tra thường xuyên / Quiz', en: 'Regular Quiz / Test' } },
        { id: 'am4', name: { vi: 'Kiểm tra giữa kỳ', en: 'Midterm Exam' } },
        { id: 'am5', name: { vi: 'Thi kết thúc học phần', en: 'Final Exam' } },
        { id: 'am6', name: { vi: 'Tiểu luận / Báo cáo', en: 'Essay / Report' } },
        { id: 'am7', name: { vi: 'Đồ án / Bài tập lớn', en: 'Project / Major Assignment' } },
        { id: 'am8', name: { vi: 'Đánh giá tự học, tự nghiên cứu', en: 'Self-study and research assessment' } },
        { id: 'am9', name: { vi: 'Vấn đáp', en: 'Oral Exam' } },
        { id: 'am10', name: { vi: 'Thực hành / Thí nghiệm', en: 'Practical / Lab work' } }
      ],
      knowledgeAreas: [
        { id: 'math_sci', name: { vi: 'Toán & KHTN', en: 'Math & Basic Sciences' }, color: 'blue' },
        { id: 'fund_eng', name: { vi: 'Cơ sở ngành Kỹ thuật', en: 'Fundamental Engineering' }, color: 'indigo' },
        { id: 'adv_eng', name: { vi: 'Chuyên ngành Kỹ thuật', en: 'Advanced Engineering' }, color: 'purple' },
        { id: 'gen_ed', name: { vi: 'Giáo dục Đại cương', en: 'General Education' }, color: 'green' },
        { id: 'other', name: { vi: 'Khác', en: 'Other' }, color: 'slate' }
      ],
      creditBlocks: [
        { id: 'cb1', code: 'THEORY', name: { vi: 'Tín chỉ lý thuyết', en: 'Theory Credit' }, acronym: { vi: 'LT', en: 'THE' } },
        { id: 'cb2', code: 'PRACTICE', name: { vi: 'Tín chỉ thực hành', en: 'Practice Credit' }, acronym: { vi: 'TH', en: 'PRA' } },
        { id: 'cb3', code: 'INTERNSHIP', name: { vi: 'Tín chỉ thực tập', en: 'Internship Credit' }, acronym: { vi: 'TT', en: 'INT'} },
        { id: 'cb4', code: 'PROJECT', name: { vi: 'Tín chỉ đồ án', en: 'Project Credit' }, acronym: { vi: 'ĐA', en: 'PRO' } }
      ],
      assessmentCategories: [
        { id: 'EXERCISE', vi: 'Bài tập', en: 'Exercise' },
        { id: 'DISCUSSION', vi: 'Thảo luận', en: 'Discussion' },
        { id: 'SEMINAR', vi: 'Semina', en: 'Seminar' },
        { id: 'ORAL_EXAM', vi: 'Vấn đáp', en: 'Oral Exam' },
        { id: 'PRESENTATION', vi: 'Bài trình chiếu', en: 'Presentation' },
        { id: 'ESSAY', vi: 'Tiểu luận', en: 'Essay' },
        { id: 'EXAM', vi: 'Bài kiểm tra', en: 'Exam' },
        { id: 'MEXAM', vi: 'Kiểm tra giữa kỳ', en: 'Mid-Exam' },
        { id: 'QUIZ', vi: 'Trắc nghiệm', en: 'Quiz/Multiple Choice' },
        { id: 'PROJECT', vi: 'Đồ án/BTL', en: 'Project/Assignment' },
        { id: 'REPORT', vi: 'Báo cáo', en: 'Report' },
        { id: 'OTHER', vi: 'Khác:', en: 'Other:' }
      ],
      activityGroups: [
        { id: 'theory', vi: 'Lý thuyết', en: 'Theory', methodIds: ['tm1'] },
        { id: 'exercise', vi: 'Bài tập', en: 'Exercises', methodIds: ['tm3'] },
        { id: 'discussion', vi: 'Thảo luận nhóm', en: 'Group Discussion', methodIds: ['tm4', 'tm11', 'tm12', 'tm13'] },
        { id: 'practice', vi: 'Thực hành/Thực tập', en: 'Practice', methodIds: ['tm5', 'tm6'] },
        { id: 'self_study', vi: 'Tự học/Đồ án', en: 'Self-study', methodIds: ['tm2', 'tm7', 'tm8', 'tm9', 'tm10', 'tm14'] }
      ],
      submissionMethods: [
        { id: 'HANDWRITTEN', vi: 'Nộp bài viết', en: 'Handwritten submission' },
        { id: 'PRINTED', vi: 'Nộp bài in', en: 'Printed submission' },
        { id: 'EMAIL', vi: 'Nộp qua email', en: 'Email submission' },
        { id: 'LMS', vi: 'Nộp qua LMS', en: 'LMS submission' },
        { id: 'DIRECT', vi: 'Nộp trực tiếp', en: 'Direct submission' },
        { id: 'NO', vi: 'Không nộp bài', en: 'No submission' },
        { id: 'OTHER', vi: 'Khác:', en: 'Other:' }
      ],
      assessmentTools: [
        { id: 'HANDWRITTEN', vi: 'Viết tay', en: 'Handwritten' },
        { id: 'COMPUTER', vi: 'Trên máy tính', en: 'On computer' },
        { id: 'PAPER', vi: 'Giấy thi', en: 'Exam paper' },
        { id: 'SOFTWARE', vi: 'Phần mềm chuyên dụng', en: 'Specialized software' },
        { id: 'ONSITE', vi: 'Tổ chức tại lớp', en: 'On site' },
        { id: 'GOOGLE_FORM', vi: 'Google Form', en: 'Google Form' },
        { id: 'OTHER', vi: 'Khác:', en: 'Other:' }
      ],
      finalAssessmentMethods: [
        { id: 'ESSAY', vi: 'Tự luận', en: 'Essay' },
        { id: 'MULTIPLE_CHOICE', vi: 'Trắc nghiệm', en: 'Multiple choice' },
        { id: 'ORAL_EXAM', vi: 'Vấn đáp', en: 'Oral exam' },
        { id: 'PRACTICE', vi: 'Thực hành', en: 'Practical exam' },
        { id: 'PROJECT', vi: 'Đồ án/Báo cáo', en: 'Project/Report' },
        { id: 'OTHER', vi: 'Khác:', en: 'Other:' }
      ]
    },
    facultyDirectory: [
      {
        id: 'f1',
        name: { vi: 'Lê Nguyễn Bảo', en: 'Le Nguyen Bao' },
        rank: { vi: 'Giảng viên', en: 'Lecturer' },
        degree: { vi: 'Tiến sĩ', en: 'Ph.D' },
        academicTitle: { vi: 'Phó Giáo sư', en: 'Associate Professor' },
        position: { vi: 'Hiệu trưởng', en: 'Rector' },
        experience: { vi: '20 năm', en: '20 years' },
        careerStartYear: 2004,
        workload: 0,
        employmentType: 'FT',
        email: 'baoln@university.edu.vn',
        tel: '0236.123456',
        cell: '0905.123456',
        office: 'P.702, Tòa nhà trung tâm',
        contactAddress: '123 Nguyễn Văn Linh, Đà Nẵng',
        officeHours: 'Thứ 2, Thứ 4 (8:00 - 10:00)',
        unitId: 'sch_set',
        unitType: 'SCHOOL',
        researchDirections: {
          vi: 'Trí tuệ nhân tạo, Học máy, Xử lý ngôn ngữ tự nhiên.',
          en: 'Artificial Intelligence, Machine Learning, Natural Language Processing.'
        },
        educationList: [
          { id: 'e1', degree: { vi: 'Tiến sĩ', en: 'Ph.D' }, discipline: { vi: 'Khoa học Máy tính', en: 'Computer Science' }, institution: { vi: 'Đại học Tokyo', en: 'University of Tokyo' }, year: '2015' }
        ],
        academicExperienceList: [],
        nonAcademicExperienceList: [],
        publicationsList: [],
        certificationsList: [],
        membershipsList: [],
        honorsList: [],
        serviceActivitiesList: [],
        professionalDevelopmentList: []
      }
    ],
    organizationStructure: {
      academicSchools: [
        { id: 'sch_set', code: 'SET', name: { vi: 'Trường Kỹ thuật & Công nghệ', en: 'School of Engineering & Technology' } }
      ],
      academicFaculties: [
        { id: 'fac_eee', code: 'FEEE', name: { vi: 'Khoa Điện - Điện tử', en: 'Faculty of Electrical - Electronic Engineering' }, schoolId: 'sch_set' },
        { id: 'fac_it', code: 'FIT', name: { vi: 'Khoa Công nghệ Thông tin', en: 'Faculty of Information Technology' }, schoolId: 'sch_set' }
      ],
      departments: [
        { id: 'dept_ee', code: 'EE', name: { vi: 'Bộ môn Điện - Điện tử', en: 'Department of Electrical & Electronics' }, academicFacultyId: 'fac_eee' },
        { id: 'dept_it', code: 'IT', name: { vi: 'Bộ môn Công nghệ Thông tin', en: 'Department of Information Technology' }, academicFacultyId: 'fac_it' },
        { id: 'dept_bs', code: 'BS', name: { vi: 'Bộ môn Khoa học Cơ bản', en: 'Department of Basic Sciences' }, academicFacultyId: 'fac_eee' }
      ],
      facultyTitles: {
        ranks: [
          { id: 'r1', name: { vi: 'Giảng viên', en: 'Lecturer' } },
          { id: 'r2', name: { vi: 'Giảng viên cao cấp', en: 'Senior Lecturer' } },
          { id: 'r3', name: { vi: 'Trợ giảng', en: 'Teaching Assistant' } }
        ],
        degrees: [
          { id: 'd1', name: { vi: 'Tiến sĩ', en: 'Ph.D' } },
          { id: 'd2', name: { vi: 'Thạc sĩ', en: 'Master' } },
          { id: 'd3', name: { vi: 'Kỹ sư', en: 'Engineer' } },
          { id: 'd4', name: { vi: 'Cử nhân', en: 'Bachelor' } }
        ],
        academicTitles: [
          { id: 'at1', name: { vi: 'Không', en: 'None' } },
          { id: 'at2', name: { vi: 'Giáo sư', en: 'Professor' } },
          { id: 'at3', name: { vi: 'Phó giáo sư', en: 'Associate Professor' } }
        ],
        positions: [
          { id: 'p1', name: { vi: 'Giảng viên', en: 'Faculty Member' } },
          { id: 'p2', name: { vi: 'Trưởng khoa', en: 'Dean' } },
          { id: 'p3', name: { vi: 'Phó trưởng khoa', en: 'Vice Dean' } },
          { id: 'p4', name: { vi: 'Trưởng bộ môn', en: 'Head of Department' } }
        ]
      }
    },
    facilitiesCatalog: [],
    courseCatalog: [
      { 
        id: '346', 
        code: 'EE 346', 
        name: { vi: 'Thực tập nhận thức', en: 'Awareness Internship' }, 
        credits: 2, 
        isEssential: true, 
        type: 'REQUIRED', 
        knowledgeAreaId: 'adv_eng', 
        departmentId: 'dept_ee', // Assigned to EE
        semester: 1, 
        colIndex: 0, 
        prerequisites: [], 
        coRequisites: [],
        description: { 
          vi: 'Khóa học là một hoạt động quan trọng đối với sinh viên Kỹ thuật Điện và Điện tử. Nó được thiết kế để mang lại cho họ cái nhìn toàn diện và thực tế về môi trường làm việc và các lĩnh vực ứng dụng khác nhau trong lĩnh vực của họ.', 
          en: 'The course is a crucial activity for Electrical and Electronic Engineering students. It\'s designed to give them a comprehensive and practical insight into the working environment and the various application areas of their field.' 
        }, 
        textbooks: [
          { resourceId: 'lib1', title: 'Internship Guidelines', author: 'Faculty of EEE', publisher: 'DTU', year: '2024', type: 'reference', url: '' }
        ], 
        clos: { 
          vi: [
            'Mô tả các trách nhiệm đạo đức và chuyên môn cần thiết trong môi trường làm việc Kỹ thuật Điện và Điện tử.',
            'Xác định và mô tả các công nghệ, thiết bị, sản phẩm và giải pháp tiêu biểu hiện đang được áp dụng trong lĩnh vực thực tế.',
            'Áp dụng kiến thức và kinh nghiệm thực tế để đánh giá yêu cầu công việc, từ đó định hình các mục tiêu nghề nghiệp và lộ trình phát triển trong tương lai.',
            'So sánh các kỹ thuật, công nghệ hoặc quy trình sản xuất khác nhau được quan sát trong kỳ thực tập.',
            'Trình bày rõ ràng và mạch lạc những kiến thức và kinh nghiệm thu được từ kỳ thực tập, sử dụng các công cụ hỗ trợ phù hợp.'
          ], 
          en: [
            'Describe the ethical and professional responsibilities required in the Electrical and Electronic Engineering work environment.',
            'Identify and describe typical technologies, equipment, products, and solutions currently applied in the practical field of Electrical and Electronic Engineering.',
            'Apply practical knowledge and experience to assess job requirements, thereby shaping personal career goals and development paths for the future.',
            'Compare different techniques, technologies, or production processes observed during the internship, and evaluate the advantages and disadvantages of each method.',
            'Clearly and coherently present the knowledge and experience gained from the internship, utilizing appropriate supporting tools.'
          ] 
        }, 
        topics: [
          { 
            id: 't1', 
            no: 'CONT.1', 
            topic: { vi: 'Tham quan và tìm hiểu về cơ cấu tổ chức...', en: 'Visit and learn about the organizational structure...' },
            activities: [
              { methodId: 'tm4', hours: 10 }
            ],
            readingRefs: []
          },
          { 
            id: 't2', 
            no: 'CONT.2', 
            topic: { vi: 'Tương tác với các kỹ sư...', en: 'Interact with engineers...' },
            activities: [
              { methodId: 'tm4', hours: 10 }
            ],
            readingRefs: []
          }
        ],
        assessmentPlan: [
          { id: 'a1', methodId: 'am1', type: { vi: 'Chuyên cần', en: 'Attendance' }, percentile: 30 },
          { id: 'a2', methodId: 'am7', type: { vi: 'Đồ án cá nhân', en: 'Individual Project' }, percentile: 70 }
        ],
        assessmentConfigType: 'THEORY',
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
            finalExamForms: [],
            regularTests: []
        },
        practiceAssessmentConfig: {
            criteriaType: 'DESCRIPTION',
            criteria: '',
            rubric: { levels: [], criteria: [] },
            items: []
        },
        projectAssessmentConfig: {
            criteriaType: 'DESCRIPTION',
            criteria: '',
            rubric: { levels: [], criteria: [] }
        },
        scheduleNumWeeks: 15,
        schedule: [],
        teachingMethodsDescription: { vi: '', en: '' },
        coursePolicies: { vi: '', en: '' },
        classOrganizationForm: { vi: '', en: '' },
        instructorIds: ['f1'],
        instructorDetails: {
          'f1': { classInfo: '', isMain: true }
        },
        cloMap: []
      },
      { 
        id: '200', 
        code: 'EE 200', 
        name: { vi: 'Mạch điện I', en: 'Electric Circuits I' }, 
        credits: 3, 
        isEssential: true, 
        type: 'REQUIRED', 
        knowledgeAreaId: 'fund_eng', 
        departmentId: 'dept_ee', // Assigned to EE
        semester: 3, 
        colIndex: 0, 
        prerequisites: [], 
        coRequisites: [],
        description: { 
          vi: 'Khóa học giới thiệu các khái niệm cơ bản về mạch điện, định luật Kirchhoff, các phương pháp phân tích mạch DC và AC cơ bản.', 
          en: 'This course introduces basic concepts of electric circuits, Kirchhoff\'s laws, and fundamental methods of DC and AC circuit analysis.' 
        }, 
        textbooks: [], 
        clos: { vi: [], en: [] }, 
        topics: [],
        assessmentPlan: [],
        assessmentConfigType: 'THEORY',
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
            finalExamForms: [],
            regularTests: []
        },
        practiceAssessmentConfig: {
            criteriaType: 'DESCRIPTION',
            criteria: '',
            rubric: { levels: [], criteria: [] },
            items: []
        },
        projectAssessmentConfig: {
            criteriaType: 'DESCRIPTION',
            criteria: '',
            rubric: { levels: [], criteria: [] }
        },
        scheduleNumWeeks: 15,
        schedule: [],
        teachingMethodsDescription: { vi: '', en: '' },
        coursePolicies: { vi: '', en: '' },
        classOrganizationForm: { vi: '', en: '' },
        instructorIds: [],
        instructorDetails: {},
        cloMap: []
      },
      { 
        id: '252', 
        code: 'EE 252', 
        name: { vi: 'Mạch điện II', en: 'Electric Circuits II' }, 
        credits: 3, 
        isEssential: true, 
        type: 'REQUIRED', 
        knowledgeAreaId: 'fund_eng', 
        departmentId: 'dept_ee', // Assigned to EE
        semester: 4, 
        colIndex: 0, 
        prerequisites: ['EE 200'], 
        coRequisites: [],
        description: { 
          vi: 'Khóa học nâng cao về phân tích mạch điện, bao gồm mạch ba pha, mạng hai cổng, và đáp ứng tần số.', 
          en: 'Advanced course on electric circuit analysis, including three-phase circuits, two-port networks, and frequency response.' 
        }, 
        textbooks: [], 
        clos: { vi: [], en: [] }, 
        topics: [],
        assessmentPlan: [],
        assessmentConfigType: 'THEORY',
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
            finalExamForms: [],
            regularTests: []
        },
        practiceAssessmentConfig: {
            criteriaType: 'DESCRIPTION',
            criteria: '',
            rubric: { levels: [], criteria: [] },
            items: []
        },
        projectAssessmentConfig: {
            criteriaType: 'DESCRIPTION',
            criteria: '',
            rubric: { levels: [], criteria: [] }
        },
        scheduleNumWeeks: 15,
        schedule: [],
        teachingMethodsDescription: { vi: '', en: '' },
        coursePolicies: { vi: '', en: '' },
        classOrganizationForm: { vi: '', en: '' },
        instructorIds: [],
        instructorDetails: {},
        cloMap: []
      }
    ],
    library: [
      { id: 'lib1', title: 'Internship Guidelines', author: 'Faculty of EEE', publisher: 'DTU', year: '2024', type: 'reference', isEbook: true, isPrinted: true, url: '' }
    ],
    geminiConfig: {
      model: 'gemini-3-flash-preview',
      prompts: {
        translation: 'Translate this text to {targetLanguage}: {text}',
        courseTranslation: 'Translate these course names to {targetLanguage}: {items}',
        audit: 'Audit the curriculum matrix for gaps: {data}',
        consistency: 'Check consistency between CLOs and SOs: {data}',
        syllabusAnalysis: 'Analyze this syllabus PDF and extract structured data: {structure}',
        courseCatalogAnalysis: 'Analyze this course catalog PDF and extract courses: {structure}',
        programAnalysis: 'Analyze this program specification PDF and extract general info, mission, PEOs, SOs, etc.'
      }
    }
  },
  programs: [
    {
      id: 'prog-1',
      programCode: 'AEEE-2024',
      programName: { vi: 'Chương trình Kỹ thuật Điện - Điện tử Tiên tiến', en: 'Advanced Electrical & Electronic Engineering Program' },
      degreeLevel: { vi: 'Đại học', en: 'Undergraduate' },
      programSpecificInfo: {
        targetStudents: { vi: 'Học sinh tốt nghiệp THPT khối A00, A01.', en: 'High school graduates with Group A00, A01.' },
        entryRequirements: { vi: 'Xét tuyển theo kết quả thi THPT Quốc gia hoặc học bạ.', en: 'Admission based on National High School Exam results or transcripts.' },
        graduationConditions: { vi: 'Tích lũy đủ số tín chỉ, chứng chỉ tiếng Anh B1, chứng chỉ GDQP-AN.', en: 'Accumulate enough credits, English B1 certificate, Defense-Security Education certificate.' },
        assessmentMethods: { vi: '', en: '' },
        admissionPlan: { vi: '', en: '' },
        qualityAssurancePlan: { vi: '', en: '' },
        implementationGuidelines: { vi: 'Thực hiện theo quy chế đào tạo tín chỉ hiện hành.', en: 'Follow current credit-based training regulations.' }
      },
      GPLO: { 
        vi: 'Đào tạo kỹ sư có kiến thức chuyên môn vững vàng, kỹ năng thực hành tốt và đạo đức nghề nghiệp.', 
        en: 'Train engineers with solid professional knowledge, good practical skills, and professional ethics.' 
      },
      PLOs: [
        { id: 'MO-1', code: '1', description: { vi: 'Kiến thức chuyên môn', en: 'Professional Knowledge' }, soIds: [] },
        { id: 'MO-2', code: '1.1', description: { vi: 'Toán và Khoa học cơ bản', en: 'Math and Basic Sciences' }, soIds: ['so1'] },
        { id: 'MO-3', code: '1.1.1', description: { vi: 'Áp dụng kiến thức toán học để giải quyết vấn đề.', en: 'Apply mathematical knowledge to solve problems.' }, competencyLevel: 'III', soIds: ['so1'] }
      ],
      LOs: [
        { id: 'MSO-1', category: 'knowledge', description: { vi: 'Có kiến thức cơ bản về toán học, khoa học tự nhiên.', en: 'Have basic knowledge of mathematics and natural sciences.' }, peoIds: ['peo1'] },
        { id: 'MSO-2', category: 'skills', description: { vi: 'Có kỹ năng thiết kế và vận hành hệ thống điện.', en: 'Have skills in designing and operating electrical systems.' }, peoIds: ['peo2'] }
      ],
      PEOs: [
        { id: 'peo1', code: 'PEO-1', title: { en: 'Dynamic & Creative Solutions', vi: 'Giải pháp Năng động & Sáng tạo' }, description: { en: 'Apply dynamic and creative approaches to solve engineering problems.', vi: 'Áp dụng các cách tiếp cận năng động và sáng tạo để giải quyết vấn đề kỹ thuật.' } },
        { id: 'peo2', code: 'PEO-2', title: { en: 'Effective & Ethical Contribution', vi: 'Đóng góp Hiệu quả & Đạo đức' }, description: { en: 'Contribute effectively and ethically to society.', vi: 'Đóng góp hiệu quả và có đạo đức cho xã hội.' } },
        { id: 'peo3', code: 'PEO-3', title: { en: 'Lifelong Learning & Innovation', vi: 'Học tập suốt đời & Đổi mới' }, description: { en: 'Lead innovation through lifelong learning.', vi: 'Dẫn đầu sự đổi mới thông qua học tập suốt đời.' } },
        { id: 'peo4', code: 'PEO-4', title: { en: 'Global Citizenship', vi: 'Công dân Toàn cầu' }, description: { en: 'Act as a responsible global citizen.', vi: 'Đóng góp tích cực và có trách nhiệm như một công dân toàn cầu.' } },
      ],
      peoPloMap: [],
      SOs: [
        { id: 'so1', number: 1, code: 'SO-1', description: { en: 'An ability to identify, formulate, and solve complex engineering problems by applying principles of engineering, science, and mathematics.', vi: 'Khả năng xác định, diễn đạt và giải quyết các vấn đề kỹ thuật phức tạp bằng cách áp dụng các nguyên lý kỹ thuật, khoa học và toán học.' }, pis: [
          { id: 'pi1.1', code: '1.1', description: { en: 'Ability to identify a complex engineering problem by using scientific principles.', vi: 'Khả năng xác định vấn đề kỹ thuật phức tạp bằng cách sử dụng các nguyên lý khoa học.' } },
          { id: 'pi1.2', code: '1.2', description: { en: 'Ability to develop a hardware/software/math model for a complex engineering problem.', vi: 'Khả năng phát triển mô hình phần cứng/phần mềm/toán học cho một vấn đề kỹ thuật phức tạp.' } }
        ] },
        { id: 'so2', number: 2, code: 'SO-2', description: { en: 'An ability to apply engineering design to produce solutions that meet specified needs with consideration of public health, safety, and welfare, as well as global, cultural, social, environmental, and economic factors.', vi: 'Khả năng áp dụng thiết kế kỹ thuật để tạo ra các giải pháp đáp ứng nhu cầu cụ thể với sự cân nhắc đến sức khỏe cộng đồng, an toàn, và phúc lợi, cũng như các yếu tố toàn cầu, văn hóa, xã hội, môi trường và kinh tế.' }, pis: [
          { id: 'pi2.1', code: '2.1', description: { en: 'Ability to recognize and distinguish important real-world constraints for a particular design or design component.', vi: 'Khả năng nhận biết và phân biệt các ràng buộc thực tế quan trọng cho một thiết kế hoặc thành phần thiết kế cụ thể.' } },
          { id: 'pi2.2', code: '2.2', description: { en: 'Ability to translate practical quantitative constraints to appropriate design parameters.', vi: 'Khả năng chuyển đổi các ràng buộc định lượng thực tế thành các thông số thiết kế phù hợp.' } }
        ] },
        { id: 'so3', number: 3, code: 'SO-3', description: { vi: 'Khả năng giao tiếp hiệu quả.', en: 'Effective communication ability.' }, pis: [] },
        { id: 'so4', number: 4, code: 'SO-4', description: { vi: 'Khả năng nhận biết trách nhiệm đạo đức.', en: 'Ethical responsibility awareness.' }, pis: [] },
        { id: 'so5', number: 5, code: 'SO-5', description: { vi: 'Khả năng làm việc nhóm.', en: 'Teamwork ability.' }, pis: [] },
        { id: 'so6', number: 6, code: 'SO-6', description: { vi: 'Khả năng thực nghiệm.', en: 'Experimental ability.' }, pis: [] },
        { id: 'so7', number: 7, code: 'SO-7', description: { vi: 'Khả năng học tập suốt đời.', en: 'Lifelong learning ability.' }, pis: [] }
      ],
      loSoMap: [],
      studentOutcomes: [],
      curriculumStructure: [],
      matrix: [],
      courseSoMap: [],
      coursePiMap: [],
      coursePeoMap: [],
      peoSoMap: [],
      peoConstituentMap: [],
      mission: {
        text: {
          vi: "Sứ mạng của Trường Kỹ thuật và Công nghệ tại Đại học ABC là cam kết cung cấp cho người học những kiến thức, kỹ năng và khả năng thích ứng cần thiết cho công việc chuyên môn và nghiên cứu trong lĩnh vực kỹ thuật và công nghệ, qua đó đáp ứng nhu cầu nhân lực của địa phương và toàn cầu.",
          en: "The mission of the School of Engineering and Technology at ABC University is to commit to providing graduates with the necessary knowledge, skills, and adaptability for professional and research works in the field of engineering and technology, thereby fulfilling both global and local workforce demands."
        },
        constituents: [
          { id: 'mc1', description: { vi: "Kiến thức chuyên môn", en: "Professional knowledge" } },
          { id: 'mc2', description: { vi: "Kỹ năng thực hành", en: "Practical skills" } },
          { id: 'mc3', description: { vi: "Khả năng thích ứng", en: "Adaptability" } },
          { id: 'mc4', description: { vi: "Nghiên cứu kỹ thuật", en: "Engineering research" } }
        ]
      },
      moetInfo: {
        level: { vi: 'Đại học', en: 'Undergraduate' },
        majorName: { vi: 'Kỹ thuật Điện - Điện tử', en: 'Electrical & Electronic Engineering' },
        majorCode: '7520201',
        programName: { vi: 'Chương trình Kỹ thuật Điện - Điện tử Tiên tiến', en: 'Advanced Electrical & Electronic Engineering Program' },
        programCode: 'AEEE-2024',
        specializations: [
            { vi: 'Hệ thống điện', en: 'Electrical Power Systems' },
            { vi: 'Điện tử công nghiệp', en: 'Industrial Electronics' },
            { vi: 'Năng lượng tái tạo', en: 'Renewable Energy' }
        ],
        trainingMode: { vi: 'Chính quy', en: 'Full-time' },
        trainingType: { vi: 'Tập trung', en: 'On-campus' },
        trainingLanguage: { vi: 'Tiếng Việt', en: 'Vietnamese' },
        duration: '4',
        numSemesters: 8,
        trainingOrientation: { vi: 'Định hướng nghề nghiệp', en: 'Professional Orientation' },
        minCredits: 150,
        degreeName: { vi: 'Kỹ sư', en: 'Engineer' },
        legalBasis: { 
          vi: '<p>Căn cứ Thông tư 17/2021/TT-BGDĐT về chuẩn chương trình đào tạo.</p><p>Quyết định số 123/QĐ-ĐHABC về việc ban hành quy định đào tạo.</p>', 
          en: '<p>Based on Circular 17/2021/TT-BGDĐT on training program standards.</p><p>Decision No. 123/QD-DHABC on issuing training regulations.</p>' 
        },
        admissionTarget: { vi: 'Học sinh tốt nghiệp THPT khối A00, A01.', en: 'High school graduates with Group A00, A01.' },
        admissionReq: { vi: 'Xét tuyển theo kết quả thi THPT Quốc gia hoặc học bạ.', en: 'Admission based on National High School Exam results or transcripts.' },
        graduationReq: { vi: 'Tích lũy đủ số tín chỉ, chứng chỉ tiếng Anh B1, chứng chỉ GDQP-AN.', en: 'Accumulate enough credits, English B1 certificate, Defense-Security Education certificate.' },
        gradingScale: { vi: 'Thang điểm 10 và thang điểm 4.', en: '10-point scale and 4-point scale.' },
        implementationGuideline: { vi: 'Thực hiện theo quy chế đào tạo tín chỉ hiện hành.', en: 'Follow current credit-based training regulations.' },
        guidelineFacilities: { vi: 'Sử dụng hệ thống phòng thí nghiệm trọng điểm của Trường.', en: 'Use the University\'s key laboratory system.' },
        guidelineClassForms: { vi: 'Kết hợp học lý thuyết trên lớp và thực hành tại xưởng.', en: 'Combine classroom theory and workshop practice.' },
        guidelineCreditConversion: { vi: '1 tín chỉ tương đương 15 giờ lý thuyết hoặc 30 giờ thực hành.', en: '1 credit equals 15 theory hours or 30 practice hours.' },
        referencedPrograms: { vi: 'Chương trình Kỹ thuật Điện của Đại học Purdue (Hoa Kỳ).', en: 'Electrical Engineering program of Purdue University (USA).' },
        generalObjectives: { 
          vi: 'Đào tạo kỹ sư có kiến thức chuyên môn vững vàng, kỹ năng thực hành tốt và đạo đức nghề nghiệp.', 
          en: 'Train engineers with solid professional knowledge, good practical skills, and professional ethics.' 
        },
        moetSpecificObjectives: [
          { id: 'MSO-1', category: 'knowledge', description: { vi: 'Có kiến thức cơ bản về toán học, khoa học tự nhiên.', en: 'Have basic knowledge of mathematics and natural sciences.' }, peoIds: ['peo1'] },
          { id: 'MSO-2', category: 'skills', description: { vi: 'Có kỹ năng thiết kế và vận hành hệ thống điện.', en: 'Have skills in designing and operating electrical systems.' }, peoIds: ['peo2'] }
        ],
        specificObjectives: [
          { id: 'MO-1', code: '1', description: { vi: 'Kiến thức chuyên môn', en: 'Professional Knowledge' }, soIds: [] },
          { id: 'MO-2', code: '1.1', description: { vi: 'Toán và Khoa học cơ bản', en: 'Math and Basic Sciences' }, soIds: ['so1'] },
          { id: 'MO-3', code: '1.1.1', description: { vi: 'Áp dụng kiến thức toán học để giải quyết vấn đề.', en: 'Apply mathematical knowledge to solve problems.' }, competencyLevel: 'III', soIds: ['so1'] }
        ],
        programStructure: { 
          gen: ['200'], 
          phys: [], 
          fund: ['252'], 
          spec: ['346'], 
          grad: [] 
        },
        subBlocks: [
          {
            id: 'sb-gen-1',
            name: { vi: 'Khối kiến thức chung', en: 'General Knowledge Block' },
            parentBlockId: 'gen',
            type: 'COMPULSORY',
            minCredits: 10,
            courseIds: ['200']
          }
        ],
        courseObjectiveMap: ['200|MO-3', '252|MO-3', '346|MO-3'],
        programFaculty: [
          { id: 'pf-1', fullNameYearPosition: 'Nguyễn Văn A, 1980, Trưởng bộ môn', degreeCountryYear: 'Tiến sĩ, Nhật Bản, 2015', major: 'Kỹ thuật Điện', teachingExperience: '15 năm, Đại học ABC' }
        ]
      }
    }
  ]
};