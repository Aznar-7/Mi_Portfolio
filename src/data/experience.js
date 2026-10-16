export const experience = [
  {
    type: 'work',
    role: {
      es: 'Full Stack Developer',
      en: 'Full Stack Developer'
    },
    company: 'Porta Hnos',
    period: {
      es: '2025 – hoy',
      en: '2025 – now'
    },
    span: [2025, null],
    tech: [
      'React',
      'Django',
      'Python',
      'PostgreSQL',
      'Kotlin',
      'Gradle',
      'Azure AI Search',
      'Azure Blob Storage',
      'Jira',
      'Industrial IoT'
    ],
    impact: {
      es: [
        'Diseñé y desarrollé más de diez sistemas internos: Capital Humano, Higiene y Seguridad, pañol, pallets e inventario, y herramientas operativas para stock, lotes y sorteos.',
        'Desarrollé apps móviles que se conectan con equipos industriales: PLCs y dispositivos con Raspberry Pi.',
        'Armé un buscador con RAG sobre los proyectos de Jira. Un pipeline en Python extrae las tarjetas, las pasa a Markdown y las sube a Azure Blob Storage; después configuré la indexación y el agente que responde preguntas en lenguaje natural.',
        'Construí una librería de componentes React que comparten todas las aplicaciones internas.',
        'Integré APIs externas y modernicé herramientas heredadas.',
      ],
      en: [
        'Designed and built 10+ internal systems: Human Resources, Health and Safety, storeroom, pallets and inventory, plus operational tools for stock, batches and prize draws.',
        'Built mobile apps that talk to industrial equipment: PLCs and Raspberry Pi devices.',
        'Built a RAG search over the Jira projects. A Python pipeline pulls the cards, turns them into Markdown and uploads them to Azure Blob Storage; then I set up the indexing and the agent that answers questions in plain language.',
        'Built a React component library shared by every internal app.',
        'Integrated external APIs and modernized legacy tools.',
      ]
    }
  },
  {
    type: 'work',
    role: { es: 'Cofundador', en: 'Co-founder' },
    company: 'Gavia',
    period: { es: '2026 – hoy', en: '2026 – now' },
    span: [2026, null], // [from, to]; null means ongoing
    tech: ['Astro', 'TypeScript', 'MapLibre GL', 'Vercel'],
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
    institution: 'Universidad Tecnológica Nacional (UTN)',
    period: { es: '2024 – hoy', en: '2024 – now' },
    span: [2024, null], // [from, to]; null means ongoing
    highlights: {
      es: [
        'Análisis y diseño de sistemas: requerimientos, modelado, arquitectura y pruebas.',
        'Programación en paradigmas funcional (Haskell), lógico (Prolog) y orientado a objetos.',
      ],
      en: [
        'Systems analysis and design: requirements, modeling, architecture and testing.',
        'Programming across paradigms: functional (Haskell), logic (Prolog) and object-oriented.',
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
    institution: 'Universidad Tecnológica Nacional (UTN)',
    period: { es: '2024 – hoy', en: '2024 – now' },
    span: [2024, null], // [from, to]; null means ongoing
    highlights: {
      es: [
        'Aprendizaje automático y redes neuronales con TensorFlow, PyTorch y scikit-learn.',
        'Modelos de lenguaje aplicados a casos reales, como el RAG sobre las tarjetas de Jira que armé en Porta.',
      ],
      en: [
        'Machine learning and neural networks with TensorFlow, PyTorch and scikit-learn.',
        'Language models applied to real cases, like the RAG over Jira cards I built at Porta.',
      ],
    },
  },
]
