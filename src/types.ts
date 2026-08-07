export type SubjectStatus = 'Aprobada' | 'Final' | 'Final (ignorar)' | 'No la voy a cursar' | 'No cursada';

export type ActiveTab = 'calculadora' | 'mapa';

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

export interface ParsedResultItem {
  id: number | string;
  numericId?: number;
  nombre: string;
  corchete: number;
  displayCorchete: string | number;
  badgeClass: string;
  isConditional?: boolean;
  conditionalMessage?: string;
}

