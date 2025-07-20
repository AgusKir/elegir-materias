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

    // Load saved checkboxes
    const savedSubjects = JSON.parse(localStorage.getItem('completedSubjects') || '[]');
    subjectChecklist.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = savedSubjects.includes(parseInt(checkbox.value));
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
        subjectChecklist.querySelectorAll('label').forEach(label => {
            // Obtener el checkbox y el texto
            const checkbox = label.querySelector('input[type="checkbox"]');
            const subjectText = label.textContent.trim();
            const id = subjectText.split('-')[0].trim();
            // Limpiar el label
            label.innerHTML = '';
            // Volver a agregar el checkbox (pero oculto)
            checkbox.style.display = 'none';
            label.appendChild(checkbox);

            // Crear la fila visual
            const row = document.createElement('div');
            row.className = 'subject-row';

            const contentDiv = document.createElement('div');
            contentDiv.textContent = subjectText;
            row.appendChild(contentDiv);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'subject-buttons';

            // Botones: Aprobada, Final, Final (ignorar), No cursada (No cursada al final)
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
            label.appendChild(row);
        });

        // Restaurar colores desde localStorage
        subjectChecklist.querySelectorAll('label').forEach(label => {
            const checkbox = label.querySelector('input[type="checkbox"]');
            const subjectText = label.textContent.trim();
            const id = subjectText.split('-')[0].trim();
            const row = label.querySelector('.subject-row');
            const status = localStorage.getItem(`subject-status-${id}`);
            if (row) {
                if (status) {
                    let className = '';
                    if (status === 'Aprobada') className = 'subject-status-aprobada';
                    else if (status === 'Final') className = 'subject-status-final';
                    else if (status === 'Final (ignorar)') className = 'subject-status-final-ignorar';
                    else className = 'subject-status-no-cursada';
                    row.className = 'subject-row ' + className;
                } else {
                    row.className = 'subject-row subject-status-no-cursada';
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
        const selectedSubjects = Array.from(subjectChecklist.querySelectorAll('input:checked'))
            .map(input => parseInt(input.value));
        const subjectCount = parseInt(subjectCountDropdown.value);
        const semester = parseInt(semesterDropdown.value);

        resultsDiv.innerHTML = '<p>Calculando...</p>';

        try {
            // Crear nueva instancia del plan
            const plan = new PlanDeEstudios();
            
            // Cargar datos
            plan.cargarMateriasDesdeTexto(listado, selectedSubjects);
            plan.cargarNombresDesdeTexto(tabla_nombres);
            plan.calcularYGuardarLongitudes();
            plan.ajustarCuatrimestre3671YPropagar(semester);

            // Obtener resultados
            const materias = plan.materiasProximoCuatri(subjectCount);
            const materiasDisponibles = plan.puedoCursarEnCuatri(1);

            // Mostrar resultados
            resultsDiv.innerHTML = '<h3>Materias para el próximo cuatrimestre:</h3>';
            //resultsDiv.innerHTML += '<p>Mientras más bajo el número en corchetes, más urgente es que curses una materia.</p>';
            
            if (materias.materias_fijas && materias.materias_fijas.length > 0) {
                materias.materias_fijas.forEach(materia => {
                    resultsDiv.innerHTML += `<p>${materia}</p>`;
                });
            }

            if (materias.materias_opcionales && materias.materias_opcionales.length > 0) {
                const prefix = materias.materias_fijas.length > 0 ? 'Más ' : '';
                resultsDiv.innerHTML += `<p><strong>${prefix}${materias.cantidad_a_elegir} de las siguientes materias, según tu preferencia:</strong></p>`;
                materias.materias_opcionales.forEach(materia => {
                    resultsDiv.innerHTML += `<p>${materia}</p>`;
                });
            }

            // Agregar espacio visual antes de la siguiente sección
            resultsDiv.innerHTML += '<div style="height: 32px"></div>';
            // Display available subjects
            if (materiasDisponibles && materiasDisponibles.length > 0) {
                resultsDiv.innerHTML += '<h3>Todas las materias que podrías cursar:</h3>';
                resultsDiv.innerHTML += '<p>Mientras más bajo el número en corchetes, más urgente es que curses una materia.</p>';
                materiasDisponibles.forEach(materia => {
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