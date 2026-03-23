
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel, VerticalAlign } from "docx";
import { Course, AssessmentMethod, Language, GeneralInfo, Faculty, TeachingMethod, SO } from '../types';

const htmlToPdfText = (html: string) => {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    let text = tempDiv.textContent || "";
    return text.replace(/\n\s*\n/g, "\n\n").trim(); // Simple text extraction for docx for now
};

export const exportSyllabusDocx = async (
    course: Course,
    assessmentMethods: AssessmentMethod[],
    language: Language,
    generalInfo: GeneralInfo,
    faculties: Faculty[],
    teachingMethods: TeachingMethod[],
    sos: SO[]
) => {
    const labels = language === 'vi' ? {
        creditHours: "Số tín chỉ", instructorInfo: "Thông tin Giảng viên", classInfo: "Thông tin Lớp học",
        textbook: "Giáo trình", references: "Tài liệu tham khảo", description: "Mô tả học phần",
        program: "Chương trình đào tạo", prereq: "Tiên quyết", coreq: "Song hành", status: "Loại hình",
        required: "Bắt buộc (R)", selectedElective: "Tự chọn định hướng (SE)", elective: "Tự chọn tự do (E)",
        topics: "NỘI DUNG ĐỀ MỤC & THỜI KHÓA", contentNo: "STT", time: "Thời lượng", topic: "Nội dung", readings: "Tài liệu đọc",
        assessment: "KẾ HOẠCH ĐÁNH GIÁ", assessmentType: "Hình thức", percentile: "Tỷ lệ", total: "Tổng cộng",
        clos: "CHUẨN ĐẦU RA HỌC PHẦN (CLOs)", closIntro: "Sau khi hoàn thành học phần này, sinh viên có khả năng:",
        relationship: "MA TRẬN QUAN HỆ GIỮA CĐR HỌC PHẦN (CLOs) VÀ CĐR CHƯƠNG TRÌNH (SOs)",
        cloCol: "CĐR Học phần", topicCol: "Nội dung", methodCol: "Phương pháp giảng dạy", assessCol: "Hình thức đánh giá", levelCol: "Mức độ", soCol: "CĐR Chương trình",
        credit: "tín chỉ",
        legend: "Ghi chú: Mức độ đáp ứng: L = Thấp, M = Trung bình, và H = Cao.",
        attendanceWeight: "Điểm chuyên cần", participationWeight: "Điểm thảo luận/Semina/Bài tập", midtermWeight: "Điểm giữa kỳ", finalExam: "Điểm thi kết thúc học phần", selfStudyWeight: "Điểm tự học/nghiên cứu",
        form: "Hình thức", content: "Nội dung", week: "Thời điểm", tool: "Công cụ", submission: "Cách thức nộp", weight: "Trọng số",
        head: "TRƯỞNG BỘ MÔN", lecturer: "GIẢNG VIÊN BIÊN SOẠN"
    } : {
        creditHours: "No. of Credit Hours", instructorInfo: "Instructor Information", classInfo: "Class Information",
        textbook: "Textbook", references: "Reference Materials", description: "Course Description",
        program: "Academic Program", prereq: "Prerequisite(s)", coreq: "Co-requisite(s)", status: "Course Status",
        required: "Required (R)", selectedElective: "Selected Elective (SE)", elective: "Elective (E)",
        topics: "COURSE TOPICS & SCHEDULES", contentNo: "Content No.", time: "Amount of Time", topic: "Course Topic", readings: "Readings",
        assessment: "COURSE ASSESSMENT PLAN", assessmentType: "Assessment Type", percentile: "Grade Percentile", total: "Total",
        attendanceWeight: "Attendance", participationWeight: "Participation", midtermWeight: "Midterm Exam", finalExam: "Final Exam", selfStudyWeight: "Self-study",
        form: "Form", content: "Content", week: "Week", tool: "Tool", submission: "Submission", weight: "Weight",
        clos: "COURSE LEARNING OUTCOMES (CLOs)", closIntro: "Upon completion of this course, the student should be able to:",
        relationship: "RELATIONSHIP BETWEEN CLOs AND SOs",
        cloCol: "CLO", topicCol: "Topics", methodCol: "Methodology", assessCol: "Assessment", levelCol: "Level", soCol: "SO",
        credit: "credit(s)",
        legend: "Legend: Response level: L = Low, M = Medium, and H = High.",
        head: "HEAD OF DEPARTMENT", lecturer: "LECTURER"
    };

    const styles = {
        header: { font: "Times New Roman", size: 24, bold: true }, // 12pt
        body: { font: "Times New Roman", size: 22 }, // 11pt
        tableHeader: { font: "Times New Roman", size: 22, bold: true },
    };

    const createPara = (text: string, options: any = {}) => new Paragraph({ 
        children: [new TextRun({ text, ...options.font })], 
        ...options.para 
    });

    const mainInstructorId = course.instructorIds.find(id => course.instructorDetails[id]?.isMain) || course.instructorIds[0];
    const faculty = faculties.find(f => f.id === mainInstructorId);
    const instructorInfoStr = faculty ? `${faculty.name[language]}\nOffice: ${faculty.office || ''}\nEmail: ${faculty.email || ''}` : "N/A";
    const classInfoStr = mainInstructorId && course.instructorDetails[mainInstructorId]?.classInfo || "N/A";

    const methodHours: Record<string, number> = {};
    course.topics.forEach(t => { 
        (t.activities || []).forEach(a => { methodHours[a.methodId] = (methodHours[a.methodId] || 0) + a.hours; }); 
        (t.subTopics || []).forEach(st => {
            (st.activities || []).forEach(a => { methodHours[a.methodId] = (methodHours[a.methodId] || 0) + a.hours; });
        });
    });
    const creditDetails = Object.entries(methodHours).map(([mid, hours]) => {
        const method = teachingMethods.find(tm => tm.id === mid);
        if (!method) return null;
        const factor = method.hoursPerCredit || 15;
        const val = Math.ceil(hours / factor); return val > 0 ? `${method.code}: ${val}` : null;
    }).filter(Boolean).join(', ');
    const creditString = `${course.credits} ${labels.credit}${creditDetails ? ` (${creditDetails})` : ''}`;

    const textbooks = course.textbooks.filter(t => t.type === 'textbook');
    const refs = course.textbooks.filter(t => t.type === 'reference');

    const statusText = `${course.type === 'REQUIRED' ? '[x]' : '[ ]'} ${labels.required}\n${course.type === 'SELECTED_ELECTIVE' ? '[x]' : '[ ]'} ${labels.selectedElective}\n${course.type === 'ELECTIVE' ? '[x]' : '[ ]'} ${labels.elective}`;

    const today = new Date();
    const city = generalInfo.city?.[language] || (language === 'vi' ? 'Đà Nẵng' : 'Da Nang');
    const dateStr = language === 'vi' 
        ? `${city}, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`
        : `${city}, ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                createPara(`${course.code} - ${(course.name[language] || "").toUpperCase()}`, { font: styles.header, para: { heading: HeadingLevel.HEADING_1, alignment: AlignmentType.LEFT } }),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                // Info Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({ children: [
                            new TableCell({ children: [createPara(labels.creditHours, { font: styles.tableHeader })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                            new TableCell({ children: [createPara(labels.instructorInfo, { font: styles.tableHeader })], width: { size: 45, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                            new TableCell({ children: [createPara(labels.classInfo, { font: styles.tableHeader })], width: { size: 35, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                        ]}),
                        new TableRow({ children: [
                            new TableCell({ children: [createPara(creditString, { font: styles.body })] }),
                            new TableCell({ children: [createPara(instructorInfoStr, { font: styles.body })] }),
                            new TableCell({ children: [createPara(classInfoStr, { font: styles.body })] }),
                        ]})
                    ]
                }),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                // Textbooks & References
                createPara(labels.textbook + ":", { font: styles.header }),
                ...(textbooks.length > 0 
                    ? textbooks.map((tb, i) => createPara(`${i + 1}. ${tb.author} (${tb.year}). ${tb.title}. ${tb.publisher}.`, { font: styles.body }))
                    : [createPara("N/A", { font: styles.body })]
                ),
                new Paragraph({ text: "", spacing: { after: 100 } }),
                createPara(labels.references + ":", { font: styles.header }),
                ...(refs.length > 0 
                    ? refs.map((ref, i) => createPara(`${i + 1}. ${ref.author} (${ref.year}). ${ref.title}. ${ref.publisher}.`, { font: styles.body }))
                    : [createPara("N/A", { font: styles.body })]
                ),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                // Description
                createPara(labels.description + ":", { font: styles.header }),
                createPara(htmlToPdfText(course.description[language]), { font: styles.body }),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                // Program Context
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({ children: [
                            new TableCell({ children: [createPara(`${labels.program}: ${generalInfo.programName[language] || ""}`, { font: styles.tableHeader, para: { alignment: AlignmentType.CENTER } })], columnSpan: 3, shading: { fill: "E0E0E0" } })
                        ]}),
                        new TableRow({ children: [
                            new TableCell({ children: [createPara(labels.prereq, { font: styles.tableHeader })], width: { size: 30, type: WidthType.PERCENTAGE } }),
                            new TableCell({ children: [createPara(labels.coreq, { font: styles.tableHeader })], width: { size: 30, type: WidthType.PERCENTAGE } }),
                            new TableCell({ children: [createPara(labels.status, { font: styles.tableHeader })], width: { size: 40, type: WidthType.PERCENTAGE } }),
                        ]}),
                        new TableRow({ children: [
                            new TableCell({ children: [createPara(course.prerequisites.join(', ') || 'N/A', { font: styles.body })] }),
                            new TableCell({ children: [createPara(course.coRequisites.join(', ') || 'N/A', { font: styles.body })] }),
                            new TableCell({ children: [createPara(statusText, { font: styles.body })] }),
                        ]})
                    ]
                }),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                // Topics
                createPara(labels.topics, { font: styles.header, para: { alignment: AlignmentType.CENTER, spacing: { after: 200 } } }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({ children: [
                            new TableCell({ children: [createPara(labels.contentNo, { font: styles.tableHeader })], width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                            new TableCell({ children: [createPara(labels.time, { font: styles.tableHeader })], width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                            new TableCell({ children: [createPara(labels.topic, { font: styles.tableHeader })], width: { size: 45, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                            new TableCell({ children: [createPara(labels.readings, { font: styles.tableHeader })], width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                        ]}),
                        ...course.topics.map(t => {
                            const topicHours = (t.activities || []).reduce((s, a) => s + a.hours, 0);
                            const subTopicHours = (t.subTopics || []).reduce((sum, st) => sum + (st.activities || []).reduce((s, a) => s + a.hours, 0), 0);
                            const totalHours = topicHours + subTopicHours;
                            const readings = (t.readingRefs || []).map(r => {
                                const tbIdx = textbooks.findIndex(x => x.resourceId === r.resourceId);
                                if (tbIdx >= 0) return `[TEXT ${tbIdx+1}]`;
                                const refIdx = refs.findIndex(x => x.resourceId === r.resourceId);
                                if (refIdx >= 0) return `[REF ${refIdx+1}]`;
                                return '';
                            }).filter(Boolean).join(', ');

                            return new TableRow({
                                children: [
                                    new TableCell({ children: [createPara(t.no, { font: styles.body, para: { alignment: AlignmentType.CENTER } })] }),
                                    new TableCell({ children: [createPara(`${totalHours} hrs`, { font: styles.body, para: { alignment: AlignmentType.CENTER } })] }),
                                    new TableCell({ children: [createPara(t.topic[language], { font: styles.body })] }),
                                    new TableCell({ children: [createPara(readings, { font: styles.body })] }),
                                ]
                            });
                        })
                    ]
                }),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                // Assessment
                createPara(labels.assessment, { font: styles.header, para: { spacing: { after: 200 } } }),
                (() => {
                    let assessmentRows: { name: string, weight: number }[] = [];
                    
                    if (course.assessmentConfigType === 'THEORY' && course.theoryAssessmentConfig) {
                        const config = course.theoryAssessmentConfig;
                        if (config.attendanceWeight > 0) assessmentRows.push({ name: labels.attendanceWeight || (language === 'vi' ? 'Chuyên cần' : 'Attendance'), weight: config.attendanceWeight });
                        if (config.participationWeight > 0) assessmentRows.push({ name: labels.participationWeight || (language === 'vi' ? 'Tham gia thảo luận' : 'Participation'), weight: config.participationWeight });
                        if (config.selfStudyWeight > 0) assessmentRows.push({ name: labels.selfStudyWeight || (language === 'vi' ? 'Tự học' : 'Self-study'), weight: config.selfStudyWeight });
                        
                        (config.regularTests || []).forEach((test, idx) => {
                            const formLabel = test.form === 'OTHER' ? test.otherForm : test.form;
                            assessmentRows.push({ 
                                name: `${language === 'vi' ? 'Kiểm tra thường xuyên' : 'Regular Test'} ${idx + 1} (${formLabel})`, 
                                weight: test.weight 
                            });
                        });
                        
                        if (config.midtermWeight > 0) assessmentRows.push({ name: labels.midtermWeight || (language === 'vi' ? 'Kiểm tra giữa kỳ' : 'Midterm Exam'), weight: config.midtermWeight });
                        if (config.finalExamWeight > 0) {
                            let finalExamName = labels.finalExam || (language === 'vi' ? 'Thi cuối kỳ' : 'Final Exam');
                            if (config.finalExamForms && config.finalExamForms.length > 0) {
                                assessmentRows.push({ name: finalExamName, weight: config.finalExamWeight });
                            } else {
                                assessmentRows.push({ name: finalExamName + ` (${config.finalExamForm})`, weight: config.finalExamWeight });
                            }
                        }
                    } else if (course.assessmentConfigType === 'PRACTICE' && course.practiceAssessmentConfig) {
                        assessmentRows = (course.practiceAssessmentConfig.items || []).map(item => ({
                            name: item.task,
                            weight: item.weight
                        }));
                    } else {
                        assessmentRows = course.assessmentPlan.map(a => {
                            const method = assessmentMethods.find(m => m.id === a.methodId);
                            const defaultName = method ? method.name[language] : '';
                            const customName = a.type[language];
                            let displayName = defaultName;
                            if (customName && customName.trim() !== '' && customName.trim().toLowerCase() !== defaultName.toLowerCase()) {
                                displayName = `${defaultName}, ${customName}`;
                            }
                            return { name: displayName, weight: a.percentile };
                        });
                    }

                    return new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [
                                new TableCell({ children: [createPara(labels.assessmentType, { font: { ...styles.body, bold: true } })], width: { size: 70, type: WidthType.PERCENTAGE } }),
                                new TableCell({ children: [createPara(labels.percentile, { font: { ...styles.body, bold: true } })], width: { size: 30, type: WidthType.PERCENTAGE } }),
                            ]}),
                            ...assessmentRows.map(a => {
                                return new TableRow({ children: [
                                    new TableCell({ children: [createPara(a.name, { font: styles.body })] }),
                                    new TableCell({ children: [createPara(`${a.weight}%`, { font: styles.body })] }),
                                ]});
                            }),
                            new TableRow({ children: [
                                new TableCell({ children: [createPara(labels.total, { font: { ...styles.body, bold: true } })] }),
                                new TableCell({ children: [createPara("100%", { font: { ...styles.body, bold: true } })] }),
                            ]})
                        ]
                    });
                })(),

                // Detailed Assessment Tables
                ...(course.assessmentConfigType === 'THEORY' && course.theoryAssessmentConfig ? [
                    // Regular Tests Table
                    ...(course.theoryAssessmentConfig.regularTests && course.theoryAssessmentConfig.regularTests.length > 0 ? [
                        new Paragraph({ text: "", spacing: { before: 200, after: 100 } }),
                        createPara(language === 'vi' ? 'Chi tiết kiểm tra thường xuyên:' : 'Regular Test Details:', { font: { ...styles.body, bold: true } }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({ children: [
                                    new TableCell({ children: [createPara(labels.form, { font: styles.tableHeader })], width: { size: 15, type: WidthType.PERCENTAGE } }),
                                    new TableCell({ children: [createPara(labels.content, { font: styles.tableHeader })], width: { size: 35, type: WidthType.PERCENTAGE } }),
                                    new TableCell({ children: [createPara(labels.week, { font: styles.tableHeader })], width: { size: 10, type: WidthType.PERCENTAGE } }),
                                    new TableCell({ children: [createPara(labels.tool, { font: styles.tableHeader })], width: { size: 15, type: WidthType.PERCENTAGE } }),
                                    new TableCell({ children: [createPara(labels.submission, { font: styles.tableHeader })], width: { size: 15, type: WidthType.PERCENTAGE } }),
                                    new TableCell({ children: [createPara(labels.weight, { font: styles.tableHeader })], width: { size: 10, type: WidthType.PERCENTAGE } }),
                                ]}),
                                ...course.theoryAssessmentConfig.regularTests.map(test => {
                                    const formLabel = test.form === 'OTHER' ? test.otherForm : test.form;
                                    const contentLabel = test.contentIds.map(id => course.topics.find(t => t.id === id)?.no).filter(Boolean).join(', ');
                                    const toolLabel = test.tool === 'OTHER' ? test.otherTool : test.tool;
                                    const submissionLabel = test.submissionMethod === 'OTHER' ? test.otherSubmissionMethod : test.submissionMethod;
                                    
                                    return new TableRow({ children: [
                                        new TableCell({ children: [createPara(formLabel || "", { font: styles.body })] }),
                                        new TableCell({ children: [createPara(contentLabel || "", { font: styles.body })] }),
                                        new TableCell({ children: [createPara(String(test.weekNo || ""), { font: styles.body })] }),
                                        new TableCell({ children: [createPara(toolLabel || "", { font: styles.body })] }),
                                        new TableCell({ children: [createPara(submissionLabel || "", { font: styles.body })] }),
                                        new TableCell({ children: [createPara(`${test.weight}%`, { font: styles.body })] }),
                                    ]});
                                })
                            ]
                        })
                    ] : []),
                    // Final Exam Forms Table
                    ...(course.theoryAssessmentConfig.finalExamForms && course.theoryAssessmentConfig.finalExamForms.length > 0 ? [
                        new Paragraph({ text: "", spacing: { before: 200, after: 100 } }),
                        createPara(language === 'vi' ? 'Chi tiết thi kết thúc học phần:' : 'Final Exam Details:', { font: { ...styles.body, bold: true } }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({ children: [
                                    new TableCell({ children: [createPara(labels.form, { font: styles.tableHeader })], width: { size: 70, type: WidthType.PERCENTAGE } }),
                                    new TableCell({ children: [createPara(labels.weight, { font: styles.tableHeader })], width: { size: 30, type: WidthType.PERCENTAGE } }),
                                ]}),
                                ...course.theoryAssessmentConfig.finalExamForms.map(f => {
                                    let name = '';
                                    if (f.form === 'ESSAY') name = language === 'vi' ? 'Tự luận' : 'Essay';
                                    else if (f.form === 'MULTIPLE_CHOICE') name = language === 'vi' ? 'Trắc nghiệm' : 'Multiple Choice';
                                    else if (f.form === 'ORAL') name = language === 'vi' ? 'Vấn đáp' : 'Oral';
                                    else name = f.otherForm || (language === 'vi' ? 'Khác' : 'Other');
                                    return new TableRow({ children: [
                                        new TableCell({ children: [createPara(name, { font: styles.body })] }),
                                        new TableCell({ children: [createPara(`${f.weight}%`, { font: styles.body })] }),
                                    ]});
                                })
                            ]
                        }),
                        new Paragraph({ 
                            children: [
                                new TextRun({ text: `${language === 'vi' ? 'Thời gian làm bài: ' : 'Duration: '}${course.theoryAssessmentConfig.finalExamDuration} ${language === 'vi' ? 'phút' : 'minutes'}`, font: "Times New Roman", size: 22 }),
                                new TextRun({ text: `\n${language === 'vi' ? 'Sử dụng tài liệu: ' : 'Materials allowed: '}${course.theoryAssessmentConfig.finalExamAllowMaterials ? (language === 'vi' ? 'Có' : 'Yes') : (language === 'vi' ? 'Không' : 'No')}${course.theoryAssessmentConfig.finalExamMaterialsDetail ? ` (${course.theoryAssessmentConfig.finalExamMaterialsDetail})` : ''}`, font: "Times New Roman", size: 22 })
                            ],
                            spacing: { before: 100 }
                        })
                    ] : [])
                ] : []),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                // CLOs
                createPara(labels.clos, { font: styles.header }),
                createPara(labels.closIntro, { font: styles.body, para: { spacing: { after: 100 } } }),
                ...(course.clos[language] || []).map((clo, i) => 
                    createPara(`CLO.${i + 1}  ${clo}`, { font: styles.body, para: { indent: { left: 720 } } })
                ),
                
                // Matrix (CLO - SO) Table
                new Paragraph({ text: "", spacing: { after: 200 } }),
                createPara(labels.relationship, { font: styles.header, para: { alignment: AlignmentType.CENTER, spacing: { after: 200 } } }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({ children: [
                            new TableCell({ children: [createPara(labels.cloCol, { font: styles.tableHeader })], width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                            new TableCell({ children: [createPara(labels.topicCol, { font: styles.tableHeader })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                            new TableCell({ children: [createPara(labels.methodCol, { font: styles.tableHeader })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                            new TableCell({ children: [createPara(labels.assessCol, { font: styles.tableHeader })], width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                            new TableCell({ children: [createPara(labels.levelCol, { font: styles.tableHeader })], width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                            new TableCell({ children: [createPara(labels.soCol, { font: styles.tableHeader })], width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
                        ]}),
                        ...(course.clos[language] || []).map((_, i) => {
                            const map = course.cloMap?.find(m => m.cloIndex === i) || { topicIds: [], teachingMethodIds: [], assessmentMethodIds: [], coverageLevel: '', soIds: [], piIds: [] };
                            
                            const topicNos = map.topicIds.map(tid => course.topics.find(t => t.id === tid)?.no).filter(Boolean).join(', ');
                            const methods = map.teachingMethodIds.map(mid => teachingMethods.find(m => m.id === mid)?.code).filter(Boolean).join(', ');
                            const assess = map.assessmentMethodIds.map(aid => assessmentMethods.find(m => m.id === aid)?.name[language]).filter(Boolean).join(', ');
                            
                            const displayLevel = map.coverageLevel || "";

                            const soCodes = map.soIds.map(sid => {
                                const s = sos.find(so => so.id === sid);
                                if (!s) return '';
                                const soCode = s.code.replace('SO-', '');
                                const relatedPis = (s.pis || []).filter(pi => (map.piIds || []).includes(pi.id));
                                if (relatedPis.length > 0) {
                                    const piCodes = relatedPis.map(pi => pi.code).join(', ');
                                    return `${soCode} (${piCodes})`;
                                }
                                return soCode;
                            }).filter(Boolean).join(', ');

                            return new TableRow({
                                children: [
                                    new TableCell({ children: [createPara(`CLO.${i+1}`, { font: styles.body, para: { alignment: AlignmentType.CENTER } })] }),
                                    new TableCell({ children: [createPara(topicNos, { font: styles.body, para: { alignment: AlignmentType.CENTER } })] }),
                                    new TableCell({ children: [createPara(methods, { font: styles.body, para: { alignment: AlignmentType.CENTER } })] }),
                                    new TableCell({ children: [createPara(assess, { font: styles.body, para: { alignment: AlignmentType.CENTER } })] }),
                                    new TableCell({ children: [createPara(displayLevel, { font: styles.body, para: { alignment: AlignmentType.CENTER } })] }),
                                    new TableCell({ children: [createPara(soCodes, { font: styles.body, para: { alignment: AlignmentType.CENTER } })] }),
                                ]
                            });
                        })
                    ]
                }),

                // Add Matrix Legend
                new Paragraph({ text: "", spacing: { after: 200 } }),
                createPara(labels.legend, { font: { ...styles.body, italics: true, size: 20 } }),
                new Paragraph({ text: "", spacing: { after: 400 } }),

                // Signatures
                new Paragraph({ 
                    children: [new TextRun({ text: dateStr, font: "Times New Roman", size: 22, bold: true })], 
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 200 } 
                }),

                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ 
                                    children: [
                                        createPara(generalInfo.signerTitle?.[language] || labels.head, { font: styles.tableHeader, para: { alignment: AlignmentType.CENTER } }),
                                        new Paragraph({ text: "", spacing: { before: 1200 } }),
                                        createPara(generalInfo.signerName || "", { font: styles.tableHeader, para: { alignment: AlignmentType.CENTER } })
                                    ], 
                                    width: { size: 50, type: WidthType.PERCENTAGE } 
                                }),
                                new TableCell({ 
                                    children: [
                                        createPara(labels.lecturer, { font: styles.tableHeader, para: { alignment: AlignmentType.CENTER } }),
                                        new Paragraph({ text: "", spacing: { before: 1200 } }),
                                        createPara(faculty?.name[language] || "", { font: styles.tableHeader, para: { alignment: AlignmentType.CENTER } })
                                    ], 
                                    width: { size: 50, type: WidthType.PERCENTAGE } 
                                }),
                            ]
                        })
                    ]
                })
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Syllabus_${course.code}.docx`;
    link.click();
};
