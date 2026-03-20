// diagnostico.data.ts
// Contiene las preguntas, respuestas, puntajes y niveles para los tres
// diagnósticos de madurez: Organización Social, Empresa y Voluntario.

// ─────────────────────────────────────────────
// TIPOS BASE
// ─────────────────────────────────────────────

export interface OpcionRespuesta {
  texto: string;
  puntos: number;
  esGatekeeper?: boolean; // Solo para la pregunta 1 de Empresa (ARL)
}

export interface PreguntaDiagnostico {
  id: number;
  dimension: string;
  pregunta: string;
  tipoSeleccion: 'unica' | 'multiple'; // única = radio button, múltiple = checkboxes
  maxOpciones?: number;                 // Solo aplica si tipoSeleccion === 'multiple'
  notaSubtitulo?: string;               // Texto pequeño bajo el enunciado
  opciones: OpcionRespuesta[];
}

export interface NivelMadurez {
  nombre: string;
  descripcion: string;           // Clasificación (ej: "Solo jornadas de Baja Complejidad")
  puntajeMin: number;
  puntajeMax: number;
  mensajeBienvenida: string;
  recomendaciones: string[];
}

export interface DiagnosticoConfig {
  actor: 'organizacion' | 'empresa' | 'voluntario';
  titulo: string;
  preguntas: PreguntaDiagnostico[];
  niveles: NivelMadurez[];
}

// ─────────────────────────────────────────────
// DIAGNÓSTICO: ORGANIZACIÓN SOCIAL (HU-005)
// ─────────────────────────────────────────────

export const DIAGNOSTICO_ORGANIZACION: DiagnosticoConfig = {
  actor: 'organizacion',
  titulo: 'Diagnóstico de Madurez — Organización Social',
  preguntas: [
    {
      id: 1,
      dimension: 'Solidez Económica',
      pregunta: '¿Requiere financiamiento por parte de la empresa al ejecutar las Jornadas?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Totalmente', puntos: 0 },
        { texto: 'Parcialmente', puntos: 30 },
        { texto: 'No', puntos: 60 },
      ],
    },
    {
      id: 2,
      dimension: 'Soporte Operativo',
      pregunta: '¿Cuál es su cupo máximo de voluntarios por jornada?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Capacidad Alta: más de 30 voluntarios', puntos: 30 },
        { texto: 'Capacidad Media: entre 15 y 30 voluntarios', puntos: 15 },
        { texto: 'Capacidad Baja: 15 o menos voluntarios', puntos: 10 },
      ],
    },
    {
      id: 3,
      dimension: 'Trayectoria',
      pregunta: '¿Cuántos años llevan gestionando proyectos con empresas?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Más de 5 años', puntos: 40 },
        { texto: 'Entre 2 a 5 años', puntos: 20 },
        { texto: 'Menos de 2 años', puntos: 10 },
        { texto: 'Ninguno', puntos: 0 },
      ],
    },
    {
      id: 4,
      dimension: 'Institucionalidad',
      pregunta: '¿Cuenta con un Coordinador de voluntariado dedicado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Tiempo completo', puntos: 20 },
        { texto: 'Tiempo parcial', puntos: 15 },
        { texto: 'Aún no', puntos: 10 },
      ],
    },
    {
      id: 5,
      dimension: 'Modalidad de Voluntariado',
      pregunta: '¿Qué tipo de actividades han liderado antes?',
      tipoSeleccion: 'multiple',
      maxOpciones: 3,
      notaSubtitulo: 'Puedes escoger más de una respuesta solo si es necesario',
      opciones: [
        { texto: 'Mentoría Especializada: Guía estratégica, asesoría legal o financiera, réplica de modelos.', puntos: 18 },
        { texto: 'Basado en Habilidades: Capacitaciones, talleres técnicos, diseño de procesos.', puntos: 12 },
        { texto: 'Puntuales (Manos a la obra): Pintura, siembra, juegos con niños, limpieza.', puntos: 10 },
      ],
    },
    {
      id: 6,
      dimension: 'Cultura de Datos',
      pregunta: '¿Cuentan con indicadores para medir el impacto de sus actividades?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Totalmente', puntos: 10 },
        { texto: 'Parcialmente', puntos: 5 },
        { texto: 'Aún no', puntos: 0 },
      ],
    },
  ],
  niveles: [
    {
      nombre: 'Exploradora',
      descripcion: 'Solo jornadas de Baja Complejidad (Puntuales / Manos a la obra).',
      puntajeMin: 0,
      puntajeMax: 90,
      mensajeBienvenida: '¡Felicidades! Eres una organización Exploradora. Estás en la etapa ideal para dar tus primeros pasos y construir bases de confianza con el sector privado. Tu viaje de impacto apenas comienza.',
      recomendaciones: [
        'Aprovechar tu capacidad para recibir (cantidad de voluntarios indicada en la encuesta).',
        'Ofrecer actividades del nivel de habilidades que hayas indicado.',
        'Aclarar con transparencia el valor de tu aporte económico en la iniciativa.',
      ],
    },
    {
      nombre: 'Incursionista',
      descripcion: 'Habilita jornadas puntuales y de Media Complejidad (Habilidades técnicas).',
      puntajeMin: 91,
      puntajeMax: 161,
      mensajeBienvenida: '¡Excelente! Eres una organización Incursionista. Tienes una estructura consolidada que te permite ir más allá y asumir nuevos retos. Eres un motor de acción clave para nuestras empresas aliadas.',
      recomendaciones: [
        'Aprovechar tu capacidad para recibir (cantidad de voluntarios indicada en la encuesta).',
        'Ofrecer actividades del nivel de habilidades que hayas indicado.',
        'Aclarar con transparencia el valor de tu aporte económico en la iniciativa.',
      ],
    },
    {
      nombre: 'Pionera',
      descripcion: 'Acceso total, incluyendo Alta Complejidad (Mentorías y proyectos de largo plazo).',
      puntajeMin: 162,
      puntajeMax: 9999,
      mensajeBienvenida: '¡Increíble! Eres una organización Pionera. Eres un referente de excelencia y liderazgo en el ecosistema, con la solidez necesaria para movilizar grandes transformaciones.',
      recomendaciones: [
        'Aprovechar tu capacidad para recibir (cantidad de voluntarios indicada en la encuesta).',
        'Ofrecer actividades del nivel de habilidades que hayas indicado.',
        'Aclarar con transparencia el valor de tu aporte económico en la iniciativa.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// DIAGNÓSTICO: EMPRESA (HU-006)
// ─────────────────────────────────────────────

export const DIAGNOSTICO_EMPRESA: DiagnosticoConfig = {
  actor: 'empresa',
  titulo: 'Diagnóstico de Madurez — Empresa',
  preguntas: [
    {
      id: 1,
      dimension: 'Blindaje Legal',
      pregunta: '¿Certifico que mis voluntarios están protegidos por ARL o un seguro de accidentes durante las actividades?',
      tipoSeleccion: 'unica',
      notaSubtitulo: 'Obligatorio — Sin esta confirmación no es posible continuar.',
      opciones: [
        { texto: 'Sí, certifico la cobertura', puntos: 40, esGatekeeper: true },
      ],
    },
    {
      id: 2,
      dimension: 'Solidez Económica',
      pregunta: '¿Cuál es el presupuesto por jornada estimado para su programa de voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Más de $10.000.000', puntos: 60 },
        { texto: 'Entre $2.000.000 y $10.000.000', puntos: 30 },
        { texto: 'Menos de $2.000.000', puntos: 15 },
        { texto: 'No cuento con presupuesto', puntos: 0 },
      ],
    },
    {
      id: 3,
      dimension: 'Institucionalidad',
      pregunta: '¿Cuentan con políticas claras y un líder para gestionar el voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Sí / Tiempo completo', puntos: 40 },
        { texto: 'Sí / Tiempo parcial', puntos: 20 },
        { texto: 'No', puntos: 10 },
      ],
    },
    {
      id: 4,
      dimension: 'Modalidad de Voluntariado',
      pregunta: '¿Qué tipo de apoyo suelen brindar sus voluntarios?',
      tipoSeleccion: 'multiple',
      maxOpciones: 3,
      notaSubtitulo: 'Puedes escoger más de una respuesta solo si es necesario',
      opciones: [
        { texto: 'Guía estratégica, asesoría legal o financiera, réplica de modelos.', puntos: 50 },
        { texto: 'Capacitaciones, talleres técnicos, diseño de procesos.', puntos: 25 },
        { texto: 'Pintura, siembra, juegos con niños, limpieza.', puntos: 10 },
        { texto: 'No hay experiencia previa', puntos: 0 },
      ],
    },
    {
      id: 5,
      dimension: 'Cultura de Datos',
      pregunta: '¿Miden o reportan actualmente indicadores de impacto / sostenibilidad?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Sí', puntos: 10 },
        { texto: 'Parcialmente', puntos: 5 },
        { texto: 'No', puntos: 0 },
      ],
    },
  ],
  niveles: [
    {
      nombre: 'Exploradora',
      descripcion: 'Conectarás con organizaciones listas para guiar a tu equipo en sus primeras experiencias.',
      puntajeMin: 0,
      puntajeMax: 70,
      mensajeBienvenida: '¡Felicidades! Tu empresa es Exploradora. Estás en el momento perfecto para iniciar tu cultura de voluntariado corporativo.',
      recomendaciones: [
        'Filtrar jornadas que se ajusten a tu presupuesto declarado.',
        'Aportar el conocimiento de tu equipo en las áreas indicadas.',
        'Garantizar siempre la vigencia de la ARL o póliza antes de cada salida.',
      ],
    },
    {
      nombre: 'Incursionista',
      descripcion: 'Tu equipo es un aliado estratégico de gran valor para nuestras fundaciones.',
      puntajeMin: 71,
      puntajeMax: 150,
      mensajeBienvenida: '¡Excelente! Tu empresa es Incursionista. Tienes una base estructurada que te permite movilizar a tu talento hacia retos más grandes.',
      recomendaciones: [
        'Filtrar jornadas que se ajusten a tu presupuesto declarado.',
        'Aportar el conocimiento de tu equipo en las áreas indicadas.',
        'Garantizar siempre la vigencia de la ARL o póliza antes de cada salida.',
      ],
    },
    {
      nombre: 'Pionera',
      descripcion: 'Tu solidez y liderazgo interno te permiten asumir proyectos de alta complejidad.',
      puntajeMin: 151,
      puntajeMax: 9999,
      mensajeBienvenida: '¡Increíble! Tu empresa es Pionera. Eres un motor de transformación que puede cambiar el rumbo de muchas organizaciones.',
      recomendaciones: [
        'Filtrar jornadas que se ajusten a tu presupuesto declarado.',
        'Aportar el conocimiento de tu equipo en las áreas indicadas.',
        'Garantizar siempre la vigencia de la ARL o póliza antes de cada salida.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// DIAGNÓSTICO: VOLUNTARIO (HU-007)
// ─────────────────────────────────────────────

export const ODS_LIST = [
  { id: 1,  nombre: 'Fin de la Pobreza',                          color: '#E5243B', img: 'ods/ods-01.png' },
  { id: 2,  nombre: 'Hambre Cero',                                color: '#DDA63A', img: 'ods/ods-02.png' },
  { id: 3,  nombre: 'Salud y Bienestar',                          color: '#4C9F38', img: 'ods/ods-03.png' },
  { id: 4,  nombre: 'Educación de Calidad',                       color: '#C5192D', img: 'ods/ods-04.png' },
  { id: 5,  nombre: 'Igualdad de Género',                         color: '#FF3A21', img: 'ods/ods-05.png' },
  { id: 6,  nombre: 'Agua Limpia y Saneamiento',                  color: '#26BDE2', img: 'ods/ods-06.png' },
  { id: 7,  nombre: 'Energía Asequible y No Contaminante',        color: '#FCC30B', img: 'ods/ods-07.png' },
  { id: 8,  nombre: 'Trabajo Decente y Crecimiento Económico',    color: '#A21942', img: 'ods/ods-08.png' },
  { id: 9,  nombre: 'Industria, Innovación e Infraestructura',    color: '#FD6925', img: 'ods/ods-09.png' },
  { id: 10, nombre: 'Reducción de las Desigualdades',             color: '#DD1367', img: 'ods/ods-10.png' },
  { id: 11, nombre: 'Ciudades y Comunidades Sostenibles',         color: '#FD9D24', img: 'ods/ods-11.png' },
  { id: 12, nombre: 'Producción y Consumo Responsables',          color: '#BF8B2E', img: 'ods/ods-12.png' },
  { id: 13, nombre: 'Acción por el Clima',                        color: '#3F7E44', img: 'ods/ods-13.png' },
  { id: 14, nombre: 'Vida Submarina',                             color: '#0A97D9', img: 'ods/ods-14.png' },
  { id: 15, nombre: 'Vida de Ecosistemas Terrestres',             color: '#56C02B', img: 'ods/ods-15.png' },
  { id: 16, nombre: 'Paz, Justicia e Instituciones Sólidas',      color: '#00689D', img: 'ods/ods-16.png' },
  { id: 17, nombre: 'Alianzas para Lograr los Objetivos',         color: '#19486A', img: 'ods/ods-17.png' },
];

export const HABILIDADES_VOLUNTARIO = [
  'Logística y Operaciones: Gestión de inventarios, optimización de rutas, compras y suministros.',
  'Salud y Bienestar: Primeros auxilios, salud mental, nutrición o salud pública.',
  'Idiomas y Traducción: Traducción de documentos, interpretación o enseñanza de idiomas.',
  'Sostenibilidad: Gestión de residuos, eficiencia energética o huella de carbono.',
  'Ciberseguridad: Protección de datos, redes seguras y prevención de estafas digitales.',
  'Liderazgo y Soft Skills: Resolución de conflictos, oratoria o gestión de equipos.',
  'Otro: ¿Cuál?',
];

export const DIAGNOSTICO_VOLUNTARIO: DiagnosticoConfig = {
  actor: 'voluntario',
  titulo: 'Diagnóstico de Madurez — Voluntario',
  preguntas: [
    {
      id: 1,
      dimension: 'Propósito FBD',
      pregunta: '¿Cuál de estas causas te moviliza más para transformar comunidades hoy?',
      tipoSeleccion: 'multiple',
      maxOpciones: 3,
      notaSubtitulo: 'Obligatorio. Selecciona un máximo de 3 opciones.',
      opciones: ODS_LIST.map(ods => ({ texto: `ODS ${ods.id}: ${ods.nombre}`, puntos: 0 })),
    },
    {
      id: 2,
      dimension: 'Talento FBD',
      pregunta: '¿Qué habilidad técnica te gustaría "donar" para potenciar a una organización social?',
      tipoSeleccion: 'unica',
      opciones: HABILIDADES_VOLUNTARIO.map(h => ({ texto: h, puntos: 0 })),
    },
    {
      id: 3,
      dimension: 'Experiencia',
      pregunta: '¿Cuál es tu trayectoria previa en el mundo del voluntariado?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: '5 o más jornadas', puntos: 100 },
        { texto: '4 jornadas', puntos: 80 },
        { texto: '3 jornadas', puntos: 60 },
        { texto: '2 jornadas', puntos: 40 },
        { texto: '1 jornada', puntos: 20 },
        { texto: 'Usuario nuevo (0 jornadas)', puntos: 0 },
      ],
    },
    {
      id: 4,
      dimension: 'Disponibilidad',
      pregunta: '¿Cómo planeas integrar el voluntariado en tu vida profesional?',
      tipoSeleccion: 'multiple',
      notaSubtitulo: 'Primero selecciona si es Virtual o Presencial, luego elige días y horario.',
      opciones: [
        { texto: 'Lunes a Viernes — Mañana — VIRTUAL', puntos: 0 },
        { texto: 'Lunes a Viernes — Tarde — VIRTUAL', puntos: 0 },
        { texto: 'Lunes a Viernes — Noche — VIRTUAL', puntos: 0 },
        { texto: 'Fines de Semana — Mañana — VIRTUAL', puntos: 0 },
        { texto: 'Fines de Semana — Tarde — VIRTUAL', puntos: 0 },
        { texto: 'Lunes a Viernes — Mañana — PRESENCIAL', puntos: 0 },
        { texto: 'Lunes a Viernes — Tarde — PRESENCIAL', puntos: 0 },
        { texto: 'Lunes a Viernes — Noche — PRESENCIAL', puntos: 0 },
        { texto: 'Fines de Semana — Mañana — PRESENCIAL', puntos: 0 },
        { texto: 'Fines de Semana — Tarde — PRESENCIAL', puntos: 0 },
      ],
    },
    {
      id: 5,
      dimension: 'Motivación',
      pregunta: '¿Cuál es tu principal objetivo al usar esta plataforma de la Fundación?',
      tipoSeleccion: 'unica',
      opciones: [
        { texto: 'Conectar con mis compañeros y la comunidad.', puntos: 20 },
        { texto: 'Desarrollar nuevas competencias laborales.', puntos: 10 },
        { texto: 'Generar un impacto medible y dejar huella.', puntos: 0 },
        { texto: 'Otro: ¿Cuál?', puntos: 0 },
      ],
    },
  ],
  // El nivel del voluntario se determina por la pregunta 3 (Experiencia)
  niveles: [
    {
      nombre: 'Semilla',
      descripcion: 'Estás a punto de iniciar un viaje increíble.',
      puntajeMin: 0,
      puntajeMax: 19,
      mensajeBienvenida: '¡Bienvenido a la comunidad! Tu nivel actual es Semilla. Estás a punto de iniciar un viaje increíble. Participa en tu primera jornada para sumar tus primeros puntos y avanzar al nivel Bronce. ¡Cada asistencia cuenta para tu crecimiento!',
      recomendaciones: [
        'Te mostraremos primero las jornadas que hagan "match" con tus causas de interés principales.',
        'Este es tu espacio para explotar tus talentos actuales y explorar nuevas habilidades.',
        'Ten muy en cuenta el horario y la modalidad (virtual/presencial) de la jornada de acuerdo a tu disponibilidad antes de postularte.',
      ],
    },
    {
      nombre: 'Bronce',
      descripcion: 'Ya diste tus primeros pasos transformando realidades.',
      puntajeMin: 20,
      puntajeMax: 59,
      mensajeBienvenida: '¡Genial! Tu nivel es Bronce. Ya diste tus primeros pasos transformando realidades. Sigue sumando puntos con cada nueva asistencia a nuestras jornadas para desbloquear el nivel Plata. ¡Tu impacto está creciendo!',
      recomendaciones: [
        'Te mostraremos primero las jornadas que hagan "match" con tus causas de interés principales.',
        'Este es tu espacio para explotar tus talentos actuales y explorar nuevas habilidades.',
        'Ten muy en cuenta el horario y la modalidad antes de postularte.',
      ],
    },
    {
      nombre: 'Plata',
      descripcion: 'Tienes un recorrido valioso y un compromiso que inspira.',
      puntajeMin: 60,
      puntajeMax: 99,
      mensajeBienvenida: '¡Increíble! Eres nivel Plata. Tienes un recorrido valioso y un compromiso que inspira. Continúa asistiendo a jornadas, acumula más puntos y alcanza el máximo nivel: Oro. ¡Eres un motor de cambio para las fundaciones!',
      recomendaciones: [
        'Te mostraremos primero las jornadas que hagan "match" con tus causas de interés principales.',
        'Comparte tu experiencia con otros voluntarios nuevos.',
        'Ten muy en cuenta el horario y la modalidad antes de postularte.',
      ],
    },
    {
      nombre: 'Oro',
      descripcion: 'Tu amplia experiencia te convierte en un líder y referente.',
      puntajeMin: 100,
      puntajeMax: 9999,
      mensajeBienvenida: '¡Felicidades! Eres nivel Oro. Tu amplia experiencia te convierte en un líder y referente dentro del voluntariado corporativo. Sigue asistiendo para acumular puntos, mantener tu estatus y guiar a otros con tu ejemplo.',
      recomendaciones: [
        'Te mostraremos primero las jornadas que hagan "match" con tus causas de interés principales.',
        'Considera ser mentor de voluntarios nuevos.',
        'Ten muy en cuenta el horario y la modalidad antes de postularte.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// FUNCIÓN UTILITARIA: calcular nivel según puntaje
// ─────────────────────────────────────────────

export function calcularNivel(config: DiagnosticoConfig, puntaje: number): NivelMadurez | null {
  return config.niveles.find(n => puntaje >= n.puntajeMin && puntaje <= n.puntajeMax) ?? null;
}