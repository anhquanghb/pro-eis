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
  BorderStyle
} from "docx";

/**
 * Service xuất đề cương chi tiết học phần (Phần 1 - Chuẩn ABET/KĐQT)
 * Sử dụng Mapping với SOs/PIs thay vì MOET Specific Objectives
 */
export const syllabusPart1CService = {
  async generateDoc(data: {
    course: any;
    allCourses: any[];
    teachingMethods: any[];
    generalInfo: any;
    knowledgeAreas?: any[]; 
    sos: any[]; // Bổ sung mảng danh sách SOs/PIs để tra cứu
    language: 'vi' | 'en';
    cloPloMap?: any[];
    plos?: any[];
  }) {
    const content = await this.generateContent(data);

    const doc = new Document({
      // CẤU HÌNH FONT MẶC ĐỊNH CHO TOÀN BỘ VĂN BẢN LÀ 13pt (size 26) VÀ TIMES NEW ROMAN
      styles: {
        default: {
            document: {
                run: {
                    size: 26, // 13pt
                    font: "Times New Roman"
                }
            }
        }
      },
      sections: [{
        properties: {
            page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 } } // Căn lề chuẩn văn bản hành chính
        },
        children: content,
      }],
    });

    return await Packer.toBlob(doc);
  },

  async generateContent(data: {
    course: any;
    allCourses: any[];
    teachingMethods: any[];
    generalInfo: any;
    knowledgeAreas?: any[];
    sos: any[];
    language: 'vi' | 'en';
    cloPloMap?: any[];
    plos?: any[];
  }) {
    const { course, allCourses, teachingMethods, generalInfo, knowledgeAreas = [], sos = [], language = 'vi', cloPloMap = [], plos = [] } = data;

    // --- 1. TIỀN XỬ LÝ DỮ LIỆU (PRE-PROCESSING) ---

    // Xử lý Checkbox Loại học phần
    const isRequired = course.type === 'REQUIRED' ? '☑' : '☐';
    const isSelectedElective = course.type === 'SELECTED_ELECTIVE' ? '☑' : '☐';
    const isElective = course.type === 'ELECTIVE' ? '☑' : '☐';

    // Xử lý tính tổng giờ theo category2 của Teaching Methods
    let hrsTheory = 0, hrsSelfStudy = 0, hrsExercise = 0, hrsDiscussion = 0, hrsPractice = 0, hrsMidterm = 0;
    
    (course.topics || []).forEach((t: any) => {
        (t.subTopics || []).forEach((st: any) => {
            (st.activities || []).forEach((act: any) => {
                const method = teachingMethods.find(m => m.id === act.methodId);
                const h = Number(act.hours) || 0;
                
                // NẾU tìm thấy cấu hình method trong danh sách Cấu hình chung
                if (method) {
                    // Ưu tiên kiểm tra Giữa kỳ bằng ID hoặc Code
                    if (method.id === 'tm-mid-t' || method.code === 'MID-T') {
                        hrsMidterm += h;
                    } else {
                        // Nếu không phải giữa kỳ, mới xét theo Category2
                        switch (method.category2) {
                            case 'THEORY': hrsTheory += h; break;
                            case 'SELF_STUDY': hrsSelfStudy += h; break;
                            case 'EXERCISE': hrsExercise += h; break;
                            case 'GROUP_DISCUSSION': hrsDiscussion += h; break;
                            case 'PRACTICE_LAB_INTERNSHIP': hrsPractice += h; break;
                        }
                    }
                } 
                // NẾU không tìm thấy method (có thể do bị xóa trong cấu hình nhưng vẫn lưu trong DB)
                else if (act.methodId === 'tm-mid-t') {
                    hrsMidterm += h;
                }
            });
        });
    });

    const t = language === 'vi' ? {
      university: generalInfo?.university?.vi || "ĐẠI HỌC ABC",
      school: generalInfo?.school?.vi || "TÊN TRƯỜNG/KHOA......",
      republic: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",
      motto: "Độc lập - Tự do - Hạnh phúc",
      title: "ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN",
      section1: "1. Thông tin chung",
      courseNameVi: "- Tên học phần/môn học (tiếng Việt):",
      courseNameEn: "  Tên học phần/môn học (tiếng Anh):",
      courseCode: "- Mã học phần:",
      courseType: "- Loại học phần:",
      compulsory: "bắt buộc",
      electiveOrientation: "tự chọn định hướng",
      elective: "tự chọn",
      trainingLevel: "- Thuộc chương trình đào tạo trình độ:",
      trainingMode: "hình thức đào tạo:",
      knowledgeBlock: "- Thuộc khối kiến thức/kỹ năng:",
      credits: "- Số tín chỉ:",
      creditUnit: "tín chỉ",
      allocation: "- Phân giờ tín chỉ đối với các hoạt động:",
      prerequisites: "- Các học phần/môn học tiên quyết:",
      coRequisites: "- Các học phần song hành:",
      department: "- Bộ môn phụ trách học phần:",
      section2: "2. Mô tả học phần",
      descriptionPlaceholder: "Trình bày ngắn gọn nội dung trang bị cho sinh viên...",
      section3: "3. Mục tiêu của học phần",
      generalObjective: "3.1. Mục tiêu chung:",
      specificObjective: "3.2. Mục tiêu cụ thể:",
      knowledge: "a) Kiến thức:",
      skills: "b) Kỹ năng:",
      responsibility: "c) Năng lực tự chủ và trách nhiệm:",
      section4: "4. Chuẩn đầu ra",
      none: "Không có",
    } : {
      university: generalInfo?.university?.en || "ABC UNIVERSITY",
      school: generalInfo?.school?.en || "FACULTY/SCHOOL NAME......",
      republic: "SOCIALIST REPUBLIC OF VIETNAM",
      motto: "Independence - Freedom - Happiness",
      title: "COURSE SYLLABUS",
      section1: "1. General Information",
      courseNameVi: "- Course name (Vietnamese):",
      courseNameEn: "  Course name (English):",
      courseCode: "- Course code:",
      courseType: "- Course type:",
      compulsory: "compulsory",
      electiveOrientation: "elective orientation",
      elective: "elective",
      trainingLevel: "- Training level:",
      trainingMode: "Training mode:",
      knowledgeBlock: "- Knowledge/skill block:",
      credits: "- Credits:",
      creditUnit: "credits",
      allocation: "- Credit allocation for activities:",
      prerequisites: "- Prerequisites:",
      coRequisites: "- Co-requisites:",
      department: "- Department in charge:",
      section2: "2. Course Description",
      descriptionPlaceholder: "Briefly present the content provided to students...",
      section3: "3. Course Objectives",
      generalObjective: "3.1. General Objectives:",
      specificObjective: "3.2. Specific Objectives:",
      knowledge: "a) Knowledge:",
      skills: "b) Skills:",
      responsibility: "c) Autonomy and Responsibility:",
      section4: "4. Course Learning Outcomes",
      none: "None",
    };

    // Helper giải quyết tên môn học Tiên quyết / Song hành
    const resolveCourseNames = (codes: string[]) => {
        if (!codes || codes.length === 0) return t.none;
        return codes.map(code => {
            const found = allCourses.find(c => c.code === code);
            return found ? `${code} - ${found.name[language]}` : code;
        }).join('; ');
    };

    // --- 2. XÂY DỰNG NỘI DUNG ---
    const content = [
          // HEADER: Quốc hiệu & Tên trường (Bảng ẩn viền, rộng 115%, căn giữa, tỷ lệ 40:60)
          new Table({
            width: { size: 115, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "auto" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
              left: { style: BorderStyle.NONE, size: 0, color: "auto" },
              right: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        // TIÊU NGỮ FONT 12pt (size 24) - ÉP VIẾT HOA (ALL CAPS)
                        children: [new TextRun({ 
                            text: t.university.toUpperCase(), 
                            size: 24 
                        })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        // ÉP VIẾT HOA (ALL CAPS)
                        children: [new TextRun({ 
                            text: t.school.toUpperCase(), 
                            bold: true, 
                            size: 24 
                        })],
                      }),
                      // Đường kẻ ngang
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "--------------------", bold: true, size: 24 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: t.republic, bold: true, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: t.motto, bold: true, size: 24 })], // FONT 12pt
                      }),
                      // Đường kẻ ngang dưới tiêu ngữ
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "-----------------------", bold: true, size: 24 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          
          new Paragraph({ text: "", spacing: { after: 300 } }),

          // TITLE - TIÊU ĐỀ FONT 14pt (size 28)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: t.title, bold: true, size: 28 }),
            ],
            spacing: { after: 200 }
          }),

          // ==========================================
          // 1. THÔNG TIN CHUNG
          // ==========================================
          this.createSectionHeading(t.section1),
          this.createLineItem(t.courseNameVi, course.name?.vi || "................................................"),
          this.createLineItem(t.courseNameEn, course.name?.en || "................................................"),
          this.createLineItem(t.courseCode, course.code || "................"),
          
          new Paragraph({
            children: [
                new TextRun({ text: `${t.courseType} ` }),
                new TextRun({ text: ` ${isRequired} ${t.compulsory}   ` }),
                new TextRun({ text: ` ${isSelectedElective} ${t.electiveOrientation}   ` }),
                new TextRun({ text: ` ${isElective} ${t.elective}` }),
            ],
            spacing: { before: 80, after: 80 }
          }),

          this.createLineItem(t.trainingLevel, `${generalInfo?.moetInfo?.level?.[language] || '..........'}, ${t.trainingMode} ${generalInfo?.moetInfo?.trainingMode?.[language] || '..........'}`),
          
          new Paragraph({ children: [new TextRun({ text: t.knowledgeBlock, bold: false })], spacing: { before: 80, after: 80 } }),
          
          // KẺ BẢNG DANH SÁCH KHỐI KIẾN THỨC
          this.createBlocksTable(course, generalInfo, knowledgeAreas, language),

          this.createLineItem(t.credits, `${course.credits || 0} ${t.creditUnit}`),
          
          new Paragraph({ children: [new TextRun({ text: t.allocation, bold: false })], spacing: { before: 0, after: 0 } }),
          
          // KẺ BẢNG 3 CỘT CHO SỐ GIỜ HOẠT ĐỘNG
          this.createHoursTable(hrsTheory, hrsSelfStudy, hrsExercise, hrsDiscussion, hrsPractice, hrsMidterm, language),

          new Paragraph({ text: "", spacing: { after: 120 } }), // Tạo khoảng trống sau bảng

          this.createLineItem(t.prerequisites, resolveCourseNames(course.prerequisites)),
          this.createLineItem(t.coRequisites, resolveCourseNames(course.coRequisites)),
          this.createLineItem(t.department, "................................................"),

          // ==========================================
          // 2. MÔ TẢ HỌC PHẦN
          // ==========================================
          this.createSectionHeading(t.section2),
          new Paragraph({
            text: course.description?.[language] || t.descriptionPlaceholder,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 }
          }),

          // ==========================================
          // 3. MỤC TIÊU HỌC PHẦN
          // ==========================================
          this.createSectionHeading(t.section3),
          this.createSubHeading(t.generalObjective),
          new Paragraph({ 
              text: course.objectives?.general?.[language] || "...",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 120 }
          }),
          
          this.createSubHeading(t.specificObjective),
          new Paragraph({ children: [new TextRun({ text: t.knowledge, bold: true })], spacing: { before: 80, after: 80 } }),
          ...this.createBulletPoints(course.objectives?.specific?.knowledge?.map((k: any) => typeof k === 'string' ? k : k[language]), language),
          
          new Paragraph({ children: [new TextRun({ text: t.skills, bold: true })], spacing: { before: 80, after: 80 } }),
          ...this.createBulletPoints(course.objectives?.specific?.skills?.map((s: any) => typeof s === 'string' ? s : s[language]), language),

          new Paragraph({ children: [new TextRun({ text: t.responsibility, bold: true })], spacing: { before: 80, after: 80 } }),
          ...this.createBulletPoints(course.objectives?.specific?.responsibility?.map((r: any) => typeof r === 'string' ? r : r[language]), language),

          // ==========================================
          // 4. CHUẨN ĐẦU RA
          // ==========================================
          this.createSectionHeading(t.section4),
          this.createCLOTable(course, sos, language, cloPloMap, plos)
        ];

    return content;
  },

  // --- CÁC HÀM HELPER FORMAT DOCX ---

  createSectionHeading(text: string) {
    return new Paragraph({
      children: [new TextRun({ text, bold: true, size: 26 })],
      spacing: { before: 240, after: 120 },
    });
  },

  createSubHeading(text: string) {
    return new Paragraph({
      children: [new TextRun({ text, bold: true, size: 26, italics: true })],
      spacing: { before: 120, after: 80 },
    });
  },

  createLineItem(label: string, value: string) {
    return new Paragraph({
      children: [
        new TextRun({ text: label, bold: false }),
        new TextRun({ text: ` ${value}` }),
      ],
      spacing: { before: 80, after: 80 }
    });
  },

  createBulletPoints(items: string[], language: string) {
    if (!items || items.length === 0) return [new Paragraph({ text: language === 'vi' ? "+ Không có dữ liệu" : "+ No data" })];
    return items.map(item => 
      new Paragraph({
        text: `+ ${item}`,
        indent: { left: 720, hanging: 360 }, // Thụt lề treo cho bullet
        spacing: { before: 40, after: 40 }
      })
    );
  },

  // Helper: Tạo Bảng Khối kiến thức tự động tick chéo
  createBlocksTable(course: any, generalInfo: any, knowledgeAreas: any[], language: string) {
      let blocks: any[] = [];
      if (generalInfo?.moetInfo?.blocks && generalInfo.moetInfo.blocks.length > 0) {
          blocks = generalInfo.moetInfo.blocks;
      } else if (generalInfo?.moetInfo?.subBlocks && generalInfo.moetInfo.subBlocks.length > 0) {
          blocks = generalInfo.moetInfo.subBlocks;
      } else if (knowledgeAreas && knowledgeAreas.length > 0) {
          blocks = knowledgeAreas;
      } else {
          blocks = [
              { id: '1', name: { vi: 'Kiến thức chung trong toàn ĐHH', en: 'General Knowledge' } },
              { id: '2', name: { vi: 'Kiến thức chung theo lĩnh vực, đơn vị đào tạo', en: 'Field Knowledge' } },
              { id: '3', name: { vi: 'Kiến thức nhóm ngành', en: 'Major Group Knowledge' } },
              { id: '4', name: { vi: 'Kiến thức ngành/chuyên ngành', en: 'Major Knowledge' } },
              { id: '5', name: { vi: 'Chuyên đề/khóa luận/luận văn', en: 'Thesis/Project' } },
              { id: '6', name: { vi: 'Kỹ năng nghề nghiệp', en: 'Professional Skills' } },
              { id: '7', name: { vi: 'Kỹ năng mềm', en: 'Soft Skills' } },
              { id: '8', name: { vi: 'Khác: ....................', en: 'Other: ....................' } },
          ];
      }

      const blockRows = [];
      for (let i = 0; i < blocks.length; i += 2) {
          const b1 = blocks[i];
          const b2 = blocks[i + 1];

          const checkMatch = (block: any) => {
              if (!block) return false;
              if (course.blockId === block.id || course.knowledgeAreaId === block.id) return true;
              if (block.courseIds && Array.isArray(block.courseIds) && block.courseIds.includes(course.id)) return true;
              return false;
          };

          const isChecked1 = String.fromCharCode(checkMatch(b1) ? 0x2612 : 0x2610);
          const isChecked2 = b2 ? String.fromCharCode(checkMatch(b2) ? 0x2612 : 0x2610) : '';

          const name1 = b1.name?.[language] || b1.name || '';
          const name2 = b2 ? (b2.name?.[language] || b2.name || '') : '';

          blockRows.push(new TableRow({
              children: [
                  new TableCell({
                      width: { size: 42, type: WidthType.PERCENTAGE }, 
                      margins: { top: 60, bottom: 60, left: 100, right: 100 },
                      children: [new Paragraph({ children: [new TextRun({ text: `${isChecked1} ${name1}`, size: 24 })] })] 
                  }),
                  new TableCell({
                      width: { size: 58, type: WidthType.PERCENTAGE }, 
                      margins: { top: 60, bottom: 60, left: 100, right: 100 },
                      children: b2 ? [new Paragraph({ children: [new TextRun({ text: `${isChecked2} ${name2}`, size: 24 })] })] : [] 
                  })
              ]
          }));
      }

      return new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { 
              top: { style: BorderStyle.NONE, size: 0, color: "auto" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
              left: { style: BorderStyle.NONE, size: 0, color: "auto" },
              right: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
          },
          rows: blockRows
      });
  },

  createHoursTable(hrsTheory: number, hrsSelfStudy: number, hrsExercise: number, hrsDiscussion: number, hrsPractice: number, hrsMidterm: number, language: string) {
      const t = language === 'vi' ? {
        theory: "Nghe giảng lý thuyết",
        selfStudy: "Tự học, tự nghiên cứu",
        exercise: "Bài tập",
        discussion: "Thảo luận",
        practice: "Thực hành, thực tập",
        midterm: "Kiểm tra giữa kỳ",
        unit: " tiết"
      } : {
        theory: "Theory",
        selfStudy: "Self-study",
        exercise: "Exercise",
        discussion: "Discussion",
        practice: "Practice/Internship",
        midterm: "Midterm exam",
        unit: " periods"
      };

      const createRow = (label: string, hours: number) => {
          return new TableRow({
              children: [
                  new TableCell({
                      width: { size: 55, type: WidthType.PERCENTAGE },
                      margins: { top: 60, bottom: 60, left: 100, right: 100 },
                      children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: `• ${label}` })] })]
                  }),
                  new TableCell({
                      width: { size: 15, type: WidthType.PERCENTAGE },
                      margins: { top: 60, bottom: 60, left: 100, right: 100 },
                      children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: String(hours) })] })]
                  }),
                  new TableCell({
                      width: { size: 30, type: WidthType.PERCENTAGE },
                      margins: { top: 60, bottom: 60, left: 100, right: 100 },
                      children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: t.unit })] })] 
                  }),
              ]
          });
      };

      return new Table({
          width: { size: 70, type: WidthType.PERCENTAGE }, 
          alignment: AlignmentType.LEFT,
          indent: {
              size: 648, 
              type: WidthType.DXA
          },
          borders: { 
              top: { style: BorderStyle.NONE, size: 0, color: "auto" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
              left: { style: BorderStyle.NONE, size: 0, color: "auto" },
              right: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
          },
          rows: [
              createRow(t.theory, hrsTheory),
              createRow(t.selfStudy, hrsSelfStudy),
              createRow(t.exercise, hrsExercise),
              createRow(t.discussion, hrsDiscussion),
              createRow(t.practice, hrsPractice),
              createRow(t.midterm, hrsMidterm),
          ]
      });
  },

  // --- HÀM TẠO BẢNG CLO VỚI LOGIC FORMAT MỚI (ABET) ---
  createCLOTable(course: any, sos: any[], language: string, cloPloMap?: any[], plos?: any[]) {
    const t = language === 'vi' ? {
      code: "Mã",
      description: "Mô tả CĐR học phần",
      mapping: "Đáp ứng CĐR CTĐT"
    } : {
      code: "Code",
      description: "Course Learning Outcomes (CLOs)",
      mapping: "Mapped to PLOs"
    };

    const rows = [
      new TableRow({
        children: [
          new TableCell({ 
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.code, bold: true })] })],
              width: { size: 15, type: WidthType.PERCENTAGE }
          }),
          new TableCell({ 
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.description, bold: true })] })],
              width: { size: 60, type: WidthType.PERCENTAGE }
          }),
          new TableCell({ 
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.mapping, bold: true })] })],
              width: { size: 25, type: WidthType.PERCENTAGE }
          }),
        ],
      }),
    ];

    const clos = course.clos?.[language] || [];
    if (clos.length === 0) {
        rows.push(new TableRow({
            children: [
                new TableCell({ children: [new Paragraph("CLO1")] }),
                new TableCell({ children: [new Paragraph("")] }),
                new TableCell({ children: [new Paragraph("")] }),
            ]
        }))
    } else {
        clos.forEach((cloText: string, index: number) => {
          const relatedPlos = (cloPloMap || []).filter((m: any) => m.courseId === course.id && m.cloIndex === index);
          
          let formattedMapping = '';
          if (relatedPlos.length > 0) {
              formattedMapping = relatedPlos.map((m: any) => {
                  const plo = (plos || []).find((p: any) => p.id === m.ploId);
                  return plo?.code || '';
              }).filter(Boolean).sort().join(', ');
          }
    
          rows.push(new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, text: `CLO${index + 1}` })] }),
              new TableCell({ children: [new Paragraph({ text: cloText, alignment: AlignmentType.JUSTIFIED })], margins: { left: 100, right: 100 } }),
              new TableCell({ 
                  // Tách chuỗi theo \n để in ra nhiều dòng (nhiều Paragraphs) cho đẹp
                  children: formattedMapping.split('\n').map(line => 
                      new Paragraph({ alignment: AlignmentType.CENTER, text: line })
                  ) 
              }),
            ],
          }));
        });
    }

    return new Table({ 
        width: { size: 100, type: WidthType.PERCENTAGE }, 
        rows: rows 
    });
  }
};