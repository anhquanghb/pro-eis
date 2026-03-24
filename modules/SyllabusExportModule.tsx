import React, { useState } from 'react';
import { Download, Loader2, FileDown, BookCheck } from 'lucide-react';
import { syllabusPart1Service } from '../services/syllabusPart1';
import { syllabusPart1CService } from '../services/syllabusPart1C'; // Import service mới
import { syllabusPart2Service } from '../services/syllabusPart2';
import { syllabusPart3Service } from '../services/syllabusPart3';
import { syllabusPart4Service } from '../services/syllabusPart4';
import { Course, AppState } from '../types';

interface ExportModuleProps {
  course: Course;
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SyllabusExportModule: React.FC<ExportModuleProps> = ({ course, state }) => {
  // Tách riêng state loading cho từng phần
  const [isExportingPart1, setIsExportingPart1] = useState(false);
  const [isExportingPart1C, setIsExportingPart1C] = useState(false); // Thêm loading state cho P1C
  const [isExportingPart2, setIsExportingPart2] = useState(false);
  const [isExportingPart3, setIsExportingPart3] = useState(false);
  const [isExportingPart4, setIsExportingPart4] = useState(false);
  
  const { language } = state;
  const globalState = state.globalState || state;
  const currentProgram = state.programs?.find(p => p.id === state.currentProgramId) || state;
  const { courseCatalog, globalConfigs } = globalState as any;
  const { teachingMethods, knowledgeAreas } = globalConfigs || state;
  const { sos } = currentProgram as any;
  const generalInfo = globalState.institutionInfo || state.generalInfo;

  const isAnyExporting = isExportingPart1 || isExportingPart1C || isExportingPart2 || isExportingPart3 || isExportingPart4;

  // Helper tải file
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPart1 = async () => {
    setIsExportingPart1(true);
    try {
      const blob = await syllabusPart1Service.generateDoc({
        course,
        allCourses: courseCatalog || state.courses,
        teachingMethods: teachingMethods,
        generalInfo: generalInfo,
        knowledgeAreas: knowledgeAreas || [],
        language
      });
      downloadBlob(blob, `De_cuong_Hoc_phan_P1_${course.code || course.id}.docx`);
    } catch (error) {
      console.error("Export P1 failed:", error);
      alert(language === 'vi' ? "Xuất bản Phần 1 thất bại" : "Export Part 1 failed");
    } finally {
      setIsExportingPart1(false);
    }
  };

  const handleExportPart1C = async () => {
    setIsExportingPart1C(true);
    try {
      const blob = await syllabusPart1CService.generateDoc({
        course,
        allCourses: courseCatalog || state.courses,
        teachingMethods: teachingMethods,
        generalInfo: generalInfo,
        knowledgeAreas: knowledgeAreas || [],
        sos: sos || [], // Truyền danh sách SOs/PIs
        language,
        cloPloMap: currentProgram?.cloPloMap || [],
        plos: currentProgram?.PLOs || []
      });
      downloadBlob(blob, `De_cuong_Hoc_phan_P1C_${course.code || course.id}.docx`);
    } catch (error) {
      console.error("Export P1C failed:", error);
      alert(language === 'vi' ? "Xuất bản Phần 1C thất bại" : "Export Part 1C failed");
    } finally {
      setIsExportingPart1C(false);
    }
  };

  const handleExportPart2 = async () => {
    setIsExportingPart2(true);
    try {
      const blob = await syllabusPart2Service.generateDoc({
        course,
        teachingMethods: teachingMethods,
        language
      });
      downloadBlob(blob, `De_cuong_Hoc_phan_P2_${course.code || course.id}.docx`);
    } catch (error) {
      console.error("Export P2 failed:", error);
      alert(language === 'vi' ? "Xuất bản Phần 2 thất bại" : "Export Part 2 failed");
    } finally {
      setIsExportingPart2(false);
    }
  };

  const handleExportPart3 = async () => {
    setIsExportingPart3(true);
    try {
      const blob = await syllabusPart3Service.generateDoc({
        course,
        teachingMethods: teachingMethods,
        language
      });
      downloadBlob(blob, `De_cuong_Hoc_phan_P3_${course.code || course.id}.docx`);
    } catch (error) {
      console.error("Export P3 failed:", error);
      alert(language === 'vi' ? "Xuất bản Phần 3 thất bại" : "Export Part 3 failed");
    } finally {
      setIsExportingPart3(false);
    }
  };

  const handleExportPart4 = async () => {
    setIsExportingPart4(true);
    try {
      const blob = await syllabusPart4Service.generateDoc({
        course,
        state, 
        language
      });
      downloadBlob(blob, `De_cuong_Hoc_phan_P4_${course.code || course.id}.docx`);
    } catch (error) {
      console.error("Export P4 failed:", error);
      alert(language === 'vi' ? "Xuất bản Phần 4 thất bại" : "Export Part 4 failed");
    } finally {
      setIsExportingPart4(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
        <Download className="w-5 h-5 text-blue-600" />
        {language === 'vi' ? 'Xuất bản Đề cương (Từng phần)' : 'Publish Syllabus (By Parts)'}
      </h2>
      <p className="text-slate-600 mb-8 text-sm">
        {language === 'vi' 
          ? 'Chọn từng phần để xuất file Word (.docx) tương ứng với nội dung đề cương chi tiết.' 
          : 'Select each part to export the corresponding Word (.docx) file for the detailed syllabus.'}
      </p>
      
      {/* Cập nhật thành grid 5 cột để chứa thêm nút P1C */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* NÚT XUẤT PHẦN 1 */}
        <button
          onClick={handleExportPart1}
          disabled={isAnyExporting}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-blue-50 border-2 border-blue-100 rounded-2xl hover:bg-blue-100 hover:border-blue-300 transition-all group disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {isExportingPart1 ? <Loader2 className="w-6 h-6 text-blue-600 animate-spin" /> : <FileDown className="w-6 h-6 text-blue-600" />}
          </div>
          <div className="text-center">
            <span className="block font-bold text-blue-900 text-sm">Phần 1</span>
            <span className="text-[10px] font-medium text-blue-600">
              {language === 'vi' ? 'Thông tin chung & Mục tiêu' : 'General Info & Objectives'}
            </span>
          </div>
        </button>

        {/* NÚT XUẤT PHẦN 1C (Chuẩn KĐQT) */}
        <button
          onClick={handleExportPart1C}
          disabled={isAnyExporting}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-cyan-50 border-2 border-cyan-100 rounded-2xl hover:bg-cyan-100 hover:border-cyan-300 transition-all group disabled:opacity-50 shadow-sm hover:shadow-md relative overflow-hidden"
        >
          {/* Badge nhỏ góc trên */}
          <div className="absolute top-2 right-2 bg-cyan-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            ABET
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {isExportingPart1C ? <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" /> : <BookCheck className="w-6 h-6 text-cyan-600" />}
          </div>
          <div className="text-center">
            <span className="block font-bold text-cyan-900 text-sm">Phần 1C</span>
            <span className="text-[10px] font-medium text-cyan-600">
              {language === 'vi' ? 'Thông tin chung (Chuẩn KĐ)' : 'General Info (Accreditation)'}
            </span>
          </div>
        </button>

        {/* NÚT XUẤT PHẦN 2 */}
        <button
          onClick={handleExportPart2}
          disabled={isAnyExporting}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl hover:bg-emerald-100 hover:border-emerald-300 transition-all group disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {isExportingPart2 ? <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /> : <FileDown className="w-6 h-6 text-emerald-600" />}
          </div>
          <div className="text-center">
            <span className="block font-bold text-emerald-900 text-sm">Phần 2</span>
            <span className="text-[10px] font-medium text-emerald-600">
              {language === 'vi' ? 'Nội dung chi tiết học phần' : 'Detailed Content'}
            </span>
          </div>
        </button>

        {/* NÚT XUẤT PHẦN 3 */}
        <button
          onClick={handleExportPart3}
          disabled={isAnyExporting}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-amber-50 border-2 border-amber-100 rounded-2xl hover:bg-amber-100 hover:border-amber-300 transition-all group disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {isExportingPart3 ? <Loader2 className="w-6 h-6 text-amber-600 animate-spin" /> : <FileDown className="w-6 h-6 text-amber-600" />}
          </div>
          <div className="text-center">
            <span className="block font-bold text-amber-900 text-sm">Phần 3</span>
            <span className="text-[10px] font-medium text-amber-600">
              {language === 'vi' ? 'Kế hoạch giảng dạy' : 'Teaching Schedule'}
            </span>
          </div>
        </button>

        {/* NÚT XUẤT PHẦN 4 */}
        <button
          onClick={handleExportPart4}
          disabled={isAnyExporting}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-purple-50 border-2 border-purple-100 rounded-2xl hover:bg-purple-100 hover:border-purple-300 transition-all group disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {isExportingPart4 ? <Loader2 className="w-6 h-6 text-purple-600 animate-spin" /> : <FileDown className="w-6 h-6 text-purple-600" />}
          </div>
          <div className="text-center">
            <span className="block font-bold text-purple-900 text-sm">Phần 4</span>
            <span className="text-[10px] font-medium text-purple-600">
              {language === 'vi' ? 'Đánh giá, Học liệu & GV' : 'Assessments & Others'}
            </span>
          </div>
        </button>

      </div>
    </div>
  );
};

export default SyllabusExportModule;