import React from 'react';
import { AppState, MoetBlock } from '../../types';
import { Plus, Trash2, BookOpen, GripVertical } from 'lucide-react';
import { InputField } from './MoetShared';
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

interface SortableBlockProps {
  block: MoetBlock;
  language: 'vi' | 'en';
  updateBlockLang: (id: string, field: keyof MoetBlock, lang: 'vi' | 'en', value: string) => void;
  deleteBlock: (id: string) => void;
}

const SortableBlock: React.FC<SortableBlockProps> = ({ block, language, updateBlockLang, deleteBlock }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
      <div {...attributes} {...listeners} className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} />
      </div>
      <div className="pl-4">
        <InputField label={language === 'vi' ? 'Tên khối (VI)' : 'Block Name (VI)'} value={block.name?.vi || ''} onChange={v => updateBlockLang(block.id, 'name', 'vi', v)} />
      </div>
      <InputField label={language === 'vi' ? 'Tên khối (EN)' : 'Block Name (EN)'} value={block.name?.en || ''} onChange={v => updateBlockLang(block.id, 'name', 'en', v)} />
      <div className="flex items-end gap-2">
        <button onClick={() => deleteBlock(block.id)} className="text-slate-300 hover:text-red-500 mb-2"><Trash2 size={18}/></button>
      </div>
    </div>
  );
};

interface Props {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MoetBlocks: React.FC<Props> = ({ state, updateState }) => {
  const globalState = state.globalState || state;
  const generalInfo = globalState.institutionInfo || state.generalInfo;
  const { language } = state;
  const currentProgram = state.programs?.find(p => p.id === state.currentProgramId);
  const moetInfo = currentProgram?.moetInfo || generalInfo.moetInfo || { blocks: [] };
  const blocks = moetInfo.blocks || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateMoetField = (field: keyof typeof moetInfo, value: any) => {
    updateState(prev => {
      if (prev.currentProgramId) {
        return {
          ...prev,
          programs: prev.programs.map(p => 
            p.id === prev.currentProgramId 
              ? { ...p, moetInfo: { ...p.moetInfo, [field]: value } }
              : p
          )
        };
      }

      const prevGlobalState = prev.globalState || prev;
      const prevGeneralInfo = prevGlobalState.institutionInfo || prev.generalInfo;
      
      const updatedGeneralInfo = {
        ...prevGeneralInfo,
        moetInfo: { ...prevGeneralInfo.moetInfo, [field]: value }
      };

      if (prev.globalState) {
        return {
          ...prev,
          globalState: {
            ...prev.globalState,
            institutionInfo: updatedGeneralInfo
          }
        };
      } else {
        return {
          ...prev,
          generalInfo: updatedGeneralInfo
        };
      }
    });
  };

  const addBlock = () => {
    const newBlock: MoetBlock = {
      id: `block-${Date.now()}`,
      name: { vi: '', en: '' },
      minCredits: 0
    };
    updateMoetField('blocks', [...blocks, newBlock]);
  };

  const updateBlockLang = (id: string, field: keyof MoetBlock, lang: 'vi' | 'en', value: string) => {
    updateMoetField('blocks', blocks.map(b => b.id === id ? { ...b, [field]: { ...(b[field] as any), [lang]: value } } : b));
  };

  const deleteBlock = (id: string) => {
    updateMoetField('blocks', blocks.filter(b => b.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over?.id);
      updateMoetField('blocks', arrayMove(blocks, oldIndex, newIndex));
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <BookOpen size={18} className="text-emerald-600"/>
          {language === 'vi' ? 'Khối Kiến thức - Kỹ năng' : 'Knowledge - Skill Blocks'}
        </h3>
        <button onClick={addBlock} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={14}/> {language === 'vi' ? 'Thêm khối' : 'Add Block'}
        </button>
      </div>
      <div className="p-6">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {blocks.map((block) => (
                <SortableBlock 
                  key={block.id} 
                  block={block} 
                  language={language} 
                  updateBlockLang={updateBlockLang} 
                  deleteBlock={deleteBlock} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
};

export default MoetBlocks;
