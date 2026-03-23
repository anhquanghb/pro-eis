import React, { useState } from 'react';
import { Bot, X, Check, Copy, Sparkles, ArrowRight } from 'lucide-react';
import { Course, AppState, Language } from '../types';

interface SyllabusAIImportProps {
    course: Course;
    state: AppState;
    updateCourse: (updates: Partial<Course>) => void;
    language: Language;
}

const SyllabusAIImport: React.FC<SyllabusAIImportProps> = ({ course, state, updateCourse, language }) => {
    const [showModal, setShowModal] = useState(false);
    const [aiJsonInput, setAiJsonInput] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const getPromptTemplate = () => {
        const { teachingMethods, assessmentCategories, submissionMethods, assessmentTools, finalAssessmentMethods } = state;
        
        const teachingMethodsStr = teachingMethods.map(m => `${m.id} (${m.name[language]})`).join(', ');
        const assessmentCategoriesStr = assessmentCategories.map(c => `${c.id} (${c[language]})`).join(', ');
        const submissionMethodsStr = submissionMethods.map(s => `${s.id} (${s[language]})`).join(', ');
        const assessmentToolsStr = assessmentTools.map(t => `${t.id} (${t[language]})`).join(', ');
        const finalAssessmentMethodsStr = (finalAssessmentMethods || []).map(f => `${f.id} (${f[language]})`).join(', ');

        return `Bạn là Chuyên gia Phát triển Chương trình Đào tạo và Kỹ sư Dữ liệu.
Nhiệm vụ: Phân tích nội dung văn bản/tài liệu được cung cấp và trích xuất thành một cấu hình JSON Đề cương môn học (Syllabus) hoàn chỉnh.

RÀNG BUỘC NGHIÊM NGẶT:
1. CHỈ trả về một (01) đoạn code JSON Object duy nhất hợp lệ.
2. KHÔNG giải thích, KHÔNG chào hỏi, KHÔNG thêm bất kỳ văn bản nào ngoài JSON.
3. TUYỆT ĐỐI tuân thủ cấu trúc, kiểu dữ liệu và ràng buộc logic dưới đây:

{
  "description": {
    "vi": "Mô tả học phần tiếng Việt...",
    "en": "English course description..."
  },
  "textbooks": [
    {
      "resourceId": "lib-1773554564313", 
      "title": "Tên tài liệu",
      "author": "Tên tác giả",
      "publisher": "Nhà xuất bản",
      "year": "2024",
      "type": "textbook" 
    }
  ],
  "objectives": {
    "general": {
      "vi": "Mục tiêu chung tiếng Việt",
      "en": "General objectives in English"
    },
    "specific": {
      "knowledge": [ 
        { "vi": "Mục tiêu kiến thức 1", "en": "" }
      ],
      "skills": [ 
        { "vi": "Mục tiêu kỹ năng 1", "en": "" }
      ],
      "responsibility": [ 
        { "vi": "Mục tiêu năng lực tự chủ 1", "en": "" }
      ]
    }
  },
  "clos": {
    "vi": [
      "Nội dung Chuẩn đầu ra (CLO) 1",
      "Nội dung Chuẩn đầu ra (CLO) 2"
    ],
    "en": [
      "CLO 1 content",
      "CLO 2 content"
    ]
  },
  "topics": [
    {
      "id": "t-1773555196236", 
      "no": "Chương 1",
      "topic": {
        "vi": "Tên chương 1",
        "en": "Chapter 1 title"
      },
      "activities": [], 
      "readingRefs": [
        {
          "resourceId": "lib-1773554564313", 
          "pageRange": "Tr. 10-20"
        }
      ],
      "subTopics": [
        {
          "id": "t-1773555260819", 
          "no": "1.1",
          "topic": {
            "vi": "Tên bài/mục 1.1",
            "en": "Subtopic 1.1"
          },
          "activities": [
            {
              "methodId": "tm1", 
              "hours": 3 
            }
          ],
          "requirement": "must_know" 
        }
      ]
    }
  ],
  "cloMap": [ 
    {
      "cloIndex": 0, 
      "topicIds": ["t-1773555196236", "t-1773555260819"], 
      "objectiveIds": [], 
      "soIds": [], 
      "piIds": [] 
    }
  ],
  "assessmentConfigType": "THEORY", 
  "theoryAssessmentConfig": {
    "processWeight": 50, 
    "attendanceWeight": 10,
    "participationWeight": 10,
    "midtermWeight": 20,
    "finalProcessWeight": 0,
    "selfStudyWeight": 10, 
    "finalExamWeight": 50, 
    "finalExamDuration": 90,
    "finalExamAllowMaterials": false,
    "finalExamMaterialsDetail": "Không sử dụng tài liệu",
    "regularTests": [
      {
        "id": "rt-12345",
        "assessmentType": "midterm", 
        "form": "EXAM", 
        "contentIds": ["t-1773555196236"], 
        "weekNo": 8, 
        "tool": "PAPER", 
        "submissionMethod": "HANDWRITTEN", 
        "weight": 100 
      }
    ],
    "finalExamForms": [
      {
        "id": "fe-12345",
        "form": "ESSAY", 
        "weight": 100 
      }
    ]
  },
  "teachingMethodsDescription": {
    "vi": "Mô tả phương pháp giảng dạy..."
  },
  "coursePolicies": {
    "vi": "Chính sách điểm danh, nộp bài..."
  },
  "scheduleNumWeeks": 15,
  "schedule": [
    {
      "weekNo": 1,
      "topicIds": ["t-1773555260819"] 
    }
  ]
}

DANH SÁCH CẤU HÌNH HỆ THỐNG MẶC ĐỊNH (BẮT BUỘC SỬ DỤNG ĐÚNG ID):
- Phương pháp giảng dạy (activities.methodId): ${teachingMethodsStr}
- Loại đánh giá quá trình (regularTests.form): ${assessmentCategoriesStr}
- Hình thức nộp bài (regularTests.submissionMethod): ${submissionMethodsStr}
- Công cụ kiểm tra (regularTests.tool): ${assessmentToolsStr}
- Hình thức thi cuối học phần (finalExamForms.form): ${finalAssessmentMethodsStr}

QUY TẮC TOÁN HỌC:
- Các thành phần (attendanceWeight + participationWeight + midtermWeight + finalProcessWeight + selfStudyWeight) = processWeight.
- processWeight + finalExamWeight = 100.
- Tổng weight của finalExamForms phải = 100.

Nếu bạn đã hiểu, hãy trả lời: "SẴN SÀNG NHẬN DỮ LIỆU".`;
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(getPromptTemplate());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const applyAiJson = () => {
        try {
            // Lọc bỏ markdown ```json ... ``` nếu người dùng lỡ copy vào
            const cleanedInput = aiJsonInput.replace(/```json\n?|\n?```/gi, '').trim();
            const parsed = JSON.parse(cleanedInput);
            
            updateCourse(parsed);
            
            setShowModal(false);
            setAiJsonInput('');
            alert(language === 'vi' ? 'Đã nhập dữ liệu thành công!' : 'Data imported successfully!');
        } catch(err) {
            alert(language === 'vi' ? "JSON không hợp lệ. Vui lòng kiểm tra lại!" : "Invalid JSON. Please check the code!");
        }
    };

    return (
        <>
            <button 
                onClick={() => setShowModal(true)} 
                className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 flex items-center gap-2 transition-colors"
                title={language === 'vi' ? 'Hỗ trợ điền Đề cương bằng AI' : 'AI Syllabus Builder'}
            >
                <Bot size={16}/> {language === 'vi' ? 'Nhập bằng AI' : 'Import via AI'}
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[95vh]" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        {/* <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                                <Sparkles className="text-purple-600" size={22} />
                                {language === 'vi' ? 'AI Hỗ trợ tạo Đề cương' : 'AI Syllabus Builder'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div> */}

                        {/* Body (Scrollable) */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-10">
                            
                            {/* Step 1 */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">1</div>
                                    <h4 className="font-bold text-slate-800 text-lg">
                                        {language === 'vi' ? 'Lấy Prompt mẫu' : 'Get Prompt Template'}
                                    </h4>
                                </div>
                                <p className="text-sm text-slate-500 ml-11 mb-5">
                                    {language === 'vi' 
                                        ? 'Copy prompt này và gửi cho AI (ChatGPT, Gemini) để tạo mã JSON cấu hình chuẩn.' 
                                        : 'Copy this prompt and send it to AI (ChatGPT, Gemini) to generate standard JSON code.'}
                                </p>
                                <div className="ml-11">
                                    <button 
                                        onClick={handleCopyPrompt}
                                        className={`w-full py-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                                            isCopied 
                                                ? 'bg-purple-50 text-purple-600 border-purple-200' 
                                                : 'bg-white text-purple-600 border-purple-100 hover:bg-purple-50 hover:border-purple-200'
                                        }`}
                                    >
                                        {isCopied ? (
                                            <><Check size={20} /> {language === 'vi' ? 'Đã sao chép vào Clipboard!' : 'Copied to Clipboard!'}</>
                                        ) : (
                                            <><Copy size={20} /> {language === 'vi' ? 'Sao chép Prompt vào Clipboard' : 'Copy Prompt to Clipboard'}</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">2</div>
                                    <h4 className="font-bold text-slate-800 text-lg">
                                        {language === 'vi' ? 'Dán mã JSON từ AI' : 'Paste JSON code from AI'}
                                    </h4>
                                </div>
                                <div className="ml-11">
                                    <textarea
                                        value={aiJsonInput}
                                        onChange={(e) => setAiJsonInput(e.target.value)}
                                        className="w-full h-80 p-5 bg-[#0f172a] text-emerald-400 font-mono text-sm rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none shadow-inner leading-relaxed"
                                        placeholder={`{\n  "description": {\n    "vi": "...",\n    "en": "..."\n  },\n  ...\n}`}
                                        spellCheck={false}
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end items-center gap-4 shrink-0">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-slate-500 hover:text-slate-700 font-medium px-4 py-2 transition-colors"
                            >
                                {language === 'vi' ? 'Hủy' : 'Cancel'}
                            </button>
                            <button 
                                onClick={applyAiJson}
                                disabled={!aiJsonInput.trim()}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-colors"
                            >
                                {language === 'vi' ? 'Kiểm tra & Xem trước' : 'Check & Preview'} <ArrowRight size={18} />
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default SyllabusAIImport;