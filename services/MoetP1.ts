import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign } from "docx";
import { GeneralInfo, Language, MoetInfo, Course } from '../types';
import { sortOutlineCode } from '../utils/sortOutline';

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
                // FIX LỖI RỚT DÒNG: Thay thế non-breaking space (\u00A0 hay &nbsp;) bằng dấu cách chuẩn (' ')
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
                        
                        // Chuyển dấu bullet tròn thành dấu gạch ngang (-)
                        const hasDash = childRuns.length > 0 && childRuns[0].text && childRuns[0].text.trim().startsWith('-');
                        if (!hasDash) {
                            childRuns.unshift({ text: "- ", ...textStyle });
                        }

                        // Áp dụng đúng định dạng Left: 0, Right: 0, First Line: 0.3" như Paragraph thường
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

export const generateMoetPart1 = (generalInfo: GeneralInfo, moetInfo: MoetInfo, courses: Course[], language: Language) => {
    const isVi = language === 'vi';

    // Formatting Constants
    const FONT_FAMILY = "Times New Roman";
    const FONT_SIZE = 26; // 13pt
    const INDENT_FIRST_LINE = 432; // 0.3 inch = 432 twips
    const SPACING_AFTER = 120; // 6pt
    const LINE_SPACING = 276; // 1.15 lines

    const baseTextStyle = {
        font: FONT_FAMILY,
        size: FONT_SIZE,
        color: "000000",
    };

    // Normal Text: Indent First Line 0.3", Left 0", Right 0"
    const paraOptions = {
        indent: { firstLine: INDENT_FIRST_LINE, left: 0, right: 0 },
        spacing: { after: SPACING_AFTER, line: LINE_SPACING, lineRule: "auto" as const },
        alignment: AlignmentType.JUSTIFIED
    };

    // Headings (1, 2...): Indent 0, Left 0, Right 0, Black
    const headingParaOptions = {
        indent: { firstLine: 0, left: 0, right: 0 },
        spacing: { after: SPACING_AFTER, line: LINE_SPACING, lineRule: "auto" as const },
        alignment: AlignmentType.JUSTIFIED
    };

    // Table Content: Indent 0, Left 0, Right 0, Spacing After 0
    const tableParaOptions = {
        indent: { firstLine: 0, left: 0, right: 0 },
        spacing: { after: 0, line: LINE_SPACING, lineRule: "auto" as const },
        alignment: AlignmentType.LEFT 
    };

    // Style Helpers
    const headerStyle = { ...baseTextStyle, bold: true };
    const h2Style = { ...baseTextStyle, bold: true, italics: true }; 
    const normalStyle = { ...baseTextStyle, bold: false };

    // Generic Helper
    const createPara = (text: string, style: any, overrideOptions: any = {}) => new Paragraph({ 
        children: [new TextRun({ text, ...style })], 
        ...paraOptions,
        ...overrideOptions 
    });

    // Specific Helper for Headings (No First Line Indent)
    const createSectionHeader = (text: string) => new Paragraph({
        children: [new TextRun({ text, ...headerStyle })],
        ...headingParaOptions,
        spacing: { before: 240, after: 120 }
    });

    const createSubSectionHeader = (text: string) => new Paragraph({
        children: [new TextRun({ text, ...h2Style })],
        ...headingParaOptions
    });

    // Specific Helper for Table Cells
    const createTablePara = (text: string, style: any, align: any = AlignmentType.LEFT) => new Paragraph({
        children: [new TextRun({ text, ...style })],
        ...tableParaOptions,
        alignment: align
    });

    // --- Content Generation ---

    // 1. Header Section (Ministry & University)
    const headerTable = new Table({
        width: { size: 110, type: WidthType.PERCENTAGE },
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
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: isVi ? "BỘ GIÁO DỤC VÀ ĐÀO TẠO" : "MINISTRY OF EDUCATION AND TRAINING", ...baseTextStyle, size: 24 })],
                                ...tableParaOptions,
                                alignment: AlignmentType.CENTER
                            }),
                            new Paragraph({
                                children: [new TextRun({ text: generalInfo.university?.[language]?.toUpperCase() || '', ...baseTextStyle, size: 26, bold: true })],
                                ...tableParaOptions,
                                alignment: AlignmentType.CENTER
                            })
                        ],
                        width: { size: 40, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: isVi ? "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" : "SOCIALIST REPUBLIC OF VIETNAM", ...baseTextStyle, size: 24, bold: true })],
                                ...tableParaOptions,
                                alignment: AlignmentType.CENTER
                            }),
                            new Paragraph({
                                children: [new TextRun({ text: isVi ? "Độc lập – Tự do – Hạnh phúc" : "Independence - Freedom - Happiness", ...baseTextStyle, size: 26, bold: true })],
                                ...tableParaOptions,
                                alignment: AlignmentType.CENTER
                            }),
                            new Paragraph({
                                children: [new TextRun({ text: "_________________________", ...baseTextStyle, size: 18, bold: true })],
                                ...tableParaOptions,
                                alignment: AlignmentType.CENTER,
                                spacing: { before: 0, after: 0 }
                            })
                        ],
                        width: { size: 60, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.TOP
                    })
                ]
            })
        ]
    });

    // 2. Title & Decision
    const titleSection = [
        new Paragraph({ text: "", spacing: { after: 400 } }),
        new Paragraph({ 
            children: [new TextRun({ text: isVi ? "CHƯƠNG TRÌNH ĐÀO TẠO" : "TRAINING PROGRAM", ...baseTextStyle, size: 32, bold: true })], 
            ...headingParaOptions,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }),
        new Paragraph({ 
            children: [new TextRun({ text: isVi ? "(Ban hành theo Quyết định số....................... ngày...... tháng...... năm......" : "(Promulgated under Decision No....................... dated...... month...... year......", ...baseTextStyle, italics: true })], 
            ...headingParaOptions,
            alignment: AlignmentType.CENTER 
        }),
        new Paragraph({ 
            children: [new TextRun({ text: isVi ? `của Giám đốc ${generalInfo.university?.[language] || ''})` : `of the Director of ${generalInfo.university?.[language] || ''})`, ...baseTextStyle, italics: true })], 
            ...headingParaOptions,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }),
    ];

    // 3. General Info Table
    const specsStr = (moetInfo.specializations || []).map((s, i) => {
        const text = `+ ${s[language]}`;
        return i === 0 ? text : `\t${text}`;
    }).join('\n');

    const infoFields = [
        { label: isVi ? "Tên chương trình đào tạo (tiếng Việt):" : "Program Name (Vietnamese):", value: moetInfo.programName?.vi || '' },
        { label: isVi ? "Tên chương trình đào tạo (tiếng Anh):" : "Program Name (English):", value: moetInfo.programName?.en || '' },
        { label: isVi ? "Mã chương trình đào tạo:" : "Program Code:", value: moetInfo.programCode || '' },
        { label: isVi ? "Ngành đào tạo:" : "Major:", value: moetInfo.majorName?.[language] || '' },
        { label: isVi ? "Mã ngành đào tạo:" : "Major Code:", value: moetInfo.majorCode || '' },
        { label: isVi ? "Các chuyên ngành:" : "Specializations:", value: specsStr },
        { label: isVi ? "Trình độ đào tạo:" : "Education Level:", value: moetInfo.level?.[language] || '' },
        { label: isVi ? "Định hướng đào tạo:" : "Training Orientation:", value: moetInfo.trainingOrientation?.[language] || '' },
        { label: isVi ? "Hình thức đào tạo:" : "Training Mode:", value: moetInfo.trainingMode?.[language] || '' },
        { label: isVi ? "Ngôn ngữ đào tạo:" : "Language of Instruction:", value: moetInfo.trainingLanguage?.[language] || '' },
        { label: isVi ? "Số học kỳ:" : "Number of Semesters:", value: moetInfo.numSemesters?.toString() || '' },
        { label: isVi ? "Văn bằng tốt nghiệp:" : "Degree Awarded:", value: moetInfo.degreeName?.[language] || '' },
    ];

    const infoTable = new Table({
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
        rows: infoFields.map(field => new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: field.label, ...baseTextStyle })],
                        ...tableParaOptions,
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 120 }
                    })],
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP
                }),
                new TableCell({
                    children: (field.value || "").split('\n').map((line, idx) => new Paragraph({
                        children: [new TextRun({ text: (idx === 0 ? "\t" : "") + line, ...baseTextStyle, bold: true })],
                        ...tableParaOptions,
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 120 },
                        tabStops: [{ type: "left", position: 200 }]
                    })),
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP
                })
            ]
        }))
    });

    // 4. Content Sections
    const legalBasisSection = [
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createSectionHeader(isVi ? "Căn cứ xây dựng CTĐT" : "Basis for Curriculum Development"),
        ...htmlToDocxParagraphs(moetInfo.legalBasis?.[language] || '', normalStyle, paraOptions),
    ];

    // --- Xử lý 1.2. Mục tiêu cụ thể ---
    let globalCounter = 1;
    const generateObjectiveList = (categoryCode: string) => {
        const filteredObjs = (moetInfo.moetSpecificObjectives || []).filter(o => o.category === categoryCode);
        if (filteredObjs.length === 0) return [new Paragraph({ text: "...", ...normalStyle, ...paraOptions })];

        return filteredObjs.map(obj => {
            const mId = `M${globalCounter.toString().padStart(2, '0')}`;
            globalCounter++;
            return new Paragraph({
                children: [
                    new TextRun({ text: `${mId}: `, ...baseTextStyle, bold: true }),
                    new TextRun({ text: obj.description[language], ...baseTextStyle })
                ],
                ...paraOptions 
            });
        });
    };

    const knowledgeObjs = generateObjectiveList('knowledge');
    const skillsObjs = generateObjectiveList('skills');
    const learningObjs = generateObjectiveList('learning');

    const section1 = [
        new Paragraph({ text: "", spacing: { after: 400 } }),
        createSectionHeader(isVi ? "1. Mục tiêu đào tạo" : "1. Educational Objectives"),
        createSubSectionHeader(isVi ? "1.1. Mục tiêu chung" : "1.1. General Objectives"),
        // Truy xuất trực tiếp từ moetInfo.generalObjectives
        ...htmlToDocxParagraphs(moetInfo.generalObjectives?.[language] || '', normalStyle, paraOptions),
        
        createSubSectionHeader(isVi ? "1.2. Mục tiêu cụ thể" : "1.2. Specific Objectives"),
        new Paragraph({ children: [new TextRun({ text: isVi ? "a) Kiến thức" : "a) Knowledge", ...baseTextStyle, bold: true })], ...paraOptions }),
        ...knowledgeObjs,

        new Paragraph({ children: [new TextRun({ text: isVi ? "b) Kỹ năng" : "b) Skills", ...baseTextStyle, bold: true })], ...paraOptions }),
        ...skillsObjs,

        new Paragraph({ children: [new TextRun({ text: isVi ? "c) Năng lực tự chủ và trách nhiệm" : "c) Autonomy and Responsibility", ...baseTextStyle, bold: true })], ...paraOptions }),
        ...learningObjs,
    ];

    // Section 2: Chuẩn đầu ra (SOs)
    const mappingTableRows = [
        new TableRow({
            children: [
                new TableCell({ children: [createTablePara(isVi ? "Ký hiệu" : "Code", { ...baseTextStyle, bold: true }, AlignmentType.CENTER)], shading: { fill: "F2F2F2" }, width: { size: 15, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [createTablePara(isVi ? "Chủ đề chuẩn đầu ra" : "Student Outcomes", { ...baseTextStyle, bold: true }, AlignmentType.CENTER)], shading: { fill: "F2F2F2" }, width: { size: 70, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [createTablePara(isVi ? "Trình độ năng lực" : "Competency Level", { ...baseTextStyle, bold: true }, AlignmentType.CENTER)], shading: { fill: "F2F2F2" }, width: { size: 15, type: WidthType.PERCENTAGE } }),
            ]
        })
    ];

    const sortedSpecificObjectives = [...(moetInfo.specificObjectives || [])].sort((a,b) => sortOutlineCode(a.code, b.code));

    // KHỞI TẠO BIẾN ĐẾM PLO
    let ploCounter = 1;

    sortedSpecificObjectives.forEach(obj => {
        const level = obj.code ? obj.code.split('.').length : 3;
        const isBold = level < 3;
        
        if (isBold) {
            mappingTableRows.push(new TableRow({
                children: [
                    new TableCell({ children: [createTablePara(obj.code || "", { ...baseTextStyle, bold: true }, AlignmentType.CENTER)], shading: { fill: "FAFAFA" } }),
                    new TableCell({ 
                        children: [createTablePara(obj.description[language], { ...baseTextStyle, bold: true })], 
                        columnSpan: 2,
                        shading: { fill: "FAFAFA" }
                    })
                ]
            }));
        } else {
            mappingTableRows.push(new TableRow({
                children: [
                    new TableCell({ 
                        children: [
                            createTablePara(obj.code || "", baseTextStyle, AlignmentType.CENTER),
                            // THÊM DÒNG KÝ HIỆU PLO DƯỚI MÃ LEVEL 3
                            createTablePara(`PLO${ploCounter}`, { ...baseTextStyle, bold: true }, AlignmentType.CENTER)
                        ] 
                    }),
                    new TableCell({ children: [createTablePara(obj.description[language], baseTextStyle)] }),
                    new TableCell({ children: [createTablePara(obj.competencyLevel || "", baseTextStyle, AlignmentType.CENTER)] }),
                ]
            }));
            ploCounter++;
        }
    });

    const section2 = [
        createSectionHeader(isVi ? "2. Chuẩn đầu ra (SOs)" : "2. Student Outcomes (SOs)"),
        createPara(isVi ? `Ngay khi hoàn thành chương trình đào tạo “${moetInfo.majorName?.[language] || ''}”, sinh viên có khả năng:` : `Upon completion of the “${moetInfo.majorName?.[language] || ''}” program, students are able to:`, normalStyle),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: mappingTableRows
        }),
        new Paragraph({
            children: [new TextRun({ text: isVi ? "Các mức trình độ năng lực được đánh giá theo bảng sau:" : "The competency levels are evaluated according to the following table:", ...baseTextStyle, italics: true })],
            ...paraOptions,
            spacing: { before: 240, after: 120 }
        }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [createTablePara(isVi ? "Nhóm" : "Group", { ...baseTextStyle, bold: true }, AlignmentType.CENTER)], shading: { fill: "F2F2F2" } }),
                        new TableCell({ children: [createTablePara(isVi ? "Trình độ năng lực" : "Competency Level", { ...baseTextStyle, bold: true }, AlignmentType.CENTER)], shading: { fill: "F2F2F2" } }),
                        new TableCell({ children: [createTablePara(isVi ? "Mô tả" : "Description", { ...baseTextStyle, bold: true }, AlignmentType.CENTER)], shading: { fill: "F2F2F2" } }),
                    ]
                }),
                new TableRow({ children: [
                    new TableCell({ children: [createTablePara(isVi ? "1. Nhớ" : "1. Remembering", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara("0.0 – 2.0 (I)", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara(isVi ? "Có khả năng tìm kiếm và ghi nhớ." : "Ability to search and remember.", baseTextStyle)] }),
                ]}),
                new TableRow({ children: [
                    new TableCell({ children: [createTablePara(isVi ? "2. Hiểu" : "2. Understanding", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara("2.0 – 3.0 (II)", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara(isVi ? "Có hiểu biết/ Có thể tham gia." : "Have understanding / Can participate.", baseTextStyle)] }),
                ]}),
                new TableRow({ children: [
                    new TableCell({ children: [createTablePara(isVi ? "3. Vận dụng" : "3. Applying", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara("3.0 – 3.5 (III)", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara(isVi ? "Có khả năng vận dụng." : "Ability to apply.", baseTextStyle)] }),
                ]}),
                new TableRow({ children: [
                    new TableCell({ children: [createTablePara(isVi ? "4. Phân tích" : "4. Analyzing", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara("3.5 – 4.0 (IV)", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara(isVi ? "Có khả năng phân tích." : "Ability to analyze.", baseTextStyle)] }),
                ]}),
                new TableRow({ children: [
                    new TableCell({ children: [createTablePara(isVi ? "5. Đánh giá" : "5. Evaluating", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara("4.0 – 4.5 (V)", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara(isVi ? "Có khả năng đánh giá." : "Ability to evaluate.", baseTextStyle)] }),
                ]}),
                new TableRow({ children: [
                    new TableCell({ children: [createTablePara(isVi ? "6. Sáng tạo" : "6. Creating", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara("4.5 – 5.0 (VI)", baseTextStyle)] }),
                    new TableCell({ children: [createTablePara(isVi ? "Có khả năng sử dụng thông tin để sáng tạo cái mới." : "Ability to use information to create new things.", baseTextStyle)] }),
                ]}),
            ]
        }),
        new Paragraph({ text: "", spacing: { after: 200 } })
    ];

    // Section 3: Tuyển sinh
    const section3 = [
        createSectionHeader(isVi ? "3. Đối tượng tuyển sinh, Chuẩn đầu vào" : "3. Admission Target and Requirements"),
        createSubSectionHeader(isVi ? "3.1. Đối tượng tuyển sinh" : "3.1. Admission Target"),
        // Xuất trực tiếp từ moetInfo.admissionTarget
        ...htmlToDocxParagraphs(moetInfo.admissionTarget?.[language] || '', normalStyle, paraOptions),
        createSubSectionHeader(isVi ? "3.2. Chuẩn đầu vào" : "3.2. Admission Requirements"),
        // Xuất trực tiếp từ moetInfo.admissionReq
        ...htmlToDocxParagraphs(moetInfo.admissionReq?.[language] || '', normalStyle, paraOptions),
    ];

    // Section 4: Quy trình
    const section4: Paragraph[] = [
        createSectionHeader(isVi ? "4. Quy trình đào tạo và điều kiện tốt nghiệp" : "4. Training Process and Graduation Requirements"),
        ...htmlToDocxParagraphs(moetInfo.graduationReq?.[language] || '', normalStyle, paraOptions),
    ];
    
    // Ghi chú về điều kiện tốt nghiệp (nếu có)
    if (moetInfo.graduationNote && moetInfo.graduationNote[language]) {
        section4.push(
            new Paragraph({
                children: [
                    new TextRun({ 
                        text: isVi ? "Ghi chú về điều kiện tốt nghiệp (nếu có):" : "Graduation Notes (if any):", 
                        ...baseTextStyle, 
                        bold: true 
                    })
                ],
                ...paraOptions
            })
        );
        section4.push(...htmlToDocxParagraphs(moetInfo.graduationNote[language], normalStyle, paraOptions));
    }

    return [
        headerTable,
        ...titleSection,
        infoTable,
        ...legalBasisSection,
        ...section1,
        ...section2,
        ...section3,
        ...section4
    ];
};

export const exportMoetP1 = async (generalInfo: GeneralInfo, moetInfo: MoetInfo, courses: Course[], language: Language) => {
    try {
        const children = generateMoetPart1(generalInfo, moetInfo, courses, language);
        
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
        link.download = `MOET_Part1_${(generalInfo.programName?.[language] || 'Program').replace(/\s+/g, '_')}.docx`;
        link.click();
    } catch (e) {
        console.error(e);
        alert("Error creating Page 1 DOCX");
    }
};