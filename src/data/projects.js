export const projects = [
  {
    id: 'utn-hub',
    title: 'UTN Hub',
    tagline: 'Plataforma universitaria para la gestión académica.',
    description:
      'Sistema web complejo para la comunidad universitaria UTN. Arquitectura full-stack con frontend en React+Vite, API REST en Django, base de datos PostgreSQL y deploy en Oracle Cloud con dominio propio.',
    featured: true,
    status: 'in-development',
    tech: ['React', 'Vite', 'Django', 'PostgreSQL', 'Oracle Cloud', 'Nginx'],
    architecture: [
      {
        layer: 'Frontend',
        detail: 'React 19 + Vite, Tailwind CSS, React Router, estado con Context API',
      },
      {
        layer: 'Backend',
        detail: 'Django REST Framework, autenticación JWT, endpoints modulares por dominio',
      },
      {
        layer: 'Base de datos',
        detail: 'PostgreSQL — modelado relacional, migraciones Django, queries optimizadas',
      },
      {
        layer: 'Infraestructura',
        detail: 'Oracle Cloud VM, Nginx reverse proxy, SSL/TLS, dominio propio configurado',
      },
    ],
    liveUrl: 'https://utnhub.com',
    githubUrl: null,
  },
  {
    id: 'agv-studio',
    title: 'AGV Studio',
    tagline: 'Startup de desarrollo y consultoría tecnológica.',
    description:
      'Startup en desarrollo orientada a construcción de productos digitales y consultoría para PYMEs. Foco en sistemas a medida con arquitectura moderna.',
    featured: false,
    status: 'in-development',
    tech: ['React', 'Django', 'Tailwind CSS'],
    architecture: [],
    liveUrl: null,
    githubUrl: null,
  },
]

export const featuredProject = projects.find((p) => p.featured)
