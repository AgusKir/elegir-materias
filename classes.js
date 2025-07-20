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

    cuatrisMinimosHastaRecibirse() {
        return this.encontrarCaminoMasLargo().length;
    }

    calcularYGuardarLongitudes() {
        this.datos_materias = {};
        const cuatrisMinimos = this.cuatrisMinimosHastaRecibirse();
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
                        valor_corchete: valorCorchete
                    };
                });
            });
    }

    ajustarCuatrimestre3671YPropagar(respuesta) {
        const cuatrisMinimos = this.cuatrisMinimosHastaRecibirse();
        const datos = this.datos_materias;
        const n = datos[3671].cuatrimestre;
        let valorCorchete3671 = datos[3671].valor_corchete;

        const paridadDeseada = respuesta % 2;
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
            if (datos.cuatrimestre === datos.valor_corchete) {
                materiasEnCuatri.push([parseInt(id_materia), datos.valor_corchete, datos.cuatrimestre]);
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
            lista.push(`${id_materia}- ${nombre} [${valor_corchete}]`);
        });
    }

    puedoCursarEnCuatri(n) {
        const materiasEnCuatri = [];
        for (const [id_materia, datos] of Object.entries(this.datos_materias)) {
            if (datos.cuatrimestre - datos.valor_corchete + 1 === n) {
                materiasEnCuatri.push([parseInt(id_materia), datos.valor_corchete, datos.cuatrimestre]);
            }
        }

        return materiasEnCuatri
            .sort((a, b) => a[1] - b[1])
            .map(([id_materia, valor_corchete]) => 
                `${id_materia}- ${this.materias[id_materia].nombre} [${valor_corchete}]`);
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
3641: 3636
3642: 3626, 3637
3643: 3634, 3638
3644: 3632
3680: 3623, 3625, 3626, 3630, 3632, 3635, 3636, 3638
3645: 3627
3646: 3633, 3640
3647: 3642
3648: 3636, 3642
3649: 3638
3650: 3643, 3638, 3635
3675: 3642
3651: 3645, 3639, 3621
3652: 3646, 3641
3653: 3648
3654: 3649, 3645, 3640
3655: 3650
3656: 3651, 3641
3657: 3646
3658: 3654, 3646
3659: 3647, 3644, 3653
3660: 3654
3661: 3651, 3650, 3644
3662: 3651
3663: 3657
3664: 3651, 3646
3665: 3659, 3652
3666: 3652, 3655, 3649
3667: 3647
3668: 3656, 3664
3669: 3661
3670: 3664, 3656
3671: 3667, 3659, 3661, 3660, 3656
3677: 3663, 3661, 3658
3678: 3662, 3666
3679: 3665, 3664
901:
902: 901
903: 902
904: 903
911:
912: 911`;

const tabla_nombres = `
3621	Matemática Discreta
3622	Análisis Matemático I
3623	Programación Inicial
3624	Introducción a los Sistemas de Información
3625	Sistemas de Numeración
3626	Principios de Calidad de Software
3627	Álgebra Y Geometría Analítica I
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
3639	Análisis Matemático III
3640	Algoritmos y Estructuras de Datos
3641	Bases de Datos Aplicadas
3642	Principios de Diseño de Sistemas
3643	Redes de Computadoras
3644	Gestión de las Organizaciones
3676	Responsabilidad Social Universitaria
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
3677	Lenguaje Orientado a Negocios
3678	Tecnologías en Seguridad
3679    Visión Artificial
3680    Taller de Integración
911     Computación I
912     Computación II
901     Inglés I
902     Inglés II
903     Inglés III
904     Inglés IV`;
