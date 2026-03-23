import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign, PageBreak, TableOfContents, StyleLevel, HeadingLevel, Footer, PageNumber } from "docx";
import { Course, AssessmentMethod, Language, GeneralInfo, Faculty, TeachingMethod, SO, Department, AcademicFaculty, AcademicSchool, AppState, MoetStructureNode } from '../types';
import { sortOutlineCode } from '../utils/sortOutline';

// IMPORT PART 1 CHUẨN
import { syllabusPart1Service } from './syllabusPart1';
import { syllabusPart2Service } from './syllabusPart2';
import { syllabusPart3Service } from './syllabusPart3';
import { syllabusPart4Service } from './syllabusPart4';

// Constants for formatting
const FONT_FAMILY = "Times New Roman";
const FONT_SIZE_H1 = 26; // 13pt
const FONT_SIZE_H2 = 26; // 13pt
const FONT_SIZE_BODY = 26; // 13pt
const TABLE_FONT_SIZE = 26; // 13pt

const styles = {
    h1: { font: FONT_FAMILY, size: FONT_SIZE_H1, bold: true, color: "000000" },
    h2: { font: FONT_FAMILY, size: FONT_SIZE_H2, bold: true },
    body: { font: FONT_FAMILY, size: FONT_SIZE_BODY },
    tableHeader: { font: FONT_FAMILY, size: TABLE_FONT_SIZE, bold: true },
    tableBody: { font: FONT_FAMILY, size: TABLE_FONT_SIZE },
};

// Regex to identify patterns that should be bolded: [TEXT n], [REF n], CONT. n, CLO.n
const BOLD_PATTERNS = /(\[(?:TEXT|REF)\s+\d+\]|CONT\.\s*\d+|CLO\.\d+)/g;

// Helper to clean HTML
const htmlToText = (html: string) => {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    let text = tempDiv.textContent || "";
    return text.replace(/\n\s*\n/g, "\n\n").trim();
};

const createPara = (text: string, style: any, align: any = AlignmentType.LEFT, indent: number = 0) => {
    const lines = (text || "").split('\n');
    const runs = [];
    for (let i = 0; i < lines.length; i++) {
        const segments = lines[i].split(BOLD_PATTERNS);
        segments.forEach(seg => {
            if (seg) {
                const isMatch = BOLD_PATTERNS.test(seg);
                runs.push(new TextRun({ 
                    text: seg, 
                    ...style, 
                    bold: style.bold || isMatch 
                }));
            }
        });
        if (i < lines.length - 1) runs.push(new TextRun({ break: 1 }));
    }
    return new Paragraph({
        children: runs,
        alignment: align,
        spacing: { after: 120, line: 276 },
        indent: { left: indent }
    });
};

const createTableCell = (content: Paragraph | Paragraph[], shadingFill?: string, vAlign: any = VerticalAlign.CENTER, colSpan: number = 1, rowSpan: number = 1, widthPercent?: number) => {
    return new TableCell({
        children: Array.isArray(content) ? content : [content],
        verticalAlign: vAlign,
        shading: shadingFill ? { fill: shadingFill } : undefined,
        columnSpan: colSpan,
        rowSpan: rowSpan,
        width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined
    });
};

// --- HÀM TẠO ĐỀ CƯƠNG CHI TIẾT ĐẦY ĐỦ 4 PHẦN (DÙNG CHUNG CHO PROGRAM DOC) ---
export const generateFullSyllabusElements = async (
    course: Course,
    index: number, // Vẫn nhận index nhưng không in ra số thứ tự
    language: Language,
    state: AppState
) => {
    const globalState = state.globalState;
    const globalConfigs = globalState?.globalConfigs;
    const courseCatalog = globalState?.courseCatalog || state.courses || [];
    const generalInfo = globalState?.institutionInfo || state.generalInfo;
    const teachingMethods = globalConfigs?.teachingMethods || state.teachingMethods || [];
    const knowledgeAreas = globalConfigs?.knowledgeAreas || state.knowledgeAreas || [];

    const elements: any[] = [];
    const syllabusHeader = language === 'vi' ? "ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN" : "DETAILED COURSE SYLLABUS";
    
    elements.push(
        new Paragraph({
            children: [new TextRun({ text: syllabusHeader.toUpperCase(), font: "Times New Roman", size: 26, bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        })
    );

    elements.push(
        new Paragraph({
            children: [new TextRun({ text: course.name[language].toUpperCase(), font: "Times New Roman", size: 26, bold: true })],
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1, 
            spacing: { after: 240 }
        })
    );

    // GỌI PART 1 CHUẨN
    const part1Content = await syllabusPart1Service.generateContent({
        course,
        allCourses: courseCatalog,
        teachingMethods: teachingMethods,
        generalInfo: generalInfo,
        knowledgeAreas: knowledgeAreas, 
        language
    });

    const part2Content = await syllabusPart2Service.generateContent({
        course,
        teachingMethods: teachingMethods,
        language
    });

    const part3Content = await syllabusPart3Service.generateContent({
        course,
        teachingMethods: teachingMethods,
        language
    });

    const part4Content = await syllabusPart4Service.generateContent({
        course,
        state,
        language
    });

    elements.push(...part1Content, ...part2Content, ...part3Content, ...part4Content);
    return elements;
};


// --- HÀM TẠO BẢN TÓM TẮT ĐỀ CƯƠNG (BẢNG RÚT GỌN) ---
export const generateSingleSyllabusContent = (
    course: Course, 
    index: number,
    assessmentMethods: AssessmentMethod[],
    language: Language,
    generalInfo: GeneralInfo,
    faculties: Faculty[],
    teachingMethods: TeachingMethod[],
    sos: SO[],
    departments: Department[],
    academicFaculties: AcademicFaculty[],
    academicSchools: AcademicSchool[],
    matrixType: 'ABET' | 'MOET' = 'MOET'
) => {
    const content: any[] = [];
    const labels = language === 'vi' ? {
        syllabusHeader: "ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN",
        creditHours: "Số tín chỉ", instructorInfo: "Thông tin Giảng viên", classInfo: "Thông tin Lớp học",
        textbook: "Giáo trình", references: "Tài liệu tham khảo", description: "Mô tả học phần",
        department: "Bộ môn", prereq: "Tiên quyết", coreq: "Song hành", status: "Loại hình",
        required: "Bắt buộc (R)", selectedElective: "Tự chọn định hướng (SE)", elective: "Tự chọn tự do (E)",
        topics: "NỘI DUNG ĐỀ MỤC & THỜI KHÓA", contentNo: "STT", time: "Thời lượng", topic: "Nội dung", readings: "Tài liệu đọc",
        assessment: "KẾ HOẠCH ĐÁNH GIÁ", assessmentType: "Hình thức", assessDesc: "Mô tả", percentile: "Tỷ lệ", total: "Tổng cộng",
        clos: "CHUẨN ĐẦU RA HỌC PHẦN (CLOs)", closIntro: "Sau khi hoàn thành học phần này, sinh viên có khả năng:",
        relationship: matrixType === 'MOET' 
            ? "MA TRẬN QUAN HỆ GIỮA CĐR HỌC PHẦN (CLOs) VÀ CĐR CHƯƠNG TRÌNH (PLOs)"
            : "MA TRẬN QUAN HỆ GIỮA CĐR HỌC PHẦN (CLOs) VÀ LIÊN KẾT VỚI SOs CỦA/LINKED INTERNATIONAL ACCREDITATION",
        cloCol: "CĐR Học phần", topicCol: "Nội dung", methodCol: "Phương pháp giảng dạy", assessCol: "Hình thức đánh giá", levelCol: "Mức độ", 
        soCol: matrixType === 'MOET' ? "CĐR Chương trình (PLOs)" : "Liên kết với SOs của/Linked international accreditation",
        credit: "tín chỉ",
        legend: "Ghi chú: Mức độ đáp ứng: L = Thấp, M = Trung bình, và H = Cao.",
        head: "TRƯỞNG BỘ MÔN", lecturer: "GIẢNG VIÊN BIÊN SOẠN",
        semester: "Học kỳ",
        office: "Văn phòng", officeHours: "Giờ ở văn phòng", tel: "Tel", cell: "Cell", email: "Email"
    } : {
        syllabusHeader: "DETAILED COURSE SYLLABUS",
        creditHours: "No. of Credit Hours", instructorInfo: "Instructor Information", classInfo: "Class Information",
        textbook: "Textbook", references: "Reference Materials", description: "Course Description",
        department: "Department", prereq: "Prerequisite(s)", coreq: "Co-requisite(s)", status: "Course Status",
        required: "Required (R)", selectedElective: "Selected Elective (SE)", elective: "Elective (E)",
        topics: "COURSE TOPICS & SCHEDULES", contentNo: "Content No.", time: "Amount of Time", topic: "Course Topic", readings: "Readings",
        assessment: "COURSE ASSESSMENT PLAN", assessmentType: "Assessment Type", assessDesc: "Description", percentile: "Grade Percentile", total: "Total",
        clos: "COURSE LEARNING OUTCOMES (CLOs)", closIntro: "Upon completion of this course, the student should be able to:",
        relationship: matrixType === 'MOET'
            ? "RELATIONSHIP BETWEEN CLOs AND PLOs"
            : "RELATIONSHIP BETWEEN CLOs AND LINKED INTERNATIONAL ACCREDITATION",
        cloCol: "CLO", topicCol: "Topics", methodCol: "Methodology", assessCol: "Assessment", levelCol: "Level", 
        soCol: matrixType === 'MOET' ? "PLOs" : "Linked international accreditation",
        credit: "credit(s)",
        legend: "Legend: Response level: L = Low, M = Medium, and H = High.",
        head: "HEAD OF DEPARTMENT", lecturer: "LECTURER",
        semester: "Semester",
        office: "Office", officeHours: "Office Hours", tel: "Tel", cell: "Cell", email: "Email"
    };

    // 1. Header Section
    content.push(
        new Paragraph({
            children: [new TextRun({ text: labels.syllabusHeader.toUpperCase(), ...styles.h1 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        })
    );

    // Line 1: Course Name (Normal Case), Heading 1, Center Align, Bold, Size 13pt - KHÔNG CÒN SỐ THỨ TỰ
    content.push(
        new Paragraph({
            children: [new TextRun({ text: course.name[language].toUpperCase(), ...styles.h1 })],
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120 }
        })
    );

    // Line 2: Managing Faculty (Center Align)
    const dept = departments.find(d => d.id === course.departmentId);
    const facultyObj = academicFaculties.find(f => f.id === dept?.academicFacultyId);
    const facultyName = facultyObj ? facultyObj.name[language] : (generalInfo.school[language] || "N/A");
    
    content.push(createPara(facultyName.toUpperCase(), styles.body, AlignmentType.CENTER));

    // Line 3: CODE - NAME UPPERCASE (Center Align)
    const courseCodeName = `${course.code} - ${course.name[language].toUpperCase()}`;
    content.push(createPara(courseCodeName, { ...styles.body, bold: true }, AlignmentType.CENTER));

    // Line 4: Semester (Center Align)
    content.push(createPara(`${labels.semester}: ${course.semester}`, styles.body, AlignmentType.CENTER));
    
    content.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    // 2. Info Table (Credit, Instructor, Class Info)
    const mainInstructorId = course.instructorIds.find(id => course.instructorDetails[id]?.isMain) || course.instructorIds[0];
    const faculty = faculties.find(f => f.id === mainInstructorId);
    
    const instructorRuns: TextRun[] = [];
    if (faculty) {
        instructorRuns.push(new TextRun({ text: faculty.name[language].toUpperCase(), ...styles.tableBody, bold: true }));
        instructorRuns.push(new TextRun({ break: 1 }));
        
        const addLine = (label: string, value: string | undefined) => {
            instructorRuns.push(new TextRun({ text: label + ": ", ...styles.tableBody, bold: true }));
            instructorRuns.push(new TextRun({ text: value || "", ...styles.tableBody }));
            instructorRuns.push(new TextRun({ break: 1 }));
        };

        addLine(labels.office, faculty.office);
        addLine(labels.officeHours, faculty.officeHours);
        addLine(labels.email, faculty.email);
        addLine(labels.tel, faculty.tel);
        if (faculty.cell) addLine(labels.cell, faculty.cell);
    } else {
        instructorRuns.push(new TextRun({ text: "N/A", ...styles.tableBody }));
    }
    const instructorPara = new Paragraph({ children: instructorRuns, spacing: { after: 120, line: 276 } });

    const classInfoStr = mainInstructorId && course.instructorDetails[mainInstructorId]?.classInfo || "N/A";

    const methodHours: Record<string, number> = {};
    course.topics.forEach(t => { t.activities.forEach(a => { methodHours[a.methodId] = (methodHours[a.methodId] || 0) + a.hours; }); });
    const creditDetails = Object.entries(methodHours).map(([mid, hours]) => {
        const method = teachingMethods.find(tm => tm.id === mid);
        if (!method) return null;
        const val = Math.ceil(hours / (method.hoursPerCredit || 15)); 
        return val > 0 ? `${method.code}: ${val}` : null;
    }).filter(Boolean).join(', ');
    
    const creditString = `${course.credits} ${labels.credit}${creditDetails ? `\n(${creditDetails})` : ''}`;

    content.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [
                createTableCell(createPara(labels.creditHours, styles.tableHeader, AlignmentType.CENTER), "E0E0E0"),
                createTableCell(createPara(labels.instructorInfo, styles.tableHeader, AlignmentType.CENTER), "E0E0E0"),
                createTableCell(createPara(labels.classInfo, styles.tableHeader, AlignmentType.CENTER), "E0E0E0"),
            ]}),
            new TableRow({ children: [
                createTableCell(createPara(creditString, styles.tableBody, AlignmentType.CENTER), undefined, VerticalAlign.TOP, 1, 1),
                new TableCell({ children: [instructorPara], verticalAlign: VerticalAlign.TOP }), 
                createTableCell(createPara(classInfoStr, styles.tableBody), undefined, VerticalAlign.TOP, 1, 1),
            ]})
        ]
    }));
    content.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    // 3. Textbooks & Description
    const textbooksList = course.textbooks.filter(t => t.type === 'textbook');
    const refsList = course.textbooks.filter(t => t.type === 'reference');

    content.push(createPara(labels.textbook + ":", styles.h2));
    if (textbooksList.length > 0) {
        textbooksList.forEach((tb, i) => content.push(createPara(`[TEXT ${i + 1}] ${tb.author} (${tb.year}). ${tb.title}. ${tb.publisher}.`, styles.body)));
    } else {
        content.push(createPara("N/A", styles.body));
    }
    content.push(new Paragraph({ text: "", spacing: { after: 100 } }));

    content.push(createPara(labels.references + ":", styles.h2));
    if (refsList.length > 0) {
        refsList.forEach((ref, i) => content.push(createPara(`[REF ${i + 1}] ${ref.author} (${ref.year}). ${ref.title}. ${ref.publisher}.`, styles.body)));
    } else {
        content.push(createPara("N/A", styles.body));
    }
    content.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    content.push(createPara(labels.description + ":", styles.h2));
    content.push(createPara(htmlToText(course.description[language]), styles.body));
    content.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    // 4. Program Context
    const check = (val: boolean) => val ? '[×]' : '[ ]';
    const statusText = `${check(course.type === 'REQUIRED')} ${labels.required}\n${check(course.type === 'SELECTED_ELECTIVE')} ${labels.selectedElective}\n${check(course.type === 'ELECTIVE')} ${labels.elective}`;
    
    const assignedDept = departments.find(d => d.id === course.departmentId);
    const deptName = assignedDept ? assignedDept.name[language] : (language === 'vi' ? "N/A" : "N/A");

    content.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [createTableCell(createPara(`${labels.department}: ${deptName}`, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 3)]}),
            new TableRow({ children: [
                createTableCell(createPara(labels.prereq, styles.tableHeader), undefined, undefined, 1, 1, 30),
                createTableCell(createPara(labels.coreq, styles.tableHeader), undefined, undefined, 1, 1, 30),
                createTableCell(createPara(labels.status, styles.tableHeader), undefined, undefined, 1, 1, 40),
            ]}),
            new TableRow({ children: [
                createTableCell(createPara(course.prerequisites.join(', ') || 'N/A', styles.tableBody), undefined, undefined, 1, 1, 30),
                createTableCell(createPara(course.coRequisites.join(', ') || 'N/A', styles.tableBody), undefined, undefined, 1, 1, 30),
                createTableCell(createPara(statusText, styles.tableBody), undefined, undefined, 1, 1, 40),
            ]})
        ]
    }));
    content.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    // 5. Topics
    content.push(createPara(labels.topics, styles.h2, AlignmentType.CENTER));
    const topicRows = course.topics.map(t => {
        const timeDetails = (t.activities || []).map(a => {
            const method = teachingMethods.find(m => m.id === a.methodId);
            const code = method ? method.code : 'OTH';
            return `${code}: ${a.hours}hrs`;
        }).join('\n'); 

        const readings = (t.readingRefs || []).map(r => {
            const textIndex = textbooksList.findIndex(tb => tb.resourceId === r.resourceId);
            if (textIndex !== -1) return `[TEXT ${textIndex + 1}]${r.pageRange ? ` pp. ${r.pageRange}` : ''}`;
            
            const refIndex = refsList.findIndex(ref => ref.resourceId === r.resourceId);
            if (refIndex !== -1) return `[REF ${refIndex + 1}]${r.pageRange ? ` pp. ${r.pageRange}` : ''}`;
            
            return '';
        }).filter(Boolean).join('\n');

        return new TableRow({
            children: [
                createTableCell(createPara(t.no, styles.tableBody, AlignmentType.CENTER)),
                createTableCell(createPara(timeDetails || "0hrs", styles.tableBody, AlignmentType.CENTER)),
                createTableCell(createPara(t.topic[language], styles.tableBody)),
                createTableCell(createPara(readings, styles.tableBody)),
            ]
        });
    });
    
    content.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [
                createTableCell(createPara(labels.contentNo, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 1, 1, 10),
                createTableCell(createPara(labels.time, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 1, 1, 15),
                createTableCell(createPara(labels.topic, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 1, 1, 55),
                createTableCell(createPara(labels.readings, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 1, 1, 20),
            ]}),
            ...topicRows
        ]
    }));
    content.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    // 6. Assessment
    content.push(createPara(labels.assessment, styles.h2, AlignmentType.CENTER));
    const assessmentRows = course.assessmentPlan.map(a => {
        const method = assessmentMethods.find(m => m.id === a.methodId);
        const methodName = method ? method.name[language] : '';
        const description = a.type[language] || ''; 
        
        return new TableRow({
            children: [
                createTableCell(createPara(methodName, styles.tableBody)),
                createTableCell(createPara(description, styles.tableBody)),
                createTableCell(createPara(`${a.percentile}%`, styles.tableBody, AlignmentType.CENTER)),
            ]
        });
    });

    assessmentRows.push(new TableRow({
        children: [
            createTableCell(createPara(labels.total, styles.tableHeader), undefined, undefined, 2, 1),
            createTableCell(createPara("100%", styles.tableHeader, AlignmentType.CENTER)),
        ]
    }));

    content.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [
                createTableCell(createPara(labels.assessmentType, styles.tableHeader), "E0E0E0"),
                createTableCell(createPara(labels.assessDesc, styles.tableHeader), "E0E0E0"),
                createTableCell(createPara(labels.percentile, styles.tableHeader, AlignmentType.CENTER), "E0E0E0"),
            ]}),
            ...assessmentRows
        ]
    }));
    content.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    // 7. CLOs
    content.push(createPara(labels.clos, styles.h2));
    content.push(createPara(labels.closIntro, styles.body));
    (course.clos[language] || []).forEach((clo, i) => {
        content.push(createPara(`CLO.${i + 1}  ${clo}`, styles.body, AlignmentType.LEFT, 720)); 
    });
    content.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    // 8. Matrix
    const sortedObjectives = [...(generalInfo.moetInfo.specificObjectives || [])]
        .filter(o => (o.code ? o.code.split('.').length : 3) === 3)
        .sort((a,b) => sortOutlineCode(a.code, b.code));

    const getObjectiveLabel = (id: string) => {
        const obj = sortedObjectives.find(o => o.id === id);
        return obj?.code || '?';
    };

    content.push(createPara(labels.relationship, styles.h2, AlignmentType.CENTER));
    
    const matrixRows = (course.clos[language] || []).map((_, i) => {
        const map = course.cloMap?.find(m => m.cloIndex === i) || { topicIds: [], teachingMethodIds: [], assessmentMethodIds: [], coverageLevel: '', soIds: [], objectiveIds: [], piIds: [] };
        
        const topicNos = map.topicIds.map(tid => course.topics.find(t => t.id === tid)?.no).filter(Boolean).join('\n');
        const methods = map.teachingMethodIds.map(mid => teachingMethods.find(m => m.id === mid)?.code).filter(Boolean).join(', ');
        const assess = map.assessmentMethodIds.map(aid => assessmentMethods.find(m => m.id === aid)?.name[language]).filter(Boolean).join('\n');
        const displayLevel = map.coverageLevel || "";
        let mappedLabels = "";
        
        if (matrixType === 'MOET') {
            mappedLabels = (map.objectiveIds || []).map(oid => getObjectiveLabel(oid)).filter(l => l !== '?').sort().join(', ');
        } else {
            mappedLabels = (map.soIds || []).map(sid => {
                const so = sos.find(s => s.id === sid);
                return so ? so.code.replace('SO-', '') : '';
            }).filter(Boolean).sort().join(', ');
        }

        return new TableRow({
            children: [
                createTableCell(createPara(`CLO.${i+1}`, styles.tableBody, AlignmentType.CENTER)),
                createTableCell(createPara(topicNos, styles.tableBody, AlignmentType.CENTER)),
                createTableCell(createPara(methods, styles.tableBody, AlignmentType.CENTER)),
                createTableCell(createPara(assess, styles.tableBody, AlignmentType.CENTER)),
                createTableCell(createPara(map.coverageLevel || "", styles.tableBody, AlignmentType.CENTER)),
                createTableCell(createPara(mappedLabels, styles.tableBody, AlignmentType.CENTER)),
            ]
        });
    });

    content.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [
                createTableCell(createPara(labels.cloCol, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 1, 1, 15),
                createTableCell(createPara(labels.topicCol, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 1, 1, 15),
                createTableCell(createPara(labels.methodCol, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 1, 1, 25),
                createTableCell(createPara(labels.assessCol, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 1, 1, 25),
                createTableCell(createPara(labels.levelCol, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 1, 1, 10),
                createTableCell(createPara(labels.soCol, styles.tableHeader, AlignmentType.CENTER), "E0E0E0", undefined, 1, 1, 10),
            ]}),
            ...matrixRows
        ]
    }));
    content.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    content.push(createPara(labels.legend, { ...styles.body, italics: true }));
    content.push(new Paragraph({ text: "", spacing: { after: 400 } }));

    // 9. Signatures
    const today = new Date();
    const city = generalInfo.city?.[language] || (language === 'vi' ? 'Đà Nẵng' : 'Da Nang');
    const dateStr = language === 'vi' 
        ? `${city}, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`
        : `${city}, ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    
    content.push(new Paragraph({ 
        children: [new TextRun({ text: dateStr, ...styles.body, bold: true })], 
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 } 
    }));

    content.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
        rows: [
            new TableRow({ children: [
                createTableCell(createPara(labels.head, styles.h2, AlignmentType.CENTER)),
                createTableCell(createPara(labels.lecturer, styles.h2, AlignmentType.CENTER)),
            ]})
        ]
    }));

    return content;
};

// --- HÀM XUẤT 1 FILE TÓM TẮT ĐỀ CƯƠNG ---
export const downloadSingleSyllabus = async (
    type: 'ABET' | 'MOET',
    course: Course, 
    index: number,
    assessmentMethods: AssessmentMethod[],
    language: Language,
    generalInfo: GeneralInfo,
    faculties: Faculty[],
    teachingMethods: TeachingMethod[],
    sos: SO[],
    departments: Department[],
    academicFaculties: AcademicFaculty[],
    academicSchools: AcademicSchool[]
) => {
    const content = generateSingleSyllabusContent(
        course, index, assessmentMethods, language, generalInfo, faculties, 
        teachingMethods, sos, departments, academicFaculties, academicSchools, type
    );

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: { size: 26, font: "Times New Roman", color: "000000" },
                    paragraph: { spacing: { line: 276, before: 0, after: 0 } }
                }
            }
        },
        sections: [{
            properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
            children: content
        }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const typeSuffix = type === 'MOET' ? 'MOET' : 'ABET';
    link.download = `Syllabus_${typeSuffix}_${course.code}.docx`;
    link.click();
};

// --- HÀM XUẤT TOÀN BỘ ĐỀ CƯƠNG VÀO 1 FILE WORD ĐỘC LẬP ---
export const exportMoetSyllabus = async (state: AppState) => {
    const globalState = state.globalState;
    const currentProgram = state.programs?.find(p => p.id === state.currentProgramId);
    const courseCatalog = globalState?.courseCatalog || state.courses || [];
    const generalInfo = globalState?.institutionInfo || state.generalInfo;
    const moetInfo = currentProgram?.moetInfo || state.generalInfo?.moetInfo;
    const { language } = state;
    try {
        const physIds = new Set<string>();
        (moetInfo?.programStructure?.phys || []).forEach((id: string) => physIds.add(id));
        (moetInfo?.subBlocks || []).forEach((sb: any) => {
            if (sb.parentBlockId === 'phys') {
                sb.courseIds.forEach((id: string) => physIds.add(id));
            }
        });

        const getCourseIdsInOrder = (nodes: any[], parentId: string | null = null): string[] => {
            const levelNodes = nodes.filter(n => n.parentId === parentId).sort((a, b) => a.order - b.order);
            let ids: string[] = [];
            levelNodes.forEach(node => {
                ids = [...ids, ...(node.courseIds || [])];
                ids = [...ids, ...getCourseIdsInOrder(nodes, node.id)];
            });
            return ids;
        };

        const structureNodes = moetInfo?.structure || [];
        const orderedCourseIds = getCourseIdsInOrder(structureNodes);
        const uniqueOrderedIds = Array.from(new Set(orderedCourseIds)).filter(id => !physIds.has(id));
        const orderedCourses = uniqueOrderedIds.map(id => courseCatalog.find((c: any) => c.id === id)).filter((c): c is Course => !!c);

        const finalCourses = orderedCourses.length > 0 ? orderedCourses : [...courseCatalog]
            .filter(c => !physIds.has(c.id))
            .sort((a,b) => a.semester - b.semester || a.code.localeCompare(b.code));
            
        const allChildren: any[] = [];
        const title = language === 'vi' ? "DANH MỤC ĐỀ CƯƠNG CHI TIẾT CÁC HỌC PHẦN" : "LIST OF COURSE SYLLABI";
        
        allChildren.push(
            new Paragraph({
                children: [new TextRun({ text: title, ...styles.h1, size: 26 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400, before: 400 }
            })
        );

        allChildren.push(new TableOfContents("Summary", {
            hyperlink: true,
            headingStyleRange: "1-1",
            stylesWithLevels: [new StyleLevel("Heading1", 1)]
        }));

        for (let i = 0; i < finalCourses.length; i++) {
            const course = finalCourses[i];
            allChildren.push(new Paragraph({ children: [new PageBreak()] }));
            
            const syllabusElements = await generateFullSyllabusElements(course, i + 1, language, state);
            allChildren.push(...syllabusElements);
        }

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: { size: 26, font: "Times New Roman", color: "000000" },
                        paragraph: { spacing: { line: 276, before: 0, after: 0 } }
                    }
                }
            },
            sections: [{
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
                children: allChildren
            }]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const progName = currentProgram?.programName?.[language] || (state.generalInfo as any)?.programName?.[language] || "Program";
        link.download = `MOET_Full_Syllabus_${progName.replace(/\s+/g, '_')}.docx`;
        link.click();
    } catch (e) {
        console.error(e);
        alert("Error creating Syllabus DOCX");
    }
};