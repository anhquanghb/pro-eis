import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Course, CourseTopic } from '../types';
import { TRANSLATIONS } from '../constants';
import { Info, Plus, Trash2, Save } from 'lucide-react';

interface ScheduleProps {
    course: Course;
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
}

type ColumnDef = {
    id: string; // e.g., "t-1_sub-1" or "t-1"
    topic: CourseTopic;
    subTopic?: CourseTopic;
    label: string;
    parentLabel: string;
};

const SyllabusScheduleModule: React.FC<ScheduleProps> = ({ course, state, updateState }) => {
    const { language } = state;
    const t = TRANSLATIONS[language];
    
    // Extract columns
    const columns = useMemo(() => {
        const cols: ColumnDef[] = [];
        course.topics.forEach(topic => {
            if (topic.subTopics && topic.subTopics.length > 0) {
                topic.subTopics.forEach(sub => {
                    cols.push({
                        id: sub.id,
                        topic,
                        subTopic: sub,
                        label: sub.no,
                        parentLabel: `${topic.no}: ${topic.topic[language]}`
                    });
                });
            } else {
                cols.push({
                    id: topic.id,
                    topic,
                    label: topic.no,
                    parentLabel: `${topic.no}: ${topic.topic[language]}`
                });
            }
        });
        return cols;
    }, [course.topics, language]);

    // Calculate initial weeks
    const calculateInitialWeeks = () => {
        let totalHours = 0;
        course.topics.forEach(t => {
            totalHours += t.activities.reduce((sum, act) => sum + act.hours, 0);
        });
        // Assume 3 hours per week if not specified, or just distribute evenly over 15 weeks
        // Let's just use 15 weeks as standard, or calculate based on total hours / 3
        const calculatedWeeks = Math.max(1, Math.ceil(totalHours / 3));
        return calculatedWeeks;
    };

    const initialWeeks = useMemo(() => calculateInitialWeeks(), [course.topics]);

    // State
    const [numWeeks, setNumWeeks] = useState(initialWeeks);
    const [scheduleMap, setScheduleMap] = useState<Record<number, Set<string>>>({});

    // Initialize from saved schedule or auto-calculate
    useEffect(() => {
        if (course.schedule && course.schedule.length > 0) {
            const map: Record<number, Set<string>> = {};
            let maxWeek = 0;
            course.schedule.forEach(s => {
                map[s.weekNo] = new Set(s.topicIds);
                if (s.weekNo > maxWeek) maxWeek = s.weekNo;
            });
            setScheduleMap(map);
            setNumWeeks(course.scheduleNumWeeks || Math.max(initialWeeks, maxWeek));
        } else {
            // Auto-calculate
            const map: Record<number, Set<string>> = {};
            const itemsPerWeek = Math.ceil(columns.length / initialWeeks);
            let currentWeek = 1;
            let currentItemCount = 0;
            
            columns.forEach(col => {
                if (!map[currentWeek]) map[currentWeek] = new Set();
                map[currentWeek].add(col.id);
                currentItemCount++;
                if (currentItemCount >= itemsPerWeek && currentWeek < initialWeeks) {
                    currentWeek++;
                    currentItemCount = 0;
                }
            });
            setScheduleMap(map);
            setNumWeeks(initialWeeks);
        }
    }, [course.schedule, columns, initialWeeks]);

    const toggleCheck = (weekNo: number, colId: string) => {
        setScheduleMap(prev => {
            const next = { ...prev };
            if (!next[weekNo]) next[weekNo] = new Set();
            const newSet = new Set(next[weekNo]);
            if (newSet.has(colId)) {
                newSet.delete(colId);
            } else {
                newSet.add(colId);
            }
            next[weekNo] = newSet;
            return next;
        });
    };

    const addWeek = () => {
        setNumWeeks(prev => prev + 1);
    };

    const removeWeek = () => {
        if (numWeeks > 1) {
            setNumWeeks(prev => prev - 1);
            setScheduleMap(prev => {
                const next = { ...prev };
                delete next[numWeeks];
                return next;
            });
        }
    };

    const hasChanges = useMemo(() => {
        const currentSchedule = [];
        for (let i = 1; i <= numWeeks; i++) {
            if (scheduleMap[i] && scheduleMap[i].size > 0) {
                currentSchedule.push({
                    weekNo: i,
                    topicIds: Array.from(scheduleMap[i]).sort()
                });
            }
        }
        
        const savedSchedule = (course.schedule || []).map(s => ({
            weekNo: s.weekNo,
            topicIds: [...s.topicIds].sort()
        })).sort((a, b) => a.weekNo - b.weekNo);

        if (currentSchedule.length !== savedSchedule.length) return true;

        for (let i = 0; i < currentSchedule.length; i++) {
            if (currentSchedule[i].weekNo !== savedSchedule[i].weekNo) return true;
            if (currentSchedule[i].topicIds.length !== savedSchedule[i].topicIds.length) return true;
            for (let j = 0; j < currentSchedule[i].topicIds.length; j++) {
                if (currentSchedule[i].topicIds[j] !== savedSchedule[i].topicIds[j]) return true;
            }
        }
        
        const savedNumWeeks = course.scheduleNumWeeks || (savedSchedule.length > 0 ? Math.max(...savedSchedule.map(s => s.weekNo)) : initialWeeks);
        if (numWeeks !== savedNumWeeks) return true;

        return false;
    }, [scheduleMap, numWeeks, course.schedule, course.scheduleNumWeeks, initialWeeks]);

    const handleSave = () => {
        const schedule = [];
        for (let i = 1; i <= numWeeks; i++) {
            if (scheduleMap[i] && scheduleMap[i].size > 0) {
                schedule.push({
                    weekNo: i,
                    topicIds: Array.from(scheduleMap[i])
                });
            }
        }
        updateState(prev => ({
            ...prev,
            courses: prev.courses.map(c => c.id === course.id ? { ...c, schedule, scheduleNumWeeks: numWeeks } : c)
        }));
        alert(language === 'vi' ? 'Đã lưu kế hoạch giảng dạy!' : 'Teaching schedule saved!');
    };

    // Group columns by topic for the header
    const topicGroups = useMemo(() => {
        const groups: { topic: CourseTopic, cols: ColumnDef[] }[] = [];
        columns.forEach(col => {
            let group = groups.find(g => g.topic.id === col.topic.id);
            if (!group) {
                group = { topic: col.topic, cols: [] };
                groups.push(group);
            }
            group.cols.push(col);
        });
        return groups;
    }, [columns]);

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                    <Info size={16} /> {language === 'vi' ? 'Kế hoạch giảng dạy dự kiến' : 'Expected Teaching Schedule'}
                </div>
                <button 
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm ${
                        hasChanges 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 animate-pulse' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <Save size={16} /> {language === 'vi' ? 'Lưu kế hoạch' : 'Save Schedule'}
                </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th className="border-b border-r border-slate-200 p-3 bg-slate-50 text-center w-24 font-bold text-slate-600 sticky left-0 z-10">
                                    {/* Empty top-left cell */}
                                </th>
                                {topicGroups.map(group => (
                                    <th 
                                        key={group.topic.id} 
                                        colSpan={group.cols.length} 
                                        className="border-b border-r border-slate-200 p-2 bg-slate-50 text-center font-bold text-slate-700"
                                        title={group.topic.topic[language]}
                                    >
                                        Chương {group.topic.no.replace('Chương ', '')}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th className="border-b border-r border-slate-200 p-3 bg-slate-50 text-center w-24 font-bold text-slate-600 sticky left-0 z-10">
                                    {/* Empty bottom-left cell */}
                                </th>
                                {columns.map(col => (
                                    <th 
                                        key={col.id} 
                                        className="border-b border-r border-slate-200 p-2 bg-slate-50 text-center font-bold text-slate-600 text-xs"
                                        title={col.subTopic ? col.subTopic.topic[language] : col.topic.topic[language]}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: numWeeks }).map((_, idx) => {
                                const weekNo = idx + 1;
                                return (
                                    <tr key={weekNo} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="border-r border-slate-200 p-3 font-bold text-slate-700 text-center sticky left-0 bg-white z-10">
                                            {language === 'vi' ? 'Tuần' : 'Week'} {weekNo}
                                        </td>
                                        {columns.map(col => {
                                            const isChecked = scheduleMap[weekNo]?.has(col.id) || false;
                                            return (
                                                <td key={col.id} className="border-r border-slate-200 p-2 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                                        checked={isChecked}
                                                        onChange={() => toggleCheck(weekNo, col.id)}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
                    <button 
                        onClick={addWeek}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm"
                    >
                        <Plus size={14} /> {language === 'vi' ? 'Thêm tuần' : 'Add Week'}
                    </button>
                    <button 
                        onClick={removeWeek}
                        disabled={numWeeks <= 1}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-300 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={14} /> {language === 'vi' ? 'Xóa tuần cuối' : 'Remove Last Week'}
                    </button>
                    <div className="ml-auto text-xs text-slate-500 italic">
                        {language === 'vi' ? `Hệ thống tính toán ban đầu: ${initialWeeks} tuần` : `Initial calculation: ${initialWeeks} weeks`}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SyllabusScheduleModule;