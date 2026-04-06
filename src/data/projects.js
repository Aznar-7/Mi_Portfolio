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
    liveUrl: 'https://utnhub.com',
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
      es: 'Startup en desarrollo orientada a construcción de productos digitales y consultoría para PYMEs. Foco en sistemas a medida con arquitectura moderna.',
      en: 'Development startup focused on building digital products and consulting for SMBs. Emphasis on custom systems with modern architecture.',
    },
    featured: false,
    status: 'in-development',
    tech: ['React', 'Django', 'Tailwind CSS'],
    architecture: [],
    liveUrl: null,
    githubUrl: null,
  },
]

export const featuredProject = projects.find((p) => p.featured)
