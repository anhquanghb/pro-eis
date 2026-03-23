import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
    Plus, Trash2, ChevronRight, ChevronDown, 
    GripVertical, Layers, BookOpen, Package, 
    ChevronsDown, ChevronsUp
} from 'lucide-react';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    AppState, 
    MoetStructureNode, 
    MoetStructureType,
    Course
} from '../../types';
import { StructureTable } from './MoetShared';

interface MoetStructureProps {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
}

// --- Helper chuyển đổi số La Mã ---
const toRoman = (num: number): string => {
    const lookup: Record<string, number> = {
        M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
    };
    let roman = '';
    for (const i in lookup) {
        while (num >= lookup[i]) {
            roman += i;
            num -= lookup[i];
        }
    }
    return roman;
};

// --- Component Hỗ trợ Inline Edit cho Tín Chỉ ---
const InlineNumberEdit = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempVal, setTempVal] = useState(String(value ?? 0));

    useEffect(() => { setTempVal(String(value ?? 0)); }, [value]);

    if (isEditing) {
        return (
            <input 
                autoFocus 
                type="number" 
                min="0"
                className="w-6 text-center outline-none bg-white text-indigo-700 font-black rounded-sm shadow-inner" 
                value={tempVal} 
                onChange={e => setTempVal(e.target.value)}
                onBlur={() => {
                    setIsEditing(false);
                    onChange(parseInt(tempVal) || 0);
                }}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        setIsEditing(false);
                        onChange(parseInt(tempVal) || 0);
                    }
                }}
                onClick={e => e.stopPropagation()}
            />
        );
    }
    return (
        <span 
            className="cursor-pointer hover:text-indigo-600 hover:underline decoration-dashed transition-colors px-0.5" 
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            title="Nhấp để sửa"
        >
            {value ?? 0}
        </span>
    );
};


// --- SortableNode Component ---
interface SortableNodeProps {
    node: MoetStructureNode; 
    index: number; 
    depth: number; 
    numbering: string; 
    children: React.ReactNode;
    onDelete: () => void;
    onToggle: () => void;
    onUpdateNode: (updates: Partial<MoetStructureNode>) => void;
    onAddChild: (level: 1 | 2 | 3 | 'MODULE') => void;
    actualTotals: Record<string, number>; 
    parentRequirements?: { total: number, blocks: Record<string, number> };
    parentType?: string;
    isOpen: boolean;
    language: 'vi' | 'en';
    creditBlocks: any[];
    courses: Course[]; 
    excludeIds: string[]; 
}

const SortableNode: React.FC<SortableNodeProps> = ({ 
    node, 
    numbering, 
    children, 
    onDelete,
    onToggle,
    onUpdateNode,
    onAddChild,
    actualTotals,
    parentRequirements,
    parentType,
    isOpen,
    language,
    creditBlocks,
    courses,
    excludeIds
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: node.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1
    };

    const isLevel1 = node.level === 1;
    const isModule = node.level === 'MODULE';
    const isL2L3 = node.level === 2 || node.level === 3;
    const isElective = node.type === 'ELECTIVE' || node.type === 'SELECTED_ELECTIVE';
    const isParentSelectedElective = parentType === 'SELECTED_ELECTIVE';

    const getBgColor = () => {
        if (isLevel1) return 'bg-slate-100 border-slate-200';
        if (isModule) return 'bg-indigo-50 border-indigo-100';
        return 'bg-white border-slate-200';
    };

    const getIcon = () => {
        if (isLevel1) return <Layers size={16} className="text-slate-500 shrink-0" />;
        if (isModule) return <Package size={16} className="text-indigo-500 shrink-0" />;
        return <BookOpen size={16} className="text-slate-400 shrink-0" />;
    };

    // --- RENDER LOGIC CHO TÍN CHỈ VÀ TYPE ---
    const renderCreditsAndType = () => {
        // 1. Level 1: Không có Type. Tính thực tế
        if (isLevel1) {
            return (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-default flex-wrap">
                    <span className="text-indigo-700 bg-indigo-50 px-1 rounded border border-indigo-100">[TC:{actualTotals.total}]</span>
                    {creditBlocks.map(cb => (
                        <span key={cb.id} className="bg-slate-50 px-1 rounded border border-slate-200">[{cb.acronym?.[language] || cb.name?.[language]}:{actualTotals[cb.id] || 0}]</span>
                    ))}
                </div>
            );
        }

        // 2. Level 2, 3
        if (isL2L3) {
            return (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 flex-wrap">
                    {/* Select Type dạng Text */}
                    <select 
                        className="appearance-none bg-transparent text-indigo-700 cursor-pointer outline-none hover:bg-slate-100 rounded px-1 transition-colors"
                        value={node.type}
                        onChange={(e) => onUpdateNode({ type: e.target.value as MoetStructureType })}
                        onClick={(e) => e.stopPropagation()}
                        title={language === 'vi' ? "Đổi loại" : "Change type"}
                    >
                        <option value="REQUIRED">{language === 'vi' ? '[Bắt buộc]' : '[Required]'}</option>
                        <option value="ELECTIVE">{language === 'vi' ? '[Tự chọn]' : '[Elective]'}</option>
                        <option value="SELECTED_ELECTIVE">{language === 'vi' ? '[TC định hướng]' : '[Directed]'}</option>
                    </select>

                    {/* Bắt buộc: Tính thực tế */}
                    {node.type === 'REQUIRED' && (
                        <>
                            <span className="text-indigo-700 bg-indigo-50 px-1 rounded border border-indigo-100">[TC:{actualTotals.total}]</span>
                            {creditBlocks.map(cb => (
                                <span key={cb.id} className="bg-slate-50 px-1 rounded border border-slate-200">[{cb.acronym?.[language] || cb.name?.[language]}:{actualTotals[cb.id] || 0}]</span>
                            ))}
                        </>
                    )}

                    {/* Tự chọn / TC Định hướng: [TC: nhập]/hiện_có */}
                    {isElective && (
                        <>
                            <span className="italic font-medium text-slate-500 mr-0.5">{language === 'vi' ? 'Yêu cầu:' : 'Req:'}</span>
                            
                            {/* Khối TC Tổng */}
                            <span className={`px-1 rounded border transition-colors ${actualTotals.total < (node.requiredCredits || 0) ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                [TC:<InlineNumberEdit value={node.requiredCredits || 0} onChange={v => onUpdateNode({ requiredCredits: v })} />]/{actualTotals.total}
                            </span>

                            {/* Từng khối TC Chi tiết (LT, TH...) */}
                            {creditBlocks.map(cb => {
                                const req = node.manualCreditBlockValues?.[cb.id] || 0;
                                const actual = actualTotals[cb.id] || 0;
                                const isErr = actual < req;
                                return (
                                    <span key={cb.id} className={`px-1 rounded border transition-colors ${isErr ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                        [{cb.acronym?.[language] || cb.name?.[language]}:<InlineNumberEdit value={req} onChange={v => {
                                            const newVals = {...(node.manualCreditBlockValues || {})};
                                            newVals[cb.id] = v;
                                            onUpdateNode({ manualCreditBlockValues: newVals });
                                        }} />]/{actual}
                                    </span>
                                )
                            })}
                        </>
                    )}
                </div>
            );
        }

        // 3. Module
        if (isModule) {
            // Module trong khối TC Định hướng (Nhận Yêu cầu từ cha)
            if (isParentSelectedElective) {
                const totalReq = parentRequirements?.total || 0;
                const isTotalErr = actualTotals.total < totalReq;
                
                return (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 flex-wrap">
                        <span className="italic font-medium text-slate-500 mr-0.5">{language === 'vi' ? 'Yêu cầu:' : 'Req:'}</span>
                        
                        {/* Khối TC Tổng */}
                        <span className={`px-1 rounded border transition-colors ${isTotalErr ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            [TC:{totalReq}]/{actualTotals.total}
                        </span>

                        {/* Từng khối TC Chi tiết (LT, TH...) */}
                        {creditBlocks.map(cb => {
                            const req = parentRequirements?.blocks[cb.id] || 0;
                            const actual = actualTotals[cb.id] || 0;
                            const isErr = actual < req;
                            return (
                                <span key={cb.id} className={`px-1 rounded border transition-colors ${isErr ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                    [{cb.acronym?.[language] || cb.name?.[language]}:{req}]/{actual}
                                </span>
                            )
                        })}
                    </div>
                );
            }
            
            // Module trong khối Bắt buộc / Tự chọn
            return (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-default flex-wrap">
                    <span className="text-indigo-700 bg-indigo-50 px-1 rounded border border-indigo-100">[TC:{actualTotals.total}]</span>
                    {creditBlocks.map(cb => (
                        <span key={cb.id} className="bg-slate-50 px-1 rounded border border-slate-200">[{cb.acronym?.[language] || cb.name?.[language]}:{actualTotals[cb.id] || 0}]</span>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            <div className={`flex items-center p-2 rounded-t-lg border-t border-x ${getBgColor()} group shadow-sm transition-colors hover:bg-slate-50`}>
                <div {...attributes} {...listeners} className="mr-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1">
                    <GripVertical size={16} />
                </div>
                
                <button onClick={onToggle} className="mr-2 text-slate-500 hover:bg-slate-300 rounded p-0.5 transition-colors">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                <div className="flex-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-left overflow-hidden pr-2">
                    <div className="flex items-center gap-2 shrink-0">
                        {getIcon()}
                        <span className="font-bold text-slate-700 min-w-[2.5rem]">{numbering}.</span>
                    </div>
                    
                    {/* INLINE EDIT: TIÊU ĐỀ */}
                    <div className="flex-1 flex flex-col">
                        <input 
                            type="text"
                            className="w-full font-semibold text-slate-800 bg-transparent border border-transparent hover:border-slate-300 hover:bg-white focus:bg-white focus:border-indigo-500 rounded px-2 py-0.5 outline-none transition-all cursor-pointer focus:cursor-text truncate min-w-[150px]"
                            value={node.title?.[language] || ''}
                            onChange={(e) => onUpdateNode({ title: { ...(node.title || {}), [language]: e.target.value } })}
                            placeholder={language === 'vi' ? "Nhập tiêu đề..." : "Enter title..."}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {node.type === 'ELECTIVE' && node.requiredCredits && (
                            <div className="text-[11px] italic text-slate-500 px-2">
                                {language === 'vi' 
                                    ? `(Tự chọn tối thiểu ${node.requiredCredits} tín chỉ)` 
                                    : `(Elective minimum ${node.requiredCredits} credits)`}
                            </div>
                        )}
                        {node.type === 'SELECTED_ELECTIVE' && node.requiredCredits && (
                            <div className="text-[11px] italic text-slate-500 px-2">
                                {language === 'vi' 
                                    ? `(Tự chọn định hướng 1 Mô-đun ${node.requiredCredits} tín chỉ)` 
                                    : `(Directed elective 1 Module ${node.requiredCredits} credits)`}
                            </div>
                        )}
                    </div>
                    
                    {/* RENDER KHU VỰC THÔNG SỐ (Loại và Các loại Tín chỉ) */}
                    <div className="flex items-center shrink-0">
                        {renderCreditsAndType()}
                    </div>
                    
                    {/* KHU VỰC NÚT THÊM & XÓA */}
                    <div className="ml-auto flex items-center border-l border-slate-200 pl-2 gap-0.5 shrink-0">
                        {isLevel1 && (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); onAddChild(2); }} className="p-1.5 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700 rounded transition-colors" title={language === 'vi' ? 'Thêm Cấp 2' : 'Add Level 2'}><Plus size={16} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onAddChild('MODULE'); }} className="p-1.5 text-amber-500 hover:bg-amber-100 hover:text-amber-700 rounded transition-colors" title={language === 'vi' ? 'Thêm Mô-đun' : 'Add Module'}><Package size={16} /></button>
                            </>
                        )}
                        {isL2L3 && (
                            <>
                                {/* Nếu là TC Định hướng thì Ẩn nút thêm Cấp 3, chỉ cho phép thêm Module */}
                                {node.type !== 'SELECTED_ELECTIVE' && (
                                    <button onClick={(e) => { e.stopPropagation(); onAddChild(3); }} className="p-1.5 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700 rounded transition-colors" title={language === 'vi' ? 'Thêm Cấp 3' : 'Add Level 3'}><Plus size={16} /></button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); onAddChild('MODULE'); }} className="p-1.5 text-amber-500 hover:bg-amber-100 hover:text-amber-700 rounded transition-colors" title={language === 'vi' ? 'Thêm Mô-đun' : 'Add Module'}><Package size={16} /></button>
                            </>
                        )}
                        {isModule && (
                            <button onClick={(e) => { e.stopPropagation(); onAddChild('MODULE'); }} className="p-1.5 text-amber-500 hover:bg-amber-100 hover:text-amber-700 rounded transition-colors" title={language === 'vi' ? 'Thêm Mô-đun' : 'Add Module'}><Package size={16} /></button>
                        )}
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded p-1.5 transition-colors ml-1 border-l border-slate-200 pl-3"
                            title={language === 'vi' ? 'Xóa' : 'Delete'}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
            
            {isOpen && (
                <div className="border-x border-b border-slate-200 rounded-b-lg bg-white/30 p-4 ml-4 border-l-2 border-l-slate-300 animate-in fade-in slide-in-from-top-2">
                    
                    {/* Bảng Danh sách Môn học - Ẩn nếu là Level mang type TC Định hướng */}
                    {!isModule && node.type === 'SELECTED_ELECTIVE' ? null : (
                        <div className="mb-4">
                            <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-2">
                                <BookOpen size={14}/> {language === 'vi' ? 'Danh sách Môn học' : 'Course List'}
                            </div>
                            <StructureTable 
                                courseIds={node.courseIds || []}
                                courses={courses} 
                                language={language}
                                onRemove={(cid) => {
                                    const event = new CustomEvent('REMOVE_COURSE_FROM_NODE', { detail: { nodeId: node.id, courseId: cid } });
                                    window.dispatchEvent(event);
                                }}
                                onAdd={(cid) => {
                                    const event = new CustomEvent('ADD_COURSE_TO_NODE', { detail: { nodeId: node.id, courseId: cid } });
                                    window.dispatchEvent(event);
                                }}
                                onTypeChange={(id, type) => {
                                    const event = new CustomEvent('CHANGE_COURSE_TYPE', { detail: { courseId: id, type } });
                                    window.dispatchEvent(event);
                                }}
                                onRelationUpdate={(id, field, value) => {
                                    const event = new CustomEvent('UPDATE_COURSE_RELATION', { detail: { courseId: id, field, value } });
                                    window.dispatchEvent(event);
                                }}
                                onCourseDoubleClick={(cid) => {
                                    sessionStorage.setItem('focusCourseId', cid);
                                    window.dispatchEvent(new CustomEvent('CHANGE_MAIN_TAB', { detail: 'syllabi' }));
                                    window.dispatchEvent(new CustomEvent('FOCUS_COURSE_CREDIT'));
                                }}
                                excludeIds={excludeIds}
                                creditBlocks={creditBlocks}
                                theme={isModule ? 'amber' : 'slate'}
                            />
                        </div>
                    )}

                    {/* Danh sách các Node con */}
                    {node.children.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-slate-200/60">
                            <SortableContext 
                                items={node.children.map((c: any) => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {children}
                            </SortableContext>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const MoetStructure: React.FC<MoetStructureProps> = ({ state, updateState }) => {
    const { courses, creditBlocks, language } = state;
    const currentProgram = state.programs?.find(p => p.id === state.currentProgramId);
    const moetInfo = currentProgram?.moetInfo || state.generalInfo?.moetInfo || { structure: [] };
    const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});

    // Đảm bảo cấu trúc mặc định nếu chưa có
    useEffect(() => {
        if (!moetInfo.structure || moetInfo.structure.length === 0) {
            const defaultStructure: MoetStructureNode[] = [
                {
                    id: 'root-1',
                    title: { vi: 'Kiến thức giáo dục đại cương', en: 'General Education' },
                    level: 1,
                    type: 'REQUIRED',
                    courseIds: [],
                    order: 0
                },
                {
                    id: 'root-2',
                    title: { vi: 'Kiến thức giáo dục chuyên nghiệp', en: 'Professional Education' },
                    level: 1,
                    type: 'REQUIRED',
                    courseIds: [],
                    order: 1
                }
            ];
            updateState(prev => {
                if (prev.currentProgramId) {
                    return {
                        ...prev,
                        programs: prev.programs.map(p => 
                            p.id === prev.currentProgramId 
                                ? { ...p, moetInfo: { ...p.moetInfo, structure: defaultStructure } }
                                : p
                        )
                    };
                }
                return {
                    ...prev,
                    generalInfo: {
                        ...prev.generalInfo,
                        moetInfo: {
                            ...prev.generalInfo.moetInfo,
                            structure: defaultStructure
                        }
                    }
                };
            });
        }
    }, [moetInfo.structure, language, state.currentProgramId]);

    const structure = moetInfo.structure || [];

    // --- LẮNG NGHE SỰ KIỆN TỪ StructureTable ---
    useEffect(() => {
        const handleAdd = (e: any) => handleAddCourse(e.detail.nodeId, e.detail.courseId);
        const handleRemove = (e: any) => handleRemoveCourse(e.detail.nodeId, e.detail.courseId);
        const handleChangeType = (e: any) => {
            updateState(prev => ({
                ...prev,
                courses: prev.courses.map(c => c.id === e.detail.courseId ? { ...c, type: e.detail.type } : c)
            }));
        };
        const handleRelation = (e: any) => {
            updateState(prev => ({
                ...prev,
                courses: prev.courses.map(c => c.id === e.detail.courseId ? { ...c, [e.detail.field]: e.detail.value } : c)
            }));
        };

        window.addEventListener('ADD_COURSE_TO_NODE', handleAdd);
        window.addEventListener('REMOVE_COURSE_FROM_NODE', handleRemove);
        window.addEventListener('CHANGE_COURSE_TYPE', handleChangeType);
        window.addEventListener('UPDATE_COURSE_RELATION', handleRelation);

        return () => {
            window.removeEventListener('ADD_COURSE_TO_NODE', handleAdd);
            window.removeEventListener('REMOVE_COURSE_FROM_NODE', handleRemove);
            window.removeEventListener('CHANGE_COURSE_TYPE', handleChangeType);
            window.removeEventListener('UPDATE_COURSE_RELATION', handleRelation);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [structure, courses]);

    // --- Hàm Expand / Collapse All ---
    const handleExpandAll = () => {
        const allOpen = structure.reduce((acc, node) => {
            acc[node.id] = true;
            return acc;
        }, {} as Record<string, boolean>);
        setOpenNodes(allOpen);
    };

    const handleCollapseAll = () => {
        setOpenNodes({});
    };

    // --- Xây dựng Cây (Tree Construction & Numbering) ---
    const { tree, moduleNumbering, excludeCourseIds } = useMemo(() => {
        const nodes = [...structure].sort((a, b) => a.order - b.order);
        const treeMap: Record<string, any> = {};
        const roots: any[] = [];
        const modules: any[] = [];
        const allUsedCourses: string[] = [];

        nodes.forEach(node => {
            const item = { ...node, children: [] };
            treeMap[node.id] = item;
            if (node.courseIds) {
                allUsedCourses.push(...node.courseIds);
            }
            if (node.level === 'MODULE') modules.push(item);
        });

        nodes.forEach(node => {
            if (node.parentId && treeMap[node.parentId]) {
                treeMap[node.parentId].children.push(treeMap[node.id]);
            } else if (node.level === 1) {
                roots.push(treeMap[node.id]);
            }
        });

        const moduleNumMap: Record<string, number> = {};
        modules.forEach((m, idx) => {
            moduleNumMap[m.id] = idx + 1;
        });

        return { tree: roots, moduleNumbering: moduleNumMap, excludeCourseIds: allUsedCourses };
    }, [structure]);

    // --- Tính toán tín chỉ ---
    const calculateActualCredits = useCallback((nodeId: string): Record<string, number> => {
        const node = structure.find(n => n.id === nodeId);
        if (!node) return { total: 0 };

        const totals: Record<string, number> = { total: 0 };
        creditBlocks.forEach(cb => totals[cb.id] = 0);

        node.courseIds.forEach(cid => {
            const c = courses.find(x => x.id === cid);
            if (c) {
                totals.total += c.credits || 0;
                creditBlocks.forEach(cb => {
                    totals[cb.id] += (c.creditBlockValues || {})[cb.id] || 0;
                });
            }
        });

        const children = structure.filter(n => n.parentId === nodeId);
        children.forEach(child => {
            const childTotals = calculateActualCredits(child.id);
            totals.total += childTotals.total;
            creditBlocks.forEach(cb => {
                totals[cb.id] += childTotals[cb.id] || 0;
            });
        });

        return totals;
    }, [structure, courses, creditBlocks]);

    const calculateNodeCredits = useCallback((nodeId: string): Record<string, number> => {
        const node = structure.find(n => n.id === nodeId);
        if (!node) return { total: 0 };

        const totals: Record<string, number> = { total: 0 };
        creditBlocks.forEach(cb => totals[cb.id] = 0);

        // Bỏ qua check nhập tay với MODULE (Module luôn lấy số thực tế)
        if (node.level !== 'MODULE' && (node.type === 'ELECTIVE' || node.type === 'SELECTED_ELECTIVE') && node.requiredCredits) {
            totals.total = node.requiredCredits;
            creditBlocks.forEach(cb => {
                totals[cb.id] = node.manualCreditBlockValues?.[cb.id] || 0;
            });
            return totals;
        }

        node.courseIds.forEach(cid => {
            const c = courses.find(x => x.id === cid);
            if (c) {
                totals.total += c.credits || 0;
                creditBlocks.forEach(cb => {
                    totals[cb.id] += (c.creditBlockValues || {})[cb.id] || 0;
                });
            }
        });

        const children = structure.filter(n => n.parentId === nodeId);
        children.forEach(child => {
            const childTotals = calculateNodeCredits(child.id);
            totals.total += childTotals.total;
            creditBlocks.forEach(cb => {
                totals[cb.id] += childTotals[cb.id] || 0;
            });
        });

        return totals;
    }, [structure, courses, creditBlocks]);

    // --- Handlers ---
    const handleAddNode = (parentId: string | undefined, level: 1 | 2 | 3 | 'MODULE') => {
        const parentNode = parentId ? structure.find(n => n.id === parentId) : null;
        const isParentSelectedElective = parentNode?.type === 'SELECTED_ELECTIVE';

        updateState(prev => {
            const newNode: MoetStructureNode = {
                id: `node-${Date.now()}`,
                title: level === 'MODULE' ? { vi: 'Mô-đun mới', en: 'New Module' } : { vi: `Cấp ${level} mới`, en: `New Level ${level}` },
                level,
                parentId,
                // Mặc định kế thừa TC Định Hướng nếu cha là TC Định Hướng
                type: isParentSelectedElective ? 'SELECTED_ELECTIVE' : 'REQUIRED',
                courseIds: [],
                order: structure.filter(n => n.parentId === parentId).length,
                requiredCredits: isParentSelectedElective ? parentNode.requiredCredits : undefined,
                manualCreditBlockValues: isParentSelectedElective && parentNode.manualCreditBlockValues 
                    ? { ...parentNode.manualCreditBlockValues } 
                    : undefined
            };

            if (prev.currentProgramId) {
                return {
                    ...prev,
                    programs: prev.programs.map(p => 
                        p.id === prev.currentProgramId 
                            ? { ...p, moetInfo: { ...p.moetInfo, structure: [...(p.moetInfo.structure || []), newNode] } }
                            : p
                    )
                };
            }
            return {
                ...prev,
                generalInfo: {
                    ...prev.generalInfo,
                    moetInfo: {
                        ...prev.generalInfo.moetInfo,
                        structure: [...(prev.generalInfo.moetInfo.structure || []), newNode]
                    }
                }
            };
        });
        setOpenNodes(prev => ({ ...prev, [`node-${Date.now()}`]: true })); // Note: this might need a more stable ID reference
    };

    const handleDeleteNode = (id: string) => {
        if (!confirm(language === 'vi' ? 'Bạn có chắc chắn muốn xoá đề mục này và tất cả nội dung bên trong?' : 'Are you sure you want to delete this item and all its contents?')) return;
        
        const toDelete = new Set<string>([id]);
        const findChildren = (pid: string) => {
            structure.filter(n => n.parentId === pid).forEach(child => {
                toDelete.add(child.id);
                findChildren(child.id);
            });
        };
        findChildren(id);

        updateState(prev => {
            if (prev.currentProgramId) {
                return {
                    ...prev,
                    programs: prev.programs.map(p => 
                        p.id === prev.currentProgramId 
                            ? { ...p, moetInfo: { ...p.moetInfo, structure: (p.moetInfo.structure || []).filter(n => !toDelete.has(n.id)) } }
                            : p
                    )
                };
            }
            return {
                ...prev,
                generalInfo: {
                    ...prev.generalInfo,
                    moetInfo: {
                        ...prev.generalInfo.moetInfo,
                        structure: (prev.generalInfo.moetInfo.structure || []).filter(n => !toDelete.has(n.id))
                    }
                }
            };
        });
    };

    const handleUpdateNode = (id: string, updates: Partial<MoetStructureNode>) => {
        updateState(prev => {
            const currentMoetInfo = prev.currentProgramId 
                ? prev.programs.find(p => p.id === prev.currentProgramId)?.moetInfo 
                : prev.generalInfo.moetInfo;
            
            let newStructure = currentMoetInfo?.structure || [];
            const nodeIndex = newStructure.findIndex(n => n.id === id);
            if (nodeIndex === -1) return prev;

            const oldNode = newStructure[nodeIndex];
            let newCourseIds = oldNode.courseIds;

            // Nếu đổi sang TC Định hướng và Node này không phải Mô-đun -> đá hết các môn học ra
            if (updates.type === 'SELECTED_ELECTIVE' && oldNode.type !== 'SELECTED_ELECTIVE' && oldNode.level !== 'MODULE') {
                newCourseIds = [];
            }

            newStructure = newStructure.map(n => n.id === id ? { ...n, ...updates, courseIds: newCourseIds } : n);

            if (prev.currentProgramId) {
                return {
                    ...prev,
                    programs: prev.programs.map(p => 
                        p.id === prev.currentProgramId 
                            ? { ...p, moetInfo: { ...p.moetInfo, structure: newStructure } }
                            : p
                    )
                };
            }
            return {
                ...prev,
                generalInfo: {
                    ...prev.generalInfo,
                    moetInfo: {
                        ...prev.generalInfo.moetInfo,
                        structure: newStructure
                    }
                }
            };
        });
    };

    const handleAddCourse = (nodeId: string, courseId: string) => {
        const node = structure.find(n => n.id === nodeId);
        if (!node) return;

        updateState(prev => {
            // Ép type môn học bằng type của Node
            const updatedCourses = prev.courses.map(c => {
                if (c.id === courseId) {
                    return { ...c, type: node.type };
                }
                return c;
            });

            if (prev.currentProgramId) {
                return {
                    ...prev,
                    courses: updatedCourses,
                    programs: prev.programs.map(p => 
                        p.id === prev.currentProgramId 
                            ? { ...p, moetInfo: { ...p.moetInfo, structure: (p.moetInfo.structure || []).map(n => n.id === nodeId ? { ...n, courseIds: [...n.courseIds, courseId] } : n) } }
                            : p
                    )
                };
            }

            return {
                ...prev,
                courses: updatedCourses,
                generalInfo: {
                    ...prev.generalInfo,
                    moetInfo: {
                        ...prev.generalInfo.moetInfo,
                        structure: (prev.generalInfo.moetInfo.structure || []).map(n => n.id === nodeId ? { ...n, courseIds: [...n.courseIds, courseId] } : n)
                    }
                }
            };
        });
    };

    const handleRemoveCourse = (nodeId: string, courseId: string) => {
        updateState(prev => {
            if (prev.currentProgramId) {
                return {
                    ...prev,
                    programs: prev.programs.map(p => 
                        p.id === prev.currentProgramId 
                            ? { ...p, moetInfo: { ...p.moetInfo, structure: (p.moetInfo.structure || []).map(n => n.id === nodeId ? { ...n, courseIds: n.courseIds.filter(id => id !== courseId) } : n) } }
                            : p
                    )
                };
            }
            return {
                ...prev,
                generalInfo: {
                    ...prev.generalInfo,
                    moetInfo: {
                        ...prev.generalInfo.moetInfo,
                        structure: (prev.generalInfo.moetInfo.structure || []).map(n => n.id === nodeId ? { ...n, courseIds: n.courseIds.filter(id => id !== courseId) } : n)
                    }
                }
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = structure.findIndex(n => n.id === active.id);
        const newIndex = structure.findIndex(n => n.id === over.id);

        if (structure[oldIndex].parentId !== structure[newIndex].parentId) return;

        const newStructure = arrayMove(structure, oldIndex, newIndex).map((n, idx) => ({ ...(n as any), order: idx }));
        
        updateState(prev => {
            if (prev.currentProgramId) {
                return {
                    ...prev,
                    programs: prev.programs.map(p => 
                        p.id === prev.currentProgramId 
                            ? { ...p, moetInfo: { ...p.moetInfo, structure: newStructure } }
                            : p
                    )
                };
            }
            return {
                ...prev,
                generalInfo: {
                    ...prev.generalInfo,
                    moetInfo: {
                        ...prev.generalInfo.moetInfo,
                        structure: newStructure
                    }
                }
            };
        });
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- Renderer đệ quy cho từng Node ---
    const renderNode = (node: any, parentNumbering: string, parentNumericNumbering: string, index: number) => {
        let currentNumbering = '';
        let currentNumericNumbering = '';
        
        if (node.level === 1) {
            currentNumbering = toRoman(index + 1);
            currentNumericNumbering = `${index + 1}`;
        } else if (node.level === 'MODULE') {
            currentNumbering = language === 'vi' ? `Mô-đun ${moduleNumbering[node.id]}` : `Module ${moduleNumbering[node.id]}`;
            currentNumericNumbering = '';
        } else {
            currentNumbering = parentNumericNumbering ? `${parentNumericNumbering}.${index + 1}` : `${index + 1}`;
            currentNumericNumbering = currentNumbering;
        }

        let parentRequirements: { total: number, blocks: Record<string, number> } | undefined = undefined;
        let parentType: string | undefined = undefined;
        if (node.level === 'MODULE') {
            const parentNode = structure.find(n => n.id === node.parentId);
            if (parentNode) {
                parentType = parentNode.type;
                if (parentNode.type === 'SELECTED_ELECTIVE') {
                    parentRequirements = {
                        total: parentNode.requiredCredits || 0,
                        blocks: parentNode.manualCreditBlockValues || {}
                    };
                }
            }
        }

        const totals = calculateNodeCredits(node.id);
        const actualTotals = calculateActualCredits(node.id);
        const isOpen = !!openNodes[node.id];

        return (
            <SortableNode 
                key={node.id} 
                node={node} 
                index={index} 
                depth={node.level === 'MODULE' ? 4 : (node.level as number)}
                numbering={currentNumbering}
                isOpen={isOpen}
                onToggle={() => setOpenNodes(prev => ({ ...prev, [node.id]: !prev[node.id] }))}
                onDelete={() => handleDeleteNode(node.id)}
                onUpdateNode={(updates) => handleUpdateNode(node.id, updates)}
                onAddChild={(level) => handleAddNode(node.id, level)}
                actualTotals={actualTotals}
                totalCredits={totals.total}
                parentRequirements={parentRequirements}
                parentType={parentType}
                language={language}
                creditBlocks={creditBlocks}
                courses={courses}
                excludeIds={excludeCourseIds}
            >
                {/* Đệ quy gọi con */}
                {node.children.map((child: any, idx: number) => renderNode(child, currentNumbering, currentNumericNumbering, idx))}
            </SortableNode>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="text-indigo-600" />
                        {language === 'vi' ? 'Cấu trúc Chương trình Đào tạo' : 'Program Structure'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {language === 'vi' ? 'Quản lý các khối kiến thức, mô-đun và học phần theo phân cấp.' : 'Manage knowledge blocks, modules, and courses hierarchically.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExpandAll}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-all text-sm font-medium shadow-sm"
                    >
                        <ChevronsDown size={16} /> {language === 'vi' ? 'Mở toàn bộ' : 'Expand All'}
                    </button>
                    <button 
                        onClick={handleCollapseAll}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-all text-sm font-medium shadow-sm"
                    >
                        <ChevronsUp size={16} /> {language === 'vi' ? 'Đóng toàn bộ' : 'Collapse All'}
                    </button>
                    <button 
                        onClick={() => handleAddNode(undefined, 1)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                    >
                        <Plus size={18} /> {language === 'vi' ? 'Thêm khối' : 'Add Block'}
                    </button>
                </div>
            </div>

            <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-200">
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={tree.map(n => n.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {tree.map((node, idx) => renderNode(node, '', '', idx))}
                    </SortableContext>
                </DndContext>
            </div>

            {/* Global Summary */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                        <Layers size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Program Credits</div>
                        <div className="text-2xl font-black text-slate-800">
                            {tree.reduce((acc, node) => acc + calculateNodeCredits(node.id).total, 0)} Cr
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    {creditBlocks.map(cb => {
                        const total = tree.reduce((acc, node) => acc + (calculateNodeCredits(node.id)[cb.id] || 0), 0);
                        return (
                            <div key={cb.id} className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-center min-w-[80px]">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{cb.acronym?.[language] || cb.name?.[language]}</div>
                                <div className="text-lg font-bold text-slate-700">{total}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MoetStructure;