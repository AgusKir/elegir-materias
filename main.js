document.addEventListener('DOMContentLoaded', function() {
    const calculateButton = document.getElementById('calculate-button');
    const subjectChecklist = document.getElementById('completed-subjects');
    const subjectCountDropdown = document.getElementById('num-subjects');
    const semesterDropdown = document.getElementById('semester');
    const resultsDiv = document.getElementById('results');

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
            const originalContent = label.innerHTML;
            label.innerHTML = '';
            
            const row = document.createElement('div');
            row.className = 'subject-row';
            
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = originalContent;
            row.appendChild(contentDiv);
            
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'subject-buttons';
            
            ['Aprobada', 'Final', 'Final (ignorar)'].forEach(status => {
                const button = document.createElement('button');
                button.textContent = status;
                button.className = `status-button status-${status.toLowerCase().replace(' (ignorar)', '-ignorar')}`;
                button.onclick = () => {
                    row.className = 'subject-row subject-status-' + 
                        status.toLowerCase().replace(' (ignorar)', '-ignorar');
                    const checkbox = contentDiv.querySelector('input[type="checkbox"]');
                    checkbox.checked = true;
                    
                    // Save status to localStorage
                    const subjectId = checkbox.value;
                    localStorage.setItem(`subject-status-${subjectId}`, status);
                    
                    // Trigger change event for checkbox
                    const event = new Event('change');
                    checkbox.dispatchEvent(event);
                };
                buttonsDiv.appendChild(button);
            });
            
            row.appendChild(buttonsDiv);
            label.appendChild(row);
        });

        // Restore statuses from localStorage
        subjectChecklist.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            const status = localStorage.getItem(`subject-status-${checkbox.value}`);
            if (status) {
                const row = checkbox.closest('.subject-row');
                row.className = 'subject-row subject-status-' + 
                    status.toLowerCase().replace(' (ignorar)', '-ignorar');
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
            resultsDiv.innerHTML += '<p>Mientras más bajo el número en corchetes, más urgente es que curses una materia.</p>';
            
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

            // Display available subjects
            if (materiasDisponibles && materiasDisponibles.length > 0) {
                resultsDiv.innerHTML += '<h3>Todas las materias que podrías cursar:</h3>';
                resultsDiv.innerHTML += '<p>Mientras más bajo el número en corchetes, más urgente es que curses una materia.</p>';
                materiasDisponibles.forEach(materia => {
                    resultsDiv.innerHTML += `<p>${materia}</p>`;
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