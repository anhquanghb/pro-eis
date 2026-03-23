import React, { useState } from 'react';
import { Copy, ArrowRight, Check } from 'lucide-react';

export interface AIAssistantModalProps {
  systemPrompt: string;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function AIAssistantModal({ systemPrompt, onClose, onSuccess }: AIAssistantModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(systemPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Lỗi khi sao chép:', err);
      setError('Trình duyệt không hỗ trợ sao chép tự động. Vui lòng cấp quyền Clipboard.');
    }
  };

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      setError('Vui lòng dán mã JSON từ AI trước khi kiểm tra.');
      return;
    }

    try {
      // Data Sanitization: Xử lý triệt để rủi ro AI trả về kèm Markdown block (```json ... ```)
      let cleanedInput = jsonInput.trim();
      
      if (cleanedInput.startsWith('```json')) {
        cleanedInput = cleanedInput.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanedInput.startsWith('```')) {
        cleanedInput = cleanedInput.replace(/^```/, '').replace(/```$/, '').trim();
      }

      // Parse JSON
      const parsedData = JSON.parse(cleanedInput);
      
      // Trả dữ liệu sạch về cho Controller (Component cha)
      onSuccess(parsedData);
    } catch (e) {
      setError('Mã JSON không hợp lệ. Vui lòng kiểm tra lại cấu trúc (thiếu dấu phẩy, ngoặc kép, hoặc dư text).');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100" onClick={(e) => e.stopPropagation()}>
        
        <div className="p-8 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* Step 1: Lấy Prompt */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0 shadow-sm">
                1
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Lấy Prompt mẫu</h3>
            </div>
            <p className="text-sm text-slate-600 pl-11">
              Copy prompt này và gửi cho AI (ChatGPT, Gemini) để tạo mã JSON cấu hình chuẩn.
            </p>
            <div className="pl-11">
              <button 
                onClick={handleCopyPrompt} 
                className={`w-full flex justify-center items-center gap-2 border-2 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isCopied 
                    ? 'border-green-500 text-green-600 bg-green-50' 
                    : 'border-purple-100 text-purple-600 hover:bg-purple-50 hover:border-purple-200'
                }`}
              >
                {isCopied ? <Check size={18} /> : <Copy size={18} />}
                {isCopied ? 'Đã sao chép Prompt vào Clipboard' : 'Sao chép Prompt vào Clipboard'}
              </button>
            </div>
          </div>

          {/* Step 2: Dán JSON */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0 shadow-sm">
                2
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Dán mã JSON từ AI</h3>
            </div>
            <div className="pl-11 flex flex-col gap-2">
              <textarea 
                className="w-full h-72 bg-[#0F172A] text-[#A6E22E] font-mono p-5 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner resize-y custom-scrollbar"
                value={jsonInput}
                onChange={(e) => { 
                  setJsonInput(e.target.value); 
                  if (error) setError(''); 
                }}
                spellCheck={false}
                placeholder={`{\n  "description": {\n    "vi": "...",\n    ...\n  }\n}`}
              />
              {error && (
                <div className="text-red-600 text-sm mt-1 flex items-start gap-2 font-medium bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block mt-1.5 shrink-0"></span> 
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-end items-center gap-4 shrink-0">
          <button 
            onClick={onClose} 
            className="text-slate-500 font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-all"
          >
            Hủy
          </button>
          <button 
            onClick={handleValidate} 
            className="bg-purple-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95"
          >
            Kiểm tra & Xem trước <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}