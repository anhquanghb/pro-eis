import { Course } from '../types';
import { ConflictRecord, ConflictResolutionAction, ResolutionResult } from '../types/conflict';

export class DataConflictManager {
  private static getDifferences(obj1: any, obj2: any): string[] {
    if (!obj1 || !obj2) return [];
    const keys = Array.from(new Set([...Object.keys(obj1), ...Object.keys(obj2)]));
    return keys.filter(key => {
      if (typeof obj1[key] === 'object' && obj1[key] !== null) {
        return JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key]);
      }
      return obj1[key] !== obj2[key];
    });
  }

  static analyzeCourseConflicts(existingCourses: Course[], incomingCourses: Course[]): ConflictRecord<Course>[] {
    return incomingCourses.map(incoming => {
      // Tìm theo ID hoặc Mã môn học (Code)
      const existing = existingCourses.find(c => c.id === incoming.id || c.code === incoming.code);
      
      if (!existing) {
        return { id: incoming.id, type: 'course', existing: incoming, incoming, status: 'new', differences: [] };
      }

      const diffs = this.getDifferences(existing, incoming);
      if (diffs.length === 0) {
        return { id: existing.id, type: 'course', existing, incoming, status: 'identical', differences: [] };
      }

      return { id: existing.id, type: 'course', existing, incoming, status: 'conflict', differences: diffs };
    });
  }

  static resolveWithMapping(
    existing: Course, 
    incoming: Course, 
    action: ConflictResolutionAction
  ): ResolutionResult<Course> {
    const isIdDifferent = existing.id !== incoming.id;

    switch (action) {
      case 'KEEP_EXISTING':
        return { 
          resolvedEntity: existing, 
          idMapping: isIdDifferent ? { oldId: incoming.id, newId: existing.id } : undefined 
        };

      case 'REPLACE_WITH_INCOMING':
        return { 
          // Ép dùng ID mới, hy sinh ID cũ
          resolvedEntity: incoming, 
          idMapping: isIdDifferent ? { oldId: existing.id, newId: incoming.id } : undefined 
        };

      case 'MERGE':
        // Gộp data, nhưng GIỮ ID CŨ để an toàn cho DB nhất có thể
        const mergedEntity = { ...existing, ...incoming, id: existing.id };
        return { 
          resolvedEntity: mergedEntity,
          idMapping: isIdDifferent ? { oldId: incoming.id, newId: existing.id } : undefined
        };

      default:
        return { resolvedEntity: existing };
    }
  }
}