import { CalculationResult } from '../types';

export class Materia {
  id: number;
  anteriores: Set<number>;
  posteriores: Set<number>;
  nombre: string;

  constructor(id_materia: number) {
    this.id = id_materia;
    this.anteriores = new Set<number>();
    this.posteriores = new Set<number>();
    this.nombre = "";
  }
}

export interface MateriaDatos {
  cuatrimestre: number;
  valor_corchete: number;
  valor_corchete_original: number;
}

export class PlanDeEstudios {
  materias: Record<number, Materia>;
  datos_materias: Record<number, MateriaDatos>;

  constructor() {
    this.materias = {};
    this.datos_materias = {};
  }

  agregarMateria(id_materia: number) {
    if (!this.materias[id_materia]) {
      this.materias[id_materia] = new Materia(id_materia);
    }
  }

  agregarRelacion(id_antecesora: number, id_posterior: number) {
    this.agregarMateria(id_antecesora);
    this.agregarMateria(id_posterior);
    this.materias[id_antecesora].posteriores.add(id_posterior);
    this.materias[id_posterior].anteriores.add(id_antecesora);
  }

  encontrarCaminoMasLargoDesde(id_materia: number): number[] {
    if (!this.materias[id_materia]) return [];
    if (this.materias[id_materia].posteriores.size === 0) return [id_materia];

    let longitudMaxima = 0;
    let caminoMaximo: number[] = [];

    this.materias[id_materia].posteriores.forEach(posterior => {
      const camino = this.encontrarCaminoMasLargoDesde(posterior);
      if (camino.length > longitudMaxima) {
        longitudMaxima = camino.length;
        caminoMaximo = camino;
      }
    });

    return [id_materia, ...caminoMaximo];
  }

  encontrarCaminoMasLargoHasta(id_materia: number): number[] {
    if (!this.materias[id_materia]) return [];
    if (this.materias[id_materia].anteriores.size === 0) return [id_materia];

    let longitudMaxima = 0;
    let caminoMaximo: number[] = [];

    for (const anterior of this.materias[id_materia].anteriores) {
      const camino = this.encontrarCaminoMasLargoHasta(anterior);
      if (camino.length > longitudMaxima) {
        longitudMaxima = camino.length;
        caminoMaximo = camino;
      }
    }

    return [id_materia, ...caminoMaximo];
  }

  contarSemestresEnCamino(camino: number[], accountFor3671 = true): number {
    let count = camino.length;
    if (accountFor3671 && camino.includes(3671)) {
      count += 1;
    }
    return count;
  }

  encontrarCaminoMasSemestresDesde(id_materia: number): number[] {
    if (!this.materias[id_materia]) return [];
    if (this.materias[id_materia].posteriores.size === 0) return [id_materia];

    let semestresMaximos = 0;
    let caminoMaximo: number[] = [];

    this.materias[id_materia].posteriores.forEach(posterior => {
      const camino = this.encontrarCaminoMasSemestresDesde(posterior);
      const semestresCamino = this.contarSemestresEnCamino(camino, true);
      if (semestresCamino > semestresMaximos) {
        semestresMaximos = semestresCamino;
        caminoMaximo = camino;
      }
    });

    return [id_materia, ...caminoMaximo];
  }

  encontrarCaminoMasSemestresHasta(id_materia: number): number[] {
    if (!this.materias[id_materia]) return [];
    if (this.materias[id_materia].anteriores.size === 0) return [id_materia];

    let semestresMaximos = 0;
    let caminoMaximo: number[] = [];

    for (const anterior of this.materias[id_materia].anteriores) {
      const camino = this.encontrarCaminoMasSemestresHasta(anterior);
      const semestresCamino = this.contarSemestresEnCamino(camino, true);
      if (semestresCamino > semestresMaximos) {
        semestresMaximos = semestresCamino;
        caminoMaximo = camino;
      }
    }

    return [id_materia, ...caminoMaximo];
  }

  encontrarCaminoMasLargo(): number[] {
    let caminoMaximo: number[] = [];
    for (const id_materia in this.materias) {
      const camino = this.encontrarCaminoMasLargoDesde(parseInt(id_materia));
      if (camino.length > caminoMaximo.length) {
        caminoMaximo = camino;
      }
    }
    return caminoMaximo;
  }

  esAlcanzableDesde(id_origen: number, id_destino: number): boolean {
    if (!this.materias[id_origen] || !this.materias[id_destino]) return false;
    if (id_origen === id_destino) return true;

    const visitados = new Set<number>();
    const stack = [id_origen];
    visitados.add(id_origen);

    while (stack.length > 0) {
      const actual = stack.pop()!;
      if (actual === id_destino) return true;

      if (this.materias[actual]) {
        for (const posterior of this.materias[actual].posteriores) {
          if (this.materias[posterior] && !visitados.has(posterior)) {
            visitados.add(posterior);
            stack.push(posterior);
          }
        }
      }
    }

    return false;
  }

  cuatrisMinimosHastaRecibirse(semester: number | null = null): number {
    const caminoMasLargoGeneral = this.encontrarCaminoMasLargo();
    let semestres = caminoMasLargoGeneral.length;

    if (this.materias[3671]) {
      semestres = this.contarSemestresEnCamino(caminoMasLargoGeneral, true);

      if (semester !== null) {
        const caminoHasta3671 = this.encontrarCaminoMasLargoHasta(3671);
        const prerequisitosPath = caminoHasta3671.filter(id => id !== 3671);

        const semestresPrerequisitos = this.contarSemestresEnCamino(prerequisitosPath, false);
        const absoluteSemesterAfterPrereqs = semester + semestresPrerequisitos - 1;
        const prerequisitosEndInPrimero = (absoluteSemesterAfterPrereqs % 2 === 1);

        if (prerequisitosEndInPrimero) {
          const totalWith3671 = semestresPrerequisitos + 1 + 2;
          semestres = Math.max(semestres, totalWith3671);
        } else {
          const totalWith3671 = semestresPrerequisitos + 2;
          semestres = Math.max(semestres, totalWith3671);
        }
      }
    }

    return semestres;
  }

  calcularYGuardarLongitudes(semester: number | null = null) {
    this.datos_materias = {};
    const cuatrisMinimosBase = this.cuatrisMinimosHastaRecibirse(semester);
    const longitudes: Record<number, number[]> = {};

    for (const id_materia in this.materias) {
      const longitud = this.encontrarCaminoMasLargoDesde(parseInt(id_materia)).length;
      if (!longitudes[longitud]) longitudes[longitud] = [];
      longitudes[longitud].push(parseInt(id_materia));
    }

    Object.keys(longitudes)
      .map(Number)
      .sort((a, b) => b - a)
      .forEach(longitud => {
        longitudes[longitud].forEach(id_materia => {
          let cantMateriasAntes: number, cantMateriasDespues: number;

          if (semester !== null) {
            const caminoHasta = this.encontrarCaminoMasSemestresHasta(id_materia);
            const caminoDesde = this.encontrarCaminoMasSemestresDesde(id_materia);
            cantMateriasAntes = this.contarSemestresEnCamino(caminoHasta, true) - (id_materia === 3671 ? 2 : 1);
            cantMateriasDespues = this.contarSemestresEnCamino(caminoDesde, true) - 1;
          } else {
            cantMateriasAntes = this.encontrarCaminoMasLargoHasta(id_materia).length - 1;
            cantMateriasDespues = this.encontrarCaminoMasLargoDesde(id_materia).length - 1;
          }

          let cuatrisMinimos = cuatrisMinimosBase;
          if (semester !== null && this.materias[3671]) {
            const leadsto3671 = this.esAlcanzableDesde(id_materia, 3671);

            if (leadsto3671) {
              const caminoDesde = this.encontrarCaminoMasSemestresDesde(id_materia);
              if (caminoDesde.includes(3671) && caminoDesde.length > 1) {
                const index3671 = caminoDesde.indexOf(3671);
                if (index3671 > 0) {
                  const pathBefore3671 = caminoDesde.slice(0, index3671);
                  const semestersBefore3671 = this.contarSemestresEnCamino(pathBefore3671, true);
                  const absoluteSemesterBefore3671 = semester + semestersBefore3671 - 1;
                  const before3671IsPrimero = (absoluteSemesterBefore3671 % 2 === 1);

                  const caminoHasta = this.encontrarCaminoMasSemestresHasta(id_materia);
                  const totalPathSemesters = this.contarSemestresEnCamino(caminoHasta, true) - 1 +
                                            this.contarSemestresEnCamino(caminoDesde, true);
                  const actualPathWithGap = totalPathSemesters + (before3671IsPrimero ? 1 : 0);

                  if (actualPathWithGap === cuatrisMinimosBase - 1) {
                    cuatrisMinimos = actualPathWithGap;
                  }
                }
              }
            }
          } else if (semester === null && this.materias[3671]) {
            const tiene3671Adelante = this.esAlcanzableDesde(id_materia, 3671);
            if (!tiene3671Adelante) {
              cuatrisMinimos = cuatrisMinimosBase + 1;
            }
          }

          const valorCorchete = cuatrisMinimos - (cantMateriasAntes + cantMateriasDespues);
          const cuatrimestre = cuatrisMinimos - (cantMateriasDespues + 1) + 1;

          this.datos_materias[id_materia] = {
            cuatrimestre: cuatrimestre,
            valor_corchete: valorCorchete,
            valor_corchete_original: valorCorchete
          };
        });
      });
  }

  ajustarCuatrimestre3671YPropagar(respuesta: number) {
    if (respuesta !== 1) return;

    const cuatrisMinimos = this.cuatrisMinimosHastaRecibirse();
    const datos = this.datos_materias;
    if (!datos[3671]) return;
    const n = datos[3671].cuatrimestre;
    let valorCorchete3671 = datos[3671].valor_corchete;

    const paridadDeseada = respuesta % 2; // 1
    const paridadActual = n % 2;

    let ajuste = 0;
    if (paridadActual !== paridadDeseada) {
      if (valorCorchete3671 === 1) {
        ajuste = 1;
      } else {
        ajuste = -1;
        valorCorchete3671--;
      }
    }

    if (ajuste === -1) {
      this.ajustarHaciaAtras(n, datos);
    } else if (ajuste === 1) {
      this.ajustarHaciaAdelante(n, datos);
    }
  }

  ajustarHaciaAtras(n: number, datos: Record<number, MateriaDatos>) {
    if (!datos[3671]) return;
    datos[3671].cuatrimestre = n - 1;
    datos[3671].valor_corchete--;
    if (datos[3671].valor_corchete_original !== undefined) {
      datos[3671].valor_corchete_original--;
    }
    let cuatriActual = n - 1;
    let materiasAMover = [3671];

    while (materiasAMover.length > 0) {
      const nuevasAMover: number[] = [];
      for (const id_materia in this.materias) {
        const id = parseInt(id_materia);
        if (datos[id] && datos[id].cuatrimestre === cuatriActual) {
          if (materiasAMover.some(materia =>
            this.materias[id].posteriores.has(materia))) {
            datos[id].cuatrimestre--;
            datos[id].valor_corchete--;
            if (datos[id].valor_corchete_original !== undefined) {
              datos[id].valor_corchete_original--;
            }
            nuevasAMover.push(id);
          }
        }
      }
      materiasAMover = nuevasAMover;
      cuatriActual--;
    }
  }

  ajustarHaciaAdelante(n: number, datos: Record<number, MateriaDatos>) {
    if (!datos[3671]) return;
    datos[3671].cuatrimestre = n + 1;
    let cuatriActual = n - 1;
    let materiasAMover: number[] = [];

    for (const id_materia in this.materias) {
      const id = parseInt(id_materia);
      if (datos[id] && datos[id].cuatrimestre === cuatriActual &&
          this.materias[id].posteriores.has(3671)) {
        datos[id].cuatrimestre++;
        datos[id].valor_corchete++;
        if (datos[id].valor_corchete_original !== undefined) {
          datos[id].valor_corchete_original++;
        }
        materiasAMover.push(id);
      }
    }

    while (materiasAMover.length > 0) {
      const nuevasAMover: number[] = [];
      cuatriActual--;
      for (const id_materia in this.materias) {
        const id = parseInt(id_materia);
        if (datos[id] && datos[id].cuatrimestre === cuatriActual) {
          if (materiasAMover.some(materia =>
            this.materias[id].posteriores.has(materia))) {
            datos[id].cuatrimestre++;
            datos[id].valor_corchete++;
            if (datos[id].valor_corchete_original !== undefined) {
              datos[id].valor_corchete_original++;
            }
            nuevasAMover.push(id);
          }
        }
      }
      materiasAMover = nuevasAMover;
    }
  }

  cargarMateriasDesdeTexto(texto: string, materiasCursadas: number[] = []) {
    const materiasSet = new Set(materiasCursadas);
    texto.trim().split('\n').forEach(linea => {
      if (!linea.trim()) return;
      const [id, correlativas] = linea.split(':');
      const idMateria = parseInt(id.trim());

      if (materiasSet.has(idMateria)) return;
      this.agregarMateria(idMateria);

      if (correlativas && correlativas.trim()) {
        correlativas.split(',')
          .map(x => parseInt(x.trim()))
          .filter(x => !materiasSet.has(x))
          .forEach(correlativa => {
            this.agregarMateria(correlativa);
            this.agregarRelacion(correlativa, idMateria);
          });
      }
    });
  }

  cargarNombresDesdeTexto(texto: string) {
    texto.trim().split('\n').forEach(linea => {
      if (!linea.trim()) return;
      const match = linea.trim().match(/^(\d+)\s+(.+)$/);
      if (match) {
        const [_, idStr, nombre] = match;
        const idMateria = parseInt(idStr);
        if (this.materias[idMateria]) {
          this.materias[idMateria].nombre = nombre.trim();
        }
      }
    });
  }

  materiasProximoCuatri(cantidad: number): CalculationResult {
    const materiasEnCuatri: [number, number, number][] = [];
    for (const [id_materia, datos] of Object.entries(this.datos_materias)) {
      const id = parseInt(id_materia);

      if (!this.materias[id]) continue;

      const materia = this.materias[id];

      let todasPrerequisitosCompletadas = true;
      for (const prereqId of materia.anteriores) {
        if (this.materias[prereqId]) {
          todasPrerequisitosCompletadas = false;
          break;
        }
      }

      const valorCorcheteParaReadiness = datos.valor_corchete_original !== undefined
        ? datos.valor_corchete_original
        : datos.valor_corchete;

      if (todasPrerequisitosCompletadas && datos.cuatrimestre === valorCorcheteParaReadiness) {
        materiasEnCuatri.push([id, datos.valor_corchete, datos.cuatrimestre]);
      }
    }
    materiasEnCuatri.sort((a, b) => a[1] - b[1]);

    return this.procesarMateriasSeleccionadas(materiasEnCuatri, cantidad);
  }

  procesarMateriasSeleccionadas(materiasEnCuatri: [number, number, number][], cantidad: number): CalculationResult {
    const resultado: CalculationResult = {
      materias_fijas: [],
      materias_opcionales: [],
      cantidad_a_elegir: 0
    };

    if (materiasEnCuatri.length === 0) return resultado;

    let i = 0;
    const seleccionadas: [number, number, number][] = [];
    while (i < materiasEnCuatri.length && seleccionadas.length < cantidad) {
      seleccionadas.push(materiasEnCuatri[i]);
      i++;
    }

    if (i < materiasEnCuatri.length) {
      const ultimoValor = seleccionadas[seleccionadas.length - 1][1];
      const empate: [number, number, number][] = [];

      while (seleccionadas.length > 0 &&
             seleccionadas[seleccionadas.length - 1][1] === ultimoValor) {
        empate.unshift(seleccionadas.pop()!);
      }

      while (i < materiasEnCuatri.length &&
             materiasEnCuatri[i][1] === ultimoValor) {
        empate.push(materiasEnCuatri[i]);
        i++;
      }

      this.procesarResultadosConEmpate(resultado, seleccionadas, empate, cantidad);
    } else {
      this.agregarMateriasAlResultado(resultado.materias_fijas, seleccionadas);
    }

    return resultado;
  }

  procesarResultadosConEmpate(resultado: CalculationResult, seleccionadas: [number, number, number][], empate: [number, number, number][], cantidad: number) {
    if (seleccionadas.length + empate.length <= cantidad) {
      this.agregarMateriasAlResultado(resultado.materias_fijas,
                                    [...seleccionadas, ...empate]);
    } else {
      this.agregarMateriasAlResultado(resultado.materias_fijas, seleccionadas);
      resultado.cantidad_a_elegir = cantidad - seleccionadas.length;
      this.agregarMateriasAlResultado(resultado.materias_opcionales, empate);
    }
  }

  agregarMateriasAlResultado(lista: string[], materias: [number, number, number][]) {
    materias.forEach(([id_materia, valor_corchete]) => {
      const nombre = this.materias[id_materia].nombre;
      lista.push(`[${valor_corchete}] ${nombre} (${id_materia})`);
    });
  }

  puedoCursarEnCuatri(n: number): string[] {
    const materiasEnCuatri: [number, number, number][] = [];
    for (const [id_materia, datos] of Object.entries(this.datos_materias)) {
      const id = parseInt(id_materia);

      if (!this.materias[id]) continue;

      const materia = this.materias[id];
      let todasPrerequisitosCompletadas = true;
      for (const prereqId of materia.anteriores) {
        if (this.materias[prereqId]) {
          todasPrerequisitosCompletadas = false;
          break;
        }
      }

      const valorCorcheteParaReadiness = datos.valor_corchete_original !== undefined
        ? datos.valor_corchete_original
        : datos.valor_corchete;

      if (todasPrerequisitosCompletadas && datos.cuatrimestre - valorCorcheteParaReadiness + 1 === n) {
        materiasEnCuatri.push([id, datos.valor_corchete, datos.cuatrimestre]);
      }
    }

    return materiasEnCuatri
      .sort((a, b) => a[1] - b[1])
      .map(([id_materia, valor_corchete]) =>
        `[${valor_corchete}] ${this.materias[id_materia].nombre} (${id_materia})`);
  }
}

// Datos estáticos copiados exactamente del original
export const LISTADO_MATERIAS = `
3621:
3622:
3623:
3624:
3625:
3626:
3627:
3628: 3622
3629: 3623
3630: 3624
3631: 3625
3632:
3633: 3622
3634: 3628
3635: 3621, 3629
3636: 3621, 3629
3637: 3630
3638: 3631
3676: 3626
3639: 3633
3640: 3635
3641: 3635, 3636
3642: 3626, 3637
3643: 3638
3644: 3632
3680: 3623, 3625, 3626, 3630, 3632, 3635, 3636, 3638
3645: 3627
3646: 3633, 3640
3647: 3642
3648: 3635, 3636, 3642
3649: 3629, 3638
3650: 3643, 3638, 3635
3675: 3636, 3640, 3642
3651: 3645, 3639, 3621
3652: 3646, 3641
3653: 3648
3654: 3643, 3649
3655: 3650
3656: 3651
3657: 3646
3658: 3646, 3649
3659: 3647, 3644, 3648
3660: 3634, 3654
3661: 3651, 3650, 3644
3662: 3651
3663: 3657
3664: 3651, 3646
3665: 3659, 3653
3666: 3652, 3655, 3649
3667: 3642, 3661
3668: 3656, 3664
3669: 3661
3670: 3664, 3656
3671: 3667, 3659, 3660, 3656
3677: 3652, 3653, 3661
3678: 3652, 3653, 3661
3679: 3652, 3653, 3661
901:
902: 901
903: 902
904: 903
911:
912: 911`;

export const TABLA_NOMBRES = `
3621	Matemática Discreta
3622	Análisis Matemático I
3623	Programación Inicial
3624	Introducción a los Sistemas de Información
3625	Sistemas de Numeración
3626	Principios de Calidad de Software
3627	Álgebra y Geometría Analítica I
3628	Física I
3629	Programación Estructurada Básica
3630	Introducción a la Gestión de Requisitos
3631	Fundamentos de Sistemas Embebidos
3632	Introducción a los Proyectos Informáticos
3633	Análisis Matemático II
3634	Física II
3635	Tópicos de Programación
3636	Bases de Datos
3637	Análisis de Sistemas
3638	Arquitectura de Computadoras
3676	Responsabilidad Social Universitaria
3639	Análisis Matemático III
3640	Algoritmos y Estructuras de Datos
3641	Bases de Datos Aplicadas
3642	Principios de Diseño de Sistemas
3643	Redes de Computadoras
3644	Gestión de las Organizaciones
3680    Taller de Integración
3645	Álgebra y Geometría Analítica II
3646	Paradigmas de Programación
3647	Requisitos Avanzados
3648	Diseño de Software
3649	Sistemas Operativos
3650	Seguridad de la Información
3675	Práctica Profesional Supervisada
3651	Probabilidad y Estadística
3652	Programación Avanzada
3653	Arquitectura de Sistemas Software
3654	Virtualización de Hardware
3655	Auditoría y Legislación
3656	Estadística Aplicada
3657	Autómatas y Gramáticas
3658	Programación Concurrente
3659	Gestión Aplicada al Desarrollo de Software I
3660	Sistemas Operativos Avanzados
3661	Gestión de Proyectos
3662	Matemática Aplicada
3663	Lenguajes y Compiladores
3664	Inteligencia Artificial
3665	Gestión Aplicada al Desarrollo de Software II
3666	Seguridad Aplicada y Forensia
3667	Gestión de la Calidad en Procesos de Sistemas
3668	Inteligencia Artificial Aplicada
3669	Innovación y Emprendedorismo
3670	Ciencia de Datos
3671	Proyecto Final de Carrera
3677	Electiva I
3678	Electiva II
3679    Electiva III
901     Inglés I
902     Inglés II
903     Inglés III
904     Inglés IV
911     Computación I
912     Computación II`;
