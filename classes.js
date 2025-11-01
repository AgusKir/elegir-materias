class Materia {
    constructor(id_materia) {
        this.id = id_materia;
        this.anteriores = new Set();
        this.posteriores = new Set();
        this.nombre = "";
    }
}

class PlanDeEstudios {
    constructor() {
        this.materias = {};
        this.datos_materias = {};
    }

    agregarMateria(id_materia) {
        if (!this.materias[id_materia]) {
            this.materias[id_materia] = new Materia(id_materia);
        }
    }

    agregarRelacion(id_antecesora, id_posterior) {
        this.agregarMateria(id_antecesora);
        this.agregarMateria(id_posterior);
        this.materias[id_antecesora].posteriores.add(id_posterior);
        this.materias[id_posterior].anteriores.add(id_antecesora);
    }

    encontrarCaminoMasLargoDesde(id_materia) {
        if (!this.materias[id_materia]) return [];
        if (this.materias[id_materia].posteriores.size === 0) return [id_materia];
        
        let longitudMaxima = 0;
        let caminoMaximo = [];
        
        this.materias[id_materia].posteriores.forEach(posterior => {
            const camino = this.encontrarCaminoMasLargoDesde(posterior);
            if (camino.length > longitudMaxima) {
                longitudMaxima = camino.length;
                caminoMaximo = camino;
            }
        });
    
        return [id_materia, ...caminoMaximo];
    }

    encontrarCaminoMasLargoHasta(id_materia) {
        if (!this.materias[id_materia]) return [];
        if (this.materias[id_materia].anteriores.size === 0) return [id_materia];
        
        let longitudMaxima = 0;
        let caminoMaximo = [];
        
        for (const anterior of this.materias[id_materia].anteriores) {
            const camino = this.encontrarCaminoMasLargoHasta(anterior);
            if (camino.length > longitudMaxima) {
                longitudMaxima = camino.length;
                caminoMaximo = camino;
            }
        }
        
        return [id_materia, ...caminoMaximo];
    }

    encontrarCaminoMasLargo() {
        let caminoMaximo = [];
        for (const id_materia in this.materias) {
            const camino = this.encontrarCaminoMasLargoDesde(parseInt(id_materia));
            if (camino.length > caminoMaximo.length) {
                caminoMaximo = camino;
            }
        }
        return caminoMaximo;
    }

    // Verificar si un subject_id es alcanzable desde otro subject_id (si está en algún camino hacia adelante)
    esAlcanzableDesde(id_origen, id_destino) {
        if (!this.materias[id_origen] || !this.materias[id_destino]) return false;
        if (id_origen === id_destino) return true;
        
        // Usar DFS para verificar si id_destino es alcanzable desde id_origen
        // Solo seguir rutas a través de materias que existen en el grafo actual
        const visitados = new Set();
        const stack = [id_origen];
        visitados.add(id_origen);
        
        while (stack.length > 0) {
            const actual = stack.pop();
            if (actual === id_destino) return true;
            
            if (this.materias[actual]) {
                for (const posterior of this.materias[actual].posteriores) {
                    // Solo seguir si el posterior también existe en el grafo
                    if (this.materias[posterior] && !visitados.has(posterior)) {
                        visitados.add(posterior);
                        stack.push(posterior);
                    }
                }
            }
        }
        
        return false;
    }

    cuatrisMinimosHastaRecibirse(semester = null) {
        // Calcular el camino más largo general (incluyendo todos los caminos)
        const caminoMasLargoGeneral = this.encontrarCaminoMasLargo();
        const longitudGeneral = caminoMasLargoGeneral.length;
        
        // Si 3671 está presente, verificar si está en el camino más largo O si el camino hasta 3671 es al menos tan largo
        if (this.materias[3671]) {
            const caminoHasta3671 = this.encontrarCaminoMasLargoHasta(3671);
            const longitudHasta3671 = caminoHasta3671.length;
            
            // Solo ajustar si el camino hasta 3671 es al menos tan largo como el camino general
            // (es decir, si 3671 está en un camino que es al menos tan crítico como el más largo)
            const estaEnCaminoCritico = caminoMasLargoGeneral.includes(3671) || longitudHasta3671 >= longitudGeneral;
            
            if (!estaEnCaminoCritico) {
                // Si 3671 no está en el camino crítico, no afecta cuatrisMinimos
                return longitudGeneral;
            }
            
            // Si 3671 está en el camino más largo general, ajustar según el semester
            if (caminoMasLargoGeneral.includes(3671)) {
                if (semester !== null && semester !== undefined && parseInt(semester) === 2) {
                    // En Segundo, agregar solo 1 porque 3671 no puede empezar hasta el siguiente año
                    return longitudGeneral + 1;
                } else {
                    // En Primero, agregar 2 porque 3671 puede empezar inmediatamente y ocupa 2 semestres
                    return longitudGeneral + 2;
                }
            }
            
            // Si no está en el camino más largo pero el camino hasta 3671 es al menos tan largo,
            // calcular el camino efectivo hasta 3671
            // IMPORTANTE: 3671 ocupa 2 cuatrimestres, así que el camino efectivo debe considerar esto
            let longitudEfectivaHasta3671;
            if (semester !== null && semester !== undefined && parseInt(semester) === 2) {
                // En Segundo, 3671 solo puede empezar en el siguiente año, así que:
                // - Path hasta 3671 (length N)
                // - Desde ahora: siguiente Primero → siguiente Segundo (3671 starts) → año siguiente Primero (3671 finishes)
                // - Total efectivo: N+1 semestres desde ahora
                longitudEfectivaHasta3671 = longitudHasta3671 + 1;
                // Asegurar mínimo 3 para casos sin prereqs
                longitudEfectivaHasta3671 = Math.max(longitudEfectivaHasta3671, 3);
            } else {
                // En Primero, el camino efectivo debe ser N+2 para que 3671 tenga espacio para sus 2 semestres
                // y los prerequisitos tengan el valor_corchete correcto
                longitudEfectivaHasta3671 = longitudHasta3671 + 2;
            }
            
            // El cuatrisMinimos es el máximo entre el camino general y el camino efectivo hasta 3671
            return Math.max(longitudGeneral, longitudEfectivaHasta3671);
        }
        
        // Si 3671 no está presente, usar el camino más largo general
        return longitudGeneral;
    }

    calcularYGuardarLongitudes(semester = null) {
        this.datos_materias = {};
        const cuatrisMinimos = this.cuatrisMinimosHastaRecibirse(semester);
        const longitudes = {};

        // Calcular longitudes
        for (const id_materia in this.materias) {
            const longitud = this.encontrarCaminoMasLargoDesde(parseInt(id_materia)).length;
            if (!longitudes[longitud]) longitudes[longitud] = [];
            longitudes[longitud].push(parseInt(id_materia));
        }

        // Ordenar y calcular valores
        Object.keys(longitudes)
            .sort((a, b) => b - a)
            .forEach(longitud => {
                longitudes[longitud].forEach(id_materia => {
                    const cantMateriasAntes = this.encontrarCaminoMasLargoHasta(id_materia).length - 1;
                    const cantMateriasDespues = this.encontrarCaminoMasLargoDesde(id_materia).length - 1;
                    const valorCorchete = cuatrisMinimos - (cantMateriasAntes + cantMateriasDespues);
                    const cuatrimestre = cuatrisMinimos - parseInt(longitud) + 1;

                    this.datos_materias[id_materia] = {
                        cuatrimestre: cuatrimestre,
                        valor_corchete: valorCorchete,
                        valor_corchete_original: valorCorchete // Guardar el valor original para la condición de readiness
                    };
                });
            });

        // Ajuste especial para 3671: asegurar que su valor_corchete no sea mayor que cuatrisMinimos - 1
        // y que sea compatible con el cuatrimestre seleccionado (impar para Primero, par para Segundo)
        // IMPORTANTE: 3671 ocupa 2 cuatrimestres, así que si cuatrisMinimos es N, 3671 no puede tener
        // valor_corchete N (porque eso lo haría terminar en N+1, que sería después de cuatrisMinimos)
        // Por lo tanto, debe tener valor_corchete <= N-1, y además debe ser compatible con el semester
        if (this.datos_materias[3671]) {
            const valorCorchete3671 = this.datos_materias[3671].valor_corchete;
            
            // El valor_corchete de 3671 no puede ser igual a cuatrisMinimos
            // porque 3671 toma 2 cuatrimestres, así que terminaría después de cuatrisMinimos
            // Por lo tanto, debe ser como máximo cuatrisMinimos - 1
            let valorCorcheteAjustado = Math.min(valorCorchete3671, cuatrisMinimos - 1);
            
            // Además, debe ser compatible con el cuatrimestre seleccionado:
            // - Si semester es "Primero" (1): valor_corchete debe ser impar
            // - Si semester es "Segundo" (2): valor_corchete debe ser par
            if (semester !== null && semester !== undefined) {
                const semesterNum = parseInt(semester);
                if (semesterNum === 1) {
                    // Primero: debe ser impar
                    if (valorCorcheteAjustado % 2 === 0 && valorCorcheteAjustado > 0) {
                        valorCorcheteAjustado = valorCorcheteAjustado - 1;
                    }
                } else if (semesterNum === 2) {
                    // Segundo: debe ser par
                    if (valorCorcheteAjustado % 2 === 1) {
                        valorCorcheteAjustado = Math.max(0, valorCorcheteAjustado - 1);
                    }
                }
            }
            
            // Asegurar que no sea negativo
            valorCorcheteAjustado = Math.max(1, valorCorcheteAjustado);
            
            // Aplicar el ajuste
            if (valorCorcheteAjustado !== valorCorchete3671) {
                this.datos_materias[3671].valor_corchete = valorCorcheteAjustado;
                if (this.datos_materias[3671].valor_corchete_original !== undefined) {
                    this.datos_materias[3671].valor_corchete_original = valorCorcheteAjustado;
                }
                // Actualizar cuatrimestre para que coincida con el nuevo valor_corchete
                // Esto asegura que la condición de readiness funcione correctamente
                this.datos_materias[3671].cuatrimestre = valorCorcheteAjustado;
            }
        }
        
        // Si 3671 existe, verificar si está en el camino crítico y ajustar según corresponda
        // IMPORTANTE: 3671 ocupa DOS cuatrimestres (empieza en primero, termina en segundo)
        if (this.datos_materias[3671]) {
            const valorCorchete3671 = this.datos_materias[3671].valor_corchete;
            
            // Verificar si 3671 realmente afecta cuatrisMinimos comparando con el valor calculado
            // PASO 3 solo debe ejecutarse si cuatrisMinimos es mayor que la longitud del camino más largo sin 3671
            const caminoMasLargo = this.encontrarCaminoMasLargo();
            const longitudCaminoMasLargo = caminoMasLargo.length;
            
            // Calcular cuatrisMinimos sin considerar 3671: simplemente la longitud del camino más largo
            const cuatrisMinimosSin3671 = longitudCaminoMasLargo;
            
            // cuatrisMinimos ya está calculado con 3671 considerando sus efectos
            const cuatrisMinimosCon3671 = cuatrisMinimos;
            
            // PASO 3 solo debe ejecutarse si 3671 realmente incrementa cuatrisMinimos
            // Y además, solo si 3671 está explícitamente en el camino más largo
            // (no solo si el camino hasta 3671 es >= longest path)
            const estaEnCaminoMasLargo = caminoMasLargo.includes(3671);
            const realmenteAfectaCuatrisMinimos = estaEnCaminoMasLargo && cuatrisMinimosCon3671 > cuatrisMinimosSin3671;
            
            // PASO 3: Ajustar prerrequisitos de 3671 SOLO cuando 3671 realmente incrementa cuatrisMinimos
            // Como 3671 ocupa 2 semestres, sus prerrequisitos deben completarse 1 semestre antes
            // Pero solo cuando 3671 realmente afecta cuatrisMinimos (lo incrementa)
            if (realmenteAfectaCuatrisMinimos) {
                const materia3671 = this.materias[3671];
                const valorCorchete3671Final = this.datos_materias[3671].valor_corchete;
                for (const prereqId of materia3671.anteriores) {
                    if (this.materias[prereqId] && this.datos_materias[prereqId]) {
                        // El prerrequisito debe tener valor_corchete = valor_corchete_de_3671 - 1
                        // Esto asegura que el prereq se complete un semestre antes de que 3671 empiece
                        const valorCorcheteDeseado = valorCorchete3671Final - 1;
                        
                        if (valorCorcheteDeseado >= 1) {
                            this.datos_materias[prereqId].valor_corchete = valorCorcheteDeseado;
                            if (this.datos_materias[prereqId].valor_corchete_original !== undefined) {
                                this.datos_materias[prereqId].valor_corchete_original = valorCorcheteDeseado;
                            }
                            this.datos_materias[prereqId].cuatrimestre = valorCorcheteDeseado;
                        }
                    }
                }
            }
            
            // Ajustar materias no relacionadas SOLO si 3671 tiene el máximo valor_corchete (o está empatado)
            // Encontrar el máximo valor_corchete (usando valor_corchete_original para comparación justa)
            let maxValorCorchete = -Infinity;
            for (const id_materia in this.datos_materias) {
                const vc = this.datos_materias[id_materia].valor_corchete_original !== undefined 
                    ? this.datos_materias[id_materia].valor_corchete_original 
                    : this.datos_materias[id_materia].valor_corchete;
                if (vc > maxValorCorchete) {
                    maxValorCorchete = vc;
                }
            }
            
            const valorCorchete3671Original = this.datos_materias[3671].valor_corchete_original !== undefined
                ? this.datos_materias[3671].valor_corchete_original
                : valorCorchete3671;
            
            // Para PASO 1 y PASO 2 (ajustar materias no relacionadas), necesitamos que 3671 tenga el máximo valor_corchete
            // Y también que esté explícitamente en el camino más largo (misma verificación que PASO 3)
            if (valorCorchete3671Original === maxValorCorchete && estaEnCaminoCritico) {
                // PASO 1: Ajustar materias sin dependientes no relacionados (pueden postergarse)
                // Estas son las materias "finales" en cadenas independientes
                // Encontrar todas las materias que NO tienen a 3671 en su camino hacia adelante
                for (const id_materia in this.datos_materias) {
                    const id = parseInt(id_materia);
                    if (id === 3671) continue; // No modificar 3671 a sí mismo
                    
                    // Solo procesar si la materia está en el grafo actual (no completada)
                    if (!this.materias[id]) continue;
                    
                    // Verificar si 3671 es alcanzable desde esta materia
                    const tiene3671Adelante = this.esAlcanzableDesde(id, 3671);
                    
                    // Si NO tiene 3671 adelante, puede potencialmente ser postergada
                    if (!tiene3671Adelante) {
                        const materia = this.materias[id];
                        let puedePostergarse = true;
                        
                        // Verificar prerrequisitos pendientes: solo bloqueamos si el prereq está relacionado con 3671
                        // Si tiene prerequisitos no relacionados con 3671, puede postergarse (ambos se ajustarán juntos)
                        let tienePrerequisitosRelacionadosCon3671 = false;
                        for (const prereqId of materia.anteriores) {
                            if (this.materias[prereqId]) {
                                const prereqTiene3671Adelante = this.esAlcanzableDesde(prereqId, 3671);
                                if (prereqTiene3671Adelante) {
                                    tienePrerequisitosRelacionadosCon3671 = true;
                                    puedePostergarse = false;
                                    break;
                                }
                            }
                        }
                        
                        // Verificar dependientes: si tiene un dependiente pendiente que NO está relacionado con 3671,
                        // entonces NO puede postergarse directamente (se ajustará en PASO 2)
                        if (puedePostergarse) {
                            for (const dependienteId of materia.posteriores) {
                                if (this.materias[dependienteId]) {
                                    const dependienteTiene3671Adelante = this.esAlcanzableDesde(dependienteId, 3671);
                                    if (!dependienteTiene3671Adelante) {
                                        // Tiene dependiente no relacionado, no postergar ahora (se manejará en PASO 2)
                                        puedePostergarse = false;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // Solo postergar si no tiene dependientes no relacionados ni prerequisitos relacionados con 3671
                        // El ajuste depende del cuatrimestre seleccionado:
                        // - Si es "Primero" (1): +1 (3671 ocupará Primero y Segundo del mismo año)
                        // - Si es "Segundo" (2): +2 (3671 ocupará Primero y Segundo del año siguiente)
                        if (puedePostergarse) {
                            // Asegurar que semester es un número para la comparación
                            const semesterNum = semester !== null && semester !== undefined ? parseInt(semester) : null;
                            const ajuste = (semesterNum === 2) ? 2 : 1;
                            // El ajuste debe asegurar que la materia tenga valor_corchete de 2 (Primero) o 3 (Segundo)
                            // para que sus prerrequisitos puedan tener 1 o 2 respectivamente
                            // Si el valor inicial es 0, necesitamos +2 o +3 para llegar a 2 o 3
                            // Si el valor inicial es 1, necesitamos +1 o +2 para llegar a 2 o 3
                            const valorActual = this.datos_materias[id].valor_corchete;
                            const valorObjetivo = (semesterNum === 2) ? 3 : 2;
                            const ajusteNecesario = valorObjetivo - valorActual;
                            if (ajusteNecesario > 0) {
                                this.datos_materias[id].valor_corchete = valorObjetivo;
                            }
                        }
                    }
                }
                
                // PASO 2: Propagar hacia atrás en cadenas de prerrequisitos no relacionadas con 3671
                // Para materias que tienen dependientes no relacionados, su valor_corchete debe ser
                // uno menos que el mínimo valor_corchete de sus dependientes
                // Iterar hasta que no haya más cambios (para manejar cadenas largas)
                let cambioRealizado = true;
                let iteraciones = 0;
                const maxIteraciones = 20; // Prevenir loops infinitos
                
                while (cambioRealizado && iteraciones < maxIteraciones) {
                    cambioRealizado = false;
                    iteraciones++;
                    
                    for (const id_materia in this.datos_materias) {
                        const id = parseInt(id_materia);
                        if (id === 3671) continue;
                        if (!this.materias[id]) continue;
                        
                        const tiene3671Adelante = this.esAlcanzableDesde(id, 3671);
                        if (!tiene3671Adelante) {
                            // Esta materia no está relacionada con 3671
                            const materia = this.materias[id];
                            let minValorCorcheteDependientes = Infinity;
                            let tieneDependientesNoRelacionados = false;
                            
                            // Encontrar el mínimo valor_corchete entre sus dependientes no relacionados
                            // IMPORTANTE: Usar el valor_corchete ya ajustado en PASO 1
                            for (const dependienteId of materia.posteriores) {
                                if (this.materias[dependienteId]) {
                                    const dependienteTiene3671Adelante = this.esAlcanzableDesde(dependienteId, 3671);
                                    if (!dependienteTiene3671Adelante) {
                                        // El dependiente no está relacionado con 3671
                                        tieneDependientesNoRelacionados = true;
                                        // Usar valor_corchete (ya ajustado en PASO 1), no valor_corchete_original
                                        const valorCorcheteDependiente = this.datos_materias[dependienteId].valor_corchete;
                                        if (valorCorcheteDependiente < minValorCorcheteDependientes) {
                                            minValorCorcheteDependientes = valorCorcheteDependiente;
                                        }
                                    }
                                }
                            }
                            
                            // Si tiene dependientes no relacionados, su valor_corchete debe ser uno menos
                            // que el mínimo valor_corchete de sus dependientes
                            if (tieneDependientesNoRelacionados && minValorCorcheteDependientes !== Infinity) {
                                const valorCorcheteDeseado = minValorCorcheteDependientes - 1;
                                // Comparar con valor_corchete actual (no solo si es menor)
                                if (this.datos_materias[id].valor_corchete !== valorCorcheteDeseado) {
                                    // Ajustar para que tenga el valor_corchete correcto
                                    this.datos_materias[id].valor_corchete = valorCorcheteDeseado;
                                    // También actualizar valor_corchete_original
                                    if (this.datos_materias[id].valor_corchete_original !== undefined) {
                                        this.datos_materias[id].valor_corchete_original = valorCorcheteDeseado;
                                    }
                                    // Actualizar cuatrimestre para que coincida con el nuevo valor_corchete
                                    this.datos_materias[id].cuatrimestre = valorCorcheteDeseado;
                                    cambioRealizado = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    ajustarCuatrimestre3671YPropagar(respuesta) {
        // Solo ajustar si el cuatrimestre deseado es 1 (Primero)
        if (respuesta !== 1) return;
        
        const cuatrisMinimos = this.cuatrisMinimosHastaRecibirse();
        const datos = this.datos_materias;
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

    ajustarHaciaAtras(n, datos) {
        datos[3671].cuatrimestre = n - 1;
        datos[3671].valor_corchete--;
        // También actualizar valor_corchete_original si existe
        if (datos[3671].valor_corchete_original !== undefined) {
            datos[3671].valor_corchete_original--;
        }
        let cuatriActual = n - 1;
        let materiasAMover = [3671];

        while (materiasAMover.length > 0) {
            const nuevasAMover = [];
            for (const id_materia in this.materias) {
                if (datos[id_materia].cuatrimestre === cuatriActual) {
                    if (materiasAMover.some(materia => 
                        this.materias[id_materia].posteriores.has(materia))) {
                        datos[id_materia].cuatrimestre--;
                        datos[id_materia].valor_corchete--;
                        // También actualizar valor_corchete_original si existe
                        if (datos[id_materia].valor_corchete_original !== undefined) {
                            datos[id_materia].valor_corchete_original--;
                        }
                        nuevasAMover.push(parseInt(id_materia));
                    }
                }
            }
            materiasAMover = nuevasAMover;
            cuatriActual--;
        }
    }

    ajustarHaciaAdelante(n, datos) {
        datos[3671].cuatrimestre = n + 1;
        let cuatriActual = n - 1;
        let materiasAMover = [];

        // Buscar materias que dependen de 3671
        for (const id_materia in this.materias) {
            if (datos[id_materia].cuatrimestre === cuatriActual && 
                this.materias[id_materia].posteriores.has(3671)) {
                datos[id_materia].cuatrimestre++;
                datos[id_materia].valor_corchete++;
                // También actualizar valor_corchete_original si existe
                if (datos[id_materia].valor_corchete_original !== undefined) {
                    datos[id_materia].valor_corchete_original++;
                }
                materiasAMover.push(parseInt(id_materia));
            }
        }

        while (materiasAMover.length > 0) {
            const nuevasAMover = [];
            cuatriActual--;
            for (const id_materia in this.materias) {
                if (datos[id_materia].cuatrimestre === cuatriActual) {
                    if (materiasAMover.some(materia => 
                        this.materias[id_materia].posteriores.has(materia))) {
                        datos[id_materia].cuatrimestre++;
                        datos[id_materia].valor_corchete++;
                        // También actualizar valor_corchete_original si existe
                        if (datos[id_materia].valor_corchete_original !== undefined) {
                            datos[id_materia].valor_corchete_original++;
                        }
                        nuevasAMover.push(parseInt(id_materia));
                    }
                }
            }
            materiasAMover = nuevasAMover;
        }
    }

    cargarMateriasDesdeTexto(texto, materiasCursadas = []) {
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

    cargarNombresDesdeTexto(texto) {
        texto.trim().split('\n').forEach(linea => {
            if (!linea.trim()) return;
            // Match any whitespace (tabs or spaces) between the ID and name
            const [_, id, nombre] = linea.trim().match(/^(\d+)\s+(.+)$/);
            if (id && nombre) {
                const idMateria = parseInt(id);
                if (this.materias[idMateria]) {
                    this.materias[idMateria].nombre = nombre.trim();
                }
            }
        });
    }

    materiasProximoCuatri(cantidad) {
        const materiasEnCuatri = [];
        for (const [id_materia, datos] of Object.entries(this.datos_materias)) {
            const id = parseInt(id_materia);
            
            // Verificar que la materia esté en el grafo (disponible)
            if (!this.materias[id]) continue;
            
            // 3671 se manejará en main.js basado en el semester seleccionado
            
            // Verificar que todas las prerrequisitos estén satisfechas
            // (si la materia tiene prerrequisitos que están en el grafo, no puede ser tomada aún)
            const materia = this.materias[id];
            
            // Verificar cada prerequisito: debe NO estar en el grafo (ya completado)
            let todasPrerequisitosCompletadas = true;
            for (const prereqId of materia.anteriores) {
                // Si el prereq está en el grafo, significa que NO está completado, así que no podemos tomar esta materia
                if (this.materias[prereqId]) {
                    todasPrerequisitosCompletadas = false;
                    break;
                }
            }
            
            // Solo incluir si todas las prerrequisitos están completadas Y cumple la condición de cuatrimestre
            // Usar valor_corchete_original para la condición de readiness (no afectado por el ajuste de 3671)
            // pero valor_corchete para sorting (afectado por el ajuste)
            const valorCorcheteParaReadiness = datos.valor_corchete_original !== undefined 
                ? datos.valor_corchete_original 
                : datos.valor_corchete;
            
            // La condición original era: datos.cuatrimestre === datos.valor_corchete
            // Usamos valor_corchete_original para que el ajuste no afecte la disponibilidad
            if (todasPrerequisitosCompletadas && datos.cuatrimestre === valorCorcheteParaReadiness) {
                materiasEnCuatri.push([id, datos.valor_corchete, datos.cuatrimestre]);
            }
        }
        materiasEnCuatri.sort((a, b) => a[1] - b[1]);

        return this.procesarMateriasSeleccionadas(materiasEnCuatri, cantidad);
    }

    procesarMateriasSeleccionadas(materiasEnCuatri, cantidad) {
        const resultado = {
            materias_fijas: [],
            materias_opcionales: [],
            cantidad_a_elegir: 0
        };

        if (materiasEnCuatri.length === 0) return resultado;

        let i = 0;
        const seleccionadas = [];
        while (i < materiasEnCuatri.length && seleccionadas.length < cantidad) {
            seleccionadas.push(materiasEnCuatri[i]);
            i++;
        }

        if (i < materiasEnCuatri.length) {
            const ultimoValor = seleccionadas[seleccionadas.length - 1][1];
            const empate = [];
            
            while (seleccionadas.length > 0 && 
                   seleccionadas[seleccionadas.length - 1][1] === ultimoValor) {
                empate.unshift(seleccionadas.pop());
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

    procesarResultadosConEmpate(resultado, seleccionadas, empate, cantidad) {
        if (seleccionadas.length + empate.length <= cantidad) {
            this.agregarMateriasAlResultado(resultado.materias_fijas, 
                                          [...seleccionadas, ...empate]);
        } else {
            this.agregarMateriasAlResultado(resultado.materias_fijas, seleccionadas);
            resultado.cantidad_a_elegir = cantidad - seleccionadas.length;
            this.agregarMateriasAlResultado(resultado.materias_opcionales, empate);
        }
    }

    agregarMateriasAlResultado(lista, materias) {
        materias.forEach(([id_materia, valor_corchete]) => {
            const nombre = this.materias[id_materia].nombre;
            lista.push(`[${valor_corchete}] ${nombre} (${id_materia})`);
        });
    }

    puedoCursarEnCuatri(n) {
        const materiasEnCuatri = [];
        for (const [id_materia, datos] of Object.entries(this.datos_materias)) {
            const id = parseInt(id_materia);
            
            // Verificar que la materia esté en el grafo (disponible)
            if (!this.materias[id]) continue;
            
            // Verificar que todas las prerrequisitos estén satisfechas
            const materia = this.materias[id];
            let todasPrerequisitosCompletadas = true;
            for (const prereqId of materia.anteriores) {
                // Si el prereq está en el grafo, significa que NO está completado
                if (this.materias[prereqId]) {
                    todasPrerequisitosCompletadas = false;
                    break;
                }
            }
            
            // Usar valor_corchete_original para la condición de readiness
            const valorCorcheteParaReadiness = datos.valor_corchete_original !== undefined 
                ? datos.valor_corchete_original 
                : datos.valor_corchete;
            
            // Solo incluir si todas las prerrequisitos están completadas Y cumple la condición
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

// Datos estáticos
const listado = `
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

/*Las electivas son 3599, 3677, 3678 y 3679; tienen las mismas correlativas.*/

const tabla_nombres = `
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
