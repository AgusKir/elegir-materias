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

    const resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    resetButton.textContent = 'Resetear Selección';
    calculateButton.parentNode.insertBefore(resetButton, calculateButton.nextSibling);

    function initializeSubjectControls() {
        subjectChecklist.querySelectorAll('.subject-label').forEach(subjectDiv => {
            // Obtener el checkbox y el texto
            const checkbox = subjectDiv.querySelector('input[type="checkbox"]');
            const subjectText = subjectDiv.textContent.trim();
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

            [
                { status: 'Aprobada', check: true, className: 'subject-status-aprobada', btnClass: 'status-button status-aprobada' },
                { status: 'Final', check: true, className: 'subject-status-final', btnClass: 'status-button status-final' },
                { status: 'Final (ignorar)', check: true, className: 'subject-status-final-ignorar', btnClass: 'status-button status-final-ignorar' },
                { status: 'No cursada', check: false, className: 'subject-status-no-cursada', btnClass: 'status-button status-no-cursada' }
            ].forEach(({ status, check, className, btnClass }) => {
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
                };
                buttonsDiv.appendChild(button);
            });

            row.appendChild(buttonsDiv);
            subjectDiv.appendChild(row);
            subjectDiv.style.display = 'block';
            subjectDiv.style.width = '100%';
            row.style.width = '100%';
        });

        // Restaurar colores y checkboxes desde localStorage
        subjectChecklist.querySelectorAll('.subject-label').forEach(subjectDiv => {
            const checkbox = subjectDiv.querySelector('input[type="checkbox"]');
            const subjectText = subjectDiv.textContent.trim();
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
        }
    });

    // Initialize subject controls
    initializeSubjectControls();

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
            const subjectText = subjectDiv.textContent.trim();
            const id = parseInt(subjectText.split(')')[0].replace('(', '').trim());
            const status = localStorage.getItem(`subject-status-${id}`);
            if (status === 'Final (ignorar)') {
                finalIgnorarIds.push(id);
            }
        });

        // Función para obtener todas las correlativas siguientes recursivamente
        function getAllPosteriores(ids, plan) {
            const toRemove = new Set(ids);
            const stack = [...ids];
            while (stack.length > 0) {
                const current = stack.pop();
                const materia = plan.materias[current];
                if (materia) {
                    materia.posteriores.forEach(postId => {
                        if (!toRemove.has(postId)) {
                            toRemove.add(postId);
                            stack.push(postId);
                        }
                    });
                } else {
                    toRemove.add(current);
                }
            }
            return Array.from(toRemove);
        }

        resultsDiv.innerHTML = '<p>Calculando...</p>';

        try {
            // Crear nueva instancia del plan
            const plan = new PlanDeEstudios();
            // Cargar datos (sin eliminar nada aún)
            plan.cargarMateriasDesdeTexto(listado, []);
            plan.cargarNombresDesdeTexto(tabla_nombres);
            plan.calcularYGuardarLongitudes();
            plan.ajustarCuatrimestre3671YPropagar(semester);

            // Obtener todas las materias a ignorar (final ignorar + sus posteriores)
            const ignorarIds = getAllPosteriores(finalIgnorarIds, plan);

            // Filtrar las materias seleccionadas para excluir las ignoradas
            const filteredSelected = selectedSubjects.filter(id => !ignorarIds.includes(id));

            // Crear nuevo plan solo con las materias válidas
            const planFiltrado = new PlanDeEstudios();
            planFiltrado.cargarMateriasDesdeTexto(listado, filteredSelected);
            planFiltrado.cargarNombresDesdeTexto(tabla_nombres);
            planFiltrado.calcularYGuardarLongitudes();
            planFiltrado.ajustarCuatrimestre3671YPropagar(semester);

            // Obtener resultados
            const materias = planFiltrado.materiasProximoCuatri(subjectCount);
            const materiasDisponibles = planFiltrado.puedoCursarEnCuatri(1);

            // Mostrar resultados
            resultsDiv.innerHTML = '<h3>Materias para el próximo cuatrimestre:</h3>';
            //resultsDiv.innerHTML += '<p>Mientras más bajo el número en corchetes, más urgente es que curses una materia.</p>';
            if (materias.materias_fijas && materias.materias_fijas.length > 0) {
                materias.materias_fijas.filter(materia => {
                    const id = parseInt(materia.split('-')[0]);
                    return !ignorarIds.includes(id);
                }).forEach(materia => {
                    resultsDiv.innerHTML += `<p>${materia}</p>`;
                });
            }
            if (materias.materias_opcionales && materias.materias_opcionales.length > 0) {
                const prefix = materias.materias_fijas.length > 0 ? 'Más ' : '';
                resultsDiv.innerHTML += `<p><strong>${prefix}${materias.cantidad_a_elegir} de las siguientes materias, según tu preferencia:</strong></p>`;
                materias.materias_opcionales.filter(materia => {
                    const id = parseInt(materia.split('-')[0]);
                    return !ignorarIds.includes(id);
                }).forEach(materia => {
                    resultsDiv.innerHTML += `<p>${materia}</p>`;
                });
            }
            // Agregar espacio visual antes de la siguiente sección
            resultsDiv.innerHTML += '<div style="height: 32px"></div>';
            // Display available subjects
            if (materiasDisponibles && materiasDisponibles.length > 0) {
                resultsDiv.innerHTML += '<h3>Todas las materias que podrías cursar:</h3>';
                resultsDiv.innerHTML += '<p>Mientras más bajo el número en corchetes, más urgente es que curses una materia.</p>';
                materiasDisponibles.filter(materia => {
                    const id = parseInt(materia.split('-')[0]);
                    return !ignorarIds.includes(id);
                }).forEach(materia => {
                    resultsDiv.innerHTML += `<p> ${materia}</p>`;
                });
            }
            if (!materias.materias_fijas?.length && !materias.materias_opcionales?.length) {
                resultsDiv.innerHTML = '<p>No hay materias disponibles para cursar.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = `<p class="error">Error al calcular las materias: ${error.message}</p>`;
        }
    });
});