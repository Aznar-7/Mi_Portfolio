// Project catalogue. `featured` gets its own section (FeaturedProject),
// `highlight` renders as the wide lead card in the Projects grid.
// githubUrl: string | { label, url }[] | null

export const projects = [
  {
    id: 'utn-hub',
    title: 'UTN Hub',
    summary: {
      es: 'Plataforma académica para estudiantes de la UTN: calendario de parciales, apuntes compartidos y un gestor de notas que calcula los promedios solo. Corre en una VM mía en Oracle Cloud.',
      en: 'An academic platform for UTN students: exam calendar, shared notes and a grade tracker that works out your averages for you. It runs on my own VM in Oracle Cloud.',
    },
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
    image: '/images/projects/utnhub/00-portada-linkedin-app.webp',
    gallery: [
      '/images/projects/utnhub/07-landing-hero.webp',
      '/images/projects/utnhub/01-inicio-oscuro.webp',
      '/images/projects/utnhub/02-utn-manager-oscuro.webp',
      '/images/projects/utnhub/12-correlativas.webp',
      '/images/projects/utnhub/05-calendario-lavanda.webp',
      '/images/projects/utnhub/15-inscribot.webp',
      '/images/projects/utnhub/19-permutas.webp',
    ],
    liveUrl: 'https://utnhub.com.ar',
    githubUrl: null,
  },
  {
    id: 'eco-records',
    title: 'Eco Records',
    summary: {
      es: 'Un tocadiscos a escala. La carcasa está impresa en 3D y adentro una Raspberry Pi Zero 2W mueve el plato, lee el tag NFC de cada disco y reproduce el álbum. Se maneja desde una app web en JavaScript puro, sin dependencias.',
      en: 'A scale record player. The case is 3D printed, and inside a Raspberry Pi Zero 2W spins the platter, reads each record\'s NFC tag and plays the album. You control it from a web app in plain JavaScript, no dependencies.',
    },
    tagline: {
      es: 'Tocadiscos en miniatura con hardware, carcasa y app propios.',
      en: 'Miniature record player with its own hardware, enclosure and app.',
    },
    description: {
      es: 'Un tocadiscos a escala que diseñé completo, de la carcasa al software. La carcasa está modelada en 3D e impresa; adentro, una Raspberry Pi Zero 2W controla el motor del plato, lee tags NFC para reconocer cada disco y reproduce el álbum por el parlante integrado. Se maneja desde una webapp móvil hecha con Flask y JavaScript sin frameworks: reproductor, biblioteca de discos, importación de álbumes desde YouTube y un historial de escucha.',
      en: 'A scale record player I designed whole, from the enclosure to the software. The enclosure is 3D modeled and printed; inside, a Raspberry Pi Zero 2W drives the platter motor, reads NFC tags to recognize each record and plays the album through a built-in speaker. It is controlled from a mobile web app built with Flask and framework-free JavaScript: player, record library, album import from YouTube and listening history.',
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
    id: 'gavia',
    title: 'Gavia',
    summary: {
      es: 'El estudio de software que fundé con Agustín García y Benjamín Viberti en Córdoba. Diseñamos, construimos y mantenemos sistemas para empresas. El sitio está hecho en Astro y TypeScript.',
      en: 'The software studio I founded with Agustín García and Benjamín Viberti in Córdoba. We design, build and maintain systems for companies. The site is built with Astro and TypeScript.',
    },
    tagline: {
      es: 'Estudio de software a medida que cofundé en Córdoba.',
      en: 'Custom software studio I co-founded in Córdoba.',
    },
    description: {
      es: 'Estudio de desarrollo que fundé con Agustín García y Benjamín Viberti. Diseñamos, construimos y mantenemos sistemas para empresas en cinco etapas (relevamiento, propuesta, desarrollo, puesta en marcha y mantenimiento), con precio cerrado por etapa y el código siempre del cliente. Hice la landing con Astro y TypeScript alrededor de una carta de navegación: cada proyecto es un recorrido con paradas. Incluye el mapa interactivo de Flety, nuestro primer producto propio, hecho con MapLibre.',
      en: 'Development studio I founded with Agustín García and Benjamín Viberti. We design, build and maintain systems for companies in five stages (discovery, proposal, development, launch and maintenance), with a fixed price per stage and the code always owned by the client. I built the landing with Astro and TypeScript around a navigation chart: every project is a route with stops. It includes the interactive map for Flety, our first in-house product, built with MapLibre.',
    },
    category: 'frontend',
    status: 'in-development',
    tech: ['Astro', 'TypeScript', 'MapLibre GL', 'Vercel'],
    image: '/images/projects/gavia/inicio.webp',
    gallery: [
      '/images/projects/gavia/inicio.webp',
      '/images/projects/gavia/proceso.webp',
      '/images/projects/gavia/flety.webp',
      '/images/projects/gavia/logo.webp',
    ],
    liveUrl: 'https://www.gaviasoftware.com',
    githubUrl: 'https://github.com/Aznar-7/GAVIA',
  },
  {
    id: 'orden66-viandas',
    title: 'Orden 66 Viandas',
    summary: {
      es: 'Pedidos de viandas con cupos diarios. Roles de usuario y administrador, estados de pedido y stock validado en el backend: las reglas salen del negocio real.',
      en: 'Meal orders with daily quotas. User and admin roles, order states and stock checked on the backend: the rules come from a real business.',
    },
    tagline: {
      es: 'Gestión de pedidos de viandas con cupos diarios.',
      en: 'Meal order management with daily quotas.',
    },
    description: {
      es: 'Sistema de pedidos con control de cupos diarios: autenticación JWT, roles de usuario y administrador, estados de pedido, validación de stock en el backend, historial de cambios, filtros y panel de administración.',
      en: 'Ordering system with daily quota control: JWT authentication, user and admin roles, order states, backend stock validation, change history, filters and an admin panel.',
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
    summary: {
      es: 'Tienda de camisetas de fútbol pensada primero para el celular: catálogo con filtros, carrito que sobrevive al refresh y talles con stock.',
      en: 'A football jersey shop designed for the phone first: filterable catalog, a cart that survives a refresh, and sizes with stock.',
    },
    tagline: {
      es: 'E-commerce de camisetas de fútbol, mobile first.',
      en: 'Mobile-first football jersey e-commerce.',
    },
    description: {
      es: 'Demo de frontend para una tienda de camisetas: catálogo con filtros, carrito persistente en el navegador, simulación de checkout y manejo de talles y stock.',
      en: 'Frontend demo for a jersey store: filterable catalog, cart persisted in the browser, checkout simulation and size and stock handling.',
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
    id: 'autofull',
    title: 'AutoFull',
    summary: {
      es: 'Auto autónomo. El firmware en C++ sobre FreeRTOS reparte el trabajo entre motores, sensores y pantalla; una app en React Native manda comandos y recibe telemetría en tiempo real.',
      en: 'An autonomous car. C++ firmware on FreeRTOS splits the work between motors, sensors and display; a React Native app sends commands and gets live telemetry back.',
    },
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
    architecture: [
      {
        layer: 'Hardware',
        detail: {
          es: 'ESP32 y Arduino, motores DC, pantalla OLED de estado.',
          en: 'ESP32 and Arduino, DC motors, OLED status display.',
        },
      },
      {
        layer: { es: 'Sensores', en: 'Sensors' },
        detail: {
          es: 'Ultrasónico e infrarrojos para esquivar obstáculos; temperatura y humedad.',
          en: 'Ultrasonic and infrared for obstacle avoidance; temperature and humidity.',
        },
      },
      {
        layer: 'Firmware',
        detail: {
          es: 'C++ con FreeRTOS para multitarea.',
          en: 'C++ on FreeRTOS for multitasking.',
        },
      },
      {
        layer: 'App',
        detail: {
          es: 'React Native: comandos manuales y telemetría en tiempo real.',
          en: 'React Native: manual commands and real-time telemetry.',
        },
      },
    ],
    image: null,
    gallery: [],
    liveUrl: null,
    githubUrl: 'https://github.com/Aznar-7/AutoFull',
  },
  {
    // the recursive entry: this site, listed inside itself
    id: 'portfolio',
    title: 'vicenteaznar.dev',
    self: true,
    summary: {
      es: 'El sitio que estás mirando. El inicio es un motor propio en canvas que rutea pistas de cobre alrededor del texto. Adentro hay un Ubuntu simulado con terminal, archivos y juegos, y ocho secretos: un mapa de la Tierra Media, una galaxia y un DeLorean en three.js con el modelo re-sombreado en Blender, entre otros.',
      en: 'The site you are looking at. The top is a canvas engine of my own that routes copper traces around the text. Inside there is a simulated Ubuntu with a terminal, files and games, and eight secrets: a Middle-earth map, a galaxy and a three.js DeLorean whose model I re-shaded in Blender, among others.',
    },
    tagline: {
      es: 'Este mismo portfolio: una placa que se rutea sola, un Ubuntu adentro y ocho secretos.',
      en: 'This very portfolio: a self-routing board, an Ubuntu inside and eight secrets.',
    },
    category: 'frontend',
    status: 'completed',
    tech: ['React', 'Vite', 'three.js', 'GSAP', 'Blender', 'Vercel'],
    architecture: [
      { layer: { es: 'Placa', en: 'Board' }, detail: { es: 'Canvas 2D: ruteo en grilla, keep-out por línea de texto, pulsos y chips que se sueldan con un clic.', en: '2D canvas: grid routing, keep-out per line of text, pulses and chips you solder with a click.' } },
      { layer: { es: 'Sitio', en: 'Site' }, detail: { es: 'React 19 y CSS propio; GSAP para el proceso; dialog y popover nativos.', en: 'React 19 and hand-written CSS; GSAP for the process; native dialog and popover.' } },
      { layer: { es: 'Secretos', en: 'Secrets' }, detail: { es: 'three.js con modelos glTF, cada uno en su propio chunk diferido.', en: 'three.js with glTF models, each in its own deferred chunk.' } },
      { layer: { es: 'Ubuntu', en: 'Ubuntu' }, detail: { es: 'Escritorio simulado: terminal, explorador, juegos y apps.', en: 'Simulated desktop: terminal, file browser, games and apps.' } },
    ],
    image: '/images/projects/portfolio/01-placa.webp',
    gallery: ['/images/projects/portfolio/02-tierra-media.webp', '/images/projects/portfolio/03-ubuntu.webp'],
    liveUrl: '#top',
    githubUrl: 'https://github.com/Aznar-7/Mi_Portfolio',
  },
]

export const featuredProject = projects.find((p) => p.featured)
