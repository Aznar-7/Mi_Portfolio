export const projects = [
  {
    id: 'utn-hub',
    title: 'UTN Hub',
    tagline: {
      es: 'Plataforma universitaria para la gestión académica.',
      en: 'University platform for academic management.',
    },
    description: {
      es: 'Sistema web complejo para la comunidad universitaria UTN. Arquitectura full-stack con frontend en React+Vite, API REST en Django, base de datos PostgreSQL y deploy en Oracle Cloud con dominio propio.',
      en: 'Complex web system for the UTN university community. Full-stack architecture with React+Vite frontend, Django REST API, PostgreSQL database, and deployment on Oracle Cloud with a custom domain.',
    },
    category: 'web',
    featured: true,
    status: 'in-development',
    tech: ['React', 'Vite', 'Django', 'PostgreSQL', 'Oracle Cloud', 'Nginx'],
    architecture: [
      {
        layer: 'Frontend',
        detail: {
          es: 'React 19 + Vite, Tailwind CSS, React Router, estado con Context API',
          en: 'React 19 + Vite, Tailwind CSS, React Router, state with Context API',
        },
      },
      {
        layer: 'Backend',
        detail: {
          es: 'Django REST Framework, autenticación JWT, endpoints modulares por dominio',
          en: 'Django REST Framework, JWT authentication, modular domain endpoints',
        },
      },
      {
        layer: { es: 'Base de datos', en: 'Database' },
        detail: {
          es: 'PostgreSQL — modelado relacional, migraciones Django, queries optimizadas',
          en: 'PostgreSQL — relational modeling, Django migrations, optimized queries',
        },
      },
      {
        layer: { es: 'Infraestructura', en: 'Infrastructure' },
        detail: {
          es: 'Oracle Cloud VM, Nginx reverse proxy, SSL/TLS, dominio propio configurado',
          en: 'Oracle Cloud VM, Nginx reverse proxy, SSL/TLS, custom domain configured',
        },
      },
    ],
    image: '/images/projects/utnhub/cover.png',
    gallery: [
      '/images/projects/utnhub/screen-1.png',
      '/images/projects/utnhub/screen-2.png',
    ],
    placeholderGradient: null,
    placeholderIcon: null,
    liveUrl: 'https://utnhub.com.ar',
    githubUrl: null,
  },
  {
    id: 'agv-studio',
    title: 'AGV Studio',
    tagline: {
      es: 'Startup de desarrollo y consultoría tecnológica.',
      en: 'Tech development and consulting startup.',
    },
    description: {
      es: 'Startup orientada a la construcción de productos digitales y consultoría para PYMEs. Arquitectura full-stack con foco en sistemas a medida y escalabilidad.',
      en: 'Startup focused on building digital products and consulting for SMBs. Full-stack architecture emphasizing custom systems and scalability.',
    },
    category: 'startup',
    featured: false,
    status: 'in-development',
    tech: ['React', 'Django', 'Tailwind CSS', 'PostgreSQL'],
    architecture: [],
    image: '/images/projects/agv-studio/cover.png',
    gallery: [
      '/images/projects/agv-studio/screen-1.png',
      '/images/projects/agv-studio/screen-2.png',
    ],
    placeholderGradient: null,
    placeholderIcon: null,
    liveUrl: 'https://portfolio-agv.vercel.app/',
    githubUrl: null,
  },
  {
    id: 'esp32-monitor',
    title: 'ESP32 Climate Monitor',
    tagline: {
      es: 'Monitoreo IoT de temperatura y humedad en tiempo real.',
      en: 'Real-time IoT temperature and humidity monitoring.',
    },
    description: {
      es: 'Dispositivo IoT basado en ESP32 que publica datos de sensores vía MQTT a un broker local. Backend Django consume el stream, almacena en PostgreSQL y expone una API REST con WebSocket para actualizaciones en tiempo real.',
      en: 'ESP32-based IoT device publishing sensor data via MQTT to a local broker. Django backend consumes the stream, stores in PostgreSQL, and exposes a REST API with WebSocket for real-time updates.',
    },
    category: 'iot',
    featured: false,
    status: 'completed',
    tech: ['C/C++', 'ESP32', 'MQTT', 'Django', 'WebSocket', 'PostgreSQL'],
    architecture: [],
    image: null,
    gallery: [],
    placeholderGradient: 'from-teal-900/60 to-transparent',
    placeholderIcon: 'Cpu',
    liveUrl: null,
    githubUrl: null,
  },
  {
    id: 'pytask-cli',
    title: 'PyTask CLI',
    tagline: {
      es: 'Gestor de tareas y proyectos desde la terminal.',
      en: 'Terminal-based task and project manager.',
    },
    description: {
      es: 'Herramienta CLI construida con Python y Rich para gestión de proyectos en la terminal. Persistencia con SQLite, soporte para múltiples proyectos, prioridades y exportación de reportes.',
      en: 'CLI tool built with Python and Rich for terminal-based project management. SQLite persistence, multi-project support, priorities, and report export.',
    },
    category: 'cli',
    featured: false,
    status: 'completed',
    tech: ['Python', 'Rich', 'SQLite', 'Click'],
    architecture: [],
    image: null,
    gallery: [],
    placeholderGradient: 'from-emerald-900/60 to-transparent',
    placeholderIcon: 'Terminal',
    liveUrl: null,
    githubUrl: null,
  },
]

export const featuredProject = projects.find((p) => p.featured)
