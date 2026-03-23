export type ConflictResolutionAction = 'KEEP_EXISTING' | 'REPLACE_WITH_INCOMING' | 'MERGE';

export interface ConflictRecord<T> {
  id: string;
  type: 'course' | 'faculty' | 'program' | 'clo';
  existing: T;
  incoming: T;
  status: 'conflict' | 'new' | 'identical';
  differences: string[];
}

export interface ResolutionResult<T> {
  resolvedEntity: T;
  idMapping?: { oldId: string; newId: string };
}