"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SubjectStatus, SubjectData, CalculationResult, ActiveTab, ParsedResultItem, SaveState } from "../types";

import {
  PlanDeEstudios,
  LISTADO_MATERIAS,
  TABLA_NOMBRES,
  PREVIOUS_SUBJECTS_3671,
  getPrerequisitesMap
} from "../utils/planDeEstudios";
import SubjectGraphMap from "../components/SubjectGraphMap";

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

  // Tab navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>("calculadora");

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

  // Save States state (up to 3 save slots)
  const [saveStatesModalMode, setSaveStatesModalMode] = useState<"save" | "load" | null>(null);
  const [overwriteWarningSlotId, setOverwriteWarningSlotId] = useState<number | null>(null);
  const [saveStates, setSaveStates] = useState<Record<number, SaveState | null>>({ 1: null, 2: null, 3: null });

  // Simulation mode for "Ver siguiente cuatri"
  const [isSimulatingNext, setIsSimulatingNext] = useState<boolean>(false);
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<number[]>([]);

  // Active Toast messages
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [quickSelectToastShown, setQuickSelectToastShown] = useState<boolean>(false);

  const prereqsMap = useMemo(() => getPrerequisitesMap(), []);

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

    // Load save states 1, 2, 3
    const loadedSaveStates: Record<number, SaveState | null> = { 1: null, 2: null, 3: null };
    [1, 2, 3].forEach(slot => {
      const raw = localStorage.getItem(`elegir_materias_save_state_${slot}`);
      if (raw) {
        try {
          loadedSaveStates[slot] = JSON.parse(raw);
        } catch (e) {
          console.error(`Error loading save state slot ${slot}`, e);
        }
      }
    });
    setSaveStates(loadedSaveStates);

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
      const match = itemStr.match(/^\[(?:-?\d+|\(i\)|i)\]\s*(.+)\s*\((\d+)\)$/);
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

  // Save & Load state handlers
  const handleSaveToSlot = (slotId: number, forceOverwrite = false) => {
    const existing = saveStates[slotId];
    if (existing && !forceOverwrite) {
      setOverwriteWarningSlotId(slotId);
      return;
    }

    let approved = 0;
    let total = ALL_SUBJECT_IDS.length;
    const isIntegracionIgnored = subjectStatuses[3680] === "No la voy a cursar";
    if (isIntegracionIgnored) total -= 1;

    ALL_SUBJECT_IDS.forEach(id => {
      const status = subjectStatuses[id];
      if (status && status !== "No cursada") {
        if (id === 3680 && isIntegracionIgnored) return;
        approved++;
      }
    });

    const now = new Date();
    const dateFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newState: SaveState = {
      slotId,
      timestamp: Date.now(),
      dateFormatted,
      approvedCount: approved,
      totalCount: total,
      subjectStatuses: { ...subjectStatuses },
      numSubjects,
      semester,
      intermediatePriority
    };

    localStorage.setItem(`elegir_materias_save_state_${slotId}`, JSON.stringify(newState));
    setSaveStates(prev => ({ ...prev, [slotId]: newState }));
    setOverwriteWarningSlotId(null);
    showToast(`¡Estado ${slotId} guardado correctamente!`);
  };

  const handleLoadFromSlot = (slotId: number) => {
    const targetState = saveStates[slotId];
    if (!targetState) return;

    setSubjectStatuses(targetState.subjectStatuses);

    ALL_SUBJECT_IDS.forEach(id => {
      const st = targetState.subjectStatuses[id];
      if (!st || st === "No cursada") {
        localStorage.removeItem(`subject-status-${id}`);
      } else {
        localStorage.setItem(`subject-status-${id}`, st);
      }
    });

    const checkedIds: number[] = [];
    Object.entries(targetState.subjectStatuses).forEach(([sid, sval]) => {
      const parsedId = parseInt(sid, 10);
      if (sval === "Aprobada" || sval === "Final" || sval === "No la voy a cursar") {
        checkedIds.push(parsedId);
      }
    });
    localStorage.setItem("completedSubjects", JSON.stringify(checkedIds));

    let loadedSemester = semester;
    if (targetState.numSubjects) {
      setNumSubjects(targetState.numSubjects);
      localStorage.setItem("numSubjects", String(targetState.numSubjects));
    }
    if (targetState.semester) {
      loadedSemester = targetState.semester;
      setSemester(targetState.semester);
      localStorage.setItem("semester", String(targetState.semester));
    }
    if (targetState.intermediatePriority !== undefined) {
      setIntermediatePriority(targetState.intermediatePriority);
      localStorage.setItem("intermediatePriority", targetState.intermediatePriority ? "yes" : "no");
    }

    setSaveStatesModalMode(null);
    showToast(`¡Estado ${slotId} cargado con éxito!`);

    if (hasCalculated) {
      handleCalculate(targetState.subjectStatuses, loadedSemester);
    }
  };

  const handleClearSlot = (slotId: number) => {
    if (confirm(`¿Estás seguro de que querés borrar los datos del Estado ${slotId}?`)) {
      localStorage.removeItem(`elegir_materias_save_state_${slotId}`);
      setSaveStates(prev => ({ ...prev, [slotId]: null }));
      showToast(`Estado ${slotId} eliminado.`);
    }
  };

  // Next semester subject selection toggle
  const toggleNextSemesterSubject = (numericId?: number) => {
    if (!numericId) return;

    if (selectedOptionalIds.includes(numericId)) {
      setSelectedOptionalIds(prev => prev.filter(id => id !== numericId));
    } else {
      if (selectedOptionalIds.length >= numSubjects) {
        if (numSubjects === 1) {
          setSelectedOptionalIds([numericId]);
        } else {
          showToast(`Ya seleccionaste las ${numSubjects} materias a cursar. Podés hacer click sobre una materia previamente seleccionada para desmarcarla.`, 4000);
        }
      } else {
        setSelectedOptionalIds(prev => [...prev, numericId]);
      }
    }
  };

  // 6. Core calculate action
  const handleCalculate = (overrideStatuses?: Record<number, SubjectStatus>, overrideSemester?: number) => {
    const activeStatuses = overrideStatuses || subjectStatuses;
    const activeSemester = overrideSemester !== undefined ? overrideSemester : semester;

    // Exclude Final (ignorar) IDs
    const finalIgnorarIds: number[] = [];
    ALL_SUBJECT_IDS.forEach(id => {
      if (activeStatuses[id] === "Final (ignorar)") {
        finalIgnorarIds.push(id);
      }
    });

    const approvedList: number[] = [];
    ALL_SUBJECT_IDS.forEach(id => {
      const val = activeStatuses[id];
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
      planFiltrado.calcularYGuardarLongitudes(activeSemester);

      // Adjust for 3671 (Proyecto Final) if semester is 1
      if (planFiltrado.datos_materias[3671] && activeSemester === 1) {
        planFiltrado.ajustarCuatrimestre3671YPropagar(activeSemester);
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
          if (id === 3671 && activeSemester !== 1) return false;
          return !finalIgnorarIds.includes(id);
        });

        opcFiltradas = (calculated.materias_opcionales || []).filter(item => {
          const id = getMateriaId(item);
          if (id === null) return !finalIgnorarIds.includes(0);
          if (id === 3671 && activeSemester !== 1) return false;
          return !finalIgnorarIds.includes(id);
        });

        if (fijasFiltradas.length + opcFiltradas.length >= numSubjects || requestCount > numSubjects + 10) {
          break;
        }
        requestCount++;
      }

      // Get all available subjects list
      const allAvailable = planFiltrado.puedoCursarEnCuatri(1);
      let filteredAllAvailable = allAvailable.filter(item => {
        const id = getMateriaId(item);
        if (id === null) return !finalIgnorarIds.includes(0);
        if (id === 3671 && activeSemester !== 1) return false;
        return !finalIgnorarIds.includes(id);
      });

      // --- CONDITIONAL ENROLLMENT RULES FOR 3671 IN SEMESTER 1 ---
      // If semester === 1, check the 4 prerequisites of 3671 (3656, 3659, 3660, 3667)
      if (activeSemester === 1) {
        const prev3671Approved = PREVIOUS_SUBJECTS_3671.map(id => {
          const st = activeStatuses[id];
          return st === "Aprobada" || st === "Final" || st === "No la voy a cursar";
        });
        const all4PrevApproved = prev3671Approved.every(Boolean);

        // Check if all 4 are either approved OR eligible to take this cuatri (i.e. their prereqs are met)
        const all4PrevReadyForCond = PREVIOUS_SUBJECTS_3671.every(id => {
          const st = activeStatuses[id];
          if (st === "Aprobada" || st === "Final" || st === "No la voy a cursar") return true;
          const prereqs = prereqsMap[id] || [];
          return prereqs.every(pId => {
            const pst = activeStatuses[pId];
            return pst === "Aprobada" || pst === "Final" || pst === "No la voy a cursar";
          });
        });

        // If all 4 are fulfilled (either approved or available to take) and NOT all 4 are approved:
        if (all4PrevReadyForCond && !all4PrevApproved) {
          const conditional3671Str = `[(i)] Proyecto Final de Carrera (3671)`;

          // Replace or insert 3671 into recommended list
          const existing3671IndexFijas = fijasFiltradas.findIndex(s => s.includes("(3671)"));
          if (existing3671IndexFijas !== -1) {
            fijasFiltradas[existing3671IndexFijas] = conditional3671Str;
          } else {
            const existing3671IndexOpc = opcFiltradas.findIndex(s => s.includes("(3671)"));
            if (existing3671IndexOpc !== -1) {
              opcFiltradas[existing3671IndexOpc] = conditional3671Str;
            } else {
              fijasFiltradas.push(conditional3671Str);
            }
          }

          // Ensure it's in allAvailableSubjects as well
          const existingAvailIndex = filteredAllAvailable.findIndex(s => s.includes("(3671)"));
          if (existingAvailIndex !== -1) {
            filteredAllAvailable[existingAvailIndex] = conditional3671Str;
          } else {
            filteredAllAvailable.push(conditional3671Str);
          }
        }
      }

      // Pre-select top numSubjects IDs for next semester advancement convenience
      const preselected: number[] = [];
      const addIfValid = (itemStr: string) => {
        const id = getMateriaId(itemStr);
        if (id && !preselected.includes(id) && preselected.length < numSubjects) {
          preselected.push(id);
        }
      };

      fijasFiltradas.forEach(addIfValid);
      opcFiltradas.forEach(addIfValid);
      filteredAllAvailable.forEach(addIfValid);
      setSelectedOptionalIds(preselected);

      // Set recommended subjects
      setCalculationResults({
        materias_fijas: fijasFiltradas,
        materias_opcionales: opcFiltradas,
        cantidad_a_elegir: Math.max(0, numSubjects - fijasFiltradas.length)
      });

      setAllAvailableSubjects(filteredAllAvailable);
      setIsSimulatingNext(false);
      setHasCalculated(true);
    } catch (error: any) {
      console.error(error);
      alert(`Error al calcular las materias: ${error.message}`);
    }
  };

  // Start simulation mode handler
  const handleStartSimulation = () => {
    if (!hasCalculated || allAvailableSubjects.length === 0) return;

    const targetCount = Math.min(numSubjects, allAvailableSubjects.length);
    if (selectedOptionalIds.length < targetCount) {
      const preselected: number[] = [];
      const addIfValid = (itemStr: string) => {
        const parsed = parseResultItem(itemStr);
        if (parsed.numericId && !preselected.includes(parsed.numericId) && preselected.length < targetCount) {
          preselected.push(parsed.numericId);
        }
      };
      if (calculationResults) {
        calculationResults.materias_fijas.forEach(addIfValid);
        calculationResults.materias_opcionales.forEach(addIfValid);
      }
      allAvailableSubjects.forEach(addIfValid);
      setSelectedOptionalIds(preselected);
    }
    setIsSimulatingNext(true);
  };

  // Cancel simulation mode handler
  const handleCancelSimulation = () => {
    setIsSimulatingNext(false);
  };

  // Confirm and advance semester handler
  const handleNextSemester = () => {
    if (!hasCalculated || allAvailableSubjects.length === 0) return;

    const targetCount = Math.min(numSubjects, allAvailableSubjects.length);

    if (selectedOptionalIds.length < targetCount) {
      showToast(`⚠️ Por favor seleccioná ${targetCount} materia(s) de "Todas las materias que podrías cursar" antes de avanzar al siguiente cuatrimestre.`, 6000);
      return;
    }

    const nextStatuses = { ...subjectStatuses };
    selectedOptionalIds.forEach(id => {
      if (id === 3671) {
        if (subjectStatuses[3671] === "Final") {
          nextStatuses[3671] = "Aprobada";
          localStorage.setItem("subject-status-3671", "Aprobada");
        } else {
          nextStatuses[3671] = "Final";
          localStorage.setItem("subject-status-3671", "Final");
        }
      } else {
        nextStatuses[id] = "Aprobada";
        localStorage.setItem(`subject-status-${id}`, "Aprobada");
      }
    });

    setSubjectStatuses(nextStatuses);

    const checkedIds: number[] = [];
    Object.entries(nextStatuses).forEach(([sid, sval]) => {
      const parsedId = parseInt(sid, 10);
      if (sval === "Aprobada" || sval === "Final" || sval === "No la voy a cursar") {
        checkedIds.push(parsedId);
      }
    });
    localStorage.setItem("completedSubjects", JSON.stringify(checkedIds));

    // Toggle semester: 1 -> 2, 2 -> 1, 3 -> 1
    const nextSem = semester === 1 ? 2 : 1;
    setSemester(nextSem);
    localStorage.setItem("semester", String(nextSem));

    const countApproved = selectedOptionalIds.length;
    setSelectedOptionalIds([]);
    setIsSimulatingNext(false);

    showToast(`¡Avanzaste al siguiente cuatrimestre! Se aprobaron las ${countApproved} materias seleccionadas y se calculó la nueva recomendación.`, 6000);

    // Recalculate instantly
    handleCalculate(nextStatuses, nextSem);
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
      setSelectedOptionalIds([]);
      setIsSimulatingNext(false);
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
  const parseResultItem = (itemStr: string): ParsedResultItem => {
    // format is "[corchete] Nombre (id)" or "[(i)] Nombre (id)"
    const match = itemStr.match(/^\[(\(i\)|i|-?\d+)\]\s*(.+)\s*\((\d+)\)$/);
    if (match) {
      const [_, corcheteStr, nombre, idStr] = match;
      const numId = parseInt(idStr, 10);
      const isCondBracket = corcheteStr === "(i)" || corcheteStr === "i";
      const val = isCondBracket ? 0 : parseInt(corcheteStr, 10);

      let badgeClass = "blue";
      if (isCondBracket) badgeClass = "info";
      else if (val <= 1) badgeClass = "critical";
      else if (val === 2) badgeClass = "orange";
      else if (val === 3) badgeClass = "yellow";
      else if (val === 4) badgeClass = "green-light";
      else if (val === 5) badgeClass = "green-dark";
      else badgeClass = "blue";

      let isConditional = isCondBracket;
      let conditionalMessage = "";

      if (isCondBracket || (numId === 3671 && semester === 1)) {
        isConditional = true;
        conditionalMessage = "Podrías cursarla si te anotás en cursada condicional y este mismo cuatri rendís las correlativas que te faltan. Para más información, contactate con el coordinador de la carrera.";
      } else if ((semester === 2 || semester === 3) && PREVIOUS_SUBJECTS_3671.includes(numId)) {
        isConditional = true;
        conditionalMessage = "Esta materia podrías cursarla el primer cuatri junto al proyecto final si te anotás en cursada condicional. Para más información, contactate con el coordinador de la carrera.";
      }

      return {
        id: idStr,
        numericId: numId,
        nombre: nombre.trim(),
        corchete: val,
        displayCorchete: isCondBracket ? "(i)" : val,
        badgeClass,
        isConditional,
        conditionalMessage
      };
    }

    const idMatch = itemStr.match(/\((\d+)\)/);
    const numId = idMatch ? parseInt(idMatch[1], 10) : undefined;
    return {
      id: numId ? String(numId) : "N/A",
      numericId: numId,
      nombre: itemStr,
      corchete: 0,
      displayCorchete: "0",
      badgeClass: "info"
    };
  };

  // Maps for SubjectGraphMap
  const recommendedMap = useMemo(() => {
    const map: Record<number, ParsedResultItem> = {};
    if (!calculationResults) return map;
    calculationResults.materias_fijas.forEach(item => {
      const parsed = parseResultItem(item);
      if (parsed.numericId) map[parsed.numericId] = parsed;
    });
    calculationResults.materias_opcionales.forEach(item => {
      const parsed = parseResultItem(item);
      if (parsed.numericId) map[parsed.numericId] = parsed;
    });
    return map;
  }, [calculationResults, semester]);

  const availableMap = useMemo(() => {
    const map: Record<number, ParsedResultItem> = {};
    allAvailableSubjects.forEach(item => {
      const parsed = parseResultItem(item);
      if (parsed.numericId) map[parsed.numericId] = parsed;
    });
    return map;
  }, [allAvailableSubjects, semester]);

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

        {/* Section Navigation Tabs: Calculadora & Mapa */}
        <div className="main-tab-nav">
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === "calculadora" ? "active" : ""}`}
            onClick={() => setActiveTab("calculadora")}
          >
            <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Calculadora
          </button>
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === "mapa" ? "active" : ""}`}
            onClick={() => setActiveTab("mapa")}
          >
            <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Mapa de Correlatividades
          </button>
        </div>
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

      {/* View Switcher: Calculadora vs Mapa */}
      {activeTab === "mapa" ? (
        <SubjectGraphMap
          subjectStatuses={subjectStatuses}
          onStatusChange={handleSubjectStatusChange}
          recommendedMap={recommendedMap}
          availableMap={availableMap}
          semester={semester}
          onNavigateToCalculator={() => setActiveTab("calculadora")}
        />
      ) : (
        <>
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
                                      title="Te va a recomendar las correlativas. No las vas a poder promocionar salvo que metas el final"
                                    >
                                      Final
                                    </button>
                                    <button
                                      type="button"
                                      className="status-toggle-btn btn-final-ignorar"
                                      onClick={() => handleSubjectStatusChange(subject.id, "Final (ignorar)")}
                                      title="No te va a recomendar las correlativas"
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
                        data-tooltip="Activar esto va a hacer que, por ejemplo, te recomiende cursar RSU (materia de segundo sin correlativas posteriores) antes que cualquier materia de cuarto o quinto. No es lo más óptimo para el tiempo de recibirse pero sí para el intermedio."
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
                      onClick={() => handleCalculate()}
                    >
                      Calcular recomendación
                    </button>

                    <button
                      type="button"
                      className="main-btn btn-save-state"
                      onClick={() => setSaveStatesModalMode("save")}
                    >
                      💾 Guardar estado
                    </button>

                    <button
                      type="button"
                      className="main-btn btn-load-state"
                      onClick={() => setSaveStatesModalMode("load")}
                    >
                      📂 Cargar estado
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
                    {!isSimulatingNext && (
                      <div>
                        <div className="result-card-heading">
                          <span>Materias recomendadas para cursar:</span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="btn-next-semester"
                              onClick={handleStartSimulation}
                              title="Simular el siguiente cuatrimestre seleccionando qué materias vas a aprobar"
                            >
                              ⏩ Simular siguiente cuatri
                            </button>
                            <button
                              type="button"
                              onClick={handleExportToClipboard}
                              className="btn-copy-results"
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
                                <div
                                  key={`fija-${idx}`}
                                  className="result-item"
                                >
                                  <span className={`result-badge ${parsed.badgeClass}`}>
                                    {parsed.displayCorchete}
                                  </span>
                                  <span className="result-text">
                                    {parsed.nombre}
                                  </span>
                                  {parsed.isConditional && (
                                    <span
                                      className="conditional-info-trigger"
                                      data-tooltip={parsed.conditionalMessage}
                                      title={parsed.conditionalMessage}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      (i)
                                    </span>
                                  )}
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
                                <div
                                  key={`opc-${idx}`}
                                  className="result-item"
                                  style={{ borderStyle: "dashed" }}
                                >
                                  <span className={`result-badge ${parsed.badgeClass}`}>
                                    {parsed.displayCorchete}
                                  </span>
                                  <span className="result-text">
                                    {parsed.nombre}
                                  </span>
                                  {parsed.isConditional && (
                                    <span
                                      className="conditional-info-trigger"
                                      data-tooltip={parsed.conditionalMessage}
                                      title={parsed.conditionalMessage}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      (i)
                                    </span>
                                  )}
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
                    )}

                    {/* 2. All unlocked subjects (puedo cursar) */}
                    <div style={{ borderTop: !isSimulatingNext ? "1px solid var(--border-color)" : "none", paddingTop: !isSimulatingNext ? "32px" : "0", marginTop: !isSimulatingNext ? "32px" : "0" }}>
                      <div className="result-card-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <span>Todas las materias que podrías cursar:</span>
                          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                            Mientras más bajo el número, más urgente es cursarla.
                          </p>
                        </div>
                        {isSimulatingNext && (
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="btn-next-semester"
                              onClick={handleNextSemester}
                              title="Avanzar al siguiente cuatrimestre aprobando las materias seleccionadas"
                            >
                              ✓ Confirmar y avanzar cuatrimestre
                            </button>
                            <button
                              type="button"
                              className="btn-copy-results"
                              onClick={handleCancelSimulation}
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>

                      {isSimulatingNext && (
                        <div className="optional-selection-banner" style={{ margin: "16px 0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                            <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
                              💡 Seleccioná las {numSubjects} materias que querés aprobar para avanzar al siguiente cuatri (hacé click sobre cualquier materia):
                            </p>
                            <span className="optional-counter-badge" style={{ color: selectedOptionalIds.length === Math.min(numSubjects, allAvailableSubjects.length) ? "var(--status-aprobada-text)" : "var(--status-final-text)" }}>
                              Seleccionadas: {selectedOptionalIds.length} / {Math.min(numSubjects, allAvailableSubjects.length)}
                            </span>
                          </div>
                        </div>
                      )}

                      {allAvailableSubjects.length > 0 ? (
                        <div className="result-list">
                          {allAvailableSubjects.map((item, idx) => {
                            const parsed = parseResultItem(item);
                            const isSelected = isSimulatingNext && parsed.numericId ? selectedOptionalIds.includes(parsed.numericId) : false;
                            return (
                              <div
                                key={`avail-${idx}`}
                                className={`result-item ${isSimulatingNext ? "optional-selectable" : ""} ${isSelected ? "selected" : ""}`}
                                onClick={() => {
                                  if (isSimulatingNext) {
                                    toggleNextSemesterSubject(parsed.numericId);
                                  }
                                }}
                                title={isSimulatingNext ? "Hacé click para seleccionar o desmarcar esta materia para el siguiente cuatrimestre" : undefined}
                                style={{ cursor: isSimulatingNext ? "pointer" : "default" }}
                              >
                                <span className={`result-badge ${isSelected ? "green-dark" : parsed.badgeClass}`}>
                                  {isSelected ? "✓" : parsed.displayCorchete}
                                </span>
                                <span className="result-text" style={{ fontWeight: isSelected ? "700" : "400" }}>
                                  {parsed.nombre}
                                </span>
                                {isSelected && (
                                  <span className="selected-tag">
                                    Elegida
                                  </span>
                                )}
                                {parsed.isConditional && (
                                  <span
                                    className="conditional-info-trigger"
                                    data-tooltip={parsed.conditionalMessage}
                                    title={parsed.conditionalMessage}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    (i)
                                  </span>
                                )}
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

                      {isSimulatingNext && allAvailableSubjects.length > 0 && (
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                          <button
                            type="button"
                            className="btn-copy-results"
                            onClick={handleCancelSimulation}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            className="btn-next-semester"
                            onClick={handleNextSemester}
                          >
                            ✓ Confirmar y avanzar cuatrimestre
                          </button>
                        </div>
                      )}
                    </div>


                  </div>
                </div>
              )}

            </section>

          </main>
        </>
      )}

      {/* Save / Load State Modal */}
      {saveStatesModalMode !== null && (
        <div className="modal-backdrop" onClick={() => { setSaveStatesModalMode(null); setOverwriteWarningSlotId(null); }}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {saveStatesModalMode === "save" ? "💾 Guardar estado actual" : "📂 Cargar estado guardado"}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => { setSaveStatesModalMode(null); setOverwriteWarningSlotId(null); }}
              >
                ✕
              </button>
            </div>

            <div className="modal-mode-tabs">
              <button
                type="button"
                className={`modal-tab-btn ${saveStatesModalMode === "save" ? "active" : ""}`}
                onClick={() => { setSaveStatesModalMode("save"); setOverwriteWarningSlotId(null); }}
              >
                Guardar estado
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${saveStatesModalMode === "load" ? "active" : ""}`}
                onClick={() => { setSaveStatesModalMode("load"); setOverwriteWarningSlotId(null); }}
              >
                Cargar estado
              </button>
            </div>

            <p className="modal-description">
              {saveStatesModalMode === "save"
                ? "Guardá tu progreso o configuración actual en una de las 3 ranuras disponibles."
                : "Seleccioná uno de los estados guardados anteriormente para restaurar tu progreso."}
            </p>

            {/* Overwrite warning prompt if triggered */}
            {overwriteWarningSlotId !== null ? (
              <div className="modal-warning-box">
                <div className="warning-title">⚠️ ¿Sobrescribir Estado {overwriteWarningSlotId}?</div>
                <p className="warning-text">
                  El Estado {overwriteWarningSlotId} ya tiene datos guardados del{" "}
                  <strong>{saveStates[overwriteWarningSlotId]?.dateFormatted}</strong> con{" "}
                  <strong>{saveStates[overwriteWarningSlotId]?.approvedCount} materias aprobadas</strong>.
                  Si continuás, se va a reemplazar por tu selección actual.
                </p>
                <div className="warning-actions">
                  <button
                    type="button"
                    className="main-btn btn-danger"
                    onClick={() => handleSaveToSlot(overwriteWarningSlotId, true)}
                  >
                    Sí, sobrescribir
                  </button>
                  <button
                    type="button"
                    className="main-btn btn-secondary"
                    onClick={() => setOverwriteWarningSlotId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="slots-grid">
                {[1, 2, 3].map(slotId => {
                  const slotData = saveStates[slotId];
                  return (
                    <div key={slotId} className={`slot-card ${slotData ? "occupied" : "empty"}`}>
                      <div className="slot-header">
                        <span className="slot-badge">Estado {slotId}</span>
                        {slotData && (
                          <button
                            type="button"
                            className="slot-delete-btn"
                            onClick={() => handleClearSlot(slotId)}
                            title="Eliminar este estado guardado"
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      {slotData ? (
                        <div className="slot-body">
                          <div className="slot-main-info">
                            {slotData.approvedCount} / {slotData.totalCount} materias
                          </div>
                          <div className="slot-date">🕒 {slotData.dateFormatted}</div>
                          {slotData.semester && (
                            <div className="slot-sub-info">
                              {slotData.semester === 1 ? "Primer cuatri" : slotData.semester === 2 ? "Segundo cuatri" : "Curso de verano"}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="slot-body empty-body">
                          <span>Ranura vacía</span>
                        </div>
                      )}

                      <div className="slot-footer">
                        {saveStatesModalMode === "save" ? (
                          <button
                            type="button"
                            className="slot-action-btn btn-save"
                            onClick={() => handleSaveToSlot(slotId)}
                          >
                            {slotData ? "Sobrescribir" : "Guardar en Estado " + slotId}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="slot-action-btn btn-load"
                            disabled={!slotData}
                            onClick={() => handleLoadFromSlot(slotId)}
                          >
                            {slotData ? "Cargar Estado " + slotId : "Sin datos"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer link section */}
      <footer className="footer-section">
        <div className="footer-copy">© 2025 - {new Date().getFullYear()} Agustín Kiryczun</div>
        <div className="footer-links">
          <a
            href="https://agustinkiryczun.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link-btn"
          >
            <svg
              style={{ width: "18px", height: "18px", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Portfolio
          </a>
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


