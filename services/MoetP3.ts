import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign, TextDirection, HeightRule } from "docx";
import { GeneralInfo, Language, MoetInfo, Course, IRM } from '../types';
import { sortOutlineCode } from '../utils/sortOutline';

// Formatting Constants
const FONT_FAMILY = "Times New Roman";
const FONT_SIZE_H1 = 26; // 13pt
const FONT_SIZE_BODY = 24; // 12pt
const TABLE_FONT_SIZE = 18; // 9pt (Font nhỏ để tiết kiệm diện tích)

const styles = {
    h1: { font: FONT_FAMILY, size: FONT_SIZE_H1, bold: true },
    body: { font: FONT_FAMILY, size: FONT_SIZE_BODY },
    tableHeader: { font: FONT_FAMILY, size: TABLE_FONT_SIZE, bold: true },
    tableBody: { font: FONT_FAMILY, size: TABLE_FONT_SIZE },
};

// Hàm tạo Paragraph an toàn (chống crash do undefined)
const createPara = (text: any, style: any, align: typeof AlignmentType[keyof typeof AlignmentType] = AlignmentType.LEFT) => {
    const safeText = String(text !== undefined && text !== null ? text : "");
    return new Paragraph({
        children: [new TextRun({ text: safeText, ...style })],
        alignment: align,
        spacing: { after: 60, before: 60, line: 240 }
    });
};

// Hàm chuyển đổi số sang La Mã
const toRoman = (num: number): string => {
    const lookup: Record<string, number> = {
        M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
    };
    let roman = '';
    for (const i in lookup) {
        while (num >= lookup[i]) {
            roman += i;
            num -= lookup[i];
        }
    }
    return roman;
};

// Hàm lấy danh sách học kỳ của một môn học một cách an toàn
const getCourseSemesters = (course: any): number[] => {
    if (!course || course.semester === undefined || course.semester === null) return [];
    if (Array.isArray(course.semester)) return course.semester.map(Number);
    if (typeof course.semester === 'number') return [course.semester];
    if (typeof course.semester === 'string') {
        return course.semester.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
    }
    return [];
};

// Hàm tính toán tổng tín chỉ cho các khối (Đồng bộ với MoetStructure.tsx)
interface PlanTotals {
    resolvedTotal: number;
    calculatedTotal: number;
    semesters: Record<number, number>;
}

const calculatePlanTotals = (node: any, courses: Course[], numSemesters: number): PlanTotals => {
    const result: PlanTotals = {
        resolvedTotal: 0,
        calculatedTotal: 0,
        semesters: {}
    };
    for (let i = 1; i <= numSemesters; i++) result.semesters[i] = 0;

    // Các môn học trực tiếp trong node
    (node.courseIds || []).forEach((cid: string) => {
        const course = courses.find(c => c.id === cid);
        if (course) {
            const credits = Number(course.credits) || 0;
            result.calculatedTotal += credits;
            result.resolvedTotal += credits;

            const sems = getCourseSemesters(course);
            if (sems.length > 0) {
                const creditPerSem = credits / sems.length;
                sems.forEach(sem => {
                    if (sem >= 1 && sem <= numSemesters) {
                        result.semesters[sem] += creditPerSem;
                    }
                });
            }
        }
    });

    // Gọi đệ quy cho các node con
    (node.children || []).forEach((child: any) => {
        const childTotals = calculatePlanTotals(child, courses, numSemesters);
        result.calculatedTotal += childTotals.calculatedTotal;
        result.resolvedTotal += childTotals.resolvedTotal;

        for (let i = 1; i <= numSemesters; i++) {
            result.semesters[i] += childTotals.semesters[i];
        }
    });

    // Ghi đè tổng số tín chỉ nếu node có cấu hình bắt buộc (Elective/Manual)
    if (node.level !== 'MODULE' && (node.type === 'ELECTIVE' || node.type === 'SELECTED_ELECTIVE') && node.requiredCredits) {
        result.resolvedTotal = Number(node.requiredCredits);
    } else if (node.manualCredits !== undefined) {
        result.resolvedTotal = Number(node.manualCredits);
    }

    // Làm tròn 1 chữ số thập phân
    result.resolvedTotal = Math.round(result.resolvedTotal * 10) / 10;
    result.calculatedTotal = Math.round(result.calculatedTotal * 10) / 10;
    for (let i = 1; i <= numSemesters; i++) {
        result.semesters[i] = Math.round(result.semesters[i] * 10) / 10;
    }

    return result;
};

export const generateMoetPart3 = (
    generalInfo: GeneralInfo, 
    moetInfo: any, 
    courses: Course[], 
    language: Language,
    courseSoMap?: any[],
    cloPloMap?: any[]
) => {
    const isVi = language === 'vi' || language !== 'en';
    const sections: any[] = [];
    const defaultBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };

    // ============================================================================
    // PHẦN 7: MA TRẬN LIÊN KẾT CÁC HỌC PHẦN VÀ CHUẨN ĐẦU RA
    // ============================================================================
    sections.push(new Paragraph({
        children: [new TextRun({ text: isVi ? "7. Ma trận liên kết các học phần và chuẩn đầu ra" : "7. Curriculum mapping matrix between courses and learning outcomes", ...styles.h1 })],
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120 }
    }));

    sections.push(new Paragraph({
        children: [new TextRun({ text: isVi ? "Ma trận liên kết các học phần trong chương trình và chuẩn đầu ra của chương trình đào tạo bao gồm: Kiến thức, Kỹ năng; Năng lực tự chủ và trách nhiệm (NLTC&TN)." : "The mapping matrix between courses in the program and the learning outcomes of the training program includes: Knowledge, Skills; Autonomy and Responsibility.", ...styles.body })],
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 432 }, 
        spacing: { after: 120, line: 276 }
    }));

    const specificObjectives = moetInfo?.specificObjectives || [];
    const sortedObjs = [...specificObjectives].sort((a: any, b: any) => sortOutlineCode(a.code, b.code));

    const level1Objs = sortedObjs.filter(o => o.code && o.code.split('.').length === 1);
    const level2Objs = sortedObjs.filter(o => o.code && o.code.split('.').length === 2);
    const level3Objs = sortedObjs.filter(o => o.code && o.code.split('.').length >= 3);

    const ploMap = new Map<string, string>();
    level3Objs.forEach((obj, idx) => {
        ploMap.set(obj.id, `PLO${idx + 1}`);
    });

    const getLevel3Count = (parentCode: string) => {
        return level3Objs.filter(l3 => l3.code.startsWith(parentCode + '.')).length;
    };

    const getDesc = (obj: any) => {
        if (!obj || !obj.description) return "";
        if (typeof obj.description === 'string') return obj.description;
        return obj.description[language] || obj.description.vi || "";
    };

    const orderedCourseIds = new Set<string>();
    const structureNodes = [...(moetInfo?.structure || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const extractCoursesFromTree = (parentId?: string) => {
        const children = structureNodes.filter(n => n.parentId === parentId);
        children.forEach(child => {
            if (Array.isArray(child.courseIds)) {
                child.courseIds.forEach((cid: string) => orderedCourseIds.add(cid));
            }
            extractCoursesFromTree(child.id);
        });
    };
    extractCoursesFromTree(undefined);

    let courseList: Course[] = [];
    if (orderedCourseIds.size > 0) {
        Array.from(orderedCourseIds).forEach(id => {
            const c = courses.find(course => course.id === id);
            if (c) courseList.push(c);
        });
    } else {
        courseList = courses || [];
    }

    // Build Tree cho việc duyệt bảng
    const buildTree = (nodes: any[], parentId?: string): any[] => {
        return nodes
            .filter(n => n.parentId === parentId)
            .map(node => ({ ...node, children: buildTree(nodes, node.id) }));
    };
    const structureTree = buildTree(structureNodes);

    const moduleNumMap: Record<string, number> = {};
    structureNodes.filter((n: any) => n.level === 'MODULE').forEach((m: any, idx: number) => {
        moduleNumMap[m.id] = idx + 1;
    });

    if (level3Objs.length > 0 && courseList.length > 0) {
        const manualMap = Array.isArray(moetInfo?.courseObjectiveMap) ? moetInfo.courseObjectiveMap : [];
        const manualLinks = new Set<string>(manualMap);

        const impliedLinks = new Set<string>();
        specificObjectives.forEach((obj: any) => {
            if (Array.isArray(obj.soIds)) {
                obj.soIds.forEach((soId: string) => {
                    if (Array.isArray(courseSoMap)) {
                        courseSoMap.filter(m => m.soId === soId && m.level !== IRM.NONE).forEach(m => {
                            impliedLinks.add(`${m.courseId}|${obj.id}`);
                        });
                    }
                });
            }
        });

        const syllabusLinks = new Set<string>();
        if (Array.isArray(cloPloMap)) {
            cloPloMap.forEach(m => {
                syllabusLinks.add(`${m.courseId}|${m.ploId}`);
            });
        }

        const indexWidth = 4;
        const codeWidth = 10;
        const nameWidth = 28;
        const creditWidth = 4;
        const fixedTotal = indexWidth + codeWidth + nameWidth + creditWidth;
        const objColWidth = Math.max(1, Math.floor((100 - fixedTotal) / level3Objs.length)); 
        const totalMatrixCols = 4 + level3Objs.length;

        const tableRows: TableRow[] = [];
        const hasLevel2 = level2Objs.some(l2 => getLevel3Count(l2.code) > 0);
        const headerRowSpan = hasLevel2 ? 3 : 2;

        const row1Cells = [
            new TableCell({ children: [createPara("TT", styles.tableHeader, AlignmentType.CENTER)], width: { size: indexWidth, type: WidthType.PERCENTAGE }, rowSpan: headerRowSpan, verticalAlign: VerticalAlign.CENTER, shading: { fill: "F2F2F2" } }),
            new TableCell({ children: [createPara(isVi ? "Mã HP" : "Code", styles.tableHeader, AlignmentType.CENTER)], width: { size: codeWidth, type: WidthType.PERCENTAGE }, rowSpan: headerRowSpan, verticalAlign: VerticalAlign.CENTER, shading: { fill: "F2F2F2" } }),
            new TableCell({ children: [createPara(isVi ? "Tên học phần" : "Course Name", styles.tableHeader, AlignmentType.CENTER)], width: { size: nameWidth, type: WidthType.PERCENTAGE }, rowSpan: headerRowSpan, verticalAlign: VerticalAlign.CENTER, shading: { fill: "F2F2F2" } }),
            new TableCell({ children: [createPara(isVi ? "TC" : "Cr", styles.tableHeader, AlignmentType.CENTER)], width: { size: creditWidth, type: WidthType.PERCENTAGE }, rowSpan: headerRowSpan, verticalAlign: VerticalAlign.CENTER, shading: { fill: "F2F2F2" } })
        ];

        level1Objs.forEach(l1 => {
            const count = getLevel3Count(l1.code);
            if (count > 0) {
                row1Cells.push(new TableCell({
                    children: [createPara(`${l1.code}. ${getDesc(l1)}`, styles.tableHeader, AlignmentType.CENTER)],
                    columnSpan: count,
                    verticalAlign: VerticalAlign.CENTER,
                    shading: { fill: "F2F2F2" }
                }));
            }
        });

        const row2Cells: TableCell[] = [];
        level2Objs.forEach(l2 => {
            const count = getLevel3Count(l2.code);
            if (count > 0) {
                row2Cells.push(new TableCell({
                    children: [createPara(l2.code, styles.tableHeader, AlignmentType.CENTER)],
                    columnSpan: count,
                    verticalAlign: VerticalAlign.CENTER,
                    shading: { fill: "F2F2F2" }
                }));
            }
        });

        const row3Cells: TableCell[] = [];
        level3Objs.forEach(l3 => {
            row3Cells.push(new TableCell({
                children: [createPara(ploMap.get(l3.id) || "", styles.tableHeader, AlignmentType.CENTER)],
                width: { size: objColWidth, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                textDirection: TextDirection.BOTTOM_TO_TOP_LEFT_TO_RIGHT,
                shading: { fill: "F2F2F2" }
            }));
        });

        tableRows.push(new TableRow({ children: row1Cells, tableHeader: true }));
        if (row2Cells.length > 0) tableRows.push(new TableRow({ children: row2Cells, tableHeader: true }));
        if (row3Cells.length > 0) tableRows.push(new TableRow({ children: row3Cells, tableHeader: true, height: { value: 794, rule: HeightRule.ATLEAST } }));

        let globalTT7 = 1;
        const generateMatrix7Rows = (node: any, parentNum: string, index: number): TableRow[] => {
            const rows: TableRow[] = [];
            let currentNumbering = "";
            let currentNumericNumbering = "";
            let title = node.title?.[language] || node.title?.vi || "";
            let isItalic = false;

            if (node.level === 1) {
                currentNumbering = toRoman(index + 1);
                currentNumericNumbering = (index + 1).toString();
                title = title.toUpperCase();
            } else if (node.level === 2) {
                currentNumericNumbering = `${parentNum}.${index + 1}`;
                currentNumbering = currentNumericNumbering;
            } else if (node.level === 3) {
                currentNumericNumbering = `${parentNum}.${index + 1}`;
                currentNumbering = currentNumericNumbering;
                isItalic = true;
            } else if (node.level === 'MODULE') {
                currentNumbering = isVi ? `Mô-đun ${moduleNumMap[node.id] || index + 1}` : `Module ${moduleNumMap[node.id] || index + 1}`;
                currentNumericNumbering = "";
                isItalic = true;
            }

            rows.push(new TableRow({
                children: [
                    new TableCell({
                        children: [createPara(`${currentNumbering}. ${title}`, { ...styles.tableHeader, bold: true, italics: isItalic })],
                        columnSpan: totalMatrixCols,
                        verticalAlign: VerticalAlign.CENTER,
                        shading: { fill: "F2F2F2" }
                    })
                ]
            }));

            (node.courseIds || []).forEach((courseId: string) => {
                const course = courses.find(c => c.id === courseId);
                if (course) {
                    let courseName = typeof course.name === 'string' ? course.name : (course.name[language] || course.name.vi || "N/A");
                    const rowCells = [
                        new TableCell({ children: [createPara(globalTT7++, styles.tableBody, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                        new TableCell({ children: [createPara(course.code || "-", styles.tableBody, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                        new TableCell({ children: [createPara(courseName, styles.tableBody, AlignmentType.LEFT)], verticalAlign: VerticalAlign.CENTER }),
                        new TableCell({ children: [createPara(course.credits || 0, styles.tableBody, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER })
                    ];

                    level3Objs.forEach((obj: any) => {
                        const key = `${course.id}|${obj.id}`;
                        const isMapped = manualLinks.has(key) || impliedLinks.has(key) || syllabusLinks.has(key);
                        rowCells.push(new TableCell({ 
                            children: [createPara(isMapped ? "x" : "", styles.tableBody, AlignmentType.CENTER)], 
                            verticalAlign: VerticalAlign.CENTER 
                        }));
                    });

                    rows.push(new TableRow({ children: rowCells }));
                }
            });

            (node.children || []).forEach((child: any, idx: number) => {
                rows.push(...generateMatrix7Rows(child, currentNumericNumbering, idx));
            });

            return rows;
        };

        if (structureTree.length > 0) {
            structureTree.forEach((node, idx) => {
                tableRows.push(...generateMatrix7Rows(node, "", idx));
            });
        }

        sections.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
            borders: { top: defaultBorder, bottom: defaultBorder, left: defaultBorder, right: defaultBorder, insideVertical: defaultBorder, insideHorizontal: defaultBorder }
        }));
    } else {
        sections.push(createPara(isVi ? "Chưa có dữ liệu CĐR." : "No data available.", styles.tableBody));
    }


    // ============================================================================
    // PHẦN 8: KẾ HOẠCH ĐÀO TẠO
    // ============================================================================
    sections.push(new Paragraph({ text: "", spacing: { after: 400 } })); // Khoảng cách

    sections.push(new Paragraph({
        children: [new TextRun({ text: isVi ? "8. Kế hoạch đào tạo" : "8. Training Plan", ...styles.h1 })],
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120 }
    }));

    sections.push(new Paragraph({
        children: [new TextRun({ text: isVi ? "Kế hoạch giảng dạy được phân bổ theo từng học kỳ như sau:" : "The teaching plan is distributed by semester as follows:", ...styles.body })],
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 432 }, 
        spacing: { after: 120, line: 276 }
    }));

    if (courseList.length > 0) {
        const numSemesters = moetInfo?.numSemesters || 8;
        const t8IndexWidth = 4;
        const t8CodeWidth = 10;
        const t8NameWidth = 30;
        const t8CreditWidth = 6;
        const t8FixedTotal = t8IndexWidth + t8CodeWidth + t8NameWidth + t8CreditWidth;
        const semColWidth = Math.max(1, Math.floor((100 - t8FixedTotal) / numSemesters)); 
        const totalPlanCols = 4 + numSemesters;

        const table8Rows: TableRow[] = [];

        // HEADER BẢNG 8
        const t8Row1Cells = [
            new TableCell({ children: [createPara("TT", styles.tableHeader, AlignmentType.CENTER)], width: { size: t8IndexWidth, type: WidthType.PERCENTAGE }, rowSpan: 2, verticalAlign: VerticalAlign.CENTER, shading: { fill: "F2F2F2" } }),
            new TableCell({ children: [createPara(isVi ? "Mã HP" : "Code", styles.tableHeader, AlignmentType.CENTER)], width: { size: t8CodeWidth, type: WidthType.PERCENTAGE }, rowSpan: 2, verticalAlign: VerticalAlign.CENTER, shading: { fill: "F2F2F2" } }),
            new TableCell({ children: [createPara(isVi ? "Tên học phần" : "Course Name", styles.tableHeader, AlignmentType.CENTER)], width: { size: t8NameWidth, type: WidthType.PERCENTAGE }, rowSpan: 2, verticalAlign: VerticalAlign.CENTER, shading: { fill: "F2F2F2" } }),
            new TableCell({ children: [createPara(isVi ? "TC" : "Cr", styles.tableHeader, AlignmentType.CENTER)], width: { size: t8CreditWidth, type: WidthType.PERCENTAGE }, rowSpan: 2, verticalAlign: VerticalAlign.CENTER, shading: { fill: "F2F2F2" } }),
            new TableCell({ children: [createPara(isVi ? "Học kỳ / Semester" : "Semester", styles.tableHeader, AlignmentType.CENTER)], columnSpan: numSemesters, verticalAlign: VerticalAlign.CENTER, shading: { fill: "F2F2F2" } })
        ];

        const t8Row2Cells: TableCell[] = [];
        for (let i = 1; i <= numSemesters; i++) {
            t8Row2Cells.push(new TableCell({ 
                children: [createPara(i.toString(), styles.tableHeader, AlignmentType.CENTER)], 
                width: { size: semColWidth, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER, 
                shading: { fill: "F2F2F2" } 
            }));
        }

        table8Rows.push(new TableRow({ children: t8Row1Cells, tableHeader: true }));
        table8Rows.push(new TableRow({ children: t8Row2Cells, tableHeader: true }));

        // ĐỆ QUY RENDER DỮ LIỆU BẢNG 8 (KÈM TỔNG TÍN CHỈ KHỐI VÀ NGOẶC ĐƠN CHO TỰ CHỌN)
        let globalTT8 = 1;
        const generatePlan8Rows = (node: any, parentNum: string, index: number): TableRow[] => {
            const rows: TableRow[] = [];
            let currentNumbering = "";
            let currentNumericNumbering = "";
            let title = node.title?.[language] || node.title?.vi || "";
            let isItalic = false;

            if (node.level === 1) {
                currentNumbering = toRoman(index + 1);
                currentNumericNumbering = (index + 1).toString();
                title = title.toUpperCase();
            } else if (node.level === 2) {
                currentNumericNumbering = `${parentNum}.${index + 1}`;
                currentNumbering = currentNumericNumbering;
            } else if (node.level === 3) {
                currentNumericNumbering = `${parentNum}.${index + 1}`;
                currentNumbering = currentNumericNumbering;
                isItalic = true;
            } else if (node.level === 'MODULE') {
                currentNumbering = isVi ? `Mô-đun ${moduleNumMap[node.id] || index + 1}` : `Module ${moduleNumMap[node.id] || index + 1}`;
                currentNumericNumbering = "";
                isItalic = true;
            }

            // Lấy dữ liệu tổng tín chỉ của node
            const totals = calculatePlanTotals(node, courses, numSemesters);
            let creditsText = totals.resolvedTotal.toString();
            
            // CỜ KIỂM TRA KHỐI TỰ CHỌN
            const isElective = node.type === 'ELECTIVE' || node.type === 'SELECTED_ELECTIVE';

            if (isElective && node.requiredCredits) {
                creditsText = `${node.requiredCredits}/${totals.calculatedTotal}`;
            } else if (node.manualCredits !== undefined) {
                creditsText = `${node.manualCredits}/${totals.calculatedTotal}`;
            }

            // Nếu là khối tự chọn, bọc kết quả tín chỉ trong ngoặc đơn ()
            if (isElective) {
                creditsText = `(${creditsText})`;
            }

            // Dòng khối cấu trúc
            const structRowCells = [
                new TableCell({
                    children: [createPara(`${currentNumbering}. ${title}`, { ...styles.tableHeader, bold: true, italics: isItalic })],
                    columnSpan: 3, // Cột TT, Mã HP, Tên HP
                    verticalAlign: VerticalAlign.CENTER,
                    shading: { fill: "F2F2F2" }
                }),
                new TableCell({
                    children: [createPara(creditsText, styles.tableHeader, AlignmentType.CENTER)],
                    verticalAlign: VerticalAlign.CENTER,
                    shading: { fill: "F2F2F2" }
                })
            ];

            // In tổng số tín chỉ theo học kỳ của khối
            for (let i = 1; i <= numSemesters; i++) {
                const val = totals.semesters[i];
                let semText = val > 0 ? val.toString() : "";
                
                // Cột học kỳ cũng được bọc ngoặc đơn nếu là khối tự chọn
                if (semText && isElective) {
                    semText = `(${semText})`;
                }

                structRowCells.push(new TableCell({
                    children: [createPara(semText, styles.tableHeader, AlignmentType.CENTER)],
                    verticalAlign: VerticalAlign.CENTER,
                    shading: { fill: "F2F2F2" }
                }));
            }

            rows.push(new TableRow({ children: structRowCells }));

            // Dòng môn học con
            (node.courseIds || []).forEach((courseId: string) => {
                const course = courses.find(c => c.id === courseId);
                if (course) {
                    let courseName = typeof course.name === 'string' ? course.name : (course.name[language] || course.name.vi || "N/A");
                    const rowCells = [
                        new TableCell({ children: [createPara(globalTT8++, styles.tableBody, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                        new TableCell({ children: [createPara(course.code || "-", styles.tableBody, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                        new TableCell({ children: [createPara(courseName, styles.tableBody, AlignmentType.LEFT)], verticalAlign: VerticalAlign.CENTER }),
                        new TableCell({ children: [createPara(course.credits || 0, styles.tableBody, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER })
                    ];

                    const sems = getCourseSemesters(course);
                    for (let i = 1; i <= numSemesters; i++) {
                        const isMatch = sems.includes(i);
                        rowCells.push(new TableCell({ 
                            children: [createPara(isMatch ? (course.credits || "x").toString() : "", styles.tableBody, AlignmentType.CENTER)], 
                            verticalAlign: VerticalAlign.CENTER 
                        }));
                    }

                    rows.push(new TableRow({ children: rowCells }));
                }
            });

            // Duyệt tiếp node con
            (node.children || []).forEach((child: any, idx: number) => {
                rows.push(...generatePlan8Rows(child, currentNumericNumbering, idx));
            });

            return rows;
        };

        // Tính tổng toàn bộ chương trình (Grand Total)
        let grandTotalCredits = 0;
        const grandTotalSems: Record<number, number> = {};
        for (let i = 1; i <= numSemesters; i++) grandTotalSems[i] = 0;

        if (structureTree.length > 0) {
            structureTree.forEach((node, idx) => {
                table8Rows.push(...generatePlan8Rows(node, "", idx));
                
                // Cộng dồn vào Grand Total từ các node Level 1
                const nodeTotals = calculatePlanTotals(node, courses, numSemesters);
                grandTotalCredits += nodeTotals.resolvedTotal;
                for (let i = 1; i <= numSemesters; i++) {
                    grandTotalSems[i] += nodeTotals.semesters[i];
                }
            });
        }

        // THÊM DÒNG TỔNG CỘNG CUỐI BẢNG
        const totalRowCells = [
            new TableCell({
                children: [createPara(isVi ? "Tổng cộng" : "Total", styles.tableHeader, AlignmentType.CENTER)],
                columnSpan: 3,
                verticalAlign: VerticalAlign.CENTER,
                shading: { fill: "D9D9D9" } // Màu xám đậm hơn
            }),
            new TableCell({
                children: [createPara(grandTotalCredits.toString(), styles.tableHeader, AlignmentType.CENTER)],
                verticalAlign: VerticalAlign.CENTER,
                shading: { fill: "D9D9D9" }
            })
        ];

        for (let i = 1; i <= numSemesters; i++) {
            const val = grandTotalSems[i];
            totalRowCells.push(new TableCell({
                children: [createPara(val > 0 ? val.toString() : "", styles.tableHeader, AlignmentType.CENTER)],
                verticalAlign: VerticalAlign.CENTER,
                shading: { fill: "D9D9D9" }
            }));
        }
        table8Rows.push(new TableRow({ children: totalRowCells }));

        const planTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: table8Rows,
            borders: {
                top: defaultBorder, bottom: defaultBorder,
                left: defaultBorder, right: defaultBorder,
                insideVertical: defaultBorder, insideHorizontal: defaultBorder,
            }
        });

        sections.push(planTable);
    } else {
        sections.push(createPara(isVi ? "Chưa có dữ liệu học phần." : "No courses data available.", styles.tableBody));
    }

    return sections;
};

export const exportMoetP3 = async (
    generalInfo: GeneralInfo, 
    moetInfo: MoetInfo, 
    courses: Course[], 
    language: Language,
    courseSoMap?: any[],
    cloPloMap?: any[]
) => {
    try {
        if (!generalInfo || !moetInfo || !courses) {
            throw new Error("Missing required data for generation.");
        }

        const children = generateMoetPart3(generalInfo, moetInfo, courses, language, courseSoMap, cloPloMap);
        
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440, // 1 inch
                            bottom: 1440,
                            left: 1440,
                            right: 1440
                        }
                    }
                },
                children: children
            }]
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
        
        link.download = `MOET_Part3_${safeProgName}.docx`;
        link.click();
    } catch (e) {
        console.error("Export Error: ", e);
        alert("Đã xảy ra lỗi khi tạo file Word. Vui lòng kiểm tra console log.");
    }
};