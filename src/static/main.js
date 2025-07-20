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
            resultsDiv.innerHTML = '';
            
            // Display next semester subjects
            if (materias.materias_fijas && materias.materias_fijas.length > 0) {
                resultsDiv.innerHTML += '<h3>Materias para el próximo cuatrimestre:</h3>';
                resultsDiv.innerHTML += '<p>Mientras más bajo el número en corchetes, más urgente es que curses una materia.</p>';
                materias.materias_fijas.forEach(materia => {
                    resultsDiv.innerHTML += `<p>${materia}</p>`;
                });
            }

            if (materias.materias_opcionales && materias.materias_opcionales.length > 0) {
                resultsDiv.innerHTML += `<p><strong>Más ${materias.cantidad_a_elegir} de las siguientes materias, según tu preferencia:</strong></p>`;
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