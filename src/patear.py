class Materia:
    def __init__(self, id_materia):
        self.id = id_materia
        self.anteriores = set()  # IDs de materias anteriores (prerrequisitos)
        self.posteriores = set() # IDs de materias posteriores (materias que dependen de esta)
        self.nombre = ""         # Nombre de la materia

class PlanDeEstudios:
    def __init__(self):
        self.materias = {}  # id_materia: Materia

    def agregar_materia(self, id_materia):
        if id_materia not in self.materias:
            self.materias[id_materia] = Materia(id_materia)

    def agregar_relacion(self, id_antecesora, id_posterior):
        self.agregar_materia(id_antecesora)
        self.agregar_materia(id_posterior)
        self.materias[id_antecesora].posteriores.add(id_posterior)
        self.materias[id_posterior].anteriores.add(id_antecesora)

    def mostrar_plan(self):
        for id_materia, materia in self.materias.items():
            print(f"Materia {id_materia}:")
            print(f"  Anteriores: {sorted(materia.anteriores)}")
            print(f"  Posteriores: {sorted(materia.posteriores)}")
            print()
    
    def encontrar_camino_mas_largo_desde(self, id_materia):
        if id_materia not in self.materias:
            return []
        
        if self.materias[id_materia].posteriores == set():
            return [id_materia]
        
        longitud_maxima = 0
        camino_maximo = []
        
        for posterior in self.materias[id_materia].posteriores:
            camino = self.encontrar_camino_mas_largo_desde(posterior)
            if len(camino) > longitud_maxima:
                longitud_maxima = len(camino)
                camino_maximo = camino
    
        return [id_materia] + camino_maximo
    
    def encontrar_camino_mas_largo(self):
        camino_maximo = []
        for id_materia in self.materias:
            camino = self.encontrar_camino_mas_largo_desde(id_materia)
            if len(camino) > len(camino_maximo):
                camino_maximo = camino
        return camino_maximo
    
    def cuatris_minimos_hasta_recibirse(self):
        return len(self.encontrar_camino_mas_largo())
    
    def encontrar_camino_mas_largo_hasta(self, id_materia):
        if id_materia not in self.materias:
            return []
        
        if self.materias[id_materia].anteriores == set():
            return [id_materia]
        
        longitud_maxima = 0
        camino_maximo = []
        
        for anterior in self.materias[id_materia].anteriores:
            camino = self.encontrar_camino_mas_largo_hasta(anterior)
            if len(camino) > longitud_maxima:
                longitud_maxima = len(camino)
                camino_maximo = camino
    
        return [id_materia] + camino_maximo
    
    def mostrar_longitudes_camino_mas_largo(self):
        longitudes = {}
        for id_materia in self.materias:
            longitud = len(self.encontrar_camino_mas_largo_desde(id_materia))
            if longitud not in longitudes:
                longitudes[longitud] = []
            longitudes[longitud].append(id_materia)
        cuatris_minimos = self.cuatris_minimos_hasta_recibirse()
        for longitud in sorted(longitudes.keys(), reverse=True):
            # Usa el ajuste si existe
            materias_con_valor = []
            for id_materia in longitudes[longitud]:
                cant_materias_antes = len(self.encontrar_camino_mas_largo_hasta(id_materia))-1
                cant_materias_despues = len(self.encontrar_camino_mas_largo_desde(id_materia))-1
                valor_corchete = cuatris_minimos-(cant_materias_antes+cant_materias_despues)
                if hasattr(self, 'ajustes_cuatrimestre'):
                    cuatrimestre = self.ajustes_cuatrimestre.get(id_materia, cuatris_minimos-longitud+1)
                else:
                    cuatrimestre = cuatris_minimos-longitud+1
                materias_con_valor.append((id_materia, valor_corchete, cuatrimestre))
            materias_con_valor.sort(key=lambda x: x[1])
            print(f"Cuatrimestre {materias_con_valor[0][2]}:")
            for id_materia, valor_corchete, cuatrimestre in materias_con_valor:
                print(f"{id_materia} [{valor_corchete}]")
            print()

    def puedo_cursar_en_cuatri(self, n):
        """
        Devuelve una lista de materias que se pueden cursar en el cuatrimestre n,
        según la condición cuatrimestre - valor_corchete + 1 == n,
        usando los valores guardados y mostrando el nombre.
        """
        materias_en_cuatri = []
        result = []
        for id_materia, datos in self.datos_materias.items():
            cuatrimestre = datos['cuatrimestre']
            valor_corchete = datos['valor_corchete']
            if cuatrimestre - valor_corchete + 1 == n:
                materias_en_cuatri.append((id_materia, valor_corchete, cuatrimestre))
        if materias_en_cuatri:
            for id_materia, valor_corchete, cuatrimestre in sorted(materias_en_cuatri, key=lambda x: x[1]):
                nombre = self.materias[id_materia].nombre
                result.append(f"{id_materia}- {nombre} [{valor_corchete}]")
        return result

    def cargar_materias_desde_texto(self, texto, materias_cursadas=None):
        if materias_cursadas is None:
            materias_cursadas = set()
        else:
            materias_cursadas = set(materias_cursadas)
        for linea in texto.strip().split('\n'):
            if not linea.strip():
                continue
            partes = linea.split(':')
            id_materia = int(partes[0].strip())
            if id_materia in materias_cursadas:
                continue
            self.agregar_materia(id_materia)
            if len(partes) > 1 and partes[1].strip():
                correlativas = [int(x.strip()) for x in partes[1].split(',') if x.strip()]
                for correlativa in correlativas:
                    if correlativa in materias_cursadas:
                        continue
                    self.agregar_materia(correlativa)
                    self.agregar_relacion(correlativa, id_materia)

    def cargar_nombres_desde_texto(self, texto):
        """
        Carga los nombres de las materias desde un string con formato 'ID Nombre'.
        """
        for linea in texto.strip().split('\n'):
            if not linea.strip():
                continue
            partes = linea.strip().split(None, 1)  # <-- Cambiado aquí
            if len(partes) == 2:
                id_materia = int(partes[0])
                nombre = partes[1].strip()
                if id_materia in self.materias:
                    self.materias[id_materia].nombre = nombre

    def calcular_y_guardar_longitudes(self):
        """
        Calcula y guarda en memoria el cuatrimestre y valor_corchete de cada materia.
        """
        self.datos_materias = {}  # id_materia: {'cuatrimestre': int, 'valor_corchete': int}
        cuatris_minimos = self.cuatris_minimos_hasta_recibirse()
        longitudes = {}
        for id_materia in self.materias:
            longitud = len(self.encontrar_camino_mas_largo_desde(id_materia))
            if longitud not in longitudes:
                longitudes[longitud] = []
            longitudes[longitud].append(id_materia)
        for longitud in sorted(longitudes.keys(), reverse=True):
            for id_materia in longitudes[longitud]:
                cant_materias_antes = len(self.encontrar_camino_mas_largo_hasta(id_materia))-1
                cant_materias_despues = len(self.encontrar_camino_mas_largo_desde(id_materia))-1
                valor_corchete = cuatris_minimos-(cant_materias_antes+cant_materias_despues)
                cuatrimestre = cuatris_minimos-longitud+1
                self.datos_materias[id_materia] = {
                    'cuatrimestre': cuatrimestre,
                    'valor_corchete': valor_corchete
                }

    def ajustar_cuatrimestre_3671_y_propagar(self, respuesta):
        """
        Ajusta el cuatrimestre de 3671 y propaga los cambios hacia atrás según la lógica dada.
        """
        cuatris_minimos = self.cuatris_minimos_hasta_recibirse()
        datos = self.datos_materias
        n = datos[3671]['cuatrimestre']
        valor_corchete_3671 = datos[3671]['valor_corchete']

        paridad_deseada = respuesta % 2
        paridad_actual = n % 2

        ajuste = 0
        if paridad_actual != paridad_deseada:
            if valor_corchete_3671 == 1:
                ajuste = 1
            else:
                ajuste = -1
                valor_corchete_3671 -= 1

        if ajuste == 0:
            return  # No hay nada que ajustar

        # Realizar el ajuste y propagar
        if ajuste == -1:
            # 3671 pasa de n a n-1
            datos[3671]['cuatrimestre'] = n-1
            datos[3671]['valor_corchete'] -= 1
            # Propagar hacia atrás
            cuatri_actual = n-1
            materias_a_mover = [3671]
            while materias_a_mover:
                nuevas_a_mover = []
                for id_materia in self.materias:
                    if datos[id_materia]['cuatrimestre'] == cuatri_actual:
                        # Si alguna de sus posteriores está en materias_a_mover, debe moverse
                        if any(post in materias_a_mover for post in self.materias[id_materia].posteriores):
                            datos[id_materia]['cuatrimestre'] -= 1
                            datos[id_materia]['valor_corchete'] -= 1
                            nuevas_a_mover.append(id_materia)
                materias_a_mover = nuevas_a_mover
                cuatri_actual -= 1
        elif ajuste == 1:
            # 3671 pasa de n a n+1
            datos[3671]['cuatrimestre'] = n+1
            # Propagar hacia atrás
            cuatri_actual = n-1
            materias_a_mover = []
            # Buscar materias en cuatri_actual cuya posterior es 3671
            for id_materia in self.materias:
                if datos[id_materia]['cuatrimestre'] == cuatri_actual and 3671 in self.materias[id_materia].posteriores:
                    datos[id_materia]['cuatrimestre'] += 1
                    datos[id_materia]['valor_corchete'] += 1
                    materias_a_mover.append(id_materia)
            # Propagar hacia atrás
            while materias_a_mover:
                nuevas_a_mover = []
                cuatri_actual -= 1
                for id_materia in self.materias:
                    if datos[id_materia]['cuatrimestre'] == cuatri_actual:
                        # Si alguna de sus posteriores está en materias_a_mover, debe moverse
                        if any(post in materias_a_mover for post in self.materias[id_materia].posteriores):
                            datos[id_materia]['cuatrimestre'] += 1
                            datos[id_materia]['valor_corchete'] += 1
                            nuevas_a_mover.append(id_materia)
                materias_a_mover = nuevas_a_mover

    def mostrar_menu_guardado(self):
        """
        Devuelve una lista estructurada del menú usando los valores guardados en memoria.
        """
        resultado = []
        cuatris = {}
        for id_materia, datos in self.datos_materias.items():
            cuatri = datos['cuatrimestre']
            if cuatri not in cuatris:
                cuatris[cuatri] = []
            cuatris[cuatri].append((id_materia, datos['valor_corchete']))
        
        for cuatri in sorted(cuatris.keys()):
            materias_cuatri = []
            for id_materia, valor_corchete in sorted(cuatris[cuatri], key=lambda x: x[1]):
                nombre = self.materias[id_materia].nombre
                materias_cuatri.append(f"{id_materia}- {nombre} [{valor_corchete}]")
            resultado.append({
                'cuatrimestre': cuatri,
                'materias': materias_cuatri
            })
        return resultado
    
    def materias_proximo_cuatri(self, cantidad):
        materias_en_cuatri = []
        for id_materia, datos in self.datos_materias.items():
            cuatrimestre = datos['cuatrimestre']
            valor_corchete = datos['valor_corchete']
            if cuatrimestre == valor_corchete:
                materias_en_cuatri.append((id_materia, valor_corchete, cuatrimestre))
        materias_en_cuatri.sort(key=lambda x: x[1])

        resultado = {
            'materias_fijas': [],
            'materias_opcionales': [],
            'cantidad_a_elegir': 0
        }

        if materias_en_cuatri:
            i = 0
            seleccionadas = []
            while i < len(materias_en_cuatri):
                if len(seleccionadas) < cantidad:
                    seleccionadas.append(materias_en_cuatri[i])
                    i += 1
                else:
                    ultimo_valor = seleccionadas[-1][1]
                    empate = []
                    while seleccionadas and seleccionadas[-1][1] == ultimo_valor:
                        empate.insert(0, seleccionadas.pop())
                    while i < len(materias_en_cuatri) and materias_en_cuatri[i][1] == ultimo_valor:
                        empate.append(materias_en_cuatri[i])
                        i += 1
                    
                    if len(seleccionadas) + len(empate) <= cantidad:
                        for id_materia, valor_corchete, cuatrimestre in seleccionadas + empate:
                            nombre = self.materias[id_materia].nombre
                            resultado['materias_fijas'].append(f"{id_materia}- {nombre} [{valor_corchete}]")
                    else:
                        for id_materia, valor_corchete, cuatrimestre in seleccionadas:
                            nombre = self.materias[id_materia].nombre
                            resultado['materias_fijas'].append(f"{id_materia}- {nombre} [{valor_corchete}]")
                        resultado['cantidad_a_elegir'] = cantidad - len(seleccionadas)
                        for id_materia, valor_corchete, cuatrimestre in empate:
                            nombre = self.materias[id_materia].nombre
                            resultado['materias_opcionales'].append(f"{id_materia}- {nombre} [{valor_corchete}]")
                    return resultado
            for id_materia, valor_corchete, cuatrimestre in seleccionadas:
                nombre = self.materias[id_materia].nombre
                resultado['materias_fijas'].append(f"{id_materia}- {nombre} [{valor_corchete}]")
        return resultado
    
plan = PlanDeEstudios()
listado = """
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
912: 911
"""

tabla_nombres = """
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
904     Inglés IV
"""
"""
materias_ya_cursadas = [x for x in range(3621, 3633)] + [3633, 3639, 3635, 3638] + [901, 902, 903, 904, 911, 912]

plan.cargar_materias_desde_texto(listado, materias_ya_cursadas)
plan.cargar_nombres_desde_texto(tabla_nombres)
plan.calcular_y_guardar_longitudes()
respuesta = int(input("¿En qué cuatrimestre estás? (1 o 2): "))
plan.ajustar_cuatrimestre_3671_y_propagar(respuesta)
plan.mostrar_menu_guardado()
#plan.puedo_cursar_en_cuatri(1)
#plan.materias_proximo_cuatri(5)
"""