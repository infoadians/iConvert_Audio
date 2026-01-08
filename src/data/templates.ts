export type TemplateCategory =
    | 'Generales'
    | 'Gestión y Negocios'
    | 'Contenido y Comunicación'
    | 'Análisis y Estudio';

export interface ProcessingTemplate {
    id: string;
    name: string;
    category: TemplateCategory;
    objective: string;
    prompt: string;
}

export const PROCESSING_TEMPLATES: ProcessingTemplate[] = [
    // --- I. Generales ---
    {
        id: 'translation',
        name: 'Traducción (Inglés/Español)',
        category: 'Generales',
        objective: 'Traducir el contenido al idioma opuesto al original (Inglés <-> Español).',
        prompt: `Eres un traductor experto y culturalmente consciente.
Tu tarea es analizar el idioma del texto proporcionado (Inglés o Español) y traducirlo COMPLETAMENTE al otro idioma (Si es Español -> Inglés; Si es Inglés -> Español).
- Mantén el tono, el estilo y los matices del hablante original.
- No resumas, traduce el contenido completo.
- Si hay términos técnicos, usa la traducción estándar de la industria.
Salida esperada: Solo el texto traducido.`
    },
    {
        id: 'thematic-analysis',
        name: 'Análisis Temático Estructurado',
        category: 'Generales',
        objective: 'Identificar temas, enumerar ideas principales y resumir el top 5.',
        prompt: `Realiza un análisis temático profundo de la transcripción siguiendo estrictamente esta estructura:

1. **Identificación y Agrupación de Temas:**
   Identifica los temas principales abordados. Para cada tema, enumera las ideas principales discutidas dentro de él.
   Formato:
   * **Tema 1:** [Nombre del Tema]
     1. Idea principal A
     2. Idea principal B
     ...
   * **Tema 2:** [Nombre del Tema]
     ...

2. **Resumen Top 5 Temas:**
   Al final, selecciona los 5 temas más importantes (por relevancia o tiempo dedicado) y presenta un breve resumen ejecutivo de cada uno.`
    },
    {
        id: 'general-summary',
        name: 'Resumen General',
        category: 'Generales',
        objective: 'Obtener una síntesis simple y directa del contenido (máx. 5 párrafos).',
        prompt: `Analiza la transcripción proporcionada y genera un Resumen General del contenido.
- La extensión máxima debe ser de 5 párrafos.
- Captura la esencia principal, el flujo de la conversación y los puntos más relevantes.
- No uses formatos complejos ni listas excesivas, solo texto fluido y párrafos bien estructurados.`
    },
    {
        id: 'clean-read',
        name: 'Mejora de Redacción y Edición',
        category: 'Generales',
        objective: 'Mejorar fluidez, eliminar ruido y corregir estilo sin resumir ni alterar el contenido.',
        prompt: `Actúa como un editor experto de textos. Tu tarea es reescribir la siguiente transcripción para mejorar su legibilidad y fluidez, SIN resumir.
Instrucciones precisas:
1. **Limpieza:** Elimina muletillas, repeticiones vacías, falsos comienzos y pausas verbales.
2. **Filtrado:** Elimina interrupciones externas o conversaciones paralelas que no tengan relación con el tema.
3. **Edición:** Mejora la estructura de las oraciones y párrafos para que el texto fluya naturalmente al leerse.
4. **Fidelidad:** Mantén TODO el contenido informativo y las ideas originales. No cambies el sentido ni la intención del hablante.
5. **Estricto:** NO inventes ni agregues información que no aparezca en el texto fuente.
El resultado debe ser el texto completo, pulido y profesional.`
    },

    // --- II. Gestión y Negocios ---
    {
        id: 'executive-summary',
        name: 'Resumen Ejecutivo',
        category: 'Gestión y Negocios',
        objective: 'Generar una visión general rápida para tomadores de decisiones.',
        prompt: `Actúa como un consultor ejecutivo experto. Analiza la siguiente transcripción y redacta un Resumen Ejecutivo de alto nivel.
El resumen debe ser breve (máximo 3 párrafos) y debe capturar:
1. El propósito principal de la conversación o presentación.
2. Los puntos más críticos discutidos.
3. Las conclusiones o decisiones finales más importantes.
No entres en detalles triviales. Usa un lenguaje formal y profesional.`
    },
    {
        id: 'meeting-minutes',
        name: 'Acta de Reunión (Minutas)',
        category: 'Gestión y Negocios',
        objective: 'Documentar formalmente lo sucedido en una reunión.',
        prompt: `Actúa como un secretario profesional. Genera un Acta de Reunión formal basada en la siguiente transcripción.
Usa el siguiente formato estructurado:
- **Tema:** (Tema principal inferido)
- **Participantes:** (Lista de nombres detectados o roles inferidos)
- **Agenda/Puntos Tratados:** Lista de temas discutidos.
- **Discusión Principal:** Resumen de los intercambios clave por cada punto.
- **Acuerdos y Decisiones:** Lista explícita de lo acordado.
- **Próximos Pasos (Action Items):** Quién hace qué y para cuándo (si se menciona).`
    },
    {
        id: 'action-items',
        name: 'Lista de Tareas (Action Items)',
        category: 'Gestión y Negocios',
        objective: 'Extraer únicamente las acciones pendientes.',
        prompt: `Analiza la transcripción y extrae EXCLUSIVAMENTE la lista de tareas pendientes, compromisos o "Action Items".
Para cada tarea, especifica:
- **Tarea:** Descripción clara de la acción a realizar.
- **Responsable:** Nombre de la persona asignada (si se menciona).
- **Fecha Límite:** Fecha o plazo mencionado (si existe).
- **Contexto:** Una frase breve sobre por qué se debe hacer esto.
Si no hay tareas claras, indícalo explícitamente.`
    },
    {
        id: 'swot-analysis',
        name: 'Análisis FODA (SWOT)',
        category: 'Gestión y Negocios',
        objective: 'Identificar Fortalezas, Oportunidades, Debilidades y Amenazas.',
        prompt: `Actúa como un analista estratégico. Basado en el contenido de la transcripción, realiza un Análisis FODA (SWOT).
Identifica y clasifica los puntos mencionados en:
- **Fortalezas:** Aspectos positivos internos mencionados.
- **Oportunidades:** Posibilidades de mejora o crecimiento externas.
- **Debilidades:** Problemas internos o carencias mencionadas.
- **Amenazas:** Riesgos externos o competidores mencionados.
Si alguno de los cuadrantes no tiene información explícita en el texto, inferirlo del contexto si es seguro, o dejarlo vacío.`
    },
    {
        id: 'risk-assessment',
        name: 'Identificación de Riesgos y Problemas',
        category: 'Gestión y Negocios',
        objective: 'Detectar bloqueos, preocupaciones y riesgos potenciales.',
        prompt: `Analiza la transcripción con un enfoque en Gestión de Riesgos. Identifica todos los problemas, bloqueos, preocupaciones, conflictos o riesgos mencionados.
Preséntalos en una lista priorizada (de mayor a menor gravedad aparente).
Para cada riesgo/problema incluye:
- **Descripción del Riesgo:** ¿Qué está mal o qué podría salir mal?
- **Impacto Potencial:** ¿Qué consecuencias se mencionaron?
- **Mitigación Sugerida:** ¿Se mencionó alguna solución? Si no, indícalo.`
    },

    // --- III. Contenido y Comunicación ---
    {
        id: 'blog-post',
        name: 'Blog Post / Artículo',
        category: 'Contenido y Comunicación',
        objective: 'Convertir la charla en contenido publicable y atractivo.',
        prompt: `Actúa como un redactor de contenidos experto (Copywriter). Transforma la siguiente transcripción en un artículo de Blog atractivo y bien estructurado.
- Crea un **Título llamativo (Catchy)**.
- Escribe una **Introducción** que enganche al lector.
- Usa **Subtítulos** para organizar los temas principales.
- Usa un tono ameno y adaptado al público general (o al público objetivo inferido de la charla).
- Incluye una **Conclusión** con una llamada a la acción (si aplica) o una reflexión final.
El resultado debe leerse como un artículo original, no como una transcripción. Evita muletillas del habla oral.`
    },
    {
        id: 'follow-up-email',
        name: 'Email de Seguimiento',
        category: 'Contenido y Comunicación',
        objective: 'Redactar un correo profesional para los participantes.',
        prompt: `Redacta un correo electrónico de seguimiento profesional dirigido a los participantes de la conversación transcrita.
El correo debe:
- Agradecer a los asistentes.
- Resumir brevemente lo conversado (3-4 bullets).
- Reiterar los pasos a seguir o tareas asignadas (si las hay).
- Proponer la próxima reunión o el siguiente contacto (si se mencionó).
El tono debe ser cortes y profesional.`
    },
    {
        id: 'social-media',
        name: 'Hilos para Redes Sociales',
        category: 'Contenido y Comunicación',
        objective: 'Crear contenido breve para Twitter/LinkedIn y frases citables.',
        prompt: `Actúa como un Social Media Manager. Extrae el contenido más valioso de la transcripción y crea:
1. **Un hilo de Twitter/X (5-7 tweets):** Con los puntos más impactantes, usando emojis y un tono dinámico.
2. **Un post de LinkedIn:** Más profesional, enfocado en lecciones aprendidas o insights de industria, con hashtags relevantes.
Identifica frases "citables" (Quotes) que podrían usarse en gráficos.`
    },
    {
        id: 'glossary',
        name: 'Glosario de Términos',
        category: 'Contenido y Comunicación',
        objective: 'Clarificar terminología técnica y acrónimos.',
        prompt: `Analiza la transcripción e identifica términos técnicos, acrónimos, jerga específica de la industria o conceptos complejos mencionados.
Genera un Glosario donde para cada término proveas:
- **Término/Acrónimo**
- **Definición:** Una definición breve basada en cómo se usó en el contexto (o una definición general si el contexto es insuficiente).
Ordena la lista alfabéticamente.`
    },
    {
        id: 'qa-session',
        name: 'Preguntas y Respuestas (Q&A)',
        category: 'Contenido y Comunicación',
        objective: 'Extraer las preguntas realizadas y sus respuestas.',
        prompt: `Identifica todas las preguntas realizadas durante la sesión y las respuestas dadas.
Genera un formato de Preguntas y Respuestas (Q&A):
**P: [Pregunta realizada]**
**R: [Resumen de la respuesta dada]**
Si una pregunta no fue respondida o quedó abierta, indícalo como "Sin respuesta/Pendiente".
Ignora preguntas retóricas o irrelevantes (como "¿me escuchan?").`
    },

    // --- IV. Análisis y Estudio ---
    {
        id: 'key-takeaways',
        name: 'Ideas Clave (Key Takeaways)',
        category: 'Análisis y Estudio',
        objective: 'Resumen de puntos de bala con las lecciones fundamentales.',
        prompt: `Extrae las "Ideas Clave" (Key Takeaways) de la transcripción.
- Identifica entre 5 y 10 conceptos o lecciones fundamentales.
- Preséntalos como una lista de viñetas (bullet points).
- Cada punto debe ser una frase completa y auto-explicativa.
- Enfócate en el valor central y la información "accionable".`
    },
    {
        id: 'study-notes',
        name: 'Notas de Estudio / Resumen Académico',
        category: 'Análisis y Estudio',
        objective: 'Material de estudio estructurado jerárquicamente.',
        prompt: `Actúa como un estudiante de honor tomando apuntes. Convierte la transcripción en Notas de Estudio estructuradas.
Usa una jerarquía clara:
I. Concepto Principal 1
   A. Detalle o sub-concepto
   B. Ejemplo mencionado
II. Concepto Principal 2
   ...
Incluye definiciones, fechas importantes y relaciones entre conceptos.
El objetivo es que este documento sirva para estudiar el contenido sin tener que re-leer la transcripción completa.`
    },
    {
        id: 'sentiment-analysis',
        name: 'Análisis de Sentimiento y Tono',
        category: 'Análisis y Estudio',
        objective: 'Evaluar el tono general, dinámica y puntos emocionales.',
        prompt: `Realiza un Análisis de Sentimiento y Tono de la transcripción.
Proporciona:
1. **Tono General:** (Ej. Optimista, Preocupado, Conflictivo, Neutral, Formal, Informal).
2. **Dinámica de los Hablantes:** ¿Están colaborando? ¿Hay tensión? ¿Alguien domina la conversación?
3. **Puntos Emocionales Altos/Bajos:** Identifica momentos donde la intensidad emocional (entusiasmo o frustración) parezca aumentar.
Justifica tus observaciones con ejemplos breves del texto.`
    },
    {
        id: 'mind-map',
        name: 'Mapa Mental (Esquema Markdown)',
        category: 'Análisis y Estudio',
        objective: 'Generar una estructura jerárquica para visualización.',
        prompt: `Genera la estructura de un Mapa Mental basado en la transcripción.
Usa formato de lista anidada con sangrías (Markdown) que pueda ser fácilmente visualizado o importado a herramientas de mapas mentales.
- Nodo Central: Tema principal.
  - Rama 1: Subtema principal
    - Detalle
    - Detalle
  - Rama 2: Subtema principal
    - ...
Asegúrate de capturar la estructura lógica y las relaciones entre las ideas.`
    },
    {
        id: 'fact-check',
        name: 'Fact Check / Verificación',
        category: 'Análisis y Estudio',
        objective: 'Validar afirmaciones fácticas y datos objetivos.',
        prompt: `Actúa como un Fact-Checker (Verificador de Datos). Analiza la transcripción y extrae una lista de afirmaciones que contienen datos objetivos que deberían ser verificados.
Busca:
- Estadísticas y Cifras.
- Fechas y Eventos históricos.
- Citas atribuidas a terceros.
- Afirmaciones científicas o legales.
Para cada ítem, presenta la afirmación exacta del texto y etiqueta qué tipo de dato es (Ej. "Estadística", "Fecha", "Cita").
Nota: No verifiques la veracidad (ya que no tienes acceso a internet en tiempo real para esto), solo identifica QUÉ debe ser verificado.`
    }
];
