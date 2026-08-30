"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { SubjectStatus, ParsedResultItem } from "../types";
import {
  PREVIOUS_SUBJECTS_3671,
  getPrerequisitesMap,
  getSuccessorsMap,
  getSubjectNamesMap
} from "../utils/planDeEstudios";

export interface SemesterColumn {
  id: string;
  yearName: string;
  semesterLabel: "C1" | "C2";
  yearNum: number;
  subjects: { id: number; nombre: string }[];
}

export const SEMESTER_COLUMNS: SemesterColumn[] = [
  {
    id: "1-c1",
    yearName: "1° Año",
    semesterLabel: "C1",
    yearNum: 1,
    subjects: [
      { id: 3621, nombre: "Matemática Discreta" },
      { id: 3622, nombre: "Análisis Matemático I" },
      { id: 3623, nombre: "Programación Inicial" },
      { id: 3624, nombre: "Introducción a los Sistemas de Información" },
      { id: 3625, nombre: "Sistemas de Numeración" },
      { id: 3626, nombre: "Principios de Calidad de Software" }
    ]
  },
  {
    id: "1-c2",
    yearName: "1° Año",
    semesterLabel: "C2",
    yearNum: 1,
    subjects: [
      { id: 3627, nombre: "Álgebra y Geometría Analítica I" },
      { id: 3628, nombre: "Física I" },
      { id: 3629, nombre: "Programación Estructurada Básica" },
      { id: 3630, nombre: "Introducción a la Gestión de Requisitos" },
      { id: 3631, nombre: "Fundamentos de Sistemas Embebidos" },
      { id: 3632, nombre: "Introducción a Proyectos Informáticos" }
    ]
  },
  {
    id: "2-c1",
    yearName: "2° Año",
    semesterLabel: "C1",
    yearNum: 2,
    subjects: [
      { id: 3633, nombre: "Análisis Matemático II" },
      { id: 3634, nombre: "Física II" },
      { id: 3635, nombre: "Tópicos de Programación" },
      { id: 3636, nombre: "Bases de Datos" },
      { id: 3637, nombre: "Análisis de Sistemas" },
      { id: 3638, nombre: "Arquitectura de Computadoras" },
      { id: 3676, nombre: "Responsabilidad Social Universitaria" }
    ]
  },
  {
    id: "2-c2",
    yearName: "2° Año",
    semesterLabel: "C2",
    yearNum: 2,
    subjects: [
      { id: 3639, nombre: "Análisis Matemático III" },
      { id: 3640, nombre: "Algoritmos y Estructuras de Datos" },
      { id: 3641, nombre: "Bases de Datos Aplicada" },
      { id: 3642, nombre: "Principios de Diseño de Sistemas" },
      { id: 3643, nombre: "Redes de Computadoras" },
      { id: 3644, nombre: "Gestión de las Organizaciones" },
      { id: 3680, nombre: "Taller de Integración" }
    ]
  },
  {
    id: "3-c1",
    yearName: "3° Año",
    semesterLabel: "C1",
    yearNum: 3,
    subjects: [
      { id: 3645, nombre: "Álgebra y Geometría Analítica II" },
      { id: 3646, nombre: "Paradigmas de Programación" },
      { id: 3647, nombre: "Requisitos Avanzados" },
      { id: 3648, nombre: "Diseño de Software" },
      { id: 3649, nombre: "Sistemas Operativos" },
      { id: 3650, nombre: "Seguridad de la Información" },
      { id: 3675, nombre: "Práctica Profesional Supervisada" }
    ]
  },
  {
    id: "3-c2",
    yearName: "3° Año",
    semesterLabel: "C2",
    yearNum: 3,
    subjects: [
      { id: 3651, nombre: "Probabilidad y Estadística" },
      { id: 3652, nombre: "Programación Avanzada" },
      { id: 3653, nombre: "Arquitecturas de Sistemas Software" },
      { id: 3654, nombre: "Virtualización de Hardware" },
      { id: 3655, nombre: "Auditoría y Legislación" }
    ]
  },
  {
    id: "4-c1",
    yearName: "4° Año",
    semesterLabel: "C1",
    yearNum: 4,
    subjects: [
      { id: 3656, nombre: "Estadística Aplicada" },
      { id: 3657, nombre: "Autómatas y Gramática" },
      { id: 3658, nombre: "Programación Concurrente" },
      { id: 3659, nombre: "Gestión Aplicada al Desarrollo de Software I" },
      { id: 3660, nombre: "Sistemas Operativos Avanzados" },
      { id: 3661, nombre: "Gestión de Proyectos" }
    ]
  },
  {
    id: "4-c2",
    yearName: "4° Año",
    semesterLabel: "C2",
    yearNum: 4,
    subjects: [
      { id: 3662, nombre: "Matemática Aplicada" },
      { id: 3663, nombre: "Lenguajes y Compiladores" },
      { id: 3664, nombre: "Inteligencia Artificial" },
      { id: 3665, nombre: "Gestión Aplicada al Desarrollo de Software II" },
      { id: 3666, nombre: "Seguridad Aplicada y Forensia" },
      { id: 3667, nombre: "Gestión de la Calidad en Procesos de Sistemas" }
    ]
  },
  {
    id: "5-c1",
    yearName: "5° Año",
    semesterLabel: "C1",
    yearNum: 5,
    subjects: [
      { id: 3668, nombre: "Inteligencia Artificial Aplicada" },
      { id: 3669, nombre: "Innovación y Emprendedorismo" },
      { id: 3670, nombre: "Ciencia de Datos" },
      { id: 3671, nombre: "Proyecto Final de Carrera" }
    ]
  },
  {
    id: "5-c2",
    yearName: "5° Año",
    semesterLabel: "C2",
    yearNum: 5,
    subjects: [
      { id: 3677, nombre: "Electiva I" },
      { id: 3678, nombre: "Electiva II" },
      { id: 3679, nombre: "Electiva III" }
    ]
  }
];

export const TRANSVERSALES_LINES = [
  {
    groupTitle: "Inglés",
    subjects: [
      { id: 901, nombre: "Inglés I" },
      { id: 902, nombre: "Inglés II" },
      { id: 903, nombre: "Inglés III" },
      { id: 904, nombre: "Inglés IV" }
    ]
  },
  {
    groupTitle: "Computación",
    subjects: [
      { id: 911, nombre: "Computación I" },
      { id: 912, nombre: "Computación II" }
    ]
  }
];

interface SubjectGraphMapProps {
  subjectStatuses: Record<number, SubjectStatus>;
  onStatusChange: (id: number, status: SubjectStatus) => void;
  recommendedMap: Record<number, ParsedResultItem>;
  availableMap: Record<number, ParsedResultItem>;
  semester: number;
  onNavigateToCalculator?: () => void;
}

export default function SubjectGraphMap({
  subjectStatuses,
  onStatusChange,
  recommendedMap,
  availableMap,
  semester
}: SubjectGraphMapProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [hoveredSubjectId, setHoveredSubjectId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAllConnections, setShowAllConnections] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll (panning) state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0, windowScrollY: 0 });
  const hasDraggedRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, input, select, textarea")) return;
    if (!containerRef.current) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
      windowScrollY: window.scrollY || document.documentElement.scrollTop
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      if (!hasDraggedRef.current) {
        hasDraggedRef.current = true;
        setIsPanning(true);
      }
      containerRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
      if (containerRef.current.scrollHeight > containerRef.current.clientHeight) {
        containerRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
      }
      window.scrollTo({
        top: dragStartRef.current.windowScrollY - dy,
        left: window.scrollX,
        behavior: "instant" as any
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setIsPanning(false);
  };

  const prerequisitesMap = useMemo(() => getPrerequisitesMap(), []);
  const successorsMap = useMemo(() => getSuccessorsMap(), []);
  const namesMap = useMemo(() => getSubjectNamesMap(), []);

  // Scroll into view when opening a modal so user sees the modal centered
  useEffect(() => {
    if (selectedSubjectId !== null) {
      // Use requestAnimationFrame / timeout to allow modal DOM node to mount
      const timer = setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.scrollTop = 0;
          modalRef.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedSubjectId]);

  // Compute node positions for drawing SVG lines
  const [nodePositions, setNodePositions] = useState<Record<number, { x: number; y: number; width: number; height: number }>>({});

  const updatePositions = useCallback(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;
    const containerRect = currentContainer.getBoundingClientRect();
    const positions: Record<number, { x: number; y: number; width: number; height: number }> = {};

    Object.entries(nodeRefs.current).forEach(([idStr, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        const id = parseInt(idStr, 10);
        positions[id] = {
          x: (rect.left - containerRect.left + currentContainer.scrollLeft) / zoomLevel,
          y: (rect.top - containerRect.top + currentContainer.scrollTop) / zoomLevel,
          width: rect.width / zoomLevel,
          height: rect.height / zoomLevel
        };
      }
    });

    setNodePositions(positions);
  }, [zoomLevel]);

  useEffect(() => {
    updatePositions();
    const timer = setTimeout(updatePositions, 100);
    window.addEventListener("resize", updatePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePositions);
    };
  }, [updatePositions, zoomLevel, searchQuery]);

  // Active highlighted subject (hovered takes precedence, or selected)
  const activeSubjectId = hoveredSubjectId !== null ? hoveredSubjectId : selectedSubjectId;

  // Direct 1-hop Prerequisites and Successors only (Distance 1)
  const { directPrereqs, directSuccessors } = useMemo(() => {
    if (activeSubjectId === null) {
      return { directPrereqs: new Set<number>(), directSuccessors: new Set<number>() };
    }
    const dPrereqs = new Set<number>(prerequisitesMap[activeSubjectId] || []);
    const dSuccs = new Set<number>(successorsMap[activeSubjectId] || []);

    return { directPrereqs: dPrereqs, directSuccessors: dSuccs };
  }, [activeSubjectId, prerequisitesMap, successorsMap]);

  // Get pastel class based on valor_corchete
  const getPastelTheme = (corchete: number | string) => {
    if (corchete === "(i)" || corchete === "i") {
      return {
        cardClass: "pastel-info-soft",
        badgeClass: "pastel-badge-info",
        label: "(i)"
      };
    }
    const val = typeof corchete === "number" ? corchete : parseInt(String(corchete), 10);
    if (isNaN(val) || val <= 1) {
      return { cardClass: "pastel-critical-soft", badgeClass: "pastel-badge-critical", label: val <= 1 ? `${val}` : "1" };
    }
    if (val === 2) return { cardClass: "pastel-orange-soft", badgeClass: "pastel-badge-orange", label: "2" };
    if (val === 3) return { cardClass: "pastel-yellow-soft", badgeClass: "pastel-badge-yellow", label: "3" };
    if (val === 4) return { cardClass: "pastel-green-light-soft", badgeClass: "pastel-badge-green-light", label: "4" };
    if (val === 5) return { cardClass: "pastel-green-dark-soft", badgeClass: "pastel-badge-green-dark", label: "5" };
    return { cardClass: "pastel-blue-soft", badgeClass: "pastel-badge-blue", label: `${val}` };
  };

  // Generate SVG lines (Only Direct 1-Hop Connections highlighted)
  const svgConnections = useMemo(() => {
    const lines: Array<{
      fromId: number;
      toId: number;
      d: string;
      isHighlighted: boolean;
      color: string;
      strokeWidth: number;
      opacity: number;
    }> = [];

    Object.entries(prerequisitesMap).forEach(([toIdStr, prereqs]) => {
      const toId = parseInt(toIdStr, 10);
      const toPos = nodePositions[toId];
      if (!toPos) return;

      prereqs.forEach(fromId => {
        const fromPos = nodePositions[fromId];
        if (!fromPos) return;

        const isDirectPrereq = activeSubjectId === toId && directPrereqs.has(fromId);
        const isDirectSuccessor = activeSubjectId === fromId && directSuccessors.has(toId);
        const isHighlighted = isDirectPrereq || isDirectSuccessor;

        if (!showAllConnections && !isHighlighted) {
          return;
        }

        let color = "rgba(148, 163, 184, 0.25)";
        let strokeWidth = 1.5;
        let opacity = showAllConnections ? 0.3 : 0;

        if (isDirectPrereq) {
          color = "#00f2fe"; // Electric Cyan for direct prerequisite
          strokeWidth = 3.5;
          opacity = 1.0;
        } else if (isDirectSuccessor) {
          color = "#ff007f"; // Electric Pink for direct unlocked subject
          strokeWidth = 3.5;
          opacity = 1.0;
        }

        // Calculate smooth curve anchor points from right edge of fromPos to left edge of toPos
        const startX = fromPos.x + fromPos.width;
        const startY = fromPos.y + fromPos.height / 2;
        const endX = toPos.x;
        const endY = toPos.y + toPos.height / 2;

        const dx = Math.max(30, Math.abs(endX - startX) * 0.45);
        const d = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

        lines.push({
          fromId,
          toId,
          d,
          isHighlighted,
          color,
          strokeWidth,
          opacity
        });
      });
    });

    return lines;
  }, [prerequisitesMap, nodePositions, activeSubjectId, directPrereqs, directSuccessors, showAllConnections]);

  const selectedSubjectData = useMemo(() => {
    if (selectedSubjectId === null) return null;
    const name = namesMap[selectedSubjectId] || `Materia ${selectedSubjectId}`;
    const status = subjectStatuses[selectedSubjectId] || "No cursada";
    const prereqs = prerequisitesMap[selectedSubjectId] || [];
    const succs = successorsMap[selectedSubjectId] || [];
    const recInfo = recommendedMap[selectedSubjectId] || availableMap[selectedSubjectId] || null;

    let conditionalText = "";
    if (status === "No cursada") {
      if (recInfo && recInfo.isConditional && recInfo.conditionalMessage) {
        conditionalText = recInfo.conditionalMessage;
      } else if ((semester === 2 || semester === 3) && PREVIOUS_SUBJECTS_3671.includes(selectedSubjectId)) {
        conditionalText = "Esta materia podrías cursarla el primer cuatri junto al proyecto final si te anotás en cursada condicional. Para más información, contactate con el coordinador de la carrera.";
      } else if (semester === 1 && selectedSubjectId === 3671 && recInfo && recInfo.isConditional) {
        conditionalText = "Podrías cursarla si te anotás en cursada condicional y este mismo cuatri rendís las correlativas que te faltan. Para más información, contactate con el coordinador de la carrera.";
      }
    }

    return {
      id: selectedSubjectId,
      nombre: name,
      status,
      prereqs,
      succs,
      recInfo,
      conditionalText
    };
  }, [selectedSubjectId, namesMap, subjectStatuses, prerequisitesMap, successorsMap, recommendedMap, availableMap, semester]);

  const renderSubjectNode = (subject: { id: number; nombre: string }) => {
    const status = subjectStatuses[subject.id] || "No cursada";
    const isRecommended = Boolean(recommendedMap[subject.id]);
    const isAvailable = Boolean(availableMap[subject.id]);
    const recData = recommendedMap[subject.id] || availableMap[subject.id];

    // Solid fill class for status
    const statusFillClass = `fill-state-${status.replace(/\s+/g, "-").replace(/[()]/g, "")}`;

    const isSelf = activeSubjectId === subject.id;
    const isSelected = selectedSubjectId === subject.id;
    const isDirectPre = directPrereqs.has(subject.id);
    const isDirectSuc = directSuccessors.has(subject.id);

    // Direct 1-hop node classes only
    let relationClass = "";
    if (isSelf) {
      relationClass = "node-active-self";
    } else if (isDirectPre) {
      relationClass = "node-direct-prereq";
    } else if (isDirectSuc) {
      relationClass = "node-direct-succ";
    } else if (activeSubjectId !== null) {
      relationClass = "node-dimmed";
    }

    // Soft pastel styling for recommended
    let pastelSoftClass = "";
    let pastelBadge = null;
    if (recData && (isRecommended || isAvailable) && status === "No cursada") {
      const pastelInfo = getPastelTheme(recData.displayCorchete ?? recData.corchete);
      pastelSoftClass = pastelInfo.cardClass;
      pastelBadge = (
        <span
          className={`node-pastel-badge ${pastelInfo.badgeClass}`}
          title={recData.conditionalMessage || `Urgencia: [${pastelInfo.label}]`}
        >
          [{pastelInfo.label}]
        </span>
      );
    }

    // Check conditional 3671 prev icon
    const isPrev3671 = PREVIOUS_SUBJECTS_3671.includes(subject.id);
    const showConditionalIcon = (
      ((semester === 2 || semester === 3) && isPrev3671 && (isRecommended || isAvailable)) ||
      (semester === 1 && subject.id === 3671 && recData && recData.isConditional)
    );

    // Highlight search match
    const isSearchMatch = searchQuery.trim() && (
      subject.nombre.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      String(subject.id).includes(searchQuery.trim())
    );

    return (
      <div
        key={subject.id}
        ref={(el) => {
          nodeRefs.current[subject.id] = el;
        }}
        className={`plane-node ${statusFillClass} ${pastelSoftClass} ${relationClass} ${isSelected ? "node-selected" : ""} ${isSearchMatch ? "node-search-highlight" : ""}`}
        onMouseEnter={() => setHoveredSubjectId(subject.id)}
        onMouseLeave={() => setHoveredSubjectId(null)}
        onClick={() => {
          if (hasDraggedRef.current) return;
          setSelectedSubjectId(subject.id);
        }}
      >
        <div className="plane-node-content">
          <div className="plane-node-header">
            <span className="plane-node-code">({subject.id})</span>
            <div className="plane-node-badges">
              {showConditionalIcon && (
                <span
                  className="node-conditional-icon"
                  title={
                    semester === 1
                      ? "Podrías cursarla si te anotás en cursada condicional y este mismo cuatri rendís las correlativas que te faltan. Para más información, contactate con el coordinador de la carrera."
                      : "Esta materia podrías cursarla el primer cuatri junto al proyecto final si te anotás en cursada condicional. Para más información, contactate con el coordinador de la carrera."
                  }
                >
                  (i)
                </span>
              )}
              {pastelBadge}
            </div>
          </div>
          <div className="plane-node-title">{subject.nombre}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="graph-plane-wrapper">
      {/* Top Toolbar */}
      <div className="glass-card graph-toolbar">
        <div className="graph-toolbar-left">
          <div className="graph-search-box">
            <svg className="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar materia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="graph-toolbar-right">
          {/* Zoom controls */}
          <div className="zoom-controls">
            {zoomLevel !== 1 && (
              <button
                type="button"
                className="zoom-reset-btn"
                onClick={() => setZoomLevel(1)}
                title="Restablecer zoom"
              >
                100%
              </button>
            )}
            <button
              type="button"
              className="zoom-btn"
              onClick={() => setZoomLevel(prev => Math.max(0.6, Number((prev - 0.1).toFixed(1))))}
              title="Reducir zoom"
            >
              -
            </button>
            <span className="zoom-value">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              className="zoom-btn"
              onClick={() => setZoomLevel(prev => Math.min(1.3, Number((prev + 0.1).toFixed(1))))}
              title="Aumentar zoom"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Legend Card */}
      <div className="glass-card graph-legend">
        <div className="legend-section">
          <span className="legend-title">Materias hechas:</span>
          <div className="legend-items">
            <span className="legend-chip fill-state-Aprobada">Aprobada</span>
            <span className="legend-chip fill-state-Final">Final</span>
            <span className="legend-chip fill-state-Final-ignorar">Final (ignorar)</span>
            <span className="legend-chip fill-state-No-la-voy-a-cursar">Ignorada</span>
            <span className="legend-chip fill-state-No-cursada">No cursada</span>
          </div>
        </div>

        <div className="legend-section">
          <span className="legend-title">Recomendadas:</span>
          <div className="legend-items">
            <span className="legend-chip pastel-critical-soft">[1] Crítica</span>
            <span className="legend-chip pastel-orange-soft">[2] Alta</span>
            <span className="legend-chip pastel-yellow-soft">[3] Media</span>
            <span className="legend-chip pastel-green-light-soft">[4-5] Baja</span>
            <span className="legend-chip pastel-blue-soft">[6+] Mínima</span>
          </div>
        </div>
      </div>

      {/* Main Plane Layout with SVG lines */}
      <div
        ref={containerRef}
        className={`graph-plane-scroll-container ${isPanning ? "is-panning" : ""}`}
        onScroll={updatePositions}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="graph-plane-surface"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top left"
          }}
        >
          {/* SVG Connector Layer */}
          <svg className="graph-plane-svg-layer">
            {svgConnections.map((conn, idx) => {
              return (
                <path
                  key={`plane-conn-${conn.fromId}-${conn.toId}-${idx}`}
                  d={conn.d}
                  fill="none"
                  stroke={conn.color}
                  strokeWidth={conn.strokeWidth}
                  opacity={conn.opacity}
                  style={{
                    transition: "stroke 0.15s ease, opacity 0.15s ease, stroke-width 0.15s ease",
                    pointerEvents: "none"
                  }}
                />
              );
            })}
          </svg>

          {/* 1° to 5° Year Semester Columns Plane */}
          <div className="plane-semesters-row">
            {SEMESTER_COLUMNS.map(col => {
              return (
                <div key={col.id} className="plane-semester-column">
                  <div className="plane-semester-header">
                    <div className="plane-year-badge">{col.yearName}</div>
                    <div className="plane-semester-chip">{col.semesterLabel}</div>
                  </div>

                  <div className="plane-column-nodes">
                    {col.subjects.map(subject => renderSubjectNode(subject))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dedicated Horizontal Section for Transversales at the Bottom */}
          <div className="plane-transversales-section">
            <div className="transversales-header">
              <span className="transversales-title">Materias Transversales</span>
            </div>

            <div className="transversales-grid-row">
              {TRANSVERSALES_LINES.map((line, lIdx) => (
                <div key={`trans-line-${lIdx}`} className="transversal-line-container">
                  <span className="transversal-group-badge">{line.groupTitle}</span>
                  <div className="transversal-nodes-row">
                    {line.subjects.map((subject, sIdx) => (
                      <React.Fragment key={subject.id}>
                        {renderSubjectNode(subject)}
                        {sIdx < line.subjects.length - 1 && (
                          <div className="transversal-arrow">➜</div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Subject Details Modal */}
      {selectedSubjectData && (
        <div className="graph-modal-backdrop" onClick={() => setSelectedSubjectId(null)}>
          <div ref={modalRef} className="glass-card graph-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-code">({selectedSubjectData.id})</span>
                <h2 className="modal-title">{selectedSubjectData.nombre}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedSubjectId(null)}
              >
                ✕
              </button>
            </div>

            {/* Conditional enrollment alert */}
            {selectedSubjectData.conditionalText && (
              <div className="conditional-alert-box">
                <span className="alert-icon">ℹ️</span>
                <div className="alert-text">
                  <strong>Importante:</strong>
                  <p>{selectedSubjectData.conditionalText}</p>
                </div>
              </div>
            )}

            {/* Quick Status Changers */}
            <div className="modal-status-changer">
              <span className="modal-label">Cambiar estado de la materia:</span>
              <div className="modal-status-buttons">
                {selectedSubjectData.id === 3680 ? (
                  <>
                    <button
                      type="button"
                      className={`status-toggle-btn btn-no-cursar ${selectedSubjectData.status === "No la voy a cursar" ? "active-btn" : ""}`}
                      onClick={() => onStatusChange(selectedSubjectData.id, "No la voy a cursar")}
                    >
                      Ignorar
                    </button>
                    <button
                      type="button"
                      className={`status-toggle-btn btn-aprobada ${selectedSubjectData.status === "Aprobada" ? "active-btn" : ""}`}
                      onClick={() => onStatusChange(selectedSubjectData.id, "Aprobada")}
                    >
                      Aprobada
                    </button>
                    <button
                      type="button"
                      className={`status-toggle-btn btn-no-cursada ${selectedSubjectData.status === "No cursada" ? "active-btn" : ""}`}
                      onClick={() => onStatusChange(selectedSubjectData.id, "No cursada")}
                    >
                      No cursada
                    </button>
                  </>
                ) : selectedSubjectData.id === 3671 ? (
                  <>
                    <button
                      type="button"
                      className={`status-toggle-btn btn-aprobada ${selectedSubjectData.status === "Aprobada" ? "active-btn" : ""}`}
                      onClick={() => onStatusChange(selectedSubjectData.id, "Aprobada")}
                    >
                      Aprobada
                    </button>
                    <button
                      type="button"
                      className={`status-toggle-btn btn-final ${selectedSubjectData.status === "Final" ? "active-btn" : ""}`}
                      onClick={() => onStatusChange(selectedSubjectData.id, "Final")}
                    >
                      En curso
                    </button>
                    <button
                      type="button"
                      className={`status-toggle-btn btn-no-cursada ${selectedSubjectData.status === "No cursada" ? "active-btn" : ""}`}
                      onClick={() => onStatusChange(selectedSubjectData.id, "No cursada")}
                    >
                      No cursada
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`status-toggle-btn btn-aprobada ${selectedSubjectData.status === "Aprobada" ? "active-btn" : ""}`}
                      onClick={() => onStatusChange(selectedSubjectData.id, "Aprobada")}
                    >
                      Aprobada
                    </button>
                    <button
                      type="button"
                      className={`status-toggle-btn btn-final ${selectedSubjectData.status === "Final" ? "active-btn" : ""}`}
                      onClick={() => onStatusChange(selectedSubjectData.id, "Final")}
                    >
                      Final
                    </button>
                    <button
                      type="button"
                      className={`status-toggle-btn btn-final-ignorar ${selectedSubjectData.status === "Final (ignorar)" ? "active-btn" : ""}`}
                      onClick={() => onStatusChange(selectedSubjectData.id, "Final (ignorar)")}
                      title="Si no te querés anotar a las correlativas de una materia en final, marcá la materia del final como &quot;Final (ignorar)&quot;"
                    >
                      Final (ignorar)
                    </button>
                    <button
                      type="button"
                      className={`status-toggle-btn btn-no-cursada ${selectedSubjectData.status === "No cursada" ? "active-btn" : ""}`}
                      onClick={() => onStatusChange(selectedSubjectData.id, "No cursada")}
                    >
                      No cursada
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="modal-dependencies-section">
              <div className="modal-subheading">
                <span>Necesita ({selectedSubjectData.prereqs.length})</span>
                <span className="subheading-hint">Correlativas anteriores</span>
              </div>
              {selectedSubjectData.prereqs.length > 0 ? (
                <div className="dep-items-list">
                  {selectedSubjectData.prereqs.map(pId => {
                    const pStatus = subjectStatuses[pId] || "No cursada";
                    const pStateFill = `fill-state-${pStatus.replace(/\s+/g, "-").replace(/[()]/g, "")}`;
                    return (
                      <div
                        key={pId}
                        className={`dep-card ${pStateFill}`}
                        onClick={() => setSelectedSubjectId(pId)}
                      >
                        <span className="dep-code">({pId})</span>
                        <span className="dep-name">{namesMap[pId] || `Materia ${pId}`}</span>
                        <span className="dep-status-badge">{pStatus}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-dep-text">Esta materia no tiene correlativas previas requeridas.</p>
              )}
            </div>

            {/* Successors */}
            <div className="modal-dependencies-section">
              <div className="modal-subheading">
                <span>Desbloquea ({selectedSubjectData.succs.length})</span>
                <span className="subheading-hint">Correlativas posteriores</span>
              </div>
              {selectedSubjectData.succs.length > 0 ? (
                <div className="dep-items-list">
                  {selectedSubjectData.succs.map(sId => {
                    const sStatus = subjectStatuses[sId] || "No cursada";
                    const sStateFill = `fill-state-${sStatus.replace(/\s+/g, "-").replace(/[()]/g, "")}`;
                    return (
                      <div
                        key={sId}
                        className={`dep-card ${sStateFill}`}
                        onClick={() => setSelectedSubjectId(sId)}
                      >
                        <span className="dep-code">({sId})</span>
                        <span className="dep-name">{namesMap[sId] || `Materia ${sId}`}</span>
                        <span className="dep-status-badge">{sStatus}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-dep-text">Esta materia no desbloquea materias posteriores.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
