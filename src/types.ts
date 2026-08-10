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

export interface SaveState {
  slotId: number; // 1, 2, or 3
  timestamp: number;
  dateFormatted: string;
  approvedCount: number;
  totalCount: number;
  subjectStatuses: Record<number, SubjectStatus>;
  numSubjects?: number;
  semester?: number;
  intermediatePriority?: boolean;
}


