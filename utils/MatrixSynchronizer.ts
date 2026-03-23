import { AppState, MappingMatrix } from '../types';

export class MatrixSynchronizer {
  private static updateMatrix(matrix: MappingMatrix[] | undefined, idMap: Record<string, string>): MappingMatrix[] {
    if (!matrix) return [];
    return matrix.map(relation => {
      const newSourceId = idMap[relation.sourceId] || relation.sourceId;
      const newTargetId = idMap[relation.targetId] || relation.targetId;
      return { ...relation, sourceId: newSourceId, targetId: newTargetId };
    });
  }

  static syncAllRelations(currentState: AppState, idMappings: Record<string, string>): AppState {
    if (Object.keys(idMappings).length === 0) return currentState;

    const updatedPrograms = currentState.programs.map(program => ({
      ...program,
      // Cập nhật tất cả các ma trận ánh xạ
      courseSoMap: this.updateMatrix(program.courseSoMap, idMappings),
      coursePiMap: this.updateMatrix(program.coursePiMap, idMappings),
      coursePeoMap: this.updateMatrix(program.coursePeoMap, idMappings),
      peoSoMap: this.updateMatrix(program.peoSoMap, idMappings),
      loSoMap: this.updateMatrix(program.loSoMap, idMappings),
      peoPloMap: this.updateMatrix(program.peoPloMap, idMappings),
      peoConstituentMap: this.updateMatrix(program.peoConstituentMap, idMappings),
      
      // Cập nhật reference bên trong từng Course
      courses: program.courses.map(course => {
        const updatedPrerequisites = course.prerequisites?.map(id => idMappings[id] || id) || [];
        const updatedParallels = course.parallelCourses?.map(id => idMappings[id] || id) || [];
        
        return {
          ...course,
          id: idMappings[course.id] || course.id,
          prerequisites: updatedPrerequisites,
          parallelCourses: updatedParallels
        };
      })
    }));

    return {
      ...currentState,
      programs: updatedPrograms
    };
  }
}