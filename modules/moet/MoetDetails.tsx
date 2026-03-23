
import React from 'react';
import { AppState } from '../../types';
import { FileText, Users, GraduationCap, Scale, Globe, BookOpen } from 'lucide-react';
import FullFormatText from '../../components/FullFormatText';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MoetDetails: React.FC<Props> = ({ state, updateState }) => {
  const { generalInfo, language } = state;
  const moetInfo = generalInfo.moetInfo;

  const updateMoetField = (field: keyof typeof moetInfo, value: any) => {
    updateState(prev => ({
      ...prev,
      generalInfo: {
        ...prev.generalInfo,
        moetInfo: { ...prev.generalInfo.moetInfo, [field]: value }
      }
    }));
  };

  const updateMoetLangField = (field: keyof typeof moetInfo, value: string) => {
    const currentVal = (moetInfo[field] as any) || { vi: '', en: '' };
    updateMoetField(field, { ...currentVal, [language]: value });
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-emerald-600"/>{language === 'vi' ? 'Thông tin chi tiết' : 'Detailed Information'}</h3></div>
        <div className="p-6 space-y-8">
            {/* Section 5: Admission */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        <Users size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                        {language === 'vi' ? '3. Đối tượng tuyển sinh, Chuẩn đầu vào' : '3. Admission Target & Requirements'}
                    </h3>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '3.1. Đối tượng tuyển sinh' : '3.1. Admission Target'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.admissionTarget?.[language] || ''} 
                            onChange={v => updateMoetLangField('admissionTarget', v)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '3.2. Chuẩn đầu vào' : '3.2. Admission Requirements'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.admissionReq?.[language] || ''} 
                            onChange={v => updateMoetLangField('admissionReq', v)} 
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        <GraduationCap size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{language === 'vi' ? '4. Quy trình đào tạo và điều kiện tốt nghiệp' : '4. Training process and Graduation requirements'}</h3>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <FullFormatText value={moetInfo.graduationReq?.[language] || ''} onChange={v => updateMoetLangField('graduationReq', v)} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? 'Ghi chú về điều kiện tốt nghiệp (nếu có)' : 'Graduation Notes (if any)'}
                        </h4>
                        <FullFormatText value={moetInfo.graduationNote?.[language] || ''} onChange={v => updateMoetLangField('graduationNote', v)} />
                    </div>
                </div>
            </div>

            {/* Section 6: Assessment Methods */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        <Scale size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                        {language === 'vi' ? '6. Cách thức đánh giá' : '6. Assessment Methods'}
                    </h3>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '6.1. Đánh giá kết quả học tập' : '6.1. Learning Assessment'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.assessmentMethods?.[language] || ''} 
                            onChange={v => updateMoetLangField('assessmentMethods', v)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '6.2. Phương pháp đánh giá mức độ đạt chuẩn đầu ra của CTĐT đối với người học' : '6.2. Methods for assessing PLO achievement'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.assessmentPloMethod?.[language] || ''} 
                            onChange={v => updateMoetLangField('assessmentPloMethod', v)} 
                        />
                    </div>
                </div>
            </div>

            {/* Section 9: Admission & Quality Assurance Plan */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        <Globe size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                        {language === 'vi' ? '9. Kế hoạch tuyển sinh và bảo đảm chất lượng' : '9. Admission & Quality Assurance Plan'}
                    </h3>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '9.1. Kế hoạch tuyển sinh' : '9.1. Admission Plan'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.admissionPlan?.[language] || ''} 
                            onChange={v => updateMoetLangField('admissionPlan', v)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '9.2. Kế hoạch bảo đảm chất lượng' : '9.2. Quality Assurance Plan'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.qualityAssurancePlan?.[language] || ''} 
                            onChange={v => updateMoetLangField('qualityAssurancePlan', v)} 
                        />
                    </div>
                </div>
            </div>

            {/* Section 10: Implementation Guidelines */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        <BookOpen size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                        {language === 'vi' ? '10. Hướng dẫn thực hiện chương trình' : '10. Implementation Guidelines'}
                    </h3>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '10.1. Nguyên tắc tổ chức lịch trình đào tạo' : '10.1. Training Schedule Principles'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.guidelineSchedulePrinciples?.[language] || ''} 
                            onChange={v => updateMoetLangField('guidelineSchedulePrinciples', v)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '10.2. Thời khoá biểu học kỳ đầu tiên của khoá học' : '10.2. First Semester Timetable'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.guidelineFirstSemesterSchedule?.[language] || ''} 
                            onChange={v => updateMoetLangField('guidelineFirstSemesterSchedule', v)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '10.3. Thời khoá biểu lớp học phần từ học kỳ II' : '10.3. Timetable from Semester II'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.guidelineSecondSemesterSchedule?.[language] || ''} 
                            onChange={v => updateMoetLangField('guidelineSecondSemesterSchedule', v)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '10.4. Khối kiến thức Giáo dục thể chất và Giáo dục quốc phòng và an ninh' : '10.4. Physical Education & Defense Education'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.guidelinePhysicalDefenseEdu?.[language] || ''} 
                            onChange={v => updateMoetLangField('guidelinePhysicalDefenseEdu', v)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '10.5. Khối kiến thức ngoại ngữ không chuyên' : '10.5. Foreign Language for Non-Majors'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.guidelineForeignLanguage?.[language] || ''} 
                            onChange={v => updateMoetLangField('guidelineForeignLanguage', v)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '10.6. Phần tự chọn' : '10.6. Elective Part'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.guidelineElectives?.[language] || ''} 
                            onChange={v => updateMoetLangField('guidelineElectives', v)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 ml-12">
                            {language === 'vi' ? '10.7. Đồ án tốt nghiệp' : '10.7. Graduation Project'}
                        </h4>
                        <FullFormatText 
                            value={moetInfo.guidelineGraduationProject?.[language] || ''} 
                            onChange={v => updateMoetLangField('guidelineGraduationProject', v)} 
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default MoetDetails;
