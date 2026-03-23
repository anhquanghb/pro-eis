
import React from 'react';
import { Language } from '../types';
import { 
  Target, Grid3X3, FileText, Download, ArrowRight, 
  BookOpen, BrainCircuit, ShieldCheck, Map, Layout, Zap 
} from 'lucide-react';

interface Props {
  language: Language;
  onNavigate: (module: string) => void;
}

const CoverModule: React.FC<Props> = ({ language, onNavigate }) => {
  const isVi = language === 'vi';

  const steps = [
    {
      step: "01",
      title: isVi ? "Thiết lập Chiến lược" : "Define Strategy",
      desc: isVi ? "Xác định Sứ mạng, PEOs (Mục tiêu) và SOs (Chuẩn đầu ra)." : "Define Mission, PEOs, and Student Outcomes.",
      icon: <Target className="text-white" size={24} />,
      color: "bg-indigo-500"
    },
    {
      step: "02",
      title: isVi ? "Ma trận & Thiết kế" : "Mapping & Design",
      desc: isVi ? "Xây dựng ma trận liên kết, sơ đồ cây và cấu trúc chương trình." : "Build curriculum mapping, flowcharts, and structure.",
      icon: <Grid3X3 className="text-white" size={24} />,
      color: "bg-purple-500"
    },
    {
      step: "03",
      title: isVi ? "Đề cương & MOET" : "Syllabus & MOET",
      desc: isVi ? "Soạn thảo đề cương chi tiết và xuất bản hồ sơ theo mẫu Bộ GD&ĐT." : "Draft detailed syllabi and export MOET compliant documents.",
      icon: <FileText className="text-white" size={24} />,
      color: "bg-emerald-500"
    }
  ];

  const features = [
    { id: 'strategy', icon: Target, title: isVi ? "Sứ mạng & Mục tiêu" : "Strategy & Outcomes", desc: isVi ? "Quản lý PEOs, SOs và các chỉ số PI." : "Manage PEOs, SOs, and Performance Indicators." },
    { id: 'mapping', icon: Map, title: isVi ? "Ma trận Liên kết" : "Curriculum Mapping", desc: isVi ? "Đánh giá độ phủ kiến thức qua các ma trận SO, PI." : "Evaluate coverage via SO and PI matrices." },
    { id: 'syllabus', icon: BookOpen, title: isVi ? "Đề cương Chi tiết" : "Detailed Syllabus", desc: isVi ? "Soạn thảo đề cương với hỗ trợ AI và kiểm tra logic." : "Draft syllabi with AI assistance and logic checks." },
    { id: 'flowchart', icon: Layout, title: isVi ? "Sơ đồ Môn học" : "Flowchart", desc: isVi ? "Trực quan hóa lộ trình và quan hệ tiên quyết." : "Visualize prerequisites and curriculum roadmap." },
    { id: 'transformation', icon: Zap, title: isVi ? "Chuyển đổi MOET" : "MOET Transform", desc: isVi ? "Tự động chuyển đổi dữ liệu sang biểu mẫu của Bộ GD và ĐT." : "Auto-transform data to accreditation forms." },
    { id: 'analytics', icon: BrainCircuit, title: isVi ? "Phân tích & AI" : "Analytics & AI", desc: isVi ? "Kiểm toán chương trình và phát hiện lỗi bằng AI." : "Audit program and detect gaps using AI." },
  ];

  return (
    <div className="min-h-full bg-slate-50 flex flex-col items-center animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="w-full bg-white border-b border-slate-200 pt-16 pb-12 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest mb-6">
            <ShieldCheck size={14} className="text-emerald-600" />
            OBE & Accreditation Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            EDU<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">-Pro</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            {isVi 
              ? "Hệ thống toàn diện thiết kế chương trình đào tạo theo Chuẩn đầu ra (OBE), tích hợp AI hỗ trợ soạn thảo đề cương, ma trận liên kết và xuất bản hồ sơ kiểm định."
              : "A comprehensive platform for Outcome-Based Education (OBE) curriculum design, featuring AI-driven syllabus drafting, mapping matrices, and accreditation document export."}
          </p>
          <button 
            onClick={() => onNavigate('strategy')}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1"
          >
            {isVi ? "Bắt đầu thiết kế" : "Start Designing"}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="w-full max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-800">{isVi ? "Quy trình thực hiện" : "Design Workflow"}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-slate-200 -z-10"></div>
          
          {steps.map((s, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className={`w-24 h-24 rounded-2xl ${s.color} flex items-center justify-center shadow-lg shadow-slate-200 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {s.icon}
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Step {s.step}</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 max-w-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="w-full bg-white border-t border-slate-200 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-800">{isVi ? "Các phân hệ chức năng" : "Core Modules"}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div 
                key={f.id} 
                onClick={() => onNavigate(f.id)}
                className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
                  <f.icon size={24} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-slate-900 text-slate-400 py-12 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mb-2">
             <Layout className="text-white" size={20}/>
          </div>
          <p className="text-sm">
            © 2026 Duy Tan University. EDU-Pro Platform v1.2.
          </p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-wider mt-4">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CoverModule;
