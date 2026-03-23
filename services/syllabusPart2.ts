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
  VerticalAlign 
} from "docx";

/**
 * Service xuất đề cương chi tiết học phần (Phần 2 - Mục 5)
 * Kiến trúc: Senior AI Solution Architect
 */
export const syllabusPart2Service = {
  async generateDoc(data: {
    course: any;
    teachingMethods: any[];
    language: 'vi' | 'en';
  }) {
    const content = await this.generateContent(data);

    const doc = new Document({
      styles: {
        default: {
            document: {
                run: { size: 26, font: "Times New Roman" }
            }
        }
      },
      sections: [{
        properties: {
            page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 } }
        },
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

    // --- 1. HELPER TÍNH TOÁN SỐ GIỜ ---
    const calculateHours = (activities: any[]) => {
      let theory = 0, discussion = 0, exercise = 0, practice = 0, selfStudy = 0;
      
      (activities || []).forEach(act => {
        const method = teachingMethods.find(m => m.id === act.methodId);
        const h = Number(act.hours) || 0;
        
        if (method) {
            // Tôn trọng tuyệt đối cấu hình category2 từ hệ thống
            switch (method.category2) {
                case 'THEORY': theory += h; break;
                case 'GROUP_DISCUSSION': discussion += h; break;
                case 'EXERCISE': exercise += h; break;
                case 'PRACTICE_LAB_INTERNSHIP': practice += h; break;
                case 'SELF_STUDY': selfStudy += h; break;
                default: 
                    // Fallback an toàn nếu phương pháp bị lỗi mất category2
                    if (method.id === 'tm-mid-t') theory += h; 
                    break;
            }
        } 
        // Trường hợp phương pháp bị xóa khỏi DB nhưng vẫn còn dính ID trong môn học
        else if (act.methodId === 'tm-mid-t') {
            theory += h; // Mặc định đẩy về Lý thuyết
        }
      });

      const total = theory + discussion + exercise + practice + selfStudy;
      return { theory, discussion, exercise, practice, selfStudy, total };
    };

    // Helper format số giờ (nếu = 0 thì để trống cho bảng gọn)
    const formatHour = (h: number) => h > 0 ? String(h) : "";

    // Helper format Dấu chấm thông minh cho Số thứ tự
    const formatNo = (no: string) => {
        if (!no) return "";
        const trimmed = String(no).trim();
        // Nếu kết thúc bằng số (0-9) thì thêm dấu ".", nếu không thì giữ nguyên
        if (/\d$/.test(trimmed)) {
            return `${trimmed}.`;
        }
        return trimmed;
    };

    // --- 2. XÂY DỰNG BẢNG DOCX ---

    const t = language === 'vi' ? {
      section5: "5. Nội dung chi tiết học phần",
      allocation: "Nội dung chi tiết học phần và phân bổ thời gian:",
      content: "Nội dung",
      teachingForm: "Hình thức tổ chức dạy học học phần",
      total: "Tổng",
      inClass: "Lên lớp",
      practice: "Thực hành, thí nghiệm, thực tập",
      selfStudy: "SV tự nghiên cứu, tự học",
      theory: "Lý thuyết",
      discussion: "Thảo luận nhóm",
      exercise: "Bài tập",
      grandTotal: "TỔNG"
    } : {
      section5: "5. Course Content",
      allocation: "Course content and time allocation:",
      content: "Content",
      teachingForm: "Teaching Organization Form",
      total: "Total",
      inClass: "In-class",
      practice: "Practice, Lab, Internship",
      selfStudy: "Self-study",
      theory: "Theory",
      discussion: "Group Discussion",
      exercise: "Exercise",
      grandTotal: "TOTAL"
    };

    // 2.1. Cấu trúc Header
    const createHeaderCell = (text: string, rowSpan = 1, colSpan = 1, width?: number) => {
        return new TableCell({
            rowSpan,
            columnSpan: colSpan,
            width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 60, right: 60 },
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text, bold: true, size: 26 })] // Font 13pt cho Header bảng
                })
            ]
        });
    };

    const headerRows = [
        new TableRow({
            children: [
                createHeaderCell(t.content, 3, 1, 30), // Cột 1: 30%
                createHeaderCell(t.teachingForm, 1, 5, 60),
                createHeaderCell(t.total, 3, 1, 10), // Cột Tổng: 10%
            ],
            tableHeader: true
        }),
        new TableRow({
            children: [
                createHeaderCell(t.inClass, 1, 3, 36), // Bao trùm 3 cột 12% = 36%
                createHeaderCell(t.practice, 2, 1, 12), // Cột 5: 12%
                createHeaderCell(t.selfStudy, 2, 1, 12), // Cột 6: 12%
            ],
            tableHeader: true
        }),
        new TableRow({
            children: [
                createHeaderCell(t.theory, 1, 1, 12), // Cột 2: 12%
                createHeaderCell(t.discussion, 1, 1, 12), // Cột 3: 12%
                createHeaderCell(t.exercise, 1, 1, 12), // Cột 4: 12%
            ],
            tableHeader: true
        }),
        new TableRow({
            children: [
                createHeaderCell("(1)", 1, 1, 30), 
                createHeaderCell("(2)", 1, 1, 12), 
                createHeaderCell("(3)", 1, 1, 12),
                createHeaderCell("(4)", 1, 1, 12), 
                createHeaderCell("(5)", 1, 1, 12), 
                createHeaderCell("(6)", 1, 1, 12), 
                createHeaderCell("(7)", 1, 1, 10)
            ],
            tableHeader: true
        })
    ];

    // 2.2. Render Data Rows
    const dataRows: TableRow[] = [];

    const createDataCell = (text: string, isBold: boolean, align: any = AlignmentType.CENTER, width?: number) => {
        return new TableCell({
            width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [
                new Paragraph({
                    alignment: align,
                    children: [new TextRun({ text, bold: isBold, size: 26 })] // Font 13pt cho Data
                })
            ]
        });
    };

    // Biến lưu trữ tổng cộng của tất cả các chương
    let grandTheory = 0, grandDiscussion = 0, grandExercise = 0, grandPractice = 0, grandSelfStudy = 0, grandTotal = 0;

    (course.topics || []).forEach((topic: any) => {
        // Tính tổng giờ của Chương (cộng dồn từ các bài SubTopics)
        let tTheory = 0, tDiscussion = 0, tExercise = 0, tPractice = 0, tSelfStudy = 0, tTotal = 0;

        (topic.subTopics || []).forEach((st: any) => {
            const hrs = calculateHours(st.activities || []);
            tTheory += hrs.theory; 
            tDiscussion += hrs.discussion; 
            tExercise += hrs.exercise;
            tPractice += hrs.practice; 
            tSelfStudy += hrs.selfStudy; 
            tTotal += hrs.total;
        });

        // Cộng dồn vào Tổng cộng toàn bảng
        grandTheory += tTheory;
        grandDiscussion += tDiscussion;
        grandExercise += tExercise;
        grandPractice += tPractice;
        grandSelfStudy += tSelfStudy;
        grandTotal += tTotal;

        // Row Chương (In đậm)
        dataRows.push(new TableRow({
            children: [
                createDataCell(`${formatNo(topic.no)} ${topic.topic?.[language] || ''}`.trim(), true, AlignmentType.LEFT, 30),
                createDataCell(formatHour(tTheory), true, AlignmentType.CENTER, 12),
                createDataCell(formatHour(tDiscussion), true, AlignmentType.CENTER, 12),
                createDataCell(formatHour(tExercise), true, AlignmentType.CENTER, 12),
                createDataCell(formatHour(tPractice), true, AlignmentType.CENTER, 12),
                createDataCell(formatHour(tSelfStudy), true, AlignmentType.CENTER, 12),
                createDataCell(formatHour(tTotal), true, AlignmentType.CENTER, 10),
            ]
        }));

        // Rows Bài học (SubTopics - In thường)
        (topic.subTopics || []).forEach((st: any) => {
            const hrs = calculateHours(st.activities || []);
            dataRows.push(new TableRow({
                children: [
                    createDataCell(`${formatNo(st.no)} ${st.topic?.[language] || ''}`.trim(), false, AlignmentType.LEFT, 30),
                    createDataCell(formatHour(hrs.theory), false, AlignmentType.CENTER, 12),
                    createDataCell(formatHour(hrs.discussion), false, AlignmentType.CENTER, 12),
                    createDataCell(formatHour(hrs.exercise), false, AlignmentType.CENTER, 12),
                    createDataCell(formatHour(hrs.practice), false, AlignmentType.CENTER, 12),
                    createDataCell(formatHour(hrs.selfStudy), false, AlignmentType.CENTER, 12),
                    createDataCell(formatHour(hrs.total), false, AlignmentType.CENTER, 10),
                ]
            }));
        });
    });

    // Thêm Row Tổng cộng (Grand Total) ở cuối bảng
    dataRows.push(new TableRow({
        children: [
            createDataCell(t.grandTotal, true, AlignmentType.CENTER, 30),
            createDataCell(formatHour(grandTheory), true, AlignmentType.CENTER, 12),
            createDataCell(formatHour(grandDiscussion), true, AlignmentType.CENTER, 12),
            createDataCell(formatHour(grandExercise), true, AlignmentType.CENTER, 12),
            createDataCell(formatHour(grandPractice), true, AlignmentType.CENTER, 12),
            createDataCell(formatHour(grandSelfStudy), true, AlignmentType.CENTER, 12),
            createDataCell(formatHour(grandTotal), true, AlignmentType.CENTER, 10),
        ]
    }));

    return [
          new Paragraph({
            children: [new TextRun({ text: t.section5, bold: true, size: 26 })],
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: t.allocation, size: 26 })],
            spacing: { after: 120 },
          }),
          new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [...headerRows, ...dataRows]
          })
        ];
  }
};
