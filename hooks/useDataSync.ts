import { useState, useCallback } from 'react';
import { AppState, Course } from '../types';
import { DataConflictManager } from '../utils/conflictResolver';
import { MatrixSynchronizer } from '../utils/MatrixSynchronizer';
import { ConflictRecord, ConflictResolutionAction } from '../types/conflict';

export const useDataSync = (
  currentState: AppState, 
  updateAppState: (newState: AppState) => void
) => {
  const [isResolving, setIsResolving] = useState(false);
  const [pendingConflicts, setPendingConflicts] = useState<ConflictRecord<any>[]>([]);

  const applyWithoutConflicts = useCallback((conflicts: ConflictRecord<any>[]) => {
    const finalCourses = conflicts.map(c => c.status === 'new' ? c.incoming : c.existing);
    
    let nextState: AppState = {
      ...currentState,
      programs: [{ ...currentState.programs[0], courses: finalCourses }]
    };
    
    updateAppState(nextState);
  }, [currentState, updateAppState]);

  const initiateImport = useCallback((incomingCourses: Course[]) => {
    const currentCourses = currentState.programs[0]?.courses || [];
    const conflicts = DataConflictManager.analyzeCourseConflicts(currentCourses, incomingCourses);

    const hasConflict = conflicts.some(c => c.status === 'conflict');

    if (hasConflict) {
      setPendingConflicts(conflicts);
      setIsResolving(true);
    } else {
      applyWithoutConflicts(conflicts);
    }
  }, [currentState, applyWithoutConflicts]);

  const finalizeResolution = useCallback((userDecisions: Record<string, ConflictResolutionAction>) => {
    let finalCourses: Course[] = [];
    let globalIdMap: Record<string, string> = {};

    pendingConflicts.forEach(record => {
      if (record.status === 'new') {
        finalCourses.push(record.incoming);
      } else if (record.status === 'identical') {
        finalCourses.push(record.existing);
      } else {
        const action = userDecisions[record.id] || 'KEEP_EXISTING';
        const result = DataConflictManager.resolveWithMapping(record.existing, record.incoming, action);
        
        finalCourses.push(result.resolvedEntity);
        if (result.idMapping) {
          globalIdMap[result.idMapping.oldId] = result.idMapping.newId;
        }
      }
    });

    // Cập nhật State và Đồng bộ Ma trận
    let nextState: AppState = {
      ...currentState,
      programs: [{ ...currentState.programs[0], courses: finalCourses }]
    };

    nextState = MatrixSynchronizer.syncAllRelations(nextState, globalIdMap);
    
    updateAppState(nextState);
    setIsResolving(false);
    setPendingConflicts([]);
  }, [pendingConflicts, currentState, updateAppState]);

  const cancelResolution = useCallback(() => {
    setIsResolving(false);
    setPendingConflicts([]);
  }, []);

  return {
    isResolving,
    pendingConflicts,
    initiateImport,
    finalizeResolution,
    cancelResolution
  };
};