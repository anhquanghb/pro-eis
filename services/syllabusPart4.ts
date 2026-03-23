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
  BorderStyle,
  VerticalAlign 
} from "docx";
import { Course, AppState } from '../types';

/**
 * Service xuất đề cương chi tiết học phần (Phần 4 - Đánh giá, Học liệu & GV)
 */
export const syllabusPart4Service = {
  async generateDoc(data: {
    course: Course;
    state: AppState;
    language: 'vi' | 'en';
  }) {
    const content = await this.generateContent(data);

    const doc = new Document({
      styles: { default: { document: { run: { size: 26, font: "Times New Roman" } } } },
      sections: [{
        properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 } } },
        children: content,
      }]
    });

    return await Packer.toBlob(doc);
  },

  async generateContent(data: {
    course: Course;
    state: AppState;
    language: 'vi' | 'en';
  }) {
    const { course, state, language = 'vi' } = data;
    const globalState = state.globalState || state;
    const currentProgram = state.programs?.find(p => p.id === state.currentProgramId) || state;
    const globalConfigs = globalState.globalConfigs || state;
    const generalInfo = globalState.institutionInfo || state.generalInfo;

    // --- 1. HTML PARSER HELPER ---
    const parseHtmlToDocx = (html: string): Paragraph[] => {
        if (!html) return [];
        const paragraphs: Paragraph[] = [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const walkNodes = (nodes: NodeList, isBullet = false, isOrdered = false) => {
            nodes.forEach(node => {
                if (node.nodeName === 'P' || node.nodeName === 'LI') {
                    const runs: TextRun[] = [];
                    const processChildNodes = (childNodes: NodeList) => {
                        childNodes.forEach(child => {
                            if (child.nodeType === Node.TEXT_NODE) {
                                runs.push(new TextRun({ text: child.textContent || "", size: 26 }));
                            } else if (child.nodeType === Node.ELEMENT_NODE) {
                                const element = child as HTMLElement;
                                const text = element.innerText || "";
                                const isBold = element.nodeName === 'STRONG' || element.nodeName === 'B' || element.style.fontWeight === 'bold';
                                const isItalic = element.nodeName === 'EM' || element.nodeName === 'I' || element.style.fontStyle === 'italic';
                                const isUnderline = element.nodeName === 'U' || element.style.textDecoration === 'underline';
                                runs.push(new TextRun({ text, bold: isBold, italics: isItalic, underline: isUnderline ? {} : undefined, size: 26 }));
                            }
                        });
                    };
                    processChildNodes(node.childNodes);
                    paragraphs.push(new Paragraph({
                        children: runs,
                        bullet: isBullet ? { level: 0 } : undefined,
                        spacing: { after: 120 },
                        alignment: AlignmentType.JUSTIFIED
                    }));
                } else if (node.nodeName === 'UL') { walkNodes(node.childNodes, true); } 
                  else if (node.nodeName === 'OL') { walkNodes(node.childNodes, false, true); } 
                  else if (node.childNodes.length > 0) { walkNodes(node.childNodes, isBullet, isOrdered); }
            });
        };

        walkNodes(doc.body.childNodes);
        return paragraphs.length > 0 ? paragraphs : [new Paragraph({ children: [new TextRun({ text: html.replace(/<[^>]*>/g, ''), size: 26 })] })];
    };

    // --- HELPER DỮ LIỆU ---
    const getLabel = (arr: any[], id: string) => {
        const item = arr.find(x => x.id === id);
        return item ? item[language] : id;
    };

    const getCLOsForTopics = (topicIds: string[]) => {
        const mappedClos = new Set<number>();
        course.cloMap?.forEach((m) => {
            if (m.topicIds && m.topicIds.some(id => topicIds.includes(id))) mappedClos.add(m.cloIndex + 1);
        });
        return Array.from(mappedClos).sort((a,b)=>a-b).map(i => `CLO${i}`).join(", ");
    };

    const getContentNames = (contentIds: string[]) => {
        const names: string[] = [];
        contentIds.forEach(id => {
           let t = course.topics.find(x => x.id === id);
           if (t) {
               const prefix = language === 'vi' ? 'Chương' : 'Chapter';
               names.push(t.no.toLowerCase().includes(prefix.toLowerCase()) ? t.no : `${prefix} ${t.no}`);
           } else {
               course.topics.forEach(chap => {
                   let st = chap.subTopics?.find(x => x.id === id);
                   if (st) {
                       const prefix = language === 'vi' ? 'Bài' : 'Lesson';
                       names.push(`${prefix} ${st.no}`);
                   }
               })
           }
        });
        return names;
    };

    const getFinalExamFormText = () => {
        const forms = course.theoryAssessmentConfig?.finalExamForms || [];
        const activeForms = forms.filter((f: any) => f.weight > 0);
        if (activeForms.length === 0) return course.theoryAssessmentConfig?.finalExamForm || '...';
        
        return activeForms.map((f: any) => {
            const name = f.form === 'OTHER' 
                ? (f.otherForm || (language === 'vi' ? 'Khác' : 'Other')) 
                : getLabel(globalConfigs.finalAssessmentMethods || state.finalAssessmentMethods, f.form);
            return activeForms.length > 1 ? `${name} (${f.weight}%)` : name;
        }).join(', ');
    };

    // --- HÀM LẤY CHUỖI ĐƠN VỊ CỦA GIẢNG VIÊN ---
    const getUnitHierarchy = (unitId: string) => {
        if (!unitId) return "";

        let parts: string[] = [];
        
        // 1. Dò tìm trong cấp Bộ môn (Department)
        const dept = (globalState.departments || state.departments || []).find(d => d.id === unitId);
        if (dept) {
            if (dept.name?.[language]) parts.push(dept.name[language]);
            const fac = (globalState.academicFaculties || state.academicFaculties || []).find(f => f.id === dept.academicFacultyId);
            if (fac) {
                if (fac.name?.[language]) parts.push(fac.name[language]);
                const sch = (globalState.academicSchools || state.academicSchools || []).find(s => s.id === fac.schoolId);
                if (sch && sch.name?.[language]) parts.push(sch.name[language]);
            }
            return parts.join(', ');
        }

        // 2. Dò tìm trong cấp Khoa (Faculty)
        const fac = (globalState.academicFaculties || state.academicFaculties || []).find(f => f.id === unitId);
        if (fac) {
            if (fac.name?.[language]) parts.push(fac.name[language]);
            const sch = (globalState.academicSchools || state.academicSchools || []).find(s => s.id === fac.schoolId);
            if (sch && sch.name?.[language]) parts.push(sch.name[language]);
            return parts.join(', ');
        }

        // 3. Dò tìm trong cấp Trường (School)
        const sch = (globalState.academicSchools || state.academicSchools || []).find(s => s.id === unitId);
        if (sch) {
            if (sch.name?.[language]) parts.push(sch.name[language]);
            return parts.join(', ');
        }

        return "";
    };

    // --- CÁC HÀM VẼ BẢNG ---
    const createCell = (text: string, bold = false, align: any = AlignmentType.LEFT, colSpan = 1) => new TableCell({
        columnSpan: colSpan,
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        verticalAlign: VerticalAlign.CENTER,
        children: text.split('\n').map(line => new Paragraph({ 
            alignment: align, 
            children: [new TextRun({ text: line, bold, size: 26 })],
            spacing: { after: 60 }
        }))
    });

    const createSummaryTable = () => {
        const tableRows: TableRow[] = [];
        
        // 1. Header Bảng
        tableRows.push(new TableRow({
            tableHeader: true,
            children: [
                createCell(language === 'vi' ? 'Hình thức\nkiểm tra' : 'Assessment Form', true, AlignmentType.CENTER),
                createCell(language === 'vi' ? 'Nội dung\nkiểm tra' : 'Content', true, AlignmentType.CENTER),
                createCell(language === 'vi' ? 'Thời điểm' : 'Time', true, AlignmentType.CENTER),
                createCell(language === 'vi' ? 'Công cụ' : 'Tool', true, AlignmentType.CENTER),
                createCell(language === 'vi' ? 'CĐR HP' : 'CLOs', true, AlignmentType.CENTER),
                createCell(language === 'vi' ? 'Tỷ lệ đóng\ngóp (%)' : 'Weight (%)', true, AlignmentType.CENTER),
            ]
        }));

        // 2. Phân loại các nhóm Quá trình dựa trên trọng số > 0
        const testGroups = [
            { id: 'participation', name: language === 'vi' ? 'Thảo luận, Seminar, Bài tập' : 'Participation, Seminar, Exercise', weight: theoryConfig?.participationWeight ?? 0 },
            { id: 'midterm', name: language === 'vi' ? 'Tiểu luận/Kiểm tra giữa kỳ' : 'Midterm / Essay', weight: theoryConfig?.midtermWeight ?? 0 },
            { id: 'finalProcess', name: language === 'vi' ? 'Kiểm tra cuối kỳ (quá trình)' : 'Final Process Exam', weight: theoryConfig?.finalProcessWeight ?? 0 },
            { id: 'selfStudy', name: language === 'vi' ? 'Tự học, tự nghiên cứu' : 'Self-study', weight: theoryConfig?.selfStudyWeight ?? 0 }
        ].filter(g => g.weight > 0);

        // Đổ dữ liệu các nhóm bài kiểm tra
        testGroups.forEach((group, gIdx) => {
            const tests = (theoryConfig?.regularTests || []).filter(test => 
                (test as any).assessmentType === group.id || (gIdx === 0 && !(test as any).assessmentType)
            );
            
            if (tests.length === 0) return;

            // In dòng Header Group
            tableRows.push(new TableRow({ children: [createCell(group.name, true, AlignmentType.LEFT, 6)] }));

            // In các bài kiểm tra bên trong Group đó
            tests.forEach(test => {
                let formName = test.form === 'OTHER' ? (test.otherForm || 'Khác') : getLabel(globalConfigs.assessmentCategories || state.assessmentCategories, test.form);
                let contentText = getContentNames(test.contentIds).join('\n') || '...';
                let timeText = language === 'vi' ? `Tuần ${test.weekNo}` : `Week ${test.weekNo}`;
                let toolText = test.tool === 'OTHER' ? (test.otherTool || 'Khác') : getLabel(globalConfigs.assessmentTools || state.assessmentTools, test.tool);
                let closText = getCLOsForTopics(test.contentIds);
                
                tableRows.push(new TableRow({
                    children: [
                        createCell(formName, false, AlignmentType.LEFT),
                        createCell(contentText, true, AlignmentType.CENTER),
                        createCell(timeText, false, AlignmentType.CENTER),
                        createCell(toolText, false, AlignmentType.CENTER),
                        createCell(closText, false, AlignmentType.CENTER),
                        createCell(`${test.weight}%`, false, AlignmentType.CENTER),
                    ]
                }));
            });
        });

        // 3. Nhóm Thi cuối kỳ (Final Exam)
        if ((theoryConfig?.finalExamForms || []).length > 0 && (theoryConfig?.finalExamWeight ?? 0) > 0) {
            tableRows.push(new TableRow({ children: [createCell(language === 'vi' ? 'Thi cuối kỳ' : 'Final Exam', true, AlignmentType.LEFT, 6)] }));
            
            theoryConfig!.finalExamForms.filter(f => f.weight > 0).forEach(f => {
                let formName = f.form === 'OTHER' ? (f.otherForm || 'Khác') : getLabel(globalConfigs.finalAssessmentMethods || state.finalAssessmentMethods, f.form);
                const finalOverallWeight = theoryConfig?.finalExamWeight ?? 50;
                const absoluteWeight = (f.weight * finalOverallWeight) / 100;

                tableRows.push(new TableRow({
                    children: [
                        createCell(formName, false, AlignmentType.LEFT),
                        createCell(language === 'vi' ? 'Toàn bộ học phần' : 'Entire Course', true, AlignmentType.CENTER),
                        createCell(language === 'vi' ? 'Theo lịch thi' : 'Exam Schedule', false, AlignmentType.CENTER),
                        createCell('...', false, AlignmentType.CENTER),
                        createCell((course.clos[language] || []).map((_, i) => `CLO${i+1}`).join(', '), false, AlignmentType.CENTER),
                        createCell(`${absoluteWeight}%`, false, AlignmentType.CENTER),
                    ]
                }));
            });
        }

        return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows });
    };

    const createRubricTable = (rubricData: any) => {
        if (!rubricData || !rubricData.levels || !rubricData.criteria || rubricData.criteria.length === 0) return [];
        
        const headerCells = [
            createCell(language === 'vi' ? "Tiêu chí" : "Criteria", true, AlignmentType.CENTER),
            createCell(language === 'vi' ? "Trọng số (%)" : "Weight (%)", true, AlignmentType.CENTER)
        ];
        
        rubricData.levels.forEach((lvl: any) => {
            const lvlName = lvl.label?.[language] || '';
            const lvlScore = lvl.score !== undefined ? lvl.score : '';
            headerCells.push(createCell(`${lvlName}\n(${lvlScore})`, true, AlignmentType.CENTER));
        });

        const rows = [new TableRow({ children: headerCells, tableHeader: true })];

        rubricData.criteria.forEach((crit: any) => {
            const critName = crit.label?.[language] || '...';
            const rowCells = [
                createCell(critName, false, AlignmentType.LEFT),
                createCell(`${crit.weight || 0}%`, true, AlignmentType.CENTER)
            ];
            
            rubricData.levels.forEach((lvl: any) => {
                const desc = crit.descriptions?.[lvl.id]?.[language] || '';
                rowCells.push(createCell(desc, false, AlignmentType.LEFT));
            });
            rows.push(new TableRow({ children: rowCells }));
        });

        return [
            new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
            new Paragraph({ text: "", spacing: { after: 120 } }) 
        ];
    };

    const createPracticeItemsTable = (items: any[]) => {
        if (!items || items.length === 0) return [];
        
        const rows = [
            new TableRow({
                tableHeader: true,
                children: [
                    createCell("STT", true, AlignmentType.CENTER),
                    createCell(language === 'vi' ? "Tên bài thực hành" : "Practice Task Name", true, AlignmentType.CENTER),
                    createCell(language === 'vi' ? "Trọng số (%)" : "Weight (%)", true, AlignmentType.CENTER)
                ]
            })
        ];

        items.forEach((item, idx) => {
            rows.push(new TableRow({
                children: [
                    createCell(`${idx + 1}`, false, AlignmentType.CENTER),
                    createCell(item.task || '...', false, AlignmentType.LEFT),
                    createCell(`${item.weight || 0}%`, true, AlignmentType.CENTER)
                ]
            }));
        });

        return [
            new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
            new Paragraph({ text: "", spacing: { after: 120 } })
        ];
    };


    const t = language === 'vi' ? {
      section7: "7. Học liệu",
      required: "Học liệu bắt buộc",
      optional: "Học liệu không bắt buộc",
      section8: "8. Các phương pháp giảng dạy và học tập của học phần",
      section9: "9. Chính sách đối với học phần và các yêu cầu của giảng viên",
      section10: "10. Phương pháp, hình thức kiểm tra - đánh giá kết quả học tập học phần",
      section11: "11. Thông tin về giảng viên",
      signature: "Trưởng Khoa/Giám đốc CTĐT",
      lecturer: "Giảng viên",
      processAssessment: "a) Kiểm tra – đánh giá quá trình:",
      attendance: "Điểm chuyên cần",
      participation: "Điểm đánh giá nhận thức và thái độ tham gia thảo luận, Semina, Bài tập",
      midterm: "Điểm giữa kỳ",
      finalProcess: "Điểm cuối kỳ",
      selfStudy: "Điểm đánh giá khối lượng tự học, tự nghiên cứu của sinh viên",
      finalExam: "b) Điểm thi kết thúc học phần:",
      examForm: "Hình thức thi",
      examDuration: "Thời lượng thi",
      allowMaterials: "Sinh viên được tham khảo tài liệu hay không khi thi",
      yes: "Có",
      no: "Không",
      summaryTableTitle: "Bảng tổng hợp hình thức kiểm tra:",
      practiceCriteria: "Tiêu chí đánh giá các bài thực hành:",
      practiceItems: "- Số lượng và trọng số của từng bài thực hành:",
      projectCriteria: "Tiêu chí đánh giá, cách tính điểm cụ thể:",
      lecturerInfo: "Giảng viên",
      fullName: "Họ tên",
      titleAndDegree: "Chức danh, học hàm, học vị",
      unit: "Đơn vị",
      contactAddress: "Địa chỉ liên hệ",
      phone: "Điện thoại",
      email: "E-mail",
      researchDirections: "Các hướng nghiên cứu chính",
      signAndName: "(Ký, Họ tên)",
      minutes: "phút",
      other: "Khác",
      entireCourse: "Toàn bộ học phần",
      examSchedule: "Theo lịch thi"
    } : {
      section7: "7. Learning Materials",
      required: "Required Textbooks",
      optional: "Reference Materials",
      section8: "8. Teaching and Learning Methods",
      section9: "9. Course Policies and Instructor Requirements",
      section10: "10. Assessment Methods",
      section11: "11. Instructor Information",
      signature: "Head of Faculty/Program Director",
      lecturer: "Lecturer",
      processAssessment: "a) Continuous Assessment:",
      attendance: "Attendance",
      participation: "Participation, Seminar, Exercise",
      midterm: "Midterm Exam",
      finalProcess: "Final Process Exam",
      selfStudy: "Self-study Assessment",
      finalExam: "b) Final Examination:",
      examForm: "Exam Form",
      examDuration: "Exam Duration",
      allowMaterials: "Open book exam",
      yes: "Yes",
      no: "No",
      summaryTableTitle: "Assessment Summary Table:",
      practiceCriteria: "Practice Assessment Criteria:",
      practiceItems: "- Number and Weight of Practice Tasks:",
      projectCriteria: "Project Assessment Criteria:",
      lecturerInfo: "Lecturer",
      fullName: "Full Name",
      titleAndDegree: "Title and Degree",
      unit: "Unit",
      contactAddress: "Contact Address",
      phone: "Phone",
      email: "E-mail",
      researchDirections: "Main Research Directions",
      signAndName: "(Signature, Full Name)",
      minutes: "minutes",
      other: "Other",
      entireCourse: "Entire Course",
      examSchedule: "Exam Schedule"
    };

    const createHeading = (text: string, size = 26) => new Paragraph({
        children: [new TextRun({ text, bold: true, size })],
        spacing: { before: 240, after: 120 }
    });

    const activeType = course.assessmentConfigType || 'THEORY';
    const theoryConfig = course.theoryAssessmentConfig;

    return [
          // 7. Học liệu
          createHeading(t.section7),
          createHeading(`7.1. ${t.required}`, 24),
          ...course.textbooks.filter(b => b.type === 'textbook').map((b, i) => new Paragraph({ 
            text: `[${i + 1}] ${b.author} (${b.year}), ${b.title}, ${b.publisher}.`,
            indent: { left: 360, hanging: 360 }
          })),
          createHeading(`7.2. ${t.optional}`, 24),
          ...course.textbooks.filter(b => b.type !== 'textbook').map((b, i) => new Paragraph({ 
            text: `[${i + 1 + course.textbooks.filter(x => x.type === 'textbook').length}] ${b.author} (${b.year}), ${b.title}, ${b.publisher}.`,
            indent: { left: 360, hanging: 360 }
          })),

          // 8. Phương pháp 
          createHeading(t.section8),
          ...parseHtmlToDocx(course.teachingMethodsDescription?.[language] || ""),

          // 9. Chính sách 
          createHeading(t.section9),
          ...parseHtmlToDocx(course.coursePolicies?.[language] || ""),

          // 10. Đánh giá
          createHeading(t.section10),
          
          ...(activeType === 'THEORY' ? [
              new Paragraph({ children: [new TextRun({ text: t.processAssessment, bold: true })] }),
              new Paragraph({ text: `- ${t.attendance}: ${theoryConfig?.attendanceWeight || 0}%`, indent: { left: 360 } }),
              new Paragraph({ text: `- ${t.participation}: ${theoryConfig?.participationWeight || 0}%`, indent: { left: 360 } }),
              new Paragraph({ text: `- ${t.midterm}: ${theoryConfig?.midtermWeight || 0}%`, indent: { left: 360 } }),
              new Paragraph({ text: `- ${t.finalProcess}: ${theoryConfig?.finalProcessWeight || 0}%`, indent: { left: 360 } }),
              new Paragraph({ text: `- ${t.selfStudy}: ${theoryConfig?.selfStudyWeight || 0}%`, indent: { left: 360 } }),
              
              new Paragraph({ children: [new TextRun({ text: t.finalExam, bold: true })], spacing: { before: 120 } }),
              new Paragraph({ text: `- ${t.examForm}: ${getFinalExamFormText()}`, indent: { left: 360 } }),
              new Paragraph({ text: `- ${t.examDuration}: ${theoryConfig?.finalExamDuration || '...'} ${t.minutes}`, indent: { left: 360 } }),
              new Paragraph({ text: `- ${t.allowMaterials}: ${theoryConfig?.finalExamAllowMaterials ? `${t.yes} (${theoryConfig.finalExamMaterialsDetail || ''})` : t.no}`, indent: { left: 360 } }),
              
              new Paragraph({ children: [new TextRun({ text: t.summaryTableTitle, bold: true })], spacing: { before: 240, after: 120 } }),
              createSummaryTable()
          ] : []),

          ...(activeType === 'PRACTICE' ? [
              new Paragraph({ children: [new TextRun({ text: t.practiceCriteria, bold: true })], spacing: { after: 120 } }),
              ...parseHtmlToDocx(course.practiceAssessmentConfig?.criteria || ""),
              ...(course.practiceAssessmentConfig?.criteriaType === 'RUBRIC' ? createRubricTable(course.practiceAssessmentConfig.rubric) : []),
              
              new Paragraph({ children: [new TextRun({ text: t.practiceItems, bold: true })], spacing: { before: 240, after: 120 } }),
              ...createPracticeItemsTable(course.practiceAssessmentConfig?.items || [])
          ] : []),

          ...(activeType === 'PROJECT' ? [
              new Paragraph({ children: [new TextRun({ text: t.projectCriteria, bold: true })], spacing: { after: 120 } }),
              ...parseHtmlToDocx(course.projectAssessmentConfig?.criteria || ""),
              ...(course.projectAssessmentConfig?.criteriaType === 'RUBRIC' ? createRubricTable(course.projectAssessmentConfig.rubric) : [])
          ] : []),

          // 11. Giảng viên
          createHeading(t.section11),
          ...course.instructorIds.map((id, idx) => {
            const f = (globalState.organizationStructure?.faculties || state.faculties).find((fac: any) => fac.id === id);
            if (!f) return [];

            const academicTitle = f.academicTitle?.[language];
            const degree = f.degree?.[language];
            const titleAndDegree = [academicTitle, degree].filter(Boolean).join(', ');
            const hierarchy = getUnitHierarchy(f.unitId);

            return [
                new Paragraph({ children: [new TextRun({ text: `${String.fromCharCode(97 + idx)}. ${t.lecturerInfo} ${idx + 1}`, bold: true })], spacing: { before: 120 } }),
                new Paragraph({ text: `${t.fullName}: ${f.name?.[language] || '...'}` }),
                new Paragraph({ text: `${t.titleAndDegree}: ${titleAndDegree || '...'}` }),
                new Paragraph({ text: `${t.unit}: ${hierarchy || generalInfo.school[language] || '...'}` }),
                new Paragraph({ text: `${t.contactAddress}: ${f.contactAddress || '...'}` }),
                new Paragraph({ text: `${t.phone}: ${f.tel || '...'}` }),
                new Paragraph({ text: `${t.email}: ${f.email || '...'}` }),
                new Paragraph({ text: `${t.researchDirections}: ${f.researchDirections?.[language] || '...'}` })
            ];
          }).flat(),

          // 12. Ký tên
          new Paragraph({ text: "", spacing: { before: 400 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        alignment: AlignmentType.CENTER, 
                        children: [new TextRun({ 
                          text: generalInfo.signerTitle?.[language] || t.signature, 
                          bold: true 
                        })] 
                      }),
                      new Paragraph({ alignment: AlignmentType.CENTER, text: t.signAndName }),
                      new Paragraph({ text: "", spacing: { before: 1200 } }),
                      new Paragraph({ 
                        alignment: AlignmentType.CENTER, 
                        children: [new TextRun({ 
                          text: generalInfo.signerName || "", 
                          bold: true 
                        })] 
                      }),
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.lecturer, bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, text: t.signAndName }),
                    ]
                  }),
                ]
              })
            ]
          })
        ];
  }
};
