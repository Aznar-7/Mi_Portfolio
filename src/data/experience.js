export const experience = [
  {
    type: 'work',
    role: { es: 'Cofundador', en: 'Co-founder' },
    company: 'Gavia',
    period: { es: '2026 — hoy', en: '2026 — now' },
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
    role: {
      es: 'Full Stack Developer',
      en: 'Full Stack Developer'
    },
    company: 'Porta Hnos',
    period: {
      es: '2025 — actualidad',
      en: '2025 — Present'
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
    stats: [
      {
        value: '10+',
        label: {
          es: 'sistemas empresariales desarrollados',
          en: 'business systems developed'
        }
      },
      {
        value: 'E2E',
        label: {
          es: 'integración de IA e infraestructura cloud',
          en: 'AI and cloud infrastructure integration'
        }
      },
      {
        value: 'Web + Mobile',
        label: {
          es: 'software conectado con operaciones industriales',
          en: 'software connected to industrial operations'
        }
      }
    ],
    impact: {
      es: [
        'Diseñé y desarrollé más de diez sistemas internos para distintas áreas de la empresa, incluyendo Capital Humano, Higiene y Seguridad, gestión de pañol, pallets e inventario, y herramientas de gestión operativa para stock, lotes y sorteos.',
        'Desarrollé aplicaciones móviles integradas con equipos industriales, incluyendo PLCs y dispositivos basados en Raspberry Pi, conectando el software con procesos y operaciones físicas.',
        'Implementé una solución de búsqueda y consulta inteligente basada en RAG para información de proyectos en Jira. Desarrollé el pipeline en Python para extraer datos, transformarlos en Markdown y publicarlos en Azure Blob Storage, además de configurar la indexación y el agente para consultas en lenguaje natural.',
        'Construí una librería compartida de componentes React para estandarizar interfaces y facilitar el desarrollo y mantenimiento de aplicaciones internas.',
        'Integré APIs y modernicé herramientas existentes, trabajando de extremo a extremo en el desarrollo de soluciones full stack y en su integración con servicios e infraestructura.'
      ],
      en: [
        'Designed and developed 10+ internal business systems across multiple departments, including Human Resources, Health and Safety, storeroom operations, pallet and inventory management, and operational tools for stock, batch tracking and prize draws.',
        'Developed mobile applications integrated with industrial equipment, including PLCs and Raspberry Pi-based devices, connecting software with physical processes and industrial operations.',
        'Implemented a RAG-based intelligent search and query solution for Jira project data. Built the Python pipeline to extract data, transform it into Markdown and publish it to Azure Blob Storage, while configuring indexing and the agent for natural-language queries.',
        'Built a shared React component library to standardize interfaces and streamline the development and maintenance of internal applications.',
        'Integrated external APIs and modernized legacy tools, contributing end to end to full-stack solutions and their integration with services and infrastructure.'
      ]
    }
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
    institution: 'UTN — Universidad Tecnológica Nacional',
    period: { es: '2024 — hoy', en: '2024 — now' },
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
