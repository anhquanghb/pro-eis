import React, { useRef } from 'react';
import { AppState } from '../types';
import { Download, Upload, BookOpen } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SyllabusJSONModule: React.FC<Props> = ({ state, updateState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVi = state.language === 'vi';
  const globalState = state.globalState || state;
  const courseCatalog = globalState.courseCatalog || state.courses;
  const generalInfo = globalState.institutionInfo || state.generalInfo;

  const handleExport = async () => {
    // Đóng gói toàn bộ dữ liệu Đề cương (courses)
    const exportData = {
      courses: courseCatalog,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    
    // Tên file mặc định
    let progName = generalInfo?.programName?.[state.language] || generalInfo?.programName?.vi || "Program";
    if (typeof generalInfo?.programName === 'string') progName = generalInfo.programName;
    
    const defaultFileName = `Syllabi_${progName.replace(/[\/\\]/g, '_')}.json`;

    try {
      // 1. Dùng API để hiển thị hộp thoại chọn thư mục (Save As)
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: defaultFileName,
          types: [{
            description: 'JSON File',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } 
      // 2. Dự phòng (Fallback)
      else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = defaultFileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Lỗi xuất file:", err);
        alert(isVi ? "Đã xảy ra lỗi khi lưu file." : "Error saving file.");
      }
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (!importedData.courses || !Array.isArray(importedData.courses)) {
          throw new Error("File JSON không chứa mảng courses hợp lệ.");
        }

        if (window.confirm(isVi ? "Thao tác này sẽ ghi đè toàn bộ Đề cương hiện tại. Bạn có chắc chắn không?" : "This will overwrite all current syllabi. Are you sure?")) {
          updateState(prev => {
            if (prev.globalState) {
                return {
                    ...prev,
                    globalState: {
                        ...prev.globalState,
                        courseCatalog: importedData.courses
                    }
                };
            }
            return {
                ...prev,
                courses: importedData.courses
            };
          });
          alert(isVi ? "Nhập dữ liệu Đề cương thành công!" : "Syllabi imported successfully!");
        }
      } catch (err) {
        console.error(err);
        alert(isVi ? "Lỗi! File JSON không hợp lệ hoặc bị hỏng." : "Error! Invalid or corrupted JSON file.");
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 p-8 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <BookOpen size={48} strokeWidth={1.5} />
      </div>
      
      <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
        {isVi ? 'Quản lý Đề cương chi tiết' : 'Syllabus Management'}
      </h2>
      
      <p className="text-base font-medium text-slate-500 mb-10 max-w-lg leading-relaxed">
        {isVi 
          ? 'Chọn một môn học từ danh sách bên trái để chỉnh sửa, hoặc sử dụng các công cụ dưới đây để sao lưu và phục hồi toàn bộ dữ liệu Đề cương.' 
          : 'Select a course from the sidebar to edit, or use the tools below to backup and restore all syllabi data.'}
      </p>

      <div className="flex items-center gap-4">
        <input 
          type="file" 
          accept=".json" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImport} 
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
        >
          <Upload size={18} />
          {isVi ? 'Nhập dữ liệu (JSON)' : 'Import JSON'}
        </button>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Download size={18} />
          {isVi ? 'Xuất dữ liệu (JSON)' : 'Export JSON'}
        </button>
      </div>
    </div>
  );
};

export default SyllabusJSONModule;