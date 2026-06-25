"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SubjectStatus, SubjectData, CalculationResult } from "../types";
import { PlanDeEstudios, LISTADO_MATERIAS, TABLA_NOMBRES } from "../utils/planDeEstudios";

// Define the groups for rendering and quick selection
const SUBJECT_GROUPS = [
  {
    name: "Primer Año",
    key: "primero",
    // Quick select toggles this exact list of IDs
    quickSelectIds: [3621, 3622, 3623, 3624, 3625, 3626, 3627, 3628, 3629, 3630, 3631, 3632],
    subjects: [
      { id: 3621, nombre: "Matemática Discreta" },
      { id: 3622, nombre: "Análisis Matemático I" },
      { id: 3623, nombre: "Programación Inicial" },
      { id: 3624, nombre: "Introducción a los Sistemas de Información" },
      { id: 3625, nombre: "Sistemas de Numeración" },
      { id: 3626, nombre: "Principios de Calidad de Software" },
      { id: 3627, nombre: "Álgebra y Geometría Analítica I" },
      { id: 3628, nombre: "Física I" },
      { id: 3629, nombre: "Programación Estructurada Básica" },
      { id: 3630, nombre: "Introducción a la Gestión de Requisitos" },
      { id: 3631, nombre: "Fundamentos de Sistemas Embebidos" },
      { id: 3632, nombre: "Introducción a los Proyectos Informáticos" }
    ]
  },
  {
    name: "Segundo Año",
    key: "segundo",
    // Quick select excludes 3680 since it's special and has different buttons
    quickSelectIds: [3633, 3634, 3635, 3636, 3637, 3638, 3676, 3639, 3640, 3641, 3642, 3643, 3644],
    subjects: [
      { id: 3633, nombre: "Análisis Matemático II" },
      { id: 3634, nombre: "Física II" },
      { id: 3635, nombre: "Tópicos de Programación" },
      { id: 3636, nombre: "Bases de Datos" },
      { id: 3637, nombre: "Análisis de Sistemas" },
      { id: 3638, nombre: "Arquitectura de Computadoras" },
      { id: 3676, nombre: "Responsabilidad Social Universitaria" },
      { id: 3639, nombre: "Análisis Matemático III" },
      { id: 3640, nombre: "Algoritmos y Estructuras de Datos" },
      { id: 3641, nombre: "Bases de Datos Aplicadas" },
      { id: 3642, nombre: "Principios de Diseño de Sistemas" },
      { id: 3643, nombre: "Redes de Computadoras" },
      { id: 3644, nombre: "Gestión de las Organizaciones" },
      { id: 3680, nombre: "Taller de Integración" } // Special subject
    ]
  },
  {
    name: "Tercer Año",
    key: "tercero",
    quickSelectIds: [3645, 3646, 3647, 3648, 3649, 3650, 3651, 3652, 3653, 3654, 3655, 3675],
    subjects: [
      { id: 3645, nombre: "Álgebra y Geometría Analítica II" },
      { id: 3646, nombre: "Paradigmas de Programación" },
      { id: 3647, nombre: "Requisitos Avanzados" },
      { id: 3648, nombre: "Diseño de Software" },
      { id: 3649, nombre: "Sistemas Operativos" },
      { id: 3650, nombre: "Seguridad de la Información" },
      { id: 3675, nombre: "Práctica Profesional Supervisada" },
      { id: 3651, nombre: "Probabilidad y Estadística" },
      { id: 3652, nombre: "Programación Avanzada" },
      { id: 3653, nombre: "Arquitectura de Sistemas Software" },
      { id: 3654, nombre: "Virtualización de Hardware" },
      { id: 3655, nombre: "Auditoría y Legislación" }
    ]
  },
  {
    name: "Cuarto Año",
    key: "cuarto",
    quickSelectIds: [3656, 3657, 3658, 3659, 3660, 3661, 3662, 3663, 3664, 3665, 3666, 3667],
    subjects: [
      { id: 3656, nombre: "Estadística Aplicada" },
      { id: 3657, nombre: "Autómatas y Gramáticas" },
      { id: 3658, nombre: "Programación Concurrente" },
      { id: 3659, nombre: "Gestión Aplicada al Desarrollo de Software I" },
      { id: 3660, nombre: "Sistemas Operativos Avanzados" },
      { id: 3661, nombre: "Gestión de Proyectos" },
      { id: 3662, nombre: "Matemática Aplicada" },
      { id: 3663, nombre: "Lenguajes y Compiladores" },
      { id: 3664, nombre: "Inteligencia Artificial" },
      { id: 3665, nombre: "Gestión Aplicada al Desarrollo de Software II" },
      { id: 3666, nombre: "Seguridad Aplicada y Forensia" },
      { id: 3667, nombre: "Gestión de la Calidad en Procesos de Sistemas" }
    ]
  },
  {
    name: "Quinto Año",
    key: "quinto",
    quickSelectIds: [3668, 3669, 3670, 3671, 3677, 3678, 3679],
    subjects: [
      { id: 3668, nombre: "Inteligencia Artificial Aplicada" },
      { id: 3669, nombre: "Innovación y Emprendedorismo" },
      { id: 3670, nombre: "Ciencia de Datos" },
      { id: 3671, nombre: "Proyecto Final de Carrera" },
      { id: 3677, nombre: "Electiva I" },
      { id: 3678, nombre: "Electiva II" },
      { id: 3679, nombre: "Electiva III" }
    ]
  },
  {
    name: "Transversales",
    key: "transversales",
    quickSelectIds: [901, 902, 903, 904, 911, 912],
    subjects: [
      { id: 901, nombre: "Inglés I" },
      { id: 902, nombre: "Inglés II" },
      { id: 903, nombre: "Inglés III" },
      { id: 904, nombre: "Inglés IV" },
      { id: 911, nombre: "Computación I" },
      { id: 912, nombre: "Computación II" }
    ]
  }
];

// All flat subjects mapping
const ALL_SUBJECT_IDS = SUBJECT_GROUPS.flatMap(g => g.subjects.map(s => s.id));

interface Toast {
  id: number;
  message: string;
  duration: number;
}

export default function Page() {
  const [mounted, setMounted] = useState(false);

  // Core configuration states
  const [colorMode, setColorMode] = useState<"dark" | "light">("dark");
  const [numSubjects, setNumSubjects] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [intermediatePriority, setIntermediatePriority] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Subjects state mapping: ID -> Status
  const [subjectStatuses, setSubjectStatuses] = useState<Record<number, SubjectStatus>>({});

  // Calculation outputs
  const [calculationResults, setCalculationResults] = useState<CalculationResult | null>(null);
  const [allAvailableSubjects, setAllAvailableSubjects] = useState<string[]>([]);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  // Active Toast messages
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [quickSelectToastShown, setQuickSelectToastShown] = useState<boolean>(false);

  // 1. Initial State Loading on Mount
  useEffect(() => {
    // Determine Color Mode
    const savedColor = localStorage.getItem("colorMode") as "dark" | "light" | null;
    const initialColor = savedColor || "dark";
    setColorMode(initialColor);
    applyColorMode(initialColor);

    // Config options
    const savedNum = localStorage.getItem("numSubjects");
    if (savedNum) setNumSubjects(parseInt(savedNum, 10));

    const savedSem = localStorage.getItem("semester");
    if (savedSem) setSemester(parseInt(savedSem, 10));

    const savedPriority = localStorage.getItem("intermediatePriority");
    if (savedPriority) setIntermediatePriority(savedPriority === "yes");

    // Load individual statuses
    const loadedStatuses: Record<number, SubjectStatus> = {};

    // Taller de integración default
    const currentIntegracion = localStorage.getItem("subject-status-3680");
    if (!currentIntegracion) {
      localStorage.setItem("subject-status-3680", "No la voy a cursar");
      loadedStatuses[3680] = "No la voy a cursar";
    }

    ALL_SUBJECT_IDS.forEach(id => {
      const status = localStorage.getItem(`subject-status-${id}`);
      if (status) {
        loadedStatuses[id] = status as SubjectStatus;
      } else if (id !== 3680) {
        loadedStatuses[id] = "No cursada";
      }
    });

    setSubjectStatuses(loadedStatuses);
    setMounted(true);
  }, []);

  // Helper to apply classes to document body
  const applyColorMode = (mode: "dark" | "light") => {
    if (typeof document !== "undefined") {
      const body = document.body;
      if (mode === "light") {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
      } else {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
      }
    }
  };

  // Toggle color theme
  const handleToggleColorMode = () => {
    const nextColor = colorMode === "dark" ? "light" : "dark";
    setColorMode(nextColor);
    localStorage.setItem("colorMode", nextColor);
    applyColorMode(nextColor);
  };

  // Sync basic inputs to localStorage
  const handleNumSubjectsChange = (val: number) => {
    setNumSubjects(val);
    localStorage.setItem("numSubjects", String(val));
  };

  const handleSemesterChange = (val: number) => {
    setSemester(val);
    localStorage.setItem("semester", String(val));
  };

  const handlePriorityChange = (val: boolean) => {
    setIntermediatePriority(val);
    localStorage.setItem("intermediatePriority", val ? "yes" : "no");
  };

  // 2. Toast managers
  const showToast = (message: string, duration = 15000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, duration }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSubjectStatusChange = (id: number, status: SubjectStatus) => {
    const nextStatuses = { ...subjectStatuses, [id]: status };
    setSubjectStatuses(nextStatuses);

    // Save to localStorage
    if (status === "No cursada") {
      localStorage.removeItem(`subject-status-${id}`);
    } else {
      localStorage.setItem(`subject-status-${id}`, status);
    }

    // Sync 'completedSubjects' array (IDs of selected checkboxes in legacy system)
    // The legacy checked status maps to 'Aprobada', 'Final', or 'No la voy a cursar'
    const checkedIds: number[] = [];
    Object.entries(nextStatuses).forEach(([sid, sval]) => {
      const parsedId = parseInt(sid, 10);
      if (sval === "Aprobada" || sval === "Final" || sval === "No la voy a cursar") {
        checkedIds.push(parsedId);
      }
    });
    localStorage.setItem("completedSubjects", JSON.stringify(checkedIds));

    // Handle 3622 (Análisis Matemático I) approval notification
    if (id === 3622 && status === "Aprobada") {
      if (!quickSelectToastShown) {
        showToast("Recordá que podés marcar al instante todas las materias de un año con las cajas que están a la derecha de la tabla :)");
        setQuickSelectToastShown(true);
      }
    }
  };

  // 4. Quick Group selection handlers
  const handleQuickSelectChange = (groupKey: string, checked: boolean) => {
    const group = SUBJECT_GROUPS.find(g => g.key === groupKey);
    if (!group) return;

    const targetStatus = checked ? "Aprobada" : "No cursada";
    const nextStatuses = { ...subjectStatuses };

    group.quickSelectIds.forEach(id => {
      nextStatuses[id] = targetStatus;
      if (targetStatus === "No cursada") {
        localStorage.removeItem(`subject-status-${id}`);
      } else {
        localStorage.setItem(`subject-status-${id}`, targetStatus);
      }
    });

    setSubjectStatuses(nextStatuses);

    // Sync completedSubjects
    const checkedIds: number[] = [];
    Object.entries(nextStatuses).forEach(([sid, sval]) => {
      const parsedId = parseInt(sid, 10);
      if (sval === "Aprobada" || sval === "Final" || sval === "No la voy a cursar") {
        checkedIds.push(parsedId);
      }
    });
    localStorage.setItem("completedSubjects", JSON.stringify(checkedIds));
  };

  // Get verification count for quick checklist headers
  const getGroupCompletedCount = (groupKey: string) => {
    const group = SUBJECT_GROUPS.find(g => g.key === groupKey);
    if (!group) return { passed: 0, total: 0 };

    let passed = 0;
    let total = group.subjects.length;
    const isIntegracionIgnored = subjectStatuses[3680] === "No la voy a cursar";

    if (groupKey === "segundo" && isIntegracionIgnored) {
      total -= 1;
    }

    group.subjects.forEach(s => {
      const status = subjectStatuses[s.id];
      if (status && status !== "No cursada") {
        if (s.id === 3680 && isIntegracionIgnored) {
          return;
        }
        passed++;
      }
    });

    return { passed, total };
  };

  // Check if all quickSelectIds in a group are approved
  const isGroupAllApproved = (groupKey: string) => {
    const group = SUBJECT_GROUPS.find(g => g.key === groupKey);
    if (!group) return false;

    return group.quickSelectIds.every(id => subjectStatuses[id] === "Aprobada");
  };

  // 5. Total statistics dashboard values
  const stats = useMemo(() => {
    let approved = 0;
    let total = ALL_SUBJECT_IDS.length;
    const isIntegracionIgnored = subjectStatuses[3680] === "No la voy a cursar";

    if (isIntegracionIgnored) {
      total -= 1;
    }

    ALL_SUBJECT_IDS.forEach(id => {
      const status = subjectStatuses[id];
      if (status && status !== "No cursada") {
        if (id === 3680 && isIntegracionIgnored) {
          return;
        }
        approved++;
      }
    });

    const percent = total > 0 ? Math.round((approved / total) * 100) : 0;

    // Estimate remaining semesters based on the calculation engine
    let estimatedSemesters = 0;
    if (mounted) {
      try {
        const tempPlan = new PlanDeEstudios();

        // Exclude Final (ignorar) IDs
        const finalIgnorarIds: number[] = [];
        ALL_SUBJECT_IDS.forEach(id => {
          if (subjectStatuses[id] === "Final (ignorar)") {
            finalIgnorarIds.push(id);
          }
        });

        // Filter listado to exclude ignored ones
        const filteredList = LISTADO_MATERIAS.split("\n")
          .filter(line => {
            const match = line.match(/^(\d+):?/);
            if (!match) return true;
            return !finalIgnorarIds.includes(parseInt(match[1], 10));
          })
          .join("\n");

        // Set approved subjects
        const approvedList: number[] = [];
        ALL_SUBJECT_IDS.forEach(id => {
          const val = subjectStatuses[id];
          if ((val === "Aprobada" || val === "Final" || val === "No la voy a cursar") && !finalIgnorarIds.includes(id)) {
            approvedList.push(id);
          }
        });

        tempPlan.cargarMateriasDesdeTexto(filteredList, approvedList);
        tempPlan.cargarNombresDesdeTexto(TABLA_NOMBRES);
        estimatedSemesters = tempPlan.cuatrisMinimosHastaRecibirse(semester);
      } catch (err) {
        console.error("Error calculating minimum semesters:", err);
      }
    }

    return { approved, total, percent, estimatedSemesters };
  }, [subjectStatuses, semester, mounted]);

  // Export recommendation to clipboard
  const handleExportToClipboard = () => {
    if (!calculationResults) return;

    const getMateriaName = (itemStr: string) => {
      const match = itemStr.match(/^\[-?\d+\]\s*(.+)\s*\((\d+)\)$/);
      return match ? match[1].trim() : itemStr;
    };

    let text = "";

    // 1. Fixed subjects
    calculationResults.materias_fijas.forEach(item => {
      text += getMateriaName(item) + "\n";
    });

    // 2. Optional subjects
    if (calculationResults.materias_opcionales.length > 0) {
      if (text.length > 0) text += "\n";
      text += `-- Más ${calculationResults.cantidad_a_elegir} de las siguientes materias --\n`;
      calculationResults.materias_opcionales.forEach(item => {
        text += getMateriaName(item) + "\n";
      });
    }

    navigator.clipboard.writeText(text.trim())
      .then(() => {
        showToast("Recomendación copiada al portapapeles.");
      })
      .catch(err => {
        console.error("Error al copiar al portapapeles: ", err);
        alert("No se pudo copiar al portapapeles. Por favor, copialo manualmente.");
      });
  };

  // 6. Core calculate action
  const handleCalculate = () => {
    // Exclude Final (ignorar) IDs
    const finalIgnorarIds: number[] = [];
    ALL_SUBJECT_IDS.forEach(id => {
      if (subjectStatuses[id] === "Final (ignorar)") {
        finalIgnorarIds.push(id);
      }
    });

    const approvedList: number[] = [];
    ALL_SUBJECT_IDS.forEach(id => {
      const val = subjectStatuses[id];
      if ((val === "Aprobada" || val === "Final" || val === "No la voy a cursar") && !finalIgnorarIds.includes(id)) {
        approvedList.push(id);
      }
    });

    const filteredList = LISTADO_MATERIAS.split("\n")
      .filter(line => {
        const match = line.match(/^(\d+):?/);
        if (!match) return true;
        return !finalIgnorarIds.includes(parseInt(match[1], 10));
      })
      .join("\n");

    try {
      const planFiltrado = new PlanDeEstudios();
      planFiltrado.cargarMateriasDesdeTexto(filteredList, approvedList);
      planFiltrado.cargarNombresDesdeTexto(TABLA_NOMBRES);
      planFiltrado.calcularYGuardarLongitudes(semester);

      // Adjust for 3671 (Proyecto Final) if semester is 1
      if (planFiltrado.datos_materias[3671] && semester === 1) {
        planFiltrado.ajustarCuatrimestre3671YPropagar(semester);
      }

      // Adjust for Intermediate Priorities (prioritize RSU before 4th/5th year)
      if (intermediatePriority) {
        const intermedioIds = new Set<number>();
        for (let i = 3621; i <= 3655; i++) intermedioIds.add(i);
        intermedioIds.add(3675);
        intermedioIds.add(3676);
        intermedioIds.add(901);
        intermedioIds.add(902);

        let maxIntermedioValor = 0;
        Object.entries(planFiltrado.datos_materias).forEach(([id, datos]) => {
          const idNum = parseInt(id, 10);
          if (intermedioIds.has(idNum) && planFiltrado.materias[idNum]) {
            maxIntermedioValor = Math.max(maxIntermedioValor, datos.valor_corchete);
          }
        });

        Object.entries(planFiltrado.datos_materias).forEach(([id, datos]) => {
          const idNum = parseInt(id, 10);
          if (!intermedioIds.has(idNum) && planFiltrado.materias[idNum]) {
            datos.valor_corchete += maxIntermedioValor;
          }
        });
      }

      // Query results robustly (matching logic from legacy calculate click handler)
      let requestCount = numSubjects;
      let calculated: CalculationResult;
      let fijasFiltradas: string[] = [];
      let opcFiltradas: string[] = [];

      const getMateriaId = (mStr: string) => {
        const match = mStr.match(/\((\d+)\)\s*$/);
        return match ? parseInt(match[1], 10) : null;
      };

      while (true) {
        calculated = planFiltrado.materiasProximoCuatri(requestCount);

        fijasFiltradas = (calculated.materias_fijas || []).filter(item => {
          const id = getMateriaId(item);
          if (id === null) return !finalIgnorarIds.includes(0);
          if (id === 3671 && semester !== 1) return false;
          return !finalIgnorarIds.includes(id);
        });

        opcFiltradas = (calculated.materias_opcionales || []).filter(item => {
          const id = getMateriaId(item);
          if (id === null) return !finalIgnorarIds.includes(0);
          if (id === 3671 && semester !== 1) return false;
          return !finalIgnorarIds.includes(id);
        });

        if (fijasFiltradas.length + opcFiltradas.length >= numSubjects || requestCount > numSubjects + 10) {
          break;
        }
        requestCount++;
      }

      // Set recommended subjects
      setCalculationResults({
        materias_fijas: fijasFiltradas,
        materias_opcionales: opcFiltradas,
        cantidad_a_elegir: numSubjects - fijasFiltradas.length
      });

      // Get all available subjects list
      const allAvailable = planFiltrado.puedoCursarEnCuatri(1);
      const filteredAllAvailable = allAvailable.filter(item => {
        const id = getMateriaId(item);
        if (id === null) return !finalIgnorarIds.includes(0);
        if (id === 3671 && semester !== 1) return false;
        return !finalIgnorarIds.includes(id);
      });
      setAllAvailableSubjects(filteredAllAvailable);

      setHasCalculated(true);
    } catch (error: any) {
      console.error(error);
      alert(`Error al calcular las materias: ${error.message}`);
    }
  };

  // 7. Reset all selections
  const handleReset = () => {
    if (confirm("¿Estás seguro de que querés resetear todas las materias seleccionadas?")) {
      localStorage.clear();

      const resetStatuses: Record<number, SubjectStatus> = {};
      ALL_SUBJECT_IDS.forEach(id => {
        if (id === 3680) {
          localStorage.setItem("subject-status-3680", "No la voy a cursar");
          resetStatuses[3680] = "No la voy a cursar";
        } else {
          resetStatuses[id] = "No cursada";
        }
      });

      setSubjectStatuses(resetStatuses);
      setNumSubjects(1);
      setSemester(1);
      setIntermediatePriority(false);
      setCalculationResults(null);
      setAllAvailableSubjects([]);
      setHasCalculated(false);

      showToast("Selección reseteada con éxito.");
    }
  };

  // Filter subjects based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return SUBJECT_GROUPS;

    const query = searchQuery.toLowerCase().trim();
    return SUBJECT_GROUPS.map(group => {
      const matchingSubjects = group.subjects.filter(
        s => s.nombre.toLowerCase().includes(query) || String(s.id).includes(query)
      );
      return {
        ...group,
        subjects: matchingSubjects
      };
    }).filter(group => group.subjects.length > 0);
  }, [searchQuery]);

  // Clean parsing helper for rendering result text
  const parseResultItem = (itemStr: string) => {
    // format is "[corchete] Nombre (id)"
    const match = itemStr.match(/^\[(-?\d+)\]\s*(.+)\s*\((\d+)\)$/);
    if (match) {
      const [_, corchete, nombre, id] = match;
      const val = parseInt(corchete, 10);
      let badgeClass = "blue";
      if (val <= 1) badgeClass = "critical";
      else if (val === 2) badgeClass = "orange";
      else if (val === 3) badgeClass = "yellow";
      else if (val === 4) badgeClass = "green-light";
      else if (val === 5) badgeClass = "green-dark";
      else badgeClass = "blue";

      return {
        id,
        nombre: nombre.trim(),
        corchete: val,
        badgeClass
      };
    }
    return {
      id: "N/A",
      nombre: itemStr,
      corchete: 0,
      badgeClass: "info"
    };
  };

  if (!mounted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "#94a3b8", fontSize: "1.2rem", fontWeight: "600" }}>Cargando calculadora...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            <div className="toast-msg">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
            <div
              className="toast-progress"
              style={{ animation: `shrinkWidth ${toast.duration}ms linear forwards` }}
            />
          </div>
        ))}
      </div>

      {/* Top action toggles */}
      <div className="top-actions">
        <button
          className="toggle-mode-btn"
          onClick={handleToggleColorMode}
          title={colorMode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <img
            src={colorMode === "dark" ? "./assets/dark-mode-toggle-icon.svg" : "./assets/light-mode-toggle-icon.svg"}
            alt="Toggle color theme"
          />
        </button>
      </div>

      {/* Header section */}
      <header className="header-section">
        <h1 className="main-title">Calculá las mejores materias a las que anotarte</h1>
        <h2 className="subtitle">Elegí las materias que aprobaste hasta ahora y obtené una recomendación óptima para recibirte en el menor tiempo posible.</h2>
        <div className="subtitle-green">Las correlativas están actualizadas para 2026 :D</div>
        <p className="helper-text">
          Si no te querés anotar a las correlativas de una materia en final, marcá la materia del final como &quot;Final (ignorar)&quot;.
        </p>
      </header>

      {/* Stats Dashboard */}
      <section className="stats-dashboard glass-card">
        <div className="stat-item">
          <div className="stat-value completed">{stats.approved} / {stats.total}</div>
          <div className="stat-label">Materias Completadas</div>
          <div className="progress-container">
            <div className="progress-fill-bar" style={{ width: `${stats.percent}%` }} />
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.percent}%</div>
          <div className="stat-label">Porcentaje de Carrera</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.estimatedSemesters}</div>
          <div className="stat-label">
            Cuatris Mínimos Hasta Recibirte
            <button
              className="help-trigger"
              data-tooltip="El camino más largo de correlativas que te faltan cursar. No es un número realista salvo que hagas muchas materias por cuatri."
            >
              ⓘ
            </button>
          </div>
        </div>
      </section>

      {/* Search and filtering */}
      <div className="search-container">
        <svg className="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar materia por nombre o código..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Grid */}
      <main className="dashboard-grid">

        {/* Quick Selection Card */}
        <div className="glass-card quick-select-card">
          <div className="quick-select-title" style={{ marginBottom: "14px" }}>
            Aprobar todas las materias de:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {SUBJECT_GROUPS.map(group => {
              const isAllChecked = isGroupAllApproved(group.key);
              const shortName = group.name === "Primer Año" ? "Todo 1°" :
                group.name === "Segundo Año" ? "Todo 2°" :
                  group.name === "Tercer Año" ? "Todo 3°" :
                    group.name === "Cuarto Año" ? "Todo 4°" :
                      group.name === "Quinto Año" ? "Todo 5°" : "Transversales";
              return (
                <label
                  key={`quick-right-${group.key}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    margin: 0,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    background: isAllChecked ? "rgba(37, 99, 235, 0.12)" : "rgba(255, 255, 255, 0.02)",
                    border: isAllChecked ? "1px solid var(--btn-primary-bg)" : "1px solid var(--border-color)",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    color: isAllChecked ? "var(--text-primary)" : "var(--text-secondary)",
                    userSelect: "none",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={(e) => handleQuickSelectChange(group.key, e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  {shortName}
                </label>
              );
            })}
          </div>
        </div>

        {/* Left Column: Subjects checklist */}
        <section className="glass-card checklist-section">
          <div className="subject-checklist-container">
            {filteredGroups.map(group => {
              const count = getGroupCompletedCount(group.key);
              const isAllChecked = isGroupAllApproved(group.key);

              return (
                <div key={group.key} className="year-section">
                  <div className="year-title">
                    <span>{group.name}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "10px" }}>
                      <span>({count.passed} / {count.total})</span>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "4px", margin: 0, cursor: "pointer", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        <input
                          type="checkbox"
                          checked={isAllChecked}
                          onChange={(e) => handleQuickSelectChange(group.key, e.target.checked)}
                          style={{ cursor: "pointer" }}
                        />
                        Aprobar Todo
                      </label>
                    </span>
                  </div>

                  <div className="subject-rows-container">
                    {group.subjects.map(subject => {
                      const status = subjectStatuses[subject.id] || "No cursada";

                      const stateClass = status === "Final (ignorar)" ? "Final-ignorar" :
                        status === "No la voy a cursar" ? "No-la-voy-a-cursar" : status;
                      return (
                        <div key={subject.id} className={`subject-row state-${stateClass}`}>
                          <div className="subject-info">
                            ({subject.id}) {subject.nombre}
                          </div>

                          <div className="subject-actions">
                            {subject.id === 3680 ? (
                              <>
                                <button
                                  type="button"
                                  className="status-toggle-btn btn-no-cursar"
                                  onClick={() => handleSubjectStatusChange(subject.id, "No la voy a cursar")}
                                >
                                  Ignorar
                                </button>
                                <button
                                  type="button"
                                  className="status-toggle-btn btn-aprobada"
                                  onClick={() => handleSubjectStatusChange(subject.id, "Aprobada")}
                                >
                                  Aprobada
                                </button>
                                <button
                                  type="button"
                                  className="status-toggle-btn btn-no-cursada"
                                  onClick={() => handleSubjectStatusChange(subject.id, "No cursada")}
                                >
                                  No cursada
                                </button>
                              </>
                            ) : subject.id === 3671 ? (
                              <>
                                <button
                                  type="button"
                                  className="status-toggle-btn btn-aprobada"
                                  onClick={() => handleSubjectStatusChange(subject.id, "Aprobada")}
                                >
                                  Aprobada
                                </button>
                                <button
                                  type="button"
                                  className="status-toggle-btn btn-final"
                                  onClick={() => handleSubjectStatusChange(subject.id, "Final")}
                                >
                                  En curso
                                </button>
                                <button
                                  type="button"
                                  className="status-toggle-btn btn-no-cursada"
                                  onClick={() => handleSubjectStatusChange(subject.id, "No cursada")}
                                >
                                  No cursada
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="status-toggle-btn btn-aprobada"
                                  onClick={() => handleSubjectStatusChange(subject.id, "Aprobada")}
                                >
                                  Aprobada
                                </button>
                                <button
                                  type="button"
                                  className="status-toggle-btn btn-final"
                                  onClick={() => handleSubjectStatusChange(subject.id, "Final")}
                                >
                                  Final
                                </button>
                                <button
                                  type="button"
                                  className="status-toggle-btn btn-final-ignorar"
                                  onClick={() => handleSubjectStatusChange(subject.id, "Final (ignorar)")}
                                >
                                  Final (ignorar)
                                </button>
                                <button
                                  type="button"
                                  className="status-toggle-btn btn-no-cursada"
                                  onClick={() => handleSubjectStatusChange(subject.id, "No cursada")}
                                >
                                  No cursada
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredGroups.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px" }}>
                No se encontraron materias que coincidan con la búsqueda.
              </p>
            )}
          </div>
        </section>

        {/* Right Column: Settings & Calculator controls */}
        <section className="settings-panel">

          {/* Configuration Card */}
          <div className="glass-card">
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Size config */}
              <div className="setting-row">
                <div className="setting-label">
                  ¿A cuántas materias te querés anotar?
                </div>
                <div className="pill-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`pill-btn ${numSubjects === val ? "active" : ""}`}
                      onClick={() => handleNumSubjectsChange(val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                {numSubjects >= 7 && (
                  <div className="lucky-warning">
                    <span>😱 ¡Mucha suerte!</span>
                  </div>
                )}
              </div>

              {/* Semester config */}
              <div className="setting-row">
                <div className="setting-label">
                  ¿Para qué cuatrimestre te vas a anotar?
                </div>
                <div className="pill-grid">
                  {[
                    { label: "Primero", val: 1 },
                    { label: "Segundo", val: 2 },
                    { label: "Verano", val: 3 }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      className={`pill-btn ${semester === opt.val ? "active" : ""}`}
                      onClick={() => handleSemesterChange(opt.val)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title priority config */}
              <div className="setting-row">
                <div className="setting-label">
                  ¿Querés priorizar el título intermedio?
                  <button
                    className="help-trigger"
                    data-tooltip="Activar esto va a hacer que el sistema te recomiende cursar RSU (materia de segundo sin correlativas posteriores) antes que cualquier materia de cuarto o quinto. No es lo más óptimo para el tiempo de recibirse pero sí para el del intermedio."
                  >
                    ⓘ
                  </button>
                </div>
                <div className="pill-grid">
                  {[
                    { label: "No", val: false },
                    { label: "Sí", val: true }
                  ].map(opt => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      className={`pill-btn ${intermediatePriority === opt.val ? "active" : ""}`}
                      onClick={() => handlePriorityChange(opt.val)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset/Calc CTA Row */}
              <div className="action-buttons-row">
                <button
                  type="button"
                  className="main-btn btn-calculate"
                  onClick={handleCalculate}
                >
                  Calcular recomendación
                </button>

                <button
                  type="button"
                  className="main-btn btn-reset"
                  onClick={handleReset}
                >
                  Resetear
                </button>
              </div>

            </div>
          </div>

          {/* Results Display Panel */}
          {hasCalculated && (
            <div className="glass-card">
              <div className="results-container">

                {/* 1. Recommended subjects next semester */}
                <div>
                  <div className="result-card-heading">
                    <span>Materias recomendadas para cursar:</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={handleExportToClipboard}
                        style={{
                          background: "rgba(59, 130, 246, 0.12)",
                          color: "var(--status-no-cursar-text)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "var(--transition-smooth)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(59, 130, 246, 0.22)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
                        }}
                      >
                        📋 Copiar
                      </button>
                      <button
                        className="help-trigger"
                        data-tooltip="El sistema calcula el camino de correlativas más largo hasta recibirte y en base a eso te ordena las materias según la longitud de su camino, de mayor a menor. El número a la izquierda significa cuántos cuatris tenés para aprobarla (sin contar verano), antes de atrasarte en tu tiempo mínimo hasta recibirse."
                      >
                        ⓘ
                      </button>
                    </div>
                  </div>

                  {calculationResults && (calculationResults.materias_fijas.length > 0 || calculationResults.materias_opcionales.length > 0) ? (
                    <div className="result-list">
                      {calculationResults.materias_fijas.map((item, idx) => {
                        const parsed = parseResultItem(item);
                        return (
                          <div key={`fija-${idx}`} className="result-item">
                            <span className={`result-badge ${parsed.badgeClass}`}>
                              {parsed.corchete}
                            </span>
                            <span className="result-text">{parsed.nombre}</span>
                            <span className="result-code" style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                              ({parsed.id})
                            </span>
                          </div>
                        );
                      })}

                      {calculationResults.materias_opcionales.length > 0 && calculationResults.cantidad_a_elegir > 0 && (
                        <div style={{ marginTop: "12px", marginBottom: "4px" }}>
                          <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                            Más {calculationResults.cantidad_a_elegir} de las siguientes materias, según tu preferencia:
                          </p>
                        </div>
                      )}

                      {calculationResults.materias_opcionales.map((item, idx) => {
                        const parsed = parseResultItem(item);
                        return (
                          <div key={`opc-${idx}`} className="result-item" style={{ borderStyle: "dashed" }}>
                            <span className={`result-badge ${parsed.badgeClass}`}>
                              {parsed.corchete}
                            </span>
                            <span className="result-text">{parsed.nombre}</span>
                            <span className="result-code" style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                              ({parsed.id})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-results">No tenés ninguna materia disponible para cursar actualmente.</div>
                  )}
                </div>

                {/* 2. All unlocked subjects (puedo cursar) */}
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "32px", marginTop: "32px" }}>
                  <div className="result-card-heading">
                    <span>Todas las materias que podrías cursar:</span>
                  </div>
                  <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Mientras más bajo el número, más urgente es cursarla.
                  </p>

                  {allAvailableSubjects.length > 0 ? (
                    <div className="result-list">
                      {allAvailableSubjects.map((item, idx) => {
                        const parsed = parseResultItem(item);
                        return (
                          <div key={`avail-${idx}`} className="result-item">
                            <span className={`result-badge ${parsed.badgeClass}`}>
                              {parsed.corchete}
                            </span>
                            <span className="result-text">{parsed.nombre}</span>
                            <span className="result-code" style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                              ({parsed.id})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-results">No tenés ninguna materia disponible para cursar actualmente.</div>
                  )}
                </div>

              </div>
            </div>
          )}

        </section>

      </main>

      {/* Footer link section */}
      <footer className="footer-section">
        <div className="footer-copy">© 2025 - {new Date().getFullYear()} Agustín Kiryczun</div>
        <div className="footer-links">
          <a
            href="https://github.com/AgusKir/elegir-materias"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link-btn"
          >
            <img src="./assets/github-logo.svg" alt="GitHub" />
            GitHub
          </a>
          <a
            href="mailto:agustin.kiryczun@gmail.com"
            className="footer-link-btn"
          >
            <img src="./assets/email-logo.svg" alt="Email" />
            Enviame un email
          </a>
        </div>
      </footer>
    </div>
  );
}
