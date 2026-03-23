import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign } from "docx";
import { GeneralInfo, Language, MoetInfo, Course, TeachingMethod, Faculty, MoetStructureNode, CreditBlock } from '../types';

// Constants for formatting
const FONT_FAMILY = "Times New Roman";
const FONT_SIZE_H1 = 26; // 13pt
const FONT_SIZE_BODY = 24; // 12pt
const TABLE_FONT_SIZE = 22; // 11pt

const styles = {
    h1: { font: FONT_FAMILY, size: FONT_SIZE_H1, bold: true },
    h2: { font: FONT_FAMILY, size: FONT_SIZE_BODY, bold: true, italics: true },
    body: { font: FONT_FAMILY, size: FONT_SIZE_BODY },
    tableHeader: { font: FONT_FAMILY, size: TABLE_FONT_SIZE, bold: true },
    tableBody: { font: FONT_FAMILY, size: TABLE_FONT_SIZE },
};

// Helper to convert HTML to DOCX Paragraphs
const htmlToDocxParagraphs = (html: string, textStyle: any, paragraphOptions: any): Paragraph[] => {
    if (!html) return [new Paragraph({ ...paragraphOptions })];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const paragraphs: Paragraph[] = [];

    const isBlockElement = (node: Node): boolean => {
        if (node.nodeType !== Node.ELEMENT_NODE) return false;
        const tag = (node as HTMLElement).tagName.toLowerCase();
        return ['p', 'div', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'blockquote'].includes(tag);
    };

    const processTextNodes = (nodes: NodeListOf<ChildNode> | ChildNode[], currentTextStyle: any): any[] => {
        const runs: any[] = [];
        Array.from(nodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || '';
                const cleanText = text.replace(/\u00A0/g, ' ').replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ');
                if (cleanText !== '') { 
                    runs.push({ text: cleanText, ...currentTextStyle });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const tagName = el.tagName.toLowerCase();
                const newTextStyle = { ...currentTextStyle };
                
                if (tagName === 'b' || tagName === 'strong') newTextStyle.bold = true;
                if (tagName === 'i' || tagName === 'em') newTextStyle.italics = true;
                if (tagName === 'u') newTextStyle.underline = { type: "single" };
                
                if (tagName === 'br') {
                    runs.push({ break: 1 });
                } else {
                    runs.push(...processTextNodes(el.childNodes, newTextStyle));
                }
            }
        });
        return runs;
    };

    let currentInlineNodes: ChildNode[] = [];
    
    const flushInlineNodes = () => {
        if (currentInlineNodes.length > 0) {
            const runs = processTextNodes(currentInlineNodes, textStyle);
            if (runs.length > 0 && runs.some(r => r.text || r.break)) {
                paragraphs.push(new Paragraph({ children: runs.map(r => new TextRun(r)), ...paragraphOptions }));
            }
            currentInlineNodes = [];
        }
    };

    Array.from(doc.body.childNodes).forEach(node => {
        if (isBlockElement(node)) {
            flushInlineNodes();
            const el = node as HTMLElement;
            const tagName = el.tagName.toLowerCase();

            if (tagName === 'ul' || tagName === 'ol') {
                Array.from(el.childNodes).forEach(li => {
                    if (li.nodeName.toLowerCase() === 'li') {
                        const childRuns = processTextNodes(li.childNodes, textStyle);
                        const hasDash = childRuns.length > 0 && childRuns[0].text && childRuns[0].text.trim().startsWith('-');
                        if (!hasDash) {
                            childRuns.unshift({ text: "- ", ...textStyle });
                        }
                        paragraphs.push(new Paragraph({
                            children: childRuns.map(r => new TextRun(r)),
                            ...paragraphOptions
                        }));
                    }
                });
            } else {
                const runs = processTextNodes(el.childNodes, textStyle);
                if (runs.length > 0 && runs.some(r => r.text || r.break)) {
                    paragraphs.push(new Paragraph({ children: runs.map(r => new TextRun(r)), ...paragraphOptions }));
                }
            }
        } else {
            currentInlineNodes.push(node);
        }
    });
    
    flushInlineNodes();

    return paragraphs.length > 0 ? paragraphs : [new Paragraph({ ...paragraphOptions })];
};

// Helper to convert number to Roman numeral
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

// Helper to calculate credits for dynamic credit blocks
const calculateCourseCredits = (course: Course, methods: TeachingMethod[], creditBlocks: CreditBlock[]) => {
    const cbValues = course.creditBlockValues || {};
    
    // Create an object with all credit block IDs initialized to 0
    const result: Record<string, number> = {
        total: course.credits
    };
    creditBlocks.forEach(cb => {
        result[cb.id] = cbValues[cb.id] || 0;
    });

    // If creditBlockValues is present, we use it
    if (course.creditBlockValues && Object.keys(course.creditBlockValues).length > 0) {
        return result;
    }

    // Fallback to calculation if no creditBlockValues are set (legacy or auto-calc)
    let lt = 0;
    let th = 0;
    let tt = 0;
    let da = 0;

    course.topics.forEach(topic => {
        topic.activities.forEach(act => {
            const method = methods.find(m => m.id === act.methodId);
            if (method) {
                const cat = method.category2 || '';
                const name = (method.name.vi || '').toLowerCase();
                const credits = act.hours / (method.hoursPerCredit || 15);
                
                if (cat === 'THEORY' || cat === 'EXERCISE' || cat === 'GROUP_DISCUSSION') {
                    lt += credits;
                } else if (cat === 'PRACTICE_LAB_INTERNSHIP') {
                    if (name.includes('thực tập') || name.includes('internship')) {
                        tt += credits;
                    } else if (name.includes('đồ án') || name.includes('project') || name.includes('khóa luận')) {
                        da += credits;
                    } else {
                        th += credits;
                    }
                }
            }
        });
    });

    // Map the calculated values to the first 4 credit blocks if available
    if (creditBlocks.length > 0) result[creditBlocks[0].id] = Math.round(lt * 10) / 10;
    if (creditBlocks.length > 1) result[creditBlocks[1].id] = Math.round(th * 10) / 10;
    if (creditBlocks.length > 2) result[creditBlocks[2].id] = Math.round(tt * 10) / 10;
    if (creditBlocks.length > 3) result[creditBlocks[3].id] = Math.round(da * 10) / 10;

    return result;
};

// Helper to create paragraphs
const createPara = (text: string, style: any, align: any = AlignmentType.LEFT, indentLevel: number = 0) => {
    return new Paragraph({
        children: [new TextRun({ text, ...style })],
        alignment: align,
        spacing: { after: 120, line: 276 },
        indent: { left: indentLevel * 400 }
    });
};

// Recursive function to calculate node totals
const calculateNodeTotals = (node: any, courses: Course[], methods: TeachingMethod[], creditBlocks: CreditBlock[]) => {
    // Initialize totals for all credit blocks
    const totals: Record<string, number> = {
        total: 0
    };
    creditBlocks.forEach(cb => {
        totals[cb.id] = 0;
    });

    // If it's an elective block with required credits, use the required values (matching MoetStructure.tsx)
    if (node.level !== 'MODULE' && (node.type === 'ELECTIVE' || node.type === 'SELECTED_ELECTIVE') && node.requiredCredits) {
        totals.total = node.requiredCredits;
        creditBlocks.forEach(cb => {
            totals[cb.id] = node.manualCreditBlockValues?.[cb.id] || 0;
        });
        return totals;
    }

    // Fallback for manual credits if explicitly set
    if (node.manualCredits !== undefined) {
        totals.total = node.manualCredits;
        const mValues = node.manualCreditBlockValues || {};
        creditBlocks.forEach(cb => {
            totals[cb.id] = mValues[cb.id] || 0;
        });
        return totals;
    }

    (node.courseIds || []).forEach((courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            const cTotals = calculateCourseCredits(course, methods, creditBlocks);
            totals.total += cTotals.total;
            creditBlocks.forEach(cb => {
                totals[cb.id] += cTotals[cb.id] || 0;
            });
        }
    });

    (node.children || []).forEach((child: any) => {
        const childTotals = calculateNodeTotals(child, courses, methods, creditBlocks);
        totals.total += childTotals.total;
        creditBlocks.forEach(cb => {
            totals[cb.id] += childTotals[cb.id] || 0;
        });
    });

    // Round values
    totals.total = Math.round(totals.total * 10) / 10;
    creditBlocks.forEach(cb => {
        totals[cb.id] = Math.round(totals[cb.id] * 10) / 10;
    });

    return totals;
};

let globalTT = 1;

// Recursive function to generate table rows
const generateStructureRows = (
    node: any, 
    courses: Course[], 
    methods: TeachingMethod[], 
    language: Language, 
    parentNumericNumbering: string,
    index: number,
    moduleNumMap: Record<string, number>,
    creditBlocks: CreditBlock[]
): TableRow[] => {
    const rows: TableRow[] = [];
    const nodeTotals = calculateNodeTotals(node, courses, methods, creditBlocks);

    let currentNumbering = "";
    let currentNumericNumbering = "";
    let title = node.title[language] || "";
    let isItalic = false;
    let isBold = true;

    if (node.level === 1) {
        currentNumbering = toRoman(index + 1);
        currentNumericNumbering = (index + 1).toString();
        title = title.toUpperCase();
    } else if (node.level === 2) {
        currentNumericNumbering = `${parentNumericNumbering}.${index + 1}`;
        currentNumbering = currentNumericNumbering;
    } else if (node.level === 3) {
        currentNumericNumbering = `${parentNumericNumbering}.${index + 1}`;
        currentNumbering = currentNumericNumbering;
        isItalic = true;
    } else if (node.level === 'MODULE') {
        currentNumbering = language === 'vi' ? `Mô-đun ${moduleNumMap[node.id] || index + 1}` : `Module ${moduleNumMap[node.id] || index + 1}`;
        currentNumericNumbering = "";
        isItalic = true;
    }

    const displayText = `${currentNumbering}. ${title}`;

    const cellChildren = [createPara(displayText, { ...styles.tableHeader, bold: isBold, italics: isItalic })];

    if (node.type === 'ELECTIVE' && node.requiredCredits) {
        cellChildren.push(new Paragraph({
            children: [new TextRun({ 
                text: language === 'vi' 
                    ? `(Tự chọn tối thiểu ${node.requiredCredits} tín chỉ)` 
                    : `(Elective minimum ${node.requiredCredits} credits)`,
                ...styles.tableBody,
                italics: true,
                bold: false
            })],
            spacing: { after: 120, line: 276 }
        }));
    } else if (node.type === 'SELECTED_ELECTIVE' && node.requiredCredits) {
        cellChildren.push(new Paragraph({
            children: [new TextRun({ 
                text: language === 'vi' 
                    ? `(Tự chọn định hướng 1 Mô-đun ${node.requiredCredits} tín chỉ)` 
                    : `(Directed elective 1 Module ${node.requiredCredits} credits)`,
                ...styles.tableBody,
                italics: true,
                bold: false
            })],
            spacing: { after: 120, line: 276 }
        }));
    }

    // Header Row for Level/Module
    rows.push(new TableRow({
        children: [
            new TableCell({
                children: cellChildren,
                columnSpan: 4,
                verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({ children: [createPara(nodeTotals.total.toString(), styles.tableHeader, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
            ...creditBlocks.map(cb => (
                new TableCell({ 
                    children: [createPara(nodeTotals[cb.id] > 0 ? nodeTotals[cb.id].toString() : "0", styles.tableHeader, AlignmentType.CENTER)], 
                    verticalAlign: VerticalAlign.CENTER 
                })
            ))
        ]
    }));

    // Courses
    (node.courseIds || []).forEach((courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            const cTotals = calculateCourseCredits(course, methods, creditBlocks);
            rows.push(new TableRow({
                children: [
                    new TableCell({ children: [createPara((globalTT++).toString(), styles.tableBody, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [createPara(course.code, styles.tableBody, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [createPara(course.name.vi, styles.tableBody, AlignmentType.LEFT)], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [createPara(course.name.en, styles.tableBody, AlignmentType.LEFT)], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [createPara(cTotals.total.toString(), styles.tableBody, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                    ...creditBlocks.map(cb => (
                        new TableCell({ 
                            children: [createPara(cTotals[cb.id] > 0 ? cTotals[cb.id].toString() : "", styles.tableBody, AlignmentType.CENTER)], 
                            verticalAlign: VerticalAlign.CENTER 
                        })
                    ))
                ]
            }));
        }
    });

    // Children
    (node.children || []).forEach((child: any, idx: number) => {
        rows.push(...generateStructureRows(child, courses, methods, language, currentNumericNumbering, idx, moduleNumMap, creditBlocks));
    });

    return rows;
};

export const generateMoetPart2 = (
    generalInfo: GeneralInfo, 
    moetInfo: MoetInfo, 
    courses: Course[], 
    methods: TeachingMethod[],
    faculties: Faculty[],
    language: Language,
    creditBlocks: CreditBlock[]
) => {
    const sections: any[] = [];
    const isVi = language === 'vi';
    globalTT = 1;

    // 5. Curriculum Structure
    sections.push(createPara(isVi ? "5. Cấu trúc chương trình đào tạo" : "5. Curriculum Structure", styles.h1));

    // Build tree
    const buildTree = (nodes: MoetStructureNode[], parentId?: string): any[] => {
        return nodes
            .filter(n => n.parentId === parentId)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(node => ({
                ...node,
                children: buildTree(nodes, node.id)
            }));
    };

    const structureTree = buildTree(moetInfo.structure || []);

    // Calculate global module numbering
    const moduleNumMap: Record<string, number> = {};
    const modules = (moetInfo.structure || [])
        .filter(n => n.level === 'MODULE')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    modules.forEach((m, idx) => {
        moduleNumMap[m.id] = idx + 1;
    });

    // Create Table
    const structureTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        rows: [
            // Header
            new TableRow({
                children: [
                    { text: "TT", width: 5 },
                    { text: isVi ? "Mã HP" : "Code", width: 10 },
                    { text: isVi ? "Tên HP tiếng Việt" : "Course Name (VI)", width: 25 },
                    { text: isVi ? "Tên HP tiếng Anh" : "Course Name (EN)", width: 25 },
                    { text: isVi ? "Số TC" : "Credits", width: 7 },
                    ...creditBlocks.map(cb => ({ text: cb.acronym[language] || cb.code, width: 7 }))
                ].map(col => new TableCell({
                    children: [createPara(col.text, styles.tableHeader, AlignmentType.CENTER)],
                    width: { size: col.width, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    shading: { fill: "F2F2F2" }
                })),
                tableHeader: true
            }),
            // Body
            ...structureTree.flatMap((node, idx) => generateStructureRows(node, courses, methods, language, "", idx, moduleNumMap, creditBlocks))
        ]
    });

    sections.push(structureTable);
    sections.push(new Paragraph({ text: "", spacing: { after: 400 } }));

    // 6. Assessment
    sections.push(createPara(isVi ? "6. Cách thức đánh giá" : "6. Assessment Methods", styles.h1));
    
    // 6.1. Đánh giá kết quả học tập
    sections.push(createPara(isVi ? "6.1. Đánh giá kết quả học tập" : "6.1. Assessment of learning outcomes", styles.h2));
    if (moetInfo.assessmentMethods) {
        sections.push(...htmlToDocxParagraphs(moetInfo.assessmentMethods?.[language] || "", styles.body, { spacing: { after: 120, line: 276 } }));
    } else {
        sections.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    }

    // 6.2. Phương pháp đánh giá mức độ đạt chuẩn đầu ra của CTĐT đối với người học
    sections.push(createPara(isVi ? "6.2. Phương pháp đánh giá mức độ đạt chuẩn đầu ra của CTĐT đối với người học" : "6.2. Methods for assessing the level of achievement of the program's learning outcomes for learners", styles.h2));
    if (moetInfo.assessmentPloMethod) {
        sections.push(...htmlToDocxParagraphs(moetInfo.assessmentPloMethod?.[language] || "", styles.body, { spacing: { after: 120, line: 276 } }));
    } else {
        sections.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    }

    return sections;
};

export const exportMoetP2 = async (
    generalInfo: GeneralInfo, 
    moetInfo: MoetInfo, 
    courses: Course[], 
    methods: TeachingMethod[], 
    faculties: Faculty[],
    language: Language,
    creditBlocks: CreditBlock[]
) => {
    try {
        const children = generateMoetPart2(generalInfo, moetInfo, courses, methods, faculties, language, creditBlocks);
        
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
        link.download = `MOET_Part2_${(generalInfo.programName?.[language] || 'Program').replace(/\s+/g, '_')}.docx`;
        link.click();
    } catch (e) {
        console.error(e);
        alert("Error creating Page 2 DOCX");
    }
};