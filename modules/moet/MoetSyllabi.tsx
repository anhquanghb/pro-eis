import React, { useState, useRef, useEffect } from 'react';
import { AppState, Course } from '../../types';
import { FileText, BookOpen, Calendar, Layers, AlertCircle, Download, Upload, RefreshCw } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

type TabType = 'block' | 'semester' | 'credit';

const MoetSyllabi: React.FC<Props> = ({ state, updateState }) => {
  const globalState = state.globalState || state;
  const generalInfo = globalState.institutionInfo || state.generalInfo;
  const courses = globalState.courseCatalog || state.courses || [];
  const globalConfigs = globalState.globalConfigs || state;
  const creditBlocks = globalConfigs.creditBlocks || state.creditBlocks || [];
  const { language } = state;
  const currentProgram = state.programs?.find(p => p.id === state.currentProgramId);
  const moetInfo = currentProgram?.moetInfo || generalInfo.moetInfo || {
    blocks: [],
    numSemesters: 8
  };
  const blocks = moetInfo.blocks || [];
  const [activeTab, setActiveTab] = useState<TabType>('block');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE TÔ SÁNG MÔN HỌC ---
  const [highlightedCourseId, setHighlightedCourseId] = useState<string | null>(null);

  // --- EFFECT LẮNG NGHE LỆNH CHUYỂN HƯỚNG TỪ DOUBLE CLICK ---
  useEffect(() => {
    const handleFocus = () => {
      const focusId = sessionStorage.getItem('focusCourseId');
      if (focusId) {
        // 1. Chuyển qua tab "Theo khối tín chỉ"
        setActiveTab('credit');
        // 2. Bật highlight cho môn học đó
        setHighlightedCourseId(focusId);
        sessionStorage.removeItem('focusCourseId'); // Clear bộ nhớ tạm
        
        // 3. Đợi DOM render xong thẻ tab, sau đó Scroll đến hàng tương ứng
        setTimeout(() => {
          const el = document.getElementById(`course-row-${focusId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);

        // 4. Xóa hiệu ứng Highlight sau 3 giây
        setTimeout(() => {
          setHighlightedCourseId(null);
        }, 3000);
      }
    };

    // Chạy khi Component được Mount (Trường hợp cha vừa chuyển tab sang)
    handleFocus(); 
    
    // Lắng nghe nếu Component đã mount sẵn nhưng bị ẩn
    window.addEventListener('FOCUS_COURSE_CREDIT', handleFocus);
    return () => window.removeEventListener('FOCUS_COURSE_CREDIT', handleFocus);
  }, []);

  const updateCourseBlock = (courseId: string, blockId: string) => {
    updateState(prev => {
      const prevGlobalState = prev.globalState || prev;
      const prevCourses = prevGlobalState.courseCatalog || prev.courses || [];
      const newCourses = prevCourses.map((c: any) => c.id === courseId ? { ...c, blockId } : c);
      
      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            courseCatalog: newCourses
          }
        };
      } else {
        return {
          ...prev,
          courses: newCourses
        };
      }
    });
  };

  const updateCourseSemester = (courseId: string, semester: number) => {
    updateState(prev => {
      const prevGlobalState = prev.globalState || prev;
      const prevCourses = prevGlobalState.courseCatalog || prev.courses || [];
      const newCourses = prevCourses.map((c: any) => c.id === courseId ? { ...c, semester } : c);
      
      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            courseCatalog: newCourses
          }
        };
      } else {
        return {
          ...prev,
          courses: newCourses
        };
      }
    });
  };

  const updateCourseCreditValue = (courseId: string, creditBlockId: string, value: number) => {
    updateState(prev => {
      const prevGlobalState = prev.globalState || prev;
      const prevCourses = prevGlobalState.courseCatalog || prev.courses || [];
      const newCourses = prevCourses.map((c: any) => {
        if (c.id === courseId) {
          const currentValues = c.creditBlockValues || {};
          return {
            ...c,
            creditBlockValues: {
              ...currentValues,
              [creditBlockId]: value
            }
          };
        }
        return c;
      });
      
      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            courseCatalog: newCourses
          }
        };
      } else {
        return {
          ...prev,
          courses: newCourses
        };
      }
    });
  };

  const exportToCSV = () => {
    const headers = [
      language === 'vi' ? 'Mã môn học' : 'Course Code',
      language === 'vi' ? 'Tên môn học' : 'Course Name',
      language === 'vi' ? 'Khối KT-KN' : 'Knowledge-Skill Block',
      language === 'vi' ? 'Học kỳ' : 'Semester',
      language === 'vi' ? 'Tín chỉ' : 'Credits'
    ];

    // Add credit block acronyms
    creditBlocks.forEach(cb => {
      headers.push(cb.acronym?.[language] || cb.name?.[language] || '');
    });

    const rows = courses.map(c => {
      const block = blocks.find(b => b.id === c.blockId);
      const row = [
        c.code,
        `"${(c.name?.[language] || '').replace(/"/g, '""')}"`,
        block ? `"${(block.name?.[language] || '').replace(/"/g, '""')}"` : '',
        c.semester.toString(),
        c.credits.toString()
      ];

      creditBlocks.forEach(cb => {
        const val = (c.creditBlockValues || {})[cb.id] || 0;
        row.push(val.toString());
      });

      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `courses_syllabi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim());
      const newCourses = [...courses];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Simple CSV parser handling quotes
        const parts: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let char of lines[i]) {
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        parts.push(current.trim());

        const code = parts[0];
        const courseIndex = newCourses.findIndex(c => c.code === code);
        if (courseIndex === -1) continue;

        const blockName = parts[2];
        const semester = parseInt(parts[3]) || 1;
        const credits = parseInt(parts[4]) || 0;

        const block = blocks.find(b => b.name?.[language] === blockName);
        
        newCourses[courseIndex] = {
          ...newCourses[courseIndex],
          blockId: block ? block.id : newCourses[courseIndex].blockId,
          semester,
          credits,
          creditBlockValues: { ...(newCourses[courseIndex].creditBlockValues || {}) }
        };

        // Map credit block values
        creditBlocks.forEach((cb, cbIdx) => {
          const headerName = cb.acronym?.[language] || cb.name?.[language] || '';
          const headerIdx = headers.indexOf(headerName);
          if (headerIdx !== -1 && parts[headerIdx]) {
            newCourses[courseIndex].creditBlockValues![cb.id] = parseInt(parts[headerIdx]) || 0;
          }
        });
      }

      updateState(prev => {
        const prevGlobalState = prev.globalState || prev;
        if (prev.globalState) {
          return {
            ...prev,
            globalState: {
              ...prev.globalState,
              courseCatalog: newCourses
            }
          };
        } else {
          return {
            ...prev,
            courses: newCourses
          };
        }
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleAutoFill = () => {
    updateState(prev => {
      const prevGlobalState = prev.globalState || prev;
      const prevCourses = prevGlobalState.courseCatalog || prev.courses || [];
      
      const newCourses = prevCourses.map((c: any) => {
        const updated = { ...c };
        
        // 1. Auto-assign block if missing
        if (!updated.blockId && updated.knowledgeAreaId) {
          // Try to find a block with the same name as the knowledge area
          const ka = globalConfigs.knowledgeAreas.find(k => k.id === updated.knowledgeAreaId);
          if (ka) {
            const matchingBlock = blocks.find(b => b.name?.[language] === ka.name?.[language]);
            if (matchingBlock) {
              updated.blockId = matchingBlock.id;
            }
          }
        }

        // 2. Auto-fill credit block values if missing
        if (!updated.creditBlockValues || Object.keys(updated.creditBlockValues).length === 0) {
          // If the course has a blockId, assign all credits to that block in the creditBlockValues
          // Wait, creditBlockValues is usually for Theory/Practice/etc.
          // Let's check what creditBlocks are.
          // Usually they are: Theory, Practice, Exercise, etc.
          // We can't easily auto-fill this without parsing the course description or topics.
          // But we can at least set a default (e.g. all credits to the first block if it's "Theory")
          const firstBlock = creditBlocks[0];
          if (firstBlock) {
            updated.creditBlockValues = { [firstBlock.id]: updated.credits };
          }
        }

        return updated;
      });

      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            courseCatalog: newCourses
          }
        };
      } else {
        return {
          ...prev,
          courses: newCourses
        };
      }
    });
    alert(language === 'vi' ? "Tự động điền dữ liệu thành công!" : "Auto-fill successful!");
  };

  // Sort courses by block order first, then semester, then code
  const sortedCourses = [...courses].sort((a, b) => {
    const indexA = blocks.findIndex(bl => bl.id === a.blockId);
    const indexB = blocks.findIndex(bl => bl.id === b.blockId);
    
    // If block index is -1 (not found), put it at the end
    const sortA = indexA === -1 ? 999 : indexA;
    const sortB = indexB === -1 ? 999 : indexB;

    if (sortA !== sortB) return sortA - sortB;
    if (a.semester !== b.semester) return a.semester - b.semester;
    return a.code.localeCompare(b.code);
  });

  const numSemesters = moetInfo.numSemesters || 8;

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <FileText size={18} className="text-emerald-600" />
          {language === 'vi' ? 'Danh sách Đề cương chi tiết' : 'Detailed Syllabi List'}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('block')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'block' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Layers size={14} />
              {language === 'vi' ? 'Theo Khối KT-KN' : 'By Block'}
            </button>
            <button
              onClick={() => setActiveTab('semester')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'semester' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Calendar size={14} />
              {language === 'vi' ? 'Theo học kỳ' : 'By Semester'}
            </button>
            <button
              onClick={() => setActiveTab('credit')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'credit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <BookOpen size={14} />
              {language === 'vi' ? 'Theo khối tín chỉ' : 'By Credit Block'}
            </button>
          </div>
          
          <div className="flex gap-1 ml-2">
            <button
              onClick={handleAutoFill}
              className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
              title={language === 'vi' ? 'Tự động điền' : 'Auto-fill'}
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={exportToCSV}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              title={language === 'vi' ? 'Xuất CSV' : 'Export CSV'}
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              title={language === 'vi' ? 'Nhập CSV' : 'Import CSV'}
            >
              <Upload size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={importFromCSV}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        
        {/* --- TAB: THEO KHỐI KIẾN THỨC - KỸ NĂNG (DẠNG MA TRẬN RADIO) --- */}
        {activeTab === 'block' && (
          <div className="min-w-max">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-2 text-left text-xs font-bold text-slate-600 sticky top-0 left-0 bg-slate-50 z-30 w-64 shadow-[1px_1px_0_0_#e2e8f0]">
                    {language === 'vi' ? 'Học phần' : 'Course'}
                  </th>
                  {blocks.map(b => (
                    <th key={b.id} className="border border-slate-200 p-2 text-center text-xs font-bold text-slate-600 max-w-[120px] sticky top-0 bg-slate-50 z-20 shadow-[0_1px_0_0_#e2e8f0]" title={b.name?.[language] || ''}>
                      <div className="truncate">{b.name?.[language] || ''}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-200 p-2 text-xs font-medium text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                      <div className="font-bold text-indigo-700">{c.code}</div>
                      <div className="truncate w-56" title={c.name?.[language] || ''}>{c.name?.[language] || ''}</div>
                    </td>
                    {blocks.map(b => (
                      <td key={b.id} className="border border-slate-200 p-2 text-center">
                        <input
                          type="radio"
                          name={`block-${c.id}`}
                          checked={c.blockId === b.id}
                          onChange={() => updateCourseBlock(c.id, b.id)}
                          className="w-4 h-4 text-indigo-600 cursor-pointer"
                          title={b.name?.[language] || ''} // Hiển thị tooltip tên khối khi lướt chuột
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TAB: THEO HỌC KỲ (DẠNG MA TRẬN RADIO) --- */}
        {activeTab === 'semester' && (
          <div className="min-w-max">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-2 text-left text-xs font-bold text-slate-600 sticky top-0 left-0 bg-slate-50 z-30 w-64 shadow-[1px_1px_0_0_#e2e8f0]">
                    {language === 'vi' ? 'Học phần' : 'Course'}
                  </th>
                  {Array.from({ length: numSemesters }).map((_, i) => (
                    <th key={i} className="border border-slate-200 p-2 text-center text-xs font-bold text-slate-600 w-16 sticky top-0 bg-slate-50 z-20 shadow-[0_1px_0_0_#e2e8f0]">
                      {language === 'vi' ? `HK ${i + 1}` : `Sem ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-200 p-2 text-xs font-medium text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                      <div className="font-bold text-indigo-700">{c.code}</div>
                      <div className="truncate w-56" title={c.name?.[language] || ''}>{c.name?.[language] || ''}</div>
                    </td>
                    {Array.from({ length: numSemesters }).map((_, i) => (
                      <td key={i} className="border border-slate-200 p-2 text-center">
                        <input
                          type="radio"
                          name={`sem-${c.id}`}
                          checked={c.semester === i + 1}
                          onChange={() => updateCourseSemester(c.id, i + 1)}
                          className="w-4 h-4 text-indigo-600 cursor-pointer"
                          title={language === 'vi' ? `Học kỳ ${i + 1}` : `Semester ${i + 1}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TAB: THEO KHỐI TÍN CHỈ --- */}
        {activeTab === 'credit' && (
          <div className="min-w-max">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-2 text-left text-xs font-bold text-slate-600 sticky top-0 left-0 bg-slate-50 z-30 w-64 shadow-[1px_1px_0_0_#e2e8f0]">
                    {language === 'vi' ? 'Học phần' : 'Course'}
                  </th>
                  <th className="border border-slate-200 p-2 text-center text-xs font-bold text-slate-600 w-24 sticky top-0 bg-slate-50 z-20 shadow-[0_1px_0_0_#e2e8f0]">
                    {language === 'vi' ? 'Số tín chỉ' : 'Total Credits'}
                  </th>
                  {creditBlocks.map(cb => (
                    <th key={cb.id} className="border border-slate-200 p-2 text-center text-xs font-bold text-slate-600 w-24 sticky top-0 bg-slate-50 z-20 shadow-[0_1px_0_0_#e2e8f0]">
                      {cb.acronym?.[language] || cb.name?.[language] || ''}
                    </th>
                  ))}
                  <th className="border border-slate-200 p-2 text-center text-xs font-bold text-slate-600 w-16 sticky top-0 bg-slate-50 z-20 shadow-[0_1px_0_0_#e2e8f0]">
                    {language === 'vi' ? 'Lỗi' : 'Error'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCourses.map((c) => {
                  const values = c.creditBlockValues || {};
                  const sum = Object.values(values).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
                  const isError = sum !== c.credits;

                  return (
                    // THÊM ID VÀ CLASS ĐỂ NHẬN HIỆU ỨNG TÔ SÁNG TỪ SỰ KIỆN DOUBLE CLICK
                    <tr 
                        key={c.id} 
                        id={`course-row-${c.id}`}
                        className={`transition-all duration-700 ${highlightedCourseId === c.id ? 'bg-blue-100 shadow-sm ring-1 ring-blue-300' : 'hover:bg-slate-50'}`}
                    >
                      <td className={`border border-slate-200 p-2 text-xs font-medium text-slate-700 sticky left-0 z-10 transition-colors duration-700 shadow-[1px_0_0_0_#e2e8f0] ${highlightedCourseId === c.id ? 'bg-blue-100' : 'bg-white'}`}>
                        <div className="font-bold text-indigo-700">{c.code}</div>
                        <div className="truncate w-56" title={c.name?.[language] || ''}>{c.name?.[language] || ''}</div>
                      </td>
                      <td className={`border border-slate-200 p-2 text-center text-xs font-bold text-slate-600 transition-colors duration-700 ${highlightedCourseId === c.id ? 'bg-blue-100/50' : 'bg-slate-50'}`}>
                        {c.credits}
                      </td>
                      {creditBlocks.map(cb => (
                        <td key={cb.id} className="border border-slate-200 p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={values[cb.id] || ''}
                            onChange={(e) => updateCourseCreditValue(c.id, cb.id, parseInt(e.target.value) || 0)}
                            className={`w-full text-center text-xs p-1 border rounded transition-colors outline-none focus:ring-2 focus:ring-indigo-500 ${isError ? 'border-red-300 bg-red-50 text-red-700' : highlightedCourseId === c.id ? 'border-blue-300 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white'}`}
                          />
                        </td>
                      ))}
                      <td className="border border-slate-200 p-2 text-center">
                        {isError && (
                          <div className="flex justify-center text-red-500 animate-pulse" title={language === 'vi' ? `Tổng (${sum}) khác Số tín chỉ (${c.credits})` : `Sum (${sum}) differs from Total Credits (${c.credits})`}>
                            <AlertCircle size={16} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default MoetSyllabi;