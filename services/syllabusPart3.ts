import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  VerticalAlign,
  TextDirection
} from "docx";

/**
 * Service xuất đề cương chi tiết học phần (Phần 3 - Mục 6)
 * Kiến trúc: Senior AI Solution Architect
 */
export const syllabusPart3Service = {
  async generateDoc(data: {
    course: any;
    teachingMethods: any[];
    language: 'vi' | 'en';
  }) {
    const content = await this.generateContent(data);

    const doc = new Document({
      styles: { default: { document: { run: { size: 26, font: "Times New Roman" } } } },
      sections: [{
        properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 } } },
        children: content,
      }],
    });

    return await Packer.toBlob(doc);
  },

  async generateContent(data: {
    course: any;
    teachingMethods: any[];
    language: 'vi' | 'en';
  }) {
    const { course, teachingMethods, language = 'vi' } = data;

    // --- 1. HELPER FUNCTIONS ---

    // Hàm lấy danh sách CLO (Bỏ dấu phẩy, ngăn cách bằng khoảng trắng)
    const getMappedCLOs = (topicIds: string[]) => {
        if (!course.cloMap || course.cloMap.length === 0 || !topicIds || topicIds.length === 0) return "";
        const mappedClos = new Set<number>();
        course.cloMap.forEach((mapItem: any) => {
            if (mapItem.topicIds && mapItem.topicIds.some((id: string) => topicIds.includes(id))) {
                mappedClos.add(mapItem.cloIndex + 1);
            }
        });
        return Array.from(mappedClos).map(i => `CLO${i}`).join(" ");
    };

    // Hàm format gộp số tuần
    const formatWeeks = (weeks: number[]) => {
        if (!weeks || weeks.length === 0) return "";
        const sorted = Array.from(new Set(weeks)).sort((a, b) => a - b);
        const ranges: string[] = [];
        let start = sorted[0];
        let end = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === end + 1) {
                end = sorted[i];
            } else {
                if (start === end) ranges.push(`${start}`);
                else if (end - start === 1) ranges.push(`${start}, ${end}`);
                else ranges.push(`${start}-${end}`);
                start = sorted[i];
                end = sorted[i];
            }
        }
        if (start === end) ranges.push(`${start}`);
        else if (end - start === 1) ranges.push(`${start}, ${end}`);
        else ranges.push(`${start}-${end}`);

        const prefix = language === 'vi' ? 'Tuần' : 'Week';
        return `${prefix} ${ranges.join(', ')}`;
    };

    // --- CẬP NHẬT: Hàm bóc tách Tài liệu đọc theo số thứ tự [1], [2] ---
    const analyzeReadings = (topicsData: any[]) => {
        const readings = new Set<string>();
        topicsData.forEach(st => {
            (st.readingRefs || []).forEach((ref: any) => {
                // Tìm vị trí của tài liệu trong danh sách textbooks tổng quát của khóa học
                const bookIndex = (course.textbooks || []).findIndex((b: any) => b.resourceId === ref.resourceId);
                if (bookIndex !== -1) {
                    const pages = ref.pageRange ? `, Tr. ${ref.pageRange}` : '';
                    readings.add(`[${bookIndex + 1}]${pages}`);
                }
            });
        });
        
        // Sắp xếp các chỉ số [1], [2] tăng dần cho đẹp
        const sortedReadings = Array.from(readings).sort();
        return sortedReadings.join("; ") || (language === 'vi' ? 'Theo giáo trình' : 'Follow textbooks');
    };

    // --- 2. THUẬT TOÁN NHÓM DỮ LIỆU THEO CHƯƠNG ---
    const groupedChapters: { chapter: any, subTopics: any[], weeks: number[], allIds: string[] }[] = [];

    (course.topics || []).forEach((chapter: any) => {
        const weeks = new Set<number>();
        const scheduledSubTopics = new Set<any>();
        const allIds = new Set<string>();

        (course.schedule || []).forEach((week: any) => {
            const wIds = week.topicIds || [];
            if (wIds.includes(chapter.id)) {
                weeks.add(week.weekNo);
                allIds.add(chapter.id);
            }
            (chapter.subTopics || []).forEach((st: any) => {
                if (wIds.includes(st.id) || wIds.includes(chapter.id)) {
                    weeks.add(week.weekNo);
                    scheduledSubTopics.add(st);
                    allIds.add(st.id);
                }
            });
        });

        if (weeks.size > 0) {
            groupedChapters.push({
                chapter: chapter,
                subTopics: Array.from(scheduledSubTopics),
                weeks: Array.from(weeks),
                allIds: Array.from(allIds)
            });
        }
    });

    // --- 3. XÂY DỰNG BẢNG DOCX ---

    const createCell = (paragraphs: Paragraph[], widthPercent: number, alignCenter = false, textDirection?: any) => {
        return new TableCell({
            width: { size: widthPercent, type: WidthType.PERCENTAGE },
            verticalAlign: alignCenter ? VerticalAlign.CENTER : VerticalAlign.TOP,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            textDirection: textDirection, 
            children: paragraphs
        });
    };

    const t = language === 'vi' ? {
      section6: "6. Kế hoạch tổ chức dạy học",
      time: "Thời gian",
      content: "Nội dung",
      teachingForm: "Hình thức tổ chức dạy học",
      clo: "Đáp ứng\nCĐR",
      inClassTitle: "1. Các nội dung học tập trên lớp",
      inClassContent: "a) Nội dung:",
      teachingMethodSummary: "b) Tóm tắt phương pháp dạy học:",
      selfStudyTitle: "2. Các nội dung tự học ở nhà",
      selfStudyTask: "a) Nhiệm vụ / Phương pháp:",
      readingMaterials: "b) Tài liệu học tập cần thiết:",
      none: "- Không có",
      researchMaterials: "- Nghiên cứu tài liệu",
      periods: "tiết",
      hours: "giờ"
    } : {
      section6: "6. Teaching Plan",
      time: "Time",
      content: "Content",
      teachingForm: "Teaching Form",
      clo: "CLOs",
      inClassTitle: "1. In-class Activities",
      inClassContent: "a) Content:",
      teachingMethodSummary: "b) Teaching Method Summary:",
      selfStudyTitle: "2. Self-study Activities",
      selfStudyTask: "a) Tasks / Methods:",
      readingMaterials: "b) Required Reading Materials:",
      none: "- None",
      researchMaterials: "- Research materials",
      periods: "periods",
      hours: "hours"
    };

    const headerRow = new TableRow({
        tableHeader: true,
        children: [
            createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.time, bold: true, size: 26 })] })], 8, true),
            createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.content, bold: true, size: 26 })] })], 35, true),
            createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.teachingForm, bold: true, size: 26 })] })], 45, true),
            createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.clo, bold: true, size: 26 })] })], 12, true)
        ]
    });

    const dataRows: TableRow[] = [];

    groupedChapters.forEach((group: any) => {
        const allGroupTopics = [group.chapter, ...group.subTopics].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        const readingsStr = analyzeReadings(allGroupTopics);

        // --- BÓC TÁCH DỮ LIỆU CHO CỘT 3 ---
        const mustKnowParagraphs: Paragraph[] = [];
        const methodDescSet = new Set<string>();
        const selfStudyParagraphs: Paragraph[] = [];

        allGroupTopics.forEach(t => {
            const tName = t.topic?.[language] || t.name || '';
            if (t.requirement === 'must_know' && !t.isMainTopic) {
                (t.activities || []).forEach((act: any) => {
                    const method = teachingMethods.find(m => m.id === act.methodId);
                    if (method) {
                        mustKnowParagraphs.push(new Paragraph({
                        children: [new TextRun({
                            text: `- ${tName}: ${method.name?.[language]} - ${act.hours} ${t.periods}`,
                            size: 26
                        })],
                        indent: { left: 720 }, spacing: { after: 40 }
                    }));
                        let mDesc = method.description?.[language] || '';
                        mDesc = mDesc.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
                        if (mDesc) methodDescSet.add(`- ${mDesc}`);
                    }
                });
            } else if (t.requirement !== 'must_know' && !t.isMainTopic) {
                (t.activities || []).forEach((act: any) => {
                    const method = teachingMethods.find(m => m.id === act.methodId);
                    if (method) {
                        selfStudyParagraphs.push(new Paragraph({
                            children: [new TextRun({
                                text: `- ${tName}: ${method.name?.[language]} - ${act.hours} ${t.hours}`,
                                size: 26
                            })],
                            indent: { left: 720 }, spacing: { after: 40 }
                        }));
                    }
                });
            }
        });

        if (mustKnowParagraphs.length === 0) mustKnowParagraphs.push(new Paragraph({ children: [new TextRun({ text: t.none, size: 26 })], indent: { left: 720 } }));
        if (selfStudyParagraphs.length === 0) selfStudyParagraphs.push(new Paragraph({ children: [new TextRun({ text: t.researchMaterials, size: 26 })], indent: { left: 720 } }));

        // Cột 2 & 4 đồng bộ dòng
        const col2Paragraphs: Paragraph[] = [];
        const col4Paragraphs: Paragraph[] = [];

        col2Paragraphs.push(new Paragraph({ children: [new TextRun({ text: `${group.chapter.no}. ${group.chapter.topic?.[language] || ''}`, bold: true, size: 26 })], spacing: { after: 60 } }));
        col4Paragraphs.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: getMappedCLOs([group.chapter.id]) || " ", size: 26 })], spacing: { after: 60 } }));

        group.subTopics.forEach((st: any) => {
            col2Paragraphs.push(new Paragraph({ children: [new TextRun({ text: `${st.no}. ${st.topic?.[language] || ''}`, size: 26 })], indent: { left: 202 }, spacing: { after: 60 } }));
            col4Paragraphs.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: getMappedCLOs([st.id]) || " ", size: 26 })], spacing: { after: 60 } }));
        });

        dataRows.push(new TableRow({
            children: [
                createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: formatWeeks(group.weeks), bold: true, size: 26 })] })], 8, true, TextDirection.BOTTOM_TO_TOP_LEFT_TO_RIGHT),
                createCell(col2Paragraphs, 35),
                createCell([
                    new Paragraph({ children: [new TextRun({ text: t.inClassTitle, bold: true, size: 26 })], spacing: { after: 40 } }),
                    new Paragraph({ children: [new TextRun({ text: t.inClassContent, bold: true, size: 26 })], indent: { left: 360 } }),
                    ...mustKnowParagraphs,
                    new Paragraph({ children: [new TextRun({ text: t.teachingMethodSummary, bold: true, size: 26 })], indent: { left: 360 }, spacing: { before: 40 } }),
                    ...Array.from(methodDescSet).map(desc => new Paragraph({ children: [new TextRun({ text: desc, size: 26 })], indent: { left: 720 } })),
                    
                    new Paragraph({ children: [new TextRun({ text: t.selfStudyTitle, bold: true, size: 26 })], spacing: { before: 80, after: 40 } }),
                    new Paragraph({ children: [new TextRun({ text: t.selfStudyTask, bold: true, size: 26 })], indent: { left: 360 } }),
                    ...selfStudyParagraphs,
                    new Paragraph({ children: [new TextRun({ text: t.readingMaterials, bold: true, size: 26 })], indent: { left: 360 }, spacing: { before: 40 } }),
                    new Paragraph({ children: [new TextRun({ text: readingsStr, size: 26 })], indent: { left: 720 } }) // Hiển thị kiểu [1]; [2]
                ], 45),
                createCell(col4Paragraphs, 12)
            ]
        }));
    });

    return [
          new Paragraph({ children: [new TextRun({ text: t.section6, bold: true, size: 26 })], spacing: { before: 240, after: 120 } }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] })
        ];
  }
};
