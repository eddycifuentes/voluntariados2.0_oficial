// diagnostico.data.ts
// Actualizado según HU-006, HU-007, HU-008 — Épica 1 v2.0

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS BASE
// ─────────────────────────────────────────────────────────────────────────────

export interface OpcionRespuesta {
  texto: string;
  puntos: number;
  nivelAlcanzado?: number;       // 0, 1 o 2 — para lógica de bloqueo empresa
  esGatekeeper?: boolean;        // Solo pregunta 1 empresa (ARL)
  reglaBloqueo?: string;         // Descripción de la regla de bloqueo
}

export interface PreguntaDiagnostico {
  id: number;
  dimension: string;
  peso: number;                  // Peso porcentual de la dimensión
  pregunta: string;
  tipoSeleccion: 'unica' | 'multiple';
  maxOpciones?: number;
  notaSubtitulo?: string;
  precalculada?: boolean;        // Si es true, no se muestra al usuario
  opciones: OpcionRespuesta[];
}

export interface NivelMadurez {
  nombre: string;
  perfil: string;                // Descripción del perfil
  puntajeMin: number;
  puntajeMax: number;
  mensajeBienvenida: string;
  recomendaciones: string[];
}

export interface DiagnosticoConfig {
  actor: 'organizacion' | 'empresa' | 'voluntario';
  titulo: string;
  puntajeMaximo: number;
  preguntas: PreguntaDiagnostico[];
  niveles: NivelMadurez[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ODS — Lista de los 17 Objetivos de Desarrollo Sostenible
// ─────────────────────────────────────────────────────────────────────────────

export const ODS_LIST = [
  { id: 1,  nombre: 'Fin de la Pobreza',                         color: '#E5243B', img: 'ods/ods-01.png' },
  { id: 2,  nombre: 'Hambre Cero',                               color: '#DDA63A', img: 'ods/ods-02.png' },
  { id: 3,  nombre: 'Salud y Bienestar',                         color: '#4C9F38', img: 'ods/ods-03.png' },
  { id: 4,  nombre: 'Educación de Calidad',                      color: '#C5192D', img: 'ods/ods-04.png' },
  { id: 5,  nombre: 'Igualdad de Género',                        color: '#FF3A21', img: 'ods/ods-05.png' },
  { id: 6,  nombre: 'Agua Limpia y Saneamiento',                 color: '#26BDE2', img: 'ods/ods-06.png' },
  { id: 7,  nombre: 'Energía Asequible y No Contaminante',       color: '#FCC30B', img: 'ods/ods-07.png' },
  { id: 8,  nombre: 'Trabajo Decente y Crecimiento Económico',   color: '#A21942', img: 'ods/ods-08.png' },
  { id: 9,  nombre: 'Industria, Innovación e Infraestructura',   color: '#FD6925', img: 'ods/ods-09.png' },
  { id: 10, nombre: 'Reducción de las Desigualdades',            color: '#DD1367', img: 'ods/ods-10.png' },
  { id: 11, nombre: 'Ciudades y Comunidades Sostenibles',        color: '#FD9D24', img: 'ods/ods-11.png' },
  { id: 12, nombre: 'Producción y Consumo Responsables',         color: '#BF8B2E', img: 'ods/ods-12.png' },
  { id: 13, nombre: 'Acción por el Clima',                       color: '#3F7E44', img: 'ods/ods-13.png' },
  { id: 14, nombre: 'Vida Submarina',                            color: '#0A97D9', img: 'ods/ods-14.png' },
  { id: 15, nombre: 'Vida de Ecosistemas Terrestres',            color: '#56C02B', img: 'ods/ods-15.png' },
  { id: 16, nombre: 'Paz, Justicia e Instituciones Sólidas',     color: '#00689D', img: 'ods/ods-16.png' },
  { id: 17, nombre: 'Alianzas para Lograr los Objetivos',        color: '#19486A', img: 'ods/ods-17.png' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HABILIDADES — Voluntario
// ─────────────────────────────────────────────────────────────────────────────

export const HABILIDADES_VOLUNTARIO = [
  'Cuidado y Bienestar: Primeros auxilios, salud mental, nutrición o salud pública.',
  'Conexión Global: Traducción, interpretación o enseñanza de idiomas.',
  'Gestión Ambiental: Residuos, eficiencia energética y huella de carbono.',
  'Seguridad Digital: Protección de datos, redes seguras y prevención de riesgos.',
  'Fortalecimiento de Liderazgo: Resolución de conflictos, oratoria y gestión de equipos.',
  'Otro talento: Cuéntanos cuál es tu especialidad.',
];

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNÓSTICO: ORGANIZACIÓN SOCIAL (HU-006)
// 11 preguntas en total — 9 visibles + 2 precalculadas (no se muestran al usuario)
// Puntaje máximo: 100 puntos
// ─────────────────────────────────────────────────────────────────────────────

export const DIAGNOSTICO_ORGANIZACION: DiagnosticoConfig = {
  actor: 'organizacion',
  titulo: 'Diagnóstico de Madurez — Organización Social',
  puntajeMaximo: 100,
  preguntas: [
    // ── PRECALCULADAS (no visibles para el usuario) ──────────────────────────
    {
      id: 1,
      dimension: 'Legalidad y Transparencia',
      peso: 30,
      pregunta: 'Análisis Financiero (precalculado desde estados financieros)',
      tipoSeleccion: 'unica',
      precalculada: true,
      opciones: [
        { texto: 'Riesgo Alto',  puntos: 0,  nivelAlcanzado: 0 },
        { texto: 'Riesgo Medio', puntos: 10, nivelAlcanzado: 1 },
        { texto: 'Riesgo Bajo',  puntos: 20, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 3,
      dimension: 'Experiencia y Sostenibilidad',
      peso: 20,
      pregunta: 'Trayectoria de la organización (precalculada desde Certificado de Existencia)',
      tipoSeleccion: 'unica',
      precalculada: true,
      opciones: [
        { texto: 'Menos de dos años', puntos: 1, nivelAlcanzado: 0 },
        { texto: 'De 2 a 5 años',     puntos: 3, nivelAlcanzado: 1 },
        { texto: 'Más de 5 años',     puntos: 5, nivelAlcanzado: 2 },
      ],
    },

    // ── VISIBLES PARA EL USUARIO (9 preguntas) ───────────────────────────────
    {
      id: 2,
      dimension: 'Legalidad y Transparencia',
      peso: 30,
      pregunta: '¿Cuenta con política de tratamiento de datos (Habeas Data) y Manual de ética?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'No tiene',                                            puntos: 0,  nivelAlcanzado: 0 },
        { texto: 'Solo tiene uno o tiene los dos pero no están publicados.', puntos: 5,  nivelAlcanzado: 1 },
        { texto: 'Tiene ambos y están publicados.',                    puntos: 10, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 4,
      dimension: 'Experiencia y Sostenibilidad',
      peso: 20,
      pregunta: '¿Ha trabajado previamente con empresas en programas de voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Nunca.',                                   puntos: 0,  nivelAlcanzado: 0 },
        { texto: '1 o 2 experiencias previas.',              puntos: 8,  nivelAlcanzado: 1 },
        { texto: 'Alianzas recurrentes con varias empresas.',puntos: 15, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 5,
      dimension: 'Capacidad Operativa y Logística',
      peso: 30,
      pregunta: '¿Cuenta con protocolos de seguridad y póliza de accidentes para terceros?',
      tipoSeleccion: 'unica',
      notaSubtitulo: 'Sin póliza activa no es posible acceder a jornadas presenciales.',
      opciones: [
        { texto: 'No tiene.',                          puntos: 0,  nivelAlcanzado: 0 },
        { texto: 'Tiene protocolos pero no póliza.',   puntos: 5,  nivelAlcanzado: 1 },
        { texto: 'Tiene protocolos y póliza activa.',  puntos: 10, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 6,
      dimension: 'Capacidad Operativa y Logística',
      peso: 30,
      pregunta: '¿Cómo registra actualmente el impacto de las actividades?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'No registra (solo fotos).',                         puntos: 1, nivelAlcanzado: 0 },
        { texto: 'Excel / Listas físicas.',                           puntos: 5, nivelAlcanzado: 1 },
        { texto: 'Software de gestión de indicadores (KPIs).',        puntos: 10, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 7,
      dimension: 'Capacidad Operativa y Logística',
      peso: 30,
      pregunta: '¿En qué tipos de voluntariado tiene experiencia previa?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Manos a la obra: Eventos / logística.',                                                                    puntos: 2,  nivelAlcanzado: 0 },
        { texto: 'Voluntariado por competencias: Profesional, Mentores, Tutores, Facilitadores, Probono.',                  puntos: 5,  nivelAlcanzado: 1 },
        { texto: 'Voluntariado Estratégico e innovador: Incidencia, activismo digital, gobernanza e innovación social.',    puntos: 10, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 8,
      dimension: 'Comunicación de Impacto',
      peso: 10,
      pregunta: '¿Qué tipos de indicadores-KPIs priorizan al comunicar resultados?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Indicadores de gestión: número de personas.',                                                              puntos: 2,  nivelAlcanzado: 0 },
        { texto: 'Indicadores de desempeño: tasa de retención, satisfacción del voluntario (NPS) y cronogramas.',           puntos: 5,  nivelAlcanzado: 1 },
        { texto: 'Indicadores de impacto/valor: cambios en calidad de vida y valor social/económico generado (SROI).',      puntos: 10, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 9,
      dimension: 'Ecosistema',
      peso: 10,
      pregunta: '¿Cuál es tu capacidad de diseño de proyectos con aliados?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Ejecutamos lo que la empresa pide o propone.',                                          puntos: 2, nivelAlcanzado: 0 },
        { texto: 'Adaptamos nuestras jornadas estándar a la marca de la empresa.',                        puntos: 5, nivelAlcanzado: 1 },
        { texto: 'Co-creamos: Diseñamos misiones desde cero para resolver retos de la empresa y la comunidad.', puntos: 10, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 10,
      dimension: 'Ecosistema',
      peso: 10,
      pregunta: '¿Cómo se vincula con otras organizaciones o redes?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Trabajamos de forma independiente y aislada.',                                          puntos: 2, nivelAlcanzado: 0 },
        { texto: 'Pertenecemos a redes de ONGs.',                                                         puntos: 5, nivelAlcanzado: 1 },
        { texto: 'Liderazgo en red: Lideramos mesas de trabajo sectoriales o alianzas público-privadas.',puntos: 10, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 11,
      dimension: 'Ecosistema',
      peso: 10,
      pregunta: '¿Qué nivel de incidencia o influencia tiene su organización?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Nos enfocamos exclusivamente en la ejecución local/territorial.',                               puntos: 2,  nivelAlcanzado: 0 },
        { texto: 'Participamos en espacios de discusión de política pública o sectorial.',                        puntos: 5,  nivelAlcanzado: 1 },
        { texto: 'Referente: Somos consultores o influenciadores en estándares de impacto para nuestra causa.',  puntos: 10, nivelAlcanzado: 2 },
      ],
    },
  ],
  niveles: [
    {
      nombre: 'Emergente',
      perfil: 'Organizaciones jóvenes o en proceso de formalización. Tienen gran impacto territorial pero procesos administrativos manuales.',
      puntajeMin: 0,
      puntajeMax: 40,
      mensajeBienvenida: '¡Bienvenida! Tu labor en el territorio es el corazón del cambio. Estamos aquí para ayudarte a profesionalizar tu estructura para que las grandes empresas confíen en tu potencial y multipliques tu impacto.',
      recomendaciones: [
        'Recomendación Legal: Tu prioridad es el Habeas Data. Las empresas son muy estrictas con el manejo de datos; tener esta política publicada te abre puertas inmediatas.',
        'Recomendación Operativa: Empieza a migrar tus listas de asistencia de papel a un formato digital básico (Excel). La data es tu mejor argumento de venta.',
      ],
    },
    {
      nombre: 'Consolidada',
      perfil: 'Tienen trayectoria y equipo dedicado. Son aliadas confiables que ya han trabajado con empresas y cuidan su higiene legal.',
      puntajeMin: 41,
      puntajeMax: 70,
      mensajeBienvenida: '¡Felicidades! Ya eres un actor reconocido en el ecosistema. Tienes experiencia y un equipo que respalda tu gestión. El siguiente paso es dejar de ser un "ejecutor" para convertirte en un "socio" del negocio.',
      recomendaciones: [
        'Recomendación de Experiencia: No te limites al voluntariado "manos a la obra". Empieza a diseñar retos para voluntarios profesionales (Skill-based).',
        'Recomendación de Seguridad: Asegúrate de que tu póliza de accidentes para terceros esté siempre activa; es el requisito mínimo que pedirá una empresa "Estratégica".',
      ],
    },
    {
      nombre: 'Partner Estratégica',
      perfil: 'Organizaciones de alto nivel profesional. Co-crean soluciones, miden KPIs sofisticados y son nodos de innovación social.',
      puntajeMin: 71,
      puntajeMax: 100,
      mensajeBienvenida: '¡Eres la élite del sector social! Tu capacidad de gestión y transparencia te ponen al mismo nivel corporativo que tus aliados. Tu misión es liderar la co-creación y demostrar el retorno social de cada acción.',
      recomendaciones: [
        'Recomendación de Comunicación: Deja de reportar solo "actividades" y empieza a reportar "cambio sistémico". Usa indicadores de gobernanza e innovación.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNÓSTICO: EMPRESA (HU-007)
// 7 preguntas — 4 dimensiones — Puntaje máximo: 100
// ─────────────────────────────────────────────────────────────────────────────

export const DIAGNOSTICO_EMPRESA: DiagnosticoConfig = {
  actor: 'empresa',
  titulo: 'Diagnóstico de Madurez — Empresa',
  puntajeMaximo: 100,
  preguntas: [
    {
      id: 1,
      dimension: 'Legal',
      peso: 20,
      pregunta: '¿Cuentan con cobertura de ARL (Riesgos Laborales) o Pólizas para actividades externas de campo?',
      tipoSeleccion: 'unica',
      notaSubtitulo: 'Si la respuesta es "No cubiertos", solo podrás acceder a jornadas virtuales.',
      opciones: [
        { texto: 'No cubiertos.',                                                    puntos: 0,  nivelAlcanzado: 0, esGatekeeper: true, reglaBloqueo: 'Solo puede ser Exploradora.' },
        { texto: 'Cubiertos solo en horario laboral.',                               puntos: 10, nivelAlcanzado: 1, reglaBloqueo: 'No puede ser Líder de Transformación.' },
        { texto: 'Cubiertos 24/7 solo en misiones oficiales de la empresa.',         puntos: 20, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 2,
      dimension: 'Operativa',
      peso: 15,
      pregunta: '¿Cuántas horas laborales al año se permiten por empleado para voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Ninguna.',          puntos: 0,  nivelAlcanzado: 0, reglaBloqueo: 'Solo puede ser Exploradora.' },
        { texto: 'Entre 1 y 8 horas.',puntos: 5,  nivelAlcanzado: 1, reglaBloqueo: 'No puede ser Líder de Transformación.' },
        { texto: 'Más de 8 horas.',   puntos: 15, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 3,
      dimension: 'Operativa',
      peso: 15,
      pregunta: '¿Tienen un presupuesto anual asignado exclusivamente para logística de voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'No tiene.',                          puntos: 0,  nivelAlcanzado: 0, reglaBloqueo: 'Solo puede ser Exploradora.' },
        { texto: 'Presupuesto variable / improvisado.',puntos: 5,  nivelAlcanzado: 1, reglaBloqueo: 'No puede ser Líder de Transformación.' },
        { texto: 'Presupuesto fijo aprobado anual.',   puntos: 15, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 4,
      dimension: 'Integración de Talento y Cultura',
      peso: 15,
      pregunta: '¿Se promueve el voluntariado profesional basado en habilidades (Skill-based)?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'No, solo actividades puntuales de mano de obra.',                                                                   puntos: 0,  nivelAlcanzado: 0, reglaBloqueo: 'Solo puede ser Exploradora.' },
        { texto: 'Sí, hacemos voluntariado de mano de obra y algunos de transferencia de conocimientos básicos.',                     puntos: 10, nivelAlcanzado: 1, reglaBloqueo: 'No puede ser Líder de Transformación.' },
        { texto: 'Sí, tenemos voluntarios altamente calificados que donan tiempo para resolver problemas estructurales de ONGs.',     puntos: 15, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 5,
      dimension: 'Integración de Talento y Cultura',
      peso: 15,
      pregunta: '¿Cómo se reconoce internamente al empleado que hace voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'No hay reconocimiento.',                                  puntos: 0,  nivelAlcanzado: 0, reglaBloqueo: 'Solo puede ser Exploradora.' },
        { texto: 'Agradecimiento en medios internos de comunicación.',      puntos: 5,  nivelAlcanzado: 1, reglaBloqueo: 'No puede ser Líder de Transformación.' },
        { texto: 'Puntos para ascensos / evaluación de desempeño.',         puntos: 15, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 6,
      dimension: 'Medición de Impacto',
      peso: 10,
      pregunta: '¿Cómo recopila y analiza los datos de sus jornadas de voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'De forma manual y anecdótica (WhatsApp, estimaciones a final de año).',                                                     puntos: 3, nivelAlcanzado: 0, reglaBloqueo: 'Solo puede ser Exploradora.' },
        { texto: 'Usamos hojas de cálculo compartidas para tabular horas, número de voluntarios y dinero invertido.',                         puntos: 6, nivelAlcanzado: 1 },
        { texto: 'Usamos tableros de control en tiempo real (Dashboards) que cruzan asistencia, habilidades donadas y satisfacción.',         puntos: 10, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 7,
      dimension: 'Medición de Impacto',
      peso: 10,
      pregunta: '¿Qué tipos de KPIs se presentan al comité de gerencia o junta directiva?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Métricas de volumen (voluntarios, comunidades impactadas). No hay conexión con el negocio.',                                                      puntos: 3,  nivelAlcanzado: 0, reglaBloqueo: 'Solo puede ser Exploradora.' },
        { texto: 'Métricas de eficiencia e inversión (costo hora por voluntario, % participación, horas acumuladas por año).',                                      puntos: 6,  nivelAlcanzado: 1 },
        { texto: 'Métricas de impacto de negocio y SROI (retención de empleados voluntarios vs no voluntarios; desarrollo de habilidades de liderazgo).',           puntos: 10, nivelAlcanzado: 2 },
      ],
    },
  ],
  niveles: [
    {
      nombre: 'Exploradora',
      perfil: 'Empresa con intenciones genuinas pero sin estructura oficial. El voluntariado es reactivo y no se mide.',
      puntajeMin: 0,
      puntajeMax: 40,
      mensajeBienvenida: '¡Bienvenidos al ecosistema de impacto! Tu empresa ha dado el primer paso: reconocer que el talento de tu gente puede cambiar realidades. Estamos aquí para ayudarte a construir los cimientos de un programa sólido y seguro.',
      recomendaciones: [
        'Centra tus esfuerzos en la Dimensión Legal. Antes de escalar, asegura que tus voluntarios tengan cobertura de riesgos.',
        'Comienza con misiones virtuales o de baja complejidad física.',
      ],
    },
    {
      nombre: 'Estratégica',
      perfil: 'Empresa con presupuesto y procesos claros. El impacto está planificado y conectado a la operación de RRHH.',
      puntajeMin: 41,
      puntajeMax: 75,
      mensajeBienvenida: '¡Felicidades! Tu empresa ya recorrió el camino de la estructuración. Tienes orden, presupuesto y compromiso. Es momento de dejar de contar "cabezas" y empezar a contar "cambios" en la comunidad y en tu talento.',
      recomendaciones: [
        'Enfócate en la Integración de Talento: empieza a implementar voluntariado basado en habilidades técnicas (Pro-bono).',
        'Optimiza la Medición de Impacto para demostrar el valor económico y social de tu inversión (SROI).',
      ],
    },
    {
      nombre: 'Líder de Transformación',
      perfil: 'El voluntariado es un activo del negocio (ESG/SROI) integrado en la evaluación de desempeño y la estrategia del CEO.',
      puntajeMin: 76,
      puntajeMax: 100,
      mensajeBienvenida: '¡Eres un referente de impacto! Tu empresa está en la vanguardia, donde el voluntariado no es solo ayudar, sino transformar sistémicamente. Tu desafío ahora es la innovación social y la co-creación con ONGs.',
      recomendaciones: [
        'Enfócate hacia un voluntariado exponencial.',
        'Inicia procesos de co-creación profunda y liderazgo sectorial (influencia en proveedores).',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNÓSTICO: VOLUNTARIO (HU-008)
// 4 preguntas — 4 dimensiones — Puntaje máximo: 100
// ─────────────────────────────────────────────────────────────────────────────

export const DIAGNOSTICO_VOLUNTARIO: DiagnosticoConfig = {
  actor: 'voluntario',
  titulo: 'Diagnóstico de Madurez — Voluntario',
  puntajeMaximo: 100,
  preguntas: [
    {
      id: 1,
      dimension: 'Experiencia',
      peso: 25,
      pregunta: '¿Cuál es tu trayectoria previa en actividades de impacto social o voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'No he participado nunca o lo he hecho de forma muy puntual (1 o 2 veces).',          puntos: 0,    nivelAlcanzado: 0 },
        { texto: 'Participo de forma recurrente y tengo experiencia en actividades técnicas o de campo.',puntos: 11.1, nivelAlcanzado: 1 },
        { texto: 'Tengo una trayectoria consolidada y he diseñado o gestionado mis propias iniciativas.',puntos: 25,   nivelAlcanzado: 2 },
      ],
    },
    {
      id: 2,
      dimension: 'Habilidades',
      peso: 25,
      pregunta: '¿Qué tipo de conocimiento o talento te sientes listo para aportar hoy?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Aporte operativo y logístico (apoyo manual, siembra, pintura, organización de eventos).',                    puntos: 0,    nivelAlcanzado: 0 },
        { texto: 'Aporte profesional técnico (enseñanza, desarrollo de software, asesoría legal, mercadeo, médica).',          puntos: 11.1, nivelAlcanzado: 1 },
        { texto: 'Aporte estratégico y de gestión (mentoría a líderes, consultoría en gobernanza o innovación social).',       puntos: 25,   nivelAlcanzado: 2 },
      ],
    },
    {
      id: 3,
      dimension: 'Motivación',
      peso: 20,
      pregunta: '¿Cuál es tu objetivo principal al realizar una actividad de voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Explorar nuevas causas, conocer gente y vivir experiencias diferentes.',                     puntos: 0,  nivelAlcanzado: 0 },
        { texto: 'Poner mis conocimientos profesionales al servicio de una causa para generar un resultado.',  puntos: 10, nivelAlcanzado: 1 },
        { texto: 'Transformar realidades a largo plazo y movilizar a otros para que se sumen al cambio.',      puntos: 20, nivelAlcanzado: 2 },
      ],
    },
    {
      id: 4,
      dimension: 'Liderazgo',
      peso: 30,
      pregunta: '¿Cómo prefieres actuar cuando trabajas en equipo dentro de una misión de Voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Prefiero seguir instrucciones claras y apoyar en las tareas asignadas por un coordinador.',             puntos: 0,  nivelAlcanzado: 0 },
        { texto: 'Me siento cómodo coordinando tareas específicas o guiando a grupos pequeños en el terreno.',            puntos: 15, nivelAlcanzado: 1 },
        { texto: 'Me motiva inspirar a otros, mentorizar a nuevos voluntarios y asegurar que se cumplan los objetivos.',  puntos: 30, nivelAlcanzado: 2 },
      ],
    },
  ],
  niveles: [
    {
      nombre: 'Explorador',
      perfil: 'Curioso, con poca o nula experiencia previa. Busca descubrir causas.',
      puntajeMin: 0,
      puntajeMax: 35,
      mensajeBienvenida: '¡Hola! Qué alegría recibirte. Estás en la etapa de Explorador, el momento más emocionante porque todo es nuevo. Tu curiosidad es el motor que el mundo necesita para empezar a cambiar. ¡Bienvenido a bordo!',
      recomendaciones: [
        'Abre tu mente, no te preocupes si no eres experto. Inscríbete en misiones cortas (jornadas de 1 día) de diferentes categorías.',
        'Descubre qué causa hace latir tu corazón más fuerte.',
        'Sé una esponja: ¡observa y disfruta tu experiencia!',
      ],
    },
    {
      nombre: 'Especialista',
      perfil: 'Tiene habilidades claras y recurrencia. Busca aplicar lo que sabe.',
      puntajeMin: 36,
      puntajeMax: 75,
      mensajeBienvenida: '¡Bienvenido, Especialista! Has demostrado que tienes un set de habilidades poderoso y profesional. Las ONGs no solo necesitan manos, necesitan mentes como la tuya para resolver retos técnicos. ¡Es hora de poner tu profesión al servicio del propósito!',
      recomendaciones: [
        'Haz un match inteligente: conecta con misiones basadas en tu talento, tu impacto será 10 veces mayor que en una tarea manual.',
        'Enfócate en el resultado: trabaja de la mano con la ONG para dejar algo instalado: una guía, un proceso, una capacitación.',
        'Documenta y comparte: tu experiencia es inspiradora. ¡Contagia tu propósito!',
      ],
    },
    {
      nombre: 'Líder',
      perfil: 'Mentor y movilizador. Diseña iniciativas y guía a otros voluntarios.',
      puntajeMin: 76,
      puntajeMax: 100,
      mensajeBienvenida: '¡Impresionante! Tu puntaje te sitúa como un Líder de Impacto. No solo eres un voluntario ejemplar, eres un referente capaz de inspirar a otros. Tu reto ya no es solo participar, sino liderar el cambio sistémico.',
      recomendaciones: [
        'Mentoriza a otros: Identifica a los "Exploradores" y guíalos. Tu gran legado será formar a la siguiente generación de voluntarios.',
        'Diseña con la ONG: No esperes a que la misión aparezca. Acércate a las organizaciones "Partner" y ayúdales a diseñar proyectos estratégicos.',
        'Sé el puente: Tú hablas el lenguaje de la empresa y el de la comunidad.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN UTILITARIA: calcular nivel según puntaje
// ─────────────────────────────────────────────────────────────────────────────

export function calcularNivel(config: DiagnosticoConfig, puntaje: number): NivelMadurez | null {
  return config.niveles.find(n => puntaje >= n.puntajeMin && puntaje <= n.puntajeMax) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN UTILITARIA: obtener preguntas visibles (excluye precalculadas)
// ─────────────────────────────────────────────────────────────────────────────

export function getPreguntasVisibles(config: DiagnosticoConfig): PreguntaDiagnostico[] {
  return config.preguntas.filter(p => !p.precalculada);
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN UTILITARIA: verificar reglas de bloqueo empresa
// Retorna true si alguna respuesta bloquea el nivel "Líder de Transformación"
// ─────────────────────────────────────────────────────────────────────────────

export function tieneBloqueoLider(respuestas: (number | null)[], config: DiagnosticoConfig): boolean {
  return config.preguntas.some((preg, pi) => {
    const idx = respuestas[pi];
    if (idx === null) return false;
    const opcion = preg.opciones[idx];
    return opcion?.nivelAlcanzado === 0 || opcion?.nivelAlcanzado === 1;
  });
}