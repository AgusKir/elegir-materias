document.addEventListener('DOMContentLoaded', function() {
    const calculateButton = document.getElementById('calculate-button');
    const subjectChecklist = document.getElementById('completed-subjects');
    const subjectCountDropdown = document.getElementById('num-subjects');
    const semesterDropdown = document.getElementById('semester');
    const resultsDiv = document.getElementById('results');

    // Modo oscuro/light toggle
    const body = document.body;
    const darkToggle = document.getElementById('darkmode-toggle');
    const darkToggleImg = darkToggle.querySelector('img');
    // Inicializar modo según localStorage o default oscuro
    const savedMode = localStorage.getItem('colorMode');
    function updateToggleIcon() {
        if (body.classList.contains('dark-mode')) {
            darkToggleImg.src = 'assets/dark-mode-toggle-icon.svg';
            darkToggleImg.alt = 'Cambiar a modo claro';
        } else {
            darkToggleImg.src = 'assets/light-mode-toggle-icon.svg';
            darkToggleImg.alt = 'Cambiar a modo oscuro';
        }
    }
    if (savedMode === 'light') {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    } else {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
    }
    updateToggleIcon();
    darkToggle.addEventListener('click', function() {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('colorMode', 'light');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('colorMode', 'dark');
        }
        updateToggleIcon();
    });

    // Save checkboxes on change
    subjectChecklist.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            const checked = Array.from(subjectChecklist.querySelectorAll('input:checked'))
                .map(input => parseInt(input.value));
            localStorage.setItem('completedSubjects', JSON.stringify(checked));
        }
    });

    // --- Notificación superior reusable ---
    function showTopNotification(message, durationMs) {
        // Evitar múltiples instancias simultáneas
        let existing = document.querySelector('.top-notification');
        if (existing) existing.remove();

        const notif = document.createElement('div');
        notif.className = 'top-notification';
        notif.innerHTML = `<div class="notif-message">${message}</div>`;
        const close = document.createElement('button');
        close.className = 'close-btn';
        close.setAttribute('aria-label', 'Cerrar');
        close.textContent = '×';
        close.onclick = () => {
            if (rafId) cancelAnimationFrame(rafId);
            notif.remove();
        };
        const progress = document.createElement('div');
        progress.className = 'progress-bar';
        const fill = document.createElement('div');
        fill.className = 'progress-fill';
        progress.appendChild(fill);
        notif.appendChild(close);
        notif.appendChild(progress);
        document.body.appendChild(notif);

        const start = performance.now();
        const total = durationMs;
        let rafId;
        function tick(now) {
            const elapsed = now - start;
            const remaining = Math.max(0, total - elapsed);
            const pct = (remaining / total) * 100;
            fill.style.width = pct + '%';
            if (remaining <= 0) {
                notif.remove();
                return;
            }
            rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);
    }

    const resetButton = document.getElementById('reset-button');

    function initializeSubjectControls() {
        subjectChecklist.querySelectorAll('.subject-label').forEach(subjectDiv => {
            // Obtener el checkbox y el nombre original
            const checkbox = subjectDiv.querySelector('input[type="checkbox"]');
            const subjectText = subjectDiv.getAttribute('data-nombre');
            const id = subjectText.split(')')[0].replace('(', '').trim();
            // Limpiar el div
            subjectDiv.innerHTML = '';
            // Volver a agregar el checkbox (oculto)
            checkbox.style.display = 'none';
            subjectDiv.appendChild(checkbox);

            // Crear la fila visual
            const row = document.createElement('div');
            row.className = 'subject-row';

            const contentDiv = document.createElement('div');
            contentDiv.textContent = subjectText;
            row.appendChild(contentDiv);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'subject-buttons';

            // Configuración de botones: especial para 3680 (Taller de Integración)
            const buttonConfigs = (id === '3680')
                ? [
                    { status: 'No la voy a cursar', check: true, className: 'subject-status-final-ignorar', btnClass: 'status-button status-final-ignorar' },
                    { status: 'Aprobada', check: true, className: 'subject-status-aprobada', btnClass: 'status-button status-aprobada' },
                    { status: 'No cursada', check: false, className: 'subject-status-no-cursada', btnClass: 'status-button status-no-cursada' }
                  ]
                : [
                    { status: 'Aprobada', check: true, className: 'subject-status-aprobada', btnClass: 'status-button status-aprobada' },
                    { status: 'Final', check: true, className: 'subject-status-final', btnClass: 'status-button status-final' },
                    { status: 'Final (ignorar)', check: true, className: 'subject-status-final-ignorar', btnClass: 'status-button status-final-ignorar' },
                    { status: 'No cursada', check: false, className: 'subject-status-no-cursada', btnClass: 'status-button status-no-cursada' }
                  ];

            buttonConfigs.forEach(({ status, check, className, btnClass }) => {
                const button = document.createElement('button');
                button.textContent = status;
                button.type = 'button';
                button.className = btnClass;
                button.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Cambiar clase de color
                    row.className = 'subject-row ' + className;
                    // Guardar estado en localStorage
                    if (status === 'No cursada') {
                        localStorage.removeItem(`subject-status-${id}`);
                        checkbox.checked = false;
                    } else {
                        localStorage.setItem(`subject-status-${id}`, status);
                        checkbox.checked = true;
                    }
                    // Actualizar checkboxes en localStorage
                    const checked = Array.from(subjectChecklist.querySelectorAll('input[type="checkbox"]:checked'))
                        .map(input => parseInt(input.value));
                    localStorage.setItem('completedSubjects', JSON.stringify(checked));
                    // ACTUALIZAR CONTADORES EN TIEMPO REAL
                    if (typeof actualizarContadoresMaterias === 'function') actualizarContadoresMaterias();

                    // Notificación al aprobar 3622 (Análisis Matemático I)
                    if (status === 'Aprobada' && id === '3622') {
                        if (!sessionStorage.getItem('notif-quick-select-shown')) {
                            showTopNotification('Recordá que podés marcar al instante todas las materias de un año con las cajas que están abajo de la tabla :)', 15000);
                            sessionStorage.setItem('notif-quick-select-shown', '1');
                        } else {
                            showTopNotification('Recordá que podés marcar al instante todas las materias de un año con las cajas que están abajo de la tabla :)', 15000);
                        }
                    }
                };
                buttonsDiv.appendChild(button);
            });

            row.appendChild(buttonsDiv);
            subjectDiv.appendChild(row);
            subjectDiv.style.display = 'block';
            subjectDiv.style.width = '100%';
            row.style.width = '100%';

            // Valor por defecto para Taller de Integración: "No la voy a cursar"
            if (id === '3680') {
                const current = localStorage.getItem(`subject-status-${id}`);
                if (!current) {
                    localStorage.setItem(`subject-status-${id}`, 'No la voy a cursar');
                    row.className = 'subject-row subject-status-final-ignorar';
                    checkbox.checked = true;
                }
            }
        });

        // Restaurar colores y checkboxes desde localStorage
        subjectChecklist.querySelectorAll('.subject-label').forEach(subjectDiv => {
            const checkbox = subjectDiv.querySelector('input[type="checkbox"]');
            const subjectText = subjectDiv.getAttribute('data-nombre');
            const id = subjectText.split(')')[0].replace('(', '').trim();
            const row = subjectDiv.querySelector('.subject-row');
            const status = localStorage.getItem(`subject-status-${id}`);
            if (row) {
                if (status === 'Aprobada') {
                    row.className = 'subject-row subject-status-aprobada';
                    checkbox.checked = true;
                } else if (status === 'Final') {
                    row.className = 'subject-row subject-status-final';
                    checkbox.checked = true;
                } else if (status === 'Final (ignorar)') {
                    row.className = 'subject-row subject-status-final-ignorar';
                    checkbox.checked = false;
                } else if (status === 'No la voy a cursar') {
                    row.className = 'subject-row subject-status-final-ignorar';
                    checkbox.checked = true;
                } else {
                    row.className = 'subject-row subject-status-no-cursada';
                    checkbox.checked = false;
                }
            }
        });
    }

    resetButton.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que querés resetear todas las materias seleccionadas?')) {
            localStorage.clear();
            subjectChecklist.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
                const row = checkbox.closest('.subject-row');
                if (row) {
                    row.className = 'subject-row';
                }
            });
            initializeSubjectControls();
        }
    });

    // Initialize subject controls
    initializeSubjectControls();

    // Lógica de selección rápida
    function setMateriasEstado(ids, estado) {
        ids.forEach(id => {
            if (estado === 'Aprobada') {
                localStorage.setItem(`subject-status-${id}`, 'Aprobada');
            } else {
                localStorage.removeItem(`subject-status-${id}`);
            }
        });
        initializeSubjectControls();
        if (typeof actualizarContadoresMaterias === 'function') actualizarContadoresMaterias();
    }
    function getMateriasEstado(ids) {
        return ids.every(id => localStorage.getItem(`subject-status-${id}`) === 'Aprobada');
    }
    // IDs de cada grupo
    const idsPrimero = Array.from({length: 3632-3621+1}, (_,i)=>3621+i);
    const idsSegundo = Array.from({length: 3644-3633+1}, (_,i)=>3633+i).concat([3676]);
    const idsTercero = Array.from({length: 3655-3645+1}, (_,i)=>3645+i).concat([3675]);
    const idsCuarto = Array.from({length: 3667-3656+1}, (_,i)=>3656+i);
    const idsTransversales = [901,902,903,904,911,912];
    const idsQuinto = [3668, 3669, 3670, 3671, 3677, 3678, 3679];
    // Elementos
    const quickPrimero = document.getElementById('quick-primero');
    const quickSegundo = document.getElementById('quick-segundo');
    const quickTercero = document.getElementById('quick-tercero');
    const quickCuarto = document.getElementById('quick-cuarto');
    const quickTransversales = document.getElementById('quick-transversales');
    const quickQuinto = document.getElementById('quick-quinto');
    // Handlers
    quickPrimero.addEventListener('change', function() {
        setMateriasEstado(idsPrimero, this.checked ? 'Aprobada' : 'No cursada');
    });
    quickSegundo.addEventListener('change', function() {
        setMateriasEstado(idsSegundo, this.checked ? 'Aprobada' : 'No cursada');
    });
    quickTercero.addEventListener('change', function() {
        setMateriasEstado(idsTercero, this.checked ? 'Aprobada' : 'No cursada');
    });
    quickCuarto.addEventListener('change', function() {
        setMateriasEstado(idsCuarto, this.checked ? 'Aprobada' : 'No cursada');
    });
    quickTransversales.addEventListener('change', function() {
        setMateriasEstado(idsTransversales, this.checked ? 'Aprobada' : 'No cursada');
    });
    quickQuinto.addEventListener('change', function() {
        setMateriasEstado(idsQuinto, this.checked ? 'Aprobada' : 'No cursada');
    });
    // Reflejar estado al cargar
    function updateQuickCheckboxes() {
        quickPrimero.checked = getMateriasEstado(idsPrimero);
        quickSegundo.checked = getMateriasEstado(idsSegundo);
        quickTercero.checked = getMateriasEstado(idsTercero);
        quickCuarto.checked = getMateriasEstado(idsCuarto);
        quickQuinto.checked = getMateriasEstado(idsQuinto);
        quickTransversales.checked = getMateriasEstado(idsTransversales);
    }
    // Llama updateQuickCheckboxes después de initializeSubjectControls
    const oldInit = initializeSubjectControls;
    initializeSubjectControls = function() {
        oldInit();
        updateQuickCheckboxes();
    };
    // Inicializa estado al cargar
    updateQuickCheckboxes();

    // --- CONTADORES DE MATERIAS ---
    function actualizarContadoresMaterias() {
        // Definir los grupos y sus ids
        const grupos = [
            { nombre: 'primero', ids: idsPrimero, el: document.getElementById('contador-primero') },
            { nombre: 'segundo', ids: idsSegundo, el: document.getElementById('contador-segundo') },
            { nombre: 'tercero', ids: idsTercero, el: document.getElementById('contador-tercero') },
            { nombre: 'cuarto', ids: idsCuarto, el: document.getElementById('contador-cuarto') },
            { nombre: 'quinto', ids: idsQuinto, el: document.getElementById('contador-quinto') },
            { nombre: 'transversales', ids: idsTransversales, el: document.getElementById('contador-transversales') },
        ];
        let totalX = 0;
        let totalY = 0;
        grupos.forEach(grupo => {
            let x = 0;
            let y = grupo.ids.length;
            grupo.ids.forEach(id => {
                const status = localStorage.getItem(`subject-status-${id}`);
                if (status && status !== 'No cursada') x++;
            });
            grupo.el.textContent = `${x} / ${y}`;
            totalX += x;
            totalY += y;
        });
        // General
        const elGeneral = document.getElementById('contador-general');
        elGeneral.textContent = `${totalX} / ${totalY} materias seleccionadas en total`;
    }

    // Llamar al actualizar contadores en cada cambio relevante
    subjectChecklist.addEventListener('change', actualizarContadoresMaterias);
    quickPrimero.addEventListener('change', actualizarContadoresMaterias);
    quickSegundo.addEventListener('change', actualizarContadoresMaterias);
    quickTercero.addEventListener('change', actualizarContadoresMaterias);
    quickCuarto.addEventListener('change', actualizarContadoresMaterias);
    quickTransversales.addEventListener('change', actualizarContadoresMaterias);
    quickQuinto.addEventListener('change', actualizarContadoresMaterias);
    // También actualizar al hacer click en cualquier botón de estado
    subjectChecklist.addEventListener('click', function(e) {
        if (e.target.classList && e.target.classList.contains('status-button')) {
            setTimeout(actualizarContadoresMaterias, 0);
        }
    });
    // También al resetear
    resetButton.addEventListener('click', function() {
        setTimeout(actualizarContadoresMaterias, 0);
    });
    // Inicializar al cargar
    actualizarContadoresMaterias();

    // Nota al lado del combo cuando es >= 7
    const numSubjectsNote = document.getElementById('num-subjects-note');
    function updateNumSubjectsNote() {
        const v = parseInt(subjectCountDropdown.value, 10);
        numSubjectsNote.textContent = v >= 7 ? '😱 ¡Mucha suerte!' : '';
    }
    subjectCountDropdown.addEventListener('change', updateNumSubjectsNote);
    updateNumSubjectsNote();

    // Filtrar el string listado para eliminar materias ignoradas
    function filtrarListadoPorIds(listado, idsIgnorar) {
        const idsSet = new Set(idsIgnorar);
        return listado.split('\n').filter(linea => {
            const idMatch = linea.match(/^(\d+):?/);
            if (!idMatch) return true;
            const id = parseInt(idMatch[1]);
            return !idsSet.has(id);
        }).join('\n');
    }

    calculateButton.addEventListener('click', function() {
        // Obtener materias seleccionadas (Aprobada o Final)
        const selectedSubjects = Array.from(subjectChecklist.querySelectorAll('input:checked'))
            .map(input => parseInt(input.value));
        const subjectCount = parseInt(subjectCountDropdown.value);
        const semester = parseInt(semesterDropdown.value);

        // Obtener materias marcadas como 'Final (ignorar)'
        const finalIgnorarIds = [];
        subjectChecklist.querySelectorAll('.subject-label').forEach(subjectDiv => {
            const checkbox = subjectDiv.querySelector('input[type="checkbox"]');
            const subjectText = subjectDiv.getAttribute('data-nombre');
            const id = parseInt(subjectText.split(')')[0].replace('(', '').trim());
            const status = localStorage.getItem(`subject-status-${id}`);
            if (status === 'Final (ignorar)') {
                finalIgnorarIds.push(id);
            }
        });

        const listadoFiltrado = filtrarListadoPorIds(listado, finalIgnorarIds);
        try {
            // Crear nueva instancia del plan
            const plan = new PlanDeEstudios();
            plan.cargarMateriasDesdeTexto(listadoFiltrado, []);
            plan.cargarNombresDesdeTexto(tabla_nombres);
            plan.calcularYGuardarLongitudes();
            // Solo ignorar las materias en finalIgnorarIds
            const ignorarIds = finalIgnorarIds;
            // Filtrar las materias seleccionadas para excluir las ignoradas
            const filteredSelected = selectedSubjects.filter(id => !finalIgnorarIds.includes(id));
            // Crear nuevo plan solo con las materias válidas
            const planFiltrado = new PlanDeEstudios();
            planFiltrado.cargarMateriasDesdeTexto(listadoFiltrado, filteredSelected);
            planFiltrado.cargarNombresDesdeTexto(tabla_nombres);
            planFiltrado.calcularYGuardarLongitudes();
            // Solo ajustar 3671 si el cuatrimestre seleccionado es primero (1)
            // Y agregar 3671 a materias sugeridas solo si el cuatrimestre es primero
            if (planFiltrado.datos_materias[3671] && semester === 1) {
                planFiltrado.ajustarCuatrimestre3671YPropagar(semester);
            }
            // Obtener resultados
            // Búsqueda robusta: incrementa el pedido hasta que la cantidad de sugeridas (no ignoradas) sea la correcta
            let pedido = subjectCount;
            let materias, fijasFiltradas, opcFiltradas;
            // Función robusta para extraer el ID de una materia string
            function getMateriaId(materiaStr) {
                const match = materiaStr.match(/\((\d+)\)\s*$/);
                return match ? parseInt(match[1]) : null;
            }
            while (true) {
                materias = planFiltrado.materiasProximoCuatri(pedido);
                // Filtra materias ignoradas de la visualización
                // También filtrar 3671 si el cuatrimestre seleccionado NO es primero (1)
                fijasFiltradas = (materias.materias_fijas || []).filter(materia => {
                    const id = getMateriaId(materia);
                    if (id === null) return !finalIgnorarIds.includes(null);
                    if (id === 3671 && semester !== 1) return false; // No mostrar 3671 si no es primero
                    return !finalIgnorarIds.includes(id);
                });
                opcFiltradas = (materias.materias_opcionales || []).filter(materia => {
                    const id = getMateriaId(materia);
                    if (id === null) return !finalIgnorarIds.includes(null);
                    if (id === 3671 && semester !== 1) return false; // No mostrar 3671 si no es primero
                    return !finalIgnorarIds.includes(id);
                });
                if (fijasFiltradas.length + opcFiltradas.length >= subjectCount || pedido > subjectCount + 10) break;
                pedido++;
            }
            // Mostrar resultados
            resultsDiv.innerHTML = '<h3>Materias para el próximo cuatrimestre:<span class="help-icon" title="Fijándose en tus materias actuales, el sistema calcula el camino de correlativas más largo hasta recibirte, y en base a eso te ordena las materias según las correlativas que tienen después. El número en corchetes básicamente significa cuántos cuatris tenés para aprobarla (sin contar verano) sin atrasarte en tu tiempo mínimo de graduación.">ⓘ</span></h3>';
            fijasFiltradas.forEach(materia => {
                resultsDiv.innerHTML += `<p>${materia}</p>`;
            });
            // Ajusta el mensaje según la cantidad real de opcionales a elegir
            let faltan = subjectCount - fijasFiltradas.length;
            if (opcFiltradas.length > 0 && faltan > 0 && faltan < opcFiltradas.length) {
                const prefix = fijasFiltradas.length === 0 ? '' : 'Más ';
                resultsDiv.innerHTML += `<p><strong>${prefix}${faltan} de las siguientes materias, según tu preferencia:</strong></p>`;
            }
            if (opcFiltradas.length > 0) {
                opcFiltradas.forEach(materia => {
                    resultsDiv.innerHTML += `<p>${materia}</p>`;
                });
            }
            resultsDiv.innerHTML += '<div style="height: 32px"></div>';
            // Después del bucle de sugeridas/opcionales, define materiasDisponibles
            const materiasDisponibles = planFiltrado.puedoCursarEnCuatri(1);
            const materiasDisponiblesFiltradas = (materiasDisponibles || []).filter(materia => {
                const id = getMateriaId(materia);
                if (id === null) return !finalIgnorarIds.includes(null);
                if (id === 3671 && semester !== 1) return false; // No mostrar 3671 si no es primero
                return !finalIgnorarIds.includes(id);
            });
            if (materiasDisponiblesFiltradas.length > 0) {
                resultsDiv.innerHTML += '<h3>Todas las materias que podrías cursar:</h3>';
                resultsDiv.innerHTML += '<p>Mientras más bajo el número en corchetes, más urgente es que curses una materia.</p>';
                materiasDisponiblesFiltradas.forEach(materia => {
                    resultsDiv.innerHTML += `<p> ${materia}</p>`;
                });
            }
            if ((materias.materias_fijas || []).length === 0 && (materias.materias_opcionales || []).length === 0) {
                resultsDiv.innerHTML = '<p>No hay materias disponibles para cursar.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = `<p class="error">Error al calcular las materias: ${error.message}</p>`;
        }
    });
});