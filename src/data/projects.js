// Project catalogue. `featured` gets its own section (FeaturedProject),
// `highlight` renders as the wide lead card in the Projects grid.
// githubUrl: string | { label, url }[] | null

export const projects = [
  {
    id: 'utn-hub',
    title: 'UTN Hub',
    tagline: {
      es: 'Plataforma académica para estudiantes de la UTN.',
      en: 'Academic platform for UTN students.',
    },
    description: {
      es: 'Centraliza la información institucional, el calendario de eventos y parciales, un repositorio colaborativo de apuntes y un gestor de notas que calcula promedios automáticamente, con notificaciones. API en Django REST con PostgreSQL y autenticación JWT; frontend en React con Tailwind. El backend corre en un servidor Ubuntu en Oracle Cloud que configuramos desde cero; el frontend se despliega en Vercel.',
      en: 'Brings together institutional information, an events and exams calendar, a collaborative notes repository and a grade manager that computes averages automatically, with notifications. Django REST API on PostgreSQL with JWT auth; React and Tailwind frontend. The backend runs on an Ubuntu server on Oracle Cloud that we set up from scratch; the frontend deploys on Vercel.',
    },
    category: 'full-stack',
    featured: true,
    status: 'in-development',
    tech: ['React', 'Vite', 'Django', 'PostgreSQL', 'Oracle Cloud', 'Nginx'],
    architecture: [
      {
        layer: 'Frontend',
        detail: {
          es: 'React 19 y Vite, Tailwind CSS, React Router, estado con Context API.',
          en: 'React 19 and Vite, Tailwind CSS, React Router, state with Context API.',
        },
      },
      {
        layer: 'Backend',
        detail: {
          es: 'Django REST Framework, autenticación JWT, endpoints modulares por dominio.',
          en: 'Django REST Framework, JWT authentication, modular endpoints per domain.',
        },
      },
      {
        layer: { es: 'Base de datos', en: 'Database' },
        detail: {
          es: 'PostgreSQL con modelado relacional y migraciones de Django.',
          en: 'PostgreSQL with relational modeling and Django migrations.',
        },
      },
      {
        layer: { es: 'Infraestructura', en: 'Infrastructure' },
        detail: {
          es: 'VM en Oracle Cloud, Nginx como reverse proxy, SSL/TLS y dominio propio.',
          en: 'Oracle Cloud VM, Nginx reverse proxy, SSL/TLS and custom domain.',
        },
      },
    ],
    // Request path rendered by ArchitectureFlow; `host` groups nodes that share a machine
    flow: [
      {
        id: 'client',
        name: { es: 'Navegador', en: 'Browser' },
        tech: 'React 19, Vite, Tailwind',
        host: 'Vercel',
        detail: {
          es: 'La SPA se sirve desde Vercel. React Router resuelve la navegación y el estado vive en Context; cada pedido a la API viaja con el token JWT.',
          en: 'The SPA is served from Vercel. React Router handles navigation and state lives in Context; every API call carries the JWT.',
        },
      },
      {
        id: 'proxy',
        name: { es: 'Nginx', en: 'Nginx' },
        tech: 'Reverse proxy, SSL/TLS',
        host: 'Oracle Cloud',
        detail: {
          es: 'Termina HTTPS con el certificado del dominio propio y reenvía el tráfico a la aplicación Django dentro de la VM.',
          en: 'Terminates HTTPS with the custom domain certificate and forwards traffic to the Django app inside the VM.',
        },
      },
      {
        id: 'api',
        name: { es: 'API', en: 'API' },
        tech: 'Django REST Framework, JWT',
        host: 'Oracle Cloud',
        detail: {
          es: 'Valida el token y resuelve el pedido en endpoints separados por dominio: calendario, apuntes, notas y notificaciones.',
          en: 'Validates the token and serves the request from endpoints split by domain: calendar, notes, grades and notifications.',
        },
      },
      {
        id: 'db',
        name: { es: 'Base de datos', en: 'Database' },
        tech: 'PostgreSQL',
        host: 'Oracle Cloud',
        detail: {
          es: 'Modelo relacional versionado con migraciones de Django. Los promedios se calculan a partir de las notas guardadas.',
          en: 'Relational model versioned with Django migrations. Averages are computed from the stored grades.',
        },
      },
    ],
    image: '/images/projects/utnhub/utnhub-presentation.webp',
    gallery: [
      '/images/projects/utnhub/screen-2.webp',
      '/images/projects/utnhub/screen-1.webp',
      '/images/projects/utnhub/screen-3.webp',
      '/images/projects/utnhub/screen-4.webp',
      '/images/projects/utnhub/screen-5.webp',
      '/images/projects/utnhub/screen-6.webp',
      '/images/projects/utnhub/screen-7.webp',
    ],
    liveUrl: 'https://utnhub.com.ar',
    githubUrl: null,
  },
  {
    id: 'eco-records',
    title: 'Eco Records',
    tagline: {
      es: 'Tocadiscos en miniatura con hardware, carcasa y app propios.',
      en: 'Miniature record player with its own hardware, enclosure and app.',
    },
    description: {
      es: 'Un tocadiscos a escala diseñado de punta a punta. La carcasa está modelada en 3D e impresa; adentro, una Raspberry Pi Zero 2W controla el motor del plato, lee tags NFC para reconocer cada disco y reproduce el álbum por el parlante integrado. Se maneja desde una webapp móvil hecha con Flask y JavaScript sin frameworks: reproductor, biblioteca de discos, importación de álbumes desde YouTube y un historial de escucha.',
      en: 'A scale record player designed end to end. The enclosure is 3D modeled and printed; inside, a Raspberry Pi Zero 2W drives the platter motor, reads NFC tags to recognize each record and plays the album through a built-in speaker. It is controlled from a mobile web app built with Flask and framework-free JavaScript: player, record library, album import from YouTube and listening history.',
    },
    category: 'iot',
    highlight: true,
    status: 'completed',
    tech: ['Raspberry Pi', 'Python', 'Flask', 'NFC', 'JavaScript', 'Linux', '3D Modeling'],
    architecture: [
      {
        layer: 'Hardware',
        detail: {
          es: 'Raspberry Pi Zero 2W, lector NFC, motor del plato, parlante y batería en carcasa impresa en 3D.',
          en: 'Raspberry Pi Zero 2W, NFC reader, platter motor, speaker and battery in a 3D-printed case.',
        },
      },
      {
        layer: 'Backend',
        detail: {
          es: 'Flask sobre Linux: reproducción, biblioteca, descargas y estadísticas de escucha.',
          en: 'Flask on Linux: playback, library, downloads and listening stats.',
        },
      },
      {
        layer: 'App',
        detail: {
          es: 'Webapp móvil liviana en JavaScript puro, sin dependencias.',
          en: 'Lightweight mobile web app in plain JavaScript, no dependencies.',
        },
      },
    ],
    image: '/images/projects/eco-records/foto-frente.webp',
    gallery: [
      '/images/projects/eco-records/foto-frente.webp',
      '/images/projects/eco-records/foto-detalle.webp',
      '/images/projects/eco-records/app-reproductor.webp',
      '/images/projects/eco-records/app-discos.webp',
      '/images/projects/eco-records/app-album.webp',
      '/images/projects/eco-records/app-agregar.webp',
      '/images/projects/eco-records/app-actividad.webp',
    ],
    liveUrl: null,
    githubUrl: 'https://github.com/Aznar-7/proyect-ecoRecords-pi',
  },
  {
    id: 'orden66-viandas',
    title: 'Orden 66 Viandas',
    tagline: {
      es: 'Gestión de pedidos de viandas con cupos diarios.',
      en: 'Meal order management with daily quotas.',
    },
    description: {
      es: 'Sistema de pedidos con control de cupos diarios: autenticación JWT, roles de usuario y administrador, estados de pedido, validación de stock en el backend, historial de cambios, filtros y panel de administración. Foco en reglas de negocio reales, seguridad y una arquitectura modular.',
      en: 'Ordering system with daily quota control: JWT authentication, user and admin roles, order states, backend stock validation, change history, filters and an admin panel. Focused on real business rules, security and a modular architecture.',
    },
    category: 'full-stack',
    status: 'completed',
    tech: ['React', 'Express', 'Node.js', 'Tailwind CSS', 'SQLite', 'Vercel', 'Render'],
    image: '/images/projects/orden66/cover.webp',
    gallery: [
      '/images/projects/orden66/cover.webp',
      '/images/projects/orden66/login.webp',
      '/images/projects/orden66/menus.webp',
    ],
    liveUrl: 'https://vianda-app-front.vercel.app/',
    githubUrl: [
      { label: 'Frontend', url: 'https://github.com/Aznar-7/ViandaApp_Front' },
      { label: 'Backend', url: 'https://github.com/Aznar-7/ViandaApp_Back' },
    ],
  },
  {
    id: 'camisetas-agv',
    title: 'Camisetas AGV',
    tagline: {
      es: 'E-commerce de camisetas de fútbol, mobile first.',
      en: 'Mobile-first football jersey e-commerce.',
    },
    description: {
      es: 'Demo de frontend para una tienda de camisetas: catálogo con filtros, carrito persistente en el navegador, simulación de checkout y manejo de talles y stock. Foco en performance y en la experiencia mobile.',
      en: 'Frontend demo for a jersey store: filterable catalog, cart persisted in the browser, checkout simulation and size and stock handling. Focused on performance and the mobile experience.',
    },
    category: 'frontend',
    status: 'completed',
    tech: ['React', 'Motion', 'Vite'],
    image: '/images/projects/camisetas-agv/Camisetas2.webp',
    gallery: [
      '/images/projects/camisetas-agv/Camisetas2.webp',
      '/images/projects/camisetas-agv/screen-1.webp',
      '/images/projects/camisetas-agv/screen-2.webp',
      '/images/projects/camisetas-agv/screen-3.webp',
    ],
    liveUrl: 'https://camisetas-app.vercel.app/',
    githubUrl: 'https://github.com/Aznar-7/Camisetas-app',
  },
  {
    id: 'agv-studio',
    title: 'AGV Studio',
    tagline: {
      es: 'Estudio de desarrollo y consultoría para PyMEs.',
      en: 'Development and consulting studio for SMBs.',
    },
    description: {
      es: 'Emprendimiento propio que construye productos digitales y sistemas a medida para PyMEs, desde el relevamiento hasta el despliegue.',
      en: 'My own venture building digital products and custom systems for SMBs, from discovery to deployment.',
    },
    category: 'full-stack',
    status: 'in-development',
    tech: ['React', 'Django', 'Tailwind CSS', 'PostgreSQL'],
    image: '/images/projects/agv-studio/cover.webp',
    gallery: [
      '/images/projects/agv-studio/cover.webp',
      '/images/projects/agv-studio/screen-1.webp',
      '/images/projects/agv-studio/screen-2.webp',
    ],
    liveUrl: 'https://portfolio-agv.vercel.app/',
    githubUrl: null,
  },
  {
    id: 'autofull',
    title: 'AutoFull',
    tagline: {
      es: 'Auto autónomo con ESP32, sensores y app de control.',
      en: 'Autonomous car with ESP32, sensors and a control app.',
    },
    description: {
      es: 'Auto autónomo basado en ESP32 y Arduino: control de motores DC, sensor ultrasónico e infrarrojos para esquivar obstáculos, sensor de temperatura y humedad, y pantalla OLED de estado. Firmware en C++ con FreeRTOS para multitarea. Una app en React Native envía comandos manuales y recibe telemetría en tiempo real.',
      en: 'Autonomous car based on ESP32 and Arduino: DC motor control, ultrasonic and infrared sensors for obstacle avoidance, temperature and humidity sensor, and an OLED status display. C++ firmware on FreeRTOS for multitasking. A React Native app sends manual commands and receives real-time telemetry.',
    },
    category: 'iot',
    status: 'completed',
    tech: ['C/C++', 'ESP32', 'Arduino', 'FreeRTOS', 'React Native'],
    image: null,
    gallery: [],
    liveUrl: null,
    githubUrl: 'https://github.com/Aznar-7/AutoFull',
  },
]

export const featuredProject = projects.find((p) => p.featured)
