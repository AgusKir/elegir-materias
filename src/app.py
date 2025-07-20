from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from patear import PlanDeEstudios, listado, tabla_nombres
import os

app = Flask(__name__, 
    template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
    static_folder=os.path.join(os.path.dirname(__file__), 'static'))
CORS(app)

# Initialize plan with the data
plan = PlanDeEstudios()
plan.cargar_materias_desde_texto(listado)
plan.cargar_nombres_desde_texto(tabla_nombres)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        selected_subjects = request.json.get('completedSubjects', [])
        cantidad = request.json.get('subjectCount', 5)
        semestre = request.json.get('semester', 1)

        # Create a new plan with the selected subjects
        plan_actual = PlanDeEstudios()
        plan_actual.cargar_materias_desde_texto(listado, selected_subjects)
        plan_actual.cargar_nombres_desde_texto(tabla_nombres)
        plan_actual.calcular_y_guardar_longitudes()
        plan_actual.ajustar_cuatrimestre_3671_y_propagar(semestre)

        return jsonify({
            'materias': plan_actual.materias_proximo_cuatri(cantidad),
            'materias_disponibles': plan_actual.puedo_cursar_en_cuatri(1),
            'status': 'success'
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)