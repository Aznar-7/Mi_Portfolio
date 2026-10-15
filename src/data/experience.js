export const experience = [
  {
    type: 'work',
    role: { es: 'Cofundador', en: 'Co-founder' },
    company: 'Gavia',
    period: { es: '2026 — hoy', en: '2026 — now' },
    span: [2026, null], // [from, to]; null means ongoing
    impact: {
      es: [
        'Fundé con Agustín García y Benjamín Viberti un estudio que desarrolla y mantiene software a medida para empresas, con precio cerrado por etapa y el código siempre del cliente.',
        'Diseñé y construí la web del estudio con Astro, TypeScript y MapLibre.',
        'Desarrollamos Flety, nuestro primer producto propio: conecta camiones que vuelven vacíos con cargas que van en su camino.',
      ],
      en: [
        'Founded with Agustín García and Benjamín Viberti a studio that builds and maintains custom software for companies, with a fixed price per stage and the code always owned by the client.',
        'Designed and built the studio website with Astro, TypeScript and MapLibre.',
        'We are building Flety, our first in-house product: it matches trucks returning empty with cargo along their route.',
      ],
    },
  },
  {
    type: 'work',
    role: { es: 'Full Stack Developer', en: 'Full Stack Developer' },
    company: 'Porta Hnos',
    period: { es: '2025 — hoy', en: '2025 — now' },
    span: [2025, null], // [from, to]; null means ongoing
    impact: {
      es: [
        'Desarrollé cuatro sistemas internos completos con React, Django y PostgreSQL que reemplazaron procesos manuales. El tiempo de gestión interna bajó un 40%.',
        'Armé la librería de componentes React que el equipo adoptó como estándar. Las features nuevas salen un 30% más rápido.',
        'Construí un sistema RAG sobre las tarjetas de Jira: los supervisores preguntan en lenguaje natural cómo viene cada proyecto.',
        'Integré APIs externas y migré herramientas legacy a un stack moderno, en sprints de dos semanas.',
      ],
      en: [
        'Built four complete internal systems with React, Django and PostgreSQL that replaced manual processes. Internal management time dropped 40%.',
        'Built the React component library the team adopted as its standard. New features ship 30% faster.',
        'Built a RAG system over the Jira cards: supervisors ask in plain language how each project is going.',
        'Integrated external APIs and migrated legacy tools to a modern stack, in two-week sprints.',
      ],
    },
  },
  {
    type: 'work',
    role: { es: 'Pasante en software y desarrollo de productos', en: 'Software and product development intern' },
    company: 'Globant',
    period: { es: '2023', en: '2023' },
    span: [2023, 2023], // [from, to]; null means ongoing
    impact: {
      es: [
        'Construimos en equipo un producto de gestión académica desde cero, de la definición al despliegue. Participé en diseño, organización del equipo, desarrollo y testing.',
      ],
      en: [
        'As a team we built an academic management product from scratch, from definition to deployment. I worked on design, team organization, development and testing.',
      ],
    },
  },
]

export const academic = [
  {
    type: 'academic',
    short: { es: 'Sistemas', en: 'Systems' },
    degree: {
      es: 'Ingeniería en Sistemas de Información',
      en: 'Information Systems Engineering',
    },
    institution: 'UTN — Universidad Tecnológica Nacional',
    period: { es: '2024 — hoy', en: '2024 — now' },
    span: [2024, null], // [from, to]; null means ongoing
    highlights: {
      es: [
        'Formación orientada al diseño, implementación, organización y control de sistemas de información para organizaciones.',
        'Programación en distintos lenguajes y paradigmas (funcional, lógico y orientado a objetos) para modelar y resolver problemas.',
        'Análisis y diseño de sistemas: requerimientos, modelado, arquitectura, ciclo de vida, testing y criterios para llevar una solución a producción.',
      ],
      en: [
        'Education focused on designing, implementing, organizing, and controlling information systems for organizations.',
        'Programming across languages and paradigms (functional, logic and object-oriented) to model and solve problems.',
        'Systems analysis and design: requirements, modeling, architecture, lifecycle, testing, and criteria for taking a solution to production.',
      ],
    },
  },
  {
    type: 'academic',
    short: { es: 'IA', en: 'AI' },
    degree: {
      es: 'Licenciatura en Inteligencia Artificial',
      en: 'Bachelor of Science in Artificial Intelligence',
    },
    institution: 'UTN — Universidad Tecnológica Nacional',
    period: { es: '2024 — hoy', en: '2024 — now' },
    span: [2024, null], // [from, to]; null means ongoing
    highlights: {
      es: [
        'Implementación de modelos de lenguaje, aprendizaje automático y redes neuronales para resolver problemas complejos en diversos dominios.',
        'Automatización de procesos mediante el uso de inteligencia artificial, mejorando la eficiencia y reduciendo errores en tareas repetitivas.',
        'Manejo de herramientas y frameworks de IA como TensorFlow, PyTorch, y scikit-learn para desarrollar soluciones innovadoras.',
      ],
      en: [
        'Implementation of language models, machine learning, and neural networks to solve complex problems in various domains.',
        'Automation of processes using artificial intelligence, improving efficiency and reducing errors in repetitive tasks.',
        'Proficiency with AI tools and frameworks such as TensorFlow, PyTorch, and scikit-learn to develop innovative solutions.',
      ],
    },
  },
]
