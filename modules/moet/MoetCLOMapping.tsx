
import React, { useMemo } from 'react';
import { AppState, MoetObjective, Course } from '../../types';
import { Check, Link2, BookOpen, Target } from 'lucide-react';
import { sortOutlineCode } from '../../utils/sortOutline';

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MoetCLOMapping: React.FC<Props> = ({ state, updateState }) => {
  const { language } = state;
  const globalState = state.globalState || state;
  const generalInfo = globalState.institutionInfo || state.generalInfo;
  const allCourses = globalState.courseCatalog || state.courses || [];
  const currentProgram = state.programs?.find(p => p.id === state.currentProgramId);
  
  const moetInfo = currentProgram?.moetInfo || generalInfo?.moetInfo || {
    specificObjectives: [],
    structure: []
  };

  const ploList = useMemo(() => {
    const allObjs = moetInfo.specificObjectives || [];
    // Filter for level 3 objectives (e.g., 1.1.1) which are typically the granular outcomes
    return [...allObjs]
      .filter(o => (o.code ? o.code.split('.').length : 3) === 3)
      .sort((a, b) => sortOutlineCode(a.code, b.code));
  }, [moetInfo.specificObjectives]);

  const cloPloMap = currentProgram?.cloPloMap || state.cloPloMap || [];

  // Get courses that are actually in the program structure
  const programCourses = useMemo(() => {
    const courseIds = new Set<string>();
    const traverse = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.courseIds) node.courseIds.forEach((id: string) => courseIds.add(id));
        // If there are children, traverse them (though MoetStructureNode is flat in types.ts, 
        // MoetStructure.tsx seems to handle it as a list with parentId)
      });
    };
    if (moetInfo.structure) {
      moetInfo.structure.forEach(node => {
        if (node.courseIds) node.courseIds.forEach(id => courseIds.add(id));
      });
    }
    return allCourses.filter(c => courseIds.has(c.id));
  }, [allCourses, moetInfo.structure]);

  const toggleMapping = (courseId: string, cloIndex: number, ploId: string) => {
    updateState(prev => {
      const currentProgram = prev.programs?.find(p => p.id === prev.currentProgramId);
      if (!currentProgram) return prev;

      const currentMap = currentProgram.cloPloMap || [];
      const exists = currentMap.some(m => m.courseId === courseId && m.cloIndex === cloIndex && m.ploId === ploId);
      
      let newMap;
      if (exists) {
        newMap = currentMap.filter(m => !(m.courseId === courseId && m.cloIndex === cloIndex && m.ploId === ploId));
      } else {
        newMap = [...currentMap, { courseId, cloIndex, ploId }];
      }

      return {
        ...prev,
        programs: prev.programs.map(p => 
          p.id === prev.currentProgramId ? { ...p, cloPloMap: newMap } : p
        )
      };
    });
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Link2 size={18} className="text-indigo-600"/>
          {language === 'vi' ? 'Mapping CLO - PLO' : 'CLO - PLO Mapping'}
        </h3>
        <div className="text-xs text-slate-500 italic">
          {language === 'vi' ? '* Click vào ô để thiết lập mapping' : '* Click on cells to set mapping'}
        </div>
      </div>

      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-white z-20 shadow-sm">
            <tr>
              <th className="p-3 border-b border-r border-slate-200 text-left bg-slate-50 min-w-[250px] sticky left-0 z-30">
                {language === 'vi' ? 'Học phần & CLO' : 'Course & CLO'}
              </th>
              {ploList.map(plo => (
                <th key={plo.id} className="p-2 border-b border-slate-200 text-center min-w-[60px] text-[10px] font-bold text-slate-600 bg-slate-50 group relative cursor-help">
                  {plo.code}
                  <div className="absolute hidden group-hover:block z-50 bottom-full left-1/2 -translate-x-1/2 w-64 p-2 bg-slate-800 text-white rounded shadow-lg font-normal text-left whitespace-normal">
                    {plo.description?.[language] || ''}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {programCourses.map(course => (
              <React.Fragment key={course.id}>
                {/* Course Header Row */}
                <tr className="bg-slate-50/50">
                  <td colSpan={ploList.length + 1} className="p-2 px-3 border-b border-slate-200 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-indigo-700 text-xs">{course.code}</span>
                      <span className="text-xs font-bold text-slate-700">{course.name?.[language]}</span>
                    </div>
                  </td>
                </tr>
                {/* CLO Rows */}
                {(course.clos?.[language] || []).map((clo, idx) => (
                  <tr key={`${course.id}-clo-${idx}`} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-3 pl-8 border-r border-slate-200 sticky left-0 bg-white z-10">
                      <div className="flex gap-2 items-start">
                        <span className="text-[10px] font-bold text-indigo-500 shrink-0 mt-0.5">CLO {idx + 1}</span>
                        <span className="text-[11px] text-slate-600 leading-tight line-clamp-2" title={clo}>{clo}</span>
                      </div>
                    </td>
                    {ploList.map(plo => {
                      const isMapped = cloPloMap.some(m => m.courseId === course.id && m.cloIndex === idx && m.ploId === plo.id);
                      return (
                        <td 
                          key={plo.id} 
                          className={`text-center cursor-pointer border-r border-slate-50 group/cell relative ${isMapped ? 'bg-indigo-50/50' : ''}`}
                          onClick={() => toggleMapping(course.id, idx, plo.id)}
                        >
                          <div className={`w-5 h-5 mx-auto rounded flex items-center justify-center transition-all ${isMapped ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-200 hover:border-indigo-300'}`}>
                            {isMapped && <Check size={12}/>}
                          </div>
                          <div className="absolute hidden group-hover/cell:block z-30 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow-sm whitespace-nowrap pointer-events-none">
                            {plo.code}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {(!course.clos?.[language] || course.clos[language].length === 0) && (
                  <tr>
                    <td colSpan={ploList.length + 1} className="p-3 pl-8 text-xs text-slate-400 italic border-b border-slate-100">
                      {language === 'vi' ? '(Chưa có CLO)' : '(No CLOs defined)'}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MoetCLOMapping;
