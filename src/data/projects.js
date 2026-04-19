export const projects = [
  {
    id: 'utn-hub',
    title: 'UTN Hub',
    tagline: {
      es: 'Plataforma universitaria para la gestión académica.',
      en: 'University platform for academic management.',
    },
    description: {
      es: 'Plataforma académica para estudiantes de la UTN: centralización de información institucional, calendario de eventos y parciales, repositorio colaborativo de documentos, gestor de notas con cálculo automático de promedios, y sistema de notificaciones. Backend robusto con Django REST y PostgreSQL, frontend dinámico con React y Tailwind, y autenticación segura con JWT. Hosteado y configurado por nosotros desde 0 (BACKEND) en servidor propio oracle cloud, con ubuntu. Frontend en Vercel.',
      en: 'Academic platform for UTN students: centralization of institutional information, calendar of events and exams, collaborative document repository, grade manager with automatic average calculation, and notification system. Robust backend with Django REST and PostgreSQL, dynamic frontend with React and Tailwind, and secure authentication with JWT. Hosted and configured by us from scratch (BACKEND) on our own Oracle Cloud server with Ubuntu. Frontend on Vercel.',
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
    metrics: [
      {
        label: { es: 'Capas de arquitectura', en: 'Architecture layers' },
        value: '4',
        icon: 'Layers'
      },
      {
        label: { es: 'Tecnologías integradas', en: 'Integrated technologies' },
        value: '6',
        icon: 'Zap'
      }
    ],
    image: '/images/projects/utnhub/utnhub-presentation.png',
    gallery: [
      '/images/projects/utnhub/screen-2.png',
      '/images/projects/utnhub/screen-1.png',
      '/images/projects/utnhub/screen-3.png',
      '/images/projects/utnhub/screen-4.png',
      '/images/projects/utnhub/screen-5.png',
      '/images/projects/utnhub/screen-6.png',
      '/images/projects/utnhub/screen-7.png',
      
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
    id: 'camisetas-agv',
    title: 'Camisetas AGV',
    tagline: {
      es: 'front-end demo de plataforma e-commerce para camisetas de fútbol.',
      en: 'Front-end demo of an e-commerce platform for football jerseys.',
    },
    description: {
      es: '[Front-End Demo] | Plataforma e-commerce completa para camisetas de fútbol: catálogo dinámico con filtros avanzados, carrito interactivo con persistencia local, simulación de checkout, gestión de talles y stock. Foco en performance y UX mobile-first.',
      en: '[Front-End Demo] | Complete e-commerce platform for football jerseys: dynamic catalog with advanced filters, interactive cart with local persistence, checkout simulation, size and stock management. Focus on performance and mobile-first UX.',
    },
    category: 'frontend',
    featured: false,
    status: 'completed',
    tech: ['React', 'Motion', 'Vite'],
    architecture: [],
    image: '/images/projects/camisetas-agv/Camisetas2.png',
    gallery: [
      '/images/projects/camisetas-agv/screen-1.png',
      '/images/projects/camisetas-agv/screen-2.png',
      '/images/projects/camisetas-agv/screen-3.png',
    ],
    placeholderGradient: null,
    placeholderIcon: null,
    liveUrl: 'https://camisetas-app.vercel.app/',
    githubUrl: 'https://github.com/Aznar-7/Camisetas-app',
  },
  {
    id: 'autofull',
    title: 'AutoFull',
    tagline: {
      es: 'Arduino & Esp32: auto p2wd con multiples sensores y pantalla OLED',
      en: 'Arduino & Esp32: self-driving car with multiple sensors and OLED display',
    },
    description: {
      es: '[IoT & Hardware Demo] | Auto autónomo basado en ESP32 y Arduino con control de motores DC, sensor ultrasónico para detección de obstáculos, infrarrojos, sensor de humedad y temperatura y pantalla OLED para visualización de estado. Programación en C++ con FreeRTOS para multitarea y optimización de recursos. El auto es manejado por una app móvil hecha en React Native  para enviar comandos manuales y recibir telemetría en tiempo real.',
      en: '[IoT & Hardware Demo] | Self-driving car based on ESP32 and Arduino with DC motor control, ultrasonic sensors for obstacle detection, infrared sensors, humidity and temperature sensor, and OLED display for status visualization. Programming in C++ with FreeRTOS for multitasking and resource optimization. The car is controlled by a mobile app made in React Native to send manual commands and receive real-time telemetry.',
    },
    category: 'IOT & Hardware',
    featured: false,
    status: 'completed',
    tech: ['C/C++', 'ESP32', 'Arduino', 'FreeRTOS', 'React Native'],
    architecture: [],
    image: '',
    gallery: [
      
    ],
    placeholderGradient: null,
    placeholderIcon: null,
    liveUrl: '',
    githubUrl: 'https://github.com/Aznar-7/AutoFull',
  },

  /*{
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
  },*/
]

export const featuredProject = projects.find((p) => p.featured)
