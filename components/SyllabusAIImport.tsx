import React, { useState } from 'react';
import { Bot, Check, X, AlertCircle, Copy, Sparkles, ArrowRight, Layers } from 'lucide-react';
import { Course, AppState, Language, AssessmentMethod, CoverageLevel, CloMapping } from '../types';

interface SyllabusAIImportProps {
    course: Course;
    state: AppState;
    updateCourse: (updates: Partial<Course>) => void;
    language: Language;
}

const getSyllabusFullAiPrompt = (state: AppState) => {
    const globalState = state.globalState;
    const currentProgram = state.programs?.find(p => p.id === state.currentProgramId);
    
    const teachingMethods = globalState?.globalConfigs?.teachingMethods || state.teachingMethods || [];
    const assessmentMethods = globalState?.globalConfigs?.assessmentMethods || state.assessmentMethods || [];
    const assessmentCategories = globalState?.globalConfigs?.assessmentCategories || state.assessmentCategories || [];
    const submissionMethods = globalState?.globalConfigs?.submissionMethods || state.submissionMethods || [];
    const assessmentTools = globalState?.globalConfigs?.assessmentTools || state.assessmentTools || [];
    const finalAssessmentMethods = globalState?.globalConfigs?.finalAssessmentMethods || state.finalAssessmentMethods || [];
    
    const faculties = globalState?.facultyDirectory || state.faculties || [];
    const sos = currentProgram?.SOs || state.sos || [];
    const generalInfo = globalState?.institutionInfo || state.generalInfo;
    const moetInfo = currentProgram?.moetInfo || state.generalInfo?.moetInfo;

    const teachingMethodsStr = teachingMethods.map((m: any) => `ID: ${m.id} - Tên: ${m.name.vi}`).join(', ');
    const assessmentMethodsStr = assessmentMethods.map((m: any) => `ID: ${m.id} - Tên: ${m.name.vi}`).join(', ');
    const assessmentCategoriesStr = assessmentCategories?.map((c: any) => `ID: ${c.id} - Tên: ${c.vi}`).join(', ') || '';
    const submissionMethodsStr = submissionMethods?.map((m: any) => `ID: ${m.id} - Tên: ${m.vi}`).join(', ') || '';
    const assessmentToolsStr = assessmentTools?.map((t: any) => `ID: ${t.id} - Tên: ${t.vi}`).join(', ') || '';
    const finalAssessmentMethodsStr = finalAssessmentMethods?.map((m: any) => `ID: ${m.id} - Tên: ${m.vi}`).join(', ') || '';
    
    // Lấy danh sách giảng viên để AI phân công
    const facultiesStr = faculties.map((f: any) => `- ID: ${f.id} | Tên: ${f.name.vi || f.name.en} | Email: ${f.email || 'N/A'}`).join('\n');
    
    // Lấy danh sách mục tiêu cụ thể MOET
    const specificObjectivesStr = moetInfo?.specificObjectives?.map((o: any) => `- ID: ${o.id} | Mô tả: ${o.description.vi}`).join('\n') || '';
    
    // Lấy danh sách Student Outcomes
    const studentOutcomesStr = sos.map((s: any) => `- ID: ${s.id} | Mã: ${s.code} | Mô tả: ${s.description.vi}`).join('\n');
    
    // Lấy danh sách Performance Indicators
    const performanceIndicatorsStr = sos.flatMap((s: any) => s.pis.map((p: any) => `- ID: ${p.id} | Mã: ${p.code} | Mô tả: ${p.description.vi} (Thuộc SO: ${s.code})`)).join('\n');

    return `Bạn là Chuyên gia Phát triển Chương trình Đào tạo và Kỹ sư Dữ liệu.
Nhiệm vụ: Phân tích nội dung văn bản/tài liệu được cung cấp và trích xuất thành một cấu hình JSON Đề cương môn học (Syllabus) hoàn chỉnh.
RÀNG BUỘC NGHIÊM NGẶT:
CHỈ trả về một (01) đoạn code JSON Object duy nhất hợp lệ.
KHÔNG giải thích, KHÔNG chào hỏi, KHÔNG thêm bất kỳ văn bản nào ngoài JSON.
TUYỆT ĐỐI tuân thủ cấu trúc, kiểu dữ liệu và ràng buộc logic dưới đây:
{
"description": {
"vi": "Mô tả học phần tiếng Việt...",
"en": "English course description..."
},
"instructorIds": [
"<id giảng viên 1>",
"<id giảng viên 2>"
],
"textbooks": [
{
"resourceId": "lib-<số ngẫu nhiên>",
"title": "Tên tài liệu",
"author": "Tên tác giả",
"publisher": "Nhà xuất bản",
"year": "2024",
"type": "textbook" // "textbook" (Giáo trình/Bắt buộc) hoặc "reference" (Tham khảo)
}
],
"objectives": {
"general": {
"vi": "Mục tiêu chung tiếng Việt",
"en": "General objectives in English"
},
"specific": {
"knowledge": [ // TỐI ĐA 3 mục tiêu kiến thức
{ "vi": "Mục tiêu kiến thức 1", "en": "" }
],
"skills": [ // TỐI ĐA 3 mục tiêu kỹ năng
{ "vi": "Mục tiêu kỹ năng 1", "en": "" }
],
"responsibility": [ // TỐI ĐA 2 mục tiêu tự chủ/trách nhiệm
{ "vi": "Mục tiêu năng lực tự chủ 1", "en": "" }
]
}
},
"clos": {
"vi": [
"Nội dung Chuẩn đầu ra (CLO) 1",
"Nội dung Chuẩn đầu ra (CLO) 2"
],
"en": [
"CLO 1 content",
"CLO 2 content"
]
},
"topics": [
{
"id": "t-<số ngẫu nhiên>",
"no": "Chương x",
"topic": {
"vi": "Tên chương x",
"en": "Chapter x title"
},
"activities": [],
"readingRefs": [
{
"resourceId": "<id của textbooks>",
"pageRange": "10-20"
}
],
"subTopics": [
{
"id": "t-<số ngẫu nhiên>",
"no": "x.i",
"topic": {
"vi": "Tên bài/mục x.i",
"en": "Subtopic x.i"
},
"activities": [
{
"methodId": "tm1",
"hours": 3
}
],
"requirement": "must_know" // "must_know", "should_know", "could_know"
}
]
}
],
"cloMap": [
{
"cloIndex": 0, // Tương ứng vị trí trong mảng clos.vi (0 = CLO1, 1 = CLO2...)
"topicIds": ["<id của topic x1>", "<id của topic x2>"],
"objectiveIds": [], // CHỌN ID TỪ DANH SÁCH "Mục tiêu cụ thể MOET" bên dưới dựa trên sự tương đồng ngữ nghĩa.
"soIds": [], // CHỌN ID TỪ DANH SÁCH "Student Outcomes (SOs)" bên dưới dựa trên sự tương đồng ngữ nghĩa.
"piIds": [] // CHỌN ID TỪ DANH SÁCH "Performance Indicators (PIs)" bên dưới.
}
],
"assessmentConfigType": "THEORY", // "THEORY" hoặc "PRACTICE" hoặc "PROJECT"
"theoryAssessmentConfig": {
"processWeight": 50,
"attendanceWeight": 10,
"participationWeight": 10,
"midtermWeight": 20,
"finalProcessWeight": 0,
"selfStudyWeight": 10,
"finalExamWeight": 50, // finalExamWeight + processWeight PHẢI BẰNG 100
"finalExamDuration": 90,
"finalExamAllowMaterials": false,
"finalExamMaterialsDetail": "Không sử dụng tài liệu",
"regularTests": [
{
"id": "rt-<số ngẫu nhiên>",
"assessmentType": "midterm", // "participation", "midterm", "finalProcess", "selfStudy"
"form": "EXAM",
"contentIds": ["<id của topic x1>", "<id của subtopic x1.i>"],
"weekNo": 8,
"tool": "PAPER",
"submissionMethod": "HANDWRITTEN",
"weight": 10
}
],
"finalExamForms": [
{
"id": "fe-<số ngẫu nhiên>",
"form": "ESSAY",
"weight": 100 // Tổng các form phải = 100
}
]
},
"teachingMethodsDescription": {
"vi": "Mô tả phương pháp giảng dạy...",
"en": "Teaching method description..."
},
"coursePolicies": {
"vi": "Chính sách điểm danh, nộp bài...",
"en": "Course Policies"
},
"scheduleNumWeeks": 15,
"schedule": [
{
"weekNo": 1,
"topicIds": ["<id của subtopic x1.i1>", "<id của subtopic x1.i2>"]
}
]
}
DANH SÁCH CẤU HÌNH HỆ THỐNG MẶC ĐỊNH (BẮT BUỘC SỬ DỤNG ĐÚNG ID ĐỂ MAPPING):
Danh sách Giảng viên (Dùng cho instructorIds):
${facultiesStr}
Danh sách Mục tiêu cụ thể MOET (Dùng cho cloMap.objectiveIds):
${specificObjectivesStr}
Danh sách Chuẩn đầu ra Quốc tế - Student Outcomes (Dùng cho cloMap.soIds):
${studentOutcomesStr}
Danh sách Performance Indicators (Dùng cho cloMap.piIds):
${performanceIndicatorsStr}
Phương pháp giảng dạy (activities.methodId): ${teachingMethodsStr}
Loại đánh giá quá trình (regularTests.form): ${assessmentCategoriesStr}
Hình thức nộp bài (regularTests.submissionMethod): ${submissionMethodsStr}
Công cụ kiểm tra (regularTests.tool): ${assessmentToolsStr}
Hình thức thi cuối học phần (finalExamForms.form): ${finalAssessmentMethodsStr}
QUY TẮC TOÁN HỌC:
Các thành phần trọng số quá trình (attendanceWeight + participationWeight + midtermWeight + finalProcessWeight + selfStudyWeight) = processWeight.
processWeight + finalExamWeight = 100.
Tổng weight của finalExamForms phải = 100.
Hãy phân tích, ánh xạ đúng ID và điền dữ liệu cẩn thận. Luôn chú ý Trích dẫn đầy đủ các chương (Topic), mục (subTopic) và không bỏ sót. Ánh xạ các chuẩn đầu ra (CLOs) với các Objectives, SOs một cách logic nhất. Nếu bạn đã hiểu, hãy trả lời: "SẴN SÀNG NHẬN DỮ LIỆU", KHÔNG giải thích thêm. Ở lượt tiếp theo khi tôi gửi dữ liệu thô, bạn PHẢI trả về JSON.`;
};

const normalizeLocalizedString = (val: any): { vi: string, en: string } => {
    if (typeof val === 'string') {
        return { vi: val, en: val };
    }
    if (typeof val === 'object' && val !== null) {
        return {
            vi: String(val.vi || val.en || val.text || ''),
            en: String(val.en || val.vi || val.text || '')
        };
    }
    return { vi: '', en: '' };
};

const normalizeLocalizedArray = (arr: any): { vi: string, en: string }[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map(normalizeLocalizedString);
};

const normalizeClos = (val: any): { vi: string[], en: string[] } => {
    if (Array.isArray(val)) {
        const strArr = val.map(String);
        return { vi: strArr, en: strArr };
    }
    if (typeof val === 'object' && val !== null) {
        return {
            vi: Array.isArray(val.vi) ? val.vi.map(String) : [],
            en: Array.isArray(val.en) ? val.en.map(String) : []
        };
    }
    return { vi: [], en: [] };
};

export const SyllabusAIImport: React.FC<SyllabusAIImportProps> = ({ course, state, updateCourse, language }) => {
    const globalState = state.globalState || state;
    const currentProgram = state.programs?.find(p => p.id === state.currentProgramId) || state;
    const globalConfigs = globalState.globalConfigs || state;
    const organizationStructure = globalState.organizationStructure || state;
    const teachingMethods = globalConfigs.teachingMethods || state.teachingMethods;
    const assessmentMethods = globalConfigs.assessmentMethods || state.assessmentMethods;
    const assessmentCategories = globalConfigs.assessmentCategories || state.assessmentCategories;
    const submissionMethods = globalConfigs.submissionMethods || state.submissionMethods;
    const assessmentTools = globalConfigs.assessmentTools || state.assessmentTools;
    const finalAssessmentMethods = globalConfigs.finalAssessmentMethods || state.finalAssessmentMethods;
    const faculties = organizationStructure.faculties || state.faculties;

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiJsonInput, setAiJsonInput] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    // Mapping Modal States
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [mappingTab, setMappingTab] = useState<'syllabus' | 'plan' | 'assessment'>('syllabus');
    const [unmatchedFields, setUnmatchedFields] = useState<{path: string, value: string, type: string, matchedId?: string}[]>([]);
    const [fieldMappings, setFieldMappings] = useState<Record<string, string | 'REMOVE'>>({});
    const [pendingAIData, setPendingAIData] = useState<any>(null);

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(getSyllabusFullAiPrompt(state));
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const triggerImport = () => {
        try {
            const cleanedInput = aiJsonInput.replace(/```json\n?|\n?```/gi, '').trim();
            const parsed = JSON.parse(cleanedInput);
            handleAIImportSuccess(parsed);
        } catch (e) {
            alert(language === 'vi' ? "JSON không hợp lệ. Vui lòng kiểm tra lại cấu trúc!" : "Invalid JSON. Please check the structure!");
        }
    };

    const handleAIImportSuccess = (rawData: any) => {
        try {
            // Normalize data
            const data = { ...rawData };

            if (data.description) data.description = normalizeLocalizedString(data.description);
            if (data.clos) data.clos = normalizeClos(data.clos);
            
            if (data.objectives) {
                data.objectives = {
                    general: normalizeLocalizedString(data.objectives.general),
                    specific: {
                        knowledge: normalizeLocalizedArray(data.objectives.specific?.knowledge),
                        skills: normalizeLocalizedArray(data.objectives.specific?.skills),
                        responsibility: normalizeLocalizedArray(data.objectives.specific?.responsibility)
                    }
                };
            }

            if (Array.isArray(data.topics)) {
                data.topics = data.topics.map((t: any) => ({
                    ...t,
                    topic: normalizeLocalizedString(t.topic),
                    subTopics: Array.isArray(t.subTopics) ? t.subTopics.map((st: any) => ({
                        ...st,
                        topic: normalizeLocalizedString(st.topic)
                    })) : []
                }));
            }

            if (Array.isArray(data.assessmentPlan)) {
                data.assessmentPlan = data.assessmentPlan.map((a: any) => ({
                    ...a,
                    type: normalizeLocalizedString(a.type)
                }));
            }

            if (data.teachingMethodsDescription) data.teachingMethodsDescription = normalizeLocalizedString(data.teachingMethodsDescription);
            if (data.coursePolicies) data.coursePolicies = normalizeLocalizedString(data.coursePolicies);
            if (data.classOrganizationForm) data.classOrganizationForm = normalizeLocalizedString(data.classOrganizationForm);

            const extractedFields: {path: string, value: string, type: string, matchedId?: string}[] = [];
            
            // Check teaching methods
            if (Array.isArray(data.topics)) {
                data.topics.forEach((t: any, tIdx: number) => {
                    if (Array.isArray(t.subTopics)) {
                        t.subTopics.forEach((st: any, stIdx: number) => {
                            if (Array.isArray(st.activities)) {
                                st.activities.forEach((act: any, aIdx: number) => {
                                    const typeStr = String(act.methodId || act.type || '');
                                    if (typeStr) {
                                        const matchedMethod = teachingMethods.find((tm: any) => 
                                            tm.id === typeStr || (tm.code.toLowerCase() === typeStr.toLowerCase() || (tm.name?.vi || '').toLowerCase().includes(typeStr.toLowerCase()) || (tm.name?.en || '').toLowerCase().includes(typeStr.toLowerCase()))
                                        );
                                        extractedFields.push({
                                            path: `topics[${tIdx}].subTopics[${stIdx}].activities[${aIdx}].methodId`,
                                            value: typeStr,
                                            type: 'teachingMethod',
                                            matchedId: matchedMethod?.id
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }

            // Check assessment methods, categories, submission methods, tools
            if (Array.isArray(data.assessmentPlan)) {
                data.assessmentPlan.forEach((a: any, aIdx: number) => {
                    const methodStr = String(a.methodId || a.type?.vi || a.type?.en || a.type || '');
                    if (methodStr) {
                        const matchedMethod = assessmentMethods.find((am: AssessmentMethod) => {
                            return am.id === methodStr || (String(am.name?.vi || '').toLowerCase().includes(methodStr.toLowerCase())) || 
                                   (String(am.name?.en || '').toLowerCase().includes(methodStr.toLowerCase()));
                        });
                        extractedFields.push({
                            path: `assessmentPlan[${aIdx}].methodId`,
                            value: methodStr,
                            type: 'assessmentMethod',
                            matchedId: matchedMethod?.id
                        });
                    }

                    const catStr = String(a.categoryId || a.category || a.form || '');
                    if (catStr) {
                        const matchedCat = assessmentCategories?.find((c: any) => c.id === catStr || c.vi.toLowerCase() === catStr.toLowerCase() || c.en.toLowerCase() === catStr.toLowerCase());
                        extractedFields.push({
                            path: `assessmentPlan[${aIdx}].categoryId`,
                            value: catStr,
                            type: 'assessmentCategory',
                            matchedId: matchedCat?.id
                        });
                    }

                    const subStr = String(a.submissionMethodId || a.submissionMethod || '');
                    if (subStr) {
                        const matchedSub = submissionMethods?.find((c: any) => c.id === subStr || c.vi.toLowerCase() === subStr.toLowerCase() || c.en.toLowerCase() === subStr.toLowerCase());
                        extractedFields.push({
                            path: `assessmentPlan[${aIdx}].submissionMethodId`,
                            value: subStr,
                            type: 'submissionMethod',
                            matchedId: matchedSub?.id
                        });
                    }

                    const toolStr = String(a.toolId || a.tool || a.assessmentTool || '');
                    if (toolStr) {
                        const matchedTool = assessmentTools?.find((c: any) => c.id === toolStr || c.vi.toLowerCase() === toolStr.toLowerCase() || c.en.toLowerCase() === toolStr.toLowerCase());
                        extractedFields.push({
                            path: `assessmentPlan[${aIdx}].toolId`,
                            value: toolStr,
                            type: 'assessmentTool',
                            matchedId: matchedTool?.id
                        });
                    }
                });
            }

            // Check theoryAssessmentConfig
            if (data.theoryAssessmentConfig) {
                if (Array.isArray(data.theoryAssessmentConfig.regularTests)) {
                    data.theoryAssessmentConfig.regularTests.forEach((rt: any, rtIdx: number) => {
                        const formStr = String(rt.form || '');
                        if (formStr) {
                            const matchedCat = assessmentCategories?.find((c: any) => c.id === formStr || c.vi.toLowerCase() === formStr.toLowerCase() || c.en.toLowerCase() === formStr.toLowerCase());
                            extractedFields.push({
                                path: `theoryAssessmentConfig.regularTests[${rtIdx}].form`,
                                value: formStr,
                                type: 'assessmentCategory',
                                matchedId: matchedCat?.id
                            });
                        }
                        const toolStr = String(rt.tool || '');
                        if (toolStr) {
                            const matchedTool = assessmentTools?.find((c: any) => c.id === toolStr || c.vi.toLowerCase() === toolStr.toLowerCase() || c.en.toLowerCase() === toolStr.toLowerCase());
                            extractedFields.push({
                                path: `theoryAssessmentConfig.regularTests[${rtIdx}].tool`,
                                value: toolStr,
                                type: 'assessmentTool',
                                matchedId: matchedTool?.id
                            });
                        }
                        const subStr = String(rt.submissionMethod || '');
                        if (subStr) {
                            const matchedSub = submissionMethods?.find((c: any) => c.id === subStr || c.vi.toLowerCase() === subStr.toLowerCase() || c.en.toLowerCase() === subStr.toLowerCase());
                            extractedFields.push({
                                path: `theoryAssessmentConfig.regularTests[${rtIdx}].submissionMethod`,
                                value: subStr,
                                type: 'submissionMethod',
                                matchedId: matchedSub?.id
                            });
                        }
                    });
                }
                
                // ĐÃ SỬA: Dùng finalAssessmentMethods cho phần Thi kết thúc học phần
                if (Array.isArray(data.theoryAssessmentConfig.finalExamForms)) {
                    data.theoryAssessmentConfig.finalExamForms.forEach((fef: any, fefIdx: number) => {
                        const formStr = String(fef.form || '');
                        if (formStr) {
                            const matchedCat = finalAssessmentMethods?.find((c: any) => c.id === formStr || c.vi.toLowerCase() === formStr.toLowerCase() || c.en.toLowerCase() === formStr.toLowerCase());
                            extractedFields.push({
                                path: `theoryAssessmentConfig.finalExamForms[${fefIdx}].form`,
                                value: formStr,
                                type: 'finalAssessmentMethod', // Loại mới
                                matchedId: matchedCat?.id
                            });
                        }
                    });
                }
            }

            // Deduplicate extracted fields
            const uniqueExtracted = extractedFields.reduce((acc, current) => {
                const x = acc.find(item => item.value === current.value && item.type === current.type);
                if (!x) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, [] as typeof extractedFields);

            // Pre-fill mappings for matched items
            const initialMappings: Record<string, string> = {};
            uniqueExtracted.forEach(u => {
                const key = `${u.type}:${u.value}`;
                if (u.matchedId) {
                    initialMappings[key] = u.matchedId;
                }
            });

            setUnmatchedFields(uniqueExtracted as any);
            setFieldMappings(initialMappings);
            setPendingAIData(data);
            
            // Đóng modal AI Builder và mở modal Mapping
            setIsAIModalOpen(false);
            setShowMappingModal(true);
        } catch (error: unknown) {
            alert(`Lỗi xử lý dữ liệu JSON.`);
        }
    };

    const applyAIData = (data: any, mappings: Record<string, string | 'REMOVE'>) => {
        try {
            const updates: Partial<Course> = {};

            if (data.description) updates.description = data.description;
            if (data.clos) updates.clos = data.clos;
            if (data.objectives) updates.objectives = data.objectives;
            
            // Cập nhật InstructorIds nếu AI có cung cấp
            if (data.instructorIds && Array.isArray(data.instructorIds)) {
                updates.instructorIds = data.instructorIds;
            }
            
            if (data.teachingMethodsDescription) updates.teachingMethodsDescription = data.teachingMethodsDescription;
            if (data.coursePolicies) updates.coursePolicies = data.coursePolicies;
            if (data.classOrganizationForm) updates.classOrganizationForm = data.classOrganizationForm;
            if (data.assessmentConfigType) updates.assessmentConfigType = data.assessmentConfigType;
            if (data.scheduleNumWeeks) updates.scheduleNumWeeks = data.scheduleNumWeeks;
            if (data.practiceAssessmentConfig) updates.practiceAssessmentConfig = data.practiceAssessmentConfig;
            if (data.projectAssessmentConfig) updates.projectAssessmentConfig = data.projectAssessmentConfig;

            const topicNoToIdMap: Record<string, string> = {};

            if (Array.isArray(data.textbooks)) {
                updates.textbooks = data.textbooks.map((tb: any) => ({
                    resourceId: tb.resourceId ? String(tb.resourceId) : "lib-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
                    title: String(tb.title || ''), author: String(tb.author || ''), publisher: String(tb.publisher || ''), year: String(tb.year || ''), type: (tb.type === 'textbook' ? 'textbook' : 'reference'), url: String(tb.url || ''), isEbook: !!tb.isEbook, isPrinted: tb.isPrinted !== false
                }));
            }

            if (Array.isArray(data.topics)) {
                 updates.topics = data.topics.map((t: any, idx: number) => {
                     const topicId = t.id ? String(t.id) : "t-" + Date.now() + "-" + idx;
                     const topicNo = t.no ? String(t.no) : String(idx + 1);
                     topicNoToIdMap[topicNo] = topicId;

                     const subTopics = Array.isArray(t.subTopics) ? t.subTopics.map((st: any, sIdx: number) => {
                         const subTopicId = st.id ? String(st.id) : "st-" + Date.now() + "-" + idx + "-" + sIdx;
                         const subTopicNo = st.no ? String(st.no) : String(idx + 1) + "." + String(sIdx + 1);
                         topicNoToIdMap[subTopicNo] = subTopicId;

                         const activities = Array.isArray(st.activities) ? st.activities.map((act: any) => {
                             const typeStr = String(act.methodId || act.type || '');
                             const mappingKey = `teachingMethod:${typeStr}`;
                             
                             if (!typeStr || !mappings[mappingKey] || mappings[mappingKey] === 'REMOVE') {
                                 return null;
                             }
                             const methodId = mappings[mappingKey] as string;

                             return {
                                 methodId: methodId,
                                 hours: typeof act.hours === 'number' ? act.hours : 0
                             };
                         }).filter(Boolean) : [];
                         return {
                             id: subTopicId,
                             no: subTopicNo,
                             topic: st.topic || { vi: '', en: '' },
                             activities: activities,
                             requirement: st.requirement || 'must_know'
                         };
                     }) : [];

                     return {
                         id: topicId,
                         no: topicNo,
                         topic: t.topic || { vi: '', en: '' },
                         activities: [], 
                         subTopics: subTopics,
                         readingRefs: t.readingRefs || []
                     };
                 });
            }

            if (Array.isArray(data.schedule)) {
                updates.schedule = data.schedule.map((s: any) => ({
                    weekNo: s.weekNo,
                    topicIds: Array.isArray(s.topicIds) ? s.topicIds.map((id: string) => topicNoToIdMap[id] || id) : []
                }));
            }

            if (data.theoryAssessmentConfig) {
                const tac = { ...data.theoryAssessmentConfig };
                if (Array.isArray(tac.regularTests)) {
                    tac.regularTests = tac.regularTests.map((rt: any, idx: number) => {
                        const formStr = String(rt.form || '');
                        const formMappingKey = `assessmentCategory:${formStr}`;
                        let formId = '';
                        if (!formStr || !mappings[formMappingKey] || mappings[formMappingKey] === 'REMOVE') {
                            formId = '';
                        } else {
                            formId = mappings[formMappingKey] as string;
                        }

                        const toolStr = String(rt.tool || '');
                        const toolMappingKey = `assessmentTool:${toolStr}`;
                        let toolId = '';
                        if (!toolStr || !mappings[toolMappingKey] || mappings[toolMappingKey] === 'REMOVE') {
                            toolId = '';
                        } else {
                            toolId = mappings[toolMappingKey] as string;
                        }

                        const subStr = String(rt.submissionMethod || '');
                        const subMappingKey = `submissionMethod:${subStr}`;
                        let subId = '';
                        if (!subStr || !mappings[subMappingKey] || mappings[subMappingKey] === 'REMOVE') {
                            subId = '';
                        } else {
                            subId = mappings[subMappingKey] as string;
                        }

                        return {
                            ...rt,
                            id: rt.id ? String(rt.id) : "rt-" + Date.now() + "-" + idx,
                            form: formId,
                            tool: toolId,
                            submissionMethod: subId,
                            contentIds: Array.isArray(rt.contentIds) ? rt.contentIds.map((id: string) => topicNoToIdMap[id] || id) : []
                        };
                    });
                }
                
                // ĐÃ SỬA: Sử dụng finalAssessmentMethod
                if (Array.isArray(tac.finalExamForms)) {
                    tac.finalExamForms = tac.finalExamForms.map((fef: any, idx: number) => {
                        const formStr = String(fef.form || '');
                        const formMappingKey = `finalAssessmentMethod:${formStr}`;
                        let formId = '';
                        if (!formStr || !mappings[formMappingKey] || mappings[formMappingKey] === 'REMOVE') {
                            formId = '';
                        } else {
                            formId = mappings[formMappingKey] as string;
                        }
                        return {
                            ...fef,
                            id: fef.id ? String(fef.id) : "fef-" + Date.now() + "-" + idx,
                            form: formId
                        };
                    });
                }
                updates.theoryAssessmentConfig = tac;
            }

            if (Array.isArray(data.assessmentPlan)) {
                updates.assessmentPlan = data.assessmentPlan.map((a: any, idx: number) => {
                     const methodStr = String(a.methodId || a.type?.vi || a.type?.en || a.type || '');
                     const methodMappingKey = `assessmentMethod:${methodStr}`;
                     
                     if (!methodStr || !mappings[methodMappingKey] || mappings[methodMappingKey] === 'REMOVE') {
                         return null;
                     }
                     const methodId = mappings[methodMappingKey] as string;

                     const catStr = String(a.categoryId || a.category || a.form || '');
                     const catMappingKey = `assessmentCategory:${catStr}`;
                     let categoryId = '';
                     if (!catStr || !mappings[catMappingKey] || mappings[catMappingKey] === 'REMOVE') {
                         categoryId = '';
                     } else {
                         categoryId = mappings[catMappingKey] as string;
                     }

                     const subStr = String(a.submissionMethodId || a.submissionMethod || '');
                     const subMappingKey = `submissionMethod:${subStr}`;
                     let submissionMethodId = '';
                     if (!subStr || !mappings[subMappingKey] || mappings[subMappingKey] === 'REMOVE') {
                         submissionMethodId = '';
                     } else {
                         submissionMethodId = mappings[subMappingKey] as string;
                     }

                     const toolStr = String(a.toolId || a.tool || a.assessmentTool || '');
                     const toolMappingKey = `assessmentTool:${toolStr}`;
                     let toolId = '';
                     if (!toolStr || !mappings[toolMappingKey] || mappings[toolMappingKey] === 'REMOVE') {
                         toolId = '';
                     } else {
                         toolId = mappings[toolMappingKey] as string;
                     }

                     return { 
                         id: a.id ? String(a.id) : "a-" + Date.now() + "-" + idx, 
                         methodId: methodId, 
                         type: a.type || { vi: '', en: '' }, 
                         percentile: typeof a.percentile === 'number' ? a.percentile : 0,
                         form: categoryId,
                         submissionMethod: submissionMethodId,
                         assessmentTool: toolId
                     };
                }).filter(Boolean);
            }

            updateCourse(updates);
            setPendingAIData(null);
            setUnmatchedFields([]);
            setFieldMappings({});
            setShowMappingModal(false);
            setIsAIModalOpen(false);
            alert(language === 'vi' ? "Cập nhật dữ liệu từ AI thành công!" : "Successfully updated syllabus from AI!");

        } catch (error: unknown) {
            alert(`Lỗi import dữ liệu. Vui lòng kiểm tra lại cấu trúc JSON.`);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsAIModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm border border-indigo-100"
            >
                <Bot size={18} />
                {language === 'vi' ? 'AI Hỗ trợ' : 'AI Assistant'}
            </button>

            {/* MÀN HÌNH BƯỚC 1 & 2: LẤY PROMPT VÀ DÁN JSON */}
            {isAIModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAIModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[95vh]" onClick={e => e.stopPropagation()}>
                        
                        {/* Body (Scrollable) */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-10">
                            
                            {/* Step 1 */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">1</div>
                                    <h4 className="font-bold text-slate-800 text-lg">
                                        {language === 'vi' ? 'Lấy Prompt mẫu' : 'Get Prompt Template'}
                                    </h4>
                                </div>
                                <p className="text-sm text-slate-500 ml-11 mb-5">
                                    {language === 'vi' 
                                        ? 'Copy prompt này và gửi cho AI (ChatGPT, Gemini) để tạo mã JSON cấu hình chuẩn.' 
                                        : 'Copy this prompt and send it to AI (ChatGPT, Gemini) to generate standard JSON code.'}
                                </p>
                                <div className="ml-11">
                                    <button 
                                        onClick={handleCopyPrompt}
                                        className={`w-full py-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                                            isCopied 
                                                ? 'bg-purple-50 text-purple-600 border-purple-200' 
                                                : 'bg-white text-purple-600 border-purple-100 hover:bg-purple-50 hover:border-purple-200'
                                        }`}
                                    >
                                        {isCopied ? (
                                            <><Check size={20} /> {language === 'vi' ? 'Đã sao chép vào Clipboard!' : 'Copied to Clipboard!'}</>
                                        ) : (
                                            <><Copy size={20} /> {language === 'vi' ? 'Sao chép Prompt vào Clipboard' : 'Copy Prompt to Clipboard'}</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">2</div>
                                    <h4 className="font-bold text-slate-800 text-lg">
                                        {language === 'vi' ? 'Dán mã JSON từ AI' : 'Paste JSON code from AI'}
                                    </h4>
                                </div>
                                <div className="ml-11">
                                    <textarea
                                        value={aiJsonInput}
                                        onChange={(e) => setAiJsonInput(e.target.value)}
                                        className="w-full h-80 p-5 bg-[#0f172a] text-emerald-400 font-mono text-sm rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none shadow-inner leading-relaxed"
                                        placeholder={`{\n  "description": {\n    "vi": "...",\n    "en": "..."\n  },\n  ...\n}`}
                                        spellCheck={false}
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end items-center gap-4 shrink-0">
                            <button 
                                onClick={() => setIsAIModalOpen(false)}
                                className="text-slate-500 hover:text-slate-700 font-medium px-4 py-2 transition-colors"
                            >
                                {language === 'vi' ? 'Hủy' : 'Cancel'}
                            </button>
                            <button 
                                onClick={triggerImport}
                                disabled={!aiJsonInput.trim()}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-colors"
                            >
                                {language === 'vi' ? 'Kiểm tra & Xem trước' : 'Check & Preview'} <ArrowRight size={18} />
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* MÀN HÌNH BƯỚC 3: MAPPING DỮ LIỆU CŨ */}
            {showMappingModal && pendingAIData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Bot size={20} className="text-indigo-600" />
                                {language === 'vi' ? 'Đồng bộ dữ liệu AI' : 'Synchronize AI Data'}
                            </h3>
                            <button onClick={() => {
                                setShowMappingModal(false);
                                setPendingAIData(null);
                                setUnmatchedFields([]);
                                setFieldMappings({});
                            }} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex border-b border-slate-200 bg-slate-50">
                            <button onClick={() => setMappingTab('syllabus')} className={`px-4 py-3 text-sm font-bold border-b-2 ${mappingTab === 'syllabus' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                {language === 'vi' ? 'Đề cương' : 'Syllabus'}
                            </button>
                            <button onClick={() => setMappingTab('plan')} className={`px-4 py-3 text-sm font-bold border-b-2 ${mappingTab === 'plan' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                {language === 'vi' ? 'Kế hoạch' : 'Plan'}
                            </button>
                            <button onClick={() => setMappingTab('assessment')} className={`px-4 py-3 text-sm font-bold border-b-2 ${mappingTab === 'assessment' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                {language === 'vi' ? 'Đánh giá' : 'Assessment'}
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50">
                            {mappingTab === 'syllabus' && (
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-2">{language === 'vi' ? 'Mô tả môn học' : 'Course Description'}</h4>
                                        <p className="text-sm text-slate-600">{pendingAIData?.description?.vi || pendingAIData?.description?.en || '-'}</p>
                                    </div>
                                    
                                    {/* MỚI: Hiển thị Giảng viên được phân công */}
                                    {pendingAIData?.instructorIds && pendingAIData.instructorIds.length > 0 && (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <h4 className="font-bold text-slate-800 mb-2">{language === 'vi' ? 'Giảng viên phân công' : 'Assigned Instructors'}</h4>
                                            <ul className="list-disc pl-5 text-sm text-slate-600">
                                                {pendingAIData.instructorIds.map((id: string, i: number) => {
                                                    const fac = faculties.find((f: any) => f.id === id);
                                                    return <li key={i}>{fac ? `${fac.name.vi} (${fac.email})` : `ID: ${id}`}</li>;
                                                })}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-2">{language === 'vi' ? 'Chuẩn đầu ra (CLOs)' : 'Course Learning Outcomes (CLOs)'}</h4>
                                        <ul className="list-disc pl-5 text-sm text-slate-600">
                                            {(pendingAIData?.clos?.vi || pendingAIData?.clos?.en || []).map((clo: string, i: number) => <li key={i}>{clo}</li>)}
                                        </ul>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-2">{language === 'vi' ? 'Mục tiêu môn học' : 'Course Objectives'}</h4>
                                        <p className="text-sm text-slate-600 font-semibold">{language === 'vi' ? 'Chung:' : 'General:'}</p>
                                        <p className="text-sm text-slate-600 mb-2">{pendingAIData?.objectives?.general?.vi || pendingAIData?.objectives?.general?.en || '-'}</p>
                                        <p className="text-sm text-slate-600 font-semibold">{language === 'vi' ? 'Kiến thức:' : 'Knowledge:'}</p>
                                        <ul className="list-disc pl-5 text-sm text-slate-600 mb-2">
                                            {(pendingAIData?.objectives?.specific?.knowledge || []).map((obj: any, i: number) => <li key={i}>{obj.vi || obj.en || obj}</li>)}
                                        </ul>
                                        <p className="text-sm text-slate-600 font-semibold">{language === 'vi' ? 'Kỹ năng:' : 'Skills:'}</p>
                                        <ul className="list-disc pl-5 text-sm text-slate-600 mb-2">
                                            {(pendingAIData?.objectives?.specific?.skills || []).map((obj: any, i: number) => <li key={i}>{obj.vi || obj.en || obj}</li>)}
                                        </ul>
                                        <p className="text-sm text-slate-600 font-semibold">{language === 'vi' ? 'Thái độ:' : 'Responsibility:'}</p>
                                        <ul className="list-disc pl-5 text-sm text-slate-600">
                                            {(pendingAIData?.objectives?.specific?.responsibility || []).map((obj: any, i: number) => <li key={i}>{obj.vi || obj.en || obj}</li>)}
                                        </ul>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-2">{language === 'vi' ? 'Tài liệu tham khảo' : 'Textbooks'}</h4>
                                        <ul className="list-disc pl-5 text-sm text-slate-600">
                                            {(pendingAIData?.textbooks || []).map((tb: any, i: number) => (
                                                <li key={i}>{tb.title} - {tb.author} ({tb.year}) - {tb.publisher} [{tb.type}]</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-2">{language === 'vi' ? 'Mô tả phương pháp giảng dạy' : 'Teaching Methods Description'}</h4>
                                        <p className="text-sm text-slate-600">{pendingAIData?.teachingMethodsDescription?.vi || pendingAIData?.teachingMethodsDescription?.en || '-'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-2">{language === 'vi' ? 'Chính sách môn học' : 'Course Policies'}</h4>
                                        <p className="text-sm text-slate-600">{pendingAIData?.coursePolicies?.vi || pendingAIData?.coursePolicies?.en || '-'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-2">{language === 'vi' ? 'Hình thức tổ chức lớp học' : 'Class Organization Form'}</h4>
                                        <p className="text-sm text-slate-600">{pendingAIData?.classOrganizationForm?.vi || pendingAIData?.classOrganizationForm?.en || '-'}</p>
                                    </div>
                                </div>
                            )}

                            {mappingTab === 'plan' && (
                                <div className="space-y-4">
                                    {(pendingAIData?.topics || []).map((topic: any, tIdx: number) => (
                                        <div key={tIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <h4 className="font-bold text-slate-800 mb-3">{topic.no}. {topic.topic?.vi || topic.topic?.en || '-'}</h4>
                                            <div className="space-y-3 pl-4 border-l-2 border-indigo-100">
                                                {(topic.subTopics || []).map((st: any, stIdx: number) => (
                                                    <div key={stIdx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                        <p className="font-medium text-slate-700 text-sm mb-2">{st.no}. {st.topic?.vi || st.topic?.en || '-'}</p>
                                                        <div className="space-y-2">
                                                            {(st.activities || []).map((act: any, aIdx: number) => {
                                                                const typeStr = String(act.methodId || act.type || '');
                                                                const mappingKey = `teachingMethod:${typeStr}`;
                                                                const isMatched = !!fieldMappings[mappingKey] && fieldMappings[mappingKey] !== 'REMOVE';
                                                                const isRemoved = fieldMappings[mappingKey] === 'REMOVE';
                                                                return (
                                                                    <div key={aIdx} className={`flex items-center gap-3 p-2 rounded border ${isRemoved ? 'bg-red-50 border-red-200' : isMatched ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                                                        <div className="flex-1">
                                                                            <span className="text-xs font-medium text-slate-600 block">{language === 'vi' ? 'Phương pháp từ AI:' : 'AI Method:'}</span>
                                                                            <span className="text-sm font-bold text-slate-800">{typeStr || '-'} ({act.hours}h)</span>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <select 
                                                                                className="w-full text-sm p-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
                                                                                value={fieldMappings[mappingKey] || ''}
                                                                                onChange={e => setFieldMappings(prev => ({...prev, [mappingKey]: e.target.value}))}
                                                                            >
                                                                                <option value="" disabled>{language === 'vi' ? '-- Chọn ánh xạ --' : '-- Select mapping --'}</option>
                                                                                <option value="REMOVE">❌ {language === 'vi' ? 'Loại bỏ' : 'Remove'}</option>
                                                                                {teachingMethods.map((tm: any) => (
                                                                                    <option key={tm.id} value={tm.id}>{tm.code} - {tm.name.vi}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {pendingAIData?.schedule && (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4">
                                            <h4 className="font-bold text-slate-800 mb-3">{language === 'vi' ? 'Kế hoạch giảng dạy' : 'Schedule'} ({pendingAIData.scheduleNumWeeks || 15} {language === 'vi' ? 'tuần' : 'weeks'})</h4>
                                            <div className="space-y-2">
                                                {(pendingAIData.schedule || []).map((s: any, sIdx: number) => (
                                                    <div key={sIdx} className="flex gap-4 p-2 border-b border-slate-100 last:border-0">
                                                        <div className="font-medium text-slate-700 w-20">{language === 'vi' ? 'Tuần' : 'Week'} {s.weekNo}</div>
                                                        <div className="text-sm text-slate-600">
                                                            {language === 'vi' ? 'Chủ đề:' : 'Topics:'} {(s.topicIds || []).join(', ')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {mappingTab === 'assessment' && (
                                <div className="space-y-4">
                                    {pendingAIData?.assessmentConfigType && (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <h4 className="font-bold text-slate-800 mb-2">{language === 'vi' ? 'Loại đánh giá' : 'Assessment Type'}</h4>
                                            <p className="text-sm font-medium text-indigo-600">{pendingAIData.assessmentConfigType}</p>
                                        </div>
                                    )}

                                    {pendingAIData?.assessmentConfigType === 'THEORY' && pendingAIData?.theoryAssessmentConfig && (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <h4 className="font-bold text-slate-800 mb-3">{language === 'vi' ? 'Cấu hình đánh giá lý thuyết' : 'Theory Assessment Config'}</h4>
                                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                <div><span className="text-slate-500">{language === 'vi' ? 'Trọng số quá trình:' : 'Process Weight:'}</span> <span className="font-medium">{pendingAIData.theoryAssessmentConfig.processWeight}%</span></div>
                                                <div><span className="text-slate-500">{language === 'vi' ? 'Trọng số cuối kỳ:' : 'Final Exam Weight:'}</span> <span className="font-medium">{pendingAIData.theoryAssessmentConfig.finalExamWeight}%</span></div>
                                            </div>
                                            
                                            <h5 className="font-semibold text-slate-700 mb-2 mt-4">{language === 'vi' ? 'Đánh giá thường xuyên' : 'Regular Tests'}</h5>
                                            <div className="space-y-3">
                                                {(pendingAIData.theoryAssessmentConfig.regularTests || []).map((rt: any, rtIdx: number) => {
                                                    const formStr = String(rt.form || '');
                                                    const formMappingKey = `assessmentCategory:${formStr}`;
                                                    const isFormMatched = !!fieldMappings[formMappingKey] && fieldMappings[formMappingKey] !== 'REMOVE';

                                                    const toolStr = String(rt.tool || '');
                                                    const toolMappingKey = `assessmentTool:${toolStr}`;
                                                    const isToolMatched = !!fieldMappings[toolMappingKey] && fieldMappings[toolMappingKey] !== 'REMOVE';

                                                    const subStr = String(rt.submissionMethod || '');
                                                    const subMappingKey = `submissionMethod:${subStr}`;
                                                    const isSubMatched = !!fieldMappings[subMappingKey] && fieldMappings[subMappingKey] !== 'REMOVE';

                                                    return (
                                                        <div key={rtIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                            <div className="flex justify-between mb-2">
                                                                <span className="text-sm font-medium">{language === 'vi' ? 'Bài' : 'Test'} {rtIdx + 1} ({rt.weight}%) - {language === 'vi' ? 'Tuần' : 'Week'} {rt.weekNo}</span>
                                                                <span className="text-xs text-slate-500">{language === 'vi' ? 'Nội dung:' : 'Content:'} {(rt.contentIds || []).join(', ')}</span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className={`flex items-center gap-3 p-2 rounded border ${fieldMappings[formMappingKey] === 'REMOVE' ? 'bg-red-50 border-red-200' : isFormMatched ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                                                    <span className="w-1/3 text-xs font-medium text-slate-600">{language === 'vi' ? 'Loại ĐG:' : 'Category:'} {formStr}</span>
                                                                    <select 
                                                                        className="flex-1 text-sm p-1.5 border border-slate-300 rounded"
                                                                        value={fieldMappings[formMappingKey] || ''}
                                                                        onChange={e => setFieldMappings(prev => ({...prev, [formMappingKey]: e.target.value}))}
                                                                    >
                                                                        <option value="" disabled>-- {language === 'vi' ? 'Chọn' : 'Select'} --</option>
                                                                        <option value="REMOVE">❌ {language === 'vi' ? 'Loại bỏ' : 'Remove'}</option>
                                                                        {assessmentCategories?.map((c: any) => <option key={c.id} value={c.id}>{c.vi}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className={`flex items-center gap-3 p-2 rounded border ${fieldMappings[toolMappingKey] === 'REMOVE' ? 'bg-red-50 border-red-200' : isToolMatched ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                                                    <span className="w-1/3 text-xs font-medium text-slate-600">{language === 'vi' ? 'Công cụ:' : 'Tool:'} {toolStr}</span>
                                                                    <select 
                                                                        className="flex-1 text-sm p-1.5 border border-slate-300 rounded"
                                                                        value={fieldMappings[toolMappingKey] || ''}
                                                                        onChange={e => setFieldMappings(prev => ({...prev, [toolMappingKey]: e.target.value}))}
                                                                    >
                                                                        <option value="" disabled>-- {language === 'vi' ? 'Chọn' : 'Select'} --</option>
                                                                        <option value="REMOVE">❌ {language === 'vi' ? 'Loại bỏ' : 'Remove'}</option>
                                                                        {assessmentTools?.map((c: any) => <option key={c.id} value={c.id}>{c.vi}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className={`flex items-center gap-3 p-2 rounded border ${fieldMappings[subMappingKey] === 'REMOVE' ? 'bg-red-50 border-red-200' : isSubMatched ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                                                    <span className="w-1/3 text-xs font-medium text-slate-600">{language === 'vi' ? 'Hình thức nộp:' : 'Submission:'} {subStr}</span>
                                                                    <select 
                                                                        className="flex-1 text-sm p-1.5 border border-slate-300 rounded"
                                                                        value={fieldMappings[subMappingKey] || ''}
                                                                        onChange={e => setFieldMappings(prev => ({...prev, [subMappingKey]: e.target.value}))}
                                                                    >
                                                                        <option value="" disabled>-- {language === 'vi' ? 'Chọn' : 'Select'} --</option>
                                                                        <option value="REMOVE">❌ {language === 'vi' ? 'Loại bỏ' : 'Remove'}</option>
                                                                        {submissionMethods?.map((c: any) => <option key={c.id} value={c.id}>{c.vi}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <h5 className="font-semibold text-slate-700 mb-2 mt-4">{language === 'vi' ? 'Thi cuối kỳ' : 'Final Exam'}</h5>
                                            <div className="space-y-3">
                                                {(pendingAIData.theoryAssessmentConfig.finalExamForms || []).map((fef: any, fefIdx: number) => {
                                                    const formStr = String(fef.form || '');
                                                    // ĐÃ SỬA: Map theo finalAssessmentMethod
                                                    const formMappingKey = `finalAssessmentMethod:${formStr}`;
                                                    const isFormMatched = !!fieldMappings[formMappingKey] && fieldMappings[formMappingKey] !== 'REMOVE';

                                                    return (
                                                        <div key={fefIdx} className={`flex items-center gap-3 p-2 rounded border ${fieldMappings[formMappingKey] === 'REMOVE' ? 'bg-red-50 border-red-200' : isFormMatched ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                                            <span className="w-1/3 text-xs font-medium text-slate-600">{language === 'vi' ? 'Loại ĐG:' : 'Category:'} {formStr} ({fef.weight}%)</span>
                                                            <select 
                                                                className="flex-1 text-sm p-1.5 border border-slate-300 rounded"
                                                                value={fieldMappings[formMappingKey] || ''}
                                                                onChange={e => setFieldMappings(prev => ({...prev, [formMappingKey]: e.target.value}))}
                                                            >
                                                                <option value="" disabled>-- {language === 'vi' ? 'Chọn' : 'Select'} --</option>
                                                                <option value="REMOVE">❌ {language === 'vi' ? 'Loại bỏ' : 'Remove'}</option>
                                                                {/* ĐÃ SỬA: Gọi finalAssessmentMethods */}
                                                                {finalAssessmentMethods?.map((c: any) => <option key={c.id} value={c.id}>{c.vi}</option>)}
                                                            </select>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {pendingAIData?.assessmentConfigType === 'PRACTICE' && pendingAIData?.practiceAssessmentConfig && (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <h4 className="font-bold text-slate-800 mb-3">{language === 'vi' ? 'Cấu hình đánh giá thực hành' : 'Practice Assessment Config'}</h4>
                                            <p className="text-sm text-slate-600 mb-2"><span className="font-medium">{language === 'vi' ? 'Tiêu chí:' : 'Criteria:'}</span> {pendingAIData.practiceAssessmentConfig.criteria}</p>
                                            <div className="space-y-2">
                                                {(pendingAIData.practiceAssessmentConfig.items || []).map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded border border-slate-100 text-sm">
                                                        <span>{item.task}</span>
                                                        <span className="font-medium text-indigo-600">{item.weight}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {pendingAIData?.assessmentConfigType === 'PROJECT' && pendingAIData?.projectAssessmentConfig && (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <h4 className="font-bold text-slate-800 mb-3">{language === 'vi' ? 'Cấu hình đánh giá đồ án' : 'Project Assessment Config'}</h4>
                                            <p className="text-sm text-slate-600"><span className="font-medium">{language === 'vi' ? 'Tiêu chí:' : 'Criteria:'}</span> {pendingAIData.projectAssessmentConfig.criteria}</p>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button 
                                onClick={() => {
                                    setShowMappingModal(false);
                                    setPendingAIData(null);
                                    setUnmatchedFields([]);
                                    setFieldMappings({});
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                {language === 'vi' ? 'Hủy' : 'Cancel'}
                            </button>
                            <button 
                                onClick={() => {
                                    applyAIData(pendingAIData, fieldMappings);
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Check size={16} />
                                {language === 'vi' ? 'Xác nhận & Nhập' : 'Confirm & Import'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SyllabusAIImport;