import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign } from "docx";
import { GeneralInfo, Language, MoetInfo } from '../types';

// Formatting Constants
const FONT_FAMILY = "Times New Roman";
const FONT_SIZE_H1 = 26; // 13pt
const FONT_SIZE_BODY = 26; // 13pt (Cỡ chữ chuẩn văn bản)
const INDENT_FIRST_LINE = 432; // 0.3 inch = 432 twips
const SPACING_AFTER = 120; // 6pt
const LINE_SPACING = 276; // 1.15 lines

const baseTextStyle = {
    font: FONT_FAMILY,
    size: FONT_SIZE_BODY,
    color: "000000",
};

// Headings (1, 2...): Indent 0, Left 0, Right 0, Black
const headingParaOptions = {
    indent: { firstLine: 0, left: 0, right: 0 },
    spacing: { after: SPACING_AFTER, line: LINE_SPACING, lineRule: "auto" as const },
    alignment: AlignmentType.JUSTIFIED
};

// Normal Text: Indent First Line 0.3", Left 0", Right 0"
const paraOptions = {
    indent: { firstLine: INDENT_FIRST_LINE, left: 0, right: 0 },
    spacing: { after: SPACING_AFTER, line: LINE_SPACING, lineRule: "auto" as const },
    alignment: AlignmentType.JUSTIFIED
};

const headerStyle = { ...baseTextStyle, bold: true };
const h2Style = { ...baseTextStyle, bold: true, italics: true }; 
const normalStyle = { ...baseTextStyle, bold: false };

// Specific Helper for Headings
const createSectionHeader = (text: string) => new Paragraph({
    children: [new TextRun({ text: String(text || ""), ...headerStyle })],
    ...headingParaOptions,
    spacing: { before: 240, after: 120 }
});

const createSubSectionHeader = (text: string) => new Paragraph({
    children: [new TextRun({ text: String(text || ""), ...h2Style })],
    ...headingParaOptions,
    spacing: { before: 120, after: 120 }
});

// Hàm chuyển đổi HTML sang DOCX an toàn
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

export const generateMoetPart4 = (generalInfo: GeneralInfo, moetInfo: any, language: Language) => {
    const isVi = language === 'vi' || language !== 'en';
    const sections: any[] = [];

    // Lấy dữ liệu an toàn
    const safeMoetInfo = moetInfo || generalInfo?.moetInfo || {};

    // ==========================================
    // 9. Kế hoạch tuyển sinh và bảo đảm chất lượng
    // ==========================================
    sections.push(createSectionHeader(isVi ? "9. Kế hoạch tuyển sinh và bảo đảm chất lượng" : "9. Admission and Quality Assurance Plan"));

    sections.push(createSubSectionHeader(isVi ? "9.1. Kế hoạch tuyển sinh" : "9.1. Admission Plan"));
    sections.push(...htmlToDocxParagraphs(safeMoetInfo.admissionPlan?.[language] || safeMoetInfo.admissionPlan?.vi || "", normalStyle, paraOptions));

    sections.push(createSubSectionHeader(isVi ? "9.2. Kế hoạch bảo đảm chất lượng" : "9.2. Quality Assurance Plan"));
    sections.push(...htmlToDocxParagraphs(safeMoetInfo.qualityAssurancePlan?.[language] || safeMoetInfo.qualityAssurancePlan?.vi || "", normalStyle, paraOptions));


    // ==========================================
    // 10. Hướng dẫn thực hiện chương trình
    // ==========================================
    sections.push(createSectionHeader(isVi ? "10. Hướng dẫn thực hiện chương trình" : "10. Program Implementation Guidelines"));

    const guidelineFields = [
        { key: 'guidelineSchedulePrinciples', vi: '10.1. Nguyên tắc tổ chức lịch trình đào tạo', en: '10.1. Principles of organizing training schedule' },
        { key: 'guidelineFirstSemesterSchedule', vi: '10.2. Thời khoá biểu học kỳ đầu tiên của khoá học', en: '10.2. Timetable of the first semester' },
        { key: 'guidelineSecondSemesterSchedule', vi: '10.3. Thời khoá biểu lớp học phần từ học kỳ II', en: '10.3. Course timetable from the second semester' },
        { key: 'guidelinePhysicalDefenseEdu', vi: '10.4. Khối kiến thức Giáo dục thể chất và Giáo dục quốc phòng và an ninh', en: '10.4. Physical Education and National Defense Education' },
        { key: 'guidelineForeignLanguage', vi: '10.5. Khối kiến thức ngoại ngữ không chuyên', en: '10.5. Non-major Foreign Language' },
        { key: 'guidelineElectives', vi: '10.6. Phần tự chọn', en: '10.6. Elective Modules' },
        { key: 'guidelineGraduationProject', vi: '10.7. Đồ án tốt nghiệp', en: '10.7. Graduation Project / Thesis' }
    ];

    guidelineFields.forEach(field => {
        sections.push(createSubSectionHeader(isVi ? field.vi : field.en));
        sections.push(...htmlToDocxParagraphs(safeMoetInfo[field.key]?.[language] || safeMoetInfo[field.key]?.vi || "", normalStyle, paraOptions));
    });

    // ==========================================
    // KÝ TÊN (SIGNATURE BLOCK)
    // ==========================================
    sections.push(new Paragraph({ text: "", spacing: { after: 400 } })); // Khoảng cách trống

    // Xử lý Ngày tháng năm hiện tại
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    const city = generalInfo?.city?.[language] || generalInfo?.city?.vi || "...............";

    const dateString = isVi 
        ? `${city}, ngày ${day} tháng ${month} năm ${year}`
        : `${city}, ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

    sections.push(new Paragraph({
        children: [
            new TextRun({ 
                text: dateString, 
                ...normalStyle,
                italics: true
            })
        ],
        alignment: AlignmentType.RIGHT,
        indent: { right: 720 }, // Cách lề phải một chút cho cân đối
        spacing: { after: 240 }
    }));

    // Chuẩn bị dữ liệu chức danh & họ tên
    const signerTitle = generalInfo?.signerTitle?.[language] || generalInfo?.signerTitle?.vi || (isVi ? "TRƯỞNG KHOA" : "DEAN");
    const signerName = generalInfo?.signerName || "";

    const approverTitle = (generalInfo as any)?.approverTitle?.[language] || (generalInfo as any)?.approverTitle?.vi || (isVi ? "HIỆU TRƯỞNG / GIÁM ĐỐC" : "RECTOR / DIRECTOR");
    const approverName = (generalInfo as any)?.approverName || "";

    const signNote = isVi ? "(Ký, ghi rõ họ tên)" : "(Sign and full name)";

    // Tạo các Paragraph cho Cột Trái (Người ký)
    const leftCellParagraphs = [
        new Paragraph({
            children: [new TextRun({ text: signerTitle.toUpperCase(), ...headerStyle })],
            alignment: AlignmentType.CENTER
        }),
        new Paragraph({
            children: [new TextRun({ text: signNote, ...normalStyle, italics: true })],
            alignment: AlignmentType.CENTER
        }),
        new Paragraph({ text: "", spacing: { after: 1440 } }) // Khoảng trống 1 inch để ký
    ];
    if (signerName) {
        leftCellParagraphs.push(new Paragraph({
            children: [new TextRun({ text: signerName, ...headerStyle })],
            alignment: AlignmentType.CENTER
        }));
    }

    // Tạo các Paragraph cho Cột Phải (Người duyệt)
    const rightCellParagraphs = [
        new Paragraph({
            children: [new TextRun({ text: approverTitle.toUpperCase(), ...headerStyle })],
            alignment: AlignmentType.CENTER
        }),
        new Paragraph({
            children: [new TextRun({ text: signNote, ...normalStyle, italics: true })],
            alignment: AlignmentType.CENTER
        }),
        new Paragraph({ text: "", spacing: { after: 1440 } }) // Khoảng trống 1 inch để ký
    ];
    if (approverName) {
        rightCellParagraphs.push(new Paragraph({
            children: [new TextRun({ text: approverName, ...headerStyle })],
            alignment: AlignmentType.CENTER
        }));
    }

    // Bảng chữ ký (1 Dòng, 2 Cột Ẩn Viền)
    const signatureTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: leftCellParagraphs,
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.TOP
                    }),
                    new TableCell({
                        children: rightCellParagraphs,
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.TOP
                    })
                ]
            })
        ]
    });

    sections.push(signatureTable);

    return sections;
};

export const exportMoetP4 = async (generalInfo: GeneralInfo, language: Language) => {
    try {
        if (!generalInfo) {
            throw new Error("Missing required data for generation.");
        }

        const moetInfo = generalInfo.moetInfo || {};
        const children = generateMoetPart4(generalInfo, moetInfo, language);
        
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
        
        // Tạo tên file an toàn
        let progName = "Program";
        if (generalInfo?.programName) {
            progName = typeof generalInfo.programName === 'string' 
                ? generalInfo.programName 
                : (generalInfo.programName[language] || generalInfo.programName.vi || "Program");
        }
        const safeProgName = progName.replace(/[\/\\]/g, '_');
        
        link.download = `MOET_Part4_${safeProgName}.docx`;
        link.click();
    } catch (e) {
        console.error("Export Error: ", e);
        alert("Đã xảy ra lỗi khi tạo file Word (Phần 4). Vui lòng kiểm tra console log.");
    }
};