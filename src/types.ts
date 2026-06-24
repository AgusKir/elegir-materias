export type SubjectStatus = 'Aprobada' | 'Final' | 'Final (ignorar)' | 'No la voy a cursar' | 'No cursada';

export interface SubjectData {
  id: number;
  nombre: string;
  year: string;
  prerequisites: number[];
}

export interface CalculationResult {
  materias_fijas: string[];
  materias_opcionales: string[];
  cantidad_a_elegir: number;
}
