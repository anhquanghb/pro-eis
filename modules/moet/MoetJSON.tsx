import React, { useRef } from 'react';
import { AppState } from '../../types';
import { Download, Upload, FileJson } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MoetJSON: React.FC<Props> = ({ state, updateState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVi = state.language === 'vi';

  const handleExport = async () => {
    // Đóng gói toàn bộ dữ liệu quan trọng của MOET
    const exportData = {
      generalInfo: state.generalInfo,
      mission: state.mission,
      courses: state.courses,
      studentOutcomes: state.studentOutcomes,
      courseSoMap: state.courseSoMap,
      creditBlocks: state.creditBlocks,
      knowledgeAreas: state.knowledgeAreas
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    
    // Tạo tên file mặc định an toàn
    let progName = "Program";
    if (state.generalInfo?.programName) {
        progName = typeof state.generalInfo.programName === 'string' 
            ? state.generalInfo.programName 
            : (state.generalInfo.programName[state.language] || state.generalInfo.programName.vi || "Program");
    }
    const defaultFileName = `Program_framework_${progName.replace(/[\/\\]/g, '_')}.json`;

    try {
      // 1. Dùng File System Access API để hiển thị hộp thoại chọn thư mục (Save As)
      if ('showSaveFilePicker' in window) {
        // (Ép kiểu as any để tránh lỗi TypeScript nếu cấu hình môi trường chưa hỗ trợ)
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
      // 2. Dự phòng (Fallback) cho trình duyệt không hỗ trợ (Firefox, Safari cũ...)
      else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = defaultFileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      // Bỏ qua lỗi nếu người dùng bấm nút "Cancel" trong hộp thoại Save As
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
        
        // Kiểm tra nhanh file có đúng định dạng không (phải chứa generalInfo)
        if (!importedData.generalInfo) {
          throw new Error("File JSON không chứa dữ liệu GeneralInfo hợp lệ.");
        }

        if (window.confirm(isVi ? "Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại. Bạn có chắc chắn muốn nhập file này không?" : "This will overwrite all current data. Are you sure?")) {
          updateState(prev => ({
            ...prev,
            generalInfo: importedData.generalInfo || prev.generalInfo,
            mission: importedData.mission || prev.mission,
            courses: importedData.courses || prev.courses,
            studentOutcomes: importedData.studentOutcomes || prev.studentOutcomes,
            courseSoMap: importedData.courseSoMap || prev.courseSoMap,
            creditBlocks: importedData.creditBlocks || prev.creditBlocks,
            knowledgeAreas: importedData.knowledgeAreas || prev.knowledgeAreas
          }));
          alert(isVi ? "Nhập dữ liệu thành công!" : "Data imported successfully!");
        }
      } catch (err) {
        console.error(err);
        alert(isVi ? "Lỗi! File JSON không hợp lệ hoặc bị hỏng." : "Error! Invalid or corrupted JSON file.");
      }
    };
    reader.readAsText(file);
    
    // Reset input để có thể upload lại cùng 1 file nếu cần
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <FileJson size={24} />
        </div>
        <div>
          <h3 className="font-bold text-indigo-900 text-sm">
            {isVi ? 'Quản lý Khung chương trình' : 'Program Framework Management'}
          </h3>
          <p className="text-xs text-indigo-600/80 mt-0.5">
            {isVi ? 'Xuất hoặc nhập toàn bộ CĐR, CTĐT, Đề cương và Ma trận.' : 'Export or import full MOET data including structure, syllabi, and matrix.'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <input 
          type="file" 
          accept=".json" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImport} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors"
        >
          <Upload size={16} />
          {isVi ? 'Nhập JSON' : 'Import JSON'}
        </button>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Download size={16} />
          {isVi ? 'Xuất JSON' : 'Export JSON'}
        </button>
      </div>
    </div>
  );
};

export default MoetJSON;