import { Document, Packer, Paragraph, PageBreak, Footer, TextRun, AlignmentType, PageNumber, TableOfContents, StyleLevel, NumberFormat, HeadingLevel } from "docx";
import { AppState, CreditBlock } from '../types';
import { generateMoetPart1 } from './MoetP1';
import { generateMoetPart2 } from './MoetP2';
import { generateMoetPart3 } from './MoetP3';
import { generateMoetPart4 } from './MoetP4';

// Import hàm tái sử dụng từ MoetSyllabus
import { generateFullSyllabusElements } from './MoetSyllabusE';

export const exportMoetDocx = async (...args: any[]) => {
    try {
        let state: AppState;

        // 1. BỘ TỰ ĐỘNG NHẬN DIỆN THAM SỐ (ADAPTER)
        if (args.length === 1 && args[0].generalInfo && args[0].courses) {
            state = args[0]; 
        } else {
            console.warn("Hệ thống đang dùng cấu trúc truyền 15 tham số cũ. Đã tự động map lại dữ liệu.");
            state = {
                generalInfo: args[0],
                courses: args[2] || [],
                faculties: args[3] || [],
                language: args[4] || 'vi',
                teachingMethods: args[5] || [],
                assessmentMethods: args[6] || [],
                sos: args[7] || [],
                facultyTitles: args[8] || {},
                courseSoMap: args[9] || [],
                facilities: args[10] || [],
                departments: args[11] || [],
                academicFaculties: args[12] || [],
                academicSchools: args[13] || [],
                knowledgeAreas: args[14] || [], 
                creditBlocks: args[14] || [],
                assessmentCategories: [],
                assessmentTools: [],
                finalAssessmentMethods: []
            } as unknown as AppState;
        }

        const globalState = state.globalState || state;
        const globalConfigs = globalState.globalConfigs || state;
        const organizationStructure = globalState.organizationStructure || state;
        
        const generalInfo = globalState.institutionInfo || state.generalInfo;
        const courses = globalState.courseCatalog || state.courses || [];
        const faculties = organizationStructure.faculties || state.faculties || [];
        const teachingMethods = globalConfigs.teachingMethods || state.teachingMethods || [];
        const knowledgeAreas = globalConfigs.knowledgeAreas || state.knowledgeAreas || [];
        
        const {
            language = 'vi',
            courseSoMap = [],
            creditBlocks = []
        } = state;

        if (!generalInfo) {
            throw new Error("Dữ liệu GeneralInfo bị trống hoặc không hợp lệ!");
        }

        const moetInfo = generalInfo.moetInfo || (state as any).moetInfo || {};
        const safeBlocks: CreditBlock[] = (creditBlocks && creditBlocks.length > 0) ? creditBlocks : [];

        // --- SECTION 1: MAIN CONTENT (Part 1 - Part 4) ---
        const mainSectionChildren: any[] = [];

        // Part 1
        const part1 = generateMoetPart1(generalInfo, moetInfo, courses, language);
        mainSectionChildren.push(...part1);
        // Đã xóa PageBreak ở đây để văn bản nối tiếp

        // Part 2
        const part2 = generateMoetPart2(generalInfo, moetInfo, courses, teachingMethods, faculties, language, safeBlocks);
        mainSectionChildren.push(...part2);
        // Đã xóa PageBreak ở đây để văn bản nối tiếp

        // Part 3
        const part3 = generateMoetPart3(generalInfo, moetInfo, courses, language, courseSoMap);
        mainSectionChildren.push(...part3);
        // Đã xóa PageBreak ở đây để văn bản nối tiếp

        // Part 4
        const part4 = generateMoetPart4(generalInfo, moetInfo, language);
        mainSectionChildren.push(...part4);

        // --- SECTION 2: APPENDIX (FULL SYLLABI) ---
        const appendixSectionChildren: any[] = [];

        const appendixTitleText = language === 'vi' ? "PHỤ LỤC: ĐỀ CƯƠNG CHI TIẾT CÁC HỌC PHẦN" : "APPENDIX: DETAILED SYLLABI";
        appendixSectionChildren.push(
            new Paragraph({
                children: [
                    new TextRun({ 
                        text: appendixTitleText, 
                        font: "Times New Roman", 
                        size: 26, // 13pt
                        bold: true,
                        color: "000000"
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400, before: 400 }
            })
        );

        appendixSectionChildren.push(new TableOfContents("Summary", {
            hyperlink: true,
            headingStyleRange: "1-1",
            stylesWithLevels: [new StyleLevel("Heading1", 1)]
        }));

        appendixSectionChildren.push(new Paragraph({ children: [new PageBreak()] }));

        // Lọc môn học (Bỏ môn GD Thể chất/Quốc phòng bằng Optional Chaining an toàn)
        const physIds = new Set<string>();
        (moetInfo.programStructure?.phys || []).forEach((id: string) => physIds.add(id));
        (moetInfo.subBlocks || []).forEach((sb: any) => {
            if (sb.parentBlockId === 'phys') {
                (sb.courseIds || []).forEach((id: string) => physIds.add(id));
            }
        });

        const sortedCourses = [...courses]
            .filter(c => !physIds.has(c.id))
            .sort((a,b) => (a.semester || 0) - (b.semester || 0) || (a.code || "").localeCompare(b.code || ""));

        // Chèn Đề cương chi tiết từng môn
        for (let i = 0; i < sortedCourses.length; i++) {
            const course = sortedCourses[i];
            try {
                const syllabusElements = await generateFullSyllabusElements(course, i + 1, language, state);
                appendixSectionChildren.push(...syllabusElements);

                if (i < sortedCourses.length - 1) {
                    appendixSectionChildren.push(new Paragraph({ children: [new PageBreak()] }));
                }
            } catch (err) {
                console.error(`Lỗi khi tạo đề cương môn ${course.code || 'N/A'}:`, err);
            }
        }

        // --- GỘP THÀNH DOCUMENT ---
        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            size: 26, // 13pt
                            font: "Times New Roman",
                            color: "000000"
                        },
                        paragraph: {
                            spacing: { line: 276, before: 0, after: 0 } 
                        }
                    }
                }
            },
            sections: [
                // Phần 1: Văn bản chính (Part 1 - Part 4)
                {
                    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
                    footers: {
                        default: new Footer({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [new TextRun({ children: [PageNumber.CURRENT] })]
                                })
                            ]
                        })
                    },
                    children: mainSectionChildren
                },
                // Phần 2: Phụ lục (Tự động ngắt sang trang mới, đánh số trang có tiền tố "p-")
                {
                    properties: {
                        page: {
                            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
                            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL }
                        }
                    },
                    footers: {
                        default: new Footer({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun("p-"),
                                        new TextRun({ children: [PageNumber.CURRENT] })
                                    ]
                                })
                            ]
                        })
                    },
                    children: appendixSectionChildren
                }
            ]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        let progName = "Program";
        if (generalInfo?.programName) {
            progName = typeof generalInfo.programName === 'string' 
                ? generalInfo.programName 
                : (generalInfo.programName[language] || generalInfo.programName.vi || "Program");
        }
        const safeProgName = progName.replace(/[\/\\]/g, '_');

        link.download = `MOET_Full_Program_Doc_${safeProgName}.docx`;
        link.click();
        
    } catch (e) {
        console.error("Lỗi xuất file toàn chương trình:", e);
        alert("Đã xảy ra lỗi khi tạo file Word. Vui lòng kiểm tra màn hình Console (F12).");
    }
};